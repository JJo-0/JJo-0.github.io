/**
 * Create same-origin, responsive lossless WebP previews for lecture imagery.
 * The source archive, every img src, caption, link and slide sequence remain intact.
 * Only the static build output changes; no client JS or external downloads.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import sharp from 'sharp';

const dist = path.resolve('dist');
const previewDir = path.join(dist, 'assets', 'lecture-previews');
const reportPath = path.join(previewDir, 'manifest.json');
const POLICY = 'lecture-v1-lossless-640-960-1280';
const MIN_BYTES = 48 * 1024;
const WIDTHS = [640, 960, 1280];
const MAX_NATIVE_WIDTH = 2400;
const cache = new Map();
const report = { policy: POLICY, pages: [], images: [], omitted: [] };

function eligible(src) {
  return /^\/assets\/(?:slides\/[a-z0-9_-]+\/|posts\/(?:self-improving-ai-[a-z0-9-]+\/|segmentation-from-pixels-to-robot-observations\/slides\/|rl-robot-learning-[a-z0-9-]+\/|modern-ai-(?:continuation|vi-papers|additional-papers)\/))[a-z0-9_./-]+\.(?:png|jpe?g|webp)$/i.test(src) &&
    !src.split('/').includes('..');
}

async function* pages(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'tag') yield* pages(file);
    else if (entry.isFile() && entry.name === 'index.html') yield file;
  }
}
function attrs(node) { return Object.fromEntries((node.attrs ?? []).map(a => [a.name, a.value])); }
function imageNodes(node, insideArticle = false, figureWidth = 784) {
  const inside = insideArticle || node.tagName === 'article';
  let limit = figureWidth;
  if (node.tagName === 'figure') {
    const max = /max-width:\s*(\d+)px/i.exec(attrs(node).style ?? '');
    if (max) limit = Math.min(limit, Number(max[1]));
  }
  const result = [];
  if (inside && node.tagName === 'img') result.push({ node, limit });
  for (const child of node.childNodes ?? []) result.push(...imageNodes(child, inside, limit));
  return result;
}
function encodeAttribute(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

async function generate(src) {
  const source = path.join(dist, src.slice(1));
  const input = await fs.readFile(source);
  const sha256 = createHash('sha256').update(input).digest('hex');
  const key = createHash('sha256').update(POLICY).update(input).digest('hex').slice(0, 24);
  let entry = cache.get(key);
  if (!entry) {
    const meta = await sharp(input).metadata();
    const width = meta.width, height = meta.height;
    if (!width || !height || (meta.pages ?? 1) > 1 || (meta.orientation ?? 1) !== 1) {
      report.omitted.push({ src, reason: 'unsupported-or-animated' });
      return null;
    }
    const candidates = [];
    if (input.length >= MIN_BYTES) {
      const widths = WIDTHS.filter(w => w < width);
      if (width <= MAX_NATIVE_WIDTH) widths.push(width);
      for (const w of widths) {
        const output = await sharp(input)
          .resize({ width: w, withoutEnlargement: true, kernel: 'lanczos3' })
          .webp({ lossless: true, effort: 3 }).toBuffer({ resolveWithObject: true });
        if (output.info.width !== w || Math.abs(output.info.height - height * w / width) > 1) {
          throw new Error('Incorrect slide preview dimensions: ' + src);
        }
        if (output.data.length >= input.length * 0.90) continue;
        const filename = key + '-' + w + '.webp';
        await fs.writeFile(path.join(previewDir, filename), output.data);
        candidates.push({ width: w, height: output.info.height, bytes: output.data.length, url: '/assets/lecture-previews/' + filename });
      }
    }
    entry = { sha256, width, height, originalBytes: input.length, candidates };
    cache.set(key, entry);
  }
  const row = { src, ...entry };
  if (!report.images.some(item => item.src === src)) report.images.push(row);
  return row;
}

async function optimize(file) {
  const original = await fs.readFile(file, 'utf8');
  if (!original.includes('/assets/')) return;
  const nodes = imageNodes(parse(original, { sourceCodeLocationInfo: true }));
  const edits = [];
  const images = [];
  for (const { node, limit } of nodes) {
    const a = attrs(node);
    if (!eligible(a.src ?? '')) continue;
    if (a.srcset || node.parentNode?.tagName === 'picture') {
      report.omitted.push({ src: a.src, reason: 'existing-responsive-source' });
      continue;
    }
    const info = await generate(a.src);
    if (!info) continue;
    const native = info.candidates.find(c => c.width === info.width);
    const srcset = info.candidates.map(c => c.url + ' ' + c.width + 'w');
    if (!native) srcset.push(a.src + ' ' + info.width + 'w');
    const values = {};
    if (!a.loading) values.loading = 'lazy';
    if (!a.decoding) values.decoding = 'async';
    if (!a.fetchpriority && (a.loading ?? values.loading) === 'lazy') values.fetchpriority = 'low';
    if (!a.width) values.width = info.width;
    if (!a.height) values.height = info.height;
    if (info.candidates.length > 0) {
      values.srcset = srcset.join(', ');
      if (!a.sizes) values.sizes = '(max-width: ' + (limit + 32) + 'px) calc(100vw - 2rem), ' + limit + 'px';
      values['data-lecture-preview'] = 'true';
      values['data-lecture-original'] = a.src;
    }
    const tag = node.sourceCodeLocation?.startTag;
    if (!tag) throw new Error('No source location for lecture image');
    const insert = original[tag.endOffset - 2] === '/' ? tag.endOffset - 2 : tag.endOffset - 1;
    const additions = Object.entries(values).map(([name, value]) => ' ' + name + '="' + encodeAttribute(value) + '"').join('');
    if (additions) edits.push({ insert, additions });
    images.push({ src: a.src, optimized: info.candidates.length > 0 });
  }
  if (!images.length) return;
  let html = original;
  for (const { insert, additions } of edits.sort((a, b) => b.insert - a.insert)) {
    html = html.slice(0, insert) + additions + html.slice(insert);
  }
  // Assert the full image sequence and original src/alt attributes survive.
  const identity = rows => rows.map(({node}) => { const a = attrs(node); return [a.src ?? '', a.alt ?? '']; });
  const after = imageNodes(parse(html));
  if (JSON.stringify(identity(nodes)) !== JSON.stringify(identity(after))) {
    throw new Error('Lecture image inventory changed: ' + file);
  }
  if (html !== original) await fs.writeFile(file, html);
  report.pages.push({ route: '/' + path.relative(dist, file).replaceAll(path.sep, '/').replace(/index\.html$/, ''), images });
}

await fs.mkdir(previewDir, { recursive: true });
for (const root of ['posts', 'en/posts']) {
  for await (const file of pages(path.join(dist, root))) await optimize(file);
}
if (!report.pages.length || !report.images.length) throw new Error('No lecture images found in built articles');
if (!report.images.some(image => image.candidates.length > 0)) throw new Error('No smaller responsive lecture previews generated');

// Verify the original binaries were not changed; verify every emitted preview.
for (const row of report.images) {
  const bytes = await fs.readFile(path.join(dist, row.src.slice(1)));
  if (createHash('sha256').update(bytes).digest('hex') !== row.sha256) throw new Error('Original image changed: ' + row.src);
  for (const c of row.candidates) {
    const data = await fs.readFile(path.join(dist, c.url.slice(1)));
    const meta = await sharp(data).metadata();
    if (meta.width !== c.width || meta.height !== c.height || meta.format !== 'webp' || data.length !== c.bytes) {
      throw new Error('Invalid preview: ' + c.url);
    }
  }
}
const originals = report.images.reduce((sum, image) => sum + image.originalBytes, 0);
const optimized = report.images.filter(image => image.candidates.length > 0).length;
const estimate = width => report.images.reduce((sum, image) => {
  const selected = image.candidates.find(c => c.width >= Math.min(width, image.width));
  return sum + (selected?.bytes ?? image.originalBytes);
}, 0);
report.summary = { pages: report.pages.length, distinctSources: report.images.length, optimized, originalBytes: originals, estimated640WidthBytes: estimate(640), estimated960WidthBytes: estimate(960), estimated1280WidthBytes: estimate(1280) };
await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log('lecture-images: PASS ' + JSON.stringify(report.summary));

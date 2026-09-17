import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import katex from 'katex';

const root = process.cwd();
const assetRoot = path.join(root, 'site/assets/assets/posts/modern-ai-continuation');
const manifest = JSON.parse(fs.readFileSync(path.join(assetRoot, 'figures.json'), 'utf8'));
const expected = {6: ['pspnet-fig-3','deeplabv3-fig-5','deeplabv3plus-fig-2'],7: ['vae-fig-1','ddpm-fig-2'],8: ['simclr-fig-2','clip-fig-1']};
let parsed = 0;
for (const [part, figures] of Object.entries(expected)) {
  const source = fs.readFileSync(path.join(root, `site/content/posts/modern-artificial-intelligence-${part}.mdx`), 'utf8');
  assert.deepEqual([...source.matchAll(/<PaperReadingFigure figure="([^"]+)"/g)].map(m => m[1]), figures);
  assert(!/<(?:script|style)\b/i.test(source));
  if (part === '7') {
    // These are prose characters, not JavaScript expressions or JSX tags.
    // Entity escaping preserves the displayed notation in actual MDX builds.
    assert(source.includes('q(x_&#123;t−1&#125;|xt,x0)'));
    assert(source.includes('reverse dt&lt;0'));
  }
  const ledger = JSON.parse(fs.readFileSync(path.join(root, `src/data/modern-ai-part${part}/formula-ledger.json`), 'utf8'));
  for (const f of ledger.formulas) {
    assert.equal(source.split(`modernAiFormula(${part}, '${f.id}')`).length - 1, 1);
    katex.renderToString(f.tex, {displayMode: true, throwOnError: true, trust: false}); parsed++;
  }
  for (const match of source.matchAll(/<Math display tex=\{String\.raw`([^`]+)`\} \/>/g)) {
    katex.renderToString(match[1], {displayMode: true, throwOnError: true, trust: false}); parsed++;
  }
  const rendered = path.join(root, `dist/posts/2026-08-25-modern-artificial-intelligence-${part}/index.html`);
  if (fs.existsSync(rendered)) {
    const html = fs.readFileSync(rendered, 'utf8');
    assert(!html.includes('katex-error'));
    assert.deepEqual([...html.matchAll(/data-reading-figure="([^"]+)"/g)].map(m => m[1]), figures);
  }
}
assert.equal(manifest.figures.length, 7);
for (const row of manifest.figures) {
  assert.equal(row.file, row.id + '.png');
  assert.equal(row.status, 'ACQUIRED', `Missing acquisition: ${row.id}`);
  assert.equal(row.local_visual_review.status, 'REVIEWED');
  assert.equal(row.local_visual_review.image_sha256, row.sha256);
  assert(row.url.includes(row.version) && row.source.includes(row.version));
  assert(/^[0-9a-f]{64}$/.test(row.source_sha256));
  assert(row.width > 0 && row.height > 0 && /^[0-9a-f]{64}$/.test(row.sha256));
  const bytes = fs.readFileSync(path.join(assetRoot, row.file));
  assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256);
  assert.equal(bytes.readUInt32BE(16), row.width);
  assert.equal(bytes.readUInt32BE(20), row.height);
  if (row.mode === 'image') assert.equal(row.sha256, row.source_sha256);
  else {
    assert.equal(row.rendering.pixels_per_point, 6);
    assert.equal(row.origin_figure_link, row.url + '#page=' + row.page);
  }
}
console.log(`modern-ai-continuation: PASS ${parsed} parsed math expressions; 7 acquired source figures. Not training replication or a publication-rights clearance.`);

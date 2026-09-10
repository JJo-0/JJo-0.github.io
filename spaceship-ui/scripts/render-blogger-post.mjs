/** Render a Markdown post into Blogger-safe article HTML.
 *
 * Usage: node scripts/render-blogger-post.mjs <input.md> <output.html> [--asset-base URL] [--min-images N]
 * Keep this deliberately narrow: Blogger receives only reader prose and a small
 * metadata comment understood by the publishing harness.
 */
import fs from 'node:fs';
import process from 'node:process';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

const args = process.argv.slice(2);
const [input, output] = args;
if (!input || !output) {
  throw new Error(
    'Usage: node scripts/render-blogger-post.mjs <input.md> <output.html> [--asset-base URL] [--min-images N]'
  );
}
const assetBaseIndex = args.indexOf('--asset-base');
const minimumIndex = args.indexOf('--min-images');
const assetBase = assetBaseIndex >= 0 ? args[assetBaseIndex + 1] : 'https://jjo-0.github.io';
const minimumImages = Number(minimumIndex >= 0 ? args[minimumIndex + 1] : 2);
if (!/^https:\/\//.test(assetBase)) throw new Error('--asset-base must use https.');
if (!Number.isInteger(minimumImages) || minimumImages < 1)
  throw new Error('--min-images must be a positive integer.');

function prepareImages(source) {
  let count = 0;
  const html = source.replace(/<img\b[^>]*>/gi, (tag) => {
    const sourceMatch = tag.match(/\bsrc=(['"])(.*?)\1/i);
    const altMatch = tag.match(/\balt=(['"])(.*?)\1/i);
    if (!sourceMatch?.[2]) throw new Error('Every Blogger image needs a src attribute.');
    if (!altMatch?.[2]?.trim()) throw new Error('Every Blogger image needs non-empty alt text.');
    let src = sourceMatch[2];
    if (src.startsWith('/')) src = new URL(src, assetBase).toString();
    if (!/^https:\/\//.test(src))
      throw new Error(`Blogger images must use absolute https URLs: ${src}`);
    let prepared = tag.replace(sourceMatch[0], `src=${sourceMatch[1]}${src}${sourceMatch[1]}`);
    if (!/\bloading=/i.test(prepared)) prepared = prepared.replace(/\s*\/?>$/, ' loading="lazy">');
    if (!/\bdecoding=/i.test(prepared))
      prepared = prepared.replace(/\s*\/?>$/, ' decoding="async">');
    count += 1;
    return prepared;
  });
  if (count < minimumImages)
    throw new Error(`Blogger requires at least ${minimumImages} inline images; got ${count}.`);
  return { html, count };
}

const raw = fs.readFileSync(input, 'utf8');
const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!match) throw new Error('Expected YAML front matter.');
const frontmatter = match[1];
const body = match[2];
const title = frontmatter.match(/^title:\s*'(.+)'$/m)?.[1];
if (!title) throw new Error('Expected a single-quoted front matter title.');
const labelText = frontmatter.match(/^labels:\s*'(.+)'$/m)?.[1];
if (!labelText) throw new Error('Expected comma-separated labels in single quotes.');
const labels = labelText
  .split(',')
  .map((label) => label.trim())
  .filter(Boolean);
const rendered = String(
  await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(body)
);
const prepared = prepareImages(rendered);
const readerText = prepared.html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[^;]+;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
if (readerText.length < 1500 || readerText.length > 2500)
  throw new Error(`Blogger reader text must be 1,500–2,500 characters; got ${readerText.length}.`);
const html =
  `<!-- 권장 제목: ${title}\n권장 라벨: ${labels.join(', ')}\n-->\n` +
  `<!-- Blogger inline images: ${prepared.count} -->\n` +
  `<div class="article-body" lang="ko">\n${prepared.html}\n</div>\n`;
fs.writeFileSync(output, html, 'utf8');

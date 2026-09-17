import { assertNewsProseLength } from './news-prose-policy.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const slug = '2026-09-14-justgrpo-diffusion-reasoning-news';
const read = (relative) => fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
const bytes = (relative) => fs.readFileSync(new URL(relative, import.meta.url));
const media = JSON.parse(read('../site/news-media.json'));
const ledger = JSON.parse(read('../site/assets/assets/posts/justgrpo-20260914/provenance.json'));
const post = read(`../site/content/posts/${slug}.mdx`);
const frontmatter = post.match(/^---\r?\n([\s\S]*?)\r?\n---/);
assert(frontmatter, 'justgrpo: frontmatter required');
assert.match(frontmatter[1], /^draft: false$/m, 'justgrpo: explicit publication state required');
assert.match(frontmatter[1], new RegExp(`^slug: ${slug}$`, 'm'));
const body = post.slice(frontmatter[0].length).replace(/^import .*;\s*$/gm, '').trim();
assert(body.startsWith('<NewsFigure media="justgrpo-mechanism" priority />'), 'justgrpo: source mechanism must precede prose');

const ids = ['justgrpo-mechanism', 'justgrpo-order-map', 'justgrpo-loop', 'justgrpo-results'];
assert.deepEqual(
  Object.entries(media).filter(([, item]) => item.slug === slug).map(([id]) => id),
  ids,
  'justgrpo: the source figure must be the listing hero, followed by two labelled educational diagrams and the source result',
);
assert.equal((body.match(/<NewsFigure\b/g) ?? []).length, 4, 'justgrpo: exactly four role-specific visuals required');
for (const id of ids) {
  const item = media[id];
  for (const field of ['src', 'alt', 'kind', 'caption', 'credit', 'source', 'license', 'rights', 'changes']) {
    assert(typeof item[field] === 'string' && item[field].trim(), `${id}: missing ${field}`);
  }
  assert(body.includes(`<NewsFigure media="${id}"`), `${id}: catalogue/body parity`);
  assert(item.alt.length >= 20, `${id}: useful alt text required`);
  assert(item.src.startsWith('/assets/posts/justgrpo-20260914/'), `${id}: local asset required`);
}

assert.equal(ledger.assets.length, 4, 'justgrpo: media ledger must cover every visual');
for (const row of ledger.assets) {
  const item = media[row.media_id];
  assert(item, `${row.media_id}: missing media catalogue row`);
  const file = bytes(`../site/assets${item.src}`);
  assert.equal(file.length, row.bytes, `${row.media_id}: byte length changed`);
  assert.equal(createHash('sha256').update(file).digest('hex'), row.sha256, `${row.media_id}: digest changed`);
  assert.equal(item.license.includes(row.license), true, `${row.media_id}: licence mismatch`);
  assert.equal(item.rights, row.rights, `${row.media_id}: rights URL mismatch`);
}
for (const id of ['justgrpo-mechanism', 'justgrpo-results']) {
  assert.equal(media[id].license, 'MIT · JustGRPO 저장소');
  const file = bytes(`../site/assets${media[id].src}`);
  assert(file.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${id}: original PNG required`);
}
for (const id of ['justgrpo-order-map', 'justgrpo-loop']) {
  const svg = read(`../site/assets${media[id].src}`);
  assert.match(svg, /<title\b/);
  assert.match(svg, /<desc\b/);
  assert.match(svg, /교육용/);
  assert.doesNotMatch(svg, /<script\b|<foreignObject\b|<!ENTITY|@font-face/i);
  assert.doesNotMatch(svg, /(?:href|xlink:href)=["'](?:https?:|data:)/i);
}
const prose = body
  .split('## 10. 출처와 원본 그림')[0]
  .replace(/<(?:Math|NewsFigure)\b[^>]*?\/>/gs, '')
  .replace(/<[^>]+>/g, '')
  .replace(/\[\d+\]/g, '')
  .replace(/^[#>\s]+/gm, '')
  .replace(/[*|]/g, '')
  .replace(/\s+/g, ' ')
  .trim();
assertNewsProseLength(prose.length, "news-justgrpo-visual-contract.mjs");
console.log(`news-justgrpo-visual-contract: PASS original source PNGs, rights ledger, 2 educational SVGs, ${prose.length} prose characters`);

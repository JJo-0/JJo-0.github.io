import assert from 'node:assert/strict';
import fs from 'node:fs';

const slug = '2026-09-12-lithium-disulfur-dichloride-frontier-one';
const read = (relative) => fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
const media = JSON.parse(read('../site/news-media.json'));
const source = read(`../site/content/posts/${slug}.mdx`);
const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
assert(frontmatter, 'sulfur: missing frontmatter');
assert.match(frontmatter[1], /^draft: (true|false)$/m, 'sulfur: explicit draft status required');
assert.match(frontmatter[1], /^researchFeatured: false$/m);
assert.match(frontmatter[1], new RegExp(`^slug: ${slug}$`, 'm'));
const body = source.slice(frontmatter[0].length).replace(/^import .*;\s*$/gm, '').trim();
assert(body.startsWith('<NewsFigure media="sulfur-crystal" priority />'), 'sulfur: hero must be first visible body node');
const ids = ['sulfur-crystal', 'sulfur-electron-range', 'sulfur-mass-basis'];
const selected = Object.entries(media).filter(([, item]) => item.slug === slug);
assert.deepEqual(selected.map(([id]) => id), ids, 'sulfur: NewsListItem must select photo before diagrams');
assert.equal((body.match(/<NewsFigure\b/g) || []).length, 3, 'sulfur: exactly three role-specific visuals expected');
for (const id of ids) {
  const item = media[id];
  for (const field of ['src', 'alt', 'kind', 'caption', 'credit', 'source', 'license', 'rights', 'changes']) {
    assert(typeof item[field] === 'string' && item[field].trim(), `${id}: missing ${field}`);
  }
  assert(item.alt.length >= 20, `${id}: meaningful alt text required`);
  assert(item.width > 0 && item.height > 0, `${id}: dimensions required`);
  assert(body.includes(`<NewsFigure media="${id}"`), `${id}: missing body figure`);
  assert.equal(new URL(item.source).protocol, 'https:');
  assert.equal(new URL(item.rights).protocol, 'https:');
}
assert.equal(media['sulfur-crystal'].license, 'CC BY-SA 2.5');
assert.match(media['sulfur-crystal'].caption, /2006/);
assert.match(media['sulfur-crystal'].kind, /연구 시료 아님/);
assert.equal(new URL(media['sulfur-crystal'].src).hostname, 'thumb.wikimedia.org');
for (const id of ids.slice(1)) {
  const item = media[id];
  assert(item.src.startsWith('/assets/posts/lithium-sulfur-20260912/'), `${id}: local post asset required`);
  const svg = read(`../site/assets${item.src}`);
  assert.match(svg, /<title\b/);
  assert.match(svg, /<desc\b/);
  assert.match(svg, /실험 데이터|실측/);
  assert.doesNotMatch(svg, /<script\b|<foreignObject\b|<!ENTITY|@font-face/i);
  assert.doesNotMatch(svg, /(?:href|xlink:href)=["'](?:https?:|data:)/i);
  const viewBox = svg.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/);
  assert(viewBox, `${id}: viewBox required`);
  assert(Math.abs(Number(viewBox[3]) / Number(viewBox[4]) - item.width / item.height) < 0.001, `${id}: aspect ratio mismatch`);
  assert.match(item.kind, /실측 데이터 아님/);
}
const prose = body.split('## 9. 출처')[0]
  .replace(/<(?:Math|NewsFigure)\b[^>]*?\/>/gs, '')
  .replace(/\[\d+\]/g, '')
  .replace(/^[#>\s]+/gm, '')
  .replace(/[*|]/g, '')
  .replace(/\s+/g, ' ').trim();
assert(prose.length >= 7000 && prose.length <= 10000, `sulfur: body must stay within 7,000–10,000 characters; got ${prose.length}`);
console.log(`news-sulfur-visual-contract: PASS image-first body, photo-first thumbnail, 3 credited visuals, ${prose.length} prose characters`);

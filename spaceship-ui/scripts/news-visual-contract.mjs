import assert from 'node:assert/strict';
import fs from 'node:fs';

const catalogue = JSON.parse(
  fs.readFileSync(new URL('../site/news-diagrams.json', import.meta.url), 'utf8')
);
const bySlug = new Map();

for (const [id, item] of Object.entries(catalogue)) {
  assert(item.slug && item.src && item.alt && item.caption, `${id}: incomplete diagram metadata`);
  assert(item.src.startsWith('/assets/news-diagrams/'), `${id}: unexpected diagram path`);
  assert(item.alt.trim().length >= 20, `${id}: alt text is too short`);
  const asset = new URL(`../site/assets${item.src}`, import.meta.url);
  assert(fs.existsSync(asset), `${id}: missing SVG asset ${item.src}`);
  const source = fs.readFileSync(asset, 'utf8');
  assert(source.includes('<title'), `${id}: SVG needs a title`);
  assert(source.includes('<desc'), `${id}: SVG needs a description`);
  const ids = bySlug.get(item.slug) ?? [];
  ids.push(id);
  bySlug.set(item.slug, ids);
}

for (const [slug, ids] of bySlug) {
  assert.equal(ids.length, 2, `${slug}: expected exactly two original explanatory diagrams`);
  const post = new URL(`../site/content/posts/${slug}.mdx`, import.meta.url);
  const source = fs.readFileSync(post, 'utf8');
  assert(source.includes('import NewsDiagram'), `${slug}: missing NewsDiagram import`);
  assert(source.includes('<NewsFigure'), `${slug}: missing source/background figure`);
  for (const id of ids)
    assert(source.includes(`<NewsDiagram diagram="${id}"`), `${slug}: missing ${id}`);
}

assert.equal(bySlug.size, 5, 'expected visual coverage for five September 9 NEWS articles');
console.log('news-visual-contract: PASS five articles with three role-specific visuals each');

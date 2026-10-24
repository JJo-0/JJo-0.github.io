import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateVisualInventory, loadApprovedVisualInventory } from './news-approved-visual-inventory.mjs';

const inventory = JSON.parse(fs.readFileSync(new URL('../site/news-approved-visual-inventory-20261025.json', import.meta.url)));
const catalogue = JSON.parse(fs.readFileSync(new URL('../site/news-media.json', import.meta.url)));
const read = (slug) => fs.readFileSync(new URL(`../site/content/posts/${slug}.mdx`, import.meta.url), 'utf8');
const actual = loadApprovedVisualInventory(catalogue);
assert.equal(actual.size, 9);
assert.equal([...actual.values()].reduce((n, row) => n + row.mediaIds.length, 0), 13);
assert.equal(actual.get('2026-10-09-sando-safe-dynamic-trajectory-news').mediaIds.length, 5);
for (const mutate of [
  (v) => v.entries.pop(),
  (v) => v.entries.push(structuredClone(v.entries[0])),
  (v) => { v.entries[0].mediaIds = []; },
  (v) => { v.entries[0].mediaIds.push(v.entries[0].mediaIds[0]); },
  (v) => { v.entries[0].mediaIds[0] = 'unknown-image'; },
  (v) => { v.entries[0].newsDiagramCount = 1; },
]) {
  const altered = structuredClone(inventory); mutate(altered);
  assert.throws(() => validateVisualInventory(altered, catalogue, read));
}
for (const key of ['src', 'source', 'license', 'credit', 'alt']) {
  const altered = structuredClone(catalogue);
  altered[inventory.entries[0].mediaIds[0]][key] = '';
  assert.throws(() => validateVisualInventory(inventory, altered, read), `${key} removal must fail`);
}
assert.throws(() => validateVisualInventory(inventory, catalogue, (slug) => read(slug).replace(/<NewsFigure\b[^>]*\/>/, '')));
const browser = fs.readFileSync(new URL('./browser-news-media-audit.mjs', import.meta.url), 'utf8');
for (const check of ['img.complete && img.naturalWidth > 0', 'result.decoded', 'result.visible', 'result.captions', '!result.overflow', 'exactly one registered figure', 'matches[0].src, expected.src']) assert(browser.includes(check), `Retain existing validation: ${check}`);
console.log('Approved visual inventory: PASS nine articles, 13 exact image IDs, source/rights metadata pins and 12 refusal cases; existing image checks retained');

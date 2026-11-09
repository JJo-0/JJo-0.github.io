import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateVisualInventory, loadApprovedVisualInventory } from './news-approved-visual-inventory.mjs';

const inventory = JSON.parse(fs.readFileSync(new URL('../site/news-approved-visual-inventory-20261025.json', import.meta.url)));
const currentInventory = JSON.parse(fs.readFileSync(new URL('../site/news-approved-visual-inventory-20261028.json', import.meta.url)));
const trioInventory = JSON.parse(fs.readFileSync(new URL('../site/news-approved-visual-inventory-20261104.json', import.meta.url)));
const catalogue = JSON.parse(fs.readFileSync(new URL('../site/news-media.json', import.meta.url)));
const read = (slug) => fs.readFileSync(new URL(`../site/content/posts/${slug}.mdx`, import.meta.url), 'utf8');
const readByFile = (_slug, sourceFile) => fs.readFileSync(new URL(`../site/content/posts/${sourceFile}`, import.meta.url), 'utf8');
const actual = loadApprovedVisualInventory(catalogue);
assert.equal(actual.size, 26);
assert.equal([...actual.values()].reduce((n, row) => n + row.mediaIds.length, 0), 51);
assert.equal(actual.get('2026-10-09-sando-safe-dynamic-trajectory-news').mediaIds.length, 5);
assert.deepEqual(actual.get('2026-10-07-deterministic-2d-semiconductor-nucleation-news').mediaIds, ['nucleation-current-fig1', 'nucleation-current-fig3', 'nucleation-current-fig4']);
assert.equal([...inventory.entries].length, 9, 'October 25 batch remains nine entries');
assert.equal([...currentInventory.entries].length, 3, 'October 28 batch is exactly three entries');
assert.equal(currentInventory.entries.reduce((n, row) => n + row.mediaIds.length, 0), 8);
assert.equal(new Set([...inventory.entries, ...currentInventory.entries].map((row) => row.slug)).size, 12);
assert.equal(trioInventory.entries.length, 3, 'November 4 batch is exactly three entries');
assert.equal(trioInventory.entries.reduce((n, row) => n + row.mediaIds.length, 0), 4);
assert.deepEqual(actual.get('flora-robotics-data-engine').mediaIds, ['flora-original-figure-1', 'flora-original-figure-5']);
assert.deepEqual(actual.get('nexus-ai-tb-screening').mediaIds, ['nexus-tb-screening-flow']);
assert.deepEqual(actual.get('sequential-diagnosis-benchmark').mediaIds, ['sdbench-diagnosis-evaluation-flow']);
assert.deepEqual([...validateVisualInventory(trioInventory, catalogue, readByFile).keys()], trioInventory.entries.map((row) => row.slug));
assert.equal(actual.get('airscope-wireless-cortex-imaging').sourceFile, '2026-10-20-airscope-wireless-cortex-imaging-news.mdx');
assert.deepEqual([...validateVisualInventory(currentInventory, catalogue, readByFile, { approvalDate: '2026-10-28' }).keys()], currentInventory.entries.map((row) => row.slug));
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
for (const mutate of [
  (v) => v.entries.pop(),
  (v) => v.entries.push(structuredClone(v.entries[0])),
  (v) => { v.entries[0].mediaIds[0] = 'wrong-source-id'; },
  (v) => { v.entries[0].mediaMetadataSha256 = '0'.repeat(64); },
  (v) => { v.entries[0].newsDiagramCount = 1; },
  (v) => { v.entries[0].sourceFile = '../outside.mdx'; },
]) {
  const altered = structuredClone(currentInventory); mutate(altered);
  assert.throws(() => validateVisualInventory(altered, catalogue, readByFile, { approvalDate: '2026-10-28' }));
}
assert.throws(() => validateVisualInventory(currentInventory, catalogue, readByFile, { approvalDate: '2026-10-25' }));
for (const mutate of [
  (v) => v.entries.pop(),
  (v) => { v.entries[0].mediaIds.push(v.entries[0].mediaIds[0]); },
  (v) => { v.entries[0].mediaMetadataSha256 = '0'.repeat(64); },
  (v) => { v.entries[0].newsDiagramCount = 1; },
  (v) => { v.entries[0].sourceFile = '../outside.mdx'; },
]) {
  const altered = structuredClone(trioInventory); mutate(altered);
  assert.throws(() => validateVisualInventory(altered, catalogue, readByFile));
}
assert.throws(() => validateVisualInventory(currentInventory, catalogue, (_slug, file) => readByFile('airscope-wireless-cortex-imaging', file).replace('slug: airscope-wireless-cortex-imaging', 'slug: mismatched-route'), { approvalDate: '2026-10-28' }), /does not match public slug/);
const browser = fs.readFileSync(new URL('./browser-news-media-audit.mjs', import.meta.url), 'utf8');
for (const check of ['img.complete && img.naturalWidth > 0', 'result.decoded', 'result.visible', 'result.captions', '!result.overflow', 'exactly one registered figure', 'matches[0].src, expected.src']) assert(browser.includes(check), `Retain existing validation: ${check}`);

const nov5Inventory = JSON.parse(fs.readFileSync(new URL('../site/news-approved-visual-inventory-20261105.json', import.meta.url)));
assert.deepEqual(nov5Inventory.entries.map(row => row.mediaIds.length), [2, 3, 3, 2, 3, 1]);
assert.deepEqual([...validateVisualInventory(nov5Inventory, catalogue, readByFile).keys()], nov5Inventory.entries.map(row => row.slug));
for (const mutate of [(v) => v.entries.pop(), (v) => v.entries[0].mediaIds.pop(), (v) => { v.entries[0].mediaMetadataSha256 = '0'.repeat(64); }]) {
  const altered = structuredClone(nov5Inventory); mutate(altered);
  assert.throws(() => validateVisualInventory(altered, catalogue, readByFile));
}
for (const index of [3, 4, 5]) {
  const omitted = structuredClone(nov5Inventory);
  omitted.entries[index].mediaIds.pop();
  assert.throws(() => validateVisualInventory(omitted, catalogue, readByFile));
  const alteredRights = structuredClone(catalogue);
  alteredRights[nov5Inventory.entries[index].mediaIds[0]].rights = 'unverified-rights';
  assert.throws(() => validateVisualInventory(nov5Inventory, alteredRights, readByFile));
}
console.log('Approved visual inventory: PASS 26 unique posts and 51 exact media across six fixed batches; existing image checks retained');

assert.deepEqual(actual.get("2026-10-14-cacheflex-l2-scratchpad-news").mediaIds, ["cacheflex-vector-width-unit"]);

assert.deepEqual(actual.get("2026-10-10-endometriosis-spatial-neuroimmune-news").mediaIds, ["endo-vor-fig1a-spatial-workflow", "endo-vor-fig6a-coculture-model"]);

const twlaIds = ["twla-visual-tactile-clocks-v1", "twla-valid-unexecuted-residual-v1", "trex-figure3-model-architecture"];
assert.deepEqual(actual.get("t-wla-vision-touch").mediaIds, twlaIds);
const nov9Inventory = JSON.parse(fs.readFileSync(new URL("../site/news-approved-visual-inventory-20261109.json", import.meta.url)));
const omittedTwla = structuredClone(nov9Inventory); omittedTwla.entries[1].mediaIds.pop();
assert.throws(() => validateVisualInventory(omittedTwla, catalogue, readByFile));
const alteredTwlaRights = structuredClone(catalogue); alteredTwlaRights[twlaIds[2]].rights = "unverified-rights";
assert.throws(() => validateVisualInventory(nov9Inventory, alteredTwlaRights, readByFile));

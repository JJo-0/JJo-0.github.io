import assert from 'node:assert/strict';
import fs from 'node:fs';
import { groupMediaByPost } from './news-media-visit-plan.mjs';

const sample = [
  ['a-cover', { slug: 'article-a', src: '/a.webp' }],
  ['b-cover', { slug: 'article-b', src: '/b.webp' }],
  ['a-detail', { slug: 'article-a', src: '/detail.webp' }],
];
const grouped = groupMediaByPost(sample);
assert.deepEqual([...grouped.keys()], ['article-a', 'article-b']);
assert.deepEqual(grouped.get('article-a').map(([id]) => id), ['a-cover', 'a-detail']);
assert.equal(grouped.get('article-a')[1], sample[2], 'Grouping must retain original metadata, not just the cover');
assert.equal(groupMediaByPost([]).size, 0);
for (const bad of [null, {}, [null], [['a']], [['a', null]], [['a', {slug:'../a'}]],
  [['a', {slug:'article-a'}], ['a', {slug:'article-a'}]]]) {
  assert.throws(() => groupMediaByPost(bad));
}
const catalogue = JSON.parse(fs.readFileSync(new URL('../site/news-media.json', import.meta.url), 'utf8'));
const entries = Object.entries(catalogue);
const actual = groupMediaByPost(entries);
assert.equal(actual.size, new Set(entries.map(([,m])=>m.slug)).size);
assert.deepEqual([...actual.values()].flat().map(([id])=>id).sort(), entries.map(([id])=>id).sort());
assert(actual.size < entries.length, 'Fixture must exercise multiple images per post');
for (const [id, item] of entries) assert(actual.get(item.slug).some(([keptId, kept])=>keptId===id && kept===item));
console.log(`news-media-visit-plan: PASS ${entries.length} media entries preserved in ${actual.size} single-visit groups; malformed/duplicate inputs refused`);

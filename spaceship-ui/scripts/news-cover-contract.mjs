import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const manifest = JSON.parse(read('../site/news-covers-20260912.json'));
const media = JSON.parse(read('../site/news-media.json'));
const postsDir = new URL('../site/content/posts/', import.meta.url);
const target = fs.readdirSync(postsDir).filter((name) => /^2026-09-0[5678].*\.mdx$/.test(name));
assert.equal(target.length, 19, 'September 5–8 coverage must be explicitly reviewed when adding posts');
assert.deepEqual(manifest.entries.map((r) => r.slug + '.mdx').sort(), target.sort());
assert.deepEqual(manifest.expectedDates, {'2026-09-05':5,'2026-09-06':6,'2026-09-07':3,'2026-09-08':5});
const sha = (v) => crypto.createHash('sha256').update(v).digest('hex');
for (const [date, count] of Object.entries(manifest.expectedDates)) assert.equal(manifest.entries.filter((r) => r.date === date).length, count);
for (const row of manifest.entries) {
  const item = media[row.media];
  assert(item && item.slug === row.slug);
  assert.equal(Object.entries(media).find(([, m]) => m.slug === row.slug)?.[0], row.media, 'cover must be first for NewsListItem');
  assert.equal(item.src, row.src);
  assert(row.src.startsWith('/assets/posts/news-covers-20260912/'));
  for (const field of ['alt','caption','credit','source','license','rights','changes']) assert(typeof item[field] === 'string' && item[field].trim(), `${row.media}: missing ${field}`);
  assert(item.alt.length >= 20);
  assert.equal(item.width, row.width); assert.equal(item.height, row.height);
  assert.equal(new URL(item.source).protocol, 'https:'); assert.equal(new URL(item.rights).protocol, 'https:');
  const bytes = fs.readFileSync(new URL('../site/assets' + row.src, import.meta.url));
  assert.equal(sha(bytes), row.assetSha256); assert.equal(bytes.length, row.bytes);
  assert(bytes.subarray(0,4).toString() === 'RIFF' || bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'real WebP/PNG required');
  const source = read('../site/content/posts/' + row.slug + '.mdx');
  const match = source.match(/^---\n([\s\S]*?)\n---/); assert(match);
  assert.match(match[1], /^draft: false$/m); assert.match(match[1], new RegExp('^pubDate: '+row.date+'$', 'm'));
  const body = source.slice(match[0].length).replace(/^import [^\n]+;[ \t]*\n/gm, '').trim();
  const hero = `<NewsFigure media="${row.media}" priority />`;
  assert(body.startsWith(hero), `${row.slug}: image must precede prose`);
  assert.equal(body.split(hero).length, 2);
  assert.equal(sha(body.slice(hero.length).trim()), row.bodyBaselineSha256, `${row.slug}: original body changed`);
  assert.equal(row.legacyVisualSuite, row.slug === '2026-09-07-openai-research-automation-frontier-one');
}
for (const item of manifest.additionalLocalAssets) {
  assert.equal(media[item.media].src, item.src);
  assert.equal(sha(fs.readFileSync(new URL('../site/assets'+item.src, import.meta.url))), item.assetSha256);
}
console.log('news-cover-contract: PASS 19 original-first covers, local image hashes and original prose retained');

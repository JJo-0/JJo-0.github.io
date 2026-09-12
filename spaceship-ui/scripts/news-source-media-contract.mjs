import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const assetsRoot = new URL('../site/assets/', import.meta.url);
const media = JSON.parse(fs.readFileSync(new URL('../site/news-media.json', import.meta.url), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(new URL('../site/assets/assets/posts/frontier-source-20260912/provenance.json', import.meta.url), 'utf8'));
const expected = new Map([
  ['2026-09-12-lithium-disulfur-dichloride-frontier-one', 'sulfur-source-fig1'],
  ['2026-09-11-embryo-base-editing-news', 'embryo-study-photo'],
  ['2026-09-11-high-na-large-mask-news', 'high-na-2024-source'],
  ['2026-09-11-sulfide-electrolyte-film-news', 'sulfide-film-fig2'],
]);
assert.equal(ledger.assets.length, 7, 'seven reviewed primary/background assets required');
for (const row of ledger.assets) {
  const item = media[row.media_id];
  assert(item, `${row.media_id}: missing catalogue entry`);
  assert(item.src.startsWith('/assets/posts/frontier-source-20260912/'));
  assert(!item.src.includes('..'), 'asset path must not traverse directories');
  const bytes = fs.readFileSync(new URL(item.src.slice(1), assetsRoot));
  assert.equal(bytes.length, row.bytes, `${row.media_id}: byte length drift`);
  const sha = createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha, row.sha256, `${row.media_id}: provenance digest mismatch`);
  assert.equal(sha, item.sha256, `${row.media_id}: catalogue digest mismatch`);
  assert.equal(item.license, row.license);
  assert.equal(item.rights, row.rights);
  assert(item.alt.length >= 20 && item.caption.length >= 30);
  if (item.src.endsWith('.png')) assert(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
  else if (item.src.endsWith('.jpg')) assert.equal(bytes.readUInt16BE(0), 0xffd8);
  else if (item.src.endsWith('.webp')) {
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  } else assert.fail('unsupported source image format');
}
for (const [slug, hero] of expected) {
  const source = fs.readFileSync(new URL(`../site/content/posts/${slug}.mdx`, import.meta.url), 'utf8');
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(fm, `${slug}: frontmatter required`);
  const authorizedToday = slug === '2026-09-12-lithium-disulfur-dichloride-frontier-one';
  assert.match(fm[1], authorizedToday ? /^draft: false$/m : /^draft: true$/m, `${slug}: preserve the explicitly authorized publication scope`);
  assert.match(fm[1], new RegExp(`^slug: ${slug}$`, 'm'), `${slug}: catalogue and route slug must match`);
  const body = source.slice(fm[0].length).replace(/^import .*;\s*$/gm, '');
  const figure = body.indexOf(`<NewsFigure media="${hero}" priority />`);
  assert(figure >= 0 && figure < body.indexOf('## 1.'), `${slug}: original figure must precede article sections`);
  const entries = Object.entries(media).filter(([, item]) => item.slug === slug);
  assert.equal(entries[0][0], hero, `${slug}: News-list thumbnail must use the original source figure`);
  for (const [id, item] of entries) {
    assert(item.src.startsWith('/assets/posts/'), `${slug}: no remote hotlinked body image`);
    assert(body.includes(`<NewsFigure media="${id}"`), `${id}: catalogue/body parity`);
  }
}
assert.match(media['sulfide-film-fig2'].license, /BY-NC-ND/);
assert.match(media['sulfide-cycle-fig5'].caption, /40°C.*0.5C.*2MPa/);
assert.match(media['high-na-2024-source'].caption, /2026.*아니다/);
assert.match(media['embryo-study-photo'].caption, /안전성 검증이 아니다/);
console.log('news-source-media-contract: PASS seven verified local images, four original-first articles with explicit publication scope, rights preserved');

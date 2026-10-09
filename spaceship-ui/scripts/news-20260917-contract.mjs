import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { assertNewsProseLength } from './news-prose-policy.mjs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const sha = (value) => createHash('sha256').update(value).digest('hex');
const edition = JSON.parse(read('../site/news-edition-20260917.json'));
const media = JSON.parse(read('../site/news-media.json'));
const originals = JSON.parse(read('../site/assets/assets/posts/news-20260917/provenance.json'));
const expected = [
  ['rubin', '2026-09-17-vera-rubin-mlperf-news', 'rubin-rack-background', 'frontier-one', 'CC BY 2.0'],
  ['ebv', '2026-09-17-ms-ebv-prerelapse-news', 'ms-ebv-micrograph', 'frontier-candidate', 'Public domain'],
  ['hemophilia', '2026-09-17-adolescent-hemophilia-b-news', 'hemophilia-aav-micrograph', 'frontier-candidate', 'CC BY-SA 4.0'],
];
function countProse(source) {
  return [...source.replace(/^---\n[\s\S]*?\n---\s*/, '').split('## 9.')[0]
    .replace(/^import .*;\s*$/gm, '').replace(/<Math\b[\s\S]*?\/>/g, '')
    .replace(/<[^>]+>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\d+(?:,\d+)*\]/g, '').replace(/[*#|`>]+/g, '').replace(/\s+/g, ' ').trim()].length;
}
// Boundary and markup-padding controls. No upper prose limit is introduced.
assert.equal(countProse('가'.repeat(7000)), 7000);
assert.equal(countProse('가'.repeat(12000)), 12000);
assert.equal(countProse('<a href="https://example.org/' + 'x'.repeat(9000) + '">본문</a>'), 2);
assert.equal(countProse('<Math display tex={String.raw`' + 'x'.repeat(9000) + '`} />'), 0);
assert.throws(() => assertNewsProseLength(countProse('가'.repeat(6999))));
assert.doesNotThrow(() => assertNewsProseLength(countProse('가'.repeat(12000))));
assert.equal(edition.edition, '2026-09-17');
assert.equal(edition.sourceDate, '2026-09-16');
assert.equal(edition.entries.length, 3);
assert.equal(originals.length, 3);
assert.deepEqual(edition.entries.map((row) => row.slug), expected.map((row) => row[1]));
assert.deepEqual(edition.entries.map((row) => row.score), [95, 94, 92]);
for (const [index, [key, slug, mid, selection, license]] of expected.entries()) {
  const entry = edition.entries[index];
  const source = read(`../site/content/posts/${slug}.mdx`);
  const front = source.match(/^---\n([\s\S]*?)\n---/); assert(front);
  for (const line of ['draft: false', 'lang: ko', 'pubDate: 2026-09-17', 'researchFeatured: false', `slug: ${slug}`])
    assert(front[1].split('\n').includes(line), `${slug}: ${line}`);
  assert(front[1].includes(`  - ${selection}\n`));
  const body = source.slice(front[0].length).replace(/^import .*;\s*$/gm, '').trim();
  assert(body.startsWith(`<NewsFigure media="${mid}" priority />`), `${slug}: image-first opening`);
  assert.deepEqual([...body.matchAll(/<NewsFigure\b[^>]*media="([^"]+)"/g)].map((m) => m[1]), [mid]);
  assert.equal([...body.matchAll(/^## [1-9]\. /gm)].length, 9);
  assert.equal(sha(source), entry.postSha256, `${slug}: review/hash drift`);
  const length = countProse(source); assertNewsProseLength(length, slug);
  assert.equal(length, entry.bodyCharacters, `${slug}: visible-prose count mismatch`);
  const counts = {};
  for (const m of body.matchAll(/<a href="#news-ref-(\d+)" data-news-citation="(\d+)" aria-label="[^"]+" data-astro-reload>\[(\d+)\]<\/a>/g)) {
    assert.equal(m[1], m[2]); assert.equal(m[2], m[3]);
    counts[m[1]] = (counts[m[1]] || 0) + 1;
  }
  assert.deepEqual(counts, entry.citationCounts, `${slug}: exact numeric citation mapping`);
  assert(Object.keys(counts).length >= 2);
  const references = [...body.matchAll(/<a id="news-ref-(\d+)" href="([^"]+)" data-news-reference="(\d+)" target="_blank" rel="noopener noreferrer">\[(\d+)\]<\/a>/g)].map((m) => {
    assert.equal(m[1], m[3]); assert.equal(m[3], m[4]);
    const url = new URL(m[2]); assert.equal(url.protocol, 'https:'); assert(!url.username && !url.password);
    return { number: Number(m[1]), url: m[2], baselineLabel: `[${m[1]}]` };
  });
  assert.deepEqual(references, entry.references);
  assert.equal(new Set(references.map((r) => r.number)).size, references.length);
  for (const n of Object.keys(counts)) assert(references.some((r) => r.number === Number(n)));
  assert.equal(references[0].url, entry.source);
  assert(!body.includes('( /posts/'), 'Internal article links must not contain leading spaces');
  const original = originals.find((p) => p.id === mid), item = media[mid]; assert(original && item);
  assert.equal(item.slug, slug); assert.equal(item.order, index + 1);
  for (const name of ['src', 'width', 'height', 'source', 'license', 'rights', 'sha256', 'credit']) assert.equal(item[name], original[name]);
  assert.equal(item.license, license);
  for (const name of ['kind', 'alt', 'caption', 'changes']) assert(item[name]?.length > 10);
  assert(item.kind.includes('아님') && item.caption.includes('아니다'), `${mid}: explicit truthful background role`);
  assert(item.src.startsWith('/assets/posts/news-20260917/') && !item.src.includes('..'));
  const image = fs.readFileSync(new URL(`../site/assets${item.src}`, import.meta.url));
  assert.equal(sha(image), original.sha256); assert.equal(image.toString('ascii', 0, 4), 'RIFF'); assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  assert.deepEqual(entry.mediaIds, [mid]);
  const blogger = read(`../ops/blog-harness/blogger/2026-09-17/${key}.html`);
  assert.equal(sha(blogger), entry.bloggerSha256);
  assert(blogger.includes(`https://jjo-0.github.io/posts/${slug}/`) && blogger.includes(entry.source));
  assert(blogger.includes('https://jjo-0.github.io' + item.src));
  assert(!/<script\b|<form\b|\son\w+\s*=/i.test(blogger));
  assert(entry.bloggerProseCharacters >= 1000);
  if (key === 'rubin') {
    for (const token of ['Preview', '2018년', '1.83배', '1.92배', '3.74배', '2.57배', '2.99배', '5.7배', 'has_power', '5월 31일']) assert(body.includes(token), token);
  } else if (key === 'ebv') {
    assert(body.slice(0, 600).includes('관찰연구'));
    for (const token of ['135명', '240개', 'Fc', '23명', 'Zenodo', '원인']) assert(body.includes(token), token);
  } else {
    assert(body.slice(0, 650).includes('1상'));
    for (const token of ['11명', '52주', '41.8', '30.1', '13.9', '0.5', '중대한 이상사건', '치주염', 'Belief BioMed', '구독 제한']) assert(body.includes(token), token);
  }
  console.log(`news17: PASS ${slug}: ${length} prose characters; ${Object.values(counts).reduce((a, b) => a + b, 0)} citation links; licensed image`);
}
const benchmark = JSON.parse(read('../site/news-mlperf-20260917.json'));
assert.equal(benchmark.selectedRows.length, 12);
for (const row of benchmark.selectedRows) {
  assert.equal(row.Organization, 'NVIDIA'); assert.equal(row.total_accelerators, '72'); assert.equal(row.has_power, 'False');
  assert.equal(row.Availability, row.Platform.startsWith('VR200') ? 'preview' : 'available');
}
console.log('news-20260917-contract: PASS all three candidates, 7000+ prose without upper ceiling, native citations, licensed background originals, independent Blogger drafts');

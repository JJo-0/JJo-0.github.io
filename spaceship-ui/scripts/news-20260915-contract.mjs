import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const read = (name) => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
const digest = (data) => createHash('sha256').update(data).digest('hex');
const edition = JSON.parse(read('../site/news-edition-20260915.json'));
const media = JSON.parse(read('../site/news-media.json'));
const provenance = JSON.parse(read('../site/assets/assets/posts/news-20260915/provenance.json'));
const expected = [
  ['2026-09-15-mspa-fpba-nanopore-news', 'nanopore', 2024, 'frontier-one'],
  ['2026-09-15-apoe-stratified-alzheimer-news', 'apoe', 2022, 'frontier-candidate'],
  ['2026-09-15-mos2-snn-in-logic-news', 'mos2', 2020, 'frontier-candidate'],
];
function proseCount(body) {
  const prose = body.split('## 9.')[0]
    .replace(/^import .*;\s*$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\d+(?:,\d+)*\]/g, '')
    .replace(/[*#|`>]+/g, '')
    .replace(/\s+/g, ' ').trim();
  return [...prose].length;
}
assert.equal(edition.edition, '2026-09-15');
assert.deepEqual(edition.entries.map((e) => e.slug), expected.map(([slug]) => slug));
assert.equal(provenance.length, 6, 'Six background originals must be preserved');
assert.equal(new Set(provenance.map((r) => r.src)).size, 6);
for (const [index, [slug, key, year, selection]] of expected.entries()) {
  const entry = edition.entries[index];
  const post = read(`../site/content/posts/${slug}.mdx`);
  const fm = post.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(fm, `${slug}: frontmatter missing`);
  assert.match(fm[1], /^draft: false$/m);
  assert.match(fm[1], /^lang: ko$/m);
  assert.match(fm[1], /^pubDate: 2026-09-15$/m);
  assert.match(fm[1], new RegExp(`^slug: ${slug}$`, 'm'));
  assert(fm[1].includes(`  - ${selection}\n`));
  assert(!fm[1].includes(selection === 'frontier-one' ? 'frontier-candidate' : 'frontier-one'));
  assert(post.includes("import NewsFigure from '@/components/post/NewsFigure.astro';"));
  assert.equal(digest(post), entry.postSha256, `${slug}: content digest changed; review before updating manifest`);
  const ids = [1, 2].map((n) => `sep15-${key}-background-${n}`);
  assert.deepEqual(entry.mediaIds, ids);
  const body = post.slice(fm[0].length).replace(/^import .*;\s*$/gm, '').trim();
  assert(body.startsWith(`<NewsFigure media="${ids[0]}" priority />`), `${slug}: representative image must be first`);
  assert.deepEqual([...body.matchAll(/<NewsFigure\b[^>]*media="([^"]+)"/g)].map((m) => m[1]), ids);
  assert(body.slice(0, 500).includes(`${year}년`) && body.slice(0, 500).includes('원본'), `${slug}: visible historical-source boundary missing`);
  const length = proseCount(body);
  assert(length >= 7000 && length <= 10000, `${slug}: ${length} prose characters outside user range`);
  assert.equal(length, entry.bodyCharacters);
  assert(body.includes(entry.source), `${slug}: target paper URL missing`);
  const catalogueIds = Object.entries(media).filter(([, row]) => row.slug === slug).map(([id]) => id);
  assert.deepEqual(catalogueIds, ids, `${slug}: archive cover and article figure order differ`);
  assert.equal(media[ids[0]].order, index + 1);
  for (const [i, id] of ids.entries()) {
    const item = media[id];
    const record = provenance.find((r) => r.id === `${key}-background-fig${i + 1}`);
    assert(record, `${id}: no provenance`);
    assert.equal(record.role, 'related-primary-research-background-not-2026-result');
    assert.equal(item.license, 'CC BY 4.0');
    assert.equal(item.rights, 'https://creativecommons.org/licenses/by/4.0/');
    assert(item.kind.includes(`${year}년 배경자료`), `${id}: archive must show date/role as well as prose`);
    assert(item.src.startsWith('/assets/posts/news-20260915/') && !item.src.includes('..'));
    for (const field of ['src', 'width', 'height', 'credit', 'source', 'license', 'rights', 'sha256'])
      assert.equal(item[field], record[field], `${id}: ${field} differs from source receipt`);
    for (const field of ['alt', 'kind', 'caption', 'credit', 'source', 'license', 'rights', 'changes'])
      assert(typeof item[field] === 'string' && item[field].trim(), `${id}: empty ${field}`);
    const bytes = fs.readFileSync(new URL(`../site/assets${item.src}`, import.meta.url));
    assert.equal(digest(bytes), record.sha256, `${id}: image bytes changed`);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  }
  const blogger = read(`../ops/blog-harness/blogger/2026-09-15/${key}.html`);
  assert.equal(digest(blogger), entry.bloggerSha256);
  const sources = [...blogger.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(sources, ids.map((id) => `https://jjo-0.github.io${media[id].src}`));
  assert(blogger.includes('공식 자료') && blogger.includes(entry.source));
  assert(blogger.includes(`https://jjo-0.github.io/posts/${slug}/`));
  assert.doesNotMatch(blogger, /<script\b|<form\b|\son\w+\s*=/i);
  assert(entry.bloggerProseCharacters >= 1500 && entry.bloggerProseCharacters <= 2500);
}
assert.equal(edition.reserve[0].sourceDate, '2026-09-11');
assert.equal(edition.reserve[0].status, 'reserve-in-top1-section8');
assert.equal(edition.reserve[0].source, "https://www.fda.gov/drugs/novel-drug-approvals-fda/novel-drug-approvals-2026");
// 2026-09-16: official title/body/address identified via web reading;
// the fresh GitHub GET still hits abuse detection. Preserve that limitation.
const nanoporeCitationSource = read('../site/content/posts/2026-09-15-mspa-fpba-nanopore-news.mdx');
assert(nanoporeCitationSource.includes('https://www.fda.gov/drugs/news-events-human-drugs/fda-approves-first-therapy-target-muscle-loss-spinal-muscular-atrophy'));
assert(nanoporeCitationSource.includes('GitHub 자동접속 환경에서는 여전히 차단 안내 뒤 404'));
assert(nanoporeCitationSource.includes('공식 출처의 식별과 모든 환경에서의 접근 성공은 별개의 확인 사항'));
assert(read('../site/content/posts/2026-09-15-mspa-fpba-nanopore-news.mdx').includes('Isembyld'));
assert.match(read('../site/content/posts/2026-09-15-apoe-stratified-alzheimer-news.mdx'), /상호작용 P값은 1\.62×10⁻⁶/);
assert.match(read('../site/content/posts/2026-09-15-mos2-snn-in-logic-news.mdx'), /저자에게 요청하면 제공/);
console.log('news-20260915-contract: PASS 3 image-first Korean explainers, 7,000–10,000 prose characters, 6 licensed originals explicitly labeled historical background, 3 Blogger payloads, FDA reserve');

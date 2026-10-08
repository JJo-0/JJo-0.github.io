import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import katex from 'katex';

const root = new URL('../', import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, root), 'utf8');
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const edition = JSON.parse(read('site/news-edition-20260923.json'));
const reading = JSON.parse(read('site/news-reading-20260923.json'));
const media = JSON.parse(read('site/news-media.json'));
const provenance = JSON.parse(read('site/assets/assets/posts/news-20260923/provenance.json'));

const bodyText = (source) =>
  source
    .split('---')
    .slice(2)
    .join('---')
    .split(/^## 9\./m)[0]
    .replace(/^import .*?;\s*/gm, '')
    .replace(/<Math\b[\s\S]*?\/>/g, '')
    .replace(/<CandidateEquation\b[^\n]+>/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[\d+\]/g, '')
    .replace(/[*#|`>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

assert.equal(edition.date, '2026-09-23');
assert.deepEqual(
  edition.entries.map((e) => e.key),
  ['dac', 'mram', 'herbot']
);
assert.deepEqual(
  edition.entries.map((e) => e.order),
  [1, 2, 3]
);

for (const entry of edition.entries) {
  const source = read(`site/content/posts/${entry.slug}.mdx`);
  assert.equal(hash(source), entry.sha256, `${entry.key}: source identity`);
  assert(source.includes('publicationTimeZone: Asia/Seoul') && source.includes('draft: false'));
  assert.deepEqual(
    [...source.matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1])),
    [1, 2, 3, 4, 5, 6, 7, 8, 9]
  );
  const body = bodyText(source);
  assert.equal(body.length, entry.bodyCharacters);
  assert(body.length >= 8000, `${entry.key}: explainer is too short: ${body.length}`);
  const figures = [...source.matchAll(/<NewsFigure media="([^"]+)"/g)].map((m) => m[1]);
  const equations = [
    ...source.matchAll(/<CandidateEquation id="([^"]+)"[^\n]*tex=\{String\.raw`([^`]+)`\}>/g),
  ];
  const tables = [...source.matchAll(/<CandidateTable id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(figures, entry.mediaIds);
  assert.deepEqual(
    equations.map((m) => m[1]),
    entry.equations
  );
  assert.deepEqual(tables, entry.tableIds);
  for (const [, , tex] of equations)
    katex.renderToString(tex, {
      displayMode: true,
      throwOnError: true,
      strict: 'error',
      trust: false,
    });
  for (const id of entry.mediaIds)
    assert(media[id]?.kind.startsWith('원문 Figure'), `${id}: original figure required`);
}

assert.equal(provenance.length, 12);
assert.deepEqual(
  provenance.map((p) => p.id),
  edition.entries.flatMap((e) => e.mediaIds)
);
for (const p of provenance) {
  const item = media[p.id];
  assert(item && item.src === p.src && item.sha256 === p.sha256);
  assert(p.sourceByteIdentical && p.modificationAllowed === false);
  assert.equal(p.visualReview.status, 'REVIEWED');
  assert.equal(p.visualReview.imageSha256, p.sha256);
  const bytes = fs.readFileSync(new URL(`site/assets${p.src}`, root));
  assert.equal(bytes.length, p.bytes);
  assert.equal(hash(bytes), p.sha256);
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  assert.equal(bytes.readUInt32BE(16), p.width);
  assert.equal(bytes.readUInt32BE(20), p.height);
}

assert.equal(reading.engineeringDepthStatus, 'READY');
assert.equal(reading.visualPlan.length, 4);
assert.deepEqual(
  reading.visualPlan.map((v) => v.id),
  edition.entries[0].mediaIds
);
assert.equal(reading.candidatePackages.length, 2);
for (const pack of reading.candidatePackages) {
  assert.equal(pack.engineeringDepthStatus, 'READY');
  assert.equal(pack.equationCards.length, 3);
  assert.equal(pack.visualPlan.length, 4);
  assert(pack.sourceLocators.length >= 4);
}

const sources = Object.fromEntries(
  edition.entries.map((e) => [e.key, read(`site/content/posts/${e.slug}.mdx`)])
);
for (const phrase of [
  '5,000시간은 작은 셀의 결과이고 48시간은 큰 스택의 결과',
  '송풍기와 최종 압축까지 포함한 전체 플랜트 에너지가 아니다',
  '현재 장치의 영수증이 아니라 techno-economic analysis',
])
  assert(sources.dac.includes(phrase), `dac: missing boundary ${phrase}`);
for (const phrase of [
  '현재 실증 시스템의 한 iteration은 45 ns',
  '향후 ASIC 통합을 가정한 전망',
  'hybrid system',
])
  assert(sources.mram.includes(phrase), `mram: missing boundary ${phrase}`);
for (const phrase of [
  'durvalumab이 아니라',
  '단일군',
  'grade 3 이상 treatment-related adverse events',
])
  assert(sources.herbot.includes(phrase), `herbot: missing boundary ${phrase}`);

let rendered = false;
if (fs.existsSync(new URL('dist/index.html', root))) {
  rendered = true;
  const list = read('dist/news/index.html');
  for (const entry of edition.entries) {
    const html = read(`dist/posts/${entry.slug}/index.html`);
    assert(!html.includes('katex-error'));
    assert.deepEqual(
      [...html.matchAll(/data-news-figure="([^"]+)"/g)].map((m) => m[1]),
      entry.mediaIds
    );
    assert.deepEqual(
      [...html.matchAll(/data-candidate-equation="([^"]+)"/g)].map((m) => m[1]),
      entry.equations
    );
    assert(list.includes(`data-news-card="${entry.slug}"`));
  }
}

console.log(
  `sep23-contract: PASS ${edition.entries.length} articles, ${provenance.length} unmodified original figures, 9 equation lessons; rendered=${rendered}`
);

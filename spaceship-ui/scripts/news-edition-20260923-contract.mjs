import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import katex from 'katex';

const root = new URL('../', import.meta.url);
const read = rel => fs.readFileSync(new URL(rel, root), 'utf8');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const edition = JSON.parse(read('site/news-edition-20260923.json'));
const reading = JSON.parse(read('site/news-reading-20260923.json'));
const media = JSON.parse(read('site/news-media.json'));
const provenance = JSON.parse(read('site/assets/assets/posts/news-20260923/provenance.json'));
const entry = edition.entries[0];
const source = read(`site/content/posts/${entry.slug}.mdx`);

assert.equal(edition.date, '2026-09-23');
assert.equal(entry.slug, '2026-09-23-nioh2-electrochemical-dac-news');
assert.equal(hash(source), entry.sha256, 'published source identity');
assert(source.includes('publicationTimeZone: Asia/Seoul') && source.includes('draft: false'));
assert.deepEqual([...source.matchAll(/^## (\d+)\./gm)].map(match => Number(match[1])), [1,2,3,4,5,6,7,8,9]);

const body = source.split('---').slice(2).join('---').split(/^## 9\./m)[0]
  .replace(/^import .*?;\s*/gm, '').replace(/<Math\b[\s\S]*?\/>/g, '')
  .replace(/<CandidateEquation\b[^\n]+>/g, '').replace(/<[^>]*>/g, ' ')
  .replace(/\[\d+\]/g, '').replace(/[*#|`>]+/g, '').replace(/\s+/g, ' ').trim();
assert.equal(body.length, entry.bodyCharacters);
assert(body.length >= 7000, `engineering explainer is too short: ${body.length}`);

const figures = [...source.matchAll(/<NewsFigure media="([^"]+)"/g)].map(match => match[1]);
const equations = [...source.matchAll(/<CandidateEquation id="([^"]+)"[^\n]*tex=\{String\.raw`([^`]+)`\}>/g)];
const tables = [...source.matchAll(/<CandidateTable id="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(figures, entry.mediaIds);
assert.deepEqual(equations.map(match => match[1]), entry.equations);
assert.deepEqual(tables, entry.tableIds);
for (const [, id, tex] of equations) {
  katex.renderToString(tex, { displayMode: true, throwOnError: true, strict: 'error', trust: false });
  assert(reading.equationCards.some(card => card.id === id && card.sourceLocator && card.assumptions.length));
}

assert.equal(provenance.length, 4);
for (const record of provenance) {
  const item = media[record.id];
  assert(item, `${record.id}: missing media catalogue entry`);
  assert.equal(item.src, record.src);
  assert.equal(item.sha256, record.sha256);
  assert.equal(item.license, '자체 제작 · MIT');
  const bytes = fs.readFileSync(new URL(`site/assets${item.src}`, root));
  assert.equal(hash(bytes), record.sha256, `${record.id}: binary identity`);
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
}

assert.equal(reading.engineeringDepthStatus, 'READY');
assert.equal(reading.equationCards.length, 3);
assert(reading.baselineMethods.length >= 3);
assert(reading.graphNodes.length >= 10 && reading.graphEdges.length >= 6);
assert.equal(reading.visualPlan.length, 4);
assert(reading.sourceLocators.some(locator => locator.includes('p.6')));
assert(reading.sourceLocators.some(locator => locator.includes('p.8')));
assert(reading.sourceLocators.some(locator => locator.includes('p.22')));

for (const phrase of [
  '5,000시간은 작은 셀의 결과이고 48시간은 큰 스택의 결과',
  '송풍기와 최종 압축까지 포함한 전체 플랜트 에너지가 아니다',
  '현재 장치의 영수증이 아니라 techno-economic analysis',
]) assert(source.includes(phrase), `missing evidence boundary: ${phrase}`);

let rendered = false;
if (fs.existsSync(new URL('dist/index.html', root))) {
  rendered = true;
  const html = read(`dist/posts/${entry.slug}/index.html`);
  assert(!html.includes('katex-error'));
  assert.deepEqual([...html.matchAll(/data-news-figure="([^"]+)"/g)].map(match => match[1]), entry.mediaIds);
  assert.deepEqual([...html.matchAll(/data-candidate-equation="([^"]+)"/g)].map(match => match[1]), entry.equations);
  assert(html.includes('2026-09-22T15:00:00.000Z'));
}

console.log(`sep23-contract: PASS 1 article, ${figures.length} original visuals, ${equations.length} equation lessons; rendered=${rendered}`);

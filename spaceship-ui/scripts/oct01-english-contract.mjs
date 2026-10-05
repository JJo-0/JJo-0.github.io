import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const digest = (s) => createHash('sha256').update(s).digest('hex');
const edition = JSON.parse(read('site/news-edition-20261001.json'));
const manifest = JSON.parse(read('site/english-edition.json'));
const media = JSON.parse(read('site/news-media.json'));
const existingCaptions = JSON.parse(read('site/news-media-en.json'));
const captions = JSON.parse(read('site/news-media-en-20261001.json'));
const pinnedKorean = {
  synthidbio: 'd313321ae24cd06e699a926f1c300ef11c3dcabf1bb09658c458d994bcfcce58',
  bcn: 'e33d9160d008bbd9ac5d6d3d1338ba335ac6f8e372ee5cc4134e747cf3c05268',
  ataraxos: '2459f50e558397425f23437ca07a86d9de3eb1099548c81dead9a21fc8f3890d',
};
function contentContract(ko, en) {
  for (const level of ['##', '###']) {
    const pattern = new RegExp(`^${level} `, 'gm');
    assert.equal((en.match(pattern) || []).length, (ko.match(pattern) || []).length, 'heading coverage');
  }
  const formulas = (s) => [...s.matchAll(/tex=\{String\.raw`([^`]+)`\}/g)].map(m => m[1]);
  assert(formulas(ko).length > 0);
  assert.deepEqual(formulas(en), formulas(ko), 'formula identity');
  const figures = (s) => [...s.matchAll(/<NewsFigure media="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(figures(en), figures(ko), 'figure order');
  assert.equal((en.match(/<BeginnerGuide\b/g) || []).length, 1);
  assert.equal((en.match(/<CandidateTable\b/g) || []).length, 1);
  assert.equal((en.match(/^\|/gm) || []).length, (ko.match(/^\|/gm) || []).length, 'table row coverage');
  assert(!/[가-힣]/.test(en), 'English prose must not retain untranslated Korean');
  for (const component of ['NewsFigure', 'CandidateEquation', 'BeginnerGuide']) {
    const tags = en.match(new RegExp(`<${component}\\b[^>]*>`, 'g')) || [];
    assert(tags.length > 0 && tags.every(tag => tag.includes('lang="en"')), `${component}: English UI`);
  }
  assert.equal(en.match(/^pubDate: (.+)$/m)?.[1], ko.match(/^pubDate: (.+)$/m)?.[1], 'original edition timestamp');
  assert.match(en, /^updatedDate: 2026-10-05T00:00:00\+09:00$/m);
}
function captionContract(value) {
  for (const field of ['alt', 'kind', 'caption', 'changes']) assert(typeof value[field] === 'string' && value[field].length > 12);
  assert(!/[가-힣]/.test(JSON.stringify(value)), 'English image metadata');
}
function geometryContract(original, translated) {
  const shapes = (s) => s.match(/<(?:path|circle|rect)\b[^>]*\/>/g) || [];
  assert(shapes(original).length > 0);
  assert.deepEqual(shapes(translated), shapes(original), 'educational diagram geometry');
  assert(translated.includes('viewBox="0 0 960 540"'));
  assert(!/[가-힣]/.test(translated));
}
const rows = [];
for (const entry of edition.entries) {
  const pair = manifest.pairs.find(p => p.koSlug === entry.slug);
  assert(pair, `Missing translation: ${entry.key}`);
  const ko = read(`site/content/posts/${pair.koFile}`);
  const en = read(`site/content/english/${pair.enFile}`);
  assert.equal(digest(ko), pinnedKorean[entry.key], 'existing Korean article is unchanged');
  assert.equal(digest(ko), pair.sourceSha256);
  assert.equal(digest(en), pair.englishSha256);
  contentContract(ko, en);
  for (const id of entry.mediaIds) {
    assert(!Object.hasOwn(existingCaptions, id), 'extension keys must be disjoint');
    captionContract(captions[id]);
    const original = fs.readFileSync(new URL(`../site/assets${media[id].src}`, import.meta.url));
    assert.equal(digest(original), media[id].sha256, 'registered original image bytes');
  }
  rows.push({ key: entry.key, english: pair.enSlug, sourcePreserved: true, completeSections: true, formulaPreserved: true, figures: entry.mediaIds.length });
}
assert.equal(rows.length, 3);
assert.equal(Object.keys(captions).length, 6);
const koSvg = read('site/assets/assets/posts/news-20261001/bcn-structure-primer.svg');
const enSvg = read('site/assets/assets/posts/news-20261001/bcn-structure-primer-en.svg');
geometryContract(koSvg, enSvg);
assert.equal(digest(enSvg), captions['oct01-bcn-primer'].sha256);
assert(captions['oct01-bcn-wafer-photo'].caption.includes('not evidence'));
const example = manifest.pairs.find(p => p.key === 'frontier-synthidbio-20261001');
const koExample = read(`site/content/posts/${example.koFile}`);
const enExample = read(`site/content/english/${example.enFile}`);
assert.throws(() => contentContract(koExample, enExample.replace('K_D=', 'K_X=')), /formula identity/);
assert.throws(() => captionContract({ ...captions['oct01-synthid-fig1'], caption: '번역되지 않은 설명이 여기에 있습니다.' }), /English image metadata/);
assert.throws(() => geometryContract(koSvg, enSvg.replace('width="960" height="540"', 'width="961" height="540"')), /diagram geometry/);
fs.mkdirSync('english-review/oct01-update', { recursive: true });
fs.writeFileSync('english-review/oct01-update/source.json', JSON.stringify({ rows, originalImagesPreserved: 6, englishCaptions: 6, rejectedMutations: 3 }, null, 2));
console.log('oct01-english-contract: PASS three complete translations, six preserved originals, localized UI/diagram and three rejected mutations');

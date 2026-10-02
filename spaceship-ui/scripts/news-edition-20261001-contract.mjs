import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const edition = JSON.parse(read('site/news-edition-20261001.json'));
const provenance = JSON.parse(read('site/news-media-provenance-20261001.json'));
const media = JSON.parse(read('site/news-media.json'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

assert.equal(edition.date, '2026-10-01');
assert.deepEqual(edition.entries.map((row) => row.order), [1, 2, 3]);
assert.deepEqual(edition.entries.map((row) => row.key), ['synthidbio', 'bcn', 'ataraxos']);
assert.equal(provenance.assets.length, 6);
assert(provenance.rightsEvidence.some((row) => row.doi === edition.entries[1].doi && row.status === 'ORIGINAL_REUSE_NOT_AUTHORIZED'));

for (const entry of edition.entries) {
  const source = read(`site/content/posts/${entry.slug}.mdx`);
  assert.match(source, /^draft: false$/m, `${entry.key}: published`);
  assert.match(source, /^pubDate: 2026-10-01T00:0[0-2]:00\+09:00$/m);
  assert(source.includes('먼저 쉬운 답부터'), `${entry.key}: beginner opening`);
  assert(source.includes('<BeginnerGuide'), `${entry.key}: beginner layer`);
  assert(source.includes('<CandidateEquation'), `${entry.key}: formula and worked example`);
  assert(source.includes('<CandidateTable'), `${entry.key}: evidence boundary`);
  assert(source.includes(entry.doi), `${entry.key}: primary DOI`);
  const ids = Object.keys(media).filter((id) => media[id].slug === entry.slug);
  assert.deepEqual(ids, entry.mediaIds, `${entry.key}: article/card media ordering`);
  for (const id of ids) {
    assert(source.includes(`<NewsFigure media="${id}"`), `${id}: figure used in article`);
  }
  assert(source.includes(`<NewsFigure media="${entry.mediaIds[0]}" priority />`), `${entry.key}: first figure visible`);
}

for (const asset of provenance.assets) {
  const item = media[asset.id];
  assert(item, `${asset.id}: catalogue entry`);
  const bytes = fs.readFileSync(new URL(`../site/assets${item.src}`, import.meta.url));
  assert.equal(hash(bytes), asset.sha256, `${asset.id}: asset digest`);
  assert.equal(item.sha256, asset.sha256, `${asset.id}: catalogue digest`);
  assert(item.alt.length >= 20 && item.caption.length >= 30);
  assert(item.credit && item.source && item.rights && item.license && item.changes);
  assert.equal(item.checkedAt, '2026-10-01');
}

const bcn = read(`site/content/posts/${edition.entries[1].slug}.mdx`);
assert(bcn.includes('BCN 연구의 웨이퍼·현미경 사진이 절대 아니다'));
assert(bcn.includes('권리 미확인 그림을 복제하지 않는다'));
assert(!provenance.assets.some((row) => media[row.id].originalUrl?.includes('11047_Fig')));
const synthid = read(`site/content/posts/${edition.entries[0].slug}.mdx`);
assert(synthid.includes('선별된 디자인'));
assert(synthid.includes('실제 합성할 수 있는 아미노산 배열'));
const ataraxos = read(`site/content/posts/${edition.entries[2].slug}.mdx`);
assert(ataraxos.includes('모델의 전망값'));
assert(ataraxos.includes('한 명'));

console.log('news-edition-20261001-contract: PASS three articles, six rights-tracked images and evidence boundaries');

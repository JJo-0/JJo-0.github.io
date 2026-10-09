import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root));
const edition = JSON.parse(read('site/news-edition-20260930-completion.json'));
const provenance = JSON.parse(read('site/news-media-provenance-20260930-completion.json'));
const catalogue = JSON.parse(read('site/news-media.json'));
assert.equal(edition.date, '2026-09-30');
assert.deepEqual(edition.entries.map((row) => row.key), ['rbn', 'perovskite', 'wrn']);
assert.equal(provenance.publisherFigures.length, 2);
assert(provenance.publisherFigures.every((row) => row.decision.includes('do not copy')));

for (const row of edition.entries) {
  const source = read(`site/content/posts/${row.slug}.mdx`).toString();
  assert(source.includes('pubDate: 2026-09-30T00:0'), row.slug);
  assert(source.includes('draft: false'), row.slug);
  assert(source.includes('frontier-'), row.slug);
  assert(source.includes(row.primarySource), row.slug);
  assert.deepEqual(
    [...source.matchAll(/<NewsFigure media="([^"]+)"/g)].map((match) => match[1]),
    row.mediaIds,
    `${row.slug}: figure order`
  );
  for (const id of row.mediaIds) assert.equal(catalogue[id].slug, row.slug);
  if (row.key !== 'wrn') {
    assert(source.includes('data-news-reference="1"'));
    assert(source.includes('<CandidateEquation'));
    assert((source.includes('이번 논문') || source.includes('이번 연구')) && source.includes('아니다'));
    assert(!source.includes('media.springernature.com'));
  }
}

for (const row of provenance.assets) {
  const item = catalogue[row.id];
  assert(item && item.checkedAt === '2026-10-02', row.id);
  assert(item.alt.length >= 20 && item.caption.length >= 20, row.id);
  assert(item.source && item.rights && item.license, row.id);
  const file = read(`site/assets${item.src}`);
  const digest = crypto.createHash('sha256').update(file).digest('hex');
  assert.equal(digest, row.sha256, row.id);
  assert.equal(item.sha256, digest, row.id);
  assert(fs.statSync(new URL(`site/assets${item.src}`, root)).isFile());
  if (path.extname(item.src) === '.svg') {
    assert(file.toString().includes('<title'), row.id);
    assert(file.toString().includes('<desc'), row.id);
  }
}

const builtNews = new URL('dist/news/index.html', root);
if (fs.existsSync(builtNews)) {
  const listing = fs.readFileSync(builtNews, 'utf8');
  const dateSection = listing.split('data-news-date="2026-09-30"')[1]?.split('data-news-date="2026-09-29"')[0];
  assert(dateSection, 'September 30 section missing');
  const cards = [...dateSection.matchAll(/data-news-card="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(cards, edition.entries.map((row) => row.slug));
  for (const row of edition.entries) {
    const html = read(`dist/posts/${row.slug}/index.html`).toString();
    assert(!html.includes('katex-error'), row.slug);
    assert(html.includes('data-news-reference="1"'), row.slug);
    for (const id of row.mediaIds) assert(html.includes(`data-news-figure="${id}"`), id);
  }
}
console.log('news-edition-20260930-completion-contract: PASS three dated articles and licensed-or-original media');

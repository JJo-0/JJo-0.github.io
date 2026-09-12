import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const release = JSON.parse(read('../site/news-sep11-release.json'));
const media = JSON.parse(read('../site/news-media.json'));
const expected = [
  ['2026-09-11-embryo-base-editing-news', ['embryo-study-photo', 'embryo-repair-source']],
  ['2026-09-11-high-na-large-mask-news', ['high-na-2024-source']],
  ['2026-09-11-sulfide-electrolyte-film-news', ['sulfide-film-fig2', 'sulfide-cycle-fig5']],
];
assert.deepEqual(release.entries.map((row) => [row.slug, row.mediaIds]), expected);
for (const row of release.entries) {
  const source = read(`../site/content/posts/${row.slug}.mdx`);
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(fm);
  assert.match(fm[1], /^draft: false$/m);
  assert.match(fm[1], /^pubDate: 2026-09-11$/m);
  assert.match(fm[1], /^updatedDate: 2026-09-12$/m);
  const body = source.slice(fm[0].length);
  assert.doesNotMatch(body, /초안|\{\/\*/);
  assert.match(body.slice(0, 950), /임상시험이 아니다|양산 완료 발표가 아니다|주행시험 결과가 아니다/);
  const figures = [...body.matchAll(/<NewsFigure media="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(figures, row.mediaIds, 'Original figures must remain intact and in order');
  assert(body.indexOf(`<NewsFigure media="${row.mediaIds[0]}" priority />`) < body.indexOf('## 1.'));
  assert.equal(Object.entries(media).find(([, item]) => item.slug === row.slug)[0], row.mediaIds[0]);
  const prose = body.split('## 9. 출처')[0].replace(/^import .*;\s*$/gm, '')
    .replace(/<[^>]+>/g, '').replace(/\[\d+\]/g, '').replace(/^#{1,6}\s*/gm, '').trim();
  assert(prose.length >= 7000 && prose.length <= 10000);
  assert.equal(prose.length, row.bodyCharacters);
}
console.log('sep11-release-contract: PASS three published original-figure articles, 7,000–10,000 characters and evidence boundaries');

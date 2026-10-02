import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import katex from 'katex';
import { assertNewsProseLength } from './news-prose-policy.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex');
const edition = JSON.parse(read('site/news-edition-20260929.json'));
const provenance = JSON.parse(read('site/news-media-provenance-20260929.json'));
const media = JSON.parse(read('site/news-media.json'));
const handoff = JSON.parse(read('ops/blog-harness/research/2026-09-29-agent.handoff.json'));
assert.equal(edition.date, '2026-09-29');
assert.equal(edition.entries.length, 3);
assert.deepEqual(
  edition.entries.map((item) => item.key),
  ['agent', 'lc1', 'silicon-battery']
);
const entry = edition.entries.find((item) => item.key === 'agent');
assert(entry);
const source = read(`site/content/posts/${entry.slug}.mdx`);
assert.equal(hash(source), entry.sha256);
assert(entry.bodyCharacters >= 8000);
assert.match(source, /^draft: false$/m);
assert.match(source, /^pubDate: 2026-09-29T00:00:00\+09:00$/m);
assert.match(source, /^category: ai-machine-learning$/m);
assert.deepEqual(
  [...source.matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1])),
  [1, 2, 3, 4, 5, 6, 7, 8, 9]
);
assert.equal(provenance.assets.length, 4);
for (const asset of provenance.assets) {
  const item = media[asset.id];
  const bytes = fs.readFileSync(new URL(`site/assets${item.src}`, root));
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  assert.equal(hash(bytes), asset.sha256);
  assert.equal(hash(bytes), item.sha256);
  assert.equal(bytes.readUInt32BE(16), item.width);
  assert.equal(bytes.readUInt32BE(20), item.height);
  assert.equal(item.rightsStatus, 'LICENSE_CHECKED');
  assert(item.commercialUse && item.modificationAllowed);
  assert(item.license.startsWith('CC BY 4.0'));
  assert(item.source.includes('bioRxiv') || item.source.includes('biorxiv.org'));
  assert(item.alt.length >= 20 && item.caption.length >= 30);
}
const equations = [
  ...source.matchAll(/<CandidateEquation id="([^"]+)"[^\n]*tex=\{String\.raw`([^`]+)`\}>/g),
];
assert.deepEqual(
  equations.map((m) => m[1]),
  entry.equations
);
for (const [, , tex] of equations)
  katex.renderToString(tex, {
    displayMode: true,
    throwOnError: true,
    strict: 'error',
    trust: false,
  });
assert.equal(equations.length, 3);
for (const id of entry.tableIds) {
  const table = source.match(
    new RegExp(`<CandidateTable id="${id}"[^>]*>([\\s\\S]*?)</CandidateTable>`)
  );
  assert(
    table && /<table>/.test(table[1]) && /<\/table>/.test(table[1]),
    `missing semantic table ${id}`
  );
}
for (const [number, count] of Object.entries(entry.citationCounts)) {
  assert.equal(
    [...source.matchAll(new RegExp(`<Cite n=\\{${number}\\}\\s*\\/>`, 'g'))].length,
    count
  );
  assert.equal([...source.matchAll(new RegExp(`id="news-ref-${number}"`, 'g'))].length, 1);
}
assert.equal((source.match(/data-news-reference=/g) || []).length, 5);
assert(!source.includes('chatgpt-content-reference') && !source.includes('utm_source='));
for (const value of [
  's41587-026-03331-w',
  '2026.09.17.752370',
  '37°C',
  '48',
  '실온',
  '발광',
  '인간',
  'ns',
  'AutoOED',
  '가상',
])
  assert(source.includes(value), `missing evidence boundary ${value}`);
for (const key of [
  'equationCards',
  'baselineMethods',
  'graphNodes',
  'graphEdges',
  'visualPlan',
  'sourceLocators',
])
  assert(handoff[key]?.length > 0);
assert.equal(handoff.equationCards.length, 3);
for (const item of [...handoff.graphNodes, ...handoff.graphEdges, ...handoff.equationCards])
  assert(item.sourceLocator && item.confidence && item.checkedAt);
const ids = new Set(handoff.graphNodes.map((n) => n.id));
assert.equal(ids.size, handoff.graphNodes.length);
for (const e of handoff.graphEdges) assert(ids.has(e.from) && ids.has(e.to));
const primer = read('src/components/post/AgentVaccinePrimer.astro');
assert(primer.includes(entry.primerSelector));
assert.equal((primer.match(/<section\b/g) || []).length, 3);
assert.equal((primer.match(/<svg\b/g) || []).length, 1);
const blogger = read('ops/blog-harness/blogger/2026-09-29-agent-easy.md');
assert.equal((blogger.match(/<img\b/g) || []).length, 3);
assert(blogger.includes('data-blogger-equation="agent-activity"'));
assert(!/\\(?:frac|begin|end|sum)|\$\$/.test(blogger));
let rendered = false;
if (fs.existsSync(new URL(`dist/posts/${entry.slug}/index.html`, root))) {
  rendered = true;
  const html = read(`dist/posts/${entry.slug}/index.html`);
  assert(!html.includes('katex-error'));
  assert.equal((html.match(/data-candidate-equation=/g) || []).length, 3);
  assert.equal((html.match(/data-news-reference=/g) || []).length, 5);
  assert(html.includes(entry.primerSelector));
  for (const id of entry.tableIds)
    assert(new RegExp(`data-candidate-table="${id}"[^>]*><table>`).test(html));
  for (const id of entry.mediaIds) assert(html.includes(`data-news-figure="${id}"`));
  assert(read('dist/news/index.html').includes(`data-news-card="${entry.slug}"`));
}
fs.mkdirSync(new URL('sep29-review/', root), { recursive: true });
fs.writeFileSync(
  new URL('sep29-review/static.json', root),
  JSON.stringify(
    { entry, rendered, images: 4, equations: 3, rights: 'CC BY 4.0 author preprint' },
    null,
    2
  )
);
console.log(
  'sep29-contract: PASS',
  entry.bodyCharacters,
  'characters, 4 original figures, 3 equations, handoff and Blogger'
);

const silicon = edition.entries.find((item) => item.key === 'silicon-battery');
assert(silicon);
const siliconSource = read(`site/content/posts/${silicon.slug}.mdx`);
assert.equal(hash(siliconSource), silicon.sha256);
assert(silicon.bodyCharacters >= 8000);
assert.match(siliconSource, /^draft: false$/m);
assert.match(siliconSource, /^pubDate: 2026-09-29T00:00:00\+09:00$/m);
assert.deepEqual(
  [...siliconSource.matchAll(/<CandidateEquation id="([^"]+)/g)].map((match) => match[1]),
  silicon.equations
);
assert.deepEqual(
  [...siliconSource.matchAll(/<NewsFigure media="([^"]+)/g)].map((match) => match[1]),
  silicon.mediaIds
);
for (const id of silicon.mediaIds) {
  assert.equal(
    media[id].rightsStatus,
    id === 'sep29-silicon-background' ? 'LICENSE_CHECKED' : 'SELF_CREATED'
  );
  assert(media[id].alt.length >= 20 && media[id].caption.length >= 30);
}
assert(siliconSource.includes('5.184 mWh'));
assert(siliconSource.includes('17.25 mg'));
assert(!siliconSource.includes('chatgpt-content-reference'));
const siliconHandoff = JSON.parse(
  read('ops/blog-harness/research/2026-09-29-silicon.handoff.json')
);
for (const key of [
  'equationCards',
  'baselineMethods',
  'graphNodes',
  'graphEdges',
  'visualPlan',
  'sourceLocators',
])
  assert(siliconHandoff[key]?.length > 0, `silicon handoff missing ${key}`);
const siliconBlogger = read('ops/blog-harness/blogger/2026-09-29-silicon-battery-easy.html');
assert.equal((siliconBlogger.match(/<img\b/g) || []).length, 3);
if (fs.existsSync(new URL(`dist/posts/${silicon.slug}/index.html`, root))) {
  const siliconHtml = read(`dist/posts/${silicon.slug}/index.html`);
  assert(!siliconHtml.includes('katex-error'));
  assert(read('dist/news/index.html').includes(`data-news-card="${silicon.slug}"`));
  for (const id of silicon.mediaIds) assert(siliconHtml.includes(`data-news-figure="${id}"`));
}
console.log(
  'sep29-silicon-contract: PASS',
  silicon.bodyCharacters,
  'characters, 3 self-created figures, 3 equations'
);

const completion = JSON.parse(read('site/news-media-provenance-20260929-completion.json'));
assert.equal(completion.assets.length, 4);
for (const asset of completion.assets) {
  const item = media[asset.id];
  assert.equal(item.src, asset.src);
  assert.equal(hash(fs.readFileSync(new URL(`site/assets${item.src}`, root))), asset.sha256);
  assert.equal(item.sha256, asset.sha256);
  assert.equal(item.license, asset.license);
  assert(item.commercialUse && item.modificationAllowed);
  assert(item.alt.length >= 20 && item.caption.length >= 30);
}
assert.match(media['sep29-lc1-background'].license, /CC BY-SA 4.0/);
assert.match(media['sep29-lc1-background'].caption, /LC-1 LNP·mRNA·실제 편집 결과가 아니/);
const lc1 = edition.entries.find((item) => item.key === 'lc1');
assert.equal(lc1.publicationScope, 'PUBLIC_SOURCE_NEWS');
assert.equal(lc1.engineeringDepthStatus, 'FULL_METHODS_REVIEW_PENDING');
const candidatePrimer = read('src/components/post/Sep29CandidatePrimer.astro');
assert.equal((candidatePrimer.match(/<section\b/g) || []).length, 3);
assert.equal((candidatePrimer.match(/<svg\b/g) || []).length, 1);
for (const current of [lc1, silicon]) {
  const mdx = read(`site/content/posts/${current.slug}.mdx`);
  assert.equal(hash(mdx), current.sha256);
  assert(current.bodyCharacters >= 8000);
  const prose = mdx
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^import .*;\n/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/https?:\/\/\S+/g, '');
  assertNewsProseLength(prose.length, current.slug);
  assert.match(mdx, /^draft: false$/m);
  assert.match(mdx, /^pubDate: 2026-09-29T00:00:00\+09:00$/m);
  assert.equal((mdx.match(/<BeginnerGuide\b/g) || []).length, 1);
  assert(candidatePrimer.includes(current.primerSelector));
  const formulas = [
    ...mdx.matchAll(/<CandidateEquation id="([^"]+)"[^\n]*tex=\{String\.raw`([^`]+)`\}>/g),
  ];
  assert.deepEqual(
    formulas.map((match) => match[1]),
    current.equations
  );
  for (const [, , tex] of formulas)
    katex.renderToString(tex, {
      displayMode: true,
      throwOnError: true,
      strict: 'error',
      trust: false,
    });
  assert.deepEqual(
    [...mdx.matchAll(/<NewsFigure media="([^"]+)/g)].map((match) => match[1]),
    current.mediaIds
  );
  for (const [n, count] of Object.entries(current.citationCounts)) {
    assert.equal([...mdx.matchAll(new RegExp(`<Cite n=\\{${n}\\}\\s*\\/>`, 'g'))].length, count);
    assert.equal([...mdx.matchAll(new RegExp(`id="news-ref-${n}"`, 'g'))].length, 1);
  }
  assert.equal((mdx.match(/data-news-reference=/g) || []).length, current.referenceCount);
  for (const id of current.tableIds)
    assert(new RegExp(`<CandidateTable id="${id}"[^>]*>[\\s\\S]*?<table>`).test(mdx));
  if (rendered) {
    const html = read(`dist/posts/${current.slug}/index.html`);
    assert(!html.includes('katex-error'));
    assert.equal((html.match(/data-candidate-equation=/g) || []).length, 3);
    assert(html.includes(current.primerSelector));
    for (const id of current.mediaIds) assert(html.includes(`data-news-figure="${id}"`));
    for (const id of current.tableIds)
      assert(new RegExp(`data-candidate-table="${id}"[^>]*><table>`).test(html));
    assert(read('dist/news/index.html').includes(`data-news-card="${current.slug}"`));
  }
}
const lc1Source = read(`site/content/posts/${lc1.slug}.mdx`);
for (const boundary of [
  'Methods 전체는 구독 제한',
  '79%',
  '48%',
  '27%',
  '정맥',
  '척수강',
  '기관 내',
  '가상 예',
  '일반 교육용 정의',
  '논문의 원시 세포 수가 아니다',
  '사람 치료제',
  'LC-1 LNP 사진도',
])
  assert(lc1Source.includes(boundary), `LC-1 evidence boundary missing: ${boundary}`);
console.log(
  'sep29-trilogy-contract: PASS three authorized NEWS cards; public-source LC-1 limits; rights and hashes; beginner guides; nine equations'
);

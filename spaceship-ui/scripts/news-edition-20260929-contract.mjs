import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import katex from 'katex';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex');
const edition = JSON.parse(read('site/news-edition-20260929.json'));
const provenance = JSON.parse(read('site/news-media-provenance-20260929.json'));
const media = JSON.parse(read('site/news-media.json'));
const handoff = JSON.parse(read('ops/blog-harness/research/2026-09-29-agent.handoff.json'));
assert.equal(edition.date, '2026-09-29');
assert.equal(edition.entries.length, 1);
const entry = edition.entries[0];
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

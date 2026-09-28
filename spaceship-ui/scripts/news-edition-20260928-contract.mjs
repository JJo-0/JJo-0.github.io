import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import katex from 'katex';

const root = new URL('../', import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), 'utf8');
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const edition = JSON.parse(read('site/news-edition-20260928.json'));

const specs = {
  wpt: {
    category: 'finance-industry',
    subcategory: 'wearable-implant-bioelectronics',
    tags: ['frontier-one', 'bioelectronics'],
    primerPath: 'src/components/post/WearableImplantWptPrimer.astro',
    phrases: [
      'coil-to-coil power-transfer efficiency(PTE)',
      '인간 임상시험도, 장기간 체내 사용이 승인된 의료기기도 아니다',
      '30% strain과 30 mm lateral misalignment',
      '0.4 W와 regulated output 24 mW',
      '현재 60 mm와 미래 15 mm',
      'Ansys HFSS electromagnetic simulation',
      '6% 계산은 transmitter input에서 regulated DC output까지',
    ],
    links: ['s41928-026-01714-0', '41928_2026_1714_MOESM1_ESM.pdf', 's41928-026-01715-z'],
  },
  cathode: {
    category: 'finance-industry',
    subcategory: 'high-nickel-cathodes',
    tags: ['frontier-candidate', 'battery-materials'],
    primerPath: 'src/components/post/HighNickelCathodePrimer.astro',
    phrases: [
      'H2–H3 전이를 단순 회피하지 않고',
      '100회차 189.07 mAh/g',
      '약 44.0%',
      '약 92.4%',
      '상용 배터리의 완성이 아니라',
      '편집자 계산',
    ],
    links: [
      's41467-026-78069-9',
      '41467_2026_78069_MOESM1_ESM.pdf',
      '41467_2026_78069_MOESM3_ESM.xlsx',
    ],
  },
  spacey: {
    category: 'ai-machine-learning',
    subcategory: 'explainable-spatial-omics',
    tags: ['frontier-candidate', 'ai-for-science'],
    primerPath: 'src/components/post/SpaCEyPrimer.astro',
    phrases: [
      'predictive feature이지 causal determinant가 아니다',
      'mean AUC는 0.62',
      '720 samples, 357 patients',
      'C-index는 0.720±0.061',
      'patient-separated split',
      '제약사 funding·fees 관련 disclosure',
    ],
    links: [
      's41467-026-77924-z',
      '41467_2026_77924_MOESM1_ESM.pdf',
      'github.com/saezlab/SpaCEy',
      'zenodo.22073069',
    ],
  },
};

const bodyText = (value) =>
  value
    .split('---')
    .slice(2)
    .join('---')
    .replace(/^import .*?;\s*/gm, '')
    .replace(/<Math\b[\s\S]*?\/>/g, '')
    .replace(/<CandidateEquation\b[^\n]+>/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[\d+\]/g, '')
    .replace(/[*#|`>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

assert.equal(edition.date, '2026-09-28');
assert.equal(edition.entries.length, 3);
assert.deepEqual(
  edition.entries.map((entry) => entry.order),
  [1, 2, 3]
);
assert.equal(new Set(edition.entries.map((entry) => entry.slug)).size, 3);

const report = [];
for (const entry of edition.entries) {
  const spec = specs[entry.key];
  assert(spec, `unknown edition entry ${entry.key}`);
  const source = read(`site/content/posts/${entry.slug}.mdx`);
  const primer = read(spec.primerPath);

  assert.equal(entry.evidenceGrade, 'PEER_REVIEWED_FRONTIER');
  assert.equal(hash(source), entry.sha256, `${entry.key} source identity`);
  assert.equal(bodyText(source).length, entry.bodyCharacters, `${entry.key} reader text identity`);
  assert(
    entry.bodyCharacters >= 8_000,
    `${entry.key} reader-first explainer must remain substantial`
  );
  assert.match(source, /^pubDate: 2026-09-28T00:0[0-2]:00\+09:00$/m);
  assert.match(source, /^publicationTimeZone: Asia\/Seoul$/m);
  assert.match(source, new RegExp(`^category: ${spec.category}$`, 'm'));
  assert.match(source, new RegExp(`^subcategory: ${spec.subcategory}$`, 'm'));
  assert.match(source, /^draft: false$/m);
  for (const tag of spec.tags)
    assert(source.includes(`  - ${tag}`), `${entry.key} missing tag ${tag}`);
  assert.deepEqual(
    [...source.matchAll(/^## (\d+)\./gm)].map((match) => Number(match[1])),
    [1, 2, 3, 4, 5, 6, 7, 8, 9]
  );

  const equations = [
    ...source.matchAll(/<CandidateEquation id="([^"]+)"[^\n]*tex=\{String\.raw`([^`]+)`\}>/g),
  ];
  assert.deepEqual(
    equations.map((match) => match[1]),
    entry.equations
  );
  for (const [, , tex] of equations)
    katex.renderToString(tex, {
      displayMode: true,
      throwOnError: true,
      strict: 'error',
      trust: false,
    });
  assert.deepEqual(
    [...source.matchAll(/<CandidateTable id="([^"]+)"/g)].map((match) => match[1]),
    entry.tableIds
  );
  for (const [number, count] of Object.entries(entry.citationCounts)) {
    assert.equal(
      [...source.matchAll(new RegExp(`<Cite n=\\{${number}\\}\\s*\\/>`, 'g'))].length,
      count,
      `${entry.key} citation ${number} count`
    );
    assert.equal(
      [...source.matchAll(new RegExp(`id="news-ref-${number}"`, 'g'))].length,
      1,
      `${entry.key} reference ${number} target`
    );
  }
  assert.equal((source.match(/data-news-reference=/g) ?? []).length, entry.referenceCount);
  for (const phrase of spec.phrases)
    assert(source.includes(phrase), `${entry.key} missing boundary: ${phrase}`);
  for (const link of spec.links)
    assert(source.includes(link), `${entry.key} missing source: ${link}`);
  assert(!source.includes('utm_source='));
  assert(!source.includes('chatgpt-content-reference'));

  assert(primer.includes(entry.primerSelector));
  assert.equal((primer.match(/<section\b/g) ?? []).length, 3);
  assert.equal((primer.match(/<svg\b/g) ?? []).length, 1);
  assert(primer.includes('JJo 자체 제작 입문 도식'));
  assert(primer.includes('외부 원본 이미지 미사용'));
  report.push({ key: entry.key, sourceSha256: entry.sha256, bodyCharacters: entry.bodyCharacters });
}

assert.equal(((189.07 / 196.36) * 100).toFixed(1), '96.3');
assert.equal(((55.13 / 125.2) * 100).toFixed(1), '44.0');
assert.equal(((181.64 / 196.62) * 100).toFixed(1), '92.4');
assert.equal((0.024 / 0.4) * 100, 6);

let rendered = false;
if (fs.existsSync(new URL('dist/index.html', root))) {
  rendered = true;
  const listing = read('dist/news/index.html');
  const positions = [];
  for (const entry of edition.entries) {
    const html = read(`dist/posts/${entry.slug}/index.html`);
    assert(html.includes(entry.primerSelector));
    assert.equal((html.match(/data-candidate-equation=/g) ?? []).length, entry.equations.length);
    assert.equal(
      (html.match(/<div class="candidate-table" data-candidate-table=/g) ?? []).length,
      entry.tableIds.length
    );
    assert.equal(
      (html.match(/data-news-citation=/g) ?? []).length,
      Object.values(entry.citationCounts).reduce((sum, value) => sum + value, 0)
    );
    assert.equal((html.match(/data-news-reference=/g) ?? []).length, entry.referenceCount);
    assert(!html.includes('katex-error'));
    const position = listing.indexOf(`data-news-card="${entry.slug}"`);
    assert(position >= 0, `${entry.key} missing from NEWS`);
    positions.push(position);
  }
  assert(positions[0] < positions[1] && positions[1] < positions[2], 'NEWS ranking order');
}

fs.mkdirSync(new URL('sep28-review/', root), { recursive: true });
fs.writeFileSync(
  new URL('sep28-review/static.json', root),
  JSON.stringify({ passed: true, rendered, entries: report }, null, 2)
);
console.log(`sep28-contract: PASS entries=${edition.entries.length} rendered=${rendered}`);

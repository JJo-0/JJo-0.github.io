import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, root), 'utf8');
const edition = JSON.parse(read('site/news-edition-20260921.json'));
const provenance = JSON.parse(read('site/assets/assets/posts/news-20260921/provenance.json'));
const media = JSON.parse(read('site/news-media.json'));
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const bodyText = (source) => source.split('---', 3).at(-1)
  .replace(/<CandidateEquation\b[\s\S]*?<\/CandidateEquation>/g, (m) => m)
  .replace(/<[^>]+>/g, ' ')
  .replace(/\[\d+\]/g, ' ')
  .replace(/[*#|`]+/g, ' ')
  .replace(/\s+/g, ' ').trim();

assert.equal(edition.date, '2026-09-21');
assert.equal(edition.entries.length, 3);
assert.deepEqual(edition.entries.map((e) => e.order), [1,2,3]);
assert.deepEqual(edition.entries.map((e) => e.taxonomy.tags[0]), ['frontier-one','frontier-candidate','frontier-candidate']);

for (const entry of edition.entries) {
  const source = read(`site/content/posts/${entry.slug}.mdx`);
  assert.equal(sha256(source), entry.sha256, `${entry.slug}: exact authored bytes`);
  assert(source.includes('publicationTimeZone: Asia/Seoul') && source.includes('draft: false'));
  assert.equal((source.match(/^## \d+\./gm) || []).length, 9, `${entry.slug}: nine reader sections`);
  assert(bodyText(source).length >= 7000, `${entry.slug}: long-form body`);
  assert.deepEqual([...source.matchAll(/<NewsFigure media="([^"]+)"/g)].map((m)=>m[1]), entry.mediaIds);
  assert.deepEqual([...source.matchAll(/<CandidateEquation id="([^"]+)"/g)].map((m)=>m[1]), entry.equations);
  assert.deepEqual([...source.matchAll(/<CandidateTable id="([^"]+)"/g)].map((m)=>m[1]), entry.tableIds);
  for (const [n, ref] of Object.entries(entry.references)) {
    assert.equal((source.match(new RegExp(`data-news-citation="${n}"`, 'g')) || []).length, entry.citationCounts[n], `${entry.slug}: citation ${n}`);
    assert(source.includes(`id="news-ref-${n}"`) && source.includes(`href="${ref.url}"`), `${entry.slug}: reference ${n}`);
  }
  assert(!source.includes('수식의 역할과 기호만 확인'), 'No generic equation fallback');
}

const expectedFiles = new Set(edition.entries.flatMap((e)=>e.mediaIds.map((id)=>media[id].src.replace('/assets/posts/','site/assets/assets/posts/'))));
assert.equal(provenance.length, 9);
for (const item of provenance) {
  const mediaItem = media[item.id];
  assert(mediaItem && mediaItem.src === item.src);
  assert(item.sourceByteIdentical && item.visualReview.status === 'REVIEWED');
  assert.equal(item.visualReview.imageSha256, item.sha256);
  assert.equal(mediaItem.width, item.width); assert.equal(mediaItem.height, item.height);
  assert.equal(mediaItem.license, 'CC BY-NC-ND 4.0');
  const file = new URL(`site/assets${item.src}`, root);
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.length, item.bytes, item.id);
  assert.equal(sha256(bytes), item.sha256, item.id);
}
assert.equal(expectedFiles.size, 9);

// Independent arithmetic checks for the explanations.
assert(Math.abs(400/13.40 - 29.8507462687) < 1e-9);
assert.equal(121*601, 72721);
assert(Math.abs(1.240/1.54 - 0.8051948052) < 1e-9);

const msvd = read('site/content/posts/2026-09-21-memristive-svd-news.mdx');
for (const phrase of ['130 nm 1024×128', '32 nm architecture model', 'memristor variation을 포함한 simulation', 'wall-clock training time과 다름']) assert(msvd.includes(phrase), phrase);
const fiber = read('site/content/posts/2026-09-21-single-fiber-hyperspectral-news.mdx');
for (const phrase of ['±60°', '400–700 nm', '72,721', 'simulated라고 README가 명시']) assert(fiber.includes(phrase), phrase);
const erled = read('site/content/posts/2026-09-21-erbium-1540nm-led-news.mdx');
for (const phrase of ['PLQY 47%', 'peak EQE 3.26%', '0.805 eV', '직접 비교하면 안 될까']) assert(erled.includes(phrase), phrase);

const mutationControls = [
  ['MSVD model/measurement boundary', msvd.replace('32 nm architecture model', '130 nm 실칩 직접 계측')],
  ['MSVD LLM simulation boundary', msvd.replace('memristor variation을 포함한 simulation', '130 nm 실칩 end-to-end 실행')],
  ['Fiber demo boundary', fiber.replace('simulated라고 README가 명시', 'experimental raw data라고 README가 명시')],
  ['Er efficiency denominator', erled.replace('주입한 electron', '흡수한 photon')],
];
assert(mutationControls.every(([name, text]) => {
  if (name.startsWith('MSVD model')) return !text.includes('32 nm architecture model');
  if (name.startsWith('MSVD LLM')) return !text.includes('memristor variation을 포함한 simulation');
  if (name.startsWith('Fiber')) return !text.includes('simulated라고 README가 명시');
  return !text.includes('주입한 electron');
}));

if (fs.existsSync(new URL('dist/index.html', root))) {
  const news = read('dist/news/index.html');
  assert(news.includes('data-news-date="2026-09-21"'));
  for (const entry of edition.entries) {
    const html = read(`dist/posts/${entry.slug}/index.html`);
    assert(!html.includes('katex-error') && !html.includes('google-adsense-account') && !html.includes('data-adsense-deferred'));
    assert(html.includes('Sep 21, 2026') && html.includes('2026-09-20T15:00:00.000Z'));
    assert.deepEqual([...html.matchAll(/data-news-figure="([^"]+)"/g)].map((m)=>m[1]), entry.mediaIds);
    assert.deepEqual([...html.matchAll(/data-candidate-equation="([^"]+)"/g)].map((m)=>m[1]), entry.equations);
    assert(news.includes(`data-news-card="${entry.slug}"`));
  }
}

fs.mkdirSync('sep21-review', {recursive:true});
fs.writeFileSync('sep21-review/static.json', JSON.stringify({
  date: edition.date,
  articles: edition.entries.map((e)=>({slug:e.slug, characters:e.bodyCharacters, originals:e.mediaIds.length, equations:e.equations.length})),
  originals: provenance.length,
  arithmetic: {energyRatio:400/13.4, demoGrid:121*601, photonEnergy:1.240/1.54},
  scope: 'Editorial arithmetic, source-boundary and rendering checks; not an independent replication of the scientific experiments.'
}, null, 2));
console.log('sep21: PASS 3 articles, 9 byte-identical originals, numerical/source boundaries and rendered contracts');

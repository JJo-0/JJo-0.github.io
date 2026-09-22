import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import katex from 'katex';

const root = new URL('../', import.meta.url);
const read = rel => fs.readFileSync(new URL(rel, root), 'utf8');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const edition = JSON.parse(read('site/news-edition-20260922.json'));
const media = JSON.parse(read('site/news-media.json'));
const provenance = JSON.parse(read('site/assets/assets/posts/news-20260922/provenance.json'));
const fixture = JSON.parse(read('site/news-reading-20260922.json'));
const bodyText = source => source.split('---').slice(2).join('---').split(/^## 9\. /m)[0]
  .replace(/^import .*?;\s*/gm, '').replace(/<Math\b[\s\S]*?\/>/g, '')
  .replace(/<CandidateEquation\b[^\n]+>/g, '').replace(/<[^>]*>/g, ' ')
  .replace(/\[\d+\]/g, '').replace(/[*#|`>]+/g, '').replace(/\s+/g, ' ').trim();
const lessons = source => [...source.matchAll(/<CandidateEquation id="([^"]+)" title="([^"]+)" tex=\{String\.raw`([^`]+)`\}>\s*([\s\S]*?)<\/CandidateEquation>/g)];
const math = source => [...source.matchAll(/<(?:Math|CandidateEquation)\b[^\n]*?tex=\{String\.raw`([^`]+)`\}/g)].map(m => m[1]);

function validate(entry, source, identity = true) {
  if (identity) assert.equal(hash(source), entry.sha256, `${entry.key}: source identity`);
  assert(source.includes('publicationTimeZone: Asia/Seoul') && source.includes('draft: false'));
  assert(source.includes(`slug: ${entry.slug}`));
  assert.deepEqual([...source.matchAll(/^## (\d+)\./gm)].map(m => Number(m[1])), [1,2,3,4,5,6,7,8,9]);
  const chars = bodyText(source).length;
  assert(chars >= 7000, `${entry.key}: explanatory body ${chars} below 7000`);
  if (identity) assert.equal(chars, entry.bodyCharacters);
  assert.deepEqual([...source.matchAll(/<NewsFigure media="([^"]+)"/g)].map(m => m[1]), entry.mediaIds);
  assert.deepEqual([...source.matchAll(/<CandidateTable id="([^"]+)"/g)].map(m => m[1]), entry.tableIds);
  assert.deepEqual(lessons(source).map(m => m[1]), entry.equations);
  for (const [,id,title,tex,body] of lessons(source)) {
    assert(title.length > 12 && body.replace(/<[^>]*>/g, '').length > 170, `${id}: concrete authored explanation`);
    assert(body.includes('예를 들어'), `${id}: actual example is required`);
    assert.equal(tex, fixture.formulas[id], `${id}: expression identity`);
  }
  const expressions = math(source);
  assert.equal(expressions.length, entry.mathExpressions);
  for (const tex of expressions) katex.renderToString(tex, {throwOnError:true, strict:'error', trust:false, displayMode:true});
  for (const text of fixture.required[entry.key]) assert(source.includes(text), `${entry.key}: missing source distinction ${text}`);
  const cites = [...source.matchAll(/<a\b[^>]*data-news-citation="(\d+)"[^>]*>/g)];
  assert.deepEqual([...new Set(cites.map(m => m[1]))].sort(), Object.keys(entry.references).sort());
  for (const [number, ref] of Object.entries(entry.references)) {
    const links = cites.filter(m => m[1] === number);
    assert.equal(links.length, entry.citationCounts[number]);
    assert(links.every(m => m[0].includes(`href="#news-ref-${number}"`) && m[0].includes('data-astro-reload')));
    const refs = [...source.matchAll(new RegExp(`<a\\b[^>]*id="news-ref-${number}"[^>]*>`, 'g'))];
    assert.equal(refs.length, 1);
    assert(refs[0][0].includes(`href="${ref.url}"`) && refs[0][0].includes(`data-news-reference="${number}"`));
    assert(refs[0][0].includes('target="_blank"') && refs[0][0].includes('rel="noopener noreferrer"'));
  }
  for (const text of ['수식의 역할과 기호만 확인','별도의실제 계산','편집 점수']) assert(!source.includes(text));
  assert(!/<(?:script|style)\b/.test(source));
  return {key:entry.key, slug:entry.slug, bodyCharacters:chars, figures:entry.mediaIds.length, equations:entry.equations.length, mathExpressions:expressions.length};
}
assert.equal(edition.date, '2026-09-22');
assert.deepEqual(edition.entries.map(e => e.key), ['mos2','treg','phage']);
assert.deepEqual(edition.entries.map(e => e.order), [1,2,3]);
const sources = Object.fromEntries(edition.entries.map(e => [e.key, read(`site/content/posts/${e.slug}.mdx`)]));
const articles = edition.entries.map(e => validate(e, sources[e.key]));
assert.equal(provenance.length, 9);
assert.deepEqual(provenance.map(p => p.id), edition.entries.flatMap(e => e.mediaIds));
for (const p of provenance) {
  const m = media[p.id];
  assert(m && m.src === p.src && m.caption === p.caption && m.alt === p.alt);
  assert(p.sourceByteIdentical && p.visualReview.status === 'REVIEWED');
  assert.equal(p.visualReview.imageSha256, p.sha256);
  assert.equal(m.license, p.license);
  assert.equal(m.width, p.width); assert.equal(m.height, p.height);
  const bytes = fs.readFileSync(new URL(`site/assets${p.src}`, root));
  assert.equal(bytes.length, p.bytes); assert.equal(hash(bytes), p.sha256);
  assert.equal(bytes.subarray(1,4).toString(), 'PNG');
  assert.equal(bytes.readUInt32BE(16), p.width); assert.equal(bytes.readUInt32BE(20), p.height);
  if (p.id.includes('phage')) {
    assert.equal(p.license, '原권리자 저작권 · 해설용 도판 인용');
    assert(p.rightsNote.includes('No express republication permission'));
  }
}
for (const [id,digest] of Object.entries(fixture.historicMedia)) assert.equal(hash(JSON.stringify(media[id])), digest, `Preserve ${id}`);

const numerical = [];
function calc(name, actual, expected, key, token, tolerance = 1e-10) {
  assert(Math.abs(actual - expected) <= tolerance, name);
  assert(sources[key].includes(token), `${name}: numerical example not bound to prose`);
  numerical.push({name, actual, expected});
}
calc('One current decade', Math.log10(10)-Math.log10(1), 1, 'mos2', '\\log_{10}(10)-\\log_{10}(1)=1');
calc('Three illustrative decades mV', 88*3, 264, 'mos2', '88\\times3=264');
calc('Six illustrative decades mV', 88*6, 528, 'mos2', '528 mV');
calc('Thermal slope at 300K in mV', 1.380649e-23*300/1.602176634e-19*Math.log(10)*1000, 59.52642933233172, 'mos2', '59.5 mV', 1e-8);
calc('Illustrative body factor', 60*(1+.5), 90, 'mos2', '약 90 mV/dec');
calc('Larger parasitic ratio', 60*(1+1), 120, 'mos2', '약 120 mV/dec');
calc('Carrier supply times transmission', .5*.5, .25, 'mos2', '(1/2)\\times(1/2)=1/4');
calc('4 inches in millimetres', 4*25.4, 101.6, 'mos2', '101.6 mm');
calc('Relative unstable-cell reduction', (20-3)/20*100, 85, 'treg', '(20-3)/20\\times100=85');
calc('Absolute difference points', 20-3, 17, 'treg', '17퍼센트포인트');
calc('Illustrative remaining proliferation', 15/60, .25, 'treg', '15/60=0.25');
calc('Illustrative suppression percent', (1-15/60)*100, 75, 'treg', '억제율은 75%');
calc('Consensus boundary percent', 19/20*100, 95, 'phage', '19/20\\times100=95');
calc('Unanimous illustration', 20/20*100, 100, 'phage', '20명 모두 찬성한 100%');
const consensus = p => p>95 ? 'strong' : p>75 ? 'consensus' : p>50 ? 'majority' : 'none';
assert.equal(consensus(95), 'consensus'); assert.equal(consensus(100), 'strong');

const mutations = [
  ['mos2','SS denominator', String.raw`\Delta\log_{10}I_{\mathrm D}`, String.raw`\Delta I_{\mathrm D}`],
  ['mos2','gate coupling direction', String.raw`{C_{\mathrm G}}`, String.raw`{C_{\mathrm S}}`],
  ['mos2','barrier sign', String.raw`-\frac{q\varphi_{\mathrm{ch}}`, String.raw`+\frac{q\varphi_{\mathrm{ch}}`],
  ['mos2','tape process boundary','테이프 기반 방식 자체는 CMOS 호환 공정이 아니라고','테이프 기반 방식 자체도 CMOS 호환 공정이라고'],
  ['mos2','device versus segment sample','하나의 소자 내부','980개 독립 소자'],
  ['mos2','population summary','SS 중앙값 92 mV/dec','SS 중앙값 88 mV/dec'],
  ['treg','relative baseline', String.raw`}{p_{\mathrm{control}}}`, String.raw`}{p_{\mathrm{edited}}}`],
  ['treg','absolute versus relative','17퍼센트포인트','85퍼센트포인트'],
  ['treg','preclinical boundary','인간 일차 세포의 편집·기능 실험과 생쥐에서의 보완 검증','인간 임상 치료 확증'],
  ['phage','consensus boundary','strong consensus는 95%를 초과','strong consensus는 95% 이상'],
  ['phage','evidence type','합의 지침(Consensus Statement)','무작위 대조 임상시험'],
  ['phage','original omission','<NewsFigure media="sep22-phage-fig-2" />',''],
];
for (const [key,label,from,to] of mutations) {
  const mutant = sources[key].replace(from,to); assert.notEqual(mutant,sources[key],label);
  assert.throws(() => validate(edition.entries.find(e => e.key === key),mutant,false), undefined, `Must reject ${label} without hash check`);
}
let rendered = false;
if (fs.existsSync(new URL('dist/index.html',root))) {
  rendered = true;
  const list = read('dist/news/index.html'); assert(list.includes('data-news-date="2026-09-22"'));
  for (const entry of edition.entries) {
    const html = read(`dist/posts/${entry.slug}/index.html`);
    assert(!html.includes('katex-error') && !html.includes('google-adsense-account') && !html.includes('data-adsense-deferred'));
    assert(html.includes('Sep 22, 2026') && html.includes('2026-09-21T15:00:00.000Z'));
    assert.deepEqual([...html.matchAll(/data-news-figure="([^"]+)"/g)].map(m=>m[1]),entry.mediaIds);
    assert.deepEqual([...html.matchAll(/data-candidate-equation="([^"]+)"/g)].map(m=>m[1]),entry.equations);
    assert(list.includes(`data-news-card="${entry.slug}"`));
  }
}
fs.mkdirSync('sep22-review',{recursive:true});
fs.writeFileSync('sep22-review/contract.json', JSON.stringify({date:edition.date,articles,numerical,mutationControls:mutations.length,rendered},null,2));
console.log(`sep22-contract: PASS ${articles.length} articles, ${provenance.length} original figures, ${numerical.length} calculations, ${mutations.length} mutation controls; rendered=${rendered}`);

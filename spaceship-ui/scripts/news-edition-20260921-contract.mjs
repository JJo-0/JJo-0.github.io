import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import katex from 'katex';

const root = new URL('../', import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, root), 'utf8');
const edition = JSON.parse(read('site/news-edition-20260921.json'));
const provenance = JSON.parse(read('site/assets/assets/posts/news-20260921/provenance.json'));
const media = JSON.parse(read('site/news-media.json'));
const fixture = JSON.parse(read('site/news-reading-20260921.json'));
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function bodyText(source) {
  return source.split('---').slice(2).join('---').split(/^## 9\. /m)[0]
    .replace(/^import .*?;\s*/gm, '')
    .replace(/<Math\b[\s\S]*?\/>/g, '')
    .replace(/<CandidateEquation\b[^\n]+>/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[\d+\]/g, '')
    .replace(/[*#|`>]+/g, '')
    .replace(/\s+/g, ' ').trim();
}
const extractedMath = (s) => [...s.matchAll(/<(?:Math|CandidateEquation)\b[^\n]*?tex=\{String\.raw`([^`]+)`\}/g)].map(m => m[1]);
const lessons = (s) => [...s.matchAll(/<CandidateEquation id="([^"]+)" title="([^"]+)" tex=\{String\.raw`([^`]+)`\}>\s*([\s\S]*?)<\/CandidateEquation>/g)];

function validateArticle(entry, source, identity = true) {
  if (identity) assert.equal(sha256(source), entry.sha256, `${entry.key}: exact authored bytes`);
  assert(source.includes('publicationTimeZone: Asia/Seoul') && source.includes('draft: false'));
  assert.deepEqual([...source.matchAll(/^## (\d+)\./gm)].map(m => Number(m[1])), [1,2,3,4,5,6,7,8,9]);
  assert(bodyText(source).length >= 7000, `${entry.key}: long-form explanatory body excluding markup, math source and references`);
  if (identity) assert.equal(bodyText(source).length, entry.bodyCharacters);
  assert.deepEqual([...source.matchAll(/<NewsFigure media="([^"]+)"/g)].map(m=>m[1]), entry.mediaIds);
  assert.equal(new Set(entry.mediaIds).size, entry.mediaIds.length);
  assert.deepEqual(lessons(source).map(m=>m[1]), entry.equations);
  assert.deepEqual([...source.matchAll(/<CandidateTable id="([^"]+)"/g)].map(m=>m[1]), entry.tableIds);
  for (const lesson of lessons(source)) {
    const [,id,title,tex,explanation] = lesson;
    assert(title.length>12 && explanation.replace(/<[^>]*>/g,'').length>170, `${id}: authored question and explanation`);
    assert.equal(tex, fixture.formulas[id], `${id}: paper or explicitly derived expression changed`);
    assert(explanation.includes('예') || explanation.includes('가상'), `${id}: concrete worked example`);
  }
  const math = extractedMath(source);
  assert.equal(math.length, entry.mathExpressions);
  for (const tex of math) katex.renderToString(tex, {throwOnError:true, strict:'error', trust:false, displayMode:true});
  for (const phrase of fixture.required[entry.key]) assert(source.includes(phrase), `${entry.key}: missing source distinction ${phrase}`);
  const cites = [...source.matchAll(/<a\b[^>]*data-news-citation="(\d+)"[^>]*>/g)];
  assert.deepEqual([...new Set(cites.map(m=>m[1]))].sort(), Object.keys(entry.references).sort());
  for (const [n, ref] of Object.entries(entry.references)) {
    const links = cites.filter(m=>m[1]===n);
    assert.equal(links.length, entry.citationCounts[n], `${entry.key}: citation ${n}`);
    assert(links.every(m=>m[0].includes(`href="#news-ref-${n}"`) && m[0].includes('data-astro-reload')));
    const refs = [...source.matchAll(new RegExp(`<a\\b[^>]*id="news-ref-${n}"[^>]*>`, 'g'))];
    assert.equal(refs.length, 1);
    assert(refs[0][0].includes(`href="${ref.url}"`) && refs[0][0].includes(`data-news-reference="${n}"`));
  }
  for (const phrase of ['수식의 역할과 기호만 확인','별도의실제 계산','편집 점수','[[]]']) assert(!source.includes(phrase));
  assert(!/<(?:script|style)\b/.test(source));
  return {slug:entry.slug, bodyCharacters:bodyText(source).length, originals:entry.mediaIds.length, expressions:math.length, lessons:entry.equations.length};
}

assert.equal(edition.date, '2026-09-21');
assert.equal(edition.entries.length, 3);
assert.deepEqual(edition.entries.map(e=>e.order), [1,2,3]);
assert.deepEqual(edition.entries.map(e=>e.taxonomy.tags[0]), ['frontier-one','frontier-candidate','frontier-candidate']);
const sources = Object.fromEntries(edition.entries.map(e=>[e.key,read(`site/content/posts/${e.slug}.mdx`)]));
const articleResults = edition.entries.map(e=>validateArticle(e,sources[e.key]));
assert.equal(provenance.length,9);
assert.deepEqual(provenance.map(p=>p.id),edition.entries.flatMap(e=>e.mediaIds));
for (const item of provenance) {
  const row = media[item.id];
  assert(row && row.src===item.src && row.alt===item.alt && row.caption===item.caption);
  assert.equal(row.license,'CC BY-NC-ND 4.0');
  assert.equal(row.width,item.width); assert.equal(row.height,item.height);
  assert(item.sourceByteIdentical && item.visualReview.status==='REVIEWED');
  assert.equal(item.visualReview.imageSha256,item.sha256);
  const bytes=fs.readFileSync(new URL(`site/assets${item.src}`,root));
  assert.equal(bytes.length,item.bytes); assert.equal(sha256(bytes),item.sha256);
  assert.equal(bytes.subarray(1,4).toString(),'PNG');
  assert.equal(bytes.readUInt32BE(16),item.width); assert.equal(bytes.readUInt32BE(20),item.height);
}
for (const [id,digest] of Object.entries(fixture.historicMedia)) assert.equal(sha256(JSON.stringify(media[id])),digest,`${id}: preserve historical metadata`);

// Each calculation is independently computed, then bound to its actual prose or formula.
const numerical=[];
function calc(name, actual, expected, key, text, tolerance=1e-10) {
  assert(Math.abs(actual-expected)<=tolerance, name);
  assert(sources[key].includes(text), `${name}: calculation not bound to the article`);
  numerical.push({name,actual,expected});
}
calc('Rank-one energy fraction',3**2/(3**2+1),.9,'msvd','9/(9+1)=0.9');
calc('Power iteration first direction ratio',9/1,9,'msvd','9:1');
calc('Power iteration second direction ratio',9**2,81,'msvd','81:1');
calc('Deflation residual from inaccurate singular value',9-2.9**2,.59,'msvd','9-2.9^2=0.59');
calc('Dual-precision decomposition',2*64+45,173,'msvd','173=2\\times64+45');
calc('GSM8K percentage-point improvement',51.25-46.40,4.85,'msvd','4.85퍼센트포인트');
calc('GSM8K software gap',51.40-51.25,.15,'msvd','0.15퍼센트포인트');
calc('Energy remaining percent',100/29.9,3.34448160535117,'msvd','3.34');
calc('Two-angle measured mixture',.8*2+.3*1,1.9,'fiber','0.8\\times2+0.3\\times1=1.9');
calc('Alternative scene is non-unique',.8*2.375,1.9,'fiber','2.375');
calc('Unsquared prior cost',.1*(2+0+1)+.2*Math.hypot(3,4),1.3,'fiber','0.1\\times3+0.2\\times5=1.3');
const s=[.8,.3],o=[1,1],m=1.9,res=s[0]*o[0]+s[1]*o[1]-m,grad=s.map(v=>v*res);
const x=o.map((v,i)=>v-.5*grad[i]);
calc('Gradient-step first component',x[0],1.32,'fiber','1.32');
calc('Gradient-step measurement',s[0]*x[0]+s[1]*x[1],1.392,'fiber','1.392');
const loss=(q)=>.5*(s[0]*q[0]+s[1]*q[1]-m)**2;
for(let i=0;i<2;i++) {const a=[...o],b=[...o],h=1e-5;a[i]+=h;b[i]-=h;assert(Math.abs((loss(a)-loss(b))/(2*h)-grad[i])<1e-9);}
calc('Two-axis reconstruction grid',121*601,72721,'fiber','72,721');
calc('Three-axis reconstruction grid',50*50*601,1502500,'fiber','1{,}502{,}500');
calc('Exposure only',36*.010,.36,'fiber','0.36초');
calc('Photon energy eV',1.240/1.54,.805194805194805,'erled','0.805');
calc('Example radiative rate per second',.4/.001,400,'erled','400 s⁻¹');
calc('Example nonradiative rate per second',(1-.4)/.001,600,'erled','600 s⁻¹');
calc('Absorbed-photon quantum yield',1880/4000,.47,'erled','1880/4000=0.47');
calc('Incident-photon ratio is different',1880/10000,.188,'erled','1880/10000=0.188');
calc('EQE percentage points',3.26-1.14,2.12,'erled','2.12퍼센트포인트');

const mutations = [
 ['msvd','squared singular-value removal',String.raw`S_{i-1}^{2}`,String.raw`S_{i-1}`],
 ['msvd','model versus direct board measurement','32 nm architecture model','130 nm 직접 전력 계측'],
 ['msvd','LLM simulation boundary','멤리스터 변동을 포함한 시뮬레이션','실물 LLaMA 전체 학습'],
 ['msvd','residual arithmetic','9-2.9^2=0.59','9-2.9^2=0.01'],
 ['fiber','fixed-wavelength angular integration',String.raw`\,d\theta`,String.raw`\,d\lambda`],
 ['fiber','preserve original unsquared prior',String.raw`\lVert\Psi_{\lambda}^{-1}o\rVert_2`,String.raw`\lVert\Psi_{\lambda}^{-1}o\rVert_2^2`],
 ['fiber','rotation count','36개의 스펙트럼','한 개의 단발 스펙트럼'],
 ['fiber','public demo data boundary','물체와 측정은 시뮬레이션으로 생성','물체와 측정은 모두 실험 원자료'],
 ['fiber','correct measured panel','Figure 2d가 실측한','Figure 2b가 실측한'],
 ['erled','PLQY absorbed denominator',String.raw`N_{\gamma,\mathrm{absorbed}}`,String.raw`N_{\gamma,\mathrm{incident}}`],
 ['erled','EQE electron denominator',String.raw`N_{e,\mathrm{in}}`,String.raw`N_{\gamma,\mathrm{absorbed}}`],
 ['erled','device lifetime minutes','43분, 표면 처리 소자는 138분','43시간, 표면 처리 소자는 138시간'],
 ['erled','mean versus peak','평균은 2.77%','평균은 3.26%'],
 ['erled','missing actual figure','<NewsFigure media="erled-fig-5" />',''],
];
for(const [key,label,from,to] of mutations) {
  const original=sources[key], mutant=original.replace(from,to);
  assert.notEqual(mutant,original,`${label}: mutation must touch content`);
  assert.throws(()=>validateArticle(edition.entries.find(e=>e.key===key),mutant,false),undefined,`${label}: must be rejected without relying on hash mismatch`);
}
if(fs.existsSync(new URL('dist/index.html',root))) {
  const listing=read('dist/news/index.html');assert(listing.includes('data-news-date="2026-09-21"'));
  for(const entry of edition.entries) {
    const html=read(`dist/posts/${entry.slug}/index.html`);
    assert(!html.includes('katex-error')&&!html.includes('google-adsense-account')&&!html.includes('data-adsense-deferred'));
    assert(html.includes('Sep 21, 2026')&&html.includes('2026-09-20T15:00:00.000Z'));
    assert.deepEqual([...html.matchAll(/data-news-figure="([^"]+)"/g)].map(m=>m[1]),entry.mediaIds);
    assert.deepEqual([...html.matchAll(/data-candidate-equation="([^"]+)"/g)].map(m=>m[1]),entry.equations);
    assert(listing.includes(`data-news-card="${entry.slug}"`));
  }
}
fs.mkdirSync('sep21-review',{recursive:true});
fs.writeFileSync('sep21-review/static.json',JSON.stringify({date:edition.date,articles:articleResults,originals:9,numerical,finiteDifferenceChecks:2,mutationControls:mutations.map(([,label])=>label),scope:'Source-grounded editorial, arithmetic, byte identity and rendering review; not independent experimental reproduction.'},null,2));
console.log(`sep21: PASS 3 full-paper explainers, 9 original PNGs, ${articleResults.reduce((a,e)=>a+e.expressions,0)} expressions, ${numerical.length} calculations, 2 gradients and ${mutations.length} refusal mutations`);

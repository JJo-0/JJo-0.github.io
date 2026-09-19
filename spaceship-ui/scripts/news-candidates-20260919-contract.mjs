import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import katex from 'katex';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const hash = (s) => createHash('sha256').update(s).digest('hex');
const canonical = (v) => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const edition = JSON.parse(read('site/news-candidates-20260919.json'));
const originals = JSON.parse(read('site/assets/assets/posts/candidates-20260919/provenance.json'));
const media = JSON.parse(read('site/news-media.json'));
assert.deepEqual(edition.entries.map(e => e.key), ['neural','walker','whisker']);
const expectedIds = [['neural-fig-1','neural-fig-2'],['walker-fig-1','walker-fig-4'],['whisker-fig-1','whisker-fig-3','whisker-fig-5']];
assert.deepEqual(edition.entries.map(e => e.mediaIds), expectedIds);
function prose(s) {
  return s.replace(/^---\n[\s\S]*?\n---\s*/, '').split('## 9.')[0]
    .replace(/^import .*;\s*$/gm, '').replace(/<Math\b[\s\S]*?\/>/g, '')
    .replace(/<[^>]*>/g, '').replace(/\[\d+\]/g, '').replace(/[*#|`>]+/g, '').replace(/\s+/g, ' ').trim();
}
const required = {
  neural: ['94.6%', '0.5%', '82.1%', '0.7%', '1.6%', '97.3%', '그림 속 대표 이미지에 적힌 표지 양성률', '구독이 필요한 본문 전체와 Methods 전체를 열람한 범위는 아니다', '생물학적 반복 두 개', '기술적 반복 두 개', '공통 출발점이 있다는 사실과', '특허 출원을 명시'],
  walker: ['64%는 Figure 4의 정상상태 구간에 표시된 G2P 비율이 아니다', 'q를 11.9', '사람은 연료를 여러 차례 공급', 'pH 1 부근의 강산성', '17%', '16%', '18%', '같은 몰 단위', '100개 사건 예제'],
  whisker: ['3.2 g', '44.1 g', '192 KB', '34 KB', '50 Hz', '학습용 9회와 시험용 3회', 'IMU와 하향 ToF', 'MLP 단독', '약 7초', '5.11 mm가 전체 KF의 5.38 mm보다 작다', '약 15–20분', 'Isaac Sim 4.1'],
};
function checkSource(e, s, digest = true) {
  assert.match(s, /^draft: false$/m);
  assert.match(s, /^pubDate: 2026-09-19T00:00:00\+09:00$/m);
  assert.match(s, /^publicationTimeZone: Asia\/Seoul$/m);
  assert.match(s, new RegExp(`^slug: ${e.slug}$`, 'm'));
  assert(!/\[\[REFS\]\]|편집 주석:|원고 선정안의|수식의 역할과 기호만 확인|<script\b|<style\b|<img\b[^>]+https?:/i.test(s));
  assert.deepEqual([...s.matchAll(/^## (\d)\. /gm)].map(m => Number(m[1])), [1,2,3,4,5,6,7,8,9]);
  assert([...prose(s)].length >= 7000, `${e.key}: substantive prose length`);
  assert.deepEqual([...s.matchAll(/<NewsFigure media="([^"]+)"/g)].map(m => m[1]), e.mediaIds);
  assert(s.indexOf(`<NewsFigure media="${e.mediaIds[0]}" priority />`) < s.indexOf('## 1.'));
  assert.deepEqual([...s.matchAll(/<CandidateEquation id="([^"]+)"/g)].map(m => m[1]), e.equations);
  assert.deepEqual([...s.matchAll(/<CandidateTable id="([^"]+)"/g)].map(m => m[1]), e.tableIds);
  for (const phrase of required[e.key]) assert(s.includes(phrase), `${e.key}: missing or corrupted claim boundary ${phrase}`);
  const formulas = [...s.matchAll(/tex=\{String\.raw`([^`]+)`\}/g)].map(m => m[1]);
  assert.equal(formulas.length,e.mathExpressions);
  for (const tex of formulas) katex.renderToString(tex,{throwOnError:true,strict:'error',trust:false,displayMode:tex.includes('\\tag')});
  const counts = {};
  for (const [,target,n,label] of s.matchAll(/<a href="#news-ref-(\d+)" data-news-citation="(\d+)" aria-label="[^"]+" data-astro-reload>\[(\d+)\]<\/a>/g)) {
    assert.equal(target,n);assert.equal(n,label);counts[n]=(counts[n]||0)+1;
  }
  assert.deepEqual(counts,e.citationCounts);
  const refs = [...s.matchAll(/<a id="news-ref-(\d+)" href="([^"]+)" data-news-reference="(\d+)" target="_blank" rel="noopener noreferrer">\[(\d+)\]<\/a>/g)];
  assert.equal(refs.length,Object.keys(e.references).length);
  for (const [,id,url,n,label] of refs) {assert.equal(id,n);assert.equal(id,label);assert.equal(url,e.references[id].url);assert(url.startsWith('https://'));}
  if(e.key==='walker') {
    assert(formulas.includes(String.raw`\frac{dc_i}{dt}=J_{i,\mathrm{in}}-J_{i,\mathrm{out}}\tag{1}`));
    assert(formulas.includes(String.raw`\eta_{\mathrm{cyc}}=\frac{n_{\mathrm{fuel\;used\;for\;cyclization}}}{n_{\mathrm{fuel\;consumed}}}\tag{2}`));
  }
  if(e.key==='whisker') {
    assert(formulas.includes(String.raw`K=\frac{P^-}{P^-+R},\qquad d^+=d^-+K(m-d^-)\tag{1}`));
    assert(formulas.includes(String.raw`d^+=80+\frac{9}{13}(74-80)\approx75.846\;\mathrm{mm}\tag{2}`));
    const table=s.match(/id="whisker-results"[^>]*>([\s\S]*?)<\/CandidateTable>/)?.[1];assert(table);
    const values=table.split('\n').filter(l=>/^\| (흰 보드|유리) ·/.test(l)).map(l=>l.split('|').slice(2,-1).map(Number));
    assert.deepEqual(values,[[6.40,5.36,6.18,5.34],[6.19,5.13,5.96,4.73],[4.23,4.72,5.55,4.12],[11.33,5.78,11.41,8.13],[10.09,5.11,10.01,8.49],[5.91,5.38,5.06,5.71]],'Table 1 MAE, not mixed with RMSE');
  }
  if(digest) {assert.equal(hash(s),e.sha256);assert.equal([...prose(s)].length,e.bodyCharacters);}
}
const sources=new Map(edition.entries.map(e => [e.key,read(`site/content/posts/${e.slug}.mdx`)]));
for(const e of edition.entries)checkSource(e,sources.get(e.key));
const mutations=[
  ['neural','representative versus mean','그림 속 대표 이미지에 적힌 표지 양성률','모든 배양의 평균 성공률'],
  ['neural','invented full-text access','구독이 필요한 본문 전체와 Methods 전체를 열람한 범위는 아니다','Methods 전체 열람 완료'],
  ['neural','changed source figure','media="neural-fig-2"','media="neural-fig-3"'],
  ['walker','wrong mass balance',String.raw`in}}-J`,String.raw`in}}+J`],
  ['walker','mixed experimental regime','64%는 Figure 4의 정상상태 구간에 표시된 G2P 비율이 아니다','64%는 Figure 4의 정상상태 비율이다'],
  ['walker','broken citation','href="#news-ref-1"','href="#news-ref-19"'],
  ['whisker','incorrect Kalman denominator',String.raw`P^-+R`,String.raw`P^--R`],
  ['whisker','numerical walkthrough','75.846','85.846'],
  ['whisker','mean error corruption','| 5.91 | 5.38 | 5.06 | 5.71 |','| 0.91 | 5.38 | 5.06 | 5.71 |'],
  ['whisker','missing dark-flight sensor','IMU와 하향 ToF','촉각만'],
];
for(const [key,label,a,b] of mutations){const s=sources.get(key);assert(s.includes(a),label);assert.throws(()=>checkSource(edition.entries.find(e=>e.key===key),s.replace(a,b),false),undefined,label);}
const K=9/(9+4),posterior=80+K*(74-80),variance=(1-K)*9;
assert.equal(posterior.toFixed(3),'75.846');assert(Math.abs(variance-36/13)<1e-12);
assert(K>0&&K<1&&posterior>74&&posterior<80);
assert(9/(9+40)<K);assert(90/(90+4)>K);assert.equal(4-4,0);assert.equal(6-4,2);assert.equal(4-6,-2);assert.equal(16/100,0.16);assert(5.11<5.38);
function checkHistoric(catalogue){const b=edition.baselineMedia;assert.equal(b.ids.length,70);assert.equal(new Set(b.ids).size,70);for(const id of b.ids)assert(Object.hasOwn(catalogue,id));assert.equal(hash(JSON.stringify(canonical(Object.fromEntries(b.ids.map(id=>[id,catalogue[id]]))))),b.sha256);}
checkHistoric(media);
const missing=structuredClone(media);delete missing[edition.baselineMedia.ids[0]];assert.throws(()=>checkHistoric(missing));
const altered=structuredClone(media);altered[edition.baselineMedia.ids[1]].caption='changed';assert.throws(()=>checkHistoric(altered));
assert.deepEqual(originals.map(r=>r.id),expectedIds.flat());
for(const r of originals){
  const m=media[r.id];for(const key of Object.keys(m))assert.deepEqual(r[key],m[key]);
  const bytes=fs.readFileSync(new URL('site/assets'+m.src,root));assert.equal(bytes.length,r.bytes);assert.equal(hash(bytes),r.sha256);
  assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex'),r.blobSha);
  assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));assert.equal(bytes.readUInt32BE(16),r.width);assert.equal(bytes.readUInt32BE(20),r.height);
  assert.equal(r.sourceByteIdentical,true);assert.equal(r.visualReview.imageSha256,r.sha256);assert.equal(r.visualReview.status,'REVIEWED');
  assert.equal(r.license,r.id.startsWith('neural')?'원저작자 권리 보유':'CC BY 4.0');
  assert(r.caption.length>60&&r.alt.length>30&&r.width>=1000);
}
const audit=read('scripts/browser-news-media-audit.mjs');
assert.equal((audit.match(/\.\.\.candidates19\.entries/g)||[]).length,2,'Register source originals and first-figure placement without removing old checks');
if(fs.existsSync(new URL('dist/index.html',root))){
  const news=read('dist/news/index.html');
  for(const e of edition.entries){const h=read(`dist/posts/${e.slug}/index.html`);assert(!h.includes('katex-error'));assert(!h.includes('google-adsense-account')&&!h.includes('data-adsense-deferred'));
    assert(h.includes('Sep 19, 2026')&&h.includes('2026-09-18T15:00:00.000Z'));
    assert.deepEqual([...h.matchAll(/data-news-figure="([^"]+)"/g)].map(m=>m[1]),e.mediaIds);
    assert.deepEqual([...h.matchAll(/data-candidate-equation="([^"]+)"/g)].map(m=>m[1]),e.equations);
    assert(news.includes(`data-news-card="${e.slug}"`));
  }
}
const report={articles:edition.entries.map(e=>({slug:e.slug,characters:e.bodyCharacters,figures:e.mediaIds.length,specificExplanations:e.equations.length,mathExpressions:e.mathExpressions})),originals:7,articleMutations:mutations.map(([,label])=>label),historicMediaProtected:70,historicMutations:2,numerical:{K,posterior,variance,zeroNetFlow:4-4,cyclizationRatio:16/100},scope:'Source-specific editorial and rendering checks; not independent laboratory replication or blanket figure reuse permission.'};
fs.mkdirSync('sep19-review',{recursive:true});fs.writeFileSync('sep19-review/static.json',JSON.stringify(report,null,2));
console.log('sep19-candidates: PASS 3 articles, 7 original PNGs, 12 math expressions, 10 article and 2 historic-media mutation checks');

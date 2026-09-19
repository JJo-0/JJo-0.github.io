import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import katex from 'katex';
import { assertNewsProseLength } from './news-prose-policy.mjs';

const root = new URL('../', import.meta.url);
const read = (name) => fs.readFileSync(new URL(name, root), 'utf8');
const hash = (s) => createHash('sha256').update(s).digest('hex');
function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])]));
  return v;
}
const manifest = JSON.parse(read('site/news-wetlab-20260919.json'));
assert.equal(manifest.entries.length, 1);
const entry = manifest.entries[0];
const source = read(`site/content/posts/${entry.slug}.mdx`);
const media = JSON.parse(read('site/news-media.json'));
const originals = JSON.parse(read('site/assets/assets/posts/news-20260919/provenance.json'));
const forbidden = /편집 주석:|원고 선정안의|수식의 역할과 기호만 확인|이 수식이 본문에서 정의하거나|주황색 E 경로/;
function prose(s) {
  return s.replace(/^---\n[\s\S]*?\n---\s*/, '').split('## 9.')[0]
    .replace(/^import .*;\s*$/gm, '').replace(/<Math\b[\s\S]*?\/>/g, '')
    .replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\d+\]/g, '').replace(/[*#|`>]+/g, '').replace(/\s+/g, ' ').trim();
}
function checkArticle(s, digest = true) {
  assert.match(s, /^draft: false$/m);
  assert.match(s, /^pubDate: 2026-09-19T00:00:00\+09:00$/m);
  assert.match(s, /^publicationTimeZone: Asia\/Seoul$/m);
  assert.match(s, new RegExp(`^slug: ${entry.slug}$`, 'm'));
  assert(!forbidden.test(s));
  assert(!/<(?:script|style)\b|<img\b[^>]*src="https?:/i.test(s));
  assert.deepEqual([...s.matchAll(/^## (\d)\. /gm)].map((m) => +m[1]), [1,2,3,4,5,6,7,8,9]);
  assertNewsProseLength([...prose(s)].length, entry.slug);
  assert.deepEqual([...s.matchAll(/<NewsFigure media="([^"]+)"/g)].map((m) => m[1]), entry.mediaIds);
  for (const term of ['①–④ 경로', 'A는 연구자, B는 Claude', 'C는 장비별 MHS 인터페이스, D는 실제 장비', '표의 수치는 Genentech proof-of-concept의 결과이며 Anthropic 자체 wet lab의 성능표가 아니다.', '단위와 정규화 조건', '이 세 값은 설명을 위해 정한 숫자이며 Genentech의 원시 측정 데이터가 아니다.', '전문가의 설명을 필요로 했다', '기반 모델의 가중치를 다시 학습하는 일은 구분']) assert(s.includes(term), term);
  const table = s.match(/id="wetlab-results">([\s\S]*?)<\/WetLabTable>/)?.[1];
  assert(table);
  assert.deepEqual(table.split('\n').filter((l) => /^\| (물|점성)/.test(l)).map((l) => l.split('|').slice(1,-1).map((x) => x.trim())), [
    ['물','약 140 μL/s','0.016'], ['점성이 높은 BSA 시료','10 μL/s','0.181'],
  ]);
  const equations = [...s.matchAll(/tex=\{String\.raw`([^`]+)`\}/g)].map((m) => m[1]);
  assert.equal(equations.length, entry.mathExpressions);
  for (const tex of equations) katex.renderToString(tex, {throwOnError:true,strict:'error',trust:false});
  const block = s.match(/<CandidateEquation id="wetlab-rmse"[\s\S]*?tex=\{String\.raw`([^`]+)`\}>([\s\S]*?)<\/CandidateEquation>/);
  assert(block);
  assert.equal(block[1], String.raw`\mathrm{RMSE}=\sqrt{\frac{1}{n}\sum_{i=1}^{n}(m_i-r_i)^2}`);
  assert(block[2].includes(String.raw`\sqrt{\frac{0.02^2+(-0.01)^2+0.01^2}{3}}=\sqrt{0.0002}\approx0.0141`));
  for (const term of ['양의 오차와 음의 오차가 상쇄','분모 n','제곱근','0.0006','0.0141']) assert(block[2].includes(term));
  assert.deepEqual([...s.matchAll(/<WetLabTable[^>]*id="([^"]+)"/g)].map((m)=>m[1]), ['wetlab-roles','wetlab-results','wetlab-timeline','wetlab-next']);
  const counts = {};
  for (const [,target,number,label] of s.matchAll(/<a href="#news-ref-(\d+)" data-news-citation="(\d+)" aria-label="[^"]+" data-astro-reload>\[(\d+)\]<\/a>/g)) {
    assert.equal(target,number);assert.equal(number,label);counts[number]=(counts[number]||0)+1;
  }
  assert.deepEqual(counts, entry.citationCounts);
  const refs = [...s.matchAll(/<a id="news-ref-(\d+)" href="([^"]+)" data-news-reference="(\d+)" target="_blank" rel="noopener noreferrer">\[(\d+)\]<\/a>/g)];
  assert.equal(refs.length,6);
  for (const [,id,url,number,label] of refs) {assert.equal(id,number);assert.equal(id,label);assert.equal(url,entry.references[id].url);}
  if (digest) {assert.equal(hash(s),entry.sha256);assert.equal([...prose(s)].length,entry.bodyCharacters);}
}
checkArticle(source);
const sum = [0.02,-0.01,0.01].reduce((a,x)=>a+x*x,0);
assert(Math.abs(sum-0.0006)<1e-14);
assert(Math.abs(sum/3-0.0002)<1e-14);
assert.equal(Math.sqrt(sum/3).toFixed(4),'0.0141');
assert(Math.abs((140e-6)/(1e-6)-140)<1e-12);
const mutations = [
  ['wrong route', `slug: ${entry.slug}`, `slug: 2026-09-19-${entry.slug}`],
  ['timezone omitted', 'publicationTimeZone: Asia/Seoul', 'publicationTimeZone: UTC'],
  ['missing original', 'media="wetlab-genentech-workflow"', 'media="wrong"'],
  ['wrong water rate', '| 약 140 μL/s |', '| 약 14 μL/s |'],
  ['false RMSE unit', '| 0.181 |', '| 0.181 μL |'],
  ['RMSE denominator', String.raw`\frac{1}{n}`, String.raw`\frac{1}{2n}`],
  ['example arithmetic', String.raw`\sqrt{0.0002}`, String.raw`\sqrt{0.002}`],
  ['broken citation', 'href="#news-ref-1"', 'href="#news-ref-99"'],
];
for (const [label,a,b] of mutations) {assert(source.includes(a),label);assert.throws(()=>checkArticle(source.replace(a,b),false),undefined,label);}
function checkBaseline(catalogue) {
  const base=manifest.baselineMedia;
  assert.equal(base.ids.length,68);assert.equal(new Set(base.ids).size,68);
  for (const id of base.ids) assert(Object.hasOwn(catalogue,id),`Missing prior media ${id}`);
  const selected=Object.fromEntries(base.ids.map((id)=>[id,catalogue[id]]));
  assert.equal(hash(JSON.stringify(canonical(selected))),base.sha256,'Every pre-publication media value preserved');
}
checkBaseline(media);
const badMedia=structuredClone(media);delete badMedia[manifest.baselineMedia.ids[0]];
assert.throws(()=>checkBaseline(badMedia));
const changed=structuredClone(media);changed[manifest.baselineMedia.ids[0]].caption='changed';
assert.throws(()=>checkBaseline(changed));
assert.deepEqual(originals.map((r)=>r.id),entry.mediaIds);
for (const r of originals) {
  assert.equal(r.version,'MHS research preview, 2026-08-27');
  for (const key of ['slug','src','kind','alt','caption','credit','source','license','rights','changes','width','height','sha256','order']) assert.deepEqual(media[r.id][key],r[key]);
  const b=fs.readFileSync(new URL('site/assets'+r.src,root));assert.equal(hash(b),r.sha256);assert.equal(b.length,r.bytes);
  assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex'),r.sha);
  assert.equal(r.sourceByteIdentical,true);assert.equal(r.visualReview.imageSha256,r.sha256);assert.equal(r.visualReview.status,'REVIEWED');
  assert.equal(r.license,'원저작자 권리 보유');assert(r.alt.length>30&&r.caption.includes('Genentech'));
}
// Test the production date functions, not a separate reimplementation.
const compiled=ts.transpileModule(read('src/lib/utils/date.ts'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {formatDate,formatDateKey}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const instant=new Date(entry.pubDate);
assert.equal(instant.toISOString(),'2026-09-18T15:00:00.000Z');
assert.equal(formatDateKey(instant,'Asia/Seoul'),'2026-09-19');
assert.equal(formatDateKey(instant),'2026-09-18');
assert.equal(formatDate(instant,'Asia/Seoul'),'Sep 19, 2026');
assert.equal(formatDateKey(new Date('2026-09-18T14:59:59Z'),'Asia/Seoul'),'2026-09-18');
for (const date of ['2025-05-16','2026-08-25','2026-09-18']) assert.equal(formatDateKey(new Date(date)),date);
const schema=read('src/content.config.ts');assert(schema.includes("publicationTimeZone: z.enum(['UTC', 'Asia/Seoul']).default('UTC')"));
assert(read('src/lib/utils/posts.ts').includes('if (post.data.pubDate > now) return false;'),'Future publication filter remains active');
const rendered=new URL(`dist/posts/${entry.slug}/index.html`,root);
if (fs.existsSync(new URL('dist/index.html',root))) {
  assert(fs.existsSync(rendered),'Declared public URL must exist after build');
  const h=fs.readFileSync(rendered,'utf8');
  assert(!h.includes('katex-error')&&!h.includes('google-adsense-account')&&!h.includes('data-adsense-deferred'));
  assert(h.includes('Sep 19, 2026')&&h.includes('2026-09-18T15:00:00.000Z'));
  assert.deepEqual([...h.matchAll(/data-news-figure="([^"]+)"/g)].map((m)=>m[1]),entry.mediaIds);
  assert.deepEqual([...h.matchAll(/data-candidate-equation="([^"]+)"/g)].map((m)=>m[1]),entry.equations);
  const news=read('dist/news/index.html');assert(news.includes('data-news-date="2026-09-19"')&&news.includes(`data-news-card="${entry.slug}"`));
}
const report={slug:entry.slug,bodyCharacters:entry.bodyCharacters,originals:2,mathExpressions:entry.mathExpressions,specificExplanations:1,articleMutations:mutations.map(([name])=>({name,rejected:true})),baselineMutations:2,publicationDateCases:8,numerical:{sum,squaredMean:sum/3,rmse:Math.sqrt(sum/3)},scope:'Editorial and rendering checks, not independent experimental replication or a general image reuse permission.'};
if (process.env.JJO_WETLAB_REPORT) {const target=process.env.JJO_WETLAB_REPORT;fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(report,null,2));}
console.log('wetlab-contract: PASS original pixels, source boundaries, one specific RMSE walkthrough, 8 article mutations, 2 historic-media mutations, publication timezone and rendering');

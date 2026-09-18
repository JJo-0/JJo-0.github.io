import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import katex from 'katex';
import { assertNewsProseLength } from './news-prose-policy.mjs';
const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const edition = JSON.parse(read('site/news-candidates-20260918.json'));
const media = JSON.parse(read('site/news-media.json'));
const original = JSON.parse(read('site/assets/assets/posts/news-20260918-candidates/provenance.json'));
const equations = new Map(edition.equations.map(e => [e.id, e]));
const sources = new Map();
export function candidateProse(s) {
  return s.replace(/^---\n[\s\S]*?\n---\n/, '').split('## 9.')[0]
    .replace(/^import .*;\n/gm, '')
    .replace(/<CandidateEquation\b[\s\S]*?tex=\{String\.raw`[^`]*`\}>/g, '')
    .replace(/<Math\b[\s\S]*?\/>/g, '').replace(/<[^>]*>/g, '')
    .replace(/\[\d+\]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*#|`>]+/g, '').replace(/\s+/g, ' ').trim();
}
const forbidden = /이 수식이 본문에서 정의하거나|수식의 역할과 기호만 확인|범용 계산 절차|source-link-only|도판 파일과 전재 권리 검토는 미완료|원본 파일이 아직 포함/;
function checkArticle(s, entry, digest = true) {
  assert.match(s, /^draft: false$/m); assert.match(s, /^pubDate: 2026-09-18$/m);
  assert.equal(s.match(/^slug: (.+)$/m)?.[1], entry.slug, 'Explicit public route must match the release manifest');
  assert.match(s, /^lang: ko$/m); assert(s.includes('  - frontier-candidate\n'));
  assert(!forbidden.test(s)); assert(!/<(?:script|style)\b|<img\b[^>]+src="https?:/i.test(s));
  assert.deepEqual([...s.matchAll(/^## (\d)\. /gm)].map(m => +m[1]), [1,2,3,4,5,6,7,8,9]);
  assertNewsProseLength([...candidateProse(s)].length, entry.slug);
  const body = s.replace(/^---\n[\s\S]*?\n---\s*/, '').replace(/^import .*;\s*$/gm, '').trim();
  assert(body.startsWith(`<NewsFigure media="${entry.mediaIds[0]}" priority />`));
  assert.deepEqual([...s.matchAll(/<NewsFigure media="([^"]+)"/g)].map(m=>m[1]),entry.mediaIds);
  const blocks = [...s.matchAll(/<CandidateEquation id="([^"]+)" title="([^"]+)" tex=\{String\.raw`([^`]+)`\}>([\s\S]*?)<\/CandidateEquation>/g)];
  assert.deepEqual(blocks.map(m=>m[1]),entry.equations);
  for (const [,id,title,tex,explanation] of blocks) {
    const expected=equations.get(id); assert(expected); assert.equal(title,expected.title); assert.equal(tex,expected.tex);
    assert.equal(hash(explanation),expected.explanationSha256,`${id}: original worked explanation preserved`);
    assert([...candidateProse(explanation)].length>=180); assert(!forbidden.test(explanation));
  }
  const tex=[...s.matchAll(/tex=\{String\.raw`([^`]+)`\}/g)].map(m=>m[1]);
  for (const expression of tex) katex.renderToString(expression,{throwOnError:true,strict:'error',trust:false});
  assert.equal(tex.length,entry.equations.length+entry.inlineMathCount);
  const counts={};
  for(const [,target,number,label] of s.matchAll(/<a href="#news-ref-(\d+)" data-news-citation="(\d+)" aria-label="[^"]+" data-astro-reload>\[(\d+)\]<\/a>/g)){
    assert.equal(target,number);assert.equal(number,label);counts[number]=(counts[number]||0)+1;
  }
  assert.deepEqual(counts,Object.fromEntries(Object.entries(entry.citationCounts).filter(([,n])=>n>0)));
  const refs=[...s.matchAll(/<a id="news-ref-(\d+)" href="([^"]+)" data-news-reference="(\d+)" target="_blank" rel="noopener noreferrer">\[(\d+)\]<\/a>/g)];
  assert.equal(refs.length,Object.keys(entry.references).length);
  for(const [,id,url,number,label] of refs){assert.equal(id,number);assert.equal(id,label);assert.equal(url,entry.references[id].url);assert(url.startsWith('https://'));}
  if(digest){assert.equal(hash(s),entry.sha256);assert.equal([...candidateProse(s)].length,entry.bodyCharacters);}
  return tex.length;
}
assert.equal(edition.entries.length,4);assert.equal(equations.size,11);assert.equal(original.length,8);
let mathCount=0;
for(const entry of edition.entries){const s=read(`site/content/posts/${entry.slug}.mdx`);sources.set(entry.key,s);mathCount+=checkArticle(s,entry);}
const get=(key)=>sources.get(key);
const numerical=[];
function calc(name,value,expected,key,token,tolerance=1e-8){
  assert(Math.abs(value-expected)<=tolerance,name);assert(get(key).includes(token),`${name}: link to prose`);numerical.push({name,value,article:key,proseToken:token});
}
calc('Bayes equal priors',.8*.5/(.8*.5+.2*.5),.8,'delphy','0.8과 0.2');
calc('Bayes changed priors',.8*.2/(.8*.2+.2*.8),.5,'delphy','각각 0.5');
calc('MH asymmetric proposal',Math.min(1,.3*.2/(.2*.6)),.5,'delphy','=0.5');
calc('ESS autocorrelation',1000/(1+2*4.5),100,'delphy','약 100');
calc('Low-risk assumed false positives',9990*.032,319.68,'panxeon','319.68');
calc('Low-risk assumed PPV',.868*.001/(.868*.001+.032*.999)*100,2.64,'panxeon','2.64',.005);
calc('High-risk assumed false positives',9900*.156,1544.4,'panxeon','1,544.4');
calc('High-risk assumed PPV',.868*.01/(.868*.01+.156*.99)*100,5.32,'panxeon','5.32',.005);
calc('Specificity',(1-.032)*100,96.8,'panxeon','96.8');
calc('Pockels example',-.5*2**3*1e-9*1e5,-.0004,'photonics',String.raw`-4\times10^{-4}`);
calc('Half power',20*Math.log10(1/Math.sqrt(2)),-3.0103,'photonics','-3.0103',.00005);
calc('23GHz period ps',1/23e9*1e12,43.48,'photonics','43.48',.005);
calc('Faraday unit conversion',33800/10000,3.38,'photonics','3.38');
calc('Faraday over 0.1um',3.38*.1,.338,'photonics','0.338');
calc('Ideal phase example',2*Math.PI*.0004*1000/1.55,1.62,'photonics','1.62',.005);
calc('FF plus PI example',20/40+.02*(20-18)+.01,.55,'soft-muscles','=0.55');
calc('RMS cancelling signs',Math.sqrt((1+1+9+9)/4),Math.sqrt(5),'soft-muscles',String.raw`\sqrt{5}`);
calc('RMS temporal patterns',Math.sqrt(16/4),2,'soft-muscles','RMS는 2');
calc('RMS relative PI improvement',(7.63-2.38)/7.63*100,68.8,'soft-muscles','68.8',.05);
calc('RMS relative FF improvement',(3.63-2.38)/3.63*100,34.4,'soft-muscles','34.4',.05);
const mutationCases=[
 ['wrong public route','delphy','slug: 2026-09-18-delphy-outbreak-phylogenetics-news','slug: 2026-09-18-2026-09-18-delphy-outbreak-phylogenetics-news'],
 ['missing figure','delphy','media="delphy-emat"','media="missing"'],
 ['wrong publication date','delphy','pubDate: 2026-09-18','pubDate: 2025-09-18'],
 ['PPV denominator','panxeon',String.raw`Se\,\pi+FPR\,(1-\pi)`,String.raw`Se\,\pi-FPR\,(1-\pi)`],
 ['wrong assumed population','panxeon','319.68','31.968'],
 ['Pockels sign','photonics',String.raw`\Delta n\approx-`,String.raw`\Delta n\approx+`],
 ['degree conversion','photonics','3.38','33.8'],
 ['RMS denominator','soft-muscles',String.raw`\frac{1}{N}`,String.raw`\frac{1}{2N}`],
 ['broken reference','soft-muscles','id="news-ref-1"','id="news-ref-99"'],
];
for(const [name,key,oldText,replacement] of mutationCases){const s=get(key),bad=s.replace(oldText,replacement);assert.notEqual(bad,s);assert.throws(()=>checkArticle(bad,edition.entries.find(e=>e.key===key),false),undefined,name);}
assert(get('panxeon').includes('1,757명'));assert(get('panxeon').includes('SEER'));assert(get('panxeon').includes('모형 추정'));
assert(get('delphy').includes('유전적 사전분포'));assert(get('delphy').includes('96-vCPU'));
assert.deepEqual(original.map(r=>r.id),edition.mediaIds);
function checkNewsOrder(registry) {
  assert.deepEqual([registry['paper2agent-overview'].order,...edition.entries.map(entry=>registry[entry.mediaIds[0]].order)],[1,2,3,4,5],'Top article precedes the four candidates deterministically');
}
checkNewsOrder(media);
const wrongOrder=structuredClone(media);wrongOrder[edition.entries[0].mediaIds[0]].order=1;
assert.throws(()=>checkNewsOrder(wrongOrder),undefined,'Candidate cannot tie the established Top 1');
for(const row of original){
 const item=media[row.id];assert(item);for(const field of ['slug','src','kind','alt','caption','credit','source','license','rights','changes','width','height','sha256','order'])assert.deepEqual(item[field],row[field],`${row.id}: ${field}`);
 const data=fs.readFileSync(new URL('site/assets'+row.src,root));assert.equal(hash(data),row.sha256);assert.equal(data.length,row.bytes);
 assert(data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));assert.equal(data.readUInt32BE(16),row.width);assert.equal(data.readUInt32BE(20),row.height);
 assert.equal(row.visualReview.imageSha256,row.sha256);assert.equal(row.visualReview.status,'REVIEWED');
 assert(row.alt.length>30&&row.caption.length>80);assert(row.rightsReview.length>40);
 if(row.sourceByteIdentical)assert.equal(row.sourceSha256,row.sha256);
 if(row.id.startsWith('soft-')){assert.equal(row.license,'CC BY 4.0');assert(row.version.endsWith(':Article-in-Press'));assert([7,8].includes(row.pdfPage));}
 if(row.id.startsWith('delphy-'))assert.equal(row.license,'CC BY-NC-ND 4.0');
 if(/^(panxeon|photonics)-/.test(row.id))assert(row.rightsReview.includes('no CC license'));
}
const oldMedia = JSON.parse(read('site/news-candidates-20260918-baseline-media.json'));
function canonical(value){
  if(Array.isArray(value))return value.map(canonical);
  if(value && typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
  return value;
}
assert.equal(oldMedia.ids.length, oldMedia.entries);
assert.equal(new Set(oldMedia.ids).size, oldMedia.entries);
for (const id of oldMedia.ids) assert(Object.hasOwn(media, id), `Missing historic media ${id}`);
const preserved = Object.fromEntries(oldMedia.ids.map(id => [id, media[id]]));
assert.equal(Object.keys(preserved).length,oldMedia.entries);
assert.equal(hash(JSON.stringify(canonical(preserved))),oldMedia.canonicalSha256,'All previous NEWS media values remain unchanged');
for(const entry of edition.entries){
 assert.deepEqual(Object.entries(media).filter(([,r])=>r.slug===entry.slug).map(([id])=>id),entry.mediaIds);
 const render=new URL(`dist/posts/${entry.slug}/index.html`,root);
 if(fs.existsSync(new URL('dist/',root))){
  assert(fs.existsSync(render), `Missing required built candidate route: ${entry.slug}`);
  const html=fs.readFileSync(render,'utf8');assert(!html.includes('katex-error'));
  assert.deepEqual([...html.matchAll(/data-news-figure="([^"]+)"/g)].map(m=>m[1]),entry.mediaIds);
  assert.deepEqual([...html.matchAll(/data-candidate-equation="([^"]+)"/g)].map(m=>m[1]),entry.equations);
  assert(!html.includes('google-adsense-account')&&!html.includes('data-adsense-deferred'),'Scholarly article must not initialize advertising');
 }
}
const news=new URL('dist/news/index.html',root);
if(fs.existsSync(new URL('dist/',root))){
 assert(fs.existsSync(news),'Built NEWS index must exist');
 const listing=fs.readFileSync(news,'utf8');
 assert(!listing.includes('google-adsense-account'),'Card reading surface without ad initialization');
 for(const entry of edition.entries){
  assert.equal(listing.split(`data-news-card="${entry.slug}"`).length-1,1,`Exactly one NEWS card for ${entry.slug}`);
  assert(listing.includes(`/posts/${entry.slug}`),`NEWS link for ${entry.slug}`);
  assert(!listing.includes(`2026-09-18-${entry.slug}`),'No duplicated-date routes');
 }
}
const releaseWorkflow=read('../.github/workflows/blog-pages-deploy.yml');
assert(releaseWorkflow.lastIndexOf('Publish Pages live-smoke status')>releaseWorkflow.lastIndexOf('uses: actions/upload-artifact@'),'Publish status after preserving all live evidence');
for(const prefix of ['candidates-live-','paper2agent-feedback-live-'])assert(releaseWorkflow.includes(prefix+'${{ github.run_id }}-attempt-${{ github.run_attempt }}'),'Live evidence distinguishes run attempts');
const report={articles:edition.entries.map(e=>({slug:e.slug,characters:e.bodyCharacters})),figures:8,explanations:11,mathExpressions:mathCount,numerical,mutations:[...mutationCases.map(([name])=>({name,rejected:true})),{name:'candidate ties Top 1',rejected:true}],scope:'Authored explanations, file identity and rendered contracts; not an independent reproduction of paper experiments or a blanket rights grant.'};
const reportPath=process.env.JJO_CANDIDATE_REPORT;
if(reportPath){fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(report,null,2));}
console.log(`candidate-news: PASS four articles; ${mathCount} math expressions; 11 specific explanations; 8 verified original figures; 20 calculations; ${report.mutations.length} rejected mutations`);

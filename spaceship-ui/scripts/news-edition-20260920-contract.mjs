import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import katex from 'katex';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const edition=JSON.parse(read('site/news-edition-20260920.json'));
const media=JSON.parse(read('site/news-media.json'));
const originals=JSON.parse(read('site/assets/assets/posts/news-20260920/provenance.json'));
const ids=[['elpr-fig-1','elpr-fig-4','elpr-fig-5'],['xeno-fig-2','xeno-fig-3','xeno-fig-4'],['bioopt-speed','bioopt-quality','bioopt-collapse'],['hydrogen-fig-1','hydrogen-fig-6']];
assert.deepEqual(edition.entries.map(e=>e.key),['elpr','xeno','bioopt','hydrogen']);
assert.deepEqual(edition.entries.map(e=>e.mediaIds),ids);
const required={
 elpr:['실제 전류를 공급해 다색 발광을 확인한 원형 픽셀의 직경','110/160 nm','30 μm','13.3%','본문은 crosslinked, Supplementary Figure 63D의 캡션은 non-crosslinked','2.4 mA cm⁻²','30.9%','30.3%','EP25223816.7'],
 xeno:['잔존 숙주 피질과 이식편을 합친 피질 조직 부피','91.9%','29마리','14마리','7마리','핵의 프로파일 수','대조군 2마리와 apallial 2마리','집단 간 검정 결과와 자동으로 동일시','정상화되지는 않았다고'],
 bioopt:['exact 1.6배, fast 4.2배, big 3.5배','14개·13개·14개','B300 GPU 8개','1,925','95% 신뢰구간','no recycles','36개의 최적화 kit','지속 유지보수하지 않으며','in silico'],
 hydrogen:['2100년까지','2040년 이후','14,108개 잠재 수요처','비용 경쟁력 90%·중심성 10%','37–41%','13–15%','총지출은 18% 늘었지만','천연가스','20%보다 크게'],
};
function prose(s){return s.replace(/^---\n[\s\S]*?\n---\s*/,'').split('## 9.')[0]
 .replace(/^import .*;\s*$/gm,'').replace(/<CandidateEquation\b[\s\S]*?tex=\{String\.raw`[^`]*`\}>/g,'')
 .replace(/<Math\b[\s\S]*?\/>/g,'').replace(/<[^>]*>/g,'').replace(/\[\d+\]/g,'').replace(/[*#|`>]+/g,'').replace(/\s+/g,' ').trim();}
const expectedFormulas={
 'elpr-pitch':String.raw`\begin{aligned}p&=w+s\\&=110\,\mathrm{nm}+160\,\mathrm{nm}\\&=270\,\mathrm{nm}\end{aligned}\tag{1}`,
 'elpr-eqe':String.raw`\mathrm{EQE}=\frac{N_{\gamma,\mathrm{out}}}{N_{e,\mathrm{in}}}\times100\%\tag{2}`,
 'xeno-calcium':String.raw`\frac{\Delta F}{F_0}=\frac{F-F_0}{F_0}\tag{1}`,
 'bioopt-amdahl':String.raw`S=\frac{1}{(1-f)+f/s}\tag{1}`,
 'hydrogen-cost':String.raw`\begin{aligned}K&=\frac{C_{\mathrm{policy}}}{\Delta H}\\r&=\frac{K_0-K_1}{K_0}\times100\%\end{aligned}\tag{1}`,
};
function checkArticle(e,s,digest=true){
 assert.match(s,/^draft: false$/m);assert.match(s,/^pubDate: 2026-09-20T00:00:00\+09:00$/m);assert.match(s,/^publicationTimeZone: Asia\/Seoul$/m);
 assert.equal(s.match(/^slug: (.+)$/m)?.[1],e.slug);
 assert.equal(s.match(/^category: (.+)$/m)?.[1],e.taxonomy.category);assert.equal(s.match(/^subcategory: (.+)$/m)?.[1],e.taxonomy.subcategory);
 assert.equal(s.match(/^type: (.+)$/m)?.[1],e.taxonomy.type);
 assert(!/<(?:script|style)\b|편집 주석:|원고 선정안의|수식의 역할과 기호만 확인|이 수식이 본문에서 정의하거나|<img\b[^>]+https?:/.test(s));
 assert.deepEqual([...s.matchAll(/^## (\d)\. /gm)].map(m=>+m[1]),[1,2,3,4,5,6,7,8,9]);
 assert([...prose(s)].length>=7000,`${e.key}: substantive authored prose`);
 assert(s.indexOf(`<NewsFigure media="${e.mediaIds[0]}" priority />`)<s.indexOf('## 1.'));
 assert.deepEqual([...s.matchAll(/<NewsFigure media="([^"]+)"/g)].map(m=>m[1]),e.mediaIds);
 assert.deepEqual([...s.matchAll(/<CandidateTable id="([^"]+)"/g)].map(m=>m[1]),e.tableIds);
 const equations=[...s.matchAll(/<CandidateEquation id="([^"]+)" title="([^"]+)" tex=\{String\.raw`([^`]+)`\}>([\s\S]*?)<\/CandidateEquation>/g)];
 assert.deepEqual(equations.map(m=>m[1]),e.equations);
 for(const [,id,title,tex,body] of equations){assert.equal(tex,expectedFormulas[id]);assert(title.length>15);assert(prose(body).length>250);assert(body.includes('분모')||body.includes('나눗셈')||body.includes('간격')||body.includes('기준값으로 나누면'), `${id}: explain the actual operation`);}
 for(const token of required[e.key])assert(s.includes(token),`${e.key}: missing source condition ${token}`);
 const formulas=[...s.matchAll(/tex=\{String\.raw`([^`]+)`\}/g)].map(m=>m[1]).concat([...s.matchAll(/<Math tex="([^"]+)"/g)].map(m=>m[1]));
 assert.equal(formulas.length,e.mathExpressions);
 for(const tex of formulas)katex.renderToString(tex,{throwOnError:true,strict:'error',trust:false,displayMode:tex.includes('\\tag')});
 const counts={};for(const [,a,b,c] of s.matchAll(/<a href="#news-ref-(\d+)" data-news-citation="(\d+)" aria-label="[^"]+" data-astro-reload>\[(\d+)\]<\/a>/g)){assert.equal(a,b);assert.equal(a,c);counts[a]=(counts[a]||0)+1;}
 assert.deepEqual(counts,e.citationCounts);
 const refs=[...s.matchAll(/<a id="news-ref-(\d+)" href="([^"]+)" data-news-reference="(\d+)" target="_blank" rel="noopener noreferrer">\[(\d+)\]<\/a>/g)];
 assert.equal(refs.length,Object.keys(e.references).length);
 for(const [,a,url,b,c]of refs){assert.equal(a,b);assert.equal(a,c);assert.equal(url,e.references[a].url);assert(url.startsWith('https://'));}
 if(digest){assert.equal(hash(s),e.sha256);assert.equal([...prose(s)].length,e.bodyCharacters);}
 return formulas.length;
}
const sources=new Map(edition.entries.map(e=>[e.key,read(`site/content/posts/${e.slug}.mdx`)]));
let mathCount=0;for(const e of edition.entries)mathCount+=checkArticle(e,sources.get(e.key));
const numerical=[];
function calc(name,value,expected,key,token,tolerance=1e-9){assert(Math.abs(value-expected)<tolerance,name);assert(sources.get(key).includes(token),`${name}: bind to prose`);numerical.push({name,value,key});}
calc('Line plus gap',110+160,270,'elpr','270');
calc('Ten line periods in micrometres',10*(110+160)/1000,2.70,'elpr','2.70');
calc('Electrons to external photons',1330/10000*100,13.3,'elpr','13.3');
calc('Calcium first baseline',(120-100)/100,.2,'xeno','(120-100)/100=0.20');
calc('Calcium second baseline',(240-200)/200,.2,'xeno','(240-200)/200=0.20');
calc('Amdahl normalized time',1-.8+.8/4,.4,'bioopt','0.2+0.8/4=0.4');
calc('Amdahl speed',1/(1-.8+.8/4),2.5,'bioopt','1/0.4=2.5');
calc('Amdahl remaining wall time',100*(1-.8+.8/4),40,'bioopt','40초');
calc('Low optimization fraction',1/(1-.2+.2/4),1.1764705882352942,'bioopt','1.18');
calc('Eight GPU node hours',8*24,192,'bioopt','192 GPU·hour');
calc('Neutral cost per extra kg',100/50,2,'hydrogen','100/50=2.00');
calc('Targeted cost per extra kg',118/100,1.18,'hydrogen','118/100=1.18');
calc('Cost-effectiveness relative reduction',(2-1.18)/2*100,41,'hydrogen','41');
calc('Total subsidy change',(118-100)/100*100,18,'hydrogen','18%');
const mutations=[
 ['elpr','wrong pattern sum','&=270','&=260'],
 ['elpr','wrong efficiency denominator',String.raw`N_{e,\mathrm{in}}`,String.raw`N_{\gamma,\mathrm{in}}`],
 ['elpr','hidden source discrepancy','본문은 crosslinked, Supplementary Figure 63D의 캡션은 non-crosslinked','두 자료 모두 crosslinked'],
 ['elpr','wrong reference target','href="#news-ref-1"','href="#news-ref-99"'],
 ['xeno','wrong volume denominator','잔존 숙주 피질과 이식편을 합친 피질 조직 부피','생쥐 전체 뇌 부피'],
 ['xeno','wrong calcium sign',String.raw`F-F_0`,String.raw`F+F_0`],
 ['xeno','lost native figure','media="xeno-fig-3"','media="xeno-fig-99"'],
 ['bioopt','node confused with device','B300 GPU 8개','B300 GPU 1개'],
 ['bioopt','wrong Amdahl denominator',String.raw`(1-f)+f/s`,String.raw`(1-f)-f/s`],
 ['bioopt','model-count conflation','14개·13개·14개','36개·36개·36개'],
 ['hydrogen','lost endpoint horizon','2100년까지','2030년까지'],
 ['hydrogen','wrong baseline denominator',String.raw`{K_0-K_1}{K_0}`,String.raw`{K_0-K_1}{K_1}`],
];
for(const [key,label,a,b] of mutations){const s=sources.get(key);assert(s.includes(a),`${label}: mutation applies`);assert.throws(()=>checkArticle(edition.entries.find(e=>e.key===key),s.replaceAll(a,b),false),undefined,label);}
function historic(c){const b=edition.baselineMedia;assert.equal(b.ids.length,77);assert.equal(new Set(b.ids).size,77);for(const id of b.ids)assert(Object.hasOwn(c,id));assert.equal(hash(JSON.stringify(canonical(Object.fromEntries(b.ids.map(id=>[id,c[id]]))))),b.sha256);}
historic(media);
const removed=structuredClone(media);delete removed[edition.baselineMedia.ids[0]];assert.throws(()=>historic(removed));
const changed=structuredClone(media);changed[edition.baselineMedia.ids[1]].caption='changed';assert.throws(()=>historic(changed));
assert.equal(originals.length,11);assert.deepEqual(new Set(originals.map(r=>r.id)),new Set(ids.flat()));
for(const r of originals){const m=media[r.id];for(const k of Object.keys(m))assert.deepEqual(r[k],m[k]);const bytes=fs.readFileSync(new URL('site/assets'+m.src,root));assert.equal(hash(bytes),r.sha256);assert.equal(bytes.length,r.bytes);assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex'),r.blobSha);
 if(m.src.endsWith('.png')){assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));assert.equal(bytes.readUInt32BE(16),r.width);assert.equal(bytes.readUInt32BE(20),r.height);}else{assert.equal(bytes.readUInt16BE(0),0xffd8);}
 assert(r.sourceByteIdentical&&r.visualReview.status==='REVIEWED');assert.equal(r.visualReview.imageSha256,r.sha256);assert(r.alt.length>30&&r.caption.length>60);
 assert.equal(r.license,r.id.startsWith('xeno')?'CC BY-NC-ND 4.0':r.id.startsWith('bioopt')?'원저작자 권리 보유':'CC BY 4.0');
}
assert.equal((read('scripts/browser-news-media-audit.mjs').match(/\.\.\.sep20\.entries/g)||[]).length,2);
if(fs.existsSync(new URL('dist/index.html',root))){const news=read('dist/news/index.html');for(const e of edition.entries){const html=read(`dist/posts/${e.slug}/index.html`);assert(!html.includes('katex-error'));assert(!html.includes('google-adsense-account')&&!html.includes('data-adsense-deferred'));assert(html.includes('Sep 20, 2026')&&html.includes('2026-09-19T15:00:00.000Z'));assert.deepEqual([...html.matchAll(/data-news-figure="([^"]+)"/g)].map(m=>m[1]),e.mediaIds);assert.deepEqual([...html.matchAll(/data-candidate-equation="([^"]+)"/g)].map(m=>m[1]),e.equations);assert(news.includes(`data-news-card="${e.slug}"`));}}
fs.mkdirSync('sep20-review',{recursive:true});const report={articles:edition.entries.map(e=>({slug:e.slug,characters:e.bodyCharacters,originals:e.mediaIds.length,equations:e.equations.length})),mathExpressions:mathCount,numerical,articleMutations:mutations.map(([,label])=>label),historicMedia:77,historicMutations:2,originals:11,scope:'Authored arithmetic, source conditions, byte identities and reader checks; not a rerun of the scientific experiments or an independent peer review.'};fs.writeFileSync('sep20-review/static.json',JSON.stringify(report,null,2));
console.log(`sep20: PASS 4 articles, 11 originals, ${mathCount} math expressions, ${numerical.length} calculations, 12 article and 2 historic-media mutations`);

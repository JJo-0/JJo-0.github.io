import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const edition=JSON.parse(fs.readFileSync(path.join(root,'site/news-edition-20260921.json'),'utf8'));
const media=JSON.parse(fs.readFileSync(path.join(root,'site/news-media.json'),'utf8'));
const provenance=JSON.parse(fs.readFileSync(path.join(root,'site/assets/assets/posts/news-20260921/provenance.json'),'utf8'));
assert.deepEqual(edition.entries.map(e=>e.key),['msvd','fiber','erled']);
assert.equal(provenance.length,9);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const bodyText=s=>s.replace(/^---[\s\S]*?---/,'').replace(/<[^>]+>/g,' ').replace(/\{String\.raw`[^`]*`\}/g,' ').replace(/\s+/g,' ').trim();

for(const row of provenance){
 const item=media[row.id];assert(item, row.id);
 const file=path.join(root,'site/assets',row.src);assert(fs.existsSync(file),file);
 assert.equal(sha(file),row.sha256,row.id);
 assert.equal(item.src,row.src);assert.equal(item.width,row.width);assert.equal(item.height,row.height);
 assert.equal(row.sourceByteIdentical,true);
}
const checks={
 msvd:[
  '130 nm','1024×128','13배','31.0 dB','0.940','0.999','29.9×','19.0×','hardware-calibrated simulation','51.25','51.40','41.6×','23.1×',
  '실제 1024×128 chip의 full LLM fine-tuning이 아니라'
 ],
 fiber:['±60°','400–700 nm','disordered-dispersion encoder','sparsity-constrained','pending patent application 10202602600Y','임상 진단 성능 시험은 아니다'],
 erled:['PLQY를 47%','peak EQE는 <strong>3.26%</strong>','Cr³⁺ broadband sensitization','1.54 μm','wafer-scale CMOS process integration','competing interests가 없다고 선언']
};
for(const e of edition.entries){
 const p=path.join(root,'site/content/posts',e.slug+'.mdx');const src=fs.readFileSync(p,'utf8');
 assert(src.includes('draft: false'));assert(src.includes('publicationTimeZone: Asia/Seoul'));
 assert(src.indexOf('<NewsFigure')<src.indexOf('## 1.'),e.slug);
 for(const id of e.mediaIds)assert.equal((src.match(new RegExp('media="'+id+'"','g'))||[]).length,1,id);
 for(const id of e.equations)assert(src.includes('id="'+id+'"'),id);
 for(const id of e.tableIds)assert(src.includes('id="'+id+'"'),id);
 for(const phrase of checks[e.key])assert(src.includes(phrase),e.key+': '+phrase);
 const body=bodyText(src);assert(body.length>=6500,e.slug+' body too short '+body.length);
 const refs=[...src.matchAll(/data-news-reference="(\d+)"/g)].map(m=>m[1]);assert(refs.length>=2);
 const bare=[...src.matchAll(/\[(\d+)\]/g)].filter(m=>!src.slice(Math.max(0,m.index-160),m.index).includes('data-news-citation'));
 assert.equal(bare.length,0,e.slug+' bare numeric citation');
}
// Explicit numerical refusal checks: mutate the source in memory and require the
// critical distinctions to disappear, proving the guard is bound to the prose.
const msvd=fs.readFileSync(path.join(root,'site/content/posts/2026-09-21-memristive-svd-news.mdx'),'utf8');
for(const [from,to] of [['29.9×','29.9× direct board measurement'],['hardware-calibrated simulation','actual full-chip training'],['51.25','61.25']]){
 const mutated=msvd.replaceAll(from,to);assert.notEqual(mutated,msvd);assert(!mutated.includes(from),from);
}
console.log('sep21-contract: PASS 3 articles, 9 source-pinned originals, numerical/model-scope distinctions and body-depth floor');

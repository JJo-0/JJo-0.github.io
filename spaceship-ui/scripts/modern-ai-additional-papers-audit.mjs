import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const dir='site/assets/assets/posts/modern-ai-additional-papers';
const manifest=JSON.parse(fs.readFileSync(`${dir}/figures.json`,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const expected=[
  ['cfg-fig-4',7,'2207.12598v1',4],['ldm-fig-3',7,'2112.10752v2',3],
  ['score-sde-fig-1',7,'2011.13456v2',1],['score-sde-fig-2',7,'2011.13456v2',2],
  ['barlow-twins-fig-1',8,'2103.03230v3',1],['byol-fig-2',8,'2006.07733v3',2],
  ['moco-fig-1',8,'1911.05722v3',1],['moco-fig-2',8,'1911.05722v3',2],
  ['deepcluster-fig-1',8,'1807.05520v2',1],['swav-fig-1',8,'2006.09882v5',1],
];
const preserved={
  "7": {
    "equations": "5a0bee3712382a42402f50284c469ec37c1554b17a23363c25b1889a5679144b",
    "oldFigures": "382b1d1cb68a4489b76519b07e84bff2d556661d2b7ee422ca00fa5da2cb2c16",
    "markers": "b074adbe2371e43060bf03ad768353764c19d54ff979518a76c9f800a785a085"
  },
  "8": {
    "equations": "1bc1bdf5d49612388eb354a9945c37c5632c1d2d4df99b3a3beff60d7b409d67",
    "oldFigures": "af08a623d76f0fbe9fd24623a427cb2881f058ce8570616c94fa904d1e3b5915",
    "markers": "64450e4d61506dc59c7f6fa1bfdbbe4c9bdf75611ccdfb5cf47a4e264f88cf49"
  }
};
const patterns={equations:/<(?:Math|ModernAiSourceEquation)\b[\s\S]*?\/>/g,oldFigures:/<PaperReadingFigure[\s\S]*?<\/PaperReadingFigure>/g,markers:/\{\/\* source-[\s\S]*?\*\/\}/g};
function validate(texts,records) {
  assert.deepEqual(records.map(r=>[r.id,r.part,r.version,r.figure]),expected,'Exact figure roster/version');
  for(const part of [7,8]) {
    const s=texts[part];
    assert.deepEqual([...s.matchAll(/<AdditionalPaperFigure figure="([^"]+)"/g)].map(m=>m[1]),records.filter(r=>r.part===part).map(r=>r.id));
    for(const [key,pattern] of Object.entries(patterns)) assert.equal(hash(JSON.stringify(s.match(pattern)||[])),preserved[part][key],`Part ${part} preserved ${key}`);
  }
  for(const text of ['Figure 1은 생성 예시','Figure 4가 ImageNet','가로축은 guidance weight가 아니라 IS','1.80','1.55','2.04','Figure 2는 SDE와 probability-flow ODE']) assert(texts[7].includes(text),text);
  for(const text of ['queue가 이 Figure 2에는 그려지지 않았다고','그림에는 한 방향만','feature dimension']) assert(texts[8].includes(text),text);
  const ids=new Set();
  for(const r of records) {
    assert(!ids.has(r.id));ids.add(r.id);
    assert.equal(r.file,`${r.id}.png`);
    assert.equal(r.pdfSource,`https://arxiv.org/pdf/${r.version}`);
    assert.equal(r.source,`https://arxiv.org/abs/${r.version}`);
    assert.equal(r.origin_figure_link,`${r.pdfSource}#page=${r.pdfPage}`);
    assert.equal(r.status,'ACQUIRED');assert.equal(r.local_visual_review.status,'REVIEWED');
    assert.equal(r.local_visual_review.image_sha256,r.sha256);
    const b=fs.readFileSync(path.join(dir,r.file));
    assert.equal(hash(b),r.sha256);assert.equal(b.length,r.bytes);
    assert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
    assert.equal(b.readUInt32BE(16),r.width);assert.equal(b.readUInt32BE(20),r.height);
    assert.equal(r.width,(r.cropPoints[2]-r.cropPoints[0])*r.scale);
    assert.equal(r.height,(r.cropPoints[3]-r.cropPoints[1])*r.scale);
    assert.match(r.pdfSha256,/^[0-9a-f]{64}$/);assert(r.authors.length>10);
  }
}
const texts=Object.fromEntries([7,8].map(p=>[p,fs.readFileSync(`site/content/posts/modern-artificial-intelligence-${p}.mdx`,'utf8')]));
validate(texts,manifest.figures);
const copy=()=>JSON.parse(JSON.stringify(manifest.figures));
const mutants=[
 ['missing original',()=>validate(texts,copy().slice(1))],
 ['wrong figure number',()=>{const a=copy();a[0].figure=1;validate(texts,a);} ],
 ['version mismatch',()=>{const a=copy();a[1].version='2112.10752v1';validate(texts,a);} ],
 ['changed image digest',()=>{const a=copy();a[0].sha256='0'.repeat(64);validate(texts,a);} ],
 ['review not bound to pixels',()=>{const a=copy();a[0].local_visual_review.image_sha256='f'.repeat(64);validate(texts,a);} ],
 ['wrong axis',()=>validate({...texts,7:texts[7].replace('가로축은 guidance weight가 아니라 IS','가로축은 guidance weight')},copy())],
 ['omitted article figure',()=>validate({...texts,8:texts[8].replace('figure="byol-fig-2"','figure="missing"')},copy())],
 ['changed equation',()=>validate({...texts,7:texts[7].replace('s=1+w_','s=2+w_')},copy())],
];
for(const [name,run] of mutants) assert.throws(run,undefined,name);
const rendered=[];
if(fs.existsSync('dist')) {
  for(const part of [7,8]) {
    const html=fs.readFileSync(`dist/posts/2026-08-25-modern-artificial-intelligence-${part}/index.html`,'utf8');
    const expectedIds=expected.filter(r=>r[1]===part).map(r=>r[0]);
    assert.deepEqual([...html.matchAll(/data-additional-figure="([^"]+)"/g)].map(m=>m[1]),expectedIds);
    assert(!html.includes('katex-error'));
    assert.equal([...html.matchAll(new RegExp(`data-formula-id="MAI-P${part}-\\d{3}"`,'g'))].length,part===7?14:10);
    for(const id of expectedIds) assert(html.includes(`/assets/posts/modern-ai-additional-papers/${id}.png`));
    rendered.push(part);
  }
}
fs.mkdirSync('continuation-review/additional',{recursive:true});
fs.writeFileSync('continuation-review/additional/static.json',JSON.stringify({figures:expected,mutationControls:mutants.map(m=>m[0]),preserved,rendered},null,2));
console.log('additional-paper-audit: PASS 10 original figures; exact versions/pixels/review; 8 mutation controls; existing equations/figures/markers preserved. Technical checks do not certify scientific completeness or grant reuse permission.');

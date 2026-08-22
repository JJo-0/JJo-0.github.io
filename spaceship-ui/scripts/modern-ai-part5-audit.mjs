import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd(), issues=[];
const fail=(m)=>issues.push(m);
const readJson=(name)=>JSON.parse(fs.readFileSync(path.join(root,'src','data','modern-ai-part5',name),'utf8'));
const sourceAudit=readJson('source-audit.json');
const pageLedger=readJson('page-ledger.json');
const formulaLedger=readJson('formula-ledger.json');
const contentLedger=readJson('content-ledger.json');
const provenance=readJson('content-provenance.json');
const articlePath=path.join(root,'site','content','posts','modern-artificial-intelligence-5.mdx');
const article=fs.existsSync(articlePath)?fs.readFileSync(articlePath,'utf8'):'';
const EXPECTED={pages:18,sha:'45102cfc6e7add2d671924ca2f3bc2e373270a915236db364f00f9871cd9ba52',size:13823037,formulas:52,display:19,inline:33,sourceContent:135,editorial:5,research:13,figures:34,annotations:15};
const sameSet=(a,b)=>a.size===b.size&&[...a].every((v)=>b.has(v));

if(sourceAudit.source?.sha256!==EXPECTED.sha)fail('canonical source SHA mismatch');
if(sourceAudit.source?.sizeBytes!==EXPECTED.size)fail('canonical source size mismatch');
if(sourceAudit.source?.pages!==EXPECTED.pages)fail('canonical source page count mismatch');
if(sourceAudit.renderInspection?.pagesInspected!==EXPECTED.pages||sourceAudit.renderInspection?.allPagesInspected!==true)fail('render inspection incomplete');
const alt=sourceAudit.alternateCopies?.[0];
if(alt?.pixelIdenticalPages!==18||alt?.renderParityDpi!==200)fail('alternate-copy render parity not locked to 18/18 @200dpi');
if(sourceAudit.sourceComplete!==true)fail('sourceComplete must be true');

const pages=pageLedger.pages??[];
if(pages.length!==EXPECTED.pages)fail(`page ledger count ${pages.length} != ${EXPECTED.pages}`);
if(JSON.stringify(pages.map(p=>p.pdfPage))!==JSON.stringify(Array.from({length:18},(_,i)=>i+1)))fail('page ledger must enumerate 1..18');
for(const p of pages)if(p.status!=='rendered-inspected'||p.textCrossChecked!==true)fail(`page ${p.pdfPage} not rendered-inspected/text-cross-checked`);

const formulas=formulaLedger.formulas??[];
if(formulas.length!==EXPECTED.formulas||formulaLedger.formulaCount!==EXPECTED.formulas)fail('formula count mismatch');
if(formulas.filter(f=>f.display==='display').length!==EXPECTED.display)fail('display formula count mismatch');
if(formulas.filter(f=>f.display==='inline').length!==EXPECTED.inline)fail('inline formula count mismatch');
if(new Set(formulas.map(f=>f.formulaId)).size!==formulas.length)fail('duplicate formula IDs');
for(const [i,f] of formulas.entries()){
  const expected=`MAI-P5-${String(i+1).padStart(3,'0')}`;
  if(f.formulaId!==expected)fail(`${f.formulaId}: expected sequential id ${expected}`);
  const hash=crypto.createHash('sha256').update(f.sourceLatex,'utf8').digest('hex');
  if(hash!==f.sha256)fail(`${f.formulaId}: TeX SHA mismatch`);
  if(f.status!=='source-exact')fail(`${f.formulaId}: unexpected status ${f.status}`);
  if(f.pdfPage<1||f.pdfPage>18)fail(`${f.formulaId}: invalid page`);
}

const content=contentLedger.content??[];
const sourceContent=content.filter(c=>c.layer==='source-reconstructed');
const editorial=content.filter(c=>c.layer==='editorial-audit');
const research=content.filter(c=>c.layer==='2026-08-18 research-update');
if(sourceContent.length!==EXPECTED.sourceContent||contentLedger.sourceContentCount!==EXPECTED.sourceContent)fail('source content count mismatch');
if(editorial.length!==EXPECTED.editorial||contentLedger.editorialContentCount!==EXPECTED.editorial)fail('editorial count mismatch');
if(research.length!==EXPECTED.research||contentLedger.researchContentCount!==EXPECTED.research)fail('research count mismatch');
if((contentLedger.figures??[]).length!==EXPECTED.figures||contentLedger.figureCount!==EXPECTED.figures)fail('figure count mismatch');
if((contentLedger.annotations??[]).length!==EXPECTED.annotations||contentLedger.annotationCount!==EXPECTED.annotations)fail('annotation count mismatch');

const pageContent=new Set(pages.flatMap(p=>p.contentIds??[]));
const sourceIds=new Set(sourceContent.map(c=>c.contentId));
if(!sameSet(pageContent,sourceIds))fail('page ledger content coverage differs from PDF-source content set');
const pageFormula=new Set(pages.flatMap(p=>p.formulaIds??[]));
const formulaIds=new Set(formulas.map(f=>f.formulaId));
if(!sameSet(pageFormula,formulaIds))fail('page ledger formula coverage mismatch');
const pageFigures=new Set(pages.flatMap(p=>p.figureIds??[]));
const figureIds=new Set((contentLedger.figures??[]).map(f=>f.figureId));
if(!sameSet(pageFigures,figureIds))fail('page ledger figure coverage mismatch');
const pageAnnotations=new Set(pages.flatMap(p=>p.annotationIds??[]));
const annotationIds=new Set((contentLedger.annotations??[]).map(a=>a.annotationId));
if(!sameSet(pageAnnotations,annotationIds))fail('page ledger annotation coverage mismatch');

if(!article)fail('Part V article missing');
for(const c of sourceContent)if(!article.includes(`source-content:${c.contentId}`))fail(`${c.contentId}: article marker missing`);
for(const c of editorial)if(!article.includes(`editorial-content:${c.contentId}`))fail(`${c.contentId}: editorial marker missing`);
for(const c of research)if(!article.includes(`research-content:${c.contentId}`))fail(`${c.contentId}: research marker missing`);
for(const f of contentLedger.figures??[])if(!article.includes(`source-figure:${f.figureId}`))fail(`${f.figureId}: figure marker missing`);
for(const a of contentLedger.annotations??[])if(!article.includes(`source-annotation:${a.annotationId}`))fail(`${a.annotationId}: annotation marker missing`);
for(const f of formulas){
  const occurrences=article.split(`part5Formula('${f.formulaId}')`).length-1;
  if(occurrences!==1)fail(`${f.formulaId}: article reference count ${occurrences} != 1`);
}
for(const forbidden of ['source-acquisition','unverified page','TODO','TBD','katex-error'])if(article.includes(forbidden))fail(`article residue: ${forbidden}`);

const registryPath=path.join(root,'src','lib','formula-lessons','registry.mjs');
const registry=fs.existsSync(registryPath)?fs.readFileSync(registryPath,'utf8'):'';
for(const required of ['modern-ai-part5/formula-ledger.json','part: 5','part5:'])if(!registry.includes(required))fail(`formula registry missing ${required}`);

const distPath=path.join(root,'dist','posts','2026-08-23-modern-artificial-intelligence-5','index.html');
if(fs.existsSync(path.join(root,'dist'))){
  if(!fs.existsSync(distPath))fail('rendered Part V output missing');
  else {
    const html=fs.readFileSync(distPath,'utf8');
    const rendered=[...html.matchAll(/data-formula-id="(MAI-P5-\d{3})"/g)].map(m=>m[1]);
    if(rendered.length!==EXPECTED.formulas||new Set(rendered).size!==EXPECTED.formulas)fail(`rendered Part V formula count/uniqueness mismatch: ${rendered.length}`);
    if(!sameSet(new Set(rendered),formulaIds))fail('rendered Part V formula ID coverage mismatch');
    const display=(html.match(/data-formula-part="5"[^>]*data-formula-display="display"/g)??[]).length;
    const inline=(html.match(/data-formula-part="5"[^>]*data-formula-display="inline"/g)??[]).length;
    if(display!==EXPECTED.display)fail(`rendered display ${display} != ${EXPECTED.display}`);
    if(inline!==EXPECTED.inline)fail(`rendered inline ${inline} != ${EXPECTED.inline}`);
    const unreviewed=(html.match(/data-formula-lesson-state="unreviewed"/g)??[]).length;
    if(unreviewed!==EXPECTED.display)fail(`Part V unreviewed lesson states ${unreviewed} != ${EXPECTED.display}`);
    if(html.includes('data-formula-lesson-state="missing"'))fail('Part V lesson state missing');
    for(const required of ['현대 인공지능 V','PDF 원자료 재구성','편집·수학 검증','2026-08-18 최신 연구 업데이트','DINOv3','SigLIP 2'])if(!html.includes(required))fail(`rendered output missing ${required}`);
  }
}

const unique=[...new Set(issues)].sort();
if(unique.length){console.error(`modern-ai-part5-audit: found ${unique.length} issue(s):`);for(const i of unique)console.error(`  - ${i}`);process.exit(1);}
console.log(`modern-ai-part5-audit: PASS (${EXPECTED.pages} pages; ${EXPECTED.formulas} formulas = ${EXPECTED.display} display + ${EXPECTED.inline} inline; ${EXPECTED.sourceContent} PDF-source blocks; ${EXPECTED.figures} visual groups; ${EXPECTED.annotations} annotations; ${EXPECTED.editorial} editorial; ${EXPECTED.research} research; Part V display lessons explicit unreviewed)`);

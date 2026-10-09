import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

const manifest = JSON.parse(fs.readFileSync('site/assets/assets/posts/modern-ai-continuation/figures.json', 'utf8'));
const results = [];
const out = 'continuation-review';
fs.mkdirSync(out, { recursive: true });
let preview, chrome, cdp, sessionId, targetId, active;
const deadline = setTimeout(() => { console.error('continuation-browser: FAIL hard deadline'); process.exit(1); }, 180_000);
async function shot(name) {
  const {data} = await cdp.send('Page.captureScreenshot', {format:'png'}, sessionId);
  fs.writeFileSync(`${out}/${name}.png`, Buffer.from(data,'base64'));
}
async function originalPopup(row, mobile) {
  const selector = `[data-reading-figure="${row.id}"] .reading-image`;
  const point = await waitExpression(cdp, sessionId, `(async () => {
    const a=document.querySelector(${JSON.stringify(selector)});
    if(!a) throw new Error('Missing original image link');
    await document.fonts.ready;
    a.scrollIntoView({block:'center',behavior:'instant'});
    const frame=()=>new Promise(r=>requestAnimationFrame(r));
    await frame();const before=a.getBoundingClientRect();await frame();const r=a.getBoundingClientRect();
    if(Math.abs(before.top-r.top)>.5||Math.abs(before.height-r.height)>.5) return false;
    const x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);
    if(!hit||!(hit===a||a.contains(hit))) return false;
    return {x,y,href:a.href};
  })()`, `stable native original link ${row.id}`);
  const prior = new Set((await cdp.send('Target.getTargets')).targetInfos.map(t=>t.targetId));
  if(mobile) {
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:point.x,y:point.y}]},sessionId);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]},sessionId);
  } else {
    for(const type of ['mouseMoved','mousePressed','mouseReleased']) {
      await cdp.send('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:type==='mouseMoved'?'none':'left',clickCount:1},sessionId);
    }
  }
  let popup;
  const started=Date.now();
  while(Date.now()-started<10000&&!popup) {
    const targets=(await cdp.send('Target.getTargets')).targetInfos;
    popup=targets.find(t=>!prior.has(t.targetId)&&t.type==='page'&&t.url===point.href);
    if(!popup) await new Promise(r=>setTimeout(r,100));
  }
  assert(popup, `${row.id}: one trusted activation must open the exact original PNG`);
  try {
    const {sessionId:ps}=await cdp.send('Target.attachToTarget',{targetId:popup.targetId,flatten:true});
    await cdp.send('Runtime.enable',{},ps);
    await waitExpression(cdp,ps,`(() => {const i=document.querySelector('img');return location.href===${JSON.stringify(point.href)}&&i?.complete&&i.naturalWidth===${row.width}&&i.naturalHeight===${row.height};})()`, `original popup pixels ${row.id}`);
  } finally {
    await cdp.send('Target.closeTarget',{targetId:popup.targetId});
    await cdp.send('Target.activateTarget',{targetId});
    await cdp.send('Page.bringToFront',{},sessionId);
  }
}
try {
  preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);
  ({sessionId,targetId}=await attach(cdp,{normalizeHistoryPath:false}));
  for(const width of [390,1440]) {
    await viewport(cdp,sessionId,{width,height:1200,mobile:width===390,touch:width===390,reduced:true});
    for(const dark of [false,true]) {
      for(const part of [6,7,8]) {
        active={part,width,theme:dark?'dark':'light'};
        await navigate(cdp,sessionId,`/posts/2026-08-25-modern-artificial-intelligence-${part}/`);
        await evaluate(cdp,sessionId,`document.documentElement.classList.toggle('dark',${dark})`);
        const rows=manifest.figures.filter(r=>r.part===part);
        const ids=await evaluate(cdp,sessionId,`[...document.querySelectorAll('article [data-reading-figure]')].map(f=>f.dataset.readingFigure)`);
        assert.deepEqual(ids,rows.map(r=>r.id));
        for(const row of rows) {
          active.figure=row.id;
          await evaluate(cdp,sessionId,`document.querySelector('[data-reading-figure="${row.id}"]').scrollIntoView({block:'center',behavior:'instant'})`);
          await waitExpression(cdp,sessionId,`(() => {const i=document.querySelector('[data-reading-figure="${row.id}"] img');return i?.complete&&i.naturalWidth===${row.width}&&i.naturalHeight===${row.height};})()`, `decoded ${row.id}`);
          const info=await evaluate(cdp,sessionId,`(() => {
            const f=document.querySelector('[data-reading-figure="${row.id}"]'),i=f.querySelector('img'),r=i.getBoundingClientRect();
            return {width:r.width,height:r.height,alt:i.alt,filter:getComputedStyle(i).filter,src:i.getAttribute('src'),caption:f.querySelector('figcaption').textContent,links:[...f.querySelectorAll('.reading-credit a')].map(a=>a.href),overflow:document.documentElement.scrollWidth>innerWidth+2};
          })()`);
          assert(info.width>100&&info.height>30&&info.alt.length>20);
          assert(Math.abs(info.width/info.height-row.width/row.height)<.02);
          assert.equal(info.filter,'none');assert(!info.overflow, `${row.id}: page overflow`);
          assert(info.caption.includes(row.version)&&info.caption.includes(row.authors));
          assert(info.links.includes(row.source)&&info.links.includes(row.origin_figure_link));
          assert.equal(info.src,`/assets/posts/modern-ai-continuation/${row.file}`);
          await originalPopup(row,width===390);
          await evaluate(cdp,sessionId,`(() => {const f=document.querySelector('[data-reading-figure="${row.id}"]');f.scrollIntoView({block:'start',behavior:'instant'});scrollBy(0,-145);})()`);
          await evaluate(cdp,sessionId,'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
          await shot(`${row.id}-${width}-${dark?'dark':'light'}`);
        }
        const end=await evaluate(cdp,sessionId,`({overflow:document.documentElement.scrollWidth>innerWidth+2,mathErrors:document.querySelectorAll('article .katex-error').length,equations:document.querySelectorAll('[data-formula-id^="MAI-P${part}-"]').length,oldFigures:document.querySelectorAll('[data-paper-figure]').length})`);
        assert(!end.overflow&&end.mathErrors===0);assert.equal(end.equations,part===7?14:10);
        assert.equal(end.oldFigures,part===6?5:0);
        results.push({...active,figures:rows.map(r=>r.id),nativeFullSize:true,equations:end.equations});
        console.log('continuation-browser: PASS '+JSON.stringify(results.at(-1)));
      }
    }
  }
  assert.equal(results.length,12);
  fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,results,nativeOriginalActivations:28},null,2));
  console.log('continuation-browser: PASS 12 article/viewport/theme cases; 28 trusted original-image activations');
} catch(error) {
  console.error('continuation-browser: FAIL',error);process.exitCode=1;
  fs.writeFileSync(`${out}/failure.json`,JSON.stringify({active,error:String(error),completed:results},null,2));
  if(cdp&&sessionId) {try{await shot('failure');}catch{ /* Keep the primary failure. */ }}
} finally {
  cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(deadline);process.exit(process.exitCode||0);
}

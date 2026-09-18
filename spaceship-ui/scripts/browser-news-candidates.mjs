import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, poll, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';
const catalogue=JSON.parse(fs.readFileSync(new URL('../site/news-candidates-20260918.json',import.meta.url),'utf8'));
let edition,route;
const media=JSON.parse(fs.readFileSync(new URL('../site/news-media.json',import.meta.url),'utf8'));

const out='candidates-review';fs.mkdirSync(out,{recursive:true});
const results=[];let cdp,sessionId,preview,chrome,activeCase,lastAction;
const deadline=setTimeout(()=>{console.error('candidates-browser: FAIL hard timeout');process.exit(1);},240_000);
const js=(expression)=>evaluate(cdp,sessionId,expression);
const wait=(expression,label)=>waitExpression(cdp,sessionId,expression,label);
async function shot(name){const {data}=await cdp.send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${out}/${name}.png`,Buffer.from(data,'base64'));}
async function point(selector){
  return wait(`(async()=>{
    await document.fonts.ready;
    const a=document.querySelector(${JSON.stringify(selector)});if(!a)throw Error('Missing activation target');
    a.scrollIntoView({block:'center',behavior:'instant'});
    const frame=()=>new Promise(r=>requestAnimationFrame(r));await frame();const r1=a.getBoundingClientRect();await frame();const r=a.getBoundingClientRect();
    if(['x','y','width','height'].some(k=>Math.abs(r[k]-r1[k])>.5))return false;
    const x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);
    if(!(r.width>0&&r.height>0&&y>0&&y<innerHeight&&(hit===a||a.contains(hit))))return false;
    return {x,y,href:a.href||null,path:location.pathname};
  })()`,`hit-testable ${selector}`);
}
async function pointer(selector,mobile){
  const p=await point(selector);lastAction={selector,input:mobile?'touch':'mouse',...p};
  if(mobile){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y}]},sessionId);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]},sessionId);
  }else{
    await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);
    await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',buttons:1,clickCount:1},sessionId);
    await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x,y:p.y,button:'left',buttons:0,clickCount:1},sessionId);
  }
}
async function historyEntry(){const h=await cdp.send('Page.getNavigationHistory',{},sessionId);return h.entries[h.currentIndex].id;}
async function back(id){
  await cdp.send('Page.navigateToHistoryEntry',{entryId:id},sessionId);
  await wait(`location.pathname===${JSON.stringify(route)}&&location.hash===''&&document.readyState==='complete'`,'Back to original article');
  assert.equal(await historyEntry(),id);
  await js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
}
async function enter(selector){
  lastAction={selector,input:'Enter',scriptDisabled:true};
  await cdp.send('Page.bringToFront',{},sessionId);
  await cdp.send('Emulation.setScriptExecutionDisabled',{value:true},sessionId);
  try{
    await cdp.send('DOM.enable',{},sessionId);
    const {root}=await cdp.send('DOM.getDocument',{depth:0},sessionId);
    const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector},sessionId);assert(nodeId>0);
    await cdp.send('DOM.focus',{nodeId},sessionId);
    const focused=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:':focus'},sessionId);assert.equal(focused.nodeId,nodeId);
    // A real Enter includes the CR character. rawKeyDown alone omits the
    // keypress that native summary controls use; send exactly one complete key.
    await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'},sessionId);
    await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
  }finally{await cdp.send('Emulation.setScriptExecutionDisabled',{value:false},sessionId);}
}
async function assertReference(n){
  await wait(`location.pathname===${JSON.stringify(route)}&&location.hash==='#news-ref-${n}'`,`reference ${n}`);
  await wait(`(()=>{const r=document.getElementById('news-ref-${n}')?.getBoundingClientRect();const h=document.querySelector('header')?.getBoundingClientRect();return r&&r.top>=(h?.bottom||0)-2&&r.top<innerHeight&&r.height>0;})()`,'reference below header');
}
async function fullSize(id,mobile){
  const initial=await cdp.send('Target.getTargets');const ids=new Set(initial.targetInfos.map(t=>t.targetId));
  await pointer(`[data-news-figure="${id}"] > a`,mobile);
  const popup=await poll(async()=>{
    const {targetInfos}=await cdp.send('Target.getTargets');return targetInfos.find(t=>t.type==='page'&&!ids.has(t.targetId));
  },'original image popup');
  const attached=await cdp.send('Target.attachToTarget',{targetId:popup.targetId,flatten:true});
  try{
    const expected=new URL(media[id].src,BASE).href;
    await waitExpression(cdp,attached.sessionId,`location.href===${JSON.stringify(expected)}&&document.querySelector('img')?.complete&&document.querySelector('img').naturalWidth===${media[id].width}`,'exact local original image');
  }finally{await cdp.send('Target.closeTarget',{targetId:popup.targetId});await cdp.send('Page.bringToFront',{},sessionId);}
}
try{
  preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);
  ({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
  for (edition of catalogue.entries) for(const width of [390,1440])for(const dark of [false,true]){
    route=`/posts/${edition.slug}/`;
    const mobile=width===390;activeCase={slug:edition.slug,width,theme:dark?'dark':'light'};
    await viewport(cdp,sessionId,{width,height:1000,mobile,touch:mobile,reduced:true});
    await navigate(cdp,sessionId,'/news/');
    const expectedOrder=['2026-09-18-paper2agent-news',...catalogue.entries.map(entry=>entry.slug)];
    const actualOrder=await js(`Array.from(document.querySelectorAll('[data-news-card]')).map(card=>card.getAttribute('data-news-card')).filter(slug=>${JSON.stringify(expectedOrder)}.includes(slug))`);
    assert.deepEqual(actualOrder,expectedOrder,'Existing Top 1 then candidates in editorial order');
    assert.equal(await js(`document.querySelectorAll('[data-news-card="${edition.slug}"]').length`),1);
    await navigate(cdp,sessionId,route);
    await js(`document.documentElement.classList.toggle('dark',${dark})`);
    await js('document.fonts.ready.then(()=>true)');
    // Decode both locally hosted figures before history tests; delayed image
    // layout must not invalidate the native citation hit-test coordinates.
    for(const id of edition.mediaIds){
      await js(`document.querySelector('[data-news-figure="${id}"]').scrollIntoView({block:'center',behavior:'instant'})`);
      await wait(`(()=>{const i=document.querySelector('[data-news-figure="${id}"] img');return i?.complete&&i.naturalWidth>0;})()`,'original figure decoded');
      const actual=await js(`(()=>{const f=document.querySelector('[data-news-figure="${id}"]'),i=f.querySelector('img'),r=i.getBoundingClientRect();return {w:i.naturalWidth,h:i.naturalHeight,src:i.getAttribute('src'),href:f.querySelector('a').getAttribute('href'),alt:i.alt,caption:f.querySelector('figcaption').textContent,filter:getComputedStyle(i).filter,visible:r.width>200&&r.height>35};})()`);
      assert.equal(actual.w,media[id].width);assert.equal(actual.h,media[id].height);assert.equal(actual.src,media[id].src);assert.equal(actual.href,actual.src);
      assert(actual.visible&&actual.alt.length>30&&actual.caption.includes(media[id].license));assert.equal(actual.filter,'none');
      await fullSize(id,mobile);
      // Opening an image in a new tab must not navigate the article itself.
      assert.equal(await js('location.pathname'),route);
      if(id===edition.mediaIds[1])await shot(`${edition.key}-figure-${width}-${dark?'dark':'light'}`);
    }
    for(const name of edition.equations){
      const selector=`[data-candidate-equation="${name}"] > summary`;
      await pointer(selector,mobile);
      await wait(`document.querySelector('[data-candidate-equation="${name}"]').open`,'pointer opens explanation');
      const body=await js(`document.querySelector('[data-candidate-equation="${name}"] .candidate-equation__explanation').textContent`);
      assert(body.length>170&&!body.includes('수식의 역할과 기호만 확인'));
      if(name===edition.equations[0])await shot(`${edition.key}-equation-${width}-${dark?'dark':'light'}`);
      await enter(selector);await wait(`!document.querySelector('[data-candidate-equation="${name}"]').open`,'Enter closes explanation');
      await enter(selector);await wait(`document.querySelector('[data-candidate-equation="${name}"]').open`,'Enter opens explanation with scripts disabled');
      await enter(selector);await wait(`!document.querySelector('[data-candidate-equation="${name}"]').open`,'Enter restores closed explanation');
    }
    const referenceNumbers=Object.keys(edition.citationCounts).filter(n=>edition.citationCounts[n]>0);
    for(const n of referenceNumbers){
      const selector=`article a[data-news-citation="${n}"]`;
      const before=await historyEntry();
      const same=await js(`new URL(document.querySelector(${JSON.stringify(selector)}).href).pathname===location.pathname`);assert(same);
      await pointer(selector,mobile);await assertReference(n);await back(before);
      await enter(selector);await assertReference(n);await back(before);
    }
    const final=await js(`(()=>{const s=document.querySelector('article small');return {overflow:document.documentElement.scrollWidth>innerWidth+2,katexErrors:document.querySelectorAll('article .katex-error').length,citations:document.querySelectorAll('article [data-news-citation]').length,details:document.querySelectorAll('article [data-candidate-equation]').length,notesSmall:!!s&&parseFloat(getComputedStyle(s).fontSize)<parseFloat(getComputedStyle(s.parentElement).fontSize)};})()`);
    assert(!final.overflow&&final.katexErrors===0&&final.details===edition.equations.length&&final.notesSmall);
    assert.equal(final.citations,Object.values(edition.citationCounts).reduce((a,b)=>a+b,0));
    await js('scrollTo({top:0,behavior:"instant"})');await shot(`${edition.key}-opening-${width}-${dark?'dark':'light'}`);
    results.push({...activeCase,originals:2,originalPointerActivations:2,equationPointerActivations:edition.equations.length,equationKeyboardActivations:edition.equations.length*3,sourcePointerActivations:referenceNumbers.length,sourceKeyboardActivations:referenceNumbers.length,sourceBackChecks:referenceNumbers.length*2,notesSmall:true});
    console.log('candidates-browser: PASS '+JSON.stringify(results.at(-1)));
  }
  assert.equal(results.length,catalogue.entries.length*4);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,results},null,2));
}catch(error){
  process.exitCode=1;console.error('candidates-browser: FAIL',error);
  fs.writeFileSync(`${out}/failure.json`,JSON.stringify({activeCase,lastAction,error:String(error),completed:results},null,2));
  if(cdp&&sessionId)try{await cdp.send('Emulation.setScriptExecutionDisabled',{value:false},sessionId);await shot('failure');}catch{}
}finally{cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(deadline);process.exit(process.exitCode||0);}

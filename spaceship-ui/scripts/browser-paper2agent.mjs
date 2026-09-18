import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, poll, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

const slug='2026-09-18-paper2agent-news', route=`/posts/${slug}/`;
const edition=JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260918.json',import.meta.url),'utf8'));
const media=JSON.parse(fs.readFileSync(new URL('../site/news-media.json',import.meta.url),'utf8'));
const out='paper2agent-review';fs.mkdirSync(out,{recursive:true});
const results=[];
let preview,chrome,cdp,sessionId,targetId,activeCase,lastAction;
const deadline=setTimeout(()=>{console.error('paper2agent-browser: FAIL hard timeout');process.exit(1);},180_000);
const value=(expression)=>evaluate(cdp,sessionId,expression);
const wait=(expression,label)=>waitExpression(cdp,sessionId,expression,label);
async function shot(name) {
  const {data}=await cdp.send('Page.captureScreenshot',{format:'png'},sessionId);
  fs.writeFileSync(`${out}/${name}.png`,Buffer.from(data,'base64'));
}
async function click(selector,mobile) {
  lastAction={selector,mobile};
  const point=await wait(`(async()=>{
    await document.fonts.ready;
    const el=document.querySelector(${JSON.stringify(selector)});if(!el)return false;
    el.scrollIntoView({block:'center',behavior:'instant'});
    const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
    await frame();const a=el.getBoundingClientRect();await frame();const b=el.getBoundingClientRect();
    if(['x','y','width','height'].some(k=>Math.abs(a[k]-b[k])>.5))return false;
    const x=b.left+b.width/2,y=b.top+b.height/2,hit=document.elementFromPoint(x,y);
    return b.width>0 && b.height>0 && (hit===el || el.contains(hit)) ? {x,y} : false;
  })()`,`stable target ${selector}`);
  // One actual activation after geometry/hit testing. Never synthesize .click().
  if(mobile){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]},sessionId);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]},sessionId);
  }else{
    await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point},sessionId);
    await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',buttons:1,clickCount:1},sessionId);
    await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',buttons:0,clickCount:1},sessionId);
  }
}
async function enter(selector) {
  lastAction={selector,input:'Enter',scriptDisabled:true};
  await cdp.send('Page.bringToFront',{},sessionId);
  await cdp.send('Emulation.setScriptExecutionDisabled',{value:true},sessionId);
  try{
    await cdp.send('DOM.enable',{},sessionId);
    const {root}=await cdp.send('DOM.getDocument',{depth:0},sessionId);
    const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector},sessionId);assert(nodeId>0);
    await cdp.send('DOM.focus',{nodeId},sessionId);
    const focused=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:':focus'},sessionId);assert.equal(focused.nodeId,nodeId);
    await cdp.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
    await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
  }finally{await cdp.send('Emulation.setScriptExecutionDisabled',{value:false},sessionId);}
}
async function destination(n){
  await wait(`location.origin===${JSON.stringify(new URL(BASE).origin)} && location.pathname===${JSON.stringify(route)} && location.hash==='#news-ref-${n}'`,'correct citation fragment');
  await wait(`(()=>{const r=document.getElementById('news-ref-${n}').getBoundingClientRect(),h=document.querySelector('header')?.getBoundingClientRect();return r.top>=(h?.bottom||0)-2 && r.top<innerHeight && r.height>0;})()`,'reference below fixed header');
}
async function back(id){
  await cdp.send('Page.navigateToHistoryEntry',{entryId:id},sessionId);
  await wait(`location.pathname===${JSON.stringify(route)} && location.hash==='' && document.readyState==='complete'`,'Back to article');
  const history=await cdp.send('Page.getNavigationHistory',{},sessionId);assert.equal(history.entries[history.currentIndex].id,id);
}
try{
  preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);
  ({sessionId,targetId}=await attach(cdp,{normalizeHistoryPath:false}));
  for(const width of [390,1440]){
    await viewport(cdp,sessionId,{width,height:1100,mobile:width===390,touch:width===390,reduced:true});
    await navigate(cdp,sessionId,'/news/');
    assert.equal(await value(`document.querySelectorAll('[data-news-card="${slug}"]').length`),1);
    for(const theme of ['light','dark']){
      activeCase={width,theme};await navigate(cdp,sessionId,route);
      await value(`document.documentElement.classList.toggle('dark',${theme==='dark'});document.fonts.ready.then(()=>true)`);
      // Decode both originals before interacting with tiny citation targets.
      for(const id of edition.mediaIds){
        await value(`document.querySelector('[data-news-figure="${id}"]').scrollIntoView({block:'center',behavior:'instant'})`);
        await wait(`(()=>{const i=document.querySelector('[data-news-figure="${id}"] img');return i?.complete&&i.naturalWidth>0;})()`,`decode ${id}`);
        const r=await value(`(()=>{const f=document.querySelector('[data-news-figure="${id}"]'),i=f.querySelector('img'),a=f.querySelector('a'),r=i.getBoundingClientRect();return{src:i.getAttribute('src'),href:a.getAttribute('href'),width:i.naturalWidth,height:i.naturalHeight,displayWidth:r.width,alt:i.alt,caption:f.querySelector('figcaption').textContent,filter:getComputedStyle(i).filter};})()`);
        assert.equal(r.src,media[id].src);assert.equal(r.href,r.src);assert.equal(r.width,media[id].width);assert.equal(r.height,media[id].height);
        assert(r.displayWidth>200 && r.alt.length>30 && r.caption.includes('CC BY 4.0'));assert.equal(r.filter,'none');
        if(id==='paper2agent-scanpy')await shot(`scanpy-${width}-${theme}`);
        const before=new Set((await cdp.send('Target.getTargets')).targetInfos.map(t=>t.targetId));
        await click(`[data-news-figure="${id}"] > a`,width===390);
        const popup=await poll(async()=>{
          const added=(await cdp.send('Target.getTargets')).targetInfos.filter(t=>t.type==='page'&&!before.has(t.targetId));
          assert(added.length<=1,'single full-size page');return added[0];
        },'native image tab');
        try{
          const attached=await cdp.send('Target.attachToTarget',{targetId:popup.targetId,flatten:true});
          await cdp.send('Runtime.enable',{},attached.sessionId);
          await waitExpression(cdp,attached.sessionId,`location.href===${JSON.stringify(new URL(r.src,BASE).href)} && document.querySelector('img')?.complete && document.querySelector('img').naturalWidth===${r.width}`,'exact original image in native tab');
        }finally{
          await cdp.send('Target.closeTarget',{targetId:popup.targetId});await cdp.send('Target.activateTarget',{targetId});await cdp.send('Page.bringToFront',{},sessionId);
        }
      }
      assert.equal(await value(`document.querySelectorAll('article .katex-error').length`),0);
      for(const key of ['papers','tools','accuracy']){
        const detail=`[data-p2a-equation="${key}"]`,summary=`${detail} > summary`;
        assert.equal(await value(`document.querySelector('${detail}').open`),false);
        await click(summary,width===390);await wait(`document.querySelector('${detail}').open`,'pointer opens explanation');
        const content=await value(`document.querySelector('${detail} .explanation').textContent`);assert(content.length>180);
        if(key==='tools')assert(content.includes('분자 593')&&content.includes('분모 599'));
        if(key==='papers')await shot(`equation-${width}-${theme}`);
        await enter(summary);await wait(`!document.querySelector('${detail}').open`,'Enter closes explanation');
        await enter(summary);await wait(`document.querySelector('${detail}').open`,'Enter opens explanation');
        await enter(summary);await wait(`!document.querySelector('${detail}').open`,'Enter resets explanation');
      }
      const actual=await value(`Array.from(document.querySelectorAll('article a[data-news-reference]')).map(a=>({number:Number(a.dataset.newsReference),url:a.getAttribute('href')}))`);assert.deepEqual(actual,edition.references);
      for(const {number} of edition.references){
        const history=await cdp.send('Page.getNavigationHistory',{},sessionId),id=history.entries[history.currentIndex].id;
        const selector=`article a[data-news-citation="${number}"]`;
        await click(selector,width===390);await destination(number);await back(id);
        await enter(selector);await destination(number);await back(id);
      }
      const page=await value(`({overflow:document.documentElement.scrollWidth>innerWidth+2,figures:document.querySelectorAll('article [data-news-figure]').length,notes:[...document.querySelectorAll('article small')].map(n=>({font:parseFloat(getComputedStyle(n).fontSize),parent:parseFloat(getComputedStyle(n.parentElement).fontSize)}))})`);
      assert(!page.overflow);assert.equal(page.figures,2);assert(page.notes.length>=2);assert(page.notes.every(n=>n.font<n.parent));
      await value(`scrollTo({top:0,behavior:'instant'})`);await shot(`opening-${width}-${theme}`);
      results.push({...activeCase,images:2,trustedImageActivations:2,explainedEquations:3,nativeEquationKeyActivations:9,citationPointerActivations:4,citationKeyActivations:4,back:true});
      console.log('paper2agent-browser: PASS '+JSON.stringify(results.at(-1)));
    }
  }
  assert.equal(results.length,4);
  fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,slug,results},null,2));
}catch(error){
  process.exitCode=1;console.error('paper2agent-browser: FAIL',error);
  fs.writeFileSync(`${out}/failure.json`,JSON.stringify({activeCase,lastAction,error:String(error),completed:results},null,2));
  if(cdp&&sessionId)try{await shot('failure');}catch{/* Preserve original error. */}
}finally{
  cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(deadline);process.exit(process.exitCode||0);
}

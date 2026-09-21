import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, poll, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

const edition=JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260921.json',import.meta.url),'utf8'));
const media=JSON.parse(fs.readFileSync(new URL('../site/news-media.json',import.meta.url),'utf8'));
const out='sep21-review';fs.mkdirSync(out,{recursive:true});
const results=[];let cdp,sessionId,preview,chrome,route,activeCase,lastAction;
const deadline=setTimeout(()=>{console.error('sep21-browser: FAIL hard timeout');process.exit(1);},240_000);
const js=(x)=>evaluate(cdp,sessionId,x);
const wait=(x,l)=>waitExpression(cdp,sessionId,x,l);
async function shot(name){const {data}=await cdp.send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${out}/${name}.png`,Buffer.from(data,'base64'));}
async function point(selector){
  return wait(`(async()=>{await document.fonts.ready;const a=document.querySelector(${JSON.stringify(selector)});if(!a)throw Error('missing target');a.scrollIntoView({block:'center',behavior:'instant'});const f=()=>new Promise(r=>requestAnimationFrame(r));await f();const a1=a.getBoundingClientRect();await f();const r=a.getBoundingClientRect();if(['x','y','width','height'].some(k=>Math.abs(r[k]-a1[k])>.5))return false;const x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y);if(!(r.width>0&&r.height>0&&y>0&&y<innerHeight&&(h===a||a.contains(h))))return false;return{x,y};})()`,`hit ${selector}`);
}
async function pointer(selector,mobile){const p=await point(selector);lastAction={selector,input:mobile?'touch':'mouse',...p};if(mobile){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]},sessionId);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]},sessionId);}else{await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',buttons:1,clickCount:1},sessionId);await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x,y:p.y,button:'left',buttons:0,clickCount:1},sessionId);}}
async function enter(selector){
  await cdp.send('Page.bringToFront',{},sessionId);await cdp.send('Emulation.setScriptExecutionDisabled',{value:true},sessionId);
  try{await cdp.send('DOM.enable',{},sessionId);const {root}=await cdp.send('DOM.getDocument',{depth:0},sessionId);const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector},sessionId);assert(nodeId>0);await cdp.send('DOM.focus',{nodeId},sessionId);await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'},sessionId);await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);}
  finally{await cdp.send('Emulation.setScriptExecutionDisabled',{value:false},sessionId);}
}
async function historyEntry(){const h=await cdp.send('Page.getNavigationHistory',{},sessionId);return h.entries[h.currentIndex].id;}
async function back(id){await cdp.send('Page.navigateToHistoryEntry',{entryId:id},sessionId);await wait(`location.pathname===${JSON.stringify(route)}&&location.hash===''&&document.readyState==='complete'`,'back');}
async function fullSize(id,mobile){
  const initial=await cdp.send('Target.getTargets');const ids=new Set(initial.targetInfos.map(t=>t.targetId));await pointer(`[data-news-figure="${id}"] > a`,mobile);
  const popup=await poll(async()=>{const {targetInfos}=await cdp.send('Target.getTargets');return targetInfos.find(t=>t.type==='page'&&!ids.has(t.targetId));},'image popup');
  const a=await cdp.send('Target.attachToTarget',{targetId:popup.targetId,flatten:true});
  try{const expected=new URL(media[id].src,BASE).href;await waitExpression(cdp,a.sessionId,`location.href===${JSON.stringify(expected)}&&document.querySelector('img')?.complete&&document.querySelector('img').naturalWidth===${media[id].width}`,'exact original');}
  finally{await cdp.send('Target.closeTarget',{targetId:popup.targetId});await cdp.send('Page.bringToFront',{},sessionId);}
}
try{
  preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
  for(const entry of edition.entries)for(const width of [390,1440])for(const dark of [false,true]){
    const mobile=width===390;route=`/posts/${entry.slug}/`;activeCase={slug:entry.slug,width,theme:dark?'dark':'light'};
    await viewport(cdp,sessionId,{width,height:1000,mobile,touch:mobile,reduced:true});
    await navigate(cdp,sessionId,'/news/');
    assert.equal(await js(`document.querySelector('[data-news-card="${entry.slug}"]')?.closest('[data-news-date]')?.getAttribute('data-news-date')`),'2026-09-21');
    await navigate(cdp,sessionId,route);await js(`document.documentElement.classList.toggle('dark',${dark})`);await js('document.fonts.ready.then(()=>true)');
    assert(await js(`Array.from(document.querySelectorAll('time')).some(t=>t.dateTime==='2026-09-20T15:00:00.000Z'&&t.textContent.includes('Sep 21, 2026'))`));
    assert(!(await js(`!!document.querySelector('[data-adsense-deferred],meta[name="google-adsense-account"]')`)));
    for(const id of entry.mediaIds){await js(`document.querySelector('[data-news-figure="${id}"]').scrollIntoView({block:'center',behavior:'instant'})`);await wait(`(()=>{const i=document.querySelector('[data-news-figure="${id}"] img');return i?.complete&&i.naturalWidth===${media[id].width};})()`,'decode');const v=await js(`(()=>{const f=document.querySelector('[data-news-figure="${id}"]'),i=f.querySelector('img'),r=i.getBoundingClientRect();return{visible:r.width>200&&r.height>35,src:i.getAttribute('src'),filter:getComputedStyle(i).filter,caption:f.querySelector('figcaption').textContent}})()`);assert(v.visible&&v.src===media[id].src&&v.filter==='none'&&v.caption.includes('CC BY-NC-ND 4.0'));await fullSize(id,mobile);}
    for(const id of entry.equations){const sel=`[data-candidate-equation="${id}"] > summary`;await pointer(sel,mobile);await wait(`document.querySelector('[data-candidate-equation="${id}"]').open`,'open equation');const body=await js(`document.querySelector('[data-candidate-equation="${id}"] .candidate-equation__explanation').textContent`);assert(body.length>170&&!body.includes('수식의 역할과 기호만 확인'));await enter(sel);await wait(`!document.querySelector('[data-candidate-equation="${id}"]').open`,'keyboard close');}
    const table=await js(`(()=>{const r=document.querySelector('[data-candidate-table="${entry.tableIds[0]}"]');return{exists:!!r?.querySelector('table'),overflow:document.documentElement.scrollWidth>innerWidth+2}})()`);assert(table.exists&&!table.overflow);
    for(const n of Object.keys(entry.citationCounts)){const sel=`article a[data-news-citation="${n}"]`;const before=await historyEntry();await pointer(sel,mobile);await wait(`location.hash==='#news-ref-${n}'`,`ref ${n}`);await back(before);}
    await js('scrollTo({top:0,behavior:"instant"})');await shot(`${entry.key}-opening-${width}-${dark?'dark':'light'}`);
    results.push({...activeCase,originals:entry.mediaIds.length,equations:entry.equations.length});
    console.log('sep21-browser: PASS '+JSON.stringify(results.at(-1)));
  }
  assert.equal(results.length,12);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,results},null,2));
}catch(error){process.exitCode=1;console.error('sep21-browser: FAIL',error);fs.writeFileSync(`${out}/failure.json`,JSON.stringify({activeCase,lastAction,error:String(error),completed:results},null,2));if(cdp&&sessionId)try{await shot('failure')}catch{}}
finally{cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(deadline);process.exit(process.exitCode||0);}

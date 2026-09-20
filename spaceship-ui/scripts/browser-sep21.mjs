import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, poll, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

const edition=JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260921.json',import.meta.url),'utf8'));
const media=JSON.parse(fs.readFileSync(new URL('../site/news-media.json',import.meta.url),'utf8'));
const out='sep21-review';fs.mkdirSync(out,{recursive:true});
let cdp,sessionId,preview,chrome,active,lastAction;const results=[];
const deadline=setTimeout(()=>{console.error('sep21-browser: FAIL hard timeout');process.exit(1);},240000);
const js=e=>evaluate(cdp,sessionId,e);const wait=(e,l,t)=>waitExpression(cdp,sessionId,e,l,t);

async function shot(name){const {data}=await cdp.send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${out}/${name}.png`,Buffer.from(data,'base64'));}
async function point(selector){
 return wait(`(async()=>{await document.fonts.ready;const a=document.querySelector(${JSON.stringify(selector)});if(!a)throw Error('missing target');
 a.scrollIntoView({block:'center',behavior:'instant'});const f=()=>new Promise(r=>requestAnimationFrame(r));await f();const p=a.getBoundingClientRect();await f();const r=a.getBoundingClientRect();
 if(['x','y','width','height'].some(k=>Math.abs(r[k]-p[k])>.5))return false;const x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y);
 return r.width>0&&r.height>0&&(h===a||a.contains(h))?{x,y,href:a.href||null}:false;})()`,`stable target ${selector}`);
}
async function pointer(selector,mobile){const p=await point(selector);lastAction={selector,mobile,...p};if(mobile){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y}]},sessionId);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]},sessionId);}else{await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',buttons:1,clickCount:1},sessionId);await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x,y:p.y,button:'left',buttons:0,clickCount:1},sessionId);}}
async function enter(selector){await cdp.send('Page.bringToFront',{},sessionId);await cdp.send('Emulation.setScriptExecutionDisabled',{value:true},sessionId);try{await cdp.send('DOM.enable',{},sessionId);const {root}=await cdp.send('DOM.getDocument',{depth:0},sessionId);const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector},sessionId);assert(nodeId>0);await cdp.send('DOM.focus',{nodeId},sessionId);await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'},sessionId);await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);}finally{await cdp.send('Emulation.setScriptExecutionDisabled',{value:false},sessionId);}}
async function original(id,mobile){
 const before=await cdp.send('Target.getTargets');const ids=new Set(before.targetInfos.map(t=>t.targetId));await pointer(`[data-news-figure="${id}"] > a`,mobile);
 const popup=await poll(async()=>{const {targetInfos}=await cdp.send('Target.getTargets');return targetInfos.find(t=>t.type==='page'&&!ids.has(t.targetId));},'source image popup');
 const {sessionId:pop}=await cdp.send('Target.attachToTarget',{targetId:popup.targetId,flatten:true});
 try{const expected=new URL(media[id].src,BASE).href;await waitExpression(cdp,pop,`location.href===${JSON.stringify(expected)}&&document.querySelector('img')?.complete&&document.querySelector('img').naturalWidth===${media[id].width}`,'exact original image',20000);}
 finally{await cdp.send('Target.closeTarget',{targetId:popup.targetId});await cdp.send('Page.bringToFront',{},sessionId);}
}
try{
 preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
 for(const row of edition.entries)for(const width of [390,1440])for(const dark of [false,true]){
   active={key:row.key,width,theme:dark?'dark':'light'};const mobile=width===390;await viewport(cdp,sessionId,{width,height:1000,mobile,touch:mobile,reduced:true});
   await navigate(cdp,sessionId,'/news/');assert.equal(await js(`document.querySelector('[data-news-card="${row.slug}"]')?.closest('[data-news-date]')?.dataset.newsDate`),'2026-09-21');
   await navigate(cdp,sessionId,`/posts/${row.slug}/`);await js(`document.documentElement.classList.toggle('dark',${dark})`);await js('document.fonts.ready.then(()=>true)');
   assert(!(await js(`!!document.querySelector('[data-adsense-deferred],meta[name="google-adsense-account"]')`)));
   for(const id of row.mediaIds){await js(`document.querySelector('[data-news-figure="${id}"]').scrollIntoView({block:'center',behavior:'instant'})`);await wait(`(()=>{const i=document.querySelector('[data-news-figure="${id}"] img');return i?.complete&&i.naturalWidth===${media[id].width}&&i.naturalHeight===${media[id].height};})()`,`decoded ${id}`,30000);await original(id,mobile);}
   for(const id of row.equations){const sel=`[data-candidate-equation="${id}"] > summary`;await pointer(sel,mobile);await wait(`document.querySelector('[data-candidate-equation="${id}"]').open`,'pointer opens equation');const text=await js(`document.querySelector('[data-candidate-equation="${id}"] .candidate-equation__explanation').textContent`);assert(text.length>180&&!text.includes('수식의 역할과 기호만 확인'));await enter(sel);await wait(`!document.querySelector('[data-candidate-equation="${id}"]').open`,'Enter closes');await enter(sel);await wait(`document.querySelector('[data-candidate-equation="${id}"]').open`,'Enter opens');}
   const state=await js(`({overflow:document.documentElement.scrollWidth>innerWidth+2,katexErrors:document.querySelectorAll('.katex-error').length,figures:document.querySelectorAll('article [data-news-figure]').length,eq:document.querySelectorAll('article [data-candidate-equation]').length,notes:[...document.querySelectorAll('article small')].some(n=>parseFloat(getComputedStyle(n).fontSize)<parseFloat(getComputedStyle(n.parentElement).fontSize))})`);
   assert(!state.overflow&&state.katexErrors===0&&state.figures===row.mediaIds.length&&state.eq===row.equations.length&&state.notes,JSON.stringify(state));
   await js('scrollTo({top:0,behavior:"instant"})');await shot(`${row.key}-opening-${width}-${dark?'dark':'light'}`);results.push({...active,figures:state.figures,equations:state.eq});
   console.log('sep21-browser: PASS '+JSON.stringify(results.at(-1)));
 }
 assert.equal(results.length,12);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,results},null,2));
}catch(error){process.exitCode=1;console.error('sep21-browser: FAIL',error);fs.writeFileSync(`${out}/failure.json`,JSON.stringify({active,lastAction,error:String(error),completed:results},null,2));if(cdp&&sessionId)try{await cdp.send('Emulation.setScriptExecutionDisabled',{value:false},sessionId);await shot('failure');}catch{}}
finally{cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(deadline);process.exit(process.exitCode||0);}

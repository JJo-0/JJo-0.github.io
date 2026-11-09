import fs from 'node:fs';
import assert from 'node:assert/strict';
import {startPreview,startChrome,Cdp,attach,stopChild,removeProfile,evaluate,navigate,viewport,waitExpression} from './browser-smoke-harness.mjs';
let preview,chrome,cdp;
const out = process.env.JJO_READER_ARTIFACTS || '/private/tmp/jjo-reader-layout';
fs.mkdirSync(out, { recursive: true });
async function shot(s,name){const r=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},s);fs.writeFileSync(out+'/'+name+'.png',Buffer.from(r.data,'base64'));}
try {
 preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);const {sessionId:s}=await attach(cdp);
 for(const width of [320,390,1440]){
  await viewport(cdp,s,{width,height:1000,mobile:width<500,touch:width<500,reduced:true});
  for(const slug of ['rl-robot-learning-ch01-introduction','rl-robot-learning-ch02-control-mdp','2025-05-16-mordern-artificial-intelligence']){
   await navigate(cdp,s,'/posts/'+slug+'/');
   await waitExpression(cdp,s,"!!document.querySelector('article .table-scroll table')",'Table rendered');
   const total=await evaluate(cdp,s,"document.querySelectorAll('article .table-scroll').length");
   for(let index=0;index<Math.min(total,3);index++){
    await evaluate(cdp,s,`document.querySelectorAll('article .table-scroll')[${index}].scrollIntoView({block:'center',behavior:'instant'})`);
    await evaluate(cdp,s,'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const g=await evaluate(cdp,s,`(()=>{const w=document.querySelectorAll('article .table-scroll')[${index}], t=w.querySelector('table'), row=t.rows[0], a=t.getBoundingClientRect(),b=row.getBoundingClientRect();return {table:a.width,row:b.width,container:w.clientWidth,scroll:w.scrollWidth,display:getComputedStyle(t).display,overflow:document.documentElement.scrollWidth-innerWidth};})()`);
    assert.equal(g.display,'table');assert(Math.abs(g.table-g.row)<2,JSON.stringify(g));assert(g.overflow<=2,JSON.stringify(g));
    if(width===1440)assert(g.table>=g.container-2,JSON.stringify(g));
    await shot(s,slug+'-'+index+'-'+width);
   }
   console.log('PASS table grid/scroll',slug,width,total);
  }
 }
 // Use an actual published series member discovered from the rendered listing.
 await navigate(cdp,s,'/posts/');
 const href=await evaluate(cdp,s,"document.querySelector('[data-series-group=\"data-structures-coding-tests\"] a[href^=\"/posts/\"]')?.getAttribute('href')");assert(href);
 await navigate(cdp,s,href);
 assert(await evaluate(cdp,s,"document.querySelector('[data-series-reading-navigation]')?.dataset.seriesReadingNavigation==='data-structures-coding-tests'"));
 const next=await evaluate(cdp,s,"document.querySelector('[data-series-reading-navigation] [rel=next]')?.getAttribute('href')");assert(next);
 await evaluate(cdp,s,`document.querySelector('[data-series-reading-navigation] [rel=next]').scrollIntoView({block:'center',behavior:'instant'})`);
 await evaluate(cdp,s,'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
 const point=await evaluate(cdp,s,`(()=>{const r=document.querySelector('[data-series-reading-navigation] [rel=next]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1},s);
 await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1},s);
 await waitExpression(cdp,s,`${JSON.stringify([next,next.replace(/\/$/,'')])}.includes(location.pathname)`,'Other series native next link');
 assert(await evaluate(cdp,s,"!!document.querySelector('[data-series-reading-navigation] [rel=prev]')"));console.log('PASS other series navigation',href,next);
} finally {cdp?.close();await stopChild(chrome?.child);await stopChild(preview);if(chrome)removeProfile(chrome.profile);}
process.exit(0);

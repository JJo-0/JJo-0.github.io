// Controlled cold/warm comparison of independently built variants A/B/C/D.
// All previews must be running on distinct origins with identical content.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  Cdp, attach, evaluate, navigate, viewport, waitExpression, startChrome,
  stopChild, removeProfile, sleep,
} from './browser-smoke-harness.mjs';

const variants = JSON.parse(process.env.JJO_HOME_VARIANTS || '{}');
const names = Object.keys(variants);
assert(names.includes('A') && names.includes('D'), 'At least A (baseline) and D (combined) are required');
assert(names.every(name => ['A','B','C','D'].includes(name)));
const origins = new Set();
for (const name of names) {
  const {url, sha} = variants[name];
  const parsed = new URL(url);
  assert(['localhost','127.0.0.1','[::1]'].includes(parsed.hostname), 'Use locally built preview URLs, not changing public deployments');
  assert(/^[0-9a-f]{40}$/.test(sha), 'Record the exact tested source SHA');
  assert(!origins.has(parsed.origin), 'Use distinct preview origins');
  origins.add(parsed.origin);
}
const repeats = Number(process.env.JJO_HOME_REPEATS || 3);
assert(Number.isInteger(repeats) && repeats >= 1 && repeats <= 10);
const output = process.env.JJO_HOME_AB_OUTPUT || 'mobile-performance/home-ab.json';
const rows = [];
let chrome, cdp;

async function measure(name, width, route, repeat, warm) {
  const variant = variants[name];
  const mobile = width === 390;
  const target = await attach(cdp,{normalizeHistoryPath:false});
  const id = target.sessionId;
  try {
    await viewport(cdp,id,{width,height:844,mobile,touch:mobile,reduced:false});
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:mobile?4:1},id);
    await cdp.send('Network.setCacheDisabled',{cacheDisabled:!warm},id);
    await cdp.send('Performance.enable',{},id);
    await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:
      "window.__homePerf={lcp:0,long:[],draws:0};"+
      "try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__homePerf.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});}catch{}"+
      "try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__homePerf.long.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});}catch{}"+
      "const clear=CanvasRenderingContext2D.prototype.clearRect;CanvasRenderingContext2D.prototype.clearRect=function(...a){if(this.canvas.matches('[data-ascii-art]'))window.__homePerf.draws++;return clear.apply(this,a);};"
    },id);
    const url = new URL(route,variant.url).href;
    if (warm) {
      // Seed the HTTP cache, then perform a real reload and confirm a new document.
      await navigate(cdp,id,url);
      await sleep(1000);
      const previous = await evaluate(cdp,id,'performance.timeOrigin');
      await cdp.send('Page.reload',{},id);
      await waitExpression(cdp,id,'document.readyState==="complete" && performance.timeOrigin!=='+previous,'warm reload');
    } else {
      await navigate(cdp,id,url);
    }
    await sleep(2000);
    const initial = await evaluate(cdp,id,"(() => {const n=performance.getEntriesByType('navigation')[0],r=performance.getEntriesByType('resource'),f=performance.getEntriesByName('first-contentful-paint')[0]?.startTime??null;return {htmlTransferBytes:n.transferSize,htmlDecodedBytes:n.decodedBodySize,resourceTransferBytes:r.reduce((s,e)=>s+e.transferSize,0),resourceCount:r.length,domContentLoadedMs:n.domContentLoadedEventEnd,fcpMs:f,observedLcpMs:window.__homePerf.lcp||null,longTaskExcessMs:window.__homePerf.long.filter(e=>f!==null&&e.start>=f).reduce((s,e)=>s+Math.max(0,e.duration-50),0),profileRequests:r.filter(e=>e.name.includes('mouse_surprised')).map(e=>({url:e.name,bytes:e.transferSize})),graphRequests:r.filter(e=>e.name.includes('writing-graph')||e.name.includes('ascii-art')).map(e=>({url:e.name,bytes:e.transferSize}))};})()");
    await evaluate(cdp,id,"document.querySelector('[data-experience-canvas]').scrollIntoView({block:'center',behavior:'instant'})");
    await sleep(500);
    const before = await evaluate(cdp,id,'window.__homePerf.draws');
    const metric = async()=> (await cdp.send('Performance.getMetrics',{},id)).metrics.find(e=>e.name==='TaskDuration')?.value??null;
    const t0 = await metric();
    await sleep(2000);
    const t1 = await metric();
    const after = await evaluate(cdp,id,'window.__homePerf.draws');
    const row={name,sha:variant.sha,width,route,repeat,warm,initial,visibleIdleDraws:after-before,visibleIdleMainThreadTaskMs:t0===null||t1===null?null:(t1-t0)*1000};
    rows.push(row);
    console.log(JSON.stringify(row));
  } finally {
    await cdp.send('Target.closeTarget',{targetId:target.targetId});
  }
}

try {
  chrome=await startChrome();
  cdp=await Cdp.connect(chrome.url);
  for(let repeat=0;repeat<repeats;repeat++){
    // Rotate execution order so warming and machine drift do not always favor D.
    const order=[...names.slice(repeat%names.length),...names.slice(0,repeat%names.length)];
    for(const width of [390,1440]) for(const route of ['/','/en/']) {
      for(const warm of [false,true]) for(const name of order) await measure(name,width,route,repeat,warm);
    }
  }
} finally {
  const directory=output.includes('/')?output.slice(0,output.lastIndexOf('/')):'.';
  fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync(output,JSON.stringify({variants,repeats,rows},null,2));
  cdp?.close();
  await stopChild(chrome?.child,'SIGKILL');
  removeProfile(chrome?.profile);
}

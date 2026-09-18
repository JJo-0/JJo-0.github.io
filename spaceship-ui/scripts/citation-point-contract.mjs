import assert from 'node:assert/strict';
import vm from 'node:vm';
import { stableCitationPoint } from './citation-point.mjs';

// Deterministic DOM/clock fixture: no sleeps, network or real link activation.
function fixture(mode) {
  let clock = 0, paints = 0, reads = 0;
  const nodes = [];
  function node() {
    const a = {isConnected:true,tagName:'A',href:'https://example.test/posts/article/#news-ref-1',outerHTML:'<a href="#news-ref-1">1</a>',
      contains:hit=>hit===a,scrollIntoView(){},getBoundingClientRect:()=>({left:20,top:200,width:20,height:20})};
    nodes.push(a);
    return a;
  }
  let current = node();
  const context = {URL,performance:{now:()=>clock},location:{pathname:'/posts/article/',hash:'',},scrollY:100,
    requestAnimationFrame:fn=>{clock+=16;fn();},
    setTimeout:fn=>{
      clock+=50;paints++;
      if ((mode==='replace' && paints===2) || mode==='churn') {current.isConnected=false;current=node();}
      if (mode==='obscured-once' && paints===1) context.document.covered=true;
      else context.document.covered=mode==='covered';
      if (mode==='scroll') context.scrollY+=1;
      if (mode==='height') context.document.documentElement.scrollHeight+=1;
      fn();
    },
    document:{fonts:{ready:Promise.resolve()},readyState:'complete',baseURI:'https://example.test/posts/article/',documentElement:{scrollHeight:1000},
      querySelector:()=>{reads++;return mode==='missing'?null:current;},
      elementFromPoint:()=>context.document.covered?{tagName:'DIV'}:current}};
  return {context,nodes,stats:()=>({clock,paints,reads})};
}

export async function verifyCitationPoint() {
  const results = [];
  for (const mode of ['normal','replace','obscured-once','covered','missing','churn','scroll','height']) {
    const f = fixture(mode);
    const result = await vm.runInNewContext(`(${stableCitationPoint.toString()})('article a')`, f.context);
    const succeeds = ['normal','replace','obscured-once'].includes(mode);
    assert.equal(result.ready,succeeds,mode);
    assert(result.samples.length > 0,`${mode}: failed and successful loops retain evidence`);
    if (succeeds) {
      assert.equal(result.stableSamples,3);
      assert(result.samples.slice(-3).every(s=>s.ready));
      assert(f.stats().clock < 2500);
    } else {
      assert.match(result.error,/did not stabilize/);
      assert.equal(result.stableSamples,0);
      assert(f.stats().clock>=2500 && f.stats().clock<2600,`${mode}: original budget retained`);
    }
    if (mode==='replace') {
      assert(result.samples.some(s=>s.connected===false && s.currentNode===false));
      assert(f.stats().paints>=5,'replacement needs three fresh consecutive samples');
    }
    if (mode==='obscured-once') assert(f.stats().paints>=4,'obscured sample cannot count toward three ready samples');
    results.push({mode,ready:result.ready,samples:result.samples.length});
  }
  // Recreate the old stale-node behavior against the exact same replacement.
  const old = fixture('replace');
  const oldResult = await vm.runInNewContext(`(async()=>{
    const a=document.querySelector('article a');let stable=0,previous=null;const started=performance.now();
    while(performance.now()-started<2500){
      a.scrollIntoView();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await new Promise(r=>setTimeout(r,50));
      const b=a.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,hit=document.elementFromPoint(x,y);
      const ready=a.isConnected&&(hit===a||a.contains(hit));const current={x,y,scrollY,documentHeight:document.documentElement.scrollHeight};
      const unchanged=previous&&Object.keys(current).every(k=>Math.abs(current[k]-previous[k])<0.5);
      stable=ready&&unchanged?stable+1:0;if(stable>=2)return true;previous=current;
    }return false;
  })()`,old.context);
  assert.equal(oldResult,false,'old sampler must fail the same node replacement');
  return {passed:true,regression:'old stale-node sampler fails; new sampler reacquires and requires three ready samples',results};
}

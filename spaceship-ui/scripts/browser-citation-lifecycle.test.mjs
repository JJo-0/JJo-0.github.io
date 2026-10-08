import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import {Cdp,attach,evaluate,navigate,viewport,waitExpression,startChrome,stopChild,removeProfile} from './browser-smoke-harness.mjs';

// Faults affect only this localhost fixture, not production pages. The exact
// pointer function performs real Chromium touch/mouse input and native Back.
const source=fs.readFileSync(new URL('./browser-news-citation-audit.mjs',import.meta.url),'utf8');
const pointerSource=source.slice(source.indexOf('async function pointer('),source.indexOf('async function nativeEnter('));
const lookup='      a = document.querySelector(selector);';
assert.equal(pointerSource.split(lookup).length-1,1);
const selector='article a[data-news-citation="1"]';
const results=[];
const output=new URL('../citation-audit/',import.meta.url);
fs.mkdirSync(output,{recursive:true});
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Citation lifecycle fixture</title>
<style>html{scroll-behavior:auto;overflow-anchor:none}body{margin:20px;min-height:5000px;font:20px sans-serif}article{padding-top:1100px}a{display:inline-block;padding:6px}#news-ref-1{margin-top:1600px}</style>
<article><p>Source <a data-news-citation="1" href="#news-ref-1">[1]</a></p><p id="news-ref-1">Reference one</p></article>
<script>window.fixture={trustedClicks:0,replaced:false,scrolls:0,faults:0};document.addEventListener('click',event=>{if(event.isTrusted&&event.target.closest('[data-news-citation]'))window.fixture.trustedClicks+=1});</script></html>`;
const server=http.createServer((request,response)=>{
  response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  response.end(request.url==='/away/'?'<title>Away fixture</title><p>Away</p>':html);
});
let chrome,cdp,sessionId;
const hardStop=setTimeout(()=>{console.error('citation-lifecycle-browser: FAIL hard timeout');process.exit(1);},60_000);
const modes=['stable','replace-after-back','offscreen-after-back','layout-after-back','covered',
  'second-shift','url-change','stale-node-mutation','no-correction-mutation'];
try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  chrome=await startChrome();cdp=await Cdp.connect(chrome.url);
  ({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
  for(const width of [390,1440]) {
    await viewport(cdp,sessionId,{width,height:1000,mobile:width===390,touch:width===390,reduced:true});
    for(const mode of modes) {
      await navigate(cdp,sessionId,base+'/article/');
      await waitExpression(cdp,sessionId,'document.readyState === "complete" && Boolean(window.fixture)','fixture ready');
      if(mode!=='stable') {
        const history=await cdp.send('Page.getNavigationHistory',{},sessionId);
        const entryId=history.entries[history.currentIndex].id;
        await navigate(cdp,sessionId,base+'/away/');
        await cdp.send('Page.navigateToHistoryEntry',{entryId},sessionId);
        await waitExpression(cdp,sessionId,'location.pathname === "/article/" && document.readyState === "complete" && Boolean(window.fixture)','native Back to fixture');
      }
      const evaluator=async(client,id,expression)=>evaluate(client,id,`(async()=>{
        await document.fonts.ready;
        const mode=${JSON.stringify(mode)}, selector=${JSON.stringify(selector)};
        const original=document.querySelector(selector); fixture.old=original;
        const scroll=Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView=function(...args){
          scroll.apply(this,args);
          if(!this.matches(selector)) return;
          fixture.scrolls++;
          if(fixture.scrolls>1 && mode!=='second-shift') return;
          setTimeout(()=>{
            if(mode==='replace-after-back'||mode==='stale-node-mutation'){
              const replacement=original.cloneNode(true);replacement.dataset.replaced='true';
              original.replaceWith(replacement);fixture.replaced=true;fixture.faults++;
            } else if(['offscreen-after-back','no-correction-mutation','second-shift'].includes(mode)) {
              scrollTo({top:0,behavior:'instant'});fixture.faults++;
            } else if(mode==='layout-after-back') {
              const gap=document.createElement('div');gap.style.height='1400px';document.body.prepend(gap);fixture.faults++;
            } else if(mode==='covered') {
              const cover=document.createElement('div');cover.style.cssText='position:fixed;inset:0;z-index:10000';document.body.append(cover);fixture.faults++;
            } else if(mode==='url-change') {
              history.replaceState(null,'','/other/');fixture.faults++;
            }
          },40);
        };
        return await ${expression};
      })()`);
      let testedSource=pointerSource;
      if(mode==='stale-node-mutation') testedSource=testedSource.replace(lookup,'');
      if(mode==='no-correction-mutation') testedSource=testedSource.replace('realignments === 0 && offscreenStable >= 3','false');
      const activation=new Function('evaluate','cdp','sessionId','assert','let lastPointer;\n'+testedSource+'\nreturn {pointer,getLastPointer:()=>lastPointer};')(evaluator,cdp,sessionId,assert);
      const before=await cdp.send('Page.getNavigationHistory',{},sessionId);
      const previousId=before.entries[before.currentIndex].id;
      const reject=['covered','second-shift','url-change','stale-node-mutation','no-correction-mutation'].includes(mode);
      if(reject) {
        await assert.rejects(()=>activation.pointer(selector,width===390),/did not stabilize/);
        const state=await evaluate(cdp,sessionId,'({clicks:fixture.trustedClicks,replaced:fixture.replaced,oldConnected:fixture.old.isConnected,hash:location.hash,scrolls:fixture.scrolls,faults:fixture.faults})');
        assert.equal(state.clicks,0);assert.equal(state.hash,'');assert(state.faults>0);
        assert.equal(state.scrolls,mode==='second-shift'?2:1);
        if(mode==='stale-node-mutation')assert(state.replaced&&!state.oldConnected);
        results.push({width,mode,rejected:true,...state});
      } else {
        await activation.pointer(selector,width===390);
        await waitExpression(cdp,sessionId,'location.hash === "#news-ref-1" && fixture.trustedClicks === 1','one trusted citation activation');
        const point=activation.getLastPointer();
        assert(point.ready && point.stableSamples>=3);
        const correction=mode==='offscreen-after-back'||mode==='layout-after-back';
        assert.equal(point.realignments,correction?1:0);
        assert.equal(await evaluate(cdp,sessionId,'fixture.scrolls'),correction?2:1);
        assert(point.observations.slice(-3).every(row=>row.ready&&row.hitMatches&&row.connected));
        if(mode==='replace-after-back') {
          assert.equal(await evaluate(cdp,sessionId,'fixture.replaced && !fixture.old.isConnected'),true);
          assert(point.html.includes('data-replaced="true"'),'Must activate the replacement node');
        }
        await cdp.send('Page.navigateToHistoryEntry',{entryId:previousId},sessionId);
        await waitExpression(cdp,sessionId,'location.pathname === "/article/" && location.hash === ""','native Back after citation');
        results.push({width,mode,trustedClicks:1,back:true,realignments:point.realignments,stableSamples:point.stableSamples,observations:point.observations});
      }
      console.log(`citation-lifecycle-browser: PASS ${width}px ${mode}`);
    }
  }
  assert.equal(results.length,18);
  fs.writeFileSync(new URL('lifecycle-browser.json',output),JSON.stringify({fixture:true,results},null,2));
  console.log('citation-lifecycle-browser: PASS 18 cases; bounded correction after Back, native input/Back and pre-input refusals');
} catch(error) {
  console.error(error);
  fs.writeFileSync(new URL('lifecycle-failure.json',output),JSON.stringify({error:String(error),results},null,2));
  process.exitCode=1;
} finally {
  cdp?.close();await stopChild(chrome?.child,'SIGKILL');removeProfile(chrome?.profile);
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));clearTimeout(hardStop);
}

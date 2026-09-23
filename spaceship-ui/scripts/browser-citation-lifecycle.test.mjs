import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import {Cdp,attach,evaluate,navigate,viewport,waitExpression,startChrome,stopChild,removeProfile} from './browser-smoke-harness.mjs';

// Real Chromium, native history Back and trusted touch/mouse input, with a
// controlled DOM replacement during the exact production pointer function.
const source=fs.readFileSync(new URL('./browser-news-citation-audit.mjs',import.meta.url),'utf8');
const pointerSource=source.slice(source.indexOf('async function pointer('),source.indexOf('async function nativeEnter('));
const lookup='      a = document.querySelector(selector);';
assert.equal(pointerSource.split(lookup).length-1,1);
const selector='article a[data-news-citation="1"]';
const results=[];
const output=new URL('../citation-audit/',import.meta.url);
fs.mkdirSync(output,{recursive:true});
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Citation lifecycle fixture</title>
<style>html{scroll-behavior:auto}body{margin:20px;min-height:5000px;font:20px sans-serif}article{padding-top:1100px}a{display:inline-block;padding:6px}#news-ref-1{margin-top:1600px}</style>
<article><p>Source <a data-news-citation="1" href="#news-ref-1">[1]</a></p><p id="news-ref-1">Reference one</p></article>
<script>window.fixture={trustedClicks:0,replaced:false};document.addEventListener('click',event=>{if(event.isTrusted&&event.target.closest('[data-news-citation]'))window.fixture.trustedClicks+=1});</script></html>`;
const server=http.createServer((request,response)=>{
  response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  response.end(request.url==='/away/'?'<title>Away fixture</title><p>Away</p>':html);
});
let chrome,cdp,sessionId;
const hardStop=setTimeout(()=>{console.error('citation-lifecycle-browser: FAIL hard timeout');process.exit(1);},60_000);
try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  chrome=await startChrome();
  cdp=await Cdp.connect(chrome.url);
  ({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
  for(const width of [390,1440]) {
    await viewport(cdp,sessionId,{width,height:1000,mobile:width===390,touch:width===390,reduced:true});
    for(const mode of ['stable','replace-after-back','stale-node-mutation']) {
      await navigate(cdp,sessionId,base+'/article/');
      await waitExpression(cdp,sessionId,'document.readyState === "complete" && Boolean(window.fixture)','fixture ready');
      if(mode!=='stable') {
        const history=await cdp.send('Page.getNavigationHistory',{},sessionId);
        const entryId=history.entries[history.currentIndex].id;
        await navigate(cdp,sessionId,base+'/away/');
        await cdp.send('Page.navigateToHistoryEntry',{entryId},sessionId);
        await waitExpression(cdp,sessionId,'location.pathname === "/article/" && document.readyState === "complete" && Boolean(window.fixture)','native Back to fixture');
      }
      const evaluator=mode==='stable'?evaluate:async(client,id,expression)=>evaluate(client,id,`(async()=>{
        await document.fonts.ready;
        const original=document.querySelector(${JSON.stringify(selector)});
        window.fixture.old=original;
        setTimeout(()=>{const replacement=original.cloneNode(true);replacement.dataset.replaced='true';original.replaceWith(replacement);window.fixture.replaced=true;},40);
        return await ${expression};
      })()`);
      const testedSource=mode==='stale-node-mutation'?pointerSource.replace(lookup,''):pointerSource;
      const activation=new Function('evaluate','cdp','sessionId','assert','let lastPointer;\n'+testedSource+'\nreturn {pointer,getLastPointer:()=>lastPointer};')(evaluator,cdp,sessionId,assert);
      const before=await cdp.send('Page.getNavigationHistory',{},sessionId);
      const previousId=before.entries[before.currentIndex].id;
      if(mode==='stale-node-mutation') {
        await assert.rejects(()=>activation.pointer(selector,width===390),/did not stabilize/);
        const state=await evaluate(cdp,sessionId,'({clicks:fixture.trustedClicks,replaced:fixture.replaced,oldConnected:fixture.old.isConnected,hash:location.hash})');
        assert.deepEqual(state,{clicks:0,replaced:true,oldConnected:false,hash:''});
        results.push({width,mode,rejected:true,...state});
      } else {
        await activation.pointer(selector,width===390);
        await waitExpression(cdp,sessionId,'location.hash === "#news-ref-1" && fixture.trustedClicks === 1','one trusted citation activation');
        const point=activation.getLastPointer();
        assert(point.ready && point.stableSamples>=3);
        if(mode==='replace-after-back') {
          assert.equal(await evaluate(cdp,sessionId,'fixture.replaced && !fixture.old.isConnected'),true);
          assert(point.html.includes('data-replaced="true"'),'Input must use the replacement node');
        }
        await cdp.send('Page.navigateToHistoryEntry',{entryId:previousId},sessionId);
        await waitExpression(cdp,sessionId,'location.pathname === "/article/" && location.hash === ""','native Back after citation');
        results.push({width,mode,trustedClicks:1,back:true,stableSamples:point.stableSamples,observations:point.observations});
      }
      console.log(`citation-lifecycle-browser: PASS ${width}px ${mode}`);
    }
  }
  assert.equal(results.length,6);
  fs.writeFileSync(new URL('lifecycle-browser.json',output),JSON.stringify({fixture:true,results},null,2));
  console.log('citation-lifecycle-browser: PASS six real-browser cases; controlled stale-node mutation rejected before input');
} catch(error) {
  console.error(error);
  fs.writeFileSync(new URL('lifecycle-failure.json',output),JSON.stringify({error:String(error),results},null,2));
  process.exitCode=1;
} finally {
  cdp?.close();
  await stopChild(chrome?.child,'SIGKILL');
  removeProfile(chrome?.profile);
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
  clearTimeout(hardStop);
}

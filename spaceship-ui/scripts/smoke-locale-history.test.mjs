import assert from 'node:assert/strict';
import vm from 'node:vm';
import { attach } from './browser-smoke-harness.mjs';

async function installedSource(normalizeHistoryPath) {
  let source;
  const cdp = {async send(method,params) {
    if (method === 'Page.addScriptToEvaluateOnNewDocument') source=params.source;
    return {targetId:'fixture-target',sessionId:'fixture-session'};
  }};
  await attach(cdp,{normalizeHistoryPath});
  assert.equal(typeof source,'string');
  return source;
}
function run(source,pathname) {
  const listeners=[]; const writes=[];
  const location={pathname,search:'?from=fixture',hash:'#reference'};
  const context={location,history:{state:{fixture:true},replaceState(state,title,url){
    writes.push(url); location.pathname=new URL(url,'https://example.test').pathname;
  }},document:{addEventListener(name,fn){listeners.push(fn)}},window:{addEventListener(name,fn){listeners.push(fn)}},localStorage:{setItem(){}}};
  vm.runInNewContext(source,context,{timeout:1000});
  for(const fn of listeners)fn();
  return {location,writes};
}
const source=await installedSource(true);
for(const path of ['/en/','/en/news/','/en/posts/translated-article/']) {
  const result=run(source,path);assert.equal(result.location.pathname,path);assert.equal(result.writes.length,0);
}
for(const path of ['/research/','/posts/original-article/','/energy/']) {
  const result=run(source,path);assert.equal(result.location.pathname,path.slice(0,-1));
  assert.deepEqual(result.writes,[path.slice(0,-1)+'?from=fixture#reference']);
}
assert.equal(run(source,'/').writes.length,0);
const nativeSource=await installedSource(false);
for(const path of ['/en/','/research/','/posts/original-article/'])assert.equal(run(nativeSource,path).writes.length,0);
const mutation=source.replace("          if (location.pathname.startsWith('/en/')) return;",'');
assert.notEqual(mutation,source);
assert.notEqual(run(mutation,'/en/').location.pathname,'/en/','Old normalizer mutation must alter the English canonical URL');
console.log('smoke-locale-history: PASS exact installed browser script; English native URLs retained, Korean compatibility and query/hash unchanged; old regression detected');

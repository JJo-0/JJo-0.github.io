import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
const require = createRequire(import.meta.url);
const ts = require('typescript');
function compile(file) {
  const input = fs.readFileSync(new URL('../src/lib/experience/' + file, import.meta.url), 'utf8');
  const result = ts.transpileModule(input, {fileName:file, compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
  assert.equal((result.diagnostics ?? []).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
  return result.outputText;
}
function events() {
  const listeners = new Map();
  return {
    addEventListener(type, fn, options) {
      if (!listeners.has(type)) listeners.set(type,new Map());
      listeners.get(type).set(fn,options?.once === true);
    },
    removeEventListener(type, fn) {listeners.get(type)?.delete(fn);},
    count(type) {return listeners.get(type)?.size ?? 0;},
    fire(type,event={}) {
      return [...(listeners.get(type) ?? [])].map(([fn,once])=>{
        if(once) listeners.get(type).delete(fn);
        return fn(event);
      });
    },
  };
}
function makeHost() {
  const trigger={...events(),dataset:{},hidden:true,setAttribute(){},removeAttribute(){}};
  const canvas={};
  const host={dataset:{asciiGraph:'true',graphUrl:'/writing-graph/ko.json',graphState:'preview'},isConnected:true,
    setAttribute(){},removeAttribute(){},
    querySelector(selector){return {'[data-ascii-art]':canvas,'[data-graph-activate]':trigger}[selector] ?? null;},
  };
  return {host,trigger};
}
function fixture(readyState='complete') {
  const f={...makeHost(),fetches:[],pending:[],mounts:[],disposals:0};
  const document={...events(),readyState,activeElement:null,querySelector:()=>f.host};
  const context=vm.createContext({exports:{},document,AbortController,console:{warn(){}},
    require(name){assert.equal(name,'./ascii-art');return {mountWritingGraph(host,canvas,payload,onPaint){f.mounts.push(host);onPaint();return ()=>{f.disposals++;};}};},
    fetch(url,options){f.fetches.push({url,signal:options.signal});return new Promise((resolve,reject)=>f.pending.push({resolve,reject}));},
  });
  vm.runInContext(compile('graph-loader.ts'),context);
  return Object.assign(f,{document,install:context.exports.installGraphLoader});
}
const click=()=>({button:0,preventDefault(){}});
function succeed(f){f.pending.shift().resolve({ok:true,text:async()=> '{}'});}
test('fallback geometry is not allocated on module import',()=>{
  const context=vm.createContext({exports:{},require(name){assert.equal(name,'./graph-json.mjs');return {parseGraphPayload:JSON.parse};}});
  vm.runInContext(compile('ascii-art.ts'),context);
  assert.equal(vm.runInContext('artifact === undefined',context),true);
  assert.equal(vm.runInContext('buildArtifact().length',context),1350);
});
for(const order of [['DOMContentLoaded','astro:page-load'],['astro:page-load','DOMContentLoaded']]){
  test('duplicate lifecycle events: '+order.join(' then '),async()=>{
    const f=fixture('loading');
    f.install();f.install();order.forEach(type=>f.document.fire(type));
    f.document.fire('astro:page-load');
    assert.equal(f.trigger.count('click'),1);
    assert.equal(f.fetches.length,0);
    const [a]=f.trigger.fire('click',click()),[b]=f.trigger.fire('click',click());
    assert.equal(f.fetches.length,1);
    succeed(f);await Promise.all([a,b]);
    f.document.fire('astro:page-load');
    await Promise.all(f.trigger.fire('click',click()));
    assert.equal(f.mounts.length,1);assert.equal(f.fetches.length,1);
    assert.equal(f.host.dataset.graphState,'ready');
  });
}
test('navigation aborts pending load, late response cannot mount old page',async()=>{
  const f=fixture();f.install();
  const old=f.trigger,[a]=old.fire('click',click());
  f.document.fire('astro:before-swap');
  assert.equal(f.fetches[0].signal.aborted,true);assert.equal(old.count('click'),0);
  Object.assign(f,makeHost());f.document.fire('astro:page-load');
  succeed(f);await a;assert.equal(f.mounts.length,0);
  const [b]=f.trigger.fire('click',click());succeed(f);await b;
  assert.equal(f.mounts.length,1);assert.equal(f.mounts[0],f.host);
  f.document.fire('astro:before-swap');f.document.fire('astro:before-swap');
  assert.equal(f.disposals,1);
});
test('failed graph request can retry',async()=>{
  const f=fixture();f.install();const [a]=f.trigger.fire('click',click());
  f.pending.shift().reject(new Error('network failure'));await a;
  assert.equal(f.host.dataset.graphState,'error');
  const [b]=f.trigger.fire('click',click());succeed(f);await b;
  assert.equal(f.mounts.length,1);assert.equal(f.host.dataset.graphState,'ready');
});

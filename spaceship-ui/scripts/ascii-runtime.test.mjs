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
  const f={...makeHost(),fetches:[],pending:[],mounts:[],disposals:0,observers:[],idle:new Map(),timers:new Map()};
  const document={...events(),readyState,hidden:false,activeElement:null,querySelector:()=>f.host};
  let sequence=0;
  const window={...events(),
    requestIdleCallback(fn){const id=++sequence;f.idle.set(id,fn);return id;},
    cancelIdleCallback(id){f.idle.delete(id);},
    setTimeout(fn){const id=++sequence;f.timers.set(id,fn);return id;},
  };
  class IntersectionObserver {
    constructor(fn){this.fn=fn;this.disconnected=false;f.observers.push(this);}
    observe(target){this.target=target;}
    disconnect(){this.disconnected=true;}
  }
  const context=vm.createContext({exports:{},document,window,IntersectionObserver,AbortController,console:{warn(){}},
    clearTimeout:id=>f.timers.delete(id),
    require(name){assert.equal(name,'./ascii-art');return {mountWritingGraph(host,canvas,payload,onPaint){f.mounts.push(host);onPaint();return ()=>{f.disposals++;};}};},
    fetch(url,options){f.fetches.push({url,signal:options.signal});return new Promise((resolve,reject)=>f.pending.push({resolve,reject}));},
  });
  vm.runInContext(compile('graph-loader.ts'),context);
  return Object.assign(f,{document,window,install:context.exports.installGraphLoader,
    visible(value){f.observers.at(-1).fn([{isIntersecting:value}]);},
    runIdle(){for(const [id,fn] of [...f.idle]){f.idle.delete(id);fn();}},
  });
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function succeed(f){f.pending.shift().resolve({ok:true,text:async()=> '{}'});}
function activate(f){f.visible(true);f.runIdle();}
test('fallback geometry is not allocated on module import',()=>{
  const context=vm.createContext({exports:{},require(name){
    if(name==='./graph-json.mjs')return {parseGraphPayload:JSON.parse};
    assert.equal(name,'./graph-visuals.mjs');return {};
  }});
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
    assert.equal(f.observers.length,1);
    f.visible(true);f.runIdle();
    assert.equal(f.fetches.length,0);
    f.document.readyState='complete';f.window.fire('load');
    f.visible(true);f.document.fire('visibilitychange');
    assert.equal(f.idle.size,1);
    f.visible(false);f.runIdle();assert.equal(f.fetches.length,0);
    f.document.hidden=true;f.visible(true);f.runIdle();assert.equal(f.fetches.length,0);
    f.document.hidden=false;f.document.fire('visibilitychange');f.runIdle();
    f.trigger.fire('click');f.visible(true);f.runIdle();
    assert.equal(f.fetches.length,1);
    succeed(f);await flush();
    f.document.fire('astro:page-load');f.trigger.fire('click');f.visible(true);f.runIdle();
    assert.equal(f.mounts.length,1);assert.equal(f.fetches.length,1);
    assert.equal(f.host.dataset.graphState,'ready');
  });
}
test('navigation cancels idle work and aborts pending fetch; late response cannot mount old page',async()=>{
  const f=fixture();f.install();f.visible(true);
  const first=f.trigger;
  f.document.fire('astro:before-swap');f.runIdle();
  assert.equal(f.fetches.length,0);assert.equal(first.count('click'),0);
  assert.equal(f.observers[0].disconnected,true);
  Object.assign(f,makeHost());f.document.fire('astro:page-load');activate(f);
  const old=f.trigger;
  f.document.fire('astro:before-swap');
  assert.equal(f.fetches[0].signal.aborted,true);assert.equal(old.count('click'),0);
  Object.assign(f,makeHost());f.document.fire('astro:page-load');
  succeed(f);await flush();assert.equal(f.mounts.length,0);
  activate(f);succeed(f);await flush();
  assert.equal(f.mounts.length,1);assert.equal(f.mounts[0],f.host);
  f.document.fire('astro:before-swap');f.document.fire('astro:before-swap');
  assert.equal(f.disposals,1);
});
test('failed graph request does not loop and can retry explicitly',async()=>{
  const f=fixture();f.install();activate(f);
  f.pending.shift().reject(new Error('network failure'));await flush();
  assert.equal(f.host.dataset.graphState,'error');assert.equal(f.trigger.hidden,false);
  activate(f);f.document.fire('visibilitychange');f.runIdle();assert.equal(f.fetches.length,1);
  f.trigger.fire('click');f.trigger.fire('click');assert.equal(f.fetches.length,2);
  succeed(f);await flush();
  assert.equal(f.mounts.length,1);assert.equal(f.host.dataset.graphState,'ready');
  assert.equal(f.trigger.hidden,true);
});

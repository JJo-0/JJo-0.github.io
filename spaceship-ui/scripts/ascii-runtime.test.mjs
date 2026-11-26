import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import { graphVisual, graphNodeVisual, graphEdgeStops, graphStar, graphStarSize, atlasProjectionRadius, projectAtlas, stepAtlasRotation, wrapAtlasYaw } from '../src/lib/experience/graph-visuals.mjs';
import { renderAtlasPreview } from '../src/lib/experience/graph-preview.mjs';
import { POST_CATEGORIES } from '../src/lib/taxonomy.mjs';
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

test('star and legend inks are distinguishable against the observatory sky in both themes', () => {
  const styles = POST_CATEGORIES.map(graphVisual);
  assert.equal(new Set(styles.map(s=>s.glyph)).size, styles.length);
  const luminance = hex => {
    const rgb = [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
    return rgb.map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i],0);
  };
  const contrast = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
  for (const [theme,sky] of [['light','#141e2e'],['dark','#0c1423']]) {
    assert.equal(new Set(styles.map(style=>style[theme])).size, styles.length);
    for (const style of styles) assert(contrast(style[theme],sky)>=4.5, style[theme]+' / '+sky);
  }
});
test('edges traverse the same stellar spectrum from either endpoint', () => {
  const categories = [...POST_CATEGORIES].sort((a,b)=>graphVisual(a).index-graphVisual(b).index);
  const inks = categories.map(graphVisual);
  assert.deepEqual(inks.map(style=>style.index), categories.map((_,index)=>index));
  for (const source of categories) for (const target of categories) {
    const first = graphVisual(source), last = graphVisual(target);
    const stops = graphEdgeStops(source,target);
    assert.equal(stops[0].offset,0);
    assert.equal(stops.at(-1).offset,1);
    assert(stops.every((s,i)=>i===0 || s.offset>stops[i-1].offset));
    for (const theme of ['light','dark']) {
      assert.equal(stops[0][theme],first[theme]);
      assert.equal(stops.at(-1)[theme],last[theme]);
      const reversed = graphEdgeStops(target,source);
      let prior = -1;
      for (const s of stops) {
        const idx = inks.findIndex(ink=>ink[theme]===s[theme]);
        assert(idx>=Math.min(first.index,last.index) && idx<=Math.max(first.index,last.index));
        const distance = Math.abs(idx-first.index);
        assert(distance>=prior);
        prior = distance;
      }
      assert.equal(reversed[0][theme],last[theme]);
    }
  }
  assert(graphEdgeStops(categories[0],categories.at(-1)).length>=3,'Distant bands must pass through intermediate spectral colors');
});
test('star magnitude varies with weighted degree and projected depth', () => {
  assert.deepEqual([0,48,64].map(graphStar),['·','+','✦']);
  assert(graphStarSize(2,64)>graphStarSize(-2,64));
  assert.notEqual(graphStarSize(0,0),graphStarSize(0,64));
});
test('two articles within one topic have their own stable spectrum endpoints', () => {
  const category = POST_CATEGORIES[4];
  const near = graphNodeVisual({category,z:1.5}), far = graphNodeVisual({category,z:-1.5});
  const stops = graphEdgeStops(far,near);
  for (const theme of ['light','dark']) {
    assert.notEqual(far[theme],near[theme]);
    assert.equal(stops[0][theme],far[theme]);
    assert.equal(stops.at(-1)[theme],near[theme]);
    assert.equal(graphNodeVisual({category,z:1.5})[theme],near[theme]);
  }
});
test('static SVG shares the article inks, two endpoint colors and line types with Canvas', () => {
  const nodes = [
    {id:'a',category:POST_CATEGORIES[1],x:0,y:0,z:-1.5},
    {id:'b',category:POST_CATEGORIES[1],x:1,y:1,z:1.5},
    {id:'c',category:POST_CATEGORIES[7],x:2,y:0,z:1},
  ];
  const edges = [{source:'a',target:'b',weight:10},{source:'b',target:'c',weight:12}];
  for (const theme of ['light','dark']) {
    const svg = renderAtlasPreview({nodes,edges},theme==='dark');
    const attr = (tag,key) => tag.match(new RegExp(key+'="([^"]+)"'))?.[1];
    const gradients = new Map([...svg.matchAll(/<linearGradient ([^>]+)>(.*?)<\/linearGradient>/g)]
      .map(([,tag,body])=>[attr(tag,'id'),{tag,stops:[...body.matchAll(/<stop ([^>]+)\/>/g)].map(([,s])=>s)}]));
    const lines = [...svg.matchAll(/<line ([^>]+)\/>/g)].map(([,tag])=>tag);
    assert.equal(lines.length,edges.length);
    for (const [i,line] of lines.entries()) {
      const a=nodes[i], b=nodes[i+1];
      const gradient=gradients.get(attr(line,'stroke')?.match(/^url\(#(.+)\)$/)?.[1]);
      assert(gradient,'Expected a colored SVG gradient for distinct endpoint inks');
      assert.equal(attr(gradient.tag,'gradientUnits'),'userSpaceOnUse');
      for (const axis of ['x1','y1','x2','y2']) assert.equal(attr(gradient.tag,axis),attr(line,axis));
      assert.equal(attr(gradient.stops[0],'stop-color'),graphNodeVisual(a)[theme]);
      assert.equal(attr(gradient.stops.at(-1),'stop-color'),graphNodeVisual(b)[theme]);
      assert.equal(attr(line,'stroke-dasharray')!==undefined,a.category!==b.category);
    }
    const fills = [...svg.matchAll(/<text ([^>]+)>/g)].map(([,tag])=>attr(tag,'fill'));
    assert.deepEqual(fills.sort(),nodes.map(node=>graphNodeVisual(node)[theme]).sort());
  }
});
test('rotation eases across frame rates, follows shortest yaw, settles exactly and honors reduced motion', () => {
  const initial={x:-.34,y:.18}, target={x:.5,y:1.1};
  const advance=(hz,ms)=>{
    let state=initial;
    for(let i=0;i<Math.round(ms*hz/1000);i++)state=stepAtlasRotation(state,target,1000/hz,false,false);
    return state;
  };
  const first=advance(60,1000/60);
  assert(first.moving && first.x>initial.x && first.x<target.x && first.y>initial.y && first.y<target.y);
  for(const hz of [30,60,120]){
    const mid=advance(hz,200), ref=advance(60,200);
    assert(Math.abs(mid.x-ref.x)<1e-9 && Math.abs(mid.y-ref.y)<1e-9);
    assert.deepEqual(advance(hz,1000),{...target,moving:false});
  }
  assert.deepEqual(stepAtlasRotation(initial,target,16,true,false),{...target,moving:false});
  const seam=stepAtlasRotation({x:0,y:3.1},{x:0,y:-3.1},16,false,false);
  assert(wrapAtlasYaw(seam.y-3.1)>0 && wrapAtlasYaw(seam.y-3.1)<.0832);
  assert.deepEqual(stepAtlasRotation(target,target,16,false,false),{...target,moving:false});
});
test('projection uses a rotation-independent scale and contains every point', () => {
  const nodes=[{id:'a',x:2,y:1,z:1.8},{id:'b',x:-2,y:-1.5,z:-1.9},{id:'c',x:.5,y:2,z:-1},{id:'d',x:5.5,y:0,z:1}];
  for(const points of [nodes.slice(0,3),nodes]){
    const radius=atlasProjectionRadius(points);
    for(const [w,h] of [[320,460],[1000,1000],[1440,700]])for(const x of [-1.3,0,1.3])for(let y=-Math.PI;y<=Math.PI;y+=.12){
      const projected=projectAtlas(points,w,h,x,y,radius);
      assert(projected.every(p=>p.x>=0&&p.x<=w&&p.y>=0&&p.y<=h));
    }
  }
  // A stationary point on the rotation axis must not change scale with yaw.
  const axis=[{id:'axis',x:0,y:1,z:0},...nodes.slice(0,3)];
  assert.equal(projectAtlas(axis,390,460,0,0)[0].y,projectAtlas(axis,390,460,0,Math.PI/2)[0].y);
});

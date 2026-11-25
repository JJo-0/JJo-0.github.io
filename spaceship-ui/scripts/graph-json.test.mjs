import assert from 'node:assert/strict';
import fs from 'node:fs';
import { graphVisual, graphDepth, projectAtlas } from '../src/lib/experience/graph-visuals.mjs';
import { POST_CATEGORIES } from '../src/lib/taxonomy.mjs';
import {serializeGraphPayload, parseGraphPayload} from '../src/lib/experience/graph-json.mjs';
const input={nodes:[{id:'post-0',title:'한국어 <script> & "quoted" </script><img src=x>',href:'/posts/test/',x:1.1234,y:-2,z:0,tags:['a','b']}],edges:[{source:'post-0',target:'post-1',weight:1.2,reasons:['shared category']}]};
const encoded=serializeGraphPayload(input);
assert.deepEqual(parseGraphPayload(encoded),input,'Transport must preserve every value');
assert.deepEqual(parseGraphPayload(JSON.stringify(input)),input,'Legacy transport remains readable');
const legacyTuple={...input,edgeEncoding:'tuple-v1',edges:[['post-0','post-1',1.2,['shared category']]]};
assert.deepEqual(parseGraphPayload(JSON.stringify(legacyTuple)),input,'Existing tuple-v1 pages remain readable');
assert.equal(parseGraphPayload('null'),null);
const repeated={nodes:input.nodes,edges:Array(100).fill(input.edges[0])};
assert(serializeGraphPayload(repeated).length < JSON.stringify(repeated).length,'Compact transport saves bytes');
const mixed={nodes:input.nodes,edges:[
  {source:'post-0',target:'post-1',weight:1.2,reasons:['category','한국어 </script>']},
  {source:'post-1',target:'post-2',weight:0,reasons:[]},
  {source:'post-2',target:'post-3',weight:2.5,reasons:['category','한국어 </script>']},
  {source:'post-3',target:'post-0',weight:3,reasons:['한국어 </script>','category']},
]};
const mixedEncoded=serializeGraphPayload(mixed), restored=parseGraphPayload(mixedEncoded);
assert.deepEqual(restored,mixed,'Repeated, empty and ordered explanations retain every value');
assert(!mixedEncoded.includes('<'),'Explanation text cannot terminate its inert script');
restored.edges[0].reasons.push('changed in one edge');
assert.deepEqual(restored.edges[2].reasons,mixed.edges[2].reasons,'Restored edges have independent explanation arrays');
assert.deepEqual(parseGraphPayload(serializeGraphPayload({nodes:[],edges:[]})),{nodes:[],edges:[]});
assert(!encoded.includes('<')&&!encoded.includes('</script>'),'JSON cannot terminate its inert script');
const component=fs.readFileSync(new URL('../src/components/experience/ExperienceCanvas.astro',import.meta.url),'utf8');
assert(!component.includes('data-post-graph-source'),'Cold HTML must not embed the complete graph');
assert(component.includes('data-graph-preview') && component.includes('data-graph-url') && component.includes('data-graph-activate'));
const endpoint=fs.readFileSync(new URL('../src/pages/writing-graph/[lang].json.ts',import.meta.url),'utf8');
assert(endpoint.includes('serializeGraphPayload(graph)') && endpoint.includes('getWritingGraph'));
const loader=fs.readFileSync(new URL('../src/lib/experience/graph-loader.ts',import.meta.url),'utf8');
assert(loader.includes('fetch(url,') && loader.includes("import('./ascii-art')") && loader.includes('mountWritingGraph'));
const runtime=fs.readFileSync(new URL('../src/lib/experience/ascii-art.ts',import.meta.url),'utf8');
assert(runtime.includes("script[data-post-graph-source]") && runtime.includes("host.dataset.postGraph ?? 'null'"));
assert(runtime.includes("document.createElement('a')") && runtime.includes('anchor.href = node.href') && runtime.includes('anchor.dataset.postGraphNode = node.id'));
const styles=POST_CATEGORIES.map(graphVisual);
assert.equal(new Set(styles.map(style=>style.glyph)).size, POST_CATEGORIES.length);
assert(styles.every(style=>/^#[0-9a-f]{6}$/i.test(style.light)&&/^#[0-9a-f]{6}$/i.test(style.dark)));
assert.equal(graphDepth(-10),0);assert.equal(graphDepth(10),1);
const geometry=[{id:'a',x:2,y:1,z:1.8},{id:'b',x:-2,y:-1.5,z:-1.9},{id:'c',x:0.5,y:2,z:-1}];
for(const [w,h] of [[320,460],[1440,700]]) for(const x of [-1.3,0,1.3]) for(const y of [-Math.PI,0,Math.PI/2,Math.PI]){
  const p=projectAtlas(geometry,w,h,x,y);
  assert.deepEqual(p.map(row=>row.id),geometry.map(row=>row.id));
  assert(p.every(row=>Number.isFinite(row.z)&&row.x>=0&&row.x<=w&&row.y>=0&&row.y<=h),'Projection must fit the view');
}
assert.notDeepEqual(projectAtlas(geometry,390,460,0,0),projectAtlas(geometry,390,460,0,Math.PI/4));
assert(loader.includes('IntersectionObserver')&&loader.includes('requestIdleCallback')&&loader.includes("next.dataset.graphState === 'preview'"));
console.log('graph-json: PASS lossless transport, legacy decoding, bounded perspective projection, distinct topic glyphs and viewport-idle activation');

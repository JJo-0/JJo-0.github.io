import assert from 'node:assert/strict';
import fs from 'node:fs';
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
assert(component.includes('type="application/json" data-post-graph-source set:html={serializeGraphPayload(graph)}'));
assert(component.includes('graph.nodes.map') && component.includes('data-post-graph-node={node.id}'));
const runtime=fs.readFileSync(new URL('../src/lib/experience/ascii-art.ts',import.meta.url),'utf8');
assert(runtime.includes("script[data-post-graph-source]") && runtime.includes("host.dataset.postGraph ?? 'null'"));
console.log('graph-json: PASS lossless transport, closing-script safety, all native links and legacy fallback retained');

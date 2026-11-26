import fs from 'node:fs';
import assert from 'node:assert/strict';
import {parse} from 'acorn';
const base='site/assets/assets/interactive/';
function skeleton(value){
 if(Array.isArray(value))return value.map(skeleton);
 if(!value||typeof value!=='object')return value;
 if(value.type==='Literal'&&typeof value.value==='string')return {type:'LocalizedString'};
 if(value.type==='TemplateElement')return {type:'TemplateElement',tail:value.tail};
 return Object.fromEntries(Object.entries(value).filter(([k])=>!['start','end','raw'].includes(k)).map(([k,v])=>[k,skeleton(v)]));
}
function jsonStructure(v){if(typeof v==='string')return 'text';if(Array.isArray(v))return v.map(jsonStructure);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,jsonStructure(x)]));return v;}
for(const n of [1,2,3]){
 const src=fs.readFileSync(`${base}ai-consciousness-${n}/index.html`,'utf8');
 const dst=fs.readFileSync(`${base}ai-consciousness-${n}-en/index.html`,'utf8');
 assert(!/[가-힣]/.test(dst),`Atlas ${n}: untranslated Korean`);
 assert(dst.includes('lang="en"'));
 const script=s=>s.match(/<script>([\s\S]*?)<\/script>/)[1];
 assert.deepEqual(skeleton(parse(script(src),{ecmaVersion:'latest'})),skeleton(parse(script(dst),{ecmaVersion:'latest'})),`Atlas ${n}: operations, numbers, and program structure preserved`);
 const controls=s=>[...s.matchAll(/\b(?:id|data-tab|data-filter|data-radar)="([^"]+)"/g)].map(m=>m[0]);
 assert.deepEqual(controls(src),controls(dst),`Atlas ${n}: controls and navigation IDs preserved`);
 if(n===3){const a=JSON.parse(fs.readFileSync(`${base}ai-consciousness-3/data.json`));const b=JSON.parse(fs.readFileSync(`${base}ai-consciousness-3-en/data.json`));assert(!/[가-힣]/.test(JSON.stringify(b)));assert.deepEqual(jsonStructure(a),jsonStructure(b));assert.equal(b.slides.length,15);assert.equal(b.keywords.length,25);assert.equal(b.curriculum.length,11);}
 console.log(`Atlas ${n}: PASS; English text, matching script structure/numbers and controls; browser interaction not tested`);
}

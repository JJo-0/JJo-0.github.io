import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';
const guides=JSON.parse(fs.readFileSync('src/data/robot-equation-guides.json','utf8'));
const expected=[5,23,18,20,24,23,18];
let total=0,parsed=0;
for(let ch=1;ch<=7;ch++){
 const file=fs.readdirSync('site/content/posts').find(f=>f.startsWith(`rl-robot-learning-ch${String(ch).padStart(2,'0')}-`));
 const source=fs.readFileSync(path.join('site/content/posts',file),'utf8');
 const pattern=/<Math\b(?:(?!\/>)[\s\S])*?\/>/g;
 const displays=[...source.matchAll(pattern)].filter(m=>/\bdisplay\b/.test(m[0]));
 const refs=[...source.matchAll(/<RobotEquationGuide id="([^"]+)"\s*\/>/g)];
 assert.equal(displays.length,expected[ch-1]);assert.equal(refs.length,expected[ch-1]);
 for(let i=0;i<displays.length;i++){
  const id=`rl${String(ch).padStart(2,'0')}-e${String(i+1).padStart(2,'0')}`;
  const g=guides[id];assert(g,`missing ${id}`);assert.equal(refs[i][1],id);
  const tex=displays[i][0].match(/String\.raw`([^`]*)`/)[1];assert.equal(g.tex,tex);
  assert(source.slice(displays[i].index+displays[i][0].length).trimStart().startsWith(`<RobotEquationGuide id="${id}" />`),`${id} stays next to its equation`);
  assert(g.reading.length>=45&&g.steps.length>=2&&g.example.length>=30&&g.symbols.length>=2,`${id} has an actual explanation`);
  const texes=[g.tex,...g.symbols.map(s=>s.tex)];
  for(const text of [g.title,g.reading,g.example,...g.steps,...g.symbols.map(s=>s.meaning)]){
   assert(![...text].some(c=>c.charCodeAt(0)<32),`${id}: escaped LaTeX must not become control characters`);
   assert.equal((text.match(/\$/g)||[]).length%2,0,`${id}: paired inline math`);
   texes.push(...[...text.matchAll(/\$([^$]+)\$/g)].map(m=>m[1]));
  }
  for(const t of texes){katex.renderToString(t,{throwOnError:true,strict:'error',trust:false});parsed++;}
  total++;
 }
 assert(!/여기서 u는/.test(source),'RNN symbol must render with a defined time index');
}
assert.equal(total,131);assert.equal(Object.keys(guides).length,131);
// Independent arithmetic checks for examples with sign, scaling or weighting traps.
const near=(a,b,tol=1e-9)=>assert(Math.abs(a-b)<tol);
near((1*2+3*1)/3,5/3);
near((1*2+3*6)/4,5);near(1-0.5*0.4+0.01*0.6,0.806);
near(1+0.9*(4-0.2*(-1)),4.78);near((1.1-0.6*0.5)/0.8,1);
near(0.7*0.8+0.3*0.4,0.68);near(2/(4+1)*0.1,0.04);
near(-15*0.1-3*0.2,-2.1);near(Math.min(255,Math.floor(256*(1+1)/2)),255);
near((2+6*Math.E)/(1+Math.E),4.92423431452,1e-8);
console.log(`Robot equation guides PASS: ${total} adjacent guides, ${parsed} parsed math expressions, complete explanations and checked arithmetic.`);

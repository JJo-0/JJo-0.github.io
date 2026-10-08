import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Execute the exact browser-side expression used by pointer(), not a model
// implementation of the decision. The fake DOM controls only its observations.
const source = fs.readFileSync(new URL('./browser-news-citation-audit.mjs', import.meta.url), 'utf8');
const pointer = source.slice(source.indexOf('async function pointer('), source.indexOf('async function nativeEnter('));
const match = pointer.match(/const point = await evaluate\(cdp, sessionId, `([\s\S]*?)`\);/);
assert(match, 'Test must execute the real pointer expression');
const selector = 'article a[data-news-citation="1"]';
const expression = new Function('selector', 'return `' + match[1] + '`')(selector);
const command = "a.scrollIntoView({block:'center', behavior:'instant'});";
const loop = 'while (performance.now() - started < 2500) {';
const lookup = '      a = document.querySelector(selector);';
assert.equal(expression.split(command).length - 1, 2, 'Initial alignment plus one guarded correction');
assert(expression.indexOf(command) < expression.indexOf(loop));
assert.equal(expression.split(lookup).length - 1, 1);

async function exercise(code, options = {}) {
  let time = 0, scrolls = 0, samples = 0, lookups = 0;
  const nodes = new Map();
  const blocker = {tagName:'DIV'};
  function offscreenNow() {
    if (options.offscreenAt === undefined || samples < options.offscreenAt) return false;
    if (samples === options.transientOffscreenAt) return true;
    if (options.transientOffscreenAt !== undefined) return false;
    if (scrolls < 2 || options.ignoreCorrection) return true;
    return options.secondDriftAt !== undefined && samples >= options.secondDriftAt && scrolls < 3;
  }
  function currentNode() {
    if (options.missing || samples === options.missingAt) return null;
    const generation = options.churn ? samples : samples >= (options.replaceAt ?? Infinity) ? 1 : 0;
    if (!nodes.has(generation)) {
      const anchor = {
        tagName:'A',
        get isConnected() { return !options.detached && currentNode() === anchor; },
        href:'https://example.test/posts/article/#news-ref-1',
        outerHTML:`<a data-generation="${generation}" href="#news-ref-1">[1]</a>`,
        contains:() => false,
        scrollIntoView() { scrolls += 1; },
        getBoundingClientRect() {
          const width = options.zeroSize ? 0 : 20 + (options.widthMoving ? samples : 0);
          const height = 20 + (options.heightResizing ? samples : 0);
          return {left:(options.nan ? NaN : 210 + scrolls + (options.moving ? samples : 0)) - width/2,
            top:(offscreenNow() ? 1400 : 500) - height/2,width,height};
        },
      };
      nodes.set(generation,anchor);
    }
    return nodes.get(generation);
  }
  const document = {
    readyState:options.loading ? 'loading' : 'complete', fonts:{ready:Promise.resolve()},
    querySelector:() => { lookups += 1; return currentNode(); },
    elementFromPoint:() => options.covered || samples === options.coveredAt ? blocker : currentNode(),
    documentElement:{get scrollHeight() { return 10000 + (options.heightMoving ? samples : 0); }},
  };
  const location = {
    get pathname() { return samples >= (options.navigateAt ?? Infinity) && samples < (options.navigateBackAt ?? Infinity) ? '/other/' : '/posts/article/'; },
    get href() { return 'https://example.test' + this.pathname; },
  };
  const context = {document,URL,location,innerWidth:1440,innerHeight:1000,
    performance:{now:() => time},
    requestAnimationFrame(callback) { time += 16; queueMicrotask(callback); },
    setTimeout(callback,delay) { time += options.slowSample ? 2400 : delay; samples += 1; queueMicrotask(callback); },
    get scrollY() { return 3000 + (options.scrollMoving ? samples : 0); },
  };
  try {
    const value = await vm.runInNewContext(code,context,{timeout:1000});
    return {value,scrolls,samples,lookups,time};
  } catch (error) {
    error.metrics = {scrolls,samples,lookups,time};
    throw error;
  }
}
const passes = [
  ['stable',{},3,1],
  ['same-geometry replacement',{replaceAt:2},4,1],
  ['temporarily missing then replaced',{missingAt:2,replaceAt:3},5,1],
  ['first sample covered',{coveredAt:1},4,1],
  ['middle sample covered',{coveredAt:2},5,1],
  ['delayed offscreen restoration',{offscreenAt:2},7,2],
  ['offscreen replaced target',{offscreenAt:2,replaceAt:3},8,2],
  ['one transient offscreen sample',{offscreenAt:2,transientOffscreenAt:2},5,1],
];
for (const [name,options,expectedSamples,expectedScrolls] of passes) {
  const result = await exercise(expression,options);
  assert.equal(result.scrolls,expectedScrolls,name);
  assert.equal(result.samples,expectedSamples,name);
  assert.equal(result.lookups,result.samples+1,name);
  assert.equal(result.value.stableSamples,3,name);
  assert.equal(result.value.realignments,expectedScrolls-1,name);
  assert(result.value.ready && result.value.resolvedPath === result.value.currentPath,name);
  assert(result.time < 2500,name);
  assert(result.value.observations.slice(-3).every(r=>r.ready && r.connected && r.hitMatches),name);
}
const refusals = [
  {missing:true},{detached:true},{zeroSize:true},{covered:true},{moving:true},
  {heightMoving:true},{scrollMoving:true},{churn:true},{widthMoving:true},
  {heightResizing:true},{navigateAt:2},{navigateAt:2,navigateBackAt:3},
  {nan:true},{loading:true},{slowSample:true},
  {offscreenAt:2,moving:true},{offscreenAt:2,covered:true},
  {offscreenAt:2,ignoreCorrection:true},{offscreenAt:2,secondDriftAt:6},
  {covered:true,offscreenAt:29},
];
for (const options of refusals) {
  await assert.rejects(() => exercise(expression,options),error=>{
    assert.match(error.message,/Missing citation|did not stabilize/);
    assert(error.metrics.scrolls <= 2,'Only one corrective alignment');
    if (!options.slowSample) assert(error.metrics.time < 2600,'One unchanged deadline, including final sample');
    if (options.covered && options.offscreenAt === undefined) assert.equal(error.metrics.scrolls,1);
    return true;
  });
}
let diagnostic;
try { await exercise(expression,{detached:true}); } catch(error) { diagnostic=error.message; }
const trace=JSON.parse(diagnostic.slice(diagnostic.indexOf('{')));
assert.equal(trace.selector,selector); assert.equal(trace.initialUrl,'https://example.test/posts/article/');
assert.equal(trace.realignments,0); assert.equal(trace.observations.length,4);
for (const row of trace.observations) {
  for (const key of ['nodePresent','connected','sameNode','hitMatches','x','y','width','height','scrollY','documentHeight','url','readyState','offscreen','offscreenStable','realignments','viewportWidth','viewportHeight']) {
    assert(Object.hasOwn(row,key),`Missing diagnostic ${key}`);
  }
  assert.equal(row.connected,false);
}
// Mutation controls cover both the previously reviewed lifecycle failures and
// the new policy. Any future weakening must cause a deterministic test failure.
const stale=expression.replace(lookup,'');
await assert.rejects(()=>exercise(stale,{replaceAt:2}),/did not stabilize/);
const noIdentity=expression.replace('const unchanged = sameNode &&','const unchanged =');
assert.notEqual(noIdentity,expression); assert.notEqual((await exercise(noIdentity,{replaceAt:2})).samples,4);
const countUnready=expression.replace('previous = ready ? current : null;','previous = current;');
assert.notEqual(countUnready,expression); assert.notEqual((await exercise(countUnready,{coveredAt:1})).samples,4);
const repeated=expression.replace(command,'').replace(loop,loop+'\n'+command);
assert.notEqual(repeated,expression); await assert.rejects(()=>exercise(repeated),/did not stabilize/);
const noCorrection=expression.replace('realignments === 0 && offscreenStable >= 3','false');
assert.notEqual(noCorrection,expression); await assert.rejects(()=>exercise(noCorrection,{offscreenAt:2}),/did not stabilize/);
const unbounded=expression.replace('realignments === 0 && offscreenStable >= 3','offscreenStable >= 3');
assert.notEqual(unbounded,expression); assert.equal((await exercise(unbounded,{offscreenAt:2,secondDriftAt:6})).scrolls,3);
const earlyCorrection=expression.replace('offscreenStable >= 3','offscreenStable >= 2');
assert.notEqual((await exercise(earlyCorrection,{offscreenAt:2})).samples,7);
const twoReady=expression.replace('if (stable >= 2) return','if (stable >= 1) return');
assert.notEqual((await exercise(twoReady,{offscreenAt:2})).value.stableSamples,3);
assert(source.includes('180_000') && pointer.includes('stableSamples >= 3'));
assert(source.includes('visible reference ${number} below fixed header'));
console.log(`citation-pointer-lifecycle: PASS ${passes.length} timing cases, ${refusals.length} refusals, diagnostics and 8 mutation controls; three fresh same-node samples and unchanged deadlines`);

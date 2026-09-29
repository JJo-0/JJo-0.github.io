import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Execute the actual browser expression, not a parallel implementation.
// Controlled DOM/Back timing is not a claim to reproduce every field failure.
const source = fs.readFileSync(new URL('./browser-news-citation-audit.mjs', import.meta.url), 'utf8');
const pointer = source.slice(source.indexOf('async function pointer('), source.indexOf('async function nativeEnter('));
const match = pointer.match(/const point = await evaluate\(cdp, sessionId, `([\s\S]*?)`\);/);
assert(match, 'The tested expression must be the one used by pointer()');
const selector = 'article a[data-news-citation="1"]';
const expression = new Function('selector', 'return `' + match[1] + '`')(selector);
const command = "a.scrollIntoView({block:'center', behavior:'instant'});";
const loop = 'while (performance.now() - started < 2500) {';
const lookup = '      a = document.querySelector(selector);';
assert.equal(expression.split(command).length - 1, 1);
assert(expression.indexOf(command) < expression.indexOf(loop), 'Position once, then observe');
assert.equal(expression.split(lookup).length - 1, 1);

async function exercise(code, options = {}) {
  let time = 0, scrolls = 0, samples = 0, lookups = 0;
  const blocker = {tagName:'DIV'};
  const nodes = new Map();
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
          // Stable centers must not hide changing dimensions. Repeated alignment
          // perturbs its own geometry, retaining the previous negative control.
          return {left:210 + scrolls + (options.moving ? samples : 0) - width/2,
            top:500-height/2,width,height};
        },
      };
      nodes.set(generation, anchor);
    }
    return nodes.get(generation);
  }
  const document = {
    readyState:'complete', fonts:{ready:Promise.resolve()},
    querySelector:() => { lookups += 1; return currentNode(); },
    elementFromPoint:() => options.covered || samples === options.coveredAt ? blocker : currentNode(),
    documentElement:{get scrollHeight() { return 10000 + (options.heightMoving ? samples : 0); }},
  };
  const location = {
    get pathname() { return samples >= (options.navigateAt ?? Infinity) ? '/other/' : '/posts/article/'; },
    get href() { return 'https://example.test' + this.pathname; },
  };
  const context = {document,URL,location,performance:{now:() => time},
    requestAnimationFrame(callback) { time += 16; queueMicrotask(callback); },
    setTimeout(callback,delay) { time += delay; samples += 1; queueMicrotask(callback); },
    get scrollY() { return 3000 + (options.scrollMoving ? samples : 0); },
  };
  const value = await vm.runInNewContext(code, context, {timeout:1000});
  return {value,scrolls,samples,lookups,time};
}
const passes = [
  ['stable',{},3],
  ['same-geometry replacement after Back',{replaceAt:2},4],
  ['temporary missing node then replacement',{missingAt:2,replaceAt:3},5],
  ['first sample occluded',{coveredAt:1},4],
  ['middle sample occluded',{coveredAt:2},5],
];
for (const [name,options,expectedSamples] of passes) {
  const result = await exercise(expression,options);
  assert.equal(result.scrolls,1,name);
  assert.equal(result.samples,expectedSamples,name);
  assert.equal(result.lookups,result.samples+1,name);
  assert.equal(result.value.stableSamples,3,name);
  assert(result.value.ready && result.value.resolvedPath === result.value.currentPath,name);
  assert(result.time < 2500,name);
  assert(result.value.observations.slice(-3).every(row => row.ready && row.connected && row.hitMatches),name);
}
const refusals = [
  {missing:true},{detached:true},{zeroSize:true},{covered:true},{moving:true},
  {heightMoving:true},{scrollMoving:true},{churn:true},{widthMoving:true},
  {heightResizing:true},{navigateAt:2},
];
for (const options of refusals) {
  await assert.rejects(() => exercise(expression,options), /Missing citation|did not stabilize/);
}
let diagnostic;
try { await exercise(expression,{detached:true}); } catch (error) { diagnostic=error.message; }
const trace = JSON.parse(diagnostic.slice(diagnostic.indexOf('{')));
assert.equal(trace.selector,selector);
assert.equal(trace.initialUrl,'https://example.test/posts/article/');
assert.equal(trace.observations.length,4);
for (const row of trace.observations) {
  for (const key of ['nodePresent','connected','sameNode','hitMatches','x','y','width','height','scrollY','documentHeight','url','readyState']) {
    assert(Object.hasOwn(row,key),`Missing failure diagnostic: ${key}`);
  }
  assert.equal(row.connected,false);
}
// Mutation controls: the new tests must reject captured nodes, cross-node
// stability, two-ready-sample false positives, and repeated scrolling.
const stale = expression.replace(lookup,'');
await assert.rejects(() => exercise(stale,{replaceAt:2}), /did not stabilize/);
const noIdentity = expression.replace('const unchanged = sameNode && previous &&','const unchanged = previous &&');
assert.notEqual(noIdentity,expression);
assert.notEqual((await exercise(noIdentity,{replaceAt:2})).samples,4);
const countUnready = expression.replace('previous = ready ? current : null;','previous = current;');
assert.notEqual(countUnready,expression);
assert.notEqual((await exercise(countUnready,{coveredAt:1})).samples,4);
const repeated = expression.replace(command,'').replace(loop,loop+'\n'+command);
assert.notEqual(repeated,expression);
await assert.rejects(() => exercise(repeated), /did not stabilize/);
assert(source.includes('180_000') && pointer.includes('stableSamples >= 3'));
assert(source.includes('visible reference ${number} below fixed header'));
console.log(`citation-pointer-lifecycle: PASS ${passes.length} timing cases, ${refusals.length} refusals, failure diagnostics, 4 killed mutations; one alignment, three ready same-node samples, original limits and native matrix retained`);

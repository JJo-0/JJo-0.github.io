import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Execute the actual browser-side expression; these controls do not claim to
// reproduce a complete page or replace the native article/viewport matrix.
const source = fs.readFileSync(new URL('./browser-news-citation-audit.mjs', import.meta.url), 'utf8');
const pointer = source.slice(source.indexOf('async function pointer('), source.indexOf('async function nativeEnter('));
const match = pointer.match(/const point = await evaluate\(cdp, sessionId, `([\s\S]*?)`\);/);
assert(match, 'The tested expression must be the one used by pointer()');
const expression = new Function('selector', 'return `' + match[1] + '`')('article a[data-news-citation="1"]');
const command = "a.scrollIntoView({block:'center', behavior:'instant'});";
const loop = 'while (performance.now() - started < 2500) {';
assert.equal(expression.split(command).length - 1, 1);
assert(expression.indexOf(command) < expression.indexOf(loop), 'Position once, then observe');

async function exercise(code, options = {}) {
  let time = 0, scrolls = 0, samples = 0;
  const blocker = {};
  const anchor = {
    isConnected: !options.detached,
    href: 'https://example.test/posts/article/#news-ref-1',
    outerHTML: '<a href="#news-ref-1">[1]</a>',
    contains: () => false,
    scrollIntoView() { scrolls += 1; },
    getBoundingClientRect() {
      samples += 1;
      // Every repeated alignment perturbs layout by a pixel. A passive sampler
      // can converge; the previous loop keeps disturbing its own measurement.
      return {left: 200 + scrolls + (options.moving ? samples : 0), top: 490,
        width: options.zeroSize ? 0 : 20, height: 20};
    },
  };
  const document = {
    fonts: {ready: Promise.resolve()},
    querySelector: () => options.missing ? null : anchor,
    elementFromPoint: () => options.covered ? blocker : anchor,
    documentElement: {get scrollHeight() { return 10000 + (options.heightMoving ? samples : 0); }},
  };
  const context = {document, URL, location: {pathname:'/posts/article/'},
    performance: {now: () => time},
    requestAnimationFrame(callback) { time += 16; queueMicrotask(callback); },
    setTimeout(callback, delay) { time += delay; queueMicrotask(callback); },
    get scrollY() { return 3000 + (options.scrollMoving ? samples : 0); },
  };
  const value = await vm.runInNewContext(code, context, {timeout:1000});
  return {value,scrolls,samples,time};
}
const success = await exercise(expression);
assert.equal(success.scrolls, 1);
assert.equal(success.value.stableSamples, 3);
assert(success.value.ready && success.value.resolvedPath === success.value.currentPath);
assert(success.time < 2500);
for (const options of [{missing:true},{detached:true},{zeroSize:true},{covered:true},{moving:true},{heightMoving:true},{scrollMoving:true}]) {
  await assert.rejects(() => exercise(expression, options), /Missing citation|did not stabilize/);
}
const repeated = expression.replace(command, '').replace(loop, loop + '\n' + command);
assert.notEqual(repeated, expression);
await assert.rejects(() => exercise(repeated), /did not stabilize/);
assert(source.includes('180_000') && pointer.includes('stableSamples >= 3'));
assert(source.includes('visible reference ${number} below fixed header'));
console.log('citation-pointer-lifecycle: PASS actual expression, one alignment, three stable samples, seven refusal cases and repeated-scroll mutation; native matrix remains required');

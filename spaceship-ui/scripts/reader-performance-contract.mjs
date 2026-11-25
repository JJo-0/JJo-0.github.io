import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gzipSync } from 'node:zlib';
import { parse } from 'parse5';
import katex from 'katex';
import { createMathRenderer } from '../src/lib/render-math.mjs';
import { createSearchIndexLoader, matchSearchRows, SEARCH_PAGE_SIZE } from '../src/lib/search-index.mjs';

// Exact KaTeX output and strict behavior survive memoization.
let renders = 0;
const render = createMathRenderer((tex, options) => {
  renders++;
  return katex.renderToString(tex, options);
}, 2);
for (const displayMode of [false, true]) {
  const tex = String.raw`\frac{a_i^2}{\sqrt{x}}`;
  const expected = katex.renderToString(tex, { displayMode, throwOnError: false, strict: 'warn', trust: false, output: 'htmlAndMathml' });
  assert.equal(render(tex, displayMode), expected);
  assert.equal(render(tex, displayMode), expected);
}
assert.equal(renders, 2);
assert.throws(() => render('\\notacommand', true, true));
render('x', true);
render(String.raw`\frac{a_i^2}{\sqrt{x}}`, false);
assert.equal(renders, 5, 'Bounded cache evicts least recently used entries');
const invalid = render('\\notacommand', false);
assert(invalid.includes('katex-error'));
render('\\notacommand', false);
assert.equal(renders, 7, 'Error output is never memoized');

// Real search semantics, request coalescing, locale isolation, expiry and retry.
const row = (id, title, description, href) => ({ id, data: { title, description }, ...(href ? { href } : {}) });
const fixtures = Array.from({ length: 74 }, (_, i) => row('ko-' + i, '로봇 Robot ' + i, 'Vision description'));
let clock = 1000;
const requests = [];
const load = createSearchIndexLoader(async url => {
  requests.push(url);
  return { ok: true, json: async () => url.startsWith('/en/') ? [row('en-test', 'Robot', 'Vision', '/en/posts/en-test/')] : fixtures };
}, () => clock);
const [first, concurrent] = await Promise.all([load('ko-KR'), load('ko')]);
assert.equal(first, concurrent);
assert.deepEqual(requests, ['/api/search.json']);
assert.equal((await load('ko')).length, 74);
assert.equal(matchSearchRows(first, ' ROBOT ').length, 74);
assert.equal(matchSearchRows(first, '로봇').length, 74);
assert.equal(matchSearchRows(first, 'VISION').length, 74);
assert.equal(matchSearchRows(first, '  ').length, 0);
assert.equal(matchSearchRows(first, 'Robot 73')[0].id, 'ko-73');
assert.equal(SEARCH_PAGE_SIZE, 30);
assert.equal((await load('en-US'))[0].href, '/en/posts/en-test/');
assert.equal(requests.length, 2);
clock += 300001;
await load('ko');
assert.equal(requests.length, 3);
let attempts = 0;
const retry = createSearchIndexLoader(async () => {
  attempts++;
  return attempts === 1 ? { ok: false } : { ok: true, json: async () => fixtures };
});
await assert.rejects(retry('ko'), /request failed/);
assert.equal((await retry('ko')).length, 74);
assert.equal(attempts, 2);

const read = file => fs.readFileSync(file, 'utf8');
const ko = JSON.parse(read('dist/api/search.json'));
const en = JSON.parse(read('dist/en/api/search.json'));
assert(ko.length > 0 && ko.length === en.length);
assert.equal(new Set(ko.map(x => x.id)).size, ko.length);
assert.equal(new Set(en.map(x => x.id)).size, en.length);
assert(en.every(x => x.href?.startsWith('/en/posts/')));
function nodes(root, pred) {
  const result = [];
  if (pred(root)) result.push(root);
  for (const child of root.childNodes ?? []) result.push(...nodes(child, pred));
  return result;
}
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const summary = [];
for (const file of ['dist/index.html','dist/en/index.html','dist/posts/index.html','dist/en/posts/index.html']) {
  const html = read(file), doc = parse(html);
  const fonts = nodes(doc, n => n.tagName === 'link' && attr(n,'rel') === 'preload' && attr(n,'as') === 'font');
  assert.equal(fonts.length, 1, file + ': only critical font preload');
  assert.match(attr(fonts[0], 'href'), /outfit-latin-700-normal/);
  const cards = nodes(doc, n => n.tagName === 'article' && attr(n,'class')?.split(/\s+/).includes('writing-list-item'));
  if (file.includes('/posts/')) {
    assert(cards.length > 0);
    for (const card of cards) {
      assert.equal(attr(card,'class'), 'writing-list-item');
      assert.equal(nodes(card, n => n.tagName === 'a' && attr(n,'data-post-transition-slug') !== undefined).length, 1);
      assert.equal(nodes(card, n => attr(n,'data-post-transition-title') !== undefined).length, 1);
    }
  }
  summary.push({ file, cards: cards.length, rawBytes: Buffer.byteLength(html), gzipBytes: gzipSync(html).byteLength, fontPreloads: fonts.length });
}
assert(read('astro.config.mjs').includes('prefetchAll: false'));
console.log('reader-performance: PASS ' + JSON.stringify({ searchRows: ko.length, summary }));

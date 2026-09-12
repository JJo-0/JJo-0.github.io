import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BASE, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

const series = JSON.parse(fs.readFileSync(new URL('../src/data/acts-series.json', import.meta.url), 'utf8'));
const slugs = series.entries.map((entry) => entry.slug);
const sizes = [
  { width: 320, height: 800, mobile: true, touch: true, reduced: true },
  { width: 390, height: 844, mobile: true, touch: true, reduced: true },
  { width: 1440, height: 1000, reduced: true },
];

async function pressEnter(cdp, sessionId) {
  // A native summary activates on Enter's character input, not a bare raw key.
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' }, sessionId);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }, sessionId);
}

export async function auditActsStudies(cdp, sessionId) {
  assert.equal(series.entries.length, 6);
  assert.deepEqual(series.entries.map((entry) => entry.order), [1, 2, 3, 4, 5, 6]);
  for (const entry of series.entries) {
    const source = fs.readFileSync(new URL(`../site/content/posts/${entry.slug}.mdx`, import.meta.url), 'utf8');
    assert(source.length > 4000, `Substantive source-based article: ${entry.slug}`);
    const response = await fetch(new URL(`/posts/${entry.slug}`, BASE), { cache: 'no-store' });
    assert.equal(response.status, 200, entry.slug);
    const html = await response.text();
    assert(html.includes(entry.source), `Original source link: ${entry.slug}`);
    assert(html.includes('data-study-row'), `Static no-JS table data: ${entry.slug}`);
    assert(!html.includes('cdn.tailwindcss.com'), `No runtime Tailwind CDN: ${entry.slug}`);
    assert(!html.includes('cdn.jsdelivr.net/npm/chart.js'), `No unpinned Chart CDN: ${entry.slug}`);
    const original = html.match(/<details[^>]*data-acts-original[^>]*>/)?.[0];
    assert(original, `Original source panel exists: ${entry.slug}`);
    assert(!/\sopen(?:\s|=|>)/.test(original), `Original closed by default: ${entry.slug}`);
    console.log(`acts-route: PASS HTTP ${response.status} ${response.url} source=${entry.source}`);
  }

  for (const size of sizes) {
    await viewport(cdp, sessionId, size);
    for (const route of ['/bible', '/posts']) {
      await navigate(cdp, sessionId, route);
      const actual = await evaluate(cdp, sessionId, `[...document.querySelectorAll('[data-acts-card]')].map((node) => node.dataset.actsCard)`);
      assert.deepEqual(actual, slugs, `${route} overview must precede passage exegesis`);
    }
    for (const entry of series.entries) {
      await navigate(cdp, sessionId, `/posts/${entry.slug}`);
      await waitExpression(cdp, sessionId, `Boolean(document.querySelector('[data-study-tools]:not([hidden])'))`, 'Study controls initialize');
      assert.equal(await evaluate(cdp, sessionId, `document.querySelector('[data-acts-original]').open`), false);
      await evaluate(cdp, sessionId, `(() => { const summary = document.querySelector('[data-acts-original] summary'); summary.scrollIntoView({block:'center',behavior:'instant'}); summary.focus(); })()`);
      assert.equal(await evaluate(cdp, sessionId, `document.activeElement === document.querySelector('[data-acts-original] summary')`), true, `${entry.slug}: native summary receives focus`);
      await pressEnter(cdp, sessionId);
      await waitExpression(cdp, sessionId, `document.querySelector('[data-acts-original]').open`, `${entry.slug}: keyboard opens original details`);
      assert.equal(await evaluate(cdp, sessionId, `document.querySelector('[data-acts-source]').href`), entry.source);
      await pressEnter(cdp, sessionId);
      await waitExpression(cdp, sessionId, `!document.querySelector('[data-acts-original]').open`, `${entry.slug}: keyboard closes original details`);
      for (const dark of [false, true]) {
        const result = await evaluate(cdp, sessionId, `(() => {
          document.documentElement.classList.toggle('dark', ${dark});
          const reader = document.querySelector('[data-acts-reader]');
          const probe = document.createElement('span'); probe.style.backgroundColor = 'var(--color-card)'; reader.append(probe);
          const expected = getComputedStyle(probe).backgroundColor; probe.remove();
          return { overflow: document.documentElement.scrollWidth > innerWidth + 2,
            theme: getComputedStyle(reader).backgroundColor === expected,
            tables: document.querySelectorAll('[data-study-table]').length,
            sourceClosed: !document.querySelector('[data-acts-original]').open };
        })()`);
        assert.equal(result.overflow, false, `${entry.slug} width=${size.width} dark=${dark}: overflow`);
        assert.equal(result.theme, true, `${entry.slug}: existing palette tokens`);
        assert.equal(result.sourceClosed, true);
        assert(result.tables >= 1);
      }
      await evaluate(cdp, sessionId, `(() => {
        const input = document.querySelector('[data-study-query]'); input.value = '___no-match-acts___'; input.dispatchEvent(new Event('input', {bubbles:true}));
      })()`);
      assert.equal(await evaluate(cdp, sessionId, `document.querySelector('jjo-study-table').querySelectorAll('[data-study-row]:not([hidden])').length`), 0);
      await evaluate(cdp, sessionId, `document.querySelector('[data-study-reset]').click()`);
      assert(await evaluate(cdp, sessionId, `document.querySelector('jjo-study-table').querySelectorAll('[data-study-row]:not([hidden])').length > 0`));
      console.log(`acts-reader: PASS ${entry.slug} width=${size.width} light/dark keyboard open/close search/reset`);
    }
  }

  // Exercise Astro navigation and ensure detached custom-element listeners do not leak.
  await navigate(cdp, sessionId, '/posts/acts-overview-1');
  await evaluate(cdp, sessionId, `document.querySelector('a[href="/posts/acts-overview-2"]').click()`);
  await waitExpression(cdp, sessionId, `location.pathname.split('/').filter(Boolean).join('/') === 'posts/acts-overview-2' && Boolean(document.querySelector('[data-study-table="acts-evidence-cases"] [data-study-tools]:not([hidden])'))`, 'Client navigation initializes new table');
  const filtered = await evaluate(cdp, sessionId, `(() => {
    const table = document.querySelector('[data-study-table="acts-evidence-cases"]');
    const select = table.querySelector('select'); select.value = 'D'; select.dispatchEvent(new Event('change',{bubbles:true}));
    return [...table.querySelectorAll('[data-study-row]:not([hidden])')].map((row) => row.textContent);
  })()`);
  assert.equal(filtered.length, 2, 'Two Grade D rows from source data');
  const searchResult = await evaluate(cdp, sessionId, `(() => {
    const table = document.querySelector('[data-study-table="acts-evidence-cases"]');
    table.querySelector('[data-study-reset]').click();
    const input = table.querySelector('input'); input.value = '갈리오'; input.dispatchEvent(new Event('input',{bubbles:true}));
    return [...table.querySelectorAll('[data-study-row]:not([hidden])')].map((row) => row.textContent);
  })()`);
  assert.equal(searchResult.length, 1, 'Filter selects the same case content, not a positional modal');
  assert(searchResult[0].includes('08. 갈리오'));
  console.log('acts-study-qa: PASS 6 articles, ordered shelves, 3 viewports x 2 themes, keyboard originals, filters, SSR content and Astro navigation');
}

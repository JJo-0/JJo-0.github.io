import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

// Additive coverage for all rendered source disclosures. Existing complete
// browser, original-image and citation suites retain their full assertions.
const slugs = [
  '2026-09-25-nhs-galleri-screening-performance-news',
  '2026-09-25-npu-sparrow-wing-tail-coordination-news',
  '2026-09-25-soec-stack-operational-control-news',
  '2026-09-28-high-voltage-linio2-nanorod-news',
  '2026-09-28-spacey-spatial-omics-gnn-news',
  '2026-09-28-variation-tolerant-implant-wpt-news',
  '2026-09-29-agent-thermostable-mrna-vaccine-news',
  '2026-09-29-silicon-solid-polymer-battery-news',
  '2026-09-30-wrn-inhibitor-phase1-news',
  '2026-10-02-glassrecon-depth-prior-news',
  '2026-10-02-lace-complementary-heuristics-news',
  '2026-10-02-perturbation-benchmark-calibration-news',
];
// Pages live QA has the exact source checkout but no local dist. Preview CI
// also checks that this explicitly reviewed roster covers every folded article.
if (fs.existsSync('dist/posts')) {
  const rendered = fs.readdirSync('dist/posts', { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(`dist/posts/${entry.name}/index.html`))
    .map(entry => entry.name)
    .filter(slug => /<details\b[^>]*\bdata-news-source-disclosure(?:[\s=>])/.test(fs.readFileSync(`dist/posts/${slug}/index.html`, 'utf8')));
  assert.deepEqual(rendered.sort(), [...slugs].sort(), 'All folded articles must enter the reviewed browser roster');
}
const out = 'source-disclosure-audit';
fs.mkdirSync(out, { recursive: true });
const rows = [];
let preview, chrome, cdp, sessionId;
const timer = setTimeout(() => { console.error('source-disclosure: FAIL timeout'); process.exit(1); }, 240_000);

async function enter(selector, scriptingDisabled = false) {
  // DOM focus and trusted keyboard input work even while page scripting is off.
  if (scriptingDisabled) await cdp.send('Emulation.setScriptExecutionDisabled', { value: true }, sessionId);
  try {
    await cdp.send('DOM.enable', {}, sessionId);
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 }, sessionId);
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector }, sessionId);
    assert(nodeId > 0, `Missing keyboard target ${selector}`);
    await cdp.send('DOM.focus', { nodeId }, sessionId);
    const focused = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: ':focus' }, sessionId);
    assert.equal(focused.nodeId, nodeId, 'The intended link or summary must own keyboard focus');
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13 }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }, sessionId);
  } finally {
    if (scriptingDisabled) await cdp.send('Emulation.setScriptExecutionDisabled', { value: false }, sessionId);
  }
}

async function visibleTarget(id) {
  await waitExpression(cdp, sessionId, `(() => {
    const target = document.getElementById(${JSON.stringify(id)});
    const box = target?.getBoundingClientRect();
    const header = document.querySelector('header')?.getBoundingClientRect();
    return box && box.width > 0 && box.height > 0 && box.top >= (header?.bottom || 0) - 2 && box.top < innerHeight;
  })()`, `visible source target ${id}`);
}

try {
  preview = await startPreview();
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath: false }));
  for (const width of [390, 1440]) {
    await viewport(cdp, sessionId, { width, height: 900, mobile: width === 390, touch: width === 390, reduced: true });
    for (const slug of slugs) {
      const route = `/posts/${slug}/`;
      await navigate(cdp, sessionId, route);
      const initial = await evaluate(cdp, sessionId, `(() => {
        const details = document.querySelector('article [data-news-source-disclosure]');
        const reference = details?.querySelector('[data-news-reference]');
        const heading = details?.querySelector('h2[id], h3[id]');
        return { open: details?.open, reference: reference?.id, heading: heading?.id,
          referenceCount: details?.querySelectorAll('[data-news-reference]').length,
          overflow: document.documentElement.scrollWidth > innerWidth + 2 };
      })()`);
      assert.equal(initial.open, false, `${slug}: collapsed by default`);
      assert(initial.reference && initial.heading && initial.referenceCount > 0);
      assert(!initial.overflow, `${slug}: document overflow`);
      const wideEquation = width === 390 ? await evaluate(cdp, sessionId, `(() => {
        const math = [...document.querySelectorAll('article .candidate-equation__math')]
          .find(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2);
        return math ? { id: math.closest('[data-candidate-equation]').dataset.candidateEquation, before: math.scrollLeft } : null;
      })()`) : null;
      if (wideEquation) {
        const selector = `article [data-candidate-equation="${wideEquation.id}"] .candidate-equation__math`;
        await cdp.send('DOM.enable', {}, sessionId);
        const { root } = await cdp.send('DOM.getDocument', { depth: 0 }, sessionId);
        const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector }, sessionId);
        await cdp.send('DOM.focus', { nodeId }, sessionId);
        for (let i = 0; i < 8; i++) {
          await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 }, sessionId);
          await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 }, sessionId);
        }
        await waitExpression(cdp, sessionId, `document.querySelector(${JSON.stringify(selector)}).scrollLeft > ${wideEquation.before}`, 'keyboard horizontal equation scroll');
      }
      const citation = `article a[data-news-citation][href="#${initial.reference}"]`;
      await enter(citation, true);
      await waitExpression(cdp, sessionId, `location.hash === ${JSON.stringify(`#${initial.reference}`)}`, 'native fragment with page scripting disabled');
      await visibleTarget(initial.reference);
      assert.equal(await evaluate(cdp, sessionId, `document.querySelector('article [data-news-source-disclosure]').open`), true);
      await navigate(cdp, sessionId, route);
      await enter('article [data-news-source-disclosure] > summary');
      await waitExpression(cdp, sessionId, `document.querySelector('article [data-news-source-disclosure]').open`, 'keyboard opens source disclosure');
      await enter('article [data-news-source-disclosure] > summary');
      await waitExpression(cdp, sessionId, `!document.querySelector('article [data-news-source-disclosure]').open`, 'keyboard closes source disclosure');
      let tocChecked = false;
      if (width === 1440) {
        // Svelte TOC uses pushState, so it cannot rely on hashchange to reveal
        // the heading. Capture-phase reveal must run before its layout read.
        const toc = `nav a[href="#${initial.heading}"]`;
        await waitExpression(cdp, sessionId, `Boolean(document.querySelector(${JSON.stringify(toc)})?.closest('astro-island')?.hasAttribute('ssr') === false)`, 'TOC hydration');
        await enter(toc);
        await visibleTarget(initial.heading);
        assert.equal(await evaluate(cdp, sessionId, `document.querySelector('article [data-news-source-disclosure]').open`), true);
        tocChecked = true;
      }
      await navigate(cdp, sessionId, `${route}#${initial.reference}`);
      await visibleTarget(initial.reference);
      assert.equal(await evaluate(cdp, sessionId, `document.querySelector('article [data-news-source-disclosure]').open`), true);
      rows.push({ slug, width, references: initial.referenceCount, noScriptNativeFragment: true, keyboardDisclosure: true, tocChecked, deepLink: true, keyboardMathScroll: wideEquation?.id || 'NOT_APPLICABLE' });
      console.log(`source-disclosure: PASS ${JSON.stringify(rows.at(-1))}`);
    }
  }
  fs.writeFileSync(`${out}/browser.json`, JSON.stringify({ base: BASE, slugs, rows }, null, 2));
} catch (error) {
  console.error(error);
  fs.writeFileSync(`${out}/failure.json`, JSON.stringify({ error: String(error), rows }, null, 2));
  process.exitCode = 1;
} finally {
  cdp?.close();
  await stopChild(chrome?.child, 'SIGKILL');
  await stopChild(preview, 'SIGTERM');
  removeProfile(chrome?.profile);
  clearTimeout(timer);
  process.exit(process.exitCode || 0);
}

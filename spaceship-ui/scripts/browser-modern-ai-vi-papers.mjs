import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

const ids = ['fcn-fig-2', 'fcn-fig-3', 'fcn-fig-4', 'unet-fig-1', 'unet-fig-3'];
const out = 'vi-review';
fs.mkdirSync(out, { recursive: true });
const results = [];
let preview, chrome, cdp, sessionId;
const deadline = setTimeout(() => { console.error('vi-papers-browser: FAIL hard timeout'); process.exit(1); }, 150_000);
async function shot(name) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(`${out}/${name}.png`, Buffer.from(result.data, 'base64'));
}
try {
  preview = await startPreview();
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath: false }));
  for (const width of [390, 1440]) {
    await viewport(cdp, sessionId, { width, height: 1100, mobile: width === 390, touch: width === 390, reduced: true });
    for (const dark of [false, true]) {
      await navigate(cdp, sessionId, '/posts/2026-08-25-modern-artificial-intelligence-6/');
      await evaluate(cdp, sessionId, `document.documentElement.classList.toggle('dark', ${dark})`);
      await evaluate(cdp, sessionId, 'document.fonts.ready.then(() => true)');
      const found = await evaluate(cdp, sessionId, `Array.from(document.querySelectorAll('article [data-paper-figure]')).map(n=>n.dataset.paperFigure)`);
      assert.deepEqual(found, ids);
      for (const id of ids) {
        await evaluate(cdp, sessionId, `document.querySelector('[data-paper-figure="${id}"]').scrollIntoView({block:'center',behavior:'instant'})`);
        await waitExpression(cdp, sessionId, `(() => {const i=document.querySelector('[data-paper-figure="${id}"] img');return i.complete && i.naturalWidth>0;})()`, `decode ${id}`);
        const check = await evaluate(cdp, sessionId, `(() => {
          const f=document.querySelector('[data-paper-figure="${id}"]');
          const i=f.querySelector('img'), r=i.getBoundingClientRect(), style=getComputedStyle(i);
          const a=f.querySelector('a'), caption=f.querySelector('figcaption');
          return {id:${JSON.stringify(id)},width:r.width,height:r.height,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,
            alt:i.alt,caption:caption.textContent,sourceCount:caption.querySelectorAll('a').length,
            href:a.getAttribute('href'),src:i.getAttribute('src'),filter:style.filter,
            overflow:document.documentElement.scrollWidth>innerWidth+2};
        })()`);
        assert(check.width > 200 && check.height > 40, `${id}: nonzero displayed figure`);
        assert(Math.abs(check.width / check.height - check.naturalWidth / check.naturalHeight) < 0.02, `${id}: aspect ratio`);
        assert(check.alt.length > 30 && check.caption.includes('원논문') && check.sourceCount === 3);
        assert.equal(check.href, check.src, 'Full-size link targets the actual local figure');
        assert.equal(check.filter, 'none', 'Original figure colors must not be inverted');
        assert(!check.overflow, `${id}: page overflows at ${width}`);
        if (['fcn-fig-3', 'unet-fig-1', 'unet-fig-3'].includes(id)) await shot(`${id}-${width}-${dark ? 'dark' : 'light'}`);
      }
      const details = await evaluate(cdp, sessionId, `Array.from(document.querySelectorAll('article details')).filter(d=>d.querySelector('summary')?.textContent.includes('계산 예제') || d.querySelector('summary')?.textContent.includes('작은 숫자')).length`);
      assert(details >= 4, 'Worked examples must be present');
      const opened = await evaluate(cdp, sessionId, `(() => {
        const ds=[...document.querySelectorAll('article details')].filter(d=>d.querySelector('summary')?.textContent.includes('계산 예제') || d.querySelector('summary')?.textContent.includes('작은 숫자'));
        for (const d of ds) { if(!d.open) d.querySelector('summary').click(); }
        return ds.every(d=>d.open && d.textContent.trim().length>150);
      })()`);
      assert(opened, 'Worked-example disclosures must open and contain explanations');
      const final = await evaluate(cdp, sessionId, `({overflow:document.documentElement.scrollWidth>innerWidth+2,mathErrors:document.querySelectorAll('article .katex-error').length,oldEquations:document.querySelectorAll('[data-formula-id^="MAI-P6-"]').length})`);
      assert(!final.overflow && final.mathErrors === 0 && final.oldEquations === 10);
      results.push({ width, theme: dark ? 'dark' : 'light', figures: ids.length, workedExamples: details, oldEquations: 10 });
      console.log('vi-papers-browser: PASS ' + JSON.stringify(results.at(-1)));
    }
  }
  assert.deepEqual(results.map(({ width, theme }) => [width, theme]), [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]);
  fs.writeFileSync(`${out}/browser.json`, JSON.stringify({ base: BASE, results }, null, 2));
  console.log('vi-papers-browser: PASS complete four-case reading matrix');
} catch (error) {
  console.error('vi-papers-browser: FAIL', error);
  process.exitCode = 1;
  if (cdp && sessionId) { try { await shot('failure'); } catch { /* Preserve the original error. */ } }
} finally {
  cdp?.close();
  await stopChild(chrome?.child, 'SIGKILL');
  await stopChild(preview, 'SIGTERM');
  removeProfile(chrome?.profile);
  clearTimeout(deadline);
  // Child-process pipes must not keep a completed or failed audit alive.
  // All assertions and synchronous evidence writes have finished before exit.
  process.exit(process.exitCode || 0);
}

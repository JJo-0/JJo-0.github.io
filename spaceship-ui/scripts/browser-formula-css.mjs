import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

const lessons = [
  ['DotProductPredictionLesson','MAI-P2-017','.dot-product-layout'],
  ['NormalEquationLesson','MAI-P2-020','.lesson-layout'],
  ['ResidualGradientLesson','MAI-P2-028','.scalar-layout,.matrix-layout'],
  ['SampleMatrixAssemblyLesson','MAI-P2-031','.assembly-layout'],
  ['GeneralizationGapLesson','MAI-P2-034','.generalization-layout'],
  ['RidgeRegularizationLesson','MAI-P2-036','.ridge-layout'],
];
const out = 'mobile-performance';
fs.mkdirSync(out, { recursive: true });
let preview, chrome, cdp, sessionId;
const results = [];
const hardStop = setTimeout(() => { console.error('formula-css: hard timeout'); process.exit(1); }, 120_000);
try {
  preview = await startPreview(); chrome = await startChrome(); cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath: false }));
  await viewport(cdp, sessionId, { width: 390, height: 844, mobile: true, touch: true, reduced: true });
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }, sessionId);
  for (const prefix of ['', '/en']) {
    for (const route of ['/', '/news/', '/posts/']) {
      await navigate(cdp, sessionId, prefix + route);
      const urls = await evaluate(cdp, sessionId, "Array.from(document.querySelectorAll('link[rel=stylesheet]'), l => l.href).concat(performance.getEntriesByType('resource').filter(r => r.name.includes('.css')).map(r => r.name))");
      for (const [name] of lessons) assert(!urls.some(url => url.includes('/' + name + '.') && url.includes('.css')), prefix + route + ': eager ' + name + ' stylesheet');
    }
    const article = prefix + '/posts/2026-08-18-modern-artificial-intelligence-2/';
    await navigate(cdp, sessionId, article);
    for (const [name,id,selector] of lessons) {
      const host = '[data-lesson-formula-id="' + id + '"][data-lesson-renderer="' + name + '"]';
      const expr = JSON.stringify(host), layout = JSON.stringify(selector);
      await evaluate(cdp, sessionId, "(() => { const h=document.querySelector(" + expr + ");if(!h)throw Error('Missing lesson');const d=h.closest('details');if(!d)throw Error('Missing disclosure');d.open=true;})()");
      await waitExpression(cdp, sessionId, "(() => {const h=document.querySelector(" + expr + ");const l=h?.querySelector(" + layout + ");return h?.dataset.lessonMounted==='true' && l && getComputedStyle(l).display==='grid';})()", prefix + ' ' + name + ' mounted with grid styles');
      results.push({ article, name, id, mounted: true, display: 'grid' });
    }
  }
  fs.writeFileSync(out + '/formula-css.json',JSON.stringify({base:BASE,results},null,2));
  console.log('formula-css: PASS ' + JSON.stringify(results));
} catch (error) {
  console.error(error); process.exitCode=1;
  fs.writeFileSync(out + '/formula-css-failure.json',JSON.stringify({error:String(error),results},null,2));
} finally {
  cdp?.close(); await stopChild(chrome?.child,'SIGKILL'); await stopChild(preview,'SIGTERM');
  removeProfile(chrome?.profile); clearTimeout(hardStop); process.exit(process.exitCode || 0);
}

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { startPreview, startChrome, Cdp, attach, stopChild, removeProfile, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

const out = process.env.JJO_SELF_IMPROVING_ARTIFACTS || path.join(os.tmpdir(), 'jjo-self-improving');
fs.mkdirSync(out, { recursive: true });
const chapters = [
  { number: 4, slug: 'self-improving-ai-04-sparse-rewards-and-shaping', previous: 'self-improving-ai-03-self-correction-to-rl', next: 'self-improving-ai-05-reward-design-to-ai-feedback' },
  { number: 5, slug: 'self-improving-ai-05-reward-design-to-ai-feedback', previous: 'self-improving-ai-04-sparse-rewards-and-shaping', next: null },
];
const evidence = { checkedAt: new Date().toISOString(), publicBase: process.env.JJO_SMOKE_BASE_URL || null, views: [], assets: [], series: [] };
let preview, chrome, cdp;
try {
  for (const chapter of chapters) {
    const manifest = JSON.parse(fs.readFileSync(`../docs/self-improving-ai/source-assets/0${chapter.number}/manifest.json`, 'utf8'));
    assert.equal(manifest.assets.length, 9);
    for (const asset of manifest.assets) {
      const data = fs.readFileSync(path.resolve('..', asset.path));
      assert.equal(crypto.createHash('sha256').update(data).digest('hex'), asset.sha256);
      evidence.assets.push({ path: asset.path, sha256: asset.sha256, source: asset.source });
    }
  }
  if (!process.env.JJO_SMOKE_BASE_URL) preview = await startPreview();
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  const { sessionId: session } = await attach(cdp);
  for (const width of [390, 1440]) {
    await viewport(cdp, session, { width, height: 1000, mobile: width < 500, touch: width < 500, reduced: true });
    for (const chapter of chapters) {
      await navigate(cdp, session, `/posts/${chapter.slug}/`);
      await waitExpression(cdp, session, "document.querySelectorAll('article figure[data-learning-figure]').length === 9", 'Nine lesson figures');
      for (let index = 0; index < 9; index++) {
        await evaluate(cdp, session, `document.querySelectorAll('article figure[data-learning-figure]')[${index}].scrollIntoView({block:'center',behavior:'instant'})`);
        await waitExpression(cdp, session, `(()=>{const image=document.querySelectorAll('article figure[data-learning-figure] img')[${index}];return image.complete && image.naturalWidth>0 && image.naturalHeight>0;})()`, 'Lesson image decoded');
      }
      const view = await evaluate(cdp, session, `(()=>{
        const figures=Array.from(document.querySelectorAll('article figure[data-learning-figure]'));
        const navigation=document.querySelector('[data-series-reading-navigation="self-improving-ai"]');
        return { url:location.href, width:innerWidth,
          overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
          figures:figures.map(f=>{const i=f.querySelector('img'),a=f.querySelector('figcaption a');return {src:i.getAttribute('src'),naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,alt:i.alt,source:a?.href,caption:f.querySelector('figcaption')?.textContent};}),
          math:document.querySelectorAll('article .katex').length,
          mathErrors:document.querySelectorAll('.katex-error').length,
          previous:navigation?.querySelector('[rel="prev"]')?.getAttribute('href'),
          next:navigation?.querySelector('[rel="next"]')?.getAttribute('href') || null
        };
      })()`);
      assert.equal(view.figures.length, 9);
      assert.equal(view.math, 26);
      assert.equal(view.mathErrors, 0);
      assert(view.overflow <= 2, JSON.stringify(view));
      assert.equal(view.previous, `/posts/${chapter.previous}/`);
      assert.equal(view.next, chapter.next ? `/posts/${chapter.next}/` : null);
      for (const figure of view.figures) {
        assert(figure.alt.length > 10 && figure.caption.length > 20);
        assert(figure.source?.includes('#page='));
      }
      evidence.views.push(view);
      for (const index of [1, 7]) {
        await evaluate(cdp, session, `document.querySelectorAll('article figure[data-learning-figure]')[${index}].scrollIntoView({block:'center',behavior:'instant'})`);
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, session);
        fs.writeFileSync(path.join(out, `${chapter.slug}-${width}-figure-${index}.png`), Buffer.from(shot.data, 'base64'));
      }
      console.log('PASS Self-Improving article', chapter.slug, width, JSON.stringify({ images: view.figures.length, math: view.math, errors: view.mathErrors, overflow: view.overflow }));
    }
    await navigate(cdp, session, '/posts/');
    await waitExpression(cdp, session, "!!document.querySelector('[data-series-group=" + '"self-improving-ai"' + "]')", 'Self-Improving series group');
    const group = await evaluate(cdp, session, `(()=>{const g=document.querySelector('[data-series-group="self-improving-ai"]');return {title:g.querySelector('.series-group__title')?.textContent,count:g.querySelector('.series-group__count')?.textContent,links:[...new Set(Array.from(g.querySelectorAll('a[href^="/posts/"]')).map(a=>a.getAttribute('href')))]};})()`);
    assert.equal(group.title, '자가개선 AI');
    assert.equal(group.count, '5편');
    // List cards omit the optional trailing slash; retain exact path membership checks.
    const groupPaths = new Set(group.links.map(href => href.replace(/\/+$/, '')));
    for (const chapter of chapters) assert(groupPaths.has(`/posts/${chapter.slug}`), `Series missing ${chapter.slug}`);
    await evaluate(cdp, session, "(()=>{const g=document.querySelector('[data-series-group=\"self-improving-ai\"]');g.open=true;g.scrollIntoView({block:'center',behavior:'instant'});})()");
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, session);
    fs.writeFileSync(path.join(out, `self-improving-group-${width}.png`), Buffer.from(shot.data, 'base64'));
    evidence.series.push({ width, ...group });
    console.log('PASS Self-Improving series name and membership', width, JSON.stringify(group));
  }
  evidence.result = 'PASS';
} catch (error) {
  evidence.result = 'FAIL';
  evidence.error = String(error?.stack || error);
  throw error;
} finally {
  fs.writeFileSync(path.join(out, 'self-improving-reading.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log('SELF_IMPROVING_EVIDENCE', JSON.stringify(evidence));
  cdp?.close();
  await stopChild(chrome?.child);
  await stopChild(preview);
  if (chrome) removeProfile(chrome.profile);
}
process.exit(0);

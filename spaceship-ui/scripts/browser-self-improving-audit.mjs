import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { startPreview, startChrome, Cdp, attach, stopChild, removeProfile, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

const out = process.env.JJO_SELF_IMPROVING_ARTIFACTS || path.join(os.tmpdir(), 'jjo-self-improving');
fs.mkdirSync(out, { recursive: true });
const chapters = [
  { number: 4, math: 26, slug: 'self-improving-ai-04-sparse-rewards-and-shaping', previous: 'self-improving-ai-03-self-correction-to-rl', next: 'self-improving-ai-05-reward-design-to-ai-feedback' },
  { number: 5, math: 26, slug: 'self-improving-ai-05-reward-design-to-ai-feedback', previous: 'self-improving-ai-04-sparse-rewards-and-shaping', next: 'self-improving-ai-06-self-evaluation-and-entropy' },
  { number: 6, math: 20, slug: 'self-improving-ai-06-self-evaluation-and-entropy', previous: 'self-improving-ai-05-reward-design-to-ai-feedback', next: 'self-improving-ai-07-unsupervised-rlvr-and-test-time-training' },
  { number: 7, math: 22, slug: 'self-improving-ai-07-unsupervised-rlvr-and-test-time-training', previous: 'self-improving-ai-06-self-evaluation-and-entropy', next: null },
];
const manifests = new Map();
const evidence = { checkedAt: new Date().toISOString(), publicBase: process.env.JJO_SMOKE_BASE_URL || null, views: [], assets: [], series: [] };
let preview, chrome, cdp;
try {
  for (const chapter of chapters) {
    const manifest = JSON.parse(fs.readFileSync(`../docs/self-improving-ai/source-assets/0${chapter.number}/manifest.json`, 'utf8'));
    assert.equal(manifest.assets.length, 9);
    manifests.set(chapter.number, manifest);
    for (const asset of manifest.assets) {
      const data = fs.readFileSync(path.resolve('..', asset.path));
      assert.equal(crypto.createHash('sha256').update(data).digest('hex'), asset.sha256);
      const record = { path: asset.path, sha256: asset.sha256, source: asset.source };
      if (process.env.JJO_SMOKE_BASE_URL) {
        const response = await fetch(new URL(asset.src, process.env.JJO_SMOKE_BASE_URL), { signal: AbortSignal.timeout(30000), cache: 'no-store' });
        assert.equal(response.status, 200, `Public asset ${asset.src}`);
        const publicHash = crypto.createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
        assert.equal(publicHash, asset.sha256, `Public asset hash ${asset.src}`);
        record.publicSha256 = publicHash;
      }
      evidence.assets.push(record);
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
      assert.equal(view.math, chapter.math);
      assert.equal(view.mathErrors, 0);
      assert(view.overflow <= 2, JSON.stringify(view));
      assert.equal(view.previous, `/posts/${chapter.previous}/`);
      assert.equal(view.next, chapter.next ? `/posts/${chapter.next}/` : null);
      for (const figure of view.figures) {
        const expected = manifests.get(chapter.number).assets.find(asset => asset.src === figure.src);
        assert(expected, `Unexpected image ${figure.src}`);
        assert.equal(figure.naturalWidth, expected.width);
        assert.equal(figure.naturalHeight, expected.height);
        assert.equal(figure.source, expected.source);
        assert(figure.alt.length > 10 && figure.caption.length > 20);
        assert(figure.source?.includes('#page='));
      }
      if (chapter.number === 7) {
        const transcriptLinks = await evaluate(cdp, session, `Array.from(document.querySelectorAll('article a[href*="youtube.com/watch"]')).map(a=>a.href)`);
        for (const seconds of [1873, 1918, 1972, 2014, 2086]) {
          assert(transcriptLinks.some(href => { const url = new URL(href); return url.searchParams.get('v') === 's06mSAGN4gM' && url.searchParams.get('t') === `${seconds}s`; }), `Missing transcript timestamp ${seconds}`);
        }
        view.transcriptLinks = transcriptLinks;
      }
      evidence.views.push(view);
      for (const index of (chapter.number >= 6 ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [1, 7])) {
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
    assert.equal(group.count, '7편');
    // List cards omit the optional trailing slash; retain exact path membership checks.
    const groupPaths = new Set(group.links.map(href => href.replace(/\/+$/, '')));
    assert.equal(groupPaths.size, 7);
    for (const slug of ['self-improving-ai-01-overview', 'self-improving-ai-02-learning-targets', 'self-improving-ai-03-self-correction-to-rl']) assert(groupPaths.has(`/posts/${slug}`), `Series missing ${slug}`);
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

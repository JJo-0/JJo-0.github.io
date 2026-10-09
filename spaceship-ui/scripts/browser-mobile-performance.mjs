import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile, sleep } from './browser-smoke-harness.mjs';

const out = 'mobile-performance';
fs.mkdirSync(out, { recursive: true });
let preview, chrome, cdp, sessionId;
const results = [];
const hardStop = setTimeout(() => { console.error('mobile-performance: hard timeout'); process.exit(1); }, 120_000);
async function capture(name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(`${out}/${name}.png`, Buffer.from(data, 'base64'));
}
try {
  preview = await startPreview(); chrome = await startChrome(); cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath: false }));
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__asciiDraws = 0;
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function(...args) {
      if (this.canvas.matches('[data-ascii-art]')) window.__asciiDraws++;
      return clear.apply(this, args);
    };` }, sessionId);
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    await viewport(cdp, sessionId, { width, height: 844, mobile, touch: mobile, reduced: false });
    await navigate(cdp, sessionId, '/');
    await evaluate(cdp, sessionId, `document.querySelector('[data-experience-canvas]').scrollIntoView({block:'center',behavior:'instant'})`);
    await waitExpression(cdp, sessionId, 'window.__asciiDraws > 0', 'visible graph painted');
    await sleep(1000);
    const before = await evaluate(cdp, sessionId, 'window.__asciiDraws');
    await sleep(800);
    const after = await evaluate(cdp, sessionId, 'window.__asciiDraws');
    if (mobile) assert.equal(after, before, 'Mobile graph must not run an idle redraw loop even without reduced-motion');
    else assert(after > before, 'Desktop animation remains available');
    if (mobile) {
      await evaluate(cdp, sessionId, `document.documentElement.classList.toggle('dark')`);
      await waitExpression(cdp, sessionId, `window.__asciiDraws > ${after}`, 'static graph repaints on theme change');
      await capture('graph-mobile-dark');
      await evaluate(cdp, sessionId, `document.documentElement.classList.toggle('dark')`);
    }
    const count = await evaluate(cdp, sessionId, `document.querySelectorAll('[data-post-graph-node]').length`);
    assert(count > 0, 'Graph article links retained');
    const target = await evaluate(cdp, sessionId, `(() => {const a=document.querySelector('[data-post-graph-node]');a.focus();return a.getAttribute('href')})()`);
    await waitExpression(cdp, sessionId, `document.querySelector('[data-post-graph-tooltip]').hasAttribute('data-visible')`, 'keyboard graph tooltip');
    await capture(`graph-${width}`);
    await cdp.send('Input.dispatchKeyEvent', { type:'rawKeyDown', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 }, sessionId);
    const path = new URL(target, BASE).pathname;
    await waitExpression(cdp, sessionId, `${JSON.stringify([path, path.endsWith('/') ? path.slice(0,-1) : path+'/'])}.includes(location.pathname)`, 'native graph link destination');
    results.push({ width, mobileIdleDraws:after-before, graphLinks:count, nativeLink:true });
    console.log('mobile-performance: graph PASS '+JSON.stringify(results.at(-1)));
  }
  await viewport(cdp, sessionId, { width:390, height:844, mobile:true, touch:true, reduced:false });
  await navigate(cdp, sessionId, '/news/');
  await waitExpression(cdp, sessionId, `(() => {const img=document.querySelector('[data-news-card] img');return img?.complete && img.naturalWidth>0})()`, 'first NEWS thumbnail');
  const news = await evaluate(cdp, sessionId, `(() => {
    const cards=[...document.querySelectorAll('[data-news-card]')];
    const rows=cards.map(card=>{const f=card.querySelector('[data-news-figure]'),i=f?.querySelector('img');return {
      slug:card.dataset.newsCard,preview:f?.dataset.previewSrc,original:i?.dataset.originalSrc,src:i?.getAttribute('src'),
      link:f?.querySelector('a.news-figure__image')?.getAttribute('href'),current:i?.currentSrc,
      declaredWidth:Number(i?.getAttribute('width')),declaredHeight:Number(i?.getAttribute('height')),
      width:i?.naturalWidth,height:i?.naturalHeight,expectedWidth:Number(f?.dataset.previewWidth),expectedHeight:Number(f?.dataset.previewHeight),
      loading:i?.loading,priority:i?.fetchPriority};});
    return {url:location.href,timeOrigin:performance.timeOrigin,rows,overflow:document.documentElement.scrollWidth>innerWidth+2,
      resources:performance.getEntriesByType('resource').map(r=>({url:r.name,bytes:r.transferSize,initiator:r.initiatorType,start:r.startTime,duration:r.duration}))};
  })()`);
  fs.writeFileSync(`${out}/news-network.json`,JSON.stringify(news,null,2));
  assert(!news.overflow);
  assert(news.rows.length > 0 && news.rows[0].preview);
  assert.equal(news.rows[0].loading, 'eager'); assert.equal(news.rows[0].priority, 'high');
  assert.equal(news.rows.filter(r=>r.loading==='eager').length, 1);
  for (const row of news.rows) {
    if (!row.src) continue;
    assert(row.original, 'Every image retains its original provenance URL');
    assert.equal(row.link, row.original, 'Enlargement still opens the unmodified original');
    assert.equal(row.src, row.preview ?? row.original);
    if (row.preview) {
      assert.equal(row.expectedWidth, Math.min(640,row.declaredWidth));
      assert(Math.abs(row.expectedHeight-row.declaredHeight*row.expectedWidth/row.declaredWidth)<=1);
      const unexpected = news.resources.filter(r=>r.url===new URL(row.original,BASE).href);
      assert.equal(unexpected.length,0, 'NEWS must not fetch thumbnail originals: '+JSON.stringify({row,requests:unexpected}));
    }
  }
  assert.equal(news.rows[0].width,news.rows[0].expectedWidth);
  assert.equal(news.rows[0].height,news.rows[0].expectedHeight);
  await capture('news-mobile');
  results.push({ newsCards:news.rows.length, thumbnails:news.rows.filter(r=>r.preview).length, initialResources:news.resources });
  fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,results},null,2));
  console.log('mobile-performance: PASS '+JSON.stringify(results));
} catch (error) {
  console.error(error); process.exitCode=1;
  fs.writeFileSync(`${out}/failure.json`,JSON.stringify({error:String(error),results},null,2));
  if(cdp&&sessionId) await capture('failure').catch(()=>{});
} finally {
  cdp?.close(); await stopChild(chrome?.child,'SIGKILL'); await stopChild(preview,'SIGTERM');
  removeProfile(chrome?.profile); clearTimeout(hardStop);
  // Match the other standalone suites: pnpm's preview descendants can retain
  // pipe handles after its parent exits. Never let those handles hide a verdict.
  process.exit(process.exitCode || 0);
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  Cdp, attach, evaluate, navigate, viewport, waitExpression,
  startPreview, startChrome, stopChild, removeProfile,
} from './browser-smoke-harness.mjs';

const slug = '2026-09-30-wrn-inhibitor-phase1-news';
const mediaIds = ['sep30-wrn-fig1', 'sep30-wrn-fig3', 'sep30-wrn-fig4'];
const output = 'sep30-review';
fs.mkdirSync(output, { recursive: true });
const rows = [];
let preview;
let chrome;
let cdp;
let sessionId;
const timer = setTimeout(() => {
  console.error('sep30-browser: hard timeout');
  process.exit(1);
}, 180_000);

const js = (expression) => evaluate(cdp, sessionId, expression);
async function screenshot(name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(`${output}/${name}.png`, Buffer.from(data, 'base64'));
}

try {
  preview = await startPreview();
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath: false }));
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    await viewport(cdp, sessionId, {
      width, height: 900, mobile, touch: mobile, reduced: true,
    });
    await navigate(cdp, sessionId, '/news/');
    const listing = await waitExpression(
      cdp, sessionId,
      `(()=>{const card=document.querySelector('[data-news-date="2026-09-30"] [data-news-card="${slug}"]');return card?{found:true,overflow:document.documentElement.scrollWidth>innerWidth+2}:false})()`,
      'Sep 30 card in NEWS'
    );
    assert(!listing.overflow);
    await navigate(cdp, sessionId, `/posts/${slug}/`);
    const images = [];
    for (const id of mediaIds) {
      const selector = `[data-news-figure="${id}"]`;
      await js(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center'})`);
      const image = await waitExpression(
        cdp, sessionId,
        `(async()=>{const f=document.querySelector(${JSON.stringify(selector)});const i=f?.querySelector('img');if(!i?.complete||!i.naturalWidth)return false;await i.decode();return {width:i.naturalWidth,height:i.naturalHeight,alt:i.alt,caption:f.querySelector('figcaption')?.textContent||'',overflow:f.scrollWidth>f.clientWidth+2}})()`,
        `decoded ${id}`
      );
      assert(image.width > 0 && image.height > 0 && image.alt.length > 20);
      assert(image.caption.includes('출처') && !image.overflow);
      images.push({ id, ...image });
      await screenshot(`${id}-${width}`);
    }
    const page = await js(`({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth+2,equations:document.querySelectorAll('[data-candidate-equation]').length,katexErrors:document.querySelectorAll('.katex-error').length,citations:document.querySelectorAll('[data-news-citation]').length,references:document.querySelectorAll('[data-news-reference]').length})`);
    assert.equal(page.lang, 'ko');
    assert(!page.overflow && page.katexErrors === 0);
    assert.equal(page.equations, 2);
    assert(page.citations >= 20 && page.references >= 2);
    await screenshot(`article-${width}`);
    rows.push({ width, listing, images, page });
    console.log(`sep30-browser: PASS ${width}px`);
  }
  fs.writeFileSync(`${output}/browser.json`, JSON.stringify({ slug, rows }, null, 2));
} catch (error) {
  console.error('sep30-browser: FAIL', error);
  fs.writeFileSync(`${output}/failure.json`, JSON.stringify({ error: String(error), rows }, null, 2));
  process.exitCode = 1;
} finally {
  cdp?.close();
  await stopChild(chrome?.child, 'SIGKILL');
  await stopChild(preview, 'SIGTERM');
  removeProfile(chrome?.profile);
  clearTimeout(timer);
  process.exit(process.exitCode || 0);
}

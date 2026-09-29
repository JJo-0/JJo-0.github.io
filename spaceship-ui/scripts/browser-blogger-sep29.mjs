// Public Blogger regression check, executed by remote CI after scoped publication.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  Cdp,
  attach,
  evaluate,
  navigate,
  viewport,
  waitExpression,
  startChrome,
  stopChild,
  removeProfile,
} from './browser-smoke-harness.mjs';
const url = process.env.BLOGGER_PUBLIC_URL;
assert(url && new URL(url).hostname === 'jjo-0.blogspot.com');
assert(new URL(url).pathname.startsWith('/2026/09/'));
const output = 'blogger-sep29-review';
fs.mkdirSync(output, { recursive: true });
const rows = [];
let chrome, cdp, sessionId;
const timer = setTimeout(() => {
  console.error('Blogger hard timeout');
  process.exit(1);
}, 240000);
try {
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath: false }));
  for (const width of [390, 1440]) {
    await viewport(cdp, sessionId, {
      width,
      height: 1000,
      mobile: width === 390,
      touch: width === 390,
      reduced: true,
    });
    await navigate(cdp, sessionId, url);
    await waitExpression(
      cdp,
      sessionId,
      "document.querySelectorAll('.post-body img').length>=3",
      'Blogger article images'
    );
    const actual = await evaluate(
      cdp,
      sessionId,
      `(async()=>{
      const b=document.querySelector('.post-body');
      const images=[...b.querySelectorAll('img')];
      for(const i of images){i.scrollIntoView({block:'center'});await i.decode();}
      const e=b.querySelector('[data-blogger-equation="agent-activity"]');
      return {text:b.innerText,equation:e?.innerText,equationOverflow:e?.scrollWidth>e?.clientWidth+2,
        overflow:document.documentElement.scrollWidth>innerWidth+2,
        images:images.map(i=>({src:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight,alt:i.alt,caption:i.closest('figure')?.querySelector('figcaption')?.innerText})),
        canonical:[...b.querySelectorAll('a')].some(a=>a.href==='https://jjo-0.github.io/posts/2026-09-29-agent-thermostable-mrna-vaccine-news/')};
    })()`
    );
    assert.equal(actual.images.length, 3);
    assert(actual.text.includes('사람') && actual.text.includes('실온 일 년'));
    assert(actual.equation.includes('건조 뒤 발광 ÷ 대응 용액의 발광 × 100'));
    assert(!actual.equationOverflow && !actual.overflow && actual.canonical);
    assert(!/\\(?:frac|begin|end|sum)|\$\$/.test(actual.text));
    for (const i of actual.images) {
      assert(i.width > 0 && i.height > 0 && i.alt.length >= 20);
      assert(i.caption.includes('CC BY 4.0'));
    }
    for (const n of [1, 2, 5]) {
      await evaluate(
        cdp,
        sessionId,
        `document.querySelector('.post-body img[src*="agent-fig${n}.png"]').closest('figure').scrollIntoView({block:'center'})`
      );
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
      fs.writeFileSync(`${output}/figure-${n}-${width}.png`, Buffer.from(data, 'base64'));
    }
    await evaluate(
      cdp,
      sessionId,
      "document.querySelector('[data-blogger-equation]').scrollIntoView({block:'center'})"
    );
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
    fs.writeFileSync(`${output}/equation-${width}.png`, Buffer.from(data, 'base64'));
    rows.push({ width, ...actual });
    console.log('blogger-sep29: PASS', width);
  }
  fs.writeFileSync(`${output}/browser.json`, JSON.stringify({ url, rows }, null, 2));
} catch (e) {
  fs.writeFileSync(`${output}/failure.json`, JSON.stringify({ error: String(e), rows }, null, 2));
  console.error(e);
  process.exitCode = 1;
} finally {
  cdp?.close();
  await stopChild(chrome?.child, 'SIGKILL');
  removeProfile(chrome?.profile);
  clearTimeout(timer);
  process.exit(process.exitCode || 0);
}

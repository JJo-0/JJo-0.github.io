import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  Cdp,
  BASE,
  attach,
  evaluate,
  navigate,
  viewport,
  waitExpression,
  startPreview,
  startChrome,
  stopChild,
  removeProfile,
} from './browser-smoke-harness.mjs';

const edition = JSON.parse(
  fs.readFileSync(new URL('../site/news-edition-20260929.json', import.meta.url), 'utf8')
);
fs.mkdirSync('sep29-review', { recursive: true });
const rows = [];
let preview;
let chrome;
let cdp;
let sessionId;
const timer = setTimeout(() => {
  console.error('sep29-browser: hard timeout');
  process.exit(1);
}, 360_000);

const js = (expression) => evaluate(cdp, sessionId, expression);
async function point(selector) {
  return waitExpression(
    cdp,
    sessionId,
    `(async()=>{await document.fonts.ready;const a=document.querySelector(${JSON.stringify(selector)});if(!a)throw Error('missing target');a.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const b=a.getBoundingClientRect();const x=b.left+b.width/2,y=b.top+b.height/2,h=document.elementFromPoint(x,y);return b.width>0&&b.height>0&&(h===a||a.contains(h))?{x,y}:false})()`,
    `hit-testable ${selector}`
  );
}
async function activate(selector, mobile) {
  const { x, y } = await point(selector);
  if (mobile) {
    await cdp.send(
      'Input.dispatchTouchEvent',
      { type: 'touchStart', touchPoints: [{ x, y }] },
      sessionId
    );
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, sessionId);
  } else {
    await cdp.send(
      'Input.dispatchMouseEvent',
      { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 },
      sessionId
    );
    await cdp.send(
      'Input.dispatchMouseEvent',
      { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 },
      sessionId
    );
  }
}
async function screenshot(name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(`sep29-review/${name}.png`, Buffer.from(data, 'base64'));
}

try {
  preview = await startPreview();
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath: false }));

  await viewport(cdp, sessionId, {
    width: 1440,
    height: 1000,
    mobile: false,
    touch: false,
    reduced: true,
  });
  await navigate(cdp, sessionId, '/news/');
  const listing = await js(
    `(()=>{const cards=[...document.querySelectorAll('[data-news-date="2026-09-29"] [data-news-card]')].map(x=>x.getAttribute('data-news-card'));return {cards,overflow:document.documentElement.scrollWidth>innerWidth+2}})()`
  );
  assert.deepEqual(
    listing.cards.slice(0, edition.entries.length),
    edition.entries.map((entry) => entry.slug)
  );
  assert(!listing.overflow);
  await js(`document.querySelector('[data-news-date="2026-09-29"] img')?.scrollIntoView({block:'center',behavior:'instant'})`);
  const thumbnail = await waitExpression(
    cdp,
    sessionId,
    `(async()=>{const i=document.querySelector('[data-news-date="2026-09-29"] img');if(!i?.complete||!i.naturalWidth)return false;await i.decode();return {width:i.naturalWidth,alt:i.alt}})()`,
    'NEWS thumbnail loads and decodes'
  );
  assert(thumbnail.width > 0 && thumbnail.alt.length >= 20);

  for (const entry of edition.entries) {
    const route = `/posts/${entry.slug}/`;
    const primerSelector = `[${entry.primerSelector}]`;
    for (const width of [390, 1440]) {
      for (const dark of [false, true]) {
        const mobile = width === 390;
        await viewport(cdp, sessionId, {
          width,
          height: 1000,
          mobile,
          touch: mobile,
          reduced: true,
        });
        await navigate(cdp, sessionId, route);
        await js(`document.documentElement.classList.toggle('dark',${dark})`);
        await js('document.fonts.ready.then(()=>true)');
        const images = [];
        for (const mediaId of entry.mediaIds) {
          const selector = `[data-news-figure="${mediaId}"]`;
          await point(selector);
          await waitExpression(
            cdp,
            sessionId,
            `(()=>{const i=document.querySelector('${selector} img');return i?.complete&&i.naturalWidth>0})()`,
            `image ${mediaId} actually loads`
          );
          const decoded = await js(
            `(async()=>{const f=document.querySelector('${selector}');const i=f.querySelector('img');await i.decode();return {id:${JSON.stringify(mediaId)},width:i.naturalWidth,height:i.naturalHeight,alt:i.alt,credit:f.querySelector('figcaption').textContent,overflow:f.scrollWidth>f.clientWidth+2}})()`
          );
          assert(decoded.width > 0 && decoded.height > 0 && decoded.alt.length >= 20);
          assert(decoded.credit.includes('출처') && !decoded.overflow);
          images.push(decoded);
          await screenshot(`${entry.key}-${mediaId}-${width}-${dark ? 'dark' : 'light'}`);
        }
        assert.equal(await js('document.documentElement.lang'), 'ko');
        assert.equal(await js("document.querySelectorAll('[data-beginner-guide]').length"), 1);
        await activate('[data-beginner-guide] > summary', mobile);
        await waitExpression(
          cdp,
          sessionId,
          "document.querySelector('[data-beginner-guide]').open",
          'beginner guide opens'
        );
        const primer = await js(
          `(()=>{const p=document.querySelector(${JSON.stringify(primerSelector)});const grid=p?.firstElementChild;return {exists:!!p,sections:p?.querySelectorAll('section').length||0,svgs:p?.querySelectorAll('svg[role="img"]').length||0,columns:getComputedStyle(grid).gridTemplateColumns,overflow:p?.scrollWidth>(p?.clientWidth||0)+2,caption:p?.querySelector('figcaption')?.textContent||''}})()`
        );
        assert(primer.exists && primer.sections === 3 && primer.svgs === 1 && !primer.overflow);
        assert(
          primer.caption.includes('JJo 자체 제작') && primer.caption.includes('외부 원본 이미지'),
          JSON.stringify(primer)
        );
        if (mobile) assert.equal(primer.columns.split(' ').length, 1);
        else assert.equal(primer.columns.split(' ').length, 2);
        await point(primerSelector);
        await screenshot(`${entry.key}-primer-${width}-${dark ? 'dark' : 'light'}`);

        for (const equation of entry.equations) {
          const selector = `[data-candidate-equation="${equation}"] > summary`;
          await activate(selector, mobile);
          await waitExpression(
            cdp,
            sessionId,
            `document.querySelector('[data-candidate-equation="${equation}"]').open`,
            `equation ${equation} opens`
          );
          const layout = await js(
            `(()=>{const h=document.querySelector('[data-candidate-equation="${equation}"] .candidate-equation__math');const r=h.getBoundingClientRect();return {visible:r.width>0&&r.height>0&&getComputedStyle(h).visibility!=='hidden',fits:h.scrollWidth<=h.clientWidth+2,scrollable:['auto','scroll'].includes(getComputedStyle(h).overflowX),error:!!h.querySelector('.katex-error')}})()`
          );
          assert(layout.visible && !layout.error && (layout.fits || layout.scrollable));
          await point(`[data-candidate-equation="${equation}"] .candidate-equation__math`);
          await screenshot(`${entry.key}-${equation}-${width}-${dark ? 'dark' : 'light'}`);
        }
        for (const tableId of entry.tableIds) {
          const table = await js(
            `(()=>{const r=document.querySelector('[data-candidate-table="${tableId}"]');return {exists:!!r?.querySelector('table'),focus:r?.tabIndex===0,overflow:r?.scrollWidth>r?.clientWidth+2}})()`
          );
          assert(table.exists && table.focus);
          if (!mobile) assert(!table.overflow);
        }
        const final = await js(
          `({overflow:document.documentElement.scrollWidth>innerWidth+2,katexErrors:document.querySelectorAll('.katex-error').length,citations:document.querySelectorAll('[data-news-citation]').length,references:document.querySelectorAll('[data-news-reference]').length})`
        );
        assert(!final.overflow && final.katexErrors === 0);
        assert.equal(
          final.citations,
          Object.values(entry.citationCounts).reduce((sum, value) => sum + value, 0)
        );
        assert.equal(final.references, entry.referenceCount);
        await screenshot(`${entry.key}-${width}-${dark ? 'dark' : 'light'}`);
        rows.push({
          key: entry.key,
          route,
          width,
          theme: dark ? 'dark' : 'light',
          images,
          primer,
          final,
        });
        console.log(`sep29-browser: PASS ${entry.key} ${width} ${dark ? 'dark' : 'light'}`);
      }
    }
  }
  fs.writeFileSync(
    'sep29-review/browser.json',
    JSON.stringify(
      { base: BASE, entries: edition.entries.map((entry) => entry.slug), rows },
      null,
      2
    )
  );
} catch (error) {
  console.error('sep29-browser: FAIL', error);
  fs.writeFileSync(
    'sep29-review/failure.json',
    JSON.stringify({ error: String(error), rows }, null, 2)
  );
  process.exitCode = 1;
} finally {
  cdp?.close();
  await stopChild(chrome?.child, 'SIGKILL');
  await stopChild(preview, 'SIGTERM');
  removeProfile(chrome?.profile);
  clearTimeout(timer);
  process.exit(process.exitCode || 0);
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

const edition = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20261001.json', import.meta.url), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(new URL('../site/english-edition.json', import.meta.url), 'utf8'));
const media = JSON.parse(fs.readFileSync(new URL('../site/news-media.json', import.meta.url), 'utf8'));
const captions = JSON.parse(fs.readFileSync(new URL('../site/news-media-en-20261001.json', import.meta.url), 'utf8'));
const pairs = edition.entries.map(e => ({ ...e, pair: manifest.pairs.find(p => p.koSlug === e.slug) }));
assert(pairs.every(e => e.pair));
const out = 'english-review/oct01-update';
fs.mkdirSync(out, { recursive: true });
const results = [], lists = [], imageHashes = new Map();
let preview, chrome, cdp, sessionId;
const timer = setTimeout(() => { console.error('oct01-bilingual: hard timeout'); process.exit(1); }, 180_000);
async function enter(selector) {
  await waitExpression(cdp, sessionId, `document.readyState === 'complete' && Boolean(document.querySelector(${JSON.stringify(selector)}))`, 'native input target');
  await evaluate(cdp, sessionId, `(() => { const el = document.querySelector(${JSON.stringify(selector)}); el.scrollIntoView({block:'center',behavior:'instant'}); el.focus(); })()`);
  await cdp.send('Input.dispatchKeyEvent', { type:'keyDown', key:'Enter', code:'Enter', text:'\r', windowsVirtualKeyCode:13 }, sessionId);
  await cdp.send('Input.dispatchKeyEvent', { type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 }, sessionId);
}
async function capture(name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format:'png' }, sessionId);
  fs.writeFileSync(`${out}/${name}.png`, Buffer.from(data, 'base64'));
}
try {
  preview = await startPreview(); chrome = await startChrome(); cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath:false }));
  for (const width of [390, 1440]) {
    await viewport(cdp, sessionId, { width, height:900, mobile:width === 390, touch:width === 390, reduced:false });
    for (const lang of ['ko', 'en']) {
      await navigate(cdp, sessionId, lang === 'en' ? '/en/news/' : '/news/');
      const expected = pairs.map(e => lang === 'en' ? e.pair.enSlug : e.slug);
      const actual = await evaluate(cdp, sessionId, `(() => {
        const ids = ${JSON.stringify(expected)};
        return [...document.querySelectorAll(${JSON.stringify(lang === 'en' ? '[data-english-card]' : '[data-news-card]')})]
          .map(el => el.getAttribute(${JSON.stringify(lang === 'en' ? 'data-english-card' : 'data-news-card')})).filter(id => ids.includes(id));
      })()`);
      assert.deepEqual(actual, expected, 'October 1 editorial order'); lists.push({ width, lang, actual });
      for (const e of pairs) {
        const route = lang === 'en' ? `/en/posts/${e.pair.enSlug}/` : `/posts/${e.slug}/`;
        assert.equal((await fetch(new URL(route, BASE))).status, 200);
        await navigate(cdp, sessionId, route);
        await evaluate(cdp, sessionId, 'document.fonts.ready');
        await enter('article [data-beginner-guide] > summary');
        await waitExpression(cdp, sessionId, `document.querySelector('article [data-beginner-guide]').open`, 'beginner explanation opened by Enter');
        await enter('article [data-candidate-equation] > summary');
        await waitExpression(cdp, sessionId, `document.querySelector('article [data-candidate-equation]').open`, 'worked formula opened by Enter');
        const views = [];
        for (const dark of [false, true]) {
          await evaluate(cdp, sessionId, `document.documentElement.classList.toggle('dark',${dark})`);
          const state = await evaluate(cdp, sessionId, `(() => { const a=document.querySelector('article');return {
            language:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth+2,
            korean:/[가-힣]/.test(a.innerText),mathErrors:a.querySelectorAll('.katex-error').length,
            guides:a.querySelectorAll('[data-beginner-guide]').length,equations:a.querySelectorAll('[data-candidate-equation]').length,
            tableRows:a.querySelectorAll('[data-candidate-table] tbody tr').length,
            beginnerOpen:a.querySelector('[data-beginner-guide]').open,equationOpen:a.querySelector('[data-candidate-equation]').open
          }; })()`);
          assert.equal(state.language, lang); assert(!state.overflow && !state.mathErrors);
          assert.equal(state.guides,1); assert.equal(state.equations,1); assert.equal(state.tableRows,4);
          assert(state.beginnerOpen && state.equationOpen);
          if (lang === 'en') assert(!state.korean, 'Expanded English text and controls must not contain Korean');
          views.push({ dark, ...state });
        }
        if (lang === 'en' && width === 390) await capture(`${e.key}-worked-example-mobile`);
        await evaluate(cdp, sessionId, `document.documentElement.classList.remove('dark')`);
        const images = [];
        for (const id of e.mediaIds) {
          const expectedImage = { ...media[id], ...(lang === 'en' ? captions[id] : {}) };
          const selector = `article [data-news-figure="${id}"] img`;
          await evaluate(cdp, sessionId, `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
          const state = await waitExpression(cdp, sessionId, `(() => {
            const img=document.querySelector(${JSON.stringify(selector)});if(!img?.complete || !img.naturalWidth)return null;
            const r=img.getBoundingClientRect();if(r.width<=0 || r.height<=0 || r.bottom<=0 || r.top>=innerHeight)return null;
            return {src:img.getAttribute('src'),current:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight,
              declaredWidth:Number(img.getAttribute('width')),declaredHeight:Number(img.getAttribute('height')),
              alt:img.alt,link:img.closest('figure').querySelector('a').getAttribute('href'),caption:img.closest('figure').querySelector('figcaption').innerText};
          })()`, `decoded visible image ${id}`);
          assert.equal(state.src, expectedImage.src); assert.equal(state.current, new URL(expectedImage.src, BASE).href);
          assert.equal(state.link, expectedImage.src); assert.equal(state.declaredWidth, expectedImage.width); assert.equal(state.declaredHeight, expectedImage.height);
          if (!state.src.endsWith('.svg')) { assert.equal(state.width, expectedImage.width); assert.equal(state.height, expectedImage.height); }
          if (lang === 'en') assert(!/[가-힣]/.test(state.caption + state.alt));
          if (!imageHashes.has(state.src)) {
            const response=await fetch(new URL(state.src,BASE));assert.equal(response.status,200);
            const hash=createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
            assert.equal(hash,expectedImage.sha256);imageHashes.set(state.src,hash);
          }
          images.push({ id, src:state.src, hash:imageHashes.get(state.src) });
          if (lang === 'en' && width === 390 && (id === e.mediaIds[0] || e.key === 'bcn')) await capture(`${id}-english-mobile`);
        }
        await enter('article a[data-news-citation="1"]');
        await waitExpression(cdp, sessionId, `location.pathname===${JSON.stringify(route)} && location.hash==='#news-ref-1'`, 'same-article native reference');
        results.push({ key:e.key, lang, width, views, images, nativeDisclosures:true, nativeCitation:true });
        console.log(`oct01-bilingual: PASS ${e.key} ${lang} ${width}px`);
      }
    }
  }
  assert.equal(results.length,12);assert.equal(lists.length,4);assert.equal(imageHashes.size,7);
  fs.writeFileSync(`${out}/browser.json`, JSON.stringify({ base:BASE, results, lists, imageHashes:Object.fromEntries(imageHashes) },null,2));
  console.log('oct01-bilingual: PASS 12 pages, 24 light/dark views, 24 original/translated image decodes, 24 native disclosures and 12 native citations');
} catch (error) {
  console.error(error); process.exitCode=1;
  fs.writeFileSync(`${out}/failure.json`,JSON.stringify({error:String(error),results,lists},null,2));
  if(cdp && sessionId) await capture('failure').catch(()=>{});
} finally {
  cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);
  clearTimeout(timer);process.exit(process.exitCode || 0);
}

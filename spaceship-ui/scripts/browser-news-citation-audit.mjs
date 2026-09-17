import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

// Additive suite: the existing 240-second complete-matrix guard stays unchanged.
const hardStop = setTimeout(() => { console.error('news-citation-browser: FAIL hard timeout'); process.exit(1); }, 180_000);
const ledger = JSON.parse(fs.readFileSync(new URL('../site/news-citation-repair-20260916.json', import.meta.url), 'utf8'));
const currentEdition = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260917.json', import.meta.url), 'utf8'));
const citationRows = [...ledger.repairs, ...currentEdition.entries];
const newSlugs = new Set(currentEdition.entries.map((row) => row.slug));
const results = [];
let preview, chrome, cdp, sessionId, activeSlug, activeWidth, lastPointer;
fs.mkdirSync('citation-audit', {recursive:true});

async function screenshot(name) {
  const {data} = await cdp.send('Page.captureScreenshot', {format:'png'}, sessionId);
  fs.writeFileSync(`citation-audit/${name}.png`, Buffer.from(data, 'base64'));
}
async function pointer(selector, mobile) {
  // Back restores scroll asynchronously. A pre-paint point can hit the following
  // image instead of a small citation. Observe stable geometry, never retry a
  // failed click or synthesize HTMLElement.click()/location.hash navigation.
  const point = await evaluate(cdp, sessionId, `(async () => {
    await document.fonts.ready;
    const a = document.querySelector(${JSON.stringify(selector)});
    if (!a) throw new Error('Missing citation activation target');
    const started = performance.now();
    let previous = null, stable = 0;
    while (performance.now() - started < 2500) {
      a.scrollIntoView({block:'center', behavior:'instant'});
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await new Promise(resolve => setTimeout(resolve, 50));
      const r = a.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      const ready = a.isConnected && r.width > 0 && r.height > 0 && (hit === a || a.contains(hit));
      const current = {x,y,scrollY,documentHeight:document.documentElement.scrollHeight};
      const unchanged = previous && Object.keys(current).every(k=>Math.abs(current[k]-previous[k]) < 0.5);
      stable = ready && unchanged ? stable + 1 : 0;
      if (stable >= 2) return {...current,ready,stableSamples:stable+1,
        resolvedPath:new URL(a.href).pathname,currentPath:location.pathname,html:a.outerHTML};
      previous = current;
    }
    throw new Error('Citation geometry did not stabilize before trusted input');
  })()`);
  lastPointer = {selector,mobile,...point};
  assert.equal(point.resolvedPath, point.currentPath, 'Native fragment must resolve to the exact same article path');
  assert(point.ready && point.stableSamples >= 3, `Citation is not stably hit-testable: ${selector}`);
  if (mobile) {
    await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:point.x,y:point.y}]}, sessionId);
    await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]}, sessionId);
  } else {
    await cdp.send('Input.dispatchMouseEvent', {type:'mouseMoved',x:point.x,y:point.y,button:'none',pointerType:'mouse'}, sessionId);
    await cdp.send('Input.dispatchMouseEvent', {type:'mousePressed',x:point.x,y:point.y,button:'left',buttons:1,clickCount:1,pointerType:'mouse'}, sessionId);
    await cdp.send('Input.dispatchMouseEvent', {type:'mouseReleased',x:point.x,y:point.y,button:'left',buttons:0,clickCount:1,pointerType:'mouse'}, sessionId);
  }
}
async function assertDestination(number) {
  const path = '/posts/' + activeSlug;
  const expression = `(${JSON.stringify([path, path + '/'])}.includes(location.pathname)) && location.hash === '#news-ref-${number}'`;
  await waitExpression(cdp, sessionId, expression, `native fragment ${number} on ${activeSlug}`);
  await waitExpression(cdp, sessionId, `(() => {
    const target = document.getElementById('news-ref-${number}');
    const r = target?.getBoundingClientRect();
    const header = document.querySelector('header')?.getBoundingClientRect();
    return r && r.top >= (header?.bottom || 0) - 2 && r.top < innerHeight && r.width > 0 && r.height > 0;
  })()`, `visible reference ${number} below fixed header`);
}
try {
  assert(['older', 'complete'].includes(ledger.stage));
  preview = await startPreview();
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  // Native citations must use the real document URL, aligned with its <base>.
  // Keep the default URL normalization unchanged for the existing core matrix.
  ({sessionId} = await attach(cdp, {normalizeHistoryPath:false}));
  for (const width of [390, 1440]) {
    activeWidth = width;
    await viewport(cdp, sessionId, {width,height:1000,mobile:width===390,touch:width===390,reduced:true});
    await navigate(cdp, sessionId, '/news/');
    const roster = await evaluate(cdp, sessionId, `Array.from(document.querySelectorAll('[data-news-card]')).map(n=>n.getAttribute('data-news-card'))`);
    assert(roster.length >= ledger.newsBaselineCount && new Set(roster).size === roster.length);
    await screenshot(`news-list-${width}`);
    for (const row of citationRows) {
      activeSlug = row.slug;
      assert(roster.includes(row.slug));
      if (row.state === 'pending') continue;
      await navigate(cdp, sessionId, `/posts/${row.slug}/`);
      if (newSlugs.has(row.slug)) {
        await waitExpression(cdp, sessionId, `(() => {const i=document.querySelector('article [data-news-figure] img');return i?.complete && i.naturalWidth > 0;})()`, 'candidate representative image decoded');
        await screenshot(`${row.slug}-${width}-opening`);
      }
      const actual = await evaluate(cdp, sessionId, `(() => {
        const links = [...document.querySelectorAll('article a[data-news-citation]')];
        return {citations:links.map(a=>({number:a.dataset.newsCitation,href:a.getAttribute('href')})),
          references:[...document.querySelectorAll('article a[data-news-reference]')].map(a=>({number:Number(a.dataset.newsReference),id:a.id,url:a.getAttribute('href')})),
          overflow:document.documentElement.scrollWidth > innerWidth + 2};
      })()`);
      assert(!actual.overflow, row.slug);
      const counts = {};
      for (const a of actual.citations) {
        assert.equal(a.href, `#news-ref-${a.number}`);
        counts[a.number] = (counts[a.number] || 0) + 1;
      }
      assert.deepEqual(counts, row.citationCounts, `${row.slug}: all inline links retained`);
      assert.deepEqual(actual.references, row.references.map(r=>({number:r.number,id:`news-ref-${r.number}`,url:r.url})));
      for (const number of Object.keys(row.citationCounts)) {
        const oldHash = await evaluate(cdp, sessionId, 'location.hash');
        const history = await cdp.send('Page.getNavigationHistory', {}, sessionId);
        const previousId = history.entries[history.currentIndex].id;
        await pointer(`article a[data-news-citation="${number}"]`, width===390);
        await assertDestination(number);
        await cdp.send('Page.navigateToHistoryEntry', {entryId:previousId}, sessionId);
        await waitExpression(cdp, sessionId, `document.readyState === 'complete' && location.hash === ${JSON.stringify(oldHash)} && document.querySelector('article a[data-news-citation]') !== null`, 'browser Back to citation document');
        await evaluate(cdp, sessionId, `new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
      }
      // Native Enter-key activation must also work with page scripting disabled.
      const number = Object.keys(row.citationCounts)[0];
      await evaluate(cdp, sessionId, `document.querySelector('article a[data-news-citation="${number}"]').focus()`);
      await cdp.send('Emulation.setScriptExecutionDisabled', {value:true}, sessionId);
      await cdp.send('Input.dispatchKeyEvent', {type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13}, sessionId);
      await cdp.send('Input.dispatchKeyEvent', {type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13}, sessionId);
      await cdp.send('Emulation.setScriptExecutionDisabled', {value:false}, sessionId);
      await assertDestination(number);
      for (const dark of [false,true]) {
        await evaluate(cdp, sessionId, `document.documentElement.classList.toggle('dark', ${dark})`);
        const visible = await evaluate(cdp, sessionId, `(() => {
          const a = document.getElementById('news-ref-${number}'); const style = getComputedStyle(a);
          return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0 && style.textDecorationLine.includes('underline');
        })()`);
        assert(visible, `${row.slug}: visible reference link in ${dark ? 'dark' : 'light'}`);
      }
      await evaluate(cdp, sessionId, `document.documentElement.classList.remove('dark')`);
      if (newSlugs.has(row.slug)) await screenshot(`${row.slug}-${width}-references`);
      results.push({slug:row.slug,width,citations:actual.citations.length,sourceEntries:actual.references.length,
        activatedTargets:Object.keys(row.citationCounts).length,nativeKeyboard:true,back:true,lightDark:true});
      console.log('news-citation-browser: PASS ' + JSON.stringify(results.at(-1)));
    }
  }
  assert.equal(results.length, citationRows.filter(r=>r.state==='linked').length * 2);
  fs.writeFileSync('citation-audit/browser.json', JSON.stringify({base:BASE,stage:ledger.stage,results},null,2));
  console.log(`news-citation-browser: ${ledger.stage === 'complete' ? 'PASS' : 'PARTIAL'} ${results.length} article/viewport checks; every cited target activated; original full smoke untouched`);
} catch (error) {
  console.error('news-citation-browser: FAIL', error?.stack || error);
  process.exitCode = 1;
  if (cdp && sessionId) {
    try {
      await cdp.send('Emulation.setScriptExecutionDisabled', {value:false}, sessionId);
      const page = await evaluate(cdp, sessionId, `({url:location.href,title:document.title,base:document.baseURI,header:document.querySelector('header')?.getBoundingClientRect().toJSON(),references:[...document.querySelectorAll('[data-news-reference]')].map(a=>({id:a.id,rect:a.getBoundingClientRect().toJSON()}))})`);
      fs.writeFileSync('citation-audit/failure.json', JSON.stringify({slug:activeSlug,width:activeWidth,error:String(error),lastPointer,page,completed:results},null,2));
      await screenshot('failure');
    } catch (diagnosticError) { console.error('news-citation-browser: diagnostic failed', String(diagnosticError)); }
  }
} finally {
  cdp?.close();
  await stopChild(chrome?.child, 'SIGKILL');
  await stopChild(preview, 'SIGTERM');
  removeProfile(chrome?.profile);
  clearTimeout(hardStop);
  process.exit(process.exitCode || 0);
}

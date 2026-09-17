import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

// Additive suite: the existing 240-second complete-matrix guard stays unchanged.
const hardStop = setTimeout(() => { console.error('news-citation-browser: FAIL hard timeout'); process.exit(1); }, 180_000);
const ledger = JSON.parse(fs.readFileSync(new URL('../site/news-citation-repair-20260916.json', import.meta.url), 'utf8'));
let preview, chrome, cdp;
const results = [];

async function pointer(sessionId, selector, mobile) {
  const point = await evaluate(cdp, sessionId, `(() => {
    const a = document.querySelector(${JSON.stringify(selector)});
    if (!a) throw new Error('Missing citation activation target');
    a.scrollIntoView({block:'center', behavior:'instant'});
    const r = a.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {x,y,ready:r.width > 0 && r.height > 0 && (hit === a || a.contains(hit))};
  })()`);
  assert(point.ready, `Citation is not hit-testable: ${selector}`);
  if (mobile) {
    await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:point.x,y:point.y}]}, sessionId);
    await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]}, sessionId);
  } else {
    await cdp.send('Input.dispatchMouseEvent', {type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1}, sessionId);
    await cdp.send('Input.dispatchMouseEvent', {type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1}, sessionId);
  }
}

async function assertDestination(sessionId, number) {
  await waitExpression(cdp, sessionId, `location.pathname.startsWith('/posts/') && location.hash === '#news-ref-${number}'`, `native fragment ${number}`);
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
  const target = await attach(cdp);
  const { sessionId } = target;
  for (const width of [390, 1440]) {
    await viewport(cdp, sessionId, {width,height:1000,mobile:width===390,touch:width===390,reduced:true});
    await navigate(cdp, sessionId, '/news/');
    const roster = await evaluate(cdp, sessionId, `Array.from(document.querySelectorAll('[data-news-card]')).map(n=>n.getAttribute('data-news-card'))`);
    assert(roster.length >= ledger.newsBaselineCount && new Set(roster).size === roster.length);
    for (const row of ledger.repairs) {
      assert(roster.includes(row.slug));
      if (row.state === 'pending') continue; // Static gate pins the nine original recent sources in the partial first PR.
      await navigate(cdp, sessionId, `/posts/${row.slug}/`);
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
        await pointer(sessionId, `article a[data-news-citation="${number}"]`, width===390);
        await assertDestination(sessionId, number);
        await cdp.send('Page.navigateToHistoryEntry', {entryId:previousId}, sessionId);
        await waitExpression(cdp, sessionId, `location.hash === ${JSON.stringify(oldHash)}`, 'browser Back to citation document');
      }
      // Native Enter-key activation must also work with page scripting disabled.
      const number = Object.keys(row.citationCounts)[0];
      await evaluate(cdp, sessionId, `document.querySelector('article a[data-news-citation="${number}"]').focus()`);
      await cdp.send('Emulation.setScriptExecutionDisabled', {value:true}, sessionId);
      await cdp.send('Input.dispatchKeyEvent', {type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13}, sessionId);
      await cdp.send('Input.dispatchKeyEvent', {type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13}, sessionId);
      await cdp.send('Emulation.setScriptExecutionDisabled', {value:false}, sessionId);
      await assertDestination(sessionId, number);
      for (const dark of [false,true]) {
        await evaluate(cdp, sessionId, `document.documentElement.classList.toggle('dark', ${dark})`);
        const visible = await evaluate(cdp, sessionId, `(() => {
          const a = document.getElementById('news-ref-${number}'); const style = getComputedStyle(a);
          return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0 && getComputedStyle(a).textDecorationLine.includes('underline');
        })()`);
        assert(visible, `${row.slug}: visible reference link in ${dark ? 'dark' : 'light'}`);
      }
      await evaluate(cdp, sessionId, `document.documentElement.classList.remove('dark')`);
      results.push({slug:row.slug,width,citations:actual.citations.length,sourceEntries:actual.references.length,
        activatedTargets:Object.keys(row.citationCounts).length,nativeKeyboard:true,back:true,lightDark:true});
      console.log('news-citation-browser: PASS ' + JSON.stringify(results.at(-1)));
    }
  }
  assert.equal(results.length, ledger.repairs.filter(r=>r.state==='linked').length * 2);
  fs.mkdirSync('citation-audit', {recursive:true});
  fs.writeFileSync('citation-audit/browser.json', JSON.stringify({base:BASE,stage:ledger.stage,results},null,2));
  console.log(`news-citation-browser: ${ledger.stage === 'complete' ? 'PASS' : 'PARTIAL'} ${results.length} article/viewport checks; every cited target activated; original full smoke untouched`);
} catch (error) {
  console.error('news-citation-browser: FAIL', error?.stack || error);
  process.exitCode = 1;
} finally {
  cdp?.close();
  await stopChild(chrome?.child, 'SIGKILL');
  await stopChild(preview, 'SIGTERM');
  removeProfile(chrome?.profile);
  clearTimeout(hardStop);
  process.exit(process.exitCode || 0);
}

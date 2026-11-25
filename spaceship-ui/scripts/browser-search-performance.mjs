import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BASE, Cdp, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';

let preview, chrome, cdp;
const rows = [];
const deadline = setTimeout(() => { console.error('search-performance: hard timeout'); process.exit(1); }, 90000);
try {
  preview = await startPreview();
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  for (const [lang, route, width] of [['ko','/posts/',390],['en','/en/posts/',1440]]) {
    const target = await attach(cdp, { normalizeHistoryPath:false });
    const id = target.sessionId;
    try {
      await viewport(cdp,id,{width,height:900,mobile:width===390,touch:width===390,reduced:false});
      await cdp.send('Network.setCacheDisabled',{cacheDisabled:true},id);
      const indexPath = (lang === 'en' ? '/en' : '') + '/api/search.json';
      const response = await fetch(new URL(indexPath,BASE));
      assert(response.ok);
      const index = await response.json();
      const search = term => index.filter(p => p.data.title.toLowerCase().includes(term) || p.data.description.toLowerCase().includes(term));
      const terms = lang === 'en' ? ['a','e','the','ai'] : ['이','한','의','a','ai','연구'];
      const term = terms.find(t => search(t).length > 30);
      assert(term, 'Need an actual broad query with over 30 matches');
      const expected = search(term).map(p => p.href || '/posts/' + p.id);
      await navigate(cdp,id,route);
      const requests = () => evaluate(cdp,id,"performance.getEntriesByType('resource').filter(r=>new URL(r.name).pathname.endsWith('/api/search.json')).map(r=>({url:r.name,bytes:r.transferSize}))");
      assert.deepEqual(await requests(), [], 'Cold archive must not request search index');
      const open = async () => {
        await evaluate(cdp,id,"document.querySelector('header button[aria-label=\"Search\"]').click()");
        await waitExpression(cdp,id,"document.activeElement===document.querySelector('[data-search-dialog] input')",'search input focus');
      };
      const type = async () => {
        await cdp.send('Input.insertText',{text:term},id);
        await waitExpression(cdp,id,"document.querySelectorAll('[data-search-dialog] a[href]').length===30",'bounded first result batch');
      };
      await open();
      assert.deepEqual(await requests(), [], 'Opening search without typing is network-free');
      await type();
      const firstRequests = await requests();
      assert.equal(firstRequests.length,1);
      assert.equal(new URL(firstRequests[0].url).pathname,indexPath);
      let count = 30;
      while(count < expected.length) {
        await evaluate(cdp,id,"document.querySelector('[data-search-more]').click()");
        count = Math.min(count + 30, expected.length);
        await waitExpression(cdp,id,"document.querySelectorAll('[data-search-dialog] a[href]').length==="+count,'next search result batch');
      }
      assert.deepEqual(await evaluate(cdp,id,"[...document.querySelectorAll('[data-search-dialog] a[href]')].map(a=>a.getAttribute('href'))"),expected,'No search result is dropped or reordered');
      await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},id);
      await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},id);
      await waitExpression(cdp,id,"!document.querySelector('[data-search-dialog]')",'close search');
      await open();
      await type();
      assert.equal((await requests()).length,1,'Reopening uses the in-memory index');
      rows.push({ lang,width,totalRows:index.length,matches:expected.length,indexRequests:1,indexTransferBytes:firstRequests[0].bytes });
      console.log('search-performance: PASS '+JSON.stringify(rows.at(-1)));
    } finally {
      await cdp.send('Target.closeTarget',{targetId:target.targetId});
    }
  }
  fs.mkdirSync('mobile-performance',{recursive:true});
  fs.writeFileSync('mobile-performance/search.json',JSON.stringify({base:BASE,rows},null,2));
} catch (error) {
  console.error('search-performance: FAIL',error);
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  cdp?.close(); await stopChild(chrome?.child,'SIGKILL'); await stopChild(preview,'SIGTERM'); removeProfile(chrome?.profile);
  process.exit(process.exitCode || 0);
}

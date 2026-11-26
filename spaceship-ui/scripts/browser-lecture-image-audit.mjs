import assert from 'node:assert/strict';
import { BASE, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

const slug = 'self-improving-ai-26-when-the-score-and-the-goal-diverge';
export async function auditLectureImages(cdp, sessionId) {
  const manifestResponse = await fetch(new URL('/assets/lecture-previews/manifest.json', BASE));
  assert(manifestResponse.ok, 'Lecture preview build manifest must be published');
  const manifest = await manifestResponse.json();
  const sources = new Map(manifest.images.map(row => [row.src, row]));
  const samples = [];
  try {
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }, sessionId);
    for (const [width, route] of [[390, '/posts/' + slug + '/'], [1440, '/en/posts/' + slug + '/']]) {
      await viewport(cdp, sessionId, { width, height: 844, mobile: width === 390, touch: width === 390, reduced: false });
      await navigate(cdp, sessionId, route);
      const expected = manifest.pages.find(row => row.route === route);
      assert(expected && expected.images.length > 0, 'Lecture inventory exists for ' + route);
      const inventory = await evaluate(cdp, sessionId, "Array.from(document.querySelectorAll('article img')).filter(i=>i.getAttribute('src')?.includes('/self-improving-ai-26-')).map(i=>({src:i.getAttribute('src'),preview:i.dataset.lecturePreview,loading:i.loading,srcset:i.srcset,rect:i.getBoundingClientRect().top+scrollY,originalLink:!!i.closest('figure')?.querySelector('a[data-lecture-original]')}))");
      assert.deepEqual(inventory.map(row => row.src), expected.images.map(row => row.src), 'All source images remain in the exact rendered order');
      assert(inventory.every(row => row.loading === 'lazy' && row.originalLink), 'Lazy loading and full-size links are retained');
      const candidates = inventory.filter(row => row.preview === 'true');
      assert(candidates.length > 0, 'At least one optimized image is available');
      const first = candidates[0], last = candidates.at(-1);
      const cold = await evaluate(cdp, sessionId, "performance.getEntriesByType('resource').map(r=>r.name)");
      if (last !== first && last.rect > 5000) {
        const lastInfo = sources.get(last.src);
        const lastUrls = [last.src, ...lastInfo.candidates.map(c => c.url)].map(url => new URL(url, BASE).href);
        assert(!cold.some(url => lastUrls.includes(url)), 'Distant slide must not download on entry');
      }
      for (const selected of new Set([first, last])) {
        const selector = 'article img[src=' + JSON.stringify(selected.src) + ']';
        await evaluate(cdp, sessionId, "document.querySelector(" + JSON.stringify(selector) + ").scrollIntoView({block:'center',behavior:'instant'})");
        await waitExpression(cdp, sessionId, "(()=>{const i=document.querySelector(" + JSON.stringify(selector) + ");return i.complete&&i.naturalWidth>0})()", 'Lecture slide decoded');
        const image = await evaluate(cdp, sessionId, "(()=>{const i=document.querySelector(" + JSON.stringify(selector) + ");const r=performance.getEntriesByName(i.currentSrc).at(-1);return {currentSrc:i.currentSrc,naturalWidth:i.naturalWidth,transferBytes:r?.transferSize??null,decodedBytes:r?.decodedBodySize??null,originalLink:i.closest('figure').querySelector('a[data-lecture-original]').getAttribute('href')}})()");
        assert.equal(image.originalLink, selected.src);
        const source = sources.get(selected.src);
        const variants = source.candidates.map(c => new URL(c.url, BASE).href);
        assert([new URL(selected.src, BASE).href, ...variants].includes(image.currentSrc), 'Browser uses a verified source or derivative');
        if (width === 390 && source.candidates.some(c => c.width >= 390)) {
          assert(variants.includes(image.currentSrc), 'Mobile must select a smaller responsive preview');
          const loaded = await evaluate(cdp, sessionId, "performance.getEntriesByType('resource').map(r=>r.name)");
          assert(!loaded.includes(new URL(selected.src, BASE).href), 'No redundant original download for the selected slide');
        }
        samples.push({width,route,source:selected.src,originalBytes:source.originalBytes,...image});
      }
    }
    console.log('lecture-image-browser: PASS ' + JSON.stringify({ summary: manifest.summary, samples }));
  } finally {
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: false }, sessionId);
  }
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BASE, evaluate, navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

export async function auditNewsMedia(cdp, sessionId) {
  const media = JSON.parse(fs.readFileSync(new URL('../site/news-media.json', import.meta.url), 'utf8'));
  const sizes = [{ width: 390, height: 844, mobile: true, touch: true, reduced: true }, { width: 1440, height: 1000, reduced: true }];
  const results = [];
  for (const size of sizes) {
    await viewport(cdp, sessionId, size);
    await navigate(cdp, sessionId, '/news');
    const links = await evaluate(cdp, sessionId, `Array.from(document.querySelectorAll('[data-news-card]')).map((node) => node.getAttribute('data-news-card'))`);
    for (const item of Object.values(media)) assert(links.includes(item.slug), `News listing missing ${item.slug}`);
    for (const [id, item] of Object.entries(media)) {
      const route = `/posts/${item.slug}/`;
      const response = await fetch(new URL(route, BASE));
      assert.equal(response.status, 200, `Published route ${route}`);
      await navigate(cdp, sessionId, route);
      await waitExpression(cdp, sessionId, `Boolean(document.querySelector('article [data-news-figure="${id}"] img'))`, `inline image ${item.slug}`);
      await evaluate(cdp, sessionId, `document.querySelector('article [data-news-figure="${id}"]').scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp, sessionId, `(() => { const img = document.querySelector('article [data-news-figure="${id}"] img'); return img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0; })()`, `decoded image ${item.slug}`, 45000);
      const result = await evaluate(cdp, sessionId, `(() => {
        const img = document.querySelector('article [data-news-figure="${id}"] img');
        const r = img.getBoundingClientRect(); const style = getComputedStyle(img);
        return { slug: ${JSON.stringify(item.slug)}, viewport: innerWidth, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, displayedWidth: r.width, displayedHeight: r.height,
          visible: style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight,
          overflow: document.documentElement.scrollWidth > innerWidth + 2,
          newsActive: Boolean(document.querySelector('header a[href="/news"][aria-current="page"]')),
          caption: Boolean(img.closest('figure').querySelector('figcaption')) };
      })()`);
      assert(result.visible && !result.overflow && result.newsActive && result.caption, JSON.stringify(result));
      results.push(result);
      console.log('news-media-qa: PASS ' + JSON.stringify(result));
    }
  }
  console.log(`news-media-qa: PASS ${results.length} live image/viewport checks on ${BASE}`);
}

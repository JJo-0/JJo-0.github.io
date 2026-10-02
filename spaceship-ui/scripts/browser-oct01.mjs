import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  Cdp, attach, evaluate, navigate, viewport, waitExpression,
  startPreview, startChrome, stopChild, removeProfile,
} from './browser-smoke-harness.mjs';

const edition = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20261001.json', import.meta.url), 'utf8'));
const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'jjo-oct01-browser-'));
let preview, chrome, cdp, sessionId;
const timer = setTimeout(() => { console.error('oct01-browser: hard timeout'); process.exit(1); }, 180_000);

try {
  preview = await startPreview();
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  ({ sessionId } = await attach(cdp, { normalizeHistoryPath: false }));
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    await viewport(cdp, sessionId, { width, height: 900, mobile, touch: mobile, reduced: true });
    await navigate(cdp, sessionId, '/news/');
    const listing = await waitExpression(cdp, sessionId, `(() => {
      const section = document.querySelector('[data-news-date="2026-10-01"]');
      if (!section) return false;
      const cards = [...section.querySelectorAll('[data-news-card]')].map(x => x.dataset.newsCard);
      return {cards, overflow:document.documentElement.scrollWidth > innerWidth + 2};
    })()`, 'Oct 1 listing');
    assert.deepEqual(listing.cards, edition.entries.map(x => x.slug));
    assert(!listing.overflow, `${width}px listing overflow`);
    const listingImage = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
    fs.writeFileSync(path.join(screenshots, `listing-${width}.png`), Buffer.from(listingImage.data, 'base64'));
    for (const entry of edition.entries) {
      await navigate(cdp, sessionId, `/posts/${entry.slug}/`);
      for (const id of entry.mediaIds) {
        const selector = `[data-news-figure="${id}"]`;
        await evaluate(cdp, sessionId, `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center',behavior:'instant'})`);
        const image = await waitExpression(cdp, sessionId, `(() => {
          const figure = document.querySelector(${JSON.stringify(selector)});
          const img = figure?.querySelector('img');
          if (!img?.complete || !img.naturalWidth) return false;
          return {width:img.naturalWidth,height:img.naturalHeight,alt:img.alt,
            credit:figure.querySelector('figcaption')?.textContent ?? '',
            overflow:figure.scrollWidth > figure.clientWidth + 2};
        })()`, `decoded ${id}`);
        assert(image.alt.length > 20 && image.credit.includes('출처'));
        assert(!image.overflow, `${id} figure overflow at ${width}px`);
      }
      const page = await evaluate(cdp, sessionId, `({
        overflow:document.documentElement.scrollWidth > innerWidth + 2,
        equations:document.querySelectorAll('[data-candidate-equation]').length,
        katexErrors:document.querySelectorAll('.katex-error').length,
        citations:document.querySelectorAll('[data-news-citation]').length,
        references:document.querySelectorAll('[data-news-reference]').length
      })`);
      assert(!page.overflow && page.katexErrors === 0);
      assert(page.equations >= 1 && page.citations >= 5 && page.references >= 1);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
      fs.writeFileSync(path.join(screenshots, `${entry.key}-${width}.png`), Buffer.from(data, 'base64'));
      console.log(`oct01-browser: PASS ${entry.key} ${width}px ${JSON.stringify(page)}`);
    }
  }
  console.log(`oct01-browser: screenshots ${screenshots}`);
} finally {
  cdp?.close();
  await stopChild(chrome?.child, 'SIGKILL');
  await stopChild(preview, 'SIGTERM');
  removeProfile(chrome?.profile);
  clearTimeout(timer);
  process.exit(process.exitCode || 0);
}

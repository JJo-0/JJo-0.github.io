import assert from 'node:assert/strict';
import { BASE, evaluate, navigate, waitExpression } from './browser-smoke-harness.mjs';

// A literal href="#category" and a matching id are insufficient: <base href="/">
// silently resolves that link against Home. Test resolved URLs and native input.
export async function checkWritingCategoryPage({ cdp, sessionId, width, enter, screen }) {
  const category = 'health-lifestyle';
  const atLifestyle = `(() => {
    const heading = document.getElementById('health-lifestyle-heading');
    const header = document.querySelector('header [data-site-brand]')?.closest('header');
    const rect = heading?.getBoundingClientRect();
    return ['/posts', '/posts/'].includes(location.pathname)
      && location.hash === '#health-lifestyle'
      && document.readyState === 'complete'
      && rect && rect.height > 0
      && rect.top >= (header?.getBoundingClientRect().bottom || 0) - 2
      && rect.bottom < innerHeight;
  })()`;

  // Direct/shared URL: do not set location.hash or manually scroll the target.
  await navigate(cdp, sessionId, `/posts/#${category}`);
  await waitExpression(cdp, sessionId, atLifestyle, 'direct Lifestyle URL exposes its heading below the site header');
  await screen(`writing-lifestyle-${width}-direct`);

  await navigate(cdp, sessionId, '/posts/');
  const resolution = await evaluate(cdp, sessionId, `(() => {
    const links = [...document.querySelectorAll('.writing-index a[aria-controls]')];
    const sameDocument = a => {
      const u = new URL(a.href);
      return u.origin === location.origin
        && u.pathname.replace(/\\/+$/, '') === location.pathname.replace(/\\/+$/, '');
    };
    const skip = document.querySelector('a[href="#main-content"]');
    return {
      base: document.baseURI,
      categories: links.length,
      resolved: links.every(a => sameDocument(a) && new URL(a.href).hash === '#' + a.getAttribute('aria-controls')),
      skip: Boolean(skip) && sameDocument(skip),
      guideListed: Boolean(document.querySelector('#health-lifestyle a[href*="2026-09-25-power-bank-buying-guide"]'))
    };
  })()`);
  assert(resolution.categories > 0 && resolution.resolved && resolution.skip && resolution.guideListed, JSON.stringify(resolution));
  const history = await cdp.send('Page.getNavigationHistory', {}, sessionId);
  const before = history.entries[history.currentIndex].id;

  // One genuine keyboard activation. No HTMLElement.click() or synthetic hash.
  await enter('.writing-index a[aria-controls="health-lifestyle"]');
  await waitExpression(cdp, sessionId, atLifestyle, 'native Lifestyle category activation scrolls to the correct document and heading');
  await screen(`writing-lifestyle-${width}-native`);
  await cdp.send('Page.navigateToHistoryEntry', { entryId: before }, sessionId);
  await waitExpression(cdp, sessionId, `['/posts', '/posts/'].includes(location.pathname) && location.hash === '' && document.readyState === 'complete'`, 'Back preserves the Writing archive');

  // Allow the legacy Home fragment to redirect to Writing. navigate() deliberately
  // pins a destination pathname, so use Page.navigate and assert the final route.
  await cdp.send('Page.navigate', { url: new URL(`/#${category}`, BASE).href }, sessionId);
  await waitExpression(cdp, sessionId, atLifestyle, 'legacy Home fragment recovers the Writing category');
  const result = { width, ...resolution, direct: true, nativeCategory: true, back: true, legacy: true };
  console.log('writing-category-browser: PASS ' + JSON.stringify(result));
  return result;
}

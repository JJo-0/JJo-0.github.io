import {
  Cdp,
  attach,
  evaluate,
  removeProfile,
  setReducedMotionOverride,
  sleep,
  startChrome,
  stopChild,
  viewport,
  navigate,
} from './browser-smoke-harness.mjs';

let chrome, cdp, target;
try {
  setReducedMotionOverride(true);
  chrome = await startChrome();
  cdp = await Cdp.connect(chrome.url);
  target = await attach(cdp);
  await viewport(cdp, target.sessionId, { width: 1440, height: 900 });
  await navigate(cdp, target.sessionId, '/');
  await sleep(1_500);

  const result = await evaluate(
    cdp,
    target.sessionId,
    `(() => {
      const regionOf = (anchor) => {
        if (anchor.closest('[aria-label="Breadcrumb"]')) return 'breadcrumb';
        const nav = anchor.closest('nav');
        if (nav) return 'nav:' + (nav.getAttribute('aria-label') || 'unlabelled');
        if (anchor.closest('header')) return 'header';
        if (anchor.closest('footer')) return 'footer';
        if (anchor.closest('aside')) return 'aside';
        if (anchor.closest('main')) return 'main';
        return 'other';
      };
      const visible = (node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' &&
          Number(style.opacity) > 0 && rect.width > 1 && rect.height > 1;
      };
      const all = [...document.querySelectorAll('a[href]')];
      const matches = all
        .filter((node) => /robotics/i.test([
          node.textContent || '',
          node.getAttribute('aria-label') || '',
          node.getAttribute('href') || '',
          node.outerHTML || '',
        ].join(' ')))
        .map((node) => ({
          text: (node.textContent || '').replace(/\\s+/g, ' ').trim(),
          aria: node.getAttribute('aria-label') || '',
          href: node.getAttribute('href') || '',
          absolute: new URL(node.getAttribute('href') || '', location.href).href,
          region: regionOf(node),
          visible: visible(node),
          constructor: node.constructor?.name || null,
          namespaceURI: node.namespaceURI,
          isSvgA: typeof SVGAElement !== 'undefined' && node instanceof SVGAElement,
          isHtmlA: node instanceof HTMLAnchorElement,
          target: node.getAttribute('target') || '',
          rel: node.getAttribute('rel') || '',
          closestSvg: Boolean(node.closest('svg')),
          closestMain: Boolean(node.closest('main')),
          outerHTML: (node.outerHTML || '').slice(0, 1000),
        }));
      return {
        location: location.href,
        pathname: location.pathname,
        readyState: document.readyState,
        totalAnchors: all.length,
        matches,
      };
    })()`,
  );
  console.log('LIVE_ANCHOR_DIAGNOSTIC=' + JSON.stringify(result, null, 2));
} finally {
  setReducedMotionOverride(null);
  if (cdp && target) {
    try { await cdp.send('Target.detachFromTarget', { sessionId: target.sessionId }); } catch {}
    try { await cdp.send('Target.closeTarget', { targetId: target.targetId }); } catch {}
  }
  cdp?.close();
  await stopChild(chrome?.child, 'SIGKILL');
  removeProfile(chrome?.profile);
}

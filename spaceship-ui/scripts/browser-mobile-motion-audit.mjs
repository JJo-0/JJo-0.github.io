import assert from 'node:assert/strict';
import {
  attach,
  evaluate,
  navigate,
  viewport,
  waitExpression,
} from './browser-smoke-harness.mjs';

// Synthetic checks must not produce billable ad traffic or analytics visits.
const BLOCKED_THIRD_PARTIES = [
  '*googlesyndication.com/*',
  '*doubleclick.net/*',
  '*googletagmanager.com/*',
  '*google-analytics.com/*',
  '*fundingchoicesmessages.google.com/*',
];
const MOBILE = { width: 390, height: 844, mobile: true, touch: true };
const DESKTOP = { width: 1366, height: 900, mobile: false, touch: false };
const modeExpression = (mode) =>
  `document.querySelector('[data-experience-page]')?.dataset.motionMode === ${JSON.stringify(mode)}`;

async function fineViewport(cdp, sessionId, { width, height, reduced = false }) {
  // Do not send setTouchEmulationEnabled(false): on headless Chrome it can
  // reset a fresh target's primary pointer to none. Keep the actual desktop
  // pointer and emulate only dimensions/preferences; assertions verify it.
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: false,
  }, sessionId);
  await cdp.send('Emulation.setEmulatedMedia', {
    media: '',
    features: [
      { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
      { name: 'prefers-color-scheme', value: 'light' },
    ],
  }, sessionId);
}

async function assertVisibleContent(cdp, sessionId, label) {
  const result = await evaluate(cdp, sessionId, `(() => {
    const root = document.querySelector('[data-experience-page]');
    const targets = [...root.querySelectorAll('[data-motion], [data-reveal], [data-stagger-item]')];
    const hidden = targets.filter((element) => {
      const css = getComputedStyle(element);
      return css.visibility === 'hidden' || Number(css.opacity) === 0;
    });
    return { count: targets.length, hidden: hidden.map((element) => element.className) };
  })()`);
  assert.ok(result.count > 0, `${label}: expected real content targets`);
  assert.deepEqual(result.hidden, [], `${label}: no reveal animation may hide mobile content`);
}

async function assertNativeSectionSync(cdp, sessionId) {
  const id = await evaluate(cdp, sessionId, `(() => {
    const section = document.querySelectorAll('[data-research-section]')[1];
    if (!section) return null;
    section.scrollIntoView({ behavior: 'instant', block: 'center' });
    return section.getAttribute('data-research-section');
  })()`);
  assert.ok(id, 'native scroll: expected second research section');
  await waitExpression(cdp, sessionId, `(() => {
    const section = [...document.querySelectorAll('[data-research-section]')]
      .find((element) => element.getAttribute('data-research-section') === ${JSON.stringify(id)});
    return section?.hasAttribute('data-active') &&
      Number(document.documentElement.style.getPropertyValue('--experience-progress')) > 0;
  })()`, 'native section and progress synchronization');
}

export async function auditMobileMotion(cdp, sessionId) {
  await cdp.send('Network.enable', {}, sessionId);
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }, sessionId);
  await cdp.send('Network.setBlockedURLs', { urls: BLOCKED_THIRD_PARTIES }, sessionId);

  let desktopTarget;
  try {
    for (const pathname of ['/', '/research']) {
      await viewport(cdp, sessionId, MOBILE);
      await navigate(cdp, sessionId, pathname);
      await waitExpression(cdp, sessionId, modeExpression('native'), `${pathname}: native mobile mode`);
      await assertVisibleContent(cdp, sessionId, pathname);
      await assertNativeSectionSync(cdp, sessionId);

      const runtime = await evaluate(cdp, sessionId, `({
        gsapLoaded: Boolean(window.gsap || window.ScrollTrigger),
        engineRequests: performance.getEntriesByType('resource')
          .map((entry) => entry.name).filter((name) => /motion-engine[^/]*\\.js/.test(name)),
      })`);
      assert.equal(runtime.gsapLoaded, false, `${pathname}: cold mobile must not load GSAP`);
      assert.deepEqual(runtime.engineRequests, [], `${pathname}: cold mobile must not fetch motion engine`);

      if (pathname === '/') {
        const gif = await evaluate(cdp, sessionId, `(() => {
          const image = document.querySelector('img[src="/image/mouse_surprised.gif"]');
          return Boolean(image?.complete && image.naturalWidth > 0 && image.getBoundingClientRect().width > 0);
        })()`);
        assert.ok(gif, 'mobile Home identity GIF must still decode and remain visible');
      }
    }
    console.log('browser-mobile-motion: PASS cold Home/Research: no GSAP download; visible content; native scroll sync; identity GIF');

    // Touch-emulated targets do not reliably regain a fine primary pointer
    // after disabling touch. A wider touch viewport is not a desktop.
    // Verify fine-pointer width transitions in a fresh target, without stubbing
    // matchMedia or weakening the production capability check.
    desktopTarget = await attach(cdp);
    const desktopId = desktopTarget.sessionId;
    await cdp.send('Network.enable', {}, desktopId);
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }, desktopId);
    await cdp.send('Network.setBlockedURLs', { urls: BLOCKED_THIRD_PARTIES }, desktopId);
    await fineViewport(cdp, desktopId, DESKTOP);
    await navigate(cdp, desktopId, '/research');
    assert.equal(await evaluate(cdp, desktopId,
      "matchMedia('(hover: hover) and (pointer: fine)').matches"), true,
    'desktop fixture must provide a real fine/hover pointer');
    await waitExpression(cdp, desktopId, modeExpression('enhanced'), 'desktop progressive enhancement');
    await fineViewport(cdp, desktopId, { ...DESKTOP, width: 390, height: 844 });
    await waitExpression(cdp, desktopId, modeExpression('native'), 'desktop-to-narrow teardown');
    await assertVisibleContent(cdp, desktopId, 'desktop-to-narrow');
    await assertNativeSectionSync(cdp, desktopId);
    await fineViewport(cdp, desktopId, DESKTOP);
    await waitExpression(cdp, desktopId, modeExpression('enhanced'), 'narrow-to-desktop remount');

    await fineViewport(cdp, desktopId, { ...DESKTOP, reduced: true });
    await navigate(cdp, desktopId, '/');
    await waitExpression(cdp, desktopId, modeExpression('reduced'), 'cold reduced motion');
    const reducedEngine = await evaluate(cdp, desktopId, 'Boolean(window.gsap || window.ScrollTrigger)');
    assert.equal(reducedEngine, false, 'cold reduced-motion must not load GSAP');
    await assertVisibleContent(cdp, desktopId, 'reduced-motion');
    console.log('browser-mobile-motion: PASS bidirectional width lifecycle and cold reduced-motion isolation');

    await cdp.send('Network.setBlockedURLs', {
      urls: [...BLOCKED_THIRD_PARTIES, '*/motion-engine*.js'],
    }, desktopId);
    await fineViewport(cdp, desktopId, DESKTOP);
    await navigate(cdp, desktopId, '/');
    await waitExpression(cdp, desktopId, modeExpression('native'), 'failed enhanced import falls back');
    await assertVisibleContent(cdp, desktopId, 'failed-import');
    await assertNativeSectionSync(cdp, desktopId);
    console.log('browser-mobile-motion: PASS failed enhanced import preserves readable content and navigation');
  } finally {
    if (desktopTarget) {
      try {
        await cdp.send('Target.closeTarget', { targetId: desktopTarget.targetId });
      } catch {}
    }
    await cdp.send('Network.setBlockedURLs', { urls: [] }, sessionId);
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: false }, sessionId);
  }
}

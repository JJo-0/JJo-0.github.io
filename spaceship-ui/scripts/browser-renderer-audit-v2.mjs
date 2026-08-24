import assert from 'node:assert/strict';
import {
  REQUIRE_GPU,
  attach,
  evaluate,
  navigate,
  optionalExpression,
  viewport,
  waitExpression,
} from './browser-smoke-harness.mjs';

function assertHeader(metrics, label) {
  assert.ok(metrics.left >= 20, `${label}: brand left inset ${metrics.left}px`);
  assert.equal(metrics.clipped, false, `${label}: brand clipped`);
  assert.equal(metrics.overflow, false, `${label}: horizontal overflow`);
}

async function stateProbe(cdp, sessionId) {
  await evaluate(cdp, sessionId, `(() => {
    window.__jjoSmokeState = null;
    if (!window.__jjoSmokeListenerInstalled) {
      addEventListener('jjo:experience-state', (event) => {
        window.__jjoSmokeState = event.detail;
      });
      window.__jjoSmokeListenerInstalled = true;
    }
  })()`);
}

async function waitMotionReady(cdp, sessionId, label) {
  await waitExpression(
    cdp,
    sessionId,
    `document.querySelector('[data-experience-page]')?.hasAttribute('data-motion-ready') === true`,
    `${label} motion runtime ready`,
  );
  await evaluate(
    cdp,
    sessionId,
    `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`,
  );
}

async function lazyRetry(cdp) {
  const { targetId, sessionId } = await attach(cdp);
  try {
    await cdp.send('Network.enable', {}, sessionId);
    await viewport(cdp, sessionId, { width: 680, height: 820 });
    await navigate(cdp, sessionId, '/');
    await cdp.send('Network.setBlockedURLs', { urls: ['*/_astro/*'] }, sessionId);
    await viewport(cdp, sessionId, { width: 1440, height: 900 });
    await waitExpression(
      cdp,
      sessionId,
      `document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererStatus === 'fallback'`,
      'intentional lazy renderer import failure',
    );
    await cdp.send('Network.setBlockedURLs', { urls: [] }, sessionId);
    await evaluate(cdp, sessionId, `document.querySelector('a[href="/research"]')?.click()`);
    await waitExpression(cdp, sessionId, `location.pathname === '/research'`, 'SPA retry navigation');
    await waitExpression(
      cdp,
      sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererStatus === 'active'`,
      'lazy renderer retry recovery',
    );
  } finally {
    try {
      await cdp.send('Target.detachFromTarget', { sessionId });
    } catch {}
    try {
      await cdp.send('Target.closeTarget', { targetId });
    } catch {}
  }
}

async function auditResearchNodeClicks(cdp, sessionId) {
  await navigate(cdp, sessionId, '/research');
  await waitMotionReady(cdp, sessionId, 'Research');
  await stateProbe(cdp, sessionId);
  const ids = await evaluate(
    cdp,
    sessionId,
    `[...document.querySelectorAll('[data-research-section]')]
      .map((node) => node.dataset.researchSection)`,
  );
  assert.equal(ids.length, 4, `canonical research IDs=${ids.length}`);

  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    await evaluate(cdp, sessionId, `(() => {
      const node = [...document.querySelectorAll('[data-constellation-node]')][${index}];
      node?.focus({ preventScroll: true });
      node?.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
      node?.click();
    })()`);
    await waitExpression(
      cdp,
      sessionId,
      `(() => {
        const renderer = document.querySelector('[data-experience-canvas="research"]');
        const rendererFocusReady = !renderer ||
          renderer.dataset.rendererStatus !== 'active' ||
          renderer.dataset.rendererFocus === ${JSON.stringify(id)};
        return location.pathname === '/research' &&
          location.hash === ${JSON.stringify(`#${id}`)} &&
          Boolean(document.getElementById(${JSON.stringify(id)})) &&
          window.__jjoSmokeState?.activeResearchNode === ${JSON.stringify(id)} &&
          document.querySelector('[data-constellation-node][data-active]')
            ?.getAttribute('data-constellation-node') === ${JSON.stringify(id)} &&
          rendererFocusReady;
      })()`,
      `Research node click ${id}`,
    );
  }

  console.log('browser-smoke: PASS Research SVG focus synchronization and four-node click routing');
  console.log('browser-smoke: PASS renderer focus choreography target synchronization');
  return ids;
}

async function auditResearchSectionScroll(cdp, sessionId, expectedIds) {
  // Node clicks use smooth scrolling and hash mutation. Reload the clean route
  // before testing ScrollTrigger so click choreography cannot contaminate the
  // independent section-driven state contract.
  await navigate(cdp, sessionId, '/research');
  await waitMotionReady(cdp, sessionId, 'Research clean scroll');
  await stateProbe(cdp, sessionId);

  const ids = await evaluate(
    cdp,
    sessionId,
    `[...document.querySelectorAll('[data-research-section]')]
      .map((node) => node.dataset.researchSection)`,
  );
  assert.deepEqual(ids, expectedIds, 'research section order changed after clean navigation');

  const targetId = ids[2];
  await evaluate(cdp, sessionId, `(() => {
    scrollTo(0, 0);
    const section = document.getElementById(${JSON.stringify(targetId)});
    if (!section) return false;
    const absoluteTop = scrollY + section.getBoundingClientRect().top;
    const targetTop = Math.max(0, absoluteTop - innerHeight * 0.5);
    scrollTo(0, targetTop);
    dispatchEvent(new Event('scroll'));
    return true;
  })()`);

  await waitExpression(
    cdp,
    sessionId,
    `(() => {
      const section = document.getElementById(${JSON.stringify(targetId)});
      const active = document.querySelector('[data-constellation-node][data-active]')
        ?.getAttribute('data-constellation-node');
      const renderer = document.querySelector('[data-experience-canvas="research"]');
      const rendererFocusReady = !renderer ||
        renderer.dataset.rendererStatus !== 'active' ||
        renderer.dataset.rendererFocus === ${JSON.stringify(targetId)};
      if (!section) return false;
      const top = section.getBoundingClientRect().top;
      return Math.abs(top - innerHeight * 0.5) < 80 &&
        window.__jjoSmokeState?.activeResearchNode === ${JSON.stringify(targetId)} &&
        active === ${JSON.stringify(targetId)} &&
        rendererFocusReady;
    })()`,
    'Research section scroll synchronization',
  );

  console.log(`browser-smoke: PASS Research section scroll synchronization (${targetId})`);
}

export async function auditRenderer(cdp, sessionId) {
  await viewport(cdp, sessionId, { width: 1440, height: 900 });
  await navigate(cdp, sessionId, '/');

  const home = await waitExpression(
    cdp,
    sessionId,
    `(() => {
      const brand = document.querySelector('[data-site-brand]');
      const stage = document.querySelector('.experience-visual-stage');
      const overlays = [...document.querySelectorAll(
        '.experience-stage-index,.experience-stage-caption,.experience-orbit-label'
      )];
      if (!brand || !stage || overlays.length !== 5) return null;
      const brandRect = brand.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      return {
        left: brandRect.left,
        clipped: brand.scrollWidth > brand.clientWidth + 1,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        positions: overlays.map((node) => getComputedStyle(node).position),
        inside: overlays.every((node) => {
          const rect = node.getBoundingClientRect();
          return rect.left >= stageRect.left - 1 &&
            rect.right <= stageRect.right + 1 &&
            rect.top >= stageRect.top - 1 &&
            rect.bottom <= stageRect.bottom + 1;
        }),
      };
    })()`,
    'desktop header and overlays',
  );
  assertHeader(home, 'desktop');
  assert.ok(home.positions.every((value) => value === 'absolute'), `overlayPositions=${home.positions}`);
  assert.equal(home.inside, true, 'Home overlay escaped stage');

  // The Home interaction listeners are installed by the motion runtime. Wait
  // for the same explicit readiness signal used by Research before dispatching
  // trusted focus/pointer events; otherwise the audit can race initialization.
  await waitMotionReady(cdp, sessionId, 'Home');
  await stateProbe(cdp, sessionId);
  await evaluate(cdp, sessionId, `(() => {
    const node = document.querySelector('[data-constellation-node]');
    node?.focus({ preventScroll: true });
    node?.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    node?.dispatchEvent(new PointerEvent('pointerenter'));
  })()`);
  await waitExpression(
    cdp,
    sessionId,
    `window.__jjoSmokeState?.activeResearchNode ===
      document.querySelector('[data-constellation-node]')?.getAttribute('data-constellation-node')`,
    'Home card to shared state synchronization',
  );

  const homeGpu = await optionalExpression(
    cdp,
    sessionId,
    `document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererStatus === 'active'`,
  );
  if (REQUIRE_GPU) assert.equal(homeGpu, true, 'GPU required but unavailable');
  if (homeGpu) {
    await viewport(cdp, sessionId, { width: 680, height: 820 });
    await waitExpression(
      cdp,
      sessionId,
      `document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererTier === 'safe' &&
       !document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererCore`,
      'live desktop-to-SAFE reclassification',
    );
    await viewport(cdp, sessionId, { width: 1440, height: 900 });
    await waitExpression(
      cdp,
      sessionId,
      `document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererStatus === 'active'`,
      'live SAFE recovery',
    );
  }
  console.log('browser-smoke: PASS desktop Home/header/overlay/card synchronization');

  const ids = await auditResearchNodeClicks(cdp, sessionId);
  await auditResearchSectionScroll(cdp, sessionId, ids);

  const gpu = await optionalExpression(
    cdp,
    sessionId,
    `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererStatus === 'active'`,
  );
  if (REQUIRE_GPU) assert.equal(gpu, true, 'Research GPU required but unavailable');
  if (gpu) {
    await evaluate(cdp, sessionId, `scrollTo(0, 0)`);
    await waitExpression(
      cdp,
      sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererLoop === 'running'`,
      'Research RAF running after renderer returns onscreen',
    );
    const diagnostics = await evaluate(cdp, sessionId, `(() => {
      const host = document.querySelector('[data-experience-canvas="research"]');
      return host ? {
        backend: host.dataset.rendererBackend,
        preferred: host.dataset.rendererPreferredBackend,
        quality: host.dataset.rendererQuality,
        dpr: Number(host.dataset.rendererDpr),
        targetFps: Number(host.dataset.rendererTargetFps),
        focus: host.dataset.rendererFocus,
      } : null;
    })()`);
    assert.ok(['webgpu', 'webgl2'].includes(diagnostics?.backend));
    assert.ok(['webgpu', 'webgl2'].includes(diagnostics?.preferred));
    assert.ok(['low', 'balanced', 'high'].includes(diagnostics?.quality));
    assert.ok(diagnostics?.dpr >= 0.5 && diagnostics?.dpr <= 1.6);
    assert.ok([30, 60].includes(diagnostics?.targetFps));
    assert.ok(typeof diagnostics?.focus === 'string' && diagnostics.focus.length > 0);

    await evaluate(cdp, sessionId, `scrollTo(0, document.documentElement.scrollHeight)`);
    const stickyParity = await waitExpression(
      cdp,
      sessionId,
      `(() => {
        const host = document.querySelector('[data-experience-canvas="research"]');
        if (!host) return false;
        const rect = host.getBoundingClientRect();
        const insideObserverMargin = rect.bottom > -120 && rect.top < innerHeight + 120;
        const expectedLoop = insideObserverMargin ? 'running' : 'stopped';
        return host.dataset.rendererLoop === expectedLoop
          ? { insideObserverMargin, loop: host.dataset.rendererLoop }
          : false;
      })()`,
      'sticky viewport RAF parity',
    );
    console.log(
      `browser-smoke: PASS sticky viewport RAF parity (${stickyParity.insideObserverMargin ? 'intersecting/running' : 'offscreen/stopped'})`,
    );

    await evaluate(cdp, sessionId, `(() => {
      document.querySelector('[data-renderer-smoke-spacer]')?.remove();
      const spacer = document.createElement('div');
      spacer.dataset.rendererSmokeSpacer = 'true';
      spacer.style.height = '220vh';
      spacer.style.pointerEvents = 'none';
      spacer.setAttribute('aria-hidden', 'true');
      document.body.append(spacer);
      scrollTo(0, document.documentElement.scrollHeight);
      dispatchEvent(new Event('scroll'));
    })()`);
    await waitExpression(
      cdp,
      sessionId,
      `(() => {
        const host = document.querySelector('[data-experience-canvas="research"]');
        if (!host) return false;
        const rect = host.getBoundingClientRect();
        return rect.bottom < -130 && host.dataset.rendererLoop === 'stopped';
      })()`,
      'offscreen RAF stop',
    );

    await evaluate(cdp, sessionId, `(() => {
      document.querySelector('[data-renderer-smoke-spacer]')?.remove();
      scrollTo(0, 0);
      dispatchEvent(new Event('scroll'));
    })()`);
    await waitExpression(
      cdp,
      sessionId,
      `(() => {
        const host = document.querySelector('[data-experience-canvas="research"]');
        if (!host) return false;
        const rect = host.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < innerHeight && host.dataset.rendererLoop === 'running';
      })()`,
      'onscreen RAF restart',
    );

    const before = await evaluate(
      cdp,
      sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererTheme`,
    );
    await evaluate(cdp, sessionId, `document.documentElement.classList.toggle('dark')`);
    await waitExpression(
      cdp,
      sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererTheme !==
        ${JSON.stringify(before)}`,
      'renderer theme palette refresh',
    );
    await lazyRetry(cdp);
  }
  console.log('browser-smoke: PASS Research state/RAF/theme matrix');

  const safeCases = [
    {
      options: { width: 680, height: 820 },
      label: 'narrow fine-pointer SAFE parity',
      expression:
        `document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererTier === 'safe'`,
    },
    {
      options: { width: 390, height: 844, mobile: true, touch: true },
      label: 'mobile SAFE/header matrix',
      expression:
        `matchMedia('(pointer: coarse)').matches &&
         document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererTier === 'safe'`,
    },
    {
      options: { width: 1024, height: 768, mobile: true, touch: true },
      label: 'wide coarse-pointer SAFE parity',
      expression:
        `matchMedia('(pointer: coarse)').matches &&
         document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererTier === 'safe'`,
    },
    {
      options: { width: 1440, height: 900, reduced: true },
      label: 'reduced-motion SAFE parity',
      expression:
        `matchMedia('(prefers-reduced-motion: reduce)').matches &&
         document.querySelector('[data-experience-page]')?.dataset.motionMode === 'reduced'`,
    },
  ];

  for (const { options, label, expression } of safeCases) {
    await viewport(cdp, sessionId, options);
    await navigate(cdp, sessionId, '/');
    await waitExpression(cdp, sessionId, expression, label);
    if (label === 'mobile SAFE/header matrix') {
      const metrics = await evaluate(cdp, sessionId, `(() => {
        const brand = document.querySelector('[data-site-brand]');
        const rect = brand.getBoundingClientRect();
        return {
          left: rect.left,
          clipped: brand.scrollWidth > brand.clientWidth + 1,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      })()`);
      assertHeader(metrics, 'mobile');
    }
    console.log(`browser-smoke: PASS ${label}`);
  }

  await viewport(cdp, sessionId, { width: 1440, height: 900 });
  await navigate(cdp, sessionId, '/posts');
  const article = await waitExpression(
    cdp,
    sessionId,
    `(() => [...document.querySelectorAll('a[href^="/posts/"]')]
      .find((anchor) => !anchor.getAttribute('href').startsWith('/posts/tag/'))
      ?.getAttribute('href') || null)()`,
    'article URL',
  );
  await navigate(cdp, sessionId, article);
  assert.deepEqual(
    await evaluate(cdp, sessionId, `({
      canvas: document.querySelectorAll('[data-experience-canvas]').length,
      runtime: Boolean(window.__jjoRendererRuntime),
      core: document.querySelectorAll('[data-renderer-core]').length,
    })`),
    { canvas: 0, runtime: false, core: 0 },
  );
  console.log('browser-smoke: PASS article renderer isolation');
}
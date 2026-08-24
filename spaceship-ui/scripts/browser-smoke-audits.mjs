import assert from 'node:assert/strict';
import {
  BASE, REQUIRE_GPU, attach, evaluate, navigate, optionalExpression, viewport, waitExpression,
} from './browser-smoke-harness.mjs';

const CORE_ROUTES = ['/', '/research', '/about', '/posts'];

function assertHeader(metrics, label) {
  assert.ok(metrics.left >= 20, `${label}: brand left inset ${metrics.left}px`);
  assert.equal(metrics.clipped, false, `${label}: brand clipped`);
  assert.equal(metrics.overflow, false, `${label}: horizontal overflow`);
}

async function stateProbe(cdp, sessionId) {
  await evaluate(cdp, sessionId, `(() => {
    window.__jjoSmokeState = null;
    if (!window.__jjoSmokeListenerInstalled) {
      addEventListener('jjo:experience-state', (event) => { window.__jjoSmokeState = event.detail; });
      window.__jjoSmokeListenerInstalled = true;
    }
  })()`);
}

async function lazyRetry(cdp) {
  const { targetId, sessionId } = await attach(cdp);
  try {
    await cdp.send('Network.enable', {}, sessionId);
    await viewport(cdp, sessionId, { width: 680, height: 820 });
    await navigate(cdp, sessionId, '/');
    await cdp.send('Network.setBlockedURLs', { urls: ['*/_astro/*'] }, sessionId);
    await viewport(cdp, sessionId, { width: 1440, height: 900 });
    await waitExpression(cdp, sessionId,
      `document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererStatus === 'fallback'`,
      'intentional lazy renderer import failure');
    await cdp.send('Network.setBlockedURLs', { urls: [] }, sessionId);
    await evaluate(cdp, sessionId, `document.querySelector('a[href="/research"]')?.click()`);
    await waitExpression(cdp, sessionId, `location.pathname === '/research'`, 'SPA retry navigation');
    await waitExpression(cdp, sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererStatus === 'active'`,
      'lazy renderer retry recovery');
  } finally {
    try { await cdp.send('Target.detachFromTarget', { sessionId }); } catch {}
    try { await cdp.send('Target.closeTarget', { targetId }); } catch {}
  }
}

async function researchNodes(cdp, sessionId) {
  await navigate(cdp, sessionId, '/research');
  await waitExpression(cdp, sessionId,
    `document.querySelector('[data-experience-page]')?.hasAttribute('data-motion-ready') === true`,
    'Research motion runtime ready');
  await stateProbe(cdp, sessionId);
  const ids = await evaluate(cdp, sessionId,
    `[...document.querySelectorAll('[data-research-section]')].map((node) => node.dataset.researchSection)`);
  assert.equal(ids.length, 4);
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    await evaluate(cdp, sessionId, `(() => {
      const node = [...document.querySelectorAll('[data-constellation-node]')][${index}];
      node?.focus({ preventScroll: true });
      node?.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
      node?.click();
    })()`);
    await waitExpression(cdp, sessionId,
      `location.pathname === '/research' && location.hash === ${JSON.stringify(`#${id}`)} &&
       Boolean(document.getElementById(${JSON.stringify(id)})) &&
       window.__jjoSmokeState?.activeResearchNode === ${JSON.stringify(id)} &&
       document.querySelector('[data-constellation-node][data-active]')?.getAttribute('data-constellation-node') === ${JSON.stringify(id)}`,
      `Research node click ${id}`);
  }
  console.log('browser-smoke: PASS Research SVG focus synchronization and four-node click routing');
  return ids;
}

export async function auditRenderer(cdp, sessionId) {
  await viewport(cdp, sessionId, { width: 1440, height: 900 });
  await navigate(cdp, sessionId, '/');
  const home = await waitExpression(cdp, sessionId, `(() => {
    const brand = document.querySelector('[data-site-brand]');
    const stage = document.querySelector('.experience-visual-stage');
    const overlays = [...document.querySelectorAll('.experience-stage-index,.experience-stage-caption,.experience-axis-label')];
    if (!brand || !stage || overlays.length !== 5) return null;
    const b = brand.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return {
      left: b.left, clipped: brand.scrollWidth > brand.clientWidth + 1,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      positions: overlays.map((node) => getComputedStyle(node).position),
      inside: overlays.every((node) => {
        const r = node.getBoundingClientRect();
        return r.left >= s.left - 1 && r.right <= s.right + 1 && r.top >= s.top - 1 && r.bottom <= s.bottom + 1;
      }),
    };
  })()`, 'desktop header and overlays');
  assertHeader(home, 'desktop');
  assert.ok(home.positions.every((value) => value === 'absolute'), `overlayPositions=${home.positions}`);
  assert.equal(home.inside, true);
  await stateProbe(cdp, sessionId);
  await evaluate(cdp, sessionId, `(() => {
    const node = document.querySelector('[data-constellation-node]');
    node?.focus({ preventScroll: true });
    node?.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    node?.dispatchEvent(new PointerEvent('pointerenter'));
  })()`);
  await waitExpression(cdp, sessionId,
    `window.__jjoSmokeState?.activeResearchNode === document.querySelector('[data-constellation-node]')?.getAttribute('data-constellation-node')`,
    'Home card to shared state synchronization');

  const homeGpu = await optionalExpression(cdp, sessionId,
    `document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererStatus === 'active'`);
  if (REQUIRE_GPU) assert.equal(homeGpu, true);
  if (homeGpu) {
    await viewport(cdp, sessionId, { width: 680, height: 820 });
    await waitExpression(cdp, sessionId,
      `document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererTier === 'safe' &&
       !document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererCore`,
      'live desktop-to-SAFE reclassification');
    await viewport(cdp, sessionId, { width: 1440, height: 900 });
    await waitExpression(cdp, sessionId,
      `document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererStatus === 'active'`,
      'live SAFE recovery');
  }
  console.log('browser-smoke: PASS desktop Home/header/overlay/card synchronization');

  const ids = await researchNodes(cdp, sessionId);
  await evaluate(cdp, sessionId,
    `document.getElementById(${JSON.stringify(ids[2])})?.scrollIntoView({ block: 'center' })`);
  await waitExpression(cdp, sessionId,
    `window.__jjoSmokeState?.activeResearchNode === ${JSON.stringify(ids[2])}`,
    'Research section scroll synchronization');

  const gpu = await optionalExpression(cdp, sessionId,
    `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererStatus === 'active'`);
  if (REQUIRE_GPU) assert.equal(gpu, true);
  if (gpu) {
    await evaluate(cdp, sessionId, `scrollTo(0, 0)`);
    await waitExpression(cdp, sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererLoop === 'running'`,
      'Research RAF running after renderer returns onscreen');
    const d = await evaluate(cdp, sessionId, `(() => {
      const h = document.querySelector('[data-experience-canvas="research"]');
      return h ? { backend: h.dataset.rendererBackend, preferred: h.dataset.rendererPreferredBackend,
        quality: h.dataset.rendererQuality, dpr: Number(h.dataset.rendererDpr),
        targetFps: Number(h.dataset.rendererTargetFps) } : null;
    })()`);
    assert.ok(['webgpu', 'webgl2'].includes(d?.backend));
    assert.ok(['webgpu', 'webgl2'].includes(d?.preferred));
    assert.ok(['low', 'balanced', 'high'].includes(d?.quality));
    assert.ok(d?.dpr >= 0.5 && d?.dpr <= 1.6);
    assert.ok([30, 60].includes(d?.targetFps));
    await evaluate(cdp, sessionId, `scrollTo(0, document.documentElement.scrollHeight)`);
    await waitExpression(cdp, sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererLoop === 'stopped'`,
      'offscreen RAF stop');
    await evaluate(cdp, sessionId, `scrollTo(0, 0)`);
    await waitExpression(cdp, sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererLoop === 'running'`,
      'onscreen RAF restart');
    const before = await evaluate(cdp, sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererTheme`);
    await evaluate(cdp, sessionId, `document.documentElement.classList.toggle('dark')`);
    await waitExpression(cdp, sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererTheme !== ${JSON.stringify(before)}`,
      'renderer theme palette refresh');
    await lazyRetry(cdp);
  }
  console.log('browser-smoke: PASS Research state/RAF/theme matrix');

  for (const [options, label, expression] of [
    [{ width: 680, height: 820 }, 'narrow fine-pointer SAFE parity',
      `document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererTier === 'safe'`],
    [{ width: 390, height: 844, mobile: true, touch: true }, 'mobile SAFE/header matrix',
      `matchMedia('(pointer: coarse)').matches && document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererTier === 'safe'`],
    [{ width: 1024, height: 768, mobile: true, touch: true }, 'wide coarse-pointer SAFE parity',
      `matchMedia('(pointer: coarse)').matches && document.querySelector('[data-experience-canvas="home"]')?.dataset.rendererTier === 'safe'`],
    [{ width: 1440, height: 900, reduced: true }, 'reduced-motion SAFE parity',
      `matchMedia('(prefers-reduced-motion: reduce)').matches && document.querySelector('[data-experience-page]')?.dataset.motionMode === 'reduced'`],
  ]) {
    await viewport(cdp, sessionId, options);
    await navigate(cdp, sessionId, '/');
    await waitExpression(cdp, sessionId, expression, label);
    if (label === 'mobile SAFE/header matrix') {
      const m = await evaluate(cdp, sessionId, `(() => {
        const b = document.querySelector('[data-site-brand]'); const r = b.getBoundingClientRect();
        return { left: r.left, clipped: b.scrollWidth > b.clientWidth + 1,
          overflow: document.documentElement.scrollWidth > innerWidth + 1 };
      })()`);
      assertHeader(m, 'mobile');
    }
    console.log(`browser-smoke: PASS ${label}`);
  }

  await viewport(cdp, sessionId, { width: 1440, height: 900 });
  await navigate(cdp, sessionId, '/posts');
  const article = await waitExpression(cdp, sessionId,
    `(() => [...document.querySelectorAll('a[href^="/posts/"]')]
      .find((a) => !a.getAttribute('href').startsWith('/posts/tag/'))?.getAttribute('href') || null)()`,
    'article URL');
  await navigate(cdp, sessionId, article);
  assert.deepEqual(await evaluate(cdp, sessionId, `({
    canvas: document.querySelectorAll('[data-experience-canvas]').length,
    runtime: Boolean(window.__jjoRendererRuntime),
    core: document.querySelectorAll('[data-renderer-core]').length,
  })`), { canvas: 0, runtime: false, core: 0 });
  console.log('browser-smoke: PASS article renderer isolation');
}

const anchorsExpression = `(() => {
  const visible = (node) => {
    if (node.classList.contains('sr-only')) return false;
    const s = getComputedStyle(node), r = node.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0 && r.width > 1 && r.height > 1;
  };
  return [...document.querySelectorAll('a[href]')].filter(visible).map((a, index) => ({
    index, href: a.getAttribute('href'), absolute: a.href,
    text: (a.textContent || '').replace(/\\s+/g, ' ').trim(), aria: a.getAttribute('aria-label') || '',
    target: a.getAttribute('target') || '', rel: a.getAttribute('rel') || '',
    download: a.hasAttribute('download'), brand: a.hasAttribute('data-site-brand'),
    breadcrumb: a.closest('[aria-label="Breadcrumb"]') !== null,
  }));
})()`;

function explicitHome(a) {
  return a.brand || a.breadcrumb || /\bhome\b/i.test(`${a.text} ${a.aria}`);
}

async function auditLinks(cdp, sessionId, route) {
  await navigate(cdp, sessionId, route);
  const anchors = await evaluate(cdp, sessionId, anchorsExpression);
  let clicked = 0;
  for (let index = 0; index < anchors.length; index += 1) {
    const a = anchors[index];
    assert.ok(a.href, `${route} link ${index}: empty href`);
    assert.equal(/^javascript:/i.test(a.href), false);
    const expected = new URL(a.absolute), origin = new URL(BASE).origin;
    const http = ['http:', 'https:'].includes(expected.protocol);
    const internal = http && expected.origin === origin && !a.download && (!a.target || a.target === '_self');
    if (!internal) {
      if (http && a.target === '_blank') assert.ok(/noopener|noreferrer/.test(a.rel));
      else if (http && expected.origin !== origin) {
        assert.equal(a.target, '_blank');
        assert.ok(/noopener|noreferrer/.test(a.rel));
      }
      continue;
    }
    if (expected.pathname === '/') assert.ok(explicitHome(a), `${route}: unexpected Home target (${a.text || a.aria})`);
    await navigate(cdp, sessionId, route);
    const present = await evaluate(cdp, sessionId, `(() => {
      const visible = (node) => { const s = getComputedStyle(node), r = node.getBoundingClientRect();
        return !node.classList.contains('sr-only') && s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0 && r.width > 1 && r.height > 1; };
      const a = [...document.querySelectorAll('a[href]')].filter(visible)[${index}];
      if (!a) return false; a.click(); return true;
    })()`);
    assert.equal(present, true);
    await waitExpression(cdp, sessionId,
      `location.pathname === ${JSON.stringify(expected.pathname)} &&
       location.search === ${JSON.stringify(expected.search)} && location.hash === ${JSON.stringify(expected.hash)}`,
      `${route} click ${a.text || a.aria || a.href}`);
    const actual = await evaluate(cdp, sessionId, `location.pathname + location.search + location.hash`);
    assert.equal(actual, `${expected.pathname}${expected.search}${expected.hash}`);
    if (expected.pathname !== '/') assert.notEqual(actual, '/', `${route}: click fell back to Home`);
    if (expected.hash) assert.equal(await evaluate(cdp, sessionId,
      `Boolean(document.getElementById(decodeURIComponent(location.hash.slice(1))))`), true);
    clicked += 1;
  }
  console.log(`browser-smoke: PASS ${route} visible-link routing (${clicked} internal clicks)`);
  return clicked;
}

async function auditSearch(cdp, sessionId) {
  await navigate(cdp, sessionId, '/');
  await evaluate(cdp, sessionId, `document.querySelector('button[aria-label="Search"]')?.click()`);
  await waitExpression(cdp, sessionId,
    `Boolean(document.querySelector('input[placeholder^="Search post"]'))`, 'search dialog open');
  assert.equal(await evaluate(cdp, sessionId, `location.pathname`), '/');
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' }, sessionId);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' }, sessionId);
  await waitExpression(cdp, sessionId,
    `!document.querySelector('input[placeholder^="Search post"]')`, 'search dialog Escape close');
  await evaluate(cdp, sessionId, `document.querySelector('button[aria-label="Search"]')?.click()`);
  const sample = await evaluate(cdp, sessionId,
    `fetch('/api/search.json').then((r) => r.json()).then((x) => ({ id: x[0].id, title: x[0].data.title }))`);
  assert.ok(sample?.id && sample?.title);
  await waitExpression(cdp, sessionId,
    `Boolean(document.querySelector('input[placeholder^="Search post"]'))`, 'search dialog reopen');
  await evaluate(cdp, sessionId, `(() => {
    const input = document.querySelector('input[placeholder^="Search post"]');
    input.value = ${JSON.stringify(sample.title)};
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ${JSON.stringify(sample.title)} }));
  })()`);
  const href = `/posts/${sample.id}`;
  await waitExpression(cdp, sessionId,
    `Boolean(document.querySelector(${JSON.stringify(`a[href="${href}"]`)}))`, 'search result');
  await evaluate(cdp, sessionId,
    `document.querySelector(${JSON.stringify(`a[href="${href}"]`)})?.click()`);
  await waitExpression(cdp, sessionId, `location.pathname === ${JSON.stringify(href)}`, 'search result navigation');
  assert.notEqual(await evaluate(cdp, sessionId, `location.pathname`), '/');
  console.log('browser-smoke: PASS Search open/Escape/result click routing');
}

async function auditTheme(cdp, sessionId) {
  await navigate(cdp, sessionId, '/about');
  for (const name of ['Dark', 'Light', 'System']) {
    await evaluate(cdp, sessionId, `document.querySelector('button[aria-label="Theme Menu"]')?.click()`);
    await waitExpression(cdp, sessionId,
      `[...document.querySelectorAll('button')].some((b) => b.textContent.trim() === ${JSON.stringify(name)})`,
      `theme option ${name}`);
    await evaluate(cdp, sessionId,
      `[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === ${JSON.stringify(name)})?.click()`);
    await waitExpression(cdp, sessionId,
      `localStorage.getItem('theme') === ${JSON.stringify(name.toLowerCase())}`, `theme ${name}`);
    assert.equal(await evaluate(cdp, sessionId, `location.pathname`), '/about');
    assert.equal(await evaluate(cdp, sessionId,
      `document.documentElement.classList.contains('dark')`), name === 'Dark');
  }
  console.log('browser-smoke: PASS Theme controls preserve route and apply Light/Dark/System');
}

async function auditAboutFont(cdp, sessionId) {
  await navigate(cdp, sessionId, '/about');
  const m = await waitExpression(cdp, sessionId, `document.fonts.ready.then(() => {
    const t = document.querySelector('[data-about-title]'), c = document.querySelector('[data-about-content]');
    const p = c?.querySelector('p'), h = c?.querySelector('h2');
    if (!t || !c || !p || !h) return null;
    const nodes = [t, c, p, h];
    return { families: nodes.map((n) => getComputedStyle(n).fontFamily),
      weight: Number(getComputedStyle(t).fontWeight),
      overflow: document.documentElement.scrollWidth > innerWidth + 1 };
  })`, 'About typography metrics');
  assert.equal(new Set(m.families).size, 1, `mixed About fonts: ${m.families.join(' | ')}`);
  assert.equal(m.families[0].toLowerCase().includes('outfit'), false);
  assert.match(m.families[0], /Noto Sans KR|Apple SD Gothic Neo|Malgun Gothic/i);
  assert.ok(m.weight >= 700);
  assert.equal(m.overflow, false);
  console.log(`browser-smoke: PASS About unified Korean typography (${m.families[0]})`);
}

export async function auditInteractions(cdp, sessionId) {
  await viewport(cdp, sessionId, { width: 1440, height: 900 });
  let clicks = 0;
  for (const route of CORE_ROUTES) clicks += await auditLinks(cdp, sessionId, route);
  assert.ok(clicks >= 30, `too few internal controls audited: ${clicks}`);
  await auditSearch(cdp, sessionId);
  await auditTheme(cdp, sessionId);
  await auditAboutFont(cdp, sessionId);
  return clicks;
}

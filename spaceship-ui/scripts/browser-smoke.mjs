import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

// Fail-closed contract cases: Home card to shared state synchronization;
// Research SVG focus synchronization.
const HOST = '127.0.0.1';
const PORT = Number(process.env.JJO_SMOKE_PORT || 4321);
const BASE = process.env.JJO_SMOKE_BASE_URL || `http://${HOST}:${PORT}`;
const DEBUG_PORT = Number(process.env.JJO_SMOKE_DEBUG_PORT || 9222);
const REQUIRE_GPU = process.env.JJO_SMOKE_REQUIRE_GPU === '1';
const TIMEOUT = 20_000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function executable(candidates) {
  for (const item of candidates) {
    if (item.includes(path.sep) && fs.existsSync(item)) return item;
    const found = spawnSync('sh', ['-lc', `command -v ${item}`], { encoding: 'utf8' });
    if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
  }
  return null;
}

async function poll(fn, label, timeout = TIMEOUT) {
  const start = Date.now();
  let value;
  while (Date.now() - start < timeout) {
    value = await fn();
    if (value) return value;
    await sleep(100);
  }
  throw new Error(`Timed out: ${label}; last=${JSON.stringify(value)}`);
}

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${message.error.message} (${message.error.code})`));
      else pending.resolve(message.result || {});
    });
  }

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP open timeout')), TIMEOUT);
      socket.addEventListener('open', () => {
        clearTimeout(timer);
        resolve();
      });
      socket.addEventListener('error', () => {
        clearTimeout(timer);
        reject(new Error('CDP open error'));
      });
    });
    return new Cdp(socket);
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, TIMEOUT);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      this.socket.send(JSON.stringify(payload));
    });
  }

  close() {
    this.socket.close();
  }
}

async function startPreview() {
  if (process.env.JJO_SMOKE_BASE_URL) return null;
  const child = spawn('pnpm', ['preview', '--host', HOST, '--port', String(PORT)], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr.on('data', (chunk) => {
    output += chunk;
  });
  await poll(async () => {
    try {
      return (await fetch(`${BASE}/`)).status < 500;
    } catch {
      return false;
    }
  }, `preview ${BASE}`);
  child.on('exit', (code) => {
    if (code && code !== 0) process.stderr.write(`preview exited ${code}\n${output}\n`);
  });
  return child;
}

async function startChrome() {
  const chrome =
    process.env.CHROME_PATH ||
    executable([
      'google-chrome-stable',
      'google-chrome',
      'chromium',
      'chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
    ]);
  if (!chrome) throw new Error('Chrome/Chromium not found');

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'jjo-smoke-'));
  const child = spawn(
    chrome,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-networking',
      '--disable-extensions',
      '--disable-sync',
      '--mute-audio',
      '--no-first-run',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  const info = await poll(async () => {
    try {
      const response = await fetch(`http://${HOST}:${DEBUG_PORT}/json/version`);
      return response.ok ? response.json() : null;
    } catch {
      return null;
    }
  }, 'Chrome DevTools endpoint');
  if (!info.webSocketDebuggerUrl) throw new Error(`No DevTools URL\n${stderr}`);
  return { child, profile, url: info.webSocketDebuggerUrl };
}

async function attach(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Target.activateTarget', { targetId });
  await cdp.send('Page.bringToFront', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send(
    'Page.addScriptToEvaluateOnNewDocument',
    { source: `try { localStorage.setItem('theme', 'light'); } catch {}` },
    sessionId,
  );
  return { targetId, sessionId };
}

async function evaluate(cdp, sessionId, expression) {
  const result = await cdp.send(
    'Runtime.evaluate',
    {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    },
    sessionId,
  );
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result?.value;
}

async function viewport(cdp, sessionId, options) {
  const { width, height, mobile = false, touch = false, reduced = false } = options;
  await cdp.send(
    'Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: 1, mobile },
    sessionId,
  );
  await cdp.send(
    'Emulation.setTouchEmulationEnabled',
    { enabled: touch, maxTouchPoints: touch ? 5 : 1 },
    sessionId,
  );
  await cdp.send(
    'Emulation.setEmulatedMedia',
    {
      media: '',
      features: [
        { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
        { name: 'prefers-color-scheme', value: 'light' },
      ],
    },
    sessionId,
  );
}

async function navigate(cdp, sessionId, pathname) {
  const url = `${BASE}${pathname}`;
  const result = await cdp.send('Page.navigate', { url }, sessionId);
  if (result.errorText) throw new Error(`Navigation ${url}: ${result.errorText}`);
  await poll(
    () =>
      evaluate(
        cdp,
        sessionId,
        `location.href.startsWith(${JSON.stringify(url)}) && document.readyState === 'complete'`,
      ),
    `navigation ${pathname}`,
  );
  await sleep(300);
}

async function waitExpression(cdp, sessionId, expression, label, timeout = TIMEOUT) {
  return poll(() => evaluate(cdp, sessionId, expression), label, timeout);
}

async function optionalExpression(cdp, sessionId, expression, timeout = 4_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(cdp, sessionId, expression)) return true;
    await sleep(100);
  }
  return false;
}

async function waitMotionReady(cdp, sessionId, label) {
  await waitExpression(
    cdp,
    sessionId,
    `document.querySelector('[data-experience-page]')?.hasAttribute('data-motion-ready') === true`,
    `${label} motion runtime ready`,
  );
}

async function activateNode(cdp, sessionId, selector, index, label) {
  await waitMotionReady(cdp, sessionId, label);
  const activation = await evaluate(
    cdp,
    sessionId,
    `(() => {
      const nodes = [...document.querySelectorAll(${JSON.stringify(selector)})];
      const node = nodes[${index}];
      if (!node) return null;
      window.__jjoSmokeState = null;
      if (!window.__jjoSmokeListenerInstalled) {
        addEventListener('jjo:experience-state', (event) => {
          window.__jjoSmokeState = event.detail;
        });
        window.__jjoSmokeListenerInstalled = true;
      }
      window.focus();
      node.focus({ preventScroll: true });
      const focusable = node.matches('a[href]') && node.getAttribute('tabindex') === '0';
      const href = node.getAttribute('href');
      node.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
      node.dispatchEvent(new PointerEvent('pointerenter'));
      return { id: node.getAttribute('data-constellation-node'), focusable, href };
    })()`,
  );
  assert.ok(activation?.id, `${label}: canonical node missing`);
  assert.equal(activation.focusable, true, `${label}: node is not an explicit focusable link`);
  assert.ok(activation.href, `${label}: focusable link has no href`);

  await waitExpression(
    cdp,
    sessionId,
    `window.__jjoSmokeState?.activeResearchNode === ${JSON.stringify(activation.id)} &&
      document.querySelector('[data-constellation-node][data-active]')?.getAttribute('data-constellation-node') === ${JSON.stringify(activation.id)}`,
    `${label} shared-state and DOM synchronization`,
  );
  return activation.id;
}

function assertHeader(metrics, label) {
  assert.ok(metrics.left >= 20, `${label}: brand left inset ${metrics.left}px`);
  assert.equal(metrics.clipped, false, `${label}: brand clipped`);
  assert.equal(metrics.overflow, false, `${label}: horizontal overflow`);
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

async function main() {
  let preview;
  let chrome;
  let cdp;
  try {
    preview = await startPreview();
    chrome = await startChrome();
    cdp = await Cdp.connect(chrome.url);
    const { sessionId } = await attach(cdp);

    // Desktop Home/header/overlay/card synchronization.
    await viewport(cdp, sessionId, { width: 1440, height: 900 });
    await navigate(cdp, sessionId, '/');
    const home = await waitExpression(
      cdp,
      sessionId,
      `(() => {
        const brand = document.querySelector('[data-site-brand]');
        const stage = document.querySelector('.experience-visual-stage');
        const overlays = [...document.querySelectorAll('.experience-stage-index,.experience-stage-caption,.experience-orbit-label')];
        if (!brand || !stage || overlays.length !== 5) return null;
        const b = brand.getBoundingClientRect();
        const s = stage.getBoundingClientRect();
        return {
          left: b.left,
          clipped: brand.scrollWidth > brand.clientWidth + 1,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          positions: overlays.map((node) => getComputedStyle(node).position),
          inside: overlays.every((node) => {
            const r = node.getBoundingClientRect();
            return r.left >= s.left - 1 && r.right <= s.right + 1 && r.top >= s.top - 1 && r.bottom <= s.bottom + 1;
          }),
        };
      })()`,
      'desktop header and overlays',
    );
    assertHeader(home, 'desktop');
    assert.ok(
      home.positions.every((value) => value === 'absolute'),
      `overlayPositions=${home.positions}`,
    );
    assert.equal(home.inside, true, 'Home overlay escaped stage');
    await activateNode(cdp, sessionId, '[data-constellation-node]', 0, 'Home card');

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
        `(() => {
          const host = document.querySelector('[data-experience-canvas="home"]');
          return host?.dataset.rendererTier === 'safe' && !host.dataset.rendererCore;
        })()`,
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

    // Research state/RAF/theme matrix.
    await navigate(cdp, sessionId, '/research');
    await waitMotionReady(cdp, sessionId, 'Research');
    const ids = await evaluate(
      cdp,
      sessionId,
      `[...document.querySelectorAll('[data-research-section]')].map((node) => node.dataset.researchSection)`,
    );
    assert.equal(ids.length, 4, `canonical IDs=${ids.length}`);
    const focusedId = await activateNode(
      cdp,
      sessionId,
      '[data-constellation-node]',
      1,
      'Research SVG focus',
    );
    assert.equal(focusedId, ids[1], 'Research SVG order differs from canonical section order');

    await evaluate(
      cdp,
      sessionId,
      `document.getElementById(${JSON.stringify(ids[2])})?.scrollIntoView({ block: 'center' })`,
    );
    await waitExpression(
      cdp,
      sessionId,
      `window.__jjoSmokeState?.activeResearchNode === ${JSON.stringify(ids[2])} &&
        document.querySelector('[data-constellation-node][data-active]')?.getAttribute('data-constellation-node') === ${JSON.stringify(ids[2])}`,
      'Research section scroll synchronization',
    );

    const researchGpu = await optionalExpression(
      cdp,
      sessionId,
      `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererStatus === 'active'`,
    );
    if (researchGpu) {
      await waitExpression(
        cdp,
        sessionId,
        `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererLoop === 'running'`,
        'Research RAF running',
      );
      await evaluate(cdp, sessionId, `scrollTo(0, document.documentElement.scrollHeight)`);
      await waitExpression(
        cdp,
        sessionId,
        `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererLoop === 'stopped'`,
        'offscreen RAF stop',
      );
      await evaluate(cdp, sessionId, `scrollTo(0, 0)`);
      await waitExpression(
        cdp,
        sessionId,
        `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererLoop === 'running'`,
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
        `document.querySelector('[data-experience-canvas="research"]')?.dataset.rendererTheme !== ${JSON.stringify(before)}`,
        'renderer theme palette refresh',
      );
      await lazyRetry(cdp);
    }
    console.log('browser-smoke: PASS Research state/RAF/theme matrix');

    // Narrow fine-pointer SAFE parity.
    await viewport(cdp, sessionId, { width: 680, height: 820 });
    await navigate(cdp, sessionId, '/');
    await waitExpression(
      cdp,
      sessionId,
      `(() => {
        const host = document.querySelector('[data-experience-canvas="home"]');
        return host?.dataset.rendererTier === 'safe' && !host.dataset.rendererCore;
      })()`,
      'narrow viewport SAFE tier',
    );
    console.log('browser-smoke: PASS narrow fine-pointer SAFE parity');

    // Mobile SAFE/header matrix.
    await viewport(cdp, sessionId, { width: 390, height: 844, mobile: true, touch: true });
    await navigate(cdp, sessionId, '/');
    const mobile = await waitExpression(
      cdp,
      sessionId,
      `(() => {
        const brand = document.querySelector('[data-site-brand]');
        const host = document.querySelector('[data-experience-canvas="home"]');
        if (!brand || !host || !host.dataset.rendererTier) return null;
        const b = brand.getBoundingClientRect();
        return {
          left: b.left,
          clipped: brand.scrollWidth > brand.clientWidth + 1,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          coarse: matchMedia('(pointer: coarse)').matches,
          tier: host.dataset.rendererTier,
          core: host.dataset.rendererCore || null,
          display: getComputedStyle(host).display,
        };
      })()`,
      'mobile SAFE/header metrics',
    );
    assertHeader(mobile, 'mobile');
    assert.equal(mobile.coarse, true);
    assert.equal(mobile.tier, 'safe');
    assert.equal(mobile.core, null);
    assert.equal(mobile.display, 'none');
    console.log('browser-smoke: PASS mobile SAFE/header matrix');

    // Wide coarse-pointer SAFE parity.
    await viewport(cdp, sessionId, { width: 1024, height: 768, mobile: true, touch: true });
    await navigate(cdp, sessionId, '/');
    await waitExpression(
      cdp,
      sessionId,
      `(() => {
        const host = document.querySelector('[data-experience-canvas="home"]');
        return matchMedia('(pointer: coarse)').matches && host?.dataset.rendererTier === 'safe' && !host.dataset.rendererCore;
      })()`,
      'wide coarse-pointer SAFE tier',
    );
    console.log('browser-smoke: PASS wide coarse-pointer SAFE parity');

    // Reduced-motion SAFE parity.
    await viewport(cdp, sessionId, { width: 1440, height: 900, reduced: true });
    await navigate(cdp, sessionId, '/');
    await waitExpression(
      cdp,
      sessionId,
      `(() => {
        const host = document.querySelector('[data-experience-canvas="home"]');
        const root = document.querySelector('[data-experience-page]');
        return matchMedia('(prefers-reduced-motion: reduce)').matches &&
          host?.dataset.rendererTier === 'safe' &&
          !host.dataset.rendererCore &&
          root?.dataset.motionMode === 'reduced';
      })()`,
      'reduced-motion SAFE tier',
    );
    console.log('browser-smoke: PASS reduced-motion SAFE parity');

    // Article renderer isolation.
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
      await evaluate(
        cdp,
        sessionId,
        `({
          canvas: document.querySelectorAll('[data-experience-canvas]').length,
          runtime: Boolean(window.__jjoRendererRuntime),
          core: document.querySelectorAll('[data-renderer-core]').length,
        })`,
      ),
      { canvas: 0, runtime: false, core: 0 },
    );
    console.log('browser-smoke: PASS article renderer isolation');
    console.log('browser-smoke: PASS complete matrix');
  } finally {
    cdp?.close();
    chrome?.child.kill('SIGKILL');
    preview?.kill('SIGTERM');
    if (chrome?.profile) {
      try {
        fs.rmSync(chrome.profile, { recursive: true, force: true, maxRetries: 3 });
      } catch {}
    }
  }
}

main().catch((error) => {
  console.error('browser-smoke: FAIL');
  console.error(error?.stack || error);
  process.exitCode = 1;
});

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { spawn, spawnSync } from 'node:child_process';

export const HOST = '127.0.0.1';
export const PORT = Number(process.env.JJO_SMOKE_PORT || 4321);
export const BASE = process.env.JJO_SMOKE_BASE_URL || `http://${HOST}:${PORT}`;
export const DEBUG_PORT = Number(process.env.JJO_SMOKE_DEBUG_PORT || 9222);
export const REQUIRE_GPU = process.env.JJO_SMOKE_REQUIRE_GPU === '1';
export const TIMEOUT = 20_000;
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let reducedMotionOverride = null;

export function setReducedMotionOverride(value) {
  reducedMotionOverride = value;
}

export async function poll(fn, label, timeout = TIMEOUT) {
  const started = Date.now();
  let value;
  while (Date.now() - started < timeout) {
    value = await fn();
    if (value) return value;
    await sleep(100);
  }
  throw new Error(`Timed out: ${label}; last=${JSON.stringify(value)}`);
}

function executable(candidates) {
  for (const item of candidates) {
    if (item.includes(path.sep) && fs.existsSync(item)) return item;
    const found = spawnSync('sh', ['-lc', `command -v ${item}`], { encoding: 'utf8' });
    if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
  }
  return null;
}

export class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(String(data));
      const pending = message.id ? this.pending.get(message.id) : null;
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

export async function startPreview() {
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
  child.on('exit', (code) => {
    if (code && code !== 0) process.stderr.write(`preview exited ${code}\n${output}\n`);
  });
  await poll(async () => {
    try {
      return (await fetch(`${BASE}/`)).status < 500;
    } catch {
      return false;
    }
  }, `preview ${BASE}`);
  return child;
}

export async function startChrome() {
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

export async function stopChild(child, signal = 'SIGTERM') {
  if (!child || child.exitCode !== null) return;
  child.kill(signal);
  await Promise.race([once(child, 'exit'), sleep(1_500)]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

export async function attach(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Target.activateTarget', { targetId });
  await cdp.send('Page.bringToFront', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `
        try { localStorage.setItem('theme', 'light'); } catch {}
        if (typeof SVGAElement !== 'undefined' && typeof SVGAElement.prototype.click !== 'function') {
          Object.defineProperty(SVGAElement.prototype, 'click', {
            configurable: true,
            value() {
              this.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                composed: true,
                view: window,
              }));
            },
          });
        }
      `,
    },
    sessionId,
  );
  return { targetId, sessionId };
}

export async function evaluate(cdp, sessionId, expression) {
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

export async function viewport(cdp, sessionId, options) {
  const { width, height, mobile = false, touch = false, reduced = false } = options;
  const effectiveReduced = reducedMotionOverride ?? reduced;
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
        {
          name: 'prefers-reduced-motion',
          value: effectiveReduced ? 'reduce' : 'no-preference',
        },
        { name: 'prefers-color-scheme', value: 'light' },
      ],
    },
    sessionId,
  );
}

export async function navigate(cdp, sessionId, pathname) {
  const url = new URL(pathname, BASE);
  const result = await cdp.send('Page.navigate', { url: url.href }, sessionId);
  if (result.errorText) throw new Error(`Navigation ${url.href}: ${result.errorText}`);

  // Prefix matching is unsafe for `/`: every same-origin path starts with the
  // Home URL. Wait for the exact origin/path/query/hash so a preceding route
  // can never be mistaken for a completed Home navigation.
  await poll(
    () =>
      evaluate(
        cdp,
        sessionId,
        `location.origin === ${JSON.stringify(url.origin)} &&
         location.pathname === ${JSON.stringify(url.pathname)} &&
         location.search === ${JSON.stringify(url.search)} &&
         location.hash === ${JSON.stringify(url.hash)} &&
         document.readyState === 'complete'`,
      ),
    `navigation ${pathname}`,
  );
  await sleep(250);
}

export const waitExpression = (cdp, sessionId, expression, label, timeout = TIMEOUT) =>
  poll(() => evaluate(cdp, sessionId, expression), label, timeout);

export async function optionalExpression(cdp, sessionId, expression, timeout = 6_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(cdp, sessionId, expression)) return true;
    await sleep(100);
  }
  return false;
}

export function removeProfile(profile) {
  if (!profile) return;
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

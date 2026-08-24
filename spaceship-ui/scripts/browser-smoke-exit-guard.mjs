// Loaded by Blog CI before the browser smoke entrypoint. The harness intentionally owns
// browser/server child processes, so the final semantic marker is authoritative.
// This guard also gives rebased PR runs a deterministic upper bound.
const SUCCESS_MARKER = 'browser-smoke: PASS complete matrix';
const FAILURE_MARKER = 'browser-smoke: FAIL';
const MAX_RUNTIME_MS = Number(process.env.JJO_SMOKE_MAX_RUNTIME_MS || 240_000);
const LIVE_BASE_URL = process.env.JJO_SMOKE_BASE_URL?.trim().replace(/\/+$/, '') || '';
const LIVE_HEAD_RETRY_ATTEMPTS = 4;
const LIVE_HEAD_RETRY_BASE_DELAY_MS = 300;

const originalLog = console.log.bind(console);
const originalError = console.error.bind(console);
const nativeFetch = globalThis.fetch.bind(globalThis);
let finishing = false;

function requestMethod(input, init) {
  if (init?.method) return String(init.method).toUpperCase();
  if (typeof Request !== 'undefined' && input instanceof Request) return input.method.toUpperCase();
  return 'GET';
}

function requestUrl(input) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  if (typeof Request !== 'undefined' && input instanceof Request) return input.url;
  return String(input);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// GitHub Pages can sporadically return a single 503 when the live smoke bursts
// through the Writing archive's many same-origin HEAD probes. Retry only that
// remote HEAD/5xx transport surface. A real 4xx is never retried, and a 5xx or
// network error that persists through the bounded attempts still fails closed.
if (LIVE_BASE_URL.startsWith('https://')) {
  const liveOrigin = new URL(LIVE_BASE_URL).origin;

  globalThis.fetch = async (input, init = undefined) => {
    const method = requestMethod(input, init);
    const url = requestUrl(input);
    let origin = null;
    try {
      origin = new URL(url, LIVE_BASE_URL).origin;
    } catch {
      return nativeFetch(input, init);
    }

    if (method !== 'HEAD' || origin !== liveOrigin) return nativeFetch(input, init);

    let lastError;
    for (let attempt = 1; attempt <= LIVE_HEAD_RETRY_ATTEMPTS; attempt += 1) {
      try {
        const response = await nativeFetch(input, init);
        const retryable = response.status >= 500 && response.status <= 599;
        if (!retryable || attempt === LIVE_HEAD_RETRY_ATTEMPTS) return response;
        originalLog(
          `browser-smoke: RETRY live HEAD ${url} after status=${response.status} ` +
            `(${attempt}/${LIVE_HEAD_RETRY_ATTEMPTS})`,
        );
      } catch (error) {
        lastError = error;
        if (attempt === LIVE_HEAD_RETRY_ATTEMPTS) throw error;
        originalLog(
          `browser-smoke: RETRY live HEAD ${url} after network error ` +
            `(${attempt}/${LIVE_HEAD_RETRY_ATTEMPTS})`,
        );
      }

      await wait(LIVE_HEAD_RETRY_BASE_DELAY_MS * attempt);
    }

    throw lastError ?? new Error(`live HEAD retry exhausted: ${url}`);
  };
}

function finish(code) {
  if (finishing) return;
  finishing = true;
  clearTimeout(deadline);
  setTimeout(() => process.exit(code), code === 0 ? 0 : 75);
}

console.log = (...args) => {
  originalLog(...args);
  if (args.map(String).join(' ').includes(SUCCESS_MARKER)) finish(0);
};

console.error = (...args) => {
  originalError(...args);
  if (args.map(String).join(' ').includes(FAILURE_MARKER)) finish(1);
};

const deadline = setTimeout(() => {
  originalError(`browser-smoke: FAIL — exceeded ${MAX_RUNTIME_MS} ms hard timeout`);
  finish(1);
}, MAX_RUNTIME_MS);

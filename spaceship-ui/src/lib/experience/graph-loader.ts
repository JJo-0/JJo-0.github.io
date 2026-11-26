// The initial document paints the static map. Fetch and mount once it enters
// the viewport, after the page load and an idle opportunity. No explore click.
let host: HTMLElement | null = null;
let dispose: (() => void) | undefined;

function cleanup() {
  dispose?.();
  dispose = undefined;
  host = null;
}

function init() {
  const next = document.querySelector<HTMLElement>('[data-experience-canvas]');
  if (next === host) return;
  cleanup();
  if (!next) return;
  host = next;
  const canvas = next.querySelector<HTMLCanvasElement>('[data-ascii-art]');
  if (!canvas) return;
  if (next.dataset.asciiGraph !== 'true') {
    let cancelled = false;
    let stop: (() => void) | undefined;
    void import('./ascii-art').then(({ installCanvas }) => {
      if (!cancelled && next.isConnected) stop = installCanvas(next, canvas);
    }).catch(console.warn);
    dispose = () => { cancelled = true; stop?.(); };
    return;
  }
  const trigger = next.querySelector<HTMLButtonElement>('[data-graph-activate]');
  const message = next.querySelector<HTMLElement>('[data-graph-message]');
  const controls = next.querySelector<HTMLElement>('[data-graph-view-controls]');
  const url = next.dataset.graphUrl;
  if (!trigger || !url) return;
  const abort = new AbortController();
  let stop: (() => void) | undefined;
  let pending = false, mounted = false, inView = false;
  let cancelIdle: (() => void) | undefined;
  const activate = async () => {
    if (pending || mounted || abort.signal.aborted) return;
    pending = true;
    next.dataset.graphState = 'loading';
    next.setAttribute('aria-busy', 'true');
    trigger.setAttribute('aria-disabled', 'true');
    if (message) message.textContent = trigger.dataset.loadingLabel ?? 'Loading map…';
    const request = new AbortController();
    const cancel = () => request.abort();
    abort.signal.addEventListener('abort', cancel, { once: true });
    const timeout = window.setTimeout(cancel, 15000);
    try {
      const [response, runtime] = await Promise.all([
        fetch(url, { signal: request.signal, credentials: 'same-origin' }),
        import('./ascii-art'),
      ]);
      if (!response.ok) throw new Error('Graph request failed: ' + response.status);
      const payload = await response.text();
      if (abort.signal.aborted || !next.isConnected) return;
      if (request.signal.aborted) throw new Error('Graph request timed out');
      stop = runtime.mountWritingGraph(next, canvas, payload, () => {
        next.dataset.graphState = 'ready';
        next.removeAttribute('aria-busy');
        if (controls) controls.hidden = false;
        if (message) message.textContent = message.dataset.readyLabel ?? 'Map ready';
        if (document.activeElement === trigger) {
          next.querySelector<HTMLElement>('[data-post-graph-node]')?.focus({ preventScroll: true });
        }
        trigger.hidden = true;
      });
      mounted = true;
    } catch (error) {
      if (abort.signal.aborted) return;
      stop?.();
      next.dataset.graphState = 'error';
      next.removeAttribute('aria-busy');
      trigger.textContent = trigger.dataset.retryLabel ?? 'Retry map';
      trigger.hidden = false;
      if (message) message.textContent = message.dataset.errorLabel ?? 'Map unavailable.';
      console.warn('Writing graph activation failed', error);
    } finally {
      clearTimeout(timeout);
      abort.signal.removeEventListener('abort', cancel);
      pending = false;
      trigger.removeAttribute('aria-disabled');
    }
  };
  const eligible = () => inView && !document.hidden && document.readyState === 'complete' &&
    next.dataset.graphState === 'preview' && !abort.signal.aborted;
  const schedule = () => {
    if (!eligible() || cancelIdle) return;
    const run = () => {
      cancelIdle = undefined;
      if (eligible()) void activate();
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 1200 });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(run, 100);
      cancelIdle = () => clearTimeout(id);
    }
  };
  const observer = new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting);
    next.dataset.graphInView = String(inView);
    if (inView) schedule();
    else { cancelIdle?.(); cancelIdle = undefined; }
  }, { rootMargin: '0px' });
  const retry = () => { if (next.dataset.graphState === 'error') void activate(); };
  observer.observe(next);
  window.addEventListener('load', schedule, { once: true });
  document.addEventListener('visibilitychange', schedule);
  trigger.addEventListener('click', retry);
  dispose = () => {
    abort.abort();
    cancelIdle?.();
    observer.disconnect();
    stop?.();
    window.removeEventListener('load', schedule);
    document.removeEventListener('visibilitychange', schedule);
    trigger.removeEventListener('click', retry);
  };
}

let installed = false;
export function installGraphLoader() {
  if (installed) return;
  installed = true;
  document.addEventListener('astro:before-swap', cleanup);
  document.addEventListener('astro:page-load', init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}

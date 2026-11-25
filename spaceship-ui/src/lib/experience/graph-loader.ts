// The first page render only needs the static preview and this small loader.
// Full graph data and the Canvas runtime are requested on explicit activation.
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
  const trigger = next.querySelector<HTMLAnchorElement>('[data-graph-activate]');
  const message = next.querySelector<HTMLElement>('[data-graph-message]');
  const url = next.dataset.graphUrl;
  if (!trigger || !url) return;
  const abort = new AbortController();
  let stop: (() => void) | undefined;
  let pending = false;
  let mounted = false;
  const activate = async (event: MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (pending || mounted) return;
    pending = true;
    next.dataset.graphState = 'loading';
    next.setAttribute('aria-busy', 'true');
    trigger.textContent = trigger.dataset.loadingLabel ?? 'Loading map…';
    trigger.setAttribute('aria-disabled', 'true');
    if (message) message.textContent = '';
    try {
      const [response, runtime] = await Promise.all([
        fetch(url, { signal: abort.signal, credentials: 'same-origin' }),
        import('./ascii-art'),
      ]);
      if (!response.ok) throw new Error('Graph request failed: ' + response.status);
      const payload = await response.text();
      if (abort.signal.aborted || !next.isConnected) return;
      stop = runtime.mountWritingGraph(next, canvas, payload, () => {
        next.dataset.graphState = 'ready';
        next.removeAttribute('aria-busy');
        if (document.activeElement === trigger) {
          next.querySelector<HTMLElement>('[data-post-graph-node]')?.focus({ preventScroll: true });
        }
      });
      mounted = true;
    } catch (error) {
      if (abort.signal.aborted) return;
      stop?.();
      next.dataset.graphState = 'error';
      next.removeAttribute('aria-busy');
      trigger.textContent = trigger.dataset.retryLabel ?? 'Retry map';
      if (message) message.textContent = message.dataset.errorLabel ?? 'Map unavailable.';
      console.warn('Writing graph activation failed', error);
    } finally {
      pending = false;
      trigger.removeAttribute('aria-disabled');
    }
  };
  trigger.addEventListener('click', activate);
  dispose = () => {
    abort.abort();
    stop?.();
    trigger.removeEventListener('click', activate);
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

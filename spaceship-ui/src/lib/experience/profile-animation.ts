// The original still frame is the default. Replay uses a fresh object URL.
let active: HTMLButtonElement | null = null;
let dispose: (() => void) | undefined;
let installed = false;

function cleanup() {
  dispose?.();
  dispose = undefined;
  active = null;
}

function init() {
  const button = document.querySelector<HTMLButtonElement>('[data-profile-animation]');
  if (button === active) return;
  cleanup();
  if (!button) return;
  const img = button.querySelector<HTMLImageElement>('img');
  const url = button.dataset.profileAnimationSrc;
  if (!img || !url) return;
  active = button;
  const still = img.getAttribute('src')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const abort = new AbortController();
  let playing = false, generation = 0, timer = 0;
  let objectUrl: string | undefined;
  let animation: Promise<Blob> | undefined;

  // IntersectionObserver notifications can lag a trusted click or an instant
  // scroll. Read the current rectangle at interaction/decode boundaries.
  function inViewport() {
    const r = button!.getBoundingClientRect();
    return button!.isConnected && r.width > 0 && r.height > 0 &&
      r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
  }
  function stop() {
    generation++;
    playing = false;
    clearTimeout(timer);
    if (img!.getAttribute('src') !== still) img!.src = still;
    img!.loading = 'lazy';
    if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = undefined; }
    button!.dataset.profileState = 'static';
  }
  function allowed() {
    return inViewport() && !document.hidden && !reduced.matches && !abort.signal.aborted;
  }
  async function play() {
    if (!allowed() || playing) return;
    const run = ++generation;
    playing = true;
    delete button!.dataset.profileError;
    button!.dataset.profileState = 'loading';
    let stage = 'fetch';
    try {
      animation ??= fetch(url!, { signal: abort.signal, credentials: 'same-origin' }).then(async response => {
        if (!response.ok) throw new Error('Profile animation request failed');
        const bytes = await response.arrayBuffer();
        const header = new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 12));
        if (header.length !== 12 || String.fromCharCode(...header.slice(0, 4)) !== 'RIFF' ||
            String.fromCharCode(...header.slice(8, 12)) !== 'WEBP') throw new Error('Invalid animation response');
        return new Blob([bytes], { type: 'image/webp' });
      }).catch(error => { animation = undefined; throw error; });
      const blob = await animation;
      if (run !== generation) return;
      if (!allowed()) { stop(); return; }
      stage = 'decode';
      objectUrl = URL.createObjectURL(blob);
      // Lazy applies to the cold still, not a user-requested animated source.
      img!.loading = 'eager';
      img!.src = objectUrl;
      await img!.decode();
      if (run !== generation) return;
      if (!allowed() || img!.currentSrc !== objectUrl || !img!.naturalWidth) { stop(); return; }
      button!.dataset.profileState = 'playing';
      timer = window.setTimeout(stop, 2370);
    } catch {
      if (run === generation) {
        button!.dataset.profileError = stage;
        stop();
      }
    }
  }
  const onEnter = () => { if (hover.matches) void play(); };
  const onClick = () => { void play(); };
  const onReduced = () => {
    button.disabled = reduced.matches;
    if (reduced.matches) stop();
  };
  const onVisibility = () => { if (document.hidden) stop(); };
  const io = new IntersectionObserver(() => {
    if (playing && !inViewport()) stop();
  }, { threshold: 0 });
  io.observe(button);
  button.addEventListener('pointerenter', onEnter);
  button.addEventListener('click', onClick);
  reduced.addEventListener('change', onReduced);
  document.addEventListener('visibilitychange', onVisibility);
  button.dataset.profileState = 'static';
  onReduced();
  dispose = () => {
    abort.abort(); stop(); io.disconnect();
    button.removeEventListener('pointerenter', onEnter);
    button.removeEventListener('click', onClick);
    reduced.removeEventListener('change', onReduced);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

export function installProfileAnimation() {
  if (installed) return;
  installed = true;
  document.addEventListener('astro:before-swap', cleanup);
  document.addEventListener('astro:page-load', init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}

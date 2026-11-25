// Decorative media is static unless the visitor explicitly interacts with it.
// Use a fresh object URL on each play so cached animated images restart.
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
  let visible = false, playing = false, generation = 0, timer = 0;
  let objectUrl: string | undefined;
  let animation: Promise<Blob> | undefined;
  let removeLoadListeners: (() => void) | undefined;

  function stop() {
    generation++;
    playing = false;
    clearTimeout(timer);
    removeLoadListeners?.();
    removeLoadListeners = undefined;
    if (img!.getAttribute('src') !== still) img!.src = still;
    if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = undefined; }
    button!.dataset.profileState = 'static';
  }
  function allowed() {
    return visible && !document.hidden && !reduced.matches && !abort.signal.aborted;
  }
  async function play() {
    if (!allowed() || playing) return;
    const run = ++generation;
    playing = true;
    button!.dataset.profileState = 'loading';
    try {
      animation ??= fetch(url!, { signal: abort.signal, credentials: 'same-origin' }).then(response => {
        if (!response.ok) throw new Error('Profile animation request failed');
        return response.blob();
      }).catch(error => { animation = undefined; throw error; });
      const blob = await animation;
      if (run !== generation || !allowed()) return;
      objectUrl = URL.createObjectURL(blob);
      const onLoad = () => {
        removeLoadListeners?.();
        removeLoadListeners = undefined;
        if (run !== generation || !allowed()) { stop(); return; }
        button!.dataset.profileState = 'playing';
        // The checked-in animated asset contains exactly one 2.27s cycle.
        timer = window.setTimeout(stop, 2370);
      };
      const onError = () => { if (run === generation) stop(); };
      img!.addEventListener('load', onLoad);
      img!.addEventListener('error', onError);
      removeLoadListeners = () => {
        img!.removeEventListener('load', onLoad);
        img!.removeEventListener('error', onError);
      };
      img!.src = objectUrl;
    } catch {
      if (run === generation) stop();
    }
  }
  const onEnter = () => { if (hover.matches) void play(); };
  const onClick = () => { void play(); };
  const onReduced = () => {
    button.disabled = reduced.matches;
    if (reduced.matches) stop();
  };
  const onVisibility = () => { if (document.hidden) stop(); };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (!visible) stop();
  }, { threshold: 0.01 });
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

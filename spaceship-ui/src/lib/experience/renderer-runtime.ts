import { detectExperienceCapability, type CapabilityProfile } from './capability';
import { experienceRouteFromPath, experienceState } from './state';
import type { RendererHandle, RendererVariant } from './renderer-core';

type RendererRuntimeHandle = {
  destroy: () => void;
};

type RendererModule = typeof import('./renderer-core');
type IdleDeadlineLike = { didTimeout: boolean; timeRemaining: () => number };
type WindowWithIdle = Window & {
  requestIdleCallback?: (
    callback: (deadline: IdleDeadlineLike) => void,
    options?: { timeout?: number }
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

declare global {
  interface Window {
    __jjoRendererRuntime?: RendererRuntimeHandle;
  }
}

const HOST_SELECTOR = '[data-experience-canvas]';
let rendererModulePromise: Promise<RendererModule> | null = null;
let rendererRetryBaseUrl: string | null = null;
let rendererRetryAttempt = 0;

function retryableRendererUrl(error: unknown): string | null {
  if (!(error instanceof Error) || typeof window === 'undefined') return null;

  const candidate = error.message.match(/https?:\/\/[^\s"'()]+\.js(?:\?[^\s"'()]*)?/i)?.[0];
  if (!candidate) return null;

  try {
    const url = new URL(candidate, window.location.href);
    const assetDirectory = new URL('.', import.meta.url);

    // Never turn an exception string into an arbitrary code-import surface.
    // Retry only the same-origin JavaScript chunk directory emitted beside
    // this runtime module.
    if (
      url.origin !== assetDirectory.origin ||
      !url.pathname.startsWith(assetDirectory.pathname) ||
      !url.pathname.endsWith('.js')
    ) {
      return null;
    }

    url.search = '';
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

function importRendererModule(): Promise<RendererModule> {
  if (rendererRetryBaseUrl) {
    const retryUrl = new URL(rendererRetryBaseUrl);
    retryUrl.searchParams.set('jjo-renderer-retry', String(++rendererRetryAttempt));

    // A browser module map can retain a failed fetch for the original URL.
    // The validated same-origin cache-busting URL gives the next route visit
    // a real recovery path without duplicating the renderer bundle.
    return import(/* @vite-ignore */ retryUrl.href) as Promise<RendererModule>;
  }

  return import('./renderer-core');
}

function loadRendererModule(): Promise<RendererModule> {
  rendererModulePromise ??= importRendererModule()
    .then((module) => {
      rendererRetryBaseUrl = null;
      rendererRetryAttempt = 0;
      return module;
    })
    .catch((error: unknown) => {
      // A transient chunk/network failure must not poison every later route
      // visit in the same browser session.
      rendererModulePromise = null;
      const retryUrl = retryableRendererUrl(error);
      if (retryUrl && retryUrl !== rendererRetryBaseUrl) {
        rendererRetryBaseUrl = retryUrl;
        rendererRetryAttempt = 0;
      }
      throw error;
    });
  return rendererModulePromise;
}

function setStatus(host: HTMLElement, status: string, label: string): void {
  host.dataset.rendererStatus = status;
  const labelElement = host.querySelector<HTMLElement>('[data-renderer-label]');
  if (labelElement) labelElement.textContent = label;
}

function replaceRendererCanvas(
  host: HTMLElement,
  expectedCanvas?: HTMLCanvasElement
): HTMLCanvasElement | null {
  const canvas =
    expectedCanvas ?? host.querySelector<HTMLCanvasElement>('[data-experience-canvas-element]');
  if (!canvas || !canvas.isConnected || canvas.parentElement !== host) return null;

  // A WebGPU/WebGL context is permanently bound to its canvas. Reusing that
  // canvas after backend teardown is browser-dependent, so every capability
  // reclassification receives a fresh context boundary.
  const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
  replacement.removeAttribute('width');
  replacement.removeAttribute('height');
  canvas.replaceWith(replacement);
  return replacement;
}

export function installExperienceRendererRuntime(): void {
  if (typeof window === 'undefined' || window.__jjoRendererRuntime) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactViewport = window.matchMedia('(max-width: 719px)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const idleWindow = window as WindowWithIdle;
  let generation = 0;
  let intersectionObserver: IntersectionObserver | null = null;
  let mountedRenderer: RendererHandle | null = null;
  let activeHost: HTMLElement | null = null;
  const cleanupCallbacks: Array<() => void> = [];
  let scheduledFrame = 0;
  let idleMountHandle = 0;
  let fallbackMountTimer = 0;

  const cancelScheduledMount = (): void => {
    if (idleMountHandle) idleWindow.cancelIdleCallback?.(idleMountHandle);
    if (fallbackMountTimer) window.clearTimeout(fallbackMountTimer);
    idleMountHandle = 0;
    fallbackMountTimer = 0;
  };

  const cleanup = (): void => {
    generation += 1;
    if (scheduledFrame) {
      window.cancelAnimationFrame(scheduledFrame);
      scheduledFrame = 0;
    }
    cancelScheduledMount();

    intersectionObserver?.disconnect();
    intersectionObserver = null;
    mountedRenderer?.destroy();
    mountedRenderer = null;

    while (cleanupCallbacks.length) cleanupCallbacks.pop()?.();

    if (activeHost) {
      if (activeHost.isConnected) replaceRendererCanvas(activeHost);
      activeHost.dataset.rendererStatus = 'idle';
      delete activeHost.dataset.rendererTier;
      delete activeHost.dataset.rendererReason;
      delete activeHost.dataset.rendererPreferredBackend;
      delete activeHost.dataset.rendererBackend;
      delete activeHost.dataset.rendererQuality;
      delete activeHost.dataset.rendererDpr;
      delete activeHost.dataset.rendererFps;
      delete activeHost.dataset.rendererTargetFps;
      delete activeHost.dataset.rendererAdaptation;
      delete activeHost.dataset.rendererLoop;
      delete activeHost.dataset.rendererTheme;
    }

    activeHost = null;
    delete document.documentElement.dataset.experienceTier;
    experienceState.resetRenderer();
  };

  const installPointerTracking = (host: HTMLElement, profile: CapabilityProfile): void => {
    if (profile.tier === 'safe' || profile.coarsePointer) return;

    const surface = host.parentElement ?? host;
    const onPointerMove = (event: PointerEvent): void => {
      const rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      experienceState.patch({
        pointer: {
          x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
          y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
        },
      });
    };
    const onPointerLeave = (): void => {
      experienceState.patch({ pointer: { x: 0, y: 0 } });
    };

    surface.addEventListener('pointermove', onPointerMove, { passive: true });
    surface.addEventListener('pointerleave', onPointerLeave, { passive: true });
    cleanupCallbacks.push(() => {
      surface.removeEventListener('pointermove', onPointerMove);
      surface.removeEventListener('pointerleave', onPointerLeave);
    });
  };

  const mountHost = async (
    host: HTMLElement,
    profile: CapabilityProfile,
    currentGeneration: number
  ): Promise<void> => {
    if (mountedRenderer || currentGeneration !== generation || !host.isConnected) return;

    const canvas = host.querySelector<HTMLCanvasElement>('[data-experience-canvas-element]');
    const variant = host.dataset.experienceCanvas as RendererVariant | undefined;
    if (!canvas || (variant !== 'home' && variant !== 'research')) {
      setStatus(host, 'error', 'SVG');
      return;
    }

    setStatus(host, 'loading', profile.backend === 'webgpu' ? 'Loading WebGPU' : 'Loading WebGL2');

    try {
      const { mountExperienceRenderer } = await loadRendererModule();
      if (currentGeneration !== generation || !host.isConnected || !canvas.isConnected) return;

      const handle = await mountExperienceRenderer({ host, canvas, profile, variant });
      if (currentGeneration !== generation || !host.isConnected || !canvas.isConnected) {
        handle.destroy();
        replaceRendererCanvas(host, canvas);
        return;
      }

      mountedRenderer = handle;
      experienceState.patch({ rendererBackend: handle.backend });
      const backendLabel = handle.backend === 'webgpu' ? 'WebGPU' : 'WebGL2';
      setStatus(host, 'active', `${backendLabel} Adaptive`);
    } catch (error) {
      if (currentGeneration !== generation || !host.isConnected || !canvas.isConnected) {
        replaceRendererCanvas(host, canvas);
        return;
      }

      console.warn('JJo Experience renderer fell back to SVG/DOM.', error);
      mountedRenderer?.destroy();
      mountedRenderer = null;
      replaceRendererCanvas(host, canvas);
      experienceState.patch({
        rendererBackend: 'none',
        tier: 'safe',
        quality: 'low',
        adaptationReason: 'renderer-init-failed',
      });
      host.dataset.rendererTier = 'safe';
      setStatus(host, 'fallback', 'SVG');
    }
  };

  const scheduleMount = (
    host: HTMLElement,
    profile: CapabilityProfile,
    currentGeneration: number
  ): void => {
    cancelScheduledMount();
    const run = (): void => {
      idleMountHandle = 0;
      fallbackMountTimer = 0;
      if (currentGeneration !== generation || !host.isConnected) return;
      void mountHost(host, profile, currentGeneration);
    };

    // First content paint and navigation stay responsive; the SVG/DOM fallback
    // remains visible while the GPU module/context is prepared in an idle slot.
    if (idleWindow.requestIdleCallback) {
      idleMountHandle = idleWindow.requestIdleCallback(() => run(), { timeout: 700 });
    } else {
      fallbackMountTimer = window.setTimeout(run, 120);
    }
  };

  const init = (): void => {
    cleanup();
    const host = document.querySelector<HTMLElement>(HOST_SELECTOR);
    if (!host) return;

    activeHost = host;
    const currentGeneration = generation;
    const profile = detectExperienceCapability();
    const route = experienceRouteFromPath(window.location.pathname);

    if (host.dataset.asciiGraph === 'true') {
      host.dataset.rendererTier = 'safe';
      host.dataset.rendererReason = 'ascii-writing-graph';
      setStatus(host, 'fallback', 'ASCII 3D');
      return;
    }

    document.documentElement.dataset.experienceTier = profile.tier;
    host.dataset.rendererTier = profile.tier;
    host.dataset.rendererReason = profile.reasons.join(',') || 'capable';
    host.dataset.rendererPreferredBackend = profile.backend;
    experienceState.patch({
      route,
      reducedMotion: profile.reducedMotion,
      tier: profile.tier,
      rendererBackend: 'none',
      webgpuAvailable: profile.webgpuAvailable,
      quality: profile.initialQuality,
      fps: 0,
      dpr: 1,
      targetFps: profile.maxFps,
      adaptationReason: 'initial',
    });

    if (profile.tier === 'safe') {
      setStatus(host, 'fallback', 'SVG');
      return;
    }

    installPointerTracking(host, profile);
    setStatus(host, 'idle', profile.backend === 'webgpu' ? 'WebGPU ready' : 'WebGL2 ready');

    if (!('IntersectionObserver' in window)) {
      scheduleMount(host, profile, currentGeneration);
      return;
    }

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        intersectionObserver?.disconnect();
        intersectionObserver = null;
        scheduleMount(host, profile, currentGeneration);
      },
      { rootMargin: '0px', threshold: 0.01 }
    );
    intersectionObserver.observe(host);
  };

  const scheduleInit = (): void => {
    if (scheduledFrame) window.cancelAnimationFrame(scheduledFrame);
    scheduledFrame = window.requestAnimationFrame(() => {
      scheduledFrame = 0;
      init();
    });
  };

  const destroy = (): void => {
    cleanup();
    document.removeEventListener('astro:page-load', scheduleInit);
    document.removeEventListener('astro:before-swap', cleanup);
    reducedMotion.removeEventListener('change', scheduleInit);
    compactViewport.removeEventListener('change', scheduleInit);
    coarsePointer.removeEventListener('change', scheduleInit);
    window.__jjoRendererRuntime = undefined;
  };

  document.addEventListener('astro:page-load', scheduleInit);
  document.addEventListener('astro:before-swap', cleanup);
  reducedMotion.addEventListener('change', scheduleInit);
  compactViewport.addEventListener('change', scheduleInit);
  coarsePointer.addEventListener('change', scheduleInit);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleInit, { once: true });
  } else {
    scheduleInit();
  }

  window.__jjoRendererRuntime = { destroy };
}

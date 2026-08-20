import { detectExperienceCapability, type CapabilityProfile } from './capability';
import { experienceRouteFromPath, experienceState } from './state';
import type { RendererHandle, RendererVariant } from './renderer-core';

type RendererRuntimeHandle = {
  destroy: () => void;
};

declare global {
  interface Window {
    __jjoRendererRuntime?: RendererRuntimeHandle;
  }
}

const HOST_SELECTOR = '[data-experience-canvas]';
let rendererModulePromise: Promise<typeof import('./renderer-core')> | null = null;

function loadRendererModule(): Promise<typeof import('./renderer-core')> {
  rendererModulePromise ??= import('./renderer-core').catch((error: unknown) => {
    // A transient chunk/network failure must not poison every later route visit
    // in the same browser session.
    rendererModulePromise = null;
    throw error;
  });
  return rendererModulePromise;
}

function setStatus(host: HTMLElement, status: string, label: string): void {
  host.dataset.rendererStatus = status;
  const labelElement = host.querySelector<HTMLElement>('[data-renderer-label]');
  if (labelElement) labelElement.textContent = label;
}

function replaceRendererCanvas(host: HTMLElement): void {
  const canvas = host.querySelector<HTMLCanvasElement>('[data-experience-canvas-element]');
  if (!canvas) return;

  // A WebGPU/WebGL context is permanently bound to its canvas. Reusing that
  // canvas after backend teardown is browser-dependent, so every capability
  // reclassification receives a fresh context boundary.
  const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
  replacement.removeAttribute('width');
  replacement.removeAttribute('height');
  canvas.replaceWith(replacement);
}

export function installExperienceRendererRuntime(): void {
  if (typeof window === 'undefined' || window.__jjoRendererRuntime) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactViewport = window.matchMedia('(max-width: 719px)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  let generation = 0;
  let intersectionObserver: IntersectionObserver | null = null;
  let mountedRenderer: RendererHandle | null = null;
  let activeHost: HTMLElement | null = null;
  const cleanupCallbacks: Array<() => void> = [];
  let scheduledFrame = 0;

  const cleanup = (): void => {
    generation += 1;
    if (scheduledFrame) {
      window.cancelAnimationFrame(scheduledFrame);
      scheduledFrame = 0;
    }

    intersectionObserver?.disconnect();
    intersectionObserver = null;
    const hadMountedRenderer = mountedRenderer !== null;
    mountedRenderer?.destroy();
    mountedRenderer = null;

    while (cleanupCallbacks.length) cleanupCallbacks.pop()?.();

    if (activeHost) {
      if (hadMountedRenderer && activeHost.isConnected) replaceRendererCanvas(activeHost);
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
      delete activeHost.dataset.rendererError;
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
    currentGeneration: number,
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
      if (currentGeneration !== generation || !host.isConnected) return;

      const handle = await mountExperienceRenderer({ host, canvas, profile, variant });
      if (currentGeneration !== generation || !host.isConnected) {
        handle.destroy();
        replaceRendererCanvas(host);
        return;
      }

      mountedRenderer = handle;
      delete host.dataset.rendererError;
      experienceState.patch({ rendererBackend: handle.backend });
      const backendLabel = handle.backend === 'webgpu' ? 'WebGPU' : 'WebGL2';
      setStatus(host, 'active', `${backendLabel} Adaptive`);
    } catch (error) {
      console.warn('JJo Experience renderer fell back to SVG/DOM.', error);
      mountedRenderer?.destroy();
      mountedRenderer = null;
      replaceRendererCanvas(host);
      host.dataset.rendererError = error instanceof Error ? error.message : String(error);
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

  const init = (): void => {
    cleanup();
    const host = document.querySelector<HTMLElement>(HOST_SELECTOR);
    if (!host) return;

    activeHost = host;
    const currentGeneration = generation;
    const profile = detectExperienceCapability();
    const route = experienceRouteFromPath(window.location.pathname);

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
      void mountHost(host, profile, currentGeneration);
      return;
    }

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        intersectionObserver?.disconnect();
        intersectionObserver = null;
        void mountHost(host, profile, currentGeneration);
      },
      { rootMargin: '240px 0px', threshold: 0.01 },
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

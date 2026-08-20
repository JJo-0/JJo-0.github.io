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

function setStatus(host: HTMLElement, status: string, label: string): void {
  host.dataset.rendererStatus = status;
  const labelElement = host.querySelector<HTMLElement>('[data-renderer-label]');
  if (labelElement) labelElement.textContent = label;
}

export function installExperienceRendererRuntime(): void {
  if (typeof window === 'undefined' || window.__jjoRendererRuntime) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
    mountedRenderer?.destroy();
    mountedRenderer = null;

    while (cleanupCallbacks.length) cleanupCallbacks.pop()?.();

    if (activeHost) {
      activeHost.dataset.rendererStatus = 'idle';
      delete activeHost.dataset.rendererTier;
      delete activeHost.dataset.rendererReason;
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

    setStatus(host, 'loading', 'Loading');

    try {
      rendererModulePromise ??= import('./renderer-core');
      const { mountExperienceRenderer } = await rendererModulePromise;
      if (currentGeneration !== generation || !host.isConnected) return;

      mountedRenderer = mountExperienceRenderer({ host, canvas, profile, variant });
      if (currentGeneration !== generation || !host.isConnected) {
        mountedRenderer.destroy();
        mountedRenderer = null;
        return;
      }

      experienceState.patch({ rendererBackend: 'webgl2' });
      setStatus(host, 'active', profile.tier === 'ultra' ? 'WebGL2 Ultra' : 'WebGL2');
    } catch (error) {
      console.warn('JJo Experience renderer fell back to SVG/DOM.', error);
      mountedRenderer?.destroy();
      mountedRenderer = null;
      experienceState.patch({ rendererBackend: 'none', tier: 'safe' });
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
    experienceState.patch({
      route,
      reducedMotion: profile.reducedMotion,
      tier: profile.tier,
      rendererBackend: 'none',
      webgpuAvailable: profile.webgpuAvailable,
      fps: 0,
    });

    if (profile.tier === 'safe') {
      setStatus(host, 'fallback', 'SVG');
      return;
    }

    installPointerTracking(host, profile);
    setStatus(host, 'idle', profile.tier === 'ultra' ? 'Ultra ready' : 'Ready');

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
    window.__jjoRendererRuntime = undefined;
  };

  document.addEventListener('astro:page-load', scheduleInit);
  document.addEventListener('astro:before-swap', cleanup);
  reducedMotion.addEventListener('change', scheduleInit);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleInit, { once: true });
  } else {
    scheduleInit();
  }

  window.__jjoRendererRuntime = { destroy };
}

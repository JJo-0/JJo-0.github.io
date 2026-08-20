<script lang="ts">
  import { onMount } from 'svelte';
  import {
    detectExperienceCapabilities,
    type ExperienceTier,
    type RendererBackend,
  } from '@/lib/experience/capabilities';
  import type { ResearchRendererHandle } from '@/lib/experience/research-renderer';

  interface Focus {
    id: string;
  }

  interface Props {
    focuses: Focus[];
  }

  let { focuses }: Props = $props();
  let stage: HTMLDivElement;
  let tier = $state<ExperienceTier>('safe');
  let backend = $state<RendererBackend>('none');
  let ready = $state(false);

  onMount(() => {
    let renderer: ResearchRendererHandle | null = null;
    let disposed = false;
    let bootVersion = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nodeListeners: Array<{
      element: Element;
      type: string;
      listener: EventListener;
    }> = [];

    const setActive = (id: string): void => {
      if (!id) return;
      stage.dataset.activeNode = id;
      renderer?.setActive(id);
    };

    const bindNodeInteractions = (): void => {
      document.querySelectorAll<Element>('[data-constellation-node]').forEach((element) => {
        const id = element.getAttribute('data-constellation-node');
        if (!id) return;

        const listener = (): void => setActive(id);
        for (const type of ['pointerenter', 'focusin', 'click']) {
          element.addEventListener(type, listener, { passive: true });
          nodeListeners.push({ element, type, listener });
        }
      });
    };

    const destroyRenderer = (): void => {
      renderer?.destroy();
      renderer = null;
      ready = false;
      stage.removeAttribute('data-gpu-ready');
    };

    const boot = async (): Promise<void> => {
      const version = ++bootVersion;
      destroyRenderer();

      const capabilities = detectExperienceCapabilities();
      tier = capabilities.tier;
      backend = capabilities.backend;
      stage.dataset.experienceTier = capabilities.tier;
      stage.dataset.rendererBackend = capabilities.backend;
      stage.dataset.webgpuAvailable = String(capabilities.webgpuAvailable);
      stage.dataset.capabilityReasons = capabilities.reasons.join(',');

      if (capabilities.tier === 'safe' || capabilities.backend === 'none') return;

      try {
        const { createResearchRenderer } = await import('@/lib/experience/research-renderer');
        if (disposed || version !== bootVersion) return;

        renderer = createResearchRenderer(stage, {
          capabilities,
          nodeIds: focuses.map((focus) => focus.id),
        });
        const initialId = stage.dataset.activeNode || focuses[0]?.id || '';
        setActive(initialId);
        ready = true;
        stage.setAttribute('data-gpu-ready', '');
      } catch (error) {
        console.warn('Research GPU renderer fell back to the SVG map.', error);
        tier = 'safe';
        backend = 'none';
        stage.dataset.experienceTier = 'safe';
        stage.dataset.rendererBackend = 'none';
        stage.dataset.capabilityReasons = 'renderer-initialization-failed';
      }
    };

    const onResearchNode = (event: Event): void => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (detail?.id) setActive(detail.id);
    };

    bindNodeInteractions();
    document.addEventListener('jjo:research-node', onResearchNode);
    reducedMotion.addEventListener('change', boot);
    void boot();

    return () => {
      disposed = true;
      bootVersion += 1;
      destroyRenderer();
      reducedMotion.removeEventListener('change', boot);
      document.removeEventListener('jjo:research-node', onResearchNode);
      for (const { element, type, listener } of nodeListeners) {
        element.removeEventListener(type, listener);
      }
    };
  });
</script>

<div
  bind:this={stage}
  class:ready
  class="research-gpu-stage"
  data-gpu-constellation
  data-tier={tier}
  data-backend={backend}
  aria-hidden="true"
></div>

<style>
  .research-gpu-stage {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    border-radius: inherit;
    opacity: 0;
    pointer-events: none;
    transition: opacity 500ms cubic-bezier(0.22, 1, 0.36, 1);
    mask-image: radial-gradient(circle at center, black 35%, transparent 88%);
  }

  .research-gpu-stage.ready {
    opacity: 0.82;
  }

  .research-gpu-stage :global(.research-gpu-canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 767px), (prefers-reduced-motion: reduce) {
    .research-gpu-stage {
      display: none;
    }
  }
</style>

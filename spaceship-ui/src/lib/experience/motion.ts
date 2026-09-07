import type { MotionEngine } from './motion-engine';
import {
  experienceRouteFromPath,
  experienceState,
  isResearchNodeId,
  type ResearchNodeId,
} from './state';

type ExperienceRuntimeHandle = {
  destroy: () => void;
};

declare global {
  interface Window {
    __jjoExperienceRuntime?: ExperienceRuntimeHandle;
  }
}

const ROOT_SELECTOR = '[data-experience-page]';
const ENHANCED_MOTION_QUERY = '(min-width: 768px) and (hover: hover) and (pointer: fine)';
let enginePromise: Promise<MotionEngine> | null = null;

function loadMotionEngine(): Promise<MotionEngine> {
  enginePromise ??= import('./motion-engine')
    .then(({ motionEngine }) => motionEngine)
    .catch((error: unknown) => {
      enginePromise = null;
      throw error;
    });
  return enginePromise;
}

function researchNodeId(value: string): ResearchNodeId {
  return isResearchNodeId(value) ? value : null;
}

function setActiveResearchNode(root: HTMLElement, id: string): void {
  const activeResearchNode = researchNodeId(id);
  if (!activeResearchNode) return;

  root.querySelectorAll<Element>('[data-constellation-node]').forEach((node) => {
    node.toggleAttribute(
      'data-active',
      node.getAttribute('data-constellation-node') === activeResearchNode,
    );
  });
  root.querySelectorAll<Element>('[data-research-section]').forEach((section) => {
    section.toggleAttribute(
      'data-active',
      section.getAttribute('data-research-section') === activeResearchNode,
    );
  });
  experienceState.patch({ activeResearchNode });
}

function installResearchInteractions(root: HTMLElement, signal: AbortSignal): void {
  root.querySelectorAll<Element>('[data-constellation-node]').forEach((node) => {
    const activate = (): void => {
      const id = node.getAttribute('data-constellation-node');
      if (id) setActiveResearchNode(root, id);
    };

    const activateAndNavigate = (event: Event): void => {
      activate();
      const worldTarget = node.getAttribute('data-world-target');
      if (!worldTarget) return;

      const target = document.getElementById(worldTarget);
      if (!target) return;

      event.preventDefault();
      if (node instanceof HTMLAnchorElement && node.hash) {
        history.pushState(null, '', `${window.location.pathname}${node.hash}`);
      }
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      });
    };

    node.addEventListener('pointerenter', activate, { passive: true, signal });
    node.addEventListener('focusin', activate, { signal });
    node.addEventListener('click', activateAndNavigate, { signal });
  });

  const activateHashNode = (): void => {
    let id: string;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    if (isResearchNodeId(id)) setActiveResearchNode(root, id);
  };

  window.addEventListener('hashchange', activateHashNode, { signal });
  activateHashNode();
}

// Mobile/reduced-motion keeps real navigation and section state without
// downloading an animation engine or running an idle animation loop.
function installNativeScroll(root: HTMLElement, signal: AbortSignal): void {
  const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-research-section]'));
  let frame = 0;

  const update = (): void => {
    frame = 0;
    if (signal.aborted || !root.isConnected || document.hidden) return;

    // Batch geometry reads before DOM/store writes to avoid layout thrashing.
    const viewportHeight = window.innerHeight;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
    const progress = Number(
      (maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0).toFixed(4),
    );
    const line = viewportHeight * 0.5;
    const activeSection = sections.find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= line && rect.bottom >= line;
    });
    const id = activeSection?.getAttribute('data-research-section');

    document.documentElement.style.setProperty('--experience-progress', progress.toString());
    if (Math.abs(experienceState.get().scrollProgress - progress) >= 0.002) {
      experienceState.patch({ scrollProgress: progress });
    }
    if (id && experienceState.get().activeResearchNode !== id) setActiveResearchNode(root, id);
  };

  const schedule = (): void => {
    if (!frame && !signal.aborted) frame = window.requestAnimationFrame(update);
  };
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
  observer?.observe(root);
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { passive: true, signal });
  document.addEventListener('visibilitychange', schedule, { signal });
  signal.addEventListener('abort', () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    observer?.disconnect();
  }, { once: true });
  schedule();
}

export function installExperienceMotion(): void {
  if (typeof window === 'undefined' || window.__jjoExperienceRuntime) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const enhancedMotion = window.matchMedia(ENHANCED_MOTION_QUERY);
  let context: ReturnType<MotionEngine['gsap']['context']> | null = null;
  let activeRoot: HTMLElement | null = null;
  let interactionController: AbortController | null = null;
  let scheduledFrame = 0;
  let generation = 0;

  const cleanup = (): void => {
    generation += 1;
    if (scheduledFrame) {
      window.cancelAnimationFrame(scheduledFrame);
      scheduledFrame = 0;
    }

    context?.revert();
    context = null;
    interactionController?.abort();
    interactionController = null;

    if (activeRoot) {
      activeRoot.removeAttribute('data-motion-ready');
      activeRoot.removeAttribute('data-motion-mode');
      activeRoot.querySelectorAll('[data-active]').forEach((element) => {
        element.removeAttribute('data-active');
      });
    }

    activeRoot = null;
    document.documentElement.style.removeProperty('--experience-progress');
    experienceState.patch({ scrollProgress: 0, activeResearchNode: null });
  };

  const init = (): void => {
    cleanup();

    const root = document.querySelector<HTMLElement>(ROOT_SELECTOR);
    if (!root) return;

    activeRoot = root;
    root.setAttribute('data-motion-ready', '');
    experienceState.patch({
      route: experienceRouteFromPath(window.location.pathname),
      reducedMotion: reducedMotion.matches,
    });

    interactionController = new AbortController();
    const signal = interactionController.signal;
    installResearchInteractions(root, signal);

    // Server-rendered text and the identity GIF remain visible from first paint.
    if (reducedMotion.matches || !enhancedMotion.matches) {
      root.setAttribute('data-motion-mode', reducedMotion.matches ? 'reduced' : 'native');
      installNativeScroll(root, signal);
      return;
    }

    root.setAttribute('data-motion-mode', 'pending');
    const currentGeneration = generation;
    const isCurrent = (): boolean =>
      generation === currentGeneration && activeRoot === root && root.isConnected && !signal.aborted;

    void loadMotionEngine().then(({ gsap, ScrollTrigger }) => {
      // A resize, preference change, or Astro navigation can win the import race.
      if (!isCurrent() || reducedMotion.matches || !enhancedMotion.matches) return;
      root.setAttribute('data-motion-mode', 'enhanced');

      context = gsap.context(() => {
        const kicker = root.querySelectorAll<HTMLElement>('[data-motion="hero-kicker"]');
        const words = root.querySelectorAll<HTMLElement>('[data-motion="hero-word"]');
        const copy = root.querySelectorAll<HTMLElement>('[data-motion="hero-copy"]');
        const visual = root.querySelectorAll<HTMLElement>('[data-motion="hero-visual"]');

        if (kicker.length) {
          gsap.fromTo(kicker, { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' });
        }
        if (words.length) {
          gsap.fromTo(words, { yPercent: 115, rotate: 1.5 }, {
            yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.09,
            ease: 'power4.out', delay: 0.05,
          });
        }
        if (copy.length) {
          gsap.fromTo(copy, { autoAlpha: 0, y: 24 }, {
            autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08,
            ease: 'power3.out', delay: 0.28,
          });
        }
        if (visual.length) {
          gsap.fromTo(visual, { autoAlpha: 0, scale: 0.96, rotate: 1.5 }, {
            autoAlpha: 1, scale: 1, rotate: 0, duration: 1.05,
            ease: 'power4.out', delay: 0.18,
          });
        }

        (gsap.utils.toArray('[data-reveal]', root) as HTMLElement[]).forEach((element, index) => {
          gsap.fromTo(element, { autoAlpha: 0, y: 34 }, {
            autoAlpha: 1, y: 0, duration: 0.82, ease: 'power3.out',
            scrollTrigger: {
              id: `experience-reveal-${index}`, trigger: element,
              start: 'top 88%', once: true, invalidateOnRefresh: true,
            },
          });
        });
        (gsap.utils.toArray('[data-stagger]', root) as HTMLElement[]).forEach((container, index) => {
          const items = container.querySelectorAll<HTMLElement>(':scope > [data-stagger-item]');
          if (!items.length) return;
          gsap.fromTo(items, { autoAlpha: 0, y: 26 }, {
            autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: {
              id: `experience-stagger-${index}`, trigger: container,
              start: 'top 86%', once: true, invalidateOnRefresh: true,
            },
          });
        });

        if (window.matchMedia('(min-width: 768px)').matches) {
          const parallaxTargets = root.querySelectorAll<HTMLElement>('[data-parallax]');
          if (parallaxTargets.length) {
            gsap.to(parallaxTargets, {
              yPercent: -5, ease: 'none',
              scrollTrigger: {
                id: 'experience-parallax', trigger: root,
                start: 'top top', end: 'bottom top', scrub: 0.6,
              },
            });
          }
        }
        ScrollTrigger.create({
          id: 'experience-progress', start: 0, end: 'max',
          onUpdate: (self: { progress: number }) => {
            const progress = Number(self.progress.toFixed(4));
            document.documentElement.style.setProperty('--experience-progress', progress.toString());
            if (Math.abs(experienceState.get().scrollProgress - progress) >= 0.002) {
              experienceState.patch({ scrollProgress: progress });
            }
          },
        });
        root.querySelectorAll<HTMLElement>('[data-research-section]').forEach((section, index) => {
          const id = section.getAttribute('data-research-section');
          if (!id || !isResearchNodeId(id)) return;
          ScrollTrigger.create({
            id: `experience-research-${index}`, trigger: section,
            start: 'top 62%', end: 'bottom 38%',
            onEnter: () => setActiveResearchNode(root, id),
            onEnterBack: () => setActiveResearchNode(root, id),
          });
        });
      }, root);
      scheduledFrame = window.requestAnimationFrame(() => {
        scheduledFrame = 0;
        if (isCurrent()) ScrollTrigger.refresh();
      });
    }).catch(() => {
      if (!isCurrent()) return;
      context?.revert();
      context = null;
      root.setAttribute('data-motion-mode', 'native');
      installNativeScroll(root, signal);
    });
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
    document.removeEventListener('DOMContentLoaded', scheduleInit);
    document.removeEventListener('astro:page-load', scheduleInit);
    document.removeEventListener('astro:before-swap', cleanup);
    reducedMotion.removeEventListener('change', scheduleInit);
    enhancedMotion.removeEventListener('change', scheduleInit);
    experienceState.patch({ route: 'other' });
    window.__jjoExperienceRuntime = undefined;
  };

  document.addEventListener('astro:page-load', scheduleInit);
  document.addEventListener('astro:before-swap', cleanup);
  reducedMotion.addEventListener('change', scheduleInit);
  enhancedMotion.addEventListener('change', scheduleInit);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleInit, { once: true });
  } else {
    scheduleInit();
  }
  window.__jjoExperienceRuntime = { destroy };
}

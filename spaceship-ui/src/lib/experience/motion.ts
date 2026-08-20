import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  experienceRouteFromPath,
  experienceState,
  type ResearchNodeId,
} from './state';

gsap.registerPlugin(ScrollTrigger);

type ExperienceRuntimeHandle = {
  destroy: () => void;
};

declare global {
  interface Window {
    __jjoExperienceRuntime?: ExperienceRuntimeHandle;
  }
}

const ROOT_SELECTOR = '[data-experience-page]';
const RESEARCH_NODE_IDS = new Set(['robotics-systems', 'vision-perception', 'ai-research']);

function researchNodeId(value: string): ResearchNodeId {
  return RESEARCH_NODE_IDS.has(value) ? (value as Exclude<ResearchNodeId, null>) : null;
}

function revealWithoutMotion(root: HTMLElement): void {
  const targets = root.querySelectorAll<HTMLElement>(
    '[data-motion], [data-reveal], [data-stagger-item]',
  );
  gsap.set(targets, { clearProps: 'all' });
}

function setActiveResearchNode(root: HTMLElement, id: string): void {
  const activeResearchNode = researchNodeId(id);
  root.querySelectorAll<Element>('[data-constellation-node]').forEach((node) => {
    node.toggleAttribute('data-active', node.getAttribute('data-constellation-node') === id);
  });
  experienceState.patch({ activeResearchNode });
}

export function installExperienceMotion(): void {
  if (typeof window === 'undefined' || window.__jjoExperienceRuntime) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let context: gsap.Context | null = null;
  let activeRoot: HTMLElement | null = null;
  let scheduledFrame = 0;

  const cleanup = (): void => {
    if (scheduledFrame) {
      window.cancelAnimationFrame(scheduledFrame);
      scheduledFrame = 0;
    }

    context?.revert();
    context = null;

    if (activeRoot) {
      activeRoot.removeAttribute('data-motion-ready');
      activeRoot.removeAttribute('data-motion-mode');
    }

    activeRoot = null;
    document.documentElement.style.removeProperty('--experience-progress');
    experienceState.patch({
      scrollProgress: 0,
      activeResearchNode: null,
    });
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

    if (reducedMotion.matches) {
      root.setAttribute('data-motion-mode', 'reduced');
      revealWithoutMotion(root);
      return;
    }

    root.setAttribute('data-motion-mode', 'enhanced');

    context = gsap.context(() => {
      const kicker = root.querySelectorAll<HTMLElement>('[data-motion="hero-kicker"]');
      const words = root.querySelectorAll<HTMLElement>('[data-motion="hero-word"]');
      const copy = root.querySelectorAll<HTMLElement>('[data-motion="hero-copy"]');
      const visual = root.querySelectorAll<HTMLElement>('[data-motion="hero-visual"]');

      if (kicker.length) {
        gsap.fromTo(
          kicker,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        );
      }

      if (words.length) {
        gsap.fromTo(
          words,
          { yPercent: 115, rotate: 1.5 },
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.05,
            stagger: 0.09,
            ease: 'power4.out',
            delay: 0.05,
          },
        );
      }

      if (copy.length) {
        gsap.fromTo(
          copy,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
            delay: 0.28,
          },
        );
      }

      if (visual.length) {
        gsap.fromTo(
          visual,
          { autoAlpha: 0, scale: 0.96, rotate: 1.5 },
          {
            autoAlpha: 1,
            scale: 1,
            rotate: 0,
            duration: 1.05,
            ease: 'power4.out',
            delay: 0.18,
          },
        );
      }

      gsap.utils.toArray<HTMLElement>('[data-reveal]', root).forEach((element, index) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.82,
            ease: 'power3.out',
            scrollTrigger: {
              id: `experience-reveal-${index}`,
              trigger: element,
              start: 'top 88%',
              once: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-stagger]', root).forEach((container, index) => {
        const items = container.querySelectorAll<HTMLElement>(':scope > [data-stagger-item]');
        if (!items.length) return;

        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              id: `experience-stagger-${index}`,
              trigger: container,
              start: 'top 86%',
              once: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      if (window.matchMedia('(min-width: 768px)').matches) {
        const parallaxTargets = root.querySelectorAll<HTMLElement>('[data-parallax]');
        if (parallaxTargets.length) {
          gsap.to(parallaxTargets, {
            yPercent: -5,
            ease: 'none',
            scrollTrigger: {
              id: 'experience-parallax',
              trigger: root,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
          });
        }
      }

      ScrollTrigger.create({
        id: 'experience-progress',
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const progress = Number(self.progress.toFixed(4));
          document.documentElement.style.setProperty('--experience-progress', progress.toString());
          if (Math.abs(experienceState.get().scrollProgress - progress) >= 0.002) {
            experienceState.patch({ scrollProgress: progress });
          }
        },
      });

      root.querySelectorAll<HTMLElement>('[data-research-section]').forEach((section, index) => {
        const id = section.getAttribute('data-research-section');
        if (!id) return;

        ScrollTrigger.create({
          id: `experience-research-${index}`,
          trigger: section,
          start: 'top 62%',
          end: 'bottom 38%',
          onEnter: () => setActiveResearchNode(root, id),
          onEnterBack: () => setActiveResearchNode(root, id),
        });
      });
    }, root);

    scheduledFrame = window.requestAnimationFrame(() => {
      scheduledFrame = 0;
      ScrollTrigger.refresh();
    });
  };

  const scheduleInit = (): void => {
    if (scheduledFrame) window.cancelAnimationFrame(scheduledFrame);
    scheduledFrame = window.requestAnimationFrame(init);
  };

  const destroy = (): void => {
    cleanup();
    document.removeEventListener('astro:page-load', scheduleInit);
    document.removeEventListener('astro:before-swap', cleanup);
    reducedMotion.removeEventListener('change', scheduleInit);
    experienceState.patch({ route: 'other' });
    window.__jjoExperienceRuntime = undefined;
  };

  document.addEventListener('astro:page-load', scheduleInit);
  document.addEventListener('astro:before-swap', cleanup);
  reducedMotion.addEventListener('change', scheduleInit);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleInit, { once: true });
  } else {
    scheduleInit();
  }

  window.__jjoExperienceRuntime = { destroy };
}

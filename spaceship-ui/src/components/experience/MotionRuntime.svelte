<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    scope: 'home' | 'research';
  }

  let { scope }: Props = $props();

  onMount(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let cleanup = () => {};

    const initialise = async () => {
      cleanup();

      const root = document.querySelector<HTMLElement>(`[data-motion-scope="${scope}"]`);
      if (!root) return;

      root.dataset.motionReady = 'true';

      if (reducedMotion.matches) {
        root.dataset.motionMode = 'reduced';
        cleanup = () => {
          delete root.dataset.motionMode;
          delete root.dataset.motionReady;
        };
        return;
      }

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);
      root.dataset.motionMode = 'enhanced';

      const context = gsap.context(() => {
        const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

        heroTimeline
          .fromTo(
            root.querySelectorAll('[data-motion="hero-kicker"]'),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.55 },
          )
          .fromTo(
            root.querySelectorAll('[data-motion="hero-line"]'),
            { autoAlpha: 0, yPercent: 115 },
            { autoAlpha: 1, yPercent: 0, duration: 0.82, stagger: 0.09 },
            '-=0.25',
          )
          .fromTo(
            root.querySelectorAll('[data-motion="hero-copy"]'),
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.62 },
            '-=0.48',
          )
          .fromTo(
            root.querySelectorAll('[data-motion="hero-actions"]'),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.52 },
            '-=0.38',
          )
          .fromTo(
            root.querySelectorAll('[data-motion="hero-visual"]'),
            { autoAlpha: 0, scale: 0.94, rotate: -2 },
            { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.72 },
            '-=0.5',
          );

        root.querySelectorAll<HTMLElement>('[data-motion="reveal"]').forEach((section) => {
          const items = section.querySelectorAll<HTMLElement>('[data-motion-item]');

          gsap.fromTo(
            section,
            { autoAlpha: 0, y: 34 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 88%',
                once: true,
              },
            },
          );

          if (items.length > 0) {
            gsap.fromTo(
              items,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.07,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 84%',
                  once: true,
                },
              },
            );
          }
        });

        const progress = document.querySelector<HTMLElement>('[data-experience-progress]');
        if (progress) {
          gsap.fromTo(
            progress,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: {
                start: 0,
                end: 'max',
                scrub: 0.2,
              },
            },
          );
        }

        const visual = root.querySelector<HTMLElement>('[data-motion="hero-visual"]');
        if (visual && window.matchMedia('(pointer: fine)').matches) {
          const onPointerMove = (event: PointerEvent) => {
            const rect = visual.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            gsap.to(visual, {
              rotateY: x * 7,
              rotateX: y * -7,
              transformPerspective: 700,
              transformOrigin: 'center',
              duration: 0.55,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          };

          const onPointerLeave = () => {
            gsap.to(visual, {
              rotateX: 0,
              rotateY: 0,
              duration: 0.65,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          };

          visual.addEventListener('pointermove', onPointerMove);
          visual.addEventListener('pointerleave', onPointerLeave);

          context.add(() => {
            visual.removeEventListener('pointermove', onPointerMove);
            visual.removeEventListener('pointerleave', onPointerLeave);
          });
        }

        ScrollTrigger.refresh();
      }, root);

      cleanup = () => {
        context.revert();
        delete root.dataset.motionMode;
        delete root.dataset.motionReady;
      };
    };

    const onPageLoad = () => void initialise();
    const onMotionPreferenceChange = () => void initialise();

    void initialise();
    document.addEventListener('astro:page-load', onPageLoad);
    reducedMotion.addEventListener('change', onMotionPreferenceChange);

    return () => {
      disposed = true;
      cleanup();
      document.removeEventListener('astro:page-load', onPageLoad);
      reducedMotion.removeEventListener('change', onMotionPreferenceChange);
    };
  });
</script>

<div class="experience-progress" data-experience-runtime={scope} aria-hidden="true">
  <span data-experience-progress></span>
</div>

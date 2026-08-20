# JJo Experience Engine

## Current production boundary

The portfolio uses progressive enhancement in four independent layers:

1. Astro content and semantic HTML
2. static UI, mouse GIF, and accessible SVG research map
3. GSAP motion and Astro page transitions
4. optional Three.js renderer on Home and Research only

An unavailable or failed higher layer must not remove content or navigation from a lower layer.

## Canonical research state

The four public research IDs come only from `src/lib/taxonomy.mjs`:

- `robotics-autonomous-systems`
- `vision-pose-human-perception`
- `ml-foundations-evaluation`
- `ai-consciousness-governance`

`research.ts`, Home cards, the Research SVG, sections, the shared experience store, GSAP, and the GPU renderer all consume this same taxonomy. Independent runtime whitelists are prohibited.

## Capability tiers

### SAFE

SAFE is selected when any independent gate applies:

- reduced-motion preference
- Save-Data or 2G-class network
- missing WebGL2
- constrained CPU or reported memory
- viewport width at or below 719 px
- coarse pointer

CSS and JavaScript use the same width-or-pointer boundary. SAFE clients do not import the renderer core and retain semantic DOM/SVG navigation.

### NORMAL

- viewport-lazy WebGL2 renderer
- DPR capped at 1
- 30 FPS cap
- 42 procedural particles
- no post-processing or external 3D assets

### ULTRA

- WebGPU-capable desktop-class device, fine pointer, at least eight logical cores and 8 GB reported device memory
- currently uses the same stable WebGL2 backend while recording WebGPU availability for the next isolated phase
- DPR capped at 1.6
- 60 FPS cap
- 96 procedural particles

## Runtime lifecycle

- `renderer-runtime.ts` re-evaluates capability after route, reduced-motion, viewport-boundary, or pointer-capability changes.
- a rejected lazy renderer import is cleared so a later route visit can retry.
- Home cards, SVG nodes, URL hashes, Research sections, GSAP, and Three.js share one active research node.
- the renderer cancels RAF completely while offscreen or while the document is hidden, then restarts with a fresh FPS window.
- a theme-class observer refreshes sampled CSS colors without remounting the scene.
- resources, observers, listeners, RAF, and the WebGL context are disposed during Astro route swaps.

## Lazy module and payload contract

- `renderer-runtime.ts` performs capability and viewport checks before importing `renderer-core.ts`.
- `renderer-core.ts` uses named Three.js imports so its separately loaded chunk remains tree-shakeable.
- the raw minified chunk warning threshold is 650 KiB because Three.js is isolated from initial page JavaScript.
- `renderer-contract.mjs` is the authoritative network and semantic gate and limits the complete lazy renderer graph to 500 KiB gzip.
- article routes never mount or reference the portfolio renderer.

## Browser smoke matrix

Production output is exercised in Chromium for:

- desktop header inset and unclipped brand
- absolute Home hero overlays
- Home-card, SVG-focus, section-scroll, and shared-state synchronization
- narrow, mobile/coarse-pointer, and reduced-motion SAFE modes
- live viewport capability reclassification when GPU rendering is available
- offscreen RAF stop/restart and theme palette refresh when GPU rendering is available
- transient lazy-chunk failure and same-session retry when GPU rendering is available
- article-route renderer isolation

## Hard constraints

- Home and Research remain readable and navigable without JavaScript.
- the mouse GIF and accessible Research SVG are permanent fallbacks.
- no wheel/touch scroll interception, custom cursor, audio, full-page canvas, or loading gate.
- the stale Svelte constellation implementation must not exist.
- renderer layering must not override the absolute positioning of Home labels and captions.

## Deferred phases

- WebGPU renderer activation and deterministic WebGL2 fallback selection
- live adaptive FPS downgrade with hysteresis
- GPU picking beyond the current DOM-driven synchronization
- compressed GLB/KTX2 asset pipeline
- experimental `/lab` surface

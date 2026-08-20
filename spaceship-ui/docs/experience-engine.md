# JJo Experience Engine

## Current production boundary

The portfolio uses progressive enhancement in four independent layers:

1. Astro content and semantic HTML
2. static UI, mouse GIF, and accessible SVG research map
3. GSAP motion and Astro page transitions
4. optional Three.js renderer on Home and Research only

An unavailable or failed higher layer must not remove content or navigation from a lower layer.

## Capability tiers

### SAFE

- reduced-motion preference, Save-Data/2G, missing WebGL2, constrained hardware, or narrow coarse-pointer devices
- no Three.js renderer-core import
- static SVG/DOM and CSS only

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

## Lazy module and payload contract

- `renderer-runtime.ts` performs capability and viewport checks before importing `renderer-core.ts`
- `renderer-core.ts` uses named Three.js imports so its separately loaded chunk remains tree-shakeable
- the raw minified chunk warning threshold is 650 KiB because Three.js is intentionally isolated and never part of initial page JavaScript
- `renderer-contract.mjs` remains the authoritative network-cost gate and limits the complete lazy renderer graph to 500 KiB gzip
- the current validated renderer graph is approximately 132 KiB gzip

## Hard constraints

- article routes never mount or reference the portfolio renderer
- Home and Research remain readable and navigable without JavaScript
- the mouse GIF and accessible Research SVG are permanent fallbacks
- the renderer core loads only after capability checks and viewport proximity
- no wheel/touch scroll interception, custom cursor, audio, full-page canvas, or loading gate
- renderer resources, observers, RAF loops, and WebGL context are disposed on Astro route swaps

## Deferred phases

- WebGPU renderer activation and WebGL2 fallback selection
- live adaptive FPS downgrade with hysteresis
- GPU research-node picking and DOM/scene bidirectional synchronization
- compressed GLB/KTX2 asset pipeline
- experimental `/lab` surface

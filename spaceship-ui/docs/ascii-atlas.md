# Writing Atlas

The Home and Research maps show articles as a terminal-style star chart. Its visual references are [Astroterm](https://github.com/da-luce/astroterm) for star magnitudes and constellation lines, [kciter's ASCII renderer](https://kciter.so/posts/ascii-3d-renderer/en/) for perspective and depth shading, and [Skiper's ASCII simulation](https://skiper-ui.com/v1/skiper14) for direct rotation. The stars are articles, and the connections come from the writing graph.

## Reading the chart

Nine topic bands run from blue-violet through blue-white and pearl to amber and copper on a navy field. Each article's original depth picks a stable shade within its topic band. An edge starts in the source star's color and ends in the target star's color. Connections across distant bands pass through intermediate spectrum colors. Solid lines connect articles within a topic. Dashed lines connect topics. Depth and relationship weight determine line strength.

The sum of incident relationship weights determines whether a star appears as a pinpoint, a plus or a four-point star. View depth changes its size and brightness during a rotation. The reticle stays fixed to the frame. Hovering or keyboard-focusing an article emphasizes its neighbors and reveals its title, category symbol and relationship reasons. The legend filters emphasis. Article links, graph data, topic identities and the writing archive are shared with the rest of the site.

## Rendering and interaction

The build produces one static SVG per edition and theme at `/atlas-preview/`. Each contains the projected stars and spectrum edges for the initial view. CSS sizes its viewing field to match the interactive projection across wide and narrow cards. The visible-theme image supplies the initial and error-state chart.

The interactive graph loads after the window has loaded, the map is visible and the browser has an idle opportunity. Its Canvas renderer uses the same star and edge functions as the static image. It computes spectral stops once on mount and reuses projected gradients until the camera or theme changes. A drag or rotation button moves toward a target using elapsed time, then drawing stops. The projection scale stays fixed over a rotation. Reduced-motion users get the destination view on the next paint. Offscreen and hidden graphs pause. The archive and explicit retry remain available on load failure.

`scripts/ascii-runtime.test.mjs` covers the loading lifecycle, spectrum and projection math. `scripts/browser-mobile-performance.mjs` exercises the rendered chart, native links, theme changes, frame updates and idle behavior in Chromium.

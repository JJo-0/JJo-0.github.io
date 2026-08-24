# JJO Design System V2 — Editorial Research Interface

## Goal

Build an award-caliber personal research portfolio without sacrificing long-form reading quality.

The public site has two deliberately different intensity levels:

1. **Home / Research** — distinctive, spatial, interactive, technically ambitious.
2. **Writing / Articles** — calm, low-fatigue, information-first, optimized for long reading sessions.

Technology is not the visual metaphor. WebGPU/WebGL2/GSAP are implementation layers; the visible language is research, evidence, systems, and knowledge structure.

## Reference set

The implementation takes principles rather than layouts from award-recognized work:

- **Hyperbolic / Studio Freight** — technical visual language without generic neon sci-fi; Awwwards Site of the Day + Developer Award, May 2025.
- **Taravilla Lab / Rubio & del Amo** — restrained hierarchy and precision; Awwwards Honorable Mention, May 2025.
- **Fine Thought** — personal creative-technologist identity and disciplined transitions; Awwwards recognition in 2025.
- **Studio Null** — portfolio sequencing and authored identity; Awwwards Portfolio Honors + Site of the Day + Developer Award, 2025.
- **Awwwards/CSSDA editorial and typographic winners** — whitespace, reading rhythm, restrained color and strong typography.

Reference galleries:

- https://www.awwwards.com/
- https://www.awwwards.com/websites/website_category_portfolio/
- https://www.awwwards.com/websites/scrolling/
- https://www.awwwards.com/websites/webgl/
- https://www.cssdesignawards.com/wotd-award-winners/
- https://www.cssdesignawards.com/website-gallery?feature=minimal
- https://www.cssdesignawards.com/website-gallery?feature=typographic

Do not clone a winner's layout, illustration, interaction sequence, or typography composition.

## Visual language

### Removed

- planet / solar-system framing
- orbital rings as primary decoration
- galaxy / space storytelling
- neon sci-fi dashboard treatment
- mascot as the main hero identity
- glassmorphism-heavy reading surfaces

### Introduced

- research topology
- evidence graph
- coordinate field
- signal field
- contour / measurement lines
- editorial rules and whitespace
- restrained sage-teal accent
- warm paper surface

## Color system

Light mode:

- paper: `#f2eee4`
- raised paper: `#f8f5ed`
- ink: `#292c29`
- secondary ink: `#62645f`
- accent: `#5e7f78`
- accent strong: `#3f6760`
- rule: `#d5cec0`

Dark mode is warm charcoal/olive rather than blue sci-fi.

Never use pure white for the primary reading canvas and never use pure black for body text.

## Typography

### Display / editorial

Use the system serif stack (`Iowan Old Style`, `Palatino`, `Georgia`, Korean serif fallback) for major authored headlines and research-section titles.

### UI

Use Outfit / Korean system sans for navigation, metadata, labels and controls.

### Long-form Korean text

Use the Korean UI-reading sans stack. Preserve `word-break: keep-all` and a line-height around `1.8–1.9`.

Reading measure should remain around 42–46rem. Wider site shells must not make paragraphs wider.

## Interaction hierarchy

1. Native semantic links remain the navigation truth.
2. SVG/DOM topology is always meaningful without JavaScript.
3. WebGPU/WebGL2 enriches topology rather than replacing navigation.
4. Scroll changes research focus but must never hijack scrolling.
5. Pointer movement is bounded parallax, not a required interaction.
6. Reduced motion / coarse pointer / narrow viewports retain complete information.

## GPU scene

The renderer may be technically advanced but should visually behave like a research instrument:

- asymmetric research nodes
- evidence edges
- signal samples
- contour / measurement bands
- camera reframing based on selected research field

Forbidden as primary scene primitives/metaphors:

- `TorusGeometry`
- spherical planets
- circular orbital particle swarms

## Article experience

Article pages are deliberately calmer than the homepage.

- large serif title
- clear dek
- metadata separated from prose
- 42–46rem reading measure
- sticky TOC only on large screens
- low-contrast table and code surfaces
- section rules instead of floating cards
- restrained link color and underline

## Award-review criteria

Every visual change should be judged on four independent axes:

1. **Design** — composition, typography, color, consistency.
2. **Usability** — reading, navigation, mobile, accessibility.
3. **Creativity** — distinct identity rather than template aesthetics.
4. **Development** — motion, GPU work, performance, fallbacks, semantic correctness.

A feature that improves one axis while materially degrading another is not accepted.

# Visual QA: original pages 11–15, English PNGs

## Deliverables

- `ntu-self-improving-11-en.png` through `ntu-self-improving-15-en.png`
- Each PNG is **1800 × 1013 px**.
- `ntu-self-improving-11-15-en.pdf` contains **5 pages**, in original order 11 → 15.
- The complete 62-page working PPTX is an intermediate localization source. It is not a fully translated English deck and is not the scoped user deliverable.

## Method

1. Downloaded the official PDF and PPTX without changing the source bytes.
2. Rendered original PDF pages 11–15 and inspected each page visually.
3. Edited only the native Chinese title text on pages 11, 12, 13, and 15.
4. Extracted page 11's original raster `ppt/media/image24.png`, inspected it, and used the built-in imagegen tool to translate its Chinese bottom caption. Reinserted the generated thumbnail in the original picture object with the same position and dimensions.
5. Adjusted the font and size of six existing English labels where renderer substitution caused broken words. The labels, geometry, and connectors were unchanged.
6. Exported the original native slides with LibreOffice, then rendered the 5-page PDF using Poppler at a 1800-pixel maximum edge.
7. Viewed all five final pages individually. Inspected title fit, captions, labels, arrows, original icons, and formulas.

## Per-page result

| Original page | Result | Visual check |
| --- | --- | --- |
| 11 | PASS | English title, Self-Correction thumbnail, translated caption, and original YouTube URL fit. The generated thumbnail retains the source composition and gradient. |
| 12 | PASS | All three rows retained. Detection + Correction, reflection, reasoning, output, and corrected labels are readable. The reflection label stays on one line inside its original box. |
| 13 | PASS | Self-correction stays on one line with no overlap with the arrow. Nothing changes … remains below the upper LLM. The second input–model–output row is preserved. |
| 14 | PASS | Existing English retained. Self-correction is on one line. The vertical fine-tuning arrow, the middle ????? element and bidirectional dashed connector, and the corrected lower model output remain in place. |
| 15 | PASS | The translated title clears the equation near the top. All original equations, superscripts, subscripts and hats are visible. Supervised Learning, Reinforcement Learning and Reward function fit. Two human icons render from original embedded SVG instead of the official PDF's red X placeholders. |

## Native invariants checked

- All **38 connector objects** across these five pages are unchanged.
- All **17 equation objects** on page 15 are unchanged.
- All **130 shape geometry nodes** across these five pages are unchanged.
- All **4 picture objects** retain their original geometry and relationships.
- Of **176 original media files**, **175 are byte-identical**. The sole changed media file is page 11's caption-bearing thumbnail.
- All non-title editable wording remains unchanged. No remaining Chinese characters occur in the editable text of these five slides.
- No slides were added, deleted, or reordered in the working PPTX.
- The source PPTX and PDF hashes match their downloaded original values.

## Differences from the official PDF

- Translated titles use Arial and suitable sizes within the original title boxes.
- The six labels listed in `english-copy.md` have explicit Arial font sizing to prevent words breaking across lines.
- LibreOffice's native rendering has minor font-metric and arrow/dash-weight differences from the official PDF. Their source connector XML, geometry, color and direction remain unchanged.
- Page 15's two human icons are recovered from the original PPTX's embedded media. They are not newly generated drawings.
- Page 11's raster thumbnail was regenerated for caption localization, so it is not pixel-identical. Its content, heading, gradient, cursor, symbols, composition and proportions were visually checked against the original.

## Generated thumbnail prompt and provenance

- Built-in `image_gen.imagegen`, edit mode, one input asset and one call.
- Source image: `source/p11-thumbnail-source.png`, 732 × 450 px.
- Generated image: `native/p11-thumbnail-en.png`, 1600 × 983 px.
- The existing PowerPoint picture rectangle preserves the original placement and aspect ratio.
- The full generation prompt and thumbnail intermediates are retained in the separate adaptation provenance package.
- SHA256 values, dimensions, source URLs and exact native-object checks are in `manifest.json` and `native-localization-manifest.json`.

## Repository scope

This repository includes the five final PNGs and the provenance records in this directory. Source and intermediate filenames above identify separately retained adaptation artifacts. External source permission remains unverified; the repository owner’s scoped publication decision is recorded separately.

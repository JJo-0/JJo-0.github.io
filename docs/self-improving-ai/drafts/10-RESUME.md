# Chapter 10 source checkpoint

Prepared on 2026-11-18 KST from base `fc7d00fba0fa2e92c1d45b0d98c33688818d7a95`.

## Scope

- Chapters 01–09: remove production/retrieval commentary, shorten figure captions and credits, collapse optional video mappings and calculation records. Preserve all 298 Math components and 81 images, their sources, dimensions, and substantive assumptions.
- Chapter 10: `self-improving-ai-10-self-play-and-external-feedback`, NTU PDF pages 46–50, five source slides and four source paper illustrations, 18 Math components.
- Actual lecture topics: 2739–3137 seconds of `s06mSAGN4gM`. Retrieval metadata belongs to `source-assets/10/transcript-provenance.json`, not the article.
- R-Zero uncertainty is based on modal-answer agreement. Table 5 uses GPT-4o as the assumed annotation reference. Figure 3 reports mathematical benchmark averages.
- AZR's piecewise learnability reward is different from R-Zero's triangular reward. The example uses the paper's eight accuracy-estimation samples. Execution verification and generated reasoning language are separate observations.
- SPICE's Reasoner has no source-document access. Its Gaussian variance reward is nonzero at the population-variance endpoints. R-Few's human reward coefficient is not a data mixing ratio.

## Evidence

- Source images and hashes: `source-assets/10/manifest.json`; reproducible renderer: `tools/render_10.py`.
- Arithmetic: `reviews/verify_examples_10.py`, 14 checks; results in `reviews/numeric-checks-10.json`.
- Editorial preservation: `reviews/2026-11-18-editorial-cleanup-01-09.json`.
- Chapter 09 publication is reconciled in `reviews/2026-11-18-chapter-09-publication.json`; Pages attempt 2 build, deploy and live-smoke succeeded.
- The reading audit covers chapters 01–10, every asset/hash/source, exact Math counts, 390/1440px layouts, native details interaction, navigation, and the ten-entry series order.

This is a prepublication source checkpoint. The actual PR, exact merge SHA, Pages outcome and public verification are recorded in the chapter 10 PR after execution. Do not infer deployment from the existence of this file.

## Next authoring work

Chapter 11 begins at PDF page 51 and covers pages 51–55. It moves from self-play to stronger AI systems training weaker models. Apply the reader-facing editorial rules in the main README; do not restore production metadata to the article introduction.

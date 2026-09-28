# Modern AI VI — FCN / U-Net paper-reading expansion

Review date: 2026-09-17. Baseline: main `7f71024a814728507317d7c0aa82bee7bede80b6`.
Article: `site/content/posts/modern-artificial-intelligence-6.mdx`.
Public URL is retained: `/posts/2026-08-25-modern-artificial-intelligence-6/`.

## Why the earlier page was insufficient

The baseline had one short FCN paragraph, two short U-Net paragraphs, five code-drawn concept visuals across Part VI, and ten lecture-source equation calls. It did not include the original FCN/U-Net figures, FCN score-fusion arithmetic, the original U-Net spatial trace, or the original boundary-weight map formula.

The existing `modern-ai-parts6-8-audit.mjs` checks ledger identity, markers, equation/visual counts and source links. Those checks do not establish that every paper's architecture, derivation or experimental logic is explained. They remain enabled and are not relabeled as a paper-depth review. The original lecture PDFs were not independently re-audited in this change.

## Exact primary sources

- Long, Shelhamer, Darrell: https://arxiv.org/html/1411.4038v2 — 2015-03-08.
- Ronneberger, Fischer, Brox: https://arxiv.org/html/1505.04597v1 — 2015-05-18.
- Author project: https://lmb.informatik.uni-freiburg.de/people/ronneber/u-net/.

Acquisition run `35192007481` obtained these exact PDF versions and selected page renders. Run `35192532370` extracted only the five reviewed figure regions. The asset provenance records exact PDF and image hashes, page numbers, crop rectangles, dimensions, authors, transformations and rights distinctions. Complete PDFs are not republished.

## Reading coverage added

| Paper evidence | Reader-facing explanation | Independent worked example / check |
|---|---|---|
| FCN §3.1 / Figure 2 | FC weights reinterpreted as spatial kernels; not all FC layers become 1×1 | Flattened 2×2 inner product equals the corresponding convolution window; four output positions computed |
| FCN §4.2 / Figure 3 | 32s/16s/8s, class-score projection, elementwise sum, alignment | Aligned toy tensor sizes are explicitly not the complete Caffe implementation |
| FCN §3–3.4 | Whole-image spatial loss and shared computation | Gradient-sum equivalence qualified by same parameters, sample distribution, normalization and update |
| FCN Figure 4 / Table 2 | Same-subset ablation; 45.4/59.4/62.4/62.7 | Whole fine-tuning versus skip change distinguished; percentage points not relative percentage |
| FCN §4.3 | Fixed final bilinear upsampling versus learned intermediate layers in v2 | No later implementation settings silently substituted |
| U-Net Figure 1 / §2 | Valid convolutions, down/up paths, feature concat | Full 572→388 trace; skip crops 4/16/40/88; first decoder 512+512=1024 channels; 92 context and 184 tile overlap |
| U-Net §3 Eq. (1) | Original E shown without minus; minimizing NLL explicitly defined as -E | Probability 0.1→0.9 changes log and negative log in opposite directions |
| U-Net Figure 3 / Eq. (2) | Class imbalance plus distance to nearest and second-nearest cell borders | d=(1,1) versus (1,9): 10.2312 versus 2.3534; weighted softmax derivative checked with finite differences |
| U-Net Figure 2 / §3.1 | Mirror context, overlap-tile, elastic augmentation | Feature crop, input mirroring and same padding are distinct operations |
| U-Net §4 | Dataset/evaluation scope | Not FCN-versus-U-Net cross-dataset ranking; 30 images are not 30 patients; semantic class is not instance ID |

New explanatory equations are separate from original `MAI-P6-*` lecture-equation identities. The original ten calls and five concept visuals are retained. The original eight main headings remain, while new Markdown subheadings enter the article's normal table of contents. The generic Dice discussion is explicitly not the original U-Net loss.

## Figure rights and presentation

The selected figures are original diagram excerpts, not newly generated illustrations. Their Korean descriptions are separately authored. They remain third-party material; the arXiv perpetual non-exclusive license is not a Creative Commons grant for this blog, and the repository's MIT code license does not license these figures. No express republication permission is claimed. Publication/reuse review is separate from the technical tests; attribution is not represented as blanket permission.

The figure component exposes source-version links, the source PDF page, alt text and a full-size local image link. Original colors remain on white in both themes. The selected figure is accompanied by substantial analytical commentary and is not used as a decorative substitute for explanation.

## Validation scope

`modern-ai-vi-papers-audit.mjs` checks the actual source table against a computed convolution/pooling/up-convolution trace, toy convolution and transpose arithmetic, boundary weights, a numerical gradient, original/minimization signs, KaTeX parsing, all five asset hashes and retained lecture equations. Six mutations must fail: wrong tensor shape, wrong boundary distance, missing NLL minus sign, silently changed original sign, missing figure and corrupted FCN addition.

`browser-modern-ai-vi-papers.mjs` checks 390px and 1440px in light/dark: all five real images decode, aspect ratio and full-size links, credits, no page overflow, worked-example disclosures and no KaTeX error. Its scope is additive. The original full Blog CI and browser matrix are not reduced or bypassed. A successful automated check is not a complete pedagogical or legal review.

## Still not complete

PSPNet and DeepLabv3/v3+ remain overview-level sections. Their original diagrams, module-level shape traces, ASPP/pyramid details and ablations are not claimed to be expanded here. MRF/ICM also remains an overview. Parts VII/VIII have not been audited for paper-level depth in this change. The existing lecture page-ledger flags are not evidence that these further paper explanations are complete.

For each subsequent paper, require: problem and prior failure; original figure and each operator's role; tensor/coordinate trace; essential equation with symbols, assumptions and a worked calculation; training and label protocol; comparable experimental evidence; limitations and implementation deviations; exact primary-source links. Word count, link count or passing a build cannot substitute for this coverage.

## Release boundary

Changes live on `content/modern-ai-vi-fcn-unet-20260917` until reviewed and approved. Do not report the public page updated merely because a branch or PR exists. Check the exact final head, then main merge and Pages deployment separately. Unrelated NEWS and English PR #113 are outside this change.

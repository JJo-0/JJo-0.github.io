# Modern AI VII/VIII — additional original paper figures

Prepared and inspected: 2026-09-17. Baseline PR #129 head: `4bda642e18348d76cf7e284635360f75337c6789`.

## Scope

Ten original figure excerpts from eight papers are added next to the existing explanations in VII and VIII. This adds four figures to VII and six to VIII. The twelve original figures from earlier steps remain, for twenty-two original figures across VI–VIII. Part VI itself is unchanged. The existing lecture equations, original equations, conceptual visuals, original twelve figures and public routes are not replaced. This is selected-figure commentary, not a translation of complete papers or reproduction of experiments.

| Part | Paper | Version | Figure | Original PDF page |
|---|---|---|---|---|
| VII | Classifier-Free Diffusion Guidance | 2207.12598v1 | 4 | 7 |
| VII | Latent Diffusion Models | 2112.10752v2 | 3 | 4 |
| VII | Score-SDE | 2011.13456v2 | 1, 2 | 2, 4 |
| VIII | Barlow Twins | 2103.03230v3 | 1 | 1 |
| VIII | BYOL | 2006.07733v3 | 2 | 4 |
| VIII | MoCo | 1911.05722v3 | 1, 2 | 1, 3 |
| VIII | DeepCluster | 1807.05520v2 | 1 | 2 |
| VIII | SwAV | 2006.09882v5 | 1 | 4 |

## Source corrections and reading guidance

- CFG Figure 1 is a generation-example panel, not the IS–FID curve. The inserted Figure 4 plots IS on the horizontal axis and FID on the vertical axis. Its legend labels training condition-drop probability, not inference guidance strength. Increasing IS is not a guarantee of decreasing FID; the nearby Table 1 values for p_uncond=0.1 are explicitly distinguished from curve-pixel readings: w=0/0.1/0.2 yields FID 1.80/1.55/2.04. Existing guidance-convention equations remain unchanged.
- LDM Figure 3 separates pixel-space autoencoding, repeated latent-space denoising and conditioning. Q belongs to image features; K/V belong to the encoded condition in cross-attention. The diagram also shows concatenation as another conditioning route, not every condition using one identical operator. It is not a runtime/memory benchmark.
- Score-SDE Figure 1 illustrates forward and reverse stochastic processes. Figure 2, rather than Figure 1, compares stochastic trajectories and the probability-flow ODE. Shared marginals are not identical sample paths. Existing reverse-time signs and the ODE one-half coefficient remain unchanged.
- Barlow Twins Figure 1 forms feature-by-feature cross-correlation, not a batch-by-batch instance similarity matrix. Transfer representations are read before the projector.
- BYOL Figure 2 shows one direction of online encoder/projector/predictor and target encoder/projector with stop-gradient. The second, swapped-view direction and target EMA are explained from the text/equations, not falsely claimed to be additional arrows in that panel.
- MoCo Figure 1 shows the dictionary/queue; Figure 2 compares end-to-end, memory bank and momentum-encoder mechanisms. Its original caption explicitly says queues are not illustrated in Figure 2. Stored key embeddings and slowly updated encoder parameters are different kinds of history.
- DeepCluster Figure 1 depicts feature extraction, clustering and pseudo-label classification. The hard cluster assignment is not presented as a differentiable path through k-means.
- SwAV Figure 1 compares pairwise feature comparison with prediction of assignments across views. Prototype code construction and swapped prediction are not the same operation as directly matching feature vectors.

## Evidence and publication boundary

Acquisition run `35211820585` downloaded the exact eight PDF versions and rendered selected caption pages. The original page text/figures were inspected before choosing rectangles. Render run `35212413204` verified those PDF hashes and produced ten PNG excerpts at 6 pixels per point with PyMuPDF 1.26.7. Each actual PNG was then checked visually against the original page, including labels and panel boundaries. The final manifest binds this check to the actual PNG SHA-256. It also records source URL/version, PDF page, crop rectangle, original PDF digest, PNG dimensions, bytes, digest and immutable Git blob identity.

The evidence workflows are isolated on an operations branch, not in the PR's final file tree. The rendering job only stores unattached immutable image blobs: it never commits, pushes, updates a branch or changes the PR. Final source/file integration is an explicit tree/commit/ref operation after review. A successful acquisition job alone is not a visual-review receipt or a successful public deployment.

Original figures remain third-party material. They are selected excerpts used alongside independently authored analysis, not a replacement for the full papers. Attribution and open online access are not blanket republication permission. No express republication permission, MIT relicensing or Creative Commons grant is claimed. Full PDFs are not republished.

## Validation

The new component has its own data-additional-figure attribute. Existing figure components and their checks remain intact. The additional static audit verifies the exact ten version/figure/part bindings, bytes and image dimensions, review-digest binding, actual insertion order and preservation of all existing equation calls, figure blocks and source-only markers. Eight intentional mutations must be rejected.

The additional browser audit checks VII/VIII at 390px and 1440px in light and dark themes: eight article/viewport/theme cases. Every new figure is activated once per viewport/theme by real CDP mouse or touch input, opens its exact local PNG, and retains natural dimensions. This is forty activations. The audit also checks decode, aspect ratio, captions, source links, page overflow, original colors and existing equation/figure preservation. It is not a separate comprehensive keyboard-accessibility audit.

Existing full Blog CI, the original FCN/U-Net reading suite and the earlier VI–VIII continuation suite remain enabled and unweakened. New checks are additive in the continuation workflow. Results must be recorded against the exact final commit; earlier passing runs cannot establish success for this extension.

## Deliberate remaining exclusions

This change does not add original MRF/ICM, CPC or SupCon figures. It does not copy every ablation plot or all illustrations from the eight selected papers. Such omissions are distinct from the ten figure files explicitly included here. No independent training reproduction, original lecture-PDF re-audit, global educational-completeness claim or public Pages deployment is implied.

# Modern AI III — exact-ID formula lesson migration

Tracking issue: #38

## Source boundary

This migration operates above the protected Modern AI III source layer. It does **not** modify:

- `site/content/posts/modern-artificial-intelligence-3.mdx`
- `src/data/modern-ai-part3/formula-ledger.json`
- `src/data/modern-ai-part3/page-ledger.json`
- `src/data/modern-ai-part3/content-ledger.json`

The existing source audit remains authoritative: **15 pages, 163 formula records, 99 display formulas, 64 inline formulas, 308 content blocks, 7 figures, and 11 annotations**.

## Final Part III partition

All **99 display formulas** now have an approved exact-ID lesson mapping. Part III therefore targets:

- approved formula IDs: **99**
- exact-ID lesson groups: **10**
- staged `unreviewed`: **0**
- `missing`: **0**
- generic fallback renderer: **0**

The ten lesson groups are:

1. perceptron geometry / linear discriminant — 10 IDs
2. perceptron loss / gradient / error-set learning — 16 IDs
3. alternative MSE training and learning-rate bound — 6 IDs
4. XOR geometry and minimum hidden structure — 4 IDs
5. MLP scalar, matrix, batch forward pass, argmax, and softmax — 11 IDs
6. DropOut / DropConnect masking — 2 IDs
7. continuous, discrete, and 2D convolution primitives — 6 IDs
8. convolution exercises, moving average, checkerboard response, separability — 15 IDs
9. finite convolution matrices and zero/extended/periodic/mirror boundaries — 18 IDs
10. local patch matrix, Conv2d shape/parameter accounting, and MaxPool — 11 IDs

## Fail-closed provenance rules

Source blanks, source-suspect equations, editorial completions, and corrected equations remain separate formula records. In particular, the migration preserves the distinctions around:

- line → hyperplane completion and corrected distances;
- perceptron gradient blanks and their completions;
- strict `< 0` source error sets versus corrected `≤ 0` zero-margin sets;
- MSE gradient / learning-rate corrections;
- XOR geometry / minimum-network completions;
- MLP scalar, matrix, weight-matrix, and batch-forward corrections;
- mirrored-kernel, full-convolution, checkerboard-response, separability-saving corrections;
- patch/output-vector and MaxPool completions.

No formula is selected from TeX keywords or a generic formula family. The formula ID selects the exact lesson, focus step, renderer, numerical model, and provenance context.

## Numerical gates

The Part III lesson audit checks deterministic invariants including:

- hyperplane score, sign, margin, and distance consistency;
- completed perceptron gradients and zero-margin error-set behavior;
- MSE Hessian eigenvalue / corrected learning-rate bound and one-step loss decrease;
- XOR classification of all four Boolean inputs;
- MLP tensor shapes and softmax normalization;
- DropOut / DropConnect masks applied to the correct object;
- equivalence of the two discrete-convolution summation forms;
- exact 2D full-convolution exercise output;
- checkerboard moving-average response and separable-convolution saving;
- zero/extended/periodic convolution matrices and circulant residual;
- patch design-matrix multiplication, Conv2d output shape/parameter count, and exact MaxPool output.

## Compatibility boundary

The completed Part I–II contract remains independent and unchanged:

- **303** protected display formulas
- **108** approved
- **195** `no-visual-with-reason`
- **0** unreviewed
- **16** exact-ID lesson groups
- one section-level K-fold concept lesson

Part III reuses the same disclosure-local lazy runtime and remains isolated from the Home/Research Three.js renderer.
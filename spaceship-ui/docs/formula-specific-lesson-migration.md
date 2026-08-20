# Formula-specific lesson migration

Tracking issue: [#38](https://github.com/JJo-0/JJo-0.github.io/issues/38)

## Contract

A reader-facing visual is selected only by an exact formula ID.

```text
formulaId
  -> FormulaLessonRef
  -> FormulaLessonSpec
  -> pure math model
  -> synchronized equation / table / visualization / checks
```

Unreviewed formulas render no visual. They never fall back to a generic Gaussian, matrix, gradient, or `y=x²` scene.

## Approved lessons

### 1. Dot-product prediction

`MAI-P2-017` decomposes `wᵀx` into the individual products `wᵢxᵢ`, their signed contributions, and their sum.

### 2. Least squares to normal equation

`MAI-P2-020`–`MAI-P2-027` share one `X`, `y`, and `w` across prediction, residual, MSE, gradient, `XᵀX`, `Xᵀy`, the normal equation, and the solution.

### 3. Residual-gradient chain rule

`MAI-P2-028`–`MAI-P2-030` trace `x -> Ax -> residual -> weighted residual -> 2Aᵀ -> gradient`. The analytical gradient is checked against central finite differences.

### 4. Sample sums to matrix notation

`MAI-P2-031`–`MAI-P2-033` accumulate `xₗxₗᵀ` into `XᵀX` and verify that `Σₗ(wᵀxₗ-yₗ)² = ||Xw-y||₂²`.

### 5. Test MSE and expected generalization gap

`MAI-P2-034` and `MAI-P2-035` now keep the source procedure explicit:

1. fit `w★` using only the training set;
2. evaluate that fixed model on an independent test set;
3. repeat the complete sample–fit–test procedure to interpret the expectation inequality.

The lesson contains selectable test residuals, an exact squared-error table, and a deterministic 80-trial illustration. It also shows that an individual split may reverse the inequality even though the repeated average has larger test error. The repeated experiment is labeled as an illustration, not a proof.

### 6. Ridge regularization

`MAI-P2-036` uses the source-aligned setup: a quadratic generating function, a degree-9 fitted model, and a variable weight-decay strength `λ`.

The same computation controls the curve, `MSE_train`, every coefficient, `||w||²`, every `λwₖ²` contribution, the penalty, and the total objective `MSE_train + λ||w||²`. A Chebyshev basis on the interval from -1 to 1 is used for numerical stability and is disclosed in the lesson.

## Current inventory

- Part I display formulas: 238
- Part II display formulas: 65
- Total: 303
- Approved formula IDs: 18
- Exact lesson groups: 6
- Unreviewed formulas: 285

Protected formula TeX, SHA-256 records, source page mappings, and source-status distinctions remain unchanged.

## Next work

1. K-fold cross-validation requires a section-level concept lesson because the source provides a procedure and figure but no display formula ID.
2. SVM margin, sigmoid, and kernel feature mapping.
3. Minimum-distance prototypes and perpendicular-bisector boundaries.
4. Bayes posterior, evidence normalization, and Bayes risk.
5. Gaussian QDA to LDA to minimum-distance hierarchy.
6. Naive Bayes and dimensionality growth.
7. Part I linear algebra, probability, and optimization.
8. Apply the same exact-ID contract to Modern AI III–VIII.

## Fail-closed audit

The audit verifies the 303-item inventory, the exact 18-item approved set, absence of renderers for unreviewed formulas, numerical oracles for every implemented lesson, `test SSE / M = test MSE`, a positive repeated generalization gap with individual reversed splits, ridge objective decomposition, coefficient shrinkage as `λ` increases, lazy dynamic loading, built lesson-host counts, and all existing Part I and Part II source contracts.

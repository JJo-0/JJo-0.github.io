# Formula-specific lesson migration

Tracking issue: [#38](https://github.com/JJo-0/JJo-0.github.io/issues/38)

## Contract

Every protected display equation has an explicit review state selected by its exact formula ID.

```text
formulaId
  -> FormulaLessonRef
  -> FormulaLessonSpec
  -> pure math model
  -> synchronized equation / table / visualization / checks
```

Production never chooses a visualization from TeX keyword heuristics. An equation is either mapped to an approved exact-ID lesson or explicitly marked `no-visual-with-reason`. The migration-only `unreviewed` state is now zero.

## Completed Part II golden lessons

1. **Dot-product prediction** — `MAI-P2-017`.
2. **Least squares → normal equation** — `MAI-P2-020`–`MAI-P2-027`.
3. **Residual-gradient chain rule** — `MAI-P2-028`–`MAI-P2-030`.
4. **Sample sums → matrix notation** — `MAI-P2-031`–`MAI-P2-033`.
5. **Test MSE / expected generalization gap** — `MAI-P2-034`–`MAI-P2-035`.
6. **Ridge / weight decay** — `MAI-P2-036`.
7. **SVM, sigmoid, feature map, and kernel trick** — `MAI-P2-044`–`MAI-P2-048`.
8. **Minimum-distance prototypes and perpendicular-bisector boundary** — reviewed display equations in `MAI-P2-050`–`MAI-P2-057`.
9. **Bayes posterior, evidence normalization, loss, and conditional risk** — reviewed display equations in `MAI-P2-062`–`MAI-P2-079`.
10. **Gaussian discriminants: QDA → LDA → minimum-distance limit** — reviewed display equations in `MAI-P2-081`–`MAI-P2-099`.
11. **Naive Bayes and the class-prior correction** — `MAI-P2-102` and `MAI-P2-103`.
12. **Dimensionality growth / feature-observation imbalance** — `MAI-P2-100`.

K-fold cross-validation is intentionally a **section-level concept lesson**, not a fabricated formula lesson, because the protected source presents a procedure and figure rather than a display equation. It is mounted between source markers `P2-C084` and `P2-C085`.

Source provenance remains explicit. In particular, source blanks and editorial completions (`066/067`, `075/076`), the suspect/corrected one-dimensional Gaussian pair (`087/088`), and the source-suspect/corrected Naive Bayes pair (`102/103`) remain distinct.

## Completed Part I primitives

Four reusable exact-ID lesson groups cover the foundations needed by later Modern AI parts:

- **Linear algebra primitives** — dot/outer products, matrix products, norms, rank, inverse, orthogonal norm preservation, determinant.
- **Eigen / covariance primitives** — quadratic forms, eigenvalue relations, covariance construction, positive definiteness, eigendecomposition, decorrelation.
- **Probability primitives** — CDF/PDF, independence, expectation, covariance, conditional probability, conditional expectation.
- **Optimization primitives** — expected/empirical risk, MSE, gradient, stationarity, Hessian/positive definiteness, gradient descent, mini-batches.

These primitives are selected only for equations where an interactive, derivational, or structural visualization adds faithful information. Supporting definitions, duplicate identities, and equations whose natural interactive treatment belongs to a later series part are explicitly `no-visual-with-reason` rather than receiving a generic placeholder.

## Final Part I–II inventory

- Part I display formulas: **238**
- Part II display formulas: **65**
- Total protected display formulas: **303**
- Approved formula IDs: **108**
- Exact formula lesson groups: **16**
- Section-level concept lessons: **1** (`K-fold`)
- `no-visual-with-reason`: **195**
- `unreviewed`: **0**
- Generic fallback renderers in production: **0**

Protected formula TeX, SHA-256 records, PDF page mappings, source equation numbers, and source-status distinctions are unchanged.

## Fail-closed validation

`modern-ai-formula-lesson-audit.mjs` verifies the 303-item inventory and exact state partition (`108 + 195 + 0`), exact-ID renderer selection, K-fold section placement, lazy disclosure-local loading, mobile-safe layout/reduced-motion behavior, and deterministic numerical invariants across all lesson models.

Representative invariants include:

- every K-fold sample appears in exactly one held-out fold and train/test indices are disjoint;
- explicit feature-map inner products agree with the corresponding kernel computation;
- nearest-distance and maximum-discriminant classifications agree;
- Bayes posterior probabilities sum to one and 0–1 minimum risk agrees with MAP;
- Gaussian covariance matrices are symmetric and the QDA → LDA → minimum-distance hierarchy is numerically consistent under the stated assumptions;
- corrected Naive Bayes scores retain class priors;
- matrix-product outer-sum decompositions agree with direct multiplication;
- trace/determinant identities agree with eigenvalues;
- variances are non-negative and conditional distributions normalize to one;
- stable gradient-descent settings converge while an intentionally excessive learning rate demonstrates instability;
- all previously approved least-squares, residual-gradient, generalization-gap, and ridge invariants remain enforced.

The same CI run also preserves the Part I formula SHA-256 contract, Part II 13-page / 103-formula / 65-display-formula source ledger, taxonomy, legacy redirects, article isolation from the Three.js renderer, and rendered-content checks.

## Follow-up after PR #40

PR #40 completes the Part I–II migration milestone. Issue #38 remains the umbrella for applying the same exact-ID contract to Modern AI III–VIII as those parts are authored and published.

export const DOT_PRODUCT_PREDICTION_FORMULA_ID = 'MAI-P2-017';

function focusMap(entries) { return new Map(entries); }

export const NORMAL_EQUATION_FOCUS = focusMap([
  ['MAI-P2-020', ['mse', 'approved-interactive']],
  ['MAI-P2-021', ['stationarity', 'approved-derivation']],
  ['MAI-P2-022', ['gradient-of-mse', 'approved-derivation']],
  ['MAI-P2-023', ['norm-to-quadratic', 'approved-derivation']],
  ['MAI-P2-024', ['expand-quadratic', 'approved-derivation']],
  ['MAI-P2-025', ['differentiate', 'approved-derivation']],
  ['MAI-P2-026', ['normal-equation', 'approved-interactive']],
  ['MAI-P2-027', ['solve-normal-equation', 'approved-interactive']],
]);
export const RESIDUAL_GRADIENT_FOCUS = focusMap([
  ['MAI-P2-028', ['weighted-residual-gradient', 'approved-interactive']],
  ['MAI-P2-029', ['scalar-chain-rule', 'approved-interactive']],
  ['MAI-P2-030', ['unweighted-residual-gradient', 'approved-interactive']],
]);
export const SAMPLE_MATRIX_FOCUS = focusMap([
  ['MAI-P2-031', ['outer-product-accumulation', 'approved-interactive']],
  ['MAI-P2-032', ['samplewise-objective', 'approved-derivation']],
  ['MAI-P2-033', ['stacked-objective', 'approved-derivation']],
]);
export const GENERALIZATION_GAP_FOCUS = focusMap([
  ['MAI-P2-034', ['test-mse', 'approved-interactive']],
  ['MAI-P2-035', ['expected-gap', 'approved-interactive']],
]);
export const RIDGE_REGULARIZATION_FOCUS = focusMap([
  ['MAI-P2-036', ['ridge-objective', 'approved-interactive']],
]);

export const SVM_KERNEL_FOCUS = focusMap([
  ['MAI-P2-044', ['sigmoid-footnote', 'approved-interactive']],
  ['MAI-P2-045', ['linear-representer-sum', 'approved-derivation']],
  ['MAI-P2-046', ['feature-map-kernel-identity', 'approved-derivation']],
  ['MAI-P2-047', ['kernel-score', 'approved-interactive']],
  ['MAI-P2-048', ['gaussian-kernel', 'approved-interactive']],
]);
export const MINIMUM_DISTANCE_FOCUS = focusMap([
  ['MAI-P2-050', ['class-prototype', 'approved-interactive']],
  ['MAI-P2-051', ['euclidean-distance', 'approved-interactive']],
  ['MAI-P2-052', ['nearest-class-rule', 'approved-derivation']],
  ['MAI-P2-054', ['distance-discriminant', 'approved-derivation']],
  ['MAI-P2-055', ['max-discriminant-rule', 'approved-derivation']],
  ['MAI-P2-056', ['decision-boundary', 'approved-derivation']],
  ['MAI-P2-057', ['perpendicular-bisector', 'approved-interactive']],
]);
export const BAYES_DECISION_FOCUS = focusMap([
  ['MAI-P2-062', ['zero-one-loss', 'approved-structure']],
  ['MAI-P2-063', ['conditional-risk', 'approved-interactive']],
  ['MAI-P2-064', ['bayes-rule', 'approved-derivation']],
  ['MAI-P2-065', ['joint-factorization', 'approved-derivation']],
  ['MAI-P2-066', ['source-blank-posterior', 'approved-structure']],
  ['MAI-P2-067', ['completed-posterior', 'approved-interactive']],
  ['MAI-P2-068', ['risk-with-evidence', 'approved-derivation']],
  ['MAI-P2-069', ['risk-common-factor-removed', 'approved-derivation']],
  ['MAI-P2-070', ['minimum-risk-rule', 'approved-derivation']],
  ['MAI-P2-071', ['kronecker-zero-one-loss', 'approved-structure']],
  ['MAI-P2-074', ['zero-one-risk-sum', 'approved-derivation']],
  ['MAI-P2-075', ['source-blank-risk', 'approved-structure']],
  ['MAI-P2-076', ['completed-zero-one-risk', 'approved-interactive']],
  ['MAI-P2-077', ['risk-comparison', 'approved-derivation']],
  ['MAI-P2-078', ['likelihood-prior-comparison', 'approved-derivation']],
  ['MAI-P2-079', ['bayes-discriminant', 'approved-interactive']],
]);
export const GAUSSIAN_DISCRIMINANT_FOCUS = focusMap([
  ['MAI-P2-081', ['multivariate-gaussian', 'approved-structure']],
  ['MAI-P2-082', ['class-mean', 'approved-derivation']],
  ['MAI-P2-083', ['class-covariance', 'approved-derivation']],
  ['MAI-P2-084', ['sample-mean', 'approved-derivation']],
  ['MAI-P2-085', ['sample-covariance', 'approved-derivation']],
  ['MAI-P2-087', ['source-suspect-one-dimensional-density', 'approved-structure']],
  ['MAI-P2-088', ['corrected-one-dimensional-density', 'approved-interactive']],
  ['MAI-P2-089', ['equal-discriminant-boundary', 'approved-interactive']],
  ['MAI-P2-090', ['equal-priors', 'approved-structure']],
  ['MAI-P2-091', ['density-intersection', 'approved-interactive']],
  ['MAI-P2-092', ['log-discriminant', 'approved-derivation']],
  ['MAI-P2-093', ['expanded-log-gaussian', 'approved-derivation']],
  ['MAI-P2-094', ['qda-discriminant', 'approved-interactive']],
  ['MAI-P2-096', ['lda-discriminant', 'approved-interactive']],
  ['MAI-P2-099', ['minimum-distance-limit', 'approved-derivation']],
]);
export const NAIVE_BAYES_FOCUS = focusMap([
  ['MAI-P2-102', ['source-suspect-prior-omission', 'approved-structure']],
  ['MAI-P2-103', ['corrected-map-naive-bayes', 'approved-interactive']],
]);
export const DIMENSION_GROWTH_FOCUS = focusMap([
  ['MAI-P2-100', ['feature-observation-imbalance', 'approved-interactive']],
]);

export const P1_LINEAR_ALGEBRA_FOCUS = focusMap([
  ['MAI2-013', ['dot-product', 'approved-interactive']],
  ['MAI2-015', ['outer-product', 'approved-interactive']],
  ['MAI2-016', ['matrix-vector-product', 'approved-interactive']],
  ['MAI2-021', ['matrix-product-dimensions', 'approved-structure']],
  ['MAI2-022', ['matrix-product-entry', 'approved-derivation']],
  ['MAI2-024', ['outer-sum-matrix-product', 'approved-interactive']],
  ['MAI3-010', ['euclidean-norm', 'approved-interactive']],
  ['MAI3-011', ['norm-as-dot-product', 'approved-derivation']],
  ['MAI3-019', ['frobenius-norm', 'approved-interactive']],
  ['MAI3-023', ['rank-bound', 'approved-structure']],
  ['MAI3-027', ['inverse-definition', 'approved-interactive']],
  ['MAI3-035', ['orthogonal-norm-preservation', 'approved-structure']],
  ['MAI3-039', ['determinant-area-example', 'approved-interactive']],
]);
export const P1_EIGEN_COVARIANCE_FOCUS = focusMap([
  ['MAI4-001', ['quadratic-form', 'approved-interactive']],
  ['MAI4-008', ['eigen-equation', 'approved-interactive']],
  ['MAI4-009', ['trace-eigenvalues', 'approved-derivation']],
  ['MAI4-010', ['determinant-eigenvalues', 'approved-derivation']],
  ['MAI4-011', ['rank-nonzero-eigenvalues', 'approved-structure']],
  ['MAI7-012', ['covariance-from-correlation', 'approved-derivation']],
  ['MAI7-013', ['independent-diagonal-covariance', 'approved-structure']],
  ['MAI7-014', ['positive-definite-quadratic-form', 'approved-interactive']],
  ['MAI7-015', ['covariance-eigendecomposition', 'approved-interactive']],
  ['MAI7-016', ['decorrelating-rotation', 'approved-interactive']],
]);
export const P1_PROBABILITY_FOCUS = focusMap([
  ['MAI6-001', ['cdf', 'approved-structure']],
  ['MAI6-003', ['pdf-from-cdf', 'approved-derivation']],
  ['MAI6-006', ['independence-factorization', 'approved-structure']],
  ['MAI6-007', ['expectation', 'approved-interactive']],
  ['MAI6-008', ['expectation-of-function', 'approved-derivation']],
  ['MAI6-012', ['covariance', 'approved-interactive']],
  ['MAI6-024', ['conditional-probability', 'approved-structure']],
  ['MAI6-032', ['conditional-expectation-at-y', 'approved-interactive']],
  ['MAI6-033', ['conditional-expectation-random-variable', 'approved-derivation']],
]);
export const P1_OPTIMIZATION_FOCUS = focusMap([
  ['MAI8-001', ['expected-risk-objective', 'approved-structure']],
  ['MAI8-002', ['empirical-risk-approximation', 'approved-derivation']],
  ['MAI8-003', ['mse-objective', 'approved-interactive']],
  ['MAI8-005', ['gradient-vector', 'approved-interactive']],
  ['MAI8-006', ['stationarity', 'approved-derivation']],
  ['MAI8-007', ['positive-definite-hessian', 'approved-structure']],
  ['MAI8-008', ['hessian-entries', 'approved-structure']],
  ['MAI8-009', ['gradient-descent-update', 'approved-interactive']],
  ['MAI8-010', ['sample-gradient', 'approved-derivation']],
  ['MAI8-011', ['minibatch-partition', 'approved-structure']],
  ['MAI8-012', ['minibatch-update', 'approved-interactive']],
  ['MAI8-013', ['empirical-loss-sum', 'approved-derivation']],
]);

const GROUPS = [
  [NORMAL_EQUATION_FOCUS, 'p2-normal-equation', 'NormalEquationLesson'],
  [RESIDUAL_GRADIENT_FOCUS, 'p2-residual-gradient', 'ResidualGradientLesson'],
  [SAMPLE_MATRIX_FOCUS, 'p2-sample-matrix-assembly', 'SampleMatrixAssemblyLesson'],
  [GENERALIZATION_GAP_FOCUS, 'p2-generalization-gap', 'GeneralizationGapLesson'],
  [RIDGE_REGULARIZATION_FOCUS, 'p2-ridge-regularization', 'RidgeRegularizationLesson'],
  [SVM_KERNEL_FOCUS, 'p2-svm-kernel', 'SvmKernelLesson'],
  [MINIMUM_DISTANCE_FOCUS, 'p2-minimum-distance', 'MinimumDistanceLesson'],
  [BAYES_DECISION_FOCUS, 'p2-bayes-decision', 'BayesDecisionLesson'],
  [GAUSSIAN_DISCRIMINANT_FOCUS, 'p2-gaussian-discriminant', 'GaussianDiscriminantLesson'],
  [NAIVE_BAYES_FOCUS, 'p2-naive-bayes', 'NaiveBayesLesson'],
  [DIMENSION_GROWTH_FOCUS, 'p2-dimension-growth', 'DimensionGrowthLesson'],
  [P1_LINEAR_ALGEBRA_FOCUS, 'p1-linear-algebra-primitives', 'LinearAlgebraPrimitivesLesson'],
  [P1_EIGEN_COVARIANCE_FOCUS, 'p1-eigen-covariance', 'EigenCovarianceLesson'],
  [P1_PROBABILITY_FOCUS, 'p1-probability-primitives', 'ProbabilityPrimitivesLesson'],
  [P1_OPTIMIZATION_FOCUS, 'p1-optimization-primitives', 'OptimizationPrimitivesLesson'],
];

export const APPROVED_FORMULA_IDS = Object.freeze([
  DOT_PRODUCT_PREDICTION_FORMULA_ID,
  ...GROUPS.flatMap(([map]) => [...map.keys()]),
]);

function mapLessonOverride(focusMap, formulaId, lessonId, renderer) {
  const entry = focusMap.get(formulaId); if (!entry) return null;
  const [focus,state]=entry;
  const mode=state==='approved-derivation'?'derivation':state==='approved-structure'?'structure':'interactive';
  return {lessonId,focus,state,mode,renderer};
}

export function getApprovedLessonOverride(formulaId) {
  if (formulaId === DOT_PRODUCT_PREDICTION_FORMULA_ID) return {lessonId:'p2-dot-product-prediction',focus:'feature-contributions',state:'approved-interactive',mode:'interactive',renderer:'DotProductPredictionLesson'};
  for (const [map,lessonId,renderer] of GROUPS) {
    const override=mapLessonOverride(map,formulaId,lessonId,renderer); if (override) return override;
  }
  return null;
}

export function getNoVisualReason(formulaId, source) {
  if (source?.part === 2) return 'Part II golden review complete: this display item is supporting notation/definition rather than a distinct manipulable computation. The calculation walkthrough is the intentional reader-facing representation.';
  if (source?.part === 1) {
    if (formulaId.startsWith('MAI5-')) return 'Perceptron/CNN identities are intentionally left without a duplicate visual in Part I because their full interactive treatment belongs to Modern AI III. The equation and calculation walkthrough remain canonical here.';
    return 'Part I migration review complete: this equation is a supporting identity, definition, or duplicate view of a primitive already represented by an exact-ID lesson group. A second generic visual would add no faithful information.';
  }
  return null;
}

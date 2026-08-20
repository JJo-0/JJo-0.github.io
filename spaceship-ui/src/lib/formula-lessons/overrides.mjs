export const DOT_PRODUCT_PREDICTION_FORMULA_ID = 'MAI-P2-017';

export const NORMAL_EQUATION_FOCUS = new Map([
  ['MAI-P2-020', ['mse', 'approved-interactive']],
  ['MAI-P2-021', ['stationarity', 'approved-derivation']],
  ['MAI-P2-022', ['gradient-of-mse', 'approved-derivation']],
  ['MAI-P2-023', ['norm-to-quadratic', 'approved-derivation']],
  ['MAI-P2-024', ['expand-quadratic', 'approved-derivation']],
  ['MAI-P2-025', ['differentiate', 'approved-derivation']],
  ['MAI-P2-026', ['normal-equation', 'approved-interactive']],
  ['MAI-P2-027', ['solve-normal-equation', 'approved-interactive']],
]);

export const RESIDUAL_GRADIENT_FOCUS = new Map([
  ['MAI-P2-028', ['weighted-residual-gradient', 'approved-interactive']],
  ['MAI-P2-029', ['scalar-chain-rule', 'approved-interactive']],
  ['MAI-P2-030', ['unweighted-residual-gradient', 'approved-interactive']],
]);

export const SAMPLE_MATRIX_FOCUS = new Map([
  ['MAI-P2-031', ['outer-product-accumulation', 'approved-interactive']],
  ['MAI-P2-032', ['samplewise-objective', 'approved-derivation']],
  ['MAI-P2-033', ['stacked-objective', 'approved-derivation']],
]);

export const GENERALIZATION_GAP_FOCUS = new Map([
  ['MAI-P2-034', ['test-mse', 'approved-interactive']],
  ['MAI-P2-035', ['expected-gap', 'approved-interactive']],
]);

export const RIDGE_REGULARIZATION_FOCUS = new Map([
  ['MAI-P2-036', ['ridge-objective', 'approved-interactive']],
]);

export const APPROVED_FORMULA_IDS = Object.freeze([
  DOT_PRODUCT_PREDICTION_FORMULA_ID,
  ...NORMAL_EQUATION_FOCUS.keys(),
  ...RESIDUAL_GRADIENT_FOCUS.keys(),
  ...SAMPLE_MATRIX_FOCUS.keys(),
  ...GENERALIZATION_GAP_FOCUS.keys(),
  ...RIDGE_REGULARIZATION_FOCUS.keys(),
]);

function mapLessonOverride(focusMap, formulaId, lessonId, renderer) {
  const entry = focusMap.get(formulaId);
  if (!entry) return null;
  const [focus, state] = entry;
  return {
    lessonId,
    focus,
    state,
    mode: state === 'approved-derivation' ? 'derivation' : 'interactive',
    renderer,
  };
}

export function getApprovedLessonOverride(formulaId) {
  if (formulaId === DOT_PRODUCT_PREDICTION_FORMULA_ID) {
    return {
      lessonId: 'p2-dot-product-prediction',
      focus: 'feature-contributions',
      state: 'approved-interactive',
      mode: 'interactive',
      renderer: 'DotProductPredictionLesson',
    };
  }

  return (
    mapLessonOverride(
      NORMAL_EQUATION_FOCUS,
      formulaId,
      'p2-normal-equation',
      'NormalEquationLesson',
    ) ||
    mapLessonOverride(
      RESIDUAL_GRADIENT_FOCUS,
      formulaId,
      'p2-residual-gradient',
      'ResidualGradientLesson',
    ) ||
    mapLessonOverride(
      SAMPLE_MATRIX_FOCUS,
      formulaId,
      'p2-sample-matrix-assembly',
      'SampleMatrixAssemblyLesson',
    ) ||
    mapLessonOverride(
      GENERALIZATION_GAP_FOCUS,
      formulaId,
      'p2-generalization-gap',
      'GeneralizationGapLesson',
    ) ||
    mapLessonOverride(
      RIDGE_REGULARIZATION_FOCUS,
      formulaId,
      'p2-ridge-regularization',
      'RidgeRegularizationLesson',
    )
  );
}

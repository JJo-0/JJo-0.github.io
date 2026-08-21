function focusMap(entries) {
  return new Map(entries);
}

export const P3_PERCEPTRON_GEOMETRY_FOCUS = focusMap([
  ['MAI-P3-006', ['two-dimensional-hyperplane', 'approved-interactive']],
  ['MAI-P3-007', ['summation-hyperplane', 'approved-derivation']],
  ['MAI-P3-008', ['vector-hyperplane', 'approved-derivation']],
  ['MAI-P3-010', ['decision-rule', 'approved-interactive']],
  ['MAI-P3-011', ['sign-activation', 'approved-structure']],
  ['MAI-P3-018', ['classwise-separability', 'approved-structure']],
  ['MAI-P3-019', ['margin-condition', 'approved-derivation']],
  ['MAI-P3-141', ['line-to-hyperplane-mapping', 'approved-derivation']],
  ['MAI-P3-142', ['corrected-origin-distance', 'approved-interactive']],
  ['MAI-P3-143', ['corrected-point-distance', 'approved-interactive']],
]);

export const P3_PERCEPTRON_LEARNING_FOCUS = focusMap([
  ['MAI-P3-020', ['separability-condition', 'approved-structure']],
  ['MAI-P3-021', ['raw-margin-objective', 'approved-structure']],
  ['MAI-P3-022', ['perceptron-loss', 'approved-derivation']],
  ['MAI-P3-023', ['source-blank-weight-gradient', 'approved-structure']],
  ['MAI-P3-024', ['source-blank-bias-gradient', 'approved-structure']],
  ['MAI-P3-025', ['full-sample-weight-update', 'approved-interactive']],
  ['MAI-P3-026', ['full-sample-bias-update', 'approved-interactive']],
  ['MAI-P3-030', ['source-strict-error-set', 'approved-structure']],
  ['MAI-P3-031', ['error-set-loss', 'approved-interactive']],
  ['MAI-P3-034', ['error-set-weight-update', 'approved-interactive']],
  ['MAI-P3-035', ['error-set-bias-update', 'approved-interactive']],
  ['MAI-P3-036', ['source-iterative-strict-error-set', 'approved-structure']],
  ['MAI-P3-144', ['completed-weight-gradient', 'approved-derivation']],
  ['MAI-P3-145', ['completed-bias-gradient', 'approved-derivation']],
  ['MAI-P3-162', ['corrected-zero-margin-error-set', 'approved-interactive']],
  ['MAI-P3-163', ['corrected-iterative-error-set', 'approved-interactive']],
]);

const GROUPS = [
  [P3_PERCEPTRON_GEOMETRY_FOCUS, 'p3-perceptron-geometry', 'PerceptronGeometryLesson'],
  [P3_PERCEPTRON_LEARNING_FOCUS, 'p3-perceptron-learning', 'PerceptronLearningLesson'],
];

export const PART3_APPROVED_FORMULA_IDS = Object.freeze(
  GROUPS.flatMap(([map]) => [...map.keys()]),
);

function mapLessonOverride(map, formulaId, lessonId, renderer) {
  const entry = map.get(formulaId);
  if (!entry) return null;
  const [focus, state] = entry;
  const mode = state === 'approved-derivation'
    ? 'derivation'
    : state === 'approved-structure'
      ? 'structure'
      : 'interactive';
  return { lessonId, focus, state, mode, renderer };
}

export function getPart3ApprovedLessonOverride(formulaId) {
  for (const [map, lessonId, renderer] of GROUPS) {
    const override = mapLessonOverride(map, formulaId, lessonId, renderer);
    if (override) return override;
  }
  return null;
}

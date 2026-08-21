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

export const P3_MSE_FOCUS = focusMap([
  ['MAI-P3-038', ['mse-objective', 'approved-interactive']],
  ['MAI-P3-043', ['source-blank-mse-gradient', 'approved-structure']],
  ['MAI-P3-044', ['mse-gradient-update', 'approved-interactive']],
  ['MAI-P3-146', ['completed-mse-gradient', 'approved-derivation']],
  ['MAI-P3-147', ['corrected-learning-rate-bound', 'approved-interactive']],
  ['MAI-P3-161', ['corrected-mse-nonnegativity', 'approved-structure']],
]);

export const P3_XOR_FOCUS = focusMap([
  ['MAI-P3-049', ['source-blank-xor-boundary', 'approved-structure']],
  ['MAI-P3-050', ['source-blank-minimum-units', 'approved-structure']],
  ['MAI-P3-148', ['completed-xor-geometry', 'approved-interactive']],
  ['MAI-P3-149', ['completed-minimum-network', 'approved-structure']],
]);

export const P3_MLP_FOCUS = focusMap([
  ['MAI-P3-052', ['output-argmax', 'approved-structure']],
  ['MAI-P3-053', ['source-suspect-scalar-forward', 'approved-structure']],
  ['MAI-P3-056', ['softmax-output', 'approved-interactive']],
  ['MAI-P3-057', ['source-suspect-matrix-forward', 'approved-structure']],
  ['MAI-P3-060', ['source-blank-weight-matrix', 'approved-structure']],
  ['MAI-P3-066', ['batch-input-matrix', 'approved-structure']],
  ['MAI-P3-068', ['source-suspect-batch-forward', 'approved-structure']],
  ['MAI-P3-150', ['completed-weight-matrix', 'approved-derivation']],
  ['MAI-P3-151', ['corrected-scalar-forward', 'approved-derivation']],
  ['MAI-P3-152', ['corrected-matrix-forward', 'approved-derivation']],
  ['MAI-P3-153', ['corrected-batch-forward', 'approved-derivation']],
]);

export const P3_REGULARIZATION_FOCUS = focusMap([
  ['MAI-P3-058', ['dropout-mask', 'approved-interactive']],
  ['MAI-P3-059', ['dropconnect-mask', 'approved-interactive']],
]);

export const P3_CONVOLUTION_PRIMITIVES_FOCUS = focusMap([
  ['MAI-P3-071', ['continuous-convolution', 'approved-interactive']],
  ['MAI-P3-072', ['discrete-convolution-form-a', 'approved-derivation']],
  ['MAI-P3-073', ['discrete-convolution-form-b', 'approved-derivation']],
  ['MAI-P3-074', ['delta-decomposition', 'approved-structure']],
  ['MAI-P3-075', ['lsi-superposition', 'approved-derivation']],
  ['MAI-P3-076', ['two-dimensional-convolution', 'approved-interactive']],
]);

export const P3_CONVOLUTION_EXERCISES_FOCUS = focusMap([
  ['MAI-P3-079', ['full-support-size', 'approved-structure']],
  ['MAI-P3-080', ['source-kernel', 'approved-structure']],
  ['MAI-P3-081', ['source-blank-mirrored-kernel', 'approved-structure']],
  ['MAI-P3-082', ['source-image', 'approved-structure']],
  ['MAI-P3-083', ['source-partial-convolution-output', 'approved-structure']],
  ['MAI-P3-084', ['moving-average-kernel', 'approved-interactive']],
  ['MAI-P3-085', ['checkerboard-signal', 'approved-structure']],
  ['MAI-P3-086', ['checkerboard-patch', 'approved-structure']],
  ['MAI-P3-087', ['source-blank-checker-response', 'approved-structure']],
  ['MAI-P3-088', ['direct-computation-count', 'approved-interactive']],
  ['MAI-P3-091', ['separable-convolution', 'approved-derivation']],
  ['MAI-P3-154', ['completed-mirrored-kernel', 'approved-derivation']],
  ['MAI-P3-155', ['completed-full-convolution', 'approved-interactive']],
  ['MAI-P3-156', ['completed-checker-response', 'approved-interactive']],
  ['MAI-P3-157', ['completed-separable-saving', 'approved-interactive']],
]);

export const P3_BOUNDARY_MATRIX_FOCUS = focusMap([
  ['MAI-P3-097', ['finite-convolution-sum', 'approved-interactive']],
  ['MAI-P3-098', ['global-matrix-form', 'approved-derivation']],
  ['MAI-P3-100', ['three-tap-impulse-response', 'approved-structure']],
  ['MAI-P3-101', ['zero-boundary-matrix', 'approved-interactive']],
  ['MAI-P3-102', ['extended-boundary-matrix', 'approved-interactive']],
  ['MAI-P3-103', ['periodic-boundary-matrix', 'approved-interactive']],
  ['MAI-P3-104', ['output-vectorization', 'approved-structure']],
  ['MAI-P3-106', ['impulse-decomposition', 'approved-derivation']],
  ['MAI-P3-107', ['kronecker-impulse', 'approved-structure']],
  ['MAI-P3-110', ['toeplitz-system-matrix', 'approved-structure']],
  ['MAI-P3-111', ['toeplitz-index-rule', 'approved-derivation']],
  ['MAI-P3-112', ['extended-system-form', 'approved-interactive']],
  ['MAI-P3-116', ['circular-convolution', 'approved-interactive']],
  ['MAI-P3-117', ['periodized-impulse-response', 'approved-derivation']],
  ['MAI-P3-118', ['modulo-definition', 'approved-interactive']],
  ['MAI-P3-119', ['finite-periodized-kernel', 'approved-derivation']],
  ['MAI-P3-120', ['circulant-matrix', 'approved-interactive']],
  ['MAI-P3-122', ['mirror-boundary-rule', 'approved-interactive']],
]);

export const P3_PATCH_CNN_FOCUS = focusMap([
  ['MAI-P3-126', ['patch-window', 'approved-interactive']],
  ['MAI-P3-128', ['source-suspect-patch-vector', 'approved-structure']],
  ['MAI-P3-129', ['filter-vector', 'approved-structure']],
  ['MAI-P3-133', ['patch-design-matrix', 'approved-interactive']],
  ['MAI-P3-134', ['source-suspect-output-vector', 'approved-structure']],
  ['MAI-P3-136', ['patch-matrix-product', 'approved-derivation']],
  ['MAI-P3-138', ['conv2d-source-setup', 'approved-interactive']],
  ['MAI-P3-140', ['source-partial-maxpool', 'approved-structure']],
  ['MAI-P3-158', ['corrected-patch-vector', 'approved-derivation']],
  ['MAI-P3-159', ['corrected-output-vector', 'approved-derivation']],
  ['MAI-P3-160', ['completed-maxpool-output', 'approved-interactive']],
]);

const GROUPS = [
  [P3_PERCEPTRON_GEOMETRY_FOCUS, 'p3-perceptron-geometry', 'PerceptronGeometryLesson'],
  [P3_PERCEPTRON_LEARNING_FOCUS, 'p3-perceptron-learning', 'PerceptronLearningLesson'],
  [P3_MSE_FOCUS, 'p3-perceptron-mse', 'PerceptronMseLesson'],
  [P3_XOR_FOCUS, 'p3-xor-geometry', 'XorGeometryLesson'],
  [P3_MLP_FOCUS, 'p3-mlp-forward', 'MlpForwardLesson'],
  [P3_REGULARIZATION_FOCUS, 'p3-dropout-dropconnect', 'DropoutDropConnectLesson'],
  [P3_CONVOLUTION_PRIMITIVES_FOCUS, 'p3-convolution-primitives', 'ConvolutionPrimitivesLesson'],
  [P3_CONVOLUTION_EXERCISES_FOCUS, 'p3-convolution-exercises', 'ConvolutionExercisesLesson'],
  [P3_BOUNDARY_MATRIX_FOCUS, 'p3-convolution-boundaries', 'ConvolutionBoundaryLesson'],
  [P3_PATCH_CNN_FOCUS, 'p3-patch-cnn', 'PatchCnnLesson'],
];

export const PART3_APPROVED_FORMULA_IDS = Object.freeze(GROUPS.flatMap(([map]) => [...map.keys()]));

function mapLessonOverride(map, formulaId, lessonId, renderer) {
  const entry = map.get(formulaId);
  if (!entry) return null;
  const [focus, state] = entry;
  const mode = state === 'approved-derivation' ? 'derivation' : state === 'approved-structure' ? 'structure' : 'interactive';
  return { lessonId, focus, state, mode, renderer };
}

export function getPart3ApprovedLessonOverride(formulaId) {
  for (const [map, lessonId, renderer] of GROUPS) {
    const override = mapLessonOverride(map, formulaId, lessonId, renderer);
    if (override) return override;
  }
  return null;
}

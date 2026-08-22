function focusMap(entries) { return new Map(entries); }

export const P4_LIPSCHITZ_PRODUCT_FOCUS = focusMap([
  ['MAI-P4-011', ['lipschitz-definition', 'approved-structure']],
  ['MAI-P4-020', ['source-product-question', 'approved-structure']],
  ['MAI-P4-021', ['source-bounded-product-condition', 'approved-structure']],
  ['MAI-P4-022', ['source-product-decomposition', 'approved-structure']],
  ['MAI-P4-023', ['source-product-bound', 'approved-structure']],
  ['MAI-P4-189', ['counterexample-x-squared', 'approved-interactive']],
  ['MAI-P4-190', ['completed-product-decomposition', 'approved-derivation']],
  ['MAI-P4-191', ['completed-product-bound', 'approved-interactive']],
]);

export const P4_SMOOTHNESS_HESSIAN_FOCUS = focusMap([
  ['MAI-P4-025', ['gradient-lipschitz-definition', 'approved-structure']],
  ['MAI-P4-028', ['least-squares-gradient-difference', 'approved-derivation']],
  ['MAI-P4-029', ['spectral-norm-bound', 'approved-interactive']],
  ['MAI-P4-030', ['hessian-bound', 'approved-structure']],
  ['MAI-P4-031', ['taylor-integral', 'approved-derivation']],
  ['MAI-P4-032', ['gradient-norm-proof', 'approved-derivation']],
  ['MAI-P4-036', ['rank-one-hessian', 'approved-interactive']],
]);

export const P4_FAIR_REGULARIZER_FOCUS = focusMap([
  ['MAI-P4-037', ['fair-potential', 'approved-interactive']],
  ['MAI-P4-038', ['fair-derivative', 'approved-interactive']],
  ['MAI-P4-039', ['fair-curvature', 'approved-interactive']],
  ['MAI-P4-041', ['source-regularizer-gradient-blank', 'approved-structure']],
  ['MAI-P4-043', ['source-component-constants', 'approved-structure']],
  ['MAI-P4-044', ['source-vector-bound', 'approved-structure']],
  ['MAI-P4-045', ['source-regularizer-constant', 'approved-structure']],
  ['MAI-P4-046', ['source-mcq', 'approved-structure']],
  ['MAI-P4-192', ['completed-potential-lipschitz', 'approved-interactive']],
  ['MAI-P4-193', ['completed-regularizer-gradient', 'approved-derivation']],
  ['MAI-P4-194', ['completed-component-constants', 'approved-derivation']],
  ['MAI-P4-195', ['completed-vector-bound', 'approved-derivation']],
  ['MAI-P4-196', ['completed-regularizer-constant', 'approved-interactive']],
]);

export const P4_GD_CONVERGENCE_FOCUS = focusMap([
  ['MAI-P4-050', ['gd-update', 'approved-interactive']],
  ['MAI-P4-053', ['source-general-step-bound', 'approved-structure']],
  ['MAI-P4-059', ['source-alpha-one-over-l-bound', 'approved-structure']],
  ['MAI-P4-212', ['corrected-alpha-one-over-l-bound', 'approved-interactive']],
  ['MAI-P4-218', ['corrected-general-step-bound', 'approved-interactive']],
]);

export const P4_PRECONDITIONING_FOCUS = focusMap([
  ['MAI-P4-065', ['psd-update', 'approved-interactive']],
  ['MAI-P4-069', ['line-search-orthogonality', 'approved-interactive']],
  ['MAI-P4-070', ['pgd-update', 'approved-interactive']],
  ['MAI-P4-073', ['transformed-objective', 'approved-structure']],
  ['MAI-P4-074', ['transformed-gd', 'approved-derivation']],
  ['MAI-P4-079', ['descent-definition', 'approved-structure']],
  ['MAI-P4-080', ['preconditioned-direction', 'approved-interactive']],
  ['MAI-P4-081', ['descent-proof', 'approved-derivation']],
  ['MAI-P4-083', ['unitary-preconditioner', 'approved-structure']],
  ['MAI-P4-197', ['completed-coordinate-change', 'approved-derivation']],
  ['MAI-P4-198', ['completed-unitary-diagonalization', 'approved-interactive']],
]);

export const P4_COMPLEX_SPECTRAL_FOCUS = focusMap([
  ['MAI-P4-085', ['complex-descent-direction', 'approved-interactive']],
  ['MAI-P4-088', ['complex-regularizer', 'approved-structure']],
  ['MAI-P4-092', ['complex-gradient-like-direction', 'approved-derivation']],
  ['MAI-P4-095', ['single-term-contraction', 'approved-interactive']],
  ['MAI-P4-103', ['source-odd-spectral-radius', 'approved-structure']],
  ['MAI-P4-104', ['nonperiodic-spectral-bound', 'approved-interactive']],
  ['MAI-P4-105', ['matrix-one-norm-bound', 'approved-interactive']],
  ['MAI-P4-109', ['source-transformed-lipschitz', 'approved-structure']],
  ['MAI-P4-110', ['transformed-pgd', 'approved-derivation']],
  ['MAI-P4-111', ['source-step-bound', 'approved-structure']],
  ['MAI-P4-199', ['hermitian-stationarity', 'approved-derivation']],
  ['MAI-P4-200', ['proof-end-correction', 'approved-derivation']],
  ['MAI-P4-201', ['symmetric-derivative-completion', 'approved-derivation']],
  ['MAI-P4-213', ['corrected-odd-spectral-radius', 'approved-interactive']],
  ['MAI-P4-219', ['corrected-transformed-lipschitz', 'approved-interactive']],
  ['MAI-P4-220', ['corrected-step-bound', 'approved-interactive']],
]);

export const P4_INVERSE_LINE_SEARCH_FOCUS = focusMap([
  ['MAI-P4-112', ['inverse-objective', 'approved-interactive']],
  ['MAI-P4-113', ['source-general-form', 'approved-structure']],
  ['MAI-P4-114', ['special-case-mapping', 'approved-derivation']],
  ['MAI-P4-115', ['source-fair-constant', 'approved-structure']],
  ['MAI-P4-117', ['cached-line-evaluation', 'approved-interactive']],
  ['MAI-P4-118', ['cached-recursive-update', 'approved-interactive']],
  ['MAI-P4-202', ['completed-general-form', 'approved-derivation']],
  ['MAI-P4-203', ['completed-fair-constant', 'approved-interactive']],
]);

export const P4_GENERALIZED_PGD_FOCUS = focusMap([
  ['MAI-P4-119', ['local-linear-rate', 'approved-interactive']],
  ['MAI-P4-127', ['s-lipschitz-definition', 'approved-structure']],
  ['MAI-P4-129', ['matrix-condition', 'approved-interactive']],
  ['MAI-P4-130', ['generalized-pgd-update', 'approved-interactive']],
  ['MAI-P4-131', ['decrease-inequality', 'approved-derivation']],
  ['MAI-P4-135', ['classical-objective-bound', 'approved-interactive']],
  ['MAI-P4-136', ['tight-objective-bound', 'approved-interactive']],
  ['MAI-P4-137', ['heterogeneous-units-question', 'approved-structure']],
  ['MAI-P4-141', ['generalized-fgm-update', 'approved-interactive']],
  ['MAI-P4-142', ['generalized-fgm-rate', 'approved-interactive']],
  ['MAI-P4-143', ['newton-baseline', 'approved-structure']],
  ['MAI-P4-204', ['pcg-wording-correction', 'approved-structure']],
  ['MAI-P4-205', ['heterogeneous-units-answer', 'approved-derivation']],
  ['MAI-P4-214', ['corrected-fejer-monotonicity', 'approved-interactive']],
]);

export const P4_FGM_OGM_FOCUS = focusMap([
  ['MAI-P4-144', ['general-first-order-class', 'approved-structure']],
  ['MAI-P4-145', ['fixed-step-class', 'approved-structure']],
  ['MAI-P4-146', ['membership-question', 'approved-structure']],
  ['MAI-P4-150', ['barzilai-borwein-step', 'approved-interactive']],
  ['MAI-P4-155', ['fgm-recursion', 'approved-interactive']],
  ['MAI-P4-156', ['source-coefficient-recurrence', 'approved-structure']],
  ['MAI-P4-157', ['primary-sequence-bound', 'approved-interactive']],
  ['MAI-P4-158', ['worst-function-lower-bound', 'approved-interactive']],
  ['MAI-P4-159', ['secondary-sequence-bound', 'approved-interactive']],
  ['MAI-P4-160', ['epsilon-complexity-question', 'approved-structure']],
  ['MAI-P4-161', ['optimized-coefficients', 'approved-structure']],
  ['MAI-P4-162', ['theta-recurrence', 'approved-interactive']],
  ['MAI-P4-163', ['ogm-bound', 'approved-interactive']],
  ['MAI-P4-166', ['ogm-two-momentum', 'approved-interactive']],
  ['MAI-P4-167', ['ogm-primary-bound', 'approved-interactive']],
  ['MAI-P4-169', ['ogm-prime-update', 'approved-interactive']],
  ['MAI-P4-173', ['fixed-step-optimal-bound', 'approved-interactive']],
  ['MAI-P4-175', ['gfo-lower-bound', 'approved-interactive']],
  ['MAI-P4-176', ['worst-case-equality', 'approved-structure']],
  ['MAI-P4-177', ['nonmonotone-cost', 'approved-interactive']],
  ['MAI-P4-206', ['fixed-coefficient-answer', 'approved-structure']],
  ['MAI-P4-207', ['epsilon-complexity-completion', 'approved-derivation']],
  ['MAI-P4-208', ['corrected-horizon-index', 'approved-derivation']],
  ['MAI-P4-215', ['corrected-initial-momentum', 'approved-interactive']],
  ['MAI-P4-216', ['corrected-coefficient-index', 'approved-derivation']],
  ['MAI-P4-217', ['corrected-t-lower-bound', 'approved-interactive']],
]);

export const P4_LOGISTIC_FOCUS = focusMap([
  ['MAI-P4-178', ['logistic-objective', 'approved-interactive']],
  ['MAI-P4-179', ['classifier-margin', 'approved-structure']],
  ['MAI-P4-182', ['logistic-curvature', 'approved-interactive']],
  ['MAI-P4-183', ['source-general-form-mapping', 'approved-structure']],
  ['MAI-P4-184', ['source-data-matrix-mapping', 'approved-structure']],
  ['MAI-P4-186', ['gradient-and-lipschitz-bound', 'approved-interactive']],
  ['MAI-P4-210', ['completed-logistic-mapping', 'approved-derivation']],
]);

const GROUPS = [
  [P4_LIPSCHITZ_PRODUCT_FOCUS, 'p4-lipschitz-product', 'LipschitzAnalysisLesson'],
  [P4_SMOOTHNESS_HESSIAN_FOCUS, 'p4-smoothness-hessian', 'LipschitzAnalysisLesson'],
  [P4_FAIR_REGULARIZER_FOCUS, 'p4-fair-regularizer', 'FairRegularizerLesson'],
  [P4_GD_CONVERGENCE_FOCUS, 'p4-gd-convergence', 'GradientGeometryLesson'],
  [P4_PRECONDITIONING_FOCUS, 'p4-preconditioning-line-search', 'GradientGeometryLesson'],
  [P4_COMPLEX_SPECTRAL_FOCUS, 'p4-complex-spectral-step', 'SpectralLineSearchLesson'],
  [P4_INVERSE_LINE_SEARCH_FOCUS, 'p4-cached-line-search', 'SpectralLineSearchLesson'],
  [P4_GENERALIZED_PGD_FOCUS, 'p4-generalized-pgd', 'AccelerationLesson'],
  [P4_FGM_OGM_FOCUS, 'p4-fgm-ogm', 'AccelerationLesson'],
  [P4_LOGISTIC_FOCUS, 'p4-logistic-regression', 'LogisticRegressionLesson'],
];

export const PART4_APPROVED_FORMULA_IDS = Object.freeze(GROUPS.flatMap(([map]) => [...map.keys()]));

export const PART4_NO_VISUAL_REASONS = Object.freeze({
  'MAI-P4-001': 'Chapter-level argmin notation is intentionally text-first; the later GD, preconditioning, and acceleration lessons instantiate this optimization problem with exact computations.',
  'MAI-P4-008': 'The edge-recovery objective is a high-level application wrapper. Its manipulable mathematics is represented more faithfully by the exact Fair-potential and regularizer-gradient lesson rather than a duplicate generic inverse-problem visual.',
  'MAI-P4-188': 'This source display is a True/False structural question about representational scope, not a numerical computation. The surrounding proof argument is the faithful reader-facing representation.',
  'MAI-P4-211': 'This editorial answer closes the same strict-subset question as MAI-P4-188. A second visual would duplicate the prose proof rather than expose a distinct computation.',
});

function mapLessonOverride(map, formulaId, lessonId, renderer) {
  const entry = map.get(formulaId);
  if (!entry) return null;
  const [focus, state] = entry;
  const mode = state === 'approved-derivation' ? 'derivation' : state === 'approved-structure' ? 'structure' : 'interactive';
  return { lessonId, focus, state, mode, renderer };
}

export function getPart4ApprovedLessonOverride(formulaId) {
  for (const [map, lessonId, renderer] of GROUPS) {
    const override = mapLessonOverride(map, formulaId, lessonId, renderer);
    if (override) return override;
  }
  return null;
}

export function getPart4NoVisualReason(formulaId) {
  return PART4_NO_VISUAL_REASONS[formulaId] ?? null;
}

export function getPart4LessonGroups() {
  return GROUPS.map(([map, lessonId, renderer]) => ({ lessonId, renderer, formulaIds: [...map.keys()] }));
}

export const PART4_LESSON_SPECS = Object.freeze({
  'p4-lipschitz-product': {
    lessonId: 'p4-lipschitz-product', scene: 'lipschitz-product', title: 'Lipschitz 곱: 반례와 bounded-product bound', renderer: 'LipschitzAnalysisLesson',
    description: 'x² 반례와 bounded tanh factors를 같은 축에서 비교해 두 Lipschitz 함수의 곱이 항상 Lipschitz라는 명제가 왜 거짓인지, boundedness가 어떤 상수를 주는지 계산한다.',
    a: 1.25, b: 0.8, x: 1.4,
    assumptions: ['tanh(ax), tanh(bx)는 전역 bounded이고 각각 |a|, |b| Lipschitz다.', 'x²는 R 전체에서 derivative가 unbounded다.', 'MAI-P4-020..023 source blanks와 189..191 editorial completion을 분리한다.'],
  },
  'p4-smoothness-hessian': {
    lessonId: 'p4-smoothness-hessian', scene: 'smoothness-hessian', title: 'Gradient Lipschitz ↔ Hessian spectral bound', renderer: 'LipschitzAnalysisLesson',
    description: '같은 quadratic Hessian에서 gradient-difference ratio와 λmax를 비교하고, PDF의 z=[1,2] rank-one Hessian 예제 ||2zzᵀ||₂=10을 직접 검산한다.',
    Q: [[4,1],[1,2]], x: [1,-0.5], y: [-0.25,0.75], z: [1,2],
    assumptions: ['Q is symmetric positive definite.', 'Quadratic의 best Euclidean gradient-Lipschitz constant는 ||Q||₂다.', 'rank-one example은 MAI-P4-036을 그대로 재현한다.'],
  },
  'p4-fair-regularizer': {
    lessonId: 'p4-fair-regularizer', scene: 'fair-regularizer', title: 'Fair potential → chain rule → regularizer Lipschitz bound', renderer: 'FairRegularizerLesson',
    description: 'δ를 바꾸며 ψδ, ψ̇δ, ψ̈δ를 같이 보고, first-difference C에서 Cᵀψ̇(Cx), ||C||₂², L∇R bound가 하나의 계산으로 연결되는지 검산한다.',
    delta: 1, x: [1.2,-0.4,0.7], C: [[1,-1,0],[0,1,-1]],
    assumptions: ['Default C is the three-point first-difference matrix.', 'ψ̈δ(x)≤1 makes L_{ψ̇}≤1.', 'MAI-P4-041/043/044/045/046 preserve blanks; 192..196 are editorial completions.'],
  },
  'p4-gd-convergence': {
    lessonId: 'p4-gd-convergence', scene: 'gd', title: 'GD step size, anisotropy, and corrected worst-case scaling', renderer: 'GradientGeometryLesson',
    description: '2D quadratic에서 αL을 직접 바꾸며 안정구간 0<α<2/L, objective 감소와 review-corrected bounds를 같은 trajectory로 비교한다.',
    Q: [[1,0],[0,8]], x0: [2,1], alpha: 0.125, steps: 8,
    assumptions: ['x*=0 for this exact quadratic scene.', 'MAI-P4-053/059 remain source-suspect; MAI-P4-218/212 are separate corrected variants.', 'Correction은 safe standard bound이며 exact PEP constant 주장과 분리한다.'],
  },
  'p4-preconditioning-line-search': {
    lessonId: 'p4-preconditioning-line-search', scene: 'preconditioning', title: 'Preconditioning and exact line-search orthogonality', renderer: 'GradientGeometryLesson',
    description: 'ill-conditioned quadratic의 geometry를 P로 구형화하고, d=-P∇Ψ에서 exact line-search α와 다음 gradient의 d-직교성을 계산한다.',
    Q: [[1,0],[0,16]], P: [[1,0],[0,0.0625]], x: [2,1],
    assumptions: ['Q and P are SPD.', 'Default P=Q^{-1} is the ideal illustrative preconditioner.', 'MAI-P4-197/198 complete source blanks without overwriting them.'],
  },
  'p4-complex-spectral-step': {
    lessonId: 'p4-complex-spectral-step', scene: 'complex-spectral', title: 'Complex descent, finite-difference spectrum, and safe fixed step', renderer: 'SpectralLineSearchLesson',
    description: 'periodic first-difference spectrum을 계산하고 odd-N source 오류와 corrected 2cos(π/2N), transformed Lipschitz upper bound와 safe step을 연결한다.',
    N: 9, Lpsi: 1.5, pNorm: 4, z: [1,-2],
    assumptions: ['Periodic first difference is circulant/normal.', 'MAI-P4-103/109/111 remain source-suspect; 213/219/220 are review corrections.', 'Transformed constant is an upper bound, not equality with the best constant.'],
  },
  'p4-cached-line-search': {
    lessonId: 'p4-cached-line-search', scene: 'cached-line-search', title: 'General inverse problem: cached products make line search cheap', renderer: 'SpectralLineSearchLesson',
    description: 'Bᵢx와 Bᵢd를 한 번 계산한 뒤 Bᵢ(x+αd)=zᵢ+αqᵢ로 trial product를 재사용하고 accepted step 뒤 cache update를 검증한다.',
    x: [1,-1], d: [-0.25,0.5], alpha: 0.4,
    assumptions: ['Numerical B_i are exact small instances of the source general form.', 'Direct and cached trial products must agree to floating-point tolerance.', 'MAI-P4-202/203 complete source blanks while source records remain unchanged.'],
  },
  'p4-generalized-pgd': {
    lessonId: 'p4-generalized-pgd', scene: 'generalized-pgd', title: 'S-Lipschitz PGD: anisotropic norm, decrease, and rate', renderer: 'AccelerationLesson',
    description: 'S와 P가 정의하는 geometry에서 generalized PGD를 실행해 objective decrease, weighted Fejér monotonicity, O(1/k)와 O(1/k²) guarantee scale을 비교한다.',
    S: [[1,0],[0,9]], P: [[1,0],[0,0.1111111111111111]], x0: [2,1], steps: 5,
    assumptions: ['Default P=S^{-1} is deliberately idealized.', 'MAI-P4-133 source ↓0 statement is not used; MAI-P4-214 keeps Fejér monotonicity.', 'Bounds are guarantees, not equality to this quadratic trajectory.'],
  },
  'p4-fgm-ogm': {
    lessonId: 'p4-fgm-ogm', scene: 'fgm-ogm', title: 'FGM → OGM: recurrence, momentum, and worst-case constants', renderer: 'AccelerationLesson',
    description: '같은 quadratic에서 FGM t-recurrence와 OGM extra momentum을 전개하고 β⁽⁰⁾=0, tₙ lower bound, O(1/k²) constant 차이를 확인한다.',
    Qdiag: [1,8], x0: [2,1], L: 8, steps: 6,
    assumptions: ['This deterministic quadratic is an illustration, not a proof of global OGM optimality.', 'MAI-P4-156/170 remain source-suspect; 216/217 are distinct review corrections.', 'Fixed-step coefficient records remain separate from the recursive numerical scene.'],
  },
  'p4-logistic-regression': {
    lessonId: 'p4-logistic-regression', scene: 'logistic', title: 'Logistic regression: margin, surrogate curvature, gradient, L bound', renderer: 'LogisticRegressionLesson',
    description: '2D ±1 samples에서 margin, logistic loss, gradient와 σ(1-σ)≤1/4 curvature를 같은 weights로 계산해 practical Lipschitz bound까지 연결한다.',
    samples: [{v:[1,0.5],y:1},{v:[0.5,1],y:1},{v:[-1,-0.25],y:-1},{v:[-0.5,-1],y:-1}], x: [0.4,0.2], beta: 0.1,
    assumptions: ['Labels are ±1 and margin is y_m<x,v_m>.', 'Practical Hessian bound uses σ(1-σ)≤1/4 plus βI.', 'MAI-P4-183/184 source blanks and MAI-P4-210 completion remain distinct.'],
  },
});

export function getPart4FormulaLessonSpec(lessonId) { return PART4_LESSON_SPECS[lessonId] ?? null; }
export function getAllPart4FormulaLessonSpecs() { return Object.values(PART4_LESSON_SPECS); }

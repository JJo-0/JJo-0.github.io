export const EXTENDED_LESSON_SPECS = Object.freeze({
  'p2-svm-kernel': {
    lessonId:'p2-svm-kernel', title:'선형 점수에서 kernel score까지', renderer:'SvmKernelLesson',
    description:'같은 query x와 support vectors를 유지하며 inner-product 합, feature-map kernel identity, Gaussian kernel score를 계산하고 logistic sigmoid footnote와 SVM score를 구분한다.',
    query:[0.8,-0.4], supportVectors:[[1,0],[0,1],[-1,-0.5]], alphas:[0.8,-0.35,0.45], bias:-0.1, sigma:0.7,
    assumptions:['SVM score 자체는 확률이 아니다. sigmoid는 PDF의 logistic-regression 각주를 비교하기 위해서만 표시한다.','κ(x,x_l)=φ(x)^Tφ(x_l)는 explicit feature map과 kernel 값이 같은지 숫자로 검산한다.','Gaussian kernel은 PDF가 쓴 normalized Gaussian density form을 그대로 계산한다.'],
  },
  'p2-minimum-distance': {
    lessonId:'p2-minimum-distance', title:'프로토타입·거리·수직이등분 경계', renderer:'MinimumDistanceLesson',
    description:'클래스별 표본 평균 m_c를 만들고 query의 Euclidean distance와 discriminant를 동시에 계산해 두 결정규칙의 동치와 경계의 midpoint 성질을 확인한다.',
    classes:[[[-1.4,-0.8],[-1,-0.3],[-0.7,-1]],[[0.8,0.7],[1.3,0.4],[1,1.2]]], query:[0.1,0.2],
    assumptions:['프로토타입은 PDF 정의대로 클래스별 sample mean이다.','두 클래스 경계는 d_1=d_2인 hyperplane이며 2D에서는 직선이다.','distance 최소화와 d_c 최대화는 같은 query에 대해 동일 class를 선택해야 한다.'],
  },
  'p2-bayes-decision': {
    lessonId:'p2-bayes-decision', title:'posterior normalization과 Bayes risk', renderer:'BayesDecisionLesson',
    description:'likelihood×prior를 evidence로 정규화해 posterior를 만들고, 0–1 loss 및 비대칭 loss에서 action별 conditional risk를 같은 posterior로 계산한다.',
    likelihoods:[0.25,0.65,0.35], priors:[0.55,0.3,0.15], lossMatrix:[[0,2,5],[1,0,3],[2,1,0]],
    assumptions:['posterior는 likelihood×prior를 모든 class에 대해 합한 evidence p(x)로 나눈다.','0–1 loss에서는 최소 위험 action이 MAP class와 일치한다.','PDF의 conditional-risk index 표기는 일반 교재와 순서가 다를 수 있으므로 수치 모델은 row=action, column=true class convention을 명시한다.','MAI-P2-066/075의 ??와 MAI-P2-067/076의 editorial completion은 서로 다른 source state다.'],
  },
  'p2-gaussian-discriminant': {
    lessonId:'p2-gaussian-discriminant', title:'Gaussian QDA → LDA → minimum-distance', renderer:'GaussianDiscriminantLesson',
    description:'class-specific covariance QDA, shared covariance LDA, identity covariance+equal prior minimum-distance를 같은 2D point에서 비교하고 source-suspect 1D Gaussian을 corrected variant와 분리한다.',
    x:[0.2,0.5], means:[[-1,0.2],[1,0.7]], covariances:[[[0.7,0.15],[0.15,0.45]],[[0.45,-0.1],[-0.1,0.8]]], sharedCovariance:[[0.6,0.05],[0.05,0.6]], priors:[0.5,0.5], oneDim:{x:0.25,means:[-0.5,0.9],sigmas:[0.6,0.8]},
    assumptions:['모든 covariance 예제는 symmetric positive definite다.','MAI-P2-087의 exponent 제곱 누락은 source-suspect로 보존하고 수치 density는 corrected MAI-P2-088을 사용한다.','V=I와 equal priors에서 LDA score와 minimum-distance score 차이는 모든 class에 공통인 constant여야 한다.'],
  },
  'p2-naive-bayes': {
    lessonId:'p2-naive-bayes', title:'Naive Bayes에서 prior를 빼면 언제 달라지는가', renderer:'NaiveBayesLesson',
    description:'feature별 conditional likelihood product를 계산한 뒤 prior를 포함한 MAP score와 생략한 score를 나란히 비교한다.',
    featureLikelihoods:[[0.8,0.3,0.7],[0.35,0.75,0.4]], priors:[0.6,0.4],
    assumptions:['feature likelihood product는 conditional-independence 가정의 결과다.','일반 MAP rule에서는 P(S_c)가 남아야 한다.','MAI-P2-102는 source-suspect, MAI-P2-103은 corrected variant로 유지한다.'],
  },
  'p2-dimension-growth': {
    lessonId:'p2-dimension-growth', title:'차원이 늘 때 같은 해상도 유지 비용', renderer:'DimensionGrowthLesson',
    description:'축당 r개의 점을 유지하면 N차원 grid가 r^N개로 증가하는 모습을 MAI-P2-100의 feature/observation imbalance와 연결한다.',
    resolution:5, maxDimension:6,
    assumptions:['이 grid는 curse of dimensionality를 이해하기 위한 geometric illustration이며 특정 학습 알고리즘의 sample complexity theorem이 아니다.','PDF Figure 5의 5,25,125 증가를 그대로 재현한다.'],
  },
  'p1-linear-algebra-primitives': {
    lessonId:'p1-linear-algebra-primitives', title:'dot·outer·matrix product·norm·rank·inverse를 한 숫자로 연결', renderer:'LinearAlgebraPrimitivesLesson',
    description:'같은 x,y,A,B에서 dot, outer, Ax, AB, outer-sum decomposition, norms, determinant, rank, inverse를 계산해 Part I의 핵심 linear-algebra identities를 공유한다.',
    x:[1,2], y:[3,-1], A:[[1,2],[3,4]], B:[[2,0],[1,2]],
    assumptions:['matrix dimensions are chosen so every displayed multiplication is valid.','AB=Σ_k a_k b_k^T is checked from the same A and B.','inverse is shown only for a nonsingular 2×2 example; singular matrices intentionally have no inverse.'],
  },
  'p1-eigen-covariance': {
    lessonId:'p1-eigen-covariance', title:'quadratic form·eigenvalue·covariance·PCA 축', renderer:'EigenCovarianceLesson',
    description:'하나의 symmetric matrix와 2D sample cloud에서 quadratic form, eigenpairs, trace/determinant identities, covariance symmetry와 principal axes를 함께 계산한다.',
    A:[[3,1],[1,2]], x:[1,-0.5], points:[[-2,-1],[-1,0],[1,1],[2,1.5]],
    assumptions:['A and covariance are symmetric 2×2 examples so an analytic eigensystem can be audited deterministically.','sample covariance uses denominator M to match the course’s moment/MLE convention where applicable.','eigenvectors may flip sign without changing the eigenspace.'],
  },
  'p1-probability-primitives': {
    lessonId:'p1-probability-primitives', title:'PMF에서 expectation·variance·conditional law까지', renderer:'ProbabilityPrimitivesLesson',
    description:'작은 discrete distribution과 joint table을 사용해 normalization, expectation, variance, conditional distribution과 conditional expectation의 계산 구조를 연결한다.',
    values:[0,1,2], probabilities:[0.2,0.5,0.3], joint:[[0.1,0.2],[0.3,0.4]], conditionedColumn:1,
    assumptions:['interactive PMF values are renormalized before expectation/variance calculation.','conditional distribution divides a joint-table column by its marginal probability.','continuous integral formulas and this finite sum are discrete/continuous counterparts, not identical syntax.'],
  },
  'p1-optimization-primitives': {
    lessonId:'p1-optimization-primitives', title:'gradient field·step size·mini-batch update', renderer:'OptimizationPrimitivesLesson',
    description:'2D positive-definite quadratic에서 gradient descent를 실행해 stable step-size bound를 직접 확인하고, sample gradients의 mini-batch sum을 같은 화면에서 계산한다.',
    initial:[2,-2], curvature:[4,1], alpha:0.2, stableExample:0.2, unstableExample:0.6, steps:12, sampleGradients:[[1,-1],[3,1],[-1,2],[2,0]], batchIndices:[0,2],
    assumptions:['for f(x)=1/2 x^T diag(curvature)x, fixed-step GD is stable along all axes when 0<α<2/λ_max.','the source mini-batch formula uses a sum; averaging the batch is an implementation convention that rescales the effective step.','this convex quadratic illustrates step-size stability and does not claim all neural-network losses are convex.'],
  },
});

export function getExtendedFormulaLessonSpec(lessonId){return EXTENDED_LESSON_SPECS[lessonId]??null;}
export function getAllExtendedFormulaLessonSpecs(){return Object.values(EXTENDED_LESSON_SPECS);}

export const PART3_LESSON_SPECS = Object.freeze({
  'p3-perceptron-geometry': {
    lessonId: 'p3-perceptron-geometry', title: '선형 판별함수: 초평면·sign·거리', renderer: 'PerceptronGeometryLesson',
    description: '같은 w, b, x에서 결정점수, sign 분류, signed/absolute distance와 선형 분리 margin을 동시에 계산하고, 원자료의 거리 표기와 교정식을 분리해 확인한다.',
    w: [1, -1], b: 0.2, point: [0.4, 0.5],
    samples: [{ id: 'S1-a', x: [1, 0], y: 1 }, { id: 'S1-b', x: [0.8, -0.1], y: 1 }, { id: 'S2-a', x: [0, 1], y: -1 }, { id: 'S2-b', x: [-0.2, 0.7], y: -1 }],
    lineMapping: { a: 0.5, c: 0.25 },
    assumptions: ['2D scene is an exact instance of w^T x+b=0.', 'MAI-P3-012/013 are source-suspect signed expressions; distance uses MAI-P3-142/143.', 'MAI-P3-141 stays distinct from MAI-P3-006.'],
  },
  'p3-perceptron-learning': {
    lessonId: 'p3-perceptron-learning', title: '퍼셉트론 손실·gradient·error-set update', renderer: 'PerceptronLearningLesson',
    description: '같은 ±1 labeled samples에서 margin, 원자료 loss, 완성 gradient, full-sample update와 error-set update를 계산하고 <0 원문과 ≤0 교정 error set의 차이를 zero-margin 초기화로 드러낸다.',
    initialW: [0, 0], initialB: 0, alpha: 0.25,
    samples: [{ id: 'p1', x: [2, 1], y: 1 }, { id: 'p2', x: [1, 2], y: 1 }, { id: 'n1', x: [-1, -1], y: -1 }, { id: 'n2', x: [-2, -1], y: -1 }],
    assumptions: ['Labels are ±1.', 'Zero initialization exposes <0 versus ≤0.', 'MAI-P3-023/024 preserve ?? while 144/145 complete them.', 'Raw all-sample objective is scale-unbounded on separable data.'],
  },
  'p3-perceptron-mse': {
    lessonId: 'p3-perceptron-mse', title: '대안 MSE 학습: residual·gradient·step-size', renderer: 'PerceptronMseLesson',
    description: '증강 벡터의 MSE를 residual table에서 직접 합산하고, 완성 gradient와 Hessian λmax가 만드는 데이터 의존 학습률 상한을 같은 계산으로 검증한다.',
    samples: [{ id: 'm1', x: [1, 1], y: 1 }, { id: 'm2', x: [2, 1], y: 1 }, { id: 'm3', x: [-1, 1], y: -1 }],
    initialW: [0.2, 0.1], alpha: 0.1,
    assumptions: ['The second augmented coordinate represents the bias term.', 'MAI-P3-043 remains source ??; 146 is the completion.', 'MAI-P3-045 source bound is not used as universal; 147 supplies the Hessian-dependent bound.', 'MSE is nonnegative, not strictly positive.'],
  },
  'p3-xor-geometry': {
    lessonId: 'p3-xor-geometry', title: 'XOR: 한 직선의 한계와 두 hidden threshold', renderer: 'XorGeometryLesson',
    description: 'XOR 네 점을 s=x1+x2 축으로 투영해 두 평행 경계가 왜 필요한지 확인하고, source blank와 editorial completion을 분리한다.',
    lower: 0.5, upper: 1.5,
    assumptions: ['S1={(0,0),(1,1)}, S2={(1,0),(0,1)}.', 'MAI-P3-049/050 preserve blanks; 148/149 are editorial completions.', 'Minimum count refers to a standard two-hidden-threshold plus one output threshold construction.'],
  },
  'p3-mlp-forward': {
    lessonId: 'p3-mlp-forward', title: 'MLP forward: scalar → matrix → batch → softmax', renderer: 'MlpForwardLesson',
    description: '하나의 2→3→2 network를 scalar, matrix, batch 표현으로 동시에 계산해 N_l/N_L 혼용을 분리하고 softmax 합과 argmax를 검산한다.',
    x: [0.6, -0.4],
    W2: [[1, 0.5], [-0.5, 1], [0.8, -0.3]], b2: [0.1, 0.2, -0.1],
    W3: [[1, -0.5, 0.7], [-0.3, 0.8, -0.4]], b3: [0.05, -0.05],
    batchX: [[0.6, -0.2], [-0.4, 0.9]],
    assumptions: ['ReLU is used for the hidden layer only; output probabilities use softmax.', '053/057/068 preserve source N_L mixing; 151/152/153 are corrected current-layer forms.', '060 preserves the blank matrix; 150 supplies exact N_l×N_{l-1} shape.'],
  },
  'p3-dropout-dropconnect': {
    lessonId: 'p3-dropout-dropconnect', title: 'DropOut vs DropConnect: 무엇을 mask하는가', renderer: 'DropoutDropConnectLesson',
    description: '동일한 W와 v에서 DropOut은 activation을, DropConnect는 weight를 mask한다는 차이를 실제 forward 값으로 비교한다.',
    W: [[1, -0.5, 0.25], [-0.3, 0.8, 0.4]], v: [1, 2, -1], nodeMask: [1, 0], weightMask: [[1, 0, 1], [0, 1, 1]],
    assumptions: ['Activation is ReLU for this numerical scene.', 'Masks are deterministic lesson controls, not claims about source random seeds.'],
  },
  'p3-convolution-primitives': {
    lessonId: 'p3-convolution-primitives', title: '컨볼루션 정의: continuous·discrete·2D', renderer: 'ConvolutionPrimitivesLesson',
    description: '연속 Gaussian 예시, 두 동치 discrete sum, delta/LSI 관점과 2D full convolution을 한 장면에서 연결한다.',
    f: [1, 2, 0], g: [2, -1], image: [[1, 2], [3, 4]], kernel: [[1, 0], [0, -1]], t: 0.5, sigmaF: 1, sigmaG: 0.7,
    assumptions: ['Finite sequences are zero outside their stored support.', 'Continuous example uses unnormalized Gaussians solely to instantiate the source integral.', '2D output uses the source convolution indexing, not cross-correlation.'],
  },
  'p3-convolution-exercises': {
    lessonId: 'p3-convolution-exercises', title: '2D convolution exercise·moving average·separability', renderer: 'ConvolutionExercisesLesson',
    description: 'PDF의 2×3 kernel과 4×5 image를 그대로 계산해 mirror/full output blank를 완성하고, checkerboard moving average와 separable 계산 절감을 검증한다.',
    image: [[0,0,0,0,1],[0,0,0,0,0],[0,1,1,1,0],[0,0,0,0,0]], kernel: [[2,4,6],[1,2,3]], reductionKernelSize: 3,
    assumptions: ['154/155/156/157 are editorial completions and stay distinct from their source blanks.', 'Moving-average checkerboard response assumes the infinite checkerboard pattern stated by 085.', 'Separable equality is checked with the 3×3 averaging kernel.'],
  },
  'p3-convolution-boundaries': {
    lessonId: 'p3-convolution-boundaries', title: '컨볼루션의 전역 행렬: zero·extended·periodic·mirror', renderer: 'ConvolutionBoundaryLesson',
    description: 'h[-1]=2,h[0]=4,h[1]=1과 N=6을 그대로 사용해 Toeplitz/extended/circulant matrix와 각 boundary output을 같은 x에서 비교한다.',
    x: [1,2,3,4,5,6], h: { '-1': 2, '0': 4, '1': 1 },
    assumptions: ['The zero/extended/periodic matrices reproduce Figure 4 entries exactly.', 'Mirror extension uses f[-1]=f[1] and f[N]=f[N-2] for the three-tap example.', 'Circular convolution and circulant-matrix multiplication must agree exactly.'],
  },
  'p3-patch-cnn': {
    lessonId: 'p3-patch-cnn', title: 'Patch matrix → Conv2d → MaxPool', renderer: 'PatchCnnLesson',
    description: '국소 window를 Z로 쌓아 g=Zh를 계산하고, 64×64 3×3 Conv2d shape/parameter 수와 PDF의 5×5 MaxPool 예제를 같은 lesson에서 검증한다.',
    signal: [1,2,3,4,5], offsets: [0,1,2], starts: [0,1,2], h: [1,0,-1],
    conv: { inChannels: 64, outChannels: 64, kernelSize: 3, padding: 1, stride: 1, inputSpatial: 8 },
    poolInput: [[1,3,2,3,3],[3,1,2,1,1],[3,3,3,1,2],[2,2,1,2,1],[2,3,2,1,2]],
    pool: { kernelSize: 3, stride: 2, padding: 1 },
    assumptions: ['128 and 134 preserve source symbol/entry defects; 158 and 159 are corrected variants.', 'MaxPool uses the exact 5×5 values and K=3,s=2,p=1 shown by the source figure.', 'Conv2d parameter count includes one bias per output channel.'],
  },
});

export function getPart3FormulaLessonSpec(lessonId) { return PART3_LESSON_SPECS[lessonId] ?? null; }
export function getAllPart3FormulaLessonSpecs() { return Object.values(PART3_LESSON_SPECS); }

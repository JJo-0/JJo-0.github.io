const LESSON_SPECS = Object.freeze({
  'p2-dot-product-prediction': {
    lessonId: 'p2-dot-product-prediction',
    title: '각 특징의 기여도를 더해 예측값 만들기',
    renderer: 'DotProductPredictionLesson',
    description:
      'wᵀx를 하나의 검은 상자로 보지 않고, 각 성분의 곱 wᵢxᵢ와 그 합으로 분해해 예측값을 계산한다.',
    featureNames: ['특징 1', '특징 2', '특징 3'],
    x: [1.5, -0.5, 2],
    initialW: [0.8, -1.2, 0.5],
    assumptions: [
      'x와 w의 길이는 같아야 한다.',
      '각 특징 기여도는 wᵢxᵢ이며, 양수는 예측을 올리고 음수는 예측을 내린다.',
      '이 식은 선형 예측값을 계산하며 확률을 직접 뜻하지 않는다.',
    ],
  },
  'p2-normal-equation': {
    lessonId: 'p2-normal-equation',
    title: '최소제곱에서 정규방정식까지',
    renderer: 'NormalEquationLesson',
    description:
      '같은 데이터 X, y와 가중치 w를 유지한 채 예측 → 잔차 → MSE → 기울기 → 정규방정식 → 해를 한 흐름으로 계산한다.',
    dataset: {
      featureName: 'x',
      X: [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
      ],
      y: [0.5, 1.8, 2.7, 4.2],
      initialW: [0.2, 0.7],
    },
    focusOrder: [
      'mse',
      'stationarity',
      'gradient-of-mse',
      'norm-to-quadratic',
      'expand-quadratic',
      'differentiate',
      'normal-equation',
      'solve-normal-equation',
    ],
    focusLabels: {
      mse: '예측값·잔차·제곱오차·평균',
      stationarity: '최솟값 후보에서 기울기 0',
      'gradient-of-mse': 'MSE 전체를 w로 미분',
      'norm-to-quadratic': '제곱노름을 내적으로 변환',
      'expand-quadratic': '이차식을 세 항으로 전개',
      differentiate: '각 항을 미분해 gradient 계산',
      'normal-equation': 'XᵀXw = Xᵀy 구성',
      'solve-normal-equation': '선형시스템을 풀어 w★ 계산',
    },
    assumptions: [
      'X의 각 행은 하나의 학습 샘플이고 첫 열은 절편항 1이다.',
      '닫힌형식 표기는 (XᵀX)⁻¹을 사용하지만 계산 코드는 역행렬을 직접 만들지 않고 선형시스템을 푼다.',
      'XᵀX가 특이하면 유일한 해가 없으며 QR·SVD·정규화가 필요하다.',
    ],
  },
  'p2-residual-gradient': {
    lessonId: 'p2-residual-gradient',
    title: '잔차 제곱을 미분해 gradient 만들기',
    renderer: 'ResidualGradientLesson',
    description:
      'Ax−y를 먼저 계산하고, 가중 잔차를 Aᵀ로 입력 공간에 되돌려 2AᵀW(Ax−y)를 얻는 체인룰을 추적한다.',
    A: [
      [1, 2],
      [-1, 1],
    ],
    y: [1.2, -0.5],
    initialX: [0.4, -0.2],
    weights: [1, 2],
    scalarExample: { a: 1.5, x: 0.4, b: 1.1 },
    focusLabels: {
      'weighted-residual-gradient': '가중 이차형식의 gradient',
      'scalar-chain-rule': '1차원 제곱잔차의 chain rule',
      'unweighted-residual-gradient': 'W=I인 제곱노름 gradient',
    },
    assumptions: [
      'W는 양의 대각 가중행렬로 두어 각 잔차의 중요도를 다르게 반영한다.',
      '수식 (y−Ax)ᵀW(y−Ax)와 (Ax−y)ᵀW(Ax−y)는 같은 값을 가진다.',
      '화면의 gradient는 중앙 유한차분 결과와도 비교해 검산한다.',
    ],
  },
  'p2-sample-matrix-assembly': {
    lessonId: 'p2-sample-matrix-assembly',
    title: '샘플 합을 행렬식으로 조립하기',
    renderer: 'SampleMatrixAssemblyLesson',
    description:
      '각 샘플의 외적 xₗxₗᵀ을 누적해 XᵀX를 만들고, 샘플별 제곱오차 합이 ‖Xw−y‖²와 같음을 같은 숫자로 확인한다.',
    samples: [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ],
    targets: [0.5, 1.8, 2.7, 4.2],
    weights: [0.2, 0.7],
    focusLabels: {
      'outer-product-accumulation': 'XᵀX = Σₗ xₗxₗᵀ',
      'samplewise-objective': 'Σₗ(wᵀxₗ−yₗ)²',
      'stacked-objective': '‖Xw−y‖₂²',
    },
    assumptions: [
      '샘플 벡터 xₗ는 X의 행으로 쌓인다.',
      '외적 xₗxₗᵀ은 특징 쌍의 곱을 담은 행렬이다.',
      '샘플별 제곱오차 합과 쌓인 잔차 벡터의 제곱노름은 정확히 같다.',
    ],
  },
  'p2-generalization-gap': {
    lessonId: 'p2-generalization-gap',
    title: '훈련에서 고른 w★를 새 데이터로 검사하기',
    renderer: 'GeneralizationGapLesson',
    description:
      '훈련 집합으로만 w★를 선택한 뒤 독립적인 시험 집합에서 잔차 제곱을 평균하고, 이 전체 절차를 반복해 기대 훈련오차와 기대 시험오차를 구분한다.',
    degree: 3,
    dataset: {
      seed: 20250319,
      trainSize: 14,
      testSize: 30,
      noiseStd: 0.16,
      trueCoefficients: [0.35, 0.85, -0.75],
    },
    expectation: {
      seed: 260319,
      trials: 80,
      trainSize: 14,
      testSize: 80,
      noiseStd: 0.16,
      trueCoefficients: [0.35, 0.85, -0.75],
    },
    focusLabels: {
      'test-mse': '시험 잔차 제곱을 M개 평균',
      'expected-gap': '표본 추출→학습→시험을 반복한 기대값',
    },
    assumptions: [
      'w★는 훈련 집합만 사용해 선택하고, 시험 집합은 그 선택 과정에 전혀 사용하지 않는다.',
      '훈련 표본과 시험 표본은 같은 데이터 생성분포에서 서로 독립적으로 뽑는 i.i.d. 예제로 구성한다.',
      'E[error_test]≥E[error_train]은 반복된 전체 절차의 기대값 관계다. 하나의 우연한 분할에서는 시험오차가 더 작을 수도 있다.',
      '반복 실험 화면은 관계를 이해하기 위한 결정론적 Monte Carlo 예시이며, 수학적 증명 자체는 아니다.',
    ],
  },
  'p2-ridge-regularization': {
    lessonId: 'p2-ridge-regularization',
    title: '훈련오차와 작은 가중치 사이의 λ 저울',
    renderer: 'RidgeRegularizationLesson',
    description:
      '같은 9차 모델과 같은 훈련점을 유지한 채 λ를 바꾸어 MSE_train, ‖w‖², λ‖w‖², 전체 목적함수와 곡선의 변화를 동시에 계산한다.',
    degree: 9,
    trueCoefficients: [0.35, 0.85, -0.75],
    trainX: [
      -1,
      -0.7777777777777778,
      -0.5555555555555556,
      -0.33333333333333337,
      -0.11111111111111116,
      0.11111111111111116,
      0.33333333333333326,
      0.5555555555555554,
      0.7777777777777777,
      1,
    ],
    trainY: [
      -1.2497539693285036,
      -0.7050657073131209,
      -0.40853127477614726,
      -0.1947850344181216,
      0.1553621392619517,
      0.23685587418589274,
      0.5620287205194877,
      0.8587837898516474,
      0.4589661036971415,
      0.32590502003601185,
    ],
    lambdaGrid: [0, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1, 10],
    defaultLambdaIndex: 3,
    focusLabels: {
      'ridge-objective': 'MSE_train + λ‖w‖²를 항별로 분해',
    },
    assumptions: [
      '원자료 Figure 3의 설정처럼 실제 생성함수는 이차식이고, 적합 모델은 고용량 9차 모델로 둔다.',
      '수치 안정성을 위해 9차 다항식은 [−1,1]에서 Chebyshev 기저 T₀,…,T₉로 표현한다. 이때 w는 그 기저의 계수 벡터다.',
      '목적함수는 원자료 식 그대로 MSE_train+λ‖w‖²이며 절편을 포함한 모든 계수를 벌점에 포함한다.',
      'λ=0이면 작은 가중치 선호가 없고, λ가 커질수록 계수는 줄지만 지나치게 크면 underfitting이 발생한다.',
    ],
  },
});

export function getFormulaLessonSpec(lessonId) {
  return LESSON_SPECS[lessonId] ?? null;
}

export function getAllFormulaLessonSpecs() {
  return Object.values(LESSON_SPECS);
}

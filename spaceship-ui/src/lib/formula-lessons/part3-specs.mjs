export const PART3_LESSON_SPECS = Object.freeze({
  'p3-perceptron-geometry': {
    lessonId: 'p3-perceptron-geometry',
    title: '선형 판별함수: 초평면·sign·거리',
    renderer: 'PerceptronGeometryLesson',
    description: '같은 w, b, x에서 결정점수, sign 분류, signed/absolute distance와 선형 분리 margin을 동시에 계산하고, 원자료의 거리 표기와 교정식을 분리해 확인한다.',
    w: [1, -1],
    b: 0.2,
    point: [0.4, 0.5],
    samples: [
      { id: 'S1-a', x: [1, 0], y: 1 },
      { id: 'S1-b', x: [0.8, -0.1], y: 1 },
      { id: 'S2-a', x: [0, 1], y: -1 },
      { id: 'S2-b', x: [-0.2, 0.7], y: -1 },
    ],
    lineMapping: { a: 0.5, c: 0.25 },
    assumptions: [
      '2D scene is an exact instance of w^T x+b=0; the lesson does not claim the original lecture samples had these numeric coordinates.',
      'MAI-P3-012/013 are source-suspect signed expressions; the interactive distance uses the corrected absolute-value records MAI-P3-142/143.',
      'MAI-P3-141 is an editorial completion of the y=ax+c to hyperplane coefficient mapping and stays distinct from MAI-P3-006.',
    ],
  },
  'p3-perceptron-learning': {
    lessonId: 'p3-perceptron-learning',
    title: '퍼셉트론 손실·gradient·error-set update',
    renderer: 'PerceptronLearningLesson',
    description: '같은 ±1 labeled samples에서 margin, 원자료 loss, 완성 gradient, full-sample update와 error-set update를 계산하고 <0 원문과 ≤0 교정 error set의 차이를 zero-margin 초기화로 드러낸다.',
    initialW: [0, 0],
    initialB: 0,
    alpha: 0.25,
    samples: [
      { id: 'p1', x: [2, 1], y: 1 },
      { id: 'p2', x: [1, 2], y: 1 },
      { id: 'n1', x: [-1, -1], y: -1 },
      { id: 'n2', x: [-2, -1], y: -1 },
    ],
    assumptions: [
      'Labels are ±1 exactly as in the source derivation.',
      'The zero vector initialization is deliberate: it exposes why a strict margin<0 error set can ignore score-zero samples while the corrected margin≤0 set does not.',
      'MAI-P3-023/024 preserve the source ??; MAI-P3-144/145 are separate editorial completions and supply the numerical gradient.',
      'The raw all-sample objective in MAI-P3-021/022 is scale-unbounded on separable data; this lesson preserves it as source structure rather than presenting it as a modern training objective.',
    ],
  },
});

export function getPart3FormulaLessonSpec(lessonId) {
  return PART3_LESSON_SPECS[lessonId] ?? null;
}

export function getAllPart3FormulaLessonSpecs() {
  return Object.values(PART3_LESSON_SPECS);
}

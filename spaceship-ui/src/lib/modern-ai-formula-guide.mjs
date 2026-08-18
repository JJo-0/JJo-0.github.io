const REFERENCE_SETS = {
  linearAlgebra: [
    {
      label: 'Deep Learning Book · Linear Algebra',
      href: 'https://www.deeplearningbook.org/contents/linear_algebra.html',
      note: '벡터·행렬·내적·역행렬을 같은 표기 체계로 복습한다.',
    },
    {
      label: 'The Matrix Cookbook',
      href: 'https://www2.imm.dtu.dk/pubdb/pubs/3274-full.html',
      note: '행렬 항등식과 미분 공식을 빠르게 확인하는 데 적합하다.',
    },
  ],
  probability: [
    {
      label: 'Deep Learning Book · Probability',
      href: 'https://www.deeplearningbook.org/contents/prob.html',
      note: '확률변수·기댓값·분산·베이즈 규칙의 정식 정의를 확인한다.',
    },
    {
      label: 'Seeing Theory',
      href: 'https://seeing-theory.brown.edu/',
      note: '확률·분포·베이즈 추론을 상호작용형 그림으로 확인한다.',
    },
  ],
  optimization: [
    {
      label: 'Deep Learning Book · Numerical Computation',
      href: 'https://www.deeplearningbook.org/contents/numerical.html',
      note: '기울기, 조건수, 수치 안정성을 계산 관점에서 연결한다.',
    },
    {
      label: 'Deep Learning Book · Optimization',
      href: 'https://www.deeplearningbook.org/contents/optimization.html',
      note: '손실함수와 경사 기반 학습의 전체 흐름을 복습한다.',
    },
  ],
  convolution: [
    {
      label: 'CS231n · Convolutional Networks',
      href: 'https://cs231n.github.io/convolutional-networks/',
      note: '필터와 입력 패치의 원소별 곱·합, 출력 크기 계산을 시각적으로 확인한다.',
    },
    {
      label: 'Deep Learning Book · Linear Algebra',
      href: 'https://www.deeplearningbook.org/contents/linear_algebra.html',
      note: '컨볼루션을 내적과 행렬곱으로 다시 읽는 데 사용한다.',
    },
  ],
  machineLearning: [
    {
      label: 'Deep Learning Book',
      href: 'https://www.deeplearningbook.org/',
      note: '머신러닝 기초, 정규화, 최적화, 컨볼루션 장으로 이어지는 기준 교재다.',
    },
    {
      label: 'CS231n Course Notes',
      href: 'https://cs231n.github.io/',
      note: '분류·손실·검증·CNN을 계산 예제 중심으로 연결한다.',
    },
  ],
};

const SYMBOL_DICTIONARY = [
  ['\\mathbf{x}', String.raw`\mathbf{x}`, '입력 또는 특징 벡터'],
  ['\\boldsymbol{x}', String.raw`\boldsymbol{x}`, '입력 또는 미지수 벡터'],
  ['\\mathbf{y}', String.raw`\mathbf{y}`, '정답·관측값 벡터'],
  ['\\boldsymbol{y}', String.raw`\boldsymbol{y}`, '정답·관측값 벡터'],
  ['\\mathbf{w}', String.raw`\mathbf{w}`, '학습하는 가중치 벡터'],
  ['\\boldsymbol{w}', String.raw`\boldsymbol{w}`, '학습하는 가중치 벡터'],
  ['\\mathbf{X}', String.raw`\mathbf{X}`, '샘플을 모은 데이터 행렬'],
  ['X^{', String.raw`X`, '샘플을 모은 데이터 행렬'],
  ['\\mathbf{A}', String.raw`\mathbf{A}`, '선형변환 또는 계수행렬'],
  ['\\boldsymbol{A}', String.raw`\boldsymbol{A}`, '선형변환 또는 계수행렬'],
  ['\\lambda', String.raw`\lambda`, '정규화 강도 또는 고유값'],
  ['\\alpha', String.raw`\alpha`, '학습률·혼합계수·쌍대계수'],
  ['\\eta', String.raw`\eta`, '학습률 또는 확률 파라미터'],
  ['\\mu', String.raw`\mu`, '평균'],
  ['\\sigma', String.raw`\sigma`, '표준편차 또는 시그모이드 표기'],
  ['\\Sigma', String.raw`\Sigma`, '공분산행렬'],
  ['\\mathbf{V}', String.raw`\mathbf{V}_c`, '클래스별 공분산행렬'],
  ['\\mathbf{m}', String.raw`\mathbf{m}_c`, '클래스별 평균 또는 대표점'],
  ['\\kappa', String.raw`\kappa`, '두 입력의 유사도를 반환하는 커널'],
  ['\\phi', String.raw`\phi`, '입력을 특징공간으로 보내는 변환'],
  ['\\nabla', String.raw`\nabla`, '각 변수 방향의 미분값을 모은 기울기'],
  ['\\partial', String.raw`\partial`, '특정 변수에 대한 편미분'],
  ['\\sum', String.raw`\sum`, '지정된 항을 모두 더하는 연산'],
  ['\\prod', String.raw`\prod`, '지정된 항을 모두 곱하는 연산'],
  ['\\lVert', String.raw`\lVert\cdot\rVert`, '벡터나 오차의 크기'],
  ['\\mathbb{E}', String.raw`\mathbb{E}`, '가능한 값의 확률가중평균인 기댓값'],
  ['E[', String.raw`E[\cdot]`, '가능한 값의 확률가중평균인 기댓값'],
  ['P(', String.raw`P(\cdot)`, '사건의 확률'],
  ['p(', String.raw`p(\cdot)`, '확률밀도 또는 조건부 확률밀도'],
  ['\\mathcal{N}', String.raw`\mathcal{N}`, '가우시안 분포'],
  ['C', String.raw`C`, '전체 클래스 수 또는 행렬—문맥 확인'],
  ['L', String.raw`L`, '샘플 수 또는 손실함수—문맥 확인'],
];

function compact(tex) {
  return tex.replace(/\s+/g, ' ').trim();
}

function containsAny(text, fragments) {
  return fragments.some((fragment) => text.includes(fragment));
}

function formulaArea(formulaId = '') {
  if (formulaId.startsWith('MAI2-')) return '선형대수';
  if (formulaId.startsWith('MAI3-')) return '퍼셉트론과 신경망';
  if (formulaId.startsWith('MAI4-')) return '컨볼루션과 영상 연산';
  if (formulaId.startsWith('MAI5-')) return '확률 기초';
  if (formulaId.startsWith('MAI6-')) return '확률변수와 통계량';
  if (formulaId.startsWith('MAI7-')) return '가우시안과 확률과정';
  if (formulaId.startsWith('MAI8-')) return '손실함수와 최적화';
  if (formulaId.startsWith('MAI-P2-')) return '머신러닝 기초';
  return '핵심 수식';
}

function inferFamily({ tex, section = '', formulaId = '' }) {
  const t = compact(tex);
  const context = `${section} ${formulaArea(formulaId)}`.toLowerCase();

  if (containsAny(t, ['\\operatorname*{argmin}', '\\argmin', '\\operatorname*{argmax}', '\\argmax'])) {
    return 'optimization-objective';
  }
  if (containsAny(t, ['w^{(', 'x^{(k+1)', 'w_{k+1}', 'w^{(i+1)', '\\theta_{k+1}']) || /\b(?:w|x|theta|\\theta).*\+1.*=.*-/.test(t)) {
    return 'gradient-descent';
  }
  if (containsAny(t, ['\\nabla', '\\frac{\\partial', '\\frac{d}{d', '\\partial'])) {
    return 'gradient';
  }
  if (context.includes('linear regression') && containsAny(t, ['X^{', 'X^', 'w^', '\\left(X'])) {
    if (containsAny(t, ['^{-1}', '\\nabla', 'X^{\\mathsf T}X'])) return 'normal-equation';
  }
  if (containsAny(t, ['\\operatorname{MSE}', 'MSE', '\\lVert', '\\|']) && containsAny(t, ['y', 'hat', 'X', 'w'])) {
    return 'mse';
  }
  if (containsAny(t, ['\\lambda\\lVert', '\\lambda \\lVert', '\\lambda|', '+\\lambda', '+ \\lambda']) || context.includes('regularization')) {
    return 'regularization';
  }
  if (containsAny(t, ['P(S_', 'P(\\mathcal', 'P(S', 'P(C', 'P(Y', 'P(X']) && containsAny(t, ['p(x|', '\\mid', '|x', 'P('])) {
    return 'bayes';
  }
  if (containsAny(t, ['R_c', 'R_{c', '\\mathcal{R}', 'L(a_c']) || context.includes('risk')) {
    return 'risk';
  }
  if (containsAny(t, ['\\mathcal{N}', '(2\\pi)', '|V_c|', '\\Sigma^{-1}', 'V_c^{-1}']) || context.includes('gaussian')) {
    return 'gaussian';
  }
  if (containsAny(t, ['\\operatorname{Cov}', '\\mathrm{Cov}', 'C_{X', 'R_{x', 'V_c', '\\Sigma']) || context.includes('covariance')) {
    return 'covariance';
  }
  if (containsAny(t, ['\\operatorname{Var}', '\\mathrm{Var}', '\\sigma^2']) || context.includes('variance')) {
    return 'variance';
  }
  if (containsAny(t, ['\\mathbb{E}', 'E[', '\\operatorname{E}']) || context.includes('expectation')) {
    return 'expectation';
  }
  if (containsAny(t, ['\\ast', '\\star', 'h[m', 'f[m', 'g[m', 'n-k', 'm-k']) || context.includes('convolution')) {
    return 'convolution';
  }
  if (containsAny(t, ['\\kappa', '\\phi(', '\\exp\\left(-\\frac{\\lVert']) || context.includes('kernel')) {
    return 'kernel';
  }
  if (containsAny(t, ['d_c(', 'D_c(', '\\operatorname*{argmin}_{c}', 'm_c']) || context.includes('minimum-distance') || context.includes('prototype')) {
    return 'distance-classifier';
  }
  if (containsAny(t, ['\\prod']) || context.includes('naive')) return 'naive-bayes';
  if (containsAny(t, ['5^d', '^d', 'N^d']) && context.includes('dimension')) return 'dimension-growth';
  if (containsAny(t, ['\\sigma(', '\\frac{1}{1+e', '\\frac{1}{1 + e', '\\operatorname{sigmoid}']) || context.includes('logistic')) {
    return 'sigmoid';
  }
  if (containsAny(t, ['\\operatorname{sign}', '\\mathrm{sign}', 'g(x)=', 'w^{\\mathsf T}x+b', 'w^Tx+b']) || context.includes('perceptron') || context.includes('support vector')) {
    return 'hyperplane';
  }
  if (containsAny(t, ['\\frac{1}{K}', '\\sum_{k=1}^{K}']) && context.includes('validation')) return 'kfold';
  if (containsAny(t, ['^{-1}', 'A^{-1}', '\\det', '|A|']) && (context.includes('선형대수') || containsAny(t, ['Ax', 'I']))) {
    return 'inverse';
  }
  if (containsAny(t, ['\\lVert', '\\|']) && !containsAny(t, ['p(', 'P('])) return 'norm';
  if (containsAny(t, ['\\begin{bmatrix}', '\\begin{pmatrix}', '\\begin{matrix}']) && containsAny(t, ['\\begin{bmatrix}', 'A', 'x'])) {
    return 'matrix';
  }
  if (containsAny(t, ['x^{\\mathsf T}y', 'x^Ty', '\\langle', '\\sum']) && context.includes('선형대수')) return 'dot-product';
  if (containsAny(t, ['Ax=b', 'Ax = b', 'A\\mathbf{x}', 'A\\boldsymbol{x}']) || context.includes('linear system')) return 'linear-system';
  if (containsAny(t, ['p(', 'P(', '\\Pr', '\\sum']) && (context.includes('확률') || context.includes('probability') || context.includes('density'))) {
    return 'probability';
  }
  return 'generic';
}

function step(title, explanation, tex) {
  return { title, explanation, ...(tex ? { tex } : {}) };
}

function example(title, setup, steps, result, caution) {
  return { title, setup, steps, result, ...(caution ? { caution } : {}) };
}

function guideForFamily(family) {
  switch (family) {
    case 'linear-system':
      return {
        title: '연립방정식은 제약식을 동시에 만족시키는 값 찾기',
        question: '어떤 미지수 벡터를 넣어야 모든 행의 등식이 동시에 맞는가?',
        summary: '각 행을 하나의 방정식으로 읽고, 소거 또는 역행렬·분해를 이용해 미지수를 구한다.',
        steps: [
          step('행별 방정식으로 펼친다', '행렬의 한 행과 미지수 벡터의 내적이 오른쪽 값 하나가 된다.', String.raw`A_{i,:}x=b_i`),
          step('한 변수를 없앤다', '두 식을 더하거나 빼서 미지수 수를 줄인다. 큰 문제에서는 LU·QR 같은 분해가 이 역할을 한다.'),
          step('남은 값을 역대입한다', '구한 값을 원래 식에 넣어 나머지 미지수를 계산한다.'),
          step('모든 식에 다시 대입한다', '계산한 해가 각 행의 등식을 모두 만족하는지 확인한다.', String.raw`Ax\stackrel{?}=b`),
        ],
        example: example(
          '2×2 연립방정식 직접 풀기',
          '두 직선의 교점을 구한다고 생각한다.',
          [
            step('문제', '', String.raw`2x+y=5,\qquad x-y=1`),
            step('두 식을 더해 y를 소거', '', String.raw`3x=6\Rightarrow x=2`),
            step('두 번째 식에 역대입', '', String.raw`2-y=1\Rightarrow y=1`),
            step('검산', '', String.raw`2(2)+1=5,\qquad 2-1=1`),
          ],
          '따라서 해는 (x,y)=(2,1)이다.',
        ),
        checks: ['왼쪽 Ax와 오른쪽 b의 차원이 같아야 한다.', '역행렬 표기는 A가 정사각·가역일 때만 그대로 사용할 수 있다.'],
        references: REFERENCE_SETS.linearAlgebra,
      };
    case 'matrix':
      return {
        title: '행렬곱은 행과 열의 내적을 반복하는 계산',
        question: '각 출력 원소가 어떤 입력 원소들의 곱과 합으로 만들어지는가?',
        summary: '왼쪽 행렬의 한 행과 오른쪽 행렬의 한 열을 같은 위치끼리 곱한 뒤 모두 더한다.',
        steps: [
          step('곱셈 가능 여부를 확인한다', '안쪽 차원이 같아야 한다.', String.raw`(m\times n)(n\times p)\rightarrow(m\times p)`),
          step('출력 위치 하나를 고른다', '출력의 (i,j) 원소는 A의 i번째 행과 B의 j번째 열에서 계산한다.'),
          step('같은 인덱스끼리 곱해 더한다', '', String.raw`C_{ij}=\sum_k A_{ik}B_{kj}`),
          step('모든 행·열 조합에 반복한다', '이 과정을 출력 행렬 전체에 적용한다.'),
        ],
        example: example(
          '2×2 행렬과 벡터 곱',
          '각 행이 벡터를 어떻게 변환하는지 숫자로 확인한다.',
          [
            step('입력', '', String.raw`A=\begin{bmatrix}1&2\\3&4\end{bmatrix},\quad x=\begin{bmatrix}5\\6\end{bmatrix}`),
            step('첫 번째 행', '', String.raw`1\cdot5+2\cdot6=17`),
            step('두 번째 행', '', String.raw`3\cdot5+4\cdot6=39`),
          ],
          'Ax=[17,39]^T이다.',
        ),
        checks: ['행렬곱은 일반적으로 순서를 바꾸면 값이 달라진다.', '출력 모양은 바깥 차원 m×p다.'],
        references: REFERENCE_SETS.linearAlgebra,
      };
    case 'dot-product':
      return {
        title: '내적은 같은 위치의 곱을 모두 더해 하나의 점수로 압축',
        question: '두 벡터가 같은 방향을 얼마나 공유하는가?',
        summary: '성분별 곱을 더해 스칼라 하나를 만들며, 예측 점수·유사도·투영 계산에 반복해서 등장한다.',
        steps: [
          step('두 벡터의 길이를 맞춘다', '성분 수가 같아야 한다.'),
          step('같은 위치끼리 곱한다', '', String.raw`x_1y_1,\ x_2y_2,\ldots,x_Ny_N`),
          step('모든 곱을 더한다', '', String.raw`x^Ty=\sum_{n=1}^{N}x_ny_n`),
          step('부호와 크기를 해석한다', '양수는 대체로 같은 방향, 0은 직교, 음수는 반대 방향을 뜻한다.'),
        ],
        example: example(
          '가중합 계산',
          '두 특징에 가중치를 적용한다.',
          [
            step('값', '', String.raw`w=[2,-1]^T,\quad x=[3,4]^T`),
            step('성분별 곱', '', String.raw`[2\cdot3,\ (-1)\cdot4]=[6,-4]`),
            step('합', '', String.raw`w^Tx=6-4=2`),
          ],
          '최종 선형 점수는 2다.',
        ),
        checks: ['결과는 벡터가 아니라 스칼라 하나다.', '단위가 있는 값이라면 각 곱의 단위가 서로 같아야 더할 수 있다.'],
        references: REFERENCE_SETS.linearAlgebra,
      };
    case 'inverse':
      return {
        title: '역행렬은 선형변환을 되돌리는 연산',
        question: 'A가 적용되기 전의 벡터를 어떻게 복원하는가?',
        summary: 'A^{-1}A=I를 이용해 Ax=b의 양변에 역행렬을 곱하면 x=A^{-1}b가 된다.',
        steps: [
          step('가역 조건을 확인한다', '정사각행렬이고 행렬식이 0이 아니어야 고전적 역행렬이 존재한다.', String.raw`\det(A)\neq0`),
          step('양변 왼쪽에 같은 행렬을 곱한다', '', String.raw`A^{-1}Ax=A^{-1}b`),
          step('A^{-1}A를 항등행렬로 바꾼다', '', String.raw`Ix=A^{-1}b`),
          step('실제 계산에서는 선형시스템 풀이를 쓴다', '수치적으로는 역행렬을 직접 만들기보다 solve·LU·QR을 쓰는 편이 안정적이다.'),
        ],
        example: example(
          '2×2 역행렬 검산',
          '작은 행렬에서 되돌림을 직접 확인한다.',
          [
            step('행렬', '', String.raw`A=\begin{bmatrix}2&0\\0&4\end{bmatrix}`),
            step('역행렬', '', String.raw`A^{-1}=\begin{bmatrix}1/2&0\\0&1/4\end{bmatrix}`),
            step('곱', '', String.raw`A^{-1}A=\begin{bmatrix}1&0\\0&1\end{bmatrix}=I`),
          ],
          '대각 원소의 역수를 취하면 원래 스케일 변화가 되돌아간다.',
        ),
        checks: ['det(A)=0이면 역행렬 대신 의사역행렬이나 최소제곱 해가 필요하다.', 'AB=I와 BA=I가 모두 성립하는지 확인한다.'],
        references: REFERENCE_SETS.linearAlgebra,
      };
    case 'norm':
      return {
        title: '노름은 여러 성분을 하나의 크기로 요약',
        question: '벡터·오차가 원점에서 얼마나 큰가?',
        summary: 'L2 노름은 성분을 제곱해 더한 뒤 제곱근을 취한다. 제곱 노름은 마지막 제곱근을 생략한다.',
        steps: [
          step('각 성분을 제곱한다', '음수와 양수를 모두 양의 기여도로 바꾼다.'),
          step('제곱값을 모두 더한다', '', String.raw`\sum_i x_i^2`),
          step('노름이면 제곱근을 취한다', '', String.raw`\lVert x\rVert_2=\sqrt{\sum_i x_i^2}`),
          step('제곱 노름인지 구분한다', '', String.raw`\lVert x\rVert_2^2=\sum_i x_i^2`),
        ],
        example: example(
          '3-4-5 벡터',
          '가장 익숙한 피타고라스 예시다.',
          [
            step('벡터', '', String.raw`x=[3,4]^T`),
            step('제곱합', '', String.raw`3^2+4^2=9+16=25`),
            step('제곱근', '', String.raw`\sqrt{25}=5`),
          ],
          '따라서 ||x||₂=5, ||x||₂²=25다.',
        ),
        checks: ['노름은 항상 0 이상이다.', '제곱 노름과 노름을 혼동하면 단위와 미분계수가 달라진다.'],
        references: REFERENCE_SETS.linearAlgebra,
      };
    case 'mse':
      return {
        title: 'MSE는 잔차를 만들고 제곱하고 평균내는 3단계 계산',
        question: '모델 예측이 정답에서 평균적으로 얼마나 멀리 벗어났는가?',
        summary: '예측−정답 잔차를 구한 뒤 각 잔차를 제곱하고 샘플 수로 나눈다. 큰 오차가 더 강하게 벌점받는다.',
        steps: [
          step('예측값을 계산한다', '선형회귀라면 Xw 또는 wᵀx로 예측을 만든다.', String.raw`\hat y=Xw`),
          step('잔차를 계산한다', '', String.raw`r=\hat y-y`),
          step('잔차를 제곱한다', '부호를 없애고 큰 오차를 더 크게 반영한다.', String.raw`r_i^2`),
          step('모두 더해 샘플 수로 나눈다', '', String.raw`\mathrm{MSE}=\frac{1}{L}\sum_{i=1}^{L}r_i^2`),
        ],
        example: example(
          '두 샘플 MSE',
          '정답과 예측을 직접 비교한다.',
          [
            step('정답·예측', '', String.raw`y=[3,1],\quad\hat y=[2,4]`),
            step('잔차', '', String.raw`\hat y-y=[-1,3]`),
            step('제곱', '', String.raw`[-1,3]^2=[1,9]`),
            step('평균', '', String.raw`(1+9)/2=5`),
          ],
          'MSE는 5다. 두 번째 샘플의 오차 3이 전체 값을 크게 올린다.',
        ),
        checks: ['샘플 수로 나눴는지, 단순 제곱합인지 확인한다.', 'MSE 단위는 원래 출력 단위의 제곱이다.'],
        references: REFERENCE_SETS.machineLearning,
      };
    case 'normal-equation':
      return {
        title: '정규방정식은 MSE의 기울기를 0으로 놓아 회귀 가중치를 직접 구함',
        question: '선형회귀의 제곱오차를 가장 작게 만드는 w는 무엇인가?',
        summary: '제곱오차를 전개하고 w로 미분한 뒤 0으로 두면 XᵀXw=Xᵀy가 나온다.',
        steps: [
          step('잔차 제곱합을 쓴다', '', String.raw`J(w)=\lVert Xw-y\rVert_2^2`),
          step('행렬곱으로 전개한다', '', String.raw`J(w)=w^TX^TXw-2w^TX^Ty+y^Ty`),
          step('w로 미분한다', '', String.raw`\nabla_wJ=2X^TXw-2X^Ty`),
          step('최솟값 후보에서 0으로 둔다', '', String.raw`X^TXw=X^Ty`),
          step('선형시스템을 푼다', '', String.raw`w^*=(X^TX)^{-1}X^Ty`),
        ],
        example: example(
          '절편과 기울기 회귀',
          '두 점 (1,1), (2,2)에 직선을 맞춘다.',
          [
            step('행렬 구성', '', String.raw`X=\begin{bmatrix}1&1\\1&2\end{bmatrix},\quad y=\begin{bmatrix}1\\2\end{bmatrix}`),
            step('곱 계산', '', String.raw`X^TX=\begin{bmatrix}2&3\\3&5\end{bmatrix},\quad X^Ty=\begin{bmatrix}3\\5\end{bmatrix}`),
            step('역행렬 적용', '', String.raw`(X^TX)^{-1}=\begin{bmatrix}5&-3\\-3&2\end{bmatrix}`),
            step('가중치', '', String.raw`w^*=\begin{bmatrix}0\\1\end{bmatrix}`),
          ],
          '절편 0, 기울기 1인 y=x가 두 점을 정확히 지난다.',
          '실제 구현에서는 (XᵀX)⁻¹을 직접 만들기보다 QR·SVD·선형 solve를 사용한다.',
        ),
        checks: ['XᵀX가 가역인지 확인한다.', 'w의 길이는 X의 열 수와 같아야 한다.'],
        references: REFERENCE_SETS.linearAlgebra,
      };
    case 'gradient':
      return {
        title: '기울기는 변수를 조금 움직였을 때 손실이 변하는 방향과 세기',
        question: '각 파라미터를 늘리면 목표값이 얼마나 증가하거나 감소하는가?',
        summary: '각 변수에 대한 편미분을 모아 벡터를 만들고, 최적화에서는 그 반대 방향으로 이동한다.',
        steps: [
          step('미분할 변수를 정한다', '다른 변수는 상수로 취급한다.'),
          step('합·곱·연쇄법칙을 적용한다', '복합함수라면 바깥 미분×안쪽 미분 순서로 계산한다.'),
          step('각 편미분을 한 벡터로 모은다', '', String.raw`\nabla f=[\partial f/\partial x_1,\ldots,\partial f/\partial x_N]^T`),
          step('현재 값에 대입한다', '기울기의 숫자와 부호를 얻는다.'),
        ],
        example: example(
          '1차원 손실의 기울기',
          '목표값 3에서 멀어진 정도를 제곱한 손실이다.',
          [
            step('함수', '', String.raw`f(w)=(w-3)^2`),
            step('미분', '', String.raw`f'(w)=2(w-3)`),
            step('w=5 대입', '', String.raw`f'(5)=2(5-3)=4`),
          ],
          '양의 기울기 4이므로 w를 줄이는 방향이 손실을 낮춘다.',
        ),
        checks: ['기울기 벡터의 길이는 파라미터 벡터 길이와 같아야 한다.', '상수항의 미분은 0이다.'],
        references: [...REFERENCE_SETS.linearAlgebra, ...REFERENCE_SETS.optimization].slice(0, 3),
      };
    case 'gradient-descent':
      return {
        title: '경사하강법은 현재값에서 기울기의 반대 방향으로 한 걸음 이동',
        question: '손실을 줄이기 위해 파라미터를 다음에 어디로 옮길 것인가?',
        summary: '현재 파라미터에서 기울기를 계산하고 학습률을 곱한 값을 빼서 다음 파라미터를 만든다.',
        steps: [
          step('현재 손실의 기울기를 계산한다', '', String.raw`g_k=\nabla J(w_k)`),
          step('이동량을 정한다', '', String.raw`\Delta w=\alpha g_k`),
          step('증가 방향의 반대로 이동한다', '', String.raw`w_{k+1}=w_k-\alpha g_k`),
          step('새 손실을 확인하고 반복한다', '학습률이 너무 크면 발산하고 너무 작으면 매우 느리다.'),
        ],
        example: example(
          '한 번의 업데이트',
          'f(w)=(w-3)², 현재 w=5, 학습률 α=0.1이다.',
          [
            step('기울기', '', String.raw`g=2(5-3)=4`),
            step('이동량', '', String.raw`\alpha g=0.1\cdot4=0.4`),
            step('업데이트', '', String.raw`w_{new}=5-0.4=4.6`),
            step('손실 비교', '', String.raw`f(5)=4,\qquad f(4.6)=2.56`),
          ],
          '한 번 이동한 뒤 손실이 4에서 2.56으로 감소했다.',
        ),
        checks: ['마이너스 부호가 있는지 확인한다.', '업데이트 전후 손실과 gradient norm을 함께 기록하면 발산을 빨리 발견할 수 있다.'],
        references: REFERENCE_SETS.optimization,
      };
    case 'optimization-objective':
      return {
        title: 'argmin·argmax는 값 자체가 아니라 그 값을 만드는 입력을 찾는 표기',
        question: '목표함수를 가장 작게 또는 크게 만드는 변수는 무엇인가?',
        summary: '후보 변수를 바꾸며 목적함수를 계산하고, 가장 좋은 값을 내는 변수 위치를 반환한다.',
        steps: [
          step('최적화 변수를 확인한다', 'argmin 아래에 적힌 기호가 우리가 찾는 대상이다.'),
          step('목적함수를 계산한다', '데이터 적합항·정규화항 등 오른쪽 식을 모두 평가한다.'),
          step('후보들을 비교한다', '목적함수가 가장 작은 위치를 고른다.'),
          step('미분 가능하면 기울기 조건을 사용한다', '', String.raw`\nabla J(\theta^*)=0`),
        ],
        example: example(
          '간단한 argmin',
          '제곱함수의 최솟값 위치를 찾는다.',
          [
            step('문제', '', String.raw`\theta^*=\arg\min_{\theta}(\theta-2)^2`),
            step('미분', '', String.raw`2(\theta-2)=0`),
            step('해', '', String.raw`\theta^*=2`),
          ],
          '최솟값은 0이지만 argmin의 답은 그 값을 만드는 입력 2다.',
        ),
        checks: ['argmin의 결과와 최소 함수값을 구분한다.', '제약조건이 있으면 해가 경계에 있을 수 있다.'],
        references: REFERENCE_SETS.optimization,
      };
    case 'regularization':
      return {
        title: '정규화는 데이터 오차와 모델 복잡도 벌점을 함께 계산',
        question: '훈련 데이터에 맞으면서도 지나치게 큰 가중치를 피하려면 어떻게 점수를 매기는가?',
        summary: '기본 손실에 λ×가중치 크기 벌점을 더한다. λ가 커질수록 단순한 모델을 더 강하게 선호한다.',
        steps: [
          step('데이터 적합 손실을 계산한다', '예: MSE 또는 cross-entropy.'),
          step('가중치 크기를 계산한다', '', String.raw`\lVert w\rVert_2^2=\sum_i w_i^2`),
          step('λ를 곱해 벌점을 만든다', '', String.raw`\text{penalty}=\lambda\lVert w\rVert_2^2`),
          step('두 항을 더한다', '', String.raw`J=J_{data}+\lambda\lVert w\rVert_2^2`),
        ],
        example: example(
          'L2 정규화가 더하는 값',
          '기본 손실 1.2, w=[3,4], λ=0.1이다.',
          [
            step('가중치 제곱합', '', String.raw`3^2+4^2=25`),
            step('정규화 벌점', '', String.raw`0.1\cdot25=2.5`),
            step('전체 목적함수', '', String.raw`1.2+2.5=3.7`),
          ],
          '큰 가중치를 쓰면 데이터 손실이 작더라도 전체 점수는 커질 수 있다.',
        ),
        checks: ['논문마다 λ/2 또는 1/2 계수가 붙을 수 있으므로 미분식과 함께 확인한다.', 'λ는 훈련 데이터가 아니라 검증 데이터로 선택한다.'],
        references: REFERENCE_SETS.machineLearning,
      };
    case 'hyperplane':
      return {
        title: '초평면 분류기는 가중합 점수의 부호로 클래스를 나눔',
        question: '입력 x가 결정경계의 어느 쪽에 있는가?',
        summary: 'wᵀx+b를 계산해 양수면 한 클래스, 음수면 다른 클래스로 보낸다. 0이면 경계 위다.',
        steps: [
          step('특징과 가중치를 같은 위치끼리 곱한다', '', String.raw`w_ix_i`),
          step('모든 곱을 더하고 bias를 더한다', '', String.raw`g(x)=w^Tx+b`),
          step('부호를 확인한다', '', String.raw`g(x)>0\Rightarrow+1,\quad g(x)<0\Rightarrow-1`),
          step('필요하면 경계까지 거리를 구한다', '', String.raw`\mathrm{distance}=|g(x)|/\lVert w\rVert_2`),
        ],
        example: example(
          '한 점 분류하기',
          'w=[1,-2], x=[3,1], b=0.5이다.',
          [
            step('가중합', '', String.raw`1\cdot3+(-2)\cdot1+0.5=1.5`),
            step('클래스', '', String.raw`\operatorname{sign}(1.5)=+1`),
            step('경계까지 거리', '', String.raw`1.5/\sqrt{1^2+(-2)^2}\approx0.67`),
          ],
          '이 점은 양의 클래스 쪽에 있고 경계에서 약 0.67 떨어져 있다.',
        ),
        checks: ['w와 x의 차원이 같아야 한다.', '거리에는 |g(x)|가 필요하지만 signed distance는 부호를 유지할 수 있다.'],
        references: REFERENCE_SETS.machineLearning,
      };
    case 'sigmoid':
      return {
        title: '시그모이드는 실수 점수를 0과 1 사이 값으로 압축',
        question: '선형 점수를 확률처럼 해석 가능한 값으로 어떻게 바꾸는가?',
        summary: '점수 z에 음수를 붙여 지수함수를 계산하고 1+e^{-z}의 역수를 취한다.',
        steps: [
          step('선형 점수 z를 계산한다', '', String.raw`z=w^Tx+b`),
          step('음의 지수값을 계산한다', '', String.raw`e^{-z}`),
          step('1을 더한다', '', String.raw`1+e^{-z}`),
          step('역수를 취한다', '', String.raw`\sigma(z)=1/(1+e^{-z})`),
        ],
        example: example(
          'z=2일 때',
          '양의 점수가 어느 정도의 출력으로 변하는지 본다.',
          [
            step('지수', '', String.raw`e^{-2}\approx0.1353`),
            step('분모', '', String.raw`1+0.1353=1.1353`),
            step('역수', '', String.raw`1/1.1353\approx0.881`),
          ],
          '출력은 약 0.881이다.',
        ),
        checks: ['z=0이면 정확히 0.5다.', '큰 양수에서는 1, 큰 음수에서는 0에 가까워진다.'],
        references: REFERENCE_SETS.machineLearning,
      };
    case 'convolution':
      return {
        title: '컨볼루션은 커널을 이동시키며 원소별 곱과 합을 반복',
        question: '각 위치 주변의 값을 필터 가중치로 어떻게 요약하는가?',
        summary: '커널을 뒤집고 이동한 뒤 겹친 원소끼리 곱해 더한다. CNN 구현은 흔히 뒤집지 않는 cross-correlation을 사용한다.',
        steps: [
          step('커널 방향과 경계조건을 확인한다', '수학적 convolution인지 CNN식 cross-correlation인지 먼저 구분한다.'),
          step('출력 위치에 커널을 맞춘다', 'stride·padding에 따라 겹치는 입력 영역이 정해진다.'),
          step('겹친 원소끼리 곱한다', '', String.raw`f[k]h[n-k]`),
          step('곱을 모두 더한다', '', String.raw`g[n]=\sum_k f[k]h[n-k]`),
          step('다음 위치로 이동해 반복한다', '2D에서는 가로·세로 두 인덱스에 대해 같은 작업을 한다.'),
        ],
        example: example(
          '1D full convolution',
          '신호 [1,2,3]과 커널 [1,1]을 사용한다.',
          [
            step('첫 위치', '', String.raw`1\cdot1=1`),
            step('두 번째 위치', '', String.raw`1\cdot1+2\cdot1=3`),
            step('세 번째 위치', '', String.raw`2\cdot1+3\cdot1=5`),
            step('마지막 위치', '', String.raw`3\cdot1=3`),
          ],
          'full 출력은 [1,3,5,3]이다.',
          'same/valid padding을 쓰면 출력 길이가 달라진다.',
        ),
        checks: ['출력 크기는 kernel·padding·stride·dilation에 의해 결정된다.', '커널 뒤집기 convention을 코드와 수식에서 일치시킨다.'],
        references: REFERENCE_SETS.convolution,
      };
    case 'expectation':
      return {
        title: '기댓값은 가능한 값에 확률을 곱해 모두 더한 장기 평균',
        question: '같은 실험을 매우 많이 반복하면 평균이 어디에 가까워지는가?',
        summary: '각 결과값×그 결과의 확률을 계산한 뒤 합한다. 연속형에서는 합 대신 적분한다.',
        steps: [
          step('가능한 값과 확률을 짝지운다', '', String.raw`(x_i,p_i)`),
          step('각 값에 확률을 곱한다', '', String.raw`x_ip_i`),
          step('모두 더한다', '', String.raw`E[X]=\sum_i x_ip_i`),
          step('확률의 합을 확인한다', '', String.raw`\sum_i p_i=1`),
        ],
        example: example(
          '이산 확률변수 평균',
          'X가 1,2,3을 각각 0.2,0.5,0.3 확률로 갖는다.',
          [
            step('가중값', '', String.raw`1(0.2),\ 2(0.5),\ 3(0.3)`),
            step('합', '', String.raw`0.2+1.0+0.9=2.1`),
          ],
          'E[X]=2.1이다. 실제 관측값 중 하나일 필요는 없다.',
        ),
        checks: ['확률 또는 밀도가 정규화되어야 한다.', 'E[g(X)]는 일반적으로 g(E[X])와 같지 않다.'],
        references: REFERENCE_SETS.probability,
      };
    case 'variance':
      return {
        title: '분산은 평균에서 떨어진 거리의 제곱을 평균낸 값',
        question: '확률변수가 평균 주변에 얼마나 넓게 퍼져 있는가?',
        summary: '각 값에서 평균을 빼고 제곱한 뒤 확률가중평균을 계산한다.',
        steps: [
          step('평균을 구한다', '', String.raw`\mu=E[X]`),
          step('평균과의 차이를 구한다', '', String.raw`X-\mu`),
          step('차이를 제곱한다', '', String.raw`(X-\mu)^2`),
          step('기댓값을 취한다', '', String.raw`\operatorname{Var}(X)=E[(X-\mu)^2]`),
        ],
        example: example(
          'X∈{1,2,3}, 확률 {0.2,0.5,0.3}',
          '앞 예시의 평균 μ=2.1을 사용한다.',
          [
            step('제곱편차', '', String.raw`(1-2.1)^2=1.21,\ (2-2.1)^2=0.01,\ (3-2.1)^2=0.81`),
            step('확률 가중합', '', String.raw`0.2(1.21)+0.5(0.01)+0.3(0.81)=0.49`),
          ],
          '분산은 0.49, 표준편차는 √0.49=0.7이다.',
        ),
        checks: ['분산은 음수가 될 수 없다.', '표준편차는 원래 변수와 같은 단위지만 분산은 단위의 제곱이다.'],
        references: REFERENCE_SETS.probability,
      };
    case 'covariance':
      return {
        title: '공분산은 두 변수가 평균에서 함께 움직이는 방향을 측정',
        question: 'X가 평균보다 클 때 Y도 함께 커지는가?',
        summary: '각 변수에서 평균을 뺀 편차끼리 곱한 뒤 평균낸다. 양수면 같은 방향, 음수면 반대 방향 경향이다.',
        steps: [
          step('각 변수의 평균을 구한다', '', String.raw`\mu_X=E[X],\quad\mu_Y=E[Y]`),
          step('편차를 계산한다', '', String.raw`X-\mu_X,\quad Y-\mu_Y`),
          step('편차끼리 곱한다', '', String.raw`(X-\mu_X)(Y-\mu_Y)`),
          step('기댓값 또는 표본평균을 취한다', '', String.raw`\operatorname{Cov}(X,Y)=E[(X-\mu_X)(Y-\mu_Y)]`),
        ],
        example: example(
          '두 샘플의 공분산 방향',
          'X=[1,3], Y=[2,6]이며 평균은 2와 4다.',
          [
            step('편차', '', String.raw`X-2=[-1,1],\quad Y-4=[-2,2]`),
            step('편차곱', '', String.raw`[2,2]`),
            step('평균', '', String.raw`(2+2)/2=2`),
          ],
          '양의 공분산이므로 두 변수는 함께 증가하는 방향을 보인다.',
        ),
        checks: ['Cov(X,X)=Var(X)다.', '공분산 0은 일반적으로 독립을 보장하지 않는다.'],
        references: REFERENCE_SETS.probability,
      };
    case 'gaussian':
      return {
        title: '가우시안 밀도는 평균에서의 표준화 거리로 가능성을 계산',
        question: '관측값 x가 평균 μ와 공분산 Σ를 가진 분포에서 얼마나 그럴듯한가?',
        summary: '평균과의 차이를 공분산으로 스케일링한 거리와 정규화 상수를 계산해 밀도를 얻는다.',
        steps: [
          step('평균에서의 차이를 구한다', '', String.raw`r=x-\mu`),
          step('분산·공분산으로 거리 스케일을 보정한다', '', String.raw`d^2=r^T\Sigma^{-1}r`),
          step('지수 감쇠를 계산한다', '', String.raw`\exp(-d^2/2)`),
          step('정규화 상수로 나눈다', '', String.raw`(2\pi)^{N/2}|\Sigma|^{1/2}`),
        ],
        example: example(
          '표준정규에서 x=1',
          'μ=0, σ=1인 1차원 가우시안이다.',
          [
            step('표준화 거리', '', String.raw`z=(1-0)/1=1`),
            step('지수항', '', String.raw`e^{-1^2/2}=e^{-0.5}\approx0.6065`),
            step('정규화', '', String.raw`0.6065/\sqrt{2\pi}\approx0.2420`),
          ],
          'x=1에서 확률밀도는 약 0.242다. 밀도값 자체는 사건확률이 아니다.',
        ),
        checks: ['Σ는 대칭 양의 정부호여야 역행렬과 양의 밀도가 안정적으로 정의된다.', '확률은 구간 적분으로 얻으며 한 점의 밀도와 구분한다.'],
        references: REFERENCE_SETS.probability,
      };
    case 'bayes':
      return {
        title: '베이즈 규칙은 우도×사전확률을 관측 전체 가능성으로 정규화',
        question: '관측 x를 본 뒤 클래스 S의 확률은 얼마인가?',
        summary: '관측이 그 클래스에서 나올 가능성에 관측 전 클래스 비율을 곱하고, 모든 설명의 합인 p(x)로 나눈다.',
        steps: [
          step('사전확률을 확인한다', '', String.raw`P(S)`),
          step('클래스별 우도를 계산한다', '', String.raw`p(x\mid S)`),
          step('둘을 곱해 공동점수를 만든다', '', String.raw`p(x\mid S)P(S)`),
          step('모든 클래스 점수의 합으로 나눈다', '', String.raw`P(S\mid x)=\frac{p(x\mid S)P(S)}{p(x)}`),
        ],
        example: example(
          '사후확률 계산',
          'P(S)=0.4, p(x|S)=0.3, p(x)=0.2라고 하자.',
          [
            step('분자', '', String.raw`0.3\cdot0.4=0.12`),
            step('정규화', '', String.raw`0.12/0.2=0.6`),
          ],
          '관측 후 클래스 S의 확률은 0.6이다.',
          'p(x)는 모든 클래스의 p(x|S_c)P(S_c)를 더해 계산한다.',
        ),
        checks: ['모든 클래스의 사후확률 합은 1이어야 한다.', '분류만 필요하면 클래스 공통 분모 p(x)를 생략해도 순위는 같다.'],
        references: REFERENCE_SETS.probability,
      };
    case 'risk':
      return {
        title: '조건부 위험은 각 실제 클래스에서 생길 손실의 확률가중합',
        question: '현재 관측에서 어떤 행동을 택해야 평균 손실이 가장 작은가?',
        summary: '행동 하나를 가정하고 각 실제 클래스일 때의 손실×사후확률을 모두 더한다. 위험이 가장 작은 행동을 고른다.',
        steps: [
          step('후보 행동을 하나 고른다', '', String.raw`a_c`),
          step('실제 클래스별 손실을 적는다', '', String.raw`L(a_c\mid S_j)`),
          step('각 손실에 사후확률을 곱한다', '', String.raw`L(a_c\mid S_j)P(S_j\mid x)`),
          step('모든 클래스를 더한다', '', String.raw`R_c(x)=\sum_jL(a_c\mid S_j)P(S_j\mid x)`),
          step('가장 작은 위험을 선택한다', '', String.raw`c^*=\arg\min_cR_c(x)`),
        ],
        example: example(
          '0-1 손실의 두 클래스',
          'P(S₁|x)=0.7, P(S₂|x)=0.3이다.',
          [
            step('S₁로 결정할 위험', '', String.raw`R_1=0(0.7)+1(0.3)=0.3`),
            step('S₂로 결정할 위험', '', String.raw`R_2=1(0.7)+0(0.3)=0.7`),
          ],
          'R₁<R₂이므로 S₁을 선택한다.',
        ),
        checks: ['손실행렬의 행·열 의미를 먼저 고정한다.', '비대칭 비용이면 가장 확률이 큰 클래스와 최소위험 결정이 다를 수 있다.'],
        references: REFERENCE_SETS.probability,
      };
    case 'kernel':
      return {
        title: '커널은 특징공간을 직접 만들지 않고 두 입력의 내적·유사도를 계산',
        question: '비선형 관계를 선형모델이 사용할 수 있는 유사도 점수로 어떻게 바꾸는가?',
        summary: '두 입력의 거리 또는 특징공간 내적을 계산해 스칼라 유사도 κ(u,v)를 만든다.',
        steps: [
          step('두 입력의 차이를 구한다', '', String.raw`r=u-v`),
          step('거리 제곱을 계산한다', '', String.raw`\lVert r\rVert_2^2`),
          step('커널 폭으로 나눈다', '', String.raw`\lVert r\rVert_2^2/(2\sigma^2)`),
          step('음의 지수함수로 유사도를 만든다', '', String.raw`\kappa(u,v)=e^{-\lVert u-v\rVert^2/(2\sigma^2)}`),
        ],
        example: example(
          'RBF 커널',
          'u=[0,0], v=[1,1], σ=1이다.',
          [
            step('거리 제곱', '', String.raw`(0-1)^2+(0-1)^2=2`),
            step('지수', '', String.raw`e^{-2/(2\cdot1^2)}=e^{-1}\approx0.368`),
          ],
          '두 점의 RBF 유사도는 약 0.368이다.',
        ),
        checks: ['u=v이면 RBF 커널은 1이다.', 'σ가 너무 작으면 거의 모든 다른 점이 0에 가깝고, 너무 크면 모두 비슷해진다.'],
        references: REFERENCE_SETS.machineLearning,
      };
    case 'distance-classifier':
      return {
        title: '최소거리 분류는 클래스 대표점까지 거리를 계산해 가장 가까운 곳 선택',
        question: '입력 x는 어느 클래스 평균과 가장 가까운가?',
        summary: '클래스별 평균 m_c를 구하고 x와의 거리 D_c(x)를 모두 비교한다.',
        steps: [
          step('클래스 대표점을 계산한다', '', String.raw`m_c=\frac{1}{M_c}\sum_{x\in S_c}x`),
          step('입력과 대표점의 차이를 구한다', '', String.raw`r_c=x-m_c`),
          step('거리 제곱을 계산한다', '', String.raw`D_c(x)=\lVert r_c\rVert_2^2`),
          step('가장 작은 클래스를 고른다', '', String.raw`c^*=\arg\min_cD_c(x)`),
        ],
        example: example(
          '2차원 두 클래스',
          'x=(3,2), m₁=(2,2), m₂=(5,2)다.',
          [
            step('클래스 1 거리', '', String.raw`D_1=(3-2)^2+(2-2)^2=1`),
            step('클래스 2 거리', '', String.raw`D_2=(3-5)^2+(2-2)^2=4`),
          ],
          'D₁<D₂이므로 클래스 1로 분류한다.',
        ),
        checks: ['비교할 때 거리와 거리 제곱 중 하나로 통일한다.', '특징 스케일이 다르면 표준화 또는 Mahalanobis 거리가 필요할 수 있다.'],
        references: REFERENCE_SETS.machineLearning,
      };
    case 'naive-bayes':
      return {
        title: '나이브 베이즈는 조건부 독립을 가정해 특징별 우도를 곱함',
        question: '여러 특징을 관측했을 때 어느 클래스의 점수가 가장 큰가?',
        summary: '클래스 사전확률에 각 특징의 조건부 우도를 차례로 곱하고 클래스끼리 비교한다.',
        steps: [
          step('클래스 사전확률을 준비한다', '', String.raw`P(S_c)`),
          step('특징별 조건부 우도를 계산한다', '', String.raw`p(x_n\mid S_c)`),
          step('모두 곱한다', '', String.raw`\text{score}_c=P(S_c)\prod_np(x_n\mid S_c)`),
          step('수치 안정성을 위해 로그합으로 바꿀 수 있다', '', String.raw`\log\text{score}_c=\log P(S_c)+\sum_n\log p(x_n\mid S_c)`),
          step('가장 큰 점수의 클래스를 고른다', '', String.raw`c^*=\arg\max_c\text{score}_c`),
        ],
        example: example(
          '두 특징·두 클래스',
          'S₁: prior=.6, likelihoods=.8,.5 / S₂: prior=.4, likelihoods=.3,.9다.',
          [
            step('S₁ 점수', '', String.raw`0.6\cdot0.8\cdot0.5=0.24`),
            step('S₂ 점수', '', String.raw`0.4\cdot0.3\cdot0.9=0.108`),
          ],
          '0.24>0.108이므로 S₁을 선택한다.',
        ),
        checks: ['일반 MAP 식에는 사전확률 P(S_c)가 포함된다.', '특징 수가 많으면 곱이 underflow되므로 log-domain 계산을 쓴다.'],
        references: REFERENCE_SETS.probability,
      };
    case 'dimension-growth':
      return {
        title: '차원의 저주는 축마다 필요한 점 수가 곱으로 폭증하는 현상',
        question: '각 축을 같은 해상도로 덮을 때 전체 표본 수가 얼마나 필요한가?',
        summary: '축 하나당 q개 지점이 필요하면 d차원 전체 격자에는 q^d개가 필요하다.',
        steps: [
          step('축 하나의 해상도 q를 정한다', '예: 축마다 5개 지점.'),
          step('차원 수 d를 확인한다', '특징의 독립 축 수다.'),
          step('차원마다 곱한다', '', String.raw`N=q^d`),
          step('데이터·연산 증가를 해석한다', 'd가 선형으로 늘어도 N은 지수적으로 증가한다.'),
        ],
        example: example(
          '축마다 5개 지점',
          '차원을 1→2→3→10으로 늘린다.',
          [
            step('1차원', '', String.raw`5^1=5`),
            step('2차원', '', String.raw`5^2=25`),
            step('3차원', '', String.raw`5^3=125`),
            step('10차원', '', String.raw`5^{10}=9{,}765{,}625`),
          ],
          '해상도는 그대로인데 차원만 늘려도 필요한 격자점이 폭발한다.',
        ),
        checks: ['명목 차원과 실제 데이터가 놓인 intrinsic dimension을 구분한다.', '차원축소·희소성·구조적 가정이 필요한 이유를 연결해 본다.'],
        references: REFERENCE_SETS.machineLearning,
      };
    case 'kfold':
      return {
        title: 'K-fold는 검증 역할을 번갈아 맡겨 성능을 평균냄',
        question: '작은 데이터에서 한 번의 우연한 분할에 덜 의존하는 성능 추정치는 무엇인가?',
        summary: '데이터를 K조각으로 나누고 매번 한 조각만 검증에 사용해 K개의 점수를 평균낸다.',
        steps: [
          step('데이터를 K개 비중복 fold로 나눈다'),
          step('k번째 fold를 검증용으로 남긴다'),
          step('나머지 K−1개 fold로 새 모델을 학습한다'),
          step('검증 오차를 기록한다', '', String.raw`e_k`),
          step('K개 오차를 평균낸다', '', String.raw`\bar e=\frac1K\sum_{k=1}^{K}e_k`),
        ],
        example: example(
          '5-fold 평균',
          '검증 오차가 0.18, 0.20, 0.16, 0.19, 0.17이다.',
          [
            step('합', '', String.raw`0.18+0.20+0.16+0.19+0.17=0.90`),
            step('평균', '', String.raw`0.90/5=0.18`),
          ],
          '평균 검증 오차는 0.18이다.',
        ),
        checks: ['각 fold마다 모델을 처음부터 다시 학습해야 한다.', '시간·사람·개체가 묶인 데이터는 무작위 분할 대신 group/time-aware split이 필요하다.'],
        references: REFERENCE_SETS.machineLearning,
      };
    case 'probability':
      return {
        title: '확률식은 사건 정의 → 조건 확인 → 합·곱·정규화 순서로 계산',
        question: '어떤 사건 또는 관측 구간의 가능성을 구하는가?',
        summary: '사건의 범위를 정하고, 배타적 경우는 더하며, 연쇄된 조건은 조건부확률로 곱한다.',
        steps: [
          step('사건과 조건을 말로 번역한다', 'P(A|B)는 B가 주어진 상태에서 A의 확률이다.'),
          step('합 규칙인지 곱 규칙인지 정한다', '배타적 대안은 합, 순차 조건은 곱을 사용한다.'),
          step('필요하면 전체확률로 분모를 계산한다'),
          step('0≤P≤1과 전체합 1을 검산한다'),
        ],
        example: example(
          '조건부확률',
          'P(A∩B)=0.15, P(B)=0.30이다.',
          [
            step('정의 적용', '', String.raw`P(A\mid B)=\frac{P(A\cap B)}{P(B)}`),
            step('대입', '', String.raw`0.15/0.30=0.5`),
          ],
          'B가 일어난 경우의 절반에서 A도 일어난다.',
        ),
        checks: ['조건부확률의 분모 사건 확률이 0이 아니어야 한다.', '밀도 p(x)와 사건확률 P(X∈A)를 구분한다.'],
        references: REFERENCE_SETS.probability,
      };
    default:
      return {
        title: '수식을 계산 가능한 작은 연산으로 분해하기',
        question: '등호 왼쪽 값을 만들기 위해 오른쪽에서 어떤 연산을 어떤 순서로 수행하는가?',
        summary: '괄호·인덱스·내적·합·나눗셈을 안쪽부터 계산하고, 마지막에 왼쪽 값의 차원과 의미를 확인한다.',
        steps: [
          step('등호 왼쪽의 목표를 확인한다', '스칼라·벡터·행렬·확률 중 무엇을 구하는지 먼저 정한다.'),
          step('입력 기호의 값과 차원을 적는다', '기호를 말로만 읽지 말고 작은 숫자 예시로 치환한다.'),
          step('가장 안쪽 괄호와 인덱스부터 계산한다'),
          step('곱 → 합 → 정규화 순서로 바깥 연산을 진행한다'),
          step('차원·부호·범위를 검산한다', '왼쪽과 오른쪽의 모양과 단위가 일치해야 한다.'),
        ],
        example: example(
          '직접 계산하는 공통 절차',
          '복잡한 식도 N=2 또는 샘플 2개로 축소한다.',
          [
            step('최소 크기 선택', '', String.raw`N=2`),
            step('기호를 숫자로 치환', '', String.raw`x=[1,2]^T`),
            step('안쪽 연산부터 기록', '중간값을 생략하지 않고 한 줄씩 적는다.'),
            step('최종 범위 확인', '확률이면 0~1, 거리·제곱오차면 0 이상인지 본다.'),
          ],
          '이 절차를 적용하면 기호 조작이 아니라 재현 가능한 계산으로 읽을 수 있다.',
        ),
        checks: ['좌변과 우변의 차원·단위를 비교한다.', '바로 앞 문단에서 정의된 인덱스 범위와 분모를 다시 확인한다.'],
        references: REFERENCE_SETS.machineLearning,
      };
  }
}

function extractSymbols(tex) {
  const seen = new Set();
  const symbols = [];
  for (const [token, symbolTex, meaning] of SYMBOL_DICTIONARY) {
    if (!tex.includes(token) || seen.has(symbolTex)) continue;
    seen.add(symbolTex);
    symbols.push({ tex: symbolTex, meaning });
    if (symbols.length >= 8) break;
  }
  return symbols;
}

export function buildFormulaGuide({ formulaId = '', tex, section = '', part = 1 }) {
  const family = inferFamily({ tex, section, formulaId });
  const guide = guideForFamily(family);
  return {
    ...guide,
    family,
    area: formulaArea(formulaId),
    formulaId,
    part,
    symbols: extractSymbols(tex),
    badges: [
      `${guide.steps.length}단계 계산`,
      guide.example ? '숫자 예제' : '계산 절차',
      guide.checks?.length ? '검산 포함' : '개념 설명',
    ],
  };
}

export function formulaCardTitle({ formulaId = '', section = '', tex = '' }) {
  const family = inferFamily({ tex, section, formulaId });
  const guide = guideForFamily(family);
  return guide.title;
}

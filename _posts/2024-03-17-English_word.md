---
author_profile: true
categories:
- Resources
- Study-Notes
excerpt: <div id="study-section">...
last_modified_at: 2024-03-17
layout: single
tag:
- study-notes
- vocabulary
- technical-terms
- computer-vision
- artificial-intelligence
title: Essential Vocabulary
toc: true
toc_label: 목차
---

<div id="study-section">

</div>

<div id="quiz-section" style="display: none;">
  <h2>Computer Vision 용어 퀴즈</h2>
  <div id="quiz-container">
    <div id="quiz-progress">문제 <span id="current-question">1</span> / <span id="total-questions">10</span></div>
    <div id="question-container"></div>
    <div id="options-container"></div>
    <div id="result-message" style="display: none;"></div>
    <button id="next-btn" style="display: none;">다음 문제</button>
    <div id="final-score" style="display: none;"></div>
  </div>
</div>

<div id="control-buttons" style="margin-top: 20px;">
  <button id="start-quiz" onclick="startQuiz()">시험 시작하기</button>
  <button id="return-study" onclick="returnToStudy()" style="display: none;">학습 모드로 돌아가기</button>
</div>

<style>
#quiz-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

#quiz-container {
  max-width: 800px;
  margin: 0 auto;
}

#question-container {
  font-size: 1.2em;
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.option {
  padding: 10px 15px;
  margin: 10px 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option:hover {
  background: #e9ecef;
}

.option.correct {
  background: #d4edda;
  border-color: #c3e6cb;
}

.option.incorrect {
  background: #f8d7da;
  border-color: #f5c6cb;
}

button {
  padding: 10px 20px;
  margin: 10px 5px;
  border: none;
  border-radius: 5px;
  background: #007bff;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #0056b3;
}

#quiz-progress {
  text-align: right;
  margin-bottom: 20px;
  color: #6c757d;
}

#result-message {
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
  text-align: center;
}

#final-score {
  text-align: center;
  font-size: 1.2em;
  margin: 20px 0;
  padding: 20px;
  background: #e9ecef;
  border-radius: 5px;
}
</style>

<script>
const vocabularyData = [
  { word: 'Perceive', type: '동사', meaning: '인지하다, 감지하다', example: 'Computers can perceive subtle differences in images that humans might miss.' },
  { word: 'Perceptual', type: '형용사', meaning: '지각의, 인지의', example: 'Perceptual computing aims to mimic human sensory processing.' },
  { word: 'Misperception', type: '명사', meaning: '오인, 잘못된 인식', example: 'Image artifacts can lead to misperception in computer vision systems.' },
  { word: 'Translucency', type: '명사', meaning: '반투명성', example: 'Processing translucency in images requires advanced rendering techniques.' },
  { word: 'Subtle', type: '형용사', meaning: '미묘한, 섬세한', example: 'The algorithm can detect subtle changes in lighting conditions.' },
  { word: 'Shading', type: '명사', meaning: '음영', example: 'Proper shading analysis helps in understanding 3D structures.' },
  { word: 'Effortlessly', type: '부사', meaning: '수월하게, 어려움 없이', example: 'Modern AI systems effortlessly process thousands of images per second.' },
  { word: 'Portrait', type: '명사', meaning: '초상, 인물 사진', example: 'Face detection algorithms are crucial for portrait photography.' },
  { word: 'Rapid', type: '형용사', meaning: '빠른, 신속한', example: 'Rapid image processing is essential for real-time applications.' },
  { word: 'Delineate', type: '동사', meaning: '윤곽을 그리다, 묘사하다', example: 'The algorithm can delineate object boundaries precisely.' },
  { word: 'Causality', type: '명사', meaning: '인과관계', example: 'Understanding causality in scene analysis improves prediction accuracy.' },
  { word: 'Radiometry', type: '명사', meaning: '방사측정', example: 'Radiometry is fundamental to understanding light behavior in images.' },
  { word: 'Inspection', type: '명사', meaning: '검사, 점검', example: 'Automated visual inspection systems in manufacturing.' },
  { word: 'Retail', type: '명사', meaning: '소매, 유통', example: 'Computer vision enhances retail analytics and customer behavior tracking.' },
  { word: 'Warehouse', type: '명사', meaning: '창고', example: 'Automated warehouse systems use computer vision for inventory management.' },
  { word: 'Logistics', type: '명사', meaning: '물류', example: 'Computer vision optimizes logistics operations through package tracking.' },
  { word: 'Intra-operative', type: '형용사', meaning: '수술 중의', example: 'Intra-operative imaging assists surgeons during procedures.' },
  { word: 'Morphology', type: '명사', meaning: '형태학', example: 'Mathematical morphology is used in image processing.' },
  { word: 'Surveillance', type: '명사', meaning: '감시, 보안', example: 'Video surveillance systems employ advanced computer vision techniques.' },
  { word: 'Stitching', type: '명사', meaning: '이미지 접합', example: 'Panorama creation through image stitching.' },
  { word: 'Overlapping', type: '형용사', meaning: '중첩되는', example: 'Overlapping images are used in 3D reconstruction.' },
  { word: 'Bracketing', type: '명사', meaning: '브라케팅(노출 단계 조절)', example: 'HDR images are created using exposure bracketing.' },
  { word: 'Morphing', type: '명사', meaning: '변형', example: 'Face morphing creates smooth transitions between images.' },
  { word: 'Meticulously', type: '부사', meaning: '꼼꼼하게, 정교하게', example: 'AI models must be meticulously trained for optimal performance.' },
  { word: 'Layer-wise, sample-wise', type: '형용사', meaning: '층별, 샘플별', example: 'Neural networks are analyzed layer-wise for better understanding.' },
  { word: 'Preexisting', type: '형용사', meaning: '기존의, 이미 존재하는', example: 'Preexisting models can be fine-tuned for specific tasks.' },
  { word: 'Plausible', type: '형용사', meaning: '그럴듯한, 타당한', example: 'The system generates plausible reconstructions of 3D scenes.' },
  { word: 'Pose Forecasting', type: '명사구', meaning: '자세 예측', example: 'Pose forecasting is crucial for safe human-robot interaction.' },
  { word: 'Ablation', type: '명사', meaning: '(신경망 등에서) 일부 제거, 절제', example: 'Ablation studies help understand the contribution of different model components.' },
  { word: 'Endow', type: '동사', meaning: '부여하다, 주다', example: 'The new sensor endows the robot with better perceptive capabilities.' },
  { word: 'Perceptive', type: '형용사', meaning: '지각하는, 통찰력 있는', example: 'Perceptive robots can adapt to dynamic environments.' },
  { word: 'Harm', type: '명사/동사', meaning: '해, 손상 / 해를 끼치다', example: 'The primary goal is to prevent any harm to the human worker.' },
  { word: 'Transmission of contact wrenches', type: '명사구', meaning: '접촉력 전달', example: 'Accurate transmission of contact wrenches is vital for haptic feedback.' },
  { word: 'On-the-fly', type: '부사구', meaning: '즉석에서, 실시간으로', example: 'The robot can adjust its path on-the-fly to avoid obstacles.' },
  { word: 'Adjacency', type: '명사', meaning: '인접, 근접', example: 'Adjacency matrices are used to represent connections in a graph.' },
  { word: 'Sparse', type: '형용사', meaning: '희소한, 드문드문 있는', example: 'Sparse data can be challenging for some machine learning models.' },
  { word: 'Sparsity', type: '명사', meaning: '희소성', example: 'Sparsity is a desirable property in many high-dimensional datasets.' },
  { word: 'Abide', type: '동사', meaning: '(규칙 등을) 준수하다, 지키다', example: 'Robots must abide by safety protocols.' },
  { word: 'Genuine', type: '형용사', meaning: '진짜의, 진정한', example: 'The system aims to achieve genuine collaboration between humans and robots.' },
  { word: 'Foresee', type: '동사', meaning: '예견하다, 예측하다', example: 'It is difficult to foresee all possible scenarios in a complex environment.' },
  { word: 'Exploited', type: '동사, 수동태 또는 과거형', meaning: '활용된, 이용된', example: "The robot's capabilities were fully exploited in the task." },
  { word: 'Aspect', type: '명사', meaning: '측면, 양상', example: 'Safety is a critical aspect of human-robot collaboration.' },
  { word: 'Intersection', type: '명사', meaning: '교차점, 교집합', example: 'The intersection of AI and robotics has led to many innovations.' },
  { word: 'Prune', type: '동사', meaning: '(가지 등을) 치다, 제거하다, 간결하게 하다', example: 'Pruning the neural network can reduce its complexity.' },
  { word: 'Factorize', type: '동사', meaning: '인수분해하다, 요인으로 분석하다', example: 'We can factorize the matrix to understand its underlying structure.' },
  { word: 'Spectral', type: '형용사', meaning: '스펙트럼의, 분광의', example: 'Spectral analysis is used in various sensor technologies.' },
  { word: 'Coarse', type: '형용사', meaning: '거친, 대략적인', example: 'A coarse estimation was made initially, followed by a finer adjustment.' },
  { word: 'Sparsifying', type: '동사/형용사', meaning: '희소화하는', example: 'Sparsifying techniques are used to reduce data dimensionality.' },
  { word: 'Formalize', type: '동사', meaning: '공식화하다, 형식화하다', example: 'We need to formalize the problem statement before designing a solution.' },
  { word: 'Density', type: '명사', meaning: '밀도', example: 'Probability density functions describe the likelihood of a continuous variable.' },
  { word: 'PDF (Probability Density Function)', type: '명사', meaning: '확률 밀도 함수', example: 'The PDF of a normal distribution is bell-shaped.' },
  { word: 'PMF (Probability Mass Function)', type: '명사', meaning: '확률 질량 함수', example: 'The PMF is used for discrete random variables.' },
  { word: 'Accomplish', type: '동사', meaning: '성취하다, 달성하다', example: 'The AI model was able to accomplish the task with high accuracy.' },
  { word: 'Observed', type: '형용사/동사 과거형', meaning: '관찰된', example: 'The observed data was used to train the model.' },
  { word: 'Intractable', type: '형용사', meaning: '다루기 힘든, 처리하기 어려운', example: 'Some problems are computationally intractable.' },
  { word: 'Coefficient', type: '명사', meaning: '계수', example: 'The coefficients of the linear regression model were estimated.' },
  { word: 'Era', type: '명사', meaning: '시대', example: 'We are in the era of big data and artificial intelligence.' },
  { word: 'Deluge', type: '명사', meaning: '폭주, 쇄도, 홍수', example: 'Researchers face a deluge of data from various sources.' },
  { word: 'Apparently', type: '부사', meaning: '명백히, 보아하니', example: 'Apparently, the new algorithm outperforms the old one.' },
  { word: 'Sufficient', type: '형용사', meaning: '충분한', example: 'Sufficient data is required to train a robust model.' },
  { word: 'Altering', type: '동사/형용사', meaning: '변경하는', example: 'Altering the hyperparameters can significantly affect model performance.' },
  { word: 'Ability to fix', type: '구문', meaning: '~을 고치는 능력', example: 'The system has the ability to fix minor errors automatically.' },
  { word: 'Devising', type: '동사', meaning: '고안하다, 창안하다', example: 'Devising new algorithms is a key part of AI research.' },
  { word: 'Empirical', type: '형용사', meaning: '경험적인, 실증적인', example: 'Empirical results show the effectiveness of the proposed method.' },
  { word: 'Theorem', type: '명사', meaning: '정리 (수학, 논리학)', example: "The Bayes' theorem is fundamental in probability theory." },
  { word: 'Criterion', type: '명사', meaning: '기준, 표준 (복수형: criteria)', example: 'Accuracy is a common criterion for evaluating classification models.' },
  { word: 'Impose', type: '동사', meaning: '부과하다, 강요하다, 도입하다', example: 'We can impose constraints on the optimization problem.' },
  { word: 'Regularization', type: '명사', meaning: '정규화 (기계 학습)', example: 'Regularization helps prevent overfitting in machine learning models.' },
  { word: 'Implicitly', type: '부사', meaning: '암묵적으로, 함축적으로', example: 'The model implicitly learns features from the data.' },
  { word: 'Explicitly', type: '부사', meaning: '명시적으로, 명백히', example: 'Some parameters need to be explicitly defined.' },
  { word: 'Preferences', type: '명사', meaning: '선호도', example: 'The recommendation system learns user preferences over time.' },
  { word: 'Validation', type: '명사', meaning: '검증, 확인', example: 'Cross-validation is used to assess model performance.' },
  { word: 'Problematic', type: '형용사', meaning: '문제가 있는, 문제가 많은', example: 'Handling missing data can be problematic.' },
  { word: 'Associate', type: '동사', meaning: '연관시키다, 관련짓다', example: 'The goal is to associate input features with output labels.' },
  { word: 'Evaluations', type: '명사', meaning: '평가', example: 'Multiple evaluations were conducted to ensure robustness.' },
  { word: 'Converge', type: '동사', meaning: '수렴하다, 한 점에 모이다', example: 'The optimization algorithm should converge to a good solution.' },
  { word: 'Convex', type: '형용사', meaning: '볼록한 (수학)', example: 'Convex optimization problems are generally easier to solve.' },
  { word: 'Inventing', type: '동사', meaning: '발명하다, 고안하다', example: 'Inventing new algorithms for efficient image processing.' },
  { word: 'Revising', type: '동사', meaning: '수정하다, 교정하다', example: 'Revising the methodology section of the research paper.' },
  { word: 'Drafting', type: '동사', meaning: '초안을 작성하다', example: 'Drafting the experimental results section.' },
  { word: 'Vector', type: '명사', meaning: '크기와 방향을 가지는 수학적 객체. 일반적으로 숫자 목록으로 표현됩니다.', example: 'A vector can represent a point in space or a direction.' },
  { word: 'Matrix', type: '명사', meaning: '행과 열로 배열된 숫자의 직사각형 배열.', example: 'A matrix can be used to transform vectors in space.' },
  { word: 'Inner Product (Dot Product)', type: '명사', meaning: '두 벡터를 곱하여 스칼라 값을 얻는 연산. 벡터의 유사성을 측정하는 데 사용됩니다.', example: 'The dot product of two orthogonal vectors is zero.' },
  { word: 'Outer Product', type: '명사', meaning: '두 벡터를 곱하여 행렬을 얻는 연산.', example: 'The outer product of two vectors results in a matrix.' },
  { word: 'Matrix-Vector Product', type: '명사', meaning: '행렬과 벡터를 곱하여 벡터를 얻는 연산. 벡터를 행렬의 열들의 선형 결합으로 표현할 수 있습니다.', example: 'Matrix-vector multiplication is common in linear algebra.' },
  { word: 'Matrix-Matrix Product', type: '명사', meaning: '두 행렬을 곱하여 행렬을 얻는 연산.', example: 'Matrix-matrix multiplication is used in many algorithms.' },
  { word: 'Identity Matrix', type: '명사', meaning: '주대각선 요소가 모두 1이고 나머지 요소는 모두 0인 정방 행렬. 행렬 곱셈에서 항등원 역할을 합니다.', example: 'Multiplying by the identity matrix leaves a matrix unchanged.' },
  { word: 'Diagonal Matrix', type: '명사', meaning: '주대각선 요소 외의 모든 요소가 0인 정방 행렬.', example: 'A diagonal matrix has nonzero entries only on its main diagonal.' },
  { word: 'Transpose', type: '명사', meaning: '행렬의 행과 열을 바꾼 연산 (A>).', example: 'The transpose of a matrix swaps its rows and columns.' },
  { word: 'Symmetric Matrix', type: '명사', meaning: '전치와 같은 정방 행렬 (A = A>).', example: 'A symmetric matrix is equal to its transpose.' },
  { word: 'Trace', type: '명사', meaning: '정방 행렬의 주대각선 요소들의 합 (tr(A)).', example: 'The trace of a matrix is the sum of its diagonal elements.' },
  { word: 'Norm', type: '명사', meaning: '벡터 또는 행렬의 "크기"를 측정하는 함수. L1, L2, L∞, Frobenius 노름 등이 있습니다.', example: 'The L2 norm measures the Euclidean length of a vector.' },
  { word: 'Linear Independence', type: '명사', meaning: '벡터 집합 내의 어떤 벡터도 나머지 벡터들의 선형 결합으로 표현될 수 없는 속성.', example: 'Linearly independent vectors cannot be written as combinations of each other.' },
  { word: 'Rank', type: '명사', meaning: '행렬의 선형 독립인 행 또는 열의 최대 개수. 행렬의 차원 공간을 얼마나 잘 채우는지를 나타냅니다.', example: 'The rank of a matrix is the dimension of its column space.' },
  { word: 'Invertible (Non-singular) Matrix', type: '명사', meaning: '역행렬이 존재하는 정방 행렬.', example: 'An invertible matrix has a nonzero determinant.' },
  { word: 'Inverse Matrix', type: '명사', meaning: '행렬 A에 대해 곱했을 때 항등 행렬을 만드는 유일한 행렬 (A^-1).', example: 'The inverse of a matrix undoes its transformation.' },
  { word: 'Orthogonal Vectors', type: '명사', meaning: '내적이 0인 두 벡터. 서로 수직입니다.', example: 'Orthogonal vectors are perpendicular to each other.' },
  { word: 'Normalized Vector', type: '명사', meaning: 'L2 노름이 1인 벡터.', example: 'A normalized vector has unit length.' },
  { word: 'Orthogonal Matrix', type: '명사', meaning: '열 벡터들이 서로 직교하며 정규화된(직규 직교) 정방 행렬 (U>U = I = UU>). 역행렬이 전치와 같습니다.', example: 'The inverse of an orthogonal matrix is its transpose.' },
  { word: 'Determinant', type: '명사', meaning: '정방 행렬에 대해 정의되는 스칼라 값. 행렬이 나타내는 선형 변환에 의해 공간의 부피가 얼마나 스케일링되는지를 나타냅니다. 행렬이 특이 행렬일 때 행렬식은 0입니다.', example: 'A zero determinant means the matrix is singular.' },
  { word: 'Quadratic Form', type: '명사', meaning: '정방 행렬 A와 벡터 x에 대해 x>Ax 형태로 표현되는 스칼라 값.', example: 'Quadratic forms are used in optimization.' },
  { word: 'Positive Definite (PD) Matrix', type: '명사', meaning: '대칭 행렬이며, 모든 0이 아닌 벡터 x에 대해 x>Ax > 0인 행렬.', example: 'A positive definite matrix has all positive eigenvalues.' },
  { word: 'Positive Semidefinite (PSD) Matrix', type: '명사', meaning: '대칭 행렬이며, 모든 벡터 x에 대해 x>Ax ≥ 0인 행렬.', example: 'A positive semidefinite matrix has nonnegative eigenvalues.' },
  { word: 'Eigenvalue', type: '명사', meaning: '행렬 A를 곱했을 때 벡터의 방향은 유지하고 크기만 λ만큼 스케일링되는 스칼라 값 (Ax = λx).', example: 'Eigenvalues describe the scaling factor of eigenvectors.' },
  { word: 'Eigenvector', type: '명사', meaning: '고유값에 해당하는 0이 아닌 벡터 (Ax = λx).', example: 'Eigenvectors remain in the same direction after transformation.' },
  { word: 'Gradient', type: '명사', meaning: '다변수 함수의 각 변수에 대한 편미분 값들을 벡터로 모아 놓은 것 (∇f(x)). 함수의 최대 증가 방향을 가리킵니다.', example: 'The gradient points in the direction of steepest ascent.' },
  { word: 'Hessian', type: '명사', meaning: '다변수 함수의 이차 편미분 값들을 행렬로 모아 놓은 것 (∇²f(x)). 함수의 볼록성 또는 오목성을 판단하는 데 사용됩니다.', example: 'The Hessian matrix is used in second-order optimization.' },
  { word: 'Random Variable', type: '명사', meaning: '실험의 결과를 수치적으로 나타내는 함수.', example: 'A random variable assigns a number to each outcome.' },
  { word: 'Cumulative Distribution Function (CDF)', type: '명사', meaning: '확률 변수가 특정 값보다 작거나 같을 확률을 나타내는 함수 (F_X(x) = P{X ≤ x}).', example: 'The CDF gives the probability that a variable is less than or equal to a value.' },
  { word: 'Probability Density Function (PDF)', type: '명사', meaning: '연속 확률 변수의 분포를 나타내는 함수. CDF의 미분으로 얻어집니다 (p_X(x) = dF_X(x)/dx).', example: 'The PDF describes the likelihood of a continuous variable.' },
  { word: 'Independent Random Variables', type: '명사', meaning: '두 확률 변수의 결합 분포가 각 확률 변수의 주변 분포의 곱으로 표현될 수 있는 경우.', example: 'Independent random variables do not influence each other.' },
  { word: 'Expected Value (Mean)', type: '명사', meaning: '확률 변수의 "평균" 값. 이론적인 분포에 기반합니다 (E[X] = ∫x p_X(x) dx).', example: 'The expected value is the long-run average outcome.' },
  { word: 'Variance', type: '명사', meaning: '확률 변수가 평균 주변에 얼마나 퍼져 있는지를 나타내는 측도 (Var(X) = E[|X - E[X]|^2]).', example: 'Variance measures the spread of a distribution.' },
  { word: 'Correlation', type: '명사', meaning: '두 확률 변수 사이의 선형 관계 강도를 나타내는 측도 (E[XY*]).', example: 'Correlation quantifies the linear relationship between variables.' },
  { word: 'Covariance', type: '명사', meaning: '두 확률 변수가 함께 변하는 정도를 나타내는 측도 (Cov(X,Y) = E[(X - E[X])(Y - E[Y])*]).', example: 'Covariance measures how two variables change together.' },
  { word: 'Random Vector', type: '명사', meaning: '여러 개의 확률 변수를 묶어서 벡터로 표현한 것.', example: 'A random vector consists of multiple random variables.' },
  { word: 'Multivariate Gaussian (Normal) Distribution', type: '명사', meaning: '여러 확률 변수의 결합 분포가 가우시안 분포를 따르는 경우. 평균 벡터와 공분산 행렬로 정의됩니다.', example: 'The multivariate normal distribution is defined by a mean vector and covariance matrix.' },
  { word: 'Jointly Gaussian Random Vector', type: '명사', meaning: '임의의 선형 변환을 했을 때 결과가 가우시안 확률 변수가 되는 랜덤 벡터. 각 요소가 가우시안이더라도 결합 가우시안이 아닐 수 있습니다.', example: 'Jointly Gaussian vectors remain Gaussian under linear transformation.' },
  { word: 'Random Process', type: '명사', meaning: '시간에 따라 또는 공간에 따라 값이 변하는 확률 변수들의 모임. 이 연구 가이드에서는 2차원 이산 공간에서의 랜덤 프로세스를 다룹니다.', example: 'A random process describes how a system evolves over time.' },
  { word: 'Power Spectrum (Power Spectral Density)', type: '명사', meaning: '광의 정상성(Wide Sense Stationary, WSS) 랜덤 프로세스의 자기 상관 함수(autocorrelation function)의 이산 공간 푸리에 변환(DSFT). 랜덤 프로세스의 주파수 구성 요소를 나타냅니다.', example: 'The power spectrum shows the frequency content of a process.' },
  { word: 'Loss Function', type: '명사', meaning: '기계 학습 모델의 예측과 실제 값 사이의 불일치 정도를 측정하는 함수 (L(D(x), y)).', example: 'The loss function measures prediction error.' },
  { word: 'Supervised Learning', type: '명사', meaning: '모델 학습에 입력 데이터(x)와 해당 정답 데이터(y)를 사용하는 방식.', example: 'Supervised learning uses labeled data for training.' },
  { word: 'Empirical Loss Function', type: '명사', meaning: '실제 학습 데이터 샘플에 대한 손실 함수의 평균 또는 합. 분석적 손실 함수의 근사값으로 사용됩니다.', example: 'Empirical loss is computed over the training dataset.' },
  { word: 'Gradient Descent', type: '명사', meaning: '함수의 극소값을 찾기 위해 현재 위치에서 함수의 음수 기울기 방향으로 일정 거리만큼 이동하는 최적화 알고리즘.', example: 'Gradient descent is used to minimize loss functions.' },
  { word: 'Learning Rate (Step Size)', type: '명사', meaning: '그래디언트 디센트에서 각 단계에서 이동하는 거리.', example: 'The learning rate controls the step size in optimization.' },
  { word: 'Stochastic Gradient Descent (SGD)', type: '명사', meaning: '전체 학습 데이터 대신 무작위로 선택된 작은 배치(batch)의 데이터에 대한 그래디언트를 사용하여 모델 파라미터를 업데이트하는 최적화 알고리즘.', example: 'SGD updates model parameters using random mini-batches.' },
  { word: 'Batch Size', type: '명사', meaning: 'SGD에서 각 업데이트 단계에 사용되는 데이터 샘플의 개수.', example: 'Batch size determines how many samples are used per update.' },
  { word: 'Local Minimum', type: '명사', meaning: '함수의 그래디언트가 0이고 헤세 행렬이 양의 정부호 행렬인 지점.', example: 'A local minimum is a point where the function value is lower than nearby points.' },
  { word: 'Overfitting', type: '명사', meaning: '모델이 학습 데이터에는 매우 잘 맞지만 새로운 테스트 데이터에 대해서는 성능이 떨어지는 현상.', example: 'Overfitting occurs when a model learns noise instead of the signal.' },
  { word: 'Underfitting', type: '명사', meaning: '모델이 학습 데이터의 패턴을 제대로 학습하지 못해 학습 데이터와 테스트 데이터 모두에서 성능이 낮은 현상.', example: 'Underfitting means the model is too simple to capture the data patterns.' },
  { word: 'Regularization', type: '명사', meaning: '과적합을 방지하고 모델의 일반화 성능을 향상시키기 위해 학습 알고리즘에 추가하는 기법.', example: 'Regularization helps prevent overfitting.' },
  { word: 'No Free Lunch Theorem', type: '명사', meaning: '모든 종류의 문제에 대해 최적으로 작동하는 단일 기계 학습 알고리즘은 없다는 정리.', example: 'The no free lunch theorem states that no algorithm is best for all problems.' },
  { word: 'Cross-Validation', type: '명사', meaning: '데이터를 여러 개의 폴드(fold)로 나누어 일부는 학습에 사용하고 나머지는 평가에 사용하여 모델 성능을 측정하고 일반화 성능을 추정하는 기법.', example: 'Cross-validation is used to estimate model performance.' },
  { word: 'Classification', type: '명사', meaning: '입력 데이터를 미리 정의된 여러 범주(클래스) 중 하나로 분류하는 문제.', example: 'Classification assigns inputs to discrete categories.' },
  { word: 'Regression', type: '명사', meaning: '입력 데이터에 기반하여 연속적인 출력 값(실수 값)을 예측하는 문제.', example: 'Regression predicts continuous values.' },
  { word: 'Density Estimation', type: '명사', meaning: '주어진 데이터의 확률 분포를 모델링하거나 추정하는 문제.', example: 'Density estimation models the probability distribution of data.' },
  { word: 'Object Detection', type: '명사', meaning: '이미지 또는 비디오에서 객체의 위치를 찾고 해당 객체가 어떤 클래스에 속하는지 식별하는 문제 (분류와 회귀의 조합).', example: 'Object detection locates and classifies objects in images.' },
  { word: 'Self-Supervised Learning', type: '명사', meaning: '정답 라벨 없이 입력 데이터 자체에서 학습 신호를 생성하여 모델을 학습하는 방식.', example: 'Self-supervised learning uses the data itself to generate labels.' },
];

let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateQuestionTypes() {
  const types = [
    { type: 'meaning', question: '다음 단어의 의미는 무엇입니까?' },
    { type: 'word', question: '다음 의미에 해당하는 영단어는 무엇입니까?' },
    { type: 'type', question: '다음 단어의 품사는 무엇입니까?' },
    { type: 'example', question: '다음 문장에서 빈칸에 들어갈 적절한 단어는?' }
  ];
  return shuffleArray(types);
}

function generateQuestion(vocab, questionType) {
  const question = {
    type: questionType.type,
    questionText: questionType.question,
    correctAnswer: '',
    options: []
  };

  switch (questionType.type) {
    case 'meaning':
      question.word = vocab.word;
      question.correctAnswer = vocab.meaning;
      question.options = [vocab.meaning];
      // 다른 단어들의 의미에서 무작위로 3개 선택
      const otherMeanings = vocabularyData
        .filter(v => v.word !== vocab.word)
        .map(v => v.meaning);
      question.options.push(...shuffleArray(otherMeanings).slice(0, 3));
      break;

    case 'word':
      question.meaning = vocab.meaning;
      question.correctAnswer = vocab.word;
      question.options = [vocab.word];
      // 다른 단어들에서 무작위로 3개 선택
      const otherWords = vocabularyData
        .filter(v => v.word !== vocab.word)
        .map(v => v.word);
      question.options.push(...shuffleArray(otherWords).slice(0, 3));
      break;

    case 'type':
      question.word = vocab.word;
      question.correctAnswer = vocab.type;
      question.options = ['명사', '동사', '형용사', '부사'];
      break;

    case 'example':
      question.example = vocab.example.replace(vocab.word, '_____');
      question.correctAnswer = vocab.word;
      question.options = [vocab.word];
      // 다른 단어들에서 무작위로 3개 선택
      const otherExamples = vocabularyData
        .filter(v => v.word !== vocab.word)
        .map(v => v.word);
      question.options.push(...shuffleArray(otherExamples).slice(0, 3));
      break;
  }

  question.options = shuffleArray(question.options);
  return question;
}

function startQuiz() {
  document.getElementById('study-section').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';
  document.getElementById('start-quiz').style.display = 'none';
  document.getElementById('return-study').style.display = 'inline-block';

  // 퀴즈 초기화
  currentQuestionIndex = 0;
  score = 0;
  currentQuestions = [];

  // 10개의 랜덤 단어 선택
  const selectedVocab = shuffleArray([...vocabularyData]).slice(0, 10);
  const questionTypes = generateQuestionTypes();

  // 각 단어에 대해 랜덤한 유형의 문제 생성
  selectedVocab.forEach((vocab, index) => {
    const questionType = questionTypes[index % questionTypes.length];
    currentQuestions.push(generateQuestion(vocab, questionType));
  });

  showQuestion();
}

function showQuestion() {
  const question = currentQuestions[currentQuestionIndex];
  const questionContainer = document.getElementById('question-container');
  const optionsContainer = document.getElementById('options-container');
  
  // 진행 상황 업데이트
  document.getElementById('current-question').textContent = currentQuestionIndex + 1;
  document.getElementById('total-questions').textContent = currentQuestions.length;

  // 문제 표시
  let questionText = question.questionText + '<br>';
  switch (question.type) {
    case 'meaning':
      questionText += `<strong>${question.word}</strong>`;
      break;
    case 'word':
      questionText += `<strong>${question.meaning}</strong>`;
      break;
    case 'type':
      questionText += `<strong>${question.word}</strong>`;
      break;
    case 'example':
      questionText += `<strong>${question.example}</strong>`;
      break;
  }
  questionContainer.innerHTML = questionText;

  // 보기 표시
  optionsContainer.innerHTML = '';
  question.options.forEach((option, index) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    optionDiv.textContent = option;
    optionDiv.onclick = () => checkAnswer(option);
    optionsContainer.appendChild(optionDiv);
  });

  // 결과 메시지와 다음 버튼 숨기기
  document.getElementById('result-message').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
}

function checkAnswer(selectedAnswer) {
  const question = currentQuestions[currentQuestionIndex];
  const resultMessage = document.getElementById('result-message');
  const nextButton = document.getElementById('next-btn');
  const options = document.querySelectorAll('.option');

  // 모든 옵션 비활성화
  options.forEach(option => {
    option.style.pointerEvents = 'none';
    if (option.textContent === question.correctAnswer) {
      option.classList.add('correct');
    }
    if (option.textContent === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      option.classList.add('incorrect');
    }
  });

  // 정답 체크
  if (selectedAnswer === question.correctAnswer) {
    score++;
    resultMessage.style.backgroundColor = '#d4edda';
    resultMessage.style.color = '#155724';
    resultMessage.textContent = '정답입니다! 🎉';
  } else {
    resultMessage.style.backgroundColor = '#f8d7da';
    resultMessage.style.color = '#721c24';
    resultMessage.textContent = `틀렸습니다. 정답은 "${question.correctAnswer}" 입니다.`;
  }

  resultMessage.style.display = 'block';
  nextButton.style.display = 'block';
  nextButton.onclick = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      currentQuestionIndex++;
      showQuestion();
    } else {
      showFinalScore();
    }
  };
}

function showFinalScore() {
  const quizContainer = document.getElementById('quiz-container');
  const finalScore = document.getElementById('final-score');
  const percentage = (score / currentQuestions.length) * 100;

  quizContainer.innerHTML = `
    <div id="final-score">
      <h3>퀴즈 완료!</h3>
      <p>당신의 점수: ${score} / ${currentQuestions.length} (${percentage.toFixed(1)}%)</p>
      <button onclick="startQuiz()">다시 시작하기</button>
    </div>
  `;
}

function returnToStudy() {
  document.getElementById('study-section').style.display = 'block';
  document.getElementById('quiz-section').style.display = 'none';
  document.getElementById('start-quiz').style.display = 'inline-block';
  document.getElementById('return-study').style.display = 'none';
}
</script>


## Core Concepts and Terminology

### 1. Perception and Processing (지각과 처리)

- **Perceive** (동사): 인지하다, 감지하다
  - Example: Computers can perceive subtle differences in images that humans might miss.
  
- **Perceptual** (형용사): 지각의, 인지의
  - Example: Perceptual computing aims to mimic human sensory processing.
  
- **Misperception** (명사): 오인, 잘못된 인식
  - Example: Image artifacts can lead to misperception in computer vision systems.

### 2. Visual Properties (시각적 특성)

- **Translucency** (명사): 반투명성
  - Example: Processing translucency in images requires advanced rendering techniques.
  
- **Subtle** (형용사): 미묘한, 섬세한
  - Example: The algorithm can detect subtle changes in lighting conditions.
  
- **Shading** (명사): 음영
  - Example: Proper shading analysis helps in understanding 3D structures.

### 3. Image Analysis (이미지 분석)

- **Effortlessly** (부사): 수월하게, 어려움 없이
  - Example: Modern AI systems effortlessly process thousands of images per second.
  
- **Portrait** (명사): 초상, 인물 사진
  - Example: Face detection algorithms are crucial for portrait photography.
  
- **Rapid** (형용사): 빠른, 신속한
  - Example: Rapid image processing is essential for real-time applications.

### 4. Technical Processes (기술적 과정)

- **Delineate** (동사): 윤곽을 그리다, 묘사하다
  - Example: The algorithm can delineate object boundaries precisely.
  
- **Causality** (명사): 인과관계
  - Example: Understanding causality in scene analysis improves prediction accuracy.
  
- **Radiometry** (명사): 방사측정
  - Example: Radiometry is fundamental to understanding light behavior in images.

### 5. Industrial Applications (산업적 응용)

- **Inspection** (명사): 검사, 점검
  - Example: Automated visual inspection systems in manufacturing.
  
- **Retail** (명사): 소매, 유통
  - Example: Computer vision enhances retail analytics and customer behavior tracking.
  
- **Warehouse** (명사): 창고
  - Example: Automated warehouse systems use computer vision for inventory management.
  
- **Logistics** (명사): 물류
  - Example: Computer vision optimizes logistics operations through package tracking.

### 6. Advanced Applications (고급 응용)

- **Intra-operative** (형용사): 수술 중의
  - Example: Intra-operative imaging assists surgeons during procedures.
  
- **Morphology** (명사): 형태학
  - Example: Mathematical morphology is used in image processing.
  
- **Surveillance** (명사): 감시, 보안
  - Example: Video surveillance systems employ advanced computer vision techniques.

### 7. Image Processing Techniques (이미지 처리 기법)

- **Stitching** (명사): 이미지 접합
  - Example: Panorama creation through image stitching.
  
- **Overlapping** (형용사): 중첩되는
  - Example: Overlapping images are used in 3D reconstruction.
  
- **Bracketing** (명사): 브라케팅(노출 단계 조절)
  - Example: HDR images are created using exposure bracketing.
  
- **Morphing** (명사): 변형
  - Example: Face morphing creates smooth transitions between images.

### 8. Research and Development (연구 개발)

- **Meticulously** (부사): 꼼꼼하게, 정교하게
  - Example: AI models must be meticulously trained for optimal performance.
  
- **Layer-wise, sample-wise** (형용사): 층별, 샘플별
  - Example: Neural networks are analyzed layer-wise for better understanding.
  
- **Preexisting** (형용사): 기존의, 이미 존재하는
  - Example: Preexisting models can be fine-tuned for specific tasks.
  
- **Plausible** (형용사): 그럴듯한, 타당한
  - Example: The system generates plausible reconstructions of 3D scenes.

### 9. Industrial Human-Robot Collaboration (산업 현장 인간-로봇 협업)

- **Pose Forecasting** (명사구): 자세 예측
  - Example: Pose forecasting is crucial for safe human-robot interaction.
- **Ablation** (명사): (신경망 등에서) 일부 제거, 절제
  - Example: Ablation studies help understand the contribution of different model components.
- **Endow** (동사): 부여하다, 주다
  - Example: The new sensor endows the robot with better perceptive capabilities.
- **Perceptive** (형용사): 지각하는, 통찰력 있는
  - Example: Perceptive robots can adapt to dynamic environments.
- **Harm** (명사/동사): 해, 손상 / 해를 끼치다
  - Example: The primary goal is to prevent any harm to the human worker.
- **Transmission of contact wrenches** (명사구): 접촉력 전달
  - Example: Accurate transmission of contact wrenches is vital for haptic feedback.
- **On-the-fly** (부사구): 즉석에서, 실시간으로
  - Example: The robot can adjust its path on-the-fly to avoid obstacles.
- **Adjacency** (명사): 인접, 근접
  - Example: Adjacency matrices are used to represent connections in a graph.
- **Sparse** (형용사): 희소한, 드문드문 있는
  - Example: Sparse data can be challenging for some machine learning models.
- **Sparsity** (명사): 희소성
  - Example: Sparsity is a desirable property in many high-dimensional datasets.
- **Abide** (동사): (규칙 등을) 준수하다, 지키다
  - Example: Robots must abide by safety protocols.
- **Genuine** (형용사): 진짜의, 진정한
  - Example: The system aims to achieve genuine collaboration between humans and robots.
- **Foresee** (동사): 예견하다, 예측하다
  - Example: It is difficult to foresee all possible scenarios in a complex environment.
- **Exploited** (동사, 수동태 또는 과거형): 활용된, 이용된
  - Example: The robot's capabilities were fully exploited in the task.
- **Aspect** (명사): 측면, 양상
  - Example: Safety is a critical aspect of human-robot collaboration.
- **Intersection** (명사): 교차점, 교집합
  - Example: The intersection of AI and robotics has led to many innovations.
- **Prune** (동사): (가지 등을) 치다, 제거하다, 간결하게 하다
  - Example: Pruning the neural network can reduce its complexity.
- **Factorize** (동사): 인수분해하다, 요인으로 분석하다
  - Example: We can factorize the matrix to understand its underlying structure.
- **Adjacency** (명사): 인접, 근접 (중복된 단어입니다. 필요시 하나를 삭제하거나 다른 의미로 사용된 경우 설명을 추가해주세요.)
  - Example: Adjacency lists are another way to represent graph connections.
- **Spectral** (형용사): 스펙트럼의, 분광의
  - Example: Spectral analysis is used in various sensor technologies.
- **Coarse** (형용사): 거친, 대략적인
  - Example: A coarse estimation was made initially, followed by a finer adjustment.
- **Sparsifying** (동사/형용사): 희소화하는
  - Example: Sparsifying techniques are used to reduce data dimensionality.

### 10. Modern Artificial Intelligence (현대 인공지능)

- **Formalize** (동사): 공식화하다, 형식화하다
  - Example: We need to formalize the problem statement before designing a solution.
- **Density** (명사): 밀도
  - Example: Probability density functions describe the likelihood of a continuous variable.
- **PDF (Probability Density Function)** (명사): 확률 밀도 함수
  - Example: The PDF of a normal distribution is bell-shaped.
- **PMF (Probability Mass Function)** (명사): 확률 질량 함수
  - Example: The PMF is used for discrete random variables.
- **Accomplish** (동사): 성취하다, 달성하다
  - Example: The AI model was able to accomplish the task with high accuracy.
- **Observed** (형용사/동사 과거형): 관찰된
  - Example: The observed data was used to train the model.
- **Intractable** (형용사): 다루기 힘든, 처리하기 어려운
  - Example: Some problems are computationally intractable.
- **Coefficient** (명사): 계수
  - Example: The coefficients of the linear regression model were estimated.
- **Era** (명사): 시대
  - Example: We are in the era of big data and artificial intelligence.
- **Deluge** (명사): 폭주, 쇄도, 홍수
  - Example: Researchers face a deluge of data from various sources.
- **Apparently** (부사): 명백히, 보아하니
  - Example: Apparently, the new algorithm outperforms the old one.
- **Sufficient** (형용사): 충분한
  - Example: Sufficient data is required to train a robust model.
- **Altering** (동사/형용사): 변경하는
  - Example: Altering the hyperparameters can significantly affect model performance.
- **Ability to fix** (구문): ~을 고치는 능력
  - Example: The system has the ability to fix minor errors automatically.
- **Devising** (동사): 고안하다, 창안하다
  - Example: Devising new algorithms is a key part of AI research.
- **Empirical** (형용사): 경험적인, 실증적인
  - Example: Empirical results show the effectiveness of the proposed method.
- **Theorem** (명사): 정리 (수학, 논리학)
  - Example: The Bayes' theorem is fundamental in probability theory.
- **Criterion** (명사): 기준, 표준 (복수형: criteria)
  - Example: Accuracy is a common criterion for evaluating classification models.
- **Impose** (동사): 부과하다, 강요하다, 도입하다
  - Example: We can impose constraints on the optimization problem.
- **Regularization** (명사): 정규화 (기계 학습)
  - Example: Regularization helps prevent overfitting in machine learning models.
- **Implicitly** (부사): 암묵적으로, 함축적으로
  - Example: The model implicitly learns features from the data.
- **Explicitly** (부사): 명시적으로, 명백히
  - Example: Some parameters need to be explicitly defined.
- **Preferences** (명사): 선호도
  - Example: The recommendation system learns user preferences over time.
- **Validation** (명사): 검증, 확인
  - Example: Cross-validation is used to assess model performance.
- **Problematic** (형용사): 문제가 있는, 문제가 많은
  - Example: Handling missing data can be problematic.
- **Associate** (동사): 연관시키다, 관련짓다
  - Example: The goal is to associate input features with output labels.
- **Evaluations** (명사): 평가
  - Example: Multiple evaluations were conducted to ensure robustness.
- **Converge** (동사): 수렴하다, 한 점에 모이다
  - Example: The optimization algorithm should converge to a good solution.
- **Convex** (형용사): 볼록한 (수학)
  - Example: Convex optimization problems are generally easier to solve.

## Writing Technical Papers (논문 작성)

- **Inventing** (동사): 발명하다, 고안하다
  - Example: Inventing new algorithms for efficient image processing.
  
- **Revising** (동사): 수정하다, 교정하다
  - Example: Revising the methodology section of the research paper.
  
- **Drafting** (동사): 초안을 작성하다
  - Example: Drafting the experimental results section.

### 11. 수학/선형대수/확률/머신러닝 용어 정리

- **Vector**: 크기와 방향을 가지는 수학적 객체. 일반적으로 숫자 목록으로 표현됩니다.
- **Matrix**: 행과 열로 배열된 숫자의 직사각형 배열.
- **Inner Product (Dot Product)**: 두 벡터를 곱하여 스칼라 값을 얻는 연산. 벡터의 유사성을 측정하는 데 사용됩니다.
- **Outer Product**: 두 벡터를 곱하여 행렬을 얻는 연산.
- **Matrix-Vector Product**: 행렬과 벡터를 곱하여 벡터를 얻는 연산. 벡터를 행렬의 열들의 선형 결합으로 표현할 수 있습니다.
- **Matrix-Matrix Product**: 두 행렬을 곱하여 행렬을 얻는 연산.
- **Identity Matrix**: 주대각선 요소가 모두 1이고 나머지 요소는 모두 0인 정방 행렬. 행렬 곱셈에서 항등원 역할을 합니다.
- **Diagonal Matrix**: 주대각선 요소 외의 모든 요소가 0인 정방 행렬.
- **Transpose**: 행렬의 행과 열을 바꾼 연산 (A>).
- **Symmetric Matrix**: 전치와 같은 정방 행렬 (A = A>).
- **Trace**: 정방 행렬의 주대각선 요소들의 합 (tr(A)).
- **Norm**: 벡터 또는 행렬의 "크기"를 측정하는 함수. L1, L2, L∞, Frobenius 노름 등이 있습니다.
- **Linear Independence**: 벡터 집합 내의 어떤 벡터도 나머지 벡터들의 선형 결합으로 표현될 수 없는 속성.
- **Rank**: 행렬의 선형 독립인 행 또는 열의 최대 개수. 행렬의 차원 공간을 얼마나 잘 채우는지를 나타냅니다.
- **Invertible (Non-singular) Matrix**: 역행렬이 존재하는 정방 행렬.
- **Inverse Matrix**: 행렬 A에 대해 곱했을 때 항등 행렬을 만드는 유일한 행렬 (A^-1).
- **Orthogonal Vectors**: 내적이 0인 두 벡터. 서로 수직입니다.
- **Normalized Vector**: L2 노름이 1인 벡터.
- **Orthogonal Matrix**: 열 벡터들이 서로 직교하며 정규화된(직규 직교) 정방 행렬 (U>U = I = UU>). 역행렬이 전치와 같습니다.
- **Determinant**: 정방 행렬에 대해 정의되는 스칼라 값. 행렬이 나타내는 선형 변환에 의해 공간의 부피가 얼마나 스케일링되는지를 나타냅니다. 행렬이 특이 행렬일 때 행렬식은 0입니다.
- **Quadratic Form**: 정방 행렬 A와 벡터 x에 대해 x>Ax 형태로 표현되는 스칼라 값.
- **Positive Definite (PD) Matrix**: 대칭 행렬이며, 모든 0이 아닌 벡터 x에 대해 x>Ax > 0인 행렬.
- **Positive Semidefinite (PSD) Matrix**: 대칭 행렬이며, 모든 벡터 x에 대해 x>Ax ≥ 0인 행렬.
- **Eigenvalue**: 행렬 A를 곱했을 때 벡터의 방향은 유지하고 크기만 λ만큼 스케일링되는 스칼라 값 (Ax = λx).
- **Eigenvector**: 고유값에 해당하는 0이 아닌 벡터 (Ax = λx).
- **Gradient**: 다변수 함수의 각 변수에 대한 편미분 값들을 벡터로 모아 놓은 것 (∇f(x)). 함수의 최대 증가 방향을 가리킵니다.
- **Hessian**: 다변수 함수의 이차 편미분 값들을 행렬로 모아 놓은 것 (∇²f(x)). 함수의 볼록성 또는 오목성을 판단하는 데 사용됩니다.
- **Random Variable**: 실험의 결과를 수치적으로 나타내는 함수.
- **Cumulative Distribution Function (CDF)**: 확률 변수가 특정 값보다 작거나 같을 확률을 나타내는 함수 (F_X(x) = P{X ≤ x}).
- **Probability Density Function (PDF)**: 연속 확률 변수의 분포를 나타내는 함수. CDF의 미분으로 얻어집니다 (p_X(x) = dF_X(x)/dx).
- **Independent Random Variables**: 두 확률 변수의 결합 분포가 각 확률 변수의 주변 분포의 곱으로 표현될 수 있는 경우.
- **Expected Value (Mean)**: 확률 변수의 "평균" 값. 이론적인 분포에 기반합니다 (E[X] = ∫x p_X(x) dx).
- **Variance**: 확률 변수가 평균 주변에 얼마나 퍼져 있는지를 나타내는 측도 (Var(X) = E[|X - E[X]|^2]).
- **Correlation**: 두 확률 변수 사이의 선형 관계 강도를 나타내는 측도 (E[XY*]).
- **Covariance**: 두 확률 변수가 함께 변하는 정도를 나타내는 측도 (Cov(X,Y) = E[(X - E[X])(Y - E[Y])*]).
- **Random Vector**: 여러 개의 확률 변수를 묶어서 벡터로 표현한 것.
- **Multivariate Gaussian (Normal) Distribution**: 여러 확률 변수의 결합 분포가 가우시안 분포를 따르는 경우. 평균 벡터와 공분산 행렬로 정의됩니다.
- **Jointly Gaussian Random Vector**: 임의의 선형 변환을 했을 때 결과가 가우시안 확률 변수가 되는 랜덤 벡터. 각 요소가 가우시안이더라도 결합 가우시안이 아닐 수 있습니다.
- **Random Process**: 시간에 따라 또는 공간에 따라 값이 변하는 확률 변수들의 모임. 이 연구 가이드에서는 2차원 이산 공간에서의 랜덤 프로세스를 다룹니다.
- **Power Spectrum (Power Spectral Density)**: 광의 정상성(Wide Sense Stationary, WSS) 랜덤 프로세스의 자기 상관 함수(autocorrelation function)의 이산 공간 푸리에 변환(DSFT). 랜덤 프로세스의 주파수 구성 요소를 나타냅니다.
- **Loss Function**: 기계 학습 모델의 예측과 실제 값 사이의 불일치 정도를 측정하는 함수 (L(D(x), y)).
- **Supervised Learning**: 모델 학습에 입력 데이터(x)와 해당 정답 데이터(y)를 사용하는 방식.
- **Empirical Loss Function**: 실제 학습 데이터 샘플에 대한 손실 함수의 평균 또는 합. 분석적 손실 함수의 근사값으로 사용됩니다.
- **Gradient Descent**: 함수의 극소값을 찾기 위해 현재 위치에서 함수의 음수 기울기 방향으로 일정 거리만큼 이동하는 최적화 알고리즘.
- **Learning Rate (Step Size)**: 그래디언트 디센트에서 각 단계에서 이동하는 거리.
- **Stochastic Gradient Descent (SGD)**: 전체 학습 데이터 대신 무작위로 선택된 작은 배치(batch)의 데이터에 대한 그래디언트를 사용하여 모델 파라미터를 업데이트하는 최적화 알고리즘.
- **Batch Size**: SGD에서 각 업데이트 단계에 사용되는 데이터 샘플의 개수.
- **Local Minimum**: 함수의 그래디언트가 0이고 헤세 행렬이 양의 정부호 행렬인 지점.
- **Overfitting**: 모델이 학습 데이터에는 매우 잘 맞지만 새로운 테스트 데이터에 대해서는 성능이 떨어지는 현상.
- **Underfitting**: 모델이 학습 데이터의 패턴을 제대로 학습하지 못해 학습 데이터와 테스트 데이터 모두에서 성능이 낮은 현상.
- **Regularization**: 과적합을 방지하고 모델의 일반화 성능을 향상시키기 위해 학습 알고리즘에 추가하는 기법.
- **No Free Lunch Theorem**: 모든 종류의 문제에 대해 최적으로 작동하는 단일 기계 학습 알고리즘은 없다는 정리.
- **Cross-Validation**: 데이터를 여러 개의 폴드(fold)로 나누어 일부는 학습에 사용하고 나머지는 평가에 사용하여 모델 성능을 측정하고 일반화 성능을 추정하는 기법.
- **Classification**: 입력 데이터를 미리 정의된 여러 범주(클래스) 중 하나로 분류하는 문제.
- **Regression**: 입력 데이터에 기반하여 연속적인 출력 값(실수 값)을 예측하는 문제.
- **Density Estimation**: 주어진 데이터의 확률 분포를 모델링하거나 추정하는 문제.
- **Object Detection**: 이미지 또는 비디오에서 객체의 위치를 찾고 해당 객체가 어떤 클래스에 속하는지 식별하는 문제 (분류와 회귀의 조합).
- **Self-Supervised Learning**: 정답 라벨 없이 입력 데이터 자체에서 학습 신호를 생성하여 모델을 학습하는 방식.
---
title: "Essential Vocabulary"
categories:
  - Dev
  - English Study
  - Computer Science
tags:
  - computer vision
  - vocabulary
  - technical terms
  - AI
  - machine learning
last_modified_at: 2024-03-17
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
  // ... 나머지 단어들도 같은 형식으로 추가
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

## 마무리

이러한 전문 용어들은 컴퓨터 비전 분야의 논문을 읽거나 작성할 때, 또는 관련 기술 문서를 이해하는 데 매우 중요합니다. 각 용어의 정확한 의미와 용례를 이해하고 있으면 전문적인 의사소통에 큰 도움이 될 것입니다.
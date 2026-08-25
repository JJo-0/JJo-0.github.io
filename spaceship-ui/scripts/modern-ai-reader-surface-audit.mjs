import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist', 'posts');
const issues = [];

const routes = [
  {
    part: 1,
    file: '2025-05-16-mordern-artificial-intelligence/index.html',
    description: 'AI·ML·DL의 관계에서 선형대수, 확률, 최적화, 퍼셉트론과 컨볼루션까지 현대 인공지능의 수학적 기초를 한 흐름으로 정리한다.',
    substantive: 'Part 1.0 분야와 연구 생태계',
  },
  {
    part: 2,
    file: '2026-08-18-modern-artificial-intelligence-2/index.html',
    description: '분류·회귀·밀도추정에서 일반화, 정규화, 교차검증, SVM, 최소거리·베이즈 분류기와 차원의 저주까지 머신러닝의 기본 과제를 정리한다.',
    substantive: '2. 머신러닝의 기초',
  },
  {
    part: 3,
    file: '2026-08-20-modern-artificial-intelligence-3/index.html',
    description: '퍼셉트론 학습과 XOR에서 MLP, Dropout·DropConnect, CNN, 1D·2D 컨볼루션과 PyTorch 모듈까지 신경망의 핵심 구조를 연결한다.',
    substantive: '3. 인공지능과 딥러닝을 위한 배경',
  },
  {
    part: 4,
    file: '2026-08-21-modern-artificial-intelligence-4/index.html',
    description: 'Lipschitz 연속성에서 GD·PSD·PGD·FGM·OGM, 복소수 하강방향, 선탐색과 로지스틱 회귀까지 기울기 기반 최적화를 단계적으로 정리한다.',
    substantive: '4. 범용 기울기 기반 최적화 방법',
  },
  {
    part: 5,
    file: '2026-08-23-modern-artificial-intelligence-5/index.html',
    description: '2D convolution과 ImageNet에서 AlexNet·VGG·GoogLeNet·ResNet·WRN·DenseNet·SE Network를 거쳐 현대 이미지 분류의 발전 흐름을 정리한다.',
    substantive: 'PDF p.1 — 5.0 2D convolution 복습',
  },
];

const forbiddenReaderText = [
  '편집·저작권 원칙',
  '이번 통합에서 폐기한 내용은 없다',
  '수식 완전성 원칙',
  '원자료 표기 감사',
  '완전성 계약',
  '세 층을 섞지 않는다',
  '원장 현황',
  'PDF SHA-256',
  'PDF 원자료 재구성',
  'PDF page coverage에 포함하지 않는다',
  '강의자료 출처',
  '읽는 법',
  '편집·수학 검증(Editorial audit)',
  '이 절은 PDF 원문을 덮어쓰지 않는다',
  'Adversarial review · source-preserving corrections',
  '추가 적대적 검토 교정',
  '아래 식은 PDF 원문을 덮어쓰지 않는다',
  'source-suspect 상태로 그대로 남기고',
  '별도 ID와 corrects 링크를 가진다',
];

for (const route of routes) {
  const file = path.join(dist, route.file);
  if (!fs.existsSync(file)) {
    issues.push(`Part ${route.part}: rendered HTML missing (${route.file})`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const readerHtml = html.replace(/<!--[\s\S]*?-->/g, '');

  if (!readerHtml.includes(route.description)) {
    issues.push(`Part ${route.part}: reader-facing description override missing`);
  }
  if (!readerHtml.includes(route.substantive)) {
    issues.push(`Part ${route.part}: substantive opening section missing`);
  }

  for (const forbidden of forbiddenReaderText) {
    if (readerHtml.includes(forbidden)) {
      issues.push(`Part ${route.part}: leaked reader boilerplate: ${forbidden}`);
    }
  }

  if (route.part === 4) {
    for (const required of ['추가 수학적 교정', 'data-part4-review-corrections']) {
      if (!readerHtml.includes(required)) {
        issues.push(`Part 4: reader-facing mathematical corrections missing: ${required}`);
      }
    }
  }
}

const unique = [...new Set(issues)].sort();
if (unique.length) {
  console.error(`modern-ai-reader-surface-audit: found ${unique.length} issue(s):`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  'modern-ai-reader-surface-audit: PASS (Parts I–V hide provenance/ledger boilerplate while preserving substantive content)',
);

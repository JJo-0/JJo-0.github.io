import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];

const pages = [
  {
    part: 1,
    file: 'posts/2025-05-16-mordern-artificial-intelligence/index.html',
    source: 'site/content/posts/mordern-artificial-intelligence.mdx',
    requiredBody: 'Part 1.0 분야와 연구 생태계',
    requiredDescription: 'AI·ML·DL의 관계, 선형대수, 확률변수, 가우시안 모델, WSS, 손실함수와 경사하강법을 연결한다.',
    sourceMarker: '수식 완전성 원칙',
  },
  {
    part: 2,
    file: 'posts/2026-08-18-modern-artificial-intelligence-2/index.html',
    source: 'site/content/posts/modern-artificial-intelligence-2.mdx',
    requiredBody: '2. 머신러닝의 기초',
    requiredDescription: '분류·회귀·밀도추정에서 과적합, 정규화, 검증, SVM, Bayes 분류와 차원의 저주까지 다룬다.',
    sourceMarker: '완전성 계약(Completeness contract)',
  },
  {
    part: 3,
    file: 'posts/2026-08-20-modern-artificial-intelligence-3/index.html',
    source: 'site/content/posts/modern-artificial-intelligence-3.mdx',
    requiredBody: '3. 인공지능과 딥러닝을 위한 배경',
    requiredDescription: '선형 판별기에서 다층 퍼셉트론으로 확장하고, 1D·2D 컨볼루션과 CNN의 계산 구조를 정리한다.',
    sourceMarker: '완전성 계약(Completeness contract)',
  },
  {
    part: 4,
    file: 'posts/2026-08-21-modern-artificial-intelligence-4/index.html',
    source: 'site/content/posts/modern-artificial-intelligence-4.mdx',
    requiredBody: '4. 범용 기울기 기반 최적화 방법',
    requiredDescription: 'Lipschitz 연속성, GD·PSD·PGD·FGM과 최적화된 기울기 방법 OGM의 수렴 구조를 비교한다.',
    sourceMarker: '완전성 계약(Completeness contract)',
  },
];

const forbiddenReaderText = [
  '완전성 계약(Completeness contract)',
  '세 층을 섞지 않는다',
  '원장 현황',
  'PDF SHA-256',
  'PDF 원자료 재구성',
  '강의자료 출처',
  '읽는 법',
  '편집·저작권 원칙',
  '이번 통합에서 폐기한 내용은 없다',
  '수식 완전성 원칙',
  '원자료 표기 감사',
  '편집·수학 검증(Editorial audit)',
  'Adversarial review · source-preserving corrections',
  '추가 적대적 검토 교정',
];

for (const page of pages) {
  const renderedPath = path.join(dist, page.file);
  const sourcePath = path.join(root, page.source);

  if (!fs.existsSync(renderedPath)) {
    issues.push(`Part ${page.part}: rendered HTML missing (${page.file})`);
    continue;
  }
  if (!fs.existsSync(sourcePath)) {
    issues.push(`Part ${page.part}: source MDX missing (${page.source})`);
    continue;
  }

  const html = fs.readFileSync(renderedPath, 'utf8');
  const source = fs.readFileSync(sourcePath, 'utf8');

  for (const text of forbiddenReaderText) {
    if (html.includes(text)) issues.push(`Part ${page.part}: reader boilerplate leaked: ${text}`);
  }

  if (!html.includes(page.requiredBody)) {
    issues.push(`Part ${page.part}: substantive reader heading missing: ${page.requiredBody}`);
  }
  if (!html.includes(page.requiredDescription)) {
    issues.push(`Part ${page.part}: reader-facing series description missing`);
  }
  if (!source.includes(page.sourceMarker)) {
    issues.push(`Part ${page.part}: source audit marker was deleted: ${page.sourceMarker}`);
  }
}

const part4Path = path.join(dist, pages[3].file);
if (fs.existsSync(part4Path)) {
  const html = fs.readFileSync(part4Path, 'utf8');
  if (!html.includes('수식 교정과 해설')) issues.push('Part 4: clean mathematical correction heading missing');
  if (!html.includes('추가 수학적 교정')) issues.push('Part 4: review correction formulas lost from reader output');
  if (!html.includes('data-part4-review-corrections')) issues.push('Part 4: review correction contract marker missing');
}

if (issues.length) {
  console.error(`modern-ai-reader-cleanliness-audit: found ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  'modern-ai-reader-cleanliness-audit: PASS (Parts I–IV reader boilerplate removed; source audit ledgers preserved)',
);

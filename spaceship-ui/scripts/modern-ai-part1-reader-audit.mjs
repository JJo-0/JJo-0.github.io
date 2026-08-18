import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const renderedPath = path.join(
  root,
  'dist',
  'posts',
  '2025-05-16-mordern-artificial-intelligence',
  'index.html',
);
const issues = [];
const expectedFormulaCount = 238;

function count(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

if (!fs.existsSync(renderedPath)) {
  issues.push('Modern AI Part I output is missing; run `pnpm build` first');
} else {
  const html = fs.readFileSync(renderedPath, 'utf8');

  for (const forbidden of [
    '편집·저작권 원칙',
    '이번 통합에서 폐기한 내용은 없다',
    '수식 완전성 원칙',
    'id="시리즈-구성"',
    '원자료 표기 감사',
    '두 판본을 대조하면서 다음 항목은 원자료 표기와 수학적으로 통상적인 표기를 구분했다',
    'katex-error',
  ]) {
    if (html.includes(forbidden)) {
      issues.push(`reader-facing audit/error residue remains: ${forbidden}`);
    }
  }

  for (const required of [
    'Part 1.0 분야와 연구 생태계',
    'AI, ML, DL은 같은 말이 아니다',
    '현대 인공지능 · 8편 학습 지도',
    '수식 읽기 모드',
    '쉽게 설명 + 계산 과정',
    'Calculation walkthrough',
    '계산 과정',
    '숫자로 직접 계산',
    '검산 포인트',
    '같은 계산을 더 깊게 확인할 레퍼런스',
    '수식 복사',
  ]) {
    if (!html.includes(required)) {
      issues.push(`reader-facing Part I content is missing: ${required}`);
    }
  }

  const contracts = [
    ['formula cards', /data-formula-part="1"/g, expectedFormulaCount],
    ['formula IDs', /data-formula-id="MAI(?:2|3|4|5|6|7|8)-[^"\s]+"/g, expectedFormulaCount],
    ['calculation-first guides', /data-formula-guide="calculation-first"/g, expectedFormulaCount],
    ['calculation walkthroughs', /data-calculation-walkthrough/g, expectedFormulaCount],
    ['worked examples', /data-worked-example/g, expectedFormulaCount],
    ['sanity-check sections', /data-formula-checks/g, expectedFormulaCount],
  ];

  for (const [label, pattern, expected] of contracts) {
    const actual = count(html, pattern);
    if (actual !== expected) {
      issues.push(`Part I ${label}: expected ${expected}, found ${actual}`);
    }
  }

  const renderedFormulaIds = [
    ...html.matchAll(/data-formula-id="(MAI(?:2|3|4|5|6|7|8)-[^"\s]+)"/g),
  ].map((match) => match[1]);
  if (new Set(renderedFormulaIds).size !== expectedFormulaCount) {
    issues.push(`Part I rendered formula IDs are not ${expectedFormulaCount} unique values`);
  }

  const firstFormulaIndex = html.indexOf('data-formula-id="MAI2-001"');
  const firstWalkthroughIndex = html.indexOf('data-calculation-walkthrough', firstFormulaIndex);
  const firstExampleIndex = html.indexOf('data-worked-example', firstFormulaIndex);
  if (firstFormulaIndex < 0 || firstWalkthroughIndex < firstFormulaIndex || firstExampleIndex < firstWalkthroughIndex) {
    issues.push('The first Part I formula does not expose calculation steps followed by a worked example');
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`modern-ai-part1-reader-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  'modern-ai-part1-reader-audit: PASS (238 formulas; calculation walkthrough + numeric example + sanity checks + references)',
);

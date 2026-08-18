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
  ]) {
    if (html.includes(forbidden)) {
      issues.push(`reader-facing audit preamble remains: ${forbidden}`);
    }
  }

  for (const required of [
    'Part 1.0 분야와 연구 생태계',
    'AI, ML, DL은 같은 말이 아니다',
    '현대 인공지능 · 8편 학습 지도',
  ]) {
    if (!html.includes(required)) {
      issues.push(`reader-facing Part I content is missing: ${required}`);
    }
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`modern-ai-part1-reader-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('modern-ai-part1-reader-audit: PASS (audit preamble hidden; first substantive section preserved)');

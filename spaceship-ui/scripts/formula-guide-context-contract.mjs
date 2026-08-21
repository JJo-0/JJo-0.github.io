import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const guidePath = path.join(root, 'src', 'lib', 'modern-ai-formula-guide.mjs');
const componentPath = path.join(root, 'src', 'components', 'post', 'FormulaGuide.astro');
const issues = [];
const forbidden = [
  '등호 왼쪽의 목표를 확인한다',
  '입력 기호의 값과 차원을 적는다',
  '가장 안쪽 괄호와 인덱스부터 계산한다',
  '곱 → 합 → 정규화 순서로 바깥 연산을 진행한다',
  '직접 계산하는 공통 절차',
];

function read(file, label) {
  if (!fs.existsSync(file)) {
    issues.push(`${label}: missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

const guide = read(guidePath, 'formula guide library');
const component = read(componentPath, 'FormulaGuide component');
for (const phrase of forbidden) {
  if (guide.includes(phrase)) issues.push(`generic formula-guide boilerplate returned: ${phrase}`);
  if (component.includes(phrase)) issues.push(`generic FormulaGuide component boilerplate returned: ${phrase}`);
}
for (const required of [
  "title: '수식의 역할과 기호만 확인하기'",
  'steps: []',
  'example: null',
  'checks: []',
]) {
  if (!guide.includes(required)) issues.push(`generic guide suppression contract missing: ${required}`);
}
for (const required of [
  'const hasWalkthrough = guide.steps.length > 0;',
  '{hasWalkthrough && (',
  "{hasWalkthrough ? '쉽게 설명 + 계산 과정' : '쉽게 설명'}",
]) {
  if (!component.includes(required)) issues.push(`conditional walkthrough renderer missing: ${required}`);
}

const distPosts = path.join(root, 'dist', 'posts');
if (fs.existsSync(distPosts)) {
  for (const entry of fs.readdirSync(distPosts, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.includes('artificial-intelligence')) continue;
    const htmlPath = path.join(distPosts, entry.name, 'index.html');
    if (!fs.existsSync(htmlPath)) continue;
    const html = fs.readFileSync(htmlPath, 'utf8');
    for (const phrase of forbidden) {
      if (html.includes(phrase)) issues.push(`${entry.name}: rendered generic walkthrough boilerplate: ${phrase}`);
    }
  }
}

const unique = [...new Set(issues)].sort();
if (unique.length) {
  console.error(`formula-guide-context-contract: found ${unique.length} issue(s):`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log('formula-guide-context-contract: PASS (generic calculation walkthroughs suppressed; only formula-specific walkthroughs may render)');

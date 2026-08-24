import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data', 'modern-ai-part2');
const articlePath = path.join(root, 'site', 'content', 'posts', 'modern-artificial-intelligence-2.mdx');
const distPath = path.join(root, 'dist', 'posts', '2026-08-18-modern-artificial-intelligence-2', 'index.html');
const issues = [];

function readJson(name) {
  const file = path.join(dataDir, name);
  if (!fs.existsSync(file)) {
    issues.push(`${name}: missing`);
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function count(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

const formulaLedger = readJson('formula-ledger.json');
const contentLedger = readJson('content-ledger.json');
const pageLedger = readJson('page-ledger.json');
const article = fs.existsSync(articlePath) ? fs.readFileSync(articlePath, 'utf8') : '';
if (!article) issues.push('Part II article is missing');

for (const ledger of [formulaLedger, contentLedger, pageLedger].filter(Boolean)) {
  if (ledger.source?.title !== '1_Ch2 Fundamentals of ML.pdf') issues.push('ledger source title mismatch');
  if (ledger.source?.pages !== 13) issues.push('ledger source page count must be 13');
  if (ledger.source?.sha256 !== 'c6ac9d80c5ae2bc96f0aa8aec70c126f559e6dd5c36d51a46eb1bdb6775e836c') issues.push('ledger source SHA-256 mismatch');
}

let displayFormulaCount = 0;
if (formulaLedger) {
  if (formulaLedger.formulaCount !== formulaLedger.formulas.length) issues.push('formulaCount does not match formula array length');
  if (formulaLedger.formulas.length !== 103) issues.push(`expected 103 source-tracked formulas, found ${formulaLedger.formulas.length}`);
  const expected = formulaLedger.formulas.map((_, index) => `MAI-P2-${String(index + 1).padStart(3, '0')}`);
  const actual = formulaLedger.formulas.map((formula) => formula.formulaId);
  if (JSON.stringify(expected) !== JSON.stringify(actual)) issues.push('formula IDs are not contiguous MAI-P2-001..103');

  const statuses = new Set(['source-exact', 'source-suspect', 'editorially-completed', 'corrected-variant']);
  displayFormulaCount = formulaLedger.formulas.filter((formula) => formula.display === 'display').length;

  for (const formula of formulaLedger.formulas) {
    const digest = crypto.createHash('sha256').update(formula.sourceLatex, 'utf8').digest('hex');
    if (digest !== formula.sha256) issues.push(`${formula.formulaId}: formula hash mismatch`);
    if (!statuses.has(formula.status)) issues.push(`${formula.formulaId}: invalid status ${formula.status}`);
    if (formula.pdfPage < 1 || formula.pdfPage > 13) issues.push(`${formula.formulaId}: invalid PDF page`);
    const occurrenceCount = (article.match(new RegExp(`part2Formula\\(['"]${formula.formulaId}['"]\\)`, 'g')) ?? []).length;
    if (occurrenceCount !== 1) issues.push(`${formula.formulaId}: expected exactly one article occurrence, found ${occurrenceCount}`);
  }

  const numbered = new Set(formulaLedger.formulas.map((formula) => formula.sourceEquationNumber).filter(Boolean));
  for (let number = 1; number <= 12; number += 1) {
    if (!numbered.has(`(${number})`)) issues.push(`source equation (${number}) is absent from the formula ledger`);
  }
  if (!formulaLedger.formulas.some((formula) => formula.status === 'editorially-completed')) {
    issues.push('formula ledger must preserve at least one editorial completion for a source blank');
  }
}

if (contentLedger) {
  if (contentLedger.contentCount !== contentLedger.content.length) issues.push('contentCount mismatch');
  if (contentLedger.figureCount !== contentLedger.figures.length) issues.push('figureCount mismatch');
  if (contentLedger.annotationCount !== contentLedger.annotations.length) issues.push('annotationCount mismatch');
  for (const entry of contentLedger.content) {
    const occurrenceCount = (article.match(new RegExp(`source-content:${entry.contentId}`, 'g')) ?? []).length;
    if (occurrenceCount !== 1) issues.push(`${entry.contentId}: expected one article marker, found ${occurrenceCount}`);
  }
  for (const entry of contentLedger.figures) {
    const occurrenceCount = (article.match(new RegExp(`source-figure:${entry.figureId}`, 'g')) ?? []).length;
    if (occurrenceCount !== 1) issues.push(`${entry.figureId}: expected one article marker, found ${occurrenceCount}`);
  }
  for (const entry of contentLedger.annotations) {
    const occurrenceCount = (article.match(new RegExp(`source-annotation:${entry.annotationId}`, 'g')) ?? []).length;
    if (occurrenceCount !== 1) issues.push(`${entry.annotationId}: expected one article marker, found ${occurrenceCount}`);
  }
}

if (pageLedger && formulaLedger && contentLedger) {
  const pages = pageLedger.pages.map((entry) => entry.pdfPage);
  if (JSON.stringify(pages) !== JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13])) {
    issues.push(`page ledger must enumerate pages 1–13 exactly, found ${pages.join(',')}`);
  }
  const formulaIds = new Set(formulaLedger.formulas.map((item) => item.formulaId));
  const contentIds = new Set(contentLedger.content.map((item) => item.contentId));
  const figureIds = new Set(contentLedger.figures.map((item) => item.figureId));
  const annotationIds = new Set(contentLedger.annotations.map((item) => item.annotationId));

  for (const page of pageLedger.pages) {
    if (page.status !== 'complete') issues.push(`page ${page.pdfPage}: status must be complete`);
    if (!page.contentIds.length) issues.push(`page ${page.pdfPage}: no content mapped`);
    for (const id of page.formulaIds) if (!formulaIds.has(id)) issues.push(`page ${page.pdfPage}: unknown formula ${id}`);
    for (const id of page.contentIds) if (!contentIds.has(id)) issues.push(`page ${page.pdfPage}: unknown content ${id}`);
    for (const id of page.figureIds) if (!figureIds.has(id)) issues.push(`page ${page.pdfPage}: unknown figure ${id}`);
    for (const id of page.annotationIds) if (!annotationIds.has(id)) issues.push(`page ${page.pdfPage}: unknown annotation ${id}`);
  }

  for (const formula of formulaLedger.formulas) {
    const page = pageLedger.pages.find((entry) => entry.pdfPage === formula.pdfPage);
    if (!page?.formulaIds.includes(formula.formulaId)) issues.push(`${formula.formulaId}: absent from its page ledger`);
  }
}

// Source-level provenance remains mandatory even though it is not reader-facing.
for (const required of [
  "title: '현대 인공지능 II — 머신러닝의 기본 과제와 일반화'",
  "id: 'modern-artificial-intelligence'",
  'order: 2',
  '# PDF 원자료 재구성',
  '# 편집·수학 검증(Editorial audit)',
  '# 2026-08-18 최신 연구 업데이트',
]) {
  if (!article.includes(required)) issues.push(`article missing required source contract: ${required}`);
}
if (article.includes('??') && !article.includes('원자료의 빈칸')) {
  issues.push('unexplained source placeholder detected');
}

if (!fs.existsSync(distPath)) {
  issues.push('rendered Part II output missing; run pnpm build before audit');
} else {
  const html = fs.readFileSync(distPath, 'utf8');
  const renderedFormulaIds = [...html.matchAll(/data-formula-id="(MAI-P2-\d{3})"/g)].map((match) => match[1]);
  if (renderedFormulaIds.length !== 103) issues.push(`rendered formula count: expected 103, found ${renderedFormulaIds.length}`);
  if (new Set(renderedFormulaIds).size !== 103) issues.push('rendered formula IDs contain duplicates');

  const explanationCount = count(html, /class="formula-explanation formula-guide/g);
  if (explanationCount !== displayFormulaCount) {
    issues.push(`calculation-first display explanations: expected ${displayFormulaCount}, found ${explanationCount}`);
  }

  const guideContracts = [
    ['display formula cards', /data-formula-part="2"/g],
    ['calculation-first guides', /data-formula-guide="calculation-first"/g],
  ];
  for (const [label, pattern] of guideContracts) {
    const actual = count(html, pattern);
    if (actual !== displayFormulaCount) {
      issues.push(`Part II ${label}: expected ${displayFormulaCount}, found ${actual}`);
    }
  }

  for (const required of [
    '2026-08-18 최신 연구 업데이트',
    'Figure 1 재구성',
    'Figure 5 재구성',
    '쉽게 설명 + 계산 과정',
    'Calculation walkthrough',
    '숫자로 직접 계산',
    '검산 포인트',
    '같은 계산을 더 깊게 확인할 레퍼런스',
    '수식 복사',
  ]) {
    if (!html.includes(required)) issues.push(`rendered Part II missing: ${required}`);
  }

  for (const forbidden of [
    '완전성 계약',
    '세 층을 섞지 않는다',
    '원장 현황',
    'PDF SHA-256',
    '강의자료 출처',
    '읽는 법',
    'PDF 원자료 재구성',
    '편집·수학 검증(Editorial audit)',
    'source-content:P2-C',
    'source-figure:P2-FIG',
    'source-annotation:P2-ANN',
    'katex-error',
    '등호 왼쪽의 목표를 확인한다',
    '입력 기호의 값과 차원을 적는다',
    '가장 안쪽 괄호와 인덱스부터 계산한다',
    '곱 → 합 → 정규화 순서로 바깥 연산을 진행한다',
    '직접 계산하는 공통 절차',
  ]) {
    if (html.includes(forbidden)) issues.push(`rendered Part II leaked internal/audit residue: ${forbidden}`);
  }

  const normalEquationFormulaIndex = html.indexOf('data-formula-id="MAI-P2-029"');
  const normalEquationGuideIndex = html.indexOf('data-calculation-walkthrough', normalEquationFormulaIndex);
  const normalEquationExampleIndex = html.indexOf('data-worked-example', normalEquationFormulaIndex);
  if (
    normalEquationFormulaIndex < 0 ||
    normalEquationGuideIndex < normalEquationFormulaIndex ||
    normalEquationExampleIndex < normalEquationGuideIndex
  ) {
    issues.push('The Part II normal-equation derivation does not expose a calculation walkthrough and worked example');
  }
}

const unique = [...new Set(issues)].sort();
if (unique.length) {
  console.error(`modern-ai-part2-audit: found ${unique.length} issue(s):`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(`modern-ai-part2-audit: PASS (13 pages; ${formulaLedger.formulas.length} formulas; ${displayFormulaCount} formula guides with curated walkthroughs where meaningful; ${contentLedger.content.length} content blocks; ${contentLedger.figures.length} figures; ${contentLedger.annotations.length} annotations)`);

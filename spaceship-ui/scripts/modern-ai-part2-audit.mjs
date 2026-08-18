import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';

const root = process.cwd();
const postPath = path.join(root, 'site', 'content', 'posts', 'modern-artificial-intelligence-2.mdx');
const formulaLedgerPath = path.join(root, 'src', 'data', 'modern-ai-part2-formula-ledger.json');
const pageLedgerPath = path.join(root, 'src', 'data', 'modern-ai-part2-page-ledger.json');
const renderedPath = path.join(root, 'dist', 'posts', 'modern-artificial-intelligence-2', 'index.html');
const issues = [];

function read(file) {
  if (!fs.existsSync(file)) {
    issues.push(`missing file: ${path.relative(root, file)}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stable(item)]),
    );
  }
  return value;
}

const source = read(postPath);
const formulaLedger = JSON.parse(read(formulaLedgerPath) || '{"formulas":[]}');
const pageLedger = JSON.parse(read(pageLedgerPath) || '{"pages":[]}');
const formulas = Array.isArray(formulaLedger.formulas) ? formulaLedger.formulas : [];
const pages = Array.isArray(pageLedger.pages) ? pageLedger.pages : [];

if (formulaLedger.source?.pageCount !== 13 || formulaLedger.source?.file !== '1_Ch2 Fundamentals of ML.pdf') {
  issues.push('formula ledger source metadata must identify the 13-page Chapter 2 PDF');
}
if (formulaLedger.formulaCount !== formulas.length || formulas.length !== 46) {
  issues.push(`formula ledger must contain exactly 46 entries; found ${formulas.length}`);
}

const ids = formulas.map((formula) => formula.id);
if (new Set(ids).size !== ids.length) issues.push('formula IDs are not unique');
if (ids.some((id, index) => id !== `MAI-P2-${String(index + 1).padStart(3, '0')}`)) {
  issues.push('formula IDs must be the contiguous sequence MAI-P2-001…MAI-P2-046');
}

for (const formula of formulas) {
  if (!Number.isInteger(formula.page) || formula.page < 1 || formula.page > 13) {
    issues.push(`${formula.id}: invalid source page ${String(formula.page)}`);
  }
  const digest = crypto.createHash('sha256').update(formula.tex ?? '', 'utf8').digest('hex');
  if (formula.sha256 !== digest) issues.push(`${formula.id}: TeX SHA-256 mismatch`);
  if (!['source-exact', 'source-completed', 'editorial-derived'].includes(formula.status)) {
    issues.push(`${formula.id}: invalid status ${String(formula.status)}`);
  }
  if (!formula.title || !formula.summary || !Array.isArray(formula.steps)) {
    issues.push(`${formula.id}: explanation metadata is incomplete`);
  }
  if (count(source, new RegExp(`formula:\\s*${formula.id}\\b`, 'g')) !== 1) {
    issues.push(`${formula.id}: source marker must occur exactly once`);
  }
  if (count(source, new RegExp(`id="${formula.id}"`, 'g')) !== 1) {
    issues.push(`${formula.id}: ExplainedMath id must occur exactly once`);
  }
}

const numberedEquations = new Set(
  formulas.map((formula) => formula.sourceEquation).filter(Boolean),
);
for (let number = 1; number <= 12; number += 1) {
  if (!numberedEquations.has(`(${number})`)) {
    issues.push(`source numbered equation (${number}) is missing from formula ledger`);
  }
}

for (const completedId of ['MAI-P2-027', 'MAI-P2-032']) {
  const entry = formulas.find((formula) => formula.id === completedId);
  if (entry?.status !== 'source-completed' || !entry.note?.includes('빈칸')) {
    issues.push(`${completedId}: source blank completion is not explicitly documented`);
  }
}
if (formulas.find((formula) => formula.id === 'MAI-P2-046')?.status !== 'editorial-derived') {
  issues.push('MAI-P2-046 must remain marked as an editorial derivation from Figure 5');
}

if (pages.length !== 13 || pages.map((page) => page.page).join(',') !== '1,2,3,4,5,6,7,8,9,10,11,12,13') {
  issues.push('page ledger must contain exactly pages 1–13 in order');
}
const pageFormulaIds = [];
for (const page of pages) {
  for (const key of ['sections', 'contentBlocks', 'formulaIds', 'figures', 'questions', 'handwrittenNotes', 'articleAnchors']) {
    if (!Array.isArray(page[key])) issues.push(`page ${page.page}: ${key} must be an array`);
  }
  if (!page.contentBlocks?.length) issues.push(`page ${page.page}: no content blocks`);
  pageFormulaIds.push(...(page.formulaIds ?? []));
  for (const id of page.formulaIds ?? []) {
    const formula = formulas.find((item) => item.id === id);
    if (!formula) issues.push(`page ${page.page}: unknown formula ${id}`);
    else if (formula.page !== page.page) issues.push(`page ${page.page}: ${id} belongs to page ${formula.page}`);
  }
  const canonical = JSON.stringify(
    stable(Object.fromEntries(Object.entries(page).filter(([key]) => key !== 'sha256'))),
  );
  const digest = crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
  if (page.sha256 !== digest) issues.push(`page ${page.page}: page-ledger SHA-256 mismatch`);
}
if (pageFormulaIds.length !== ids.length || new Set(pageFormulaIds).size !== ids.length) {
  issues.push('page ledger must map every formula exactly once');
}
for (const id of ids) {
  if (!pageFormulaIds.includes(id)) issues.push(`page ledger does not map ${id}`);
}

const expectedFigureIds = ['FIG-1', 'FIG-2', 'FIG-3', 'FIG-4', 'FIG-5'];
const figureIds = new Set(pages.flatMap((page) => page.figures ?? []).map((figure) => figure.id));
for (const figureId of expectedFigureIds) {
  if (!figureIds.has(figureId)) issues.push(`source figure mapping missing: ${figureId}`);
}

for (const required of [
  "title: '현대 인공지능 II — 머신러닝의 기본 과제와 일반화'",
  "id: 'modern-artificial-intelligence'",
  'order: 2',
  "import ExplainedMath from '@/components/post/ExplainedMath.astro'",
  "import Part2LearningLab from '@/components/modern-ai/Part2LearningLab.svelte'",
  '강의자료 출처와 저작권',
  'Il Yong Chun',
  '2026년 8월 업데이트',
  '<Part2LearningLab client:visible />',
  '원자료 질문과 빈칸의 처리',
]) {
  if (!source.includes(required)) issues.push(`Part II source missing required contract: ${required}`);
}
for (const forbidden of ['??', '$$', '\\iiiint', '원자료 대기', '전체 시리즈는 **9편**']) {
  if (source.includes(forbidden)) issues.push(`Part II source contains forbidden artifact: ${forbidden}`);
}

if (!fs.existsSync(renderedPath)) {
  issues.push('rendered Part II output is missing; run `pnpm build` first');
} else {
  const html = fs.readFileSync(renderedPath, 'utf8');
  const cards = count(html, /data-formula-id="MAI-P2-\d{3}"/g);
  const toggles = count(html, />쉽게 설명</g);
  if (cards !== 46) issues.push(`rendered Part II must contain 46 formula cards; found ${cards}`);
  if (toggles !== 46) issues.push(`rendered Part II must contain 46 explanation toggles; found ${toggles}`);
  if (count(html, /data-formula-status="source-completed"/g) !== 2) {
    issues.push('rendered Part II must contain exactly two source-completed formulas');
  }
  if (count(html, /data-formula-status="editorial-derived"/g) !== 1) {
    issues.push('rendered Part II must contain exactly one editorial-derived formula');
  }

  for (const required of [
    '현대 인공지능 II — 머신러닝의 기본 과제와 일반화',
    '강의자료 출처와 저작권',
    '머신러닝 기초 인터랙티브 학습 도구',
    '2026년 8월 업데이트',
    'Generalized Venn and Venn-Abers Calibration',
    'KMM-CP',
  ]) {
    if (!html.includes(required)) issues.push(`rendered Part II missing: ${required}`);
  }

  for (const forbidden of ['katex-error', '\\iiiint', '$$', '??']) {
    if (html.includes(forbidden)) issues.push(`rendered Part II contains forbidden artifact: ${forbidden}`);
  }

  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  if (visibleText.includes('MAI-P2-')) {
    issues.push('internal formula IDs are visible to readers');
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`modern-ai-part2-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `modern-ai-part2-audit: PASS (${pages.length} pages, ${formulas.length} formula cards, source blanks separated, five figures reconstructed)`,
);

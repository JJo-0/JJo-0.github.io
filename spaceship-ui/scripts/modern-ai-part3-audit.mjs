import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data', 'modern-ai-part3');
const articlePath = path.join(root, 'site', 'content', 'posts', 'modern-artificial-intelligence-3.mdx');
const distPath = path.join(root, 'dist', 'posts', '2026-08-20-modern-artificial-intelligence-3', 'index.html');
const readerPluginPath = path.join(root, 'src', 'lib', 'remark', 'modern-ai-part3-reader-cleanup.mjs');
const sourceFormulaPath = path.join(root, 'src', 'components', 'post', 'SourceFormula.astro');
const astroConfigPath = path.join(root, 'astro.config.mjs');
const issues = [];

const EXPECTED = Object.freeze({
  sourceTitle: '4_CH4-Backgrounds for AI(1).pdf',
  sourcePages: 15,
  sourceSha256: '2a3855c52d688a79d38e714ab7ef7223dd7a5bc5b46f8385f55da777aa1c78af',
  formulas: 163,
  sourceFormulas: 140,
  displayFormulas: 99,
  inlineFormulas: 64,
  content: 308,
  figures: 7,
  annotations: 11,
  statuses: {
    'source-exact': 116,
    'source-suspect': 24,
    'editorially-completed': 12,
    'corrected-variant': 11,
  },
});

const CORRECTION_PAIRS = Object.freeze([
  ['MAI-P3-006', 'MAI-P3-141'],
  ['MAI-P3-012', 'MAI-P3-142'],
  ['MAI-P3-013', 'MAI-P3-143'],
  ['MAI-P3-023', 'MAI-P3-144'],
  ['MAI-P3-024', 'MAI-P3-145'],
  ['MAI-P3-043', 'MAI-P3-146'],
  ['MAI-P3-045', 'MAI-P3-147'],
  ['MAI-P3-049', 'MAI-P3-148'],
  ['MAI-P3-050', 'MAI-P3-149'],
  ['MAI-P3-060', 'MAI-P3-150'],
  ['MAI-P3-053', 'MAI-P3-151'],
  ['MAI-P3-057', 'MAI-P3-152'],
  ['MAI-P3-068', 'MAI-P3-153'],
  ['MAI-P3-081', 'MAI-P3-154'],
  ['MAI-P3-083', 'MAI-P3-155'],
  ['MAI-P3-087', 'MAI-P3-156'],
  ['MAI-P3-096', 'MAI-P3-157'],
  ['MAI-P3-128', 'MAI-P3-158'],
  ['MAI-P3-134', 'MAI-P3-159'],
  ['MAI-P3-140', 'MAI-P3-160'],
  ['MAI-P3-042', 'MAI-P3-161'],
  ['MAI-P3-030', 'MAI-P3-162'],
  ['MAI-P3-036', 'MAI-P3-163'],
]);

function readText(file, label) {
  if (!fs.existsSync(file)) {
    issues.push(`${label}: missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function readJson(name) {
  const file = path.join(dataDir, name);
  if (!fs.existsSync(file)) {
    issues.push(`${name}: missing`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    issues.push(`${name}: invalid JSON (${error.message})`);
    return null;
  }
}

function occurrences(text, literal) {
  return text.split(literal).length - 1;
}

function count(text, pattern) {
  return (text.match(pattern) ?? []).length;
}

function sameSet(actual, expected) {
  return actual.size === expected.size && [...actual].every((value) => expected.has(value));
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

const formulaLedger = readJson('formula-ledger.json');
const contentLedger = readJson('content-ledger.json');
const pageLedger = readJson('page-ledger.json');
const article = readText(articlePath, 'Part III article');
const readerPlugin = readText(readerPluginPath, 'Part III reader cleanup');
const sourceFormula = readText(sourceFormulaPath, 'SourceFormula component');
const astroConfig = readText(astroConfigPath, 'Astro config');

for (const ledger of [formulaLedger, contentLedger, pageLedger].filter(Boolean)) {
  if (ledger.source?.title !== EXPECTED.sourceTitle) issues.push('ledger source title mismatch');
  if (ledger.source?.pages !== EXPECTED.sourcePages) issues.push('ledger source page count must be 15');
  if (ledger.source?.sha256 !== EXPECTED.sourceSha256) issues.push('ledger source SHA-256 mismatch');
}

let formulaIds = new Set();
let displayFormulaCount = 0;
if (formulaLedger) {
  const formulas = formulaLedger.formulas ?? [];
  if (formulaLedger.formulaCount !== formulas.length) issues.push('formulaCount mismatch');
  if (formulas.length !== EXPECTED.formulas) issues.push(`expected ${EXPECTED.formulas} formulas, found ${formulas.length}`);
  if (formulaLedger.sourceFormulaCount !== EXPECTED.sourceFormulas) issues.push('sourceFormulaCount mismatch');

  const expectedIds = formulas.map((_, index) => `MAI-P3-${String(index + 1).padStart(3, '0')}`);
  const actualIds = formulas.map((formula) => formula.formulaId);
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) issues.push('formula IDs are not contiguous MAI-P3-001..163');
  formulaIds = new Set(actualIds);

  const statusCounts = Object.fromEntries(Object.keys(EXPECTED.statuses).map((status) => [status, 0]));
  displayFormulaCount = formulas.filter((formula) => formula.display === 'display').length;
  const inlineFormulaCount = formulas.filter((formula) => formula.display === 'inline').length;

  for (const formula of formulas) {
    const digest = crypto.createHash('sha256').update(formula.sourceLatex, 'utf8').digest('hex');
    if (digest !== formula.sha256) issues.push(`${formula.formulaId}: formula hash mismatch`);
    if (!(formula.status in statusCounts)) issues.push(`${formula.formulaId}: invalid status`);
    else statusCounts[formula.status] += 1;
    if (!Number.isInteger(formula.pdfPage) || formula.pdfPage < 1 || formula.pdfPage > EXPECTED.sourcePages) {
      issues.push(`${formula.formulaId}: invalid PDF page`);
    }
    if (!['inline', 'display'].includes(formula.display)) issues.push(`${formula.formulaId}: invalid display mode`);
    const found = occurrences(article, `part3Formula('${formula.formulaId}')`);
    if (found !== 1) issues.push(`${formula.formulaId}: expected one article call, found ${found}`);
  }

  if (displayFormulaCount !== EXPECTED.displayFormulas) issues.push(`display formulas: ${displayFormulaCount}`);
  if (inlineFormulaCount !== EXPECTED.inlineFormulas) issues.push(`inline formulas: ${inlineFormulaCount}`);
  for (const [status, expected] of Object.entries(EXPECTED.statuses)) {
    if (statusCounts[status] !== expected) issues.push(`${status} count: expected ${expected}, found ${statusCounts[status]}`);
  }

  const numbered = new Set(formulas.map((formula) => formula.sourceEquationNumber).filter(Boolean));
  for (let number = 1; number <= 13; number += 1) {
    if (!numbered.has(`(${number})`)) issues.push(`source equation (${number}) missing`);
  }

  const correctionIds = [];
  for (const [sourceId, correctionId] of CORRECTION_PAIRS) {
    const source = formulas.find((formula) => formula.formulaId === sourceId);
    const correction = formulas.find((formula) => formula.formulaId === correctionId);
    if (!source) issues.push(`${sourceId}: source record missing`);
    if (!correction) issues.push(`${correctionId}: correction record missing`);
    else if (correction.corrects !== sourceId) issues.push(`${correctionId}: corrects linkage mismatch`);
    correctionIds.push(correctionId);
  }
  const editorialIds = formulas
    .filter((formula) => ['editorially-completed', 'corrected-variant'].includes(formula.status))
    .map((formula) => formula.formulaId);
  if (JSON.stringify(editorialIds) !== JSON.stringify(correctionIds)) {
    issues.push('editorial formula set differs from approved correction pairs');
  }
}

let contentIds = new Set();
let figureIds = new Set();
let annotationIds = new Set();
if (contentLedger) {
  const content = contentLedger.content ?? [];
  const figures = contentLedger.figures ?? [];
  const annotations = contentLedger.annotations ?? [];
  if (contentLedger.contentCount !== content.length) issues.push('contentCount mismatch');
  if (contentLedger.figureCount !== figures.length) issues.push('figureCount mismatch');
  if (contentLedger.annotationCount !== annotations.length) issues.push('annotationCount mismatch');
  if (content.length !== EXPECTED.content) issues.push(`content records: expected ${EXPECTED.content}, found ${content.length}`);
  if (figures.length !== EXPECTED.figures) issues.push(`figure records: expected ${EXPECTED.figures}, found ${figures.length}`);
  if (annotations.length !== EXPECTED.annotations) issues.push(`annotation records: expected ${EXPECTED.annotations}, found ${annotations.length}`);

  const expectedContentIds = content.map((_, index) => `P3-C${String(index + 1).padStart(3, '0')}`);
  const actualContentIds = content.map((entry) => entry.contentId);
  if (JSON.stringify(actualContentIds) !== JSON.stringify(expectedContentIds)) issues.push('content IDs are not contiguous');
  contentIds = new Set(actualContentIds);
  figureIds = new Set(figures.map((entry) => entry.figureId));
  annotationIds = new Set(annotations.map((entry) => entry.annotationId));

  for (const entry of content) {
    const found = occurrences(article, `source-content:${entry.contentId}`);
    if (found !== 1) issues.push(`${entry.contentId}: expected one article marker, found ${found}`);
  }
  for (const entry of figures) {
    const found = occurrences(article, `source-figure:${entry.figureId}`);
    if (found !== 1) issues.push(`${entry.figureId}: expected one article marker, found ${found}`);
  }
  for (const entry of annotations) {
    const found = occurrences(article, `source-annotation:${entry.annotationId}`);
    if (found !== 1) issues.push(`${entry.annotationId}: expected one article marker, found ${found}`);
  }
}

if (pageLedger && formulaLedger && contentLedger) {
  const pages = pageLedger.pages ?? [];
  const expectedPages = Array.from({ length: EXPECTED.sourcePages }, (_, index) => index + 1);
  if (JSON.stringify(pages.map((page) => page.pdfPage)) !== JSON.stringify(expectedPages)) {
    issues.push('page ledger must enumerate PDF pages 1..15');
  }

  const mapped = { formulas: [], content: [], figures: [], annotations: [] };
  for (const page of pages) {
    if (page.status !== 'complete') issues.push(`page ${page.pdfPage}: status is not complete`);
    if (!(page.contentIds ?? []).length) issues.push(`page ${page.pdfPage}: no content mapped`);
    mapped.formulas.push(...(page.formulaIds ?? []));
    mapped.content.push(...(page.contentIds ?? []));
    mapped.figures.push(...(page.figureIds ?? []));
    mapped.annotations.push(...(page.annotationIds ?? []));
  }

  for (const [label, values, expected] of [
    ['formula', mapped.formulas, formulaIds],
    ['content', mapped.content, contentIds],
    ['annotation', mapped.annotations, annotationIds],
  ]) {
    const duplicates = duplicateValues(values);
    if (duplicates.length) issues.push(`page ledger duplicate ${label} IDs: ${duplicates.join(', ')}`);
    if (!sameSet(new Set(values), expected)) issues.push(`page ledger ${label} coverage mismatch`);
  }

  if (!sameSet(new Set(mapped.figures), figureIds)) {
    issues.push('page ledger figure coverage mismatch');
  }
  for (const figure of contentLedger.figures) {
    const declaredPages = figure.pdfPages ?? [figure.pdfPage];
    const mappedPages = pages
      .filter((page) => (page.figureIds ?? []).includes(figure.figureId))
      .map((page) => page.pdfPage);
    if (JSON.stringify(mappedPages) !== JSON.stringify(declaredPages)) {
      issues.push(`${figure.figureId}: expected page mapping ${declaredPages.join(',')}, found ${mappedPages.join(',')}`);
    }
    for (const page of pages) {
      const countOnPage = (page.figureIds ?? []).filter((id) => id === figure.figureId).length;
      if (countOnPage > 1) issues.push(`${figure.figureId}: duplicated within page ${page.pdfPage}`);
    }
  }

  for (const formula of formulaLedger.formulas) {
    const page = pages.find((entry) => entry.pdfPage === formula.pdfPage);
    if (!page?.formulaIds?.includes(formula.formulaId)) issues.push(`${formula.formulaId}: source-page mapping mismatch`);
  }
  for (const entry of contentLedger.content) {
    const page = pages.find((item) => item.pdfPage === entry.pdfPage);
    if (!page?.contentIds?.includes(entry.contentId)) issues.push(`${entry.contentId}: source-page mapping mismatch`);
  }
}

for (const required of [
  "title: '현대 인공지능 III — 퍼셉트론·MLP·CNN과 컨볼루션'",
  'pubDate: 2026-08-20',
  'category: ai-machine-learning',
  'subcategory: neural-network-foundations',
  'researchOrder: 5',
  "id: 'modern-artificial-intelligence'",
  'order: 3',
  '# PDF 원자료 재구성',
  '# 편집·수학 검증(Editorial audit)',
  '# 2026-08-18 최신 연구 업데이트',
  '원자료는 나머지 칸을 비워 둔다',
  '`torch.nn.Conv2d(in_channels, out_channels, kernel_size',
  '`torch.nn.MaxPool2d(kernel_size, stride=None',
  'Stronger Normalization-Free Transformers',
  'How Does the ReLU Activation Affect the Implicit Bias',
  'PFGNet — CVPR 2026',
]) {
  if (!article.includes(required)) issues.push(`article missing required contract: ${required}`);
}

for (const [sourceId, correctionId] of CORRECTION_PAIRS) {
  if (!readerPlugin.includes(`after: '${sourceId}'`)) issues.push(`reader cleanup missing placement ${sourceId}`);
  if (!readerPlugin.includes(`formula: '${correctionId}'`)) issues.push(`reader cleanup missing correction ${correctionId}`);
}
for (const required of [
  'modernAiPartThreeReaderCleanup',
  'Modern AI Part III reader boundaries are missing or out of order',
  'children.slice(sourceIndex + 1, auditIndex)',
]) {
  if (!readerPlugin.includes(required)) issues.push(`reader cleanup missing contract: ${required}`);
}
for (const forbidden of ['sourceNotice()', "strong('강의자료 출처')", "strong('읽는 법')"]) {
  if (readerPlugin.includes(forbidden)) issues.push(`reader cleanup reintroduced reader boilerplate: ${forbidden}`);
}
for (const required of [
  "import modernAiPartThreeReaderCleanup from './src/lib/remark/modern-ai-part3-reader-cleanup.mjs';",
  'modernAiPartThreeReaderCleanup,',
]) {
  if (!astroConfig.includes(required)) issues.push(`Astro config missing Part III plugin: ${required}`);
}
for (const required of [
  'part?: number;',
  'part = 2,',
  'data-source-hash={formula.sha256}',
  'data-formula-part={String(part)}',
  'data-formula-display="display"',
  'data-formula-display="inline"',
  'part={part}',
]) {
  if (!sourceFormula.includes(required)) issues.push(`SourceFormula missing shared-series contract: ${required}`);
}

if (!fs.existsSync(distPath)) {
  issues.push('rendered Part III output missing; run pnpm build before audit');
} else if (formulaLedger) {
  const html = fs.readFileSync(distPath, 'utf8');
  const renderedFormulaIds = [...html.matchAll(/data-formula-id="(MAI-P3-\d{3})"/g)].map((match) => match[1]);
  if (renderedFormulaIds.length !== EXPECTED.formulas) issues.push(`rendered formulas: expected ${EXPECTED.formulas}, found ${renderedFormulaIds.length}`);
  if (new Set(renderedFormulaIds).size !== EXPECTED.formulas) issues.push('rendered formula IDs contain duplicates');

  const contracts = [
    ['Part III display markers', /data-formula-part="3"/g, EXPECTED.displayFormulas],
    ['display formula records', /data-formula-display="display"/g, EXPECTED.displayFormulas],
    ['inline formula records', /data-formula-display="inline"/g, EXPECTED.inlineFormulas],
    ['source hash markers', /data-source-hash="[0-9a-f]{64}"/g, EXPECTED.formulas],
    ['rich formula cards', /data-formula-guide="rich"/g, EXPECTED.displayFormulas],
    ['calculation-first guides', /data-formula-guide="calculation-first"/g, EXPECTED.displayFormulas],
  ];
  for (const [label, pattern, expected] of contracts) {
    const actual = count(html, pattern);
    if (actual !== expected) issues.push(`Part III ${label}: expected ${expected}, found ${actual}`);
  }
  if (/data-formula-visual=/.test(html)) issues.push('retired generic formula visual leaked into Part III');

  for (const formula of formulaLedger.formulas) {
    const tag = html.match(new RegExp(`<(?:figure|span)[^>]*data-formula-id="${formula.formulaId}"[^>]*>`))?.[0];
    if (!tag) {
      issues.push(`${formula.formulaId}: rendered formula tag missing`);
      continue;
    }
    for (const attribute of [
      `data-source-page="${formula.pdfPage}"`,
      `data-formula-status="${formula.status}"`,
      `data-formula-hash="${formula.sha256}"`,
      `data-source-hash="${formula.sha256}"`,
      `data-formula-display="${formula.display}"`,
    ]) {
      if (!tag.includes(attribute)) issues.push(`${formula.formulaId}: rendered tag missing ${attribute}`);
    }
    if (formula.display === 'display' && !tag.includes('data-formula-part="3"')) {
      issues.push(`${formula.formulaId}: display card missing Part III marker`);
    }
  }

  for (const [sourceId, correctionId] of CORRECTION_PAIRS) {
    const sourceIndex = html.indexOf(`data-formula-id="${sourceId}"`);
    const correctionIndex = html.indexOf(`data-formula-id="${correctionId}"`);
    if (sourceIndex < 0 || correctionIndex < sourceIndex) issues.push(`${correctionId}: not rendered after ${sourceId}`);
  }

  for (const required of [
    '3. 인공지능과 딥러닝을 위한 배경',
    '선형 판별기에서 다층 퍼셉트론으로 확장하고, 1D·2D 컨볼루션과 CNN의 계산 구조를 정리한다.',
    '2026-08-18 최신 연구 업데이트',
    'Figure 1 재구성',
    'Figure 2 재구성',
    'Figure 3 재구성',
    'PDF pp.13–14 단계 도식 재구성',
    'PDF pp.14–15 단계 도식 재구성',
    '원자료는 나머지 칸을 비워 둔다',
    'torch.nn.Conv2d',
    'torch.nn.MaxPool2d',
    '쉽게 설명 + 계산 과정',
    'Calculation walkthrough',
    '숫자로 직접 계산',
    '검산 포인트',
    '같은 계산을 더 깊게 확인할 레퍼런스',
    '수식 복사',
    'Stronger Normalization-Free Transformers',
    'PFGNet',
  ]) {
    if (!html.includes(required)) issues.push(`rendered Part III missing: ${required}`);
  }

  const annotationCount = count(html, /강의 주석 — PDF p\./g);
  if (annotationCount !== EXPECTED.annotations) {
    issues.push(`rendered annotations: expected ${EXPECTED.annotations}, found ${annotationCount}`);
  }

  for (const forbidden of [
    '완전성 계약',
    '세 층을 섞지 않는다',
    '원장 현황',
    '강의자료 출처',
    '읽는 법',
    'PDF 원자료 재구성',
    '편집·수학 검증(Editorial audit)',
    'source-content:P3-C',
    'source-figure:P3-FIG',
    'source-annotation:P3-ANN',
    'Array.from({length:',
    'katex-error',
    '등호 왼쪽의 목표를 확인한다',
    '입력 기호의 값과 차원을 적는다',
    '가장 안쪽 괄호와 인덱스부터 계산한다',
    '곱 → 합 → 정규화 순서로 바깥 연산을 진행한다',
    '직접 계산하는 공통 절차',
  ]) {
    if (html.includes(forbidden)) issues.push(`rendered Part III leaked internal residue: ${forbidden}`);
  }

  const maxPoolSourceIndex = html.indexOf('원자료는 나머지 칸을 비워 둔다');
  const maxPoolSourceFormulaIndex = html.indexOf('data-formula-id="MAI-P3-140"');
  const maxPoolCompletionIndex = html.indexOf('data-formula-id="MAI-P3-160"');
  const referencesIndex = html.indexOf('강의자료 참고문헌');
  if (
    maxPoolSourceIndex < 0 ||
    maxPoolSourceFormulaIndex < maxPoolSourceIndex ||
    maxPoolCompletionIndex < maxPoolSourceFormulaIndex ||
    (referencesIndex >= 0 && maxPoolCompletionIndex > referencesIndex)
  ) {
    issues.push('MaxPool source partial grid and editorial completion are not in approved order');
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`modern-ai-part3-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `modern-ai-part3-audit: PASS (${EXPECTED.sourcePages} pages; ` +
    `${EXPECTED.formulas} formulas; ${displayFormulaCount} formula guides with curated walkthroughs only; ` +
    `${EXPECTED.content} content records; ${EXPECTED.figures} figures; ` +
    `${EXPECTED.annotations} handwritten annotations)`,
);

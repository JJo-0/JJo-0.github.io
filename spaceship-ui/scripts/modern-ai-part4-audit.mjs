import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data', 'modern-ai-part4');
const articlePath = path.join(root, 'site', 'content', 'posts', 'modern-artificial-intelligence-4.mdx');
const postPagePath = path.join(root, 'src', 'pages', 'posts', '[...slug]', 'index.astro');
const registryPath = path.join(root, 'src', 'lib', 'formula-lessons', 'registry.mjs');
const resolverPath = path.join(root, 'src', 'lib', 'modern-ai-part4.ts');
const distPath = path.join(root, 'dist', 'posts', '2026-08-21-modern-artificial-intelligence-4', 'index.html');
const issues = [];
const EXPECTED = Object.freeze({
  pages: 19,
  formulas: 211,
  sourceFormulas: 188,
  sourceDisplay: 88,
  sourceInline: 100,
  display: 110,
  inline: 101,
  content: 151,
  sourceContent: 109,
  editorialContent: 20,
  researchContent: 22,
  figures: 10,
  annotations: 17,
  corrections: 23,
  reviewCorrections: 9,
  renderedFormulas: 220,
  renderedDisplay: 119,
  sha256: '23272c39a5ad9c0dddf24eb7d42fdebe8575344f74bac3de761b7844fd81e58c',
  title: '5_Ch4-General-purpose gradient-based opt(1).pdf',
});
const REVIEW_PAIRS = Object.freeze([
  ['MAI-P4-059', 'MAI-P4-212'],
  ['MAI-P4-103', 'MAI-P4-213'],
  ['MAI-P4-133', 'MAI-P4-214'],
  ['MAI-P4-154', 'MAI-P4-215'],
  ['MAI-P4-156', 'MAI-P4-216'],
  ['MAI-P4-170', 'MAI-P4-217'],
  ['MAI-P4-053', 'MAI-P4-218'],
  ['MAI-P4-109', 'MAI-P4-219'],
  ['MAI-P4-111', 'MAI-P4-220'],
]);
const EXPECTED_CONTENT_LAYERS = Object.freeze([
  { from: 'P4-C001', to: 'P4-C109', status: 'source-reconstructed', pdfCoverage: true },
  { from: 'P4-C110', to: 'P4-C129', status: 'editorial-audit', pdfCoverage: false },
  { from: 'P4-C130', to: 'P4-C151', status: 'research-update', pdfCoverage: false },
]);

function fail(message) { issues.push(message); }
function readText(file, label) {
  if (!fs.existsSync(file)) { fail(`${label}: missing`); return ''; }
  return fs.readFileSync(file, 'utf8');
}
function readJson(name) {
  const file = path.join(dataDir, name);
  if (!fs.existsSync(file)) { fail(`${name}: missing`); return null; }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { fail(`${name}: invalid JSON (${error.message})`); return null; }
}
function occurrences(text, literal) { return text.split(literal).length - 1; }
function sameSet(a, b) { return a.size === b.size && [...a].every((value) => b.has(value)); }
function duplicates(values) {
  const seen = new Set(); const dup = new Set();
  for (const value of values) { if (seen.has(value)) dup.add(value); seen.add(value); }
  return [...dup];
}
function sha256(text) { return crypto.createHash('sha256').update(text, 'utf8').digest('hex'); }
function contentNumber(id) {
  const match = /^P4-C(\d{3})$/.exec(id ?? '');
  return match ? Number(match[1]) : NaN;
}
function contentLayer(id) {
  const n = contentNumber(id);
  if (n >= 1 && n <= 109) return 'source-reconstructed';
  if (n >= 110 && n <= 129) return 'editorial-audit';
  if (n >= 130 && n <= 151) return 'research-update';
  return null;
}

const formulaLedger = readJson('formula-ledger.json');
const contentLedger = readJson('content-ledger.json');
const pageLedger = readJson('page-ledger.json');
const sourceAudit = readJson('source-audit.json');
const review = readJson('review-corrections.json');
const article = readText(articlePath, 'Part IV article');
const postPage = readText(postPagePath, 'post page renderer');
const registry = readText(registryPath, 'formula lesson registry');
const resolver = readText(resolverPath, 'Part IV formula resolver');

for (const ledger of [formulaLedger, contentLedger, pageLedger].filter(Boolean)) {
  if (ledger.source?.title !== EXPECTED.title) fail('source title mismatch');
  if (ledger.source?.pages !== EXPECTED.pages) fail('source page count mismatch');
  if (ledger.source?.sha256 !== EXPECTED.sha256) fail('source SHA-256 mismatch');
}
if (sourceAudit) {
  if (sourceAudit.schemaVersion !== 2) fail('source-audit schemaVersion mismatch');
  if (sourceAudit.source?.title !== EXPECTED.title) fail('source-audit title mismatch');
  if (sourceAudit.source?.pages !== EXPECTED.pages) fail('source-audit page count mismatch');
  if (sourceAudit.source?.sha256 !== EXPECTED.sha256) fail('source-audit SHA mismatch');
  const expectedCounts = {
    pages: EXPECTED.pages,
    formulas: EXPECTED.formulas,
    sourceFormulas: EXPECTED.sourceFormulas,
    sourceDisplayFormulas: EXPECTED.sourceDisplay,
    sourceInlineFormulas: EXPECTED.sourceInline,
    displayFormulas: EXPECTED.display,
    inlineFormulas: EXPECTED.inline,
    editorialFormulaRecords: EXPECTED.corrections,
    content: EXPECTED.content,
    sourceContent: EXPECTED.sourceContent,
    editorialContent: EXPECTED.editorialContent,
    researchContent: EXPECTED.researchContent,
    figures: EXPECTED.figures,
    annotations: EXPECTED.annotations,
    corrections: EXPECTED.corrections,
  };
  for (const [key, value] of Object.entries(expectedCounts)) {
    if (sourceAudit.counts?.[key] !== value) fail(`source-audit ${key} mismatch`);
  }
  const verification = sourceAudit.pageVerification ?? [];
  if (verification.length !== EXPECTED.pages) fail('source-audit page verification incomplete');
  if (JSON.stringify(verification.map((entry) => entry.page)) !== JSON.stringify(Array.from({ length: EXPECTED.pages }, (_, index) => index + 1))) fail('source-audit page verification must enumerate 1..19');
  for (const entry of verification) if (entry.status !== 'inspected') fail(`source-audit page ${entry.page} not inspected`);
}

let formulaIds = new Set();
let sourceFormulaIds = new Set();
let frozenFormulas = [];
if (formulaLedger) {
  frozenFormulas = formulaLedger.formulas ?? [];
  if (frozenFormulas.length !== EXPECTED.formulas) fail(`formula count ${frozenFormulas.length} != ${EXPECTED.formulas}`);
  if (formulaLedger.formulaCount !== EXPECTED.formulas) fail('formulaCount mismatch');
  if (formulaLedger.sourceFormulaCount !== EXPECTED.sourceFormulas) fail('sourceFormulaCount mismatch');
  if (formulaLedger.displayFormulaCount !== EXPECTED.display) fail('displayFormulaCount mismatch');
  if (formulaLedger.inlineFormulaCount !== EXPECTED.inline) fail('inlineFormulaCount mismatch');
  const expectedIds = frozenFormulas.map((_, index) => `MAI-P4-${String(index + 1).padStart(3, '0')}`);
  const actualIds = frozenFormulas.map((formula) => formula.formulaId);
  if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) fail('frozen formula IDs are not contiguous 001..211');
  formulaIds = new Set(actualIds);
  sourceFormulaIds = new Set(frozenFormulas.filter((formula) => !formula.corrects).map((formula) => formula.formulaId));
  if (sourceFormulaIds.size !== EXPECTED.sourceFormulas) fail(`derived source formula count ${sourceFormulaIds.size} != ${EXPECTED.sourceFormulas}`);
  const sourceDisplay = frozenFormulas.filter((formula) => !formula.corrects && formula.display === 'display').length;
  const sourceInline = frozenFormulas.filter((formula) => !formula.corrects && formula.display === 'inline').length;
  if (sourceDisplay !== EXPECTED.sourceDisplay) fail(`derived source display count ${sourceDisplay} != ${EXPECTED.sourceDisplay}`);
  if (sourceInline !== EXPECTED.sourceInline) fail(`derived source inline count ${sourceInline} != ${EXPECTED.sourceInline}`);
  for (const formula of frozenFormulas) {
    if (sha256(formula.sourceLatex) !== formula.sha256) fail(`${formula.formulaId}: frozen hash mismatch`);
    if (occurrences(article, `part4Formula('${formula.formulaId}')`) !== 1) fail(`${formula.formulaId}: article occurrence mismatch`);
    if (formula.corrects) {
      const source = frozenFormulas.find((candidate) => candidate.formulaId === formula.corrects);
      if (!source) fail(`${formula.formulaId}: missing corrects source`);
      if (!['editorially-completed', 'corrected-variant'].includes(formula.status)) fail(`${formula.formulaId}: correction has invalid status`);
      if (source && !['source-exact', 'source-suspect'].includes(source.status)) fail(`${formula.formulaId}: correction source is not source-derived`);
    }
  }
  if (frozenFormulas.filter((formula) => formula.corrects).length !== EXPECTED.corrections) fail('frozen correction count mismatch');
}

let reviewCorrectionIds = new Set();
if (review && formulaLedger) {
  if (review.schemaVersion !== 1) fail('review overlay schemaVersion mismatch');
  if (review.part !== 4) fail('review overlay part mismatch');
  if (review.sourceSha256 !== EXPECTED.sha256) fail('review overlay source SHA mismatch');
  if (JSON.stringify(review.contentLayers ?? []) !== JSON.stringify(EXPECTED_CONTENT_LAYERS)) fail('review content-layer partition mismatch');
  const overrides = review.statusOverrides ?? {};
  const corrections = review.corrections ?? [];
  const expectedSourceIds = new Set(REVIEW_PAIRS.map(([sourceId]) => sourceId));
  const expectedCorrectionIds = REVIEW_PAIRS.map(([, correctionId]) => correctionId);
  if (!sameSet(new Set(Object.keys(overrides)), expectedSourceIds)) fail('review status override set mismatch');
  if (corrections.length !== EXPECTED.reviewCorrections) fail('review correction count mismatch');
  if (JSON.stringify(corrections.map((formula) => formula.formulaId)) !== JSON.stringify(expectedCorrectionIds)) fail('review correction IDs/order mismatch');
  reviewCorrectionIds = new Set(expectedCorrectionIds);
  for (const [sourceId, correctionId] of REVIEW_PAIRS) {
    const source = frozenFormulas.find((formula) => formula.formulaId === sourceId);
    const override = overrides[sourceId];
    const correction = corrections.find((formula) => formula.formulaId === correctionId);
    if (!source) fail(`${sourceId}: review source missing from frozen ledger`);
    if (source && source.status !== 'source-exact') fail(`${sourceId}: frozen transcription status unexpectedly changed`);
    if (override?.status !== 'source-suspect' || !override?.note) fail(`${sourceId}: effective source-suspect override incomplete`);
    if (!correction) { fail(`${correctionId}: review correction missing`); continue; }
    if (formulaIds.has(correctionId)) fail(`${correctionId}: collides with frozen formula ledger`);
    if (correction.corrects !== sourceId) fail(`${correctionId}: corrects link mismatch`);
    if (correction.status !== 'corrected-variant') fail(`${correctionId}: correction status must be corrected-variant`);
    if (correction.display !== 'display') fail(`${correctionId}: review correction must render as display`);
    if (sha256(correction.sourceLatex) !== correction.sha256) fail(`${correctionId}: review correction hash mismatch`);
  }
}

let contentIds = new Set();
let sourceContentIds = new Set();
let figureIds = new Set();
let annotationIds = new Set();
if (contentLedger) {
  const blocks = contentLedger.content ?? [], figures = contentLedger.figures ?? [], annotations = contentLedger.annotations ?? [];
  if (blocks.length !== EXPECTED.content) fail('content count mismatch');
  if (figures.length !== EXPECTED.figures) fail('figure count mismatch');
  if (annotations.length !== EXPECTED.annotations) fail('annotation count mismatch');
  const expectedIds = blocks.map((_, index) => `P4-C${String(index + 1).padStart(3, '0')}`);
  const actualIds = blocks.map((block) => block.contentId);
  if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) fail('content IDs are not contiguous');
  for (const [label, values] of [['content', actualIds], ['figure', figures.map((f) => f.figureId)], ['annotation', annotations.map((a) => a.annotationId)]]) {
    const dup = duplicates(values); if (dup.length) fail(`duplicate ${label} IDs: ${dup.join(', ')}`);
  }
  contentIds = new Set(actualIds);
  sourceContentIds = new Set(actualIds.filter((id) => contentLayer(id) === 'source-reconstructed'));
  figureIds = new Set(figures.map((f) => f.figureId));
  annotationIds = new Set(annotations.map((a) => a.annotationId));
  if (sourceContentIds.size !== EXPECTED.sourceContent) fail(`source content count ${sourceContentIds.size} != ${EXPECTED.sourceContent}`);
  if (actualIds.filter((id) => contentLayer(id) === 'editorial-audit').length !== EXPECTED.editorialContent) fail('editorial content count mismatch');
  if (actualIds.filter((id) => contentLayer(id) === 'research-update').length !== EXPECTED.researchContent) fail('research content count mismatch');
  for (const block of blocks) {
    if (!contentLayer(block.contentId)) fail(`${block.contentId}: no effective content layer`);
    if (occurrences(article, `source-content:${block.contentId}`) !== 1) fail(`${block.contentId}: marker mismatch`);
  }
  for (const figure of figures) if (occurrences(article, `source-figure:${figure.figureId}`) !== 1) fail(`${figure.figureId}: marker mismatch`);
  for (const annotation of annotations) if (occurrences(article, `source-annotation:${annotation.annotationId}`) !== 1) fail(`${annotation.annotationId}: marker mismatch`);
}

if (pageLedger && formulaLedger && contentLedger) {
  if (pageLedger.schemaVersion !== 2) fail('page ledger schemaVersion mismatch');
  if (!String(pageLedger.coveragePolicy ?? '').includes('PDF source-only')) fail('page ledger source-only coverage policy missing');
  const pages = pageLedger.pages ?? [];
  if (JSON.stringify(pages.map((page) => page.pdfPage)) !== JSON.stringify(Array.from({ length: EXPECTED.pages }, (_, index) => index + 1))) fail('page ledger must enumerate 1..19');
  const mapped = { formulas: [], content: [], figures: [], annotations: [] };
  for (const page of pages) {
    if (page.status !== 'complete') fail(`page ${page.pdfPage} incomplete`);
    for (const [label, values] of [['formula', page.formulaIds ?? []], ['content', page.contentIds ?? []], ['figure', page.figureIds ?? []], ['annotation', page.annotationIds ?? []]]) {
      const dup = duplicates(values); if (dup.length) fail(`page ${page.pdfPage} duplicate ${label} IDs: ${dup.join(', ')}`);
    }
    for (const id of page.formulaIds ?? []) if (!sourceFormulaIds.has(id)) fail(`page ${page.pdfPage}: non-source formula in PDF coverage (${id})`);
    for (const id of page.contentIds ?? []) if (!sourceContentIds.has(id)) fail(`page ${page.pdfPage}: non-source content in PDF coverage (${id})`);
    mapped.formulas.push(...(page.formulaIds ?? []));
    mapped.content.push(...(page.contentIds ?? []));
    mapped.figures.push(...(page.figureIds ?? []));
    mapped.annotations.push(...(page.annotationIds ?? []));
  }
  for (const [label, values, expected] of [['formula', mapped.formulas, sourceFormulaIds], ['content', mapped.content, sourceContentIds], ['annotation', mapped.annotations, annotationIds]]) {
    const dup = duplicates(values); if (dup.length) fail(`page ledger duplicate ${label} IDs: ${dup.join(', ')}`);
    if (!sameSet(new Set(values), expected)) fail(`page ledger ${label} source coverage mismatch`);
  }
  if (!sameSet(new Set(mapped.figures), figureIds)) fail('page ledger figure coverage mismatch');
  for (const figure of contentLedger.figures) {
    const expectedPages = figure.pdfPages ?? [figure.pdfPage];
    const actualPages = pages.filter((page) => (page.figureIds ?? []).includes(figure.figureId)).map((page) => page.pdfPage);
    if (JSON.stringify(expectedPages) !== JSON.stringify(actualPages)) fail(`${figure.figureId}: multi-page mapping mismatch`);
  }
}

for (const required of [
  "title: '현대 인공지능 IV — 기울기 기반 최적화: GD에서 OGM까지'",
  'pubDate: 2026-08-21',
  'subcategory: optimization',
  'order: 4',
  '# PDF 원자료 재구성',
  '# 편집·수학 검증(Editorial audit)',
  '# 2026-08-18 최신 연구 업데이트',
  '아래는 2025 lecture source가 아니다',
  'Performance Estimation Problem(PEP)',
  'SPAM',
  'LDAdam',
  'Muon',
  'OPTAMI',
  'PCG의 “quadratic convergence” 문구 분리',
]) if (!article.includes(required)) fail(`article missing: ${required}`);
if (article.includes('<table')) fail('Part IV article contains MDX-fragile raw <table> markup');
for (const forbidden of [
  '.github/workflows/part4-materialize.yml',
  '.github/workflows/part4-bootstrap.yml',
  '.github/workflows/part4-cleanup-once.yml',
  '.github/workflows/part4-formula-dedup-once.yml',
  '.github/workflows/part4-review-repair-once.yml',
]) if (fs.existsSync(path.join(root, '..', forbidden))) fail(`temporary workflow remains: ${forbidden}`);

for (const [source, label, markers] of [
  [resolver, 'Part IV resolver', ['review-corrections.json', 'part4ReviewCorrections', 'statusOverrides']],
  [registry, 'formula lesson registry', ['part4FormulaLedger', 'part4ReviewCorrections', 'part4:']],
  [postPage, 'post page renderer', ['Part4ReviewCorrections', 'part4-article', 'svg text:not([fill])']],
]) {
  for (const marker of markers) if (!source.includes(marker)) fail(`${label}: missing ${marker}`);
}

if (!fs.existsSync(distPath)) fail('rendered Part IV output missing; run pnpm build');
else if (formulaLedger && review) {
  const html = fs.readFileSync(distPath, 'utf8');
  const rendered = [...html.matchAll(/data-formula-id="(MAI-P4-\d{3})"/g)].map((match) => match[1]);
  const expectedRenderedIds = new Set([...formulaIds, ...reviewCorrectionIds]);
  if (rendered.length !== EXPECTED.renderedFormulas) fail(`rendered formula count ${rendered.length} != ${EXPECTED.renderedFormulas}`);
  if (new Set(rendered).size !== EXPECTED.renderedFormulas) fail('rendered formula IDs duplicated');
  if (!sameSet(new Set(rendered), expectedRenderedIds)) fail('rendered formula ID coverage mismatch');
  const checks = [
    ['display', /data-formula-display="display"/g, EXPECTED.renderedDisplay],
    ['inline', /data-formula-display="inline"/g, EXPECTED.inline],
    ['hash', /data-source-hash="[0-9a-f]{64}"/g, EXPECTED.renderedFormulas],
    ['guide', /data-formula-guide="rich"/g, EXPECTED.renderedDisplay],
    ['lesson-state', /data-formula-lesson-state="(?:approved-interactive|approved-derivation|approved-structure|no-visual-with-reason|unreviewed)"/g, EXPECTED.renderedDisplay],
  ];
  for (const [label, pattern, expected] of checks) {
    const actual = (html.match(pattern) ?? []).length;
    if (actual !== expected) fail(`rendered ${label} ${actual} != ${expected}`);
  }
  if (html.includes('data-formula-lesson-state="missing"')) fail('Part IV display formula lesson state is missing');
  if (!html.includes('data-part4-review-corrections')) fail('rendered review correction appendix missing');
  if ((html.match(/data-part4-review-correction=/g) ?? []).length !== EXPECTED.reviewCorrections) fail('rendered review correction appendix count mismatch');
  for (const [sourceId, correctionId] of REVIEW_PAIRS) {
    const sourcePattern = new RegExp(`data-formula-id="${sourceId}"[^>]*data-formula-status="source-suspect"`);
    const correctionPattern = new RegExp(`data-formula-id="${correctionId}"[^>]*data-formula-status="corrected-variant"`);
    if (!sourcePattern.test(html)) fail(`${sourceId}: effective source-suspect status not rendered`);
    if (!correctionPattern.test(html)) fail(`${correctionId}: corrected variant not rendered`);
    if (!html.includes(`data-part4-review-correction="${correctionId}" data-corrects="${sourceId}"`)) fail(`${correctionId}: rendered corrects linkage missing`);
  }
  for (const required of ['현대 인공지능 IV', 'PDF 원자료 재구성', '편집·수학 검증', '추가 적대적 검토 교정', '2026-08-18 최신 연구 업데이트', 'Performance Estimation Problem', 'Muon']) {
    if (!html.includes(required)) fail(`rendered output missing ${required}`);
  }
  for (const forbidden of ['source-content:P4-C', 'source-figure:P4-FIG', 'source-annotation:P4-ANN', 'katex-error']) {
    if (html.includes(forbidden)) fail(`rendered residue: ${forbidden}`);
  }
}

const unique = [...new Set(issues)].sort();
if (unique.length) {
  console.error(`modern-ai-part4-audit: found ${unique.length} issue(s):`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log(`modern-ai-part4-audit: PASS (${EXPECTED.pages} pages; ${EXPECTED.sourceFormulas} source formulas / ${EXPECTED.formulas} frozen formula records; ${EXPECTED.sourceContent} PDF source content / ${EXPECTED.editorialContent} editorial / ${EXPECTED.researchContent} research blocks; ${EXPECTED.reviewCorrections} adversarial corrections; ${EXPECTED.renderedFormulas} rendered unique formulas; ${EXPECTED.renderedDisplay} explicit lesson states; ${EXPECTED.figures} figures; ${EXPECTED.annotations} annotations; source-only page coverage)`);

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { PART3_APPROVED_FORMULA_IDS, getPart3ApprovedLessonOverride } from '../src/lib/formula-lessons/part3-overrides.mjs';
import { getAllPart3FormulaLessonSpecs, getPart3FormulaLessonSpec } from '../src/lib/formula-lessons/part3-specs.mjs';
import { computePerceptronGeometry } from '../src/lib/formula-lessons/perceptron-geometry.mjs';
import { computePerceptronLearning } from '../src/lib/formula-lessons/perceptron-learning.mjs';

const root = process.cwd();
const issues = [];
const fail = (message) => issues.push(message);
const close = (a, b, tolerance = 1e-8) => Math.abs(a - b) <= tolerance;
const requireFile = (relative) => {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) fail(`${relative}: missing`);
  return file;
};

const ledgerPath = requireFile('src/data/modern-ai-part3/formula-ledger.json');
const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : { formulas: [] };
const displays = (ledger.formulas ?? []).filter((formula) => formula.display === 'display');
const inventory = displays.map((source) => {
  const override = getPart3ApprovedLessonOverride(source.formulaId);
  if (override) return { formulaId: source.formulaId, ...override, source, reason: null };
  return {
    formulaId: source.formulaId,
    lessonId: null,
    focus: null,
    state: 'unreviewed',
    mode: 'none',
    renderer: null,
    reason: null,
    source,
  };
});

const approved = inventory.filter((entry) => entry.state.startsWith('approved-'));
const unreviewed = inventory.filter((entry) => entry.state === 'unreviewed');

if (ledger.formulaCount !== 163) fail(`Part III ledger total ${ledger.formulaCount} != 163`);
if (ledger.displayFormulaCount !== 99 || displays.length !== 99) fail(`Part III display formulas ${displays.length} != 99`);
if (inventory.length !== 99) fail(`Part III lesson inventory ${inventory.length} != 99`);
if (PART3_APPROVED_FORMULA_IDS.length !== 26) fail(`Part III approved IDs ${PART3_APPROVED_FORMULA_IDS.length} != 26`);
if (approved.length !== 26) fail(`Part III approved inventory ${approved.length} != 26`);
if (unreviewed.length !== 73) fail(`Part III staged unreviewed ${unreviewed.length} != 73`);
if (new Set(PART3_APPROVED_FORMULA_IDS).size !== PART3_APPROVED_FORMULA_IDS.length) fail('Part III approved formula IDs are duplicated');
if (getAllPart3FormulaLessonSpecs().length !== 2) fail(`expected 2 Part III lesson groups, found ${getAllPart3FormulaLessonSpecs().length}`);

const displayIds = new Set(displays.map((formula) => formula.formulaId));
for (const formulaId of PART3_APPROVED_FORMULA_IDS) {
  if (!displayIds.has(formulaId)) fail(`${formulaId}: approved ID is not a Part III display formula`);
}
for (const entry of inventory) {
  if (entry.state.startsWith('approved-')) {
    if (!entry.renderer || !entry.lessonId || !entry.focus) fail(`${entry.formulaId}: approved Part III lesson incomplete`);
    if (!getPart3FormulaLessonSpec(entry.lessonId)) fail(`${entry.formulaId}: missing Part III spec ${entry.lessonId}`);
  } else if (entry.state === 'unreviewed') {
    if (entry.renderer || entry.lessonId || entry.focus || entry.mode !== 'none' || entry.reason) {
      fail(`${entry.formulaId}: unreviewed formula gained renderer/spec/reason metadata`);
    }
  } else {
    fail(`${entry.formulaId}: unexpected Part III migration state ${entry.state}`);
  }
}

for (const [sourceId, correctionId] of [
  ['MAI-P3-006', 'MAI-P3-141'],
  ['MAI-P3-023', 'MAI-P3-144'],
  ['MAI-P3-024', 'MAI-P3-145'],
  ['MAI-P3-030', 'MAI-P3-162'],
  ['MAI-P3-036', 'MAI-P3-163'],
  ['MAI-P3-012', 'MAI-P3-142'],
  ['MAI-P3-013', 'MAI-P3-143'],
]) {
  const source = ledger.formulas.find((formula) => formula.formulaId === sourceId);
  const correction = ledger.formulas.find((formula) => formula.formulaId === correctionId);
  if (!source || !correction) fail(`${sourceId}/${correctionId}: source/correction record missing`);
  else if (correction.corrects !== sourceId) fail(`${correctionId}: corrects linkage mismatch`);
  else if (source.status === correction.status) fail(`${sourceId}/${correctionId}: provenance states collapsed`);
}

const geometrySpec = getPart3FormulaLessonSpec('p3-perceptron-geometry');
const geometry = computePerceptronGeometry(geometrySpec);
if (!geometry.allSeparated) fail('Part III geometry sample margins are not all positive');
if (!close(geometry.score, 0.1)) fail(`Part III geometry score ${geometry.score} != 0.1`);
if (!close(geometry.distance, Math.abs(geometry.signedDistance))) fail('Part III absolute/signed distance invariant failed');
if (!close(geometry.lineMapping.residual, 0)) fail(`Part III line-to-hyperplane mapping residual ${geometry.lineMapping.residual}`);

const learningSpec = getPart3FormulaLessonSpec('p3-perceptron-learning');
const learning = computePerceptronLearning({
  samples: learningSpec.samples,
  w: learningSpec.initialW,
  b: learningSpec.initialB,
  alpha: learningSpec.alpha,
});
if (learning.strictErrors.length !== 0) fail(`strict error-set zero-margin oracle ${learning.strictErrors.length} != 0`);
if (learning.correctedErrors.length !== 4) fail(`corrected error-set zero-margin oracle ${learning.correctedErrors.length} != 4`);
if (!close(learning.fullGradient.w[0], -6) || !close(learning.fullGradient.w[1], -5) || !close(learning.fullGradient.b, 0)) {
  fail(`completed perceptron gradient mismatch: [${learning.fullGradient.w.join(',')}], ${learning.fullGradient.b}`);
}
if (!close(learning.correctedUpdate.w[0], 1.5) || !close(learning.correctedUpdate.w[1], 1.25)) {
  fail(`corrected perceptron update mismatch: [${learning.correctedUpdate.w.join(',')}]`);
}
if (!learning.correctedNextSeparated) fail('corrected error-set update did not yield positive margins in oracle scene');

const registryPath = requireFile('src/lib/formula-lessons/registry.mjs');
const registrySource = fs.existsSync(registryPath) ? fs.readFileSync(registryPath, 'utf8') : '';
for (const required of [
  "modern-ai-part3/formula-ledger.json",
  'getPart3ApprovedLessonOverride',
  'part: 3',
]) {
  if (!registrySource.includes(required)) fail(`registry missing Part III exact-ID wiring: ${required}`);
}
const hostPath = requireFile('src/components/post/formula-lessons/FormulaLessonHost.astro');
const hostSource = fs.existsSync(hostPath) ? fs.readFileSync(hostPath, 'utf8') : '';
if (!hostSource.includes('getPart3FormulaLessonSpec')) fail('FormulaLessonHost does not resolve Part III exact specs');
const runtimePath = requireFile('src/scripts/formula-lesson-runtime.js');
const runtimeSource = fs.existsSync(runtimePath) ? fs.readFileSync(runtimePath, 'utf8') : '';
if (!runtimeSource.includes('import.meta.glob') || !runtimeSource.includes("'toggle'")) fail('formula lesson runtime is not disclosure-lazy');

for (const renderer of ['PerceptronGeometryLesson', 'PerceptronLearningLesson']) {
  const rendererPath = requireFile(`src/components/post/formula-lessons/renderers/${renderer}.svelte`);
  const source = fs.existsSync(rendererPath) ? fs.readFileSync(rendererPath, 'utf8') : '';
  if (!/@media\(max-width:|@media \(max-width:/.test(source)) fail(`${renderer}: no mobile layout media query`);
}

const distPath = path.join(root, 'dist', 'posts', '2026-08-20-modern-artificial-intelligence-3', 'index.html');
if (fs.existsSync(path.join(root, 'dist'))) {
  if (!fs.existsSync(distPath)) {
    fail('Part III rendered article missing');
  } else {
    const html = fs.readFileSync(distPath, 'utf8');
    const hostCount = (html.match(/data-formula-lesson(?:\s|>)/g) ?? []).length;
    const approvedStateCount = (html.match(/data-formula-lesson-state="approved-(?:interactive|derivation|structure)"/g) ?? []).length;
    const unreviewedStateCount = (html.match(/data-formula-lesson-state="unreviewed"/g) ?? []).length;
    const missingStateCount = (html.match(/data-formula-lesson-state="missing"/g) ?? []).length;
    if (hostCount !== 26) fail(`Part III rendered exact lesson hosts ${hostCount} != 26`);
    if (approvedStateCount !== 26) fail(`Part III rendered approved states ${approvedStateCount} != 26`);
    if (unreviewedStateCount !== 73) fail(`Part III rendered unreviewed states ${unreviewedStateCount} != 73`);
    if (missingStateCount !== 0) fail(`Part III rendered missing lesson states ${missingStateCount} != 0`);
    if (/data-formula-visual=|대표 예시로 y=x²|katex-error/.test(html)) fail('Part III rendered retired/error visual residue');
  }
}

const unique = [...new Set(issues)].sort();
if (unique.length) {
  console.error(`modern-ai-part3-lesson-audit: FAIL (${unique.length})`);
  for (const issue of unique) console.error(`- ${issue}`);
  process.exit(1);
}
console.log('modern-ai-part3-lesson-audit: PASS (99 display formulas registered; 26 approved across 2 exact-ID lessons; 73 staged unreviewed fail-closed; 0 missing; source/correction provenance preserved; lazy mobile-safe renderers)');

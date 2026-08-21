import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { PART3_APPROVED_FORMULA_IDS, getPart3ApprovedLessonOverride } from '../src/lib/formula-lessons/part3-overrides.mjs';
import { getAllPart3FormulaLessonSpecs, getPart3FormulaLessonSpec } from '../src/lib/formula-lessons/part3-specs.mjs';
import { computePerceptronGeometry } from '../src/lib/formula-lessons/perceptron-geometry.mjs';
import { computePerceptronLearning } from '../src/lib/formula-lessons/perceptron-learning.mjs';
import { computePerceptronMse, computeXorGeometry, computeMlpForward, computeDropoutDropConnect, computeConvolutionPrimitives, computeConvolutionExercises, computeBoundaryLesson, positiveMod, computePatchCnn } from '../src/lib/formula-lessons/part3-advanced.mjs';

const root = process.cwd();
const issues = [];
const fail = (message) => issues.push(message);
const close = (a, b, tolerance = 1e-8) => Math.abs(a - b) <= tolerance;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const requireFile = (relative) => { const file = path.join(root, relative); if (!fs.existsSync(file)) fail(`${relative}: missing`); return file; };

const ledgerPath = requireFile('src/data/modern-ai-part3/formula-ledger.json');
const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : { formulas: [] };
const displays = (ledger.formulas ?? []).filter((formula) => formula.display === 'display');
const inventory = displays.map((source) => {
  const override = getPart3ApprovedLessonOverride(source.formulaId);
  return override ? { formulaId: source.formulaId, ...override, source, reason: null } : { formulaId: source.formulaId, lessonId: null, focus: null, state: 'unreviewed', mode: 'none', renderer: null, reason: null, source };
});
const approved = inventory.filter((entry) => entry.state.startsWith('approved-'));
const unreviewed = inventory.filter((entry) => entry.state === 'unreviewed');

if (ledger.formulaCount !== 163) fail(`Part III ledger total ${ledger.formulaCount} != 163`);
if (ledger.displayFormulaCount !== 99 || displays.length !== 99) fail(`Part III display formulas ${displays.length} != 99`);
if (inventory.length !== 99) fail(`Part III lesson inventory ${inventory.length} != 99`);
if (PART3_APPROVED_FORMULA_IDS.length !== 99) fail(`Part III approved IDs ${PART3_APPROVED_FORMULA_IDS.length} != 99`);
if (approved.length !== 99) fail(`Part III approved inventory ${approved.length} != 99`);
if (unreviewed.length !== 0) fail(`Part III unreviewed formulas remain: ${unreviewed.length}`);
if (new Set(PART3_APPROVED_FORMULA_IDS).size !== PART3_APPROVED_FORMULA_IDS.length) fail('Part III approved formula IDs are duplicated');
if (getAllPart3FormulaLessonSpecs().length !== 10) fail(`expected 10 Part III lesson groups, found ${getAllPart3FormulaLessonSpecs().length}`);

const displayIds = new Set(displays.map((formula) => formula.formulaId));
for (const formulaId of PART3_APPROVED_FORMULA_IDS) if (!displayIds.has(formulaId)) fail(`${formulaId}: approved ID is not a Part III display formula`);
for (const formulaId of displayIds) if (!PART3_APPROVED_FORMULA_IDS.includes(formulaId)) fail(`${formulaId}: Part III display formula lacks exact-ID approval`);
for (const entry of inventory) {
  if (!entry.state.startsWith('approved-')) fail(`${entry.formulaId}: invalid final state ${entry.state}`);
  if (!entry.renderer || !entry.lessonId || !entry.focus) fail(`${entry.formulaId}: approved Part III lesson incomplete`);
  if (!getPart3FormulaLessonSpec(entry.lessonId)) fail(`${entry.formulaId}: missing Part III spec ${entry.lessonId}`);
}

for (const [sourceId, correctionId] of [
  ['MAI-P3-006','MAI-P3-141'],['MAI-P3-012','MAI-P3-142'],['MAI-P3-013','MAI-P3-143'],
  ['MAI-P3-023','MAI-P3-144'],['MAI-P3-024','MAI-P3-145'],['MAI-P3-030','MAI-P3-162'],['MAI-P3-036','MAI-P3-163'],
  ['MAI-P3-043','MAI-P3-146'],['MAI-P3-045','MAI-P3-147'],['MAI-P3-049','MAI-P3-148'],['MAI-P3-050','MAI-P3-149'],
  ['MAI-P3-060','MAI-P3-150'],['MAI-P3-053','MAI-P3-151'],['MAI-P3-057','MAI-P3-152'],['MAI-P3-068','MAI-P3-153'],
  ['MAI-P3-081','MAI-P3-154'],['MAI-P3-083','MAI-P3-155'],['MAI-P3-087','MAI-P3-156'],['MAI-P3-096','MAI-P3-157'],
  ['MAI-P3-128','MAI-P3-158'],['MAI-P3-134','MAI-P3-159'],['MAI-P3-140','MAI-P3-160'],['MAI-P3-042','MAI-P3-161'],
]) {
  const source = ledger.formulas.find((formula) => formula.formulaId === sourceId);
  const correction = ledger.formulas.find((formula) => formula.formulaId === correctionId);
  if (!source || !correction) fail(`${sourceId}/${correctionId}: source/correction record missing`);
  else if (correction.corrects !== sourceId) fail(`${correctionId}: corrects linkage mismatch`);
  else if (source.status === correction.status) fail(`${sourceId}/${correctionId}: provenance states collapsed`);
}

const geometrySpec = getPart3FormulaLessonSpec('p3-perceptron-geometry');
const geometry = computePerceptronGeometry(geometrySpec);
if (!geometry.allSeparated || !close(geometry.score, .1) || !close(geometry.distance, Math.abs(geometry.signedDistance)) || !close(geometry.lineMapping.residual, 0)) fail('perceptron geometry oracle failed');

const learningSpec = getPart3FormulaLessonSpec('p3-perceptron-learning');
const learning = computePerceptronLearning({ samples: learningSpec.samples, w: learningSpec.initialW, b: learningSpec.initialB, alpha: learningSpec.alpha });
if (learning.strictErrors.length !== 0 || learning.correctedErrors.length !== 4) fail('perceptron strict/corrected zero-margin oracle failed');
if (!same(learning.fullGradient.w, [-6,-5]) || !close(learning.fullGradient.b,0) || !same(learning.correctedUpdate.w,[1.5,1.25]) || !learning.correctedNextSeparated) fail('perceptron gradient/update oracle failed');

const mseSpec = getPart3FormulaLessonSpec('p3-perceptron-mse');
const mse = computePerceptronMse({ samples:mseSpec.samples, w:mseSpec.initialW, alpha:mseSpec.alpha });
if (!close(mse.loss,.775) || !close(mse.gradient[0],-2.6) || !close(mse.gradient[1],-.3) || !close(mse.lambdaMax,7) || !close(mse.alphaUpper,2/7) || !(mse.nextLoss<mse.loss)) fail('Part III MSE gradient/step-size oracle failed');

const xorSpec = getPart3FormulaLessonSpec('p3-xor-geometry');
const xor = computeXorGeometry(xorSpec);
if (!xor.allCorrect || xor.hiddenUnits!==2 || xor.nonInputUnits!==3) fail('XOR geometry/minimum-network oracle failed');

const mlpSpec = getPart3FormulaLessonSpec('p3-mlp-forward');
const mlp = computeMlpForward(mlpSpec);
if (!close(mlp.probabilitySum,1) || mlp.batchProbabilitySums.some((value)=>!close(value,1))) fail('MLP softmax normalization failed');
if (!same(mlp.shapes.W2,[3,2]) || !same(mlp.shapes.W3,[2,3]) || !same(mlp.shapes.X,[2,2]) || !same(mlp.shapes.Z2,[3,2]) || !same(mlp.shapes.Z3,[2,2])) fail('MLP corrected shape oracle failed');

const regularizationSpec = getPart3FormulaLessonSpec('p3-dropout-dropconnect');
const regularization = computeDropoutDropConnect(regularizationSpec);
if (!same(regularization.dropout,[0,0]) || !close(regularization.dropconnect[0],.75) || !close(regularization.dropconnect[1],1.2)) fail('DropOut/DropConnect mask oracle failed');

const convSpec = getPart3FormulaLessonSpec('p3-convolution-primitives');
const conv = computeConvolutionPrimitives(convSpec);
if (!conv.equivalent1d || !same(conv.first,[2,3,-2,0]) || !same(conv.support2d,[3,3])) fail('convolution definition/equivalence oracle failed');
if (!same(conv.twoD,[[1,2,0],[3,3,-2],[0,-3,-4]]) || !(conv.continuous>0)) fail('2D/continuous convolution oracle failed');

const exerciseSpec = getPart3FormulaLessonSpec('p3-convolution-exercises');
const exercise = computeConvolutionExercises(exerciseSpec);
const expectedFull=[[0,0,0,0,2,4,6],[0,0,0,0,1,2,3],[0,2,6,12,10,6,0],[0,1,3,6,5,3,0],[0,0,0,0,0,0,0]];
if (!same(exercise.mirrored,[[3,2,1],[6,4,2]]) || !same(exercise.output,expectedFull)) fail('source 2D convolution completion oracle failed');
if (!close(exercise.checkerResponse,1/9) || !close(exercise.reduction,100/3) || exercise.separableResidual>1e-12) fail('moving-average/separable oracle failed');

const boundarySpec = getPart3FormulaLessonSpec('p3-convolution-boundaries');
const boundary = computeBoundaryLesson(boundarySpec);
const expectedZero=[[4,2,0,0,0,0],[1,4,2,0,0,0],[0,1,4,2,0,0],[0,0,1,4,2,0],[0,0,0,1,4,2],[0,0,0,0,1,4]];
const expectedPeriodic=[[4,2,0,0,0,1],[1,4,2,0,0,0],[0,1,4,2,0,0],[0,0,1,4,2,0],[0,0,0,1,4,2],[2,0,0,0,1,4]];
if (!same(boundary.zeroMatrix,expectedZero) || !same(boundary.periodicMatrix,expectedPeriodic) || boundary.periodicResidual!==0) fail('boundary matrix/circular convolution oracle failed');
if (positiveMod(-1,6)!==5 || positiveMod(7,6)!==1) fail('modulo oracle failed');

const patchSpec = getPart3FormulaLessonSpec('p3-patch-cnn');
const patch = computePatchCnn(patchSpec);
if (!same(patch.Z,[[1,2,3],[2,3,4],[3,4,5]]) || !same(patch.g,[-2,-2,-2])) fail('patch extraction / g=Zh oracle failed');
if (patch.convOutputSpatial!==8 || patch.convParameters!==36928) fail('Conv2d shape/parameter oracle failed');
if (!same(patch.pooled.output,[[3,3,3],[3,3,2],[3,3,2]])) fail('MaxPool completion oracle failed');

const registryPath=requireFile('src/lib/formula-lessons/registry.mjs'); const registrySource=fs.existsSync(registryPath)?fs.readFileSync(registryPath,'utf8'):'';
for(const required of ["modern-ai-part3/formula-ledger.json",'getPart3ApprovedLessonOverride','part: 3']) if(!registrySource.includes(required)) fail(`registry missing Part III exact-ID wiring: ${required}`);
const hostPath=requireFile('src/components/post/formula-lessons/FormulaLessonHost.astro'); const hostSource=fs.existsSync(hostPath)?fs.readFileSync(hostPath,'utf8'):''; if(!hostSource.includes('getPart3FormulaLessonSpec')) fail('FormulaLessonHost does not resolve Part III exact specs');
const runtimePath=requireFile('src/scripts/formula-lesson-runtime.js'); const runtimeSource=fs.existsSync(runtimePath)?fs.readFileSync(runtimePath,'utf8'):''; if(!runtimeSource.includes('import.meta.glob')||!runtimeSource.includes("'toggle'")) fail('formula lesson runtime is not disclosure-lazy');

const renderers=[...new Set(approved.map((entry)=>entry.renderer))];
if(renderers.length!==10) fail(`Part III renderer count ${renderers.length} != 10`);
for(const renderer of renderers){const rendererPath=requireFile(`src/components/post/formula-lessons/renderers/${renderer}.svelte`); const source=fs.existsSync(rendererPath)?fs.readFileSync(rendererPath,'utf8'):''; if(!/@media\(max-width:|@media \(max-width:/.test(source))fail(`${renderer}: no mobile layout media query`);}

const distPath=path.join(root,'dist','posts','2026-08-20-modern-artificial-intelligence-3','index.html');
if(fs.existsSync(path.join(root,'dist'))){
 if(!fs.existsSync(distPath)) fail('Part III rendered article missing');
 else {const html=fs.readFileSync(distPath,'utf8'); const hostCount=(html.match(/data-formula-lesson(?:\s|>)/g)??[]).length; const approvedStateCount=(html.match(/data-formula-lesson-state="approved-(?:interactive|derivation|structure)"/g)??[]).length; const unreviewedStateCount=(html.match(/data-formula-lesson-state="unreviewed"/g)??[]).length; const missingStateCount=(html.match(/data-formula-lesson-state="missing"/g)??[]).length; if(hostCount!==99)fail(`Part III rendered exact lesson hosts ${hostCount} != 99`); if(approvedStateCount!==99)fail(`Part III rendered approved states ${approvedStateCount} != 99`); if(unreviewedStateCount!==0)fail(`Part III rendered unreviewed states ${unreviewedStateCount} != 0`); if(missingStateCount!==0)fail(`Part III rendered missing lesson states ${missingStateCount} != 0`); if(/data-formula-visual=|대표 예시로 y=x²|katex-error/.test(html))fail('Part III rendered retired/error visual residue');}
}

const unique=[...new Set(issues)].sort();
if(unique.length){console.error(`modern-ai-part3-lesson-audit: FAIL (${unique.length})`); for(const issue of unique)console.error(`- ${issue}`); process.exit(1);}
console.log('modern-ai-part3-lesson-audit: PASS (99 display formulas; 99 approved across 10 exact-ID lessons; 0 unreviewed; 0 missing; source/correction provenance preserved; numerical invariants; lazy mobile-safe renderers)');

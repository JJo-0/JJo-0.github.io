import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { APPROVED_FORMULA_IDS } from '../src/lib/formula-lessons/overrides.mjs';
import { FORMULA_LESSON_COUNTS, getFormulaLessonInventory } from '../src/lib/formula-lessons/registry.mjs';
import { getFormulaLessonSpec, getAllFormulaLessonSpecs } from '../src/lib/formula-lessons/lesson-specs.mjs';
import { computeDotProductPrediction } from '../src/lib/formula-lessons/dot-product.mjs';
import { computeLeastSquares, solveNormalEquation, approximatelyEqual } from '../src/lib/formula-lessons/least-squares.mjs';
import { computeWeightedResidualGradient, finiteDifferenceGradient } from '../src/lib/formula-lessons/residual-gradient.mjs';
import { computeSampleMatrixAssembly } from '../src/lib/formula-lessons/sample-matrix.mjs';
import { buildSyntheticRegressionDataset, computeGeneralizationRidge, fitRidgePolynomial, simulateExpectedGeneralizationGap } from '../src/lib/formula-lessons/generalization-ridge.mjs';
import { computeKFoldLesson } from '../src/lib/formula-lessons/kfold.mjs';
import { computeSvmKernelLesson } from '../src/lib/formula-lessons/svm-kernel.mjs';
import { computeMinimumDistanceLesson } from '../src/lib/formula-lessons/minimum-distance.mjs';
import { computeBayesLesson } from '../src/lib/formula-lessons/bayes.mjs';
import { computeGaussianHierarchy, gaussian1dDensity } from '../src/lib/formula-lessons/gaussian-discriminant.mjs';
import { computeNaiveBayes, dimensionGridCounts } from '../src/lib/formula-lessons/naive-dimension.mjs';
import { computeLinearAlgebraLesson, rank2, inverse2 } from '../src/lib/formula-lessons/linear-algebra-primitives.mjs';
import { computeEigenCovarianceLesson } from '../src/lib/formula-lessons/eigen-covariance.mjs';
import { computeProbabilityLesson } from '../src/lib/formula-lessons/probability-primitives.mjs';
import { computeOptimizationLesson, gradientDescent } from '../src/lib/formula-lessons/optimization-primitives.mjs';

const root=process.cwd(); const issues=[]; const inventory=getFormulaLessonInventory();
const fail=(m)=>issues.push(m); const close=(a,b,t=1e-8)=>approximatelyEqual(a,b,t);
function expectClose(a,b,label,t=1e-8){if(!close(a,b,t))fail(`${label}: expected ${b}, found ${a}`)}
function expectVector(a,b,label,t=1e-8){if(!Array.isArray(a)||a.length!==b.length){fail(`${label}: length mismatch`);return;}b.forEach((v,i)=>expectClose(a[i],v,`${label}[${i}]`,t));}
function requireFile(rel){const f=path.join(root,rel);if(!fs.existsSync(f))fail(`${rel}: missing`);return f;}

// Inventory must be fully triaged: no migration-only state remains.
if(FORMULA_LESSON_COUNTS.total!==303)fail(`inventory total ${FORMULA_LESSON_COUNTS.total} != 303`);
if(FORMULA_LESSON_COUNTS.part1!==238)fail(`Part I ${FORMULA_LESSON_COUNTS.part1} != 238`);
if(FORMULA_LESSON_COUNTS.part2!==65)fail(`Part II ${FORMULA_LESSON_COUNTS.part2} != 65`);
if(FORMULA_LESSON_COUNTS.approved!==108)fail(`approved ${FORMULA_LESSON_COUNTS.approved} != 108`);
if(FORMULA_LESSON_COUNTS.noVisual!==195)fail(`no-visual ${FORMULA_LESSON_COUNTS.noVisual} != 195`);
if(FORMULA_LESSON_COUNTS.unreviewed!==0)fail(`unreviewed formulas remain: ${FORMULA_LESSON_COUNTS.unreviewed}`);
if(new Set(APPROVED_FORMULA_IDS).size!==APPROVED_FORMULA_IDS.length)fail('approved formula IDs are duplicated');
if(getAllFormulaLessonSpecs().length!==16)fail(`expected 16 formula lesson groups, found ${getAllFormulaLessonSpecs().length}`);

const validStates=new Set(['approved-interactive','approved-derivation','approved-structure','no-visual-with-reason']);
for(const entry of inventory){
 if(!entry||!validStates.has(entry.state))fail(`${entry?.formulaId??'unknown'}: invalid migration state ${entry?.state}`);
 if(entry.state.startsWith('approved-')){
   if(!entry.renderer||!entry.lessonId||!entry.focus)fail(`${entry.formulaId}: approved lesson incomplete`);
   if(!getFormulaLessonSpec(entry.lessonId))fail(`${entry.formulaId}: missing spec ${entry.lessonId}`);
 }else{
   if(entry.renderer||entry.lessonId||entry.mode!=='none')fail(`${entry.formulaId}: no-visual item gained renderer metadata`);
   if(!entry.reason)fail(`${entry.formulaId}: no-visual state lacks reason`);
 }
}
const approvedFromInventory=inventory.filter((e)=>e?.renderer).map((e)=>e.formulaId).sort();
if(JSON.stringify(approvedFromInventory)!==JSON.stringify([...APPROVED_FORMULA_IDS].sort()))fail('approved inventory and override set differ');

// Existing six golden lessons remain numerically protected.
const dotSpec=getFormulaLessonSpec('p2-dot-product-prediction'); const dot=computeDotProductPrediction({x:dotSpec.x,w:dotSpec.initialW}); expectClose(dot.prediction,2.8,'dot prediction');
const normalSpec=getFormulaLessonSpec('p2-normal-equation'); const normal=computeLeastSquares({X:normalSpec.dataset.X,y:normalSpec.dataset.y,w:normalSpec.dataset.initialW}); const normalOpt=solveNormalEquation(normalSpec.dataset.X,normalSpec.dataset.y); expectClose(normal.mse,1.43,'normal initial mse'); expectVector(normalOpt.solution,[0.5,1.2],'normal solution');
const residualSpec=getFormulaLessonSpec('p2-residual-gradient'); const residualState={A:residualSpec.A,x:residualSpec.initialX,y:residualSpec.y,weights:residualSpec.weights}; const grad=computeWeightedResidualGradient(residualState); expectVector(finiteDifferenceGradient(residualState),grad.gradient,'residual finite-difference',1e-5);
const sampleSpec=getFormulaLessonSpec('p2-sample-matrix-assembly'); const sample=computeSampleMatrixAssembly({samples:sampleSpec.samples,targets:sampleSpec.targets,weights:sampleSpec.weights}); expectClose(sample.samplewiseObjective,sample.stackedResidualNormSquared,'sample/stacked objective');
const genSpec=getFormulaLessonSpec('p2-generalization-gap'); const ds=buildSyntheticRegressionDataset(genSpec.dataset); const gen=computeGeneralizationRidge({dataset:ds,degree:genSpec.degree,lambda:0}).unregularized; const expectation=simulateExpectedGeneralizationGap({...genSpec.expectation,degree:genSpec.degree,lambda:0}); expectClose(gen.testSse/ds.test.x.length,gen.testMse,'test SSE/M'); if(!(expectation.expectedGap>0&&expectation.reversalCount>0&&expectation.reversalCount<expectation.trials))fail('generalization repeated-experiment invariant failed');
const ridgeSpec=getFormulaLessonSpec('p2-ridge-regularization'); const ridge=fitRidgePolynomial({x:ridgeSpec.trainX,y:ridgeSpec.trainY,degree:ridgeSpec.degree,lambda:ridgeSpec.lambdaGrid[ridgeSpec.defaultLambdaIndex]}); expectClose(ridge.objective,ridge.mse+ridge.penalty,'ridge decomposition');

// K-fold is deliberately a section concept because the source has no display formula ID.
const kfold=computeKFoldLesson({sampleCount:10,foldCount:5,foldErrors:[.12,.18,.10,.16,.14]}); if(!kfold.allSamplesTestedOnce||!kfold.allSplitsDisjoint)fail('K-fold partition invariant failed'); expectClose(kfold.meanError,.14,'K-fold mean error');

// Part II completed lesson families.
const svmSpec=getFormulaLessonSpec('p2-svm-kernel'); const svm=computeSvmKernelLesson({query:svmSpec.query,supportVectors:svmSpec.supportVectors,alphas:svmSpec.alphas,bias:svmSpec.bias,sigma:svmSpec.sigma}); expectClose(svm.featureIdentity.explicitDot,svm.featureIdentity.kernelValue,'kernel feature identity'); if(!(svm.sigmoidAtLinearScore>0&&svm.sigmoidAtLinearScore<1))fail('sigmoid range invariant failed');
const mdSpec=getFormulaLessonSpec('p2-minimum-distance'); const md=computeMinimumDistanceLesson({classes:mdSpec.classes,query:mdSpec.query}); if(md.predictedByDistance!==md.predictedByDiscriminant)fail('minimum-distance/discriminant decisions disagree'); expectClose(md.boundary.midpointResidual,0,'perpendicular-bisector midpoint');
const bayesSpec=getFormulaLessonSpec('p2-bayes-decision'); const bayes=computeBayesLesson({likelihoods:bayesSpec.likelihoods,priors:bayesSpec.priors,lossMatrix:bayesSpec.lossMatrix}); expectClose(bayes.posteriorSum,1,'posterior sum'); if(bayes.mapClass!==bayes.zeroOne.bestAction)fail('0-1 Bayes decision must equal MAP');
const gaussSpec=getFormulaLessonSpec('p2-gaussian-discriminant'); const gaussian=computeGaussianHierarchy({x:gaussSpec.x,means:gaussSpec.means,covariances:gaussSpec.covariances,sharedCovariance:gaussSpec.sharedCovariance,priors:gaussSpec.priors}); expectClose(gaussian.identityOffsets[0],gaussian.identityOffsets[1],'identity LDA/min-distance common offset'); if(!(gaussian1dDensity(gaussSpec.oneDim.x,gaussSpec.oneDim.means[0],gaussSpec.oneDim.sigmas[0])>0))fail('corrected 1D Gaussian density invalid');
const naiveSpec=getFormulaLessonSpec('p2-naive-bayes'); const naive=computeNaiveBayes({featureLikelihoods:naiveSpec.featureLikelihoods,priors:naiveSpec.priors}); expectClose(naive.posteriorSum,1,'Naive Bayes posterior sum');
const dimSpec=getFormulaLessonSpec('p2-dimension-growth'); const growth=dimensionGridCounts({resolution:dimSpec.resolution,maxDimension:dimSpec.maxDimension}); if(JSON.stringify(growth.slice(0,3).map(x=>x.points))!==JSON.stringify([5,25,125]))fail('dimension-growth Figure 5 reconstruction failed');

// Part I reusable primitives.
const laSpec=getFormulaLessonSpec('p1-linear-algebra-primitives'); const la=computeLinearAlgebraLesson({x:laSpec.x,y:laSpec.y,A:laSpec.A,B:laSpec.B}); expectClose(la.dot,1,'Part I dot'); if(JSON.stringify(la.AB)!==JSON.stringify(la.outerSum))fail('AB outer-sum identity failed'); if(rank2([[1,2],[2,4]])!==1)fail('rank oracle failed'); if(!inverse2(laSpec.A))fail('inverse oracle unexpectedly singular');
const ecSpec=getFormulaLessonSpec('p1-eigen-covariance'); const ec=computeEigenCovarianceLesson({A:ecSpec.A,x:ecSpec.x,points:ecSpec.points}); expectClose(ec.traceEigenResidual,0,'trace/eigen identity'); expectClose(ec.detEigenResidual,0,'det/eigen identity'); expectClose(ec.covariance.covariance[0][1],ec.covariance.covariance[1][0],'covariance symmetry');
const probSpec=getFormulaLessonSpec('p1-probability-primitives'); const prob=computeProbabilityLesson({values:probSpec.values,probabilities:probSpec.probabilities,joint:probSpec.joint,conditionedColumn:probSpec.conditionedColumn}); expectClose(prob.conditionalSum,1,'conditional distribution normalization'); if(prob.variance<0)fail('variance negative');
const optSpec=getFormulaLessonSpec('p1-optimization-primitives'); const opt=computeOptimizationLesson({initial:optSpec.initial,curvature:optSpec.curvature,alpha:optSpec.alpha,steps:optSpec.steps,sampleGradients:optSpec.sampleGradients,batchIndices:optSpec.batchIndices}); if(!opt.stableForQuadratic)fail('stable optimization example outside stability bound'); const unstable=gradientDescent({initial:optSpec.initial,curvature:optSpec.curvature,alpha:optSpec.unstableExample,steps:optSpec.steps}); if(!(unstable.at(-1).value>unstable[0].value))fail('unstable learning-rate example did not diverge');

// Source-suspect/corrected variants must stay separate approved refs.
for(const [sourceId,correctedId] of [['MAI-P2-087','MAI-P2-088'],['MAI-P2-102','MAI-P2-103'],['MAI-P2-066','MAI-P2-067'],['MAI-P2-075','MAI-P2-076']]){
 const source=inventory.find(e=>e.formulaId===sourceId); const corrected=inventory.find(e=>e.formulaId===correctedId);
 if(!source?.state||!corrected?.state||source.focus===corrected.focus)fail(`${sourceId}/${correctedId}: source/corrected states collapsed`);
}

const rendererNames=[...new Set(inventory.filter(e=>e?.renderer).map(e=>e.renderer))];
const rendererDir='src/components/post/formula-lessons/renderers';
for(const name of rendererNames)requireFile(`${rendererDir}/${name}.svelte`);
const runtime=requireFile('src/scripts/formula-lesson-runtime.js'); const runtimeSource=fs.existsSync(runtime)?fs.readFileSync(runtime,'utf8'):''; if(!runtimeSource.includes('import.meta.glob')||!runtimeSource.includes("'toggle'"))fail('formula runtime is not disclosure-lazy dynamic import');
requireFile('src/components/post/KFoldConceptLesson.astro');
const part2Article=requireFile('site/content/posts/modern-artificial-intelligence-2.mdx'); const part2Source=fs.existsSync(part2Article)?fs.readFileSync(part2Article,'utf8'):''; if(!part2Source.includes("import KFoldConceptLesson from '@/components/post/KFoldConceptLesson.astro';")||!part2Source.includes('<KFoldConceptLesson />'))fail('Part II K-fold section concept lesson is not mounted');
for(const retired of ['src/components/post/FormulaVisual.astro','src/scripts/formula-visual-runtime.js','scripts/modern-ai-visual-lab-audit.mjs'])if(fs.existsSync(path.join(root,retired)))fail(`retired generic visual remains: ${retired}`);

// Rendered/mobile-safe gates after build.
if(fs.existsSync(path.join(root,'dist'))){
 const routes=[['Part I','dist/posts/2025-05-16-mordern-artificial-intelligence/index.html',44],['Part II','dist/posts/2026-08-18-modern-artificial-intelligence-2/index.html',64]];
 for(const [label,rel,expected] of routes){const f=requireFile(rel);if(!fs.existsSync(f))continue;const html=fs.readFileSync(f,'utf8');const count=(html.match(/data-formula-lesson(?:\s|>)/g)||[]).length;if(count!==expected)fail(`${label}: formula lesson hosts ${count} != ${expected}`);if(/data-formula-visual=|대표 예시로 y=x²|katex-error/.test(html))fail(`${label}: retired/error visual residue`);}
 const p2=path.join(root,'dist/posts/2026-08-18-modern-artificial-intelligence-2/index.html'); if(fs.existsSync(p2)){const html=fs.readFileSync(p2,'utf8');if((html.match(/data-concept-lesson="p2-kfold-cross-validation"/g)||[]).length!==1)fail('rendered K-fold concept lesson missing/duplicated');}
 const mobileReviewedRenderers=['SvmKernelLesson','MinimumDistanceLesson','BayesDecisionLesson','GaussianDiscriminantLesson','NaiveBayesLesson','DimensionGrowthLesson','LinearAlgebraPrimitivesLesson','EigenCovarianceLesson','ProbabilityPrimitivesLesson','OptimizationPrimitivesLesson']; for(const name of mobileReviewedRenderers){const source=fs.readFileSync(path.join(root,rendererDir,`${name}.svelte`),'utf8');if(!/@media\(max-width:|@media \(max-width:/.test(source))fail(`${name}: no mobile layout media query`);}
}

if(issues.length){console.error(`modern-ai-formula-lesson-audit: FAIL (${issues.length})`);for(const issue of [...new Set(issues)].sort())console.error(`- ${issue}`);process.exit(1);}
console.log(`modern-ai-formula-lesson-audit: PASS (${FORMULA_LESSON_COUNTS.total} inventoried; ${FORMULA_LESSON_COUNTS.approved} approved across ${getAllFormulaLessonSpecs().length} exact-ID lessons; ${FORMULA_LESSON_COUNTS.noVisual} explicit no-visual; 0 unreviewed; K-fold section lesson; mobile-safe lazy renderers)`);

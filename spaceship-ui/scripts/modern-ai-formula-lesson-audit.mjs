import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import {
  APPROVED_FORMULA_IDS,
  getApprovedLessonOverride,
} from '../src/lib/formula-lessons/overrides.mjs';
import { getFormulaLessonSpec } from '../src/lib/formula-lessons/specs.mjs';
import { computeDotProductPrediction } from '../src/lib/formula-lessons/dot-product.mjs';
import {
  buildSyntheticRegressionDataset,
  computeGeneralizationRidge,
  fitRidgePolynomial,
  simulateExpectedGeneralizationGap,
} from '../src/lib/formula-lessons/generalization-ridge.mjs';
import {
  approximatelyEqual,
  computeLeastSquares,
  solveNormalEquation,
} from '../src/lib/formula-lessons/least-squares.mjs';
import {
  computeScalarSquaredResidual,
  computeWeightedResidualGradient,
  finiteDifferenceGradient,
} from '../src/lib/formula-lessons/residual-gradient.mjs';
import { computeSampleMatrixAssembly } from '../src/lib/formula-lessons/sample-matrix.mjs';

const root = process.cwd();
const issues = [];
const part1Ledger = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts/modern-ai-formula-hashes.json'), 'utf8'),
);
const part2Ledger = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/modern-ai-part2/formula-ledger.json'), 'utf8'),
);

const displayFormulas = [
  ...part1Ledger.formulas.map((formula) => ({
    formulaId: formula.id,
    part: 1,
    sourceStatus: 'source-exact',
  })),
  ...part2Ledger.formulas
    .filter((formula) => formula.display === 'display')
    .map((formula) => ({
      formulaId: formula.formulaId,
      part: 2,
      sourceStatus: formula.status,
      pdfPage: formula.pdfPage,
      articleSection: formula.articleSection,
    })),
];

const inventory = displayFormulas.map((source) => {
  const override = getApprovedLessonOverride(source.formulaId);
  return override
    ? { formulaId: source.formulaId, ...override, source }
    : {
        formulaId: source.formulaId,
        lessonId: null,
        focus: null,
        state: 'unreviewed',
        mode: 'none',
        renderer: null,
        source,
      };
});

const counts = {
  total: displayFormulas.length,
  part1: displayFormulas.filter((formula) => formula.part === 1).length,
  part2: displayFormulas.filter((formula) => formula.part === 2).length,
  approved: APPROVED_FORMULA_IDS.length,
};

function fail(message) {
  issues.push(message);
}

function expectClose(actual, expected, label, tolerance = 1e-9) {
  if (!approximatelyEqual(actual, expected, tolerance)) {
    fail(`${label}: expected ${expected}, found ${actual}`);
  }
}

function expectVector(actual, expected, label, tolerance = 1e-9) {
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    fail(`${label}: vector length mismatch`);
    return;
  }
  expected.forEach((value, index) => {
    expectClose(actual[index], value, `${label}[${index}]`, tolerance);
  });
}

function expectMatrix(actual, expected, label, tolerance = 1e-9) {
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    fail(`${label}: matrix row count mismatch`);
    return;
  }
  expected.forEach((row, rowIndex) => {
    expectVector(actual[rowIndex], row, `${label}[${rowIndex}]`, tolerance);
  });
}

if (counts.total !== 303) fail(`Expected 303 display formulas, found ${counts.total}`);
if (counts.part1 !== 238) fail(`Expected 238 Part I display formulas, found ${counts.part1}`);
if (counts.part2 !== 65) fail(`Expected 65 Part II display formulas, found ${counts.part2}`);
if (counts.approved !== 18) fail(`Expected 18 approved formulas, found ${counts.approved}`);

const ids = inventory.map((entry) => entry.formulaId);
if (ids.some((id) => !id)) fail('Inventory contains a missing formula ID');
if (new Set(ids).size !== ids.length) fail('Inventory contains duplicate formula IDs');

for (const entry of inventory) {
  if (entry.state === 'unreviewed') {
    if (entry.renderer !== null || entry.mode !== 'none' || entry.lessonId !== null) {
      fail(`${entry.formulaId}: unreviewed formula must not render a lesson`);
    }
    continue;
  }
  if (!entry.renderer || !entry.lessonId || !entry.focus) {
    fail(`${entry.formulaId}: approved lesson is incomplete`);
  }
  if (!getFormulaLessonSpec(entry.lessonId)) {
    fail(`${entry.formulaId}: missing lesson spec ${entry.lessonId}`);
  }
}

const actualApproved = inventory
  .filter((entry) => entry.renderer)
  .map((entry) => entry.formulaId)
  .sort();
const expectedApproved = [...APPROVED_FORMULA_IDS].sort();
if (JSON.stringify(actualApproved) !== JSON.stringify(expectedApproved)) {
  fail(`Approved formula set changed: ${actualApproved.join(', ')}`);
}

const dotProductSpec = getFormulaLessonSpec('p2-dot-product-prediction');
if (!dotProductSpec) {
  fail('Dot-product prediction lesson spec is missing');
} else {
  const result = computeDotProductPrediction({
    x: dotProductSpec.x,
    w: dotProductSpec.initialW,
  });
  expectVector(result.contributions, [1.2, 0.6, 1], 'dot contributions');
  expectClose(result.prediction, 2.8, 'dot prediction');
  if (result.cosine < -1 - 1e-12 || result.cosine > 1 + 1e-12) {
    fail('Dot-product cosine invariant violated');
  }
}

const normalEquationSpec = getFormulaLessonSpec('p2-normal-equation');
if (!normalEquationSpec) {
  fail('Normal-equation lesson spec is missing');
} else {
  const initial = computeLeastSquares({
    X: normalEquationSpec.dataset.X,
    y: normalEquationSpec.dataset.y,
    w: normalEquationSpec.dataset.initialW,
  });
  const optimum = solveNormalEquation(
    normalEquationSpec.dataset.X,
    normalEquationSpec.dataset.y,
  );
  const optimumState = computeLeastSquares({
    X: normalEquationSpec.dataset.X,
    y: normalEquationSpec.dataset.y,
    w: optimum.solution,
  });

  expectVector(initial.prediction, [0.2, 0.9, 1.6, 2.3], 'normal prediction');
  expectVector(initial.residual, [-0.3, -0.9, -1.1, -1.9], 'normal residual');
  expectClose(initial.mse, 1.43, 'normal initial MSE');
  expectMatrix(initial.gram, [[4, 6], [6, 14]], 'normal Gram');
  expectVector(initial.rhs, [9.2, 19.8], 'normal rhs');
  expectVector(initial.gradient, [-2.1, -4.4], 'normal gradient');
  expectVector(optimum.solution, [0.5, 1.2], 'normal solution');
  expectClose(optimumState.mse, 0.015, 'normal optimum MSE');
  if (Math.hypot(...optimumState.gradient) > 1e-9) {
    fail('Normal-equation optimum gradient is not zero');
  }
  if (initial.mse < 0 || optimumState.mse < 0) fail('MSE invariant violated');
}

const residualSpec = getFormulaLessonSpec('p2-residual-gradient');
if (!residualSpec) {
  fail('Residual-gradient lesson spec is missing');
} else {
  const state = {
    A: residualSpec.A,
    x: residualSpec.initialX,
    y: residualSpec.y,
    weights: residualSpec.weights,
  };
  const result = computeWeightedResidualGradient(state);
  const finiteDifference = finiteDifferenceGradient(state);
  const scalar = computeScalarSquaredResidual(residualSpec.scalarExample);

  expectVector(result.prediction, [0, -0.6], 'residual prediction');
  expectVector(result.residual, [-1.2, -0.1], 'residual vector');
  expectVector(result.weightedResidual, [-1.2, -0.2], 'weighted residual');
  expectClose(result.loss, 1.46, 'weighted residual loss');
  expectVector(result.gradient, [-2, -5.2], 'weighted gradient');
  expectMatrix(result.hessian, [[6, 0], [0, 12]], 'weighted Hessian');
  expectVector(finiteDifference, result.gradient, 'finite-difference gradient', 1e-5);
  expectClose(scalar.prediction, 0.6, 'scalar prediction');
  expectClose(scalar.residual, -0.5, 'scalar residual');
  expectClose(scalar.loss, 0.25, 'scalar loss');
  expectClose(scalar.derivative, -1.5, 'scalar derivative');
}

const sampleSpec = getFormulaLessonSpec('p2-sample-matrix-assembly');
if (!sampleSpec) {
  fail('Sample-matrix lesson spec is missing');
} else {
  const result = computeSampleMatrixAssembly({
    samples: sampleSpec.samples,
    targets: sampleSpec.targets,
    weights: sampleSpec.weights,
  });
  expectMatrix(result.outerProducts[0], [[1, 0], [0, 0]], 'first outer product');
  expectMatrix(result.runningGram[1], [[2, 1], [1, 1]], 'running Gram after two samples');
  expectMatrix(result.XtX, [[4, 6], [6, 14]], 'assembled X transpose X');
  expectVector(result.prediction, [0.2, 0.9, 1.6, 2.3], 'assembled prediction');
  expectClose(result.samplewiseObjective, 5.72, 'samplewise objective');
  expectClose(result.stackedResidualNormSquared, 5.72, 'stacked residual norm');
  expectClose(
    result.samplewiseObjective,
    result.stackedResidualNormSquared,
    'samplewise/stacked equivalence',
  );
}

const generalizationSpec = getFormulaLessonSpec('p2-generalization-gap');
if (!generalizationSpec) {
  fail('Generalization-gap lesson spec is missing');
} else {
  const dataset = buildSyntheticRegressionDataset(generalizationSpec.dataset);
  const result = computeGeneralizationRidge({
    dataset,
    degree: generalizationSpec.degree,
    lambda: 0,
  }).unregularized;
  const expectation = simulateExpectedGeneralizationGap({
    ...generalizationSpec.expectation,
    degree: generalizationSpec.degree,
    lambda: 0,
  });

  expectClose(result.mse, 0.009892040403466402, 'generalization train MSE', 1e-7);
  expectClose(result.testMse, 0.03764395558966108, 'generalization test MSE', 1e-7);
  expectClose(result.generalizationGap, 0.027751915186194673, 'single-split gap', 1e-7);
  expectClose(
    result.testSse / dataset.test.x.length,
    result.testMse,
    'test SSE divided by M',
  );
  expectClose(
    expectation.expectedTrainError,
    0.0186428859039623,
    'expected train error illustration',
    1e-7,
  );
  expectClose(
    expectation.expectedTestError,
    0.045828974413009926,
    'expected test error illustration',
    1e-7,
  );
  if (expectation.expectedGap <= 0) fail('Expected generalization gap is not positive');
  if (expectation.reversalCount <= 0 || expectation.reversalCount >= expectation.trials) {
    fail('Generalization illustration must include both ordinary and reversed individual splits');
  }
}

const ridgeSpec = getFormulaLessonSpec('p2-ridge-regularization');
if (!ridgeSpec) {
  fail('Ridge-regularization lesson spec is missing');
} else {
  const exactLine = fitRidgePolynomial({
    x: [-1, 0, 1],
    y: [0, 1, 2],
    degree: 1,
    lambda: 1,
  });
  expectVector(exactLine.weights, [0.5, 0.4], 'ridge oracle weights', 1e-9);
  expectClose(exactLine.mse, 0.49, 'ridge oracle MSE');
  expectClose(exactLine.weightNormSquared, 0.41, 'ridge oracle norm');
  expectClose(exactLine.penalty, 0.41, 'ridge oracle penalty');
  expectClose(exactLine.objective, 0.9, 'ridge oracle objective');

  const unregularized = fitRidgePolynomial({
    x: ridgeSpec.trainX,
    y: ridgeSpec.trainY,
    degree: ridgeSpec.degree,
    lambda: 0,
  });
  const balanced = fitRidgePolynomial({
    x: ridgeSpec.trainX,
    y: ridgeSpec.trainY,
    degree: ridgeSpec.degree,
    lambda: ridgeSpec.lambdaGrid[ridgeSpec.defaultLambdaIndex],
  });
  const strong = fitRidgePolynomial({
    x: ridgeSpec.trainX,
    y: ridgeSpec.trainY,
    degree: ridgeSpec.degree,
    lambda: 1,
  });

  if (unregularized.mse > 1e-18) fail('Degree-9 unregularized example should interpolate its 10 points');
  expectClose(balanced.mse, 0.00006526136424026325, 'balanced ridge MSE', 1e-8);
  expectClose(balanced.weightNormSquared, 1.0139516542058808, 'balanced ridge norm', 1e-7);
  expectClose(balanced.objective, 0.001079213018446144, 'balanced ridge objective', 1e-8);
  if (!(balanced.weightNormSquared < unregularized.weightNormSquared)) {
    fail('Positive lambda did not shrink the coefficient norm');
  }
  if (!(strong.weightNormSquared < balanced.weightNormSquared)) {
    fail('Larger lambda did not further shrink the coefficient norm');
  }
  expectClose(balanced.objective, balanced.mse + balanced.penalty, 'ridge objective decomposition');
}

const guidePath = path.join(root, 'src/components/post/FormulaGuide.astro');
const hostPath = path.join(root, 'src/components/post/formula-lessons/FormulaLessonHost.astro');
const runtimePath = path.join(root, 'src/scripts/formula-lesson-runtime.js');
const rendererPaths = [
  'DotProductPredictionLesson.svelte',
  'NormalEquationLesson.svelte',
  'ResidualGradientLesson.svelte',
  'SampleMatrixAssemblyLesson.svelte',
  'GeneralizationGapLesson.svelte',
  'RidgeRegularizationLesson.svelte',
].map((name) =>
  path.join(root, 'src/components/post/formula-lessons/renderers', name),
);
for (const file of [guidePath, hostPath, runtimePath, ...rendererPaths]) {
  if (!fs.existsSync(file)) fail(`${path.relative(root, file)} is missing`);
}

if (fs.existsSync(guidePath)) {
  const source = fs.readFileSync(guidePath, 'utf8');
  if (!source.includes('getFormulaLessonRef(formulaId)')) {
    fail('FormulaGuide does not use the exact-ID lesson registry');
  }
  if (!source.includes('<FormulaLessonHost lesson={lessonRef} />')) {
    fail('FormulaGuide does not render the approved lesson host');
  }
  if (source.includes('FormulaVisual')) {
    fail('FormulaGuide still imports the generic family visualization');
  }
}

if (fs.existsSync(runtimePath)) {
  const source = fs.readFileSync(runtimePath, 'utf8');
  if (!source.includes('import.meta.glob')) fail('Formula lesson runtime is not dynamically chunked');
  if (!source.includes("'toggle'")) fail('Formula lesson runtime is not lazy on disclosure open');
  if (source.includes('generic') || source.includes('y=x²')) {
    fail('Generic fallback visualization remains in formula lesson runtime');
  }
}

const retiredPaths = [
  'src/components/post/FormulaVisual.astro',
  'src/scripts/formula-visual-runtime.js',
  'scripts/modern-ai-visual-lab-audit.mjs',
];
for (const retiredPath of retiredPaths) {
  if (fs.existsSync(path.join(root, retiredPath))) {
    fail(`Retired generic visual file remains: ${retiredPath}`);
  }
}

const builtPages = [
  [
    'Part I',
    path.join(root, 'dist/posts/2025-05-16-mordern-artificial-intelligence/index.html'),
    0,
  ],
  [
    'Part II',
    path.join(root, 'dist/posts/2026-08-18-modern-artificial-intelligence-2/index.html'),
    18,
  ],
];

if (fs.existsSync(path.join(root, 'dist'))) {
  for (const [label, file, expectedLessons] of builtPages) {
    if (!fs.existsSync(file)) {
      fail(`${label} built route is missing`);
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');
    const lessonCount = (html.match(/data-formula-lesson(?:\s|>)/g) || []).length;
    if (lessonCount !== expectedLessons) {
      fail(`${label}: expected ${expectedLessons} approved lesson hosts, found ${lessonCount}`);
    }
    if (/data-formula-visual=|Direct manipulation visual|대표 예시로 y=x²/.test(html)) {
      fail(`${label}: retired generic visualization markup remains`);
    }
    if (/katex-error/.test(html)) fail(`${label}: KaTeX rendering error detected`);
  }
}

if (issues.length) {
  console.error('modern-ai-formula-lesson-audit: FAIL');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `modern-ai-formula-lesson-audit: PASS (${counts.total} inventoried; ${counts.approved} approved across six exact-ID lessons; unreviewed formulas render no visual)`,
);

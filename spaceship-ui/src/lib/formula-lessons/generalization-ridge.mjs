const EPSILON = 1e-11;

function assertFiniteNumber(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be a finite number`);
}

function assertPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${label} must be a positive integer`);
  }
}

function assertVector(vector, label) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new TypeError(`${label} must be a non-empty vector`);
  }
  vector.forEach((value, index) => assertFiniteNumber(value, `${label}[${index}]`));
}

function dot(left, right) {
  if (left.length !== right.length) {
    throw new RangeError(`dot(): dimension mismatch ${left.length} !== ${right.length}`);
  }
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function mean(values) {
  assertVector(values, 'values');
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function createSeededRandom(seed) {
  let state = Number(seed) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleStandardNormal(random) {
  let first = 0;
  let second = 0;
  while (first <= Number.EPSILON) first = random();
  while (second <= Number.EPSILON) second = random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

export function evaluateQuadratic(x, coefficients) {
  assertFiniteNumber(x, 'x');
  assertVector(coefficients, 'coefficients');
  if (coefficients.length !== 3) {
    throw new RangeError('evaluateQuadratic(): coefficients must contain [a0, a1, a2]');
  }
  return coefficients[0] + coefficients[1] * x + coefficients[2] * x ** 2;
}

export function chebyshevFeatures(x, degree) {
  assertFiniteNumber(x, 'x');
  if (!Number.isInteger(degree) || degree < 0) {
    throw new TypeError('degree must be a non-negative integer');
  }

  const features = [1];
  if (degree === 0) return features;
  features.push(x);
  for (let order = 2; order <= degree; order += 1) {
    features.push(2 * x * features[order - 1] - features[order - 2]);
  }
  return features;
}

export function buildPolynomialDesignMatrix(xs, degree) {
  assertVector(xs, 'xs');
  return xs.map((value) => chebyshevFeatures(value, degree));
}

function solveUpperTriangular(matrix, vector) {
  const size = matrix.length;
  const solution = Array(size).fill(0);
  for (let row = size - 1; row >= 0; row -= 1) {
    const diagonal = matrix[row][row];
    if (Math.abs(diagonal) < EPSILON) {
      throw new RangeError('solveUpperTriangular(): singular or nearly singular matrix');
    }
    let remainder = vector[row];
    for (let column = row + 1; column < size; column += 1) {
      remainder -= matrix[row][column] * solution[column];
    }
    solution[row] = remainder / diagonal;
  }
  return solution;
}

/**
 * Modified Gram-Schmidt least-squares solver for a tall full-rank matrix.
 * It avoids squaring the condition number through X^T X for the unregularized fit.
 */
export function solveLeastSquaresQr(matrix, vector) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new TypeError('matrix must be a non-empty matrix');
  }
  assertVector(vector, 'vector');
  const rows = matrix.length;
  const columns = matrix[0].length;
  if (rows < columns) throw new RangeError('solveLeastSquaresQr(): matrix must be tall or square');
  if (vector.length !== rows) throw new RangeError('solveLeastSquaresQr(): row count mismatch');
  matrix.forEach((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== columns) {
      throw new TypeError(`matrix[${rowIndex}] must have ${columns} columns`);
    }
    row.forEach((value, columnIndex) => {
      assertFiniteNumber(value, `matrix[${rowIndex}][${columnIndex}]`);
    });
  });

  const qColumns = [];
  const upper = Array.from({ length: columns }, () => Array(columns).fill(0));

  for (let column = 0; column < columns; column += 1) {
    const working = matrix.map((row) => row[column]);
    for (let previous = 0; previous < column; previous += 1) {
      const projection = dot(qColumns[previous], working);
      upper[previous][column] = projection;
      for (let row = 0; row < rows; row += 1) {
        working[row] -= projection * qColumns[previous][row];
      }
    }

    const norm = Math.hypot(...working);
    if (norm < EPSILON) {
      throw new RangeError('solveLeastSquaresQr(): design matrix is rank deficient');
    }
    upper[column][column] = norm;
    qColumns.push(working.map((value) => value / norm));
  }

  const projected = qColumns.map((column) => dot(column, vector));
  return solveUpperTriangular(upper, projected);
}

export function predictPolynomial(weights, xs) {
  assertVector(weights, 'weights');
  assertVector(xs, 'xs');
  const degree = weights.length - 1;
  return xs.map((value) => dot(chebyshevFeatures(value, degree), weights));
}

export function calculateMse(prediction, target) {
  assertVector(prediction, 'prediction');
  assertVector(target, 'target');
  if (prediction.length !== target.length) {
    throw new RangeError('calculateMse(): prediction and target lengths differ');
  }
  const squaredResidual = prediction.map((value, index) => (value - target[index]) ** 2);
  const sse = squaredResidual.reduce((sum, value) => sum + value, 0);
  return { squaredResidual, sse, mse: sse / prediction.length };
}

export function fitRidgePolynomial({ x, y, degree, lambda }) {
  assertVector(x, 'x');
  assertVector(y, 'y');
  if (x.length !== y.length) throw new RangeError('fitRidgePolynomial(): x and y lengths differ');
  if (!Number.isInteger(degree) || degree < 0) {
    throw new TypeError('degree must be a non-negative integer');
  }
  assertFiniteNumber(lambda, 'lambda');
  if (lambda < 0) throw new RangeError('lambda must be non-negative');

  const design = buildPolynomialDesignMatrix(x, degree);
  const parameterCount = degree + 1;
  const augmentedDesign = design.map((row) => [...row]);
  const augmentedTarget = [...y];

  if (lambda > 0) {
    const ridgeScale = Math.sqrt(x.length * lambda);
    for (let index = 0; index < parameterCount; index += 1) {
      const row = Array(parameterCount).fill(0);
      row[index] = ridgeScale;
      augmentedDesign.push(row);
      augmentedTarget.push(0);
    }
  }

  const weights = solveLeastSquaresQr(augmentedDesign, augmentedTarget);
  const prediction = design.map((row) => dot(row, weights));
  const residual = prediction.map((value, index) => value - y[index]);
  const { squaredResidual, sse, mse } = calculateMse(prediction, y);
  const weightNormSquared = weights.reduce((sum, value) => sum + value ** 2, 0);
  const penalty = lambda * weightNormSquared;

  return {
    degree,
    lambda,
    weights,
    prediction,
    residual,
    squaredResidual,
    sse,
    mse,
    weightNormSquared,
    penalty,
    objective: mse + penalty,
    highOrderEnergy: weights
      .slice(3)
      .reduce((sum, value, index) => sum + (index + 3) ** 2 * value ** 2, 0),
  };
}

export function buildSyntheticRegressionDataset({
  seed,
  trainSize,
  testSize,
  noiseStd,
  trueCoefficients,
}) {
  assertFiniteNumber(seed, 'seed');
  assertPositiveInteger(trainSize, 'trainSize');
  assertPositiveInteger(testSize, 'testSize');
  assertFiniteNumber(noiseStd, 'noiseStd');
  if (noiseStd < 0) throw new RangeError('noiseStd must be non-negative');
  assertVector(trueCoefficients, 'trueCoefficients');

  const random = createSeededRandom(seed);
  const sample = (size) => {
    const rows = Array.from({ length: size }, () => {
      const x = random() * 2 - 1;
      const truth = evaluateQuadratic(x, trueCoefficients);
      const y = truth + noiseStd * sampleStandardNormal(random);
      return { x, y, truth };
    }).sort((left, right) => left.x - right.x);
    return {
      x: rows.map((row) => row.x),
      y: rows.map((row) => row.y),
      truth: rows.map((row) => row.truth),
    };
  };

  const train = sample(trainSize);
  const test = sample(testSize);
  return { train, test, noiseStd, trueCoefficients: [...trueCoefficients] };
}

function evaluateFitOnTest(fit, test) {
  const prediction = predictPolynomial(fit.weights, test.x);
  const residual = prediction.map((value, index) => value - test.y[index]);
  const { squaredResidual, sse, mse } = calculateMse(prediction, test.y);
  return {
    ...fit,
    testPrediction: prediction,
    testResidual: residual,
    testSquaredResidual: squaredResidual,
    testSse: sse,
    testMse: mse,
    generalizationGap: mse - fit.mse,
  };
}

export function computeGeneralizationRidge({ dataset, degree, lambda }) {
  if (!dataset?.train || !dataset?.test) {
    throw new TypeError('dataset must contain train and test splits');
  }
  const unregularized = evaluateFitOnTest(
    fitRidgePolynomial({
      x: dataset.train.x,
      y: dataset.train.y,
      degree,
      lambda: 0,
    }),
    dataset.test,
  );
  const ridge = evaluateFitOnTest(
    fitRidgePolynomial({
      x: dataset.train.x,
      y: dataset.train.y,
      degree,
      lambda,
    }),
    dataset.test,
  );
  return { unregularized, ridge };
}

export function simulateExpectedGeneralizationGap({
  seed,
  trials,
  trainSize,
  testSize,
  noiseStd,
  trueCoefficients,
  degree,
  lambda = 0,
}) {
  assertPositiveInteger(trials, 'trials');
  const trainErrors = [];
  const testErrors = [];

  for (let trial = 0; trial < trials; trial += 1) {
    const trialSeed = (Number(seed) + Math.imul(trial + 1, 0x9e3779b1)) >>> 0;
    const dataset = buildSyntheticRegressionDataset({
      seed: trialSeed,
      trainSize,
      testSize,
      noiseStd,
      trueCoefficients,
    });
    const fit = fitRidgePolynomial({
      x: dataset.train.x,
      y: dataset.train.y,
      degree,
      lambda,
    });
    const testPrediction = predictPolynomial(fit.weights, dataset.test.x);
    const testMse = calculateMse(testPrediction, dataset.test.y).mse;
    trainErrors.push(fit.mse);
    testErrors.push(testMse);
  }

  const expectedTrainError = mean(trainErrors);
  const expectedTestError = mean(testErrors);
  return {
    trials,
    trainErrors,
    testErrors,
    expectedTrainError,
    expectedTestError,
    expectedGap: expectedTestError - expectedTrainError,
    reversalCount: trainErrors.reduce(
      (count, value, index) => count + (testErrors[index] < value ? 1 : 0),
      0,
    ),
  };
}

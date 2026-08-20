import {
  dot,
  multiplyMatrices,
  multiplyMatrixVector,
  transpose,
} from './least-squares.mjs';

function assertSamples(samples, targets, weights) {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new TypeError('samples must be a non-empty matrix');
  }
  const width = samples[0]?.length;
  if (!Number.isInteger(width) || width <= 0) {
    throw new TypeError('samples must have at least one feature');
  }
  samples.forEach((sample, row) => {
    if (!Array.isArray(sample) || sample.length !== width) {
      throw new RangeError('samples must be rectangular');
    }
    sample.forEach((value, column) => {
      if (!Number.isFinite(value)) {
        throw new TypeError(`samples[${row}][${column}] must be finite`);
      }
    });
  });
  if (!Array.isArray(targets) || targets.length !== samples.length) {
    throw new RangeError('targets must match the number of samples');
  }
  if (!Array.isArray(weights) || weights.length !== width) {
    throw new RangeError('weights must match the number of features');
  }
}

export function outerProduct(vector) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new TypeError('vector must be non-empty');
  }
  return vector.map((left) => vector.map((right) => left * right));
}

export function addMatrices(left, right) {
  if (left.length !== right.length || left[0]?.length !== right[0]?.length) {
    throw new RangeError('matrix dimensions must match');
  }
  return left.map((row, rowIndex) =>
    row.map((value, columnIndex) => value + right[rowIndex][columnIndex]),
  );
}

export function computeSampleMatrixAssembly({ samples, targets, weights }) {
  assertSamples(samples, targets, weights);
  const dimension = samples[0].length;
  const zeroMatrix = Array.from({ length: dimension }, () =>
    Array.from({ length: dimension }, () => 0),
  );
  const outerProducts = samples.map((sample) => outerProduct(sample));
  const runningGram = [];
  let accumulator = zeroMatrix;
  for (const product of outerProducts) {
    accumulator = addMatrices(accumulator, product);
    runningGram.push(accumulator.map((row) => [...row]));
  }

  const X = samples.map((sample) => [...sample]);
  const XtX = multiplyMatrices(transpose(X), X);
  const prediction = multiplyMatrixVector(X, weights);
  const residual = prediction.map((value, index) => value - targets[index]);
  const samplewiseSquaredErrors = residual.map((value) => value ** 2);
  const samplewiseObjective = samplewiseSquaredErrors.reduce(
    (sum, value) => sum + value,
    0,
  );
  const stackedResidualNormSquared = dot(residual, residual);

  return {
    X,
    y: [...targets],
    outerProducts,
    runningGram,
    XtX,
    prediction,
    residual,
    samplewiseSquaredErrors,
    samplewiseObjective,
    stackedResidualNormSquared,
  };
}

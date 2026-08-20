import {
  dot,
  multiplyMatrices,
  multiplyMatrixVector,
  transpose,
} from './least-squares.mjs';

function assertDiagonalWeights(weights, length) {
  if (!Array.isArray(weights) || weights.length !== length) {
    throw new RangeError(`weights must contain ${length} diagonal entries`);
  }
  weights.forEach((value, index) => {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`weights[${index}] must be positive and finite`);
    }
  });
}

export function computeWeightedResidualGradient({ A, x, y, weights }) {
  const prediction = multiplyMatrixVector(A, x);
  if (prediction.length !== y.length) {
    throw new RangeError('A x and y must have the same length');
  }
  assertDiagonalWeights(weights, y.length);

  const residual = prediction.map((value, index) => value - y[index]);
  const weightedResidual = residual.map((value, index) => weights[index] * value);
  const loss = dot(residual, weightedResidual);
  const gradient = multiplyMatrixVector(transpose(A), weightedResidual).map(
    (value) => 2 * value,
  );
  const W = weights.map((value, row) =>
    weights.map((_, column) => (row === column ? value : 0)),
  );
  const hessian = multiplyMatrices(
    multiplyMatrices(transpose(A), W),
    A,
  ).map((row) => row.map((value) => 2 * value));

  return {
    prediction,
    residual,
    weightedResidual,
    loss,
    gradient,
    hessian,
  };
}

export function computeScalarSquaredResidual({ a, x, b }) {
  for (const [label, value] of Object.entries({ a, x, b })) {
    if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
  }
  const residual = a * x - b;
  return {
    prediction: a * x,
    residual,
    loss: residual ** 2,
    derivative: 2 * a * residual,
  };
}

export function finiteDifferenceGradient({ A, x, y, weights }, epsilon = 1e-6) {
  if (!Number.isFinite(epsilon) || epsilon <= 0) {
    throw new RangeError('epsilon must be positive and finite');
  }

  return x.map((value, index) => {
    const plus = [...x];
    const minus = [...x];
    plus[index] = value + epsilon;
    minus[index] = value - epsilon;
    const plusLoss = computeWeightedResidualGradient({ A, x: plus, y, weights }).loss;
    const minusLoss = computeWeightedResidualGradient({ A, x: minus, y, weights }).loss;
    return (plusLoss - minusLoss) / (2 * epsilon);
  });
}

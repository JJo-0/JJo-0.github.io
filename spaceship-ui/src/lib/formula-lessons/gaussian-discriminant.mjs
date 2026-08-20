function assertVector(value, label) {
  if (!Array.isArray(value) || value.length !== 2 || value.some((item) => !Number.isFinite(item))) {
    throw new TypeError(`${label} must be a finite 2D vector`);
  }
}

function assertCovariance(matrix, label) {
  if (!Array.isArray(matrix) || matrix.length !== 2 || matrix.some((row) => !Array.isArray(row) || row.length !== 2 || row.some((value) => !Number.isFinite(value)))) {
    throw new TypeError(`${label} must be a finite 2x2 matrix`);
  }
}

export function det2(matrix) {
  assertCovariance(matrix, 'matrix');
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}

export function inverse2(matrix) {
  const determinant = det2(matrix);
  if (Math.abs(determinant) < 1e-12) throw new RangeError('matrix is singular');
  return [
    [matrix[1][1] / determinant, -matrix[0][1] / determinant],
    [-matrix[1][0] / determinant, matrix[0][0] / determinant],
  ];
}

function quadratic(vector, matrix) {
  return vector[0] * (matrix[0][0] * vector[0] + matrix[0][1] * vector[1]) +
    vector[1] * (matrix[1][0] * vector[0] + matrix[1][1] * vector[1]);
}

export function gaussianLogDiscriminant(x, mean, covariance, prior) {
  assertVector(x, 'x');
  assertVector(mean, 'mean');
  assertCovariance(covariance, 'covariance');
  if (!(prior > 0)) throw new RangeError('prior must be positive');
  const determinant = det2(covariance);
  if (!(determinant > 0)) throw new RangeError('covariance must be positive definite');
  const inverse = inverse2(covariance);
  const delta = x.map((value, index) => value - mean[index]);
  const mahalanobis2 = quadratic(delta, inverse);
  return Math.log(prior) - 0.5 * Math.log(determinant) - 0.5 * mahalanobis2;
}

export function ldaDiscriminant(x, mean, sharedCovariance, prior) {
  const inverse = inverse2(sharedCovariance);
  const invMean = [
    inverse[0][0] * mean[0] + inverse[0][1] * mean[1],
    inverse[1][0] * mean[0] + inverse[1][1] * mean[1],
  ];
  const linear = x[0] * invMean[0] + x[1] * invMean[1];
  const meanTerm = mean[0] * invMean[0] + mean[1] * invMean[1];
  return Math.log(prior) + linear - 0.5 * meanTerm;
}

export function minimumDistanceDiscriminant(x, mean) {
  return x[0] * mean[0] + x[1] * mean[1] - 0.5 * (mean[0] ** 2 + mean[1] ** 2);
}

export function gaussian1dDensity(x, mean, sigma) {
  if (![x, mean, sigma].every(Number.isFinite) || sigma <= 0) throw new RangeError('invalid 1D Gaussian parameters');
  return Math.exp(-((x - mean) ** 2) / (2 * sigma * sigma)) / (Math.sqrt(2 * Math.PI) * sigma);
}

export function computeGaussianHierarchy({ x, means, covariances, sharedCovariance, priors }) {
  assertVector(x, 'x');
  if (!Array.isArray(means) || means.length !== 2 || !Array.isArray(covariances) || covariances.length !== 2 || !Array.isArray(priors) || priors.length !== 2) {
    throw new RangeError('two classes are required');
  }
  means.forEach((mean, index) => assertVector(mean, `means[${index}]`));
  covariances.forEach((covariance, index) => assertCovariance(covariance, `covariances[${index}]`));
  assertCovariance(sharedCovariance, 'sharedCovariance');
  const qda = means.map((mean, index) => gaussianLogDiscriminant(x, mean, covariances[index], priors[index]));
  const lda = means.map((mean, index) => ldaDiscriminant(x, mean, sharedCovariance, priors[index]));
  const minimumDistance = means.map((mean) => minimumDistanceDiscriminant(x, mean));
  const identityLda = means.map((mean) => ldaDiscriminant(x, mean, [[1, 0], [0, 1]], 0.5));
  const identityOffsets = identityLda.map((value, index) => value - minimumDistance[index]);
  return {
    qda,
    lda,
    minimumDistance,
    qdaClass: qda.indexOf(Math.max(...qda)),
    ldaClass: lda.indexOf(Math.max(...lda)),
    minimumDistanceClass: minimumDistance.indexOf(Math.max(...minimumDistance)),
    identityOffsets,
  };
}

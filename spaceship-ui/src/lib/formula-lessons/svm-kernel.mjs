function assertVector(value, label) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => !Number.isFinite(item))) {
    throw new TypeError(`${label} must be a non-empty finite vector`);
  }
}

export function dot(a, b) {
  assertVector(a, 'a');
  assertVector(b, 'b');
  if (a.length !== b.length) throw new RangeError('dot vectors must have equal length');
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

export function sigmoid(z) {
  if (!Number.isFinite(z)) throw new TypeError('z must be finite');
  if (z >= 0) {
    const e = Math.exp(-z);
    return 1 / (1 + e);
  }
  const e = Math.exp(z);
  return e / (1 + e);
}

export function polynomialFeatureMap2(x) {
  assertVector(x, 'x');
  if (x.length !== 2) throw new RangeError('polynomialFeatureMap2 expects a 2D vector');
  const [x1, x2] = x;
  return [x1 * x1, Math.SQRT2 * x1 * x2, x2 * x2];
}

export function polynomialKernel2(u, v) {
  return dot(u, v) ** 2;
}

export function normalizedGaussianKernel(u, v, sigma) {
  assertVector(u, 'u');
  assertVector(v, 'v');
  if (u.length !== v.length) throw new RangeError('kernel vectors must have equal length');
  if (!Number.isFinite(sigma) || sigma <= 0) throw new RangeError('sigma must be positive');
  const squaredDistance = u.reduce((sum, value, index) => sum + (value - v[index]) ** 2, 0);
  const normalization = (2 * Math.PI * sigma * sigma) ** (-u.length / 2);
  return normalization * Math.exp(-squaredDistance / (2 * sigma * sigma));
}

export function computeSvmKernelLesson({ query, supportVectors, alphas, bias = 0, sigma = 1 }) {
  assertVector(query, 'query');
  if (!Array.isArray(supportVectors) || supportVectors.length === 0) throw new TypeError('supportVectors are required');
  if (!Array.isArray(alphas) || alphas.length !== supportVectors.length) throw new RangeError('alphas must match supportVectors');
  supportVectors.forEach((vector, index) => {
    assertVector(vector, `supportVectors[${index}]`);
    if (vector.length !== query.length) throw new RangeError('all support vectors must match query dimension');
  });

  const linearContributions = supportVectors.map((vector, index) => alphas[index] * dot(query, vector));
  const linearScore = bias + linearContributions.reduce((sum, value) => sum + value, 0);
  const kernels = supportVectors.map((vector) => normalizedGaussianKernel(query, vector, sigma));
  const kernelContributions = kernels.map((value, index) => alphas[index] * value);
  const kernelScore = bias + kernelContributions.reduce((sum, value) => sum + value, 0);

  let featureIdentity = null;
  if (query.length === 2 && supportVectors[0]?.length === 2) {
    const phiQuery = polynomialFeatureMap2(query);
    const phiSupport = polynomialFeatureMap2(supportVectors[0]);
    featureIdentity = {
      phiQuery,
      phiSupport,
      explicitDot: dot(phiQuery, phiSupport),
      kernelValue: polynomialKernel2(query, supportVectors[0]),
    };
  }

  return {
    sigmoidAtLinearScore: sigmoid(linearScore),
    linearContributions,
    linearScore,
    kernels,
    kernelContributions,
    kernelScore,
    featureIdentity,
  };
}

function assertFiniteVector(vector, label) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new TypeError(`${label} must be a non-empty vector`);
  }
  vector.forEach((value, index) => {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${label}[${index}] must be finite`);
    }
  });
}

export function computeDotProductPrediction({ x, w }) {
  assertFiniteVector(x, 'x');
  assertFiniteVector(w, 'w');
  if (x.length !== w.length) {
    throw new RangeError(`x and w must have the same length: ${x.length} !== ${w.length}`);
  }

  const contributions = x.map((value, index) => value * w[index]);
  const prediction = contributions.reduce((sum, value) => sum + value, 0);
  const inputNorm = Math.hypot(...x);
  const weightNorm = Math.hypot(...w);
  const cosine = inputNorm > 0 && weightNorm > 0
    ? prediction / (inputNorm * weightNorm)
    : 0;

  return {
    contributions,
    prediction,
    inputNorm,
    weightNorm,
    cosine,
  };
}

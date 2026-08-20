export function eigenSymmetric2(A) {
  if (!Array.isArray(A) || A.length !== 2 || A.some((row) => !Array.isArray(row) || row.length !== 2)) throw new RangeError('2x2 matrix required');
  if (Math.abs(A[0][1] - A[1][0]) > 1e-10) throw new RangeError('matrix must be symmetric');
  const a = A[0][0], b = A[0][1], d = A[1][1];
  const center = 0.5 * (a + d);
  const radius = Math.hypot(0.5 * (a - d), b);
  const values = [center + radius, center - radius];
  const vectors = values.map((lambda) => {
    let v = Math.abs(b) > 1e-12 ? [b, lambda - a] : (Math.abs(a - lambda) < Math.abs(d - lambda) ? [1, 0] : [0, 1]);
    const norm = Math.hypot(...v);
    v = v.map((value) => value / norm);
    return v;
  });
  return { values, vectors };
}

export function quadraticForm(x, A) {
  const Ax = [A[0][0] * x[0] + A[0][1] * x[1], A[1][0] * x[0] + A[1][1] * x[1]];
  return x[0] * Ax[0] + x[1] * Ax[1];
}

export function sampleMean(points) {
  return [points.reduce((sum, p) => sum + p[0], 0) / points.length, points.reduce((sum, p) => sum + p[1], 0) / points.length];
}

export function sampleCovariance(points) {
  if (!Array.isArray(points) || points.length < 2) throw new RangeError('at least two points required');
  const mean = sampleMean(points);
  const C = [[0, 0], [0, 0]];
  for (const point of points) {
    const dx = point[0] - mean[0], dy = point[1] - mean[1];
    C[0][0] += dx * dx; C[0][1] += dx * dy; C[1][0] += dx * dy; C[1][1] += dy * dy;
  }
  for (let i = 0; i < 2; i += 1) for (let j = 0; j < 2; j += 1) C[i][j] /= points.length;
  return { mean, covariance: C };
}

export function computeEigenCovarianceLesson({ A, x, points }) {
  const eigen = eigenSymmetric2(A);
  const covariance = sampleCovariance(points);
  const covarianceEigen = eigenSymmetric2(covariance.covariance);
  const trace = A[0][0] + A[1][1];
  const determinant = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  return {
    quadratic: quadraticForm(x, A), eigen, trace, determinant,
    covariance, covarianceEigen,
    traceEigenResidual: trace - eigen.values.reduce((sum, value) => sum + value, 0),
    detEigenResidual: determinant - eigen.values[0] * eigen.values[1],
  };
}

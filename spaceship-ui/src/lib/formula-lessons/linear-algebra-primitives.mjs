function assertVector(v, label) {
  if (!Array.isArray(v) || v.length === 0 || v.some((x) => !Number.isFinite(x))) throw new TypeError(`${label} must be finite`);
}

export function dot(a, b) {
  assertVector(a, 'a'); assertVector(b, 'b');
  if (a.length !== b.length) throw new RangeError('dimension mismatch');
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

export function outer(a, b) {
  assertVector(a, 'a'); assertVector(b, 'b');
  return a.map((x) => b.map((y) => x * y));
}

export function matVec(A, x) {
  if (!Array.isArray(A) || A.length === 0) throw new TypeError('A required');
  assertVector(x, 'x');
  if (A.some((row) => !Array.isArray(row) || row.length !== x.length)) throw new RangeError('matrix/vector mismatch');
  return A.map((row) => dot(row, x));
}

export function matMul(A, B) {
  if (!Array.isArray(A) || !Array.isArray(B) || A.length === 0 || B.length === 0) throw new TypeError('matrices required');
  const n = A[0].length;
  if (B.length !== n) throw new RangeError('matrix multiplication mismatch');
  const p = B[0].length;
  if (A.some((row) => row.length !== n) || B.some((row) => row.length !== p)) throw new RangeError('ragged matrix');
  return A.map((row) => Array.from({ length: p }, (_, col) => row.reduce((sum, value, k) => sum + value * B[k][col], 0)));
}

export function frobenius(A) {
  return Math.sqrt(A.flat().reduce((sum, value) => sum + value * value, 0));
}

export function det2(A) {
  if (!Array.isArray(A) || A.length !== 2 || A.some((row) => !Array.isArray(row) || row.length !== 2)) throw new RangeError('2x2 matrix required');
  return A[0][0] * A[1][1] - A[0][1] * A[1][0];
}

export function inverse2(A) {
  const determinant = det2(A);
  if (Math.abs(determinant) < 1e-10) return null;
  return [[A[1][1] / determinant, -A[0][1] / determinant], [-A[1][0] / determinant, A[0][0] / determinant]];
}

export function rank2(A, tolerance = 1e-10) {
  const nonzero = A.flat().some((value) => Math.abs(value) > tolerance);
  if (!nonzero) return 0;
  return Math.abs(det2(A)) > tolerance ? 2 : 1;
}

export function computeLinearAlgebraLesson({ x, y, A, B }) {
  const AB = matMul(A, B);
  const outerTerms = Array.from({ length: A[0].length }, (_, k) => {
    const column = A.map((row) => row[k]);
    const row = B[k];
    return outer(column, row);
  });
  const outerSum = outerTerms.reduce((acc, term) => acc.map((row, i) => row.map((value, j) => value + term[i][j])), Array.from({ length: A.length }, () => Array(B[0].length).fill(0)));
  return {
    dot: dot(x, y), outer: outer(x, y), Ax: matVec(A, x), AB, outerTerms, outerSum,
    xNorm: Math.hypot(...x), frobeniusA: frobenius(A), determinantA: A.length === 2 && A[0].length === 2 ? det2(A) : null,
  };
}

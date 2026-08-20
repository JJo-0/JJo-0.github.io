function assertPoint(point, label) {
  if (!Array.isArray(point) || point.length === 0 || point.some((value) => !Number.isFinite(value))) {
    throw new TypeError(`${label} must be a finite point`);
  }
}

export function meanPoint(points) {
  if (!Array.isArray(points) || points.length === 0) throw new TypeError('points are required');
  points.forEach((point, index) => assertPoint(point, `points[${index}]`));
  const dimension = points[0].length;
  if (points.some((point) => point.length !== dimension)) throw new RangeError('point dimensions must match');
  return Array.from({ length: dimension }, (_, axis) => points.reduce((sum, point) => sum + point[axis], 0) / points.length);
}

export function squaredDistance(a, b) {
  assertPoint(a, 'a');
  assertPoint(b, 'b');
  if (a.length !== b.length) throw new RangeError('point dimensions must match');
  return a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0);
}

export function discriminant(x, prototype) {
  assertPoint(x, 'x');
  assertPoint(prototype, 'prototype');
  if (x.length !== prototype.length) throw new RangeError('point dimensions must match');
  const dot = prototype.reduce((sum, value, index) => sum + value * x[index], 0);
  const norm2 = prototype.reduce((sum, value) => sum + value * value, 0);
  return dot - 0.5 * norm2;
}

export function boundaryBetween(a, b) {
  assertPoint(a, 'a');
  assertPoint(b, 'b');
  if (a.length !== b.length) throw new RangeError('prototype dimensions must match');
  const normal = a.map((value, index) => value - b[index]);
  const offset = -0.5 * normal.reduce((sum, value, index) => sum + value * (a[index] + b[index]), 0);
  const midpoint = a.map((value, index) => 0.5 * (value + b[index]));
  const midpointResidual = normal.reduce((sum, value, index) => sum + value * midpoint[index], offset);
  return { normal, offset, midpoint, midpointResidual };
}

export function computeMinimumDistanceLesson({ classes, query }) {
  if (!Array.isArray(classes) || classes.length < 2) throw new RangeError('at least two classes are required');
  assertPoint(query, 'query');
  const prototypes = classes.map((points) => meanPoint(points));
  const distances = prototypes.map((prototype) => Math.sqrt(squaredDistance(query, prototype)));
  const discriminants = prototypes.map((prototype) => discriminant(query, prototype));
  const predictedByDistance = distances.indexOf(Math.min(...distances));
  const predictedByDiscriminant = discriminants.indexOf(Math.max(...discriminants));
  const boundary = boundaryBetween(prototypes[0], prototypes[1]);
  return { prototypes, distances, discriminants, predictedByDistance, predictedByDiscriminant, boundary };
}

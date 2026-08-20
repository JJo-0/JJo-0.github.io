export function quadraticValue(point, curvature) {
  const [x, y] = point; const [a, b] = curvature;
  return 0.5 * (a * x * x + b * y * y);
}

export function quadraticGradient(point, curvature) {
  return [curvature[0] * point[0], curvature[1] * point[1]];
}

export function gradientDescent({ initial, curvature, alpha, steps }) {
  if (!Number.isFinite(alpha) || alpha <= 0 || !Number.isInteger(steps) || steps < 1) throw new RangeError('invalid optimization settings');
  let point = [...initial];
  const trajectory = [{ step: 0, point: [...point], value: quadraticValue(point, curvature) }];
  for (let step = 1; step <= steps; step += 1) {
    const gradient = quadraticGradient(point, curvature);
    point = point.map((value, index) => value - alpha * gradient[index]);
    trajectory.push({ step, point: [...point], value: quadraticValue(point, curvature), gradient });
  }
  return trajectory;
}

export function miniBatchGradient(sampleGradients, batchIndices) {
  if (!Array.isArray(sampleGradients) || sampleGradients.length === 0 || !Array.isArray(batchIndices) || batchIndices.length === 0) throw new RangeError('samples and batch are required');
  const dimension = sampleGradients[0].length;
  return Array.from({ length: dimension }, (_, axis) => batchIndices.reduce((sum, index) => sum + sampleGradients[index][axis], 0));
}

export function computeOptimizationLesson({ initial, curvature, alpha, steps, sampleGradients, batchIndices }) {
  const trajectory = gradientDescent({ initial, curvature, alpha, steps });
  const batchGradient = miniBatchGradient(sampleGradients, batchIndices);
  return {
    trajectory,
    final: trajectory.at(-1),
    initialGradient: quadraticGradient(initial, curvature),
    batchGradient,
    stableForQuadratic: alpha < 2 / Math.max(...curvature),
  };
}

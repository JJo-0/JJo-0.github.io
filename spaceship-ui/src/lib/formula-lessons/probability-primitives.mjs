function validateDistribution(values, probabilities) {
  if (!Array.isArray(values) || !Array.isArray(probabilities) || values.length !== probabilities.length || values.length === 0) throw new RangeError('distribution arrays must match');
  if (probabilities.some((p) => !Number.isFinite(p) || p < 0)) throw new RangeError('probabilities must be non-negative');
  const total = probabilities.reduce((sum, p) => sum + p, 0);
  if (Math.abs(total - 1) > 1e-9) throw new RangeError('probabilities must sum to 1');
}

export function expectation(values, probabilities) {
  validateDistribution(values, probabilities);
  return values.reduce((sum, value, index) => sum + value * probabilities[index], 0);
}

export function variance(values, probabilities) {
  const mean = expectation(values, probabilities);
  return values.reduce((sum, value, index) => sum + (value - mean) ** 2 * probabilities[index], 0);
}

export function conditionalFromJoint(joint, conditionedColumn) {
  if (!Array.isArray(joint) || joint.length === 0 || joint.some((row) => !Array.isArray(row) || conditionedColumn >= row.length)) throw new RangeError('invalid joint table');
  const denominator = joint.reduce((sum, row) => sum + row[conditionedColumn], 0);
  if (!(denominator > 0)) throw new RangeError('conditioning event has zero probability');
  return joint.map((row) => row[conditionedColumn] / denominator);
}

export function computeProbabilityLesson({ values, probabilities, joint, conditionedColumn }) {
  const mean = expectation(values, probabilities);
  const varValue = variance(values, probabilities);
  const conditional = conditionalFromJoint(joint, conditionedColumn);
  return { mean, variance: varValue, std: Math.sqrt(varValue), conditional, conditionalSum: conditional.reduce((sum, p) => sum + p, 0) };
}

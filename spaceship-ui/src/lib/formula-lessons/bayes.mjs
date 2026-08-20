function assertProbabilities(values, label) {
  if (!Array.isArray(values) || values.length === 0 || values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new TypeError(`${label} must contain finite non-negative values`);
  }
}

export function normalizePosterior(likelihoods, priors) {
  assertProbabilities(likelihoods, 'likelihoods');
  assertProbabilities(priors, 'priors');
  if (likelihoods.length !== priors.length) throw new RangeError('likelihoods and priors must have equal length');
  const numerators = likelihoods.map((value, index) => value * priors[index]);
  const evidence = numerators.reduce((sum, value) => sum + value, 0);
  if (!(evidence > 0)) throw new RangeError('evidence must be positive');
  const posterior = numerators.map((value) => value / evidence);
  return { numerators, evidence, posterior, posteriorSum: posterior.reduce((sum, value) => sum + value, 0) };
}

export function zeroOneLoss(classCount) {
  if (!Number.isInteger(classCount) || classCount < 2) throw new RangeError('classCount must be at least 2');
  return Array.from({ length: classCount }, (_, action) =>
    Array.from({ length: classCount }, (_, truth) => (action === truth ? 0 : 1)),
  );
}

export function conditionalRisks(lossMatrix, posterior) {
  assertProbabilities(posterior, 'posterior');
  if (!Array.isArray(lossMatrix) || lossMatrix.length !== posterior.length) throw new RangeError('lossMatrix must be square');
  const risks = lossMatrix.map((row, action) => {
    if (!Array.isArray(row) || row.length !== posterior.length || row.some((value) => !Number.isFinite(value) || value < 0)) {
      throw new RangeError(`lossMatrix[${action}] is invalid`);
    }
    return row.reduce((sum, loss, truth) => sum + loss * posterior[truth], 0);
  });
  return { risks, bestAction: risks.indexOf(Math.min(...risks)) };
}

export function computeBayesLesson({ likelihoods, priors, lossMatrix = null }) {
  const normalized = normalizePosterior(likelihoods, priors);
  const zeroOne = conditionalRisks(zeroOneLoss(priors.length), normalized.posterior);
  const custom = conditionalRisks(lossMatrix ?? zeroOneLoss(priors.length), normalized.posterior);
  const mapClass = normalized.posterior.indexOf(Math.max(...normalized.posterior));
  return { ...normalized, zeroOne, custom, mapClass };
}

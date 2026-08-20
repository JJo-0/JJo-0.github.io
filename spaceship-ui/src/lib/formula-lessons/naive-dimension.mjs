function assertPositiveMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length < 2 || matrix.some((row) => !Array.isArray(row) || row.length === 0 || row.some((value) => !Number.isFinite(value) || value < 0))) {
    throw new TypeError('feature likelihoods must be a non-negative matrix');
  }
  const width = matrix[0].length;
  if (matrix.some((row) => row.length !== width)) throw new RangeError('feature likelihood rows must have equal length');
}

export function computeNaiveBayes({ featureLikelihoods, priors }) {
  assertPositiveMatrix(featureLikelihoods);
  if (!Array.isArray(priors) || priors.length !== featureLikelihoods.length || priors.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new RangeError('priors must match classes');
  }
  const likelihoodProducts = featureLikelihoods.map((row) => row.reduce((product, value) => product * value, 1));
  const scoresWithoutPrior = [...likelihoodProducts];
  const scoresWithPrior = likelihoodProducts.map((value, index) => value * priors[index]);
  const evidence = scoresWithPrior.reduce((sum, value) => sum + value, 0);
  if (!(evidence > 0)) throw new RangeError('evidence must be positive');
  const posterior = scoresWithPrior.map((value) => value / evidence);
  return {
    likelihoodProducts,
    scoresWithoutPrior,
    scoresWithPrior,
    posterior,
    posteriorSum: posterior.reduce((sum, value) => sum + value, 0),
    predictedClass: posterior.indexOf(Math.max(...posterior)),
  };
}

export function dimensionGridCounts({ resolution, maxDimension }) {
  if (!Number.isInteger(resolution) || resolution < 2) throw new RangeError('resolution must be an integer >= 2');
  if (!Number.isInteger(maxDimension) || maxDimension < 1) throw new RangeError('maxDimension must be positive');
  return Array.from({ length: maxDimension }, (_, index) => ({
    dimension: index + 1,
    points: resolution ** (index + 1),
  }));
}

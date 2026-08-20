export function buildKFoldAssignment(sampleCount, foldCount) {
  if (!Number.isInteger(sampleCount) || sampleCount < 2) throw new RangeError('sampleCount must be >= 2');
  if (!Number.isInteger(foldCount) || foldCount < 2 || foldCount > sampleCount) throw new RangeError('foldCount must be in [2, sampleCount]');
  const folds = Array.from({ length: foldCount }, () => []);
  for (let index = 0; index < sampleCount; index += 1) folds[index % foldCount].push(index);
  return folds;
}

export function computeKFoldLesson({ sampleCount, foldCount, foldErrors }) {
  const folds = buildKFoldAssignment(sampleCount, foldCount);
  if (!Array.isArray(foldErrors) || foldErrors.length !== foldCount || foldErrors.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new RangeError('foldErrors must contain one non-negative value per fold');
  }
  const runs = folds.map((testIndices, foldIndex) => {
    const testSet = new Set(testIndices);
    const trainIndices = Array.from({ length: sampleCount }, (_, index) => index).filter((index) => !testSet.has(index));
    return { foldIndex, testIndices, trainIndices, error: foldErrors[foldIndex] };
  });
  const testUseCount = Array.from({ length: sampleCount }, (_, sample) => runs.filter((run) => run.testIndices.includes(sample)).length);
  const meanError = foldErrors.reduce((sum, value) => sum + value, 0) / foldCount;
  return {
    folds,
    runs,
    testUseCount,
    meanError,
    allSamplesTestedOnce: testUseCount.every((count) => count === 1),
    allSplitsDisjoint: runs.every((run) => run.testIndices.every((index) => !run.trainIndices.includes(index))),
  };
}

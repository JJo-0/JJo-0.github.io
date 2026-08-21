function assertVector2(value, label) {
  if (!Array.isArray(value) || value.length !== 2 || value.some((item) => !Number.isFinite(item))) {
    throw new TypeError(`${label} must be a finite 2D vector`);
  }
}

function assertFinite(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
}

function summarize(samples, w, b) {
  return samples.map((sample, index) => {
    assertVector2(sample.x, `samples[${index}].x`);
    if (sample.y !== 1 && sample.y !== -1) throw new RangeError(`samples[${index}].y must be ±1`);
    const score = w[0] * sample.x[0] + w[1] * sample.x[1] + b;
    return {
      id: sample.id ?? `sample-${index + 1}`,
      x: [...sample.x],
      y: sample.y,
      score,
      margin: sample.y * score,
    };
  });
}

function direction(rows) {
  return rows.reduce(
    (acc, row) => {
      acc.w[0] += row.y * row.x[0];
      acc.w[1] += row.y * row.x[1];
      acc.b += row.y;
      return acc;
    },
    { w: [0, 0], b: 0 },
  );
}

function update(w, b, alpha, dir) {
  return {
    w: [w[0] + alpha * dir.w[0], w[1] + alpha * dir.w[1]],
    b: b + alpha * dir.b,
  };
}

export function computePerceptronLearning({ samples, w, b, alpha }) {
  if (!Array.isArray(samples) || samples.length === 0) throw new RangeError('samples are required');
  assertVector2(w, 'w');
  assertFinite(b, 'b');
  assertFinite(alpha, 'alpha');
  if (!(alpha > 0)) throw new RangeError('alpha must be positive');

  const rows = summarize(samples, w, b);
  const strictErrors = rows.filter((row) => row.margin < 0);
  const correctedErrors = rows.filter((row) => row.margin <= 0);
  const allDirection = direction(rows);
  const strictDirection = direction(strictErrors);
  const correctedDirection = direction(correctedErrors);

  const fullGradient = { w: allDirection.w.map((value) => -value), b: -allDirection.b };
  const fullUpdate = update(w, b, alpha, allDirection);
  const strictUpdate = update(w, b, alpha, strictDirection);
  const correctedUpdate = update(w, b, alpha, correctedDirection);
  const correctedNextRows = summarize(samples, correctedUpdate.w, correctedUpdate.b);

  return {
    rows,
    rawMarginSum: rows.reduce((sum, row) => sum + row.margin, 0),
    sourceLoss: -rows.reduce((sum, row) => sum + row.margin, 0),
    strictErrorLoss: -strictErrors.reduce((sum, row) => sum + row.margin, 0),
    correctedErrorLoss: -correctedErrors.reduce((sum, row) => sum + row.margin, 0),
    strictErrors,
    correctedErrors,
    fullGradient,
    allDirection,
    strictDirection,
    correctedDirection,
    fullUpdate,
    strictUpdate,
    correctedUpdate,
    correctedNextRows,
    correctedNextSeparated: correctedNextRows.every((row) => row.margin > 0),
  };
}

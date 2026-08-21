function assertVector2(value, label) {
  if (!Array.isArray(value) || value.length !== 2 || value.some((item) => !Number.isFinite(item))) {
    throw new TypeError(`${label} must be a finite 2D vector`);
  }
}

function assertFinite(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
}

export function perceptronSign(value, epsilon = 1e-10) {
  assertFinite(value, 'value');
  if (value > epsilon) return 1;
  if (value < -epsilon) return -1;
  return 0;
}

export function computePerceptronGeometry({ w, b, point, samples = [], lineMapping = null }) {
  assertVector2(w, 'w');
  assertVector2(point, 'point');
  assertFinite(b, 'b');
  const norm = Math.hypot(w[0], w[1]);
  if (norm <= 1e-12) throw new RangeError('w must be non-zero');

  const score = w[0] * point[0] + w[1] * point[1] + b;
  const signedDistance = score / norm;
  const distance = Math.abs(signedDistance);
  const originDistance = Math.abs(b) / norm;
  const decision = perceptronSign(score);

  const boundary = Math.abs(w[1]) > 1e-12
    ? { kind: 'line', slope: -w[0] / w[1], intercept: -b / w[1] }
    : { kind: 'vertical', x: -b / w[0] };

  const sampleRows = samples.map((sample, index) => {
    assertVector2(sample.x, `samples[${index}].x`);
    if (sample.y !== 1 && sample.y !== -1) throw new RangeError(`samples[${index}].y must be ±1`);
    const sampleScore = w[0] * sample.x[0] + w[1] * sample.x[1] + b;
    const margin = sample.y * sampleScore;
    return {
      id: sample.id ?? `sample-${index + 1}`,
      x: [...sample.x],
      y: sample.y,
      score: sampleScore,
      margin,
      decision: perceptronSign(sampleScore),
      correct: margin > 0,
    };
  });

  let lineMappingResult = null;
  if (lineMapping) {
    const { a, c } = lineMapping;
    assertFinite(a, 'lineMapping.a');
    assertFinite(c, 'lineMapping.c');
    const mappedW = [-a, 1];
    const mappedB = -c;
    const probeX = 0.6;
    const probeY = a * probeX + c;
    const residual = mappedW[0] * probeX + mappedW[1] * probeY + mappedB;
    lineMappingResult = { a, c, mappedW, mappedB, probe: [probeX, probeY], residual };
  }

  return {
    norm,
    score,
    decision,
    signedDistance,
    distance,
    originDistance,
    boundary,
    samples: sampleRows,
    allSeparated: sampleRows.every((row) => row.correct),
    lineMapping: lineMappingResult,
  };
}

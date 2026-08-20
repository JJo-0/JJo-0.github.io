const EPSILON = 1e-10;

function assertFiniteNumber(value, label) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`);
  }
}

function assertVector(vector, label) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new TypeError(`${label} must be a non-empty vector`);
  }
  vector.forEach((value, index) => assertFiniteNumber(value, `${label}[${index}]`));
}

function assertMatrix(matrix, label) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new TypeError(`${label} must be a non-empty matrix`);
  }
  const width = matrix[0]?.length;
  if (!Number.isInteger(width) || width <= 0) {
    throw new TypeError(`${label} must have at least one column`);
  }
  matrix.forEach((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== width) {
      throw new TypeError(`${label} must be rectangular`);
    }
    row.forEach((value, columnIndex) => {
      assertFiniteNumber(value, `${label}[${rowIndex}][${columnIndex}]`);
    });
  });
}

export function dot(left, right) {
  assertVector(left, 'left');
  assertVector(right, 'right');
  if (left.length !== right.length) {
    throw new RangeError(`dot(): dimension mismatch ${left.length} !== ${right.length}`);
  }
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

export function transpose(matrix) {
  assertMatrix(matrix, 'matrix');
  return matrix[0].map((_, columnIndex) => matrix.map((row) => row[columnIndex]));
}

export function multiplyMatrices(left, right) {
  assertMatrix(left, 'left');
  assertMatrix(right, 'right');
  if (left[0].length !== right.length) {
    throw new RangeError(
      `multiplyMatrices(): dimension mismatch ${left.length}×${left[0].length} and ${right.length}×${right[0].length}`,
    );
  }
  const rightT = transpose(right);
  return left.map((row) => rightT.map((column) => dot(row, column)));
}

export function multiplyMatrixVector(matrix, vector) {
  assertMatrix(matrix, 'matrix');
  assertVector(vector, 'vector');
  if (matrix[0].length !== vector.length) {
    throw new RangeError(
      `multiplyMatrixVector(): dimension mismatch ${matrix.length}×${matrix[0].length} and ${vector.length}`,
    );
  }
  return matrix.map((row) => dot(row, vector));
}

export function solveLinearSystem(matrix, vector) {
  assertMatrix(matrix, 'matrix');
  assertVector(vector, 'vector');
  const n = matrix.length;
  if (matrix[0].length !== n || vector.length !== n) {
    throw new RangeError('solveLinearSystem(): matrix must be square and match vector length');
  }

  const augmented = matrix.map((row, index) => [...row, vector[index]]);

  for (let column = 0; column < n; column += 1) {
    let pivotRow = column;
    for (let row = column + 1; row < n; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivotRow][column])) {
        pivotRow = row;
      }
    }

    if (Math.abs(augmented[pivotRow][column]) < EPSILON) {
      throw new RangeError('solveLinearSystem(): singular or nearly singular matrix');
    }

    [augmented[column], augmented[pivotRow]] = [augmented[pivotRow], augmented[column]];

    const pivot = augmented[column][column];
    for (let entry = column; entry <= n; entry += 1) {
      augmented[column][entry] /= pivot;
    }

    for (let row = 0; row < n; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let entry = column; entry <= n; entry += 1) {
        augmented[row][entry] -= factor * augmented[column][entry];
      }
    }
  }

  return augmented.map((row) => row[n]);
}

export function computeLeastSquares(state) {
  const { X, y, w } = state;
  assertMatrix(X, 'X');
  assertVector(y, 'y');
  assertVector(w, 'w');
  if (X.length !== y.length) {
    throw new RangeError(`computeLeastSquares(): X rows ${X.length} !== y length ${y.length}`);
  }
  if (X[0].length !== w.length) {
    throw new RangeError(`computeLeastSquares(): X columns ${X[0].length} !== w length ${w.length}`);
  }

  const prediction = multiplyMatrixVector(X, w);
  const residual = prediction.map((value, index) => value - y[index]);
  const squaredResidual = residual.map((value) => value ** 2);
  const sse = squaredResidual.reduce((sum, value) => sum + value, 0);
  const mse = sse / X.length;
  const Xt = transpose(X);
  const gram = multiplyMatrices(Xt, X);
  const rhs = multiplyMatrixVector(Xt, y);
  const gradient = multiplyMatrixVector(Xt, residual).map((value) => (2 / X.length) * value);

  return {
    prediction,
    residual,
    squaredResidual,
    sse,
    mse,
    gram,
    rhs,
    gradient,
  };
}

export function solveNormalEquation(X, y) {
  assertMatrix(X, 'X');
  assertVector(y, 'y');
  if (X.length !== y.length) {
    throw new RangeError(`solveNormalEquation(): X rows ${X.length} !== y length ${y.length}`);
  }
  const Xt = transpose(X);
  const gram = multiplyMatrices(Xt, X);
  const rhs = multiplyMatrixVector(Xt, y);
  const solution = solveLinearSystem(gram, rhs);
  return { gram, rhs, solution };
}

export function approximatelyEqual(left, right, tolerance = 1e-9) {
  assertFiniteNumber(left, 'left');
  assertFiniteNumber(right, 'right');
  assertFiniteNumber(tolerance, 'tolerance');
  return Math.abs(left - right) <= tolerance;
}

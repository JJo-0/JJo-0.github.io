import assert from 'node:assert/strict';
// User policy updated 2026-09-17: visible editorial prose >= 7,000;
// no upper ceiling. Each article keeps its existing prose extractor.
export function assertNewsProseLength(length, label = 'NEWS') {
  assert(Number.isSafeInteger(length) && length >= 7000,
    `${label}: at least 7,000 prose characters required; got ${length}`);
}

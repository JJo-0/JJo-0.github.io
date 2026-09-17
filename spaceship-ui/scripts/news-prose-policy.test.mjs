import assert from 'node:assert/strict';
import { assertNewsProseLength } from './news-prose-policy.mjs';
for (const length of [7000, 10000, 10001, 50000]) assert.doesNotThrow(() => assertNewsProseLength(length));
for (const length of [6999, 0, -1, NaN, Infinity, true, '7000', 7000.5]) assert.throws(() => assertNewsProseLength(length));
console.log('news-prose-policy: PASS 7000 minimum, >10000 allowed, invalid counts rejected');

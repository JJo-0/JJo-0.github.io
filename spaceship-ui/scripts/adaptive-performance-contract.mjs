import assert from 'node:assert/strict';
import {
  ADAPTIVE_THRESHOLDS,
  QUALITY_PRESETS,
  createAdaptivePerformanceController,
} from '../src/lib/experience/adaptive-performance.js';

assert.deepEqual(
  {
    emergencyFps: ADAPTIVE_THRESHOLDS.emergencyFps,
    degradeFps: ADAPTIVE_THRESHOLDS.degradeFps,
    upgradeFps: ADAPTIVE_THRESHOLDS.upgradeFps,
    emergencyDurationMs: ADAPTIVE_THRESHOLDS.emergencyDurationMs,
    degradeDurationMs: ADAPTIVE_THRESHOLDS.degradeDurationMs,
    upgradeDurationMs: ADAPTIVE_THRESHOLDS.upgradeDurationMs,
  },
  {
    emergencyFps: 30,
    degradeFps: 42,
    upgradeFps: 58,
    emergencyDurationMs: 1_000,
    degradeDurationMs: 2_000,
    upgradeDurationMs: 8_000,
  },
  'adaptive thresholds changed without contract review',
);

assert.ok(QUALITY_PRESETS.low.dprCap < QUALITY_PRESETS.balanced.dprCap);
assert.ok(QUALITY_PRESETS.balanced.dprCap < QUALITY_PRESETS.high.dprCap);
assert.ok(QUALITY_PRESETS.low.particleRatio < QUALITY_PRESETS.balanced.particleRatio);
assert.ok(QUALITY_PRESETS.balanced.particleRatio < QUALITY_PRESETS.high.particleRatio);

const sustainedLow = createAdaptivePerformanceController({
  initialQuality: 'high',
  maximumQuality: 'high',
  thresholds: { ...ADAPTIVE_THRESHOLDS, ewmaAlpha: 1 },
});
assert.equal(sustainedLow.sample(40, 0).transition, null);
assert.equal(sustainedLow.sample(40, 1_999).transition, null);
assert.deepEqual(sustainedLow.sample(40, 2_000).transition, {
  from: 'high',
  to: 'balanced',
});
assert.equal(sustainedLow.getQuality(), 'balanced');

const emergency = createAdaptivePerformanceController({
  initialQuality: 'high',
  maximumQuality: 'high',
  thresholds: { ...ADAPTIVE_THRESHOLDS, ewmaAlpha: 1 },
});
assert.equal(emergency.sample(20, 0).transition, null);
assert.deepEqual(emergency.sample(20, 1_000).transition, { from: 'high', to: 'low' });
assert.equal(emergency.getQuality(), 'low');

const recovery = createAdaptivePerformanceController({
  initialQuality: 'low',
  maximumQuality: 'high',
  thresholds: { ...ADAPTIVE_THRESHOLDS, ewmaAlpha: 1 },
});
assert.equal(recovery.sample(60, 0).transition, null);
assert.equal(recovery.sample(60, 7_999).transition, null);
assert.deepEqual(recovery.sample(60, 8_000).transition, { from: 'low', to: 'balanced' });
assert.equal(recovery.sample(60, 17_999).reason, 'cooldown');
assert.equal(recovery.sample(60, 18_000).transition, null);
assert.deepEqual(recovery.sample(60, 26_000).transition, {
  from: 'balanced',
  to: 'high',
});

const normalCeiling = createAdaptivePerformanceController({
  initialQuality: 'high',
  maximumQuality: 'balanced',
  thresholds: { ...ADAPTIVE_THRESHOLDS, ewmaAlpha: 1 },
});
assert.equal(normalCeiling.getQuality(), 'balanced');
assert.equal(normalCeiling.sample(60, 0).transition, null);
assert.equal(normalCeiling.sample(60, 20_000).transition, null);
assert.equal(normalCeiling.getQuality(), 'balanced');

const deadband = createAdaptivePerformanceController({
  initialQuality: 'balanced',
  maximumQuality: 'high',
  thresholds: { ...ADAPTIVE_THRESHOLDS, ewmaAlpha: 1 },
});
assert.equal(deadband.sample(40, 0).transition, null);
assert.equal(deadband.sample(50, 1_500).transition, null);
assert.equal(deadband.sample(40, 2_500).transition, null);
assert.equal(deadband.sample(Number.NaN, 3_000).reason, 'invalid-sample');
assert.equal(deadband.getQuality(), 'balanced');

console.log(
  'adaptive-performance-contract: PASS (30/42/58 FPS bands; 1s emergency, 2s degrade, 8s upgrade; cooldown and quality ceiling verified)',
);

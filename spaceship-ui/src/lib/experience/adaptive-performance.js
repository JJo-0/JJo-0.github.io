export const QUALITY_LEVELS = Object.freeze(['low', 'balanced', 'high']);

export const QUALITY_PRESETS = Object.freeze({
  low: Object.freeze({ dprCap: 0.75, particleRatio: 0.35 }),
  balanced: Object.freeze({ dprCap: 1, particleRatio: 0.65 }),
  high: Object.freeze({ dprCap: 1.75, particleRatio: 1 }),
});

export const ADAPTIVE_THRESHOLDS = Object.freeze({
  emergencyFps: 30,
  degradeFps: 42,
  upgradeFps: 58,
  emergencyDurationMs: 1_000,
  degradeDurationMs: 2_000,
  upgradeDurationMs: 8_000,
  downgradeCooldownMs: 4_000,
  upgradeCooldownMs: 10_000,
  ewmaAlpha: 0.35,
});

function qualityIndex(quality) {
  const index = QUALITY_LEVELS.indexOf(quality);
  if (index < 0) throw new Error(`Unknown renderer quality: ${quality}`);
  return index;
}

function clampQuality(quality, maximumQuality) {
  return QUALITY_LEVELS[Math.min(qualityIndex(quality), qualityIndex(maximumQuality))];
}

export function createAdaptivePerformanceController({
  initialQuality = 'balanced',
  maximumQuality = 'high',
  thresholds = ADAPTIVE_THRESHOLDS,
} = {}) {
  let quality = clampQuality(initialQuality, maximumQuality);
  const maximumIndex = qualityIndex(maximumQuality);
  let filteredFps = 60;
  let hasSample = false;
  let lastSampleAt = Number.NEGATIVE_INFINITY;
  let emergencySince = null;
  let degradeSince = null;
  let upgradeSince = null;
  let cooldownUntil = 0;

  const resetWindows = () => {
    emergencySince = null;
    degradeSince = null;
    upgradeSince = null;
  };

  const snapshot = (transition = null, reason = 'stable') => ({
    quality,
    preset: QUALITY_PRESETS[quality],
    filteredFps,
    transition,
    reason,
    cooldownUntil,
  });

  const transitionTo = (nextQuality, reason, now, cooldownMs) => {
    const previousQuality = quality;
    quality = nextQuality;
    cooldownUntil = now + cooldownMs;
    resetWindows();
    return snapshot({ from: previousQuality, to: quality }, reason);
  };

  return Object.freeze({
    getQuality: () => quality,
    getPreset: () => QUALITY_PRESETS[quality],
    getSnapshot: () => snapshot(),
    reset(nextQuality = initialQuality) {
      quality = clampQuality(nextQuality, maximumQuality);
      filteredFps = 60;
      hasSample = false;
      lastSampleAt = Number.NEGATIVE_INFINITY;
      cooldownUntil = 0;
      resetWindows();
      return snapshot(null, 'reset');
    },
    sample(rawFps, rawNow = performance.now()) {
      if (!Number.isFinite(rawFps) || rawFps <= 0 || !Number.isFinite(rawNow)) {
        return snapshot(null, 'invalid-sample');
      }

      const now = Math.max(rawNow, lastSampleAt);
      lastSampleAt = now;
      filteredFps = hasSample
        ? thresholds.ewmaAlpha * rawFps + (1 - thresholds.ewmaAlpha) * filteredFps
        : rawFps;
      hasSample = true;

      if (filteredFps < thresholds.emergencyFps) {
        emergencySince ??= now;
      } else {
        emergencySince = null;
      }

      if (filteredFps < thresholds.degradeFps) {
        degradeSince ??= now;
      } else {
        degradeSince = null;
      }

      if (filteredFps > thresholds.upgradeFps) {
        upgradeSince ??= now;
      } else {
        upgradeSince = null;
      }

      if (now < cooldownUntil) return snapshot(null, 'cooldown');

      const currentIndex = qualityIndex(quality);
      if (
        emergencySince !== null &&
        now - emergencySince >= thresholds.emergencyDurationMs &&
        currentIndex > 0
      ) {
        return transitionTo(
          'low',
          'emergency-fps',
          now,
          thresholds.downgradeCooldownMs,
        );
      }

      if (
        degradeSince !== null &&
        now - degradeSince >= thresholds.degradeDurationMs &&
        currentIndex > 0
      ) {
        return transitionTo(
          QUALITY_LEVELS[currentIndex - 1],
          'sustained-low-fps',
          now,
          thresholds.downgradeCooldownMs,
        );
      }

      if (
        upgradeSince !== null &&
        now - upgradeSince >= thresholds.upgradeDurationMs &&
        currentIndex < maximumIndex
      ) {
        return transitionTo(
          QUALITY_LEVELS[currentIndex + 1],
          'sustained-high-fps',
          now,
          thresholds.upgradeCooldownMs,
        );
      }

      return snapshot();
    },
  });
}

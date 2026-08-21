export type RendererQuality = 'low' | 'balanced' | 'high';

export interface QualityPreset {
  dprCap: number;
  particleRatio: number;
}

export interface AdaptiveThresholds {
  emergencyFps: number;
  degradeFps: number;
  upgradeFps: number;
  emergencyDurationMs: number;
  degradeDurationMs: number;
  upgradeDurationMs: number;
  sampleWindowMs: number;
  downgradeCooldownMs: number;
  upgradeCooldownMs: number;
  ewmaAlpha: number;
}

export interface QualityTransition {
  from: RendererQuality;
  to: RendererQuality;
}

export interface AdaptiveSnapshot {
  quality: RendererQuality;
  preset: QualityPreset;
  filteredFps: number;
  transition: QualityTransition | null;
  reason:
    | 'stable'
    | 'reset'
    | 'invalid-sample'
    | 'cooldown'
    | 'emergency-fps'
    | 'sustained-low-fps'
    | 'sustained-high-fps';
  cooldownUntil: number;
}

export interface AdaptivePerformanceController {
  getQuality(): RendererQuality;
  getPreset(): QualityPreset;
  getSnapshot(): AdaptiveSnapshot;
  reset(nextQuality?: RendererQuality): AdaptiveSnapshot;
  sample(rawFps: number, rawNow?: number): AdaptiveSnapshot;
}

export const QUALITY_LEVELS: readonly RendererQuality[];
export const QUALITY_PRESETS: Readonly<Record<RendererQuality, Readonly<QualityPreset>>>;
export const ADAPTIVE_THRESHOLDS: Readonly<AdaptiveThresholds>;

export function createAdaptivePerformanceController(options?: {
  initialQuality?: RendererQuality;
  maximumQuality?: RendererQuality;
  thresholds?: AdaptiveThresholds;
}): AdaptivePerformanceController;

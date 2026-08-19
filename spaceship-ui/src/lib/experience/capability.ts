import type { ExperienceTier } from './state';

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export interface ExperienceCapabilities {
  reducedMotion: boolean;
  tier: ExperienceTier;
  webgl2: boolean;
}

export function detectExperienceCapabilities(): ExperienceCapabilities {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const narrowViewport = window.innerWidth < 760;
  const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;

  let webgl2 = false;
  try {
    webgl2 = Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    webgl2 = false;
  }

  let tier: ExperienceTier = 'normal';
  if (reducedMotion || !webgl2 || memory <= 2 || cores <= 2) tier = 'safe';
  else if (!coarsePointer && !narrowViewport && memory >= 8 && cores >= 8) tier = 'ultra';

  return { reducedMotion, tier, webgl2 };
}

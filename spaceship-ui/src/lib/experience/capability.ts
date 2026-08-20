import type { ExperienceTier, RendererBackend } from './state';

interface NetworkInformationLike {
  effectiveType?: string;
  saveData?: boolean;
}

interface NavigatorWithCapabilities extends Navigator {
  connection?: NetworkInformationLike;
  deviceMemory?: number;
  gpu?: unknown;
}

export interface CapabilityProfile {
  tier: ExperienceTier;
  backend: RendererBackend;
  reducedMotion: boolean;
  webgl2Available: boolean;
  webgpuAvailable: boolean;
  saveData: boolean;
  slowConnection: boolean;
  coarsePointer: boolean;
  hardwareConcurrency: number;
  deviceMemory: number;
  dprCap: number;
  particleCount: number;
  maxFps: 30 | 60;
  antialias: boolean;
  reasons: string[];
}

function supportsWebGL2(): boolean {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: true,
    failIfMajorPerformanceCaveat: true,
    powerPreference: 'low-power',
  });

  if (!context) return false;
  context.getExtension('WEBGL_lose_context')?.loseContext();
  return true;
}

export function detectExperienceCapability(): CapabilityProfile {
  const nav = navigator as NavigatorWithCapabilities;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const narrowViewport = window.matchMedia('(max-width: 719px)').matches;
  const connection = nav.connection;
  const saveData = connection?.saveData === true;
  const slowConnection = ['slow-2g', '2g'].includes(connection?.effectiveType ?? '');
  const hardwareConcurrency = Math.max(1, nav.hardwareConcurrency || 2);
  const deviceMemory = Math.max(1, nav.deviceMemory || 4);
  const webgpuAvailable = typeof nav.gpu !== 'undefined';
  const webgl2Available = supportsWebGL2();
  const reasons: string[] = [];

  if (reducedMotion) reasons.push('reduced-motion');
  if (saveData) reasons.push('save-data');
  if (slowConnection) reasons.push('slow-connection');
  if (!webgl2Available) reasons.push('no-webgl2');
  if (hardwareConcurrency <= 2) reasons.push('low-core-count');
  if (deviceMemory <= 2) reasons.push('low-memory');
  if (coarsePointer && narrowViewport) reasons.push('mobile-safe-fallback');

  const mustUseSafe = reasons.length > 0;
  const canUseUltra =
    !mustUseSafe &&
    webgpuAvailable &&
    window.matchMedia('(min-width: 1100px) and (pointer: fine)').matches &&
    hardwareConcurrency >= 8 &&
    deviceMemory >= 8;

  const tier: ExperienceTier = mustUseSafe ? 'safe' : canUseUltra ? 'ultra' : 'normal';

  if (tier === 'safe') {
    return {
      tier,
      backend: 'none',
      reducedMotion,
      webgl2Available,
      webgpuAvailable,
      saveData,
      slowConnection,
      coarsePointer,
      hardwareConcurrency,
      deviceMemory,
      dprCap: 1,
      particleCount: 0,
      maxFps: 30,
      antialias: false,
      reasons,
    };
  }

  return {
    tier,
    // WebGPU is detected and recorded here, but activation remains a separate,
    // isolated phase. This core deliberately starts on the stable WebGL2 path.
    backend: 'webgl2',
    reducedMotion,
    webgl2Available,
    webgpuAvailable,
    saveData,
    slowConnection,
    coarsePointer,
    hardwareConcurrency,
    deviceMemory,
    dprCap: tier === 'ultra' ? 1.6 : 1,
    particleCount: tier === 'ultra' ? 96 : 42,
    maxFps: tier === 'ultra' ? 60 : 30,
    antialias: tier === 'ultra',
    reasons,
  };
}

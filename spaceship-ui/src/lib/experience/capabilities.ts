export type ExperienceTier = 'safe' | 'normal' | 'ultra';
export type RendererBackend = 'none' | 'webgl2';

export interface ExperienceCapabilities {
  tier: ExperienceTier;
  backend: RendererBackend;
  dprCap: number;
  particleCount: number;
  antialias: boolean;
  webgpuAvailable: boolean;
  reasons: string[];
}

type ExtendedNavigator = Navigator & {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
  gpu?: unknown;
};

function supportsWebGL2(): boolean {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    failIfMajorPerformanceCaveat: true,
    powerPreference: 'high-performance',
  });

  if (!context) return false;
  context.getExtension('WEBGL_lose_context')?.loseContext();
  return true;
}

export function detectExperienceCapabilities(): ExperienceCapabilities {
  const nav = navigator as ExtendedNavigator;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const saveData = nav.connection?.saveData === true;
  const effectiveType = nav.connection?.effectiveType ?? '';
  const constrainedNetwork = /(?:slow-2g|2g)/i.test(effectiveType);
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const webgpuAvailable = Boolean(nav.gpu);
  const webgl2Available = !reducedMotion && supportsWebGL2();
  const reasons: string[] = [];

  if (reducedMotion) reasons.push('prefers-reduced-motion');
  if (saveData) reasons.push('save-data');
  if (constrainedNetwork) reasons.push(`network-${effectiveType}`);
  if (!webgl2Available && !reducedMotion) reasons.push('webgl2-unavailable');

  if (reducedMotion || saveData || constrainedNetwork || !webgl2Available) {
    return {
      tier: 'safe',
      backend: 'none',
      dprCap: 1,
      particleCount: 0,
      antialias: false,
      webgpuAvailable,
      reasons,
    };
  }

  const wideViewport = window.innerWidth >= 1200;
  const strongCpu = cores >= 8;
  const strongMemory = memory >= 8;
  const finePointer = !coarsePointer;
  const ultra = webgpuAvailable && wideViewport && strongCpu && strongMemory && finePointer;

  if (ultra) {
    reasons.push('webgpu-capable', 'desktop-performance-headroom');
    return {
      tier: 'ultra',
      backend: 'webgl2',
      dprCap: 1.5,
      particleCount: 160,
      antialias: true,
      webgpuAvailable,
      reasons,
    };
  }

  reasons.push(coarsePointer ? 'coarse-pointer' : 'standard-webgl2');
  return {
    tier: 'normal',
    backend: 'webgl2',
    dprCap: 1.25,
    particleCount: 72,
    antialias: false,
    webgpuAvailable,
    reasons,
  };
}

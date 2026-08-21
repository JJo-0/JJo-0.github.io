import type { RendererQuality } from './adaptive-performance.js';
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
  narrowViewport: boolean;
  hardwareConcurrency: number;
  deviceMemory: number;
  dprCap: number;
  particleCount: number;
  maxFps: 30 | 60;
  antialias: boolean;
  initialQuality: RendererQuality;
  maximumQuality: RendererQuality;
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
  const reasons: string[] = [];

  if (reducedMotion) reasons.push('reduced-motion');
  if (saveData) reasons.push('save-data');
  if (slowConnection) reasons.push('slow-connection');
  if (hardwareConcurrency <= 2) reasons.push('low-core-count');
  if (deviceMemory <= 2) reasons.push('low-memory');
  if (narrowViewport) reasons.push('narrow-viewport');
  if (coarsePointer) reasons.push('coarse-pointer');

  // Keep the CSS and JavaScript SAFE boundary identical. Capability probing
  // starts only after motion, network, viewport, and pointer gates pass.
  const shouldProbeGpu = reasons.length === 0;
  const webgl2Available = shouldProbeGpu ? supportsWebGL2() : false;
  const ultraCandidate =
    shouldProbeGpu &&
    webgpuAvailable &&
    window.matchMedia('(min-width: 1100px) and (pointer: fine)').matches &&
    hardwareConcurrency >= 8 &&
    deviceMemory >= 8;

  // NORMAL deliberately targets WebGL2. A WebGPU-only device that does not
  // satisfy the ULTRA envelope stays on the accessible SVG/DOM surface.
  if (shouldProbeGpu && !webgl2Available && !ultraCandidate) {
    reasons.push('no-gpu-backend');
  }

  const mustUseSafe = reasons.length > 0;
  const canUseUltra = !mustUseSafe && ultraCandidate;
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
      narrowViewport,
      hardwareConcurrency,
      deviceMemory,
      dprCap: 1,
      particleCount: 0,
      maxFps: 30,
      antialias: false,
      initialQuality: 'low',
      maximumQuality: 'low',
      reasons,
    };
  }

  const backend: RendererBackend = tier === 'ultra' ? 'webgpu' : 'webgl2';
  const initialQuality: RendererQuality = tier === 'ultra' ? 'high' : 'balanced';
  const maximumQuality: RendererQuality = tier === 'ultra' ? 'high' : 'balanced';

  return {
    tier,
    backend,
    reducedMotion,
    webgl2Available,
    webgpuAvailable,
    saveData,
    slowConnection,
    coarsePointer,
    narrowViewport,
    hardwareConcurrency,
    deviceMemory,
    dprCap: tier === 'ultra' ? 1.75 : 1,
    particleCount: tier === 'ultra' ? 112 : 64,
    maxFps: 60,
    antialias: tier === 'ultra',
    initialQuality,
    maximumQuality,
    reasons,
  };
}

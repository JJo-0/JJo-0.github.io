import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
  WebGPURenderer,
} from 'three/webgpu';
import type { Material } from 'three';
import {
  QUALITY_PRESETS,
  createAdaptivePerformanceController,
  type RendererQuality,
} from './adaptive-performance.js';
import type { CapabilityProfile } from './capability';
import {
  experienceState,
  isResearchNodeId,
  RESEARCH_NODE_IDS,
  type RendererBackend,
  type ResearchNodeId,
} from './state';

const RENDERER_CORE_SENTINEL = '__JJO_RENDERER_CORE__';

type ConcreteResearchNode = Exclude<ResearchNodeId, null>;
type ActiveRendererBackend = Exclude<RendererBackend, 'none'>;

export type RendererVariant = 'home' | 'research';

export interface RendererMountOptions {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  profile: CapabilityProfile;
  variant: RendererVariant;
}

export interface RendererHandle {
  backend: ActiveRendererBackend;
  destroy: () => void;
}

interface NodeRecord {
  id: ConcreteResearchNode;
  mesh: Mesh;
  material: MeshBasicMaterial;
}

interface RendererPalette {
  accent: string;
  accentStrong: string;
  muted: string;
  theme: 'light' | 'dark';
}

interface BackendFlags {
  isWebGPUBackend?: boolean;
  isWebGLBackend?: boolean;
}

function readRendererPalette(): RendererPalette {
  const rootStyle = getComputedStyle(document.documentElement);
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  return {
    accent: rootStyle.getPropertyValue('--experience-accent').trim() || '#0891b2',
    accentStrong:
      rootStyle.getPropertyValue('--experience-accent-strong').trim() || '#0e7490',
    muted: theme === 'dark' ? '#9ca3af' : '#64748b',
    theme,
  };
}

function researchNodePosition(index: number, count: number): [number, number, number] {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(1, count);
  const x = Math.cos(angle) * 1.55;
  const y = Math.sin(angle) * 1.28;
  const z = (index % 2 === 0 ? 1 : -1) * 0.1;
  return [x, y, z];
}

function readActualBackend(renderer: WebGPURenderer): ActiveRendererBackend {
  const backend = renderer.backend as typeof renderer.backend & BackendFlags;
  if (backend.isWebGPUBackend) return 'webgpu';
  if (backend.isWebGLBackend) return 'webgl2';
  throw new Error('WebGPURenderer initialized without a recognized backend');
}

export async function mountExperienceRenderer({
  host,
  canvas,
  profile,
  variant,
}: RendererMountOptions): Promise<RendererHandle> {
  if (profile.backend === 'none') {
    throw new Error('Renderer core cannot mount a SAFE profile');
  }

  // This module stays behind the capability and viewport gates. WebGPURenderer
  // selects WebGPU only for ULTRA profiles and otherwise receives forceWebGL.
  host.dataset.rendererCore = RENDERER_CORE_SENTINEL;
  host.dataset.rendererPreferredBackend = profile.backend;

  let palette = readRendererPalette();
  const renderer = new WebGPURenderer({
    canvas,
    alpha: true,
    antialias: profile.antialias,
    depth: true,
    powerPreference: profile.tier === 'ultra' ? 'high-performance' : 'low-power',
    forceWebGL: profile.backend === 'webgl2',
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  await renderer.init();

  const actualBackend = readActualBackend(renderer);
  const maximumQuality: RendererQuality =
    actualBackend === 'webgpu' ? profile.maximumQuality : 'balanced';
  const performanceController = createAdaptivePerformanceController({
    initialQuality: profile.initialQuality,
    maximumQuality,
  });
  let currentQuality = performanceController.getQuality();

  host.dataset.rendererBackend = actualBackend;
  host.dataset.rendererTargetFps = String(profile.maxFps);

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 20);
  camera.position.set(0, 0, variant === 'home' ? 5.4 : 5.1);

  const constellation = new Group();
  scene.add(constellation);

  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const nodeRecords: NodeRecord[] = [];
  const nodePositions = new Map<ConcreteResearchNode, [number, number, number]>();

  const centralGeometry = new IcosahedronGeometry(0.12, 1);
  const centralMaterial = new MeshBasicMaterial({
    color: new Color(palette.accentStrong),
    transparent: true,
    opacity: 0.9,
  });
  geometries.add(centralGeometry);
  materials.add(centralMaterial);
  const central = new Mesh(centralGeometry, centralMaterial);
  central.scale.setScalar(variant === 'home' ? 1.18 : 1);
  constellation.add(central);

  RESEARCH_NODE_IDS.forEach((rawId, index) => {
    if (!isResearchNodeId(rawId)) return;
    const id: ConcreteResearchNode = rawId;
    const geometry = new IcosahedronGeometry(0.09, 1);
    const material = new MeshBasicMaterial({
      color: new Color(palette.muted),
      transparent: true,
      opacity: 0.62,
    });
    geometries.add(geometry);
    materials.add(material);

    const mesh = new Mesh(geometry, material);
    const position = researchNodePosition(index, RESEARCH_NODE_IDS.length);
    nodePositions.set(id, position);
    mesh.position.set(...position);
    constellation.add(mesh);
    nodeRecords.push({ id, mesh, material });
  });

  const edgePoints: number[] = [];
  for (const record of nodeRecords) {
    const position = nodePositions.get(record.id) ?? [0, 0, 0];
    edgePoints.push(0, 0, 0, ...position);
  }
  nodeRecords.forEach((record, index) => {
    const next = nodeRecords[(index + 1) % nodeRecords.length];
    if (!next || nodeRecords.length < 3) return;
    edgePoints.push(
      ...(nodePositions.get(record.id) ?? [0, 0, 0]),
      ...(nodePositions.get(next.id) ?? [0, 0, 0]),
    );
  });

  const edgeGeometry = new BufferGeometry();
  edgeGeometry.setAttribute('position', new Float32BufferAttribute(edgePoints, 3));
  const edgeMaterial = new LineBasicMaterial({
    color: new Color(palette.accent),
    transparent: true,
    opacity: variant === 'home' ? 0.2 : 0.27,
  });
  geometries.add(edgeGeometry);
  materials.add(edgeMaterial);
  constellation.add(new LineSegments(edgeGeometry, edgeMaterial));

  const ringGeometry = new TorusGeometry(1.96, 0.005, 6, 96);
  const ringMaterial = new MeshBasicMaterial({
    color: new Color(palette.accent),
    transparent: true,
    opacity: 0.14,
  });
  geometries.add(ringGeometry);
  materials.add(ringMaterial);
  const ring = new Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI * 0.51;
  ring.rotation.z = Math.PI * 0.08;
  constellation.add(ring);

  const particlePositions = new Float32Array(profile.particleCount * 3);
  for (let index = 0; index < profile.particleCount; index += 1) {
    const ratio = index / Math.max(1, profile.particleCount - 1);
    const angle = index * 2.399963229728653;
    const radius = 1.65 + (index % 7) * 0.08;
    particlePositions[index * 3] = Math.cos(angle) * radius;
    particlePositions[index * 3 + 1] = Math.sin(angle) * radius * 0.82;
    particlePositions[index * 3 + 2] = (ratio - 0.5) * 0.8;
  }

  const particleGeometry = new BufferGeometry();
  particleGeometry.setAttribute('position', new BufferAttribute(particlePositions, 3));
  const particleMaterial = new PointsMaterial({
    color: new Color(palette.accent),
    size: 0.034,
    sizeAttenuation: true,
    transparent: true,
    opacity: variant === 'home' ? 0.34 : 0.44,
    depthWrite: false,
  });
  geometries.add(particleGeometry);
  materials.add(particleMaterial);
  const particles = new Points(particleGeometry, particleMaterial);
  constellation.add(particles);

  let latestSnapshot = experienceState.get();

  const updateNodePalette = (): void => {
    const active = latestSnapshot.activeResearchNode;
    for (const record of nodeRecords) {
      const selected = isResearchNodeId(active ?? '') && record.id === active;
      record.material.color.set(selected ? palette.accentStrong : palette.muted);
      record.material.opacity = selected ? 1 : 0.62;
    }
  };

  const applyThemePalette = (): void => {
    palette = readRendererPalette();
    centralMaterial.color.set(palette.accentStrong);
    edgeMaterial.color.set(palette.accent);
    ringMaterial.color.set(palette.accent);
    particleMaterial.color.set(palette.accent);
    updateNodePalette();
    host.dataset.rendererTheme = palette.theme;
  };

  const unsubscribe = experienceState.subscribe((snapshot) => {
    latestSnapshot = snapshot;
    updateNodePalette();
  });

  const themeObserver = new MutationObserver((records) => {
    if (records.some((record) => record.attributeName === 'class')) applyThemePalette();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  applyThemePalette();

  let currentDpr = 1;
  const resize = (): void => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    const preset = QUALITY_PRESETS[currentQuality];
    const pixelRatio = Math.max(
      0.5,
      Math.min(window.devicePixelRatio || 1, profile.dprCap, preset.dprCap),
    );
    currentDpr = pixelRatio;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    host.dataset.rendererDpr = pixelRatio.toFixed(2);
  };

  const applyQuality = (quality: RendererQuality, reason: string): void => {
    currentQuality = quality;
    const preset = QUALITY_PRESETS[quality];
    const activeParticleCount = Math.max(
      1,
      Math.round(profile.particleCount * preset.particleRatio),
    );
    particleGeometry.setDrawRange(0, activeParticleCount);
    particleMaterial.size = quality === 'high' ? 0.034 : quality === 'balanced' ? 0.028 : 0.023;
    host.dataset.rendererQuality = quality;
    host.dataset.rendererAdaptation = reason;
    resize();
    experienceState.patch({
      rendererBackend: actualBackend,
      quality,
      dpr: currentDpr,
      targetFps: profile.maxFps,
      adaptationReason: reason,
    });
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  applyQuality(currentQuality, actualBackend === profile.backend ? 'initial' : 'backend-fallback');

  let destroyed = false;
  let inViewport = true;
  let documentVisible = !document.hidden;
  let frameId = 0;
  let animationRunning = false;
  let lastRenderedAt = performance.now();
  let fpsWindowStartedAt = lastRenderedAt;
  let framesInWindow = 0;
  const minimumFrameInterval = 1000 / profile.maxFps;

  const setLoopStatus = (status: 'running' | 'stopped'): void => {
    host.dataset.rendererLoop = status;
  };

  const stopAnimation = (): void => {
    animationRunning = false;
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    framesInWindow = 0;
    performanceController.reset(currentQuality);
    setLoopStatus('stopped');
    host.dataset.rendererFps = '0';
    if (experienceState.get().fps !== 0) experienceState.patch({ fps: 0 });
  };

  const animate = (now: number): void => {
    frameId = 0;
    if (!animationRunning || destroyed || !documentVisible || !inViewport) {
      stopAnimation();
      return;
    }

    if (now - lastRenderedAt >= minimumFrameInterval) {
      const deltaSeconds = Math.min((now - lastRenderedAt) / 1000, 0.08);
      lastRenderedAt = now;
      framesInWindow += 1;

      const pointerX = latestSnapshot.pointer.x;
      const pointerY = latestSnapshot.pointer.y;
      const scroll = latestSnapshot.scrollProgress;
      const targetRotationY = pointerX * 0.12 + scroll * 0.34;
      const targetRotationX = pointerY * -0.08 + (variant === 'research' ? -0.04 : 0.03);

      constellation.rotation.y = MathUtils.lerp(
        constellation.rotation.y,
        targetRotationY,
        Math.min(1, deltaSeconds * 3.2),
      );
      constellation.rotation.x = MathUtils.lerp(
        constellation.rotation.x,
        targetRotationX,
        Math.min(1, deltaSeconds * 3.2),
      );
      particles.rotation.z += deltaSeconds * (currentQuality === 'high' ? 0.045 : 0.025);
      ring.rotation.z += deltaSeconds * 0.025;

      for (const record of nodeRecords) {
        const selected = latestSnapshot.activeResearchNode === record.id;
        const targetScale = selected ? 1.58 : 1;
        const nextScale = MathUtils.lerp(
          record.mesh.scale.x,
          targetScale,
          Math.min(1, deltaSeconds * 7),
        );
        record.mesh.scale.setScalar(nextScale);
      }

      central.rotation.x += deltaSeconds * 0.18;
      central.rotation.y += deltaSeconds * 0.22;
      renderer.render(scene, camera);

      if (now - fpsWindowStartedAt >= 1_000) {
        const rawFps = Math.round((framesInWindow * 1000) / (now - fpsWindowStartedAt));
        const adaptive = performanceController.sample(rawFps, now);
        const filteredFps = Math.round(adaptive.filteredFps);
        host.dataset.rendererFps = String(filteredFps);
        if (adaptive.transition) {
          applyQuality(adaptive.quality, adaptive.reason);
        } else {
          experienceState.patch({ fps: filteredFps });
        }
        fpsWindowStartedAt = now;
        framesInWindow = 0;
      }
    }

    if (animationRunning) frameId = window.requestAnimationFrame(animate);
  };

  const startAnimation = (): void => {
    if (destroyed || animationRunning || !documentVisible || !inViewport) return;
    animationRunning = true;
    const now = performance.now();
    lastRenderedAt = now;
    fpsWindowStartedAt = now;
    framesInWindow = 0;
    performanceController.reset(currentQuality);
    setLoopStatus('running');
    frameId = window.requestAnimationFrame(animate);
  };

  const viewportObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          ([entry]) => {
            inViewport = entry?.isIntersecting ?? false;
            if (inViewport) startAnimation();
            else stopAnimation();
          },
          { rootMargin: '120px 0px', threshold: 0.01 },
        )
      : null;
  viewportObserver?.observe(host);

  const onVisibilityChange = (): void => {
    documentVisible = !document.hidden;
    if (documentVisible && inViewport) startAnimation();
    else stopAnimation();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  host.dataset.rendererStatus = 'active';
  startAnimation();

  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    stopAnimation();
    viewportObserver?.disconnect();
    resizeObserver.disconnect();
    themeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    unsubscribe();

    scene.clear();
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    renderer.dispose();

    delete host.dataset.rendererCore;
    delete host.dataset.rendererPreferredBackend;
    delete host.dataset.rendererBackend;
    delete host.dataset.rendererQuality;
    delete host.dataset.rendererDpr;
    delete host.dataset.rendererFps;
    delete host.dataset.rendererTargetFps;
    delete host.dataset.rendererAdaptation;
    delete host.dataset.rendererLoop;
    delete host.dataset.rendererTheme;
    host.dataset.rendererStatus = 'idle';
    experienceState.resetRenderer();
  };

  return { backend: actualBackend, destroy };
}

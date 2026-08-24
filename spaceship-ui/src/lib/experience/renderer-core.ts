import {
  BufferAttribute,
  BufferGeometry,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  Group,
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
  Vector3,
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
    accent: rootStyle.getPropertyValue('--experience-accent').trim() || '#315e51',
    accentStrong: rootStyle.getPropertyValue('--experience-accent-strong').trim() || '#24483e',
    muted: theme === 'dark' ? '#aaa99f' : '#667064',
    theme,
  };
}

function researchNodePosition(index: number, count: number): [number, number, number] {
  const layout: [number, number, number][] = [
    [-1.55, 0.92, 0.04],
    [0.62, 1.18, -0.04],
    [1.5, -0.58, 0.06],
    [-0.68, -1.16, -0.06],
  ];
  const fallbackX = -1.6 + (index / Math.max(1, count - 1)) * 3.2;
  return layout[index] ?? [fallbackX, index % 2 === 0 ? 0.7 : -0.7, 0];
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
  const overviewCameraZ = variant === 'home' ? 5.4 : 5.1;
  const focusedCameraZ = variant === 'home' ? 4.45 : 4.15;
  camera.position.set(0, 0, overviewCameraZ);
  camera.lookAt(0, 0, 0);

  const cameraLookTarget = new Vector3();
  const desiredCameraPosition = new Vector3(0, 0, overviewCameraZ);
  const desiredLookTarget = new Vector3();
  const topologyFocus = new Vector3();
  const desiredTopologyPosition = new Vector3();

  const topology = new Group();
  scene.add(topology);

  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const nodeRecords: NodeRecord[] = [];
  const nodePositions = new Map<ConcreteResearchNode, [number, number, number]>();

  const centralGeometry = new BoxGeometry(0.2, 0.2, 0.2);
  const centralMaterial = new MeshBasicMaterial({
    color: new Color(palette.accentStrong),
    transparent: true,
    opacity: 0.9,
    wireframe: true,
  });
  geometries.add(centralGeometry);
  materials.add(centralMaterial);
  const central = new Mesh(centralGeometry, centralMaterial);
  const overviewCentralScale = variant === 'home' ? 1.18 : 1;
  central.scale.setScalar(overviewCentralScale);
  topology.add(central);

  RESEARCH_NODE_IDS.forEach((rawId, index) => {
    if (!isResearchNodeId(rawId)) return;
    const id: ConcreteResearchNode = rawId;
    const geometry = new BoxGeometry(0.15, 0.15, 0.15);
    const material = new MeshBasicMaterial({
      color: new Color(palette.muted),
      transparent: true,
      opacity: 0.62,
      wireframe: true,
    });
    geometries.add(geometry);
    materials.add(material);

    const mesh = new Mesh(geometry, material);
    const position = researchNodePosition(index, RESEARCH_NODE_IDS.length);
    nodePositions.set(id, position);
    mesh.position.set(...position);
    topology.add(mesh);
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
      ...(nodePositions.get(next.id) ?? [0, 0, 0])
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
  topology.add(new LineSegments(edgeGeometry, edgeMaterial));

  const particlePositions = new Float32Array(profile.particleCount * 3);
  const columnCount = Math.max(8, Math.ceil(Math.sqrt(profile.particleCount * 1.5)));
  const rowCount = Math.max(2, Math.ceil(profile.particleCount / columnCount));
  for (let index = 0; index < profile.particleCount; index += 1) {
    const column = index % columnCount;
    const row = Math.floor(index / columnCount);
    particlePositions[index * 3] =
      (column / Math.max(1, columnCount - 1) - 0.5) * 4.5 + (row % 2) * 0.08;
    particlePositions[index * 3 + 1] = (row / Math.max(1, rowCount - 1) - 0.5) * 3.3;
    particlePositions[index * 3 + 2] = ((index % 5) - 2) * 0.035;
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
  topology.add(particles);

  let latestSnapshot = experienceState.get();

  const activeResearchFocus = (): ConcreteResearchNode | null => {
    const active = latestSnapshot.activeResearchNode;
    return active && isResearchNodeId(active) ? active : null;
  };

  const updateFocusDiagnostics = (): void => {
    const active = activeResearchFocus();
    host.dataset.rendererFocus = active ?? 'overview';
    host.dataset.rendererFocusIndex = active ? String(RESEARCH_NODE_IDS.indexOf(active)) : '-1';
  };

  const updateNodePalette = (): void => {
    const active = activeResearchFocus();
    for (const record of nodeRecords) {
      const selected = record.id === active;
      record.material.color.set(selected ? palette.accentStrong : palette.muted);
      record.material.opacity = selected ? 1 : active ? 0.46 : 0.62;
    }
  };

  const applyThemePalette = (): void => {
    palette = readRendererPalette();
    centralMaterial.color.set(palette.accentStrong);
    edgeMaterial.color.set(palette.accent);
    particleMaterial.color.set(palette.accent);
    updateNodePalette();
    host.dataset.rendererTheme = palette.theme;
  };

  const unsubscribe = experienceState.subscribe((snapshot) => {
    latestSnapshot = snapshot;
    updateNodePalette();
    updateFocusDiagnostics();
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
      Math.min(window.devicePixelRatio || 1, profile.dprCap, preset.dprCap)
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
      Math.round(profile.particleCount * preset.particleRatio)
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
      const active = activeResearchFocus();
      const activeIndex = active ? RESEARCH_NODE_IDS.indexOf(active) : -1;
      const hasFocus = activeIndex >= 0;
      const chapterProgress = hasFocus
        ? activeIndex / Math.max(1, RESEARCH_NODE_IDS.length - 1)
        : 0.5;
      const [focusX, focusY, focusZ] = active
        ? (nodePositions.get(active) ?? [0, 0, 0])
        : [0, 0, 0];
      topologyFocus.set(focusX, focusY, focusZ);

      // Scroll selects the research line; pointer movement only adds bounded
      // local parallax. The selected line moves the topology and camera together.
      const topologyShift = variant === 'home' ? 0.48 : 0.58;
      desiredTopologyPosition.set(
        hasFocus ? -topologyFocus.x * topologyShift : 0,
        hasFocus ? -topologyFocus.y * topologyShift : 0,
        hasFocus ? 0.14 + chapterProgress * 0.06 : 0
      );
      const topologyBlend = Math.min(1, deltaSeconds * 2.7);
      topology.position.x = MathUtils.lerp(
        topology.position.x,
        desiredTopologyPosition.x,
        topologyBlend
      );
      topology.position.y = MathUtils.lerp(
        topology.position.y,
        desiredTopologyPosition.y,
        topologyBlend
      );
      topology.position.z = MathUtils.lerp(
        topology.position.z,
        desiredTopologyPosition.z,
        topologyBlend
      );

      const targetWorldScale = hasFocus ? 1.08 + chapterProgress * 0.1 : 1;
      const nextTopologyScale = MathUtils.lerp(
        topology.scale.x,
        targetWorldScale,
        Math.min(1, deltaSeconds * 2.5)
      );
      topology.scale.setScalar(nextTopologyScale);

      const chapterYaw = hasFocus ? (chapterProgress - 0.5) * 0.86 : 0;
      const chapterPitch = hasFocus ? (0.5 - chapterProgress) * 0.18 : 0;
      const targetRotationY = chapterYaw + pointerX * 0.14 + scroll * 0.2;
      const targetRotationX =
        chapterPitch + pointerY * -0.1 + (variant === 'research' ? -0.035 : 0.025);
      topology.rotation.y = MathUtils.lerp(
        topology.rotation.y,
        targetRotationY,
        Math.min(1, deltaSeconds * 3.2)
      );
      topology.rotation.x = MathUtils.lerp(
        topology.rotation.x,
        targetRotationX,
        Math.min(1, deltaSeconds * 3.2)
      );

      desiredCameraPosition.set(
        (hasFocus ? topologyFocus.x * 0.12 : 0) + pointerX * 0.1,
        (hasFocus ? topologyFocus.y * 0.1 : 0) - pointerY * 0.07,
        hasFocus ? focusedCameraZ + chapterProgress * 0.16 : overviewCameraZ
      );
      const cameraBlend = Math.min(1, deltaSeconds * 2.8);
      camera.position.x = MathUtils.lerp(camera.position.x, desiredCameraPosition.x, cameraBlend);
      camera.position.y = MathUtils.lerp(camera.position.y, desiredCameraPosition.y, cameraBlend);
      camera.position.z = MathUtils.lerp(camera.position.z, desiredCameraPosition.z, cameraBlend);

      desiredLookTarget.set(
        hasFocus ? topologyFocus.x * 0.035 : 0,
        hasFocus ? topologyFocus.y * 0.035 : 0,
        hasFocus ? 0.05 : 0
      );
      cameraLookTarget.lerp(desiredLookTarget, Math.min(1, deltaSeconds * 3));
      camera.lookAt(cameraLookTarget);

      particles.position.x = MathUtils.lerp(
        particles.position.x,
        pointerX * (currentQuality === 'high' ? 0.08 : 0.04),
        Math.min(1, deltaSeconds * 2)
      );
      particles.position.y = MathUtils.lerp(
        particles.position.y,
        -pointerY * 0.05,
        Math.min(1, deltaSeconds * 2)
      );
      const targetParticleScale = hasFocus ? 1.03 + chapterProgress * 0.08 : 1;
      const nextParticleScale = MathUtils.lerp(
        particles.scale.x,
        targetParticleScale,
        Math.min(1, deltaSeconds * 2.2)
      );
      particles.scale.setScalar(nextParticleScale);

      for (const record of nodeRecords) {
        const selected = active === record.id;
        const targetScale = selected ? 1.82 : hasFocus ? 0.92 : 1;
        const nextScale = MathUtils.lerp(
          record.mesh.scale.x,
          targetScale,
          Math.min(1, deltaSeconds * 7)
        );
        record.mesh.scale.setScalar(nextScale);
      }

      const targetCentralScale = hasFocus ? 0.88 + chapterProgress * 0.05 : overviewCentralScale;
      const nextCentralScale = MathUtils.lerp(
        central.scale.x,
        targetCentralScale,
        Math.min(1, deltaSeconds * 4)
      );
      central.scale.setScalar(nextCentralScale);
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
          { rootMargin: '120px 0px', threshold: 0.01 }
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
    delete host.dataset.rendererFocus;
    delete host.dataset.rendererFocusIndex;
    host.dataset.rendererStatus = 'idle';
    experienceState.resetRenderer();
  };

  return { backend: actualBackend, destroy };
}

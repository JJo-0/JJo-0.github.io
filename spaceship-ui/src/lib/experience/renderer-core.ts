import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
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
  guide: string;
  theme: 'light' | 'dark';
}

interface BackendFlags {
  isWebGPUBackend?: boolean;
  isWebGLBackend?: boolean;
}

const TOPOLOGY_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [
  [-1.55, 0.92, 0.04],
  [1.48, 0.74, -0.05],
  [1.08, -1.0, 0.08],
  [-1.38, -0.82, -0.08],
];

function readRendererPalette(): RendererPalette {
  const rootStyle = getComputedStyle(document.documentElement);
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  return {
    accent: rootStyle.getPropertyValue('--experience-accent').trim() || '#5e7f78',
    accentStrong:
      rootStyle.getPropertyValue('--experience-accent-strong').trim() || '#3f6760',
    muted: theme === 'dark' ? '#a7aaa3' : '#7a7b74',
    guide: theme === 'dark' ? '#525a52' : '#c8c1b4',
    theme,
  };
}

function researchNodePosition(index: number): [number, number, number] {
  const source = TOPOLOGY_POSITIONS[index % TOPOLOGY_POSITIONS.length] ?? [0, 0, 0];
  return [source[0], source[1], source[2]];
}

function readActualBackend(renderer: WebGPURenderer): ActiveRendererBackend {
  const backend = renderer.backend as typeof renderer.backend & BackendFlags;
  if (backend.isWebGPUBackend) return 'webgpu';
  if (backend.isWebGLBackend) return 'webgl2';
  throw new Error('WebGPURenderer initialized without a recognized backend');
}

function buildContourSegments(): number[] {
  const output: number[] = [];
  const rows = [-1.35, -0.9, -0.45, 0, 0.45, 0.9, 1.35];
  const columns = 14;

  for (const [rowIndex, baseY] of rows.entries()) {
    for (let column = 0; column < columns; column += 1) {
      const x1 = -2.15 + (column / columns) * 4.3;
      const x2 = -2.15 + ((column + 1) / columns) * 4.3;
      const y1 = baseY + Math.sin(column * 0.72 + rowIndex * 0.9) * 0.055;
      const y2 = baseY + Math.sin((column + 1) * 0.72 + rowIndex * 0.9) * 0.055;
      output.push(x1, y1, -0.3, x2, y2, -0.3);
    }
  }

  return output;
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
  const camera = new PerspectiveCamera(38, 1, 0.1, 20);
  const overviewCameraZ = variant === 'home' ? 5.6 : 5.2;
  const focusedCameraZ = variant === 'home' ? 4.85 : 4.55;
  camera.position.set(0, 0, overviewCameraZ);
  camera.lookAt(0, 0, 0);

  const desiredCameraPosition = new Vector3(0, 0, overviewCameraZ);
  const desiredLookTarget = new Vector3();
  const cameraLookTarget = new Vector3();
  const desiredWorldPosition = new Vector3();
  const focusVector = new Vector3();

  const topology = new Group();
  scene.add(topology);

  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const nodeRecords: NodeRecord[] = [];
  const nodePositions = new Map<ConcreteResearchNode, [number, number, number]>();

  const hubGeometry = new PlaneGeometry(0.2, 0.2);
  const hubMaterial = new MeshBasicMaterial({
    color: new Color(palette.accentStrong),
    transparent: true,
    opacity: 0.78,
  });
  geometries.add(hubGeometry);
  materials.add(hubMaterial);
  const hub = new Mesh(hubGeometry, hubMaterial);
  topology.add(hub);

  RESEARCH_NODE_IDS.forEach((rawId, index) => {
    if (!isResearchNodeId(rawId)) return;
    const id: ConcreteResearchNode = rawId;
    const geometry = new PlaneGeometry(0.13, 0.13);
    const material = new MeshBasicMaterial({
      color: new Color(palette.muted),
      transparent: true,
      opacity: 0.6,
    });
    geometries.add(geometry);
    materials.add(material);

    const mesh = new Mesh(geometry, material);
    const position = researchNodePosition(index);
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
  const crossPairs: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [0, 2],
  ];
  for (const [fromIndex, toIndex] of crossPairs) {
    const from = nodeRecords[fromIndex];
    const to = nodeRecords[toIndex];
    if (!from || !to) continue;
    edgePoints.push(
      ...(nodePositions.get(from.id) ?? [0, 0, 0]),
      ...(nodePositions.get(to.id) ?? [0, 0, 0]),
    );
  }

  const edgeGeometry = new BufferGeometry();
  edgeGeometry.setAttribute('position', new Float32BufferAttribute(edgePoints, 3));
  const edgeMaterial = new LineBasicMaterial({
    color: new Color(palette.accent),
    transparent: true,
    opacity: variant === 'home' ? 0.18 : 0.24,
  });
  geometries.add(edgeGeometry);
  materials.add(edgeMaterial);
  const edges = new LineSegments(edgeGeometry, edgeMaterial);
  topology.add(edges);

  const contourGeometry = new BufferGeometry();
  contourGeometry.setAttribute('position', new Float32BufferAttribute(buildContourSegments(), 3));
  const contourMaterial = new LineBasicMaterial({
    color: new Color(palette.guide),
    transparent: true,
    opacity: variant === 'home' ? 0.16 : 0.2,
  });
  geometries.add(contourGeometry);
  materials.add(contourMaterial);
  const contours = new LineSegments(contourGeometry, contourMaterial);
  topology.add(contours);

  const particlePositions = new Float32Array(profile.particleCount * 3);
  const columns = Math.max(4, Math.ceil(Math.sqrt(profile.particleCount * 1.7)));
  for (let index = 0; index < profile.particleCount; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = -2.05 + (column / Math.max(1, columns - 1)) * 4.1;
    const y = 1.55 - row * 0.38;
    particlePositions[index * 3] = x + Math.sin(index * 1.71) * 0.055;
    particlePositions[index * 3 + 1] = y + Math.cos(index * 1.13) * 0.045;
    particlePositions[index * 3 + 2] = -0.18 + ((index % 5) - 2) * 0.025;
  }

  const particleGeometry = new BufferGeometry();
  particleGeometry.setAttribute('position', new BufferAttribute(particlePositions, 3));
  const particleMaterial = new PointsMaterial({
    color: new Color(palette.accent),
    size: 0.025,
    sizeAttenuation: true,
    transparent: true,
    opacity: variant === 'home' ? 0.24 : 0.32,
    depthWrite: false,
  });
  geometries.add(particleGeometry);
  materials.add(particleMaterial);
  const signalField = new Points(particleGeometry, particleMaterial);
  topology.add(signalField);

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
      record.material.opacity = selected ? 0.98 : active ? 0.34 : 0.6;
      record.mesh.scale.setScalar(selected ? 1.38 : 1);
    }
  };

  const applyThemePalette = (): void => {
    palette = readRendererPalette();
    hubMaterial.color.set(palette.accentStrong);
    edgeMaterial.color.set(palette.accent);
    contourMaterial.color.set(palette.guide);
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
    particleMaterial.size = quality === 'high' ? 0.027 : quality === 'balanced' ? 0.023 : 0.019;
    contourMaterial.opacity = quality === 'low' ? 0.11 : variant === 'home' ? 0.16 : 0.2;
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
      const [focusX, focusY, focusZ] = active ? (nodePositions.get(active) ?? [0, 0, 0]) : [0, 0, 0];
      focusVector.set(focusX, focusY, focusZ);

      // The scene is a research topology, not an orbital system. Scroll selects
      // a field; the topology translates and the camera reframes that evidence
      // cluster while pointer movement contributes only bounded local parallax.
      const worldShift = variant === 'home' ? 0.34 : 0.42;
      desiredWorldPosition.set(
        hasFocus ? -focusVector.x * worldShift : 0,
        hasFocus ? -focusVector.y * worldShift : 0,
        hasFocus ? 0.08 + chapterProgress * 0.04 : 0,
      );
      const worldBlend = Math.min(1, deltaSeconds * 3.1);
      topology.position.x = MathUtils.lerp(topology.position.x, desiredWorldPosition.x, worldBlend);
      topology.position.y = MathUtils.lerp(topology.position.y, desiredWorldPosition.y, worldBlend);
      topology.position.z = MathUtils.lerp(topology.position.z, desiredWorldPosition.z, worldBlend);

      desiredCameraPosition.set(
        (hasFocus ? focusX * 0.12 : 0) + pointerX * 0.08,
        (hasFocus ? focusY * 0.1 : 0) - pointerY * 0.06,
        hasFocus ? focusedCameraZ : overviewCameraZ,
      );
      desiredLookTarget.set(
        hasFocus ? focusX * 0.08 : 0,
        hasFocus ? focusY * 0.07 : 0,
        0,
      );
      const cameraBlend = Math.min(1, deltaSeconds * 2.9);
      camera.position.lerp(desiredCameraPosition, cameraBlend);
      cameraLookTarget.lerp(desiredLookTarget, cameraBlend);
      camera.lookAt(cameraLookTarget);

      topology.rotation.x = MathUtils.lerp(topology.rotation.x, -pointerY * 0.025, cameraBlend);
      topology.rotation.y = MathUtils.lerp(topology.rotation.y, pointerX * 0.035, cameraBlend);
      topology.rotation.z = MathUtils.lerp(topology.rotation.z, 0, cameraBlend);
      signalField.position.x = MathUtils.lerp(signalField.position.x, pointerX * 0.025, cameraBlend);
      signalField.position.y = MathUtils.lerp(
        signalField.position.y,
        (scroll - 0.5) * 0.06 - pointerY * 0.018,
        cameraBlend,
      );
      hub.scale.setScalar(hasFocus ? 0.78 : 1);

      renderer.render(scene, camera);
    }

    const fpsWindowMs = now - fpsWindowStartedAt;
    if (fpsWindowMs >= 1_000) {
      const measuredFps = (framesInWindow * 1000) / Math.max(1, fpsWindowMs);
      const snapshot = performanceController.sample(measuredFps, now);
      const roundedFps = Math.round(snapshot.filteredFps || measuredFps);
      host.dataset.rendererFps = String(roundedFps);
      if (experienceState.get().fps !== roundedFps) experienceState.patch({ fps: roundedFps });
      if (snapshot.transition) applyQuality(snapshot.quality, snapshot.reason);
      else host.dataset.rendererAdaptation = snapshot.reason;
      framesInWindow = 0;
      fpsWindowStartedAt = now;
    }

    frameId = window.requestAnimationFrame(animate);
  };

  const startAnimation = (): void => {
    if (destroyed || animationRunning || !documentVisible || !inViewport) return;
    animationRunning = true;
    const now = performance.now();
    lastRenderedAt = now;
    fpsWindowStartedAt = now;
    framesInWindow = 0;
    setLoopStatus('running');
    frameId = window.requestAnimationFrame(animate);
  };

  const viewportObserver = new IntersectionObserver(
    ([entry]) => {
      inViewport = entry?.isIntersecting ?? false;
      if (inViewport) startAnimation();
      else stopAnimation();
    },
    { rootMargin: '120px 0px', threshold: 0.01 },
  );
  viewportObserver.observe(host);

  const onVisibilityChange = (): void => {
    documentVisible = !document.hidden;
    if (documentVisible) startAnimation();
    else stopAnimation();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  resize();
  updateFocusDiagnostics();
  startAnimation();

  return {
    backend: actualBackend,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      stopAnimation();
      viewportObserver.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      unsubscribe();
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      renderer.dispose();
      delete host.dataset.rendererCore;
      delete host.dataset.rendererFocus;
      delete host.dataset.rendererFocusIndex;
    },
  };
}

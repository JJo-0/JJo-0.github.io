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
  WebGLRenderer,
} from 'three';
import type { Material } from 'three';
import type { CapabilityProfile } from './capability';
import { experienceState, type ResearchNodeId } from './state';

const RENDERER_CORE_SENTINEL = '__JJO_RENDERER_CORE__';
const RESEARCH_NODE_IDS = ['robotics-systems', 'vision-perception', 'ai-research'] as const;
type ConcreteResearchNode = (typeof RESEARCH_NODE_IDS)[number];

export type RendererVariant = 'home' | 'research';

export interface RendererMountOptions {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  profile: CapabilityProfile;
  variant: RendererVariant;
}

export interface RendererHandle {
  destroy: () => void;
}

interface NodeRecord {
  id: ConcreteResearchNode;
  mesh: Mesh;
  material: MeshBasicMaterial;
}

const NODE_POSITIONS: Record<ConcreteResearchNode, [number, number, number]> = {
  'robotics-systems': [-1.48, 0.92, 0.08],
  'vision-perception': [1.46, 0.96, 0.16],
  'ai-research': [0.05, -1.25, -0.08],
};

function isConcreteResearchNode(value: ResearchNodeId): value is ConcreteResearchNode {
  return value !== null && RESEARCH_NODE_IDS.includes(value);
}

export function mountExperienceRenderer({
  host,
  canvas,
  profile,
  variant,
}: RendererMountOptions): RendererHandle {
  if (profile.backend !== 'webgl2') {
    throw new Error(`Renderer core requires WebGL2; received ${profile.backend}`);
  }

  // renderer-core itself is dynamically imported only after SAFE checks and
  // viewport proximity. Named Three.js imports keep this lazy chunk tree-shakeable.
  host.dataset.rendererCore = RENDERER_CORE_SENTINEL;

  const rootStyle = getComputedStyle(document.documentElement);
  const accent = rootStyle.getPropertyValue('--experience-accent').trim() || '#0891b2';
  const accentStrong =
    rootStyle.getPropertyValue('--experience-accent-strong').trim() || '#0e7490';
  const muted = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b';

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: profile.antialias,
    depth: true,
    powerPreference: profile.tier === 'ultra' ? 'high-performance' : 'low-power',
    preserveDrawingBuffer: false,
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 20);
  camera.position.set(0, 0, variant === 'home' ? 5.4 : 5.1);

  const constellation = new Group();
  scene.add(constellation);

  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const nodeRecords: NodeRecord[] = [];

  const centralGeometry = new IcosahedronGeometry(0.12, 1);
  const centralMaterial = new MeshBasicMaterial({
    color: new Color(accentStrong),
    transparent: true,
    opacity: 0.9,
  });
  geometries.add(centralGeometry);
  materials.add(centralMaterial);
  const central = new Mesh(centralGeometry, centralMaterial);
  central.scale.setScalar(variant === 'home' ? 1.18 : 1);
  constellation.add(central);

  for (const id of RESEARCH_NODE_IDS) {
    const geometry = new IcosahedronGeometry(0.09, 1);
    const material = new MeshBasicMaterial({
      color: new Color(muted),
      transparent: true,
      opacity: 0.62,
    });
    geometries.add(geometry);
    materials.add(material);

    const mesh = new Mesh(geometry, material);
    mesh.position.set(...NODE_POSITIONS[id]);
    constellation.add(mesh);
    nodeRecords.push({ id, mesh, material });
  }

  const edgePoints: number[] = [];
  const pairs: Array<[ConcreteResearchNode | 'center', ConcreteResearchNode | 'center']> = [
    ['center', 'robotics-systems'],
    ['center', 'vision-perception'],
    ['center', 'ai-research'],
    ['robotics-systems', 'vision-perception'],
    ['vision-perception', 'ai-research'],
    ['ai-research', 'robotics-systems'],
  ];

  const positionFor = (id: ConcreteResearchNode | 'center'): [number, number, number] =>
    id === 'center' ? [0, 0, 0] : NODE_POSITIONS[id];

  for (const [from, to] of pairs) {
    edgePoints.push(...positionFor(from), ...positionFor(to));
  }

  const edgeGeometry = new BufferGeometry();
  edgeGeometry.setAttribute('position', new Float32BufferAttribute(edgePoints, 3));
  const edgeMaterial = new LineBasicMaterial({
    color: new Color(accent),
    transparent: true,
    opacity: variant === 'home' ? 0.2 : 0.27,
  });
  geometries.add(edgeGeometry);
  materials.add(edgeMaterial);
  constellation.add(new LineSegments(edgeGeometry, edgeMaterial));

  const ringGeometry = new TorusGeometry(1.96, 0.005, 6, 96);
  const ringMaterial = new MeshBasicMaterial({
    color: new Color(accent),
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
    color: new Color(accent),
    size: profile.tier === 'ultra' ? 0.034 : 0.027,
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
  const unsubscribe = experienceState.subscribe((snapshot) => {
    latestSnapshot = snapshot;
    const active = snapshot.activeResearchNode;

    for (const record of nodeRecords) {
      const selected = isConcreteResearchNode(active) && record.id === active;
      record.material.color.set(selected ? accentStrong : muted);
      record.material.opacity = selected ? 1 : 0.62;
    }
  });

  const resize = (): void => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, profile.dprCap);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  let inViewport = true;
  const viewportObserver = new IntersectionObserver(
    ([entry]) => {
      inViewport = entry?.isIntersecting ?? false;
    },
    { rootMargin: '120px 0px', threshold: 0.01 },
  );
  viewportObserver.observe(host);

  let documentVisible = !document.hidden;
  const onVisibilityChange = (): void => {
    documentVisible = !document.hidden;
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  let frameId = 0;
  let lastRenderedAt = performance.now();
  let fpsWindowStartedAt = lastRenderedAt;
  let framesInWindow = 0;
  const minimumFrameInterval = 1000 / profile.maxFps;

  const animate = (now: number): void => {
    frameId = window.requestAnimationFrame(animate);
    if (!documentVisible || !inViewport || now - lastRenderedAt < minimumFrameInterval) return;

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
    particles.rotation.z += deltaSeconds * (profile.tier === 'ultra' ? 0.045 : 0.025);
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

    if (now - fpsWindowStartedAt >= 1000) {
      const fps = Math.round((framesInWindow * 1000) / (now - fpsWindowStartedAt));
      experienceState.patch({ fps });
      fpsWindowStartedAt = now;
      framesInWindow = 0;
    }
  };

  frameId = window.requestAnimationFrame(animate);
  host.dataset.rendererStatus = 'active';
  host.dataset.rendererBackend = 'webgl2';

  const destroy = (): void => {
    window.cancelAnimationFrame(frameId);
    viewportObserver.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    unsubscribe();

    scene.clear();
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();

    delete host.dataset.rendererCore;
    delete host.dataset.rendererBackend;
    host.dataset.rendererStatus = 'idle';
    experienceState.resetRenderer();
  };

  return { destroy };
}

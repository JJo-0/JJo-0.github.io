import * as THREE from 'three';
import type { ExperienceCapabilities } from './capabilities';

export const RESEARCH_RENDERER_MARKER = '__jjoResearchRenderer';

export interface ResearchRendererHandle {
  setActive: (id: string) => void;
  destroy: () => void;
}

interface RendererNode {
  id: string;
  position: readonly [number, number, number];
}

interface ResearchRendererOptions {
  capabilities: ExperienceCapabilities;
  nodeIds: string[];
}

const BASE_COLOR = new THREE.Color(0x64748b);
const ACTIVE_COLOR = new THREE.Color(0x22d3ee);
const SECONDARY_COLOR = new THREE.Color(0x8b5cf6);

const NODE_POSITIONS: readonly (readonly [number, number, number])[] = [
  [-1.85, 1.15, 0.25],
  [1.85, 1.05, -0.15],
  [0, -1.75, 0.35],
];

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function createParticles(count: number): THREE.Points | null {
  if (count <= 0) return null;

  const random = seededRandom(20260820);
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const radius = 1.8 + random() * 2.25;
    const angle = random() * Math.PI * 2;
    const height = (random() - 0.5) * 3.8;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = height;
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.42;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: ACTIVE_COLOR,
    size: 0.035,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}

function createLineGeometry(nodes: RendererNode[]): THREE.BufferGeometry {
  const center: readonly [number, number, number] = [0, 0, 0];
  const segments: number[] = [];

  for (const node of nodes) {
    segments.push(...center, ...node.position);
  }

  for (let index = 0; index < nodes.length; index += 1) {
    const next = nodes[(index + 1) % nodes.length];
    segments.push(...nodes[index].position, ...next.position);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
  return geometry;
}

function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Points) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) material.dispose();
    }
  });
}

export function createResearchRenderer(
  container: HTMLElement,
  options: ResearchRendererOptions,
): ResearchRendererHandle {
  const { capabilities } = options;
  const nodes: RendererNode[] = options.nodeIds.slice(0, 3).map((id, index) => ({
    id,
    position: NODE_POSITIONS[index] ?? [0, 0, 0],
  }));

  const canvas = document.createElement('canvas');
  canvas.className = 'research-gpu-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);
  container.dataset.rendererMarker = RESEARCH_RENDERER_MARKER;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: capabilities.antialias,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.15, 7.2);

  const root = new THREE.Group();
  root.rotation.x = -0.08;
  scene.add(root);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: ACTIVE_COLOR,
    transparent: true,
    opacity: capabilities.tier === 'ultra' ? 0.32 : 0.22,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(createLineGeometry(nodes), lineMaterial);
  root.add(lines);

  const centerMaterial = new THREE.MeshBasicMaterial({
    color: SECONDARY_COLOR,
    transparent: true,
    opacity: 0.72,
  });
  const center = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), centerMaterial);
  root.add(center);

  const nodeMeshes = new Map<string, THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>>();
  const ringMeshes: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>[] = [];

  for (const node of nodes) {
    const material = new THREE.MeshBasicMaterial({
      color: BASE_COLOR,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), material);
    mesh.position.set(...node.position);
    mesh.userData.targetScale = 1;
    root.add(mesh);
    nodeMeshes.set(node.id, mesh);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: ACTIVE_COLOR,
      transparent: true,
      opacity: capabilities.tier === 'ultra' ? 0.18 : 0.1,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.012, 8, 44), ringMaterial);
    ring.position.copy(mesh.position);
    ring.rotation.x = Math.PI / 2;
    root.add(ring);
    ringMeshes.push(ring);
  }

  const particles = createParticles(capabilities.particleCount);
  if (particles) root.add(particles);

  const wrapper = container.parentElement ?? container;
  const pointer = new THREE.Vector2();
  let activeId = nodes[0]?.id ?? '';
  let frame = 0;
  let visible = true;
  let destroyed = false;
  const clock = new THREE.Clock();

  const resize = (): void => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, capabilities.dprCap);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const setActive = (id: string): void => {
    if (!nodeMeshes.has(id)) return;
    activeId = id;
    for (const [nodeId, mesh] of nodeMeshes) {
      mesh.userData.targetScale = nodeId === activeId ? 1.55 : 1;
      mesh.material.color.copy(nodeId === activeId ? ACTIVE_COLOR : BASE_COLOR);
      mesh.material.opacity = nodeId === activeId ? 1 : 0.78;
    }
  };

  const renderFrame = (): void => {
    if (destroyed || !visible) return;
    const elapsed = clock.getElapsedTime();

    root.rotation.y += (pointer.x * 0.1 + Math.sin(elapsed * 0.18) * 0.045 - root.rotation.y) * 0.035;
    root.rotation.x += (-0.08 - pointer.y * 0.055 - root.rotation.x) * 0.035;
    center.rotation.x = elapsed * 0.22;
    center.rotation.y = elapsed * 0.3;

    ringMeshes.forEach((ring, index) => {
      ring.rotation.z = elapsed * (0.08 + index * 0.018);
    });

    if (particles) particles.rotation.y = elapsed * 0.025;

    for (const mesh of nodeMeshes.values()) {
      const target = Number(mesh.userData.targetScale ?? 1);
      const scale = THREE.MathUtils.lerp(mesh.scale.x, target, 0.08);
      mesh.scale.setScalar(scale);
    }

    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(renderFrame);
  };

  const start = (): void => {
    if (destroyed || frame || !visible) return;
    clock.start();
    frame = window.requestAnimationFrame(renderFrame);
  };

  const stop = (): void => {
    if (!frame) return;
    window.cancelAnimationFrame(frame);
    frame = 0;
    clock.stop();
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return;
    const rect = wrapper.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
  };

  const onPointerLeave = (): void => pointer.set(0, 0);
  const onVisibilityChange = (): void => {
    visible = !document.hidden;
    if (visible) start();
    else stop();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      visible = Boolean(entry?.isIntersecting) && !document.hidden;
      if (visible) start();
      else stop();
    },
    { rootMargin: '160px' },
  );
  visibilityObserver.observe(container);

  wrapper.addEventListener('pointermove', onPointerMove, { passive: true });
  wrapper.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  resize();
  setActive(activeId);
  start();

  return {
    setActive,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      wrapper.removeEventListener('pointermove', onPointerMove);
      wrapper.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      disposeObject(root);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      container.removeAttribute('data-renderer-marker');
    },
  };
}

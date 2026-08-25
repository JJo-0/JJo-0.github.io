type Point3 = { x: number; y: number; z: number; edge: boolean };
type GraphNode = {
  id: string;
  title: string;
  href: string;
  category: string;
  subcategory: string;
  type: string;
  tags: string[];
  x: number;
  y: number;
  z: number;
};
type GraphEdge = { source: string; target: string; weight: number; reasons: string[] };
type PostGraph = { nodes: GraphNode[]; edges: GraphEdge[] };

type AsciiRuntime = { destroy: () => void };

declare global {
  interface Window {
    __jjoAsciiRuntime?: AsciiRuntime;
  }
}

const GLYPHS = ['·', ':', '+', '*', '#', '@'];
const HOST_SELECTOR = '[data-experience-canvas]';

function buildArtifact(): Point3[] {
  const points: Point3[] = [];
  const steps = 15;
  const addFace = (axis: 'x' | 'y' | 'z', sign: number): void => {
    for (let row = 0; row < steps; row += 1) {
      for (let column = 0; column < steps; column += 1) {
        const a = -1 + (column / (steps - 1)) * 2;
        const b = -1 + (row / (steps - 1)) * 2;
        const edge = row === 0 || column === 0 || row === steps - 1 || column === steps - 1;
        const inset = 1 - 0.17 * Math.cos(a * Math.PI * 0.5) * Math.cos(b * Math.PI * 0.5);
        if (axis === 'x') points.push({ x: sign * inset, y: a, z: b, edge });
        if (axis === 'y') points.push({ x: a, y: sign * inset, z: b, edge });
        if (axis === 'z') points.push({ x: a, y: b, z: sign * inset, edge });
      }
    }
  };

  addFace('x', -1);
  addFace('x', 1);
  addFace('y', -1);
  addFace('y', 1);
  addFace('z', -1);
  addFace('z', 1);
  return points;
}

const artifact = buildArtifact();

function readGraph(host: HTMLElement): PostGraph | null {
  try {
    const graph = JSON.parse(host.dataset.postGraph ?? 'null');
    return graph && Array.isArray(graph.nodes) && Array.isArray(graph.edges) ? graph : null;
  } catch {
    return null;
  }
}

function installGraphCanvas(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  graph: PostGraph
): () => void {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return () => {};
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const anchors = new Map(
    [...host.querySelectorAll<HTMLAnchorElement>('[data-post-graph-node]')].map((anchor) => [
      anchor.dataset.postGraphNode ?? '',
      anchor,
    ])
  );
  const tooltip = host.querySelector<HTMLOutputElement>('[data-post-graph-tooltip]');
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const adjacency = new Map<string, GraphEdge[]>();
  for (const edge of graph.edges) {
    adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge]);
    adjacency.set(edge.target, [...(adjacency.get(edge.target) ?? []), edge]);
  }
  let width = 1,
    height = 1,
    dpr = 1,
    frame = 0,
    visible = true,
    dragging = false,
    interacting = false,
    rotationX = -0.34,
    rotationY = 0.18,
    targetX = rotationX,
    targetY = rotationY,
    velocityX = 0,
    velocityY = 0,
    hoveredId: string | null = null,
    lastTime = performance.now(),
    lastDrawAt = 0,
    renderCount = 0;
  let ink = '#24483e';
  let muted = '#667064';
  const refreshPalette = () => {
    const style = getComputedStyle(document.documentElement);
    ink = style.getPropertyValue('--experience-accent-strong').trim() || '#24483e';
    muted = style.getPropertyValue('--color-muted-foreground').trim() || '#667064';
  };
  refreshPalette();
  const projected = new Map<string, { x: number; y: number; z: number; scale: number }>();
  const resize = () => {
    const bounds = host.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const project = (node: GraphNode, cx: number, sx: number, cy: number, sy: number) => {
    const x1 = node.x * cy - node.z * sy,
      z1 = node.x * sy + node.z * cy,
      y1 = node.y * cx - z1 * sx,
      z2 = node.y * sx + z1 * cx,
      perspective = 4.8 / (5.8 - z2),
      size = Math.min(width, height) * 0.205;
    return {
      x: width * 0.5 + x1 * size * perspective,
      y: height * 0.51 + y1 * size * perspective,
      z: z2,
      scale: perspective,
    };
  };
  const showTooltip = (id: string | null) => {
    hoveredId = id;
    if (!tooltip) return;
    if (!id) {
      tooltip.removeAttribute('data-visible');
      tooltip.textContent = '';
      return;
    }
    const node = nodeById.get(id),
      point = projected.get(id);
    if (!node || !point) return;
    const relations = (adjacency.get(id) ?? []).flatMap((edge) => edge.reasons).slice(0, 2);
    tooltip.innerHTML = `<strong>${node.title}</strong><span>${node.category} / ${node.subcategory}</span><span>${node.tags
      .slice(0, 3)
      .map((tag) => `#${tag}`)
      .join(' · ')}</span>${relations.length ? `<span>↔ ${relations.join(' · ')}</span>` : ''}`;
    tooltip.style.setProperty(
      '--tooltip-x',
      `${Math.min(width - 285, Math.max(12, point.x + 14))}px`
    );
    tooltip.style.setProperty(
      '--tooltip-y',
      `${Math.min(height - 122, Math.max(70, point.y - 18))}px`
    );
    tooltip.setAttribute('data-visible', '');
  };
  const draw = (time: number) => {
    frame = 0;
    if (!visible) return;
    if (!reducedMotion.matches && time - lastDrawAt < 1000 / 30) {
      frame = requestAnimationFrame(draw);
      return;
    }
    lastDrawAt = time;
    renderCount += 1;
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (!reducedMotion.matches) {
      if (!interacting) targetY += delta * 0.11;
      rotationX += (targetX - rotationX) * Math.min(1, delta * 3.5);
      rotationY += (targetY - rotationY) * Math.min(1, delta * 3.5);
      rotationX += velocityX * delta;
      rotationY += velocityY * delta;
      velocityX *= Math.pow(0.06, delta);
      velocityY *= Math.pow(0.06, delta);
    }
    context.clearRect(0, 0, width, height);
    const cx = Math.cos(rotationX),
      sx = Math.sin(rotationX),
      cy = Math.cos(rotationY),
      sy = Math.sin(rotationY);
    projected.clear();
    for (const node of graph.nodes) projected.set(node.id, project(node, cx, sx, cy, sy));
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (const edge of graph.edges) {
      const a = projected.get(edge.source),
        b = projected.get(edge.target);
      if (!a || !b) continue;
      const active = hoveredId === edge.source || hoveredId === edge.target,
        distance = Math.hypot(b.x - a.x, b.y - a.y),
        count = Math.max(2, Math.floor(distance / 15));
      context.font = `${active ? 700 : 500} ${active ? 10 : 8}px ui-monospace,SFMono-Regular,Menlo,monospace`;
      context.fillStyle = active ? ink : muted;
      for (let i = 1; i < count; i += 1) {
        const progress = i / count;
        context.globalAlpha = active ? 0.9 : 0.24 + ((a.z + b.z + 5) / 10) * 0.22;
        context.fillText(
          active && i % 7 === 0 ? '>' : i % 3 === 0 ? '+' : '·',
          a.x + (b.x - a.x) * progress,
          a.y + (b.y - a.y) * progress
        );
      }
    }
    for (const node of [...graph.nodes].sort(
      (a, b) => (projected.get(a.id)?.z ?? 0) - (projected.get(b.id)?.z ?? 0)
    )) {
      const point = projected.get(node.id);
      if (!point) continue;
      const active = hoveredId === node.id,
        depth = Math.max(0, Math.min(1, (point.z + 3.5) / 7)),
        glyph = active
          ? '@'
          : (GLYPHS[Math.min(GLYPHS.length - 1, Math.floor(depth * GLYPHS.length))] ?? '+');
      context.globalAlpha = active ? 1 : 0.42 + depth * 0.5;
      context.fillStyle = active ? ink : muted;
      context.font = `${active ? 800 : 650} ${active ? 19 : 9 + depth * 7}px ui-monospace,SFMono-Regular,Menlo,monospace`;
      context.fillText(glyph, point.x, point.y);
      if ((adjacency.get(node.id)?.length ?? 0) >= 3) {
        context.font = `500 ${6 + depth * 2}px ui-monospace,SFMono-Regular,Menlo,monospace`;
        context.globalAlpha = active ? 0.7 : 0.17 + depth * 0.12;
        const halo = 9 + depth * 5;
        for (let orbit = 0; orbit < 6; orbit += 1) {
          const angle = (orbit / 6) * Math.PI * 2 + rotationY * 0.35;
          context.fillText(
            '·',
            point.x + Math.cos(angle) * halo,
            point.y + Math.sin(angle) * halo * 0.55
          );
        }
      }
      if (renderCount % 2 === 0 || reducedMotion.matches) {
        const anchor = anchors.get(node.id);
        anchor?.style.setProperty('--node-x', `${point.x}px`);
        anchor?.style.setProperty('--node-y', `${point.y}px`);
      }
    }
    context.globalAlpha = 1;
    if (hoveredId) showTooltip(hoveredId);
    if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
  };
  const start = () => {
      if (!frame && visible) {
        lastTime = performance.now();
        frame = requestAnimationFrame(draw);
      }
    },
    stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
  const onPointerMove = (event: PointerEvent) => {
    if (dragging) {
      velocityY = event.movementX * 0.012;
      velocityX = event.movementY * 0.012;
      targetY += event.movementX * 0.005;
      targetX += event.movementY * 0.005;
    }
  };
  const onPointerEnter = () => {
    interacting = true;
  };
  const onPointerDown = (event: PointerEvent) => {
      if ((event.target as Element).closest('[data-post-graph-node]')) return;
      dragging = true;
      host.setPointerCapture(event.pointerId);
    },
    onPointerUp = (event: PointerEvent) => {
      dragging = false;
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    },
    onPointerLeave = () => {
      interacting = false;
    };
  const anchorCleanups: Array<() => void> = [];
  for (const [id, anchor] of anchors) {
    const enter = () => showTooltip(id),
      leave = () => showTooltip(null);
    anchor.addEventListener('pointerenter', enter);
    anchor.addEventListener('pointerleave', leave);
    anchor.addEventListener('focus', enter);
    anchor.addEventListener('blur', leave);
    anchorCleanups.push(() => {
      anchor.removeEventListener('pointerenter', enter);
      anchor.removeEventListener('pointerleave', leave);
      anchor.removeEventListener('focus', enter);
      anchor.removeEventListener('blur', leave);
    });
  }
  const onMotionChange = () => {
    stop();
    if (reducedMotion.matches) draw(performance.now());
    else start();
  };
  const themeObserver = new MutationObserver(refreshPalette);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const ro = new ResizeObserver(resize),
    io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) start();
        else stop();
      },
      { rootMargin: '120px 0px' }
    );
  ro.observe(host);
  io.observe(host);
  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerenter', onPointerEnter, { passive: true });
  host.addEventListener('pointerdown', onPointerDown);
  host.addEventListener('pointerup', onPointerUp);
  host.addEventListener('pointercancel', onPointerUp);
  host.addEventListener('pointerleave', onPointerLeave, { passive: true });
  reducedMotion.addEventListener('change', onMotionChange);
  resize();
  if (reducedMotion.matches) draw(performance.now());
  else start();
  return () => {
    stop();
    ro.disconnect();
    io.disconnect();
    themeObserver.disconnect();
    anchorCleanups.forEach((cleanup) => cleanup());
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerenter', onPointerEnter);
    host.removeEventListener('pointerdown', onPointerDown);
    host.removeEventListener('pointerup', onPointerUp);
    host.removeEventListener('pointercancel', onPointerUp);
    host.removeEventListener('pointerleave', onPointerLeave);
    reducedMotion.removeEventListener('change', onMotionChange);
  };
}

function installCanvas(host: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const graph = readGraph(host);
  if (graph) return installGraphCanvas(host, canvas, graph);
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return () => {};

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1;
  let height = 1;
  let dpr = 1;
  let frame = 0;
  let visible = true;
  let dragging = false;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = -0.28;
  let targetY = 0.52;
  let rotationX = targetX;
  let rotationY = targetY;
  let velocityX = 0;
  let velocityY = 0.22;
  let lastTime = performance.now();

  const resize = (): void => {
    const bounds = host.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (time: number): void => {
    frame = 0;
    if (!visible) return;
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    if (!reducedMotion.matches) {
      targetY += delta * 0.22;
      rotationX += (targetX + pointerY * 0.3 - rotationX) * Math.min(1, delta * 4.2);
      rotationY += (targetY + pointerX * 0.48 - rotationY) * Math.min(1, delta * 4.2);
      rotationX += velocityX * delta;
      rotationY += velocityY * delta;
      velocityX *= Math.pow(0.08, delta);
      velocityY *= Math.pow(0.13, delta);
    }

    context.clearRect(0, 0, width, height);
    const style = getComputedStyle(document.documentElement);
    const ink = style.getPropertyValue('--experience-accent-strong').trim() || '#24483e';
    const muted = style.getPropertyValue('--color-muted-foreground').trim() || '#667064';
    const cosineX = Math.cos(rotationX);
    const sineX = Math.sin(rotationX);
    const cosineY = Math.cos(rotationY);
    const sineY = Math.sin(rotationY);
    const size =
      Math.min(width, height) * (host.dataset.experienceCanvas === 'home' ? 0.235 : 0.205);
    const centerX = width * 0.51;
    const centerY = height * 0.51;
    const projected: Array<{ x: number; y: number; z: number; edge: boolean }> = [];

    for (const point of artifact) {
      const x1 = point.x * cosineY - point.z * sineY;
      const z1 = point.x * sineY + point.z * cosineY;
      const y1 = point.y * cosineX - z1 * sineX;
      const z2 = point.y * sineX + z1 * cosineX;
      const perspective = 3.8 / (4.6 - z2);
      projected.push({
        x: centerX + x1 * size * perspective,
        y: centerY + y1 * size * perspective,
        z: z2,
        edge: point.edge,
      });
    }

    projected.sort((a, b) => a.z - b.z);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (const point of projected) {
      const depth = Math.max(0, Math.min(1, (point.z + 1.7) / 3.4));
      const glyphIndex = Math.min(GLYPHS.length - 1, Math.floor(depth * GLYPHS.length));
      const fontSize = (point.edge ? 12.5 : 10.5) + depth * 3.5;
      context.font = `${point.edge ? 700 : 500} ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context.globalAlpha = 0.13 + depth * (point.edge ? 0.8 : 0.58);
      context.fillStyle = point.edge ? ink : muted;
      context.fillText(GLYPHS[glyphIndex] ?? '@', point.x, point.y);
    }
    context.globalAlpha = 1;

    if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
  };

  const start = (): void => {
    if (frame || !visible) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(draw);
  };
  const stop = (): void => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const onPointerMove = (event: PointerEvent): void => {
    const bounds = host.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointerY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    if (dragging) {
      velocityY = event.movementX * 0.018;
      velocityX = event.movementY * 0.018;
      targetY += event.movementX * 0.006;
      targetX += event.movementY * 0.006;
    }
  };
  const onPointerDown = (event: PointerEvent): void => {
    dragging = true;
    host.setPointerCapture(event.pointerId);
  };
  const onPointerUp = (event: PointerEvent): void => {
    dragging = false;
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
  };
  const onPointerLeave = (): void => {
    if (!dragging) {
      pointerX = 0;
      pointerY = 0;
    }
  };
  const onMotionChange = (): void => {
    stop();
    if (reducedMotion.matches) draw(performance.now());
    else start();
  };

  const resizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) start();
      else stop();
    },
    { rootMargin: '120px 0px' }
  );
  resizeObserver.observe(host);
  visibilityObserver.observe(host);
  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerdown', onPointerDown);
  host.addEventListener('pointerup', onPointerUp);
  host.addEventListener('pointercancel', onPointerUp);
  host.addEventListener('pointerleave', onPointerLeave, { passive: true });
  reducedMotion.addEventListener('change', onMotionChange);
  resize();
  if (reducedMotion.matches) draw(performance.now());
  else start();

  return () => {
    stop();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerdown', onPointerDown);
    host.removeEventListener('pointerup', onPointerUp);
    host.removeEventListener('pointercancel', onPointerUp);
    host.removeEventListener('pointerleave', onPointerLeave);
    reducedMotion.removeEventListener('change', onMotionChange);
  };
}

export function installAsciiArtRuntime(): void {
  if (typeof window === 'undefined' || window.__jjoAsciiRuntime) return;
  let cleanups: Array<() => void> = [];

  const cleanup = (): void => {
    cleanups.forEach((dispose) => dispose());
    cleanups = [];
  };
  const init = (): void => {
    cleanup();
    document.querySelectorAll<HTMLElement>(HOST_SELECTOR).forEach((host) => {
      const canvas = host.querySelector<HTMLCanvasElement>('[data-ascii-art]');
      if (canvas) cleanups.push(installCanvas(host, canvas));
    });
  };
  const destroy = (): void => {
    cleanup();
    document.removeEventListener('astro:page-load', init);
    document.removeEventListener('astro:before-swap', cleanup);
    window.__jjoAsciiRuntime = undefined;
  };

  document.addEventListener('astro:page-load', init);
  document.addEventListener('astro:before-swap', cleanup);
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  window.__jjoAsciiRuntime = { destroy };
}

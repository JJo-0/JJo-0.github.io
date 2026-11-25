import { parseGraphPayload } from './graph-json.mjs';

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
    const graph = parseGraphPayload(host.querySelector<HTMLScriptElement>('script[data-post-graph-source]')?.textContent ?? host.dataset.postGraph ?? 'null');
    return graph && Array.isArray(graph.nodes) && Array.isArray(graph.edges) ? graph : null;
  } catch {
    return null;
  }
}

// A static graph redraws only for a changed view, hover/focus, theme or size.
// Projection records and ordering are reused; hover never changes link positions.
function installGraphCanvas(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  graph: PostGraph,
  onPaint: () => void = () => {}
): () => void {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) throw new Error('2D canvas unavailable');
  const anchors = new Map(
    [...host.querySelectorAll<HTMLAnchorElement>('[data-post-graph-node]')].map((anchor) => [
      anchor.dataset.postGraphNode ?? '', anchor,
    ])
  );
  const tooltip = host.querySelector<HTMLOutputElement>('[data-post-graph-tooltip]');
  const nodeById = new Map(graph.nodes.map(node => [node.id, node]));
  const adjacency = new Map<string, GraphEdge[]>();
  for (const edge of graph.edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, []);
    adjacency.get(edge.source)?.push(edge);
    adjacency.get(edge.target)?.push(edge);
  }
  const projected = new Map(graph.nodes.map(node => [node.id, { x: 0, y: 0, z: 0 }]));
  const order = [...graph.nodes];
  let width = 1, height = 1, dpr = 1, frame = 0;
  let visible = false, dirty = true, projectionDirty = true, painted = false;
  let dragging = false, rotationX = -0.34, rotationY = 0.18;
  let hoverId: string | null = null, focusId: string | null = null, shownId: string | null = null;
  let ink = '#24483e', muted = '#667064';
  const refreshPalette = () => {
    const style = getComputedStyle(document.documentElement);
    ink = style.getPropertyValue('--experience-accent-strong').trim() || '#24483e';
    muted = style.getPropertyValue('--color-muted-foreground').trim() || '#667064';
  };
  refreshPalette();

  const updateTooltip = (id: string | null) => {
    if (!tooltip) return;
    if (!id) {
      tooltip.removeAttribute('data-visible');
      if (shownId !== null) tooltip.textContent = '';
      shownId = null;
      return;
    }
    const node = nodeById.get(id), point = projected.get(id);
    if (!node || !point) return;
    if (shownId !== id) {
      const title = document.createElement('strong');
      title.textContent = node.title;
      const category = document.createElement('span');
      category.textContent = node.category + ' / ' + node.subcategory;
      const tags = document.createElement('span');
      tags.textContent = node.tags.slice(0, 3).map(tag => '#' + tag).join(' · ');
      const related = document.createElement('span');
      related.textContent = '↔ ' + (adjacency.get(id) ?? []).flatMap(edge => edge.reasons).slice(0, 2).join(' · ');
      tooltip.replaceChildren(title, category, tags, ...(related.textContent === '↔ ' ? [] : [related]));
      shownId = id;
    }
    tooltip.style.setProperty('--tooltip-x', Math.min(Math.max(12, width - 285), Math.max(12, point.x + 14)) + 'px');
    tooltip.style.setProperty('--tooltip-y', Math.min(Math.max(12, height - 122), Math.max(12, point.y - 18)) + 'px');
    tooltip.setAttribute('data-visible', '');
  };

  const draw = () => {
    frame = 0;
    if (!visible || document.hidden || !dirty) return;
    dirty = false;
    const activeId = hoverId ?? focusId;
    if (projectionDirty) {
      const cx = Math.cos(rotationX), sx = Math.sin(rotationX);
      const cy = Math.cos(rotationY), sy = Math.sin(rotationY);
      const size = Math.min(width, height) * 0.205;
      for (const node of graph.nodes) {
        const point = projected.get(node.id)!;
        const x = node.x * cy - node.z * sy, z = node.x * sy + node.z * cy;
        const y = node.y * cx - z * sx;
        point.z = node.y * sx + z * cx;
        const perspective = 4.8 / (5.8 - point.z);
        point.x = width * 0.5 + x * size * perspective;
        point.y = height * 0.51 + y * size * perspective;
        const anchor = anchors.get(node.id);
        anchor?.style.setProperty('--node-x', point.x + 'px');
        anchor?.style.setProperty('--node-y', point.y + 'px');
      }
      order.sort((a, b) => projected.get(a.id)!.z - projected.get(b.id)!.z);
      projectionDirty = false;
    }
    context.clearRect(0, 0, width, height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (const edge of graph.edges) {
      const a = projected.get(edge.source), b = projected.get(edge.target);
      if (!a || !b) continue;
      const active = activeId === edge.source || activeId === edge.target;
      const count = Math.max(2, Math.floor(Math.hypot(b.x - a.x, b.y - a.y) / 15));
      context.font = (active ? '700 10px' : '500 8px') + ' ui-monospace,SFMono-Regular,Menlo,monospace';
      context.fillStyle = active ? ink : muted;
      context.globalAlpha = active ? 0.9 : 0.24 + ((a.z + b.z + 5) / 10) * 0.22;
      for (let i = 1; i < count; i++) {
        const t = i / count;
        context.fillText(active && i % 7 === 0 ? '>' : i % 3 === 0 ? '+' : '·',
          a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
      }
    }
    for (const node of order) {
      const point = projected.get(node.id)!;
      const active = activeId === node.id;
      const depth = Math.max(0, Math.min(1, (point.z + 3.5) / 7));
      const glyph = active ? '@' : (GLYPHS[Math.min(GLYPHS.length - 1, Math.floor(depth * GLYPHS.length))] ?? '+');
      context.globalAlpha = active ? 1 : 0.42 + depth * 0.5;
      context.fillStyle = active ? ink : muted;
      context.font = (active ? '800 19' : '650 ' + Math.round(9 + depth * 7)) + 'px ui-monospace,SFMono-Regular,Menlo,monospace';
      context.fillText(glyph, point.x, point.y);
      if ((adjacency.get(node.id)?.length ?? 0) >= 3) {
        context.font = '500 ' + Math.round(6 + depth * 2) + 'px ui-monospace,SFMono-Regular,Menlo,monospace';
        context.globalAlpha = active ? 0.7 : 0.17 + depth * 0.12;
        const halo = 9 + depth * 5;
        for (let orbit = 0; orbit < 6; orbit++) {
          const angle = (orbit / 6) * Math.PI * 2 + rotationY * 0.35;
          context.fillText('·', point.x + Math.cos(angle) * halo, point.y + Math.sin(angle) * halo * 0.55);
        }
      }
    }
    context.globalAlpha = 1;
    updateTooltip(activeId);
    if (!painted) { painted = true; onPaint(); }
  };
  const start = () => {
    if (!frame && dirty && visible && !document.hidden) frame = requestAnimationFrame(draw);
  };
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const invalidate = (projection = false) => {
    dirty = true;
    projectionDirty ||= projection;
    start();
  };
  const resize = () => {
    const bounds = host.getBoundingClientRect();
    const w = Math.max(1, bounds.width), h = Math.max(1, bounds.height);
    const ratio = Math.min(devicePixelRatio || 1, 1.75);
    if (painted && w === width && h === height && ratio === dpr) return;
    width = w; height = h; dpr = ratio;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    invalidate(true);
  };
  const nodeId = (target: EventTarget | null) => target instanceof Element
    ? target.closest<HTMLElement>('[data-post-graph-node]')?.dataset.postGraphNode ?? null : null;
  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return;
    rotationY += event.movementX * 0.005;
    rotationX += event.movementY * 0.005;
    invalidate(true);
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || (event.target as Element).closest('a,button')) return;
    dragging = true;
    host.setPointerCapture(event.pointerId);
  };
  const onPointerUp = (event: PointerEvent) => {
    dragging = false;
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
  };
  const onPointerOver = (event: PointerEvent) => {
    const id = nodeId(event.target);
    if (hoverId !== id) { hoverId = id; invalidate(); }
  };
  const onPointerOut = (event: PointerEvent) => {
    const id = nodeId(event.relatedTarget);
    if (hoverId !== id) { hoverId = id; invalidate(); }
  };
  const onFocusIn = (event: FocusEvent) => {
    const id = nodeId(event.target);
    if (focusId !== id) { focusId = id; invalidate(); }
  };
  const onFocusOut = (event: FocusEvent) => {
    const id = nodeId(event.relatedTarget);
    if (focusId !== id) { focusId = id; invalidate(); }
  };
  const themeObserver = new MutationObserver(() => { refreshPalette(); invalidate(); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) start(); else stop();
  }, { rootMargin: '0px' });
  ro.observe(host); io.observe(host);
  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerdown', onPointerDown);
  host.addEventListener('pointerup', onPointerUp);
  host.addEventListener('pointercancel', onPointerUp);
  host.addEventListener('lostpointercapture', onPointerUp);
  host.addEventListener('pointerover', onPointerOver);
  host.addEventListener('pointerout', onPointerOut);
  host.addEventListener('focusin', onFocusIn);
  host.addEventListener('focusout', onFocusOut);
  const onVisibilityChange = () => { if (document.hidden) stop(); else start(); };
  document.addEventListener('visibilitychange', onVisibilityChange);
  resize();
  return () => {
    stop(); ro.disconnect(); io.disconnect(); themeObserver.disconnect();
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerdown', onPointerDown);
    host.removeEventListener('pointerup', onPointerUp);
    host.removeEventListener('pointercancel', onPointerUp);
    host.removeEventListener('lostpointercapture', onPointerUp);
    host.removeEventListener('pointerover', onPointerOver);
    host.removeEventListener('pointerout', onPointerOut);
    host.removeEventListener('focusin', onFocusIn);
    host.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

export function mountWritingGraph(host: HTMLElement, canvas: HTMLCanvasElement, payload: string, onPaint: () => void): () => void {
  const graph: PostGraph = parseGraphPayload(payload);
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) throw new Error('Invalid graph payload');
  const nav = host.querySelector<HTMLElement>('.post-graph-links');
  if (!nav) throw new Error('Missing graph navigation');
  const fragment = document.createDocumentFragment();
  for (const node of graph.nodes) {
    if (!/^\/(?:en\/)?posts\//.test(node.href)) throw new Error('Invalid graph article URL');
    const anchor = document.createElement('a');
    anchor.href = node.href;
    anchor.dataset.postGraphNode = node.id;
    anchor.setAttribute('aria-label', node.title + '. ' + node.category);
    fragment.append(anchor);
  }
  nav.replaceChildren(fragment);
  try {
    const stop = installGraphCanvas(host, canvas, graph, onPaint);
    return () => { stop(); nav.replaceChildren(); };
  } catch (error) {
    nav.replaceChildren();
    throw error;
  }
}

export function installCanvas(host: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const graph = readGraph(host);
  if (graph) return installGraphCanvas(host, canvas, graph);
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return () => {};

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
  const autoAnimate = () => !reducedMotion.matches && finePointer.matches;
  let width = 1;
  let height = 1;
  let dpr = 1;
  let frame = 0;
  let visible = false;
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
    start();
  };

  const draw = (time: number): void => {
    frame = 0;
    if (!visible || document.hidden) return;
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    if (autoAnimate()) {
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

    if (autoAnimate()) frame = requestAnimationFrame(draw);
  };

  const start = (): void => {
    if (frame || !visible || document.hidden) return;
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
    if (!autoAnimate()) { rotationX = targetX; rotationY = targetY; }
    start();
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
    start();
  };

  const themeObserver = new MutationObserver(() => start());
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const resizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) start();
      else stop();
    },
    { rootMargin: '0px' }
  );
  resizeObserver.observe(host);
  visibilityObserver.observe(host);
  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerdown', onPointerDown);
  host.addEventListener('pointerup', onPointerUp);
  host.addEventListener('pointercancel', onPointerUp);
  host.addEventListener('pointerleave', onPointerLeave, { passive: true });
  const onVisibilityChange = () => { if (document.hidden) stop(); else start(); };
  finePointer.addEventListener('change', onMotionChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMotion.addEventListener('change', onMotionChange);
  resize();
  start();

  return () => {
    stop();
    themeObserver.disconnect();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerdown', onPointerDown);
    host.removeEventListener('pointerup', onPointerUp);
    host.removeEventListener('pointercancel', onPointerUp);
    host.removeEventListener('pointerleave', onPointerLeave);
    finePointer.removeEventListener('change', onMotionChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);
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

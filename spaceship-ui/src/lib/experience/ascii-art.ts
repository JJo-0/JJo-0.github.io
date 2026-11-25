import { parseGraphPayload } from './graph-json.mjs';
import { graphVisual, graphDepth, projectAtlas, atlasProjectionRadius, stepAtlasRotation, wrapAtlasYaw } from './graph-visuals.mjs';

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

const GLYPHS = ['·', ':', '+', '*', '#', '@'];

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

// The writing graph never needs the decorative fallback geometry.
let artifact: Point3[] | undefined;

function readGraph(host: HTMLElement): PostGraph | null {
  try {
    const graph = parseGraphPayload(host.querySelector<HTMLScriptElement>('script[data-post-graph-source]')?.textContent ?? host.dataset.postGraph ?? 'null');
    return graph && Array.isArray(graph.nodes) && Array.isArray(graph.edges) ? graph : null;
  } catch {
    return null;
  }
}

// Draw only for active motion or a changed view, hover/focus, theme or size.
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
  const projected = new Map(graph.nodes.map(node => [node.id, { x: 0, y: 0, z: 0, hit: 0, stack: 0 }]));
  const order = [...graph.nodes];
  const nodeStyles = new Map(graph.nodes.map(node => [node.id, graphVisual(node.category)]));
  const categoryButtons = [...host.querySelectorAll<HTMLButtonElement>('[data-graph-category]')];
  const english = host.dataset.graphUrl?.includes('/en.json') ?? false;
  const activeEdges = new Map(graph.nodes.map(node => [node.id, new Set(adjacency.get(node.id) ?? [])]));
  let width = 1, height = 1, dpr = 1, frame = 0;
  let visible = false, dirty = true, projectionDirty = true, painted = false;
  let dragPointer: number | null = null, lastX = 0, lastY = 0;
  let rotationX = -0.34, rotationY = 0.18, lastDrawAt = -Infinity;
  let targetX = rotationX, targetY = rotationY;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const fitRadius = atlasProjectionRadius(graph.nodes);
  let hoverId: string | null = null, focusId: string | null = null, shownId: string | null = null;
  let ink = '#24483e', muted = '#667064', paper = '#f8f4ea', dark = false;
  let activeCategory: string | null = null;
  const nodeInk = (id: string) => { const style = nodeStyles.get(id)!; return dark ? style.dark : style.light; };
  const refreshPalette = () => {
    const style = getComputedStyle(document.documentElement);
    ink = style.getPropertyValue('--experience-accent-strong').trim() || '#24483e';
    muted = style.getPropertyValue('--color-muted-foreground').trim() || '#667064';
    paper = style.getPropertyValue('--color-card').trim() || '#f8f4ea';
    dark = document.documentElement.classList.contains('dark');
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
      const style = nodeStyles.get(id)!;
      tooltip.style.setProperty('--graph-light', style.light);
      tooltip.style.setProperty('--graph-dark', style.dark);
      const title = document.createElement('strong');
      title.textContent = node.title;
      const category = document.createElement('span');
      category.textContent = node.category + ' / ' + node.subcategory;
      const tags = document.createElement('span');
      tags.textContent = node.tags.slice(0, 3).map(tag => '#' + tag).join(' · ');
      const relations = [...(adjacency.get(id) ?? [])].sort((a,b) => b.weight-a.weight);
      const related = document.createElement('span');
      related.className = 'post-graph-relation';
      related.textContent = english ? relations.length + ' related articles' : '연결된 게시글 ' + relations.length + '개';
      const relationRows = relations.slice(0, 3).map(edge => {
        const row = document.createElement('span');
        row.className = 'post-graph-relation';
        const neighbor = nodeById.get(edge.source === id ? edge.target : edge.source);
        row.textContent = '↳ ' + (neighbor?.title ?? '') + (edge.reasons[0] ? ' · ' + edge.reasons[0] : '');
        return row;
      });
      tooltip.replaceChildren(title, category, tags, related, ...relationRows);
      shownId = id;
    }
    tooltip.style.setProperty('--tooltip-x', Math.min(Math.max(12, width - 285), Math.max(12, point.x + 14)) + 'px');
    tooltip.style.setProperty('--tooltip-y', Math.min(Math.max(12, height - 190), Math.max(12, point.y - 18)) + 'px');
    tooltip.setAttribute('data-visible', '');
  };

  const draw = (time: number) => {
    frame = 0;
    if (!visible || document.hidden || !dirty) return;
    // Paint at display cadence up to approximately 60 Hz, only until settled.
    // A small tolerance avoids skipping nominal 60 Hz frames due to jitter.
    if (time - lastDrawAt < 1000 / 60 - 1) { frame = requestAnimationFrame(draw); return; }
    const elapsed = Number.isFinite(lastDrawAt) ? Math.min(34, time - lastDrawAt) : 1000 / 60;
    lastDrawAt = time;
    const next = stepAtlasRotation({ x: rotationX, y: rotationY }, { x: targetX, y: targetY }, elapsed, motionPreference.matches, dragPointer !== null);
    projectionDirty ||= next.x !== rotationX || next.y !== rotationY;
    rotationX = next.x; rotationY = next.y;
    dirty = next.moving;
    const motionState = next.moving ? 'moving' : 'still';
    if (host.dataset.graphMotion !== motionState) host.dataset.graphMotion = motionState;
    const activeId = focusId ?? hoverId;
    if (projectionDirty) {
      for (const row of projectAtlas(graph.nodes, width, height, rotationX, rotationY, fitRadius)) {
        const point = projected.get(row.id)!;
        point.x = row.x; point.y = row.y; point.z = row.z;
        const anchor = anchors.get(row.id);
        anchor?.style.setProperty('--node-x', point.x + 'px');
        anchor?.style.setProperty('--node-y', point.y + 'px');
        const hit = Math.round(19 + graphDepth(point.z) * 8);
        if (point.hit !== hit) { point.hit = hit; anchor?.style.setProperty('--node-hit', hit + 'px'); }
      }
      order.sort((a, b) => projected.get(a.id)!.z - projected.get(b.id)!.z);
      order.forEach((node, index) => {
        const point = projected.get(node.id)!;
        const stack = index + 1;
        if (point.stack !== stack) { point.stack = stack; anchors.get(node.id)?.style.setProperty('--node-depth', String(stack)); }
      });
      projectionDirty = false;
    }
    context.clearRect(0, 0, width, height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineCap = 'round';
    const selectedEdges = activeId ? activeEdges.get(activeId) : undefined;
    const neighbors = new Set<string>();
    if (activeId && selectedEdges) {
      for (const edge of selectedEdges) neighbors.add(edge.source === activeId ? edge.target : edge.source);
    }
    const categoryMatch = (id: string) => !activeCategory || nodeById.get(id)?.category === activeCategory;
    const drawEdge = (edge: GraphEdge, selected: boolean) => {
      const a = projected.get(edge.source), b = projected.get(edge.target);
      if (!a || !b) return;
      const same = nodeById.get(edge.source)?.category === nodeById.get(edge.target)?.category;
      const relevant = categoryMatch(edge.source) || categoryMatch(edge.target);
      const depth = graphDepth((a.z + b.z) / 2);
      const weight = Math.min(1, Math.max(0, edge.weight / 20));
      context.strokeStyle = same ? nodeInk(edge.source) : (selected && activeId ? nodeInk(activeId) : selected ? ink : muted);
      context.globalAlpha = selected ? .96 : activeId || !relevant ? .08 : same ? .22 + .16 * depth + .16 * weight : .15 + .15 * depth + .11 * weight;
      context.lineWidth = selected ? 2.1 : .7 + weight * .8;
      context.setLineDash(same ? [] : [3, 4]);
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    };
    // Draw background relations first. Highlight exactly the incident edges,
    // never invent a relationship or turn a similarity edge into an arrow.
    for (const edge of graph.edges) if (!selectedEdges?.has(edge)) drawEdge(edge, false);
    if (selectedEdges) for (const edge of selectedEdges) drawEdge(edge, true);
    context.setLineDash([]);
    for (const node of order) {
      const point = projected.get(node.id)!;
      const selected = activeId === node.id;
      const linked = neighbors.has(node.id);
      const depth = graphDepth(point.z);
      const glyph = nodeStyles.get(node.id)!.glyph;
      const emphasis = selected || linked;
      const size = emphasis ? (selected ? 19 : 16) : Math.round(10 + depth * 6);
      const radius = emphasis ? size * .66 : size * .53;
      const alpha = activeId ? (emphasis ? 1 : .23) : categoryMatch(node.id) ? .88 + depth * .12 : .22;
      context.globalAlpha = alpha;
      context.fillStyle = paper;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = nodeInk(node.id);
      context.lineWidth = selected ? 2 : linked ? 1.5 : .8;
      context.stroke();
      context.fillStyle = nodeInk(node.id);
      // Depth is encoded by size; readable glyphs use full ink contrast.
      if (!activeId && categoryMatch(node.id)) context.globalAlpha = 1;
      context.font = '750 ' + size + 'px ui-monospace,SFMono-Regular,Menlo,monospace';
      context.fillText(glyph, point.x, point.y);
    }
    // Publish actual graph-focus state for accessibility and regression tests.
    if (activeId) host.dataset.graphFocused = activeId;
    else delete host.dataset.graphFocused;
    host.dataset.graphNeighborCount = String(neighbors.size);
    host.dataset.graphHighlightedEdges = String(selectedEdges?.size ?? 0);
    context.globalAlpha = 1;
    updateTooltip(activeId);
    if (!painted) { painted = true; onPaint(); }
    start();
  };
  const start = () => {
    if (!frame && dirty && visible && !document.hidden) frame = requestAnimationFrame(draw);
  };
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastDrawAt = -Infinity;
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
    if (dragPointer !== event.pointerId) return;
    targetY = wrapAtlasYaw(targetY + (event.clientX - lastX) * 0.005);
    targetX = Math.max(-1.3, Math.min(1.3, targetX + (event.clientY - lastY) * 0.005));
    lastX = event.clientX; lastY = event.clientY;
    invalidate();
  };
  const onPointerDown = (event: PointerEvent) => {
    if (dragPointer !== null || event.button !== 0 || (event.target as Element).closest('a,button')) return;
    dragPointer = event.pointerId;
    lastX = event.clientX; lastY = event.clientY;
    host.setPointerCapture(event.pointerId);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (dragPointer !== event.pointerId) return;
    dragPointer = null;
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
  const onControlClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('button');
    if (!button || !host.contains(button)) return;
    if (button.hasAttribute('data-graph-reset')) {
      targetX = -0.34; targetY = 0.18; activeCategory = null;
      for (const item of categoryButtons) item.setAttribute('aria-pressed', 'false');
      invalidate();
    } else if (button.hasAttribute('data-graph-rotate')) {
      targetY = wrapAtlasYaw(targetY + Number(button.dataset.graphRotate) * Math.PI / 8);
      invalidate();
    } else if (button.dataset.graphCategory) {
      activeCategory = activeCategory === button.dataset.graphCategory ? null : button.dataset.graphCategory;
      for (const item of categoryButtons) item.setAttribute('aria-pressed', String(item.dataset.graphCategory === activeCategory));
      invalidate();
    }
  };
  const themeObserver = new MutationObserver(() => { refreshPalette(); invalidate(); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) start(); else stop();
  }, { rootMargin: '0px' });
  ro.observe(host); io.observe(host);
  host.addEventListener('click', onControlClick);
  for (const button of categoryButtons) button.disabled = false;
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
  const onMotionPreference = () => invalidate();
  motionPreference.addEventListener('change', onMotionPreference);
  document.addEventListener('visibilitychange', onVisibilityChange);
  resize();
  return () => {
    stop(); ro.disconnect(); io.disconnect(); themeObserver.disconnect();
    host.removeEventListener('click', onControlClick);
    for (const button of categoryButtons) { button.disabled = true; button.setAttribute('aria-pressed', 'false'); }
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerdown', onPointerDown);
    host.removeEventListener('pointerup', onPointerUp);
    host.removeEventListener('pointercancel', onPointerUp);
    host.removeEventListener('lostpointercapture', onPointerUp);
    host.removeEventListener('pointerover', onPointerOver);
    host.removeEventListener('pointerout', onPointerOut);
    host.removeEventListener('focusin', onFocusIn);
    host.removeEventListener('focusout', onFocusOut);
    motionPreference.removeEventListener('change', onMotionPreference);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

export function mountWritingGraph(host: HTMLElement, canvas: HTMLCanvasElement, payload: string, onPaint: () => void): () => void {
  const graph: PostGraph = parseGraphPayload(payload);
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges) || graph.nodes.length === 0) throw new Error('Invalid graph payload');
  const nav = host.querySelector<HTMLElement>('.post-graph-links');
  if (!nav) throw new Error('Missing graph navigation');
  const fragment = document.createDocumentFragment();
  const prefix = host.dataset.graphUrl?.includes('/en.json') ? '/en/posts/' : '/posts/';
  const ids = new Set(graph.nodes.map(node => node.id));
  if (ids.size !== graph.nodes.length || graph.edges.some(edge => !ids.has(edge.source) || !ids.has(edge.target))) throw new Error('Invalid graph identities');
  for (const node of graph.nodes) {
    if (!node.href.startsWith(prefix)) throw new Error('Invalid graph article URL');
    const anchor = document.createElement('a');
    anchor.href = node.href;
    anchor.dataset.postGraphNode = node.id;
    const style = graphVisual(node.category);
    anchor.style.setProperty('--graph-light', style.light);
    anchor.style.setProperty('--graph-dark', style.dark);
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
  const points = (artifact ??= buildArtifact());

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

    for (const point of points) {
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

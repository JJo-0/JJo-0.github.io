import { parseGraphPayload } from './graph-json.mjs';
import { bundleAtlas, traceAtlasEdge } from './atlas-sphere.mjs';
import {
  graphNodeVisual, graphDepth, graphEdgeAppearance, graphEdgeStops, graphStar, graphStarOpacity, graphStarSize,
  atlasProjector, atlasProjectionRadius, stepAtlasRotation, wrapAtlasYaw,
} from './graph-visuals.mjs';

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

type SpectrumSampler = () => ArrayLike<number>;
type AudioHost = HTMLElement & { atlasAudioSample?: SpectrumSampler | null };
// The original and translation have the same model-space position.
function audioBand(node: GraphNode) {
  const seed = Math.imul(Math.round(node.x*1e4), 73856093) ^
    Math.imul(Math.round(node.y*1e4), 19349663) ^ Math.round(node.z*1e4);
  return (seed >>> 0) % 3;
}

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
  const edgeLayer = document.createElement('canvas');
  edgeLayer.dataset.graphEdgeLayer = '';
  const edgeContext = edgeLayer.getContext('2d', {alpha:true});
  if (!edgeContext) throw new Error('2D edge layer unavailable');
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
  const nodeStyles = new Map(graph.nodes.map(node => [node.id, graphNodeVisual(node)]));
  const spectralStops = new Map(graph.edges.map(edge => [
    edge, graphEdgeStops(nodeStyles.get(edge.source)!, nodeStyles.get(edge.target)!),
  ]));
  const strengths = new Map(graph.nodes.map(node => [
    node.id, (adjacency.get(node.id) ?? []).reduce((sum, edge) => sum + edge.weight, 0),
  ]));
  const edgeGradients = new Map<GraphEdge, CanvasGradient>();
  const hierarchy = bundleAtlas(graph.nodes);
  const routes = new Map(graph.edges.map(edge => {
    const world = hierarchy.route(nodeById.get(edge.source)!, nodeById.get(edge.target)!);
    return [edge, {world, screen:world.map(() => ({x:0, y:0, z:0}))}];
  }));
  const bands = new Map(graph.nodes.map(n => [n.id, audioBand(n)]));
  const neighborhood = new Map(graph.nodes.map(n => [n.id,
    new Set((adjacency.get(n.id) || []).map(e => e.source === n.id ? e.target : e.source))]));
  const noNeighbors = new Set<string>();
  const categoryButtons = [...host.querySelectorAll<HTMLButtonElement>('[data-graph-category]')];
  const zoomButtons = [...host.querySelectorAll<HTMLButtonElement>('[data-graph-zoom]')];
  const english = host.dataset.graphUrl?.includes('/en.json') ?? false;
  const activeEdges = new Map(graph.nodes.map(node => [node.id, new Set(adjacency.get(node.id) ?? [])]));
  let width = 1, height = 1, dpr = 1, frame = 0;
  let visible = false, dirty = true, projectionDirty = true, edgesDirty = true, painted = false;
  let lens = 0, targetLens = 0, audioTimer = 0, hoverTimer = 0;
  let readBands = (host as AudioHost).atlasAudioSample ?? null;
  let lastCost = 0, hoverLock = 0;
  let dwellX = -Infinity, dwellY = -Infinity;
  let pressX = 0, pressY = 0, moved = false, cancelClickUntil = -Infinity;
  let lastActiveId: string | null | undefined;
  let dragPointer: number | null = null, lastX = 0, lastY = 0;
  let rotationX = -0.34, rotationY = 0.18, lastDrawAt = -Infinity;
  let targetX = rotationX, targetY = rotationY;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const fitRadius = atlasProjectionRadius(graph.nodes);
  let hoverId: string | null = null, focusId: string | null = null, shownId: string | null = null;
  let dark = document.documentElement.classList.contains('dark');
  let activeCategory: string | null = null;
  const nodeInk = (id: string) => {
    const style = nodeStyles.get(id)!;
    return dark ? style.dark : style.light;
  };

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
      const band = (english ? ['Bass', 'Midrange', 'Treble'] : ['저음', '중음', '고음'])[bands.get(id)!];
      category.textContent = node.category + ' / ' + node.subcategory + ' · ' + band;
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
    const began = performance.now();
    const next = stepAtlasRotation({ x: rotationX, y: rotationY }, { x: targetX, y: targetY }, elapsed, motionPreference.matches, dragPointer !== null);
    const lensDelta = targetLens - lens;
    const newLens = motionPreference.matches || Math.abs(lensDelta) < .002 ? targetLens :
      lens + lensDelta * (1 - Math.exp(-elapsed / 76));
    projectionDirty ||= next.x !== rotationX || next.y !== rotationY || newLens !== lens;
    rotationX = next.x; rotationY = next.y; lens = newLens;
    dirty = next.moving || lens !== targetLens;
    const motionState = dirty ? 'moving' : 'still';
    if (host.dataset.graphMotion !== motionState) host.dataset.graphMotion = motionState;
    const activeId = focusId ?? hoverId;
    const viewChanged = projectionDirty;
    if (projectionDirty) {
      edgeGradients.clear();
      const project = atlasProjector(width, height, rotationX, rotationY, fitRadius, lens);
      for (const route of routes.values()) {
        route.world.forEach((point, i) => project(point, route.screen[i]));
      }
      for (const node of graph.nodes) {
        const point = projected.get(node.id)!;
        project(node, point);
        const anchor = anchors.get(node.id);
        if (anchor) anchor.style.translate = point.x.toFixed(3) + 'px ' + point.y.toFixed(3) + 'px';
        const hit = Math.round(24 + graphDepth(point.z) * 4);
        if (point.hit !== hit) { point.hit = hit; anchor?.style.setProperty('--node-hit', hit + 'px'); }
      }
      order.sort((a, b) => projected.get(a.id)!.z - projected.get(b.id)!.z);
      order.forEach((node, index) => {
        const point = projected.get(node.id)!;
        const stack = index + 1;
        if (point.stack !== stack) { point.stack = stack; anchors.get(node.id)?.style.setProperty('--node-depth', String(stack)); }
      });
      projectionDirty = false; edgesDirty = true;
    }
    context.clearRect(0, 0, width, height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineCap = 'round';
    const selectedEdges = activeId ? activeEdges.get(activeId) : undefined;
    const neighbors = (activeId && neighborhood.get(activeId)) || noNeighbors;
    const categoryMatch = (id: string) => !activeCategory || nodeById.get(id)?.category === activeCategory;
    if (edgesDirty || activeId !== lastActiveId) {
      const layer = edgeContext;
      layer.clearRect(0, 0, width, height);
      layer.lineCap = 'round';
      const drawEdge = (edge: GraphEdge, selected: boolean) => {
        const a = projected.get(edge.source)!, b = projected.get(edge.target)!;
        const bridge = nodeById.get(edge.source)!.category !== nodeById.get(edge.target)!.category;
        const relevant = categoryMatch(edge.source) || categoryMatch(edge.target);
        const appearance = graphEdgeAppearance((a.z + b.z) / 2, edge.weight);
        const ink = nodeInk(edge.source);
        if (ink === nodeInk(edge.target) || (a.x === b.x && a.y === b.y)) layer.strokeStyle = ink;
        else {
          let gradient = edgeGradients.get(edge);
          if (!gradient) {
            gradient = layer.createLinearGradient(a.x, a.y, b.x, b.y);
            for (const stop of spectralStops.get(edge)!) gradient.addColorStop(stop.offset, dark ? stop.dark : stop.light);
            edgeGradients.set(edge, gradient);
          }
          layer.strokeStyle = gradient;
        }
        layer.globalAlpha = selected ? .94 : activeId || !relevant ? .10 : appearance.opacity;
        layer.lineWidth = selected ? 1.5 : appearance.width;
        layer.setLineDash(bridge ? [2.3,3.2] : []);
        layer.beginPath();
        traceAtlasEdge(routes.get(edge)!.screen, bridge, selected, (x,y,dx,dy) => {
          layer.moveTo(x,y); layer.lineTo(x+dx,y+dy);
        });
        layer.stroke();
      };
      for (const edge of graph.edges) if (!selectedEdges?.has(edge)) drawEdge(edge, false);
      if (selectedEdges) for (const edge of selectedEdges) drawEdge(edge, true);
      edgesDirty = false;
    }
    context.globalAlpha = 1;
    context.drawImage(edgeLayer, 0, 0, width, height);
    const spectrum = readBands?.();
    const reduced = motionPreference.matches;
    for (const node of order) {
      const point = projected.get(node.id)!;
      const selected = activeId === node.id;
      const linked = neighbors.has(node.id);
      const strength = strengths.get(node.id)!;
      const size = graphStarSize(point.z, strength) + (selected ? 3 : linked ? 1 : 0);
      const color = nodeInk(node.id);
      const emphasized = selected || linked;
      const opacity = activeId ? (emphasized ? 1 : .29) : categoryMatch(node.id) ? graphStarOpacity(point.z) : .30;
      // Selection remains legible, every star remains visible even in silence.
      const energy = spectrum ? Math.min(1, Math.max(0, spectrum[bands.get(node.id)!] || 0)) : 0;
      const gain = spectrum ? (reduced ? .88 + .3 * energy : .66 + .91 * energy) : 1;
      context.globalAlpha = Math.min(1, Math.max(emphasized ? .75 : .18, opacity * gain));
      context.fillStyle = color;
      context.font = '500 ' + size.toFixed(1) + 'px ui-monospace, SFMono-Regular, Menlo, monospace';
      context.fillText(graphStar(strength), point.x, point.y);

      if (emphasized) {
        const radius = 5.5 + size * .32;
        context.strokeStyle = color;
        context.globalAlpha = selected ? .94 : .43;
        context.lineWidth = selected ? 1.1 : .75;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.stroke();
        if (selected) {
          context.globalAlpha = 1;
          context.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
          context.fillText(nodeStyles.get(node.id)!.glyph, point.x + radius + 5, point.y - radius * .72);
        }
      }
    }
    // Avoid DOM/style updates during spectrum-only frames.
    if (activeId !== lastActiveId) {
      if (activeId) host.dataset.graphFocused = activeId;
      else delete host.dataset.graphFocused;
      host.dataset.graphNeighborCount = String(neighbors.size);
      host.dataset.graphHighlightedEdges = String(selectedEdges?.size ?? 0);
    }
    if (!spectrum || viewChanged || activeId !== lastActiveId) updateTooltip(activeId);
    lastActiveId = activeId;
    context.globalAlpha = 1;
    if (!painted) { painted = true; onPaint(); }
    lastCost = .85 * lastCost + .15 * (performance.now() - began);
    if (dirty) start();
    else if (readBands && visible && !document.hidden && !audioTimer) {
      const fps = reduced ? 8 : width < 550 || lastCost > 12 || graph.nodes.length > 450 ? 18 : 24;
      audioTimer = window.setTimeout(() => {
        audioTimer = 0; dirty = true; start();
      }, Math.ceil(1000 / fps));
    }
  };
  const start = () => {
    if (!frame && dirty && visible && !document.hidden) frame = requestAnimationFrame(draw);
  };
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    clearTimeout(audioTimer); audioTimer = 0;
    clearTimeout(hoverTimer); hoverTimer = 0;
    frame = 0;
    lastDrawAt = -Infinity;
  };
  const invalidate = (projection = false) => {
    clearTimeout(audioTimer); audioTimer = 0;
    dirty = true; edgesDirty = true;
    projectionDirty ||= projection;
    start();
  };
  const audioChanged = (event: Event) => {
    readBands = (event as CustomEvent<{sample:SpectrumSampler|null}>).detail?.sample ?? null;
    clearTimeout(audioTimer); audioTimer = 0;
    dirty = true; start();
  };
  const resize = () => {
    const bounds = host.getBoundingClientRect();
    const w = Math.max(1, bounds.width), h = Math.max(1, bounds.height);
    const ratio = Math.min(devicePixelRatio || 1, 1.75);
    if (painted && w === width && h === height && ratio === dpr) return;
    width = w; height = h; dpr = ratio;
    edgeLayer.width = canvas.width = Math.round(width * dpr);
    edgeLayer.height = canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    edgeContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    invalidate(true);
  };
  const nodeId = (target: EventTarget | null) => target instanceof Element
    ? target.closest<HTMLElement>('[data-post-graph-node]')?.dataset.postGraphNode ?? null : null;
  const setLens = (value: number) => {
    targetLens = Math.min(1, Math.max(0, value));
    for (const button of zoomButtons) {
      const increase = Number(button.dataset.graphZoom) > 0;
      button.setAttribute('aria-disabled', String(increase ? targetLens >= 1 : targetLens <= 0));
    }
  };
  const setCategory = (category: string | null) => {
    activeCategory = category;
    const axis = category ? hierarchy.axes.get(category) : null;
    targetY = axis ? Math.atan2(axis.x, axis.z) : .18;
    targetX = axis ? Math.atan2(axis.y, Math.hypot(axis.x, axis.z)) : -.34;
    setLens(axis ? .75 : 0);
    for (const button of categoryButtons) button.setAttribute('aria-pressed', String(button.dataset.graphCategory === category));
    clearTimeout(hoverTimer); hoverLock = performance.now() + 1100;
    invalidate();
  };
  const onPointerMove = (event: PointerEvent) => {
    if (dragPointer === null) {
      // Arm once on physical mouse movement. A moving projection can emit
      // pointerover again at the same coordinates; it must not chain rotations.
      if (event.pointerType !== 'mouse' || focusId || motionPreference.matches ||
          performance.now() < hoverLock || Math.hypot(event.clientX-dwellX,event.clientY-dwellY) < 7) return;
      const id = nodeId(event.target), category = id && nodeById.get(id)?.category;
      if (!id || !category || activeCategory === category) return;
      dwellX = event.clientX; dwellY = event.clientY;
      clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => {
        if (visible && !document.hidden && dragPointer === null && hoverId === id && !focusId) setCategory(category);
      }, 750);
      return;
    }
    if (dragPointer !== event.pointerId) return;
    if (!moved && Math.hypot(event.clientX-pressX,event.clientY-pressY) < 5) return;
    if (!moved) {
      moved = true; host.setPointerCapture(event.pointerId); hoverId = null;
    }
    targetY = wrapAtlasYaw(targetY + (event.clientX - lastX) * 0.005);
    targetX = Math.max(-Math.PI/2, Math.min(Math.PI/2, targetX + (event.clientY - lastY) * 0.005));
    lastX = event.clientX; lastY = event.clientY;
    invalidate();
  };
  const onPointerDown = (event: PointerEvent) => {
    const target = event.target as Element;
    if (dragPointer !== null || event.button !== 0 || target.closest('button,input,select,audio,label,[data-atlas-player]') ||
        (target.closest('a') && !nodeId(target))) return;
    clearTimeout(hoverTimer);
    dragPointer = event.pointerId; moved = false;
    lastX = pressX = event.clientX; lastY = pressY = event.clientY;
    if (!nodeId(target)) host.setPointerCapture(event.pointerId);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (dragPointer !== event.pointerId || (event.type === 'lostpointercapture' && event.target !== host)) return;
    dragPointer = null;
    if (moved) cancelClickUntil = performance.now()+300;
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
  };
  const onPointerOver = (event: PointerEvent) => {
    if (dragPointer !== null) return;
    const id = nodeId(event.target);
    if (hoverId !== id) { hoverId = id; invalidate(); }
    clearTimeout(hoverTimer);
  };
  const onPointerOut = (event: PointerEvent) => {
    clearTimeout(hoverTimer);
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
    if (event.detail > 0 && performance.now() < cancelClickUntil && nodeId(event.target)) {
      event.preventDefault(); return;
    }
    const button = event.target.closest<HTMLButtonElement>('button');
    if (!button || !host.contains(button)) return;
    if (button.hasAttribute('data-graph-reset')) {
      setCategory(null);
    } else if (button.hasAttribute('data-graph-zoom')) {
      if (button.getAttribute('aria-disabled') === 'true') return;
      setLens(targetLens + Math.sign(Number(button.dataset.graphZoom)) * .25);
      invalidate();
    } else if (button.hasAttribute('data-graph-rotate')) {
      targetY = wrapAtlasYaw(targetY + Number(button.dataset.graphRotate) * Math.PI / 8);
      invalidate();
    } else if (button.dataset.graphCategory) {
      setCategory(activeCategory === button.dataset.graphCategory ? null : button.dataset.graphCategory);
    }
  };
  const themeObserver = new MutationObserver(() => {
    const nextDark = document.documentElement.classList.contains('dark');
    if (nextDark === dark) return;
    dark = nextDark;
    edgeGradients.clear();
    invalidate();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) { dirty = true; start(); } else stop();
  }, { rootMargin: '0px' });
  ro.observe(host); io.observe(host);
  setLens(0);
  host.addEventListener('click', onControlClick);
  host.addEventListener('atlas:audio', audioChanged);
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
  const onVisibilityChange = () => { if (document.hidden) stop(); else { dirty = true; start(); } };
  const onMotionPreference = () => invalidate();
  motionPreference.addEventListener('change', onMotionPreference);
  document.addEventListener('visibilitychange', onVisibilityChange);
  resize();
  return () => {
    stop(); ro.disconnect(); io.disconnect(); themeObserver.disconnect();
    host.removeEventListener('click', onControlClick);
    host.removeEventListener('atlas:audio', audioChanged);
    edgeLayer.width = edgeLayer.height = 1; readBands = null;
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
    const style = graphNodeVisual(node);
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

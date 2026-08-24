type Point3 = { x: number; y: number; z: number; edge: boolean };

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

function installCanvas(host: HTMLElement, canvas: HTMLCanvasElement): () => void {
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
    const size = Math.min(width, height) * (host.dataset.experienceCanvas === 'home' ? 0.235 : 0.205);
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
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) start();
    else stop();
  }, { rootMargin: '120px 0px' });
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  window.__jjoAsciiRuntime = { destroy };
}

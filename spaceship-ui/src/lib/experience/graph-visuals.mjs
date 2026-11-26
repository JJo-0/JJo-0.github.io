// The order runs from violet through green and amber to rose. A topic keeps
// its place as the view rotates, the theme changes or new articles arrive.
const SPECTRUM = [
  { category: 'ai-machine-learning', glyph: '@', light: '#67487e', dark: '#c4a9ee' },
  { category: 'vision-perception-neuroscience', glyph: '#', light: '#435884', dark: '#9dbcf0' },
  { category: 'robotics-embedded', glyph: '+', light: '#156668', dark: '#71d7c3' },
  { category: 'software-engineering-cs', glyph: '=', light: '#326746', dark: '#a4d699' },
  { category: 'research-methods-tools', glyph: '*', light: '#636121', dark: '#cfda8b' },
  { category: 'health-lifestyle', glyph: 'o', light: '#875d20', dark: '#e5c17d' },
  { category: 'finance-industry', glyph: '$', light: '#924f26', dark: '#efad7a' },
  { category: 'biblical-studies', glyph: '%', light: '#8a3e3d', dark: '#f09887' },
  { category: 'meta', glyph: ':', light: '#884163', dark: '#eaa6c9' },
].map((style, index) => ({ ...style, index, position: index }));
const STYLES = new Map(SPECTRUM.map(style => [style.category, style]));
const UNKNOWN_STYLE = { ...SPECTRUM[4], category: '', glyph: '?' };

/** @param {string} category */
export function graphVisual(category) {
  return STYLES.get(category) ?? UNKNOWN_STYLE;
}

/** @param {string} a @param {string} b @param {number} t */
function blendInk(a, b, t) {
  return '#' + [1, 3, 5].map(offset => {
    const start = parseInt(a.slice(offset, offset + 2), 16);
    const end = parseInt(b.slice(offset, offset + 2), 16);
    return Math.round(start + (end - start) * t).toString(16).padStart(2, '0');
  }).join('');
}

/**
 * Each topic occupies a band, each article a point in that band. Use original
 * model-space depth, which is independent of input order, language and camera.
 * @param {{category:string,z:number}} node
 */
export function graphNodeVisual(node) {
  const base = graphVisual(node.category);
  const t = Math.max(0, Math.min(1, 0.5 + node.z / 3.8));
  const left = Math.max(0, base.index - .8);
  const right = Math.min(SPECTRUM.length - 1, base.index + .8);
  const position = left + (right - left) * t;
  const lo = SPECTRUM[Math.floor(position)];
  const hi = SPECTRUM[Math.ceil(position)];
  const fraction = position - Math.floor(position);
  return { ...base, position, light: blendInk(lo.light, hi.light, fraction), dark: blendInk(lo.dark, hi.dark, fraction) };
}

/** @typedef {{position:number,light:string,dark:string}} SpectralInk */
/** @typedef {{offset:number,light:string,dark:string}} SpectralStop */
/** @type {Map<number, SpectralStop[]>} */
const edgeSpectra = new Map();

/**
 * Both rendering surfaces use endpoint colors and up to three real bands
 * between them. For long paths choose intermediate bands deterministically so
 * the color at any point is independent of the edge's direction.
 * @param {string | SpectralInk} sourceVisual
 * @param {string | SpectralInk} targetVisual
 * @returns {SpectralStop[]}
 */
export function graphEdgeStops(sourceVisual, targetVisual) {
  const a = typeof sourceVisual === 'string' ? graphVisual(sourceVisual) : sourceVisual;
  const b = typeof targetVisual === 'string' ? graphVisual(targetVisual) : targetVisual;
  // Only the finite set of legend-to-legend requests is cached globally.
  const key = typeof sourceVisual === 'string' && typeof targetVisual === 'string'
    ? a.position * SPECTRUM.length + b.position : -1;
  const cached = edgeSpectra.get(key);
  if (cached) return cached;
  const low = Math.min(a.position, b.position);
  const high = Math.max(a.position, b.position);
  const first = Math.floor(low) + 1;
  const last = Math.ceil(high) - 1;
  const count = Math.min(3, last - first + 1);
  const interior = [];
  for (let i = 1; i <= count; i++) {
    const index = Math.max(first + i - 1, Math.min(last - (count - i), Math.round(low + (high - low) * i / (count + 1))));
    const band = SPECTRUM[index];
    interior.push({ offset: (index - a.position) / (b.position - a.position), light: band.light, dark: band.dark });
  }
  if (a.position > b.position) interior.reverse();
  const stops = [{ offset: 0, light: a.light, dark: a.dark }, ...interior, { offset: 1, light: b.light, dark: b.dark }];
  if (key >= 0) edgeSpectra.set(key, stops);
  return stops;
}

/** @param {number} depth */
export function graphDepth(depth) { return Math.max(0, Math.min(1, (depth + 3.5) / 7)); }

// Optical prominence comes from the sum of incident relationship weights.
// Its shape stays stable and its size changes continuously as the view turns.
/** @param {number} strength */
export function graphStar(strength) {
  if (strength >= 64) return '✦';
  return strength >= 48 ? '+' : '·';
}

/** @param {number} depth @param {number} strength */
export function graphStarSize(depth, strength) {
  const magnitude = Math.min(1, Math.max(0, strength / 85));
  const baseSize = strength < 48 ? 16 : strength < 64 ? 8 : 11;
  // A half-pixel grid bounds the font cache while preserving depth cues.
  return Math.round((baseSize + magnitude * 5 + graphDepth(depth) * 5) * 2) / 2;
}

/** @param {number} depth */
export function graphStarOpacity(depth) { return .56 + graphDepth(depth) * .44; }

/** @param {number} depth @param {number} weight */
export function graphEdgeAppearance(depth, weight) {
  const strength = Math.min(1, Math.max(0, weight / 20));
  // Keep the numerous ordinary relations quiet; rarer strong ones trace a
  // readable constellation even where several projected lines cross.
  return { opacity: .14 + graphDepth(depth) * .10 + strength ** 3 * .21, width: .55 + strength * .50 };
}

/** @param {number} angle */
export function wrapAtlasYaw(angle) {
  if (angle >= -Math.PI && angle <= Math.PI) return angle;
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

/**
 * Frame-time based, finite easing. Never integrate velocity at rest.
 * @param {{x:number,y:number}} current
 * @param {{x:number,y:number}} target
 * @param {number} elapsedMs
 * @param {boolean} reduced
 * @param {boolean} dragging
 */
export function stepAtlasRotation(current, target, elapsedMs, reduced, dragging) {
  const dx = target.x - current.x;
  const dy = wrapAtlasYaw(target.y - current.y);
  const epsilon = 0.002;
  if (reduced || Math.max(Math.abs(dx), Math.abs(dy)) <= epsilon) {
    return { ...target, moving: false };
  }
  const dt = Math.max(0, Math.min(34, elapsedMs));
  const fraction = 1 - Math.exp(-dt / (dragging ? 36 : 76));
  if (Math.max(Math.abs(dx), Math.abs(dy)) * (1 - fraction) <= epsilon) {
    return { ...target, moving: false };
  }
  return { x: current.x + dx * fraction, y: wrapAtlasYaw(current.y + dy * fraction), moving: true };
}

// Rotation-invariant perspective bound. For the atlas sphere with radius r,
// the maximum projected radius is 4.8*r/sqrt(5.8^2-r^2) before the near-plane
// clamp. A conservative bound handles larger arbitrary input coordinates.
/** @param {{x:number,y:number,z:number}[]} nodes */
export function atlasProjectionRadius(nodes) {
  let r = 0.1;
  for (const node of nodes) r = Math.max(r, Math.hypot(node.x, node.y, node.z));
  return r * r <= 5.8 * 4.2
    ? 4.8 * r / Math.sqrt(5.8 * 5.8 - r * r)
    : 4.8 * r / 1.6;
}

/** @param {number} width @param {number} height */
export function atlasViewport(width, height) {
  const top = Math.min(height * .27, width < 520 ? 92 : 96);
  const bottom = Math.min(height * .19, 78);
  return {
    centerX: width / 2,
    centerY: (top + height - bottom) / 2,
    diameter: Math.min(Math.max(1, width - 36), Math.max(1, height - top - bottom - 20)),
  };
}

/**
 * Build the camera transform once per orientation. Use the same transform for
 * article hit targets, hierarchical edge controls and the initial SVG.
 * @param {number} width @param {number} height
 * @param {number} rotationX @param {number} rotationY @param {number} fitRadius
 * @param {number} [lens]
 */
export function atlasProjector(width, height, rotationX, rotationY, fitRadius, lens = 0) {
  const cx = Math.cos(rotationX), sx = Math.sin(rotationX);
  const cy = Math.cos(rotationY), sy = Math.sin(rotationY);
  const { centerX, centerY, diameter } = atlasViewport(width, height);
  const scale = diameter * .45 / Math.max(.1, fitRadius);
  return (/** @type {{x:number,y:number,z:number}} */ node,
          /** @type {{x:number,y:number,z:number}} */ out = { x: 0, y: 0, z: 0 }) => {
    let x = node.x * cy - node.z * sy;
    const z = node.x * sy + node.z * cy;
    let y = node.y * cx - z * sx;
    let depth = node.y * sx + z * cx;
    if (lens > 0 && depth > 0) {
      const length = Math.hypot(x, y, depth), xy = Math.hypot(x, y);
      if (xy > 1e-6) {
        const angle = Math.atan2(xy, depth);
        const warped = angle + lens * .37 * Math.sin(2 * angle);
        const stretch = length * Math.sin(warped) / xy;
        x *= stretch; y *= stretch; depth = length * Math.cos(warped);
      }
    }
    const perspective = 4.8 / Math.max(1.6, 5.8 - depth);
    out.x = centerX + x * perspective * scale;
    out.y = centerY + y * perspective * scale;
    out.z = depth;
    return out;
  };
}

/** @param {{id:string,x:number,y:number,z:number}[]} nodes
 * @param {number} width @param {number} height
 * @param {number} rotationX @param {number} rotationY @param {number} [fitRadius] */
export function projectAtlas(nodes, width, height, rotationX, rotationY, fitRadius = atlasProjectionRadius(nodes)) {
  const project = atlasProjector(width, height, rotationX, rotationY, fitRadius);
  return nodes.map(node => ({id: node.id, ...project(node)}));
}

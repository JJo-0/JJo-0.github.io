// Stable category identity, independent of article order and interface language.
// Distinct characters carry the same information even without color.
const STYLES = new Map([
  ['ai-machine-learning', { glyph: '@', light: '#315e51', dark: '#9ebcaf' }],
  ['vision-perception-neuroscience', { glyph: '#', light: '#4b6277', dark: '#a9bed3' }],
  ['robotics-embedded', { glyph: '+', light: '#93583b', dark: '#d5a080' }],
  ['software-engineering-cs', { glyph: '=', light: '#6c5b7a', dark: '#c0adce' }],
  ['research-methods-tools', { glyph: '*', light: '#81662f', dark: '#d6bd86' }],
  ['health-lifestyle', { glyph: 'o', light: '#89566a', dark: '#d1a0af' }],
  ['finance-industry', { glyph: '$', light: '#5c682e', dark: '#bcc892' }],
  ['biblical-studies', { glyph: '%', light: '#3b6b70', dark: '#9fc9ca' }],
  ['meta', { glyph: ':', light: '#64665e', dark: '#c1c0b3' }],
]);
/** @param {string} category */
export function graphVisual(category) {
  return STYLES.get(category) ?? { glyph: '?', light: '#64665e', dark: '#c1c0b3' };
}
/** @param {number} depth */
export function graphDepth(depth) { return Math.max(0, Math.min(1, (depth + 3.5) / 7)); }

// Editorial paper/ink palette: the same category colors are used by SSR,
// Canvas, keyboard focus, tooltip and legend, in both themes.

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

// Fixed fit over all rotations prevents zoom "breathing" during dragging.
// Reserve space for the legend and controls at every orientation.
/** @param {{id:string,x:number,y:number,z:number}[]} nodes
 * @param {number} width @param {number} height
 * @param {number} rotationX @param {number} rotationY @param {number} [fitRadius] */
export function projectAtlas(nodes, width, height, rotationX, rotationY, fitRadius = atlasProjectionRadius(nodes)) {
  const cx = Math.cos(rotationX), sx = Math.sin(rotationX);
  const cy = Math.cos(rotationY), sy = Math.sin(rotationY);
  const rows = nodes.map(node => {
    const x = node.x * cy - node.z * sy, z = node.x * sy + node.z * cy;
    const y = node.y * cx - z * sx, depth = node.y * sx + z * cx;
    const perspective = 4.8 / Math.max(1.6, 5.8 - depth);
    return { id: node.id, x: x * perspective, y: y * perspective, z: depth };
  });
  const top = Math.min(height * 0.27, width < 520 ? 112 : 96);
  const bottom = Math.min(height * 0.19, 78);
  const centerY = (top + height - bottom) / 2;
  const diameter = 2 * Math.max(0.1, fitRadius);
  const scale = Math.min(Math.max(1, width - 36), Math.max(1, height - top - bottom - 20)) / diameter;
  return rows.map(row => ({ id: row.id, x: width / 2 + row.x * scale, y: centerY + row.y * scale, z: row.z }));
}

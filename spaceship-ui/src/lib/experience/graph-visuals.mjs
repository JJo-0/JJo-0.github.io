// Stable category identity, independent of article order and interface language.
// Distinct characters carry the same information even without color.
const STYLES = new Map([
  ['ai-machine-learning', { glyph: '@', light: '#1f6652', dark: '#83d4b6' }],
  ['vision-perception-neuroscience', { glyph: '#', light: '#245a99', dark: '#91bdf2' }],
  ['robotics-embedded', { glyph: '+', light: '#a04418', dark: '#f6ac7b' }],
  ['software-engineering-cs', { glyph: '=', light: '#635095', dark: '#c3a9f6' }],
  ['research-methods-tools', { glyph: '*', light: '#95610a', dark: '#f0d07a' }],
  ['health-lifestyle', { glyph: 'o', light: '#9e315d', dark: '#f2a7c5' }],
  ['finance-industry', { glyph: '$', light: '#506a1d', dark: '#c1df8b' }],
  ['biblical-studies', { glyph: '%', light: '#186d7a', dark: '#88dbe2' }],
  ['meta', { glyph: ':', light: '#5a6168', dark: '#c1c7d0' }],
]);
/** @param {string} category */
export function graphVisual(category) {
  return STYLES.get(category) ?? { glyph: '?', light: '#505860', dark: '#c1c7d0' };
}
/** @param {number} depth */
export function graphDepth(depth) { return Math.max(0, Math.min(1, (depth + 3.5) / 7)); }

// Perspective projection followed by a uniform fit. Preserve the entire
// graph and reserve space for the legend and controls at every rotation.
/** @param {{id:string,x:number,y:number,z:number}[]} nodes
 * @param {number} width @param {number} height
 * @param {number} rotationX @param {number} rotationY */
export function projectAtlas(nodes, width, height, rotationX, rotationY) {
  const cx = Math.cos(rotationX), sx = Math.sin(rotationX);
  const cy = Math.cos(rotationY), sy = Math.sin(rotationY);
  const rows = nodes.map(node => {
    const x = node.x * cy - node.z * sy, z = node.x * sy + node.z * cy;
    const y = node.y * cx - z * sx, depth = node.y * sx + z * cx;
    const perspective = 4.8 / Math.max(1.6, 5.8 - depth);
    return { id: node.id, x: x * perspective, y: y * perspective, z: depth };
  });
  let maxX = 0.1, maxY = 0.1;
  for (const row of rows) {
    maxX = Math.max(maxX, Math.abs(row.x));
    maxY = Math.max(maxY, Math.abs(row.y));
  }
  const top = Math.min(height * 0.27, width < 520 ? 112 : 96);
  const bottom = Math.min(height * 0.19, 78);
  const centerY = (top + height - bottom) / 2;
  const scale = Math.min(Math.max(1, width - 36) / (2 * maxX), Math.max(1, height - top - bottom - 20) / (2 * maxY));
  return rows.map(row => ({ id: row.id, x: width / 2 + row.x * scale, y: centerY + row.y * scale, z: row.z }));
}

const REPLACEMENTS = new Map([
  ['calibration.md', new Map([['카메라 좌표계', '/image/calibration-coordinate-system.svg']])],
  [
    'vision.md',
    new Map([
      ['Sigmoid_Derivative', '/image/sigmoid-derivative.svg'],
      ['Tanh_Derivative', '/image/tanh-derivative.svg'],
    ]),
  ],
  ['soem.md', new Map([['Topology', '/image/network-topology.svg']])],
]);

const VISION_RAW_IMAGES = new Map([
  ['Sigmoid_function', '/image/sigmoid-function.svg'],
  ['tanh_function', '/image/tanh-function.svg'],
  ['sig_tan', '/image/sigmoid-tanh-comparison.svg'],
]);

function walk(node, visitor) {
  if (!node || typeof node !== 'object') return;
  visitor(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, visitor);
  }
}

function replaceRawImageByAlt(html, alt, replacement) {
  const escapedAlt = alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<img\\b[^>]*\\bsrc=["'])[^"']+(["'][^>]*\\balt=["']${escapedAlt}["'])`, 'gi');
  return html.replace(pattern, `$1${replacement}$2`);
}

/**
 * Replace audited fragile third-party image hotlinks with original local SVGs.
 * Markdown images arrive as element nodes while the legacy LSTM image row is
 * preserved as a raw HTML node, so both representations are handled here.
 */
export default function replaceFragileMedia() {
  return (tree, file) => {
    const filePath = String(file?.path || file?.history?.[0] || '').replaceAll('\\', '/');
    const filename = filePath.split('/').at(-1);
    const replacements = REPLACEMENTS.get(filename);

    walk(tree, (node) => {
      if (node.type === 'element' && node.tagName === 'img' && node.properties && replacements) {
        const alt = typeof node.properties.alt === 'string' ? node.properties.alt : '';
        const replacement = replacements.get(alt);
        if (replacement) {
          node.properties.src = replacement;
          node.properties.loading = 'lazy';
          node.properties.decoding = 'async';
        }
      }

      if (filename === 'vision.md' && node.type === 'raw' && typeof node.value === 'string') {
        for (const [alt, replacement] of VISION_RAW_IMAGES) {
          node.value = replaceRawImageByAlt(node.value, alt, replacement);
        }
      }
    });
  };
}

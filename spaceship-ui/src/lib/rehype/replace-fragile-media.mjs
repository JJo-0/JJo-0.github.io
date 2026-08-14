const REPLACEMENTS = new Map([
  [
    'calibration.md',
    new Map([
      ['카메라 좌표계', '/image/calibration-coordinate-system.svg'],
    ]),
  ],
  [
    'vision.md',
    new Map([
      ['Sigmoid_Derivative', '/image/sigmoid-derivative.svg'],
      ['Tanh_Derivative', '/image/tanh-derivative.svg'],
    ]),
  ],
  [
    'soem.md',
    new Map([
      ['Topology', '/image/network-topology.svg'],
    ]),
  ],
]);

function walk(node, visitor) {
  if (!node || typeof node !== 'object') return;
  visitor(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, visitor);
  }
}

/**
 * Replace three audited, fragile third-party image hotlinks with original local
 * diagrams. Matching is deliberately scoped by source filename + image alt so
 * unrelated external images are left untouched.
 */
export default function replaceFragileMedia() {
  return (tree, file) => {
    const filePath = String(file?.path || file?.history?.[0] || '').replaceAll('\\', '/');
    const filename = filePath.split('/').at(-1);
    const replacements = REPLACEMENTS.get(filename);
    if (!replacements) return;

    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'img' || !node.properties) return;
      const alt = typeof node.properties.alt === 'string' ? node.properties.alt : '';
      const replacement = replacements.get(alt);
      if (!replacement) return;

      node.properties.src = replacement;
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';
    });
  };
}

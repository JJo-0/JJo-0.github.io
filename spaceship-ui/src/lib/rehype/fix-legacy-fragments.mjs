const LEGACY_FRAGMENT_MAP = new Map([
  ['linux.md', new Map([['#Window', '#window']])],
  [
    'ros2.md',
    new Map([
      [
        '#유명한-라이브러리',
        '#유명한-라이브러리-따로-공부해서-포스팅할-예정',
      ],
    ]),
  ],
  [
    'vision.md',
    new Map([
      [
        '#gradient-vanishing-problem',
        '#gradient-vanishing-problem-기울기-소실-문제',
      ],
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

export default function fixLegacyFragments() {
  return (tree, file) => {
    const filePath = String(file?.path || file?.history?.[0] || '').replaceAll('\\', '/');
    const filename = filePath.split('/').at(-1);
    const replacements = LEGACY_FRAGMENT_MAP.get(filename);
    if (!replacements) return;

    walk(tree, (node) => {
      if (node.type === 'element' && node.tagName === 'a' && node.properties) {
        const href = node.properties.href;
        if (typeof href === 'string' && replacements.has(href)) {
          node.properties.href = replacements.get(href);
        }
      }

      // Inline HTML anchors from the Jekyll-era Markdown remain raw HAST
      // nodes, so patch only their exact audited href values as well.
      if (node.type === 'raw' && typeof node.value === 'string') {
        for (const [from, to] of replacements) {
          node.value = node.value
            .replaceAll(`href="${from}"`, `href="${to}"`)
            .replaceAll(`href='${from}'`, `href='${to}'`);
        }
      }
    });
  };
}

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) walk(child, visit);
}

// The table remains a table. Only the surrounding region scrolls, so its
// full-width border and the cell grid cannot use different layout algorithms.
function wrapTables(node, inScrollRegion = false) {
  if (!Array.isArray(node.children)) return;
  const classes = node.properties?.className ?? [];
  const scrollRegion = inScrollRegion || classes.includes('table-scroll') ||
    ['CandidateTable', 'WetLabTable', 'StudyTable'].includes(node.name);
  node.children = node.children.map(child => {
    wrapTables(child, scrollRegion);
    const isTable = (child.type === 'element' && child.tagName === 'table') ||
      (child.type === 'mdxJsxFlowElement' && child.name === 'table');
    if (!isTable || scrollRegion) return child;
    return {
      type: 'element', tagName: 'div',
      properties: { className: ['table-scroll'], role: 'region', tabIndex: 0,
        ariaLabel: 'Scrollable table / 표 가로 스크롤' },
      children: [child],
    };
  });
}

/**
 * Keep the first Markdown image eligible for above-the-fold rendering while
 * deferring every later raster/vector image. This is intentionally build-time:
 * browsers receive native loading/decoding hints without a client runtime.
 */
export default function mediaPerformance() {
  return (tree) => {
    wrapTables(tree);
    let imageIndex = 0;

    walk(tree, (node) => {
      if (node.type !== 'element') return;
      node.properties ??= {};

      if (node.tagName === 'img') {
        node.properties.decoding ??= 'async';
        if (imageIndex > 0) {
          node.properties.loading ??= 'lazy';
          node.properties.fetchPriority ??= 'low';
        }
        imageIndex += 1;
        return;
      }

      if (node.tagName === 'iframe') {
        node.properties.loading ??= 'lazy';
        return;
      }

      if (node.tagName === 'video') {
        node.properties.preload ??= 'metadata';
      }
    });
  };
}

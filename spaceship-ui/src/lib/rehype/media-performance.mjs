function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) walk(child, visit);
}

/**
 * Keep the first Markdown image eligible for above-the-fold rendering while
 * deferring every later raster/vector image. This is intentionally build-time:
 * browsers receive native loading/decoding hints without a client runtime.
 */
export default function mediaPerformance() {
  return (tree) => {
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

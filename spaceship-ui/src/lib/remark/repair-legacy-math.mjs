function walkParents(node, visitor) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node.children)) {
    visitor(node);
    for (const child of node.children) walkParents(child, visitor);
  }
}

const LEGACY_INLINE = /\$begin:math:text\$(w_i|x_i|b)\$end:math:text\$/g;

/**
 * Currency-heavy posts make global single-$ math unsafe. The Jekyll migration
 * left exactly three audited inline expressions in vision.md using sentinel
 * markers, so convert only those explicit markers to mdast inlineMath nodes.
 */
export default function repairLegacyMathArtifacts() {
  return (tree, file) => {
    const filePath = String(file?.path || file?.history?.[0] || '').replaceAll('\\', '/');
    if (!filePath.endsWith('/vision.md')) return;

    walkParents(tree, (parent) => {
      const next = [];

      for (const child of parent.children) {
        if (child?.type !== 'text' || !child.value.includes('$begin:math:text$')) {
          next.push(child);
          continue;
        }

        let cursor = 0;
        for (const match of child.value.matchAll(LEGACY_INLINE)) {
          if (match.index > cursor) next.push({ type: 'text', value: child.value.slice(cursor, match.index) });
          next.push({ type: 'inlineMath', value: match[1] });
          cursor = match.index + match[0].length;
        }
        if (cursor < child.value.length) next.push({ type: 'text', value: child.value.slice(cursor) });
      }

      parent.children = next;
    });
  };
}

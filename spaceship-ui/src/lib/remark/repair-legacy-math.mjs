function walkParents(node, visitor) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node.children)) {
    visitor(node);
    for (const child of node.children) walkParents(child, visitor);
  }
}

/**
 * The Jekyll migration left three inline expressions in vision.md as:
 *   $begin:math:text$w_i$end:math:text$
 * With remark-math enabled this becomes two sentinel inlineMath nodes around
 * plain text. Collapse that exact audited pattern back to one inlineMath node.
 */
export default function repairLegacyMathArtifacts() {
  return (tree, file) => {
    const filePath = String(file?.path || file?.history?.[0] || '').replaceAll('\\', '/');
    if (!filePath.endsWith('/vision.md')) return;

    walkParents(tree, (parent) => {
      for (let i = 0; i <= parent.children.length - 3; i += 1) {
        const begin = parent.children[i];
        const value = parent.children[i + 1];
        const end = parent.children[i + 2];

        if (
          begin?.type === 'inlineMath' &&
          begin.value === 'begin:math:text' &&
          value?.type === 'text' &&
          end?.type === 'inlineMath' &&
          end.value === 'end:math:text'
        ) {
          const expression = value.value.trim();
          if (/^(?:w_i|x_i|b)$/.test(expression)) {
            parent.children.splice(i, 3, { type: 'inlineMath', value: expression });
          }
        }
      }
    });
  };
}

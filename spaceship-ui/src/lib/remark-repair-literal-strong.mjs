const STRONG_MARKER = /\*\*([^*\n]+?)\*\*/g;

function splitLiteralStrong(value) {
  const nodes = [];
  let lastIndex = 0;
  let match;

  STRONG_MARKER.lastIndex = 0;
  while ((match = STRONG_MARKER.exec(value)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: value.slice(lastIndex, match.index) });
    }
    nodes.push({
      type: 'strong',
      children: [{ type: 'text', value: match[1] }],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex === 0) return null;
  if (lastIndex < value.length) {
    nodes.push({ type: 'text', value: value.slice(lastIndex) });
  }
  return nodes;
}

function repairTree(node) {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'html' && typeof node.value === 'string' && node.value.includes('**')) {
    const trimmed = node.value.trimStart().toLowerCase();
    // Never rewrite executable or preformatted raw HTML blocks.
    if (
      !trimmed.startsWith('<script') &&
      !trimmed.startsWith('<style') &&
      !trimmed.startsWith('<pre') &&
      !trimmed.startsWith('<code')
    ) {
      node.value = node.value.replace(STRONG_MARKER, '<strong>$1</strong>');
    }
    return;
  }

  if (!Array.isArray(node.children)) return;

  const nextChildren = [];
  for (const child of node.children) {
    if (child?.type === 'text' && typeof child.value === 'string' && child.value.includes('**')) {
      const replacement = splitLiteralStrong(child.value);
      if (replacement) {
        nextChildren.push(...replacement);
        continue;
      }
    }

    if (child?.type !== 'code' && child?.type !== 'inlineCode') {
      repairTree(child);
    }
    nextChildren.push(child);
  }
  node.children = nextChildren;
}

/**
 * Repair strong-emphasis markers that CommonMark intentionally leaves literal.
 *
 * The most common Korean failure mode is `**용어**은/으로/다`: a Hangul
 * particle immediately after the closing delimiter can make `**` non-right-
 * flanking. Raw HTML blocks such as `<summary>**제목**</summary>` have a
 * separate issue because Markdown is not parsed inside the HTML block.
 *
 * Normal strong nodes have already been parsed before this plugin runs, so the
 * plugin only touches literal leftovers. Code/pre/script/style content is kept
 * intact.
 */
export default function remarkRepairLiteralStrong() {
  return (tree) => repairTree(tree);
}

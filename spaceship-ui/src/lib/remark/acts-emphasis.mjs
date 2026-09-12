// Normalize emphasis left literal at Korean/punctuation boundaries in the six
// Acts reader editions only. Change presentation nodes, never prose or code.
const actsFile = /(?:^|\/)(?:acts-overview-[123]|acts-1-1-5-[123])\.mdx$/;
const skippedTypes = new Set(['code', 'inlineCode', 'html', 'strong', 'math', 'inlineMath']);
const skippedNames = new Set(['script', 'style', 'pre', 'code']);

function normalize(node) {
  if (!node || skippedTypes.has(node.type) || skippedNames.has(node.name)) return;
  if (!Array.isArray(node.children)) return;
  const children = [];
  for (const child of node.children) {
    if (child.type !== 'text' || typeof child.value !== 'string') {
      normalize(child);
      children.push(child);
      continue;
    }
    let cursor = 0;
    let changed = false;
    for (const match of child.value.matchAll(/\*\*([^*\n]+)\*\*/g)) {
      changed = true;
      if (match.index > cursor) children.push({ type: 'text', value: child.value.slice(cursor, match.index) });
      children.push({ type: 'strong', children: [{ type: 'text', value: match[1] }] });
      cursor = match.index + match[0].length;
    }
    if (!changed) children.push(child);
    else if (cursor < child.value.length) children.push({ type: 'text', value: child.value.slice(cursor) });
  }
  node.children = children;
}

export default function actsEmphasis() {
  return (tree, file) => {
    const pathname = String(file.path || file.history?.[0] || '').split('?')[0].replaceAll('\\', '/');
    if (!actsFile.test(pathname)) return;
    normalize(tree);
  };
}

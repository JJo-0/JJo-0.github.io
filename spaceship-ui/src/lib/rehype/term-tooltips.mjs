const TARGET_POST = /ai-consciousness-deep-research-[123]\.md$/;
const SKIP_TAGS = new Set(['a', 'code', 'pre', 'script', 'style', 'kbd', 'samp']);
const SERIES_MARKER = /AI\s+Consciousness\s+Deep\s+Research\s+(?:I|II|III)\b/i;

const TERM_PATTERN = /((?:[가-힣A-Za-z][가-힣A-Za-z0-9·/+.-]*)(?:\s+(?:[가-힣A-Za-z][가-힣A-Za-z0-9·/+.-]*)){0,3})\s*\(([A-Za-z][A-Za-z0-9/&+.,'’\-\s]{1,64})\)/g;

function isLikelyCitation(value) {
  return /\b(?:19|20)\d{2}\b/.test(value) || /\bet\s+al\.?\b/i.test(value) || /https?:\/\//i.test(value);
}

function hasHangul(value) {
  return /[가-힣]/.test(value);
}

function treeText(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text') return node.value ?? '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map(treeText).join(' ');
}

function splitText(value) {
  const children = [];
  let cursor = 0;
  let match;

  TERM_PATTERN.lastIndex = 0;
  while ((match = TERM_PATTERN.exec(value))) {
    const [whole, label, english] = match;

    if (!hasHangul(label) || isLikelyCitation(english)) continue;

    const trimmedLabel = label.trim();
    if (trimmedLabel.length < 2 || /(?:년|월|일)$/.test(trimmedLabel)) continue;

    const start = match.index;
    if (start > cursor) children.push({ type: 'text', value: value.slice(cursor, start) });

    children.push({
      type: 'element',
      tagName: 'abbr',
      properties: {
        className: ['term-gloss'],
        title: english.trim(),
        'data-term': english.trim(),
        tabIndex: 0,
        'aria-label': `${trimmedLabel}: ${english.trim()}`,
        style:
          'text-decoration-line:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:0.2em;cursor:help;text-decoration-color:color-mix(in srgb,currentColor 45%,transparent);',
      },
      children: [{ type: 'text', value: trimmedLabel }],
    });

    cursor = start + whole.length;
  }

  if (!children.length) return null;
  if (cursor < value.length) children.push({ type: 'text', value: value.slice(cursor) });
  return children;
}

function walk(node, parentTag = '') {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element' && SKIP_TAGS.has(node.tagName)) return;
  if (!Array.isArray(node.children)) return;

  const nextChildren = [];
  for (const child of node.children) {
    if (child?.type === 'text' && !SKIP_TAGS.has(parentTag)) {
      const replacement = splitText(child.value);
      if (replacement) {
        nextChildren.push(...replacement);
        continue;
      }
    }

    walk(child, node.type === 'element' ? node.tagName : parentTag);
    nextChildren.push(child);
  }
  node.children = nextChildren;
}

export default function termTooltips() {
  return (tree, file) => {
    const filePath = String(file?.path ?? file?.history?.[0] ?? '');
    if (!TARGET_POST.test(filePath) && !SERIES_MARKER.test(treeText(tree))) return;
    walk(tree);
  };
}

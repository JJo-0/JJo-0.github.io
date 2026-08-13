const LEGACY_HTML_POSTS = new Set([
  '2025-05-20.md',
  '2025-06-27.md',
  '2025-07-23-2.md',
  '2025-07-25.md',
  'deep-search-gemini.md',
  'deep-search-travel-prompt.md',
]);

const HTML_BLOCK_START = /^\s*(?:<!--[\s\S]*?-->\s*)*<(?:article|aside|blockquote|canvas|div|figure|footer|form|h[1-6]|header|ins|main|nav|ol|p|script|section|style|table|ul)\b/i;

function walk(node, visitor) {
  if (!node || typeof node !== 'object') return;
  visitor(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, visitor);
  }
}

/**
 * Restore raw HTML that the Jekyll -> Astro migration left indented by four
 * spaces. CommonMark correctly parses those lines as indented code blocks,
 * while the original Kramdown pages treated them as page HTML.
 *
 * The conversion is deliberately scoped to the six audited legacy posts and
 * to unlabelled code nodes that begin with block-level HTML. Fenced code
 * examples and every other post are left untouched.
 */
export default function restoreLegacyHtml() {
  return (tree, file) => {
    const path = String(file?.path || file?.history?.[0] || '').replaceAll('\\', '/');
    const filename = path.split('/').at(-1);
    if (!LEGACY_HTML_POSTS.has(filename)) return;

    walk(tree, (node) => {
      if (node.type !== 'code' || node.lang || typeof node.value !== 'string') return;
      if (!HTML_BLOCK_START.test(node.value)) return;

      node.type = 'html';
      delete node.lang;
      delete node.meta;
    });
  };
}

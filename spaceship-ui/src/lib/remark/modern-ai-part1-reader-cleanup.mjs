const TARGET_POST = /(?:^|[/\\])mordern-artificial-intelligence\.mdx?$/;
const FIRST_READER_HEADING = 'Part 1.0 분야와 연구 생태계';

function nodeText(node) {
  if (!node || typeof node !== 'object') return '';
  if (typeof node.value === 'string') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(nodeText).join('');
}

/**
 * Keep the source-completeness notes in the MDX source for maintainers, but
 * remove that audit preamble from the reader-facing article. The first
 * substantive section and every formula after it remain untouched.
 */
export default function modernAiPartOneReaderCleanup() {
  return (tree, file) => {
    const filePath = file.path ?? file.history?.[0] ?? '';
    if (!TARGET_POST.test(filePath)) return;

    const children = tree.children ?? [];
    const firstHeadingIndex = children.findIndex(
      (node) =>
        node.type === 'heading' &&
        node.depth === 2 &&
        nodeText(node).trim() === FIRST_READER_HEADING,
    );

    if (firstHeadingIndex < 0) {
      throw new Error(`Modern AI Part I reader heading not found: ${FIRST_READER_HEADING}`);
    }

    let separatorIndex = firstHeadingIndex - 1;
    while (separatorIndex >= 0 && children[separatorIndex]?.type !== 'thematicBreak') {
      separatorIndex -= 1;
    }

    if (separatorIndex < 0) {
      throw new Error('Modern AI Part I reader separator was not found');
    }

    const requiredEsm = children
      .slice(0, separatorIndex)
      .filter((node) => node.type === 'mdxjsEsm');

    tree.children = [...requiredEsm, ...children.slice(separatorIndex)];
  };
}

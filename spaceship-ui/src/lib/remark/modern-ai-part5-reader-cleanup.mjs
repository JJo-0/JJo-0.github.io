const TARGET_POST = /(?:^|[/\\])modern-artificial-intelligence-5\.mdx?$/;
const SOURCE_HEADING = 'PDF 원자료 재구성';
const AUDIT_HEADING_PREFIX = '편집·수학 검증';
const UPDATE_HEADING_PREFIX = '2026-08-18 최신 연구 업데이트';
const UPDATE_PREAMBLE_PREFIX = '이 절은 PDF page coverage에 포함하지 않는다';
const EDITORIAL_ID = /^P5-E\d{3}$/;
const RESEARCH_ID = /^P5-R\d{3}$/;

function nodeText(node) {
  if (!node || typeof node !== 'object') return '';
  if (typeof node.value === 'string') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(nodeText).join('');
}

function heading(depth, value) {
  return { type: 'heading', depth, children: [{ type: 'text', value }] };
}

function trimThematicBreaks(nodes) {
  let start = 0;
  let end = nodes.length;
  while (nodes[start]?.type === 'thematicBreak') start += 1;
  while (nodes[end - 1]?.type === 'thematicBreak') end -= 1;
  return nodes.slice(start, end);
}

/**
 * Part V keeps completeness, SHA, page/formula/content/visual/annotation
 * ledgers, and editorial/research markers in MDX for fail-closed audits. The
 * public article omits their manufacturing preamble and bare ledger-ID
 * headings while retaining all substantive source, editorial, and research
 * prose.
 */
export default function modernAiPartFiveReaderCleanup() {
  return (tree, file) => {
    const filePath = file.path ?? file.history?.[0] ?? '';
    if (!TARGET_POST.test(filePath)) return;

    const children = tree.children ?? [];
    const sourceIndex = children.findIndex(
      (node) =>
        node.type === 'heading' && node.depth === 1 && nodeText(node).trim() === SOURCE_HEADING
    );
    const auditIndex = children.findIndex(
      (node) =>
        node.type === 'heading' &&
        node.depth === 1 &&
        nodeText(node).trim().startsWith(AUDIT_HEADING_PREFIX)
    );
    const updateIndex = children.findIndex(
      (node) =>
        node.type === 'heading' &&
        node.depth === 1 &&
        nodeText(node).trim().startsWith(UPDATE_HEADING_PREFIX)
    );

    if (
      sourceIndex < 0 ||
      auditIndex < 0 ||
      updateIndex < 0 ||
      !(sourceIndex < auditIndex && auditIndex < updateIndex)
    ) {
      throw new Error('Modern AI Part V reader boundaries are missing or out of order');
    }

    const imports = children.slice(0, sourceIndex).filter((node) => node.type === 'mdxjsEsm');
    const sourceBody = trimThematicBreaks(children.slice(sourceIndex + 1, auditIndex));
    const editorialBody = trimThematicBreaks(children.slice(auditIndex + 1, updateIndex)).filter(
      (node) => !(node.type === 'heading' && EDITORIAL_ID.test(nodeText(node).trim()))
    );
    const updateBody = trimThematicBreaks(children.slice(updateIndex + 1)).filter(
      (node) =>
        !(node.type === 'heading' && RESEARCH_ID.test(nodeText(node).trim())) &&
        !nodeText(node).trim().startsWith(UPDATE_PREAMBLE_PREFIX)
    );

    tree.children = [
      ...imports,
      ...sourceBody,
      { type: 'thematicBreak' },
      heading(2, '강의자료를 읽을 때 주의할 점'),
      ...editorialBody,
      { type: 'thematicBreak' },
      heading(2, UPDATE_HEADING_PREFIX),
      ...updateBody,
    ];
  };
}

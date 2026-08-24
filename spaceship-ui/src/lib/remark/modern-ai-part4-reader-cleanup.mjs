const TARGET_POST = /(?:^|[/\\])modern-artificial-intelligence-4\.mdx?$/;
const SOURCE_HEADING = 'PDF 원자료 재구성';
const AUDIT_HEADING_PREFIX = '편집·수학 검증';
const UPDATE_HEADING_PREFIX = '2026-08-18 최신 연구 업데이트';
const AUDIT_META_PREFIX = '이 절은 PDF 원문을 덮어쓰지 않는다.';

function nodeText(node) {
  if (!node || typeof node !== 'object') return '';
  if (typeof node.value === 'string') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(nodeText).join('');
}

/**
 * Keep the complete Part IV ledger/provenance structure in source MDX and CI,
 * while removing production/audit boilerplate from the reader-facing article.
 * Mathematical completions remain visible as substantive "수식 교정과 해설".
 */
export default function modernAiPartFourReaderCleanup() {
  return (tree, file) => {
    const filePath = file.path ?? file.history?.[0] ?? '';
    if (!TARGET_POST.test(filePath)) return;

    const children = tree.children ?? [];
    const sourceIndex = children.findIndex(
      (node) =>
        node.type === 'heading' &&
        node.depth === 1 &&
        nodeText(node).trim() === SOURCE_HEADING,
    );
    const auditIndex = children.findIndex(
      (node) =>
        node.type === 'heading' &&
        node.depth === 1 &&
        nodeText(node).trim().startsWith(AUDIT_HEADING_PREFIX),
    );
    const updateIndex = children.findIndex(
      (node) =>
        node.type === 'heading' &&
        node.depth === 1 &&
        nodeText(node).trim().startsWith(UPDATE_HEADING_PREFIX),
    );

    if (
      sourceIndex < 0 ||
      auditIndex < 0 ||
      updateIndex < 0 ||
      !(sourceIndex < auditIndex && auditIndex < updateIndex)
    ) {
      throw new Error('Modern AI Part IV reader boundaries are missing or out of order');
    }

    const imports = children
      .slice(0, sourceIndex)
      .filter((node) => node.type === 'mdxjsEsm');
    const sourceBody = children.slice(sourceIndex + 1, auditIndex);
    const auditBody = children
      .slice(auditIndex + 1, updateIndex)
      .filter((node) => !nodeText(node).trim().startsWith(AUDIT_META_PREFIX));
    const updateBody = children.slice(updateIndex);

    const readerAuditHeading = {
      type: 'heading',
      depth: 2,
      children: [{ type: 'text', value: '수식 교정과 해설' }],
    };

    if (updateBody[0]?.type === 'heading') updateBody[0].depth = 2;

    tree.children = [
      ...imports,
      ...sourceBody,
      { type: 'thematicBreak' },
      readerAuditHeading,
      ...auditBody,
      { type: 'thematicBreak' },
      ...updateBody,
    ];
  };
}

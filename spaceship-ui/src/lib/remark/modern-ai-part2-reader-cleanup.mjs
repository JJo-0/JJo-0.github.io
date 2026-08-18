const TARGET_POST = /(?:^|[/\\])modern-artificial-intelligence-2\.mdx?$/;
const SOURCE_HEADING = 'PDF 원자료 재구성';
const AUDIT_HEADING_PREFIX = '편집·수학 검증';
const UPDATE_HEADING_PREFIX = '2026-08-18 최신 연구 업데이트';

function nodeText(node) {
  if (!node || typeof node !== 'object') return '';
  if (typeof node.value === 'string') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(nodeText).join('');
}

function text(value) {
  return { type: 'text', value };
}

function strong(value) {
  return { type: 'strong', children: [text(value)] };
}

function sourceNotice() {
  return {
    type: 'blockquote',
    children: [
      {
        type: 'paragraph',
        children: [
          strong('강의자료 출처'),
          text(' — 이 글은 성균관대학교 ECE5992 「Modern Artificial Intelligence」의 2025년 3월 19일 강의자료를 학습 목적으로 한국어로 재구성했다. 원 강의자료의 저작권은 강의 제작자인 Il Yong Chun 교수와 원 제작자에게 있다. 문장·페이지 구성·삽화는 복제하지 않고, 수학적 내용은 페이지·수식 원장으로 추적하며 도식과 해설은 새로 작성했다.'),
        ],
      },
      {
        type: 'paragraph',
        children: [
          strong('읽는 법'),
          text(' — 먼저 2025년 PDF의 개념과 수식을 순서대로 읽고, 마지막의 2026년 연구 업데이트에서 현재의 일반화·분포이동·검증 논쟁으로 확장한다.'),
        ],
      },
    ],
  };
}

/**
 * Keep the source-completeness and editorial-audit records in MDX for CI and
 * maintainers, while presenting readers with the lecture reconstruction and
 * the dated research update only.
 */
export default function modernAiPartTwoReaderCleanup() {
  return (tree, file) => {
    const filePath = file.path ?? file.history?.[0] ?? '';
    if (!TARGET_POST.test(filePath)) return;

    const children = tree.children ?? [];
    const sourceIndex = children.findIndex(
      (node) => node.type === 'heading' && node.depth === 1 && nodeText(node).trim() === SOURCE_HEADING,
    );
    const auditIndex = children.findIndex(
      (node) => node.type === 'heading' && node.depth === 1 && nodeText(node).trim().startsWith(AUDIT_HEADING_PREFIX),
    );
    const updateIndex = children.findIndex(
      (node) => node.type === 'heading' && node.depth === 1 && nodeText(node).trim().startsWith(UPDATE_HEADING_PREFIX),
    );

    if (sourceIndex < 0 || auditIndex < 0 || updateIndex < 0 || !(sourceIndex < auditIndex && auditIndex < updateIndex)) {
      throw new Error('Modern AI Part II reader boundaries are missing or out of order');
    }

    const imports = children.slice(0, sourceIndex).filter((node) => node.type === 'mdxjsEsm');
    const sourceBody = children.slice(sourceIndex, auditIndex);
    const updateBody = children.slice(updateIndex);

    if (sourceBody[0]?.type === 'heading') sourceBody[0].depth = 2;
    if (updateBody[0]?.type === 'heading') updateBody[0].depth = 2;

    tree.children = [
      ...imports,
      sourceNotice(),
      ...sourceBody,
      { type: 'thematicBreak' },
      ...updateBody,
    ];
  };
}

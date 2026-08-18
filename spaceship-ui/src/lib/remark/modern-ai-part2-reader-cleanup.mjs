const TARGET_POST = /(?:^|[/\\])modern-artificial-intelligence-2\.mdx?$/;
const SOURCE_HEADING = 'PDF 원자료 재구성';
const AUDIT_HEADING_PREFIX = '편집·수학 검증';
const UPDATE_HEADING_PREFIX = '2026-08-18 최신 연구 업데이트';

const READER_CORRECTIONS = [
  {
    after: 'MAI-P2-066',
    formula: 'MAI-P2-067',
    intro: '원자료의 빈칸을 베이즈 규칙으로 완성하면 다음과 같다.',
  },
  {
    after: 'MAI-P2-075',
    formula: 'MAI-P2-076',
    intro: '전체확률법칙으로 빈칸을 완성하면 다음 위험식이 된다.',
  },
  {
    after: 'MAI-P2-087',
    formula: 'MAI-P2-088',
    intro: '표준 1차원 가우시안 밀도와 다변량 식 (9)에 맞춘 교정식은 다음과 같다.',
  },
  {
    after: 'MAI-P2-102',
    formula: 'MAI-P2-103',
    intro: '클래스별 사전확률이 같다고 가정하지 않는 일반적인 MAP 판별식에서는 다음처럼 사전확률이 남는다.',
  },
];

function nodeText(node) {
  if (!node || typeof node !== 'object') return '';
  if (typeof node.value === 'string') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(nodeText).join('');
}

function containsFormula(node, formulaId) {
  return JSON.stringify(node).includes(formulaId);
}

function text(value) {
  return { type: 'text', value };
}

function strong(value) {
  return { type: 'strong', children: [text(value)] };
}

function paragraph(value) {
  return { type: 'paragraph', children: [text(value)] };
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
 * the dated research update. Completed/corrected formulas are moved from the
 * hidden audit layer to the exact source location they explain.
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
    const auditBody = children.slice(auditIndex, updateIndex);
    const updateBody = children.slice(updateIndex);

    for (const correction of READER_CORRECTIONS) {
      const formulaNode = auditBody.find((node) => containsFormula(node, correction.formula));
      const insertionIndex = sourceBody.findIndex((node) => containsFormula(node, correction.after));
      if (!formulaNode || insertionIndex < 0) {
        throw new Error(`Modern AI Part II correction placement failed: ${correction.formula}`);
      }
      sourceBody.splice(insertionIndex + 1, 0, paragraph(correction.intro), formulaNode);
    }

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

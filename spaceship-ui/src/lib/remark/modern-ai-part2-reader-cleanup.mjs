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

function paragraph(value) {
  return { type: 'paragraph', children: [{ type: 'text', value }] };
}

/**
 * Keep source-completeness and editorial ledgers in MDX for CI/maintainers,
 * while exposing only substantive lecture content and the dated research
 * update. Completed/corrected formulas stay beside the source they explain.
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
    const sourceBody = children.slice(sourceIndex + 1, auditIndex);
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

    if (updateBody[0]?.type === 'heading') updateBody[0].depth = 2;

    tree.children = [
      ...imports,
      ...sourceBody,
      { type: 'thematicBreak' },
      ...updateBody,
    ];
  };
}

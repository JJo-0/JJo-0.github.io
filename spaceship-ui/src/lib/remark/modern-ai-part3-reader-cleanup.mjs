const TARGET_POST = /(?:^|[/\\])modern-artificial-intelligence-3\.mdx?$/;
const SOURCE_HEADING = 'PDF 원자료 재구성';
const AUDIT_HEADING_PREFIX = '편집·수학 검증';
const UPDATE_HEADING_PREFIX = '2026-08-18 최신 연구 업데이트';

const READER_CORRECTIONS = [
  {
    after: 'MAI-P3-006',
    formula: 'MAI-P3-141',
    intro: '원자료의 직선 일반형 질문을 이항과 좌표 대응으로 완성하면 다음과 같다.',
  },
  {
    after: 'MAI-P3-012',
    formula: 'MAI-P3-142',
    intro: '원점과 초평면 사이의 기하학적 거리는 비음수이므로 절댓값 교정형을 함께 둔다.',
  },
  {
    after: 'MAI-P3-013',
    formula: 'MAI-P3-143',
    intro: '점과 초평면 사이의 기하학적 거리도 signed score가 아니라 절댓값으로 읽는다.',
  },
  {
    after: 'MAI-P3-023',
    formula: 'MAI-P3-144',
    intro: '원자료의 w-gradient 빈칸을 직접 미분해 완성하면 다음과 같다.',
  },
  {
    after: 'MAI-P3-024',
    formula: 'MAI-P3-145',
    intro: '원자료의 bias-gradient 빈칸은 label 합에 음수를 붙인 식으로 완성된다.',
  },
  {
    after: 'MAI-P3-030',
    formula: 'MAI-P3-162',
    intro: 'score가 정확히 0인 pattern도 ±1 label을 맞히지 못하므로 error set에 포함하는 variant를 둔다.',
  },
  {
    after: 'MAI-P3-036',
    formula: 'MAI-P3-163',
    intro: 'iteration별 error set에도 같은 zero-margin 포함 규칙을 적용한다.',
  },
  {
    after: 'MAI-P3-043',
    formula: 'MAI-P3-146',
    intro: 'MSE 기반 퍼셉트론 학습식의 gradient 빈칸을 chain rule로 완성하면 다음과 같다.',
  },
  {
    after: 'MAI-P3-042',
    formula: 'MAI-P3-161',
    intro: '제곱합 MSE는 완전 적합에서 0이 될 수 있으므로 “always positive”를 nonnegative로 교정한다.',
  },
  {
    after: 'MAI-P3-045',
    formula: 'MAI-P3-147',
    intro: '고정된 0<α<2 설명보다 정확한 quadratic 수렴 상한은 data matrix의 spectrum에 의존한다.',
  },
  {
    after: 'MAI-P3-049',
    formula: 'MAI-P3-148',
    intro: 'XOR의 두 positive points와 두 negative points를 두 평행선으로 분리하는 한 완성형은 다음과 같다.',
  },
  {
    after: 'MAI-P3-050',
    formula: 'MAI-P3-149',
    intro: '통상적인 threshold-network 해석에서는 hidden perceptron 2개와 output perceptron 1개가 필요하다.',
  },
  {
    after: 'MAI-P3-060',
    formula: 'MAI-P3-150',
    intro: '식 (6)의 모든 물음표를 이전·현재 layer 폭에 맞춰 채우면 weight matrix는 다음과 같다.',
  },
  {
    after: 'MAI-P3-053',
    formula: 'MAI-P3-151',
    intro: 'scalar forward pass의 합 범위와 output index를 일반적인 layer 폭으로 교정하면 다음과 같다.',
  },
  {
    after: 'MAI-P3-057',
    formula: 'MAI-P3-152',
    intro: 'vector forward pass의 activation·net-input·bias 차원을 current layer 폭으로 교정한다.',
  },
  {
    after: 'MAI-P3-068',
    formula: 'MAI-P3-153',
    intro: 'mini-batch forward pass도 current-layer 폭과 pattern 수를 분리해 쓰는 것이 정확하다.',
  },
  {
    after: 'MAI-P3-081',
    formula: 'MAI-P3-154',
    intro: '2D mathematical convolution에서 kernel을 원점 기준으로 뒤집은 결과는 다음과 같다.',
  },
  {
    after: 'MAI-P3-083',
    formula: 'MAI-P3-155',
    intro: '원자료가 물음표로 남긴 full convolution output grid를 모두 계산하면 다음 행렬이 된다.',
  },
  {
    after: 'MAI-P3-087',
    formula: 'MAI-P3-156',
    intro: '3×3 moving-average filter를 무한 checkerboard에 적용한 응답은 다음과 같다.',
  },
  {
    after: 'MAI-P3-096',
    formula: 'MAI-P3-157',
    intro: 'separable M×M kernel의 M² 대 2M 연산량을 비교하면 절감률 빈칸은 다음과 같다.',
  },
  {
    after: 'MAI-P3-128',
    formula: 'MAI-P3-158',
    intro: 'patch vector는 input image f에서 추출하므로 원자료의 y 표기를 f로 고친 variant를 함께 둔다.',
  },
  {
    after: 'MAI-P3-134',
    formula: 'MAI-P3-159',
    intro: 'output vector 마지막 성분 앞의 고립된 x를 제거하고 index를 통일한 교정형이다.',
  },
  {
    after: 'MAI-P3-140',
    formula: 'MAI-P3-160',
    intro: 'PDF pp.14–15가 일부 칸만 채운 MaxPool2d output을 같은 window·stride·padding 규칙으로 끝까지 계산한다.',
  },
];

function nodeText(node) {
  if (!node || typeof node !== 'object') return '';
  if (typeof node.value === 'string') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(nodeText).join('');
}

function containsMarker(node, marker) {
  return JSON.stringify(node).includes(marker);
}

function paragraph(value) {
  return { type: 'paragraph', children: [{ type: 'text', value }] };
}

/**
 * Keep complete source/editorial ledgers in MDX for CI while presenting only
 * substantive lecture content and the dated research layer. Completed and
 * corrected formulas remain next to, never substituted for, their source.
 */
export default function modernAiPartThreeReaderCleanup() {
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
      throw new Error('Modern AI Part III reader boundaries are missing or out of order');
    }

    const imports = children
      .slice(0, sourceIndex)
      .filter((node) => node.type === 'mdxjsEsm');
    const sourceBody = children.slice(sourceIndex + 1, auditIndex);
    const auditBody = children.slice(auditIndex, updateIndex);
    const updateBody = children.slice(updateIndex);

    for (const correction of READER_CORRECTIONS) {
      const formulaNode = auditBody.find((node) =>
        containsMarker(node, correction.formula),
      );
      const insertionIndex = sourceBody.findIndex((node) =>
        containsMarker(node, correction.after),
      );
      if (!formulaNode || insertionIndex < 0) {
        throw new Error(
          `Modern AI Part III correction placement failed: ${correction.formula}`,
        );
      }
      sourceBody.splice(
        insertionIndex + 1,
        0,
        paragraph(correction.intro),
        formulaNode,
      );
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

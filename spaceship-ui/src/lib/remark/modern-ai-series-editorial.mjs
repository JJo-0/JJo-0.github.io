const TARGET_FILE = 'mordern-artificial-intelligence.mdx';

function plainText(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map(plainText).join('');
}

function paragraph(children) {
  return { type: 'paragraph', children };
}

function text(value) {
  return { type: 'text', value };
}

function strong(value) {
  return { type: 'strong', children: [text(value)] };
}

/**
 * Replace the obsolete draft-era nine-part table in the original Part I source
 * with the reader-facing eight-part editorial statement.
 *
 * The source file is intentionally left byte-stable because its 238 formula
 * bodies are protected by a SHA-256 ledger. The transform is exact-file and
 * exact-heading scoped; it is not a general Markdown compatibility shim.
 */
export default function modernAiSeriesEditorial() {
  return (tree, file) => {
    const sourcePath = String(file?.path ?? file?.history?.[0] ?? '').replaceAll('\\', '/');
    if (!sourcePath.endsWith(`/${TARGET_FILE}`) && sourcePath !== TARGET_FILE) return;

    const children = tree?.children;
    if (!Array.isArray(children)) return;

    const start = children.findIndex(
      (node) => node.type === 'heading' && node.depth === 2 && plainText(node).trim() === '시리즈 지도',
    );

    // Once the source itself is migrated, the transform becomes a harmless no-op.
    if (start < 0) return;

    const end = children.findIndex(
      (node, index) =>
        index > start &&
        node.type === 'heading' &&
        node.depth === 2 &&
        plainText(node).trim() === '원자료 표기 감사',
    );

    if (end < 0) {
      throw new Error(`${TARGET_FILE}: could not find the end of the obsolete series-map section`);
    }

    const replacement = [
      {
        type: 'heading',
        depth: 2,
        children: [text('시리즈 구성')],
      },
      paragraph([
        text('이 시리즈는 '),
        strong('실제로 확보한 ECE5992 강의자료'),
        text('를 기준으로 구성한다. 1장 통합판인 현재 글과 후속 PDF 7개를 합쳐 '),
        strong('총 8편'),
        text('이며, 번호를 맞추기 위한 빈 글이나 자리 채우기용 게시물은 만들지 않는다.'),
      ]),
      paragraph([
        text('상단의 '),
        strong('8편 학습 지도'),
        text('는 다음 흐름을 한 화면에서 보여준다.'),
      ]),
      paragraph([
        strong(
          '기초 수학·확률 → 머신러닝 일반화 → 퍼셉트론·CNN → 기울기 최적화 → 이미지 분류 → 의미론적 분할 → VAE·확산모델 → 대조 표현학습',
        ),
      ]),
      paragraph([
        text(
          '후속 글이 공개되면 구성도의 해당 항목이 자동으로 링크로 바뀐다. 따라서 이 글 안에 PDF 파일명 중심의 중복 표를 다시 두지 않는다.',
        ),
      ]),
    ];

    children.splice(start, end - start, ...replacement);
  };
}

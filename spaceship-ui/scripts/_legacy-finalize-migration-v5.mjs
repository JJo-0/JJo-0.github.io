import fs from 'node:fs';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';

const root = process.cwd();
const postsDir = path.join(root, 'site', 'content', 'posts');
const assetsDir = path.join(root, 'site', 'assets');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, text) {
  fs.writeFileSync(file, text, 'utf8');
}

function replaceExact(file, oldValue, newValue, label, expected = 1) {
  const text = read(file);
  const count = text.split(oldValue).length - 1;
  if (count !== expected) {
    throw new Error(`${label}: expected ${expected} occurrence(s), found ${count}`);
  }
  write(file, text.split(oldValue).join(newValue));
}

function assertExists(file, label) {
  if (!fs.existsSync(file)) throw new Error(`${label}: missing ${file}`);
}

// ---------------------------------------------------------------------------
// 1. Eliminate /image legacy storage.
// ---------------------------------------------------------------------------
const moves = new Map([
  [
    path.join(assetsDir, 'image', 'HPE_general_pipline.png'),
    path.join(assetsDir, 'assets', 'posts', 'human-pose-estimate', 'hpe-general-pipeline.png'),
  ],
  [
    path.join(assetsDir, 'image', 'graph_example_1.png'),
    path.join(assetsDir, 'assets', 'posts', '2024-06-04-2', 'graph-example-1.png'),
  ],
  [
    path.join(assetsDir, 'image', 'mouse_surprised.gif'),
    path.join(assetsDir, 'assets', 'site', 'mouse-surprised.gif'),
  ],
]);

for (const [from, to] of moves) {
  assertExists(from, 'asset migration source');
  if (fs.existsSync(to)) throw new Error(`asset migration destination already exists: ${to}`);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
}

replaceExact(
  path.join(postsDir, 'human-pose-estimate.md'),
  '/image/HPE_general_pipline.png',
  '/assets/posts/human-pose-estimate/hpe-general-pipeline.png',
  'HPE asset reference',
);
replaceExact(
  path.join(postsDir, '2024-06-04-2.md'),
  '/image/graph_example_1.png',
  '/assets/posts/2024-06-04-2/graph-example-1.png',
  'data-structure asset reference',
);
replaceExact(
  path.join(root, 'src', 'pages', 'index.astro'),
  '/image/mouse_surprised.gif',
  '/assets/site/mouse-surprised.gif',
  'homepage mouse asset reference',
);

for (const name of [
  'AMR_.png',
  'AMR_Sample_V1.mp4',
  'AMR_Sample_V2.mp4',
  'circle_face.JPG',
  'raspberrypi_info.jpeg',
  'raspberrypi_setting.jpeg',
  '증명사진.jpeg',
]) {
  const file = path.join(assetsDir, 'image', name);
  assertExists(file, 'proven orphan legacy asset');
  fs.rmSync(file);
}

const legacyImageDir = path.join(assetsDir, 'image');
const remainingImages = fs.readdirSync(legacyImageDir);
if (remainingImages.length) {
  throw new Error(`legacy /image directory not empty: ${remainingImages.join(', ')}`);
}
fs.rmdirSync(legacyImageDir);

// ---------------------------------------------------------------------------
// 2. Make fragment compatibility explicit in source.
// ---------------------------------------------------------------------------
replaceExact(path.join(postsDir, 'linux.md'), '#Window', '#window', 'linux fragment');
replaceExact(
  path.join(postsDir, 'ros2.md'),
  '#유명한-라이브러리',
  '#유명한-라이브러리-따로-공부해서-포스팅할-예정',
  'ros2 fragment',
);

// ---------------------------------------------------------------------------
// 3. Materialize restoreLegacyHtml in source using the same CommonMark AST.
// ---------------------------------------------------------------------------
const legacyHtmlPosts = [
  '2025-05-20.md',
  '2025-06-27.md',
  '2025-07-23-2.md',
  '2025-07-25.md',
  'deep-search-gemini.md',
  'deep-search-travel-prompt.md',
];
const htmlBlockStart = /^\s*(?:<!--[\s\S]*?-->\s*)*<(?:article|aside|blockquote|canvas|div|figure|footer|form|h[1-6]|header|ins|main|nav|ol|p|script|section|style|table|ul)\b/i;

function walk(node, visitor) {
  if (!node || typeof node !== 'object') return;
  visitor(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, visitor);
  }
}

function lineStartOffsets(source) {
  const offsets = [0];
  for (let i = 0; i < source.length; i += 1) {
    if (source.charCodeAt(i) === 10) offsets.push(i + 1);
  }
  return offsets;
}

function materializeLegacyHtml(file) {
  let source = read(file);
  let total = 0;
  let passes = 0;

  for (; passes < 24; passes += 1) {
    const tree = unified().use(remarkParse).parse(source);
    const targets = [];
    walk(tree, (node) => {
      if (node.type !== 'code' || node.lang || typeof node.value !== 'string') return;
      if (!htmlBlockStart.test(node.value)) return;
      if (!node.position?.start?.line || !node.position?.end?.line) {
        throw new Error(`${file}: targeted code node has no source position`);
      }
      targets.push(node);
    });

    if (!targets.length) break;

    const offsets = lineStartOffsets(source);
    const edits = targets.map((node) => {
      const startLine = node.position.start.line;
      const endLine = node.position.end.line;
      const start = offsets[startLine - 1];
      const end = endLine < offsets.length ? offsets[endLine] : source.length;
      const original = source.slice(start, end);
      const trailingNewline = original.endsWith('\n') ? '\n' : '';
      return { start, end, replacement: `${node.value}${trailingNewline}` };
    });

    edits.sort((a, b) => b.start - a.start);
    for (const edit of edits) {
      source = source.slice(0, edit.start) + edit.replacement + source.slice(edit.end);
    }
    total += edits.length;
  }

  if (passes === 24) throw new Error(`${file}: AST HTML materialization did not converge`);
  if (!total) throw new Error(`${file}: no audited legacy HTML code nodes found`);
  write(file, source);
  console.log(`materialized ${path.basename(file)}: ${total} code node(s), ${passes} pass(es)`);
}

for (const name of legacyHtmlPosts) {
  materializeLegacyHtml(path.join(postsDir, name));
}

// ---------------------------------------------------------------------------
// 4. Materialize literal strong repairs only for audited cases.
// ---------------------------------------------------------------------------
replaceExact(
  path.join(postsDir, 'ai-consciousness-deep-research-1.md'),
  '**기능적 행동(Functional behavior)**과 **주관적 경험(Phenomenal experience)**',
  '<strong>기능적 행동(Functional behavior)</strong>과 <strong>주관적 경험(Phenomenal experience)</strong>',
  'AI consciousness part 1 adjacent strong boundary',
);
replaceExact(
  path.join(postsDir, 'ai-consciousness-deep-research-2.md'),
  '**기억의 지속성(memory persistence)**과 **계산 주체의 지속성(causal continuity)**',
  '<strong>기억의 지속성(memory persistence)</strong>과 <strong>계산 주체의 지속성(causal continuity)</strong>',
  'AI consciousness part 2 adjacent strong boundary',
);

const strongPosts = [
  'raspberry-pi-5.md',
  'human-forecasting.md',
  '2025-03-07.md',
  '2025-04-25.md',
  '2025-05-08.md',
  '2025-06-27.md',
  '2025-07-23.md',
  'venture-global-comprehensive-report.md',
  'ai-consciousness-deep-research-1.md',
  'ai-consciousness-deep-research-2.md',
  'ai-consciousness-deep-research-3.md',
];
const knownStrongInner = new Set([
  '스펙 간략하게',
  '3D 포즈 추정(HPE, Human Pose Forecasting)',
  'Trajectory Prediction(사람의 이동 경로 예측)',
  '인간 자세 예측(Human Pose Forecasting/Prediction)',
  '기준선(baseline)',
  '40배 빠른 속도 향상(173 FPS)',
  '“양산계의 No.1 브랜드”',
  '“가격 대비 최고의 만족도”',
  '워터프론트(Waterfront)',
  '가격:',
  '마이브렐라(Mybrella)',
  '“양산 쓰니 한여름에도 걸을 만하다”',
  '혼동 행렬(Confusion Matrix)',
  '평균 정밀도(Average Precision, AP)',
  '크기(magnitude)',
  '행렬(matrix)',
  '저녁 식사 후 또는 잠들기 1~2시간 전',
  '마그네슘 비스글리시네이트(Magnesium Bisglycinate)',
  '일반의약품(General Pharmaceutical)',
  '건강기능식품(Health Functional Food)',
  '활성형(L-Methylfolate, Methylcobalamin 등)',
  'DSM(네덜란드)이나 BASF(독일)',
  'GAAP 기준(2025 actual anchor)',
  '2026년 7월 26일(KST)',
  '“현상적 의식의 확정적 증거는 미흡하지만, Access consciousness와 기능적 자기조절을 구성하는 여러 구조는 더 이상 단순한 표면적 언어 모방만으로 치부하기 어려워지고 있다”',
  '“윤리 프레임워크별 8대 파생 질문”',
  '기술 실사(Technical Audit)',
  'GWT의 기능적 상동체',
]);
const strongPattern = /\*\*([^*\n]+?)\*\*/g;

for (const name of strongPosts) {
  const file = path.join(postsDir, name);
  let count = 0;
  const text = read(file).replace(strongPattern, (full, inner) => {
    if (!knownStrongInner.has(inner)) return full;
    count += 1;
    return `<strong>${inner}</strong>`;
  });
  if (count) {
    write(file, text);
    console.log(`materialized literal strong ${name}: ${count}`);
  }
}

// ---------------------------------------------------------------------------
// 5. Remove the three compatibility plugins from the normal render pipeline.
// ---------------------------------------------------------------------------
const astroConfig = path.join(root, 'astro.config.mjs');
let config = read(astroConfig);
for (const [oldValue, newValue] of [
  ["import remarkRepairLiteralStrong from './src/lib/remark-repair-literal-strong.mjs';\n", ''],
  ["import restoreLegacyHtml from './src/lib/remark/restore-legacy-html.mjs';\n", ''],
  ["import fixLegacyFragments from './src/lib/rehype/fix-legacy-fragments.mjs';\n", ''],
  ['remarkPlugins: [restoreLegacyHtml, remarkEmoji, remarkRepairLiteralStrong],', 'remarkPlugins: [remarkEmoji],'],
  ['      fixLegacyFragments,\n', ''],
]) {
  if (!config.includes(oldValue)) {
    throw new Error(`astro.config.mjs expected shim pattern missing: ${JSON.stringify(oldValue)}`);
  }
  config = config.replace(oldValue, newValue);
}
write(astroConfig, config);

for (const file of [
  path.join(root, 'src', 'lib', 'remark-repair-literal-strong.mjs'),
  path.join(root, 'src', 'lib', 'remark', 'restore-legacy-html.mjs'),
  path.join(root, 'src', 'lib', 'rehype', 'fix-legacy-fragments.mjs'),
]) {
  assertExists(file, 'shim implementation');
  fs.rmSync(file);
}

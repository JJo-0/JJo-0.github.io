import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const catalogPath = path.join(root, 'src', 'data', 'modern-ai-series.json');
const postsDir = path.join(root, 'site', 'content', 'posts');
const partOneSourcePath = path.join(postsDir, 'mordern-artificial-intelligence.mdx');
const distPartOne = path.join(
  root,
  'dist',
  'posts',
  '2025-05-16-mordern-artificial-intelligence',
  'index.html',
);
const issues = [];

const expectedTitles = [
  'AI·ML·DL에서 확률·최적화까지',
  '머신러닝의 기본 과제와 일반화',
  '퍼셉트론·MLP·CNN과 컨볼루션',
  '기울기 기반 최적화: GD에서 OGM까지',
  '이미지 분류의 발전: AlexNet에서 SE Network까지',
  '의미론적 영상 분할: FCN·U-Net·DeepLab',
  '영상 잡음제거·VAE·확산모델',
  '대조 표현학습: InfoNCE·SimCLR·BYOL·CLIP',
];

function filesUnder(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function getFrontmatter(source) {
  return source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
}

if (!fs.existsSync(catalogPath)) {
  issues.push('src/data/modern-ai-series.json: catalog is missing');
} else {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  if (catalog.id !== 'modern-artificial-intelligence') {
    issues.push(`catalog: unexpected id ${String(catalog.id)}`);
  }
  if (catalog.title !== '현대 인공지능') {
    issues.push(`catalog: unexpected title ${String(catalog.title)}`);
  }
  if (catalog.total !== 8) {
    issues.push(`catalog: total must be 8, found ${String(catalog.total)}`);
  }
  if (!Array.isArray(catalog.entries) || catalog.entries.length !== 8) {
    issues.push(`catalog: expected exactly 8 entries, found ${catalog.entries?.length ?? 0}`);
  } else {
    const orders = catalog.entries.map((entry) => entry.order);
    if (JSON.stringify(orders) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8])) {
      issues.push(`catalog: orders must be exactly 1–8, found ${orders.join(', ')}`);
    }

    const titles = catalog.entries.map((entry) => entry.title);
    if (JSON.stringify(titles) !== JSON.stringify(expectedTitles)) {
      issues.push('catalog: reader-facing titles differ from the approved eight-part structure');
    }

    const serialized = JSON.stringify(catalog);
    for (const forbidden of ['원자료 대기', '아직 업로드되지 않음', '9편']) {
      if (serialized.includes(forbidden)) {
        issues.push(`catalog: forbidden placeholder/old-plan text remains: ${forbidden}`);
      }
    }
  }
}

const seenOrders = new Map();
for (const file of filesUnder(postsDir, (candidate) => /\.mdx?$/.test(candidate))) {
  const source = fs.readFileSync(file, 'utf8');
  const frontmatter = getFrontmatter(source);
  if (!/series:\s*[\s\S]*?id:\s*['"]modern-artificial-intelligence['"]/m.test(frontmatter)) {
    continue;
  }

  const orderMatch = frontmatter.match(/series:\s*[\s\S]*?order:\s*(\d+)/m);
  const order = Number(orderMatch?.[1]);
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  if (!Number.isInteger(order) || order < 1 || order > 8) {
    issues.push(`${relative}: Modern AI series order must be an integer from 1 to 8`);
    continue;
  }
  if (seenOrders.has(order)) {
    issues.push(`${relative}: duplicate Modern AI order ${order} (also ${seenOrders.get(order)})`);
  } else {
    seenOrders.set(order, relative);
  }
}

if (seenOrders.get(1) !== 'site/content/posts/mordern-artificial-intelligence.mdx') {
  issues.push('Modern AI Part I must remain the canonical mordern-artificial-intelligence.mdx post');
}

if (!fs.existsSync(partOneSourcePath)) {
  issues.push('Modern AI Part I source is missing');
} else {
  const source = fs.readFileSync(partOneSourcePath, 'utf8');
  for (const required of [
    "title: '현대 인공지능 I — AI·ML·DL에서 확률·최적화까지'",
    'updatedDate: 2026-08-18',
    '## 시리즈 구성',
    '**총 8편**',
    '**기초 수학·확률 → 머신러닝 일반화 → 퍼셉트론·CNN → 기울기 최적화 → 이미지 분류 → 의미론적 분할 → VAE·확산모델 → 대조 표현학습**',
  ]) {
    if (!source.includes(required)) {
      issues.push(`Part I source: missing source-native eight-part text: ${required}`);
    }
  }
  for (const forbidden of [
    ': 1장 전체',
    '## 시리즈 지도',
    '전체 시리즈는 **9편**',
    '| 6 | 원자료 대기',
    '아직 업로드되지 않음',
  ]) {
    if (source.includes(forbidden)) {
      issues.push(`Part I source: obsolete nine-part/placeholder text remains: ${forbidden}`);
    }
  }
}

const componentPath = path.join(root, 'src', 'components', 'SeriesNavigation.astro');
const componentSource = fs.existsSync(componentPath)
  ? fs.readFileSync(componentPath, 'utf8')
  : '';
for (const required of [
  "import modernAiSeries from '@/data/modern-ai-series.json'",
  'modernAiSeries.entries',
  '현대 인공지능 8편 구성',
  '후속 PDF의 내용을 담은 글이 공개되면 같은 위치가 자동으로 활성화',
]) {
  if (!componentSource.includes(required)) {
    issues.push(`SeriesNavigation.astro: missing required eight-part map contract: ${required}`);
  }
}
if (componentSource.includes('원자료 대기')) {
  issues.push('SeriesNavigation.astro: obsolete placeholder wording must not return');
}

const configPath = path.join(root, 'astro.config.mjs');
const configSource = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : '';
if (configSource.includes('modernAiSeriesEditorial')) {
  issues.push('astro.config.mjs: the completed one-time source migration must not become a runtime/build shim');
}
if (fs.existsSync(path.join(root, 'src', 'lib', 'remark', 'modern-ai-series-editorial.mjs'))) {
  issues.push('source-native contract: obsolete Modern AI editorial transform file still exists');
}
if (fs.existsSync(path.join(root, 'scripts', 'patch-modern-ai-source-once.mjs'))) {
  issues.push('source-native contract: one-time source migration helper still exists');
}

if (!fs.existsSync(distPartOne)) {
  issues.push('dist: Modern AI Part I output is missing; run `pnpm build` before this audit');
} else {
  const html = fs.readFileSync(distPartOne, 'utf8');
  const requiredRenderedText = [
    '현대 인공지능 I — AI·ML·DL에서 확률·최적화까지',
    '현대 인공지능 · 8편 학습 지도',
    '읽는 중',
    ...expectedTitles,
  ];
  for (const required of requiredRenderedText) {
    if (!html.includes(required)) {
      issues.push(`rendered Part I: missing ${required}`);
    }
  }

  for (const forbidden of [
    '전체 시리즈는 <strong>9편</strong>',
    '전체 시리즈는 **9편**',
    '원자료 대기',
    '아직 업로드되지 않음',
  ]) {
    if (html.includes(forbidden)) {
      issues.push(`rendered Part I: obsolete nine-part/placeholder text remains: ${forbidden}`);
    }
  }

  const followUpCount = (html.match(/후속 편/g) ?? []).length;
  if (followUpCount !== 7) {
    issues.push(`rendered Part I: expected 7 non-placeholder follow-up cards, found ${followUpCount}`);
  }

  if (!html.includes('aria-label="현대 인공지능 8편 구성"')) {
    issues.push('rendered Part I: accessible eight-part map label is missing');
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`modern-ai-series-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `modern-ai-series-audit: PASS (8 approved entries; ${seenOrders.size} published part(s); source-native Part I; no placeholder route/text; rendered map verified)`,
);

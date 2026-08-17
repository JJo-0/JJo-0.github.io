from pathlib import Path
import json
import subprocess

root = Path('spaceship-ui')

# Restore the original mouse GIF at the exact homepage URL requested.
gif_dir = root / 'site/assets/image'
gif_dir.mkdir(parents=True, exist_ok=True)
gif_bytes = subprocess.check_output([
    'git',
    'show',
    '4673bb9e47d5872d61c43739a53d24bb65894b0f:spaceship-ui/site/assets/assets/site/mouse-surprised.gif',
])
(gif_dir / 'mouse_surprised.gif').write_bytes(gif_bytes)

# Homepage profile: photo -> mouse GIF.
index = root / 'src/pages/index.astro'
text = index.read_text(encoding='utf-8')
imports = "import { Image } from 'astro:assets';\nimport profilePhoto from '@/site-assets/about_photo.jpg';\n"
if text.count(imports) != 1:
    raise SystemExit('homepage image imports did not match exactly once')
text = text.replace(imports, '', 1)
old = '''    <div class="mx-auto md:mx-0 w-32 sm:w-40 md:w-48 lg:w-52 aspect-square shrink-0">
      <Image
        src={profilePhoto}
        alt={`${SITE.author} profile photo`}
        width={416}
        height={416}
        widths={[160, 208, 320, 416]}
        sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 208px"
        fetchpriority="high"
        class="w-full h-full object-cover rounded-2xl border border-border shadow-lg"
      />
    </div>'''
new = '''    <div class="mx-auto md:mx-0 w-32 sm:w-40 md:w-48 lg:w-52 aspect-square shrink-0">
      <img
        src="/image/mouse_surprised.gif"
        alt={`${SITE.author} profile animation`}
        width="416"
        height="416"
        fetchpriority="high"
        decoding="async"
        class="w-full h-full object-cover rounded-2xl border border-border shadow-lg"
      />
    </div>'''
if text.count(old) != 1:
    raise SystemExit('homepage profile block did not match exactly once')
index.write_text(text.replace(old, new, 1), encoding='utf-8')

# Vision: remove authoring residue and keep the native Math component explicit.
vision = root / 'site/content/posts/vision.mdx'
text = vision.read_text(encoding='utf-8')
replacements = {
    "description: '- 모르는 Vision, AI 관련 용어들 개념부터 정리 없이 올릴 생각이다....'":
        "description: 'Computer Vision과 딥러닝의 핵심 개념, 모델, 학술 자료를 정리한 연구 노트입니다.'",
    '- 모르는 Vision, AI 관련 용어들 개념부터 정리 없이 올릴 생각이다.  ':
        'Computer Vision과 딥러닝을 공부하면서 자주 다시 확인하게 되는 개념, 모델, 학술 자료를 한 곳에 정리한다. 각 항목은 개념과 수식을 중심으로 계속 보완한다.  ',
    'SoftMax는 수식의 아래와 같다. ':
        'Softmax 함수는 입력 벡터를 확률 분포로 정규화하며 다음과 같이 정의한다. ',
    '<Math display tex={"softmax(x_i) = \\\\frac{e^{x_i}}{\\\\sum_{j=1}^{n} e^{x_j}}"} />':
        '<Math display label="Softmax function" tex={"\\operatorname{softmax}(x_i) = \\\\frac{e^{x_i}}{\\\\sum_{j=1}^{n} e^{x_j}}"} />',
}
for before, after in replacements.items():
    if text.count(before) != 1:
        raise SystemExit(f'vision replacement target mismatch: {before[:80]}')
    text = text.replace(before, after, 1)
vision.write_text(text, encoding='utf-8')

# Linear algebra: unfinished raw-TeX Markdown -> native MDX + Math.astro.
linear_md = root / 'site/content/posts/2025-05-08.md'
linear_mdx = root / 'site/content/posts/2025-05-08.mdx'
if not linear_md.exists():
    raise SystemExit('linear algebra Markdown source missing')
linear = r'''---
title: '선형 대수'
description: '벡터와 행렬의 노름을 중심으로 선형대수의 기본 정의와 머신러닝 활용을 정리합니다.'
pubDate: 2025-05-08
tags: ['artificial-intelligence', 'machine-learning', 'deep-learning', 'linear-algebra', 'projects', 'computer-vision']
lang: 'ko'
---

import Math from '@/components/post/Math.astro';

벡터와 행렬의 **크기(magnitude)**를 수치로 표현하는 노름(norm)을 중심으로 핵심 정의와 성질을 정리한다. 노름은 선형대수의 기본 개념이면서 머신러닝의 손실 함수, 정규화, 최적화 제약을 이해하는 데도 자주 등장한다.

## 1. 노름(Norm)이란?

노름은 벡터 또는 행렬의 크기를 나타내는 함수다. 가장 익숙한 예는 유클리드 노름(Euclidean norm), 즉 ℓ₂ 노름이다.

<Math display label="L2 norm" tex={"\\|\\mathbf{x}\\|_2 = \\sqrt{\\sum_{i=1}^{N} x_i^2}"} />

제곱 형태로는 내적과 연결된다.

<Math display label="Squared L2 norm" tex={"\\|\\mathbf{x}\\|_2^2 = \\mathbf{x}^{\\top}\\mathbf{x}"} />

## 2. 노름이 만족해야 하는 성질

함수 <Math tex={"f : \\mathbb{R}^N \\to \\mathbb{R}"} />가 노름이 되려면 다음 네 조건을 만족해야 한다.

1. **비음수성(Non-negativity)**

<Math display tex={"\\forall \\mathbf{x} \\in \\mathbb{R}^N,\\quad f(\\mathbf{x}) \\ge 0"} />

2. **양의 정부호성(Definiteness)**

<Math display tex={"f(\\mathbf{x}) = 0 \\iff \\mathbf{x} = \\mathbf{0}"} />

3. **동차성(Homogeneity)**

<Math display tex={"\\forall t \\in \\mathbb{R},\\quad f(t\\mathbf{x}) = |t|f(\\mathbf{x})"} />

4. **삼각 부등식(Triangle inequality)**

<Math display tex={"f(\\mathbf{x}+\\mathbf{y}) \\le f(\\mathbf{x}) + f(\\mathbf{y})"} />

## 3. 주요 벡터 노름

### ℓ₁ 노름 (Manhattan norm)

<Math display label="L1 norm" tex={"\\|\\mathbf{x}\\|_1 = \\sum_{i=1}^{N} |x_i|"} />

각 성분의 절댓값을 합한다. ℓ₁ 정규화는 일부 계수를 정확히 0으로 만드는 경향이 있어 sparsity를 유도할 때 자주 사용된다.

### ℓ∞ 노름 (Maximum norm)

<Math display label="L infinity norm" tex={"\\|\\mathbf{x}\\|_{\\infty} = \\max_i |x_i|"} />

성분 가운데 절댓값이 가장 큰 값을 벡터의 크기로 사용한다.

### 일반적인 ℓₚ 노름

<Math display label="Lp norm" tex={"\\|\\mathbf{x}\\|_p = \\left(\\sum_{i=1}^{N} |x_i|^p\\right)^{1/p},\\qquad p \\ge 1"} />

- p = 1이면 ℓ₁ 노름이다.
- p = 2이면 ℓ₂ 노름이다.
- p가 무한대로 갈 때 ℓ∞ 노름으로 수렴한다.
- p < 1인 식은 삼각 부등식을 만족하지 않으므로 일반적인 의미의 노름이 아니다.

## 4. 행렬의 노름: Frobenius Norm

행렬에도 노름을 정의할 수 있다. 대표적인 예가 Frobenius 노름이다.

<Math display label="Frobenius norm" tex={"\\|\\mathbf{A}\\|_F = \\sqrt{\\sum_{i=1}^{M}\\sum_{j=1}^{N} A_{i,j}^2} = \\sqrt{\\operatorname{tr}(\\mathbf{A}^{\\top}\\mathbf{A})}"} />

행렬의 모든 원소를 하나의 긴 벡터로 본 뒤 ℓ₂ 노름을 계산한 것과 같은 값이다. 행렬 차이의 크기, 저랭크 근사, 신경망 가중치 분석 등에서 자주 사용한다.

## 5. 머신러닝에서의 활용

- **ℓ₁ regularization**: 희소한 파라미터를 유도하는 데 사용한다.
- **ℓ₂ regularization / weight decay**: 큰 가중치에 패널티를 부여해 과적합을 줄이는 데 사용한다.
- **MSE와 거리 기반 손실**: ℓ₂ 거리와 밀접하게 연결된다.
- **MAE**: ℓ₁ 거리와 연결된다.
- **최적화 제약**: 파라미터나 perturbation의 크기를 특정 노름 이하로 제한하는 형태가 자주 등장한다.

## 정리

노름은 벡터와 행렬의 크기를 일관된 방식으로 정의한다. ℓ₁, ℓ₂, ℓ∞는 서로 다른 특성을 갖고 있으며, 어떤 노름을 선택하느냐에 따라 최적화 문제와 모델의 성질도 달라진다. 머신러닝에서는 거리 측정, 정규화, 손실 함수, 강건성 분석을 이해할 때 반복적으로 등장하는 기본 도구다.
'''
linear_mdx.write_text(linear, encoding='utf-8')
linear_md.unlink()

# DRL review: remove upload instructions and draft wording.
drl = root / 'site/content/posts/2025-11-08.md'
text = drl.read_text(encoding='utf-8')
old = '''## 3) 발표 슬라이드 업로드 방식

아래처럼 슬라이드 이미지를 올린 뒤, 각 장 설명을 채워 넣는다.

- 이미지 경로 예시: `/assets/slides/drl-robot-251110/slide-01.png`
- 파일명 규칙: `slide-01.png`, `slide-02.png`, ..., `slide-30.png`
- 한 슬라이드당 구성:
  - 슬라이드 이미지 1개
  - 핵심 메시지 2~4문장
  - 내 해석/비판 2~3문장

---

## 4) 슬라이드별 설명 초안 (30장)'''
new = '''## 3) 발표 자료 구성

발표 자료는 30장의 슬라이드 이미지와 각 장의 핵심 메시지·해석을 함께 읽을 수 있도록 구성했다. 아래에서는 슬라이드 순서대로 논문의 분류 체계, 실세계 성공 수준, 각 로봇 역량의 연구 결과와 미해결 과제를 정리한다.

---

## 4) 슬라이드별 설명 (30장)'''
if text.count(old) != 1:
    raise SystemExit('DRL draft block did not match exactly once')
drl.write_text(text.replace(old, new, 1), encoding='utf-8')

# Keep /image forbidden for posts, but allow exactly one homepage-only GIF.
contract = root / 'scripts/post-content-contract.mjs'
text = contract.read_text(encoding='utf-8')
old_decl = "const retiredImageDir = path.join(publicDir, 'image');"
new_decl = "const homepageImageDir = path.join(publicDir, 'image');\nconst HOMEPAGE_IMAGE_REFERENCE = '/image/mouse_surprised.gif';\nconst HOMEPAGE_IMAGE_SOURCE = 'src/pages/index.astro';"
if text.count(old_decl) != 1:
    raise SystemExit('post contract image declaration mismatch')
text = text.replace(old_decl, new_decl, 1)
old_block = '''// /image was fully retired after the final legacy-media migration. Reintroducing the
// directory is a regression rather than a new allowlist entry.
if (fs.existsSync(retiredImageDir)) {
  issues.push('site/assets/image: retired legacy directory must not be reintroduced');
}

// Catch /image references outside post Markdown too (for example homepage components).
for (const sourceRoot of [path.join(root, 'site', 'content'), path.join(root, 'src')]) {
  for (const file of filesUnder(sourceRoot, (candidate) =>
    /\.(?:md|mdx|astro|svelte|ts|js|mjs|css|json)$/.test(candidate),
  )) {
    const relative = path.relative(root, file).replaceAll(path.sep, '/');
    const source = stripFencedCode(fs.readFileSync(file, 'utf8'));
    if (/\/image\//.test(source)) {
      issues.push(`${relative}: /image is retired and must not be referenced`);
    }
  }
}
'''
new_block = '''// The old /image tree remains retired. One exact homepage animation is intentionally
// grandfathered because it is site identity, not post-owned media.
const homepageImage = path.join(homepageImageDir, 'mouse_surprised.gif');
if (!fs.existsSync(homepageImage) || !fs.statSync(homepageImage).isFile()) {
  issues.push('site/assets/image/mouse_surprised.gif: required homepage animation is missing');
}
if (fs.existsSync(homepageImageDir)) {
  const unexpected = fs
    .readdirSync(homepageImageDir, { withFileTypes: true })
    .filter((entry) => entry.name !== 'mouse_surprised.gif' || !entry.isFile())
    .map((entry) => entry.name);
  if (unexpected.length) {
    issues.push(`site/assets/image: only mouse_surprised.gif is allowed; found ${unexpected.join(', ')}`);
  }
}

for (const sourceRoot of [path.join(root, 'site', 'content'), path.join(root, 'src')]) {
  for (const file of filesUnder(sourceRoot, (candidate) =>
    /\.(?:md|mdx|astro|svelte|ts|js|mjs|css|json)$/.test(candidate),
  )) {
    const relative = path.relative(root, file).replaceAll(path.sep, '/');
    const source = stripFencedCode(fs.readFileSync(file, 'utf8'));
    for (const match of source.matchAll(/\/image\/[^\s)"'<>{]+/g)) {
      const reference = match[0].replace(/[.,;:]$/, '');
      if (relative === HOMEPAGE_IMAGE_SOURCE && reference === HOMEPAGE_IMAGE_REFERENCE) continue;
      issues.push(`${relative}: /image is retired for content; only the homepage mouse GIF is allowed`);
    }
  }
}
'''
if text.count(old_block) != 1:
    raise SystemExit('post contract /image block mismatch')
text = text.replace(old_block, new_block, 1)
text = text.replace(
    'canonical post components/assets/fence ids/chart opt-ins/lifecycle, /image retired',
    'canonical post components/assets/fence ids/chart opt-ins/lifecycle, homepage GIF exception',
    1,
)
contract.write_text(text, encoding='utf-8')

# Permanent rendered-content audit: raw TeX + high-confidence authoring residue.
audit = root / 'scripts/rendered-content-quality.mjs'
audit.write_text(r'''import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];

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

function visibleArticleText(html) {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? '';
  return article
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code\b[\s\S]*?<\/code>/gi, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const rawMathPatterns = [
  /\$\$/,
  /\\(?:frac|mathbf|mathbb|sqrt|sum|forall|iff|infty|operatorname|left|right|text|top)(?:\b|\{)/,
];
const authoringResiduePatterns = [
  /블로그\s*초안\s*구성/i,
  /슬라이드별\s*설명\s*초안/i,
  /정리\s*없이\s*올릴\s*생각/i,
  /작성\s*예정/i,
  /업데이트\s*예정/i,
  /\bTODO\b/i,
  /\bTBD\b/i,
];

const postFiles = filesUnder(path.join(dist, 'posts'), (file) =>
  file.endsWith(`${path.sep}index.html`) && !file.includes(`${path.sep}tag${path.sep}`),
);

for (const file of postFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const text = visibleArticleText(html);
  const relative = path.relative(dist, file).replaceAll(path.sep, '/');
  for (const pattern of rawMathPatterns) {
    if (pattern.test(text)) issues.push(`${relative}: raw TeX leaked into rendered article (${pattern})`);
  }
  for (const pattern of authoringResiduePatterns) {
    if (pattern.test(text)) issues.push(`${relative}: unfinished authoring residue detected (${pattern})`);
  }
}

const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!home.includes('src="/image/mouse_surprised.gif"')) {
  issues.push('index.html: homepage mouse GIF is not rendered from /image/mouse_surprised.gif');
}
if (!fs.existsSync(path.join(dist, 'image', 'mouse_surprised.gif'))) {
  issues.push('image/mouse_surprised.gif: homepage GIF missing from built artifact');
}

const visionPath = path.join(dist, 'posts', '2025-02-18-vision', 'index.html');
const linearPath = path.join(dist, 'posts', '2025-05-08-2025-05-08', 'index.html');
const drlPath = path.join(dist, 'posts', '2025-11-08-2025-11-08', 'index.html');

for (const [label, file, minimumMathBlocks] of [
  ['Vision', visionPath, 2],
  ['Linear algebra', linearPath, 8],
]) {
  if (!fs.existsSync(file)) {
    issues.push(`${label}: expected built post is missing`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const count = (html.match(/class="math-display/g) ?? []).length;
  if (count < minimumMathBlocks) {
    issues.push(`${label}: expected at least ${minimumMathBlocks} rendered Math blocks, found ${count}`);
  }
}

if (fs.existsSync(drlPath)) {
  const text = visibleArticleText(fs.readFileSync(drlPath, 'utf8'));
  if (/슬라이드별\s*설명\s*초안/i.test(text)) {
    issues.push('DRL review: slide section still exposes draft wording');
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`rendered-content-quality: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `rendered-content-quality: PASS (${postFiles.length} posts, no raw TeX/high-confidence draft residue, required Math/GIF output present)`,
);
''', encoding='utf-8')

# Wire the new audit into the permanent content gate.
package_file = root / 'package.json'
package = json.loads(package_file.read_text(encoding='utf-8'))
package['scripts']['rendered:check'] = 'node scripts/rendered-content-quality.mjs'
package['scripts']['content:check'] = (
    'pnpm post:check && node scripts/content-integrity.mjs && '
    'node scripts/modern-ai-formula-audit.mjs && pnpm runtime:check && pnpm rendered:check'
)
package_file.write_text(json.dumps(package, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

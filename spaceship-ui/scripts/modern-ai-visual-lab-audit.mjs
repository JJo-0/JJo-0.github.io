import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const issues = [];
const componentPath = path.join(root, 'src/components/post/interactive/PcaProjectionLab.svelte');
const pagePath = path.join(root, 'src/pages/posts/[...slug]/index.astro');

for (const file of [componentPath, pagePath]) {
  if (!fs.existsSync(file)) issues.push(`${path.relative(root, file)} is missing`);
}

if (fs.existsSync(componentPath)) {
  const source = fs.readFileSync(componentPath, 'utf8');
  const required = [
    'data-modern-ai-visual="pca"',
    'Interactive PCA lab',
    '공분산',
    '고윳값',
    'PC1',
    'type="range"',
    'on:pointerdown',
    'bind:value={angleDeg}',
    'aria-live="polite"',
    'touch-action:none',
  ];
  for (const token of required) {
    if (!source.includes(token)) issues.push(`PCA visual lab missing interaction token: ${token}`);
  }
  if (/<iframe\b|<script\b[^>]*src=|raw\.githubusercontent\.com/i.test(source)) {
    issues.push('PCA visual lab must remain first-party: iframe/external script/image reference detected');
  }
}

if (fs.existsSync(pagePath)) {
  const source = fs.readFileSync(pagePath, 'utf8');
  const required = [
    "import PcaProjectionLab from '@/components/post/interactive/PcaProjectionLab.svelte';",
    "post.data.series?.id === 'modern-artificial-intelligence'",
    'modernAiOrder === 1 || modernAiOrder === 2',
    '<PcaProjectionLab client:visible />',
    '수식이 나타내는 기하를 먼저 움직여 본다',
  ];
  for (const token of required) {
    if (!source.includes(token)) issues.push(`Post layout missing PCA integration token: ${token}`);
  }
}

const built = [
  ['Part I', path.join(root, 'dist/posts/2025-05-16-mordern-artificial-intelligence/index.html')],
  ['Part II', path.join(root, 'dist/posts/2026-08-18-modern-artificial-intelligence-2/index.html')],
];

if (fs.existsSync(path.join(root, 'dist'))) {
  for (const [label, file] of built) {
    if (!fs.existsSync(file)) {
      issues.push(`${label} built route is missing`);
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('data-modern-ai-visual="pca"')) issues.push(`${label} built page lacks PCA lab markup`);
    if (!html.includes('데이터를 직접 회전·정사영하며 PCA를 이해한다')) issues.push(`${label} built page lacks reader-facing visual title`);
    if (!html.includes('수식이 나타내는 기하를 먼저 움직여 본다')) issues.push(`${label} built page lacks visual-learning introduction`);
    if (/katex-error/.test(html)) issues.push(`${label} contains a KaTeX rendering error`);
  }
}

if (issues.length) {
  console.error('modern-ai-visual-lab-audit: FAIL');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('modern-ai-visual-lab-audit: PASS (first-party PCA applet, direct manipulation, live covariance/eigen/projection values, Part I–II layout integration)');

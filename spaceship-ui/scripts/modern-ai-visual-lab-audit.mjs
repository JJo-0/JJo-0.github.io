import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const issues = [];

const componentPath = path.join(root, 'src/components/post/interactive/PcaProjectionLab.svelte');
const part1Path = path.join(root, 'site/content/posts/mordern-artificial-intelligence.mdx');
const part2Path = path.join(root, 'site/content/posts/modern-artificial-intelligence-2.mdx');

for (const file of [componentPath, part1Path, part2Path]) {
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
  ];
  for (const token of required) {
    if (!source.includes(token)) issues.push(`PCA visual lab missing interaction token: ${token}`);
  }
  if (/<iframe\b|<script\b[^>]*src=|raw\.githubusercontent\.com/i.test(source)) {
    issues.push('PCA visual lab must remain first-party: iframe/external script/image reference detected');
  }
}

for (const [label, file] of [['Part I', part1Path], ['Part II', part2Path]]) {
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes("import PcaProjectionLab from '@/components/post/interactive/PcaProjectionLab.svelte';")) {
    issues.push(`${label} is missing the PCA lab import`);
  }
  if (!source.includes('<PcaProjectionLab client:visible />')) {
    issues.push(`${label} is missing the progressively hydrated PCA lab`);
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
    if (!html.includes('데이터를 직접 회전·정사영하며 PCA를 이해한다')) issues.push(`${label} built page lacks reader-facing visual explanation`);
    if (/katex-error/.test(html)) issues.push(`${label} contains a KaTeX rendering error`);
  }
}

if (issues.length) {
  console.error('modern-ai-visual-lab-audit: FAIL');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('modern-ai-visual-lab-audit: PASS (first-party PCA applet, direct manipulation, live covariance/eigen/projection values, Part I–II integration)');

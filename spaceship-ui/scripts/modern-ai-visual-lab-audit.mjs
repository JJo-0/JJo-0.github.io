import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const issues = [];
const visualPath = path.join(root, 'src/components/post/FormulaVisual.astro');
const guidePath = path.join(root, 'src/components/post/FormulaGuide.astro');
const retiredStandalonePath = path.join(root, 'src/components/post/interactive/PcaProjectionLab.svelte');

for (const file of [visualPath, guidePath]) {
  if (!fs.existsSync(file)) issues.push(`${path.relative(root, file)} is missing`);
}
if (fs.existsSync(retiredStandalonePath)) {
  issues.push('Standalone PCA applet remains; visualizations must live inside formula explanation toggles');
}

if (fs.existsSync(visualPath)) {
  const source = fs.readFileSync(visualPath, 'utf8');
  const required = [
    'data-formula-visual={kind}',
    'Direct manipulation visual',
    '직접 움직여 보기',
    "document.addEventListener('toggle'",
    'data-formula-visual-mounted',
    'mountCovariance',
    'mountOptimization',
    'mountProbability',
    'mountClassifier',
    'mountConvolution',
    'mountLinear',
    'mountData',
    'type="range"',
  ];
  for (const token of required) {
    if (!source.includes(token)) issues.push(`Formula visual component missing token: ${token}`);
  }
  if (/<iframe\b|<script\b[^>]*src=|raw\.githubusercontent\.com/i.test(source)) {
    issues.push('Formula visuals must remain first-party: iframe or external runtime reference detected');
  }
}

if (fs.existsSync(guidePath)) {
  const source = fs.readFileSync(guidePath, 'utf8');
  const required = [
    "import FormulaVisual from './FormulaVisual.astro';",
    '<FormulaVisual family={guide.family} formulaId={formulaId} />',
    '쉽게 설명 + 계산 과정',
    '직접 움직이는 시각화',
  ];
  for (const token of required) {
    if (!source.includes(token)) issues.push(`FormulaGuide missing in-toggle visual token: ${token}`);
  }
  const visualIndex = source.indexOf('<FormulaVisual family={guide.family} formulaId={formulaId} />');
  const walkthroughIndex = source.indexOf('data-calculation-walkthrough');
  if (visualIndex < 0 || walkthroughIndex < 0 || visualIndex > walkthroughIndex) {
    issues.push('The visualization must appear inside the toggle before the calculation walkthrough');
  }
}

const built = [
  ['Part I', path.join(root, 'dist/posts/2025-05-16-mordern-artificial-intelligence/index.html'), 238],
  ['Part II', path.join(root, 'dist/posts/2026-08-18-modern-artificial-intelligence-2/index.html'), 65],
];

if (fs.existsSync(path.join(root, 'dist'))) {
  for (const [label, file, expected] of built) {
    if (!fs.existsSync(file)) {
      issues.push(`${label} built route is missing`);
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');
    const guides = (html.match(/data-formula-guide="calculation-first"/g) || []).length;
    const visuals = (html.match(/data-formula-visual="[^"]+"/g) || []).length;
    if (guides !== expected) issues.push(`${label} expected ${expected} formula guides, found ${guides}`);
    if (visuals !== guides) issues.push(`${label} requires one in-toggle visual per guide: guides=${guides}, visuals=${visuals}`);
    if (!html.includes('Direct manipulation visual')) issues.push(`${label} lacks reader-facing direct-manipulation visual copy`);
    if (html.includes('data-modern-ai-visual="pca"') || html.includes('데이터를 직접 회전·정사영하며 PCA를 이해한다')) {
      issues.push(`${label} still exposes the rejected standalone PCA placement`);
    }
    if (/katex-error/.test(html)) issues.push(`${label} contains a KaTeX rendering error`);
  }
}

if (issues.length) {
  console.error('modern-ai-visual-lab-audit: FAIL');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('modern-ai-visual-lab-audit: PASS (one lazy contextual visualization inside every formula explanation toggle; no standalone PCA block)');

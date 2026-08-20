import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];
const INITIAL_RESEARCH_JS_BUDGET = 120 * 1024;
const RENDERER_CHUNK_BUDGET = 220 * 1024;

function read(relative) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    issues.push(`${relative}: required file is missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function filesUnder(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(full, predicate));
    else if (predicate(full)) files.push(full);
  }
  return files;
}

function localScripts(html) {
  return [
    ...new Set(
      [...html.matchAll(/<script\b[^>]*\bsrc=(['"])(\/_astro\/[^'"]+\.js)\1/gi)].map(
        (match) => match[2],
      ),
    ),
  ];
}

if (!fs.existsSync(dist)) {
  console.error('three-experience-contract: dist/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

const packageJson = JSON.parse(read('package.json') || '{}');
const capabilities = read('src/lib/experience/capabilities.ts');
const renderer = read('src/lib/experience/research-renderer.ts');
const gpuComponent = read('src/components/experience/GpuResearchConstellation.svelte');
const fallbackComponent = read('src/components/experience/ResearchConstellation.astro');
const researchPage = read('src/pages/research.astro');

if (!packageJson.dependencies?.three) {
  issues.push('package.json: Three.js must be an explicit production dependency');
}
if (!packageJson.scripts?.['three:check']) {
  issues.push('package.json: three:check script is missing');
}
if (!String(packageJson.scripts?.['content:check'] ?? '').includes('pnpm three:check')) {
  issues.push('package.json: content:check does not execute three:check');
}

for (const tier of ["'safe'", "'normal'", "'ultra'"]) {
  if (!capabilities.includes(tier)) issues.push(`capabilities.ts: missing ${tier} tier`);
}
for (const marker of [
  'prefers-reduced-motion: reduce',
  'saveData',
  "getContext('webgl2'",
  'failIfMajorPerformanceCaveat',
  'dprCap',
  'webgpuAvailable',
]) {
  if (!capabilities.includes(marker)) issues.push(`capabilities.ts: missing capability marker ${marker}`);
}

for (const marker of [
  "await import('@/lib/experience/research-renderer')",
  'data-gpu-constellation',
  'data-gpu-ready',
  'detectExperienceCapabilities',
  'MutationObserver',
  "prefers-reduced-motion: reduce",
]) {
  if (!gpuComponent.includes(marker)) issues.push(`GpuResearchConstellation.svelte: missing ${marker}`);
}
if (gpuComponent.includes('client:load')) {
  issues.push('GpuResearchConstellation.svelte: eager client:load is forbidden');
}

for (const marker of [
  'RESEARCH_RENDERER_MARKER',
  'new THREE.WebGLRenderer',
  'renderer.setPixelRatio',
  'ResizeObserver',
  'IntersectionObserver',
  'renderer.dispose()',
  'renderer.forceContextLoss()',
  'requestAnimationFrame',
]) {
  if (!renderer.includes(marker)) issues.push(`research-renderer.ts: missing ${marker}`);
}
if (renderer.includes('WebGPURenderer')) {
  issues.push('research-renderer.ts: WebGPURenderer belongs in the later backend PR, not this core boundary');
}

if (!fallbackComponent.includes('<GpuResearchConstellation client:visible')) {
  issues.push('ResearchConstellation.astro: GPU island must remain client:visible');
}
for (const fallback of [
  'role="img"',
  'research-map-title',
  'href="#robotics-systems"',
  'href="#vision-perception"',
  'href="#ai-research"',
]) {
  if (!fallbackComponent.includes(fallback)) {
    issues.push(`ResearchConstellation.astro: accessible SVG fallback lost ${fallback}`);
  }
}
if (!researchPage.includes("ResearchConstellation from '@/components/experience/ResearchConstellation.astro'")) {
  issues.push('research.astro: canonical layered constellation import is missing');
}

for (const stale of [
  'src/components/experience/ResearchConstellation.svelte',
  'scripts/research-constellation-contract.mjs',
]) {
  if (fs.existsSync(path.join(root, stale))) {
    issues.push(`${stale}: stale unused pre-GPU implementation must be removed`);
  }
}

for (const file of filesUnder(path.join(root, 'src', 'pages', 'posts'), (item) => /\.(?:astro|ts|tsx|js|svelte)$/.test(item))) {
  const source = fs.readFileSync(file, 'utf8');
  if (/GpuResearchConstellation|research-renderer|from ['"]three['"]/.test(source)) {
    issues.push(`${path.relative(root, file)}: article routes must not load the portfolio GPU runtime`);
  }
}

const researchHtmlPath = path.join(dist, 'research', 'index.html');
if (!fs.existsSync(researchHtmlPath)) {
  issues.push('dist/research/index.html: production output is missing');
} else {
  const html = fs.readFileSync(researchHtmlPath, 'utf8');
  for (const marker of [
    'data-gpu-constellation',
    'client="visible"',
    'Park JiHo research focus constellation',
    'href="#robotics-systems"',
    'href="#vision-perception"',
    'href="#ai-research"',
  ]) {
    if (!html.includes(marker)) issues.push(`dist/research/index.html: missing ${marker}`);
  }
  if (html.includes('<canvas')) {
    issues.push('dist/research/index.html: canvas must be client-created, not required for static rendering');
  }

  const initialBytes = localScripts(html).reduce((total, source) => {
    const file = path.join(dist, source.replace(/^\//, ''));
    return total + (fs.existsSync(file) ? gzipSync(fs.readFileSync(file)).byteLength : 0);
  }, 0);
  if (initialBytes > INITIAL_RESEARCH_JS_BUDGET) {
    issues.push(`research initial JS budget exceeded: ${initialBytes} B gzip > ${INITIAL_RESEARCH_JS_BUDGET} B`);
  }
}

const jsFiles = filesUnder(path.join(dist, '_astro'), (file) => file.endsWith('.js'));
const rendererChunks = jsFiles.filter((file) =>
  fs.readFileSync(file, 'utf8').includes('__jjoResearchRenderer'),
);
if (rendererChunks.length !== 1) {
  issues.push(`built output: expected one isolated renderer chunk, found ${rendererChunks.length}`);
} else {
  const gzipBytes = gzipSync(fs.readFileSync(rendererChunks[0])).byteLength;
  if (gzipBytes > RENDERER_CHUNK_BUDGET) {
    issues.push(`renderer chunk budget exceeded: ${gzipBytes} B gzip > ${RENDERER_CHUNK_BUDGET} B`);
  }
}

for (const article of filesUnder(path.join(dist, 'posts'), (file) => /posts[/\\][^/\\]+[/\\]index\.html$/.test(file))) {
  const html = fs.readFileSync(article, 'utf8');
  if (html.includes('data-gpu-constellation') || html.includes('__jjoResearchRenderer')) {
    issues.push(`${path.relative(dist, article)}: GPU constellation leaked into an article route`);
  }
}

const unique = [...new Set(issues)].sort();
if (unique.length) {
  console.error(`three-experience-contract: found ${unique.length} issue(s):`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}

const rendererGzip = rendererChunks.length === 1
  ? gzipSync(fs.readFileSync(rendererChunks[0])).byteLength
  : 0;
console.log(
  `three-experience-contract: PASS (SAFE/NORMAL/ULTRA boundary, SVG fallback, isolated ${rendererGzip} B gzip renderer chunk)`,
);

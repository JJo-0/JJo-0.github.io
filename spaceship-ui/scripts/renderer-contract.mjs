import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';
import { RESEARCH_AREAS } from '../src/lib/taxonomy.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];
const RENDERER_PAYLOAD_GZIP_BUDGET = 500 * 1024;
const CORE_SENTINEL = '__JJO_RENDERER_CORE__';
const RENDERER_CORE_PATH = 'src/lib/experience/renderer-core.ts';

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function filesUnder(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...filesUnder(full, predicate));
    else if (predicate(full)) output.push(full);
  }
  return output;
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function localModuleDependencies(file) {
  const source = fs.readFileSync(file, 'utf8');
  const dependencies = [];
  const pattern = /(?:from\s*|import\s*\()\s*['"](\.?\/[^'"]+\.js)['"]/g;
  for (const match of source.matchAll(pattern)) {
    const resolved = path.resolve(path.dirname(file), match[1]);
    if (fs.existsSync(resolved)) dependencies.push(resolved);
  }
  return dependencies;
}

function collectModuleGraph(entryFiles) {
  const visited = new Set();
  const visit = (file) => {
    if (visited.has(file)) return;
    visited.add(file);
    for (const dependency of localModuleDependencies(file)) visit(dependency);
  };
  for (const entry of entryFiles) visit(entry);
  return visited;
}

if (!Array.isArray(RESEARCH_AREAS) || RESEARCH_AREAS.length < 3) {
  issues.push('taxonomy.mjs: canonical RESEARCH_AREAS are missing or incomplete');
}

if (!fs.existsSync(dist)) {
  console.error('renderer-contract: dist/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

const requiredFiles = [
  'src/lib/experience/state.ts',
  'src/lib/experience/capability.ts',
  'src/lib/experience/renderer-runtime.ts',
  RENDERER_CORE_PATH,
  'src/components/experience/ExperienceCanvas.astro',
  'src/styles/renderer.css',
];
for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) issues.push(`${relative}: required renderer file missing`);
}

const packageJson = JSON.parse(read('package.json'));
if (packageJson.dependencies?.three !== '0.185.1') {
  issues.push(`package.json: expected three 0.185.1, got ${packageJson.dependencies?.three ?? 'missing'}`);
}
if (packageJson.devDependencies?.['@types/three'] !== '0.185.3') {
  issues.push(
    `package.json: expected @types/three 0.185.3, got ${packageJson.devDependencies?.['@types/three'] ?? 'missing'}`,
  );
}

const capability = read('src/lib/experience/capability.ts');
const runtime = read('src/lib/experience/renderer-runtime.ts');
const core = read(RENDERER_CORE_PATH);
const state = read('src/lib/experience/state.ts');
const component = read('src/components/experience/ExperienceCanvas.astro');
const rendererCss = read('src/styles/renderer.css');
const motion = read('src/lib/experience/motion.ts');
const homePage = read('src/pages/index.astro');
const researchMap = read('src/components/experience/ResearchConstellation.astro');

for (const marker of [
  'prefers-reduced-motion',
  'saveData',
  'slowConnection',
  'supportsWebGL2',
  'mobile-safe-fallback',
  "tier === 'safe'",
  "tier === 'ultra'",
]) {
  if (!capability.includes(marker)) issues.push(`capability.ts: missing ${marker}`);
}
if (!capability.includes("backend: 'webgl2'")) {
  issues.push('capability.ts: stable WebGL2 renderer boundary missing');
}
if (capability.includes('WebGPURenderer') || capability.includes('three/webgpu')) {
  issues.push('capability.ts: WebGPU renderer activation is out of scope for this phase');
}

for (const marker of [
  'IntersectionObserver',
  "import('./renderer-core')",
  'astro:page-load',
  'astro:before-swap',
  'pointermove',
  "profile.tier === 'safe'",
]) {
  if (!runtime.includes(marker)) issues.push(`renderer-runtime.ts: missing ${marker}`);
}
if (/addEventListener\(\s*['"](?:wheel|touchmove)['"]/.test(runtime)) {
  issues.push('renderer-runtime.ts: scroll-hijacking listeners are forbidden');
}

for (const marker of [
  "from 'three'",
  'WebGLRenderer',
  CORE_SENTINEL,
  'ResizeObserver',
  'visibilitychange',
  'renderer.dispose()',
  'renderer.forceContextLoss()',
  'experienceState.subscribe',
]) {
  if (!core.includes(marker)) issues.push(`renderer-core.ts: missing ${marker}`);
}
if (core.includes('WebGPURenderer') || core.includes('three/webgpu')) {
  issues.push('renderer-core.ts: WebGPU activation must remain in the next isolated phase');
}
if (/import\s+\*\s+as\s+\w+\s+from\s*['"]three['"]/.test(core)) {
  issues.push('renderer-core.ts: namespace import defeats Three.js tree shaking');
}
if (/import\s*\(\s*['"]three['"]\s*\)/.test(core)) {
  issues.push('renderer-core.ts: import the lazy module dynamically, not the entire Three namespace');
}

const sourceFiles = filesUnder(path.join(root, 'src'), (file) => /\.(?:ts|astro|svelte)$/.test(file));
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  const hasDynamicThree = /import\s*\(\s*['"]three['"]\s*\)/.test(source);
  const hasRuntimeStaticThree = /import\s+(?!type\b)[\s\S]*?from\s*['"]three['"]/.test(source);

  if (hasDynamicThree) {
    issues.push(`${relative}: whole-namespace dynamic Three.js import is forbidden`);
  }
  if (relative !== RENDERER_CORE_PATH && hasRuntimeStaticThree) {
    issues.push(`${relative}: Three.js runtime import must remain isolated to renderer-core.ts`);
  }
}

if (!state.includes('rendererBackend') || !state.includes('webgpuAvailable') || !state.includes('fps')) {
  issues.push('state.ts: renderer state boundary is incomplete');
}
if (!motion.includes('experienceState.patch') || !motion.includes('activeResearchNode')) {
  issues.push('motion.ts: DOM/GSAP state is not synchronized with the renderer');
}
if (!component.includes('data-experience-canvas') || !component.includes('installExperienceRendererRuntime')) {
  issues.push('ExperienceCanvas.astro: renderer shell/runtime markers missing');
}
if (!rendererCss.includes("data-renderer-tier='safe'") || !rendererCss.includes('prefers-reduced-motion')) {
  issues.push('renderer.css: SAFE/reduced-motion fallback missing');
}
if (count(homePage, '<ExperienceCanvas variant="home" />') !== 1) {
  issues.push('index.astro: expected exactly one Home renderer shell');
}
if (!homePage.includes('/image/mouse_surprised.gif')) {
  issues.push('index.astro: requested mouse GIF fallback must remain');
}
if (count(researchMap, '<ExperienceCanvas variant="research" />') !== 1) {
  issues.push('ResearchConstellation.astro: expected exactly one Research renderer shell');
}
if (!researchMap.includes('data-constellation-node={focus.id}')) {
  issues.push('ResearchConstellation.astro: SVG nodes must derive from canonical focus IDs');
}
if (!researchMap.includes('href={`#${focus.id}`}')) {
  issues.push('ResearchConstellation.astro: SVG links must derive from canonical focus IDs');
}

const homeHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const researchHtml = fs.readFileSync(path.join(dist, 'research', 'index.html'), 'utf8');
if (count(homeHtml, 'data-experience-canvas="home"') !== 1) {
  issues.push('dist/index.html: expected exactly one Home renderer shell');
}
if (count(researchHtml, 'data-experience-canvas="research"') !== 1) {
  issues.push('dist/research/index.html: expected exactly one Research renderer shell');
}
if (!homeHtml.includes('/image/mouse_surprised.gif')) {
  issues.push('dist/index.html: static mouse GIF fallback missing');
}
for (const node of RESEARCH_AREAS) {
  if (!researchHtml.includes(`data-constellation-node="${node}"`)) {
    issues.push(`dist/research/index.html: SVG fallback node ${node} missing`);
  }
  if (!researchHtml.includes(`href="#${node}"`)) {
    issues.push(`dist/research/index.html: SVG fallback link #${node} missing`);
  }
  if (!researchHtml.includes(`id="${node}"`)) {
    issues.push(`dist/research/index.html: research section #${node} missing`);
  }
}

const articleFiles = filesUnder(
  path.join(dist, 'posts'),
  (file) => /posts[/\\][^/\\]+[/\\]index\.html$/.test(file),
);
for (const file of articleFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('data-experience-canvas')) {
    issues.push(`${path.relative(dist, file)}: article must not mount the GPU renderer`);
  }
}

const builtScripts = filesUnder(path.join(dist, '_astro'), (file) => file.endsWith('.js'));
const coreChunks = builtScripts.filter((file) => fs.readFileSync(file, 'utf8').includes(CORE_SENTINEL));
if (coreChunks.length !== 1) {
  issues.push(`built renderer core: expected one sentinel chunk, found ${coreChunks.length}`);
}

const rendererGraph = collectModuleGraph(coreChunks);
const rendererPayloadGzip = [...rendererGraph].reduce(
  (total, file) => total + gzipSync(fs.readFileSync(file)).byteLength,
  0,
);
if (rendererPayloadGzip > RENDERER_PAYLOAD_GZIP_BUDGET) {
  issues.push(
    `renderer payload exceeded: ${rendererPayloadGzip} B gzip > ${RENDERER_PAYLOAD_GZIP_BUDGET} B`,
  );
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`renderer-contract: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `renderer-contract: PASS (${RESEARCH_AREAS.length} canonical research nodes; ${articleFiles.length} GPU-free articles; SAFE SVG/DOM fallback; ${rendererGraph.size} lazy module(s), ${rendererPayloadGzip} B gzip)`,
);

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';
import { RESEARCH_AREAS } from '../src/lib/taxonomy.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];
const RENDERER_PAYLOAD_GZIP_BUDGET = 750 * 1024;
const CORE_SENTINEL = '__JJO_RENDERER_CORE__';
const RENDERER_CORE_PATH = 'src/lib/experience/renderer-core.ts';
const ADAPTIVE_PATH = 'src/lib/experience/adaptive-performance.js';
const STALE_CONSTELLATION_PATH = 'src/components/experience/ResearchConstellation.svelte';
const RESEARCH_MAP_PATH = 'src/components/experience/ResearchMap.astro';
const OBSOLETE_RESEARCH_IDS = ['robotics-systems', 'vision-perception', 'ai-research'];

function read(relative) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    issues.push(`${relative}: required file missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
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

function requireMarkers(source, filename, markers) {
  for (const marker of markers) {
    if (!source.includes(marker)) issues.push(`${filename}: missing ${marker}`);
  }
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

if (!Array.isArray(RESEARCH_AREAS) || RESEARCH_AREAS.length !== 4) {
  issues.push(
    `taxonomy.mjs: expected exactly 4 canonical RESEARCH_AREAS, got ${RESEARCH_AREAS?.length ?? 'missing'}`,
  );
} else if (new Set(RESEARCH_AREAS).size !== RESEARCH_AREAS.length) {
  issues.push('taxonomy.mjs: canonical RESEARCH_AREAS contain duplicate IDs');
}

if (!fs.existsSync(dist)) {
  console.error('renderer-contract: dist/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

const requiredFiles = [
  'src/lib/experience/state.ts',
  'src/lib/experience/capability.ts',
  ADAPTIVE_PATH,
  'src/lib/experience/adaptive-performance.d.ts',
  'src/lib/experience/renderer-runtime.ts',
  RENDERER_CORE_PATH,
  'src/lib/experience/motion.ts',
  'src/components/experience/ExperienceCanvas.astro',
  RESEARCH_MAP_PATH,
  'src/components/Header.astro',
  'src/styles/renderer.css',
  'src/styles/experience.css',
  'src/pages/index.astro',
  'scripts/adaptive-performance-contract.mjs',
  'scripts/browser-smoke.mjs',
  '../.github/workflows/blog-ci.yml',
];
for (const relative of requiredFiles) read(relative);

if (fs.existsSync(path.join(root, STALE_CONSTELLATION_PATH))) {
  issues.push(`${STALE_CONSTELLATION_PATH}: stale duplicate constellation implementation must be deleted`);
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
if (packageJson.scripts?.['browser:smoke'] !== 'node scripts/browser-smoke.mjs') {
  issues.push('package.json: browser:smoke must run scripts/browser-smoke.mjs');
}
if (packageJson.scripts?.['adaptive:check'] !== 'node scripts/adaptive-performance-contract.mjs') {
  issues.push('package.json: adaptive:check must run the deterministic hysteresis contract');
}
if (!packageJson.scripts?.['content:check']?.includes('pnpm adaptive:check')) {
  issues.push('package.json: content:check must include adaptive:check');
}

const capability = read('src/lib/experience/capability.ts');
const adaptive = read(ADAPTIVE_PATH);
const adaptiveContract = read('scripts/adaptive-performance-contract.mjs');
const runtime = read('src/lib/experience/renderer-runtime.ts');
const core = read(RENDERER_CORE_PATH);
const state = read('src/lib/experience/state.ts');
const component = read('src/components/experience/ExperienceCanvas.astro');
const rendererCss = read('src/styles/renderer.css');
const experienceCss = read('src/styles/experience.css');
const motion = read('src/lib/experience/motion.ts');
const homePage = read('src/pages/index.astro');
const researchMap = read(RESEARCH_MAP_PATH);
const header = read('src/components/Header.astro');
const browserSmoke = read('scripts/browser-smoke.mjs');
const workflow = read('../.github/workflows/blog-ci.yml');

requireMarkers(state, 'state.ts', [
  "import { RESEARCH_AREAS } from '../taxonomy.mjs';",
  'RESEARCH_NODE_IDS',
  'isResearchNodeId',
  'rendererBackend',
  'webgpuAvailable',
  'quality',
  'fps',
  'dpr',
  'targetFps',
  'adaptationReason',
]);
requireMarkers(motion, 'motion.ts', ['isResearchNodeId', 'activeResearchNode']);
requireMarkers(core, 'renderer-core.ts', ['RESEARCH_NODE_IDS', 'isResearchNodeId']);
for (const obsoleteId of OBSOLETE_RESEARCH_IDS) {
  for (const [filename, source] of [
    ['state.ts', state],
    ['motion.ts', motion],
    ['renderer-core.ts', core],
  ]) {
    if (source.includes(obsoleteId)) {
      issues.push(`${filename}: obsolete research ID ${obsoleteId} is forbidden`);
    }
  }
}

requireMarkers(capability, 'capability.ts', [
  'prefers-reduced-motion',
  'saveData',
  'slowConnection',
  'supportsWebGL2',
  'webgpuAvailable',
  'narrowViewport',
  "reasons.push('narrow-viewport')",
  "reasons.push('coarse-pointer')",
  'shouldProbeGpu',
  "reasons.push('no-gpu-backend')",
  "tier === 'safe'",
  "tier === 'ultra'",
  "tier === 'ultra' ? 'webgpu' : 'webgl2'",
  "initialQuality: 'low'",
  "maximumQuality: 'low'",
  'maxFps: 60',
]);
if (capability.includes('coarsePointer && narrowViewport')) {
  issues.push('capability.ts: coarse pointer and narrow viewport must be independent SAFE gates');
}
if (!/@media\s*\(max-width:\s*719px\)\s*,\s*\(pointer:\s*coarse\)/.test(rendererCss)) {
  issues.push('renderer.css: SAFE media query must use max-width OR coarse-pointer parity');
}

requireMarkers(adaptive, 'adaptive-performance.js', [
  'emergencyFps: 30',
  'degradeFps: 42',
  'upgradeFps: 58',
  'emergencyDurationMs: 1_000',
  'degradeDurationMs: 2_000',
  'upgradeDurationMs: 8_000',
  'downgradeCooldownMs: 4_000',
  'upgradeCooldownMs: 10_000',
  'ewmaAlpha: 0.35',
  "'emergency-fps'",
  "'sustained-low-fps'",
  "'sustained-high-fps'",
]);
requireMarkers(adaptiveContract, 'adaptive-performance-contract.mjs', [
  '30/42/58 FPS bands',
  'emergency',
  'sustainedLow',
  'recovery',
  'normalCeiling',
  'deadband',
]);

requireMarkers(runtime, 'renderer-runtime.ts', [
  'IntersectionObserver',
  "import('./renderer-core')",
  'loadRendererModule',
  'rendererModulePromise = null',
  'await mountExperienceRenderer',
  'handle.backend',
  'rendererPreferredBackend',
  'rendererQuality',
  'rendererDpr',
  'rendererFps',
  'rendererAdaptation',
  'astro:page-load',
  'astro:before-swap',
  'pointermove',
  "profile.tier === 'safe'",
  "matchMedia('(max-width: 719px)')",
  "matchMedia('(pointer: coarse)')",
  "compactViewport.addEventListener('change', scheduleInit)",
  "coarsePointer.addEventListener('change', scheduleInit)",
  "compactViewport.removeEventListener('change', scheduleInit)",
  "coarsePointer.removeEventListener('change', scheduleInit)",
]);
if (/addEventListener\(\s*['"](?:wheel|touchmove)['"]/.test(runtime)) {
  issues.push('renderer-runtime.ts: scroll-hijacking listeners are forbidden');
}

requireMarkers(motion, 'motion.ts', [
  'AbortController',
  "'[data-constellation-node]'",
  "'pointerenter'",
  "'focusin'",
  "'click'",
  "'hashchange'",
  "'[data-research-section]'",
  'setActiveResearchNode',
  'experienceState.patch',
]);
if (count(homePage, 'data-constellation-node={focus.id}') !== 1) {
  issues.push('index.astro: Home research cards must expose one canonical data-constellation-node mapping');
}
if (!researchMap.includes('data-constellation-node={focus.id}')) {
  issues.push('ResearchMap.astro: map markers must derive from canonical focus IDs');
}
if (!researchMap.includes('href={`#${focus.id}`}')) {
  issues.push('ResearchMap.astro: map links must derive from canonical focus IDs');
}

requireMarkers(core, 'renderer-core.ts', [
  "from 'three/webgpu'",
  'WebGPURenderer',
  'await renderer.init()',
  'forceWebGL',
  'isWebGPUBackend',
  'isWebGLBackend',
  'readActualBackend',
  'createAdaptivePerformanceController',
  'QUALITY_PRESETS',
  'setPixelRatio',
  'setDrawRange',
  'rendererQuality',
  'rendererDpr',
  'rendererFps',
  'rendererAdaptation',
  CORE_SENTINEL,
  'ResizeObserver',
  'visibilitychange',
  'startAnimation',
  'stopAnimation',
  'rendererLoop',
  "setLoopStatus('stopped')",
  "setLoopStatus('running')",
  'MutationObserver',
  'rendererTheme',
  'applyThemePalette',
  'themeObserver.disconnect()',
  'renderer.dispose()',
  'experienceState.subscribe',
]);
if (core.includes('WebGLRenderer')) {
  issues.push('renderer-core.ts: legacy WebGLRenderer path must not coexist with WebGPURenderer');
}
if (/import\s+\*\s+as\s+\w+\s+from\s*['"]three(?:\/webgpu)?['"]/.test(core)) {
  issues.push('renderer-core.ts: namespace import defeats Three.js tree shaking');
}
if (/import\s*\(\s*['"]three(?:\/webgpu)?['"]\s*\)/.test(core)) {
  issues.push('renderer-core.ts: import the isolated lazy module, not the entire Three namespace');
}

const sourceFiles = filesUnder(path.join(root, 'src'), (file) => /\.(?:js|ts|astro|svelte)$/.test(file));
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  const hasDynamicThree = /import\s*\(\s*['"]three(?:\/webgpu)?['"]\s*\)/.test(source);
  const hasRuntimeStaticThree = /import\s+(?!type\b)[\s\S]*?from\s*['"]three(?:\/webgpu)?['"]/.test(
    source,
  );
  if (hasDynamicThree) issues.push(`${relative}: whole-namespace dynamic Three.js import is forbidden`);
  if (relative !== RENDERER_CORE_PATH && hasRuntimeStaticThree) {
    issues.push(`${relative}: Three.js runtime import must remain isolated to renderer-core.ts`);
  }
}

if (!component.includes('data-experience-canvas') || !component.includes('installExperienceRendererRuntime')) {
  issues.push('ExperienceCanvas.astro: renderer shell/runtime markers missing');
}
if (!rendererCss.includes("data-renderer-tier='safe'") || !rendererCss.includes('prefers-reduced-motion')) {
  issues.push('renderer.css: SAFE/reduced-motion fallback missing');
}

const layeringRule = rendererCss.match(
  /\.experience-visual-stage\s*>\s*:not\(\.experience-renderer\)\s*\{([\s\S]*?)\}/,
)?.[1];
if (!layeringRule) {
  issues.push('renderer.css: Home renderer layering rule is missing');
} else if (/\bposition\s*:/.test(layeringRule)) {
  issues.push('renderer.css: Home renderer layering rule must not override overlay positioning');
}
if (!/\.experience-stage-index,\s*\n\.experience-stage-caption,\s*\n\.experience-axis-label\s*\{[\s\S]*?position:\s*absolute;/.test(experienceCss)) {
  issues.push('experience.css: Home hero overlays must remain position:absolute');
}

requireMarkers(header, 'Header.astro', [
  'data-site-header',
  'data-header-inner',
  'data-site-brand',
  'px-2 sm:px-2 lg:px-3',
  'whitespace-nowrap',
]);
if (/\btruncate\b/.test(header)) issues.push('Header.astro: site brand truncation is forbidden');
if (header.includes('-mx-1')) issues.push('Header.astro: negative mobile navigation margin is forbidden');

requireMarkers(browserSmoke, 'browser-smoke.mjs', [
  'data-site-brand',
  'overlayPositions',
  'Home card to shared state synchronization',
  'Research SVG focus synchronization',
  'Research section scroll synchronization',
  'live desktop-to-SAFE reclassification',
  'offscreen RAF stop',
  'renderer theme palette refresh',
  'intentional lazy renderer import failure',
  'lazy renderer retry recovery',
  'narrow viewport SAFE tier',
  'wide coarse-pointer SAFE tier',
  'reduced-motion SAFE tier',
  'article renderer isolation',
]);
if (!workflow.includes('Browser smoke matrix') || !workflow.includes('pnpm browser:smoke')) {
  issues.push('blog-ci.yml: browser smoke matrix is not wired into CI');
}

if (count(homePage, '<ExperienceCanvas variant="home" />') !== 1) {
  issues.push('index.astro: expected exactly one Home renderer shell');
}
if (!homePage.includes('/image/mouse_surprised.gif')) {
  issues.push('index.astro: requested mouse GIF fallback must remain');
}
if (count(researchMap, '<ExperienceCanvas variant="research" />') !== 1) {
  issues.push('ResearchMap.astro: expected exactly one Research renderer shell');
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
if (!homeHtml.includes('data-site-brand')) {
  issues.push('dist/index.html: inset-safe site brand marker missing');
}
for (const node of RESEARCH_AREAS) {
  if (!homeHtml.includes(`data-constellation-node="${node}"`)) {
    issues.push(`dist/index.html: Home canonical research card ${node} missing`);
  }
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
  `renderer-contract: PASS (${RESEARCH_AREAS.length} canonical research nodes; actual WebGPU/WebGL2 backend selection; 30/42/58 adaptive FPS hysteresis; true RAF/theme/retry lifecycle; ${articleFiles.length} GPU-free articles; ${rendererGraph.size} lazy module(s), ${rendererPayloadGzip} B gzip)`,
);

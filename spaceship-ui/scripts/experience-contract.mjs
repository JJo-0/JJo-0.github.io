import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];
const HOME_BUDGET_GZIP = 200 * 1024;
const RESEARCH_BUDGET_GZIP = 200 * 1024;

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

async function loadResearchAreas() {
  const file = path.join(root, 'src', 'lib', 'taxonomy.mjs');
  if (!fs.existsSync(file)) {
    issues.push('src/lib/taxonomy.mjs: canonical taxonomy is missing');
    return [];
  }

  try {
    const taxonomy = await import(`${pathToFileURL(file).href}?experience-contract`);
    const areas = taxonomy.RESEARCH_AREAS;
    if (!Array.isArray(areas) || areas.length < 3 || !areas.every((area) => typeof area === 'string')) {
      issues.push('src/lib/taxonomy.mjs: RESEARCH_AREAS must contain at least three string IDs');
      return [];
    }
    return areas;
  } catch (error) {
    issues.push(`src/lib/taxonomy.mjs: failed to load canonical research areas: ${error}`);
    return [];
  }
}

function localModuleScripts(html) {
  const scripts = new Set();
  for (const match of html.matchAll(/<script\b[^>]*\bsrc=(['"])(\/_astro\/[^'"]+\.js)\1/gi)) {
    scripts.add(match[2]);
  }
  return [...scripts];
}

function scriptGzipBytes(html) {
  let total = 0;
  for (const source of localModuleScripts(html)) {
    const file = path.join(dist, source.replace(/^\//, ''));
    if (!fs.existsSync(file)) {
      issues.push(`missing built script referenced by page: ${source}`);
      continue;
    }
    total += gzipSync(fs.readFileSync(file)).byteLength;
  }
  return total;
}

function firstPublishedPostHtml() {
  const postsDir = path.join(dist, 'posts');
  if (!fs.existsSync(postsDir)) return null;

  for (const entry of fs.readdirSync(postsDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'tag') continue;
    const file = path.join(postsDir, entry.name, 'index.html');
    if (fs.existsSync(file)) return file;
  }
  return null;
}

const researchAreas = await loadResearchAreas();

const requiredFiles = [
  'src/styles/experience.css',
  'src/lib/experience/motion.ts',
  'src/components/experience/MotionRuntime.astro',
  'src/components/experience/ResearchConstellation.astro',
];

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) issues.push(`${relative}: required experience file is missing`);
}

const packageJson = JSON.parse(read('package.json'));
if (!packageJson.dependencies?.gsap) issues.push('package.json: GSAP dependency is missing');
if (packageJson.dependencies?.three || packageJson.devDependencies?.three) {
  issues.push('package.json: Three.js must remain out of the Design System / Motion v1 boundary');
}

const layoutSource = read('src/layouts/Layout.astro');
const homeSource = read('src/pages/index.astro');
const researchSource = read('src/pages/research.astro');
const constellationSource = read('src/components/experience/ResearchConstellation.astro');
const motionSource = read('src/lib/experience/motion.ts');
const experienceCss = read('src/styles/experience.css');

if (!layoutSource.includes("import '@/styles/experience.css'")) {
  issues.push('Layout.astro: experience.css is not loaded');
}
if (!homeSource.includes('data-experience-page="home"') || !homeSource.includes('<MotionRuntime scope="home"')) {
  issues.push('index.astro: homepage experience runtime boundary is missing');
}
if (
  !researchSource.includes('data-experience-page="research"') ||
  !researchSource.includes('<MotionRuntime scope="research"') ||
  !researchSource.includes('<ResearchConstellation') ||
  !researchSource.includes('id={focus.id}')
) {
  issues.push('research.astro: research experience/runtime/constellation/canonical section boundary is incomplete');
}
if (!constellationSource.includes("import { RESEARCH_FOCUS } from '@/lib/research';")) {
  issues.push('ResearchConstellation.astro: constellation must derive from canonical research focus data');
}
if (!constellationSource.includes('RESEARCH_FOCUS.map')) {
  issues.push('ResearchConstellation.astro: canonical focus iteration is missing');
}
if (!motionSource.includes("prefers-reduced-motion: reduce") || !motionSource.includes('ScrollTrigger')) {
  issues.push('motion.ts: reduced-motion or ScrollTrigger support is missing');
}
if (/addEventListener\(\s*['"](?:wheel|touchmove)['"]/.test(motionSource)) {
  issues.push('motion.ts: scroll hijacking listener is forbidden');
}
if (!experienceCss.includes('@media (prefers-reduced-motion: reduce)')) {
  issues.push('experience.css: reduced-motion fallback is missing');
}
if (!experienceCss.includes('::view-transition-old(root)')) {
  issues.push('experience.css: root view-transition treatment is missing');
}

if (!fs.existsSync(dist)) {
  console.error('experience-contract: dist/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

const homeFile = path.join(dist, 'index.html');
const researchFile = path.join(dist, 'research', 'index.html');
if (!fs.existsSync(homeFile)) issues.push('dist/index.html: homepage build output is missing');
if (!fs.existsSync(researchFile)) issues.push('dist/research/index.html: research build output is missing');

const homeHtml = fs.existsSync(homeFile) ? fs.readFileSync(homeFile, 'utf8') : '';
const researchHtml = fs.existsSync(researchFile) ? fs.readFileSync(researchFile, 'utf8') : '';

if (!homeHtml.includes('data-experience-runtime="home"')) {
  issues.push('dist/index.html: homepage motion runtime marker is missing');
}
if (!homeHtml.includes('/image/mouse_surprised.gif')) {
  issues.push('dist/index.html: homepage mouse GIF identity visual is missing');
}
if (!researchHtml.includes('data-experience-runtime="research"')) {
  issues.push('dist/research/index.html: research motion runtime marker is missing');
}
for (const node of researchAreas) {
  if (!researchHtml.includes(`data-constellation-node="${node}"`)) {
    issues.push(`dist/research/index.html: constellation node ${node} is missing`);
  }
  if (!researchHtml.includes(`href="#${node}"`)) {
    issues.push(`dist/research/index.html: constellation link #${node} is missing`);
  }
  if (!researchHtml.includes(`id="${node}"`)) {
    issues.push(`dist/research/index.html: canonical research section #${node} is missing`);
  }
}
if (/<canvas\b/i.test(homeHtml) || /<canvas\b/i.test(researchHtml)) {
  issues.push('home/research: GPU canvas was introduced before the Three.js isolation phase');
}

const homeGzip = scriptGzipBytes(homeHtml);
const researchGzip = scriptGzipBytes(researchHtml);
if (homeGzip > HOME_BUDGET_GZIP) {
  issues.push(`homepage JS budget exceeded: ${homeGzip} B gzip > ${HOME_BUDGET_GZIP} B`);
}
if (researchGzip > RESEARCH_BUDGET_GZIP) {
  issues.push(`research JS budget exceeded: ${researchGzip} B gzip > ${RESEARCH_BUDGET_GZIP} B`);
}

const samplePost = firstPublishedPostHtml();
if (!samplePost) {
  issues.push('dist/posts: no published post HTML was found');
} else {
  const postHtml = fs.readFileSync(samplePost, 'utf8');
  if (postHtml.includes('data-experience-runtime=')) {
    issues.push(`${path.relative(dist, samplePost)}: article must not mount the experience runtime`);
  }

  for (const source of localModuleScripts(postHtml)) {
    const file = path.join(dist, source.replace(/^\//, ''));
    if (!fs.existsSync(file)) continue;
    const js = fs.readFileSync(file, 'utf8');
    if (js.includes('__jjoExperienceRuntime') || js.includes('experience-progress')) {
      issues.push(`${path.relative(dist, samplePost)}: article references the motion runtime bundle`);
    }
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`experience-contract: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `experience-contract: PASS (${researchAreas.length} canonical research areas; home ${homeGzip} B gzip, research ${researchGzip} B gzip; reduced-motion, SVG fallback, no article runtime)`,
);

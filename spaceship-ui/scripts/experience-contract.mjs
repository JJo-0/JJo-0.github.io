import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];
const HOME_BUDGET_GZIP = 200 * 1024;
const RESEARCH_BUDGET_GZIP = 200 * 1024;

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
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
if (!packageJson.scripts?.['three:check']) {
  issues.push('package.json: isolated Three.js phase must be guarded by three:check');
}

const layoutSource = read('src/layouts/Layout.astro');
const homeSource = read('src/pages/index.astro');
const researchSource = read('src/pages/research.astro');
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
  !researchSource.includes('<ResearchConstellation')
) {
  issues.push('research.astro: research experience/runtime/constellation boundary is incomplete');
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
for (const node of ['robotics-systems', 'vision-perception', 'ai-research']) {
  if (!researchHtml.includes(`data-constellation-node="${node}"`) || !researchHtml.includes(`href="#${node}"`)) {
    issues.push(`dist/research/index.html: constellation node/link ${node} is missing`);
  }
}
if (/<canvas\b/i.test(homeHtml) || /<canvas\b/i.test(researchHtml)) {
  issues.push('home/research: GPU canvas must be client-created and cannot be required by static HTML');
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
  if (postHtml.includes('data-experience-runtime=') || postHtml.includes('data-gpu-constellation')) {
    issues.push(`${path.relative(dist, samplePost)}: article must not mount the portfolio experience runtime`);
  }

  for (const source of localModuleScripts(postHtml)) {
    const file = path.join(dist, source.replace(/^\//, ''));
    if (!fs.existsSync(file)) continue;
    const js = fs.readFileSync(file, 'utf8');
    if (
      js.includes('__jjoExperienceRuntime') ||
      js.includes('experience-progress') ||
      js.includes('__jjoResearchRenderer')
    ) {
      issues.push(`${path.relative(dist, samplePost)}: article references a portfolio runtime bundle`);
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
  `experience-contract: PASS (home ${homeGzip} B gzip, research ${researchGzip} B gzip; reduced-motion, static SVG fallback, isolated GPU phase)`,
);

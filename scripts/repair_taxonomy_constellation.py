#!/usr/bin/env python3
"""Repair Research constellation/contract files after taxonomy materialization.

The taxonomy migration replaces the three historical research IDs with the
canonical RESEARCH_AREAS list. The pre-existing constellation and experience
contract hard-coded the historical IDs, which made same-page anchors diverge.

This bootstrap-only repair makes RESEARCH_AREAS the single source of truth.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

RESEARCH_CONSTELLATION = r'''---
import { RESEARCH_FOCUS } from '@/lib/research';

const center = { x: 310, y: 260 };
const layouts = {
  1: [{ x: 310, y: 115 }],
  2: [
    { x: 175, y: 175 },
    { x: 445, y: 345 },
  ],
  3: [
    { x: 170, y: 140 },
    { x: 455, y: 145 },
    { x: 318, y: 410 },
  ],
  4: [
    { x: 165, y: 135 },
    { x: 455, y: 135 },
    { x: 455, y: 385 },
    { x: 165, y: 385 },
  ],
} as const;

const positions =
  layouts[Math.min(RESEARCH_FOCUS.length, 4) as keyof typeof layouts] ?? layouts[4];
---

<nav class="research-constellation" aria-label="Research focus map" data-motion="hero-visual">
  <svg viewBox="0 0 620 520" role="img" aria-labelledby="research-map-title research-map-desc">
    <title id="research-map-title">Park JiHo research focus constellation</title>
    <desc id="research-map-desc">
      The public research portfolio is generated from the canonical research taxonomy. Every node links to the matching research section on this page.
    </desc>

    <g aria-hidden="true">
      {
        RESEARCH_FOCUS.map((focus, index) => {
          const position = positions[index] ?? center;
          return (
            <line
              class="constellation-edge"
              x1={center.x}
              y1={center.y}
              x2={position.x}
              y2={position.y}
            />
          );
        })
      }
      {
        RESEARCH_FOCUS.map((focus, index) => {
          if (RESEARCH_FOCUS.length < 3) return null;
          const from = positions[index] ?? center;
          const to = positions[(index + 1) % RESEARCH_FOCUS.length] ?? center;
          return (
            <line
              class="constellation-edge"
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              opacity="0.35"
            />
          );
        })
      }
    </g>

    <g aria-hidden="true">
      <circle class="constellation-node__ring" cx={center.x} cy={center.y} r="63" />
      <circle class="constellation-node__core" cx={center.x} cy={center.y} r="7" />
      <text class="constellation-node__label" x={center.x} y="250" text-anchor="middle">PUBLIC</text>
      <text class="constellation-node__label" x={center.x} y="270" text-anchor="middle">RESEARCH</text>
      <text class="constellation-node__label" x={center.x} y="290" text-anchor="middle">NOTES</text>
    </g>

    {
      RESEARCH_FOCUS.map((focus, index) => {
        const position = positions[index] ?? center;
        return (
          <a
            href={`#${focus.id}`}
            data-constellation-node={focus.id}
            aria-label={`Jump to ${focus.title}`}
          >
            <title>{focus.title}</title>
            <circle class="constellation-node__ring" cx={position.x} cy={position.y} r="58" />
            <circle class="constellation-node__core" cx={position.x} cy={position.y} r="6" />
            <text
              class="constellation-node__label"
              x={position.x}
              y={position.y + 4}
              text-anchor="middle"
            >
              {focus.label.toUpperCase()}
            </text>
          </a>
        );
      })
    }
  </svg>
</nav>
'''

EXPERIENCE_CONTRACT = r'''import fs from 'node:fs';
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
'''

RESEARCH_CONTRACT = r'''import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const issues = [];

function read(relative) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    issues.push(`${relative}: required file is missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

async function loadResearchAreas() {
  const file = path.join(root, 'src', 'lib', 'taxonomy.mjs');
  if (!fs.existsSync(file)) {
    issues.push('src/lib/taxonomy.mjs: canonical taxonomy is missing');
    return [];
  }
  try {
    const taxonomy = await import(`${pathToFileURL(file).href}?constellation-contract`);
    const areas = taxonomy.RESEARCH_AREAS;
    if (!Array.isArray(areas) || areas.length < 3 || !areas.every((area) => typeof area === 'string')) {
      issues.push('src/lib/taxonomy.mjs: RESEARCH_AREAS must contain at least three string IDs');
      return [];
    }
    return areas;
  } catch (error) {
    issues.push(`src/lib/taxonomy.mjs: failed to load RESEARCH_AREAS: ${error}`);
    return [];
  }
}

const researchAreas = await loadResearchAreas();
const component = read('src/components/experience/ResearchConstellation.astro');
const researchPage = read('src/pages/research.astro');
const researchData = read('src/lib/research.ts');

for (const required of [
  'role="img"',
  '<title id="research-map-title">',
  '<desc id="research-map-desc">',
  'aria-label="Research focus map"',
  "import { RESEARCH_FOCUS } from '@/lib/research';",
  'RESEARCH_FOCUS.map',
  'data-constellation-node={focus.id}',
]) {
  if (!component.includes(required)) {
    issues.push(`ResearchConstellation.astro: missing canonical/accessibility marker ${required}`);
  }
}

for (const forbidden of ['<canvas', 'three', 'WebGL', 'WebGPU', 'preventDefault()']) {
  if (component.includes(forbidden)) {
    issues.push(`ResearchConstellation.astro: forbidden implementation marker ${forbidden}`);
  }
}

if (!researchPage.includes("import ResearchConstellation from '@/components/experience/ResearchConstellation.astro';")) {
  issues.push('research.astro: ResearchConstellation import is missing');
}
if (!researchPage.includes('<ResearchConstellation />')) {
  issues.push('research.astro: constellation render boundary is missing');
}
if (!researchPage.includes('RESEARCH_FOCUS.map') || !researchPage.includes('id={focus.id}')) {
  issues.push('research.astro: sections must derive from the canonical research taxonomy');
}
if (!researchData.includes('RESEARCH_AREAS') || !researchData.includes('RESEARCH_AREA_META')) {
  issues.push('research.ts: canonical taxonomy adapter is missing');
}

const built = path.join(root, 'dist', 'research', 'index.html');
if (!fs.existsSync(built)) {
  issues.push('dist/research/index.html: production build is missing');
} else {
  const html = fs.readFileSync(built, 'utf8');
  for (const area of researchAreas) {
    for (const required of [
      `data-constellation-node="${area}"`,
      `href="#${area}"`,
      `id="${area}"`,
    ]) {
      if (!html.includes(required)) {
        issues.push(`dist/research/index.html: missing canonical marker ${required}`);
      }
    }
  }
}

const unique = [...new Set(issues)].sort();
if (unique.length > 0) {
  console.error(`research-constellation-contract: found ${unique.length} issue(s):`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `research-constellation-contract: PASS (${researchAreas.length} canonical taxonomy nodes, matching section anchors, accessible SVG)`,
);
'''

FILES = {
    'spaceship-ui/src/components/experience/ResearchConstellation.astro': RESEARCH_CONSTELLATION,
    'spaceship-ui/scripts/experience-contract.mjs': EXPERIENCE_CONTRACT,
    'spaceship-ui/scripts/research-constellation-contract.mjs': RESEARCH_CONTRACT,
}

for relative, content in FILES.items():
    destination = ROOT / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(content, encoding='utf-8')
    print(f'wrote {relative}')

research_page = (ROOT / 'spaceship-ui/src/pages/research.astro').read_text(encoding='utf-8')
if 'id={focus.id}' not in research_page:
    raise RuntimeError('research.astro no longer renders canonical section IDs via id={focus.id}')
if "ResearchConstellation from '@/components/experience/ResearchConstellation.astro'" not in research_page:
    raise RuntimeError('research.astro no longer imports the Astro ResearchConstellation component')

print('research constellation taxonomy repair complete')

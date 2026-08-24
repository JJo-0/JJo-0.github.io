import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const issues = [];

function read(relative) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    issues.push(`${relative}: required design-system file missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function requireMarkers(source, filename, markers) {
  for (const marker of markers) {
    if (!source.includes(marker)) issues.push(`${filename}: missing ${marker}`);
  }
}

const editorial = read('src/styles/editorial.css');
const layout = read('src/styles/editorial-layout.css');
const topologyCss = read('src/styles/topology.css');
const world = read('src/styles/world.css');
const home = read('src/pages/index.astro');
const research = read('src/pages/research.astro');
const topology = read('src/components/experience/ResearchConstellation.astro');
const renderer = read('src/lib/experience/renderer-core.ts');
const post = read('src/pages/posts/[...slug]/index.astro');
const layoutSource = read('src/layouts/Layout.astro');
const homeMediaAudit = read('scripts/browser-home-media-audit.mjs');

requireMarkers(editorial, 'editorial.css', [
  '--editorial-paper: #f2eee4',
  '--editorial-ink: #292c29',
  '--editorial-accent: #5e7f78',
  '--editorial-serif:',
  '--editorial-reading:',
  "feTurbulence",
  '.reading-shell',
  '.reading-title',
  '.reading-dek',
  '.reading-aside',
  '.prose',
  'line-height: 1.88',
]);
requireMarkers(layout, 'editorial-layout.css', ['body > div.max-w-5xl', '90rem']);
requireMarkers(topologyCss, 'topology.css', [
  '.research-topology',
  '.topology-node__panel',
  '.world-identity-card',
]);
requireMarkers(world, 'world.css', [
  '.experience-world-stage',
  '.world-hud--nodes',
  '.research-world-sticky',
]);
requireMarkers(home, 'index.astro', [
  'Research Topology',
  'knowledge topology',
  'data-world-identity',
  'Evidence map · Scroll to focus',
]);
requireMarkers(research, 'research.astro', [
  'Research / Evidence Map',
  'topology map',
  'Selected public evidence',
]);
requireMarkers(topology, 'ResearchConstellation.astro', [
  'Park JiHo research topology',
  'topology-node__panel',
  'PUBLIC',
  'EVIDENCE',
  'data-constellation-node={focus.id}',
]);
requireMarkers(renderer, 'renderer-core.ts', [
  'TOPOLOGY_POSITIONS',
  'PlaneGeometry',
  'buildContourSegments',
  'const topology = new Group()',
  'signalField',
  'research topology, not an orbital system',
]);
requireMarkers(post, 'post page', [
  'class="reading-shell"',
  'class="reading-header"',
  'class="reading-title"',
  'class="reading-dek"',
  'class="reading-aside"',
]);
requireMarkers(layoutSource, 'Layout.astro', [
  "import '@/styles/editorial.css';",
  "import '@/styles/editorial-layout.css';",
  "import '@/styles/topology.css';",
  'content="#f2eee4"',
  'content="#1f231f"',
  'class="site-shell',
]);
requireMarkers(homeMediaAudit, 'browser-home-media-audit.mjs', [
  '[data-world-identity]',
  'Home editorial identity visible',
]);

for (const [filename, source, forbidden] of [
  ['renderer-core.ts', renderer, ['TorusGeometry', 'IcosahedronGeometry']],
  ['index.astro', home, ['mouse_surprised.gif', 'Scroll-driven Research World', 'World / 01']],
  ['research.astro', research, ['02 / Research World']],
  ['ResearchConstellation.astro', topology, ['<circle']],
]) {
  for (const marker of forbidden) {
    if (source.includes(marker)) issues.push(`${filename}: forbidden legacy space/orbit marker ${marker}`);
  }
}

if (!/background-image:[\s\S]*feTurbulence/.test(editorial)) {
  issues.push('editorial.css: paper texture must remain CSS-generated instead of image-dependent');
}

if (!/max-width:\s*46rem\s*!important/.test(editorial)) {
  issues.push('editorial.css: long-form prose measure must stay bounded');
}

if (issues.length > 0) {
  console.error('editorial-design-contract: FAIL');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  'editorial-design-contract: PASS (warm paper surface; editorial reading shell; research topology; orbital/planet geometry forbidden)',
);

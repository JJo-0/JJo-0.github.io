import fs from 'node:fs';
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
const component = read('src/components/experience/ResearchMap.astro');
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
    issues.push(`ResearchMap.astro: missing canonical/accessibility marker ${required}`);
  }
}

for (const forbidden of ['<canvas', 'three', 'WebGL', 'WebGPU', 'preventDefault()']) {
  if (component.includes(forbidden)) {
    issues.push(`ResearchMap.astro: forbidden implementation marker ${forbidden}`);
  }
}

if (!researchPage.includes("import ResearchMap from '@/components/experience/ResearchMap.astro';")) {
  issues.push('research.astro: ResearchMap import is missing');
}
if (!researchPage.includes('<ResearchMap />')) {
  issues.push('research.astro: research map render boundary is missing');
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

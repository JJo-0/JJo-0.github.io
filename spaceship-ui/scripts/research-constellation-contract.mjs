import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

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

const component = read('src/components/experience/ResearchConstellation.svelte');
const researchPage = read('src/pages/research.astro');
const researchData = read('src/lib/research.ts');
const packageJson = JSON.parse(read('package.json') || '{}');

for (const required of [
  'role="img"',
  '<title id="constellation-title">',
  '<desc id="constellation-description">',
  'aria-live="polite"',
  'aria-label="Research focus quick links"',
  '@media (prefers-reduced-motion: reduce)',
]) {
  if (!component.includes(required)) {
    issues.push(`ResearchConstellation.svelte: missing accessibility/fallback marker ${required}`);
  }
}

for (const forbidden of ['<canvas', 'three', 'WebGL', 'WebGPU', 'client:load', 'preventDefault()']) {
  if (component.includes(forbidden)) {
    issues.push(`ResearchConstellation.svelte: forbidden phase-4 implementation marker ${forbidden}`);
  }
}

if (!researchPage.includes("import ResearchConstellation from '@/components/experience/ResearchConstellation.svelte';")) {
  issues.push('research.astro: ResearchConstellation import is missing');
}
if (!/<ResearchConstellation\s+client:visible/.test(researchPage)) {
  issues.push('research.astro: constellation must remain client:visible');
}
if (!researchPage.includes('RESEARCH_FOCUS.map')) {
  issues.push('research.astro: constellation must derive from the canonical research taxonomy');
}
if ((researchData.match(/id:\s*'/g) ?? []).length < 3) {
  issues.push('research.ts: at least three canonical research threads are required');
}
if (!packageJson.scripts?.['constellation:check']) {
  issues.push('package.json: constellation:check script is missing');
}

const built = path.join(root, 'dist', 'research', 'index.html');
if (!fs.existsSync(built)) {
  issues.push('dist/research/index.html: production build is missing');
} else {
  const html = fs.readFileSync(built, 'utf8');
  for (const required of [
    'data-constellation-root',
    'Park JiHo research constellation',
    'href="#robotics-systems"',
    'href="#vision-perception"',
    'href="#ai-research"',
  ]) {
    if (!html.includes(required)) {
      issues.push(`dist/research/index.html: missing rendered constellation marker ${required}`);
    }
  }
}

const unique = [...new Set(issues)].sort();
if (unique.length > 0) {
  console.error(`research-constellation-contract: found ${unique.length} issue(s):`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('research-constellation-contract: PASS (canonical data, SVG links, mobile fallback, keyboard/reduced-motion accessibility)');

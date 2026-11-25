import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { parseGraphPayload } from '../src/lib/experience/graph-json.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];

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

function requireText(source, filename, marker) {
  if (!source.includes(marker)) issues.push(`${filename}: missing performance marker ${marker}`);
}

function forbidText(source, filename, marker) {
  if (source.includes(marker))
    issues.push(`${filename}: forbidden performance regression ${marker}`);
}

if (!fs.existsSync(dist)) {
  console.error('performance-contract: dist/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

const astroConfig = read('astro.config.mjs');
const homeSource = read('src/pages/index.astro');
const aboutSource = read('src/pages/about.astro');
const layoutSource = read('src/layouts/Layout.astro');
const headerSource = read('src/components/Header.astro');
const runtimeSource = read('src/lib/experience/renderer-runtime.ts');
const capabilitySource = read('src/lib/experience/capability.ts');
const postsSource = read('src/pages/posts/index.astro');
const performanceCss = read('src/styles/performance.css');
const mediaPlugin = read('src/lib/rehype/media-performance.mjs');

requireText(
  astroConfig,
  'astro.config.mjs',
  "import mediaPerformance from './src/lib/rehype/media-performance.mjs';"
);
requireText(astroConfig, 'astro.config.mjs', "inlineStylesheets: 'auto'");
requireText(astroConfig, 'astro.config.mjs', 'mediaPerformance,');
forbidText(astroConfig, 'astro.config.mjs', "inlineStylesheets: 'always'");

// The decorative image starts static. Neither animated asset may be fetched on cold entry.
requireText(homeSource, 'src/pages/index.astro', 'src="/assets/profile/mouse_surprised-still.webp"');
requireText(homeSource, 'src/pages/index.astro', 'data-profile-animation-src="/assets/profile/mouse_surprised-once.webp"');
requireText(homeSource, 'src/pages/index.astro', 'loading="lazy"');
requireText(homeSource, 'src/pages/index.astro', 'fetchpriority="low"');
requireText(homeSource, 'src/pages/index.astro', 'decoding="async"');

requireText(layoutSource, 'src/layouts/Layout.astro', "import '@/styles/performance.css';");
requireText(layoutSource, 'src/layouts/Layout.astro', 'data-adsense-deferred');
requireText(layoutSource, 'src/layouts/Layout.astro', 'requestIdleCallback');
requireText(layoutSource, 'src/layouts/Layout.astro', 'adsEnabled = true');
requireText(aboutSource, 'src/pages/about.astro', 'adsEnabled={false}');
requireText(
  headerSource,
  'src/components/Header.astro',
  "data-astro-reload={link.href === '/about' || link.href.startsWith('/en/') ? true : undefined}"
);
forbidText(layoutSource, 'src/layouts/Layout.astro', '<SearchModal client:idle />');
if (/<script[^>]+src=["']https:\/\/pagead2\.googlesyndication\.com/i.test(layoutSource)) {
  issues.push('src/layouts/Layout.astro: AdSense external script must not compete in initial HTML');
}

requireText(
  headerSource,
  'src/components/Header.astro',
  "ThemeToggle from '@/components/ThemeToggle.astro'"
);
forbidText(
  headerSource,
  'src/components/Header.astro',
  "ThemeToggle from '@/components/ThemeToggle.svelte'"
);
requireText(headerSource, 'src/components/Header.astro', '<Search client:load />');
forbidText(headerSource, 'src/components/Header.astro', '<Search client:idle />');

requireText(runtimeSource, 'src/lib/experience/renderer-runtime.ts', 'requestIdleCallback');
requireText(runtimeSource, 'src/lib/experience/renderer-runtime.ts', "rootMargin: '0px'");
forbidText(runtimeSource, 'src/lib/experience/renderer-runtime.ts', "rootMargin: '240px 0px'");

requireText(
  capabilitySource,
  'src/lib/experience/capability.ts',
  "tier === 'ultra' ? 'balanced' : 'low'"
);
requireText(capabilitySource, 'src/lib/experience/capability.ts', "tier === 'ultra' ? 80 : 48");

requireText(postsSource, 'src/pages/posts/index.astro', 'writing-category-section');
requireText(performanceCss, 'src/styles/performance.css', 'content-visibility: auto');
requireText(performanceCss, 'src/styles/performance.css', 'writing-category-section');
requireText(
  mediaPlugin,
  'src/lib/rehype/media-performance.mjs',
  "node.properties.loading ??= 'lazy'"
);
requireText(
  mediaPlugin,
  'src/lib/rehype/media-performance.mjs',
  "node.properties.decoding ??= 'async'"
);

const homepageGif = path.join(root, 'site', 'assets', 'image', 'mouse_surprised.gif');
if (fs.existsSync(homepageGif) && fs.statSync(homepageGif).size > 1.35 * 1024 * 1024) {
  issues.push(`homepage GIF exceeded 1.35 MiB source ceiling: ${fs.statSync(homepageGif).size} B`);
}

// Preserve the original WebP while enforcing a static first frame and a one-shot playback asset.
const profileDir = path.join(root, 'site', 'assets', 'assets', 'profile');
for (const [name, budget] of [['mouse_surprised-still.webp', 15 * 1024], ['mouse_surprised-once.webp', 200 * 1024]]) {
  const file = path.join(profileDir, name);
  if (!fs.existsSync(file) || fs.statSync(file).size > budget) issues.push(name + ': exceeds profile media budget or is missing');
  else {
    const bytes = fs.readFileSync(file);
    let loop = null, frames = 0, duration = 0;
    for (let offset = 12; offset + 8 <= bytes.length;) {
      const tag = bytes.toString('ascii', offset, offset + 4), size = bytes.readUInt32LE(offset + 4), start = offset + 8;
      if (tag === 'ANIM') loop = bytes.readUInt16LE(start + 4);
      if (tag === 'ANMF') { frames++; duration += bytes.readUIntLE(start + 12, 3); }
      offset = start + size + (size % 2);
    }
    if (name.includes('-still') && (loop !== null || frames !== 0)) issues.push('Static profile must not contain animation');
    if (name.includes('-once') && (loop !== 1 || frames !== 34 || duration !== 2270)) issues.push('Profile must play exactly one original 34-frame cycle');
  }
}
const graphComponent = read('src/components/experience/ExperienceCanvas.astro');
forbidText(graphComponent, 'ExperienceCanvas.astro', 'data-post-graph-source');
requireText(graphComponent, 'ExperienceCanvas.astro', 'data-graph-preview');
requireText(read('src/lib/experience/graph-loader.ts'), 'graph-loader.ts', "import('./ascii-art')");
for (const [language, prefix] of [['ko', ''], ['en', 'en/']]) {
  const payloadPath = path.join(dist, 'writing-graph', language + '.json');
  if (!fs.existsSync(payloadPath)) { issues.push('Missing graph JSON: ' + language); continue; }
  const graph = parseGraphPayload(fs.readFileSync(payloadPath, 'utf8'));
  if (graph.nodes.length === 0 || new Set(graph.nodes.map(node => node.id)).size !== graph.nodes.length) issues.push('Invalid graph node identity: ' + language);
  const ids = new Set(graph.nodes.map(node => node.id));
  if (graph.edges.some(edge => !ids.has(edge.source) || !ids.has(edge.target))) issues.push('Dangling graph edge: ' + language);
  for (const route of ['', 'research/']) {
    const html = fs.readFileSync(path.join(dist, prefix, route, 'index.html'), 'utf8');
    if (!html.includes('data-graph-count="' + graph.nodes.length + '"') || !html.includes('data-graph-url="/writing-graph/' + language + '.json?v=' + createHash('sha256').update(JSON.stringify(graph)).digest('hex').slice(0, 16) + '"')) issues.push('Graph HTML/JSON mismatch: ' + prefix + route);
    if (html.includes('data-post-graph-source') || html.includes('data-post-graph-node=')) issues.push('Cold page contains full graph data/links: ' + prefix + route);
    if (!html.includes('data-graph-preview') || !html.includes('data-graph-activate')) issues.push('Missing static map or activation: ' + prefix + route);
  }
}

const homeHtmlPath = path.join(dist, 'index.html');
const aboutHtmlPath = path.join(dist, 'about', 'index.html');
const writingHtmlPath = path.join(dist, 'posts', 'index.html');
for (const [label, file, budget] of [
  // Sep 29 completion adds two legitimate NEWS nodes to the existing graph.
  // The integrated build measures 256512 B; retain <2 KiB headroom.
  ['Home HTML', homeHtmlPath, 252 * 1024],
  // Chapter 03 adds a published series entry; keep the archive budget finite.
  ['Writing HTML', writingHtmlPath, 264 * 1024],
]) {
  if (!fs.existsSync(file)) {
    issues.push(`${label}: rendered file missing`);
    continue;
  }
  const bytes = fs.statSync(file).size;
  if (bytes > budget) issues.push(`${label}: ${bytes} B exceeds ${budget} B budget`);
}

if (fs.existsSync(homeHtmlPath)) {
  const homeHtml = fs.readFileSync(homeHtmlPath, 'utf8');
  if (/<script[^>]+src=["']https:\/\/pagead2\.googlesyndication\.com/i.test(homeHtml)) {
    issues.push('Home HTML: eager AdSense network script reintroduced');
  }
  if (
    !/<img\b[^>]*src=["']\/assets\/profile\/mouse_surprised-still\.webp["'][^>]*loading=["']lazy["'][^>]*fetchpriority=["']low["'][^>]*>/i.test(
      homeHtml
    )
  ) {
    issues.push('Home HTML: static profile must use lazy/low-priority loading');
  }
}

if (!fs.existsSync(aboutHtmlPath)) {
  issues.push('About HTML: rendered file missing');
} else {
  const aboutHtml = fs.readFileSync(aboutHtmlPath, 'utf8');
  for (const marker of [
    'google-adsense-account',
    'adsbygoogle',
    'googlesyndication',
    'doubleclick',
    'data-ad-slot',
    'data-adsense-deferred',
  ]) {
    if (aboutHtml.toLowerCase().includes(marker)) {
      issues.push(`About HTML: advertising marker must be absent: ${marker}`);
    }
  }
}

const postHtmlFiles = filesUnder(
  path.join(dist, 'posts'),
  (file) => path.basename(file) === 'index.html'
);
const drlHtmlPath = postHtmlFiles.find((file) =>
  fs.readFileSync(file, 'utf8').includes('/assets/slides/drl-robot-251110/slide-30.png')
);
if (!drlHtmlPath) {
  issues.push('DRL slide article: rendered HTML not found');
} else {
  const html = fs.readFileSync(drlHtmlPath, 'utf8');
  const slideTags =
    html.match(/<img\b[^>]*\/assets\/slides\/drl-robot-251110\/slide-\d+\.png[^>]*>/g) ?? [];
  const lazySlides = slideTags.filter((tag) => /\bloading=["']lazy["']/.test(tag));
  if (slideTags.length !== 30)
    issues.push(`DRL slide article: expected 30 slide images, got ${slideTags.length}`);
  if (lazySlides.length < 29) {
    issues.push(
      `DRL slide article: expected at least 29 lazy slide images, got ${lazySlides.length}`
    );
  }
}

const rendererChunks = filesUnder(path.join(dist, '_astro'), (file) => file.endsWith('.js')).filter(
  (file) => fs.readFileSync(file, 'utf8').includes('__JJO_RENDERER_CORE__')
);
if (rendererChunks.length !== 1) {
  issues.push(
    `renderer payload: expected one isolated renderer-core chunk, got ${rendererChunks.length}`
  );
} else {
  const gzipBytes = gzipSync(fs.readFileSync(rendererChunks[0]), { level: 9 }).length;
  const budget = 260 * 1024;
  if (gzipBytes > budget)
    issues.push(`renderer payload: ${gzipBytes} B gzip exceeds ${budget} B budget`);
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`performance-contract: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  'performance-contract: PASS (non-blocking Home identity media; native post lazy hints; deferred GPU/ads; load-time Search trigger + lazy dialog; offscreen containment; Home/Writing/renderer budgets)'
);

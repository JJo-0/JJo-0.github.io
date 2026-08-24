import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';

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
  if (source.includes(marker)) issues.push(`${filename}: forbidden performance regression ${marker}`);
}

if (!fs.existsSync(dist)) {
  console.error('performance-contract: dist/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

const astroConfig = read('astro.config.mjs');
const homeSource = read('src/pages/index.astro');
const layoutSource = read('src/layouts/Layout.astro');
const headerSource = read('src/components/Header.astro');
const runtimeSource = read('src/lib/experience/renderer-runtime.ts');
const capabilitySource = read('src/lib/experience/capability.ts');
const postsSource = read('src/pages/posts/index.astro');
const performanceCss = read('src/styles/performance.css');
const mediaPlugin = read('src/lib/rehype/media-performance.mjs');

requireText(astroConfig, 'astro.config.mjs', "import mediaPerformance from './src/lib/rehype/media-performance.mjs';");
requireText(astroConfig, 'astro.config.mjs', "inlineStylesheets: 'auto'");
requireText(astroConfig, 'astro.config.mjs', 'mediaPerformance,');
forbidText(astroConfig, 'astro.config.mjs', "inlineStylesheets: 'always'");

requireText(homeSource, 'src/pages/index.astro', 'src="/image/mouse_surprised.gif"');
requireText(homeSource, 'src/pages/index.astro', 'loading="eager"');
requireText(homeSource, 'src/pages/index.astro', 'fetchpriority="high"');
requireText(homeSource, 'src/pages/index.astro', 'decoding="async"');

requireText(layoutSource, 'src/layouts/Layout.astro', "import '@/styles/performance.css';");
requireText(layoutSource, 'src/layouts/Layout.astro', 'data-adsense-deferred');
requireText(layoutSource, 'src/layouts/Layout.astro', 'requestIdleCallback');
forbidText(layoutSource, 'src/layouts/Layout.astro', '<SearchModal client:idle />');
if (/<script[^>]+src=["']https:\/\/pagead2\.googlesyndication\.com/i.test(layoutSource)) {
  issues.push('src/layouts/Layout.astro: AdSense external script must not compete in initial HTML');
}

requireText(headerSource, 'src/components/Header.astro', "ThemeToggle from '@/components/ThemeToggle.astro'");
forbidText(headerSource, 'src/components/Header.astro', "ThemeToggle from '@/components/ThemeToggle.svelte'");
requireText(headerSource, 'src/components/Header.astro', '<Search client:load />');
forbidText(headerSource, 'src/components/Header.astro', '<Search client:idle />');

requireText(runtimeSource, 'src/lib/experience/renderer-runtime.ts', 'requestIdleCallback');
requireText(runtimeSource, 'src/lib/experience/renderer-runtime.ts', "rootMargin: '0px'");
forbidText(runtimeSource, 'src/lib/experience/renderer-runtime.ts', "rootMargin: '240px 0px'");

requireText(capabilitySource, 'src/lib/experience/capability.ts', "tier === 'ultra' ? 'balanced' : 'low'");
requireText(capabilitySource, 'src/lib/experience/capability.ts', "tier === 'ultra' ? 80 : 48");

requireText(postsSource, 'src/pages/posts/index.astro', 'writing-category-section');
requireText(performanceCss, 'src/styles/performance.css', 'content-visibility: auto');
requireText(performanceCss, 'src/styles/performance.css', 'writing-category-section');
requireText(mediaPlugin, 'src/lib/rehype/media-performance.mjs', "node.properties.loading ??= 'lazy'");
requireText(mediaPlugin, 'src/lib/rehype/media-performance.mjs', "node.properties.decoding ??= 'async'");

const homepageGif = path.join(root, 'site', 'assets', 'image', 'mouse_surprised.gif');
if (fs.existsSync(homepageGif) && fs.statSync(homepageGif).size > 1.35 * 1024 * 1024) {
  issues.push(`homepage GIF exceeded 1.35 MiB source ceiling: ${fs.statSync(homepageGif).size} B`);
}

const homeHtmlPath = path.join(dist, 'index.html');
const writingHtmlPath = path.join(dist, 'posts', 'index.html');
for (const [label, file, budget] of [
  ['Home HTML', homeHtmlPath, 240 * 1024],
  ['Writing HTML', writingHtmlPath, 260 * 1024],
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
  if (!/<img\b[^>]*src=["']\/image\/mouse_surprised\.gif["'][^>]*loading=["']eager["'][^>]*fetchpriority=["']high["'][^>]*>/i.test(homeHtml)) {
    issues.push('Home HTML: mouse GIF must render as eager/high-priority media');
  }
}

const postHtmlFiles = filesUnder(path.join(dist, 'posts'), (file) => path.basename(file) === 'index.html');
const drlHtmlPath = postHtmlFiles.find((file) =>
  fs.readFileSync(file, 'utf8').includes('/assets/slides/drl-robot-251110/slide-30.png'),
);
if (!drlHtmlPath) {
  issues.push('DRL slide article: rendered HTML not found');
} else {
  const html = fs.readFileSync(drlHtmlPath, 'utf8');
  const slideTags = html.match(/<img\b[^>]*\/assets\/slides\/drl-robot-251110\/slide-\d+\.png[^>]*>/g) ?? [];
  const lazySlides = slideTags.filter((tag) => /\bloading=["']lazy["']/.test(tag));
  if (slideTags.length !== 30) issues.push(`DRL slide article: expected 30 slide images, got ${slideTags.length}`);
  if (lazySlides.length < 29) {
    issues.push(`DRL slide article: expected at least 29 lazy slide images, got ${lazySlides.length}`);
  }
}

const rendererChunks = filesUnder(path.join(dist, '_astro'), (file) => file.endsWith('.js')).filter((file) =>
  fs.readFileSync(file, 'utf8').includes('__JJO_RENDERER_CORE__'),
);
if (rendererChunks.length !== 1) {
  issues.push(`renderer payload: expected one isolated renderer-core chunk, got ${rendererChunks.length}`);
} else {
  const gzipBytes = gzipSync(fs.readFileSync(rendererChunks[0]), { level: 9 }).length;
  const budget = 260 * 1024;
  if (gzipBytes > budget) issues.push(`renderer payload: ${gzipBytes} B gzip exceeds ${budget} B budget`);
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`performance-contract: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  'performance-contract: PASS (eager Home identity media; native post lazy hints; deferred GPU/ads; load-time Search trigger + lazy dialog; offscreen containment; Home/Writing/renderer budgets)',
);

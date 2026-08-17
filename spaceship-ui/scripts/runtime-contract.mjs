import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const postsDir = path.join(root, 'site', 'content', 'posts');
const issues = [];
const CHART_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';
const ADSENSE_SCRIPT = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const ADSENSE_LINE = 'google.com, pub-7495843758830919, DIRECT, f08c47fec0942fa0';

function filesUnder(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function getFrontmatter(source) {
  return source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
}

function scalar(frontmatter, key) {
  return frontmatter.match(new RegExp(`^${key}:\\s*['"]?([^'"\\n]+)['"]?\\s*$`, 'm'))?.[1]?.trim();
}

function expectedChartRoutes() {
  const now = new Date();
  const routes = new Set();
  for (const file of filesUnder(postsDir, (p) => /\.mdx?$/.test(p) && !path.basename(p).startsWith('_'))) {
    const raw = fs.readFileSync(file, 'utf8');
    const fm = getFrontmatter(raw);
    if (!/^usesChart:\s*true\s*$/m.test(fm)) continue;
    if (/^draft:\s*true\s*$/m.test(fm)) continue;

    const pubDate = scalar(fm, 'pubDate');
    if (!pubDate) {
      issues.push(`${path.relative(root, file)}: chart-enabled post is missing pubDate`);
      continue;
    }
    const parsedDate = new Date(`${pubDate}T00:00:00Z`);
    if (Number.isNaN(parsedDate.valueOf())) {
      issues.push(`${path.relative(root, file)}: invalid pubDate ${pubDate}`);
      continue;
    }
    if (parsedDate > now) continue;

    const explicitSlug = scalar(fm, 'slug');
    const id = path.basename(file).replace(/\.mdx?$/, '');
    const slug = explicitSlug || `${pubDate}-${id}`;
    routes.add(`posts/${slug}/index.html`);
  }
  return routes;
}

function expectedAdRoutes() {
  const mode = process.env.PUBLIC_GOOGLE_ADSENSE_MODE || 'off';
  const clientId = process.env.PUBLIC_GOOGLE_ADSENSE_CLIENT || 'ca-pub-7495843758830919';
  const adSlot = process.env.PUBLIC_GOOGLE_ADSENSE_SLOT || '';
  const configReady = mode === 'manual' && /^ca-pub-\d{16}$/.test(clientId) && /^\d+$/.test(adSlot);
  if (!configReady) return new Set();

  const now = new Date();
  const routes = new Set();
  for (const file of filesUnder(postsDir, (p) => /\.mdx?$/.test(p) && !path.basename(p).startsWith('_'))) {
    const raw = fs.readFileSync(file, 'utf8');
    const fm = getFrontmatter(raw);
    if (!/^showAds:\s*true\s*$/m.test(fm)) continue;
    if (/^draft:\s*true\s*$/m.test(fm)) continue;

    const pubDate = scalar(fm, 'pubDate');
    if (!pubDate) {
      issues.push(`${path.relative(root, file)}: ad-enabled post is missing pubDate`);
      continue;
    }
    const parsedDate = new Date(`${pubDate}T00:00:00Z`);
    if (Number.isNaN(parsedDate.valueOf())) {
      issues.push(`${path.relative(root, file)}: invalid pubDate ${pubDate}`);
      continue;
    }
    if (parsedDate > now) continue;

    const explicitSlug = scalar(fm, 'slug');
    const id = path.basename(file).replace(/\.mdx?$/, '');
    const slug = explicitSlug || `${pubDate}-${id}`;
    routes.add(`posts/${slug}/index.html`);
  }
  return routes;
}

if (!fs.existsSync(dist)) {
  console.error('runtime-contract: dist/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (packageJson.dependencies?.['@fontsource-variable/inter'] || packageJson.devDependencies?.['@fontsource-variable/inter']) {
  issues.push('package.json: unused @fontsource-variable/inter dependency was reintroduced');
}

for (const relative of ['src/layouts/Layout.astro', 'src/styles/global.css']) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  if (source.includes('@fontsource-variable/inter') || source.includes('Inter Variable')) {
    issues.push(`${relative}: unused Inter Variable runtime/source reference was reintroduced`);
  }
}

const postPageSource = fs.readFileSync(path.join(root, 'src/pages/posts/[...slug]/index.astro'), 'utf8');
if (/client:load/.test(postPageSource)) {
  issues.push('post detail: eager client:load island was reintroduced');
}
if (!/<TableOfContents\s+client:idle/.test(postPageSource)) {
  issues.push('post detail: TableOfContents must remain client:idle');
}
if (!/<SocialShare\s+client:visible/.test(postPageSource)) {
  issues.push('post detail: SocialShare must remain client:visible');
}
if (!/<SocialShare\s+client:visible\s+url=\{canonicalPostUrl\}/.test(postPageSource)) {
  issues.push('post detail: SocialShare must receive the canonical post URL for Copy Link');
}
if (!/<Comments\s+client:visible/.test(postPageSource)) {
  issues.push('post detail: Comments must remain client:visible');
}
if (/<LanguageSelector\s+client:/.test(postPageSource)) {
  issues.push('post detail: LanguageSelector is static links and must not be hydrated');
}
if (!/showAds=\{post\.data\.showAds\}/.test(postPageSource)) {
  issues.push('post detail: showAds must be passed explicitly to Layout');
}

const layoutSource = fs.readFileSync(path.join(root, 'src/layouts/Layout.astro'), 'utf8');
if (!layoutSource.includes("adsenseConfig?.mode === 'manual'")) {
  issues.push('Layout: AdSense must remain manual-mode gated');
}
if (!layoutSource.includes('showAds &&')) {
  issues.push('Layout: AdSense must remain page opt-in gated');
}

const siteConfigSource = fs.readFileSync(path.join(root, 'site/config.ts'), 'utf8');
if (!siteConfigSource.includes('PUBLIC_GOOGLE_ADSENSE_MODE')) {
  issues.push('site/config.ts: AdSense mode must be environment controlled');
}
if (/adsense:\s*\{[\s\S]{0,120}enabled:\s*true/.test(siteConfigSource)) {
  issues.push('site/config.ts: global enabled:true AdSense configuration was reintroduced');
}

const socialSource = fs.readFileSync(path.join(root, 'src/components/SocialShare.svelte'), 'utf8');
if (!socialSource.includes('navigator.clipboard.writeText(url)')) {
  issues.push('SocialShare: Copy Link must continue copying the canonical URL prop');
}
for (const retiredTarget of ['x.com/intent', 't.me/share', 'facebook.com/sharer']) {
  if (socialSource.includes(retiredTarget)) {
    issues.push(`SocialShare: retired share target returned (${retiredTarget})`);
  }
}

const expected = expectedChartRoutes();
const actual = new Set();
for (const file of filesUnder(path.join(dist, 'posts'), (p) => p.endsWith('index.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(CHART_CDN)) continue;
  actual.add(path.relative(dist, file).replaceAll(path.sep, '/'));
}

for (const route of expected) {
  if (!actual.has(route)) issues.push(`${route}: usesChart post is missing Chart.js runtime`);
}
for (const route of actual) {
  if (!expected.has(route)) issues.push(`${route}: Chart.js runtime loaded without usesChart opt-in`);
}

for (const relative of ['index.html', 'research/index.html', 'posts/index.html', 'about/index.html']) {
  const file = path.join(dist, relative);
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(CHART_CDN)) {
    issues.push(`${relative}: Chart.js must not load on a non-chart core page`);
  }
}

const expectedAds = expectedAdRoutes();
const actualAds = new Set();
for (const file of filesUnder(dist, (p) => p.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(ADSENSE_SCRIPT) && !html.includes('class="adsbygoogle"')) continue;
  actualAds.add(path.relative(dist, file).replaceAll(path.sep, '/'));
}
for (const route of expectedAds) {
  if (!actualAds.has(route)) issues.push(`${route}: showAds post is missing its manual AdSense unit`);
}
for (const route of actualAds) {
  if (!expectedAds.has(route)) issues.push(`${route}: AdSense loaded without valid manual mode + showAds opt-in`);
}
for (const relative of [
  'index.html',
  'research/index.html',
  'posts/index.html',
  'about/index.html',
  'privacy/index.html',
]) {
  const file = path.join(dist, relative);
  if (!fs.existsSync(file)) {
    if (relative === 'privacy/index.html') issues.push('privacy/index.html: privacy page is missing');
    continue;
  }
  if (fs.readFileSync(file, 'utf8').includes(ADSENSE_SCRIPT)) {
    issues.push(`${relative}: AdSense must not load on a core/privacy page`);
  }
}

const adsFile = path.join(dist, 'ads.txt');
if (!fs.existsSync(adsFile)) {
  issues.push('ads.txt: missing from production output');
} else if (fs.readFileSync(adsFile, 'utf8').trim() !== ADSENSE_LINE) {
  issues.push('ads.txt: publisher authorization line changed');
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`runtime-contract: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `runtime-contract: PASS (${actual.size} chart routes; ${actualAds.size} selectively monetized routes; privacy + ads.txt; no global Chart.js/AdSense or eager post islands)`,
);

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const postsDir = path.join(root, 'site', 'content', 'posts');
const issues = [];
const CHART_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';

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
if (!/<Comments\s+client:visible/.test(postPageSource)) {
  issues.push('post detail: Comments must remain client:visible');
}
if (/<LanguageSelector\s+client:/.test(postPageSource)) {
  issues.push('post detail: LanguageSelector is static links and must not be hydrated');
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

const samplePost = filesUnder(path.join(dist, 'posts'), (p) => /posts[/\\][^/\\]+[/\\]index\.html$/.test(p))
  .find((file) => !file.includes(`${path.sep}tag${path.sep}`));
if (samplePost) {
  const html = fs.readFileSync(samplePost, 'utf8');
  if (!html.includes('https%3A%2F%2Fjjo-0.github.io%2Fposts%2F')) {
    issues.push(`${path.relative(dist, samplePost)}: server-rendered social share URL is not canonical`);
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`runtime-contract: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `runtime-contract: PASS (${actual.size} chart-enabled post routes; no global Chart.js, dead Inter Variable, or eager post islands)`,
);

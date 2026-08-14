import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const posts = path.join(root, 'site', 'content', 'posts');
const issues = [];
const HTML_BLOCK_START = /^(?:<!--[\s\S]*?-->\s*)*<(?:article|aside|blockquote|canvas|div|figure|footer|form|h[1-6]|header|ins|main|nav|ol|p|script|section|style|table|ul)\b/i;
const EXPECTED_LEGACY_REDIRECTS = 45;
const EXPECTED_MODERN_AI_FORMULAS = 238;
const FRAGILE_IMAGE_HOSTS = /(?:^|\.)(?:google\.com|googleusercontent\.com|bing\.com|duckduckgo\.com|daumcdn\.net|kakaocdn\.net)$/i;

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

function decodeHtml(value) {
  return value.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&amp;', '&');
}

function decodeUri(value) {
  try { return decodeURIComponent(value); } catch { return value; }
}

function routeExists(urlPath) {
  const clean = decodeUri(urlPath.split(/[?#]/, 1)[0]);
  if (!clean.startsWith('/')) return true;
  if (clean === '/') return fs.existsSync(path.join(dist, 'index.html'));
  const relative = clean.replace(/^\/+/, '');
  const direct = path.join(dist, relative);
  if (fs.existsSync(direct)) {
    const stat = fs.statSync(direct);
    if (stat.isFile()) return true;
    if (stat.isDirectory() && fs.existsSync(path.join(direct, 'index.html'))) return true;
  }
  if (path.extname(relative)) return false;
  return fs.existsSync(`${direct}.html`);
}

function pageUrlForHtml(file) {
  const relative = path.relative(dist, file).replaceAll(path.sep, '/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'index.html'.length)}`;
  return `/${relative}`;
}

function localPathForReference(reference, pageUrl) {
  const target = decodeHtml(reference.trim());
  if (!target || target.startsWith('#') || target.startsWith('//')) return null;
  if (/^(?:https?:|mailto:|tel:|data:|blob:|javascript:)/i.test(target)) return null;
  try { return new URL(target, `https://local.invalid${pageUrl}`).pathname; } catch { return null; }
}

function stripCode(source) {
  const lines = source.split(/\r?\n/);
  const kept = [];
  let fence = null;
  for (const line of lines) {
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      kept.push('');
      continue;
    }
    if (fence !== null || /^(?: {4}|\t)/.test(line)) {
      kept.push('');
      continue;
    }
    kept.push(line.replace(/`+[^`\n]*`+/g, ''));
  }
  return kept.join('\n');
}

if (!fs.existsSync(dist)) {
  console.error('content-integrity: dist/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const dependency of ['remark-math', 'rehype-katex']) {
  if (packageJson.dependencies?.[dependency] || packageJson.devDependencies?.[dependency]) {
    issues.push(`obsolete global math parser dependency remains: ${dependency}`);
  }
}

const astroConfig = fs.readFileSync(path.join(root, 'astro.config.mjs'), 'utf8');
for (const token of ['remark-math', 'rehype-katex', 'repairLegacyMathArtifacts', 'replaceFragileMedia']) {
  if (astroConfig.includes(token)) issues.push(`obsolete compatibility hook remains in astro.config.mjs: ${token}`);
}

const legacyRedirects = [];
let visionMathVerified = false;
let modernAiMathCount = -1;

for (const file of filesUnder(dist, (p) => p.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(dist, file);
  const normalizedRelative = relative.replaceAll(path.sep, '/');
  const pageUrl = pageUrlForHtml(file);

  for (const match of html.matchAll(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi)) {
    const decoded = decodeHtml(match[1]).trim();
    if (decoded.length >= 500 && HTML_BLOCK_START.test(decoded)) issues.push(`${relative}: suspicious legacy HTML rendered as code (${decoded.length} chars)`);
  }

  const ids = new Set([...html.matchAll(/\bid=(['"])(.*?)\1/gi)].map((match) => decodeUri(decodeHtml(match[2]))));
  for (const match of html.matchAll(/\bhref=(['"])#([^'"]+)\1/gi)) {
    const fragment = decodeUri(decodeHtml(match[2]));
    if (!ids.has(fragment)) issues.push(`${relative}: missing same-page anchor #${fragment}`);
  }

  for (const match of html.matchAll(/\b(?:href|src)=(['"])(.*?)\1/gi)) {
    const localPath = localPathForReference(match[2], pageUrl);
    if (localPath && !routeExists(localPath)) issues.push(`${relative}: missing local target ${match[2]} -> ${localPath}`);
  }

  for (const match of html.matchAll(/<img\b[^>]*\bsrc=(['"])(https?:\/\/.*?)\1/gi)) {
    try {
      const url = new URL(decodeHtml(match[2]));
      if (FRAGILE_IMAGE_HOSTS.test(url.hostname)) issues.push(`${relative}: fragile image hotlink remains in built HTML: ${url.href}`);
    } catch { /* ignored */ }
  }

  const legacyTarget = html.match(/<meta\s+name=(['"])legacy-redirect-target\1\s+content=(['"])(.*?)\2/i)?.[3];
  if (legacyTarget) {
    legacyRedirects.push({ source: pageUrl, target: decodeHtml(legacyTarget) });
    if (!routeExists(legacyTarget)) issues.push(`${relative}: legacy redirect target does not exist: ${legacyTarget}`);
    if (!/<meta\s+name=(['"])robots\1\s+content=(['"])noindex,follow\2/i.test(html)) issues.push(`${relative}: legacy redirect is missing noindex,follow`);
  }

  if (normalizedRelative === 'posts/2025-02-18-vision/index.html') {
    visionMathVerified = /class=(['"])[^'"]*katex/.test(html) && !html.includes('begin:math:text') && !html.includes('end:math:text');
  }

  if (normalizedRelative === 'posts/2025-05-16-mordern-artificial-intelligence/index.html') {
    modernAiMathCount = [...html.matchAll(/class=(['"])[^'"]*math-display[^'"]*\1/g)].length;
  }
}

if (legacyRedirects.length !== EXPECTED_LEGACY_REDIRECTS) issues.push(`legacy redirects: expected ${EXPECTED_LEGACY_REDIRECTS}, generated ${legacyRedirects.length}`);
const knownLegacy = legacyRedirects.find(({ source }) => source === '/projects/computer-vision/Human-Height-Estimation/');
if (knownLegacy?.target !== '/posts/2024-12-26-human-height-estimation/') issues.push('legacy redirects: Human Height Estimation mapping is missing or points to the wrong target');
if (!visionMathVerified) issues.push('Vision post: native KaTeX output missing or legacy inline-math sentinels remain');
if (modernAiMathCount !== EXPECTED_MODERN_AI_FORMULAS) issues.push(`Modern AI post: expected ${EXPECTED_MODERN_AI_FORMULAS} rendered Math components, found ${modernAiMathCount}`);

const sitemapText = filesUnder(dist, (p) => /sitemap.*\.xml$/.test(path.basename(p))).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
for (const { source } of legacyRedirects) if (sitemapText.includes(source)) issues.push(`sitemap contains noindex legacy redirect: ${source}`);

for (const file of filesUnder(posts, (p) => /\.mdx?$/.test(p) && !path.basename(p).startsWith('_'))) {
  const source = stripCode(fs.readFileSync(file, 'utf8'));
  if (/(?<!\\)\$\$/.test(source)) {
    issues.push(`${path.relative(root, file)}: legacy $$ math syntax remains; use the native Math component`);
  }
  if (/\$begin:math:|\$end:math:/.test(source)) {
    issues.push(`${path.relative(root, file)}: migrated legacy math sentinel remains`);
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length > 0) {
  console.error(`content-integrity: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log(`content-integrity: PASS (${legacyRedirects.length} legacy redirects, explicit KaTeX, local links/assets, anchors, media)`);

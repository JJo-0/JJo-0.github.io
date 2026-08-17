import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const postsSourceDir = path.join(root, 'site', 'content', 'posts');
const issues = [];
const EXPECTED_LEGACY_REDIRECTS = 45;
const EXPECTED_MODERN_AI_MATH = 238;

const HTML_BLOCK_START = /^\s*(?:<!--[\s\S]*?-->\s*)*<(?:article|aside|blockquote|canvas|div|figure|footer|form|h[1-6]|header|ins|main|nav|ol|p|script|section|style|table|ul)\b/i;

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

function decodeHtmlEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&');
}

function pageUrlForHtml(file) {
  const relative = path.relative(dist, file).replaceAll(path.sep, '/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'index.html'.length)}`;
  if (relative.endsWith('.html')) return `/${relative}`;
  return `/${relative}`;
}

function routeExists(urlPath) {
  let pathname = urlPath.split(/[?#]/, 1)[0];
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // Keep the original URL if percent-decoding fails; the existence check will fail closed.
  }

  const relative = pathname.replace(/^\/+/, '');
  const candidates = [];
  if (!relative) candidates.push(path.join(dist, 'index.html'));
  else {
    candidates.push(path.join(dist, relative));
    candidates.push(path.join(dist, relative, 'index.html'));
    if (!path.extname(relative)) candidates.push(path.join(dist, `${relative}.html`));
  }
  return candidates.some((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

function stripFencedCode(source) {
  const lines = source.split(/\r?\n/);
  const kept = [];
  let fenceChar = null;
  let fenceLength = 0;

  for (const line of lines) {
    const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (match) {
      const char = match[1][0];
      const length = match[1].length;
      if (fenceChar === null) {
        fenceChar = char;
        fenceLength = length;
      } else if (char === fenceChar && length >= fenceLength) {
        fenceChar = null;
        fenceLength = 0;
      }
      kept.push('');
      continue;
    }

    kept.push(fenceChar === null ? line : '');
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
for (const token of [
  'remark-math',
  'rehype-katex',
  'repairLegacyMathArtifacts',
  'replaceFragileMedia',
  'restoreLegacyHtml',
  'fixLegacyFragments',
  'remarkRepairLiteralStrong',
  'langAlias:',
]) {
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
    const decoded = decodeHtmlEntities(match[1].replace(/<[^>]+>/g, ''));
    if (decoded.length >= 500 && HTML_BLOCK_START.test(decoded)) issues.push(`${relative}: suspicious legacy HTML rendered as code (${decoded.length} chars)`);
  }

  for (const attr of ['href', 'src', 'poster']) {
    const pattern = new RegExp(`${attr}=["']([^"']+)["']`, 'gi');
    for (const match of html.matchAll(pattern)) {
      const value = match[1];
      if (!value.startsWith('/') || value.startsWith('//')) continue;
      if (!routeExists(value)) issues.push(`${relative}: missing local ${attr} target ${value}`);
    }
  }

  for (const srcset of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
    for (const item of srcset[1].split(',')) {
      const value = item.trim().split(/\s+/, 1)[0];
      if (value?.startsWith('/') && !value.startsWith('//') && !routeExists(value)) {
        issues.push(`${relative}: missing local srcset target ${value}`);
      }
    }
  }

  for (const fragment of html.matchAll(/href=["']#([^"']+)["']/gi)) {
    const decoded = decodeHtmlEntities(fragment[1]);
    if (!html.includes(`id="${decoded}"`) && !html.includes(`id='${decoded}'`)) {
      issues.push(`${relative}: missing same-page fragment #${decoded}`);
    }
  }

  const legacyTarget = html.match(/<meta\s+name=(['"])legacy-redirect-target\1\s+content=(['"])(.*?)\2/i)?.[3];
  if (legacyTarget) {
    legacyRedirects.push({ source: pageUrl, target: legacyTarget });
    if (!routeExists(legacyTarget)) issues.push(`${relative}: legacy redirect target does not exist: ${legacyTarget}`);
    if (!/<meta\s+name=(['"])robots\1\s+content=(['"])noindex,follow\2/i.test(html)) issues.push(`${relative}: legacy redirect is missing noindex,follow`);
  }

  if (normalizedRelative === 'posts/2025-02-18-vision/index.html') {
    visionMathVerified = html.includes('class="katex"') && !html.includes('data-legacy-inline-math');
  }
  if (normalizedRelative === 'posts/2025-05-16-mordern-artificial-intelligence/index.html') {
    modernAiMathCount = (html.match(/class="katex"/g) ?? []).length;
  }
}

if (legacyRedirects.length !== EXPECTED_LEGACY_REDIRECTS) issues.push(`legacy redirects: expected ${EXPECTED_LEGACY_REDIRECTS}, generated ${legacyRedirects.length}`);
const knownLegacy = legacyRedirects.find(({ source }) => source === '/projects/computer-vision/Human-Height-Estimation/');
if (knownLegacy?.target !== '/posts/2024-12-26-human-height-estimation/') issues.push('legacy redirects: Human Height Estimation mapping is missing or points to the wrong target');
if (!visionMathVerified) issues.push('Vision post: native KaTeX output missing or legacy inline-math sentinels remain');
if (modernAiMathCount !== EXPECTED_MODERN_AI_MATH) issues.push(`Modern AI post: expected ${EXPECTED_MODERN_AI_MATH} native KaTeX expressions, found ${modernAiMathCount}`);

const sitemapText = filesUnder(dist, (p) => /sitemap.*\.xml$/.test(path.basename(p)))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
for (const { source } of legacyRedirects) if (sitemapText.includes(source)) issues.push(`sitemap contains noindex legacy redirect: ${source}`);

for (const file of filesUnder(postsSourceDir, (p) => /\.mdx?$/.test(p) && !path.basename(p).startsWith('_'))) {
  const source = stripFencedCode(fs.readFileSync(file, 'utf8'));
  if (/\$\$/.test(source)) {
    issues.push(`${path.relative(root, file)}: legacy $$ math syntax remains; use the native Math component`);
  }
  if (/data-legacy-inline-math|LEGACY_MATH/i.test(source)) {
    issues.push(`${path.relative(root, file)}: migrated legacy math sentinel remains`);
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`content-integrity: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(`content-integrity: PASS (${legacyRedirects.length} legacy redirects, explicit KaTeX, local links/assets, anchors, media)`);

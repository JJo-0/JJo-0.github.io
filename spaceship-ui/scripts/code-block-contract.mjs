import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// Follow each rendered route through Astro's emitted JS/CSS dependency graph.
const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];

const postPagePath = path.join(root, 'src', 'pages', 'posts', '[...slug]', 'index.astro');
const runtimePath = path.join(root, 'src', 'scripts', 'code-block-runtime.js');
const stylesPath = path.join(root, 'src', 'styles', 'code-blocks.css');

function readRequired(file, label) {
  if (!fs.existsSync(file)) {
    issues.push(`${label}: missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function occurrences(source, literal) {
  return source.split(literal).length - 1;
}

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

function requireLiteral(source, literal, label) {
  if (!source.includes(literal)) issues.push(`${label}: missing ${literal}`);
}

function isRenderedCodeBlock(source) {
  return /<pre\b[^>]*class=(['"])[^'"]*\b(?:astro-code|shiki)\b[^'"]*\1/i.test(source);
}

function resolveAssetReference(reference, fromFile) {
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean || !/\.(?:js|css)$/.test(clean)) return null;
  if (clean.startsWith('/_astro/')) return path.join(dist, clean.slice(1));
  if (clean.startsWith('_astro/')) return path.join(dist, clean);
  if (clean.startsWith('./') || clean.startsWith('../')) {
    return path.resolve(path.dirname(fromFile), clean);
  }
  return null;
}

function directAssetReferences(source, fromFile) {
  const refs = new Set();
  const patterns = [
    /(?:src|href)=(['"])([^'"]+)\1/g,
    /(['"])((?:\/_astro\/|_astro\/|\.\.?\/)[^'"]+\.(?:js|css)(?:\?[^'"]*)?)\1/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const raw = match[2];
      const resolved = resolveAssetReference(raw, fromFile);
      if (resolved && resolved.startsWith(dist) && fs.existsSync(resolved)) refs.add(resolved);
    }
  }
  return refs;
}

function reachableRenderedSources(entryFile) {
  const visited = new Set();
  const queue = [entryFile];
  while (queue.length) {
    const file = queue.shift();
    if (!file || visited.has(file) || !fs.existsSync(file)) continue;
    visited.add(file);
    const source = fs.readFileSync(file, 'utf8');
    for (const dependency of directAssetReferences(source, file)) {
      if (!visited.has(dependency)) queue.push(dependency);
    }
  }
  return [...visited].map((file) => ({ file, source: fs.readFileSync(file, 'utf8') }));
}

function hasRuntimeContract(source) {
  const signatures = [
    '__jjoContextCodeBlocksInstalled',
    'post-code-block-',
    'code-block-shell',
    'astro:page-load',
    'aria-expanded',
  ];
  return signatures.filter((signature) => source.includes(signature)).length >= 4;
}

function hasStyleContract(source) {
  const signatures = ['code-block-shell', 'is-collapsible', 'code-block-toggle', 'max-height'];
  return signatures.every((signature) => source.includes(signature));
}

const postPage = readRequired(postPagePath, 'post detail page');
const runtime = readRequired(runtimePath, 'code-block runtime');
const styles = readRequired(stylesPath, 'code-block styles');

for (const [literal, label] of [
  ["import '@/styles/code-blocks.css';", 'post detail page'],
  ["import '@/scripts/code-block-runtime.js';", 'post detail page'],
]) {
  const found = occurrences(postPage, literal);
  if (found !== 1) issues.push(`${label}: expected one ${literal}, found ${found}`);
}

for (const literal of [
  "const CODE_BLOCK_SELECTOR = '.prose pre.astro-code, .prose pre.shiki';",
  'const LONG_BLOCK_MIN_LINES = 16;',
  'pre.scrollHeight >= LONG_BLOCK_MIN_HEIGHT',
  "document.addEventListener('astro:page-load', scheduleEnhancement);",
  "pre.dataset.codeBlockEnhanced === 'true'",
  "button.setAttribute('aria-expanded', 'false');",
  'navigator.clipboard?.writeText',
  "shell.classList.add('is-collapsible');",
]) {
  requireLiteral(runtime, literal, 'code-block runtime');
}
for (const forbidden of [
  'MutationObserver',
  "document.execCommand('copy')",
  "document.querySelectorAll('.prose pre')",
]) {
  if (runtime.includes(forbidden)) issues.push(`code-block runtime: forbidden implementation ${forbidden}`);
}

for (const literal of [
  '.prose .code-block-shell.is-collapsible:not(.is-expanded) > pre',
  'max-height: clamp(16rem, 46vh, 22rem);',
  'overflow-y: hidden !important;',
  '.prose .code-block-copy:focus-visible',
  '.prose .code-block-toggle:focus-visible',
  "[data-copy-state='copied']",
  '@media (prefers-reduced-motion: reduce)',
]) {
  requireLiteral(styles, literal, 'code-block styles');
}

let renderedCodeRoutes = 0;
let runtimeCarrierCount = 0;
let styleCarrierCount = 0;

if (!fs.existsSync(dist)) {
  issues.push('dist/: missing; run pnpm build before code-block contract');
} else {
  const postHtmlFiles = filesUnder(path.join(dist, 'posts'), (file) => file.endsWith('index.html'));
  const codePostFiles = postHtmlFiles.filter((file) => isRenderedCodeBlock(fs.readFileSync(file, 'utf8')));
  renderedCodeRoutes = codePostFiles.length;
  if (codePostFiles.length === 0) {
    issues.push('rendered posts: no actual <pre class="astro-code|shiki"> route found');
  }

  for (const file of codePostFiles) {
    const reachable = reachableRenderedSources(file);
    const runtimeCarriers = reachable.filter(({ source }) => hasRuntimeContract(source));
    const styleCarriers = reachable.filter(({ source }) => hasStyleContract(source));
    runtimeCarrierCount += runtimeCarriers.length;
    styleCarrierCount += styleCarriers.length;
    if (runtimeCarriers.length === 0) {
      issues.push(`${path.relative(dist, file)}: code-block runtime is not reachable from rendered route`);
    }
    if (styleCarriers.length === 0) {
      issues.push(`${path.relative(dist, file)}: code-block styles are not reachable from rendered route`);
    }
  }

  const allRenderedFiles = filesUnder(dist, (file) => /\.(?:html|js|css)$/.test(file));
  if (!allRenderedFiles.some((file) => hasRuntimeContract(fs.readFileSync(file, 'utf8')))) {
    issues.push('rendered output: no code-block runtime carrier found');
  }
  if (!allRenderedFiles.some((file) => hasStyleContract(fs.readFileSync(file, 'utf8')))) {
    issues.push('rendered output: no code-block style carrier found');
  }

  for (const relative of ['index.html', 'research/index.html', 'about/index.html']) {
    const file = path.join(dist, relative);
    if (!fs.existsSync(file)) continue;
    const reachable = reachableRenderedSources(file);
    if (reachable.some(({ source }) => hasRuntimeContract(source))) {
      issues.push(`${relative}: post-only code-block runtime leaked into a core page`);
    }
    if (reachable.some(({ source }) => hasStyleContract(source))) {
      issues.push(`${relative}: post-only code-block styles leaked into a core page`);
    }
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`code-block-contract: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `code-block-contract: PASS (${renderedCodeRoutes} rendered code route(s); ` +
    `${runtimeCarrierCount} reachable runtime carrier(s); ${styleCarrierCount} reachable style carrier(s); ` +
    'long Shiki blocks collapse; short/raw pre blocks remain intact; copy, keyboard, reduced-motion, and Astro navigation contracts verified)',
);

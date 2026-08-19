import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];
const TRANSITION_BUDGET_GZIP = 20 * 1024;

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function filesUnder(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(full, predicate));
    else if (predicate(full)) files.push(full);
  }
  return files;
}

function localScripts(html) {
  return [...new Set([...html.matchAll(/<script\b[^>]*\bsrc=(['"])(\/_astro\/[^'"]+\.js)\1/gi)].map((match) => match[2]))];
}

function transitionBundleFor(html) {
  for (const source of localScripts(html)) {
    const file = path.join(dist, source.replace(/^\//, ''));
    if (!fs.existsSync(file)) continue;
    const js = fs.readFileSync(file, 'utf8');
    if (js.includes('__jjoTransitionRuntime') && js.includes('data-post-transition-slug')) {
      return { source, file, js };
    }
  }
  return null;
}

function markerCount(html, marker) {
  return (html.match(new RegExp(marker, 'g')) ?? []).length;
}

if (!fs.existsSync(dist)) {
  console.error('transition-contract: dist/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

const requiredFiles = [
  'src/styles/transitions.css',
  'src/lib/navigation/transition.ts',
  'src/components/navigation/TransitionRuntime.astro',
];
for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) issues.push(`${relative}: required transition file is missing`);
}

const layout = read('src/layouts/Layout.astro');
const runtime = read('src/lib/navigation/transition.ts');
const transitionCss = read('src/styles/transitions.css');
const postCard = read('src/components/PostCard.svelte');
const writingItem = read('src/components/WritingListItem.astro');
const researchPage = read('src/pages/research.astro');
const postPage = read('src/pages/posts/[...slug]/index.astro');

if (!layout.includes("import '@/styles/transitions.css'")) {
  issues.push('Layout.astro: transitions.css is not imported');
}
if (!layout.includes("import TransitionRuntime from '@/components/navigation/TransitionRuntime.astro'")) {
  issues.push('Layout.astro: global TransitionRuntime is not imported');
}
if (!layout.includes('<TransitionRuntime />')) {
  issues.push('Layout.astro: global TransitionRuntime is not mounted');
}
if (!layout.includes('<ClientRouter fallback="animate"')) {
  issues.push('Layout.astro: ClientRouter fallback must remain animate');
}

for (const [relative, source] of [
  ['PostCard.svelte', postCard],
  ['WritingListItem.astro', writingItem],
  ['research.astro', researchPage],
]) {
  if (!source.includes('data-post-transition-slug') || !source.includes('data-post-transition-title')) {
    issues.push(`${relative}: post transition source markers are incomplete`);
  }
}

if (!postPage.includes('data-post-page-slug') || !postPage.includes('data-post-transition-static')) {
  issues.push('post detail: shared-title destination markers are incomplete');
}
if (!postPage.includes('view-transition-name: ${postTransitionName}')) {
  issues.push('post detail: static destination view-transition-name is missing');
}

for (const event of [
  'astro:before-preparation',
  'astro:after-preparation',
  'astro:before-swap',
  'astro:page-load',
]) {
  if (!runtime.includes(event)) issues.push(`transition runtime: ${event} lifecycle hook is missing`);
}
if (!runtime.includes('newDocument') || !runtime.includes('data-post-transition-static')) {
  issues.push('transition runtime: incoming-document/back-navigation matching is incomplete');
}
if (/addEventListener\(\s*['"](?:wheel|touchmove)['"]/.test(runtime)) {
  issues.push('transition runtime: scroll hijacking listeners are forbidden');
}
if (!transitionCss.includes('@media (prefers-reduced-motion: reduce)')) {
  issues.push('transitions.css: reduced-motion fallback is missing');
}
if (!transitionCss.includes('::view-transition-group(*)')) {
  issues.push('transitions.css: shared-element transition timing is missing');
}

const corePages = ['index.html', 'research/index.html', 'posts/index.html', 'about/index.html'];
let transitionBundle = null;
for (const relative of corePages) {
  const file = path.join(dist, relative);
  if (!fs.existsSync(file)) {
    issues.push(`${relative}: core page build output is missing`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-route-progress')) issues.push(`${relative}: route progress marker is missing`);
  transitionBundle ??= transitionBundleFor(html);
}

if (!transitionBundle) {
  issues.push('built output: transition runtime bundle was not found');
} else {
  const gzipBytes = gzipSync(fs.readFileSync(transitionBundle.file)).byteLength;
  if (gzipBytes > TRANSITION_BUDGET_GZIP) {
    issues.push(`transition runtime budget exceeded: ${gzipBytes} B gzip > ${TRANSITION_BUDGET_GZIP} B`);
  }
}

const homeHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const writingHtml = fs.readFileSync(path.join(dist, 'posts', 'index.html'), 'utf8');
const researchHtml = fs.readFileSync(path.join(dist, 'research', 'index.html'), 'utf8');
for (const [relative, html] of [
  ['index.html', homeHtml],
  ['posts/index.html', writingHtml],
  ['research/index.html', researchHtml],
]) {
  const slugs = markerCount(html, 'data-post-transition-slug=');
  const titles = markerCount(html, 'data-post-transition-title');
  if (slugs === 0 || titles === 0) issues.push(`${relative}: no post transition sources were rendered`);
  if (slugs !== titles) issues.push(`${relative}: transition source/title count mismatch (${slugs} vs ${titles})`);
  if (html.includes('view-transition-name: post-title-')) {
    issues.push(`${relative}: list pages must assign transition names dynamically to avoid duplicates`);
  }
}

const articleFiles = filesUnder(path.join(dist, 'posts'), (file) => /posts[/\\][^/\\]+[/\\]index\.html$/.test(file));
if (!articleFiles.length) {
  issues.push('dist/posts: no article build output found');
} else {
  for (const file of articleFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const slug = html.match(/data-post-page-slug=(['"])(.*?)\1/)?.[2];
    const transition = html.match(/view-transition-name:\s*(post-title-[^;'"]+)/)?.[1];
    if (!slug || !transition) {
      issues.push(`${path.relative(dist, file)}: post destination transition metadata is missing`);
      continue;
    }
    const expected = `post-title-${slug.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    if (transition !== expected) {
      issues.push(`${path.relative(dist, file)}: transition name ${transition} != ${expected}`);
    }
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`transition-contract: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

const transitionGzip = transitionBundle
  ? gzipSync(fs.readFileSync(transitionBundle.file)).byteLength
  : 0;
console.log(
  `transition-contract: PASS (${articleFiles.length} article destinations, dynamic Home/Writing/Research sources, ${transitionGzip} B gzip runtime)`,
);

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { POST_CATEGORIES } from '../src/lib/taxonomy.mjs';

const root = process.cwd();
const homeSourcePath = path.join(root, 'src', 'pages', 'index.astro');
const postsSourcePath = path.join(root, 'src', 'pages', 'posts', 'index.astro');
const homeHtmlPath = path.join(root, 'dist', 'index.html');
const postsHtmlPath = path.join(root, 'dist', 'posts', 'index.html');
const issues = [];

function read(file, label) {
  if (!fs.existsSync(file)) {
    issues.push(`${label}: missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function walkHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkHtml(target));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(target);
  }
  return files;
}

const homeSource = read(homeSourcePath, 'Home source');
const postsSource = read(postsSourcePath, 'Writing archive source');

for (const required of [
  "import { POST_CATEGORIES } from '@/lib/taxonomy.mjs';",
  'data-post-category-hashes={postCategoryHashes}',
  "window.location.pathname !== '/'",
  "window.location.replace(`/posts#${category}`)",
  "window.addEventListener('hashchange', redirectLegacyCategoryHash)",
  "document.addEventListener('astro:page-load', redirectLegacyCategoryHash)",
]) {
  if (!homeSource.includes(required)) issues.push(`Home legacy-category redirect contract missing: ${required}`);
}

for (const required of [
  'href={`#${section.id}`}',
  '<section id={section.id}',
  'posts: posts.filter((post) => post.data.category === category)',
]) {
  if (!postsSource.includes(required)) issues.push(`Writing category anchor contract missing: ${required}`);
}

if (fs.existsSync(homeHtmlPath) && fs.existsSync(postsHtmlPath)) {
  const homeHtml = read(homeHtmlPath, 'Rendered Home');
  const postsHtml = read(postsHtmlPath, 'Rendered Writing archive');

  for (const category of POST_CATEGORIES) {
    if (!homeHtml.includes(category)) {
      issues.push(`Rendered Home does not expose legacy category slug: ${category}`);
    }
    if (!postsHtml.includes(`id="${category}"`)) {
      issues.push(`Rendered Writing archive missing category section id: ${category}`);
    }
    if (!postsHtml.includes(`href="#${category}"`)) {
      issues.push(`Rendered Writing archive missing local category link: ${category}`);
    }
  }

  for (const htmlPath of walkHtml(path.join(root, 'dist'))) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    for (const category of POST_CATEGORIES) {
      if (html.includes(`href="/#${category}"`) || html.includes(`href='/#${category}'`)) {
        issues.push(`${path.relative(root, htmlPath)} contains broken root category href /#${category}`);
      }
    }
  }
}

const unique = [...new Set(issues)].sort();
if (unique.length) {
  console.error(`category-route-contract: found ${unique.length} issue(s):`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `category-route-contract: PASS (${POST_CATEGORIES.length} categories; root hashes redirect to /posts#category; rendered category anchors present)`,
);

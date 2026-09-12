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
const categoryNotices = {
  'biblical-studies': '/notices/2026-09-11-biblical-studies-and-policies',
  'finance-industry': '/policies/finance',
  'health-lifestyle': '/policies/health',
};

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

// The archive lists articles; full guidance belongs on the linked policy pages.
for (const repeated of [
  'ContentNotice',
  '성경 아카이브 · 프로젝트 안내',
  '현재 공개된 본문 연구 글은 없습니다.',
]) {
  if (postsSource.includes(repeated)) issues.push(`Writing repeats category guidance: ${repeated}`);
}

// Keep the user-approved, topic-neutral header and its three shared policies.
const writingIntro = postsSource.match(/<header class="writing-intro\b[\s\S]*?<\/header>/)?.[0] || '';
for (const required of [
  '콘텐츠 이용 안내',
  '개인 연구의 입장, 인용과 AI 활용, 저작권·면책 및 수정 원칙을 안내합니다.',
  'href="/policies"',
  'href="/policies/disclaimer"',
  'href="/policies/copyright"',
]) {
  if (!writingIntro.includes(required)) issues.push(`Writing shared header missing: ${required}`);
}
if (writingIntro.includes('성경 연구 아카이브 개설 및 콘텐츠 운영 원칙 선언')) {
  issues.push('Writing shared header must not reintroduce the Bible announcement');
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

  const noticeLinks = [...postsHtml.matchAll(/<a\b[^>]*\bdata-category-notice="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  if (noticeLinks.length !== Object.keys(categoryNotices).length) {
    issues.push('Writing must render exactly three inline category notice links');
  }
  for (const [category, href] of Object.entries(categoryNotices)) {
    const links = noticeLinks.filter((match) => match[1] === category);
    if (links.length !== 1) {
      issues.push(`${category}: expected one inline notice, found ${links.length}`);
      continue;
    }
    const [anchor, , body] = links[0];
    if (!anchor.includes(`href="${href}"`)) issues.push(`${category}: wrong notice destination`);
    if (!anchor.includes('aria-label=')) issues.push(`${category}: missing descriptive accessible label`);
    if (body.replace(/<[^>]*>/g, '').trim() !== '[공지]') issues.push(`${category}: notice label must be [공지]`);
    const noticeHtml = read(path.join(root, 'dist', href.slice(1), 'index.html'), `${category} notice page`);
    for (const common of ['/policies', '/policies/disclaimer', '/policies/copyright']) {
      if (!noticeHtml.includes(`href="${common}"`)) issues.push(`${category}: notice missing shared policy ${common}`);
    }
  }
  for (const repeated of ['성경 글을 읽기 전에', '성경 아카이브 · 프로젝트 안내', '현재 공개된 본문 연구 글은 없습니다.']) {
    if (postsHtml.includes(repeated)) issues.push(`Rendered Writing repeats category guidance: ${repeated}`);
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
  `category-route-contract: PASS (${POST_CATEGORIES.length} categories; root hashes redirect to /posts#category; rendered category anchors present; three inline notices and shared policies verified)`,
);

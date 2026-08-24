import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];

function readDist(relativePath) {
  const file = path.join(dist, relativePath);
  if (!fs.existsSync(file)) {
    issues.push(`${relativePath}: missing from built artifact`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<template\b[\s\S]*?<\/template>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function countTag(html, tag) {
  return (html.match(new RegExp(`<${tag}\\b`, 'gi')) ?? []).length;
}

function requireIncludes(value, needle, label) {
  if (!value.includes(needle)) issues.push(`${label}: missing ${JSON.stringify(needle)}`);
}

const home = readDist('index.html');
const homeText = visibleText(home);

if (homeText.length < 500) {
  issues.push(`index.html: raw HTML exposes only ${homeText.length} visible characters; expected >= 500`);
}
if (countTag(home, 'h1') !== 1) {
  issues.push(`index.html: expected exactly one H1, found ${countTag(home, 'h1')}`);
}
if (countTag(home, 'h2') < 3) {
  issues.push(`index.html: expected at least three H2 headings, found ${countTag(home, 'h2')}`);
}
if (countTag(home, 'h3') < 1) {
  issues.push('index.html: expected at least one H3 below the H2 research outline');
}
for (const marker of [
  'Robotics × AI × Vision',
  'Current research affiliations',
  'One practice.',
  'Latest Writing',
]) {
  requireIncludes(homeText, marker, 'index.html raw content');
}
if (!/<link\b[^>]*rel="alternate"[^>]*type="text\/markdown"[^>]*href="\/index\.md"/i.test(home)) {
  issues.push('index.html: missing discoverable text/markdown alternate for /index.md');
}

const markdownHome = readDist('index.md');
if (!markdownHome.startsWith('# Park JiHo | AI & Robotics Research Notes')) {
  issues.push('index.md: missing expected H1');
}
if (markdownHome.length < 500) {
  issues.push(`index.md: expected >= 500 characters, found ${markdownHome.length}`);
}
for (const marker of ['/research', '/posts', '/llms.txt', '/sitemap-index.xml']) {
  requireIncludes(markdownHome, marker, 'index.md');
}

const notFound = readDist('404.html');
const notFoundText = visibleText(notFound);
if (countTag(notFound, 'h1') !== 1 || countTag(notFound, 'h2') < 1) {
  issues.push('404.html: expected one H1 and an H2 recovery section');
}
if (!/<meta\b[^>]*name="robots"[^>]*content="noindex, nofollow"/i.test(notFound)) {
  issues.push('404.html: expected noindex, nofollow robots metadata');
}
for (const marker of ['/llms.txt', '/sitemap-index.xml', '/research', '/posts']) {
  requireIncludes(notFound, `href="${marker}"`, '404.html recovery links');
}
requireIncludes(notFoundText, 'Agent recovery', '404.html recovery copy');

const llms = readDist('llms.txt');
const llmsLines = llms.split(/\r?\n/);
const firstContentLine = llmsLines.find((line) => line.trim().length > 0) ?? '';
if (!/^# [^#]/.test(firstContentLine)) {
  issues.push('llms.txt: first non-empty line must be a single H1');
}
if ((llms.match(/^# [^#]/gm) ?? []).length !== 1) {
  issues.push('llms.txt: expected exactly one H1');
}
const firstH2Index = llmsLines.findIndex((line) => /^## /.test(line));
const summaryIndex = llmsLines.findIndex((line) => /^> /.test(line));
if (summaryIndex < 0 || (firstH2Index >= 0 && summaryIndex > firstH2Index)) {
  issues.push('llms.txt: blockquote summary must appear before H2 sections');
}
for (const heading of ['## When to use this site', '## How to retrieve content', '## Best-fit topics']) {
  requireIncludes(llms, heading, 'llms.txt');
}
const h2Matches = [...llms.matchAll(/^## ([^\n]+)$/gm)];
for (let index = 0; index < h2Matches.length; index += 1) {
  const match = h2Matches[index];
  const start = (match.index ?? 0) + match[0].length;
  const end = h2Matches[index + 1]?.index ?? llms.length;
  const section = llms.slice(start, end);
  if (!/^\s*- \[[^\]]+\]\(https:\/\/[^)]+\)(?:: .+)?$/m.test(section)) {
    issues.push(`llms.txt: section ${JSON.stringify(match[1])} must contain a Markdown URL list`);
  }
}
if (!/Agents should start with this file/i.test(llms)) {
  issues.push('llms.txt: missing explicit agent calling/retrieval guidance');
}

const jsonLdBlocks = [...home.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
const schemas = [];
for (const match of jsonLdBlocks) {
  try {
    schemas.push(JSON.parse(match[1]));
  } catch (error) {
    issues.push(`index.html: invalid JSON-LD (${error instanceof Error ? error.message : String(error)})`);
  }
}
const organization = schemas.find((schema) => schema?.['@type'] === 'Organization');
if (!organization) {
  issues.push('index.html: Organization JSON-LD missing');
} else {
  const contact = organization.contactPoint;
  if (!contact || contact['@type'] !== 'ContactPoint' || !contact.contactType) {
    issues.push('index.html: Organization contactPoint/contactType incomplete');
  }
  if (contact && !(contact.email || contact.telephone || contact.url)) {
    issues.push('index.html: Organization contactPoint needs a public email, telephone, or URL');
  }
  const address = organization.address;
  if (!address || address['@type'] !== 'PostalAddress' || !address.addressCountry) {
    issues.push('index.html: Organization PostalAddress/addressCountry incomplete');
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`agent-readiness-contract: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `agent-readiness-contract: PASS (raw HTML ${homeText.length} chars; H1/H2/H3 outline; recoverable 404; llms.txt; Markdown alternate; Organization schema)`,
);

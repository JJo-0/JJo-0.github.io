import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const issues = [];

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

function visibleArticleText(html) {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? '';
  return article
    // Formula cards intentionally keep exact TeX in a button data attribute for
    // clipboard use. It is machine-readable metadata, not reader-visible prose.
    // Strip it before the intentionally simple tag remover encounters inequality
    // symbols such as `>` inside a quoted TeX payload.
    .replace(/\sdata-copy-tex="[^"]*"/gi, '')
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code\b[\s\S]*?<\/code>/gi, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<annotation\b[\s\S]*?<\/annotation>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const rawMathPatterns = [
  /\$\$/,
  /\\(?:frac|mathbf|mathbb|sqrt|sum|forall|iff|infty|operatorname|left|right|text|top)(?:\b|\{)/,
];
const authoringResiduePatterns = [
  /블로그\s*초안\s*구성/i,
  /슬라이드별\s*설명\s*초안/i,
  /정리\s*없이\s*올릴\s*생각/i,
  /작성\s*예정/i,
  /업데이트\s*예정/i,
  /\bTODO\b/i,
  /\bTBD\b/i,
];

const postFiles = filesUnder(path.join(dist, 'posts'), (file) =>
  file.endsWith(`${path.sep}index.html`) && !file.includes(`${path.sep}tag${path.sep}`),
);

for (const file of postFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const text = visibleArticleText(html);
  const relative = path.relative(dist, file).replaceAll(path.sep, '/');
  for (const pattern of rawMathPatterns) {
    if (pattern.test(text)) issues.push(`${relative}: raw TeX leaked into rendered article (${pattern})`);
  }
  for (const pattern of authoringResiduePatterns) {
    if (pattern.test(text)) issues.push(`${relative}: unfinished authoring residue detected (${pattern})`);
  }
}

const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!home.includes('src="/image/mouse_surprised.gif"')) {
  issues.push('index.html: homepage mouse GIF is not rendered from /image/mouse_surprised.gif');
}
if (!fs.existsSync(path.join(dist, 'image', 'mouse_surprised.gif'))) {
  issues.push('image/mouse_surprised.gif: homepage GIF missing from built artifact');
}

const visionPath = path.join(dist, 'posts', '2025-02-18-vision', 'index.html');
const linearPath = path.join(dist, 'posts', '2025-05-08-2025-05-08', 'index.html');
const drlPath = path.join(dist, 'posts', '2025-11-08-2025-11-08', 'index.html');

for (const [label, file, minimumMathBlocks] of [
  ['Vision', visionPath, 2],
  ['Linear algebra', linearPath, 8],
]) {
  if (!fs.existsSync(file)) {
    issues.push(`${label}: expected built post is missing`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const count = (html.match(/class="math-display/g) ?? []).length;
  if (count < minimumMathBlocks) {
    issues.push(`${label}: expected at least ${minimumMathBlocks} rendered Math blocks, found ${count}`);
  }
}

if (fs.existsSync(drlPath)) {
  const text = visibleArticleText(fs.readFileSync(drlPath, 'utf8'));
  if (/슬라이드별\s*설명\s*초안/i.test(text)) {
    issues.push('DRL review: slide section still exposes draft wording');
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`rendered-content-quality: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `rendered-content-quality: PASS (${postFiles.length} posts, no raw TeX/high-confidence draft residue, required Math/GIF output present)`,
);

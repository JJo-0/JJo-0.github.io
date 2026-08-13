import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const posts = path.join(root, 'site', 'content', 'posts');
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

function decodeHtml(value) {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');
}

function decodeUri(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function routeExists(urlPath) {
  const clean = decodeUri(urlPath.split(/[?#]/, 1)[0]);
  if (!clean.startsWith('/')) return true;
  if (clean === '/') return fs.existsSync(path.join(dist, 'index.html'));

  const relative = clean.replace(/^\/+/, '');
  const direct = path.join(dist, relative);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return true;

  if (path.extname(relative)) return false;
  if (fs.existsSync(`${direct}.html`)) return true;
  if (fs.existsSync(path.join(direct, 'index.html'))) return true;
  return false;
}

if (!fs.existsSync(dist)) {
  console.error('content-integrity: dist/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

for (const file of filesUnder(dist, (p) => p.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(dist, file);

  // Legacy raw HTML that CommonMark accidentally interpreted as an indented
  // code block. Large HTML-like code samples are overwhelmingly migration
  // regressions in this site; short intentional snippets are ignored.
  for (const match of html.matchAll(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi)) {
    const decoded = decodeHtml(match[1]).trim();
    if (
      decoded.length >= 500 &&
      /^(?:<!--[\s\S]*?-->\s*)*<(?:article|aside|canvas|div|footer|header|ins|main|nav|script|section|style|table)\b/i.test(
        decoded
      )
    ) {
      issues.push(`${relative}: suspicious legacy HTML rendered as code (${decoded.length} chars)`);
    }
  }

  const ids = new Set(
    [...html.matchAll(/\bid=(['"])(.*?)\1/gi)].map((match) => decodeUri(decodeHtml(match[2])))
  );

  for (const match of html.matchAll(/\bhref=(['"])#([^'"]+)\1/gi)) {
    const fragment = decodeUri(decodeHtml(match[2]));
    if (!ids.has(fragment)) issues.push(`${relative}: missing same-page anchor #${fragment}`);
  }

  for (const match of html.matchAll(/\b(?:href|src)=(['"])(\/[^'"]*)\1/gi)) {
    const target = decodeHtml(match[2]);
    if (target.startsWith('//')) continue;
    if (!routeExists(target)) issues.push(`${relative}: missing local target ${target}`);
  }
}

for (const file of filesUnder(posts, (p) => /\.mdx?$/.test(p) && !path.basename(p).startsWith('_'))) {
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(/```[\s\S]*?```/g, '');
  const delimiters = source.match(/(?<!\\)\$\$/g)?.length ?? 0;
  if (delimiters % 2 !== 0) {
    issues.push(`${path.relative(root, file)}: unmatched $$ math delimiter (${delimiters})`);
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length > 0) {
  console.error(`content-integrity: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('content-integrity: PASS');

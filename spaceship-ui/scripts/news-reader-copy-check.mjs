import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function editorialLeaks(source) {
  // A bookkeeping receipt must never replace an article and pass prose checks.
  try {
    const parsed = JSON.parse(source);
    if (parsed && typeof parsed === 'object') return ['non-article-json'];
  } catch { /* Ordinary MDX is not JSON. */ }

  // Frontmatter and fenced examples are not reader prose. Collapsed prose is.
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/^(`{3,}|~{3,})[^\n]*\n[^]*?^\1\s*$/gm, '');
  const rules = [
    ['candidate-state', /\b(?:BACKLOG_CANDIDATE|PEER_REVIEWED_FRONTIER)\b/],
    ['internal-field', /\b(?:rank\/contentId\/status|title\/normalizedTitle|DOI\/arxivId\/officialUrl|evidenceGrade\/score)\b/],
    ['candidate-section', /^#{1,6}\s+후보 기록\s*$/m],
    ['editorial-score', /(?:중요도\s*\d+\s*\+\s*새로움|(?:SELECTED|기준일)[^\n]*\d+\s*\/\s*100)/],
  ];
  return rules.filter(([, pattern]) => pattern.test(body)).map(([id]) => id);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = new URL('../site/content/posts/', import.meta.url);
  const explicit = process.argv.slice(2);
  const current = ['2026-10-20-airscope-wireless-cortex-imaging-news.mdx', '2026-10-20-miopm-multi-immersion-light-sheet-news.mdx', '2026-10-20-multi-ancestry-breast-cancer-gwas-news.mdx'];
  const files = explicit.length ? explicit : fs.readdirSync(directory).filter(name => {
    if (current.includes(name)) return true;
    if (!/^2026-\d{2}-\d{2}.*-news\.mdx$/.test(name) || name.slice(0, 10) < '2026-10-26') return false;
    return !/^draft:\s*true\s*$/m.test(fs.readFileSync(new URL(name, directory), 'utf8').split('---')[1] || '');
  }).map(name => fileURLToPath(new URL(name, directory)));
  let failed = false;
  for (const file of files) {
    const issues = editorialLeaks(fs.readFileSync(file, 'utf8'));
    if (issues.length) { failed = true; console.error(`${file}: ${issues.join(', ')}`); }
  }
  if (failed) process.exitCode = 1;
  else console.log(`Reader-copy check PASS: ${files.length} articles. Source, rights, depth and rendering require separate review.`);
}

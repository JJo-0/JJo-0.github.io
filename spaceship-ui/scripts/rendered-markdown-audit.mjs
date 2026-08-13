import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('dist/posts');
const LITERAL_STRONG = /\*\*[^*\n<>]{1,240}\*\*/g;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function stripNonProse(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, '')
    .replace(/<code\b[\s\S]*?<\/code>/gi, '');
}

const failures = [];
for (const file of walk(ROOT).filter((file) => file.endsWith('.html'))) {
  const rendered = stripNonProse(fs.readFileSync(file, 'utf8'));
  const matches = rendered.match(LITERAL_STRONG);
  if (matches?.length) {
    failures.push({
      file: path.relative(process.cwd(), file),
      matches: [...new Set(matches)].slice(0, 10),
      count: matches.length,
    });
  }
}

if (failures.length) {
  console.error('\nRendered Markdown audit failed: literal **strong** markers remain in prose.');
  for (const failure of failures) {
    console.error(`\n- ${failure.file} (${failure.count})`);
    for (const match of failure.matches) console.error(`  ${match}`);
  }
  process.exit(1);
}

console.log('Rendered Markdown audit passed: no literal **strong** markers in post prose.');

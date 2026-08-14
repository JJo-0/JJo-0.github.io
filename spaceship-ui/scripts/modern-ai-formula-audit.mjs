import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const postPath = path.join(
  root,
  'site/content/posts/mordern-artificial-intelligence.mdx',
);

function formulaRange(prefix, last) {
  return Array.from(
    { length: last },
    (_, index) => `${prefix}-${String(index + 1).padStart(3, '0')}`,
  );
}

const expectedIds = [
  ...formulaRange('MAI2', 39),
  ...formulaRange('MAI3', 46),
  ...formulaRange('MAI4', 28),
  ...formulaRange('MAI5', 17),
  ...formulaRange('MAI6', 44),
  'MAI6-036A',
  ...formulaRange('MAI7', 48),
  'MAI7-018C',
  'MAI7-023C',
  ...formulaRange('MAI8', 13),
];

const text = await readFile(postPath, 'utf8');
const markerPattern = /<!-- formula:\s*([^>\s]+)\s*-->/g;
const componentPattern = /<Math\s+display\s+tex=\{("(?:\\.|[^"\\])*")\}\s*\/>/g;
const markers = [...text.matchAll(markerPattern)];
const components = [...text.matchAll(componentPattern)];
const actualIds = markers.map((match) => match[1]);
const failures = [];

if (!text.includes("series:\n  id: 'modern-artificial-intelligence'\n  order: 1")) {
  failures.push('Part I series metadata is missing or changed.');
}

if (!text.includes("import Math from '@/components/Math.astro';")) {
  failures.push('Native Math component import is missing.');
}

if (text.includes('## 7. 다음 편') || text.includes('2편부터는 선형대수로 들어간다')) {
  failures.push('A split-draft transition remains in the merged Part I post.');
}

if (/[$]begin:math:|[$]end:math:/.test(text)) {
  failures.push('A migrated legacy math artifact remains.');
}

if (text.includes('$$')) {
  failures.push('Legacy $$ display-math delimiters remain; use explicit Math components.');
}

if ([...text].some((character) => {
  const code = character.codePointAt(0) ?? 0;
  return code < 32 && character !== '\n' && character !== '\r';
})) {
  failures.push('Unexpected control character or tab detected.');
}

if (actualIds.length !== expectedIds.length) {
  failures.push(
    `Formula marker count changed: expected ${expectedIds.length}, found ${actualIds.length}.`,
  );
}
if (components.length !== expectedIds.length) {
  failures.push(
    `Math component count changed: expected ${expectedIds.length}, found ${components.length}.`,
  );
}

const actualSet = new Set(actualIds);
if (actualSet.size !== actualIds.length) failures.push('Formula identifiers are not unique.');

const missing = expectedIds.filter((id) => !actualSet.has(id));
const unexpected = actualIds.filter((id) => !expectedIds.includes(id));
if (missing.length) failures.push(`Missing formula IDs: ${missing.join(', ')}`);
if (unexpected.length) failures.push(`Unexpected formula IDs: ${unexpected.join(', ')}`);

for (let index = 0; index < markers.length; index += 1) {
  const marker = markers[index];
  const id = marker[1];
  const start = (marker.index ?? 0) + marker[0].length;
  const end = index + 1 < markers.length ? (markers[index + 1].index ?? text.length) : text.length;
  const region = text.slice(start, end);
  const owned = [...region.matchAll(componentPattern)];

  if (!/^\s*<Math\s+display\s+tex=\{/.test(region)) {
    failures.push(`${id} is not immediately followed by a native display Math component.`);
  }
  if (owned.length !== 1) {
    failures.push(`${id} owns ${owned.length} Math components; expected exactly 1.`);
    continue;
  }

  let formula = '';
  try {
    formula = JSON.parse(owned[0][1]);
  } catch {
    failures.push(`${id} has a malformed serialized formula prop.`);
    continue;
  }

  if (!formula.trim()) failures.push(`${id} has an empty formula body.`);
  if (formula.includes('??')) failures.push(`${id} contains an unresolved placeholder.`);
  if (formula.includes('\uFFFD')) failures.push(`${id} contains a replacement character.`);
}

if (failures.length) {
  console.error('Modern AI formula audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Modern AI formula audit passed: ${actualIds.length} unique native Math components preserve the complete formula ledger.`,
);

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const postPath = path.join(
  root,
  'site/content/posts/mordern-artificial-intelligence.mdx',
);
const hashPath = path.join(root, 'scripts/modern-ai-formula-hashes.json');

function formulaRange(prefix, last) {
  return Array.from(
    { length: last },
    (_, index) => `${prefix}-${String(index + 1).padStart(3, '0')}`,
  );
}

const expectedIdSet = new Set([
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
]);

const text = await readFile(postPath, 'utf8');
const hashManifest = JSON.parse(await readFile(hashPath, 'utf8'));
const manifestIds = hashManifest.formulas.map(({ id }) => id);
const manifestIdSet = new Set(manifestIds);
const expectedHashById = new Map(
  hashManifest.formulas.map(({ id, sha256 }) => [id, sha256]),
);
const markerPattern = /\{\/\*\s*formula:\s*([^*\s]+)\s*\*\/\}/g;
const componentPattern = /<Math\s+display\s+tex=\{("(?:\\.|[^"\\])*")\}\s*\/>/g;
const markers = [...text.matchAll(markerPattern)];
const components = [...text.matchAll(componentPattern)];
const actualIds = markers.map((match) => match[1]);
const actualIdSet = new Set(actualIds);
const failures = [];

if (
  hashManifest.count !== expectedIdSet.size ||
  hashManifest.formulas.length !== expectedIdSet.size
) {
  failures.push('Formula hash manifest count is inconsistent with the expected ledger.');
}
if (manifestIdSet.size !== manifestIds.length) {
  failures.push('Formula hash manifest identifiers are not unique.');
}

const missingFromManifest = [...expectedIdSet].filter((id) => !manifestIdSet.has(id));
const unexpectedInManifest = manifestIds.filter((id) => !expectedIdSet.has(id));
if (missingFromManifest.length) {
  failures.push(`Formula hash manifest is missing IDs: ${missingFromManifest.join(', ')}`);
}
if (unexpectedInManifest.length) {
  failures.push(`Formula hash manifest has unexpected IDs: ${unexpectedInManifest.join(', ')}`);
}

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
if (text.includes('<!-- formula:')) {
  failures.push('Legacy HTML formula markers remain; use MDX comments.');
}
if ([...text].some((character) => {
  const code = character.codePointAt(0) ?? 0;
  return code < 32 && character !== '\n' && character !== '\r';
})) {
  failures.push('Unexpected control character or tab detected.');
}

if (actualIds.length !== manifestIds.length) {
  failures.push(`Formula marker count changed: expected ${manifestIds.length}, found ${actualIds.length}.`);
}
if (components.length !== manifestIds.length) {
  failures.push(`Math component count changed: expected ${manifestIds.length}, found ${components.length}.`);
}
if (actualIdSet.size !== actualIds.length) {
  failures.push('Formula identifiers are not unique in the migrated MDX.');
}

const missingFromSource = manifestIds.filter((id) => !actualIdSet.has(id));
const unexpectedInSource = actualIds.filter((id) => !manifestIdSet.has(id));
if (missingFromSource.length) {
  failures.push(`Missing formula IDs: ${missingFromSource.join(', ')}`);
}
if (unexpectedInSource.length) {
  failures.push(`Unexpected formula IDs: ${unexpectedInSource.join(', ')}`);
}
if (actualIds.join('\n') !== manifestIds.join('\n')) {
  failures.push('Formula marker order differs from the pre-migration source manifest.');
}

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

  let formula;
  try {
    formula = JSON.parse(owned[0][1]);
  } catch {
    failures.push(`${id} has a malformed serialized formula prop.`);
    continue;
  }

  if (!formula.trim()) failures.push(`${id} has an empty formula body.`);
  if (formula.includes('??')) failures.push(`${id} contains an unresolved placeholder.`);
  if (formula.includes('\uFFFD')) failures.push(`${id} contains a replacement character.`);

  const actualHash = createHash('sha256').update(formula.trim(), 'utf8').digest('hex');
  const expectedHash = expectedHashById.get(id);
  if (!expectedHash) failures.push(`${id} is missing from the pre-migration formula hash ledger.`);
  else if (actualHash !== expectedHash) failures.push(`${id} LaTeX content changed during/after MDX migration.`);
}

if (failures.length) {
  console.error('Modern AI formula audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Modern AI formula audit passed: ${actualIds.length} native Math components match the pre-migration SHA-256 formula ledger.`,
);

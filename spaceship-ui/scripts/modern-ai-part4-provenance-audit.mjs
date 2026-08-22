import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data', 'modern-ai-part4');
const issues = [];
const read = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
const content = read('content-ledger.json');
const pages = read('page-ledger.json');
const provenance = read('content-provenance.json');
const sourceAudit = read('source-audit.json');

function fail(message) { issues.push(message); }
function numberOf(id) {
  const match = /^P4-C(\d{3})$/.exec(id ?? '');
  return match ? Number(match[1]) : NaN;
}
function setEqual(a, b) { return a.size === b.size && [...a].every((value) => b.has(value)); }
function range(from, to) {
  const start = numberOf(from), end = numberOf(to);
  return Array.from({ length: end - start + 1 }, (_, index) => `P4-C${String(start + index).padStart(3, '0')}`);
}

const expectedLayers = [
  { id: 'pdf-source', from: 'P4-C001', to: 'P4-C109', count: 109, effectiveStatus: 'source-reconstructed', pdfCoverage: true },
  { id: 'editorial-audit', from: 'P4-C110', to: 'P4-C129', count: 20, effectiveStatus: 'editorial-audit', pdfCoverage: false },
  { id: 'research-update', from: 'P4-C130', to: 'P4-C151', count: 22, effectiveStatus: 'research-update', pdfCoverage: false, asOf: '2026-08-18' },
];
if (provenance.schemaVersion !== 1 || provenance.part !== 4 || provenance.totalContentRecords !== 151) fail('content provenance header mismatch');
if (JSON.stringify(provenance.layers) !== JSON.stringify(expectedLayers)) fail('content provenance layer contract mismatch');

const allIds = content.content.map((block) => block.contentId);
if (allIds.length !== 151 || new Set(allIds).size !== 151) fail('content inventory must contain 151 unique IDs');
const expectedAll = new Set(range('P4-C001', 'P4-C151'));
if (!setEqual(new Set(allIds), expectedAll)) fail('content inventory ID coverage mismatch');

const sourceIds = new Set(range('P4-C001', 'P4-C109'));
const editorialIds = new Set(range('P4-C110', 'P4-C129'));
const researchIds = new Set(range('P4-C130', 'P4-C151'));
const mappedPageIds = pages.pages.flatMap((page) => page.contentIds ?? []);
if (mappedPageIds.length !== 109 || new Set(mappedPageIds).size !== 109) fail('PDF page ledger must contain exactly 109 unique source-content IDs');
if (!setEqual(new Set(mappedPageIds), sourceIds)) fail('PDF page ledger source-content set mismatch');
for (const id of mappedPageIds) {
  if (editorialIds.has(id) || researchIds.has(id)) fail(`${id}: non-source block leaked into PDF page coverage`);
}
if (pages.schemaVersion !== 2 || !String(pages.coveragePolicy ?? '').includes('PDF source-only')) fail('page ledger does not declare source-only coverage');

if (sourceAudit.counts?.sourceContent !== 109 || sourceAudit.counts?.editorialContent !== 20 || sourceAudit.counts?.researchContent !== 22) fail('source-audit content layer counts mismatch');
if (sourceAudit.researchUpdateDate !== '2026-08-18') fail('research update date mismatch');

const unique = [...new Set(issues)].sort();
if (unique.length) {
  console.error(`modern-ai-part4-provenance-audit: found ${unique.length} issue(s):`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log('modern-ai-part4-provenance-audit: PASS (109 PDF-source blocks; 20 editorial-audit blocks; 22 research-update blocks; zero non-source page coverage)');

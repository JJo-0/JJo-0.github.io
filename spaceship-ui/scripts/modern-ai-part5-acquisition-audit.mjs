import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const ledgerPath = path.join(root, 'src', 'data', 'modern-ai-part5', 'source-acquisition.json');
const requireComplete = process.argv.includes('--require-complete');
const issues = [];
const fail = (message) => issues.push(message);

if (!fs.existsSync(ledgerPath)) {
  console.error('modern-ai-part5-acquisition-audit: source-acquisition.json missing');
  process.exit(1);
}

const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const pages = ledger.pages ?? [];
const allowed = new Set(ledger.allowedStatuses ?? []);
const expectedPages = 18;

if (ledger.schemaVersion !== 1 || ledger.part !== 5) fail('ledger header mismatch');
if (ledger.source?.title !== '5_Ch5-Image classification.pdf') fail('source title mismatch');
if (ledger.source?.lectureTitle !== 'ECE5992: Modern Artificial Intelligence') fail('lecture title mismatch');
if (ledger.source?.lectureDate !== '2025-03-19') fail('lecture date mismatch');
if (ledger.source?.expectedPages !== expectedPages) fail('expected page count mismatch');
if (pages.length !== expectedPages) fail(`page inventory ${pages.length} != ${expectedPages}`);
if (JSON.stringify(pages.map((page) => page.pdfPage)) !== JSON.stringify(Array.from({ length: expectedPages }, (_, index) => index + 1))) fail('pages must enumerate 1..18 contiguously');
if (new Set(pages.map((page) => page.pdfPage)).size !== expectedPages) fail('duplicate page numbers');

for (const page of pages) {
  if (!allowed.has(page.status)) fail(`page ${page.pdfPage}: unknown status ${page.status}`);
  if (!Array.isArray(page.observedSections) || !Array.isArray(page.evidenceFragments) || !Array.isArray(page.candidateFormulaFragments)) fail(`page ${page.pdfPage}: malformed evidence arrays`);
  if (page.status === 'unverified' && !page.blocker) fail(`page ${page.pdfPage}: unverified without blocker`);
  if (page.status === 'rendered-inspected' && page.renderedInspection !== true) fail(`page ${page.pdfPage}: rendered-inspected without renderedInspection=true`);
  if (page.status !== 'rendered-inspected' && page.renderedInspection === true) fail(`page ${page.pdfPage}: renderedInspection cannot be true for ${page.status}`);
}

const counts = Object.fromEntries([...allowed].map((status) => [status, pages.filter((page) => page.status === status).length]));
const unverifiedPages = pages.filter((page) => page.status === 'unverified').map((page) => page.pdfPage);
if (JSON.stringify(unverifiedPages) !== JSON.stringify([10, 14])) fail(`current unverified pages must be exactly [10,14], got [${unverifiedPages.join(',')}]`);
if (counts['snippet-only'] !== 16) fail(`snippet-only count ${counts['snippet-only']} != 16`);
if (counts['rendered-inspected'] !== 0) fail(`initial rendered-inspected count ${counts['rendered-inspected']} != 0`);
if (ledger.retrievalState?.sourceComplete !== false || ledger.retrievalState?.canPublish !== false) fail('acquisition ledger must remain fail-closed while incomplete');

if (requireComplete) {
  if (!/^[0-9a-f]{64}$/.test(ledger.source?.sha256 ?? '')) fail('source SHA-256 missing');
  if (pages.some((page) => page.status !== 'rendered-inspected')) fail('not all 18 pages are rendered-inspected');
  if (ledger.completionGate?.currentBlockers?.length) fail('completion blockers remain');
  if (ledger.retrievalState?.sourceComplete !== true || ledger.retrievalState?.canPublish !== true) fail('sourceComplete/canPublish not promoted');
}

const unique = [...new Set(issues)].sort();
if (unique.length) {
  console.error(`modern-ai-part5-acquisition-audit: FAIL (${unique.length})`);
  for (const issue of unique) console.error(`  - ${issue}`);
  process.exit(1);
}

if (requireComplete) {
  console.log('modern-ai-part5-acquisition-audit: READY (18/18 rendered-inspected; SHA-256 present; zero blockers)');
} else {
  console.log(`modern-ai-part5-acquisition-audit: PASS inventory-only (${expectedPages} pages; ${counts['snippet-only']} snippet-only; ${counts['unverified']} unverified; ${counts['rendered-inspected']} rendered-inspected; publish gate closed)`);
}

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const assetRoot = 'site/assets/assets/interactive/semiconductor-universe';
const registryPath = `${assetRoot}/company-links-korea.json`;
const runtimePath = `${assetRoot}/company-link-runtime.js`;
const cssPath = `${assetRoot}/company-links.css`;
const loaderPath = `${assetRoot}/graph-loader.js`;
const graphPath = `${assetRoot}/graph.json`;
const issues = [];

function read(relative) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    issues.push(`${relative}: required file missing`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

function requireMarkers(source, filename, markers) {
  for (const marker of markers) {
    if (!source.includes(marker)) issues.push(`${filename}: missing ${marker}`);
  }
}

let registry;
let manifest;
try {
  registry = JSON.parse(read(registryPath));
} catch (error) {
  issues.push(`${registryPath}: invalid JSON (${error.message})`);
}
try {
  manifest = JSON.parse(read(graphPath));
} catch (error) {
  issues.push(`${graphPath}: invalid JSON (${error.message})`);
}

const runtime = read(runtimePath);
const css = read(cssPath);
const loader = read(loaderPath);

requireMarkers(runtime, runtimePath, [
  "'./company-links-korea.json'",
  'Naver 증권',
  'Toss 증권',
  'FnGuide / 컨센서스',
  'noopener noreferrer',
  'MutationObserver',
  '#node-id',
]);
requireMarkers(loader, loaderPath, [
  "stylesheet.href = './company-links.css'",
  "runtime.src = './company-link-runtime.js'",
  'data-semiconductor-company-links',
]);
requireMarkers(css, cssPath, ['.company-link-panel', '.company-link-actions', ':focus-visible']);

if (registry) {
  if (registry.version !== 1) issues.push(`${registryPath}: version must be 1`);
  if (registry.checkedAt !== '2026-08-21') issues.push(`${registryPath}: checkedAt must be 2026-08-21`);

  const expectedTemplates = {
    naver: 'https://finance.naver.com/item/main.naver?code={ticker}',
    toss: 'https://www.tossinvest.com/stocks/A{ticker}',
    fnguide: 'https://wcomp.fnguide.com/CompanyInfo/Snapshot?cmp_cd={ticker}',
  };
  for (const [key, value] of Object.entries(expectedTemplates)) {
    if (registry.urlTemplates?.[key] !== value) {
      issues.push(`${registryPath}: ${key} URL template changed without review`);
    }
  }

  const entries = Object.entries(registry.companies || {});
  if (entries.length !== 25) issues.push(`${registryPath}: expected 25 Korean listed company mappings, found ${entries.length}`);

  const tickers = new Set();
  for (const [nodeId, profile] of entries) {
    if (!/^CO\.[A-Z0-9-]+$/.test(nodeId)) issues.push(`${nodeId}: invalid company node ID`);
    if (!/^\d{6}$/.test(profile?.ticker || '')) issues.push(`${nodeId}: ticker must be six digits`);
    if (!['KOSPI', 'KOSDAQ'].includes(profile?.exchange)) issues.push(`${nodeId}: unsupported exchange ${profile?.exchange}`);
    if (!profile?.nameKo) issues.push(`${nodeId}: Korean display name missing`);
    if (tickers.has(profile?.ticker)) issues.push(`${nodeId}: duplicate ticker ${profile?.ticker}`);
    tickers.add(profile?.ticker);
  }

  const required = {
    'CO.SAMSUNG-ELECTRONICS': '005930',
    'CO.SK-HYNIX': '000660',
    'CO.HANMI-SEMICONDUCTOR': '042700',
    'CO.HPSP': '403870',
    'CO.FST': '036810',
    'CO.DEVICEENG': '187870',
  };
  for (const [nodeId, ticker] of Object.entries(required)) {
    if (registry.companies?.[nodeId]?.ticker !== ticker) issues.push(`${nodeId}: expected ticker ${ticker}`);
  }
  if (registry.companies?.['CO.DEVICEENG']?.nameKo !== '디바이스') {
    issues.push('CO.DEVICEENG: current listed name must preserve 2025 rename to 디바이스');
  }
}

if (registry && manifest) {
  const nodeRows = [];
  for (const filename of manifest.nodeFiles || []) {
    try {
      const rows = JSON.parse(read(`${assetRoot}/${filename}`));
      if (!Array.isArray(rows)) throw new Error('chunk is not an array');
      nodeRows.push(...rows);
    } catch (error) {
      issues.push(`${filename}: invalid node chunk (${error.message})`);
    }
  }

  const byId = new Map(nodeRows.map((row) => [row?.[0], row]));
  const companyGroupIndex = manifest.groups?.indexOf('COMPANY');
  const koreaRegionIndex = manifest.regions?.indexOf('Korea');
  for (const nodeId of Object.keys(registry.companies || {})) {
    const row = byId.get(nodeId);
    if (!row) {
      issues.push(`${nodeId}: mapped company does not exist in atlas graph`);
      continue;
    }
    if (row[5] !== companyGroupIndex) issues.push(`${nodeId}: mapped node is not in COMPANY group`);
    if (row[14] !== koreaRegionIndex) issues.push(`${nodeId}: mapped node is not in Korea region`);
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`semiconductor-company-links-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('semiconductor-company-links-audit: PASS (25 Korean listed company nodes; Naver/Toss/FnGuide links; KRX ticker and Korea-region integrity verified)');

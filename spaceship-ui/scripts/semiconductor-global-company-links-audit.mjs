import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const assetRoot = 'site/assets/assets/interactive/semiconductor-universe';
const registryPath = `${assetRoot}/company-links-global-listed.json`;
const koreaListedPath = `${assetRoot}/company-links-korea.json`;
const koreaPrivatePath = `${assetRoot}/company-links-korea-private.json`;
const runtimePath = `${assetRoot}/company-link-runtime.js`;
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

function parse(relative) {
  try {
    return JSON.parse(read(relative));
  } catch (error) {
    issues.push(`${relative}: invalid JSON (${error.message})`);
    return null;
  }
}

function requireMarkers(source, filename, markers) {
  for (const marker of markers) {
    if (!source.includes(marker)) issues.push(`${filename}: missing ${marker}`);
  }
}

const registry = parse(registryPath);
const koreaListed = parse(koreaListedPath);
const koreaPrivate = parse(koreaPrivatePath);
const manifest = parse(graphPath);
const runtime = read(runtimePath);

const expected = {
  'CO.ASML-HOLDING-N-V': ['Netherlands', 'Euronext Amsterdam', 'ASML', 'AMS'],
  'CO.APPLIED-MATERIALS': ['United States', 'NASDAQ', 'AMAT', 'NASDAQ'],
  'CO.LAM-RESEARCH': ['United States', 'NASDAQ', 'LRCX', 'NASDAQ'],
  'CO.TOKYO-ELECTRON': ['Japan', 'Tokyo Stock Exchange', '8035', 'TYO'],
  'CO.KLA-CORPORATION': ['United States', 'NASDAQ', 'KLAC', 'NASDAQ'],
  'CO.ASM-INTERNATIONAL': ['Netherlands', 'Euronext Amsterdam', 'ASM', 'AMS'],
  'CO.SCREEN-HOLDINGS': ['Japan', 'Tokyo Stock Exchange', '7735', 'TYO'],
  'CO.DISCO-CORPORATION': ['Japan', 'Tokyo Stock Exchange', '6146', 'TYO'],
  'CO.BE-SEMICONDUCTOR-INDUSTRIES': ['Netherlands', 'Euronext Amsterdam', 'BESI', 'AMS'],
  'CO.ADVANTEST': ['Japan', 'Tokyo Stock Exchange', '6857', 'TYO'],
  'CO.TERADYNE': ['United States', 'NASDAQ', 'TER', 'NASDAQ'],
  'CO.HOYA': ['Japan', 'Tokyo Stock Exchange', '7741', 'TYO'],
  'CO.AGC': ['Japan', 'Tokyo Stock Exchange', '5201', 'TYO'],
  'CO.TOKYO-OHKA-KOGYO': ['Japan', 'Tokyo Stock Exchange', '4186', 'TYO'],
  'CO.SHIN-ETSU-CHEMICAL': ['Japan', 'Tokyo Stock Exchange', '4063', 'TYO'],
  'CO.MERCK-KGAA': ['Germany', 'Xetra', 'MRK', 'ETR'],
  'CO.LINDE': ['Global', 'NASDAQ', 'LIN', 'NASDAQ'],
  'CO.AIR-LIQUIDE': ['France', 'Euronext Paris', 'AI', 'EPA'],
  'CO.TSMC': ['Taiwan', 'Taiwan Stock Exchange', '2330', 'TPE'],
  'CO.INTEL': ['United States', 'NASDAQ', 'INTC', 'NASDAQ'],
  'CO.MICRON-TECHNOLOGY': ['United States', 'NASDAQ', 'MU', 'NASDAQ'],
  'CO.NVIDIA': ['United States', 'NASDAQ', 'NVDA', 'NASDAQ'],
  'CO.AMD': ['United States', 'NASDAQ', 'AMD', 'NASDAQ'],
};

const excludedNonListedNodes = [
  'CO.CARL-ZEISS-SMT',
  'CO.TRUMPF',
  'CO.JSR-INPRIA',
  'CO.AJINOMOTO-FINE-TECHNO',
];

const allowedOfficialHosts = {
  'CO.ASML-HOLDING-N-V': ['asml.com'],
  'CO.APPLIED-MATERIALS': ['appliedmaterials.com'],
  'CO.LAM-RESEARCH': ['lamresearch.com'],
  'CO.TOKYO-ELECTRON': ['tel.com'],
  'CO.KLA-CORPORATION': ['kla.com'],
  'CO.ASM-INTERNATIONAL': ['asm.com'],
  'CO.SCREEN-HOLDINGS': ['screen.co.jp'],
  'CO.DISCO-CORPORATION': ['disco.co.jp'],
  'CO.BE-SEMICONDUCTOR-INDUSTRIES': ['besi.com'],
  'CO.ADVANTEST': ['advantest.com'],
  'CO.TERADYNE': ['teradyne.com'],
  'CO.HOYA': ['hoya.com'],
  'CO.AGC': ['agc.com'],
  'CO.TOKYO-OHKA-KOGYO': ['tok.co.jp'],
  'CO.SHIN-ETSU-CHEMICAL': ['shinetsu.co.jp'],
  'CO.MERCK-KGAA': ['merckgroup.com'],
  'CO.LINDE': ['linde.com', 'linde-gas.com'],
  'CO.AIR-LIQUIDE': ['airliquide.com'],
  'CO.TSMC': ['tsmc.com'],
  'CO.INTEL': ['intc.com', 'intel.com'],
  'CO.MICRON-TECHNOLOGY': ['micron.com'],
  'CO.NVIDIA': ['nvidia.com'],
  'CO.AMD': ['amd.com'],
};

requireMarkers(runtime, runtimePath, [
  "'./company-links-global-listed.json'",
  'globalListedRegistryUrl',
  'globalListedRegistry',
  'renderGlobalListedProfile',
  'GLOBAL LISTED COMPANY',
  'primary listing',
  'Promise.allSettled',
  'generated: resource.availability === \'GENERATED\'',
  'noopener noreferrer',
]);
if (/location\.(?:href|assign|replace)\s*[=(]/.test(runtime)) {
  issues.push(`${runtimePath}: selecting a node must not force external navigation`);
}

if (registry) {
  if (registry.version !== 1) issues.push(`${registryPath}: version must be 1`);
  if (registry.checkedAt !== '2026-08-21') issues.push(`${registryPath}: checkedAt must be 2026-08-21`);
  if (registry.marketProvider !== 'Google Finance') issues.push(`${registryPath}: marketProvider must be Google Finance`);

  const entries = Object.entries(registry.companies || {});
  if (entries.length !== 23) issues.push(`${registryPath}: expected 23 global listed companies, found ${entries.length}`);
  const actualIds = new Set(entries.map(([id]) => id));
  for (const id of Object.keys(expected)) if (!actualIds.has(id)) issues.push(`${registryPath}: required ${id} missing`);
  for (const id of actualIds) if (!(id in expected)) issues.push(`${registryPath}: unexpected global listed node ${id}`);
  for (const id of excludedNonListedNodes) if (actualIds.has(id)) issues.push(`${id}: non-listed/subsidiary node must not be mapped to parent-company stock`);

  let resourceCount = 0;
  let marketCount = 0;
  let degradedCount = 0;
  for (const [nodeId, profile] of entries) {
    const [atlasRegion, exchange, ticker, marketCode] = expected[nodeId] || [];
    if (profile?.atlasRegion !== atlasRegion) issues.push(`${nodeId}: expected atlasRegion ${atlasRegion}, found ${profile?.atlasRegion}`);
    if (profile?.exchange !== exchange) issues.push(`${nodeId}: expected exchange ${exchange}, found ${profile?.exchange}`);
    if (profile?.ticker !== ticker) issues.push(`${nodeId}: expected ticker ${ticker}, found ${profile?.ticker}`);
    if (profile?.marketCode !== marketCode) issues.push(`${nodeId}: expected marketCode ${marketCode}, found ${profile?.marketCode}`);
    if (!profile?.name || !profile?.country) issues.push(`${nodeId}: name/country missing`);

    const resources = profile?.resources;
    if (!Array.isArray(resources) || resources.length !== 3) {
      issues.push(`${nodeId}: exactly 3 resources (IR, PRODUCT, MARKET) are required`);
      continue;
    }
    const roles = resources.map((resource) => resource.role).sort();
    if (JSON.stringify(roles) !== JSON.stringify(['IR', 'MARKET', 'PRODUCT'])) {
      issues.push(`${nodeId}: resource roles must be exactly IR, PRODUCT, MARKET`);
    }

    for (const [index, resource] of resources.entries()) {
      resourceCount += 1;
      if (resource?.checkedAt !== '2026-08-21') issues.push(`${nodeId}[${index}]: checkedAt must be 2026-08-21`);
      if (!resource?.title || !resource?.publisher) issues.push(`${nodeId}[${index}]: title/publisher missing`);
      let url;
      try {
        url = new URL(resource?.url);
      } catch {
        issues.push(`${nodeId}[${index}]: invalid URL ${resource?.url}`);
        continue;
      }
      if (url.protocol !== 'https:') issues.push(`${nodeId}[${index}]: HTTPS required`);

      if (resource.role === 'MARKET') {
        marketCount += 1;
        if (resource.type !== 'MARKET') issues.push(`${nodeId}[${index}]: MARKET role must use MARKET type`);
        if (resource.availability !== 'GENERATED') issues.push(`${nodeId}[${index}]: market deep-link must be marked GENERATED`);
        const expectedUrl = `https://www.google.com/finance/quote/${ticker}:${marketCode}`;
        if (resource.url !== expectedUrl) issues.push(`${nodeId}[${index}]: expected market URL ${expectedUrl}`);
      } else {
        if (resource.type !== 'OFFICIAL') issues.push(`${nodeId}[${index}]: ${resource.role} must use OFFICIAL type`);
        if (!['VERIFIED', 'DEGRADED'].includes(resource.availability)) issues.push(`${nodeId}[${index}]: official link availability must be VERIFIED or DEGRADED`);
        if (resource.availability === 'DEGRADED') degradedCount += 1;
        const allowed = allowedOfficialHosts[nodeId] || [];
        const hostAllowed = allowed.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
        if (!hostAllowed) issues.push(`${nodeId}[${index}]: official URL host ${url.hostname} outside allowlist`);
      }
    }
  }

  if (resourceCount !== 69) issues.push(`${registryPath}: expected 69 resources, found ${resourceCount}`);
  if (marketCount !== 23) issues.push(`${registryPath}: expected 23 market resources, found ${marketCount}`);
  if (degradedCount !== 1) issues.push(`${registryPath}: expected exactly 1 DEGRADED official link, found ${degradedCount}`);

  const asmlSecondary = registry.companies?.['CO.ASML-HOLDING-N-V']?.secondaryListings || [];
  if (!asmlSecondary.some((listing) => listing.exchange === 'NASDAQ' && listing.ticker === 'ASML')) {
    issues.push('CO.ASML-HOLDING-N-V: NASDAQ secondary listing provenance missing');
  }
  const tsmcSecondary = registry.companies?.['CO.TSMC']?.secondaryListings || [];
  if (!tsmcSecondary.some((listing) => listing.exchange === 'NYSE' && listing.ticker === 'TSM' && listing.instrument === 'ADR')) {
    issues.push('CO.TSMC: NYSE TSM ADR secondary listing provenance missing');
  }
}

if (registry && koreaListed && koreaPrivate) {
  const globalIds = new Set(Object.keys(registry.companies || {}));
  for (const [label, other] of [['Korea listed', koreaListed], ['Korea private', koreaPrivate]]) {
    for (const id of Object.keys(other.companies || {})) {
      if (globalIds.has(id)) issues.push(`${id}: global registry overlaps ${label} registry`);
    }
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
  for (const [nodeId, profile] of Object.entries(registry.companies || {})) {
    const row = byId.get(nodeId);
    if (!row) {
      issues.push(`${nodeId}: mapped company does not exist in atlas graph`);
      continue;
    }
    if (row[5] !== companyGroupIndex) issues.push(`${nodeId}: mapped node is not in COMPANY group`);
    const regionIndex = manifest.regions?.indexOf(profile.atlasRegion);
    if (regionIndex < 0) issues.push(`${nodeId}: unknown atlas region ${profile.atlasRegion}`);
    else if (row[14] !== regionIndex) issues.push(`${nodeId}: atlas region mismatch (${profile.atlasRegion})`);
  }
  for (const id of excludedNonListedNodes) {
    if (!byId.has(id)) issues.push(`${id}: excluded node disappeared from graph; exclusion audit must be reviewed`);
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`semiconductor-global-company-links-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('semiconductor-global-company-links-audit: PASS (23 global listed nodes; 46 official IR/product resources; 23 primary-listing market links; 4 non-listed/subsidiary nodes excluded)');

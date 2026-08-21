import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const assetRoot = 'site/assets/assets/interactive/semiconductor-universe';
const privateRegistryPath = `${assetRoot}/company-links-korea-private.json`;
const listedRegistryPath = `${assetRoot}/company-links-korea.json`;
const runtimePath = `${assetRoot}/company-link-runtime.js`;
const cssPath = `${assetRoot}/company-links.css`;
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

const registrySource = read(privateRegistryPath);
const registry = parse(privateRegistryPath);
const listedRegistry = parse(listedRegistryPath);
const manifest = parse(graphPath);
const runtime = read(runtimePath);
const css = read(cssPath);

const expectedIds = [
  'CO.SK-SILTRON',
  'CO.SK-SPECIALTY',
  'CO.SEMES',
  'CO.VALUE-ENGINEERING',
  'CO.SEOJIN-ELECTRON',
  'CO.CANTOPS',
  'CO.LSE',
  'CO.SUNJE',
  'CO.MMT',
  'CO.MMP',
  'CO.3SLINE',
  'CO.GAUSS-LABS',
  'CO.WOOWON-TECHNOLOGY',
  'CO.SEMICS',
];
const allowedClasses = new Set(['PRIVATE', 'IPO_STAGE', 'STARTUP']);
const allowedRoles = new Set(['COMPANY', 'PRODUCT', 'IR', 'DISCLOSURE', 'NEWSROOM']);
const allowedAvailability = new Set(['VERIFIED', 'DEGRADED']);
const forbiddenMarketHosts = ['finance.naver.com', 'tossinvest.com', 'fnguide.com', 'ustock.naver.com'];

requireMarkers(runtime, runtimePath, [
  "'./company-links-korea.json'",
  "'./company-links-korea-private.json'",
  'renderMarketProfile',
  'renderOfficialProfile',
  'Naver 증권',
  'Toss 증권',
  'FnGuide / 컨센서스',
  'OFFICIAL COMPANY RESOURCES',
  'noopener noreferrer',
  'Promise.allSettled',
  'dataset.resourceRole',
]);
if (/location\.(?:href|assign|replace)\s*[=(]/.test(runtime)) {
  issues.push(`${runtimePath}: selecting a node must not force external navigation`);
}
requireMarkers(css, cssPath, [
  '.company-link-actions.is-resource-grid',
  '.company-link-resource-meta',
  "data-resource-availability='degraded'",
  ':focus-visible',
]);

if (registry) {
  if (registry.version !== 1) issues.push(`${privateRegistryPath}: version must be 1`);
  if (registry.checkedAt !== '2026-08-21') issues.push(`${privateRegistryPath}: checkedAt must be 2026-08-21`);
  const entries = Object.entries(registry.companies || {});
  if (entries.length !== expectedIds.length) {
    issues.push(`${privateRegistryPath}: expected ${expectedIds.length} companies, found ${entries.length}`);
  }

  const actualIds = new Set(entries.map(([id]) => id));
  for (const id of expectedIds) if (!actualIds.has(id)) issues.push(`${privateRegistryPath}: required ${id} missing`);
  for (const id of actualIds) if (!expectedIds.includes(id)) issues.push(`${privateRegistryPath}: unexpected PR-2 company ${id}`);

  let resourceCount = 0;
  let degradedCount = 0;
  for (const [nodeId, profile] of entries) {
    if (!profile?.nameKo) issues.push(`${nodeId}: nameKo missing`);
    if (!allowedClasses.has(profile?.companyClass)) issues.push(`${nodeId}: invalid companyClass ${profile?.companyClass}`);
    if ('ticker' in (profile || {}) || 'exchange' in (profile || {})) {
      issues.push(`${nodeId}: private registry must not contain stock-market identity fields`);
    }
    if (!Array.isArray(profile?.resources) || profile.resources.length < 1) {
      issues.push(`${nodeId}: at least one official resource is required`);
      continue;
    }

    for (const [index, resource] of profile.resources.entries()) {
      resourceCount += 1;
      if (resource?.type !== 'OFFICIAL') issues.push(`${nodeId}[${index}]: PR-2 resource type must be OFFICIAL`);
      if (!allowedRoles.has(resource?.role)) issues.push(`${nodeId}[${index}]: invalid role ${resource?.role}`);
      if (!resource?.title || !resource?.publisher) issues.push(`${nodeId}[${index}]: title/publisher missing`);
      if (resource?.checkedAt !== '2026-08-21') issues.push(`${nodeId}[${index}]: checkedAt must be 2026-08-21`);
      if (!allowedAvailability.has(resource?.availability)) issues.push(`${nodeId}[${index}]: invalid availability ${resource?.availability}`);
      if (resource?.availability === 'DEGRADED') degradedCount += 1;
      let url;
      try {
        url = new URL(resource?.url);
      } catch {
        issues.push(`${nodeId}[${index}]: invalid URL ${resource?.url}`);
        continue;
      }
      if (!['http:', 'https:'].includes(url.protocol)) issues.push(`${nodeId}[${index}]: unsupported protocol ${url.protocol}`);
      if (forbiddenMarketHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
        issues.push(`${nodeId}[${index}]: market-data URL forbidden in private-company registry (${url.hostname})`);
      }
    }
  }

  if (resourceCount !== 33) issues.push(`${privateRegistryPath}: expected 33 official resources, found ${resourceCount}`);
  if (degradedCount !== 5) issues.push(`${privateRegistryPath}: expected 5 explicitly DEGRADED resources, found ${degradedCount}`);

  const rolesFor = (id) => new Set((registry.companies?.[id]?.resources || []).map((resource) => resource.role));
  for (const [id, requiredRoles] of [
    ['CO.SK-SILTRON', ['COMPANY', 'PRODUCT', 'IR', 'NEWSROOM']],
    ['CO.SK-SPECIALTY', ['COMPANY', 'PRODUCT', 'DISCLOSURE']],
    ['CO.SEMES', ['COMPANY', 'PRODUCT', 'NEWSROOM']],
    ['CO.LSE', ['COMPANY', 'PRODUCT', 'IR']],
    ['CO.GAUSS-LABS', ['COMPANY', 'PRODUCT']],
  ]) {
    const roles = rolesFor(id);
    for (const role of requiredRoles) if (!roles.has(role)) issues.push(`${id}: required ${role} resource missing`);
  }

  if (registry.companies?.['CO.LSE']?.companyClass !== 'IPO_STAGE') issues.push('CO.LSE: must remain IPO_STAGE in PR-2');
  if (registry.companies?.['CO.GAUSS-LABS']?.companyClass !== 'STARTUP') issues.push('CO.GAUSS-LABS: must remain STARTUP in PR-2');

  const mmpUrls = (registry.companies?.['CO.MMP']?.resources || []).map((resource) => resource.url).join('\n');
  if (!mmpUrls.includes('mmpkorea.com')) issues.push('CO.MMP: correct semiconductor domain mmpkorea.com missing');
  if (mmpUrls.includes('mmp.co.kr')) issues.push('CO.MMP: unrelated M&A domain mmp.co.kr is forbidden');
}

for (const forbidden of ['finance.naver.com', 'tossinvest.com', 'fnguide.com', '"ticker"', '"exchange"']) {
  if (registrySource.includes(forbidden)) issues.push(`${privateRegistryPath}: forbidden private-company market marker ${forbidden}`);
}

if (registry && listedRegistry) {
  const listedIds = new Set(Object.keys(listedRegistry.companies || {}));
  for (const nodeId of Object.keys(registry.companies || {})) {
    if (listedIds.has(nodeId)) issues.push(`${nodeId}: PR-1 listed and PR-2 private registries must be disjoint`);
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
  const koreaUsRegionIndex = manifest.regions?.indexOf('Korea / United States');
  for (const nodeId of Object.keys(registry.companies || {})) {
    const row = byId.get(nodeId);
    if (!row) {
      issues.push(`${nodeId}: mapped company does not exist in atlas graph`);
      continue;
    }
    if (row[5] !== companyGroupIndex) issues.push(`${nodeId}: mapped node is not in COMPANY group`);
    const expectedRegion = nodeId === 'CO.GAUSS-LABS' ? koreaUsRegionIndex : koreaRegionIndex;
    if (row[14] !== expectedRegion) issues.push(`${nodeId}: atlas region does not match PR-2 registry scope`);
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`semiconductor-private-company-links-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('semiconductor-private-company-links-audit: PASS (14 private/unlisted/IPO/startup nodes; 33 official resources; listed-market registries disjoint; degraded links explicit)');

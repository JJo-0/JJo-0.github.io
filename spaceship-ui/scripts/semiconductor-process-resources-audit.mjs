import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const assetRoot = 'site/assets/assets/interactive/semiconductor-universe';
const registryPath = `${assetRoot}/node-resources-fe-process.json`;
const runtimePath = `${assetRoot}/node-resource-runtime.js`;
const loaderPath = `${assetRoot}/graph-loader.js`;
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

const registrySource = read(registryPath);
const registry = parse(registryPath);
const manifest = parse(graphPath);
const runtime = read(runtimePath);
const loader = read(loaderPath);
const css = read(cssPath);

const expectedIds = [
  'SEM.FE.SURFACE-PREP-CLEAN',
  'SEM.FE.SURFACE-PREP-CLEAN.WET-SINGLE-BATCH-DRY',
  'SEM.FE.SURFACE-PREP-CLEAN.POST-ETCH-POST-CMP',
  'SEM.FE.SURFACE-PREP-CLEAN.EDGE-BEVEL',
  'SEM.FE.THERMAL-FURNACE-RTP-MSA-LASER-CURE',
  'SEM.FE.EPITAXY-SI-SIGE-MOCVD-MBE',
  'SEM.FE.LITHOGRAPHY',
  'SEM.FE.LITHOGRAPHY.I-LINE-KRF-ARF-DRY-ARFI-EUV-HIGH-NA',
  'SEM.FE.LITHOGRAPHY.TRACK',
  'SEM.FE.LITHOGRAPHY.COMPUTATIONAL-PATTERNING',
  'SEM.FE.STRIP-ASH-DESCUM',
  'SEM.FE.ETCH',
  'SEM.FE.ETCH.CONDUCTOR-DIELECTRIC-SI-HAR',
  'SEM.FE.ETCH.ALE',
  'SEM.FE.ETCH.CRYOGENIC',
  'SEM.FE.DEPOSITION',
  'SEM.FE.DEPOSITION.PVD-CVD-PECVD-LPCVD-HDP-CVD',
  'SEM.FE.DEPOSITION.THERMAL-ALD-PEALD-BATCH-ALD',
  'SEM.FE.DEPOSITION.SELECTIVE-DEPOSITION',
  'SEM.FE.DEPOSITION.EPI',
  'SEM.FE.DEPOSITION.ECD-ELECTROLESS',
  'SEM.FE.IMPLANT-DOPING',
  'SEM.FE.CMP',
  'SEM.PC',
  'SEM.PC.CD-SEM',
  'SEM.PC.OPTICAL-BF-DF-INSPECTION',
  'SEM.PC.E-BEAM-MULTIBEAM',
  'SEM.PC.OVERLAY',
  'SEM.PC.OCD',
  'SEM.PC.ELLIPSOMETRY-REFLECTOMETRY',
  'SEM.PC.DEFECT-REVIEW-FIB',
];

const explicitlyDeferred = [
  'SEM.PC.XRR-XRD-XRF',
  'SEM.PC.SIMS-TXRF',
  'SEM.PC.AFM-PROFILE-WARP-STRESS',
  'SEM.PC.INLINE-E-TEST',
  'SEM.PC.CHEMICAL-GAS-ANALYTICS',
  'SEM.PC.YIELD-FDC-APC',
];

const officialHosts = [
  'asml.com',
  'tel.com',
  'lamresearch.com',
  'appliedmaterials.com',
  'asm.com',
  'kla.com',
];
const learnHosts = ['nanolab.berkeley.edu', 'tsapps.nist.gov'];
const allowedTypes = new Set(['OFFICIAL', 'LEARN']);
const allowedRoles = new Set(['EQUIPMENT', 'PROCESS', 'REFERENCE']);

function hostMatches(hostname, allowlist) {
  return allowlist.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

requireMarkers(runtime, runtimePath, [
  "'./node-resources-fe-process.json'",
  'PROCESS / EQUIPMENT RESOURCES',
  'OFFICIAL',
  'LEARN',
  'noopener noreferrer',
  'MutationObserver',
  'dataset.resourceType',
  '#node-id',
]);
if (/location\.(?:href|assign|replace)\s*[=(]/.test(runtime)) {
  issues.push(`${runtimePath}: selecting a process node must not force external navigation`);
}
requireMarkers(loader, loaderPath, [
  "runtime.src = './node-resource-runtime.js'",
  'data-semiconductor-process-resources',
]);
requireMarkers(css, cssPath, [
  '.node-resource-panel',
  "data-resource-type='learn'",
  "content: 'NEUTRAL · '",
]);

if (registry) {
  if (registry.version !== 1) issues.push(`${registryPath}: version must be 1`);
  if (registry.checkedAt !== '2026-08-21') issues.push(`${registryPath}: checkedAt must be 2026-08-21`);

  const entries = Object.entries(registry.nodes || {});
  if (entries.length !== 31) issues.push(`${registryPath}: expected 31 mapped process/control nodes, found ${entries.length}`);
  const actualIds = new Set(entries.map(([id]) => id));
  for (const id of expectedIds) if (!actualIds.has(id)) issues.push(`${registryPath}: required node ${id} missing`);
  for (const id of actualIds) if (!expectedIds.includes(id)) issues.push(`${registryPath}: unexpected PR-4 node ${id}`);
  for (const id of explicitlyDeferred) if (actualIds.has(id)) issues.push(`${registryPath}: deferred specialized analytics node must not be force-mapped (${id})`);

  let resourceCount = 0;
  let officialCount = 0;
  let learnCount = 0;

  for (const [nodeId, profile] of entries) {
    if (!profile?.name) issues.push(`${nodeId}: display name missing`);
    if (!Array.isArray(profile?.resources) || profile.resources.length < 1) {
      issues.push(`${nodeId}: at least one resource is required`);
      continue;
    }

    for (const [index, resource] of profile.resources.entries()) {
      resourceCount += 1;
      if (!allowedTypes.has(resource?.type)) issues.push(`${nodeId}[${index}]: invalid resource type ${resource?.type}`);
      if (!allowedRoles.has(resource?.role)) issues.push(`${nodeId}[${index}]: invalid resource role ${resource?.role}`);
      if (!resource?.title || !resource?.publisher) issues.push(`${nodeId}[${index}]: title/publisher missing`);
      if (resource?.checkedAt !== '2026-08-21') issues.push(`${nodeId}[${index}]: checkedAt must be 2026-08-21`);
      if (resource?.availability !== 'VERIFIED') issues.push(`${nodeId}[${index}]: PR-4 resources must be VERIFIED`);

      if (resource?.type === 'OFFICIAL') {
        officialCount += 1;
        if (!['EQUIPMENT', 'PROCESS'].includes(resource?.role)) issues.push(`${nodeId}[${index}]: OFFICIAL resource must be EQUIPMENT or PROCESS`);
      }
      if (resource?.type === 'LEARN') {
        learnCount += 1;
        if (resource?.role !== 'REFERENCE') issues.push(`${nodeId}[${index}]: LEARN resource must use REFERENCE role`);
      }

      let url;
      try {
        url = new URL(resource?.url);
      } catch {
        issues.push(`${nodeId}[${index}]: invalid URL ${resource?.url}`);
        continue;
      }
      if (url.protocol !== 'https:') issues.push(`${nodeId}[${index}]: HTTPS required (${resource?.url})`);
      if (resource?.type === 'OFFICIAL' && !hostMatches(url.hostname, officialHosts)) {
        issues.push(`${nodeId}[${index}]: OFFICIAL host not allowlisted (${url.hostname})`);
      }
      if (resource?.type === 'LEARN' && !hostMatches(url.hostname, learnHosts)) {
        issues.push(`${nodeId}[${index}]: LEARN host must be Berkeley NanoLab or NIST (${url.hostname})`);
      }
      if (resource?.type === 'LEARN' && hostMatches(url.hostname, officialHosts)) {
        issues.push(`${nodeId}[${index}]: manufacturer content must not be labeled LEARN (${url.hostname})`);
      }
    }
  }

  if (resourceCount !== 43) issues.push(`${registryPath}: expected 43 resources, found ${resourceCount}`);
  if (officialCount !== 32) issues.push(`${registryPath}: expected 32 OFFICIAL resources, found ${officialCount}`);
  if (learnCount !== 11) issues.push(`${registryPath}: expected 11 LEARN resources, found ${learnCount}`);

  const urlsFor = (id) => (registry.nodes?.[id]?.resources || []).map((resource) => resource.url);
  const requireUrl = (id, fragment) => {
    if (!urlsFor(id).some((url) => url.includes(fragment))) issues.push(`${id}: required deep-link missing (${fragment})`);
  };
  requireUrl('SEM.FE.LITHOGRAPHY', '/technology/lithography-principles');
  requireUrl('SEM.FE.LITHOGRAPHY.I-LINE-KRF-ARF-DRY-ARFI-EUV-HIGH-NA', '/products/euv-lithography-systems');
  requireUrl('SEM.FE.LITHOGRAPHY.I-LINE-KRF-ARF-DRY-ARFI-EUV-HIGH-NA', '/products/duv-lithography-systems');
  requireUrl('SEM.FE.LITHOGRAPHY.TRACK', '/product/lithius.html');
  requireUrl('SEM.FE.ETCH', '/our-processes/etch/');
  requireUrl('SEM.FE.DEPOSITION.THERMAL-ALD-PEALD-BATCH-ALD', '/our-technology-products/ald');
  requireUrl('SEM.FE.THERMAL-FURNACE-RTP-MSA-LASER-CURE', '/product/telindy.html');
  requireUrl('SEM.FE.SURFACE-PREP-CLEAN', '/product/cellesta.html');
  requireUrl('SEM.FE.CMP', '/semiconductor/products.html');
  requireUrl('SEM.PC', 'kla.com/products');
  requireUrl('SEM.PC', 'tsapps.nist.gov');

  for (const requiredLearnNode of [
    'SEM.FE.SURFACE-PREP-CLEAN',
    'SEM.FE.THERMAL-FURNACE-RTP-MSA-LASER-CURE',
    'SEM.FE.EPITAXY-SI-SIGE-MOCVD-MBE',
    'SEM.FE.LITHOGRAPHY',
    'SEM.FE.ETCH',
    'SEM.FE.DEPOSITION',
    'SEM.FE.IMPLANT-DOPING',
    'SEM.FE.CMP',
    'SEM.PC',
    'SEM.PC.CD-SEM',
    'SEM.PC.OVERLAY',
  ]) {
    if (!(registry.nodes?.[requiredLearnNode]?.resources || []).some((resource) => resource.type === 'LEARN')) {
      issues.push(`${requiredLearnNode}: neutral LEARN reference required`);
    }
  }
}

for (const forbidden of ['"type":"MARKET"', '"type":"ANALYST"', '"ticker"', '"exchange"']) {
  if (registrySource.includes(forbidden)) issues.push(`${registryPath}: process registry must not contain ${forbidden}`);
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
  const feGroupIndex = manifest.groups?.indexOf('FE');
  const pcGroupIndex = manifest.groups?.indexOf('PC');
  const processKindIndex = manifest.kinds?.indexOf('process');
  const inspectionKindIndex = manifest.kinds?.indexOf('inspection');

  for (const nodeId of Object.keys(registry.nodes || {})) {
    const row = byId.get(nodeId);
    if (!row) {
      issues.push(`${nodeId}: mapped process/control node missing from atlas graph`);
      continue;
    }
    const expectedGroup = nodeId.startsWith('SEM.PC') ? pcGroupIndex : feGroupIndex;
    const expectedKind = nodeId.startsWith('SEM.PC') ? inspectionKindIndex : processKindIndex;
    if (row[5] !== expectedGroup) issues.push(`${nodeId}: expected ${nodeId.startsWith('SEM.PC') ? 'PC' : 'FE'} group`);
    if (row[6] !== expectedKind) issues.push(`${nodeId}: expected ${nodeId.startsWith('SEM.PC') ? 'inspection' : 'process'} kind`);
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`semiconductor-process-resources-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('semiconductor-process-resources-audit: PASS (31 FE/process-control nodes; 43 resources = 32 OFFICIAL + 11 LEARN; domain/type/node integrity verified; specialized analytics deferred)');

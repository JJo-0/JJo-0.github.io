import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const assetRoot = 'site/assets/assets/interactive/semiconductor-universe';
const baseRegistryPath = `${assetRoot}/node-resources-fe-process.json`;
const hardeningPath = `${assetRoot}/node-resources-fe-process-hardening.json`;
const runtimePath = `${assetRoot}/node-resource-runtime.js`;
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

function hostMatches(hostname, allowlist) {
  return allowlist.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

const base = parse(baseRegistryPath);
const hardeningSource = read(hardeningPath);
const hardening = parse(hardeningPath);
const runtime = read(runtimePath);
const manifest = parse(graphPath);

const coreIds = [
  'SEM.FE.LITHOGRAPHY.I-LINE-KRF-ARF-DRY-ARFI-EUV-HIGH-NA',
  'SEM.FE.LITHOGRAPHY.TRACK',
  'SEM.FE.ETCH',
  'SEM.FE.DEPOSITION.PVD-CVD-PECVD-LPCVD-HDP-CVD',
  'SEM.FE.DEPOSITION.THERMAL-ALD-PEALD-BATCH-ALD',
  'SEM.FE.IMPLANT-DOPING',
  'SEM.FE.THERMAL-FURNACE-RTP-MSA-LASER-CURE',
  'SEM.FE.SURFACE-PREP-CLEAN',
  'SEM.FE.CMP',
  'SEM.PC',
];

const officialHosts = [
  'asml.com',
  'tel.com',
  'lamresearch.com',
  'appliedmaterials.com',
  'asm.com',
  'kla.com',
];
const learnHosts = ['snfguide.stanford.edu', 'nist.gov'];

requireMarkers(runtime, runtimePath, [
  "'./node-resources-fe-process.json'",
  "'./node-resources-fe-process-hardening.json'",
  "registry?.mode === 'REPLACE'",
  "registry?.verification?.status === 'DOUBLE_CHECKED'",
  'Promise.all',
  '...base.nodes',
  '...hardening.nodes',
  'noopener noreferrer',
]);
if (/location\.(?:href|assign|replace)\s*[=(]/.test(runtime)) {
  issues.push(`${runtimePath}: selecting a process node must not force external navigation`);
}

if (hardening) {
  if (hardening.version !== 1) issues.push(`${hardeningPath}: version must be 1`);
  if (hardening.checkedAt !== '2026-08-21' || hardening.recheckedAt !== '2026-08-21') {
    issues.push(`${hardeningPath}: checkedAt/recheckedAt must be 2026-08-21`);
  }
  if (hardening.mode !== 'REPLACE') issues.push(`${hardeningPath}: mode must be REPLACE`);
  if (hardening.verification?.status !== 'DOUBLE_CHECKED') {
    issues.push(`${hardeningPath}: verification status must be DOUBLE_CHECKED`);
  }
  if (!String(hardening.verification?.policy || '').includes('OFFICIAL') || !String(hardening.verification?.policy || '').includes('LEARN')) {
    issues.push(`${hardeningPath}: verification policy must explicitly require OFFICIAL and LEARN sources`);
  }

  const entries = Object.entries(hardening.nodes || {});
  if (entries.length !== coreIds.length) issues.push(`${hardeningPath}: expected ${coreIds.length} core nodes, found ${entries.length}`);
  const actualIds = new Set(entries.map(([id]) => id));
  for (const id of coreIds) if (!actualIds.has(id)) issues.push(`${hardeningPath}: required core node missing (${id})`);
  for (const id of actualIds) if (!coreIds.includes(id)) issues.push(`${hardeningPath}: unexpected hardening node (${id})`);

  let resourceCount = 0;
  let officialCount = 0;
  let learnCount = 0;
  const urlsFor = (id) => (hardening.nodes?.[id]?.resources || []).map((resource) => resource.url);

  for (const [nodeId, profile] of entries) {
    if (!profile?.name) issues.push(`${nodeId}: display name missing`);
    if (!Array.isArray(profile?.resources) || profile.resources.length < 2) {
      issues.push(`${nodeId}: hardening core node requires at least two resources`);
      continue;
    }

    const types = new Set(profile.resources.map((resource) => resource.type));
    if (!types.has('OFFICIAL')) issues.push(`${nodeId}: at least one OFFICIAL source is required`);
    if (!types.has('LEARN')) issues.push(`${nodeId}: at least one independent LEARN source is required`);

    for (const [index, resource] of profile.resources.entries()) {
      resourceCount += 1;
      if (!['OFFICIAL', 'LEARN'].includes(resource?.type)) issues.push(`${nodeId}[${index}]: invalid type ${resource?.type}`);
      if (!['EQUIPMENT', 'PROCESS', 'REFERENCE'].includes(resource?.role)) issues.push(`${nodeId}[${index}]: invalid role ${resource?.role}`);
      if (!resource?.title || !resource?.publisher) issues.push(`${nodeId}[${index}]: title/publisher missing`);
      if (resource?.checkedAt !== '2026-08-21') issues.push(`${nodeId}[${index}]: checkedAt must be 2026-08-21`);
      if (resource?.availability !== 'VERIFIED') issues.push(`${nodeId}[${index}]: hardening resources must be VERIFIED`);

      let url;
      try {
        url = new URL(resource?.url);
      } catch {
        issues.push(`${nodeId}[${index}]: invalid URL ${resource?.url}`);
        continue;
      }
      if (url.protocol !== 'https:') issues.push(`${nodeId}[${index}]: HTTPS required`);

      if (resource.type === 'OFFICIAL') {
        officialCount += 1;
        if (!['EQUIPMENT', 'PROCESS'].includes(resource.role)) issues.push(`${nodeId}[${index}]: OFFICIAL must be EQUIPMENT/PROCESS`);
        if (!hostMatches(url.hostname, officialHosts)) issues.push(`${nodeId}[${index}]: manufacturer host not allowlisted (${url.hostname})`);
      } else if (resource.type === 'LEARN') {
        learnCount += 1;
        if (resource.role !== 'REFERENCE') issues.push(`${nodeId}[${index}]: LEARN must use REFERENCE role`);
        if (!hostMatches(url.hostname, learnHosts)) issues.push(`${nodeId}[${index}]: LEARN must be Stanford SNF or NIST (${url.hostname})`);
        if (hostMatches(url.hostname, officialHosts)) issues.push(`${nodeId}[${index}]: manufacturer resource cannot be labeled LEARN`);
      }
    }
  }

  if (resourceCount !== 28) issues.push(`${hardeningPath}: expected 28 resources, found ${resourceCount}`);
  if (officialCount !== 17) issues.push(`${hardeningPath}: expected 17 OFFICIAL resources, found ${officialCount}`);
  if (learnCount !== 11) issues.push(`${hardeningPath}: expected 11 LEARN resources, found ${learnCount}`);

  const requireUrl = (id, fragment) => {
    if (!urlsFor(id).some((url) => url.includes(fragment))) issues.push(`${id}: required double-checked deep-link missing (${fragment})`);
  };

  requireUrl(coreIds[0], '/products/euv-lithography-systems');
  requireUrl(coreIds[0], 'twinscan-exe-5200b');
  requireUrl(coreIds[0], 'nist.gov/publications/report-extreme-ultraviolet');
  requireUrl(coreIds[1], '/product/lithius.html');
  requireUrl(coreIds[1], 'snfguide.stanford.edu/guide/equipment/processing-technique/photolithography');
  requireUrl(coreIds[2], '/our-processes/etch/');
  requireUrl(coreIds[2], 'snfguide.stanford.edu/guide/equipment/processing-technique/etching/dry-etching');
  requireUrl(coreIds[3], 'endura-amber-pvd');
  requireUrl(coreIds[3], 'producer-eterna-fcvd');
  requireUrl(coreIds[3], 'physical-vapor-deposition-pvd');
  requireUrl(coreIds[3], 'chemical-vapor-deposition-cvd');
  requireUrl(coreIds[4], '/our-technology-products/ald');
  requireUrl(coreIds[4], 'endura-trillium-ald');
  requireUrl(coreIds[4], 'atomic-layer-deposition-ald');
  requireUrl(coreIds[5], 'viista-trident');
  requireUrl(coreIds[5], 'nistir4414.pdf');
  requireUrl(coreIds[6], '/product/telindy.html');
  requireUrl(coreIds[6], 'vantage-radiance-plus-rtp');
  requireUrl(coreIds[6], 'rapid-thermal-annealing');
  requireUrl(coreIds[7], '/product/cellesta.html');
  requireUrl(coreIds[7], '/our-processes/strip-clean/');
  requireUrl(coreIds[7], 'snfguide.stanford.edu/guide/equipment/purpose/cleaning');
  requireUrl(coreIds[8], 'reflexion-lk-cmp');
  requireUrl(coreIds[8], 'cmp-gnp-poli-400l-cmp');
  requireUrl(coreIds[9], 'kla.com/products/chip-manufacturing/metrology');
  requireUrl(coreIds[9], 'kla.com/products/chip-manufacturing/defect-inspection-review');
  requireUrl(coreIds[9], 'pub_id=957746');

  if (hardeningSource.includes('/semiconductor/products.html')) {
    issues.push(`${hardeningPath}: generic Applied Materials product landing page is forbidden in the double-checked overlay`);
  }
  for (const forbidden of ['"type":"MARKET"', '"type":"ANALYST"', '"ticker"', '"exchange"']) {
    if (hardeningSource.includes(forbidden)) issues.push(`${hardeningPath}: process hardening registry must not contain ${forbidden}`);
  }
}

if (base && hardening) {
  for (const id of coreIds) {
    if (!base.nodes?.[id]) issues.push(`${id}: hardening overlay must replace an existing PR-4 base node`);
  }
}

if (manifest && hardening) {
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
  for (const id of coreIds) {
    const row = byId.get(id);
    if (!row) issues.push(`${id}: core hardening node missing from rendered graph`);
    else if (row[5] !== (id === 'SEM.PC' ? pcGroupIndex : feGroupIndex)) issues.push(`${id}: core hardening node group changed unexpectedly`);
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`semiconductor-process-hardening-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('semiconductor-process-hardening-audit: PASS (10 core stages; 28 double-checked resources = 17 OFFICIAL + 11 LEARN; direct tool/process links; neutral source parity; fail-closed overlay)');

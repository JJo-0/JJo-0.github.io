import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const assetRoot = 'site/assets/assets/interactive/semiconductor-universe';
const registryPath = `${assetRoot}/node-resources-equipment-components.json`;
const runtimePath = `${assetRoot}/component-resource-runtime.js`;
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

const expectedIds = [
  'SEM.EQCOMP.VACUUM.DRY-TURBO-CRYO-PUMP',
  'SEM.EQCOMP.VACUUM.VALVE-GATE-THROTTLE-TRANSFER',
  'SEM.EQCOMP.VACUUM.GAUGE-RGA',
  'SEM.EQCOMP.GAS-CHEMICAL.MFC',
  'SEM.EQCOMP.GAS-CHEMICAL.REGULATOR-VALVE',
  'SEM.EQCOMP.GAS-CHEMICAL.PURIFIER-GETTER',
  'SEM.EQCOMP.GAS-CHEMICAL.VAPORIZER-DLI-BUBBLER',
  'SEM.EQCOMP.GAS-CHEMICAL.AMPOULE-CANISTER',
  'SEM.EQCOMP.GAS-CHEMICAL.UHP-TUBING-FITTING-BELLOWS',
  'SEM.EQCOMP.PLASMA-RF',
  'SEM.EQCOMP.PLASMA-RF.GENERATOR',
  'SEM.EQCOMP.PLASMA-RF.MATCHER',
  'SEM.EQCOMP.PLASMA-RF.REMOTE-MICROWAVE-SOURCE',
  'SEM.EQCOMP.CHAMBER.ESC-HE-COOLING',
  'SEM.EQCOMP.CHAMBER.HEATER-CHUCK',
  'SEM.EQCOMP.PRECISION-MOTION-VIBRATION',
  'SEM.EQCOMP.OPTICS-LASER-DETECTOR-CAMERA',
  'SEM.EQCOMP.POWER-HV-UPS',
  'SEM.EQCOMP.TEMPERATURE-CHILLER',
  'SEM.EQCOMP.CONTAMINATION-CONTROL',
  'SEM.EQCOMP.ENDPOINT-SENSORS',
  'SEM.EQCOMP.ROBOT-EFEM-LOAD-PORT-ALIGNER',
  'SEM.AUTO.FOUP-FOSB-CARRIER',
];

const explicitlyDeferred = [
  'SEM.EQCOMP.VACUUM',
  'SEM.EQCOMP.VACUUM.FORELINE',
  'SEM.EQCOMP.GAS-CHEMICAL',
  'SEM.EQCOMP.CHAMBER',
  'SEM.EQCOMP.CHAMBER.LINER-RING-SHOWERHEAD',
  'SEM.EQCOMP.ION-IMPLANT-COMPONENTS',
  'SEM.EQCOMP.ION-IMPLANT-COMPONENTS.ION-SOURCE-ARC-CHAMBER-BEAMLINE-HV',
];

const officialHosts = [
  'edwardsvacuum.com',
  'vatgroup.com',
  'inficon.com',
  'horiba.com',
  'entegris.com',
  'swagelok.com',
  'advancedenergy.com',
  'ngk-global.com',
  'ceratech.co.jp',
  'pi-usa.us',
  'coherent.com',
  'fstc.co.kr',
  'hirata.co.jp',
];
const learnHosts = ['expo.semi.org', 'g2b.go.kr'];
const allowedTypes = new Set(['OFFICIAL', 'LEARN']);
const allowedRoles = new Set(['COMPONENT', 'REFERENCE']);

function hostMatches(hostname, allowlist) {
  return allowlist.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

requireMarkers(runtime, runtimePath, [
  "'./node-resources-equipment-components.json'",
  'EQUIPMENT COMPONENT RESOURCES',
  'component-resource-panel',
  'OFFICIAL',
  'LEARN',
  'noopener noreferrer',
  'MutationObserver',
  '#node-id',
]);
if (/location\.(?:href|assign|replace)\s*[=(]/.test(runtime)) {
  issues.push(`${runtimePath}: selecting a component node must not force external navigation`);
}
requireMarkers(loader, loaderPath, [
  "runtime.src = './component-resource-runtime.js'",
  'data-semiconductor-component-resources',
]);

if (registry) {
  if (registry.version !== 1) issues.push(`${registryPath}: version must be 1`);
  if (registry.checkedAt !== '2026-08-21') issues.push(`${registryPath}: checkedAt must be 2026-08-21`);

  const entries = Object.entries(registry.nodes || {});
  if (entries.length !== 23) issues.push(`${registryPath}: expected 23 mapped component/carrier nodes, found ${entries.length}`);
  const actualIds = new Set(entries.map(([id]) => id));
  for (const id of expectedIds) if (!actualIds.has(id)) issues.push(`${registryPath}: required node ${id} missing`);
  for (const id of actualIds) if (!expectedIds.includes(id)) issues.push(`${registryPath}: unexpected PR-5 node ${id}`);
  for (const id of explicitlyDeferred) if (actualIds.has(id)) issues.push(`${registryPath}: deferred ambiguous/broad component node must remain unmapped (${id})`);

  const eqIds = entries.filter(([id]) => id.startsWith('SEM.EQCOMP.'));
  const autoIds = entries.filter(([id]) => id.startsWith('SEM.AUTO.'));
  if (eqIds.length !== 22) issues.push(`${registryPath}: expected 22 EQCOMP nodes, found ${eqIds.length}`);
  if (autoIds.length !== 1 || autoIds[0]?.[0] !== 'SEM.AUTO.FOUP-FOSB-CARRIER') {
    issues.push(`${registryPath}: exactly one AUTO node is allowed and it must be SEM.AUTO.FOUP-FOSB-CARRIER`);
  }

  let resourceCount = 0;
  let officialCount = 0;
  let learnCount = 0;
  for (const [nodeId, profile] of entries) {
    if (!profile?.name) issues.push(`${nodeId}: display name missing`);
    if (!Array.isArray(profile?.resources) || profile.resources.length < 1) {
      issues.push(`${nodeId}: at least one resource is required`);
      continue;
    }
    if (!profile.resources.some((resource) => resource.type === 'OFFICIAL')) {
      issues.push(`${nodeId}: at least one OFFICIAL component resource is required`);
    }

    for (const [index, resource] of profile.resources.entries()) {
      resourceCount += 1;
      if (!allowedTypes.has(resource?.type)) issues.push(`${nodeId}[${index}]: invalid resource type ${resource?.type}`);
      if (!allowedRoles.has(resource?.role)) issues.push(`${nodeId}[${index}]: invalid resource role ${resource?.role}`);
      if (!resource?.title || !resource?.publisher) issues.push(`${nodeId}[${index}]: title/publisher missing`);
      if (resource?.checkedAt !== '2026-08-21') issues.push(`${nodeId}[${index}]: checkedAt must be 2026-08-21`);
      if (resource?.availability !== 'VERIFIED') issues.push(`${nodeId}[${index}]: PR-5 resources must be VERIFIED`);

      if (resource?.type === 'OFFICIAL') officialCount += 1;
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
        issues.push(`${nodeId}[${index}]: LEARN host must be SEMI or Korea ON-line E-Procurement (${url.hostname})`);
      }
      if (resource?.type === 'LEARN' && hostMatches(url.hostname, officialHosts)) {
        issues.push(`${nodeId}[${index}]: supplier-controlled content must not be labeled LEARN (${url.hostname})`);
      }
    }
  }

  if (resourceCount !== 38) issues.push(`${registryPath}: expected 38 resources, found ${resourceCount}`);
  if (officialCount !== 26) issues.push(`${registryPath}: expected 26 OFFICIAL resources, found ${officialCount}`);
  if (learnCount !== 12) issues.push(`${registryPath}: expected 12 LEARN resources, found ${learnCount}`);

  const urlsFor = (id) => (registry.nodes?.[id]?.resources || []).map((resource) => resource.url);
  const requireUrl = (id, fragment) => {
    if (!urlsFor(id).some((url) => url.includes(fragment))) issues.push(`${id}: required deep-link missing (${fragment})`);
  };
  requireUrl('SEM.EQCOMP.VACUUM.DRY-TURBO-CRYO-PUMP', '/semiconductor/our-products/dry-pumps');
  requireUrl('SEM.EQCOMP.VACUUM.VALVE-GATE-THROTTLE-TRANSFER', '/semiconductor-production/process-control-isolation');
  requireUrl('SEM.EQCOMP.VACUUM.GAUGE-RGA', '/transpector-cpx');
  requireUrl('SEM.EQCOMP.GAS-CHEMICAL.MFC', '/sec-z700x-series-672/');
  requireUrl('SEM.EQCOMP.GAS-CHEMICAL.VAPORIZER-DLI-BUBBLER', '/liquid-precursor-vaporizor/');
  requireUrl('SEM.EQCOMP.GAS-CHEMICAL.PURIFIER-GETTER', 'GateKeeper-EX-Series-Gas-Purification-Systems');
  requireUrl('SEM.EQCOMP.GAS-CHEMICAL.AMPOULE-CANISTER', '/solid-precursors-and-delivery-systems.html');
  requireUrl('SEM.EQCOMP.GAS-CHEMICAL.UHP-TUBING-FITTING-BELLOWS', '/vacuum-face-seal-fittings-high-purity-semiconductor');
  requireUrl('SEM.EQCOMP.PLASMA-RF.GENERATOR', '/rf-plasma-generators/paramount/');
  requireUrl('SEM.EQCOMP.PLASMA-RF.MATCHER', '/rf-match-networks/navio/');
  requireUrl('SEM.EQCOMP.PLASMA-RF.REMOTE-MICROWAVE-SOURCE', '/remote-plasma-sources/xstream/');
  requireUrl('SEM.EQCOMP.CHAMBER.ESC-HE-COOLING', '/product/sc-chack.html');
  requireUrl('SEM.EQCOMP.CHAMBER.HEATER-CHUCK', '/en/product/esc/');
  requireUrl('SEM.EQCOMP.PRECISION-MOTION-VIBRATION', '/motion-control-solutions-for-the-semiconductor-industry');
  requireUrl('SEM.EQCOMP.OPTICS-LASER-DETECTOR-CAMERA', '/semiconductor-manufacturing/feol');
  requireUrl('SEM.EQCOMP.POWER-HV-UPS', '/high-voltage-power-supplies/');
  requireUrl('SEM.EQCOMP.TEMPERATURE-CHILLER', 'page_tcu_en_2');
  requireUrl('SEM.EQCOMP.CONTAMINATION-CONTROL', '/gas-filters.html');
  requireUrl('SEM.EQCOMP.ENDPOINT-SENSORS', '/quantus-hp100');
  requireUrl('SEM.EQCOMP.ROBOT-EFEM-LOAD-PORT-ALIGNER', '/en/products/semiconductor');
  requireUrl('SEM.EQCOMP.ROBOT-EFEM-LOAD-PORT-ALIGNER', '/items/archives/97');
  requireUrl('SEM.EQCOMP.ROBOT-EFEM-LOAD-PORT-ALIGNER', '/items/archives/175');
  requireUrl('SEM.AUTO.FOUP-FOSB-CARRIER', '/a300foups/datasheet-a300foups.pdf');
}

for (const forbidden of ['"type":"MARKET"', '"type":"ANALYST"', '"ticker"', '"exchange"']) {
  if (registrySource.includes(forbidden)) issues.push(`${registryPath}: component registry must not contain ${forbidden}`);
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
  const eqGroupIndex = manifest.groups?.indexOf('EQCOMP');
  const autoGroupIndex = manifest.groups?.indexOf('AUTO');
  const componentKindIndex = manifest.kinds?.indexOf('component');

  for (const nodeId of Object.keys(registry.nodes || {})) {
    const row = byId.get(nodeId);
    if (!row) {
      issues.push(`${nodeId}: mapped component/carrier node missing from atlas graph`);
      continue;
    }
    if (nodeId === 'SEM.AUTO.FOUP-FOSB-CARRIER') {
      if (row[5] !== autoGroupIndex) issues.push(`${nodeId}: expected AUTO group`);
      continue;
    }
    if (row[5] !== eqGroupIndex) issues.push(`${nodeId}: expected EQCOMP group`);
    if (row[6] !== componentKindIndex) issues.push(`${nodeId}: expected component kind`);
  }
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`semiconductor-equipment-component-links-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('semiconductor-equipment-component-links-audit: PASS (22 EQCOMP + 1 FOUP carrier node; 38 resources = 26 OFFICIAL + 12 LEARN; supplier/domain/node integrity verified; 7 ambiguous/broad EQCOMP nodes deferred)');

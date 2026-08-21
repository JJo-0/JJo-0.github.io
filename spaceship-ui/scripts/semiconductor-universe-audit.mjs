import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const postPath = 'site/content/posts/semiconductor-supply-chain-universe-map.md';
const assetRoot = 'site/assets/interactive/semiconductor-universe';
const coverPath = 'site/assets/posts/semiconductor-universe-2026/cover.svg';
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

const post = read(postPath);
const cover = read(coverPath);
const index = read(`${assetRoot}/index.html`);
const css = read(`${assetRoot}/app.css`);
const app = read(`${assetRoot}/app.js`);
const loader = read(`${assetRoot}/graph-loader.js`);
const manifestSource = read(`${assetRoot}/graph.json`);

requireMarkers(post, postPath, [
  "slug: 'semiconductor-supply-chain-universe-map'",
  'category: finance-industry',
  'subcategory: semiconductor-industry',
  'type: research-report',
  '/assets/posts/semiconductor-universe-2026/cover.svg',
  '/assets/interactive/semiconductor-universe/index.html',
  '875개 node, 790개 leaf node',
  '322 nodes, 611 relations',
  'UNVERIFIED',
]);
requireMarkers(cover, coverPath, ['<svg', 'Global Semiconductor Supply-Chain Universe', 'VERIFIED', 'PARTIAL']);
requireMarkers(index, `${assetRoot}/index.html`, [
  'DATA PARTIAL',
  'graph-loader.js',
  'type="module" src="./app.js"',
  'id="universe-canvas"',
  'id="node-table-body"',
  'graph.json 다운로드',
]);
requireMarkers(app, `${assetRoot}/app.js`, [
  "import { WebGPURenderer } from 'three/webgpu'",
  'OrbitControls',
  "fetch('./graph.json'",
  'taxonomy',
  'process',
  'company',
  'geography',
  'evidence',
  'WEBGL2 FALLBACK',
]);
requireMarkers(loader, `${assetRoot}/graph-loader.js`, [
  'manifest.nodeFiles',
  'manifest.edgeFiles',
  'nodeRows.map',
  'edgeRows.map',
  'customerStatus',
]);
if (css.split('{').length !== css.split('}').length) {
  issues.push(`${assetRoot}/app.css: unbalanced braces`);
}

let manifest;
try {
  manifest = JSON.parse(manifestSource);
} catch (error) {
  issues.push(`${assetRoot}/graph.json: invalid JSON (${error.message})`);
}

if (manifest) {
  const expected = manifest.meta?.taxonomyBaseline;
  if (expected?.totalNodes !== 875 || expected?.leafNodes !== 790 || expected?.supplySideLeafNodes !== 406) {
    issues.push(`${assetRoot}/graph.json: taxonomy baseline must remain 875 / 790 / 406`);
  }
  if (manifest.meta?.status !== 'PARTIAL') {
    issues.push(`${assetRoot}/graph.json: public graph must remain explicitly PARTIAL`);
  }
  if (manifest.meta?.renderedNodeCount !== 322 || manifest.meta?.renderedEdgeCount !== 611) {
    issues.push(`${assetRoot}/graph.json: declared graph count must remain 322 nodes / 611 edges`);
  }

  const nodeRows = [];
  for (const filename of manifest.nodeFiles ?? []) {
    try {
      const rows = JSON.parse(read(`${assetRoot}/${filename}`));
      if (!Array.isArray(rows)) throw new Error('chunk is not an array');
      nodeRows.push(...rows);
    } catch (error) {
      issues.push(`${assetRoot}/${filename}: invalid node chunk (${error.message})`);
    }
  }
  const edgeRows = [];
  for (const filename of manifest.edgeFiles ?? []) {
    try {
      const rows = JSON.parse(read(`${assetRoot}/${filename}`));
      if (!Array.isArray(rows)) throw new Error('chunk is not an array');
      edgeRows.push(...rows);
    } catch (error) {
      issues.push(`${assetRoot}/${filename}: invalid edge chunk (${error.message})`);
    }
  }

  if (nodeRows.length !== 322) issues.push(`graph chunks: expected 322 nodes, found ${nodeRows.length}`);
  if (edgeRows.length !== 611) issues.push(`graph chunks: expected 611 edges, found ${edgeRows.length}`);

  const ids = nodeRows.map((row) => row?.[0]);
  if (new Set(ids).size !== ids.length) issues.push('graph chunks: duplicate node IDs');
  const requiredNodes = [
    'SEM.FE.LITHOGRAPHY.I-LINE-KRF-ARF-DRY-ARFI-EUV-HIGH-NA',
    'SEM.EQCOMP.GAS-CHEMICAL.MFC',
    'SEM.PKG.HYBRID-BONDING',
    'SEM.HBM',
    'CO.ASML-HOLDING-N-V',
    'CO.FST',
    'CO.SK-HYNIX',
  ];
  for (const id of requiredNodes) {
    if (!ids.includes(id)) issues.push(`graph chunks: required anchor ${id} missing`);
  }

  nodeRows.forEach((row, index) => {
    if (!Array.isArray(row) || row.length !== 16) {
      issues.push(`node row ${index}: expected 16 fields`);
      return;
    }
    const [id, , , parent, , group, kind, status, evidence, coverage, , chokepoint, aiHbm, koreaGap, region, customer] = row;
    if (typeof id !== 'string' || !id) issues.push(`node row ${index}: invalid ID`);
    if (parent >= nodeRows.length) issues.push(`node ${id}: parent index ${parent} out of range`);
    if (group < 0 || group >= manifest.groups.length) issues.push(`node ${id}: group index out of range`);
    if (kind < 0 || kind >= manifest.kinds.length) issues.push(`node ${id}: kind index out of range`);
    if (status < 0 || status >= manifest.statuses.length) issues.push(`node ${id}: status index out of range`);
    if (evidence < 0 || evidence >= manifest.evidences.length) issues.push(`node ${id}: evidence index out of range`);
    if (coverage < 0 || coverage >= manifest.coverages.length) issues.push(`node ${id}: coverage index out of range`);
    if (region >= manifest.regions.length) issues.push(`node ${id}: region index out of range`);
    if (customer >= manifest.customerStatuses.length) issues.push(`node ${id}: customer-status index out of range`);
    for (const [name, value] of [['chokepoint', chokepoint], ['aiHbm', aiHbm], ['koreaGap', koreaGap]]) {
      if (value !== null && (!Number.isInteger(value) || value < 0 || value > 5)) {
        issues.push(`node ${id}: ${name} must be null or integer 0..5`);
      }
    }
  });

  const seenEdges = new Set();
  edgeRows.forEach((row, index) => {
    if (!Array.isArray(row) || row.length !== 4) {
      issues.push(`edge row ${index}: expected 4 fields`);
      return;
    }
    const [source, target, relation, status] = row;
    if (source < 0 || source >= nodeRows.length || target < 0 || target >= nodeRows.length) {
      issues.push(`edge row ${index}: dangling endpoint ${source} -> ${target}`);
    }
    if (relation < 0 || relation >= manifest.relations.length) issues.push(`edge row ${index}: relation index out of range`);
    if (status < 0 || status >= manifest.statuses.length) issues.push(`edge row ${index}: status index out of range`);
    const key = `${source}|${target}|${relation}`;
    if (seenEdges.has(key)) issues.push(`edge row ${index}: duplicate relation ${key}`);
    seenEdges.add(key);
  });
}

const uniqueIssues = [...new Set(issues)].sort();
if (uniqueIssues.length) {
  console.error(`semiconductor-universe-audit: found ${uniqueIssues.length} issue(s):`);
  for (const issue of uniqueIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('semiconductor-universe-audit: PASS (Finance & Industry post; poster; WebGPU/WebGL atlas; 322 nodes; 611 relations; PARTIAL evidence preserved)');

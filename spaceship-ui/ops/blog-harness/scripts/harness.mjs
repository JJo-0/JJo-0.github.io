import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const configPath = path.join(root, 'harness.config.json');
const [command = 'check-config', jobArgument] = process.argv.slice(2);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function fail(issues) {
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

function requireText(value, label, issues) {
  if (typeof value !== 'string' || !value.trim()) issues.push(`${label} is required`);
}

function checkConfig(config) {
  const issues = [];
  requireText(config.name, 'config.name', issues);
  requireText(config.controlPlane?.spreadsheetId, 'controlPlane.spreadsheetId', issues);
  const agents = config.agents ?? [];
  if (agents.length < 8) issues.push('at least eight bounded agent roles are required');
  const ids = agents.map((agent) => agent.id);
  if (new Set(ids).size !== ids.length) issues.push('agent ids must be unique');
  for (const gate of [
    'reader-brief',
    'source-evidence',
    'media-rights',
    'human-approval',
    'live-qa',
  ]) {
    if (!config.gates?.includes(gate)) issues.push(`missing fail-closed gate: ${gate}`);
  }
  if (
    config.channels?.instagram?.enabled &&
    config.channels.instagram.publishMode.includes('export-only')
  ) {
    issues.push('Instagram cannot be enabled while publishMode is export-only');
  }
  return issues;
}

function checkJob(job, { publish }) {
  const issues = [];
  requireText(job.contentId, 'contentId', issues);
  requireText(job.title, 'title', issues);
  requireText(job.reader?.question, 'reader.question', issues);
  requireText(job.reader?.promise, 'reader.promise', issues);
  requireText(job.reader?.nextAction, 'reader.nextAction', issues);
  if (!Array.isArray(job.searchIntents) || job.searchIntents.length === 0)
    issues.push('searchIntents must not be empty');
  if (!Array.isArray(job.sources) || job.sources.length < 2)
    issues.push('at least two sources are required');
  for (const [index, source] of (job.sources ?? []).entries()) {
    requireText(source.title, `sources[${index}].title`, issues);
    if (!/^https:\/\//.test(source.url ?? '')) issues.push(`sources[${index}].url must use https`);
    requireText(source.kind, `sources[${index}].kind`, issues);
    requireText(source.checkedAt, `sources[${index}].checkedAt`, issues);
  }
  for (const [index, asset] of (job.media ?? []).entries()) {
    requireText(asset.assetId, `media[${index}].assetId`, issues);
    requireText(asset.owner, `media[${index}].owner`, issues);
    requireText(asset.license, `media[${index}].license`, issues);
    requireText(asset.alt, `media[${index}].alt`, issues);
    if (typeof asset.commercialUse !== 'boolean')
      issues.push(`media[${index}].commercialUse must be boolean`);
    if (typeof asset.modificationAllowed !== 'boolean')
      issues.push(`media[${index}].modificationAllowed must be boolean`);
    if (publish && asset.rightsStatus !== 'cleared')
      issues.push(`media[${index}] is not rights-cleared`);
  }
  if (publish && job.humanApproval !== true)
    issues.push('humanApproval must be true before publishing');
  return issues;
}

const config = readJson(configPath);
const configIssues = checkConfig(config);
if (configIssues.length) fail(configIssues);

if (command === 'check-config') {
  console.log(
    `blog-harness: config PASS (${config.agents.length} agents; ${config.gates.length} gates)`
  );
  process.exit(0);
}

if (!jobArgument) fail([`${command} requires a content job JSON path`]);
const jobPath = path.resolve(process.cwd(), jobArgument);
const job = readJson(jobPath);
const publish = command === 'publish-gate';
if (!['plan-gate', 'publish-gate'].includes(command)) fail([`unknown command: ${command}`]);
const jobIssues = checkJob(job, { publish });
if (jobIssues.length) fail(jobIssues);

const pendingRights = (job.media ?? []).filter((asset) => asset.rightsStatus !== 'cleared').length;
console.log(
  `blog-harness: ${command} PASS content=${job.contentId} sources=${job.sources.length} media=${job.media?.length ?? 0} pendingRights=${pendingRights}`
);

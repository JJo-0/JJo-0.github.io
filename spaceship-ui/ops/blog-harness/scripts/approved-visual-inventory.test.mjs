import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkApprovedVisualInventory } from './approved-visual-inventory.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'approved-visual-inventory-'));
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/S2sAAAAASUVORK5CYII=', 'base64');

function makeJob() {
  fs.writeFileSync(path.join(temp, 'gitblog.mdx'), [
    '<NewsFigure media="g-1" />',
    '<NewsFigure media="g-2" />',
  ].join('\n'));
  fs.writeFileSync(path.join(temp, 'blogger.html'), [
    '<figure id="b-1" data-media-id="b-1"><img src="https://example.test/1.webp" alt="one"></figure>',
    '<figure id="b-2" data-media-id="b-2"><img src="https://example.test/2.webp" alt="two"></figure>',
  ].join('\n'));
  for (const id of ['g-1', 'g-2', 'b-1', 'b-2']) fs.writeFileSync(path.join(temp, `${id}.png`), png);
  return {
    contentId: 'two-image-article',
    channels: ['gitblog', 'blogger'],
    artifacts: { gitblog: 'gitblog.mdx', blogger: 'blogger.html' },
    media: [
      ...['g-1', 'g-2'].map((assetId, index) => ({ assetId, channels: ['gitblog'], role: `figure-${index + 1}`, localPath: `${assetId}.png` })),
      ...['b-1', 'b-2'].map((assetId, index) => ({ assetId, channels: ['blogger'], role: `figure-${index + 1}`, localPath: `${assetId}.png` })),
    ],
    approvedVisualInventory: {
      contentId: 'two-image-article',
      reason: 'The article uses two approved explanatory images in each channel.',
      approval: { kind: 'USER_MESSAGE', reference: 'user-message:visual-count-approval', approvedAt: '2020-01-01T00:00:00Z' },
      channels: { gitblog: ['g-1', 'g-2'], blogger: ['b-1', 'b-2'] },
    },
  };
}

try {
  const valid = makeJob();
  assert.deepEqual(checkApprovedVisualInventory(valid, { artifactBase: temp }), []);

  const fullJob = {
    ...valid,
    title: 'Two-image article',
    reader: { question: 'q', promise: 'p', nextAction: 'n' },
    searchIntents: ['definition'],
    sources: [
      { title: 's1', url: 'https://example.test/1', kind: 'paper', checkedAt: '2026-10-28' },
      { title: 's2', url: 'https://example.test/2', kind: 'paper', checkedAt: '2026-10-28' },
    ],
    media: valid.media.map((asset) => ({
      ...asset, owner: 'author', license: 'CC BY', alt: asset.assetId,
      commercialUse: true, modificationAllowed: true, rightsStatus: 'cleared',
      publicUrl: `https://example.test/${asset.assetId}.png`,
    })),
  };
  const validPath = path.join(temp, 'valid-job.json');
  fs.writeFileSync(validPath, JSON.stringify(fullJob));
  const accepted = spawnSync(process.execPath, [path.join(root, 'ops/blog-harness/scripts/harness.mjs'), 'plan-gate', validPath], { cwd: root, encoding: 'utf8' });
  assert.equal(accepted.status, 0, `valid two-image inventory must pass the integrated gate: ${accepted.stderr}`);

  const uncleared = structuredClone(fullJob);
  uncleared.humanApproval = true;
  uncleared.media[0].rightsStatus = 'pending';
  const unclearedPath = path.join(temp, 'uncleared-job.json');
  fs.writeFileSync(unclearedPath, JSON.stringify(uncleared));
  const publish = spawnSync(process.execPath, [path.join(root, 'ops/blog-harness/scripts/harness.mjs'), 'publish-gate', unclearedPath], { cwd: root, encoding: 'utf8' });
  assert.notEqual(publish.status, 0, 'approved count must not bypass publication rights');
  assert.match(publish.stderr, /media\[0\] is not rights-cleared/);

  const cases = [
    ['missing ID', (job) => { job.approvedVisualInventory.channels.gitblog.pop(); }],
    ['extra ID', (job) => { job.approvedVisualInventory.channels.gitblog.push('g-3'); }],
    ['duplicate ID', (job) => { job.approvedVisualInventory.channels.gitblog.push('g-1'); }],
    ['insufficient role diversity', (job) => { job.media[1].role = job.media[0].role; }],
    ['URL-only media', (job) => { delete job.media[0].localPath; job.media[0].publicUrl = 'https://example.test/image.png'; }],
    ['non-image local file', (job) => { fs.writeFileSync(path.join(temp, 'not-image.txt'), 'an image URL is not image bytes'); job.media[0].localPath = 'not-image.txt'; }],
    ['artifact ID mismatch', (_job) => fs.writeFileSync(path.join(temp, 'gitblog.mdx'), '<NewsFigure media="wrong" />\n<NewsFigure media="g-2" />')],
    ['wrong inventory content', (job) => { job.approvedVisualInventory.contentId = 'another-article'; }],
    ['wrong approval kind', (job) => { job.approvedVisualInventory.approval.kind = 'FILE'; }],
    ['timezone missing', (job) => { job.approvedVisualInventory.approval.approvedAt = '2026-10-28T00:00:00'; }],
    ['future approval', (job) => { job.approvedVisualInventory.approval.approvedAt = '2999-01-01T00:00:00Z'; }],
  ];
  for (const [label, mutate] of cases) {
    const job = makeJob();
    mutate(job);
    assert.notDeepEqual(checkApprovedVisualInventory(job, { artifactBase: temp }), [], `${label} must fail`);
  }

  const legacy = {
    contentId: 'legacy-minimum-check', title: 'Legacy minimum',
    reader: { question: 'q', promise: 'p', nextAction: 'n' },
    searchIntents: ['definition'], channels: ['gitblog'],
    sources: [
      { title: 's1', url: 'https://example.test/1', kind: 'paper', checkedAt: '2026-10-28' },
      { title: 's2', url: 'https://example.test/2', kind: 'paper', checkedAt: '2026-10-28' },
    ],
    media: ['one', 'two'].map((role) => ({ assetId: role, owner: 'author', license: 'CC BY', alt: role, role, channels: ['gitblog'], commercialUse: true, modificationAllowed: true, rightsStatus: 'cleared' })),
  };
  const jobPath = path.join(temp, 'legacy-job.json');
  fs.writeFileSync(jobPath, JSON.stringify(legacy));
  const result = spawnSync(process.execPath, [path.join(root, 'ops/blog-harness/scripts/harness.mjs'), 'plan-gate', jobPath], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0, 'legacy job must retain the configured minimum');
  assert.match(result.stderr, /gitblog requires at least 3 media assets; got 2/);

  console.log('Approved visual inventory: PASS integrated two-image job; 11 invalid cases rejected; legacy minimum and publication rights unchanged.');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

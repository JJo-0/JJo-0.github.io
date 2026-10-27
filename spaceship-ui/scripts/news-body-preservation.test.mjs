import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assertPreservedNewsBody, bodySha256 } from './news-body-preservation.mjs';

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const fixture = JSON.parse(read('../site/news-body-revisions-20261010.json'));
const covers = JSON.parse(read('../site/news-covers-20260912.json'));
assert.equal(fixture.schemaVersion, 'news-body-preservation-revisions-v1');
assert.equal(fixture.entries.length, 16);
assert.equal(new Set(fixture.entries.map((r) => r.slug)).size, fixture.entries.length);
let controls = 0;
for (const revision of fixture.entries) {
  const cover = covers.entries.find((r) => r.slug === revision.slug);
  assert(cover, 'Revision must belong to the protected legacy cover set');
  const source = read('../site/content/posts/' + revision.slug + '.mdx');
  const front = source.match(/^---\n[\s\S]*?\n---/);
  assert(front);
  const hero = `<NewsFigure media="${cover.media}" priority />`;
  const body = source.slice(front[0].length).replace(/^import [^\n]+;[ \t]*\n/gm, '').trim().slice(hero.length).trim();
  const check = (candidate = body, map = revision) => assertPreservedNewsBody(candidate, cover.bodyBaselineSha256, map, cover.slug);
  check();
  for (const kind of ['equal', 'insert', 'replace']) {
    const span = revision.spans.find((r) => r.kind === kind);
    if (!span) continue;
    const bytes = Buffer.from(body, 'utf8');
    bytes[span.start] ^= 1;
    const changed = bytes.toString('utf8');
    assert.throws(() => check(changed));
    // Updating only the full-body digest must not authorize the altered span.
    const rebased = structuredClone(revision);
    rebased.currentSha256 = bodySha256(changed);
    assert.throws(() => check(changed, rebased));
    controls += 2;
  }
  const deleted = structuredClone(revision);
  deleted.spans[0].kind = 'delete';
  assert.throws(() => check(body, deleted));
  const gap = structuredClone(revision);
  gap.spans[0].end -= 1;
  assert.throws(() => check(body, gap));
  const reversed = structuredClone(revision);
  reversed.spans.reverse();
  assert.throws(() => check(body, reversed));
  const omitted = structuredClone(revision);
  omitted.spans.pop();
  assert.throws(() => check(body, omitted));
  const originalSpan = revision.spans.find((r) => r.kind === 'equal');
  const changedOriginal = Buffer.from(body, 'utf8');
  changedOriginal[originalSpan.start] ^= 1;
  const changedText = changedOriginal.toString('utf8');
  const fullyRebased = structuredClone(revision);
  fullyRebased.currentSha256 = bodySha256(changedText);
  const rebasedSpan = fullyRebased.spans.find((r) => r.kind === 'equal');
  rebasedSpan.sha256 = bodySha256(changedOriginal.subarray(rebasedSpan.start, rebasedSpan.end));
  // Even rebasing both current digests cannot replace the historical baseline.
  assert.throws(() => check(changedText, fullyRebased));
  const replacement = revision.spans.find((r) => r.kind === 'replace');
  if (replacement) {
    const changedBefore = structuredClone(revision);
    const span = changedBefore.spans.find((r) => r.kind === 'replace');
    span.before += ' changed';
    span.beforeSha256 = bodySha256(span.before);
    assert.throws(() => check(body, changedBefore));
    const noReason = structuredClone(revision);
    delete noReason.spans.find((r) => r.kind === 'replace').reason;
    assert.throws(() => check(body, noReason));
    controls += 2;
  }
  // The expanded body still fails without its explicit revision map.
  assert.throws(() => assertPreservedNewsBody(body, cover.bodyBaselineSha256, undefined, cover.slug));
  controls += 6;
}
console.log(`news-body-preservation: PASS ${fixture.entries.length} exact revision maps; ${controls} tamper controls; historical baseline digests unchanged`);

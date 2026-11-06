import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const bodySha256 = (value) => createHash('sha256').update(value).digest('hex');

// Check editorial additions without replacing the historical cover baseline.
// This is a byte-preservation contract, not scientific or publication approval.
export function assertPreservedNewsBody(body, baselineSha256, revision, slug) {
  const current = Buffer.from(body, 'utf8');
  if (!revision) {
    assert.equal(bodySha256(current), baselineSha256, `${slug}: original body changed`);
    return;
  }
  assert.equal(revision.slug, slug);
  assert.equal(revision.baselineSha256, baselineSha256, `${slug}: historical baseline changed`);
  assert.equal(bodySha256(current), revision.currentSha256, `${slug}: unreviewed revision`);
  assert(Array.isArray(revision.spans) && revision.spans.length > 0);
  const original = [];
  let cursor = 0;
  let retainedBytes = 0;
  for (const span of revision.spans) {
    assert(['equal', 'insert', 'replace'].includes(span.kind), `${slug}: unclassified/deleted original span`);
    assert(Number.isSafeInteger(span.start) && Number.isSafeInteger(span.end));
    assert.equal(span.start, cursor, `${slug}: span gap, overlap or order change`);
    assert(span.end > span.start && span.end <= current.length, `${slug}: invalid UTF-8 byte span`);
    const bytes = current.subarray(span.start, span.end);
    assert(Buffer.from(bytes.toString('utf8'), 'utf8').equals(bytes), `${slug}: split UTF-8 character`);
    assert.equal(bodySha256(bytes), span.sha256, `${slug}: span content changed`);
    if (span.kind === 'equal') {
      assert(!Object.hasOwn(span, 'before'), `${slug}: equal span cannot restore hidden text`);
      original.push(bytes);
      retainedBytes += bytes.length;
    } else if (span.kind === 'replace') {
      assert(typeof span.before === 'string' && span.before.trim(), `${slug}: missing original replacement text`);
      assert(typeof span.reason === 'string' && span.reason.trim(), `${slug}: replacement reason required`);
      assert(typeof span.sourceLocator === 'string' && span.sourceLocator.trim(), `${slug}: replacement locator required`);
      assert.equal(new URL(span.sourceUrl).protocol, 'https:');
      const before = Buffer.from(span.before, 'utf8');
      assert.equal(bodySha256(before), span.beforeSha256, `${slug}: original replacement text changed`);
      original.push(before);
    } else {
      assert(!Object.hasOwn(span, 'before'), `${slug}: insertion cannot replace original text`);
    }
    cursor = span.end;
  }
  assert.equal(cursor, current.length, `${slug}: incomplete span coverage`);
  assert(retainedBytes > 0, `${slug}: no original body retained`);
  assert.equal(bodySha256(Buffer.concat(original)), baselineSha256, `${slug}: reconstructed original body changed`);
}

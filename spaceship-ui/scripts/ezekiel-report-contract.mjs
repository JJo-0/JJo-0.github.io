import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseFragment } from 'parse5';
const manifest = JSON.parse(fs.readFileSync('src/data/ezekiel-reports/audit-manifest.json'));
const text = n => n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join('');
const normalized = s => s.replaceAll('\u200b', '').replace(/\s+/g, ' ').trim();
const hash = s => createHash('sha256').update(s).digest('hex');
const find = (n, tag) => [...(n.tagName === tag ? [n] : []), ...(n.childNodes || []).flatMap(c => find(c, tag))];
for (const image of JSON.parse(fs.readFileSync('src/data/ezekiel-sources/checksums.json'))) {
  const file = image.file.split('/').pop().replaceAll('_', '-');
  const bytes = fs.readFileSync(`site/assets/assets/posts/ezekiel-2-1-3-11/${file}`);
  assert.equal(bytes.length, image.size_bytes);
  assert.equal(hash(bytes), image.sha256);
}
assert.equal(manifest.reports.length, 3);
assert.deepEqual(manifest.reports.map(r => [r.tables, r.referenceCount]), [[6, 29], [4, 18], [11, 39]]);
for (const report of manifest.reports) {
  const html = fs.readFileSync(`src/data/ezekiel-reports/report-${report.report}.html`, 'utf8');
  assert.equal(hash(html), report.renderedSha256);
  const tree = parseFragment(html);
  const paragraphs = new Set(['p', 'h2', 'h3'].flatMap(tag => find(tree, tag)).map(p => hash(normalized(text(p)))));
  for (const originalHash of report.paragraphHashes) assert(paragraphs.has(originalHash), `Missing original paragraph: report ${report.report}, ${originalHash}`);
  assert.deepEqual(find(tree, 'table').map(t => hash(normalized(text(t)))), report.tableHashes);
  assert.equal(find(tree, 'table').length, report.tables);
  for (const heading of report.joinedHeadings) assert(normalized(text(tree)).includes(heading));
  for (const reference of report.references) {
    assert(html.includes(`id="reference-ezekiel-${report.report}-${reference.number}"`));
    assert(normalized(text(tree)).includes(reference.label));
    assert(html.includes(reference.url.replaceAll('&', '&amp;')));
  }
  assert(!/<script|\bonclick=|data-lazy-src=/.test(html));
  console.log(`Ezekiel ${report.report}: ${report.paragraphHashes.length} original paragraph hashes, ${report.tables} tables, ${report.referenceCount} bottom references PASS`);
}

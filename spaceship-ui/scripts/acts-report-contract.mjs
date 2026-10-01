import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseFragment } from 'parse5';
const manifest = JSON.parse(fs.readFileSync('src/data/acts-reports/audit-manifest.json'));
const text = n => n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join('');
const normalized = s => s.replaceAll('\u200b', '').replace(/\s+/g, ' ').trim();
const hash = s => createHash('sha256').update(s).digest('hex');
const find = (n, tag) => [...(n.tagName === tag ? [n] : []), ...(n.childNodes || []).flatMap(c => find(c, tag))];
for (const image of JSON.parse(fs.readFileSync('src/data/acts-reports/image-manifest.json')).images) {
  const file = image.file;
  const bytes = fs.readFileSync(`site/assets/assets/posts/acts-2-14-37/${file}`);
  assert.equal(bytes.length, image.bytes);
  assert.equal(hash(bytes), image.sha256);
}
assert.equal(manifest.reports.length, 3);
assert.deepEqual(manifest.reports.map(r => [r.tables, r.referenceCount]), [[10, 40], [8, 42], [6, 36]]);
for (const report of manifest.reports) {
  const html = fs.readFileSync(`src/data/acts-reports/report-${report.report}.html`, 'utf8');
  assert.equal(hash(html), report.renderedSha256);
  const tree = parseFragment(html);
  const paragraphs = new Set(['p', 'h2', 'h3'].flatMap(tag => find(tree, tag)).map(p => hash(normalized(text(p)))));
  for (const originalHash of report.paragraphHashes) assert(paragraphs.has(originalHash), `Missing original paragraph: report ${report.report}, ${originalHash}`);
  assert.deepEqual(find(tree, 'table').map(t => hash(normalized(text(t)))), report.tableHashes);
  assert.equal(find(tree, 'table').length, report.tables);
  for (const heading of report.joinedHeadings) assert(normalized(text(tree)).includes(heading));
  for (const reference of report.references) {
    assert(html.includes(`id="reference-acts-${report.report}-${reference.number}"`));
    assert(normalized(text(tree)).includes(reference.label));
    assert(html.includes(reference.url.replaceAll('&', '&amp;')));
  }
  assert(!/<script|\bonclick=|data-lazy-src=/.test(html));
  console.log(`Acts ${report.report}: ${report.paragraphHashes.length} original paragraph hashes, ${report.tables} tables, ${report.referenceCount} bottom references PASS`);
}

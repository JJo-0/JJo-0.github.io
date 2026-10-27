import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { newsSourceFilename, newsSourceIdentity } from './news-media-source-file.mjs';

const inventoryBatches = new Map([
  ['2026-10-25', { count: 9, path: '../site/news-approved-visual-inventory-20261025.json' }],
  ['2026-10-28', { count: 3, path: '../site/news-approved-visual-inventory-20261028.json' }],
]);

export function validateVisualInventory(inventory, catalogue, readSource, { approvalDate = inventory.approvalDate } = {}) {
  assert.equal(inventory.schemaVersion, 'approved-visual-inventory-v1');
  const batch = inventoryBatches.get(approvalDate);
  assert(batch, `No fixed visual inventory batch for ${approvalDate}`);
  assert.equal(inventory.approvalDate, approvalDate);
  assert.equal(inventory.entries.length, batch.count, `Approval covers exactly ${batch.count} articles`);
  const result = new Map();
  for (const row of inventory.entries) {
    assert.match(row.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert(!result.has(row.slug), 'Duplicate approved article');
    assert(Array.isArray(row.mediaIds) && row.mediaIds.length > 0, 'Empty inventory cannot pass');
    assert.equal(new Set(row.mediaIds).size, row.mediaIds.length, 'Duplicate approved media');
    const sourceFile = newsSourceFilename({ slug: row.slug, sourceFile: row.sourceFile });
    const source = readSource(row.slug, sourceFile);
    assert.deepEqual(newsSourceIdentity({ slug: row.slug, sourceFile }, source), { sourceFile, effectiveSlug: row.slug });
    const tags = [...source.matchAll(/<NewsFigure\b([^>]*?)\/>/g)];
    const actual = tags.map((tag) => {
      const media = tag[1].match(/\bmedia="([^"]+)"/);
      assert(media, 'Inventory requires statically declared media IDs');
      return media[1];
    });
    assert.deepEqual(actual, row.mediaIds, `${row.slug}: source media changed; update approval inventory`);
    assert.equal(Object.entries(catalogue).filter(([, item]) => item.slug === row.slug).length, row.mediaIds.length, 'Registered media may not be silently omitted');
    const metadata = row.mediaIds.map((id) => {
      const item = catalogue[id];
      assert(item && item.slug === row.slug, `Unknown or wrong-article media: ${id}`);
      return item;
    });
    assert.equal(createHash('sha256').update(JSON.stringify(metadata)).digest('hex'), row.mediaMetadataSha256, `${row.slug}: image/source/rights metadata changed`);
    assert(Number.isInteger(row.newsDiagramCount) && row.newsDiagramCount >= 0);
    assert.equal([...source.matchAll(/<NewsDiagram\b/g)].length, row.newsDiagramCount, 'Declared diagrams changed');
    result.set(row.slug, row);
  }
  return result;
}

export function loadApprovedVisualInventory(catalogue) {
  const combined = new Map();
  for (const [approvalDate, batch] of inventoryBatches) {
    const inventory = JSON.parse(fs.readFileSync(new URL(batch.path, import.meta.url), 'utf8'));
    const rows = validateVisualInventory(inventory, catalogue, (_slug, sourceFile) =>
      fs.readFileSync(new URL(`../site/content/posts/${sourceFile}`, import.meta.url), 'utf8'), { approvalDate });
    for (const [slug, row] of rows) {
      assert(!combined.has(slug), `Duplicate approved article across batches: ${slug}`);
      combined.set(slug, row);
    }
  }
  assert.equal(combined.size, 12, 'The two fixed approval batches cover twelve unique articles');
  return combined;
}

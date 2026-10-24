import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

export function validateVisualInventory(inventory, catalogue, readSource) {
  assert.equal(inventory.schemaVersion, 'approved-visual-inventory-v1');
  assert.equal(inventory.approvalDate, '2026-10-25');
  assert.equal(inventory.entries.length, 9, 'Approval covers nine existing articles only');
  const result = new Map();
  for (const row of inventory.entries) {
    assert.match(row.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert(!result.has(row.slug), 'Duplicate approved article');
    assert(Array.isArray(row.mediaIds) && row.mediaIds.length > 0, 'Empty inventory cannot pass');
    assert.equal(new Set(row.mediaIds).size, row.mediaIds.length, 'Duplicate approved media');
    const source = readSource(row.slug);
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
  const inventory = JSON.parse(fs.readFileSync(new URL('../site/news-approved-visual-inventory-20261025.json', import.meta.url), 'utf8'));
  return validateVisualInventory(inventory, catalogue, (slug) => fs.readFileSync(new URL(`../site/content/posts/${slug}.mdx`, import.meta.url), 'utf8'));
}

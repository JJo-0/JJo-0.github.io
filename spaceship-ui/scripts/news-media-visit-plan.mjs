import assert from 'node:assert/strict';

// Group navigations, not evidence: retain every original registry entry.
export function groupMediaByPost(entries) {
  assert(Array.isArray(entries), 'Media entries must be an array');
  const groups = new Map();
  const ids = new Set();
  for (const entry of entries) {
    assert(Array.isArray(entry) && entry.length === 2, 'Malformed media entry');
    const [id, item] = entry;
    assert(typeof id === 'string' && id.length > 0 && !ids.has(id), 'Missing or duplicate media ID');
    assert(item && typeof item === 'object' && !Array.isArray(item), 'Malformed media metadata');
    assert(typeof item.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug), 'Unsafe media slug');
    ids.add(id);
    if (!groups.has(item.slug)) groups.set(item.slug, []);
    groups.get(item.slug).push(entry);
  }
  assert.equal([...groups.values()].reduce((n, items) => n + items.length, 0), entries.length);
  return groups;
}

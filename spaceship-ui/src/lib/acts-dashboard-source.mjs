import { applyOriginalOverviewFonts, getNativeActsHtml } from './acts-native-source.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { brotliDecompressSync } from 'node:zlib';

export const actsDashboardNames = Object.freeze([1, 2, 3].map((n) => `acts-overview-${n}.html`));
const digest = (value) => createHash('sha256').update(value).digest('hex');

/** Load the approved, lossless HTML snapshots. No content rewriting occurs here. */
export function loadActsDashboards(directory = path.resolve('src/data/acts-dashboards')) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  if (manifest.encoding !== 'brotli-json' || manifest.parts.length !== 8) throw new Error('Invalid Acts archive manifest');
  const pieces = manifest.parts.map((part, index) => {
    const expected = `part-${String(index + 1).padStart(2, '0')}.br`;
    if (part.file !== expected) throw new Error('Invalid Acts archive part path');
    const bytes = fs.readFileSync(path.join(directory, expected));
    if (bytes.length !== part.bytes || digest(bytes) !== part.sha256) throw new Error(`Acts source checksum mismatch: ${expected}`);
    return bytes;
  });
  const compressed = Buffer.concat(pieces);
  if (digest(compressed) !== manifest.sha256) throw new Error('Acts archive checksum mismatch');
  const decoded = brotliDecompressSync(compressed, { maxOutputLength: 1_000_000 });
  /** @type {Record<string, string>} */
  const pages = JSON.parse(decoded.toString('utf8'));
  if (JSON.stringify(Object.keys(pages).sort()) !== JSON.stringify([...actsDashboardNames].sort())) throw new Error('Acts archive must contain exactly three dashboards');
  for (const name of actsDashboardNames) {
    if (typeof pages[name] !== 'string' || !pages[name].startsWith('<!DOCTYPE html>') || digest(pages[name]) !== manifest.pages[name]) throw new Error(`Acts HTML checksum mismatch: ${name}`);
  }
  return Object.freeze(pages);
}

/** @type {Readonly<Record<string, string>> | undefined} */
let cached;
/** @param {number} order */
export function getActsDashboardHtml(order) {
  if (Number.isInteger(order) && order >= 4 && order <= 9) return getNativeActsHtml(order);
  if (![1, 2, 3].includes(order)) throw new Error(`Unknown Acts dashboard: ${order}`);
  cached ??= loadActsDashboards();
  return applyOriginalOverviewFonts(cached[`acts-overview-${order}.html`], order);
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { getActsDashboardHtml } from '../src/lib/acts-dashboard-source.mjs';
const sha = (text) => createHash('sha256').update(text).digest('hex');
const manifest = JSON.parse(fs.readFileSync('src/data/acts-native/manifest.json', 'utf8'));
const series = JSON.parse(fs.readFileSync('src/data/acts-series.json', 'utf8'));
const expectedHashes = [
  'f00cf60c6bc03bfd5cdfd9985ce3339a55ec290e09b36391bbe65bd9babb26cd',
  '01936d90c0c37aab855f9325579e0d91ecdd92eebcf04133deac21ea46424554',
  '293f0d579eefd7caaea1c5c83e8c85ef21e064cf0f926b8178b807a002f4e9b2',
  '8a2e71262bd2beaeb7b5d5c9385d379ba1fcdbe38520102d3c335defbcf55a28',
  '5a6f82b1670ead4112f7554a994bb515c8054710155ebae6f6ba2a4a26a454b9',
  '4dd4c6941b36fe707228859b7d6fc5b1756c625d5315dc68c3e6e48ea856b5bb',
];
assert.deepEqual(
  series.entries.map((e) => e.order),
  [1, 2, 3, 4, 5, 6, 7, 8, 9]
);
assert.deepEqual(
  manifest.pages.map((e) => e.sha256),
  expectedHashes
);
let scripts = 0,
  styles = 0,
  canvases = 0;
for (const page of manifest.pages) {
  const raw = fs.readFileSync(`src/data/acts-native/${page.slug}.html`, 'utf8');
  assert.equal(sha(raw), page.sha256);
  assert.equal(Buffer.byteLength(raw), page.bytes);
  const rendered = getActsDashboardHtml(page.order);
  for (const m of raw.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    assert(rendered.includes(m[1]), `Source JS was rewritten: ${page.slug}`);
    scripts++;
  }
  for (const m of raw.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
    assert(rendered.includes(m[1]), `Source CSS was rewritten: ${page.slug}`);
    styles++;
  }
  const count = (raw.match(/<canvas\b/g) || []).length;
  canvases += count;
  assert.equal((rendered.match(/<canvas\b/g) || []).length, count);
  assert(!rendered.includes('src="https://cdn.tailwindcss.com'));
  assert(rendered.includes('chart.umd-4.4.8.js'));
  assert(rendered.includes(series.entries.find((e) => e.order === page.order).source));
  assert(!/font-family\s*:\s*var\(--jjo/.test(rendered));
  const endpoint = `src/pages/assets/interactive/${page.slug}.html.ts`;
  assert(fs.readFileSync(endpoint, 'utf8').includes(`getActsDashboardHtml(${page.order})`));
}
assert.equal(canvases, 17, '4+4+1 original passage charts, plus 2+2+4 new passage charts');
const wrapper = fs.readFileSync('src/components/post/ActsDashboard.astro', 'utf8');
assert(!wrapper.includes("'--jjo-reading':") && !wrapper.includes("'--jjo-editorial':"));
const adapter = fs.readFileSync('site/assets/assets/interactive/acts-native/adapter.js', 'utf8');
assert(
  !adapter.includes('family:') && !adapter.includes('fontFamily'),
  'The hosting adapter cannot overwrite original fonts'
);
for (const order of [1, 2, 3]) {
  const html = getActsDashboardHtml(order);
  assert(html.includes('data-original-typography'));
  assert(!html.includes('family:p.font'));
  assert(!/font-family:\s*var\(--jjo-reading\)/.test(html));
}
console.log(
  `acts-native-contract: PASS 9 ordered routes; 6 original SHA256 files; ${scripts} source scripts and ${styles} source styles unchanged; 17 native charts + 5 overview charts; no inherited blog fonts`
);

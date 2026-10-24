import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { getOgFonts, getOgKoreanBoldFont } from '../src/lib/og-font.ts';

const require = createRequire(import.meta.url);
const satoriRequire = createRequire(require.resolve('satori'));
const { parse } = satoriRequire('@shuding/opentype.js');
const fonts = await getOgFonts();
const parsed = fonts.map(font => parse(font.data));
assert.equal(fonts.length, 4);
assert.equal(await getOgKoreanBoldFont(), fonts[1].data, 'Font bytes must be cached');
const provenance = JSON.parse(fs.readFileSync('site/assets/fonts/og-font-provenance.json'));
assert.equal(createHash('sha256').update(Buffer.from(fonts[1].data)).digest('hex'), provenance.sha256);
assert(fs.readFileSync('site/assets/fonts/OFL-NanumGothic.txt', 'utf8').includes('SIL OPEN FONT LICENSE Version 1.1'));
for (const font of provenance.scientificFallbacks) {
  assert.equal(createHash('sha256').update(fs.readFileSync(`site/assets/fonts/${font.font}`)).digest('hex'), font.sha256);
  assert(fs.readFileSync(`site/assets/fonts/${font.licenseFile}`, 'utf8').includes('SIL OPEN FONT LICENSE Version 1.1'));
}
// Check the entire modern Hangul block, not just a hand-picked screenshot.
for (let codepoint = 0xac00; codepoint <= 0xd7a3; codepoint++) {
  const char = String.fromCodePoint(codepoint);
  assert(parsed.some(font => font.charToGlyphIndex(char) > 0), `Missing Korean glyph ${char}`);
}
for (const route of ['src/pages/og/[slug].png.ts', 'src/pages/og/site.png.ts']) {
  const source = fs.readFileSync(route, 'utf8');
  assert(source.includes('await getOgFonts()') && source.includes('font-family: Outfit, NanumGothic, NotoSans, NotoSansSymbols;'), `${route}: Korean/scientific fallback missing`);
}
for (const char of 'ε₂μπα₃①②③') {
  assert(parsed.some(font => font.charToGlyphIndex(char) > 0), `Missing scientific/series glyph ${char}`);
}
const layout = fs.readFileSync('src/layouts/Layout.astro', 'utf8');
assert(fs.readFileSync('src/pages/og/[slug].png.ts', 'utf8').includes("timeZone: post.data.publicationTimeZone ?? 'UTC'"));
assert.equal(new Date('2026-10-08T00:00:00+09:00').toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'Asia/Seoul' }), 'October 8, 2026');
assert(layout.includes("pageOgImage.pathname.startsWith('/og/')"));
assert(layout.includes("pageOgImage.searchParams.set('v', 'ko-font-20261024')"));
console.log('OG Korean font: PASS 11,172 Hangul glyphs, cached offline fonts, upstream hash/license, both renderers and cache refresh');

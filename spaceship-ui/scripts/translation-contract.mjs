import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex');
const registry = JSON.parse(read('site/translations.json'));
const captions = JSON.parse(read('site/news-media-en.json'));
const originals = JSON.parse(read('site/news-media.json'));
const body = (s) => s.replace(/^---\n[\s\S]*?\n---\s*/, '').trim();
const field = (s, k) => s.match(new RegExp(`^${k}: (.+)$`, 'm'))?.[1]?.replace(/^['"]|['"]$/g, '');
const structure = (s) => ({
  h2: (s.match(/^## /gm)||[]).length, h3:(s.match(/^### /gm)||[]).length,
  tables:(s.match(/^\|\s*-/gm)||[]).length,
  math:[...s.matchAll(/<Math\b.*?\/>/gs)].map((m)=>m[0]),
  media:[...s.matchAll(/<NewsFigure media="([^"]+)"/g)].map((m)=>m[1]),
  urls:[...new Set(s.match(/https:\/\/[^\s)<>"\]]+/g)||[])].sort(),
});
assert.equal(registry.pairs.length,4,'Reviewed translation batch must be extended explicitly');
assert.equal(new Set(registry.pairs.map((r)=>r.key)).size,4);
for (const pair of registry.pairs) {
  const ko = read('site/content/posts/'+pair.koFile), en=read('site/content/posts/'+pair.enFile);
  assert.match(ko,/^lang: ko(?:-KR)?$/m); assert.match(en,/^lang: en$/m);
  for(const s of [ko,en]) {assert.equal(field(s,'draft'),'false');assert.equal(field(s,'translationKey'),pair.key);}
  assert.equal(field(ko,'pubDate'),field(en,'pubDate'));assert.equal(field(en,'slug'),pair.enSlug);
  assert(ko.includes(`  en: ${pair.enSlug}`));assert(en.includes(`  ko-KR: ${pair.koSlug}`));
  assert.equal(hash(body(ko)),pair.sourceBodySha256,`${pair.key}: source changed; re-review the full translation`);
  assert.equal(hash(body(en)),pair.englishBodySha256,`${pair.key}: English changed without parity review`);
  const a=structure(body(ko)),b=structure(body(en));assert.deepEqual(a,b,`${pair.key}: headings, tables, equations, media and sources must be preserved`);
  assert.equal(pair.paragraphReview.ko,pair.paragraphReview.en);
  assert.equal(a.h2,pair.structure.h2);assert.equal(a.h3,pair.structure.h3);assert.deepEqual(a.media,pair.structure.media);
  assert(!/[가-힣]/.test(body(en)),`${pair.key}: untranslated Korean prose remains`);
  for(const id of b.media) {
    const cap=captions[id];assert(cap,`${id}: English captions required`);
    for(const k of ['alt','caption','credit','license','changes']) assert(cap[k] && !/[가-힣]/.test(cap[k]),`${id}: ${k}`);
    const src=cap.src || originals[id].src;assert(fs.existsSync(new URL('site/assets'+src,root)),src);
    if(src.endsWith('.svg')) assert(!/[가-힣]/.test(read('site/assets'+src)),`${id}: embedded SVG text untranslated`);
  }
}
const translatedFiles=fs.readdirSync(new URL('site/content/posts/',root)).filter((p)=>p.endsWith('.mdx') && /^lang: en$/m.test(read('site/content/posts/'+p)));
assert.deepEqual(translatedFiles.sort(),registry.pairs.map((p)=>p.enFile).sort(),'Every English post must have a reviewed source pair');
console.log('translation-contract: PASS four full translations; reciprocal identities, content hashes, equations, images and source links');

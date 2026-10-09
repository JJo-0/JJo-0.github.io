import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { parseFragment } from 'parse5';
import { getIsaiahHtml } from '../src/lib/isaiah43-source.mjs';
import { illustrateIsaiahReport, isaiahImages } from '../src/lib/isaiah43-images.mjs';
const root = 'src/data/isaiah43';
const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`));
const hash = s => createHash('sha256').update(s).digest('hex');
const all = n => [n, ...(n.childNodes || []).flatMap(all)];
for (const entry of manifest.reports) {
 const i = entry.number;
 const raw = fs.readFileSync(`${root}/originals/dashboard-${i}.txt`);
 assert.equal(raw.length, entry.rawBytes); assert.equal(hash(raw),entry.rawSha256);
 const report = fs.readFileSync(`${root}/reports/${i}.html`,'utf8');
 assert.equal(hash(report),entry.reportSha256);
 const illustrated = illustrateIsaiahReport(report, i);
 assert.equal(illustrated.replace(/<figure data-isaiah-image=[\s\S]*?<\/figure>/g, ''), report);
 for (const image of isaiahImages.filter(image => image.report === i)) {
  assert(fs.existsSync(`site/assets/assets/posts/ezekiel-2-1-3-11/${image.filename}`));
  assert(illustrated.indexOf(`data-isaiah-image="${image.id}"`) > illustrated.indexOf(image.heading));
 }
 const nodes=all(parseFragment(report));
 assert.equal(nodes.filter(n=>n.tagName==='table').length,entry.tables);
 const ids=nodes.flatMap(n=>(n.attrs||[]).filter(a=>a.name==='id').map(a=>a.value));
 assert.equal(ids.length,new Set(ids).size);
 for(const n of nodes) for(const a of n.attrs||[]) if(a.name==='href' && a.value.startsWith('#')) assert(ids.includes(a.value.slice(1)),a.value);
 assert(!report.includes('gemini.google.com/app/'));
 assert(!nodes.some(n=>n.tagName==='script'));
 const served=getIsaiahHtml(i);
 assert(!served.includes('cdn.tailwindcss.com')); assert(!served.includes('cdn.jsdelivr.net/npm/chart.js'));
 for(const match of served.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
 assert.equal([...served.matchAll(/<canvas\b/g)].length,entry.charts.length);
 assert.equal(hash(fs.readFileSync(`site/assets/assets/interactive/isaiah43/${i}.css`)),entry.cssSha256);
 const expected = i===2 ? raw.toString().replace('slate-navy:',"'slate-navy':") : raw.toString().replace(/\\([<:@`.-])/g,'$1').replaceAll('&#x20;',' ');
 assert.equal(fs.readFileSync(`${root}/dashboards/${i}.html`,'utf8'),expected);
}
console.log('Isaiah PASS: 3 byte-preserved originals; explicit normalization; 17 tables; citations; 6 canvases; JS parsing; private URL exclusion.');

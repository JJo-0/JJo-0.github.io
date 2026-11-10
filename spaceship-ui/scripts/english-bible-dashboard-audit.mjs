import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {parse} from 'acorn';
import {getNativeActsHtml} from '../src/lib/acts-native-source.mjs';
import {getActsDashboardHtml} from '../src/lib/acts-dashboard-source.mjs';
import {getIsaiahHtml} from '../src/lib/isaiah43-source.mjs';
function originalHtml(file){
 const n=Number(file.match(/-(\d)\.html$/)?.[1]);
 if(file.startsWith('acts-overview-'))return getActsDashboardHtml(n);
 if(file.startsWith('acts-1-1-5-'))return getNativeActsHtml(n+3);
 if(file.startsWith('acts-1-6-14-'))return getNativeActsHtml(n+6);
 if(file.startsWith('isaiah-dashboard-'))return getIsaiahHtml(n);
 if(file.startsWith('isaiah-report-'))return fs.readFileSync(`src/data/isaiah43/reports/${n}.html`,'utf8');
 if(file.startsWith('ezekiel-report-'))return fs.readFileSync(`src/data/ezekiel-reports/report-${n}.html`,'utf8');
 throw Error('Unknown English Bible source: '+file);
}
const manifest=JSON.parse(fs.readFileSync('src/data/bible-english/manifest.json'));
function skeleton(v){if(Array.isArray(v))return v.map(skeleton);if(!v||typeof v!=='object')return v;if(v.type==='Literal'&&typeof v.value==='string')return {type:'LocalizedString'};if(v.type==='TemplateElement')return {type:v.type,tail:v.tail};return Object.fromEntries(Object.entries(v).filter(([k])=>!['start','end','raw'].includes(k)).map(([k,x])=>[k,skeleton(x)]));}
const scripts=s=>[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>parse(m[1],{ecmaVersion:'latest',allowAwaitOutsideFunction:true}));
for(const item of manifest){
 const src=originalHtml(item.file),dst=fs.readFileSync('src/data/bible-english/'+item.file,'utf8');
 const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
 assert.equal(sha(src),item.sourceSha256,item.file+' original source hash');
 assert.equal(sha(dst),item.englishSha256,item.file+' reviewed English hash');
 const withoutCredit=x=>x.replace(/<aside class="english-scripture-credit"[\s\S]*?<\/aside>/g,'');
 const externalLinks=x=>[...x.matchAll(/href=["'](https?:\/\/[^"']+)["']/g)].map(m=>m[1]).sort();
 assert.deepEqual(externalLinks(src),externalLinks(withoutCredit(dst)),item.file+' source links');
 const images=x=>[...x.matchAll(/<img\b[^>]*src=["']([^"']+)["']/g)].map(m=>m[1]);
 assert.deepEqual(images(src),images(dst),item.file+' original image sequence');
 for(const tag of ['h2','h3','h4','table','tr'])assert.equal([...src.matchAll(new RegExp('<'+tag+'\\b','g'))].length,[...dst.matchAll(new RegExp('<'+tag+'\\b','g'))].length,item.file+' '+tag+' coverage');
 assert(!/[가-힣]/.test(dst.replace(/<!--[\s\S]*?-->/g,'')),item.file+' has Korean outside comments');
 assert.deepEqual(scripts(src).map(skeleton),scripts(dst).map(skeleton),item.file+' script operations/numbers');
 const ids=s=>[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids(src),ids(dst),item.file+' control/target identities');
 if(item.file==='acts-1-1-5-1.html'){
  const options=[...dst.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]);const positions=[...dst.matchAll(/\bpos:\s*("(?:[^"\\]|\\.)*")/g)].map(m=>JSON.parse(m[1]));assert.equal(positions.length,20);assert(positions.every(p=>options.includes(p)),'Every Greek word matches an English filter option');
 }
 console.log(item.file+': PASS; source/English hashes, links, images, headings/tables, English language, script structure/numbers, control IDs; browser interactions not tested');
}

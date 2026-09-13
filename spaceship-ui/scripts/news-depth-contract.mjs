import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const root=new URL('../',import.meta.url), read=(p)=>fs.readFileSync(new URL(p,root),'utf8');
const sha=(s)=>crypto.createHash('sha256').update(s).digest('hex');
const report=JSON.parse(read('site/news-depth-review-20260913.json'));
const covers=JSON.parse(read('site/news-covers-20260912.json'));
function body(s){return s.replace(/^---\n[\s\S]*?\n---/,'').trim();}
function prose(s) {
 s=body(s).split(/\n## (?:9\. )?(?:출처|원문과 더 읽을 자료)/)[0];
 s=s.replace(/^import .*?;\s*$/gm,'').replace(/\{\/\*[\s\S]*?\*\/\}/g,'');
 s=s.replace(/<(?:Math|NewsFigure|ReferenceFigure|NewsDiagram)\b[\s\S]*?\/>/g,'').replace(/<[^>]+>/g,'');
 s=s.replace(/^\[\^[^\]]+\]:.*$/gm,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\[(?:\d+|\^primary)\]/g,'');
 return s.replace(/^#+\s*/gm,'').replaceAll('**','').replaceAll('`','').replace(/\s+/g,' ').trim();
}
assert.equal(report.entries.length,20);assert.equal(new Set(report.entries.map((r)=>r.file)).size,20);
for(const row of report.entries) {
 const s=read('site/content/posts/'+row.file),n=Array.from(prose(s)).length;
 assert(n>=7000 && n<=10000,`${row.slug}: ${n} prose characters`);assert.equal(n,row.afterCharacters);
 assert.equal(sha(body(s)),row.newBodySha256,`${row.slug}: reviewed content changed`);
 assert.match(s,new RegExp(`^pubDate: ${row.pubDate}$`,'m'));
 const cover=covers.entries.find((r)=>r.slug===row.slug);
 if(cover){assert.equal(cover.bodyBaselineSha256,row.revisedCoverBodySha256);assert.match(row.previousCoverBodySha256,/^[a-f0-9]{64}$/);}
}
const images=JSON.parse(read('site/assets/assets/posts/news-depth-20260913/provenance.json'));
assert.equal(images.length,7);
for(const row of images){const bytes=fs.readFileSync(new URL('site/assets'+row.src,root));assert.equal(sha(bytes),row.sha256);assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert(row.sourcePdfSha256 && row.cropPdfPoints.length===4 && row.rights);assert(read('site/content/posts/'+row.slug+'.mdx').includes(row.src));}
console.log('news-depth-contract: PASS 20 reviewed 7,000–10,000-character explainers and seven source figures');

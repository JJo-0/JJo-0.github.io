// Observe the deployed CDN, not a local proxy or a fabricated header policy.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = new URL(process.env.JJO_SMOKE_BASE_URL || 'https://jjo-0.github.io/');
const rows = [];
async function sample(route, label, conditional = {}) {
  const url = new URL(route,base);
  assert.equal(url.origin,base.origin);
  const start = performance.now();
  const response = await fetch(url,{redirect:'manual',headers:conditional,signal:AbortSignal.timeout(20000)});
  const headersMs = performance.now()-start;
  const body = Buffer.from(await response.arrayBuffer());
  const row = {label,url:url.href,status:response.status,headersMs:Math.round(headersMs*10)/10,totalMs:Math.round((performance.now()-start)*10)/10,
    decodedBytes:body.length,cacheControl:response.headers.get('cache-control'),etag:response.headers.get('etag'),lastModified:response.headers.get('last-modified'),age:response.headers.get('age'),encoding:response.headers.get('content-encoding'),contentLength:response.headers.get('content-length'),location:response.headers.get('location'),serverTiming:response.headers.get('server-timing')};
  rows.push(row);
  return {row,body};
}
try {
  const home = await sample('/','home');
  assert.equal(home.row.status,200);
  for (const route of ['/posts','/posts/','/en/posts/','/api/search.json','/en/api/search.json']) {
    const {row}=await sample(route,'route');
    assert(row.status===200 || [301,302,307,308].includes(row.status),row.url);
  }
  // Select actual hashed first-party assets from deployed HTML.
  const assets = [...new Set([...home.body.toString('utf8').matchAll(/(?:href|src)="([^"]*\/_astro\/[^"]+\.(?:js|css|woff2))"/g)].map(m=>m[1]))];
  const picked = ['.js','.css','.woff2'].map(ext=>assets.find(url=>url.endsWith(ext))).filter(Boolean);
  for (const url of picked) {
    const {row} = await sample(url,'hashed asset');
    assert.equal(row.status,200);
    const conditional = row.etag ? {'If-None-Match':row.etag} : row.lastModified ? {'If-Modified-Since':row.lastModified} : null;
    if (conditional) {
      const next = await sample(url,'conditional asset',conditional);
      assert([200,304].includes(next.row.status));
    }
  }
  const header = home.row.etag ? {'If-None-Match':home.row.etag} : home.row.lastModified ? {'If-Modified-Since':home.row.lastModified} : null;
  if (header) assert([200,304].includes((await sample('/','conditional home',header)).row.status));
  console.log('pages-response-audit: PASS '+JSON.stringify(rows));
} finally {
  fs.mkdirSync('mobile-performance',{recursive:true});
  fs.writeFileSync('mobile-performance/pages-response.json',JSON.stringify({base:base.href,measuredAt:new Date().toISOString(),rows},null,2));
}

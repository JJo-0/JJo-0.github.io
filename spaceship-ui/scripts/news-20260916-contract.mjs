import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const sha = (v) => createHash('sha256').update(v).digest('hex');
const edition = JSON.parse(read('../site/news-edition-20260916.json'));
const media = JSON.parse(read('../site/news-media.json'));
const provenance = JSON.parse(read('../site/assets/assets/posts/news-20260916/provenance.json'));
const expected = [
  ['2026-09-16-seawater-hydrogen-water-news', 'hydrogen', ['sep16-hydrogen-1','sep16-hydrogen-2'], 'frontier-one'],
  ['2026-09-16-onprem-medical-agent-news', 'medical', ['sep16-medical-6','sep16-medical-2'], 'frontier-candidate'],
  ['2026-09-16-oect-swelling-mapping-news', 'oect', ['sep16-oect-2','sep16-oect-1'], 'frontier-candidate'],
];
function count(body) {
  return [...body.split('## 9.')[0].replace(/^import .*;\s*$/gm,'').replace(/<[^>]+>/g,'')
    .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\[\d+(?:,\d+)*\]/g,'')
    .replace(/[*#|`>]+/g,'').replace(/\s+/g,' ').trim()].length;
}
assert.equal(edition.edition,'2026-09-16');
assert.equal(provenance.length,6);
assert.equal(new Set(provenance.map((p)=>p.src)).size,6);
assert.deepEqual(edition.entries.map((e)=>e.slug),expected.map((e)=>e[0]));
for (const [index,[slug,key,ids,selection]] of expected.entries()) {
  const entry=edition.entries[index];
  const post=read(`../site/content/posts/${slug}.mdx`);
  const fm=post.match(/^---\r?\n([\s\S]*?)\r?\n---/);assert(fm);
  for(const line of ['draft: false','lang: ko','pubDate: 2026-09-16','researchFeatured: false',`slug: ${slug}`])
    assert(fm[1].split('\n').includes(line),`${slug}: ${line}`);
  assert(fm[1].includes(`  - ${selection}\n`));
  assert(!fm[1].includes(selection==='frontier-one'?'frontier-candidate':'frontier-one'));
  const body=post.slice(fm[0].length).replace(/^import .*;\s*$/gm,'').trim();
  assert(body.startsWith(`<NewsFigure media="${ids[0]}" priority />`),`${slug}: hero must be first`);
  assert.deepEqual([...body.matchAll(/<NewsFigure\b[^>]*media="([^"]+)"/g)].map((m)=>m[1]),ids);
  assert.deepEqual(entry.mediaIds,ids);
  assert.equal([...body.matchAll(/^## [1-9]\. /gm)].length,9);
  assert.equal(sha(post),entry.postSha256,`${slug}: unreviewed body change`);
  const length=count(body);assert(length>=7000 && length<=10000,`${slug}: ${length} characters`);
  assert.equal(length,entry.bodyCharacters);
  assert(body.includes(entry.source));
  assert.deepEqual(Object.entries(media).filter(([,m])=>m.slug===slug).map(([id])=>id),ids);
  assert.equal(media[ids[0]].order,index+1);
  for(const id of ids){
    const item=media[id],p=provenance.find((x)=>x.id===id);assert(p);
    for(const k of ['src','width','height','source','license','rights','sha256'])assert.equal(item[k],p[k]);
    for(const k of ['alt','caption','credit','kind','changes'])assert(item[k]?.trim());
    assert.equal(item.license,'CC BY 4.0');
    assert.equal(item.rights,'https://creativecommons.org/licenses/by/4.0/');
    assert(item.src.startsWith('/assets/posts/news-20260916/')&&!item.src.includes('..'));
    const bytes=fs.readFileSync(new URL(`../site/assets${item.src}`,import.meta.url));
    assert.equal(sha(bytes),p.sha256);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
    if(key==='medical'){assert.equal(p.role,'reviewed-paper-original');assert(item.kind.includes('이번 논문'));}
    else{assert.equal(p.role,'related-research-background');assert(item.kind.includes(key==='oect'?'2024년':'2026년 7월'));assert(item.caption.includes('아니다'));}
  }
  assert(body.slice(0,550).includes(key==='medical'?'임상시험이 아니다':key==='oect'?'2024년':'2026년 7월'));
  const blogger=read(`../ops/blog-harness/blogger/2026-09-16/${key}.html`);
  assert.equal(sha(blogger),entry.bloggerSha256);
  assert.deepEqual([...blogger.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map((m)=>m[1]),ids.map((id)=>'https://jjo-0.github.io'+media[id].src));
  assert(blogger.includes(entry.source)&&blogger.includes(`https://jjo-0.github.io/posts/${slug}/`));
  assert.doesNotMatch(blogger,/<script\b|<form\b|\son\w+\s*=/i);
  assert(entry.bloggerProseCharacters>=1500&&entry.bloggerProseCharacters<=2500);
}
const hydrogen=read(`../site/content/posts/${expected[0][0]}.mdx`);
for(const s of ['하루 4시간','14.4%','17.7%','반대로','97%','Micron'])assert(hydrogen.includes(s));
const medical=read(`../site/content/posts/${expected[1][0]}.mdx`);
for(const s of ['GLM-4.5-Air','VivaBench','269','272','551','230','49개','0.90','0.85'])assert(medical.includes(s));
const oect=read(`../site/content/posts/${expected[2][0]}.mdx`);
for(const s of ['순차','0.1ms','140만','PBS','특허','구독 제한'])assert(oect.includes(s));
assert.equal(edition.reserve[0].status,'reserve-in-top1-section8');
console.log('news-20260916-contract: PASS 3 published image-first 7,000–10,000-character explainers, 6 licensed images with truthful roles, 3 independent Blogger payloads and explicit evidence boundaries');

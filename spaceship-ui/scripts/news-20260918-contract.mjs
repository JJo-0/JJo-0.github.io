import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import katex from 'katex';
import { assertNewsProseLength } from './news-prose-policy.mjs';

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const digest = (x) => createHash('sha256').update(x).digest('hex');
const manifest = JSON.parse(read('../site/news-edition-20260918.json'));
const media = JSON.parse(read('../site/news-media.json'));
const originals = JSON.parse(read('../site/assets/assets/posts/news-20260918/provenance.json'));
const source = read(`../site/content/posts/${manifest.slug}.mdx`);
const calculations = read('../src/components/post/Paper2AgentNumbers.astro');
function proseLength(s) {
  return [...s.replace(/^---\n[\s\S]*?\n---\s*/, '').split('## 9.')[0]
    .replace(/^import .*;\s*$/gm, '').replace(/<Math\b[\s\S]*?\/>/g, '')
    .replace(/<[^>]+>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\d+(?:,\d+)*\]/g, '').replace(/[*#|`>]+/g, '').replace(/\s+/g, ' ').trim()].length;
}
function checkArticle(s, c = calculations) {
  assert.match(s, /^draft: false$/m); assert.match(s, /^pubDate: 2026-09-18$/m);
  assert.match(s, /^lang: ko$/m); assert.match(s, / {2}- frontier-one\n/);
  assert(s.includes('  - ai-for-science\n'));
  assert.deepEqual([...s.matchAll(/^## (\d)\. /gm)].map(m => Number(m[1])), [1,2,3,4,5,6,7,8,9]);
  assertNewsProseLength(proseLength(s), manifest.slug);
  const body = s.replace(/^---\n[\s\S]*?\n---\s*/, '').replace(/^import .*;\s*$/gm, '').trim();
  assert(body.startsWith('<NewsFigure media="paper2agent-overview" priority />'));
  assert.deepEqual([...s.matchAll(/<NewsFigure media="([^"]+)"/g)].map(m=>m[1]), manifest.mediaIds);
  assert(s.includes('이 26편은 앞선 100편 중 변환에 실패한 26편과 다른 집합이다.'));
  for (const term of ['100편 중 74편', '599개 중 593개', '91.2±1.6%', '80.3±2.3%', '86.3±1.1%', 'bioRxiv 13편과 Nature 13편', '42개 실행 과제', '최초 서버 구축 비용', '사람 연구자가 발현 변화 서명 간 상관분석을 선택']) assert(s.includes(term), term);
  assert(!s.includes('편집 주석:') && !s.includes('원고 선정안의 96/100'), 'Removed reader-facing editorial note');
  for (const term of ['DNA 서열을 입력받아 유전자 조절 활동', 'Biomni는 여러 생의학 분야', 'MCP 도구 정의와 질문만', 'API 기반 Biomni', '별도의 규모 평가', '표준오차(s.e.m.)']) assert(s.includes(term), term);
  const comparison = s.match(/<section data-p2a-comparison[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert(comparison, 'Specific agent comparison table');
  const expectedRows = [
    ['튜토리얼 기반','15','98.7±1.3%','82.7±3.4%','37.3±4.0%'],
    ['새로운 입력·요청','15','100.0±0.0%','78.7±4.4%','56.0±3.4%'],
    ['개방형 연구 질문','30','82.7±2.4%','56.7±2.3%','72.2±2.2%'],
  ];
  const actualRows = comparison.split('\n').filter(line => /^\| (튜토리얼|새로운|개방형)/.test(line)).map(line => line.split('|').slice(1,-1).map(cell => cell.trim()));
  assert.deepEqual(actualRows, expectedRows, 'Benchmark labels, question counts and all method results');
  const counts = {};
  for (const m of s.matchAll(/<a href="#news-ref-(\d+)" data-news-citation="(\d+)" aria-label="[^"]+" data-astro-reload>\[(\d+)\]<\/a>/g)) {
    assert.equal(m[1],m[2]); assert.equal(m[2],m[3]); counts[m[1]]=(counts[m[1]]||0)+1;
  }
  assert.deepEqual(counts, manifest.citationCounts);
  const refs=[...s.matchAll(/<a id="news-ref-(\d+)" href="([^"]+)" data-news-reference="(\d+)" target="_blank" rel="noopener noreferrer">\[(\d+)\]<\/a>/g)].map(m=>{
    assert.equal(m[1],m[3]); assert.equal(m[1],m[4]); assert.equal(new URL(m[2]).protocol,'https:'); return {number:Number(m[1]),url:m[2]};
  });
  assert.deepEqual(refs,manifest.references);
  assert(s.includes('<Paper2AgentNumbers />'));
  assert(s.includes('<Paper2AgentComparison>'), 'Comparison table uses its scoped reading styles');
  assert.deepEqual([...c.matchAll(/<details data-p2a-equation="([^"]+)"/g)].map(m=>m[1]),['papers','tools','accuracy']);
  for (const tex of [...(s+'\n'+c).matchAll(/tex=\{String\.raw`([^`]+)`\}/g)].map(m=>m[1])) katex.renderToString(tex,{throwOnError:true,strict:'error',trust:false});
  for (const term of [String.raw`\frac{74}{100}`,String.raw`\frac{593}{599}`,String.raw`91.2\%-80.3\%`, '분자 74', '분모 100', '분자 593', '분모 599','퍼센트포인트']) assert(c.includes(term),term);
  // Bind every displayed occurrence, not just the presence of one correct copy.
  // The tool rate appears in both the collapsed summary and the explanation.
  const expectedSummaries = [
    String.raw`r_{\mathrm{paper}}=\frac{74}{100}\times100\%=74\%`,
    String.raw`r_{\mathrm{tool}}=\frac{593}{599}\times100\%\approx99.0\%`,
    String.raw`\Delta a=91.2\%-80.3\%=10.9\;\mathrm{pp}`,
  ];
  const summaries = [...c.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map(m =>
    [...m[1].matchAll(/tex=\{String\.raw`([^`]+)`\}/g)].map(t => t[1]));
  assert.deepEqual(summaries, expectedSummaries.map(tex => [tex]), 'Each collapsed formula must retain its actual operands and signs');
  assert.equal(c.split(String.raw`\frac{593}{599}`).length - 1, 2, 'Both copies of the tool denominator');
  assert(Math.abs(593/599*100-98.9983305509182)<1e-10);
  assert.equal((91.2-80.3).toFixed(1),'10.9');
  assert.equal(((91.2-80.3)/80.3*100).toFixed(1),'13.6');
  assert(!/이 수식이 본문에서 정의하거나|수식의 역할과 기호만 확인|범용 계산 절차/.test(c));
}
checkArticle(source);
const mutants=[
  ['wrong Biomni score',s=>s.replace('37.3±4.0%','73.3±4.0%')],
  ['missing agent definition',s=>s.replace('Biomni는 여러 생의학 분야','Biomni라는 이름만 표시')],
  ['editorial note returns',s=>s+'\n편집 주석: 원고 선정안의 96/100'],
  ['missing source link',s=>s.replace('href="#news-ref-1"','href="#news-ref-99"')],
  ['cohort conflation',s=>s.replace('이 26편은 앞선 100편 중 변환에 실패한 26편과 다른 집합이다.','이 26편은 실패한 논문을 그대로 재사용했다.')],
  ['missing original',s=>s.replace('media="paper2agent-scanpy"','media="wrong-figure"')],
  ['wrong date',s=>s.replace('pubDate: 2026-09-18','pubDate: 2025-09-18')],
];
for (const [label,mutate] of mutants) {const wrong=mutate(source);assert.notEqual(wrong,source);assert.throws(()=>checkArticle(wrong),undefined,label);}
for (const [label,oldText,newText] of [['tool denominator',String.raw`\frac{593}{599}`,String.raw`\frac{593}{100}`],['accuracy sign',String.raw`91.2\%-80.3\%`,String.raw`91.2\%+80.3\%`]]) {
  const wrong=calculations.replace(oldText,newText);assert.notEqual(wrong,calculations);assert.throws(()=>checkArticle(source,wrong),undefined,label);
}
assert.equal(digest(source),manifest.postSha256);
assert.equal(proseLength(source),manifest.bodyCharacters);
assert.deepEqual(originals.map(r=>r.id),manifest.mediaIds);
for (const row of originals) {
  const item=media[row.id];assert(item);assert.equal(row.version,'2509.06917v2');assert.equal(row.sourceDate,'2025-10-16');
  for (const field of ['src','width','height','source','license','rights','sha256','credit','slug','order']) assert.equal(item[field],row[field],`${row.id}: ${field}`);
  assert.equal(item.license,'CC BY 4.0');assert(item.kind.includes('2025 preprint'));
  const data=fs.readFileSync(new URL('../site/assets'+row.src,import.meta.url));
  assert.equal(digest(data),row.sha256);assert.equal(data.length,row.bytes);
  assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');
  assert.equal(row.visualReview.imageSha256,row.sha256);assert.equal(row.visualReview.status,'REVIEWED');
  assert(item.alt.length>30 && item.caption.length>80);
}
assert.equal(Object.values(media).filter(x=>x.slug===manifest.slug).length,2);
const blogger=read('../ops/blog-harness/blogger/2026-09-18/paper2agent.html');
assert.equal(digest(blogger),manifest.bloggerSha256);
assert(!/<script\b|<form\b|\son\w+\s*=/i.test(blogger));
assert(blogger.includes(`https://jjo-0.github.io/posts/${manifest.slug}/`));
assert(blogger.includes('이 26편은 앞의 변환 실패 26편과 다른 논문 집합'));
const rendered = new URL(`../dist/posts/${manifest.slug}/index.html`,import.meta.url);
if (fs.existsSync(new URL('../dist/',import.meta.url))) {
  assert(fs.existsSync(rendered), 'Published Paper2Agent route must be built');
  const html=fs.readFileSync(rendered,'utf8');
  assert.deepEqual([...html.matchAll(/data-news-figure="([^"]+)"/g)].map(m=>m[1]),manifest.mediaIds);
  assert.deepEqual([...html.matchAll(/data-p2a-equation="([^"]+)"/g)].map(m=>m[1]),['papers','tools','accuracy']);
  assert(html.includes('data-p2a-comparison') && html.includes('37.3±4.0%') && html.includes('72.2±2.2%'));
  assert(!html.includes('편집 주석:'));
  assert(!html.includes('katex-error'));assert(html.includes('분자 593'));
}
console.log(`news18: PASS ${manifest.bodyCharacters} visible prose characters; two pixel-preserving originals; distinct cohorts; three specific equation explanations; ${mutants.length + 2} mutation controls; AlphaGenome/Biomni roles and three benchmark rows`);

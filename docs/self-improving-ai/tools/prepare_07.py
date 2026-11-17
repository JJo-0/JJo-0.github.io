"""Temporary scoped integration; removed from the final publication diff."""
from pathlib import Path
import json,hashlib,re
root=Path(__file__).resolve().parents[3]
slug='self-improving-ai-07-unsupervised-rlvr-and-test-time-training'
def sha(p):return hashlib.sha256((root/p).read_bytes()).hexdigest()
def writejson(p,obj):
 p=root/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
expected={
'spaceship-ui/site/content/posts/self-improving-ai-06-self-evaluation-and-entropy.mdx':'79d901f0c0c6649dfd4431126d0d4a304df59eea2ae5f84c4b565c41efb796ac',
'scripts/normalize_tags_current.py':'ae31d57fed86214a7517e31e0a52678a605e815c8eb2d8ec1a027b7256881c1b',
'spaceship-ui/scripts/browser-self-improving-audit.mjs':'c420e2db473216e79facac870219e1a2ae8b9881f0a2a345415cf27901e84f97',
'.github/workflows/self-improving-reading.yml':'7d25eb809f9c3f8ac02f90944d0c6da770c3e07bcf2487b0468a18387baa8ba7',
'docs/self-improving-ai/progress.json':'88eff5f56af13289f7789b0bd0936d315c5dc6534576009acda229e0ba64a5ff'}
for p,digest in expected.items():assert sha(p)==digest,'Concurrent/preimage change: '+p
mdpath=f'spaceship-ui/site/content/posts/{slug}.mdx';md=(root/mdpath).read_text()
assert sha(mdpath)=='554b6cf1aa1b15645660257a559241f4a60e3d6ac696207d91f5a3666172859e','Reviewed manuscript differs'
assert md.count('<LearningFigure')==9 and len(re.findall(r'<Math\s',md))==22
manifestpath='docs/self-improving-ai/source-assets/07/manifest.json'
assert sha(manifestpath)=='77d23a7286c7bd54bd1c1ba9865c6dfb9cf61072069eabb49227805af187bbd5','Rendered assets differ from locally reviewed manifest'
manifest=json.loads((root/manifestpath).read_text());assert len(manifest['assets'])==9
for a in manifest['assets']:assert sha(a['path'])==a['sha256']
numeric=json.loads((root/'docs/self-improving-ai/reviews/numeric-checks-07.json').read_text());assert numeric['tests_run']==19 and numeric['result']=='PASS'
prev='spaceship-ui/site/content/posts/self-improving-ai-06-self-evaluation-and-entropy.mdx'
p=root/prev;s=p.read_text();old='아직 공개하지 않은 다음 편의 링크는 만들지 않는다.';assert s.count(old)==1
p.write_text(s.replace(old,f'다음 편: [자가개선 AI 07 — 자기학습은 언제 멈추고, 언제 적응해야 할까](/posts/{slug}/).'))
p=root/'scripts/normalize_tags_current.py';s=p.read_text();anchor='if __name__ == "__main__":';assert s.count(anchor)==1
s=s.replace(anchor,'# Register the transcript-aligned Self-Improving AI chapter 07.\nPOST_TAXONOMY.update({\n    "'+slug+'.mdx": Taxonomy("ai-machine-learning", "self-improving-ai", "study-note", ("self-improvement", "unsupervised-rlvr", "test-time-training", "perplexity", "ntu")),\n})\n\n'+anchor);p.write_text(s)
p=root/'spaceship-ui/scripts/browser-self-improving-audit.mjs';s=p.read_text();old="{ number: 6, math: 20, slug: 'self-improving-ai-06-self-evaluation-and-entropy', previous: 'self-improving-ai-05-reward-design-to-ai-feedback', next: null },";assert s.count(old)==1
s=s.replace(old,old.replace('next: null',f"next: '{slug}'")+f"\n  {{ number: 7, math: 22, slug: '{slug}', previous: 'self-improving-ai-06-self-evaluation-and-entropy', next: null }},")
s=s.replace("assert.equal(group.count, '6편');","assert.equal(group.count, '7편');").replace('assert.equal(groupPaths.size, 6);','assert.equal(groupPaths.size, 7);').replace('chapter.number === 6 ?','chapter.number >= 6 ?')
anchor='      evidence.views.push(view);';assert s.count(anchor)==1
s=s.replace(anchor,'''      if (chapter.number === 7) {
        const transcriptLinks = await evaluate(cdp, session, `Array.from(document.querySelectorAll('article a[href*="youtube.com/watch"]')).map(a=>a.href)`);
        for (const seconds of [1873, 1918, 1972, 2014, 2086]) {
          assert(transcriptLinks.some(href => { const url = new URL(href); return url.searchParams.get('v') === 's06mSAGN4gM' && url.searchParams.get('t') === `${seconds}s`; }), `Missing transcript timestamp ${seconds}`);
        }
        view.transcriptLinks = transcriptLinks;
      }
'''+anchor)
anchor='    for (const chapter of chapters) assert(groupPaths.has';i=s.index(anchor);s=s[:i]+"    for (const slug of ['self-improving-ai-01-overview', 'self-improving-ai-02-learning-targets', 'self-improving-ai-03-self-correction-to-rl']) assert(groupPaths.has(`/posts/${slug}`), `Series missing ${slug}`);\n"+s[i:];p.write_text(s)
p=root/'.github/workflows/self-improving-reading.yml';s=p.read_text();anchor='      - name: Production build\n';assert s.count(anchor)==1;s=s.replace(anchor,'      - name: Verify chapter 07 numerical examples\n        run: python3 ../docs/self-improving-ai/reviews/verify_examples_07.py\n'+anchor);p.write_text(s)
p=root/'docs/self-improving-ai/progress.json';data=json.loads(p.read_text());data['completed_commentary_pages']=list(range(1,31));data['completed_english_asset_pages']=list(range(1,31));data['next_page']=31;data['next_topic']='Chapter 07 is prepared from pages 31–35. After its verified publication continue at page 36.'
prior=data['prepared_chapter_06'];prior['prepublication_status']=prior['status'];prior['status']='published; receipt reconciled from merged PR #203';prior['publication_evidence']='https://github.com/JJo-0/JJo-0.github.io/pull/203';prior['merge_commit']='8d7ca9ec6f3405588e2ecaec86e878675387a09c'
if not any(x.get('order')==6 for x in data['posts']):data['posts'].append({'order':6,'slug':'self-improving-ai-06-self-evaluation-and-entropy','path':prev,'pages':list(range(26,31)),'status':'published','previousPublishedContentSha256':prior['manuscript_sha256'],'public_url':'https://jjo-0.github.io/posts/self-improving-ai-06-self-evaluation-and-entropy/','publication_evidence':prior['publication_evidence'],'prepared_navigation_sha256':sha(prev),'navigation_note':'Chapter 07 navigation is prepared in this branch; not claimed live by this record.'})
data['notes']=[x.replace('Original pages 1–25 are published in chapters 01–05. The next primary page is 26.','Original pages 1–30 are published in chapters 01–06. Chapter 07 (31–35) is prepared; its PR must record actual publication.') for x in data['notes']]
data['prepared_chapter_07']={'chapter':7,'slug':slug,'primary_pages':list(range(31,36)),'status':'prepared; merge and live deployment are not asserted','prepared_date':'2026-11-17','manuscript':mdpath,'manuscript_sha256':sha(mdpath),'figures':9,'math_expressions':22,'numerical_tests':19,'manifest':manifestpath,'transcript_provenance':'docs/self-improving-ai/source-assets/07/transcript-provenance.json','next_page_after_publication':36,'publication_evidence':'Record merge, CI, Pages build/deploy and public verification in the chapter 07 PR.'};writejson('docs/self-improving-ai/progress.json',data)
writejson('docs/self-improving-ai/reviews/2026-11-17-chapter-07-preparation.json',{'chapter':7,'date':'2026-11-17','manuscript':mdpath,'sha256':sha(mdpath),'figures':9,'math_expressions':22,'numeric_tests':{'run':19,'passed':19,'source':'docs/self-improving-ai/reviews/numeric-checks-07.json'},'all_asset_hashes_match':True,'primary_pages':[31,32,33,34,35],'supplementary_originals':['TLM v1 Figure 1, PDF 4','URLVR v1 Figure 6, PDF 16','NTU GenAI-ML 2025 Post PDF 86','NTU GenAI-ML 2025 Post PDF 94'],'visual_review':'Original source pages and rendered English/supplementary contact sheet inspected locally; browser rendering is a separate CI step.','transcript':'Actual zh-TW manual track retrieved; topic-aligned summaries for 31:13–36:00, not frame-aligned slide timing. Input-perplexity detail is paper-only supplementary explanation.','rights_status':'unverified','publication_status':'prepared; not asserted deployed'})
writejson('docs/self-improving-ai/publishing/2026-11-17-chapter-07-request.json',{'date':'2026-11-17','source':'explicit user request in this conversation','request':'Continue chapter 07, use the YouTube script, supplementary PPT materials and equations, following the previously requested GitBlog publication workflow.','scope':{'chapter':7,'original_pages':[31,35],'series_display_name':'자가개선 AI','images':9,'channel':'GitBlog'},'source_permissions_verified':False,'note':'Publication authorization is distinct from third-party reuse permission; no policy or protection is weakened.'})
p=root/'docs/self-improving-ai/drafts/07-RESUME.md';p.parent.mkdir(parents=True,exist_ok=True);p.write_text('# 자가개선 AI 07 재개 기록\n\n원본 31–35쪽, 영어 편집 슬라이드 5장, 보충 원본 자료 4개, 한국어 해설, 실제 상편 zh-TW 자막 요약을 준비했다.\n\n원고·수치 검사·출처 manifest는 저장소에 보존한다. 준비 기록은 공개 완료의 증거가 아니다. 최종 PR에서 CI·병합·Pages build/deploy·공개 URL 확인을 별도로 기록한다.\n\n공개 확인 후 다음은 **08편 / 원본 36–40쪽**이다. 2025년 보충 강의는 PPT만 열람했으며 그 영상의 자막을 읽었다고 주장하지 않는다.\n')
print('Scoped chapter 07 integration passed: 9 exact image hashes, 22 Math expressions, 19 calculations.')

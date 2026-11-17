"""Temporary scoped integration. Remove from the final publication diff."""
from pathlib import Path
import hashlib,json,re,tarfile
root=Path(__file__).resolve().parents[3]
slug='self-improving-ai-08-entropy-estimation-and-gradients'
prevslug='self-improving-ai-07-unsupervised-rlvr-and-test-time-training'
def sha(p):return hashlib.sha256((root/p).read_bytes()).hexdigest()
def writejson(p,d):
 p=root/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
expected={
'docs/self-improving-ai/progress.json':'e2d1fa1fad3d8802b17d1a659b7d4df3f5871464c52b3a56bdea02a46b32a901',
'spaceship-ui/scripts/browser-self-improving-audit.mjs':'b19a99c5b73904af4cdde0f239e43aba6e1e7e08f9ea33db14e9951eaf7d6a4a',
'spaceship-ui/site/content/posts/'+prevslug+'.mdx':'2dd3a93e3200a441b48bc9d8137ba60c0c29066aa019ee18f1bdf52014783160',
'scripts/normalize_tags_current.py':'82ea6418b2936f568f80252a2cbd0c7d1f362d6b63d3c3c2188a0357f84b8477'}
for p,digest in expected.items():assert sha(p)==digest,'Changed preimage: '+p
mdpath=f'spaceship-ui/site/content/posts/{slug}.mdx';md=(root/mdpath).read_text();nmath=len(re.findall(r'<Math\s',md));assert nmath>=25
assert md.count('<LearningFigure')==9 and 'order: 8' in md and 'draft: false' in md
mp='docs/self-improving-ai/source-assets/08/manifest.json'
assert sha(mp)=='70bca882c9f5a5eea69991eaad928665203eeb82a3a39dd583278fda1b23d1ac','Rendered manifest differs from local review'
manifest=json.loads((root/mp).read_text());assert len(manifest['assets'])==9
for asset in manifest['assets']:
 assert sha(asset['path'])==asset['sha256']
 assert md.count('src="'+asset['src']+'"')==1
num=json.loads((root/'docs/self-improving-ai/reviews/numeric-checks-08.json').read_text());assert num['tests_run']==30 and num['result']=='PASS'
auto=json.loads((root/'docs/self-improving-ai/reviews/autograd-checks-08-local.json').read_text());assert auto['tests_run']==8 and auto['result']=='PASS'
prevpath='spaceship-ui/site/content/posts/'+prevslug+'.mdx';p=root/prevpath;s=p.read_text();old='아직 발행하지 않은 다음 편의 링크는 만들지 않는다.';assert s.count(old)==1
p.write_text(s.replace(old,f'다음 편: [자가개선 AI 08 — 엔트로피를 제대로 줄이려면, 빠진 경사를 찾아라](/posts/{slug}/).'))
p=root/'scripts/normalize_tags_current.py';s=p.read_text();anchor='if __name__ == "__main__":';assert s.count(anchor)==1
p.write_text(s.replace(anchor,'# Register the transcript-aligned Self-Improving AI chapter 08.\nPOST_TAXONOMY.update({\n    "'+slug+'.mdx": Taxonomy("ai-machine-learning", "self-improving-ai", "study-note", ("self-improvement", "entropy-minimization", "policy-gradient", "test-time-adaptation", "ntu")),\n})\n\n'+anchor))
p=root/'spaceship-ui/scripts/browser-self-improving-audit.mjs';s=p.read_text();old="{ number: 7, math: 22, slug: 'self-improving-ai-07-unsupervised-rlvr-and-test-time-training', previous: 'self-improving-ai-06-self-evaluation-and-entropy', next: null },";assert s.count(old)==1
s=s.replace(old,old.replace('next: null',f"next: '{slug}'")+f"\n  {{ number: 8, math: {nmath}, slug: '{slug}', previous: '{prevslug}', next: null }},")
s=s.replace("assert.equal(group.count, '7편');","assert.equal(group.count, '8편');").replace('assert.equal(groupPaths.size, 7);','assert.equal(groupPaths.size, 8);')
s=s.replace('if (chapter.number === 7) {','if (chapter.number === 7 || chapter.number === 8) {').replace('for (const seconds of [1873, 1918, 1972, 2014, 2086]) {','for (const seconds of (chapter.number === 7 ? [1873, 1918, 1972, 2014, 2086] : [2160, 2193, 2395, 2471, 2564])) {')
p.write_text(s)
p=root/'docs/self-improving-ai/progress.json';d=json.loads(p.read_text());d['completed_commentary_pages']=list(range(1,36));d['completed_english_asset_pages']=list(range(1,36));d['next_page']=36;d['next_topic']='Chapter 08 (36–40) is prepared. After verified publication continue at page 41.'
old=d['prepared_chapter_07'];old['prepublication_status']=old['status'];old['status']='published; reconciled with merged PR #204 and its live verification receipt';old['publication_evidence']='https://github.com/JJo-0/JJo-0.github.io/pull/204';old['merge_commit']='dabb8f314e2559c3fddc657cfe45273fa710bddb'
if not any(x.get('order')==7 for x in d['posts']):d['posts'].append({'order':7,'slug':prevslug,'path':prevpath,'pages':list(range(31,36)),'status':'published','previousPublishedContentSha256':expected[prevpath],'public_url':'https://jjo-0.github.io/posts/'+prevslug+'/','publication_evidence':old['publication_evidence'],'prepared_navigation_sha256':sha(prevpath),'navigation_note':'08 navigation is prepared in this branch, not yet asserted live.'})
d['notes']=[x.replace('Original pages 1–30 are published in chapters 01–06. Chapter 07 (31–35) is prepared; its PR must record actual publication.','Original pages 1–35 are published in chapters 01–07. Chapter 08 (36–40) is prepared; its PR records actual publication.') for x in d['notes']]
d['prepared_chapter_08']={'chapter':8,'slug':slug,'primary_pages':list(range(36,41)),'status':'prepared; merge and public deployment are not asserted','prepared_date':'2026-11-18','manuscript':mdpath,'manuscript_sha256':sha(mdpath),'figures':9,'math_expressions':nmath,'numeric_tests':30,'local_autograd_tests':8,'local_torch_version':auto['torch_version'],'manifest':mp,'transcript_provenance':'docs/self-improving-ai/source-assets/08/transcript-provenance.json','next_page_after_publication':41,'publication_evidence':'Record merge, Pages build/deploy and actual public verification in the chapter 08 PR.'};writejson('docs/self-improving-ai/progress.json',d)
writejson('docs/self-improving-ai/reviews/2026-11-18-chapter-08-preparation.json',{'chapter':8,'date_kst':'2026-11-18','manuscript':mdpath,'sha256':sha(mdpath),'figures':9,'math_expressions':nmath,'numeric_tests':num,'local_autograd_tests':auto,'all_asset_hashes_match':True,'source_manifest_sha256':sha(mp),'source_equation_correction':'39/40 keep original printed E[g grad p] in image; prose, numerical examples and code use E[g grad log p] per Eq.(8f).','transcript':'Actual zh-TW manual track; topic-aligned 36:00–43:24 summaries, not verified frame-by-frame transitions.','visual_review':'Pinned PDF pages and final localized images inspected locally; responsive browser QA is a separate step.','rights_status':'unverified','publication_status':'prepared; not asserted deployed'})
writejson('docs/self-improving-ai/publishing/2026-11-18-chapter-08-request.json',{'date_kst':'2026-11-18','source':'explicit user request in current conversation','request':'8 진행하자','scope':{'chapter':8,'original_pages':[36,40],'channel':'GitBlog','series_display_name':'자가개선 AI','format':'five primary slides plus four original supplements, verified video summaries, Korean commentary and math; continue through publication'},'third_party_reuse_permission':'unverified','note':'Preserve existing policy and CI requirements; publication authorization is not source-owner reuse permission.'})
p=root/'docs/self-improving-ai/drafts/08-RESUME.md';p.parent.mkdir(parents=True,exist_ok=True);p.write_text('# 자가개선 AI 08 재개 기록\n\n원본 36–40쪽과 실제 상편 자막 36:00–43:24를 대조했다. 원본 39·40쪽의 log 누락은 이미지를 유지하고 본문에서 명시적으로 정정한다.\n\n이미지 9개, 수치 검사 30개, 로컬 PyTorch 자동미분 검사 8개를 준비했다. 준비 기록은 공개 완료 증거가 아니다. 최종 PR에 병합·배포·공개 확인을 별도로 기록한다.\n\n공개 확인 뒤 다음 범위는 **09편 / 원본 41–45쪽**이다. 전체 자막은 재배포하지 않으며 제3자 재사용 허가는 검증하지 않았다.\n')
pack=Path('/tmp/chapter08-integration.tar.gz')
with tarfile.open(pack,'w:gz') as t:
 for path in [mdpath,prevpath,'spaceship-ui/scripts/browser-self-improving-audit.mjs','docs/self-improving-ai/progress.json','docs/self-improving-ai/reviews/2026-11-18-chapter-08-preparation.json','scripts/normalize_tags_current.py']:
  t.add(root/path,arcname=path)
print(json.dumps({'result':'PASS','article_sha256':sha(mdpath),'math_expressions':nmath,'images':9,'numeric_tests':30,'local_autograd_tests':8}))

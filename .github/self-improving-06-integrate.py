"""One-time, branch-scoped chapter integration; removed before merging."""
from pathlib import Path
import hashlib
import json
import re

R=Path('.')
slug='self-improving-ai-06-self-evaluation-and-entropy'
p=R/'spaceship-ui/site/content/posts/self-improving-ai-05-reward-design-to-ai-feedback.mdx'
s=p.read_text();old='아직 공개하지 않은 다음 편의 링크는 만들지 않는다.'
assert s.count(old)==1
p.write_text(s.replace(old,'이어서 읽기: [자가개선 AI 06 — 스스로 확신하는 AI는 더 정확해질까](/posts/'+slug+'/).'))
p=R/'scripts/normalize_tags_current.py';s=p.read_text();mark='if __name__ == "__main__":'
assert s.count(mark)==1
extra='''# Register chapter 06 and repair coverage of existing November 17 drafts.
# Existing NEWS article bytes and draft flags are unchanged.
POST_TAXONOMY.update({
    "self-improving-ai-06-self-evaluation-and-entropy.mdx": Taxonomy("ai-machine-learning", "self-improving-ai", "study-note", ("self-improvement", "self-evaluation", "entropy-minimization", "test-time-adaptation", "ntu")),
    "2026-11-17-cd7-aav-immune-cell-engineering-news.mdx": Taxonomy("finance-industry", "cell-gene-therapy", "paper-review", ("frontier-candidate", "gene-delivery", "cell-therapy", "immunoengineering")),
    "2026-11-17-openscientist-biomedical-agentic-ai-news.mdx": Taxonomy("finance-industry", "biomedical-ai", "paper-review", ("frontier-one", "agentic-ai", "biomedical-research", "scientific-discovery")),
    "2026-11-17-superb-seq-crispr-transcriptome-news.mdx": Taxonomy("finance-industry", "genome-editing-methods", "paper-review", ("frontier-candidate", "crispr", "single-cell", "functional-genomics")),
})

'''
p.write_text(s.replace(mark,extra+mark))
post=R/f'spaceship-ui/site/content/posts/{slug}.mdx';text=post.read_text();digest=hashlib.sha256(post.read_bytes()).hexdigest()
assert digest=='79d901f0c0c6649dfd4431126d0d4a304df59eea2ae5f84c4b565c41efb796ac', 'Manuscript transfer mismatch'
assert len(re.findall(r'<Math\b',text))==20 and text.count('<LearningFigure')==9
manifest=json.loads((R/'docs/self-improving-ai/source-assets/06/manifest.json').read_text())
for asset in manifest['assets']:
    assert hashlib.sha256((R/asset['path']).read_bytes()).hexdigest()==asset['sha256']
    assert asset['src'] in text and asset['source'] in text
p=R/'docs/self-improving-ai/progress.json';progress=json.loads(p.read_text())
progress['prepared_chapter_06']={'chapter':6,'slug':slug,'primary_pages':[26,27,28,29,30],'status':'prepared; not asserted to be merged or deployed','prepared_date':'2026-11-17','manuscript':str(post),'manuscript_sha256':digest,'figures':9,'math_expressions':20,'manifest':'docs/self-improving-ai/source-assets/06/manifest.json','next_page_after_publication':31,'publication_evidence':'Record final CI, merge and live verification in the chapter 06 pull request; preparation is not publication.'}
p.write_text(json.dumps(progress,ensure_ascii=False,indent=2)+'\n')
p=R/'docs/self-improving-ai/publishing/2026-11-17-chapter-06-request.json'
p.write_text(json.dumps({'date':'2026-11-17','source':'User request in the continuing series conversation','request':'6과 이어서 제작해보자.','scope':{'chapter':6,'primary_pages':[26,30],'channel':'GitBlog','format':'English-localized original slides, Korean commentary, original supplementary figures and publication following the established series workflow'},'source_permissions_verified':False,'note':'Continuation and publication intent are distinct from third-party source permission. No repository protection, general policy or existing CI gate is weakened.'},ensure_ascii=False,indent=2)+'\n')
review={'chapter':6,'prepared_date':'2026-11-17','status':'prepared-not-yet-deployed','manuscript':str(post),'sha256':digest,'figures':9,'math_expressions':20,'numeric_tests':json.loads((R/'docs/self-improving-ai/reviews/numeric-checks-06.json').read_text()),'visual_review':{'scope':'Local source and final PNG review; browser layout is pending','primary_pages':[26,27,28,29,30],'supplements':['Self-Consistency v4 Figure 1 (PDF 2)','Tent v3 Figure 3 (PDF 3)','SUTA Figure 1 (PDF 1)','EM NeurIPS 2025 Table 5 (PDF 9)'],'observations':['Original diagrams and mathematics retained; no invented source content.','SUTA URL correction explicitly disclosed.','The numerical counterexample is explanatory, not a reported paper experiment.','Table 5 checked visually: Minerva 22.4 versus 18.8; IndVal 65.9 versus 66.0/66.0/66.3.'],'source_pdf_web_screenshot_status':'Screenshot requests were attempted; several failed with cache misses. Original PDF pages were rendered and inspected locally instead.'},'repair_scope':{'reason':'Three existing November 17 drafts were missing taxonomy registrations at base f925f309.','manuscripts_modified':False,'draft_files':[{'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'draft':True} for p in sorted((R/'spaceship-ui/site/content/posts').glob('2026-11-17-*.mdx'))]},'rights_status':'unverified; publication request is not source-owner permission','deployment_claim':False}
(R/'docs/self-improving-ai/reviews/2026-11-17-chapter-06-preparation.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
(R/'docs/self-improving-ai/drafts/06-RESUME.md').write_text('''# 자가개선 AI 06 — 재개 지점

- 원본: NTU Self-Improving 상편 PDF 26–30쪽, 표지가 1쪽.
- 원고: `spaceship-ui/site/content/posts/self-improving-ai-06-self-evaluation-and-entropy.mdx`.
- 이미지: 영어 편집본 5장, 보충 원본 그림·표 4개.
- 근거: `source-assets/06/manifest.json`, `reviews/2026-11-17-chapter-06-preparation.json`.
- 숫자 재현: `python3 docs/self-improving-ai/reviews/verify_examples_06.py`.
- 다음 단계: PR 전체 CI → main 병합 → Pages 배포 → 공개 이미지 해시·모바일/데스크톱 읽기 검사.
- 준비는 공개 완료가 아니다. 최종 근거는 해당 PR에 기록한다.
- 공개 확인 후 다음 편은 **07편, 원본 31–35쪽**이다.

27쪽의 언어 점수와 Yes 토큰 확률, 28쪽의 추론 집계와 의사 정답 학습,
29쪽의 토큰/완성 답/표본 빈도 엔트로피, 30쪽의 파라미터 적응과 로짓 조절을 구분한다.
30쪽의 잘린 SUTA URL을 `2203.14222`로 수정하고 캡션과 manifest에 기록한다.
출처와 발행 의도는 기록하지만 원저작자 허가가 확인됐다고 주장하지 않는다.
''')
print(json.dumps({'manuscript_sha256':digest,'figures':9,'math_expressions':20,'status':'prepared'}))

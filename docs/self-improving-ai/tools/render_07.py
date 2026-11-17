"""Render pinned original slides and supplementary figures for chapter 07.
PyMuPDF==1.26.7. No source code is downloaded or executed. Edits localize text only.
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen
import argparse, hashlib, json
import pymupdf as fitz

SLUG='self-improving-ai-07-unsupervised-rlvr-and-test-time-training'
SOURCES={
 'ntu':('https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf','0bf81bb4af728ed04c21e2811aa2f1cb0210c70d09d7c6ebb2acf3c3f77b4844',62,'Hung-yi Lee / NTU Machine Learning 2026'),
 'tlm':('https://arxiv.org/pdf/2505.20633v1','a124a42a7f404851ddc6bb3ee5823156073c86d24d52e8426857121765b4db88',27,'Jinwu Hu et al., Test-Time Learning for Large Language Models, arXiv v1 (2025)'),
 'urlvr':('https://arxiv.org/pdf/2603.08660v1','9bf37f76baf5c2cde723e36c5628744f5a6a6c0f901b1c3da047637d241aaaed',54,'Bingxiang He et al., How Far Can Unsupervised RLVR Scale LLM Training?, arXiv v1 (2026)'),
 'ntu-post':('https://speech.ee.ntu.edu.tw/~hylee/GenAI-ML/2025-fall-course-data/Post.pdf','145a64039de75c67a1e01c8a73e1b9ea70625d433a702bf8718b7c405a7037ce',103,'Hung-yi Lee / NTU GenAI-ML 2025, Lecture 8')
}
EDITS={n:[([69,50,454,116],'Let AI Define the Loss',32)] for n in range(31,36)}
EDITS[31]+=[([622,439,894,479],'Likelihood of the input x',22)]
EDITS[35]+=[([610,86,920,160],'Test-Time Training\n(TTT)',28),([121,440,729,480],'NTU GenAI-ML 2025 - Lecture 8: Lifelong Learning\nFine-tuning, Model Editing, Model Merging, Test-Time Training',13)]
ALTS={
31:'모델의 입력·출력과 손실을 연결한 원본 도식. 아래쪽은 입력 x의 생성 가능도를 이용하는 경로이며, 손실의 부호와 변환은 본문에서 설명한다.',
32:'다수결 보상과 정답 보상으로 학습한 모델의 AIME 2024·2025 및 AMC 2023 평균 정확도 곡선을 비교하는 원본 슬라이드.',
33:'다수결·Self-Certainty·토큰 엔트로피·궤적 엔트로피·확률 보상의 학습 곡선을 비교한 원본 슬라이드. 모든 곡선이 표시 구간에서 붕괴한 것은 아니다.',
34:'테스트 입력 x로 학습 신호를 만들고 파라미터를 조정한 뒤 같은 x에 새 출력 y 프라임을 생성하는 테스트 시점 학습 도식.',
35:'각 입력에서 기준 모델로 다시 시작하는 표준 TTT를 보여주는 2025년 강의 화면을 인용한 원본 35쪽.'}
SUPPS=[
 ('A','tlm',4,[53,64,545,206],'tlm-v1-figure1.png','TLM · arXiv v1 (2025-05-27) · PDF 4쪽 Figure 1의 세 패널과 패널 제목 발췌.','입력 퍼플렉서티 최소화 실험, 입력·출력 퍼플렉서티의 정규화 추세, 표본 선택 비교를 보여주는 TLM의 원본 Figure 1.'),
 ('B','urlvr',16,[60,82,536,185],'urlvr-v1-figure6.png','Unsupervised RLVR · arXiv v1 (2026-03-09) · PDF 16쪽 Figure 6의 그래프와 범례 발췌.','학습 데이터 규모에 따른 정답 보상·다수결 보상·보상 정확도를 비교한 원본 Figure 6. 작은 데이터의 안정성은 해당 실험 조건의 결과다.'),
 ('C','ntu-post',86,None,'ntu2025-post-p86-ttt-vs-reasoning.png','NTU GenAI-ML 2025 · Lecture 8, Post · PDF 86쪽 원본 영어 슬라이드 전체.','파라미터를 미세조정하는 Test-Time Training과 더 긴 추론을 수행하는 Test-time Computing을 대비한 원본 영어 슬라이드.'),
 ('D','ntu-post',94,None,'ntu2025-post-p94-pretext-task.png','NTU GenAI-ML 2025 · Lecture 8, Post · PDF 94쪽 원본 영어 슬라이드 전체.','새의 종류를 맞히는 본 과제와 회전 각도를 맞히는 보조 과제를 구분한 원본 TTT 슬라이드.')]

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[3]);ap.add_argument('--source-dir',type=Path);args=ap.parse_args();root=args.root.resolve()
 def load(item):
  key,(url,digest,count,_) = item
  if args.source_dir and (args.source_dir/(key+'.pdf')).exists(): data=(args.source_dir/(key+'.pdf')).read_bytes()
  else:
   with urlopen(Request(url,headers={'User-Agent':'JJo-source-review/1.0'}),timeout=60) as response:data=response.read(80000001)
  if len(data)>80000000 or hashlib.sha256(data).hexdigest()!=digest:raise ValueError('Source changed: '+key)
  doc=fitz.open(stream=data,filetype='pdf');assert len(doc)==count
  return key,doc
 docs=dict(ThreadPoolExecutor(4).map(load,SOURCES.items()));assets=[]
 def render(key,page_no,filename,slot,caption,alt,crop=None,edits=None):
  doc=fitz.open();doc.insert_pdf(docs[key],from_page=page_no-1,to_page=page_no-1);page=doc[0];records=[]
  for rect,text,start_size in edits or []:
   rect=fitz.Rect(rect);page.draw_rect(rect,color=None,fill=(1,1,1),overlay=True)
   for size in range(start_size,10,-1):
    shape=page.new_shape();remain=shape.insert_textbox(rect+fitz.Rect(3,2,-3,-2),text,fontname='helv',fontsize=size,color=(0,0,0),lineheight=1.1)
    if remain>=0:shape.commit(overlay=True);break
   else:raise ValueError('Text does not fit: '+text)
   records.append({'rectangle_pdf_points':list(rect),'english':text,'font_size':size})
  clip=fitz.Rect(crop) if crop else page.rect;pix=page.get_pixmap(matrix=fitz.Matrix(1800/clip.width,1800/clip.width),clip=clip,alpha=False)
  path=Path('spaceship-ui/site/assets/assets/posts')/SLUG/filename;target=root/path;target.parent.mkdir(parents=True,exist_ok=True);pix.save(target)
  url,digest,_,author=SOURCES[key]
  assets.append({'slot':slot,'chapter':7,'path':str(path),'src':'/assets/posts/'+SLUG+'/'+filename,'source_key':key,'source':url+'#page='+str(page_no),'source_pdf_sha256':digest,'pdf_page':page_no,'caption':caption,'alt':alt,'credit':author+('. Unofficial English text adaptation; original diagrams retained.' if edits else '. Original source, not redrawn.'),'width':pix.width,'height':pix.height,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'crop_pdf_points':crop,'edits':records,'rights_status':'unverified'})
 for n in range(31,36):render('ntu',n,f'ntu-self-improving-{n}-en.png',f'main-{n}',f'P{n:03} — NTU Self-Improving 원본 {n}쪽 · 비공식 영어 편집본. 원본 도해·그래프·수식 유지.',ALTS[n],edits=EDITS[n])
 for slot,key,page,crop,name,caption,alt in SUPPS:render(key,page,name,'supplementary-'+slot,caption,alt,crop)
 out=root/'docs/self-improving-ai/source-assets/07/manifest.json';out.parent.mkdir(parents=True,exist_ok=True)
 out.write_text(json.dumps({'chapter':7,'slug':SLUG,'primary_page_range':[31,35],'source_numbering':'PDF cover is page 1; transcript timestamps identify topic passages, not verified slide-transition frames.','rights_status':'unverified; source attribution and publication request are not source-owner permission','assets':assets},ensure_ascii=False,indent=2)+'\n')
 print('Rendered',len(assets),'pinned source assets')
if __name__=='__main__':main()

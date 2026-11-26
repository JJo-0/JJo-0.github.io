"""Render chapter 08 from pinned PDFs; retain all original equations unchanged."""
from __future__ import annotations
from pathlib import Path
from urllib.request import Request,urlopen
from concurrent.futures import ThreadPoolExecutor
import argparse,hashlib,json
import pymupdf as fitz
SLUG='self-improving-ai-08-entropy-estimation-and-gradients'
SOURCES={
 'ntu':('https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf','0bf81bb4af728ed04c21e2811aa2f1cb0210c70d09d7c6ebb2acf3c3f77b4844',62,'Hung-yi Lee / NTU ML 2026'),
 'rethinking':('https://arxiv.org/pdf/2605.08186v1','e40d012ca48852bd4e349adad295837c9f22d8c873dbf4bfc6d0388ee9b23ea9',11,'Wei-Ping Huang et al., arXiv:2605.08186v1 (2026)'),
 'berkeley':('https://rail.eecs.berkeley.edu/deeprlcourse/static/slides/lec-5.pdf','193365e0ede9646b9f1fd28387091ac477f6a9f7ca3feb4c5c9d5fed9072f261',23,'Sergey Levine / UC Berkeley CS 185/285, Policy Gradients'),
 'stanford':('https://web.stanford.edu/class/ee376a/files/2017-18/lecture_3.pdf','dae08495f75723a551d362a7d73eed48cf945f922b4cbd754312fc1576feab10',5,'Tsachy Weissman / Stanford EE376A, Lecture 3 (2018-01-16)')
}
EDITS={
36:[([60,440,655,504],'Rethinking Entropy Minimization in Test-Time Adaptation for\nAutoregressive Models (being uploaded to arXiv, as labeled)',15)],
39:[([82,72,451,105],'Target loss to minimize',24),([545,68,890,103],'Computable proxy loss',24),([82,198,478,233],'Desired parameter gradient',22),([544,192,934,227],'Gradient used in the implementation',20)]
}
ALTS={36:'엔트로피 최소화의 수학 구간 시작을 알리고 연구 제목을 소개하는 원본 36쪽. 업로드 중이라는 표시는 원본의 당시 표기다.',37:'문장 전체 엔트로피와 방문한 접두사에서 계산하는 다음 토큰 엔트로피의 합 및 기대값 관계를 보여주는 원본 37쪽.',38:'답을 샘플링한 뒤 접두사를 고정해 토큰 엔트로피를 미분하는 절차를 보여주는 원본 38쪽.',39:'목표 손실과 대리 손실 및 두 경사 항을 비교하는 원본 39쪽. 두 번째 항의 log 누락 표기는 본문에서 정정한다.',40:'샘플링한 경로에서 토큰 엔트로피를 낮추는 항을 강조하는 원본 40쪽. 상단 수식의 log 누락은 본문에서 정정한다.'}
SUPPS=[
 ('A','rethinking',1,[310,213,548,430],'rethinking-v1-figure1.png','Huang et al. · arXiv v1 · PDF 1쪽 Figure 1 원본 발췌.','토큰 엔트로피 손실과 정책 경사 손실의 역할을 나눈 논문 Figure 1. 정확한 식은 본문의 논문 식 (8)·(9) 대조를 따른다.'),
 ('B','stanford',5,[77,104,543,200],'stanford-ee376a-lecture3-chain-rule.png','Stanford EE376A · 2018-01-16 · PDF 5쪽 엔트로피 연쇄 법칙 원본 발췌.','조건부 엔트로피를 사용한 연쇄 법칙 H(X,Y)=H(Y)+H(X|Y)를 제시한 원본 강의 노트.'),
 ('C','berkeley',5,None,'berkeley-policy-gradients-p05.png','UC Berkeley CS 185/285 · Policy Gradients · PDF 5쪽 원본 영어 슬라이드.','확률의 미분을 확률 곱하기 로그 확률의 미분으로 바꾸는 로그 미분 항등식을 설명하는 Berkeley 강의 슬라이드.'),
 ('D','berkeley',20,None,'berkeley-policy-gradients-p20.png','UC Berkeley CS 185/285 · Policy Gradients · PDF 20쪽 원본 영어 슬라이드.','자동미분으로 원하는 정책 경사를 얻기 위한 대리 손실을 구성하는 원본 Berkeley 슬라이드.')]

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[3]);ap.add_argument('--source-dir',type=Path);a=ap.parse_args();root=a.root.resolve()
 def load(item):
  k,(url,digest,n,credit)=item
  if a.source_dir and (a.source_dir/(k+'.pdf')).exists():data=(a.source_dir/(k+'.pdf')).read_bytes()
  else:
   with urlopen(Request(url,headers={'User-Agent':'JJo-source-review/1.0'}),timeout=60) as response:data=response.read(80000001)
  if len(data)>80000000 or hashlib.sha256(data).hexdigest()!=digest:raise ValueError('Source version changed: '+k)
  doc=fitz.open(stream=data,filetype='pdf');assert len(doc)==n;return k,doc
 docs=dict(ThreadPoolExecutor(4).map(load,SOURCES.items()));assets=[]
 def render(key,n,name,slot,caption,alt,crop=None,edits=()):
  d=fitz.open();d.insert_pdf(docs[key],from_page=n-1,to_page=n-1);p=d[0];records=[]
  for box,text,size0 in edits:
   box=fitz.Rect(box);p.draw_rect(box,color=None,fill=(1,1,1),overlay=True)
   for size in range(size0,9,-1):
    shape=p.new_shape();remaining=shape.insert_textbox(box+fitz.Rect(3,1,-3,-1),text,fontname='helv',fontsize=size,lineheight=1.15)
    if remaining>=0:shape.commit(overlay=True);break
   else:raise ValueError('English text overflow')
   records.append({'rectangle_pdf_points':list(box),'english':text,'font_size':size})
  clip=fitz.Rect(crop) if crop else p.rect;pix=p.get_pixmap(matrix=fitz.Matrix(1800/clip.width,1800/clip.width),clip=clip,alpha=False)
  path=Path('spaceship-ui/site/assets/assets/posts')/SLUG/name;out=root/path;out.parent.mkdir(parents=True,exist_ok=True);pix.save(out)
  url,digest,_,credit=SOURCES[key]
  assets.append({'slot':slot,'chapter':8,'path':str(path),'src':'/assets/posts/'+SLUG+'/'+name,'source':url+'#page='+str(n),'source_pdf_sha256':digest,'pdf_page':n,'caption':caption,'alt':alt,'credit':credit+('. Unofficial English text adaptation; original equations retained.' if edits else '. Original source, not redrawn.'),'width':pix.width,'height':pix.height,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'crop_pdf_points':crop,'edits':records,'rights_status':'unverified','source_equation_note':'Original pages 39 and 40 omit log in the score term; retained unchanged in images and explicitly corrected in commentary.' if key=='ntu' and n in [39,40] else None})
 for n in range(36,41):
  caption=f'P{n:03} — NTU Self-Improving 원본 {n}쪽 · '+('중국어 문구의 비공식 영어 편집본.' if n in EDITS else '원본 영어·수식 이미지.')
  if n in (39,40):caption+=' 두 번째 경사 항의 log 누락은 아래 본문에서 정정한다.'
  render('ntu',n,f'ntu-self-improving-{n}-en.png',f'main-{n}',caption,ALTS[n],edits=EDITS.get(n,()))
 for slot,key,n,crop,name,cap,alt in SUPPS:render(key,n,name,'supplementary-'+slot,cap,alt,crop)
 out=root/'docs/self-improving-ai/source-assets/08/manifest.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps({'chapter':8,'slug':SLUG,'primary_page_range':[36,40],'page_numbering':'PDF cover is page 1','rights_status':'unverified','equation_correction':'Keep original slide equations; commentary uses E[g grad log p] per paper Eq.(8f), not E[g grad p].','assets':assets},ensure_ascii=False,indent=2)+'\n')
 print('Rendered',len(assets),'assets; manifest SHA256',hashlib.sha256(out.read_bytes()).hexdigest())
if __name__=='__main__':main()

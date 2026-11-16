"""Render source-faithful English slide adaptations and original reading figures.
No remote code is executed. Downloaded source hashes, text edits and crops are recorded.
Run from a repository checkout with PyMuPDF 1.26.6 and Pillow 11.3.0.
"""
from __future__ import annotations
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import base64
import hashlib
import io
import json
import urllib.request
import pymupdf as fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs/self-improving-ai/source-assets/review-04-05'
OUT.mkdir(parents=True, exist_ok=True)
SOURCES = {
 'ntu': ('https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf', '0bf81bb4af728ed04c21e2811aa2f1cb0210c70d09d7c6ebb2acf3c3f77b4844'),
 'umass': ('https://people.cs.umass.edu/~sniekum/classes/HCML-S24/lectures/lecture4.pdf', None),
 'eureka': ('https://eureka-research.github.io/assets/eureka_paper.pdf', None),
 'revolve': ('https://arxiv.org/pdf/2406.01309v4', None),
 'rfagent': ('https://arxiv.org/pdf/2602.23876v1', None),
 'cs224n': ('https://web.stanford.edu/class/cs224n/slides/cs224n-spr2024-lecture10-prompting-rlhf.pdf', '7510a2f4d2912325efc7877a7ae163c442252df5ce9dfc52eb0a4824fbca720c'),
 'constitutional': ('https://arxiv.org/pdf/2212.08073v1', None),
 'schultz': ('https://www.gatsby.ucl.ac.uk/~dayan/papers/sdm97.pdf', None),
}
SLUGS = {4:'self-improving-ai-04-sparse-rewards-and-shaping',5:'self-improving-ai-05-reward-design-to-ai-feedback'}

def download(item):
 key,(url,expected)=item
 try:
  request=urllib.request.Request(url,headers={'User-Agent':'JJo-source-review/1.0'})
  with urllib.request.urlopen(request,timeout=30) as response:
   data=response.read(40_000_001)
  if len(data)>40_000_000: raise ValueError('Source exceeds the 40 MB limit')
  digest=hashlib.sha256(data).hexdigest()
  if expected and digest!=expected: raise ValueError('Pinned source hash mismatch')
  document=fitz.open(stream=data,filetype='pdf')
  print('SOURCE',key,len(document),digest,flush=True)
  return key,{'url':url,'sha256':digest,'page_count':len(document)},data
 except Exception as error:
  print('SOURCE_FAILED',key,str(error),flush=True)
  return key,{'url':url,'error':str(error)},None

fetched=list(ThreadPoolExecutor(max_workers=4).map(download,SOURCES.items()))
metadata={key:meta for key,meta,_ in fetched}
documents={key:fitz.open(stream=data,filetype='pdf') for key,_,data in fetched if data is not None}
if 'ntu' not in documents: raise RuntimeError('The pinned primary source is unavailable')

def label(page,rect,text,size=24,align=0):
 rectangle=fitz.Rect(rect)
 page.draw_rect(rectangle,color=None,fill=(1,1,1),overlay=True)
 for font_size in range(size,11,-1):
  shape=page.new_shape()
  remaining=shape.insert_textbox(rectangle+fitz.Rect(3,2,-3,-2),text,fontname='helv',fontsize=font_size,color=(0,0,0),align=align,lineheight=1.13)
  if remaining>=0:
   shape.commit(overlay=True)
   return font_size
 raise ValueError(f'English label does not fit: {text}')

EDITS={
 16:[([80,40,620,108],'Most real-world rewards are sparse,\nmaking learning difficult.',24),([80,112,610,148],'Example: a robot opening a door',22)],
 17:[([145,12,350,89],'Reward shaping\nmakes learning easier',22),([382,37,545,75],'Goal: turn the handle',15),([574,123,686,187],'Near the handle\n+1 reward',16),([692,385,811,451],'Touch the handle\n+5 reward',16),([202,474,368,529],'Far from the handle\n0 reward',15),([410,474,555,529],'Near the handle\n+1 reward',15),([640,474,803,529],'Touch the handle\n+5 reward',15)],
 18:[([68,50,760,115],'AI-Designed Reward Shaping',34),([700,234,842,301],'Open the door: +1\nOtherwise: 0',18),([703,415,948,513],'Open the door: +1\nTouch the handle: +0.5\n...',20)],
 20:[([69,40,510,117],'How can AI find a proxy reward\nthat makes learning easier?',28),([680,88,950,125],'Policy (not necessarily an LLM)',19)],
 23:[([150,10,880,69],'Dopamine and Reward Shaping',38)],
 24:[([68,48,491,117],'Let AI Define the Loss',32),([500,52,940,119],'Real-world objectives are often hard\nto express as a hand-written reward.',21)],
 25:[([68,48,491,117],'Let AI Define the Loss',32)],
}
assets=[]
for number in range(16,26):
 source=documents['ntu'][number-1]
 preview=source.get_pixmap(matrix=fitz.Matrix(0.625,0.625),alpha=False)
 thumb=Image.frombytes('RGB',(preview.width,preview.height),preview.samples).convert('1',dither=Image.Dither.NONE)
 buf=io.BytesIO();thumb.save(buf,format='PNG',optimize=True)
 (OUT/f'original-{number:02d}-thumbnail.base64.txt').write_text(base64.b64encode(buf.getvalue()).decode())
 doc=fitz.open();doc.insert_pdf(documents['ntu'],from_page=number-1,to_page=number-1);page=doc[0]
 edits=[]
 for rect,text,size in EDITS.get(number,[]):
  used=label(page,rect,text,size,1 if number==17 else 0)
  edits.append({'rectangle_pdf_points':rect,'english':text,'font_size':used})
 chapter=4 if number<21 else 5
 relative=Path('spaceship-ui/site/assets/assets/posts')/SLUGS[chapter]/f'ntu-self-improving-{number:02d}-en.png'
 target=ROOT/relative;target.parent.mkdir(parents=True,exist_ok=True)
 pix=page.get_pixmap(matrix=fitz.Matrix(1.875,1.875),alpha=False);pix.save(target)
 assets.append({'path':str(relative),'chapter':chapter,'source':'ntu','pdf_page':number,'width':pix.width,'height':pix.height,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'edits':edits,'rights_status':'unverified','operation':'Precise English text overlays on original PDF; no generated diagrams. Unedited pages retain the original English image.'})

# Whole original lecture slides; paper crops are selected only after page review.
for number in [4,5,11]:
 if 'umass' not in documents:continue
 relative=Path('spaceship-ui/site/assets/assets/posts')/SLUGS[4]/f'umass-hcml-reward-specification-p{number:02d}.png'
 target=ROOT/relative;pix=documents['umass'][number-1].get_pixmap(matrix=fitz.Matrix(2,2),alpha=False);pix.save(target)
 assets.append({'path':str(relative),'chapter':4,'source':'umass','pdf_page':number,'width':pix.width,'height':pix.height,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'operation':'Full original English lecture slide; no edits','rights_status':'unverified'})

# Source-review excerpts are not public article text and are not claims of visual QA.
review={}
for key,pages in {'umass':[4,5,11],'eureka':[2],'revolve':[1,2,3],'constitutional':[2],'schultz':[1,2,3]}.items():
 if key not in documents:continue
 review[key]={}
 for n in pages:
  p=documents[key][n-1]
  review[key][str(n)]={'rect':list(p.rect),'blocks':[{'rect':list(b[:4]),'text':b[4]} for b in p.get_text('blocks') if b[4].strip()]}
if 'cs224n' in documents:
 review['cs224n']={}
 for i,p in enumerate(documents['cs224n']):
  t=p.get_text()
  if i>45 and any(w in t.lower() for w in ['reward model','preference','bradley','constitutional']):
   review['cs224n'][str(i+1)]={'rect':list(p.rect),'text':t}
for key,value in review.items():
 (OUT/f'{key}-selected-source-text.json').write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
(OUT/'asset-preparation.json').write_text(json.dumps({'sources':metadata,'assets':assets,'visual_review':'pending','publication':'not-performed-by-this-script'},ensure_ascii=False,indent=2)+'\n')
print('PREPARED',len(assets),'assets; pending visual review',flush=True)

"""Render NTU lower lecture 21-25 and verified companion teaching/research figures.
Also revise the Chinese label on prior chapter 17/NTU page 19, preserving
the untouched source PNG separately. Author-approved nonofficial English edits.
"""
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen
import fitz
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[3]
LECTURE="https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf"
COURSE="https://llmagents-learning.org/slides/dspy_lec.pdf"
PAPER="https://arxiv.org/pdf/2407.10930v2"
SOURCE={ "ntu": LECTURE, "lecture": COURSE, "paper": PAPER }
NTU_SHA="2e2f6114c8cd29edcbd00ca219e697ce6f6471f027857105238b6a590f862ed6"
SLUG="self-improving-ai-18-better-together-and-evolving-goals"
PREVIOUS_SLUG="self-improving-ai-17-archive-dspy-experience"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
FIGURES=[
 ("ntu",21,"ntu-21-original.png",None,"main-1"),
 ("ntu",22,"ntu-22-original.png",None,"main-2"),
 ("ntu",23,"ntu-23-original.png",None,"main-3"),
 ("ntu",24,"ntu-24-original.png",None,"main-4"),
 ("ntu",25,"ntu-25-english.png",None,"main-5"),
 ("lecture",30,"khattab-dspy-30-optimized-multihop.png",None,"external-lecture-1"),
 ("lecture",35,"khattab-dspy-35-module-training-metric.png",None,"external-lecture-2"),
 ("lecture",36,"khattab-dspy-36-optimization-constraints.png",None,"external-lecture-3"),
 ("paper",2,"better-together-v2-algorithm1.png",(307,552,580,724),"paper-algorithm-1")
]
def digest(data): return hashlib.sha256(data).hexdigest()
def draw_translation(im, rectangles):
    # Original white-background text only; preserve original graphs/robots.
    dr=ImageDraw.Draw(im)
    for r,label,font_size,position in rectangles:
        dr.rectangle(r,fill=(255,255,255))
        dr.text(position,label,font=ImageFont.truetype(FONT,font_size),fill=(17,22,27))
    return im
def translate_goal_page(image):
    # 1800x1013 original NTU page25. Regions correspond solely to Chinese text.
    return draw_translation(image,[
      ((125,78,760,207),"Goals Can Change",65,(143,94)),
      ((317,773,515,839),"Become a tank",27,(314,791)),
      ((690,836,1228,903),"Too heavy...should we discard it?",29,(708,849)),
      ((1521,781,1750,849),"Take flight",30,(1530,799))
    ])
def translate_previous():
    manifest_path=ROOT/"docs/self-improving-ai/source-assets/17/manifest.json"
    manifest=json.loads(manifest_path.read_text())
    directory=ROOT/"spaceship-ui/site/assets/assets/posts"/PREVIOUS_SLUG
    original=directory/"ntu-19-original.png"
    target=directory/"ntu-19-english.png"
    before=original.read_bytes()
    record=next(r for r in manifest["assets"] if r.get("pdf")=="ntu" and r.get("pdf_page")==19)
    expected_source_hash = (record.get("edits") or [{}])[0].get("original_image_sha256", record["sha256"])
    if digest(before)!=expected_source_hash:
        raise ValueError("Chapter 17 unmodified PNG changed, refusing English overlay")
    image=Image.open(original).convert("RGB")
    if image.size!=(1800,1013): raise ValueError("Unexpected prior slide geometry")
    edited=draw_translation(image,[
      ((1368,365,1646,438),"Language Model",31,(1375,376))
    ])
    edited.save(target,optimize=True)
    record.update({
      "path":str(target.relative_to(ROOT)),
      "src":"/assets/posts/"+PREVIOUS_SLUG+"/ntu-19-english.png",
      "sha256":digest(target.read_bytes()),
      "operation":"Source PDF render with Chinese label translated to Language Model; shapes and formulas unchanged",
      "edits":[{"original":"語言模型","english":"Language Model",
        "original_image":str(original.relative_to(ROOT)),
        "original_image_sha256":digest(before),"pixel_mask":[1368,365,1646,438]}],
      "rights_status":"unverified","permission_verified":False,
    })
    manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
    return str(target.relative_to(ROOT))
def main():
    cache=Path("/tmp/self-improving-ch18-pdfs");cache.mkdir(exist_ok=True)
    docs,shas={},{};
    for key,url in SOURCE.items():
        p=cache/(key+".pdf")
        if not p.exists():
            with urlopen(Request(url,headers={"User-Agent":"JJo-source-review/1.0"}),timeout=90) as res: data=res.read(60_000_001)
            if len(data)>60_000_000 or not data.startswith(b"%PDF"): raise ValueError("Not a source PDF: "+key)
            p.write_bytes(data)
        data=p.read_bytes();shas[key]=digest(data)
        if key=="ntu" and shas[key]!=NTU_SHA: raise ValueError("Different official NTU PDF")
        docs[key]=fitz.open(stream=data,filetype="pdf")
    if len(docs["ntu"])!=64:raise ValueError("Wrong NTU deck")
    destdir=ROOT/"spaceship-ui/site/assets/assets/posts"/SLUG
    destdir.mkdir(parents=True,exist_ok=True)
    output=[]
    for key,page,name,crop,slot in FIGURES:
        doc=docs[key]
        if not 1<=page<=len(doc): raise ValueError("Source page out of range")
        pg=doc[page-1]; rect=fitz.Rect(crop) if crop else pg.rect
        if not pg.rect.contains(rect) or rect.is_empty: raise ValueError("Invalid paper crop: "+name)
        scale=1800/rect.width
        pix=pg.get_pixmap(matrix=fitz.Matrix(scale,scale),clip=rect,alpha=False)
        file=destdir/name;pix.save(file)
        op="Full original PDF page rendered without edits" if crop is None else "Exact published PDF crop"
        changes=[]
        if key=="ntu" and page==25:
            image=Image.open(file).convert("RGB")
            if image.size!=(1800,1013): raise ValueError("NTU page25 shape drift")
            image=translate_goal_page(image);image.save(file,optimize=True)
            op="Unofficial English edit of four Chinese captions on original NTU page 25"
            changes=[{"original":"目標會改變","english":"Goals Can Change"},
              {"original":"變坦克","english":"Become a tank"},
              {"original":"太重了 … 要不要丟掉","english":"Too heavy...should we discard it?"},
              {"original":"飛起來","english":"Take flight"}]
        image=Image.open(file)
        output.append({"slot":slot,"pdf":key,"pdf_page":page,
          "source":SOURCE[key]+"#page="+str(page),"source_pdf_sha256":shas[key],
          "path":str(file.relative_to(ROOT)),
          "src":"/assets/posts/"+SLUG+"/"+name,
          "width":image.width,"height":image.height,"sha256":digest(file.read_bytes()),
          "crop_pdf_points":list(crop) if crop else None,
          "operation":op,"edits":changes,
          "rights_status":"unverified","permission_verified":False})
    manifest={"chapter":18,"slug":SLUG,"lecture_part":2,"primary_page_range":[21,25],
      "source_pdf_total_pages":64,"rights_status":"unverified","permission_verified":False,
      "sources":{key:{"url":SOURCE[key],"sha256":shas[key],"pages":len(doc)} for key,doc in docs.items()},
      "assets":output}
    dest=ROOT/"docs/self-improving-ai/source-assets/18/manifest.json"
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
    prior=translate_previous()
    print(json.dumps({"chapter":18,"images":len(output),"translated_previous_image":prior,
      "dimensions":{x["src"].split("/")[-1]:[x["width"],x["height"]] for x in output}},
      ensure_ascii=False))
if __name__=="__main__":main()

"""Build only the approved September 5 article assets. No site dependencies change."""
from pathlib import Path
from PIL import Image
from matplotlib import font_manager
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import xml.etree.ElementTree as ET
import zipfile, posixpath, json, hashlib, sys

source=Path(sys.argv[1]); assets=Path(sys.argv[2]); assets.mkdir(parents=True,exist_ok=True)

def cells(path,sheet_name,rows,columns):
    ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    rn='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    with zipfile.ZipFile(path) as z:
        wb=ET.fromstring(z.read('xl/workbook.xml'))
        sheet=next(s for s in wb.findall('s:sheets/s:sheet',ns) if s.attrib['name']==sheet_name)
        rel=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        target=next(r.attrib['Target'] for r in rel if r.attrib['Id']==sheet.attrib['{'+rn+'}id'])
        member=target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/'+target)
        ss=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            ss=[''.join(e.itertext()) for e in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        root=ET.fromstring(z.read(member)); result=np.full((rows,columns),np.nan)
        for c in root.findall('.//s:sheetData/s:row/s:c',ns):
            ref=c.attrib['r']; letters=''.join(t for t in ref if t.isalpha()); r=int(''.join(t for t in ref if t.isdigit()))-1
            col=0
            for letter in letters: col=col*26+ord(letter)-ord('A')+1
            col-=1
            if not (0<=r<rows and 0<=col<columns): continue
            v=c.find('s:v',ns)
            if v is not None:
                value=ss[int(v.text)] if c.get('t')=='s' else v.text
                result[r,col]=float(value)
        assert np.isfinite(result).all(),('Missing or non-numeric source cells',sheet_name)
        return result

d=cells(source/'perovskite-data-3.xlsx','Fig1b',21,7)
s=cells(source/'perovskite-data-4.xlsx','Fig1h',12001,3)
assert np.allclose(d.mean(axis=0),[24.07517,26.57987,24.64425,24.39935,26.29810,25.12659,27.43724],atol=.002)
assert abs(s[-1,0]-2000)<.01
assert np.allclose(s[-1,1:],[22.90141,13.65016],atol=.02)
assert np.all(np.diff(s[:,0])>=0)
fonts=[f for f in font_manager.findSystemFonts() if 'NotoSansCJK' in f or 'NanumGothic' in f]
assert fonts,'A Korean-capable font is required; do not publish missing glyphs'
font=font_manager.FontProperties(fname=fonts[0])

def save(fig,ax,name):
    for t in [ax.title,ax.xaxis.label,ax.yaxis.label,*ax.get_xticklabels(),*ax.get_yticklabels(),*ax.texts]:t.set_fontproperties(font)
    if ax.get_legend():
        for t in ax.get_legend().get_texts():t.set_fontproperties(font)
    fig.tight_layout(pad=1.8);fig.savefig(assets/name,dpi=200,bbox_inches='tight');plt.close(fig)

fig,ax=plt.subplots(figsize=(9,4.5))
ax.errorbar([14.5,6.2],[1,0],xerr=[[4.1,2.1],[9.9,3.9]],fmt='o',markersize=9,capsize=6)
ax.set(yticks=[1,0],yticklabels=['아자시티딘 + 베네토클락스','유도항암치료'],xlim=(0,28),ylim=(-.65,1.7),xlabel='중앙 사건무발생생존기간 (개월)',title='PARADIGM: 중앙값과 95% 신뢰구간')
for x,y,label in [(14.5,1,'14.5개월 [10.4–24.4]'),(6.2,0,'6.2개월 [4.1–10.1]')]:ax.text(x,y+.24,label,ha='center')
ax.grid(axis='x',alpha=.25);save(fig,ax,'aml-efs.png')

fig,ax=plt.subplots(figsize=(9,4.8));p=np.array([1,0])
ax.errorbar([28,2],p+.12,xerr=[[9,1.7],[11,6]],fmt='o',capsize=5,label='아자시티딘 + 베네토클락스')
ax.errorbar([41,12],p-.12,xerr=[[11,6],[11,8]],fmt='s',capsize=5,label='유도항암치료')
ax.set(yticks=[1,0],yticklabels=['3등급 이상 감염','3등급 이상 출혈'],xlim=(0,60),ylim=(-.55,1.8),xlabel='해당 이상반응을 겪은 환자 비율 (%)',title='PARADIGM: 이상반응 비율과 95% 신뢰구간')
ax.legend(loc='upper right',frameon=False);ax.grid(axis='x',alpha=.25);save(fig,ax,'aml-adverse-events.png')

fig,ax=plt.subplots(figsize=(9,4.7))
ax.step([0,2,6,8,10],[1,.8,8/15,4/15,4/15],where='post',label='가상 5명의 Kaplan–Meier 추정')
ax.plot([4],[.8],marker='+',markersize=15,linestyle='none',label='검열');ax.axhline(.5,linestyle=':',linewidth=1)
ax.set(xlim=(0,10),ylim=(0,1.06),xlabel='관찰 시간 (임의 단위)',ylabel='사건이 없을 확률의 추정값',title='교육용 가상 자료 — PARADIGM의 실제 생존곡선이 아님')
ax.legend(loc='lower left',frameon=False);ax.grid(alpha=.2);save(fig,ax,'aml-km-teaching-example.png')

fig,ax=plt.subplots(figsize=(10,5.2))
for i in range(7):
    ax.plot(i+np.linspace(-.16,.16,21),d[:,i],'o',markersize=4,alpha=.7)
    ax.plot([i-.2,i+.2],[np.median(d[:,i])]*2)
ax.set(xticks=range(7),xticklabels=['기준','MTIm@p','MTIm@n','MAIm@p','MAIm@n','반대 배치','DICS\n맞는 배치'],ylabel='전력변환효율 (%)',ylim=(22.5,28.3),title='계면 배치에 따른 소자 효율 분포')
ax.text(.02,.96,'각 점 = 소자 1개 · 조건별 21개 · 가로선 = 중앙값',transform=ax.transAxes,va='top');ax.grid(axis='y',alpha=.2);save(fig,ax,'perovskite-device-distribution.png')

fig,ax=plt.subplots(figsize=(9,5))
ax.plot(s[:,0],s[:,1],label='DICS: 초기 효율 26.23%');ax.plot(s[:,0],s[:,2],label='기준 소자: 초기 효율 25.15%')
ax.set(xlim=(0,2000),ylim=(0,30),xlabel='최대전력점 추적 시간 (h)',ylabel='전력변환효율 (%)',title='85°C · 질소 분위기 · 연속 1 Sun 조명')
ax.legend(loc='lower left',frameon=False);ax.grid(alpha=.2);save(fig,ax,'perovskite-stability-85c.png')

fig,ax=plt.subplots(figsize=(9,4.6));ax.barh([1,0],[11.9,1])
ax.set(yticks=[1,0],yticklabels=['주주 인수 대가\n약 119억 달러','직원 지분보상 유지 프로그램\n최대 약 10억 달러'],xlim=(0,14),xlabel='십억 달러 (USD billion)',title='NVIDIA 공시: 지급 대상과 조건이 다른 두 항목')
ax.text(12.05,1,'약 11.9',va='center');ax.text(1.15,0,'최대 약 1.0',va='center');ax.grid(axis='x',alpha=.2);save(fig,ax,'nvidia-consideration.png')

mapping={'weather-model':'weather-model.png','weather-stations':'weather-stations.png','weather-rain':'weather-rain.png','weather-artifacts':'weather-artifacts.png','astra-injection':'astra-injection.png','astra-monitoring':'astra-monitoring.png','astra-control':'astra-control.png','nvidia-repositories':'nvidia-repos.png'}
for target,original in mapping.items():
    im=Image.open(source/original).convert('RGB');im.save(assets/(target+'.webp'),lossless=True)
im=Image.open(source/'perovskite-figure-2.png');w,h=im.size
im.crop((0,0,round(w*.626),round(h*.447))).convert('RGB').save(assets/'perovskite-connectivity.webp',lossless=True)
im=Image.open(source/'perovskite-figure-3.png');w,h=im.size
im.crop((0,0,round(w*.43),round(h*.295))).convert('RGB').save(assets/'perovskite-device-stack.webp',lossless=True)
Image.open(source/'perovskite-figure-4.png').crop((0,390,282,744)).convert('RGB').save(assets/'perovskite-module-photo.webp',lossless=True)
files=list(assets.glob('*'));assert len(files)==17,len(files)
manifest={}
for f in files:
    im=Image.open(f);im.verify()
    with Image.open(f) as im:width,height=im.size
    manifest[f.name]={'width':width,'height':height,'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
report={'assets':manifest,'perovskite_distribution_shape':list(d.shape),'perovskite_condition_means':d.mean(axis=0).tolist(),'stability_rows':len(s),'stability_last_row':s[-1].tolist(),'aml_result_figures':'public abstract summary statistics, not patient-level survival curves','aml_km':'explicit synthetic teaching example','source_transformations':'limited panel crops and lossless WebP conversion; no fabricated observations'}
(assets.parent/'sep05-asset-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))

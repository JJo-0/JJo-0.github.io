from pathlib import Path
import json
import hashlib
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.ticker import NullFormatter
from PIL import Image

root = Path('sources')
out = Path('release/spaceship-ui/site/assets/assets/posts/astra-aml-review')
out.mkdir(parents=True, exist_ok=True)
font_path = next((p for p in font_manager.findSystemFonts() if 'NanumGothic.ttf' in p), None)
if not font_path:
    raise RuntimeError('Korean chart font is required')
font = font_manager.FontProperties(fname=font_path)

def save_chart(fig, ax, filename):
    for text in [ax.title, ax.xaxis.label, ax.yaxis.label, *ax.get_xticklabels(), *ax.get_yticklabels(), *ax.texts]:
        text.set_fontproperties(font)
    if ax.get_legend():
        for text in ax.get_legend().get_texts():
            text.set_fontproperties(font)
    if filename == 'base-rate.png':
        ax.set_xticks([.01,.1,1,10,50], labels=['0.01','0.1','1','10','50'])
        ax.xaxis.set_minor_formatter(NullFormatter())
        for text in ax.get_xticklabels(): text.set_fontproperties(font)
    fig.tight_layout(pad=1.7)
    fig.savefig(out / filename, dpi=180, bbox_inches='tight')
    plt.close(fig)

# Summary measurements only, not reconstructed individual patient survival.
fig, ax = plt.subplots(figsize=(9, 4.5))
ax.errorbar([14.5,6.2],[1,0],xerr=[[4.1,2.1],[9.9,3.9]],fmt='o',capsize=6,markersize=9)
ax.set(yticks=[1,0],yticklabels=['아자시티딘 + 베네토클락스','유도항암치료'],xlim=(0,28),ylim=(-.65,1.65),xlabel='중앙 사건무발생생존기간 (개월)',title='PARADIGM: 중앙값과 95% 신뢰구간')
for x,y,text in [(14.5,1,'14.5개월 [10.4–24.4]'),(6.2,0,'6.2개월 [4.1–10.1]')]: ax.text(x,y+.23,text,ha='center')
ax.grid(axis='x',alpha=.2)
save_chart(fig,ax,'aml-efs.png')

fig, ax = plt.subplots(figsize=(9,4.8))
pos=np.array([1,0])
ax.errorbar([28,2],pos+.12,xerr=[[9,1.7],[11,6]],fmt='o',capsize=5,label='아자시티딘 + 베네토클락스')
ax.errorbar([41,12],pos-.12,xerr=[[11,6],[11,8]],fmt='s',capsize=5,label='유도항암치료')
ax.set(yticks=[1,0],yticklabels=['3등급 이상 감염','3등급 이상 출혈'],xlim=(0,60),ylim=(-.55,1.8),xlabel='환자 비율 (%)',title='PARADIGM: 이상반응 비율과 95% 신뢰구간')
ax.legend(frameon=False);ax.grid(axis='x',alpha=.2)
save_chart(fig,ax,'aml-adverse-events.png')

# Synthetic five-person example, explicitly not PARADIGM patient data.
fig, ax = plt.subplots(figsize=(9,4.8))
ax.step([0,2,6,8,10],[1,.8,8/15,4/15,4/15],where='post',label='가상 5명의 Kaplan–Meier 추정')
ax.plot([4],[.8],marker='+',markersize=16,linestyle='none',label='사건 없이 추적 종료: 검열')
ax.axhline(.5,linestyle=':',linewidth=1)
ax.set(xlim=(0,10),ylim=(0,1.08),xlabel='관찰 시간 (임의 단위)',ylabel='사건이 없을 확률',title='교육용 가상 자료 — 실제 PARADIGM 생존곡선이 아님')
ax.legend(loc='lower left',frameon=False);ax.grid(alpha=.2)
save_chart(fig,ax,'aml-km-teaching-example.png')

fig, ax = plt.subplots(figsize=(9,3.8))
ax.errorbar([.57],[0],xerr=[[.18],[.27]],fmt='o',capsize=7,markersize=10)
ax.axvline(1,linestyle='--',linewidth=1);ax.set_xscale('log')
ax.set(xlim=(.2,1.6),ylim=(-.6,.8),yticks=[],xticks=[.25,.5,1,1.5],xticklabels=['0.25','0.5','1','1.5'],xlabel='EFS 위험비 (로그 눈금)',title='PARADIGM: HR 0.57, 95% 신뢰구간 0.39–0.84')
ax.text(.57,.25,'0.57 [0.39–0.84]',ha='center');ax.text(1.025,-.25,'위험이 같음',ha='left');ax.grid(axis='x',alpha=.2)
save_chart(fig,ax,'aml-hazard-ratio.png')

fig, ax = plt.subplots(figsize=(9,4))
ax.barh([1,0],[60,40])
ax.set(yticks=[1,0],yticklabels=['아자시티딘 + 베네토클락스','유도항암치료'],xlim=(0,100),xlabel='후속 조혈모세포 이식으로 진행한 비율 (%)',title='연구기관 발표: 이식으로 이어진 환자의 비율')
ax.text(62,1,'60%',va='center');ax.text(42,0,'40%',va='center');ax.grid(axis='x',alpha=.2)
save_chart(fig,ax,'aml-transplant.png')

fig, ax = plt.subplots(figsize=(9,4.8))
prevalence=np.geomspace(.0001,.5,600)
precision=.9*prevalence/(.9*prevalence+.05*(1-prevalence))
ax.plot(prevalence*100,precision*100)
v=.9*.01/(.9*.01+.05*.99)
ax.plot([1],[v*100],'o')
ax.annotate('기저율 1% → 경보 중 약 15.4%가 참양성',(1,v*100),xytext=(1.3,35),arrowprops={'arrowstyle':'->'},fontproperties=font)
ax.set_xscale('log')
ax.set(xlim=(.01,50),ylim=(0,100),xlabel='실제 위험 비율: 기저율 (%)',ylabel='경보의 양성예측도 (%)',title='교육용 계산: 민감도 90%, 오경보율 5%를 고정')
ax.grid(alpha=.2)
save_chart(fig,ax,'base-rate.png')

for n in [4,5,7,8,9,10,11,14,22,28]:
    source=root/'latest'/f'astra-figure-{n:02d}.png'
    Image.open(source).convert('RGB').save(out/f'astra-{n:02d}.webp',lossless=True)
Image.open(root/'background/bcl2-original-0.jpg').convert('RGB').save(out/'bcl2-structure.webp',lossless=True)

inventory=[]
for path in sorted(out.iterdir()):
    if path.is_file():
        im=Image.open(path)
        inventory.append({'name':path.name,'width':im.width,'height':im.height,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
assert len(inventory)==17
Path('audit').mkdir(exist_ok=True)
Path('audit/asset-inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2),encoding='utf8')
print('Generated and inspected',len(inventory),'assets; no font files included in site assets')

"""Original teaching tables/charts. No publisher artwork is reproduced."""
from pathlib import Path
import argparse
import hashlib
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager


def make_all(out: Path) -> list[dict]:
    out.mkdir(parents=True, exist_ok=True)
    font = Path('/usr/share/fonts/truetype/nanum/NanumGothic.ttf')
    if font.exists():
        font_manager.fontManager.addfont(str(font))
        plt.rcParams['font.family'] = 'NanumGothic'
    plt.rcParams['axes.unicode_minus'] = False
    plt.rcParams['font.size'] = 14
    records = []

    def finish(fig, name, note, source, role):
        fig.text(.06, .055, note, fontsize=11, va='bottom')
        path = out / (name + '.png')
        fig.savefig(path, dpi=110, metadata={'Software': 'JJo original educational chart'})
        plt.close(fig)
        from PIL import Image
        with Image.open(path) as im:
            dims = im.size
        records.append({'file': path.name, 'width': dims[0], 'height': dims[1],
                        'bytes': path.stat().st_size,
                        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                        'credit': 'JJo · 자체 제작 교육용 도표 · 2026-09-12',
                        'license': 'CC BY 4.0',
                        'rights': 'https://creativecommons.org/licenses/by/4.0/',
                        'source': source, 'role': role, 'caption': note})

    def table(title, columns, rows, widths):
        fig, ax = plt.subplots(figsize=(10, 5.5))
        fig.subplots_adjust(left=.05, right=.95, bottom=.22, top=.76)
        ax.set_axis_off()
        fig.suptitle(title, fontsize=22, y=.92)
        t = ax.table(cellText=rows, colLabels=columns, colWidths=widths, loc='center', cellLoc='center')
        t.auto_set_font_size(False)
        t.set_fontsize(13)
        t.scale(1, 2.7)
        return fig

    fig = table('DNA·유전자·염색체는 같은 말이 아니다', ['용어','무엇을 가리키나'],
                [['DNA','유전정보를 담는 분자'],['염기','DNA를 이루는 네 종류의 글자'],
                 ['유전자','DNA 안에서 기능을 가진 구간'],['염색체','DNA와 단백질이 함께 포장된 구조']], [.24,.76])
    finish(fig,'embryo-terms','용어 설명표 · 크기나 모양을 재현한 현미경 사진이 아닙니다.',
           'https://www.genome.gov/genetics-glossary/Genome','original-definition-table')
    fig = table('목표가 같게 바뀌어도 다른 위치는 다를 수 있다', ['가상의 세포','목표 위치','다른 위치'],
                [['세포 A','원하는 변화 있음','추가 변화 없음'],['세포 B','원하는 변화 있음','추가 변화 있음']], [.26,.37,.37])
    finish(fig,'embryo-mosaic','모자이크성의 설명용 가상 사례 · 논문 표본·오류율·실제 측정 결과가 아닙니다.',
           'https://www.genome.gov/genetics-glossary/Mosaicism','original-hypothetical-table')

    fig, ax = plt.subplots(figsize=(10,5.5))
    fig.subplots_adjust(left=.13,right=.95,bottom=.25,top=.79)
    x = np.linspace(.30,.60,120)
    ax.plot(x,.33/x)
    ax.scatter([.33,.55],[1,.6])
    ax.annotate('NA 0.33 → 기준 1.00',(.33,1),xytext=(10,-10),textcoords='offset points')
    ax.annotate('NA 0.55 → 약 0.60',(.55,.6),xytext=(-140,15),textcoords='offset points')
    ax.set(xlabel='개구수 NA',ylabel='상대 선폭 (0.33 기준)',ylim=(.45,1.25),xlim=(.29,.61))
    fig.suptitle('다른 조건이 같다면 NA가 클수록 선폭은 작아진다',fontsize=20,y=.94)
    finish(fig,'highna-resolution','CD ∝ 1/NA를 계산한 교육용 그래프 · 실제 칩 크기·원가·처리량의 개선률이 아닙니다.',
           'https://www.asml.com/en/technology/lithography-principles/rayleigh-criterion','original-model-calculation')

    fig, ax = plt.subplots(figsize=(10,5.5))
    fig.subplots_adjust(left=.40,right=.94,bottom=.25,top=.79)
    ax.scatter([2030,2031,2033],[2,1,0],s=120)
    ax.set_yticks([2,1,0],['High NA 활용 의향','대형 마스크 시험라인 목표','대형 마스크 시스템 준비 목표'])
    ax.set_xticks([2030,2031,2032,2033])
    ax.set(xlim=(2029.5,2033.5),ylim=(-.6,2.6),xlabel='목표 연도')
    fig.suptitle('세 날짜는 서로 다른 계획이다',fontsize=23,y=.94)
    finish(fig,'highna-roadmap','ASML·TSMC 2026-09-08 발표를 재정리 · 미래 목표이며 달성 실적이 아닙니다.',
           'https://www.asml.com/en/news/press-releases/2026/tsmc-and-asml-announce-industry-transition-to-large-format-photomasks-for-high-na-euv','original-roadmap-plot')

    fig, ax = plt.subplots(figsize=(10,5.5))
    fig.subplots_adjust(left=.13,right=.95,bottom=.25,top=.79)
    x=np.linspace(.1,1,100)
    ax.plot(x,x)
    ax.scatter([.5,1],[.5,1])
    ax.set(xlabel='상대 두께 L/L0',ylabel='막 자체의 상대 저항 R/R0',xlim=(0,1.1),ylim=(0,1.1))
    fig.suptitle('같은 재료와 면적이라면 얇을수록 막 저항은 작아진다',fontsize=19,y=.94)
    finish(fig,'sulfide-resistance','R=L/(σA)의 단순 모델 · 계면·전극 저항을 제외한 계산이며, 논문 실측값이 아닙니다.',
           'https://www.nature.com/articles/s41467-026-77590-1','original-model-calculation')

    fig, ax = plt.subplots(figsize=(10,5.5))
    fig.subplots_adjust(left=.13,right=.95,bottom=.25,top=.79)
    bars=ax.bar(['기준 용량','1,000회 뒤 용량'],[100,83],width=.5)
    ax.bar_label(bars,labels=['100% (기준)','83% (보고값)'],padding=5)
    ax.set(ylabel='기준 대비 용량 (%)',ylim=(0,120))
    fig.suptitle('용량 83% 유지 ≠ 에너지 효율 83%',fontsize=22,y=.94)
    finish(fig,'sulfide-retention','Figure 5d의 끝값만 재정리 · 40°C·0.5C·2MPa · 중간 수명곡선을 복원한 그림이 아닙니다.',
           'https://www.nature.com/articles/s41467-026-77590-1','original-reported-endpoint-comparison')

    fig, ax = plt.subplots(figsize=(10,5.5))
    fig.subplots_adjust(left=.13,right=.95,bottom=.25,top=.79)
    bars=ax.bar(['기존 반응 범위','확장된 반응 범위'],[2,3],width=.5)
    ax.bar_label(bars,labels=['전자 2개','전자 3개'],padding=5)
    ax.set(ylabel='황 원자 하나당 전자 수',ylim=(0,3.8),yticks=[0,1,2,3])
    fig.suptitle('전자 2개에서 3개로: 이론적인 범위는 50% 증가',fontsize=20,y=.94)
    finish(fig,'sulfur-electrons','산화수 차이를 센 교육용 비교 · 실험에서 보고한 용량 증가율 58%와는 다른 기준입니다.',
           'https://www.nature.com/articles/s41560-026-02086-7','original-stoichiometric-count')

    fig, ax = plt.subplots(figsize=(10,5.5))
    fig.subplots_adjust(left=.13,right=.95,bottom=.25,top=.79)
    bars=ax.bar(['포함한 무게 0.1kg','포함한 무게 0.5kg'],[1000,200],width=.5)
    ax.bar_label(bars,labels=['1,000Wh/kg','200Wh/kg'],padding=5)
    ax.set(ylabel='무게당 에너지 (Wh/kg)',ylim=(0,1250))
    fig.suptitle('가상 에너지 100Wh라도 포함 무게에 따라 숫자가 다르다',fontsize=19,y=.94)
    finish(fig,'sulfur-mass','전부 설명용 가상 수치 · 논문의 1,700Wh/kg을 셀·팩 수준으로 환산한 값이 아닙니다.',
           'https://web.mit.edu/evt/summary_battery_specifications.pdf','original-hypothetical-calculation')
    (out/'provenance.json').write_text(json.dumps({'assets':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return records

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('out',type=Path)
    args=parser.parse_args()
    print(json.dumps(make_all(args.out),ensure_ascii=False))

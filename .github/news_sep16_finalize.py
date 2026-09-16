from pathlib import Path
import json, re, hashlib, html, subprocess, os, zipfile, io
import requests

ROOT=Path('spaceship-ui')
SITE=ROOT/'site'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda p:Path(p).read_text()
write=lambda p,t:Path(p).write_text(t,encoding='utf-8')
def save(p,obj):
    Path(p).parent.mkdir(parents=True,exist_ok=True)
    write(p,json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def count(body):
    text=body.split('## 9.')[0]
    text=re.sub(r'^import .*;\s*$','',text,flags=re.M)
    text=re.sub(r'<[^>]+>','',text)
    text=re.sub(r'\[([^\]]+)\]\([^)]*\)',r'\1',text)
    text=re.sub(r'\[\d+(?:,\d+)*\]','',text)
    text=re.sub(r'[*#|`>]+','',text)
    return len(re.sub(r'\s+',' ',text).strip())

entries=[
 {'key':'hydrogen','slug':'2026-09-16-seawater-hydrogen-water-news','title':'바닷물 수소의 해법은 버려지는 열에 있었다','category':'finance-industry','subcategory':'hydrogen-energy','selection':'frontier-one','score':97,'source':'https://www.nature.com/articles/s41560-026-02130-6','mediaIds':['sep16-hydrogen-1','sep16-hydrogen-2']},
 {'key':'medical','slug':'2026-09-16-onprem-medical-agent-news','title':'의료 AI는 언제 사람에게 넘겨야 할까요?','category':'health-lifestyle','subcategory':'clinical-ai','selection':'frontier-candidate','score':94,'source':'https://www.nature.com/articles/s41591-026-04609-x','mediaIds':['sep16-medical-6','sep16-medical-2']},
 {'key':'oect','slug':'2026-09-16-oect-swelling-mapping-news','title':'젖은 반도체가 오래 일하려면 어디를 봐야 할까요?','category':'finance-industry','subcategory':'organic-bioelectronics','selection':'frontier-candidate','score':89,'source':'https://www.nature.com/articles/s41928-026-01708-y','mediaIds':['sep16-oect-2','sep16-oect-1']},
]
provenance=json.loads(read(SITE/'assets/assets/posts/news-20260916/provenance.json'))
byid={p['id']:p for p in provenance}
assert len(byid)==6
media_path=SITE/'news-media.json'
media=json.loads(read(media_path));old_media=json.loads(read(media_path))
labels={
 'sep16-hydrogen-1':('관련 연구 원본 · 2026년 7월 배경자료','2026년 7월 OMD-AWE 연구의 막증류·수전해 통합 개념도','Cassol 등의 2026년 7월 7일 Figure 1. 삼투 막증류와 알칼라인 수전해의 열·물 연결을 보여준다. 이번 9월 STHW의 20kW·250kW 장치 사진이나 배관도는 아니다. 그림의 온도는 이 별도 연구 조건이다.','Cassol et al. (2026-07-07)'),
 'sep16-hydrogen-2':('관련 연구 원본 · 2026년 7월 배경자료','관련 막증류 연구에서 온도와 물 이동·막 안정성을 비교한 전체 원본 패널','같은 7월 OMD-AWE 연구의 Figure 2. 온도와 물 이동량, 막의 오염·안정성을 함께 읽는 배경자료다. 이번 STHW의 100일·40일 운전 데이터가 아니다.','Cassol et al. (2026-07-07)'),
 'sep16-medical-6':('이번 논문 원본 · 2026년 9월 15일','의료 AI가 남기는 사례 비율과 선별 정확도 및 사람 검토 흐름을 보여주는 원논문 Figure 6','Zhang 등의 Figure 6 전체. 일관성 기준에 따른 커버리지·정확도와 551개 사례의 분기를 보여준다. 272개를 남긴 집단의 98.9%이며 전체 사례의 진단 정확도나 실제 환자 임상시험 결과가 아니다.','Zhang et al. (2026-09-15)'),
 'sep16-medical-2':('이번 논문 원본 · 2026년 9월 15일','여러 의료 언어모델의 질환별 진단과 실행 변동을 비교한 원논문 Figure 2','Zhang 등의 Figure 2 전체. 같은 에이전트 구조에서 모델·질환별 성능을 비교한다. 최고 모델 비교와 GLM-4.5-Air를 사용한 주요 일관성 분석은 별개다. 텍스트 시뮬레이션 평가이며 실제 자율 진료 도입 실적이 아니다.','Zhang et al. (2026-09-15)'),
 'sep16-oect-2':('관련 연구 원본 · 2024년 배경자료','OECT 전기 응답과 실제 소자의 광학현미경 사진이 포함된 2024년 Figure 2','Kim 등의 2024년 9월 1일 Figure 2 전체. OECT 소자의 전기적 특성과 현미경 사진을 보여준다. 이번 2026년 LDV-M 장치 사진이나 1,500만 회 내구성 결과가 아니다.','Kim et al. (2024-09-01)'),
 'sep16-oect-1':('관련 연구 원본 · 2024년 배경자료','2024년 OECT 소신호 측정 구성과 전기적 특성 분포를 보여주는 Figure 1','같은 2024년 연구의 Figure 1. 전기 입력과 응답을 평가하는 구성을 소개한다. 이번 논문이 추가한 위치별 팽윤 지도와 구별되는 배경자료이며 2026년 레이저 측정 결과가 아니다.','Kim et al. (2024-09-01)'),
}
for index,e in enumerate(entries):
    for mid in e['mediaIds']:
        assert mid not in media
        p=byid[mid]
        kind,alt,caption,credit=labels[mid]
        item={k:p[k] for k in ['src','width','height','source','license','rights','changes','sha256']}
        item.update(slug=e['slug'],kind=kind,alt=alt,caption=caption,credit=credit,order=index+1)
        assert sha((SITE/'assets'/item['src'].lstrip('/')).read_bytes())==p['sha256']
        media[mid]=item
assert all(media[k]==v for k,v in old_media.items())
save(media_path,media)

blog={
'hydrogen':'''바닷물에서 수소를 만든다고 하면 소금을 견디는 특별한 전극을 먼저 떠올리게 됩니다. 그런데 9월 15일 Nature Energy에 발표된 연구는 다른 길을 택했습니다. 바닷물을 전해조에 그대로 넣는 대신 먼저 깨끗한 물로 분리하고, 여기에 필요한 열을 수소 생산 장치에서 가져왔습니다. 이미 있는 두 기술 사이의 연결을 바꾼 것입니다.

물을 전기분해하면 수소와 산소를 얻습니다. 하지만 물이 공짜 연료라는 뜻은 아닙니다. 바깥에서 전기를 공급해야 하고 그 에너지 일부가 수소에 저장됩니다. 나머지는 열 등으로 나타나 장치의 온도를 관리해야 합니다. 연구진은 냉각하면서 버릴 수 있는 열이 다른 공정에서는 필요한 자원이라는 점에 주목했습니다.

소금물에서 물만 증발시킨 뒤 다시 액체로 모으면 염분을 분리할 수 있습니다. 이런 증류에는 열이 필요합니다. 한쪽에서 열을 버리고 다른 쪽에서 새 에너지를 투입하는 대신, 뜨거운 수전해 용액의 열을 열교환기로 넘기면 어떨까요? 열교환기는 두 액체를 섞지 않고 벽을 사이에 두어 열만 전달하는 부품입니다.

이번 시스템은 약 85°C의 수전해 조건과 약 44°C의 저온 증류를 연결합니다. 물이 100°C에서 끓는다고 배웠는데 이상하게 느껴질 수 있습니다. 끓는 온도는 압력에 따라 바뀌고, 증발은 끓는점 아래에서도 일어납니다. 따라서 낮은 온도에서도 분리할 수 있도록 압력과 흐름을 설계하는 것이지, 바닷물을 조금 데우기만 하면 자동으로 담수가 쏟아지는 것은 아닙니다.

연구진은 먼저 20kW 파일럿을 만들고 100일 동안 시험했습니다. 여기서 꼭 붙여야 할 조건이 있습니다. 매일 기동과 정지를 반복하면서 하루 4시간 정상부하로 운전한 시험입니다. 100일을 쉬지 않고 24시간 연속 가동했다는 뜻이 아닙니다. 수소 생산량은 시간당 3.8Nm³였습니다. Nm³는 기체 부피를 기준 온도와 압력으로 맞춘 단위이며 킬로그램과 다릅니다.

이후 250kW 장치로 확대해 수소 48Nm³/h와 담수 31.6kg/h를 보고했습니다. 이 규모의 안정성 평가는 40일이며, 첫 10일과 다음 30일의 수소 생산 설정이 달랐습니다. 장치가 커졌다는 점은 의미 있지만 수년 동안 가동하는 상업 공장의 수율·정비비를 확인한 시험으로 바뀌지는 않습니다.

20kW 비교에서는 저자가 보고한 총에너지 값이 수소 부피 단위당 7.46에서 6.14kWh로 줄었습니다. 두 보고값의 차이는 약 17.7%입니다. 다만 특정 분리형 증류·수전해 공정과의 비교입니다. 다른 담수화 기술인 역삼투 설비가 모두 이만큼 더 많은 전기를 쓴다는 뜻은 아닙니다. 250kW의 14.4% 전력효율 개선은 기준이 또 달라 두 퍼센트를 더해서는 안 됩니다.

원문 대조에서 확인할 점도 있었습니다. 보충 그림 설명과 표에 적힌 소규모 담수 생산량의 대응이 서로 달라 어느 쪽이 맞는지 단정하지 않았습니다. 전체 해설에는 이 차이를 남겼습니다. 경제성 계산의 30년 수명과 97% 설비이용률도 실험 실적이 아닌 미래 운전의 가정입니다. 깨끗한 표 하나가 있다고 실제 사업의 원가가 확정되는 것은 아닙니다.

본문의 그림 두 개는 재사용이 허용된 2026년 7월 관련 막증류 연구의 원본입니다. 이번 250kW 장치의 사진은 아니며 구성과 온도 조건도 다릅니다. 이번 논문의 실제 20kW 장치 사진은 공식 보충자료에서 확인할 수 있습니다. 앞으로는 더 큰 장치의 장기간 연속운전, 해수 오염과 세척, 전력이 변할 때의 제어 성능을 봐야 합니다. 열과 물이 실제로 어떻게 연결되는지와 숫자를 비교할 때의 함정은 GitHub 전체 해설에서 이어집니다.''',
'medical':'''의료 AI가 열 문제 중 아홉 문제를 맞혔다고 해 보겠습니다. 좋은 결과이지만 지금 내 질문이 틀릴 한 문제에 해당하는지는 여전히 모릅니다. 9월 15일 Nature Medicine 연구는 바로 이 문제를 다룹니다. 모든 사례를 AI에게 맡기지 말고, 비교적 믿을 만한 사례만 남긴 뒤 나머지는 사람에게 넘길 수 있는지 시험했습니다.

먼저 이 연구는 실제 환자를 AI가 독립적으로 진료한 임상시험이 아닙니다. 과거 의료기록과 증례를 이용한 텍스트 시뮬레이션입니다. 의사 역할의 소프트웨어가 환자 역할의 소프트웨어와 대화하고, 준비된 검사 정보를 받아 진단을 만듭니다. 검사를 요청했다는 표현을 실제 환자에게 검사를 시행했다고 이해하면 안 됩니다.

또 온프레미스라는 말이 나옵니다. 모델을 병원 등 기관이 관리하는 내부 서버에 두는 방식입니다. 모델 버전과 접근 권한을 직접 통제하는 데 도움이 될 수 있지만, 내부에 둔다고 진단이 맞아지는 것은 아닙니다. 개인정보를 누가 다루는지와 판단이 얼마나 정확한지는 따로 평가해야 합니다. 서버 위치가 안전한 진료를 보증하지는 않습니다.

연구진은 같은 사례를 기본적으로 다섯 번 풀게 했습니다. 모델은 확률적으로 문장을 만들기 때문에 같은 정보를 받아도 다른 답을 낼 수 있습니다. 다섯 답변의 의미를 숫자 벡터로 바꾼 뒤 서로 얼마나 비슷한지 계산했습니다. 이를 일관성 점수로 사용합니다. 전문용어를 많이 쓰거나 확신에 찬 말투를 보인다는 이유만으로 정답이라고 보지 않는 접근입니다.

주의할 점은 일관성 0.90이 질병의 확률 90%가 아니라는 것입니다. 다섯 답변을 두 개씩 묶으면 열 쌍이 나오는데, 그 의미 유사도를 평균 낸 점수입니다. 모델이 다섯 번 같은 방식으로 틀릴 수도 있습니다. 그래서 일관성은 정답을 보증하는 도장이 아니라, 어떤 답을 검토할지 정하기 위한 하나의 신호입니다.

논문의 주요 선별 분석에서는 551개 사례 가운데 272개를 자동 처리 후보로 남겼습니다. 전체의 49.4%입니다. 그 안에서 맞은 것은 269개, 틀린 것은 3개여서 정확도가 약 98.9%였습니다. 기사 제목에서 98.9%만 보면 모든 사례를 거의 완벽하게 진단했다고 오해하기 쉽습니다. 하지만 이 수치는 절반 정도만 남긴 집단에서 계산한 결과입니다.

사람에게 넘긴 279개도 모두 오답은 아니었습니다. 원래 AI가 맞힌 230개와 틀린 49개가 함께 들어 있습니다. 사람이 그 사례를 얼마나 잘 해결하는지, 검토에 시간이 얼마나 드는지는 별도로 봐야 합니다. 따라서 이 실험만으로 의사의 업무가 절반 줄었다고 계산할 수 없습니다. 자동 처리를 줄여 얻은 높은 정확도에는 검토 부담이라는 다른 면이 있습니다.

주요 두 평가는 같은 기관의 의료기록 계열에서 왔지만 외부 평가가 없었던 것은 아닙니다. 의사들이 정리한 PubMed 증례 990개를 사용하는 VivaBench도 시험했습니다. 다만 이는 실제 다른 병원에 배포한 전향적 환자 시험과는 다릅니다. 자료가 바뀌면 성적과 적절한 선별 기준도 달라졌습니다. 최고 진단 모델의 성적과 GLM-4.5-Air로 진행한 주요 일관성 분석도 구별해야 합니다.

여러 AI를 붙이면 무조건 나아진 것도 아닙니다. 다른 진단을 비판하는 에이전트를 추가한 비교에서는 전체 정확도가 기본 구성보다 높아지지 않았습니다. 또한 다섯 번 풀어 보려면 연산과 시간이 더 필요합니다. 연구진은 코드를 공개했고 일부 저자는 관련 회사의 자문·지분·고용 관계를 밝혔습니다. 공개 코드와 이해관계 표시는 검토의 출발점이지 독립 검증의 완료는 아닙니다.

두 그림은 이번 논문의 실제 Figure 6과 Figure 2이며 원래 패널을 보존했습니다. 앞으로 중요한 것은 높은 정확도 한 줄보다 실제 여러 병원에서의 안전성과 사람 검토 뒤의 결과입니다. AI의 자신감과 정답 확률의 차이, 272개와 551개라는 분모, 외부 평가 결과를 읽는 법은 GitHub 전체 해설에서 차근차근 살펴봅니다.''',
'oect':'''전자부품이 물에 젖으면 고장난다고 생각하기 쉽습니다. 그런데 일부 전자소자는 이온이 있는 액체와 상호작용하도록 설계됩니다. 그중 하나가 유기 전기화학 트랜지스터, OECT입니다. 9월 15일 Nature Electronics 연구는 이 소자가 작동할 때 어디가 부푸는지 측정하고, 그 움직임을 보호 구조 개선에 활용했습니다.

트랜지스터는 전류가 흐르는 통로를 다른 입력으로 조절하는 부품입니다. 수도 밸브의 손잡이와 물길을 나눠 생각하면 조금 쉽습니다. OECT에서는 전자가 흐르는 채널에 이온의 이동도 관여합니다. 이온이 들어오거나 나가면 채널의 전도 상태가 달라집니다. 유기라는 말은 유기농 제품이 아니라 탄소 기반 분자·고분자 전자재료를 가리킵니다.

문제는 전기적인 상태가 바뀌는 동안 모양도 달라질 수 있다는 것입니다. 스펀지가 물을 머금어 부푸는 장면을 떠올려 보세요. 실제 채널은 훨씬 얇고 복잡하지만, 물질이 드나들면 부피와 두께가 달라질 수 있다는 점은 비슷합니다. 이런 변화를 팽윤이라고 합니다. 기능에 필요한 이온 이동이 기계적으로는 부담을 줄 수 있습니다.

채널은 혼자 자유롭게 놓인 필름이 아닙니다. 전극과 보호층에 붙어 있거나 사이에 끼어 있습니다. 한 부분은 많이 부풀고 다른 부분은 덜 움직이면 경계에 힘이 집중될 수 있습니다. 처음에는 전류가 잘 나와도 이런 변화가 반복되면 구조가 달라질 수 있습니다. 그래서 전류 그래프만 보는 것과 실제로 어느 위치가 움직이는지 보는 것은 서로 다른 정보를 줍니다.

연구진은 레이저 도플러 진동계에 기반한 장비를 사용했습니다. 움직이는 구급차의 소리 높이가 달라지는 도플러 효과를 떠올리면 원리를 이해하는 데 도움이 됩니다. 움직이는 표면에서 반사된 빛의 미세한 변화를 읽어 표면의 속도와 높이 변화를 추적합니다. 눈으로 레이저의 색이 바뀌는 것을 보는 방법은 아닙니다.

초록은 가로 방향 3마이크로미터, 높이 방향 0.6나노미터, 시간 방향 0.1밀리초 미만의 분해능을 보고합니다. 이 세 숫자는 각각 다른 축입니다. 높이를 아주 정밀하게 잰다고 옆으로 붙은 두 점도 같은 크기로 구별한다는 뜻은 아닙니다. 또 여러 위치를 순서대로 측정해 지도를 만들므로, 전체 3D 영상을 0.1밀리초마다 한 장씩 찍는다고 해석할 수도 없습니다.

연구진은 특히 상부 전극 가장자리의 큰 국소 변형에 주목하고 감싸는 구조를 개선했습니다. 하지만 무조건 단단하게 막는 것이 정답은 아닙니다. OECT에는 이온이 드나드는 기능이 필요하므로 보호를 강화하면서 전기적 성능을 잃지 않아야 합니다. 어디는 지지하고 어디는 움직이게 둘지 정하는 설계 문제에 가깝습니다.

개선된 소자는 1,500만 회 이상의 완전한 스위칭을 견딜 수 있다고 보고됐습니다. 그렇다고 모든 재료가 같은 횟수를 달성한 것은 아닙니다. 보충자료의 대표 비교에는 1,500만 회와 140만 회가 각각 표시됩니다. 반복 횟수만으로 전류가 전혀 변하지 않았다거나 모든 제조 조건의 수명을 보장한다고 말해서는 안 됩니다.

인공 뉴런이 PBS라는 완충 염 용액에서 15일 이상 작동한 결과도 있습니다. 여기서 인공 뉴런은 신경세포의 일부 신호 동작을 흉내 낸 전자회로이며 살아 있는 뇌가 아닙니다. PBS 역시 혈액이나 뇌 조직의 모든 환경을 재현하지 않습니다. 따라서 실제 사람에게 이식해 안전성을 확인한 연구나 장기 의료기기의 승인 소식으로 읽지 않습니다.

이 글의 그림은 2024년 관련 OECT 연구의 원본으로 실제 소자 현미경 사진과 전기 측정 구성을 보여줍니다. 이번 레이저 장치와 내구성 결과는 아래 공식 논문에서 구분해 확인할 수 있습니다. 저자 일부는 관련 측정 플랫폼·소자 설계의 특허 출원을 밝혔습니다. 팽윤 지도를 어떻게 읽는지, 세 종류의 분해능과 반복 시험을 왜 나눠 봐야 하는지는 GitHub 전체 해설에서 이어집니다.'''
}

def figure(mid,priority=False):
    m=media[mid];e=html.escape;src='https://jjo-0.github.io'+m['src']
    return f'<figure style="margin:1.5em 0"><a href="{e(src)}"><img src="{e(src)}" width="{m["width"]}" height="{m["height"]}" alt="{e(m["alt"])}" loading="{"eager" if priority else "lazy"}" style="max-width:100%;height:auto" /></a><figcaption><strong>{e(m["kind"])}</strong><br />{e(m["caption"])}<br />{e(m["credit"])} · <a href="{e(m["source"])}">원출처</a> · <a href="{e(m["rights"])}">CC BY 4.0</a> · {e(m["changes"])}</figcaption></figure>'

for e in entries:
    post=SITE/'content/posts'/f'{e["slug"]}.mdx'
    text=read(post);fm=re.match(r'^---\n([\s\S]*?)\n---',text);assert fm
    e['bodyCharacters']=count(text[fm.end():]);e['postSha256']=sha(post.read_bytes())
    paragraphs=blog[e['key']].strip().split('\n\n')
    parts=['<!-- 권장 제목: '+e['title']+' -->','<article>',figure(e['mediaIds'][0],True)]
    for i,p in enumerate(paragraphs):
        if i==5:parts.append(figure(e['mediaIds'][1]))
        parts.append('<p>'+html.escape(p)+'</p>')
    parts.extend(['<h2>공식 자료와 전체 해설</h2>',f'<p><a href="{e["source"]}">공식 논문</a> · <a href="https://jjo-0.github.io/posts/{e["slug"]}/">GitHub 전체 해설 읽기</a></p>','</article>'])
    target=ROOT/'ops/blog-harness/blogger/2026-09-16'/f'{e["key"]}.html'
    target.parent.mkdir(parents=True,exist_ok=True);write(target,'\n'.join(parts)+'\n')
    e['bloggerProseCharacters']=len(re.sub(r'\s+',' ',blog[e['key']]).strip())
    e['bloggerSha256']=sha(target.read_bytes())
    print('COUNTS',e['key'],e['bodyCharacters'],e['bloggerProseCharacters'],flush=True)

# Keep acquisition history, but do not redistribute third-party PDFs.
r=requests.get('https://api.github.com/repos/JJo-0/JJo-0.github.io/actions/artifacts/10432114700/zip',headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json'},timeout=90)
r.raise_for_status();assert sha(r.content)=='c434a6a4941025354ab746ff90887cf570247ed48e4b797f3190820188d0174d'
z=zipfile.ZipFile(io.BytesIO(r.content))
receipts=json.loads(z.read('source-receipts.json'))
edition={'edition':'2026-09-16','selectionBasis':'User-supplied editorial brief; scores are editorial, not awards. Main article and supplements independently checked only within stated access boundaries.','entries':entries,'sourceReceipts':receipts,'sourceReviewRun':35061367203,'mediaReviewRun':35061529773,'reserve':[{'title':'Micron 512GB DDR5 RDIMM','sourceDate':'2026-09-15','source':'https://investors.micron.com/news/press-release/2026/Micron-Advances-Memory-Innovation-With-the-Worlds-First-Ultra-Dense-Module-for-Next-Generation-Servers/default.aspx','status':'reserve-in-top1-section8','access':'Official search-indexed announcement; direct HTTP fetch returned 403; volume production is a second-half-2027 plan.'}],'researchBoundaries':['Hydrogen SI Figure 6 and Table 3 reverse the small-pilot water production values; preserve discrepancy instead of silently reconciling.','20 kW 100 days and 250 kW 40 days used daily start-stop / four-hour steady load; not uninterrupted 24-hour operation.','14.4% efficiency and 17.7% energy-consumption comparison have different baselines.','Medical primary reliability uses GLM-4.5-Air, not the best Qwen performance; 269/272 correct out of 551 cases.','External VivaBench exists but is not prospective external-hospital clinical validation.','OECT point temporal resolution is not full-map frame rate.','Hydrogen/OECT main text restricted; medical main text open. No independent experiments or complete code rerun.'],'bloggerStatus':'HTML prepared; actual Blogger posting not performed'}
save(SITE/'news-edition-20260916.json',edition)

tax=Path('scripts/normalize_tags_current.py');old=read(tax);marker='if __name__ == "__main__":'
assert old.count(marker)==1
block='POST_TAXONOMY.update(\n    {\n'
for e in entries:
    block+=f'        {e["slug"]+".mdx"!r}: Taxonomy({e["category"]!r}, {e["subcategory"]!r}, "paper-review", ({e["selection"]!r}, {e["subcategory"]!r})),\n'
block+='    }\n)\n\n'
assert all(e['slug'] not in old for e in entries)
write(tax,old.replace(marker,block+marker))

browser=ROOT/'scripts/browser-news-media-audit.mjs';old=read(browser)
needle='const declaredEntries = [...sep11.entries, ...sep15.entries];';assert old.count(needle)==1
old=old.replace(needle,"const sep16 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260916.json', import.meta.url), 'utf8'));\n  const declaredEntries = [...sep11.entries, ...sep15.entries, ...sep16.entries];")
old=old.replace('sep15.entries.find(', '[...sep15.entries, ...sep16.entries].find(')
write(browser,old)
visual=ROOT/'scripts/news-visual-contract.mjs';old=read(visual)
assert 'news-20260916-contract' not in old
write(visual,"import './news-20260916-contract.mjs';\n"+old)

contract=r'''import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const sha = (v) => createHash('sha256').update(v).digest('hex');
const edition = JSON.parse(read('../site/news-edition-20260916.json'));
const media = JSON.parse(read('../site/news-media.json'));
const provenance = JSON.parse(read('../site/assets/assets/posts/news-20260916/provenance.json'));
const expected = [
  ['2026-09-16-seawater-hydrogen-water-news', 'hydrogen', ['sep16-hydrogen-1','sep16-hydrogen-2'], 'frontier-one'],
  ['2026-09-16-onprem-medical-agent-news', 'medical', ['sep16-medical-6','sep16-medical-2'], 'frontier-candidate'],
  ['2026-09-16-oect-swelling-mapping-news', 'oect', ['sep16-oect-2','sep16-oect-1'], 'frontier-candidate'],
];
function count(body) {
  return [...body.split('## 9.')[0].replace(/^import .*;\s*$/gm,'').replace(/<[^>]+>/g,'')
    .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\[\d+(?:,\d+)*\]/g,'')
    .replace(/[*#|`>]+/g,'').replace(/\s+/g,' ').trim()].length;
}
assert.equal(edition.edition,'2026-09-16');
assert.equal(provenance.length,6);
assert.equal(new Set(provenance.map((p)=>p.src)).size,6);
assert.deepEqual(edition.entries.map((e)=>e.slug),expected.map((e)=>e[0]));
for (const [index,[slug,key,ids,selection]] of expected.entries()) {
  const entry=edition.entries[index];
  const post=read(`../site/content/posts/${slug}.mdx`);
  const fm=post.match(/^---\r?\n([\s\S]*?)\r?\n---/);assert(fm);
  for(const line of ['draft: false','lang: ko','pubDate: 2026-09-16','researchFeatured: false',`slug: ${slug}`])
    assert(fm[1].split('\n').includes(line),`${slug}: ${line}`);
  assert(fm[1].includes(`  - ${selection}\n`));
  assert(!fm[1].includes(selection==='frontier-one'?'frontier-candidate':'frontier-one'));
  const body=post.slice(fm[0].length).replace(/^import .*;\s*$/gm,'').trim();
  assert(body.startsWith(`<NewsFigure media="${ids[0]}" priority />`),`${slug}: hero must be first`);
  assert.deepEqual([...body.matchAll(/<NewsFigure\b[^>]*media="([^"]+)"/g)].map((m)=>m[1]),ids);
  assert.deepEqual(entry.mediaIds,ids);
  assert.equal([...body.matchAll(/^## [1-9]\. /gm)].length,9);
  assert.equal(sha(post),entry.postSha256,`${slug}: unreviewed body change`);
  const length=count(body);assert(length>=7000 && length<=10000,`${slug}: ${length} characters`);
  assert.equal(length,entry.bodyCharacters);
  assert(body.includes(entry.source));
  assert.deepEqual(Object.entries(media).filter(([,m])=>m.slug===slug).map(([id])=>id),ids);
  assert.equal(media[ids[0]].order,index+1);
  for(const id of ids){
    const item=media[id],p=provenance.find((x)=>x.id===id);assert(p);
    for(const k of ['src','width','height','source','license','rights','sha256'])assert.equal(item[k],p[k]);
    for(const k of ['alt','caption','credit','kind','changes'])assert(item[k]?.trim());
    assert.equal(item.license,'CC BY 4.0');
    assert.equal(item.rights,'https://creativecommons.org/licenses/by/4.0/');
    assert(item.src.startsWith('/assets/posts/news-20260916/')&&!item.src.includes('..'));
    const bytes=fs.readFileSync(new URL(`../site/assets${item.src}`,import.meta.url));
    assert.equal(sha(bytes),p.sha256);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
    if(key==='medical'){assert.equal(p.role,'reviewed-paper-original');assert(item.kind.includes('이번 논문'));}
    else{assert.equal(p.role,'related-research-background');assert(item.kind.includes(key==='oect'?'2024년':'2026년 7월'));assert(item.caption.includes('아니다'));}
  }
  assert(body.slice(0,550).includes(key==='medical'?'임상시험이 아니다':key==='oect'?'2024년':'2026년 7월'));
  const blogger=read(`../ops/blog-harness/blogger/2026-09-16/${key}.html`);
  assert.equal(sha(blogger),entry.bloggerSha256);
  assert.deepEqual([...blogger.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map((m)=>m[1]),ids.map((id)=>'https://jjo-0.github.io'+media[id].src));
  assert(blogger.includes(entry.source)&&blogger.includes(`https://jjo-0.github.io/posts/${slug}/`));
  assert.doesNotMatch(blogger,/<script\b|<form\b|\son\w+\s*=/i);
  assert(entry.bloggerProseCharacters>=1500&&entry.bloggerProseCharacters<=2500);
}
const hydrogen=read(`../site/content/posts/${expected[0][0]}.mdx`);
for(const s of ['하루 4시간','14.4%','17.7%','반대로','97%','Micron'])assert(hydrogen.includes(s));
const medical=read(`../site/content/posts/${expected[1][0]}.mdx`);
for(const s of ['GLM-4.5-Air','VivaBench','269','272','551','230','49개','0.90','0.85'])assert(medical.includes(s));
const oect=read(`../site/content/posts/${expected[2][0]}.mdx`);
for(const s of ['순차','0.1ms','140만','PBS','특허','구독 제한'])assert(oect.includes(s));
assert.equal(edition.reserve[0].status,'reserve-in-top1-section8');
console.log('news-20260916-contract: PASS 3 published image-first 7,000–10,000-character explainers, 6 licensed images with truthful roles, 3 independent Blogger payloads and explicit evidence boundaries');
'''
write(ROOT/'scripts/news-20260916-contract.mjs',contract)

notices=Path('THIRD_PARTY_NOTICES.md');old=read(notices)
assert '## September 16, 2026 NEWS figures' not in old
extra='\n\n## September 16, 2026 NEWS figures\n\nSix complete figures are locally hosted under `spaceship-ui/site/assets/assets/posts/news-20260916/`. All are CC BY 4.0. Proportional resizing and WebP conversion only; source/output SHA256 and exact original image URLs are in `provenance.json`.\n\n'
for e in entries:
    for mid in e['mediaIds']:
        m=media[mid];p=byid[mid]
        extra+=f'- `{m["src"]}`: {m["credit"]}, {p["figureUrl"]}. Role: {p["role"]}. {m["kind"]}. License: https://creativecommons.org/licenses/by/4.0/.\n'
extra+='\nThe July hydrogen and 2024 OECT figures are background from different papers, not the September 2026 target experiments. The two medical figures are from the reviewed September 15 paper. Its third-party Flaticon Figure 1 is excluded. Restricted current hydrogen/OECT figures and complete PDFs are not republished; readers are directed to the publishers. No repository MIT license overrides third-party rights.\n'
write(notices,old+extra)
write(ROOT/'ops/blog-harness/blogger/2026-09-16/README.md','''# Blogger September 16 handoff

Three independent Korean introductions, 1,500–2,500 prose characters, two credited images each. Canonical full explainers are the corresponding GitHub Pages posts. HTML is prepared, not published to Blogger. Image URLs become usable only after Pages deployment.

Use the existing local OAuth-aware Blogger harness to list existing posts and prevent duplicates before publishing. Do not upload credentials. Validate each HTML with `python scripts/blogger_harness.py validate <path>`. Titles are in each file's comment. The user's current publication request authorizes the GitHub release; actual Blogger account access and publication receipt must be recorded separately.
''')
write(ROOT/'docs/operations/NEWS_20260916_RESUME.md','''# September 16 NEWS resume ledger

Tracking #120. Branch `content/news-20260916-hydrogen-candidates`. Initial main `6670086efbb7b44af61b6fb3bfb498497fbd8035`.

Three full explainers and six licensed figures are real repository files. Editorial source: user-supplied September 16 brief. Source review run 35061367203; licensed-media run 35061529773. The edition manifest records source access receipts, body/image hashes, counts and unresolved research discrepancies; production never fetches an expiring artifact.

Review boundaries: hydrogen daily four-hour steady-load tests; different comparison baselines; SI Figure 6/Table 3 water-value discrepancy unresolved. Medical main text is open; primary reliability uses GLM-4.5-Air; external VivaBench exists; simulated encounters are not prospective clinical care. OECT point timing is not full-map video rate; PBS is not an implant study. Current hydrogen/OECT main texts are restricted. Independently rerunning experiments or all code was not done.

Next: check newest PR CI and source review comments; fix narrow evidenced defects without weakening gates; recheck current main; merge only reviewed passing head; verify Pages deployment and six live images at 390/1440px. Record final SHA/run/results in #120. Earlier English PR #113 remains separate. Blogger HTML is ready but actual Blogger publication remains pending, so do not automatically close #120 as fully complete.
''')

# Fail before committing if an article or payload does not meet its publication contract.
for e in entries:
    assert 7000<=e['bodyCharacters']<=10000,(e['key'],e['bodyCharacters'])
    assert 1500<=e['bloggerProseCharacters']<=2500,(e['key'],e['bloggerProseCharacters'])
for script in ['news-20260916-contract.mjs','taxonomy-contract.mjs','post-content-contract.mjs','seo-check.mjs']:
    subprocess.run(['node','scripts/'+script],cwd=ROOT,check=True)
subprocess.run(['python3','scripts/normalize_tags_current.py','--check'],check=True)
for e in entries:
    subprocess.run(['python3','scripts/blogger_harness.py','validate',str(ROOT/'ops/blog-harness/blogger/2026-09-16'/f'{e["key"]}.html')],check=True)

subprocess.run(['git','add','--','THIRD_PARTY_NOTICES.md','scripts/normalize_tags_current.py',str(media_path),str(SITE/'news-edition-20260916.json'),str(browser),str(visual),str(ROOT/'scripts/news-20260916-contract.mjs'),str(ROOT/'ops/blog-harness/blogger/2026-09-16'),str(ROOT/'docs/operations/NEWS_20260916_RESUME.md')],check=True)
subprocess.run(['git','rm','--','.github/news_sep16_finalize.py','.github/workflows/news-20260916-finalize.yml','.github/workflows/news-20260916-source-review.yml','.github/workflows/news-20260916-media.yml'],check=True)
subprocess.run(['git','-c','user.name=JJo Editorial','-c','user.email=76779256+JJo-0@users.noreply.github.com','commit','-m','content: register September 16 edition, licensed covers, Blogger payloads and regression checks (#120)'],check=True)
subprocess.run(['git','push','origin','HEAD:content/news-20260916-hydrogen-candidates'],check=True)
print('FINALIZED HEAD',subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip())

"""One-time, branch-only completion of the reviewed September 17 NEWS edition.
Run from the repository root. Never merges, publishes Blogger, or edits old prose.
"""
from pathlib import Path
from collections import Counter
from hashlib import sha256
import html
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
UI = ROOT / 'spaceship-ui'
POSTS = UI / 'site/content/posts'
EDITION = UI / 'site/news-edition-20260917.json'
ENTRIES = [
 ('rubin', '2026-09-17-vera-rubin-mlperf-news', 'rubin-rack-background', 'ai-machine-learning', 'ai-compute-hardware', 'frontier-one', 'ai-infrastructure', 95),
 ('ebv', '2026-09-17-ms-ebv-prerelapse-news', 'ms-ebv-micrograph', 'health-lifestyle', 'neuroimmunology', 'frontier-candidate', 'neuroimmunology', 94),
 ('hemophilia', '2026-09-17-adolescent-hemophilia-b-news', 'hemophilia-aav-micrograph', 'health-lifestyle', 'gene-therapy', 'frontier-candidate', 'gene-therapy', 92),
]
MEDIA_TEXT = {
 'rubin': ('2018년 배경 사진 · Rubin 장비 아님', '2018년 ORNL Summit 슈퍼컴퓨터의 서버 랙 사진으로, 이번 Vera Rubin 시험 장비가 아닌 배경자료', '랙이라는 물리적 시스템 단위를 보여 주는 2018년 Summit 사진이다. Vera Rubin의 실물 사진이나 이번 MLPerf 측정 장비가 아니다. 이번 제품 모습과 회사 원본 도표는 본문의 NVIDIA 공식 발표 링크에서 확인한다.'),
 'ebv': ('NIAID 원본 현미경 배경 사진 · 이번 검체 아님', '세 개의 Epstein-Barr 바이러스 입자를 보여 주는 NIAID 전자현미경 배경 사진', 'EBV 입자의 모습을 이해하기 위한 NIAID 공개 사진이다. 이번 135명 코호트의 혈액 검체나 gp350 측정 결과가 아니다. 사진의 원저작자는 NIAID이고 공개 페이지가 Public Domain을 명시한다.'),
 'hemophilia': ('2019년 원본 현미경 배경 사진 · 임상 제품 아님', '큰 아데노바이러스 입자 주변에 작은 AAV 입자가 모인 2019년 전자현미경 사진', '작은 AAV 입자와 큰 아데노바이러스 입자를 구분해 볼 수 있는 Graham Beards의 배경 사진이다. BBM-H901 치료제나 이번 청소년 참가자의 검체를 촬영한 사진이 아니다.'),
}
SUMMARIES = {
 'rubin': [
  'AI가 답을 만드는 속도를 비교할 때 GPU 한 개의 최고 계산량만 보면 중요한 부분을 놓칠 수 있습니다. 긴 질문을 먼저 읽는 작업, 답을 한 조각씩 써 내려가는 작업, 여러 GPU 사이에서 정보를 옮기는 작업이 모두 함께 돌아가기 때문입니다. 2026년 9월 16일 나온 MLPerf Inference v6.1은 NVIDIA의 Vera Rubin NVL72를 이런 전체 시스템 관점에서 살펴볼 새 자료를 제공합니다.',
  'NVIDIA는 기존 GB300 NVL72에 비해 Qwen3-VL에서 최대 3.7배, DeepSeek-R1에서 최대 2.5배의 처리량을 발표했습니다. 여기서 최대라는 단어를 빼면 안 됩니다. 같은 수의 가속기를 사용한 공식 표를 시나리오별로 대조하면 개선 폭은 서로 다릅니다. 많은 작업을 한꺼번에 처리하는 시험과 사용자가 기다리는 응답 조건을 지켜야 하는 시험은 같은 시험이 아닙니다.',
  '처리량은 식당이 한 시간에 내놓는 음식 수, 지연시간은 내가 주문하고 기다린 시간에 비유할 수 있습니다. 손님을 많이 받는 식당이라고 내 음식까지 항상 빨리 나오는 것은 아닙니다. AI도 마찬가지여서, 야간에 문서를 대량 분석하는 서비스와 화면 앞에서 대화하는 서비스는 서로 다른 성능을 중요하게 봅니다.',
  '회사는 숫자를 저장하는 부담을 줄이는 NVFP4, 질문을 읽는 프리필과 답을 쓰는 디코드를 분리하는 서빙, GPU를 연결하는 NVLink를 함께 강조합니다. 이를 공동 설계라고 부릅니다. 다만 각각의 기술이 성능 향상의 몇 퍼센트를 만들었는지 따로 측정한 결과를 확인한 것은 아닙니다. 한 기능만 켜면 누구나 같은 배수를 얻는다는 뜻도 아닙니다.',
  '원자료의 단위도 주의해야 합니다. 이번 Qwen3-VL 표에는 초당 요청이나 샘플 수가, DeepSeek-R1에는 초당 토큰 수가 사용됩니다. 토큰은 모델이 문장을 처리하는 조각으로 단어나 글자와 항상 일치하지 않습니다. 서로 다른 단위의 큰 숫자를 나란히 놓고 어느 모델이 더 빠르다고 판단할 수는 없습니다.',
  '중요한 제한은 해당 Rubin 제출 구성이 Preview라는 점입니다. 구매나 클라우드 이용 가능성을 뜻하는 Available과 구분됩니다. 그렇다고 플랫폼 전체가 아직 생산되지 않았다는 뜻으로 확대해도 안 됩니다. NVIDIA의 별도 생산 발표와 MLPerf가 분류한 특정 하드웨어·소프트웨어 구성은 서로 다른 사실입니다.',
  '또한 표준 벤치마크의 기업 제출 결과는 학술지 논문이나 제3자의 독립 재실험과 다릅니다. 공개 규칙과 자료가 비교의 바탕을 강화해 주지만, 실제 고객 환경의 비용과 가동률까지 보증하지는 않습니다. 확인한 비교 행에는 실제 소비 전력 측정이 없으므로 장비의 설계 전력만으로 토큰당 전기요금을 계산하지 않았습니다.',
  '결국 더 빠른 장비가 반드시 같은 비율로 더 저렴한 것은 아닙니다. 장비 가격, 냉각, 네트워크, 실제 이용률이 함께 필요합니다. 예를 들어 처리량이 두 배가 되어도 시간당 비용 역시 두 배라면 단위 작업당 비용은 그대로일 수 있습니다. 이는 원리를 설명하는 예시이지 Rubin의 실제 가격을 추정한 계산이 아닙니다.',
  '본문의 대표 사진은 랙을 설명하는 2018년 Summit 배경 사진입니다. Rubin 실물로 오인하지 않도록 표시했고, 이번 제품의 원본 자료에는 별도 링크를 연결했습니다. 시나리오별 수치, 회사 발표와 공식 표의 차이, 아직 남은 전력·비용 질문은 GitHub 전체 해설에서 확인하세요.'
 ],
 'ebv': [
  '다발성경화증은 뇌와 척수에 관련된 면역 질환입니다. 재발이 일어난 뒤 혈액을 검사하면 변화는 찾을 수 있지만, 그 변화가 원인인지 결과인지 구별하기 어렵습니다. 9월 16일 Nature Medicine에 나온 연구는 재발 전에 저장해 둔 혈액에서 어떤 면역 신호가 보이는지 살폈습니다. 치료제를 투여한 연구는 아닙니다.',
  '연구진은 총 135명에게서 얻은 PBMC 검체 240개를 분석했습니다. PBMC는 혈액에 들어 있는 일부 면역세포 집단을 말하며 혈액 전체나 뇌 조직은 아닙니다. 사람이 135명인데 검체가 240개인 것은 한 사람에게 여러 시점의 검체가 있을 수 있기 때문입니다. 검체 수를 곧 독립 환자 수처럼 읽으면 연구 규모를 과장하게 됩니다.',
  '관심 대상은 Epstein-Barr virus, 줄여서 EBV와 관련된 면역세포 변화입니다. 바이러스는 세포 안에 잠복할 수 있고 활동 상태가 바뀔 수 있습니다. 연구에서는 B세포와 단핵구의 유전자 사용 양상, 특정 바이러스 RNA, 바이러스 단백질 표지를 서로 다른 검사로 비교했습니다.',
  'RNA 분석은 유전자를 고치는 기술이 아닙니다. 세포가 어떤 유전 정보를 얼마나 사용하고 있는지 살펴보는 방법입니다. 단일세포 검사는 여러 종류의 세포를 나눠 볼 수 있고, 별도의 표적 검사와 유세포 분석은 RNA나 단백질 표지를 다른 방식으로 확인합니다. 여러 검사에서 자료를 얻었다는 장점은 있지만, 같은 환자의 검체를 공유하므로 전부 독립 연구처럼 세지는 않습니다.',
  '논문은 임상 재발 최대 3개월 전 시간 창에서 EBV 관련 신호가 나타났다고 보고합니다. 이 말은 검사를 한 번 받으면 석 달 뒤 재발 날짜를 알 수 있다는 뜻이 아닙니다. 연구진은 재발 시점을 알고 나서 보관 검체를 골라 비교했습니다. 앞으로 새 환자의 재발을 맞히는 검사가 되려면 경보 기준을 먼저 정하고 다른 환자군에서 확인해야 합니다.',
  '원인도 아직 확정되지 않았습니다. 눈에 띄는 증상이 나타나기 전에 이미 다른 생물학적 변화가 시작됐을 수 있습니다. 그 변화가 면역세포와 바이러스 신호를 함께 바꿨을 가능성도 있습니다. EBV가 출발점인지, 반응을 키우는 요소인지, 함께 나타나는 현상인지는 관찰만으로 모두 구별하기 어렵습니다.',
  '측정상의 한계도 작지 않습니다. 바이러스 표지를 보이는 B세포는 매우 드문 집단이고, 논문은 비특이적 결합을 더 확실히 배제할 대조 검사가 부족했다고 밝힙니다. 일부 바이러스 RNA와 단백질 결과도 단순하게 같은 방향으로 움직이지 않습니다. 흥미로운 신호만 골라 소개하지 않고 이런 반대 근거를 함께 읽어야 합니다.',
  '이 연구가 열어 주는 것은 즉시 사용할 치료법보다 다음 질문입니다. 다른 병원에서도 같은 신호가 나오는지, 기존 검사보다 재발 판단을 실제로 개선하는지, 바이러스 관련 경로에 개입했을 때 재발도 달라지는지를 확인해야 합니다. 평균적으로 차이가 있는 표지와 한 사람에게 유용한 검사는 다른 단계입니다.',
  '사진은 이번 참가자의 혈액이 아니라 NIAID의 EBV 전자현미경 배경 자료입니다. 세포·검체·RNA·바이러스 표지가 각각 무엇인지, 왜 먼저 보였다는 사실만으로 원인을 증명할 수 없는지는 GitHub 전체 해설에서 차근차근 읽어 보세요.'
 ],
 'hemophilia': [
  '피가 멎으려면 여러 응고인자가 차례로 작동해야 합니다. 혈우병 B는 그중 제9응고인자와 관련된 질환입니다. 필요한 기능을 외부에서 보충하는 대신 몸의 세포가 응고인자를 만들 정보를 전달할 수 있을까요? 9월 16일 공개된 연구는 AAV 유전자 치료 BBM-H901을 청소년 11명에게 투여해 이 질문을 살폈습니다.',
  '먼저 연구 단계를 분명하게 읽어야 합니다. 중국 여러 기관에서 시행한 대조군 없는 1상이며, 주요 보고 기간은 52주입니다. 성인 자료를 단순히 청소년에게 적용한 것이 아니라 실제 청소년에게 투여했다는 의미가 있습니다. 그러나 허가를 마쳤거나 평생 효과가 보장된 치료라는 뜻은 아닙니다.',
  'AAV는 유전 정보를 전달하는 운반체로 쓰이는 바이러스입니다. 이 연구는 제9응고인자 Padua의 정보를 전달하는 방식이며, 환자의 원래 유전자를 가위로 잘라 교정했다고 보고한 연구가 아닙니다. 정보를 새로 제공하는 기술과 원래 서열을 정확한 위치에서 수정하는 기술을 구분해야 합니다.',
  '52주에 평균 응고인자 활성도 FIX:C는 41.8 IU/dL이었고 표준편차는 30.1이었습니다. 활성도는 단백질의 무게가 아니라 검사 조건에서 나타나는 기능을 뜻합니다. 평균이 41.8이라는 말만으로 모든 참가자가 같은 결과를 얻었다고 읽을 수는 없습니다. 표준편차 역시 전원의 최저·최고값을 뜻하지 않습니다.',
  '평균 연간출혈률은 13.9에서 0.5로 줄었습니다. 눈에 띄는 변화지만, 이 두 평균으로 계산한 감소율이 환자의 완치율은 아닙니다. 한 사람이 여러 번 출혈할 수도 있고, 집단 평균이 낮아져도 모든 사람에게서 모든 출혈이 사라졌다는 뜻은 아닙니다. 수치의 분모가 사람 수인지 출혈 사건 수인지부터 보아야 합니다.',
  '연구의 일차 목적은 안전성이었습니다. 용량을 제한할 독성은 관찰되지 않았지만 다른 이상사건이 전혀 없었던 것은 아닙니다. 초록에는 중대한 이상사건 1건과 3등급 이상사건 2건이 함께 보고돼 있습니다. 보충표는 유일한 중대한 사건을 약물과 무관하다고 분류합니다. 이 사건을 간 검사 이상과 같은 사건이라고 묶지 않았습니다.',
  '한 참가자는 간 관련 효소가 상승했고 면역억제 치료 뒤 정상화됐습니다. 또 연구 과정에는 코르티코스테로이드 사용과 추가 면역억제 관리가 포함됐습니다. 따라서 한 번 주사하면 이후 다른 약이나 추적 관리가 필요 없다는 소개는 맞지 않습니다. 유전자 전달의 효과와 그 과정을 관리하는 부담을 함께 평가해야 합니다.',
  '가장 큰 제한은 표본 수와 비교 방식입니다. 11명에서는 드문 위험을 발견하기 어렵고, 동시 대조군이 없으므로 전후 변화의 모든 부분을 치료 효과로 분리하기 어렵습니다. 특히 청소년은 성장과 이후의 긴 삶을 고려해야 합니다. 1년 결과에서 기대를 얻을 수는 있지만 수십 년의 지속성을 계산할 수는 없습니다.',
  '연구 약물을 제공한 기업이 설계에 관여했고 일부 저자가 회사 직원이라는 점도 공개돼 있습니다. 이를 이유로 결과를 무시할 필요는 없지만, 후속 독립 검증과 더 큰 임상을 확인할 이유는 됩니다. 사진 역시 이번 제품이 아닌 2019년 AAV 배경 현미경 사진으로 표시했습니다. 쉬운 용어 설명, 정확한 안전성 분류, 다음 임상에서 확인할 질문은 GitHub 전체 해설로 이어집니다.'
 ],
}

def sha(v):
 return sha256(v if isinstance(v,bytes) else v.encode()).hexdigest()

def prose(text):
 text=re.sub(r'^---\n[\s\S]*?\n---\s*','',text).split('## 9.')[0]
 text=re.sub(r'^import .*;\s*$','',text,flags=re.M)
 text=re.sub(r'<Math\b[\s\S]*?/>','',text)
 text=re.sub(r'<[^>]+>','',text)
 text=re.sub(r'\[([^\]]+)\]\([^)]*\)',r'\1',text)
 text=re.sub(r'\[\d+(?:,\d+)*\]','',text)
 return re.sub(r'\s+',' ',re.sub(r'[*#|`>]+','',text)).strip()

def replace_once(path,old,new):
 text=path.read_text();assert text.count(old)==1,(str(path),old[:90]);path.write_text(text.replace(old,new))

def main():
 assert not EDITION.exists(),'Already finalized; do not regenerate seals over later edits'
 branch=subprocess.check_output(['git','branch','--show-current'],cwd=ROOT,text=True).strip()
 assert branch=='content/news-20260917-rubin-bio',branch
 catalogue_path=UI/'site/news-media.json';catalogue=json.loads(catalogue_path.read_text())
 originals=json.loads((UI/'site/assets/assets/posts/news-20260917/provenance.json').read_text())
 assert len(originals)==3
 entries=[]
 for index,(key,slug,mid,category,subcategory,selection,tag,score) in enumerate(ENTRIES,1):
  path=POSTS/(slug+'.mdx');text=path.read_text()
  assert '<NewsFigure media="'+mid+'" priority />' in text
  text=text.replace('( /posts/','(/posts/')
  # Explicit native anchors avoid adjacent Markdown reference ambiguities.
  def cite(m):
   n=m[1];return f'<a href="#news-ref-{n}" data-news-citation="{n}" aria-label="참고문헌 {n}로 이동" data-astro-reload>[{n}]</a>'
  text=re.sub(r'\[(\d+)\]\(#news-ref-\1\)',cite,text)
  # Avoid delimiter ambiguity beside Korean text; preserve the displayed prose.
  text=re.sub(r'\*\*([^\n]+?)\*\*',r'<strong>\1</strong>',text)
  path.write_text(text)
  refs=[{'number':int(n),'url':html.unescape(url),'baselineLabel':'['+n+']'} for n,url in re.findall(r'<a id="news-ref-(\d+)" href="([^"]+)"',text)]
  counts=dict(sorted(Counter(re.findall(r'data-news-citation="(\d+)"',text)).items(),key=lambda x:int(x[0])))
  assert refs and counts and set(counts)<={str(r['number']) for r in refs}
  assert len(prose(text))>=7000,(slug,len(prose(text)))
  p=next(p for p in originals if p['id']==mid)
  assert sha((UI/'site/assets'/p['src'].lstrip('/')).read_bytes())==p['sha256']
  kind,alt,caption=MEDIA_TEXT[key]
  assert mid not in catalogue
  item={k:p[k] for k in ['src','width','height','source','license','rights','sha256','credit']}
  item.update(slug=slug,kind=kind,alt=alt,caption=caption,order=index,changes='내용을 자르지 않고 비율을 유지해 축소하고 WebP로 변환했다. 원저작권과 출처를 유지한다.')
  catalogue[mid]=item
  title=re.search(r'^title: "([^"]+)"',text,re.M)[1]
  folder=UI/'ops/blog-harness/blogger/2026-09-17';folder.mkdir(parents=True,exist_ok=True)
  intro='<h2>'+html.escape(title)+'</h2>\n<figure><img src="https://jjo-0.github.io'+item['src']+'" alt="'+html.escape(alt,quote=True)+'" width="'+str(item['width'])+'" height="'+str(item['height'])+'" /><figcaption>'+html.escape(kind+' — '+caption)+' '+html.escape(item['credit'])+' · <a href="'+html.escape(item['source'],quote=True)+'">사진 출처</a> · <a href="'+item['rights']+'">'+item['license']+'</a></figcaption></figure>\n'
  stage='기업 제출 표준 벤치마크 결과이며 학술지 논문이나 독립 재실험이 아닙니다.' if key=='rubin' else '사람 혈액 관찰연구이며 치료 임상이나 검증된 재발 예측 검사가 아닙니다.' if key=='ebv' else '사람 대상 단일군 1상 11명·주요 추적 52주이며 허가나 완치를 입증한 연구가 아닙니다.'
  payload=intro+'<p><strong>'+stage+'</strong></p>\n'+'\n'.join('<p>'+html.escape(p)+'</p>' for p in SUMMARIES[key])
  payload+='\n<p><a href="'+refs[0]['url']+'">공식 1차 출처</a></p>\n<p><a href="https://jjo-0.github.io/posts/'+slug+'/">GitHub 전체 해설 읽기</a></p>\n'
  (folder/(key+'.html')).write_text(payload)
  entry={'key':key,'slug':slug,'title':title,'category':category,'subcategory':subcategory,'selection':selection,'score':score,'source':refs[0]['url'],'mediaIds':[mid],'bodyCharacters':len(prose(text)),'postSha256':sha(text),'bloggerProseCharacters':len(' '.join(SUMMARIES[key])),'bloggerSha256':sha(payload),'state':'linked','citationCounts':counts,'references':refs}
  entries.append(entry);print('READY',slug,entry['bodyCharacters'],'characters',sum(counts.values()),'citation links')
 catalogue_path.write_text(json.dumps(catalogue,ensure_ascii=False,indent=2)+'\n')
 edition={'edition':'2026-09-17','sourceDate':'2026-09-16','selectionBasis':'All three candidates requested by the user. Scores 95/94/92 are the supplied editorial rankings, not official awards or re-scored scientific certainty. Public-source checks and qualifications are explicit in each article.','entries':entries,'bloggerStatus':'HTML prepared; no account publication performed','evidence':{'primarySourceRun':35170392769,'primarySourceArtifactSha256':'934be5d9ef6e9a5e6e374325f63bfd114cbece203287da3f16e237796b6b6eaf','photoSourceRun':35171501627,'scope':'Archived official HTML and publicly accessible supplements; no full subscription-text or independent experimental reproduction claim. Entire PDFs are not redistributed.'}}
 EDITION.write_text(json.dumps(edition,ensure_ascii=False,indent=2)+'\n')
 # Register taxonomies without modifying any old entry or normalizing old prose.
 norm=ROOT/'scripts/normalize_tags_current.py'
 block='\nPOST_TAXONOMY.update({\n'+''.join(f'    {slug+".mdx"!r}: Taxonomy({cat!r}, {sub!r}, {"research-report" if key=="rubin" else "paper-review"!r}, ({sel!r}, {tag!r})),\n' for key,slug,mid,cat,sub,sel,tag,score in ENTRIES)+'})\n\n'
 replace_once(norm,'if __name__ == "__main__":',block+'if __name__ == "__main__":')
 # New content gets the same source/card/decoded-image checks as prior editions.
 media_audit=UI/'scripts/browser-news-media-audit.mjs'
 replace_once(media_audit,'  const declaredEntries = [...sep11.entries, ...sep15.entries, ...sep16.entries];',"  const sep17 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260917.json', import.meta.url), 'utf8'));\n  const declaredEntries = [...sep11.entries, ...sep15.entries, ...sep16.entries, ...sep17.entries];")
 replace_once(media_audit,'const todayEntry = [...sep15.entries, ...sep16.entries].find','const todayEntry = [...sep15.entries, ...sep16.entries, ...sep17.entries].find')
 # Extend runtime link tests to all three new articles, including per-source counts.
 browser=UI/'scripts/browser-news-citation-audit.mjs'
 replace_once(browser,'const results = [];',"const results = [];\nconst currentEdition = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260917.json', import.meta.url), 'utf8'));\nconst citationRows = [...ledger.repairs, ...currentEdition.entries];")
 replace_once(browser,'for (const row of ledger.repairs)', 'for (const row of citationRows)')
 replace_once(browser,"ledger.repairs.filter(r=>r.state==='linked').length", "citationRows.filter(r=>r.state==='linked').length")
 # Validate new citations against independently persisted editorial source identities.
 gate=UI/'scripts/news-citation-contract.py'
 replace_once(gate,"    rows = []\n    for slug in slugs:","    additions = json.loads((UI / 'site/news-edition-20260917.json').read_text())['entries']\n    additions = {r['slug']: r for r in additions}\n    assert set(additions) <= set(slugs), 'new candidate missing from NEWS roster'\n    rows = []\n    for slug in slugs:")
 replace_once(gate,"result = audit_html((dist / 'posts' / slug / 'index.html').read_text(), expected)","result = audit_html((dist / 'posts' / slug / 'index.html').read_text(), expected or additions.get(slug))")
 visual=UI/'scripts/news-visual-contract.mjs'
 visual.write_text("import './news-20260917-contract.mjs';\n"+visual.read_text())
 notices=ROOT/'THIRD_PARTY_NOTICES.md'
 notices.write_text(notices.read_text()+'\n\n## September 17, 2026 NEWS background photographs\n\n'+''.join('- '+p['id']+': '+p['credit']+'; '+p['license']+'; '+p['source']+'; '+p['rights']+'. '+p['role']+'. Proportional resize and WebP conversion only.\n' for p in originals))
 readme=UI/'ops/blog-harness/blogger/2026-09-17/README.md'
 readme.write_text('# September 17 Blogger drafts\n\nThree independent Korean HTML summaries with credited local photographs and full GitHub explanations. Prepared only; actual account publication has not been performed. Do not mark #126 fully closed on HTML preparation alone.\n')
 resume=UI/'docs/operations/NEWS_20260917_RESUME.md'
 resume.write_text('# September 17 NEWS completion checkpoint\n\nTracking: #126; citation repairs: #123 / PR #124 and #125.\n\nAll three requested articles are now source files, with native citation links and registered licensed background photographs. Scores 95/94/92 retain the supplied editorial brief. The minimum prose policy is 7,000 characters, with no maximum; HTML and Math component source are excluded. Counts/hashes live in site/news-edition-20260917.json and are checked, not regenerated, during builds.\n\nNative #references previously resolved to the home page because of the root base URL. Layout preserves the article path now. Original science/image/Blogger files from the citation repair scope remain sealed. The new edition is explicitly separate and tested alongside the whole NEWS roster.\n\nThe three photos are historical/background originals, not 2026 trial specimens or Rubin hardware. Rights, actual subjects and conversion steps are preserved. Whole third-party PDFs are not redistributed. Medical claims remain observational or phase-1; Preview is a submission status, not a platform-wide production claim.\n\nNEXT: run full current-head CI and native reference browser suite; review failures, then merge only green reviewed code and verify Pages live output. Until deployment succeeds, do not claim these articles are publicly available. Blogger remains HTML-prepared, not account-published. Keep #113 and unrelated issues separate.\n')
 # Keep old figures, old prose and prior Blogger payloads out of this script's edit scope.
 subprocess.run(['python3',str(norm),'--check'],cwd=ROOT,check=True)
 print('All three edition source files and native links registered; CI and deployment remain separate gates.')

if __name__=='__main__': main()

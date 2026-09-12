"""One-time reviewed patch; writes only explicit blog-owned source/media paths."""
from __future__ import annotations
import hashlib, io, json, re, urllib.request
from pathlib import Path
from PIL import Image
import fitz
ROOT=Path('.').resolve(); SITE=ROOT/'spaceship-ui'
CACHE=Path('/tmp/jjo-frontier-source-media'); CACHE.mkdir(parents=True,exist_ok=True)
OUT=SITE/'site/assets/assets/posts/frontier-source-20260912'; OUT.mkdir(parents=True,exist_ok=True)
SOURCES={
'sulfur-fig1.png':('https://media.springernature.com/full/springer-static/image/art%3A10.1038%2Fs41560-026-02120-8/MediaObjects/41560_2026_2120_Fig1_HTML.png','ed7bf3169127607bbcf59352ae8fd515dc13abb78ee7443a48027b28ac156949'),
'sulfur-crystal.jpg':('https://upload.wikimedia.org/wikipedia/commons/5/56/Large_Sulfur_Crystal.jpg','ee3d4c2bfbd49d4ab55dff738dbb4eb9608c6295962c623faca4851a36157308'),
'embryo-blastocyst.png':('https://www.uochb.cz/upload/files/a9/1b/a91b32d51decfe9e30ac56f4a9a633dab62a306b.png','0a238594a3b8c96ca95e8437c51794e9de916abe39bd1dff4206412cbb126540'),
'embryo-repair.png':('https://www.uochb.cz/upload/files/12/5a/125a4e29fc53fec6415012680c703c7604288a43.png','1ab0f9435190cba18dfb4a4bb83ba4e7d1c1a7de11a4bb0725c40e78b9b097a1'),
'high-na-lab.jpg':('https://drupal.imec-int.com/sites/default/files/2024-06/Figure%201%20-%20High-NA%20-%20first%20wafer%20exposures.jpg','bb9024b218cc547af21be44274d927a5731521ae7447eb38a6d1282541f3bd6b'),
'solid-reference.pdf':('https://www.nature.com/articles/s41467-026-77590-1_reference.pdf','549dc71ad3b9c581fa623da3b7b5d9cfb3d1e96811afcf371559697aad6f4597')}
def digest(data):return hashlib.sha256(data).hexdigest()
def acquire(name):
 url,sha=SOURCES[name]; f=CACHE/name
 if not f.exists():
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; JJoResearchSourceAudit/1.0)'})
  with urllib.request.urlopen(req,timeout=60) as r:
   if r.status!=200:raise ValueError(f'{name}: status {r.status}')
   data=r.read(25000001)
  if len(data)>25000000:raise ValueError('source size limit')
  f.write_bytes(data)
 data=f.read_bytes()
 if digest(data)!=sha:raise ValueError(f'{name}: reviewed source SHA256 changed')
 return data
for name in SOURCES:acquire(name)
for name in ['sulfur-fig1.png','embryo-repair.png','high-na-lab.jpg']:(OUT/name).write_bytes(acquire(name))
for src,target in [('embryo-blastocyst.png','embryo-blastocyst.webp'),('sulfur-crystal.jpg','sulfur-crystal.webp')]:
 im=Image.open(io.BytesIO(acquire(src))); assert im.mode=='RGB'; im.save(OUT/target,lossless=True,method=6)
 assert Image.open(OUT/target).convert('RGB').tobytes()==im.tobytes()
doc=fitz.open(stream=acquire('solid-reference.pdf'),filetype='pdf'); assert len(doc)==12
for num,page,box in [(2,4,(38,23,562,450)),(5,7,(38,23,562,623))]:
 assert f'Fig. {num}' in doc[page].get_text()
 pix=doc[page].get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(*box),alpha=False)
 Image.open(io.BytesIO(pix.tobytes('png'))).save(OUT/f'solid-fig{num}.webp',lossless=True,method=6)
LITH='2026-09-12-lithium-disulfur-dichloride-frontier-one'; BIO='2026-09-11-embryo-base-editing-news'; HIGH='2026-09-11-high-na-large-mask-news'; SOLID='2026-09-11-sulfide-electrolyte-film-news'
PAPER='https://www.nature.com/articles/s41560-026-02120-8'; MEMBRANE='https://www.nature.com/articles/s41467-026-77590-1'; BIOPAGE='https://www.uochb.cz/en/news/821/a-study-in-nature-sheds-new-light-on-dna-repair-in-early-human-embryos-with-implications-for-future-gene-correction'; CCND='https://creativecommons.org/licenses/by-nc-nd/4.0/'
def media(slug,file,alt,kind,caption,credit,source,license,rights,changes,role):
 im=Image.open(OUT/file)
 return dict(slug=slug,order=1,src=f'/assets/posts/frontier-source-20260912/{file}',width=im.width,height=im.height,alt=alt,kind=kind,caption=caption,credit=credit,source=source,license=license,rights=rights,changes=changes,role=role,checkedAt='2026-09-12',sha256=digest((OUT/file).read_bytes()))
p=SITE/'site/news-media.json'; old=json.loads(p.read_text()); assert old['sulfur-crystal']['slug']==LITH
m={}
for key,item in old.items():
 if key=='sulfur-crystal':
  m['sulfur-source-fig1']=media(LITH,'sulfur-fig1.png','원 논문 Figure 1 전체: 이론적 에너지 탐색, 황 화합물 비교, Li₂S에서 S₂Cl₂까지의 반응 개념','원 논문 Figure 1 · 이론 비교와 반응 개념','a·b는 이론적 비에너지·용량·전압을 비교한 설계 탐색이다. c는 황의 산화수 −2→0→+1 경로다. 색과 별은 완성 배터리의 실측 성능이나 제품 인증을 뜻하지 않는다. 패널 전체를 원형대로 인용하고 본문에서 해석한다.','Nan Zhang 외 · Nature Energy · 2026 · Figure 1',PAPER+'/figures/1','원저작권 유지 · 도표 해설을 위한 제한적 인용',PAPER+'#rightslink','출판사 PNG 원본 그대로 · 자유 이용 라이선스를 부여하지 않음','source-diagram')
  m[key]=media(LITH,'sulfur-crystal.webp','Eric Hunt가 촬영한 노란색 황 결정의 실제 사진으로 이번 논문의 연구 시료는 아니다','실제 황 결정 배경 사진 · 연구 시료 아님','2006년 촬영된 황 결정이다. 이번 논문의 S₂Cl₂, 전극 또는 배터리 시제품 사진이 아니다. 재료 이름을 처음 접하는 독자를 위한 배경 자료다.','Eric Hunt · 2006-10-21','https://commons.wikimedia.org/wiki/File:Large_Sulfur_Crystal.jpg','CC BY-SA 2.5','https://creativecommons.org/licenses/by-sa/2.5/','JPEG에서 WebP로 무손실 전환 · 디코딩 픽셀 동일 · 크롭·합성 없음','background-photo')
 else:m[key]=item
m['embryo-study-photo']=media(BIO,'embryo-blastocyst.webp','IOCB가 해당 연구 설명에 공개한 인간 배반포 현미경 사진으로 내부 세포 무리와 빈 공간이 보인다','연구기관 공개 실제 사진 · 인간 초기 배아 기초연구','배반포 단계의 인간 배아. 연구기관은 PCSK9·HBG 염기교정 연구의 사진으로 소개한다. 초기 구조의 관찰은 임신·출생 후 안전성 검증이 아니다.','Štěpán Jeřábek · Columbia University / IOCB Prague',BIOPAGE,'기관 공개 자료 · 원저작권 유지',BIOPAGE,'PNG를 무손실 WebP로 전환 · 픽셀 동일 · 별도 자유 이용 허락을 주장하지 않음','source-photo')
m['embryo-repair-source']=media(BIO,'embryo-repair.png','IOCB의 원본 비교도: CRISPR-Cas9 이중가닥 절단과 염기교정의 단일가닥 절단을 나란히 설명','연구기관 원본 설명 그림','왼쪽은 DNA 두 가닥 절단, 오른쪽은 한 가닥 절단과 염기교정의 차이를 설명한다. 오른쪽의 효율적인 복구라는 표현은 염색체 이상이나 비표적 변화가 전혀 없다는 뜻이 아니다.','IOCB Prague · Adapted from Jeřábek et al., Nature, 2026',BIOPAGE,'기관 공개 자료 · 원저작권 유지',BIOPAGE,'기관이 공개한 PNG 그대로 · 번역·해석은 캡션과 본문에 별도 제공','source-diagram')
m['high-na-2024-source']=media(HIGH,'high-na-lab.jpg','imec가 2024년 공개한 High-NA 연구시설 배경과 CAR·MOR 감광재료의 초기 노광 패턴 사진','공식 배경 자료 · 2024년 High-NA 초기 노광','왼쪽은 CAR, 오른쪽은 MOR의 초기 패턴이다. 연구시설·감광재료·계측을 함께 준비한다는 배경 자료이며, 2026년 12인치 마스크 시제품이나 양산 실적 사진이 아니다.','©imec · 2024 · Figure 1','https://www.imec-int.com/en/articles/entering-high-na-euv-lithography-era','imec 보도·발표용 사진 조건','https://www.imec-int.com/en/terms-use-imec-pictures','원본 JPEG 그대로 · 변경·크롭·합성 없음','source-photo')
m['sulfide-film-fig2']=media(SOLID,'solid-fig2.webp','원 논문 Figure 2 전체와 캡션: 원소 분포, 약 28마이크로미터 단면, 30×10센티미터 자립형 막의 실제 사진','원 논문 Figure 2 · 실제 막 사진·단면·원소 분포','a·b는 불소 분포, c는 막 단면과 원소 분포, d는 자립형 막 사진, e는 문헌 비교다. d의 길이와 폭은 큰 막의 제작 사례를 보여주지만 연속 양산 수율을 뜻하지 않는다.','Cheng Lou 외 · Nature Communications · 2026 · Figure 2',MEMBRANE,'CC BY-NC-ND 4.0 · 비상업·변경 금지',CCND,'조기 공개 PDF 5쪽의 전체 Figure·원문 캡션을 발췌 · 패널·문자 변경 없음 · 광고·상업 사용 별도 검토','source-diagram')
m['sulfide-cycle-fig5']=media(SOLID,'solid-fig5.webp','원 논문 Figure 5 전체와 캡션: 몰드 셀 및 파우치 셀의 충방전 곡선과 장기 사이클 결과','원 논문 Figure 5 · 실제 전기화학 측정','c는 몰드 셀 30°C·1C·2MPa, d는 LTO 음극 파우치 셀 40°C·0.5C·2MPa의 반복 시험이다. d의 왼쪽 축은 용량, 오른쪽은 쿨롱 효율이다. 83%는 1,000사이클 뒤 용량 유지율이다.','Cheng Lou 외 · Nature Communications · 2026 · Figure 5',MEMBRANE,'CC BY-NC-ND 4.0 · 비상업·변경 금지',CCND,'조기 공개 PDF 8쪽의 전체 Figure·원문 캡션 발췌 · 가상 곡선·패널 재배열 없음 · 상업 사용 별도 검토','source-diagram')
p.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
posts=SITE/'site/content/posts'
def readpost(slug):
 s=(posts/f'{slug}.mdx').read_text(); assert re.search(r'^draft: true$',s,re.M)
 if not re.search(r'^slug: ',s,re.M):s=s.replace('pubDate: 2026-09-11\n',f'pubDate: 2026-09-11\nslug: {slug}\n',1)
 if "import NewsFigure from '@/components/post/NewsFigure.astro';" not in s:
  end=s.find('\n---',4)+4;s=s[:end]+"\n\nimport NewsFigure from '@/components/post/NewsFigure.astro';"+s[end:]
 return s
def writepost(slug,s):
 assert re.search(r'^draft: true$',s,re.M);(posts/f'{slug}.mdx').write_text(s)
s=readpost(LITH).replace('<NewsFigure media="sulfur-crystal" priority />','<NewsFigure media="sulfur-source-fig1" priority />',1)
s=s.replace('## 3. 기존 방식은 무엇이 부족했나','<NewsFigure media="sulfur-crystal" />\n\n## 3. 기존 방식은 무엇이 부족했나',1)
for id in ['sulfur-electron-range','sulfur-mass-basis']:
 node=f'<NewsFigure media="{id}" />';assert node in s;s=s.replace(node,f'<div data-news-diagram="{id}">\n{node}\n</div>',1)
s=s.replace('출판사 검색 색인의 공개 연구정보를 확인했다.','출판사 공개 초록과 Figure 1 원본·캡션을 직접 확보해 대조했다.')
s=s.replace('오늘의 연구는 그 가능성을 황의 화학반응에서 찾는다.','오늘의 연구는 그 가능성을 황의 화학반응에서 찾는다.\n\n맨 위의 원 논문 Figure 1은 결과의 종류부터 구별해 읽어야 한다. a·b는 이론적인 에너지와 황 화합물의 비교이며, c는 반응 경로의 개념도다. 도표 속 색이나 별을 상용 배터리의 성능 인증으로 읽지 않는다.[1]')
writepost(LITH,s)
s=readpost(BIO).replace('## 1. 한 문장 결론','<NewsFigure media="embryo-study-photo" priority />\n\n## 1. 한 문장 결론',1)
s=s.replace('{/* 사진 A: IOCB 공개 배반포 현미경 사진. 사용권 확인 전 삽입하지 않음. */}','').replace('### 가위와 연필 비유가 감추는 것','<NewsFigure media="embryo-repair-source" />\n\n### 가위와 연필 비유가 감추는 것',1);writepost(BIO,s)
s=readpost(HIGH).replace('## 1. 한 문장 결론','<NewsFigure media="high-na-2024-source" priority />\n\n## 1. 한 문장 결론',1)
s=s.replace('{/* 그림 A: 빛 → 반사형 마스크 → 거울 광학계 → 감광막을 바른 웨이퍼. 개념도임을 명시. */}','위의 사진은 2024년 imec의 초기 High-NA 자료다. 실제 패턴의 모습은 확인할 수 있지만, 2026년 대형 마스크 시스템의 완성품을 보여주는 사진은 아니다.');writepost(HIGH,s)
s=readpost(SOLID)
s=s.replace('논문 게재와 아래 핵심 결과는 9월 11일 출판사 공식 목록에서 확인했다. 9월 12일 재접근은 실패했다. 논문 본문·그림·시험 조건 대조가 남아 있는 검증 대기 초안이다.','9월 12일 출판사 조기 공개 PDF를 확보해 Figure 2·5와 캡션, 해당 시험 조건을 대조했다. 보충자료 전체·원시데이터 재분석과 상업적 이미지 이용 허락은 남아 있는 초안이다.')
s=s.replace('## 1. 한 문장 결론','<NewsFigure media="sulfide-film-fig2" priority />\n\n## 1. 한 문장 결론',1)
s=s.replace('정확한 첨가량과 가공 메커니즘은 본문 대조 전이라 여기서는 단정하지 않는다.','본문은 알파피넨이 PTFE 분포와 응력 분산, 치밀화에 기여한다고 설명한다. 이 설명은 연구진의 메커니즘 해석이며 독립 재현을 뜻하지 않는다.')
s=s.replace('이번 초안에서는 이 조건을 원문과 대조하지 못했으므로 전기차 수명으로 환산하지 않는다.','Figure 5d에서 LTO 음극·NCM93 양극의 파우치 셀, 40°C·0.5C·2MPa 조건을 확인했다. 이 조건의 셀 결과를 전기차 수명으로 환산하지 않는다.')
s=s.replace('{/* 사진 B: 원문 확인 후 실제 자립형 막 사진과 단면 관찰 그림 선정. 그림 C: 충방전 그래프는 조건·축·범례 확인 전 삽입하지 않음. */}','<NewsFigure media="sulfide-cycle-fig5" />\n\n원문 Figure 2d는 약 30×10cm의 막과 두께 측정 사진을 함께 보여주고, Figure 2c에는 약 28μm의 단면이 표시돼 있다. Figure 5의 두 세로축 중 오른쪽의 쿨롱 효율과 왼쪽의 용량은 다른 지표다. 특히 d의 83%는 용량 유지율이지 효율을 뜻하지 않는다.[1]')
s=s.replace('이 초안은 해당 조건을 확인하지 못해 경쟁 연구 순위를 만들지 않는다.','이 글은 확인한 시험 조건을 함께 제시하며, 다른 조건의 연구와 단순 순위를 만들지 않는다.')
s=s.replace('세부 수치와 이해관계 공개는 본문 확인 뒤 보완해야 한다.','본문은 CATL의 지원과 소속 연구진을 명시하고, 저자들은 별도 이해충돌이 없다고 선언한다. 기업 참여 사실과 선언 내용을 구분해 읽어야 한다.[1]')
s=s.replace('현재 초안에서 그래프를 임의로 그리지 않은 이유다.','그래서 이번에는 원 논문 Figure 5 전체를 넣고, 임의로 만든 수명 곡선은 사용하지 않았다.')
s=s.replace('이번 논문의 실제 압력값은 아직 대조하지 못했으므로 임의로 쓰거나 압력이 필요 없다고 주장하지 않는다.','Figure 5의 반복 시험은 2MPa 조건이며, 본문은 더 낮은 압력에서 고율 성능이 저하되는 결과도 설명한다. 따라서 무가압 배터리로 소개하지 않는다.[1]')
s=s.replace('가장 먼저 실제 막의 두께·면적·전도도와 셀 시험 조건을 대조해야 한다.','이번에 대조한 막의 치수와 Figure 5 조건 다음으로는 보충자료와 원시데이터의 교차 확인이 필요하다.')
s=s.replace('원문 접근이 가능해지면 재료 조성, 첨가제 역할, 실제 막의 사진과 단면, 전도도 측정 조건, 셀 구성, 수명 그래프를 순서대로 대조해야 한다.','이제 원문 PDF와 실제 사진·수명 그래프는 확보했다. 다음에는 보충자료의 재료 조성, 첨가제 역할을 분리한 비교 시험, 셀 구성과 반복 수를 원시데이터까지 연결해 대조해야 한다.')
s=s.replace('본문은 이번 조사에서 접근 실패.','2026-09-12 출판사 조기 공개 PDF 12쪽 확보; Figure 2·5와 해당 본문·캡션을 대조했다. 보충자료 전체 재검증은 미완료. 이미지 라이선스는 CC BY-NC-ND 4.0이며 상업 이용 허락을 뜻하지 않는다.')
s=s.replace('대신 확인한 최종 결과와 미확인 시험 조건을 분리한 정보상자가 더 정직한 시각자료다.','이번에는 원문 곡선을 그대로 제시하고 축·범례·시험 조건을 함께 설명한다.')
s=s.replace('원문 사진이 없으면 전자와 이온의 이동을 구분하는 자체 개념도를 쓰되, 실제 실험 장치처럼 꾸미지 않는다.','이번에는 원문 막 사진과 단면을 포함한 Figure 2 전체를 대표 이미지로 사용했다.')
writepost(SOLID,s)
ledger=[]
for id,item in m.items():
 if not item['src'].startswith('/assets/posts/frontier-source-20260912/'):continue
 file=OUT/Path(item['src']).name
 ledger.append(dict(media_id=id,file=str(file.relative_to(ROOT)),sha256=digest(file.read_bytes()),bytes=file.stat().st_size,source_page=item['source'],rights=item['rights'],license=item['license'],changes=item['changes']))
(OUT/'provenance.json').write_text(json.dumps({'verifiedAt':'2026-09-12','sourceDownloads':[dict(file=k,url=v[0],sha256=v[1]) for k,v in SOURCES.items()],'assets':ledger,'notice':'Draft is not access control: repository and static asset URLs are public. Third-party images are not relicensed under MIT. Commercial/ad-supported reuse must be reviewed separately.'},ensure_ascii=False,indent=2)+'\n')
p=SITE/'scripts/news-sulfur-visual-contract.mjs';t=p.read_text()
t=t.replace('media="sulfur-crystal" priority','media="sulfur-source-fig1" priority').replace("const ids = ['sulfur-crystal', 'sulfur-electron-range', 'sulfur-mass-basis'];","const ids = ['sulfur-source-fig1', 'sulfur-crystal', 'sulfur-electron-range', 'sulfur-mass-basis'];")
t=t.replace("length, 3, 'sulfur: exactly three role-specific visuals expected'","length, 4, 'sulfur: source figure, material photograph and two educational diagrams expected'")
t=t.replace("assert.equal(new URL(media['sulfur-crystal'].src).hostname, 'thumb.wikimedia.org');","for (const id of ids.slice(0, 2)) {\n  assert(media[id].src.startsWith('/assets/posts/frontier-source-20260912/'));\n  assert(fs.existsSync(new URL(`../site/assets${media[id].src}`, import.meta.url)));\n}\nassert.match(media['sulfur-source-fig1'].caption, /이론/);\nassert.match(media['sulfur-source-fig1'].license, /원저작권/);")
t=t.replace('ids.slice(1)','ids.slice(2)').replace('3 credited visuals','4 credited visuals');p.write_text(t)
print(json.dumps({'changed_posts':[LITH,BIO,HIGH,SOLID],'local_assets':len(ledger)},ensure_ascii=False))

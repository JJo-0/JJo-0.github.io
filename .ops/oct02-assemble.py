from pathlib import Path
import subprocess,json,hashlib,html,re,fitz,yaml
R=Path.cwd();A=R/'spaceship-ui';O=R.parent/'oct03-receipt';INPUT=R.parent/'input02';SOURCE='2c2841cf089dde5ae554788e91ffa31662545126'
manifest=json.loads((O/'manifest.json').read_text());changed={r['path'] for r in manifest['files']}
def write(path,text):
 p=R/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text);changed.add(path)
def put(path,obj):write(path,json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def patch(path,old,new):
 p=R/path;s=p.read_text();assert s.count(old)==1,(path,old);write(path,s.replace(old,new))
def digest(b):return hashlib.sha256(b).hexdigest()
config=[
 ('lace','2026-10-02-lace-complementary-heuristics-news','lace-complementary-heuristics',['oct02-lace-contract','oct02-lace-portfolio'],99,'2026-10-01','10.1038/s42256-026-01307-8'),
 ('drf','2026-10-02-perturbation-benchmark-calibration-news','perturbation-benchmark-calibration',['oct02-drf-fig1','oct02-drf-fig2'],97,'2026-10-01','10.1038/s41587-026-03307-w'),
 ('glass','2026-10-02-glassrecon-depth-prior-news','glassrecon-depth-prior',['oct02-glass-geometry','oct02-glass-local-global'],96,'2026-07-23','arXiv:2604.18336v3')]
media=json.loads((A/'site/news-media.json').read_text());enmedia=json.loads((A/'site/news-media-en.json').read_text());edition=json.loads((A/'site/english-edition.json').read_text());entries=[];assets=[]
for order,(key,ko,en,ids,score,published,doi) in enumerate(config,1):
 for folder,name in [('posts',ko+'.mdx'),('english','en-'+en+'.mdx')]:
  path='spaceship-ui/site/content/'+folder+'/'+name
  raw=subprocess.check_output(['git','show',SOURCE+':'+path]).decode();write(path,raw)
 kp=A/'site/content/posts'/(ko+'.mdx');ep=A/'site/content/english'/('en-'+en+'.mdx');k=yaml.safe_load(kp.read_text().split('---',2)[1]);e=yaml.safe_load(ep.read_text().split('---',2)[1])
 assert not any(x['koSlug']==ko or x['enSlug']==en for x in edition['pairs'])
 pair={'key':e['translationKey'],'koSlug':ko,'enSlug':en,'koFile':kp.name,'enFile':ep.name,'sourceSha256':digest(kp.read_bytes()),'englishSha256':digest(ep.read_bytes()),'sourceCommit':SOURCE,'scope':'full-article'}
 edition['pairs'].append(pair)
 entries.append({'key':key,'slug':ko,'enSlug':en,'title':k['title'],'order':order,'mediaIds':ids,'sourcePublished':published,'doi':doi,'providedEditorialScore':score,'scoreOrigin':'supplied editorial selection, not a newly measured probability','evidenceGrade':'PEER_REVIEWED_FRONTIER','sourceSha256':pair['sourceSha256'],'englishSha256':pair['englishSha256'],'sourceAccess':'accepted conference manuscript v3' if key=='glass' else 'public abstract, supplement and official implementation; main PDF not retrieved' if key=='lace' else 'Version of Record and supplementary notes'})
# Independent website teaching illustrations, not images of measured experiments.
def txt(x,y,text,size=26,color='#183b38',weight=400):return f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}">{html.escape(text)}</text>'
def box(x,y,w,h,fill='#edf4ef',stroke='#376b61'):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def arrow(x1,y1,x2,y2,color='#376b61'):return f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{color}" stroke-width="4" fill="none" marker-end="url(#arrow)"/>'
def svg(title,subtitle,body):return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700" role="img"><title>'+html.escape(title)+'</title><desc>'+html.escape(subtitle)+'</desc><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#376b61"/></marker></defs><rect width="1200" height="700" fill="#fbfaf5"/>'+txt(50,64,title,36,weight=700)+txt(50,105,subtitle,21,color='#586c67')+body+txt(50,658,'JJo teaching illustration · Not experimental data · CC BY 4.0',19,color='#586c67')+'</svg>'
body=box(45,155,230,165)+txt(68,199,'Problem + cases',26,weight=700)+txt(68,242,'Rules, resources',21)+txt(68,275,'and objectives',21)
for y,label,detail in [(145,'I · Input','Read the instance'),(290,'O · Output','Represent a solution'),(435,'T · Tools','Check and evaluate')]:
 body+=box(340,y,300,110)+txt(365,y+42,label,27,weight=700)+txt(365,y+80,detail,21)
body+=arrow(275,220,328,200)+arrow(275,240,328,340)+arrow(275,260,328,480)+box(755,225,390,240,'#fff0d8','#ac7935')+txt(781,276,'H · Heuristic portfolio',28,weight=700)+txt(781,323,'Generate → run → evaluate',22)+txt(781,367,'Repair failures; keep specialists',21)+txt(781,411,'Same contract for every candidate',20)+arrow(640,200,745,275)+arrow(640,345,745,345)+arrow(640,490,745,415)
teaching={'oct02-lace-contract':svg('LACE: separate responsibilities before searching','A conceptual interface map based on the public I-O-T-H description.',body)}
body=txt(65,185,'Heuristic',25,weight=700)
for j,label in enumerate(['Case X','Case Y','Case Z']):body+=txt(300+240*j,185,label,26,weight=700)
for i,name in enumerate(['A','B','C']):
 body+=txt(110,280+i*95,name,30,weight=700)
 for j in range(3):
  good=i==j;body+=box(270+j*240,220+i*95,190,70,'#d4e9dc' if good else '#f2f0e9','#386857' if good else '#c5c9be')+txt(295+j*240,264+i*95,'Strong' if good else 'Weaker',25)
body+=box(65,535,1065,66,'#fff0d8','#ac7935')+txt(89,577,'Keep A + B + C: different strengths cover different cases.',26)
teaching['oct02-lace-portfolio']=svg('Complementarity is not the same as the best average','Invented A/B/C cases explain coverage; no paper scores are plotted.',body)
body=box(62,300,165,100)+txt(83,343,'RGB-D',28,weight=700)+txt(82,375,'camera',25)
body+='<rect x="492" y="170" width="26" height="340" fill="#cce5ed" stroke="#427588" stroke-width="3"/><path d="M495 170 L518 200 M495 240 L518 270 M495 310 L518 340 M495 380 L518 410 M495 450 L518 480" stroke="#7caebc" stroke-width="2"/><rect x="983" y="150" width="42" height="380" fill="#d6d1c6" stroke="#807c72" stroke-width="2"/>'
body+=arrow(227,332,482,332)+f'<path d="M230 370 L977 370" stroke="#ba673e" stroke-width="4" stroke-dasharray="12 9" fill="none"/>'+txt(419,142,'Glass barrier',25,weight=700)+txt(925,125,'Background',25,weight=700)+txt(255,288,'Needed: surface depth',24)+txt(570,415,'Possible corrupted background return',22,color='#a4512b')+box(60,555,1060,52)+txt(82,590,'A distant or missing measurement does not prove free space.',24)
teaching['oct02-glass-geometry']=svg('Transparent is not traversable','A geometric teaching sketch, not a sensor image or a calibrated scale.',body)
body=txt(72,175,'1 · Sample patches',26,weight=700)
for i in range(3):
 for j in range(4):body+=box(65+j*67,215+i*72,57,62,'#d4e9dc' if j<2 else '#f4dfcc','#92a49a')
body+=txt(64,470,'No ground-truth glass mask',19)+txt(64,499,'is assumed at inference.',19)+arrow(337,330,402,330)
body+=box(420,210,290,220)+txt(444,252,'2 · Propose s, t',26,weight=700)+txt(445,300,'Candidate from patch A',20)+txt(445,345,'Candidate from patch B',20)+txt(445,390,'Candidate from patch C',20)+arrow(714,330,781,330)
body+=box(800,210,335,220,'#fff0d8','#ac7935')+txt(824,252,'3 · Validate globally',25,weight=700)+txt(824,303,'Score over the image',22)+txt(824,348,'Select one scale + shift',22)+txt(824,393,'Align the whole prior',22)+box(65,553,1070,57)+txt(88,590,'Local sampling creates hypotheses, not independently scaled depth tiles.',24)
teaching['oct02-glass-local-global']=svg('Local hypotheses, global alignment','Conceptual local-RANSAC workflow; not a measured parameter plot.',body)
for mid,text in teaching.items():write('spaceship-ui/site/assets/assets/posts/news-20261002/'+mid+'.svg',text)
# Complete original figures under the publisher's explicit CC BY license.
crops=[(1,2,[39,48,564,309],2100,1044,'8e32ce29807ea09d8dac7ca06ee4223f168955d8b96b856ae8264b174d8a3cb7'),(2,4,[39,48,564,524],2100,1904,'7af275f8a5812f964f012cadf1cde8d8b9aa5c2816dfd2981e919dc0900742b4')]
pdf=(INPUT/'drf/document-0.pdf').read_bytes();assert digest(pdf)=='da31aa661f2f08a3f55c6090d697f7027e0f5e476b9f0f916663698d98969228';doc=fitz.open(stream=pdf,filetype='pdf')
for number,page,crop,w,h,expected in crops:
 pix=doc[page-1].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(crop),alpha=False);data=pix.tobytes('png');assert digest(data)==expected and (pix.width,pix.height)==(w,h)
 path='spaceship-ui/site/assets/assets/posts/news-20261002/drf-fig-'+str(number)+'.png';(R/path).write_bytes(data);changed.add(path)
caption={
 'oct02-lace-contract':('I-O-T-H의 입력·출력·검증 도구와 휴리스틱 역할을 나눈 자체 교육 도식','문제와 사례를 입력·출력·도구 계약으로 정리하고 같은 계약 안에서 여러 후보를 실행한다. 원논문 도판이나 실험 데이터가 아닌 공개 구조의 개념 설명이다.','An independent teaching diagram of I-O-T-H responsibilities','Inputs, outputs and checking tools define a shared interface for candidate heuristics. This is a conceptual explanation, not a paper figure or experimental data.'),
 'oct02-lace-portfolio':('서로 다른 사례에서 강점을 가진 A·B·C의 교육용 포트폴리오 예','가상의 사례와 후보로 보완성을 설명한다. Strong과 Weaker는 설명용 표시이며 실제 논문에서 측정한 순위·점수가 아니다.','An invented A/B/C example of complementary portfolio coverage','The cases and strengths are hypothetical teaching examples. Strong and Weaker are not measured paper ranks or scores.'),
 'oct02-drf-fig1':('양성·음성 대조와 DRF를 이용한 교란 평가 지표 교정','a는 technical duplicate, b는 유전자별 혼합 대조, c는 관측 간격과 이상적 간격의 비율, d·e는 데이터셋·지표별 교정이다. 지표 감도를 측정하며 약물 효과나 모델 정확도 자체가 아니다.','Original Figure 1: controls and metric calibration through DRF','a: technical duplicate; b: gene-wise interpolation; c: observed versus ideal range; d/e: dataset and metric calibration. These measure discrimination, not drug effects or model accuracy itself.'),
 'oct02-drf-fig2':('단일·조합 교란 예측을 교정 지표에서 비교한 원도판 전체 패널','a는 학습·시험 과제, b–d는 단일 교란, e–g는 조합 예측이다. 지표별 축 방향과 오차막대를 함께 읽는다. 모든 패널의 오른쪽이 항상 우수한 것은 아니다.','Original Figure 2: single and combinatorial perturbation benchmarks','a defines tasks, b–d show single-perturbation prediction, and e–g combinations. Read metric directions and uncertainty: moving right is not favorable in every panel.'),
 'oct02-glass-geometry':('깊이 센서가 유리 뒤의 배경을 측정하는 실패를 설명한 자체 도식','카메라·유리·벽의 관계를 설명한 그림이며 실제 실험사진이나 거리 축척이 아니다. 멀거나 없는 깊이값이 통과 가능한 공간을 증명하지 않음을 보여준다.','Independent teaching sketch of background returns behind glass','A camera/glass/wall explanation, not an experimental photograph or a distance scale. A distant or missing return does not establish traversable space.'),
 'oct02-glass-local-global':('국소 패치의 척도·이동 후보를 전역 평가하는 자체 교육 도식','패치별 후보를 만든 뒤 전체 영상에서 골라 하나의 아핀 정렬을 적용한다. 패치마다 독립적인 최종 척도를 붙이거나 추론에 정답 유리 마스크를 제공한다는 뜻이 아니다.','Independent sketch of locally generated, globally validated alignment','Patches propose scale/shift pairs; global evaluation selects one affine alignment. It does not assign separate final scales to tiles or supply ground-truth masks at inference.')}
for entry in entries:
 for mid in entry['mediaIds']:
  assert mid not in media and mid not in enmedia
  original=mid.startswith('oct02-drf-');number=int(mid[-1]) if original else None
  src='/assets/posts/news-20261002/'+('drf-fig-'+str(number)+'.png' if original else mid+'.svg');data=(A/'site/assets'/src.lstrip('/')).read_bytes()
  w,h=next((x[3],x[4]) for x in crops if x[0]==number) if original else (1200,700)
  ka,kc,ea,ec=caption[mid]
  source=('https://www.nature.com/articles/s41587-026-03307-w/figures/'+str(number)) if original else 'https://jjo-0.github.io/posts/'+entry['slug']+'/'
  credit='Miller et al. · Nature Biotechnology · Figure '+str(number) if original else 'JJo · independent educational illustration'
  changes='원도판 전체 패널·축·색·주석을 유지한 PNG 렌더링. 주변 본문·여백만 제외.' if original else '원논문 이미지와 데이터를 복제하지 않은 자체 개념 도식. 영어 레이블을 두 언어 본문에서 공유.'
  media[mid]={'slug':entry['slug'],'order':entry['order'],'src':src,'width':w,'height':h,'alt':ka,'caption':kc,'kind':'원 논문 Figure '+str(number) if original else '자체 교육 도식 · 실험 데이터 아님','credit':credit,'source':source,'license':'CC BY 4.0','rights':'https://creativecommons.org/licenses/by/4.0/','changes':changes,'checkedAt':'2026-10-05','sha256':digest(data)}
  enmedia[mid]={'alt':ea,'caption':ec,'kind':'Original Figure '+str(number) if original else 'Independent teaching diagram · Not experimental data','credit':credit,'changes':'PNG rendering preserves every original panel, axis, color and annotation; surrounding article text excluded.' if original else 'Independent conceptual diagram, not a copy of publisher imagery or measured results. English labels are shared across languages.'}
  assets.append({'id':mid,'src':src,'width':w,'height':h,'sha256':digest(data),'license':'CC BY 4.0','source':source,'originalPaperFigure':original,'pdfSha256':digest(pdf) if original else None,'pdfPage':next(x[1] for x in crops if x[0]==number) if original else None,'cropPoints':next(x[2] for x in crops if x[0]==number) if original else None,'renderer':'PyMuPDF 1.26.7' if original else 'native SVG frontend illustration','reviewedImageSha256':digest(data) if original else None})
put('spaceship-ui/site/news-media.json',media);put('spaceship-ui/site/news-media-en.json',enmedia);put('spaceship-ui/site/english-edition.json',edition)
put('spaceship-ui/site/news-edition-20261002.json',{'date':'2026-10-02','updatedOn':'2026-10-05','sourceCommit':SOURCE,'selectionRecord':'Supplied 99/97/96 editorial ranking retained; the prior 24-item discovery scan was not repeated.','entries':entries})
put('spaceship-ui/site/news-media-provenance-20261002.json',{'checkedAt':'2026-10-05','assets':assets})
patch('scripts/normalize_tags_current.py','if __name__ == "__main__":',"POST_TAXONOMY.update({\n"+''.join(f"    {e['slug']+'.mdx'!r}: Taxonomy({yaml.safe_load((A/'site/content/posts'/(e['slug']+'.mdx')).read_text().split('---',2)[1])['category']!r}, {yaml.safe_load((A/'site/content/posts'/(e['slug']+'.mdx')).read_text().split('---',2)[1])['subcategory']!r}, 'paper-review', {tuple(yaml.safe_load((A/'site/content/posts'/(e['slug']+'.mdx')).read_text().split('---',2)[1])['tags'])!r}),\n" for e in entries)+"})\n\nif __name__ == \"__main__\":")
patch('spaceship-ui/src/pages/posts/[...slug]/index.astro',"import oct03 from '../../../../site/news-edition-20261003.json';","import oct03 from '../../../../site/news-edition-20261003.json';\nimport oct02 from '../../../../site/news-edition-20261002.json';")
patch('spaceship-ui/src/pages/posts/[...slug]/index.astro','adsEnabled={!oct03.entries.some','adsEnabled={!oct02.entries.some((entry) => entry.slug === effectiveSlug) && !oct03.entries.some')
patch('spaceship-ui/scripts/browser-news-media-audit.mjs','  const declaredEntries = [',"  const oct02 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20261002.json', import.meta.url), 'utf8'));\n  const declaredEntries = [\n    ...oct02.entries,")
# Lossless graph transport: escaped JSON attributes unnecessarily expand every quote.
# Keep all graph data and native article links; store safe inert JSON text instead.
write('spaceship-ui/src/lib/experience/graph-json.mjs',r'''export function serializeGraphPayload(graph) {
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}
'''.replace("'\\\\u003c'","'\\u003c'"))
patch('spaceship-ui/src/components/experience/ExperienceCanvas.astro',"import '@/styles/renderer.css';","import '@/styles/renderer.css';\nimport { serializeGraphPayload } from '@/lib/experience/graph-json.mjs';")
patch('spaceship-ui/src/components/experience/ExperienceCanvas.astro','  data-post-graph={graph ? JSON.stringify(graph) : undefined}\n','')
patch('spaceship-ui/src/components/experience/ExperienceCanvas.astro','  <canvas class="experience-renderer__gpu"','  {graph && <script is:inline type="application/json" data-post-graph-source set:html={serializeGraphPayload(graph)} />}\n  <canvas class="experience-renderer__gpu"')
patch('spaceship-ui/src/lib/experience/ascii-art.ts',"JSON.parse(host.dataset.postGraph ?? 'null')","JSON.parse(host.querySelector<HTMLScriptElement>('script[data-post-graph-source]')?.textContent ?? host.dataset.postGraph ?? 'null')")
patch('spaceship-ui/scripts/sep25-contract.py',"graph=json.loads(next(a['data-post-graph'] for t,a in hp.tags if 'data-post-graph' in a))","graph_match=re.search(r'<script\\b[^>]*data-post-graph-source[^>]*>([\\s\\S]*?)</script>',home)\nassert graph_match, 'Complete graph JSON payload required'\ngraph=json.loads(graph_match.group(1))")
write('spaceship-ui/scripts/graph-json.test.mjs',r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import {serializeGraphPayload} from '../src/lib/experience/graph-json.mjs';
const input={nodes:[{id:'post-0',title:'한국어 <script> & "quoted" </script><img src=x>',href:'/posts/test/',x:1.1234,y:-2,z:0,tags:['a','b']}],edges:[{source:'post-0',target:'post-1',weight:1.2,reasons:['shared category']}]};
const encoded=serializeGraphPayload(input);
assert.deepEqual(JSON.parse(encoded),input,'Transport must preserve every value');
assert(!encoded.includes('<')&&!encoded.includes('</script>'),'JSON cannot terminate its inert script');
const component=fs.readFileSync(new URL('../src/components/experience/ExperienceCanvas.astro',import.meta.url),'utf8');
assert(component.includes('type="application/json" data-post-graph-source set:html={serializeGraphPayload(graph)}'));
assert(component.includes('graph.nodes.map') && component.includes('data-post-graph-node={node.id}'));
const runtime=fs.readFileSync(new URL('../src/lib/experience/ascii-art.ts',import.meta.url),'utf8');
assert(runtime.includes("script[data-post-graph-source]") && runtime.includes("host.dataset.postGraph ?? 'null'"));
console.log('graph-json: PASS lossless transport, closing-script safety, all native links and legacy fallback retained');
''')
# The new edition has two explanation cards for every article, including mixed SVG/PNG media.
browser=(A/'scripts/browser-oct03.mjs').read_text().replace('20261003','20261002').replace('oct03','oct02')
browser=browser.replace("e.key==='ltri'?3:2",'3')
write('spaceship-ui/scripts/browser-oct02.mjs',browser)
# Store Blogger material as drafts only; no connected publishing action is taken.
summaries={
 'lace':'LACE는 문제의 입력·출력·검증 도구를 먼저 구성하고 서로 다른 사례에 강한 휴리스틱을 묶어 진화시킵니다. 기존 36개 문제에서 보고한 0.945는 벤치마크 점수이며 최적해 94.5% 보장이나 현실 비용절감률이 아닙니다. 새 4개 문제도 모두 항만 물류 계열입니다. 공개된 40개 문제와 7,109개 사례, 배포 포트폴리오 평가는 새 API 기반 진화 실행과 구분해야 합니다. 전체 해설은 계약과 포트폴리오의 원리, 예제 수식, 실행 예산과 운영 검증의 경계를 설명합니다.',
 'drf':'유전자 교란 AI가 단순 평균보다 못해 보였다면 모델뿐 아니라 평가 지표도 점검해야 합니다. 이 연구는 14개 데이터셋·18개 지표에서 양성·음성 대조와 DRF로 지표의 구별 능력을 확인했습니다. Wessels23에서 PRESAGE가 additive baseline을 15/18개 지표로 넘었다는 것은 세포의 83.3%를 정확히 예측했다는 뜻이 아닙니다. 조합 노출 범위와 지표 목적, 보지 못한 세포 맥락의 미검증을 함께 읽어야 합니다. 원논문 두 그림과 기초 계산으로 평가 교정의 의미를 풀었습니다.',
 'glass':'GlassRecon은 RGB 영상의 깊이 사전정보를 센서의 미터 단위와 맞춥니다. 작은 패치에서 크기·이동 후보를 만들고 전체 영상에서 선택하므로 패치마다 별도의 최종 척도를 적용하는 방식은 아닙니다. Hard 316장에서 DA3 정렬의 AbsRel은 0.323에서 0.172로 낮아졌습니다. 하지만 기하학적으로 만든 유리 정답의 평면 가정과 사전 모델의 실패가 남고, navigation 결과는 점유 지도상의 경로계획이지 물리 로봇의 반복 무충돌 주행 실험이 아닙니다. 자체 교육 도식과 평가표로 근거의 범위를 구분했습니다.'}
for e in entries:
 write('spaceship-ui/docs/blogger-drafts/2026-10-02/'+e['key']+'.md','# '+e['title']+'\n\n상태: 미발행 Blogger 초안\n\n'+summaries[e['key']]+'\n\n전체 해설: https://jjo-0.github.io/posts/'+e['slug']+'/\n')
write('spaceship-ui/docs/operations/NEWS_20261002_03_CONTINUATION.md','''# October 2–3 continuation

Edition dates remain October 2 and 3; actual writing and source checks occurred October 5, 2026. All six supplied topics and their paired English texts are included. Original rankings are editorial input, not new calibrated scores or a repeated 24-item discovery scan.

## Source-derived corrections and access boundaries
The October 3 LTRI paper includes separate ambient storage, one-sun MPP operation and 65°C dark thermal tests. The supplied draft mentioned storage only. These are separately attributed rather than silently treating them as one condition. MCCv allele-specific inference is not single-cell measurement or universal causality; pAML retrospective risk and preclinical drug results do not establish prospective treatment-allocation benefit.

For October 2, LACE main-PDF access redirected to its public abstract. Relevant supplementary PDF sections and official implementation documentation were checked; this is not full main-paper reproduction. The DRF final paper and supplement were accessible under CC BY 4.0. GlassRecon v3 is dated July 23, not October 1, and is marked IROS accepted; no official award win is claimed. Its locally proposed alignment is globally validated, its evaluation uses geometrically constructed planar reference depths, and path planning is not physical collision testing.

LACE and GlassRecon publisher/repository figure-reuse permission was not established. Four original teaching SVGs are explicitly labeled as illustrations rather than research photographs or measured plots. DRF Figures 1 and 2 retain complete panels, axes and labels under CC BY 4.0. October 3 retains six reviewed original figures and their rights records. No external Blogger account was used; six summaries across the two dates remain drafts.

The current 252 KiB Home budget was exceeded after legitimate posts were added. Graph values, edges and native links are preserved losslessly in inert, less-than-escaped application/json script text instead of repeatedly HTML-escaped attributes. The actual parser, static inventory checks and an injection/round-trip unit test follow this transport change. No performance budget or article count is reduced.

Independent scientific model training, full-benchmark replication, wet-lab work and physical robot tests were not performed. Exact source/build/CI/public-deployment receipts are distinct stages; no stage is inferred from another.
''')
manifest['oct02SourceCommit']=SOURCE
manifest['files']=[]
for path in sorted(changed):
 b=(R/path).read_bytes();manifest['files'].append({'path':path,'mode':'100644','type':'blob','sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'sha256':digest(b)})
(O/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('Combined candidate contains',len(manifest['files']),'files; all six topics have full paired manuscripts.')

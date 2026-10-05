from pathlib import Path
import hashlib,json,re,subprocess,requests,yaml
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
R=Path.cwd();A=R/'spaceship-ui';SOURCE='72c55bf3f615006e7e0644cad490599a9b1cb118'
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==SOURCE
changed=set()
def write(p,s):
 f=R/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(s);changed.add(p)
def put(p,j):write(p,json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def patch(p,a,b):
 s=(R/p).read_text();assert s.count(a)==1,(p,a);write(p,s.replace(a,b))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def fm(p):return yaml.safe_load(p.read_text().split('---',2)[1])
config=[
 ('lace','2026-10-02-lace-complementary-heuristics-news','lace-complementary-heuristics',['oct02-lace-benchmark','oct02-lace-portfolio'],99,'10.1038/s42256-026-01307-8','2026-10-01'),
 ('perturbation','2026-10-02-perturbation-benchmark-calibration-news','perturbation-benchmark-calibration',['oct02-perturbation-fig1','oct02-perturbation-fig2'],97,'10.1038/s41587-026-03307-w','2026-10-01'),
 ('glassrecon','2026-10-02-glassrecon-depth-alignment-news','glassrecon-depth-alignment',['oct02-glass-absrel','oct02-glass-delta'],96,'arXiv:2604.18336v3','2026-07-23')]
assets=A/'site/assets/assets/posts/news-20261002';assets.mkdir(parents=True,exist_ok=True)
# Reproducible numerical plots. No publisher graphics are imitated.
fig,ax=plt.subplots(figsize=(9,5.5));bars=ax.barh(['Direct prompt','Strongest LLM baseline','LACE'],[.571,.870,.945]);ax.bar_label(bars,fmt='%.3f',padding=6);ax.set_xlim(0,1.08);ax.set_xlabel('Reported benchmark score — not a success probability');ax.set_title('LACE: mean score across 36 CO-Bench problems');fig.tight_layout();fig.savefig(assets/'lace-benchmark.png',dpi=160);plt.close(fig)
fig,ax=plt.subplots(figsize=(9,5.5))
for label,values in [('Specialist 1',[8,8,20,20]),('Specialist 2',[20,20,8,8]),('Generalist',[11,11,11,11])]:ax.plot(['Case A','Case B','Case C','Case D'],values,marker='o',label=label)
ax.set_ylim(0,24);ax.set_ylabel('Illustrative cost (lower is better)');ax.set_title('Teaching example: complementary specialists\nHypothetical values, not LACE experimental results');ax.legend();fig.tight_layout();fig.savefig(assets/'lace-portfolio-example.png',dpi=160);plt.close(fig)
for name,label,g,l,limits in [('glass-absrel.png','AbsRel (lower is better)',[.152,.061,.323],[.095,.055,.172],(0,.4)),('glass-delta.png','Fraction within δ < 1.25 (higher is better)',[.855,.962,.651],[.937,.966,.883],(0,1.12))]:
 fig,ax=plt.subplots(figsize=(9,5.5));x=np.arange(3)
 for shift,title,values in [(-.19,'DA3 + global fit',g),(.19,'DA3 + local-sampled alignment',l)]:
  bars=ax.bar(x+shift,values,width=.38,label=title);ax.bar_label(bars,fmt='%.3f',padding=4)
 ax.set_xticks(x,['All (917)','Easy (601)','Hard (316)']);ax.set_ylim(*limits);ax.set_ylabel(label);ax.set_title('GlassRecon Table I — replot of reported values');ax.legend(loc='upper left');fig.tight_layout();fig.savefig(assets/name,dpi=160);plt.close(fig)
originals={}
for n in [1,2]:
 url=f'https://media.springernature.com/full/springer-static/image/art%3A10.1038%2Fs41587-026-03307-w/MediaObjects/41587_2026_3307_Fig{n}_HTML.png'
 response=requests.get(url,timeout=60);response.raise_for_status();p=assets/f'perturbation-fig{n}.png';p.write_bytes(response.content)
 with Image.open(p) as im:assert im.format=='PNG' and im.width>=685;im.verify()
 originals[f'oct02-perturbation-fig{n}']=url
for p in assets.glob('*.png'):changed.add(str(p.relative_to(R)))
# Captions distinguish publisher originals, factual replots and hypothetical examples.
labels={
 'oct02-lace-benchmark':('lace-benchmark.png','36개 CO-Bench에서 직접 프롬프트 0.571, 기존 최강 LLM 방법 0.870, LACE 0.945를 비교한 자체 막대그래프','논문 공개 초록의 평균 점수를 다시 그렸다. 성공률·최적해 비율·실제 비용절감률이 아니다. 원논문 Figure를 복제하거나 새 실험을 수행하지 않았다.','Reported mean scores across 36 CO-Bench problems: direct prompting 0.571, strongest LLM baseline 0.870, and LACE 0.945','Our replot of public abstract values. These are benchmark scores, not success probabilities, optimality guarantees or real cost savings. No new experiment or publisher-figure reproduction.','https://www.nature.com/articles/s42256-026-01307-8','reported-data-replot'),
 'oct02-lace-portfolio':('lace-portfolio-example.png','가상 네 사례에서 두 전문가와 일반 전략의 비용을 비교한 상보성 교육 예제','이 그래프는 가상 값이다. 두 전문가의 평균 비용은 각각 14, 일반 전략은 11이지만 전문가 묶음의 사례별 최선 평균은 8이다. 실행·선택 비용은 별도이며 실제 LACE 결과가 아니다.','Hypothetical costs for two specialists and a generalist across four teaching cases','Hypothetical example, not LACE measurements. Each specialist averages 14 and the generalist 11, while selecting the better specialist per case averages 8. Evaluation and selection are not free.','https://jjo-0.github.io/posts/2026-10-02-lace-complementary-heuristics-news/#lace-portfolio-mean','hypothetical-example'),
 'oct02-perturbation-fig1':('perturbation-fig1.png','유전적 교란 연구 원논문 Figure 1의 양성 대조군 구성과 DRF 지표 보정 패널','a·b는 기술적 복제와 보간 대조군, c는 DRF, d·e는 데이터셋별 보정 상태다. 양성 대조군은 해당 교란 측정값을 사용하는 평가용 기준이지 미관측 교란을 예측하는 배포 모델이 아니다.','Original Figure 1: positive-control construction and DRF metric calibration','Panels a/b define technical and interpolated controls; c defines DRF; d/e compare calibration across datasets. Positive controls use measurements for the perturbation and are not deployable unseen-perturbation predictors.','https://www.nature.com/articles/s41587-026-03307-w/figures/1','publisher-original'),
 'oct02-perturbation-fig2':('perturbation-fig2.png','유전적 교란 연구 원논문 Figure 2의 단일 교란·조합 예측 과제와 지표별 모델 비교','a는 두 예측 과제, b–d는 Replogle22 K562, e–g는 Wessels23이다. 지표마다 좋은 방향이 다르며 점·구간은 기준선 대비 차이와 불확실성이다. 15/18 지표는 조합 예측 성공률이 아니다.','Original Figure 2: unseen single-perturbation and combination prediction comparisons','Panel a defines the tasks, b–d concern Replogle22 K562 and e–g Wessels23. Metric direction matters; points and intervals express baseline differences and uncertainty. Fifteen of 18 metrics is not a prediction success rate.','https://www.nature.com/articles/s41587-026-03307-w/figures/2','publisher-original'),
 'oct02-glass-absrel':('glass-absrel.png','GlassRecon Table I의 DA3 전역 정렬과 지역 표본 정렬 AbsRel을 All·Easy·Hard별로 비교한 그래프','논문 Table I 숫자의 자체 재시각화다. Hard 316장의 AbsRel 0.323→0.172는 영상 전체 평가의 약 46.7% 상대 감소이며 미터 단위 오차나 실물 충돌 감소율이 아니다.','GlassRecon Table I replot: DA3 global versus locally sampled alignment AbsRel by subset','Replot of reported Table I values. Hard-subset AbsRel 0.323 to 0.172 is about a 46.7% relative reduction in the whole-image metric, not an error in meters or reduced physical collisions.','https://arxiv.org/html/2604.18336v3','reported-data-replot'),
 'oct02-glass-delta':('glass-delta.png','GlassRecon Table I의 임계 정확도 δ 1.25 미만 비율을 세 영상 집합에서 비교한 그래프','영상 전체 평가 대상 깊이값의 임계 정확도다. Hard의 0.651→0.883은 23.2퍼센트포인트 증가이며 로봇 주행 성공률이 아니다. 원문 표의 값으로 다시 그린 자체 그래프다.','GlassRecon Table I replot: fraction of depth estimates within the delta threshold across three subsets','Threshold accuracy over eligible whole-image depth values. The Hard increase from 0.651 to 0.883 is 23.2 percentage points, not a robot-navigation success rate. Author-created replot of the reported table.','https://arxiv.org/html/2604.18336v3','reported-data-replot')}
media=json.loads((A/'site/news-media.json').read_text());enmedia=json.loads((A/'site/news-media-en.json').read_text());manifest=json.loads((A/'site/english-edition.json').read_text());entries=[];provenance=[]
for order,(key,ko,en,ids,score,doi,published) in enumerate(config,1):
 kp=A/'site/content/posts'/f'{ko}.mdx';ep=A/'site/content/english'/f'en-{en}.mdx';k=fm(kp);e=fm(ep)
 assert not any(p['koSlug']==ko or p['enSlug']==en for p in manifest['pairs'])
 manifest['pairs'].append({'key':e['translationKey'],'koSlug':ko,'enSlug':en,'koFile':kp.name,'enFile':ep.name,'sourceSha256':digest(kp),'englishSha256':digest(ep),'sourceCommit':SOURCE,'scope':'full-article'})
 entries.append({'key':key,'slug':ko,'enSlug':en,'title':k['title'],'order':order,'mediaIds':ids,'doi':doi,'sourcePublished':published,'evidenceGrade':'PEER_REVIEWED_FRONTIER','providedEditorialScore':score,'scoreOrigin':'user-supplied editorial record, not independently rescored','sourceScope':'public abstract + supplementary PDF + official implementation' if key=='lace' else 'open article and Methods' if key=='perturbation' else 'arXiv v3 full text; author-reported IROS acceptance, not award'})
 for id in ids:
  assert id not in media and id not in enmedia
  name,alt,caption,enalt,encaption,source,kind=labels[id];p=assets/name
  with Image.open(p) as im:w,h=im.size
  original=kind=='publisher-original';credit='Miller, Mejia, Leblanc et al. · Nature Biotechnology' if original else 'JJo editorial chart'
  rights='https://creativecommons.org/licenses/by/4.0/' if original else 'https://jjo-0.github.io/policies/copyright/'
  license='CC BY 4.0' if original else 'Author-created chart'
  changes='원문 전체 패널·축·색상 보존; 변경 없음.' if original else '공개 수치 재시각화 또는 명시적 가상 예제; 원논문 도판 복제 아님.'
  enchanges='Original panels, axes and colors retained; unchanged.' if original else 'Replot of reported values or an explicitly hypothetical example; not a copy of a publisher figure.'
  media[id]={'slug':ko,'order':order,'src':f'/assets/posts/news-20261002/{name}','width':w,'height':h,'alt':alt,'kind':'원논문 도판' if original else '수치 해설 그래프','caption':caption,'credit':credit,'source':source,'license':license,'rights':rights,'changes':changes,'sha256':digest(p),'checkedAt':'2026-10-05','rightsStatus':'LICENSE_CHECKED' if original else 'AUTHOR_CREATED'}
  enmedia[id]={'alt':enalt,'kind':'Original paper figure' if original else 'Numerical explainer chart','caption':encaption,'credit':credit,'license':license,'changes':enchanges}
  provenance.append({'id':id,'file':str(p.relative_to(A)),'sha256':digest(p),'width':w,'height':h,'role':kind,'source':source,'originalUrl':originals.get(id),'license':license})
put('spaceship-ui/site/news-media.json',media);put('spaceship-ui/site/news-media-en.json',enmedia);put('spaceship-ui/site/english-edition.json',manifest)
put('spaceship-ui/site/news-edition-20261002.json',{'date':'2026-10-02','checkedAt':'2026-10-05','sourceCommit':SOURCE,'selectionRecord':'Attached user selection: LACE / perturbation metric calibration / GlassRecon. Supplied 99/97/96 ratings and 72-hour/24-item scan were not independently recomputed or rerun. GlassRecon v3 is dated July 23; conference-related selection is not a new October paper or official award.','entries':entries})
put('spaceship-ui/site/news-media-provenance-20261002.json',{'checkedAt':'2026-10-05','assets':provenance,'plotRenderer':matplotlib.__version__,'publisherOriginals':2,'reportedDataReplots':3,'hypotheticalExamples':1,'figureReuseDeniedOrUnconfirmed':['LACE publisher-exclusive article figures','GlassRecon arXiv non-exclusive distribution license is not reuse permission']})
patch('scripts/normalize_tags_current.py','if __name__ == "__main__":',"POST_TAXONOMY.update({\n"+'\n'.join(f"    '{e['slug']}.mdx': Taxonomy({fm(A/'site/content/posts'/(e['slug']+'.mdx'))['category']!r}, {fm(A/'site/content/posts'/(e['slug']+'.mdx'))['subcategory']!r}, 'paper-review', {tuple(fm(A/'site/content/posts'/(e['slug']+'.mdx'))['tags'])!r})," for e in entries)+"\n})\n\nif __name__ == \"__main__\":")
patch('spaceship-ui/src/pages/posts/[...slug]/index.astro',"import Layout from '@/layouts/Layout.astro';","import Layout from '@/layouts/Layout.astro';\nimport oct02 from '../../../../site/news-edition-20261002.json';")
patch('spaceship-ui/src/pages/posts/[...slug]/index.astro','adsEnabled={!sep25.entries.some','adsEnabled={!oct02.entries.some((entry) => entry.slug === effectiveSlug) && !sep25.entries.some')
patch('spaceship-ui/scripts/browser-news-media-audit.mjs','  const oct01 = JSON.parse(',"  const oct02 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20261002.json', import.meta.url), 'utf8'));\n  const oct01 = JSON.parse(")
patch('spaceship-ui/scripts/browser-news-media-audit.mjs','    ...oct01.entries,','    ...oct01.entries,\n    ...oct02.entries,')
# Reuse the existing real-input reading audit without altering October 1 checks.
s=(A/'scripts/browser-oct01-english.mjs').read_text().replace('news-edition-20261001.json','news-edition-20261002.json').replace('news-media-en-20261001.json','news-media-en.json').replace('oct01','oct02').replace('October 1','October 2')
s=s.replace('assert.equal(state.tableRows,4);',"assert.equal(state.tableRows,e.key === 'glassrecon' ? 3 : 4);").replace('assert.equal(imageHashes.size,7);','assert.equal(imageHashes.size,6);')
write('spaceship-ui/scripts/browser-oct02.mjs',s)
write('spaceship-ui/scripts/oct02-contract.py',r'''from pathlib import Path
import hashlib,json,re,struct
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1]
E=json.loads((R/'site/news-edition-20261002.json').read_text())
M=json.loads((R/'site/english-edition.json').read_text())
P=json.loads((R/'site/news-media-provenance-20261002.json').read_text())
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.tags=[];self.feed(s)
 def handle_starttag(self,t,attrs):self.tags.append((t,dict(attrs)))
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def paircheck(a,b):
 for level in ['##','###']:assert len(re.findall('^'+level+' ',a,re.M))==len(re.findall('^'+level+' ',b,re.M))
 pattern=r'tex=\{String\.raw`([^`]+)`\}'
 assert re.findall(pattern,a)==re.findall(pattern,b) and len(re.findall(pattern,a))==1
 assert re.findall(r'<NewsFigure media="([^"]+)"',a)==re.findall(r'<NewsFigure media="([^"]+)"',b)
 assert len(re.findall(r'^\|',a,re.M))==len(re.findall(r'^\|',b,re.M))
 assert not re.search('[가-힣]',b)
 for component in ['NewsFigure','CandidateEquation','BeginnerGuide']:
  tags=re.findall('<'+component+r'\b[^>]*>',b);assert tags and all('lang="en"' in t for t in tags)
 assert 'chatgpt-content-reference' not in a+b
 assert 'draft: false' in a and 'draft: false' in b
rows=[]
for e in E['entries']:
 p=next(x for x in M['pairs'] if x['koSlug']==e['slug']);a=R/'site/content/posts'/p['koFile'];b=R/'site/content/english'/p['enFile']
 assert h(a)==p['sourceSha256'] and h(b)==p['englishSha256'];paircheck(a.read_text(),b.read_text())
 for lang,route in [('ko','posts/'+p['koSlug']),('en','en/posts/'+p['enSlug'])]:
  text=(R/'dist'/route/'index.html').read_text();page=Page(text)
  assert any(t=='html' and x.get('lang')==lang for t,x in page.tags)
  assert 'katex-error' not in text and 'google-adsense-account' not in text and 'pagead2.googlesyndication.com' not in text
  assert re.search(r'<time[^>]*>\s*(?:2026-10-02|Oct 2, 2026)\s*</time>',text)
  ids=[x['data-news-figure'] for t,x in page.tags if 'data-news-figure' in x];assert ids==e['mediaIds']
  cites=[x for t,x in page.tags if 'data-news-citation' in x];assert len(cites)>=10
  for x in cites:
   assert x['href']=='#news-ref-'+x['data-news-citation']
   assert sum(y.get('id')=='news-ref-'+x['data-news-citation'] for t,y in page.tags)==1
  rows.append({'key':e['key'],'language':lang,'figures':len(ids),'citations':len(cites)})
for f in P['assets']:
 b=(R/f['file']).read_bytes();assert b[:8]==b'\x89PNG\r\n\x1a\n';assert hashlib.sha256(b).hexdigest()==f['sha256'];assert struct.unpack('>II',b[16:24])==(f['width'],f['height'])
assert len(P['assets'])==6 and P['publisherOriginals']==2 and P['hypotheticalExamples']==1
example=M['pairs'][-3];a=(R/'site/content/posts'/example['koFile']).read_text();b=(R/'site/content/english'/example['enFile']).read_text()
for mutated in [b.replace('C(P)=','C(X)='),b.replace('oct02-lace-benchmark','unknown-chart'),b+'\n번역 누락']:
 assert mutated!=b
 try:paircheck(a,mutated)
 except AssertionError:pass
 else:raise AssertionError('Broken translation mutation accepted')
assert abs((.323-.172)/.323*100-46.749226)<.00001
assert abs((.883-.651)*100-23.2)<1e-10
assert abs((.6-.2)/(1-.2)-.5)<1e-10
out=R/'english-review/oct02-update';out.mkdir(parents=True,exist_ok=True);(out/'source.json').write_text(json.dumps({'rows':rows,'rejectedMutations':3,'figures':P['assets']},indent=2))
print('oct02-contract: PASS six articles, matched formulas/structure, six image hashes and three negative controls')
''')
write('.github/workflows/oct02-reading.yml','''name: October 2 reading
on:
  pull_request:
    branches: [main]
    paths: ['spaceship-ui/**', '.github/workflows/oct02-reading.yml']
  push:
    branches: [main]
    paths: ['spaceship-ui/**', '.github/workflows/oct02-reading.yml']
permissions:
  contents: read
concurrency:
  group: oct02-reading-${{ github.ref }}
  cancel-in-progress: true
jobs:
  reading:
    runs-on: ubuntu-latest
    timeout-minutes: 12
    defaults:
      run:
        working-directory: spaceship-ui
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v4
        with:
          version: 10.19.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: spaceship-ui/pnpm-lock.yaml
      - run: pnpm install --frozen-lockfile
      - run: sudo apt-get update -qq && sudo apt-get install -y --no-install-recommends fonts-noto-cjk
      - run: pnpm build
      - run: python3 scripts/oct02-contract.py
      - run: node scripts/browser-oct02.mjs
      - name: Record tested source
        if: always()
        run: mkdir -p english-review/oct02-update && git rev-parse HEAD > english-review/oct02-update/tested-sha.txt
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: oct02-reading-${{ github.run_id }}-${{ github.run_attempt }}
          path: spaceship-ui/english-review/oct02-update/
          retention-days: 7
''')
summary={
 'lace':'LLM이 최적화 코드를 한 번에 완성하기보다 검증된 I–O–T–H 인터페이스 안에서 서로 보완하는 휴리스틱을 진화시키는 LACE를 소개합니다. 36개 CO-Bench 평균 점수는 0.945, 기존 최강 LLM 비교법은 0.870, 직접 프롬프트는 0.571입니다. 0.945는 성공 확률이나 실제 비용절감률이 아닙니다.\n\n공식 구현은 40개 문제의 7,109개 시험 사례와 문제당 10개 휴리스틱을 공개합니다. 기존 36문제의 파서·최종 평가기는 재사용하며, 신규 네 문제는 모두 항만 물류 계열입니다. 저장된 포트폴리오 실행과 외부 LLM API로 새 알고리즘을 진화시키는 실험의 재현성을 구분해야 합니다. 전체 해설은 교육용 상보성 예제와 실행·선택 비용, 문제 계약의 한계를 함께 설명합니다.',
 'perturbation':'유전적 교란 예측 모델이 평균 기준선을 넘지 못했다면 모델만의 문제일까요? Nature Biotechnology의 연구는 14개 데이터셋과 18개 지표에서 양성 대조군과 DRF로 평가 지표 자체의 감도를 검사했습니다. 잘 보정된 지표에서 여러 딥러닝 모델이 기준선을 넘을 수 있었습니다.\n\n양성 대조군은 이미 해당 교란의 측정값을 사용하는 평가용 기준이지 새 교란을 예측하는 배포 모델이 아닙니다. Wessels23에서 PRESAGE가 가산 기준선을 넘은 15/18은 지표 개수이며 예측 성공률이 아닙니다. Norman19의 0.63%는 가능한 조합 중 훈련에 들어간 비율입니다. 원논문 도판과 DRF 계산 예제로 설명하며 새 세포 환경·기증자 일반화와 임상적 효과는 별도 문제로 남깁니다.',
 'glassrecon':'유리가 RGB-D 센서에서 결측값이나 뒤 물체의 거리로 보이면 로봇 지도에는 빈 공간이 생길 수 있습니다. GlassRecon은 유리 검출기를 재학습하는 대신 DA3의 구조적 깊이 prior를 센서의 거리 단위에 맞춥니다. 지역 패치에서 후보를 뽑지만 최종 변환은 영상 전체에 적용합니다.\n\n917장 중 Hard 316장의 DA3 AbsRel은 0.323에서 0.172로 낮아졌고 임계 정확도는 0.651에서 0.883으로 올랐습니다. 두 값은 영상 전체 평가 지표이며 유리 픽셀 전용 수치나 실제 로봇 무충돌률이 아닙니다. 논문 v3는 7월23일 공개됐고 IROS2026 채택을 계기로 10월2일 편집안에 선정됐습니다. 기반모델 오인식과 유리가 지배적인 장면의 실패, 지도 경로계획과 실물 주행의 차이를 전체 해설에서 다룹니다.'}
for e in entries:
 write('spaceship-ui/docs/blogger-drafts/2026-10-02/'+e['key']+'.md','# '+e['title']+'\n\n편집일 2026-10-02 · 실제 작성 2026-10-05 · 외부 Blogger 계정에 발행하지 않은 초안.\n\n'+summary[e['key']]+'\n\n한국어: https://jjo-0.github.io/posts/'+e['slug']+'/\n영어: https://jjo-0.github.io/en/posts/'+e['enSlug']+'/\n')
write('spaceship-ui/docs/operations/NEWS_20261002_EDITORIAL.md','''# October 2 edition — source-bounded publication

Editorial date: 2026-10-02. Actual creation and verification: 2026-10-05.
The attached user selection is the editorial basis: LACE 99, perturbation benchmark calibration 97, GlassRecon 96. These are supplied editorial scores, not measured scientific quality, independently recomputed scores, or official awards. This task did not repeat the claimed 24-item/72-hour discovery scan.

## Preserved and clarified evidence

LACE: 0.945/0.870/0.571 are reported benchmark scores, not probabilities or cost savings. Existing 36-problem parsers and scoring oracle are adopted; Supplementary Note 4.4 distinguishes generated output/tools/heuristics. A smoke test is not a formal proof of semantic correctness. The four novel problems are all port logistics. Public main-paper access was limited to abstract/preview; the accessible supplement and official implementation were checked. No LLM evolution or full benchmark run was performed.

Perturbation: 14 datasets and 18 metrics; positive controls use measured perturbation information and are not deployable unseen-condition predictors. DRF is metric calibration, not a model-success fraction. Norman19 0.63% and Wessels23 10.3% concern training combination coverage. PRESAGE 15/18 concerns metrics, not independent trials. Unseen context remains untested. Publication-time Shift Bioscience/Xaira disclosures and separate model licensing remain explicit.

GlassRecon: arXiv v3 is dated 2026-07-23; author-reported IROS 2026 acceptance does not establish an award. Local sampling selects one global affine transform. Table I evaluates the whole image, not only glass. Ground truth uses planar geometric annotation and excludes unannotatable areas. Mapping and occupancy-grid planning do not constitute repeated physical collision-free robot trials. Sources include full HTML/PDF and public project/code README.

## Images

Two unchanged original perturbation figures are reproduced under the article's CC BY 4.0, with no conflicting figure credit found. Three charts replot reported scalar values and one chart is explicitly hypothetical. LACE publisher-exclusive figures and GlassRecon figures without confirmed redistribution rights were not copied. Their public availability is not treated as reuse permission. Image hashes, dimensions, URLs and roles are recorded in the edition provenance file. Original educational chart rights follow the existing site copyright policy; no new blanket license is granted.

## Publication and testing scope

Six complete Korean/English articles preserve matched headings, tables, equations, source order and limitations. Existing original articles, images, reader components, citation runtime, budgets and advertising configuration are unchanged. New Korean article routes are ad-free like their English counterparts. Tests check source hashes, formula identity, rendered citation targets, image hashes, native disclosure/anchor input, mobile/desktop light/dark reading, English archives/search/RSS and existing mobile behavior. Three deliberately broken translations are rejected. Candidate success, exact PR-head success and actual Pages publication are separate gates; source commits alone are not deployment evidence.

Blogger summaries are three unposted drafts. No clinical, wet-lab, physical robot or algorithm-discovery reproduction is claimed. Unrelated Ezekiel and other unfinished tasks are not included in this completion scope.
''')
# Every preserved blob is hashed from the actual assembled candidate.
out=R.parent/'oct02-receipt';out.mkdir(exist_ok=True)
rows=[]
for path in sorted(changed):
 b=(R/path).read_bytes();rows.append({'path':path,'mode':'100644','type':'blob','sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'sha256':hashlib.sha256(b).hexdigest()})
(out/'assembly.json').write_text(json.dumps({'sourceCommit':SOURCE,'files':rows},indent=2))
print('October 2 candidate assembled:',len(rows),'files; original article bytes unchanged')

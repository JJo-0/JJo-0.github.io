from pathlib import Path
import json,hashlib,subprocess,re,fitz,yaml
R=Path.cwd();A=R/'spaceship-ui';INPUT=R.parent/'input';OUT=R.parent/'oct03-receipt';OUT.mkdir(exist_ok=True)
SOURCE='08d3e94f1066006bfa503db251dde68b41eaad99'
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==SOURCE
changed=set()
def write(p,s):
 f=R/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(s);changed.add(p)
def put(p,obj):write(p,json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def patch(p,old,new):
 s=(R/p).read_text();assert s.count(old)==1,(p,old);write(p,s.replace(old,new))
def sha(b):return hashlib.sha256(b).hexdigest()
def front(p):return yaml.safe_load(p.read_text().split('---',2)[1])
entries=[];assets=[]
config=[
 ('ltri','2026-10-03-ai-nanocrystal-photovoltaics-news','ai-nanocrystal-photovoltaics',[1,4],98,'s41467-026-78268-4','accepted early version'),
 ('mccv','2026-10-03-mccv-regulatory-variant-mapping-news','mccv-regulatory-variant-mapping',[1,4],97,'s41588-026-02776-8','Version of Record'),
 ('paml','2026-10-03-paml-chemoresistant-cell-risk-news','paml-chemoresistant-cell-risk',[2,3],96,'s41467-026-78283-5','accepted early version')]
figures=[
 ('ltri',1,'document-1.pdf',2,[39,322,563,684],2096,1448,'4e91d6aaba173a86aa1a04f2cd6def678abef9c8b60ab484cd139cc8f962a527','06698c7cca8a31f30c635a0f0370a1453e2caa5ba8b020f41334fef538f9edce'),
 ('ltri',4,'document-1.pdf',6,[100,45,505,367],1620,1288,'9d626965c478826450e41c0036c0465d3b54d7645a8d453969f63e1ade4ac17c','06698c7cca8a31f30c635a0f0370a1453e2caa5ba8b020f41334fef538f9edce'),
 ('mccv',1,'document-0.pdf',2,[39,48,563,561],2096,2052,'9c1ebd429ab16b09b9593697c78946afc609879bca1cfde841a3eb5d82265fca','3d65ccc10af5aa99403a3e29120e21e174ff9929a9c047ff599c2e00d515376d'),
 ('mccv',4,'document-0.pdf',7,[39,48,563,432],2096,1536,'fa2e9d478ae0db96678a8964fce47ba7f85b0e0922f76f74897c086417cf1089','3d65ccc10af5aa99403a3e29120e21e174ff9929a9c047ff599c2e00d515376d'),
 ('paml',2,'document-1.pdf',4,[39,43,563,555],2096,2048,'55367ba18b837f74961ed189f9b19bc0eb8d00a8537cba7ddba927a433c8327f','99a68c22ae994f0edfa03de3600533f02f669d36f56e9e3240690c61419efc55'),
 ('paml',3,'document-1.pdf',6,[39,43,563,505],2096,1848,'9b4258fab6dfe1ac34bda9d088d2667811b8128dfe6d05a5adb20098c3bb9313','99a68c22ae994f0edfa03de3600533f02f669d36f56e9e3240690c61419efc55')]
captions={
 'ltri1':('로봇 합성·광발광 측정과 가상 조성 예측을 연결한 LTRI 원논문 그림','c 왼쪽은 109개와 추가45개 실험, 오른쪽은 약16,000개 가상 예측이다. d는20개 반응의 별도 대조다. 예측한 것은 PL peak/FWHM이며 태양전지 PCE를 직접 학습한 그림이 아니다.','LTRI robotic synthesis, optical measurements and virtual formulation predictions','In c, the left contains 109 initial and 45 additional experiments; the right contains approximately 16,000 predictions. Panel d validates 20 reactions. The predicted targets are PL peak/FWHM, not solar-cell PCE.'),
 'ltri4':('LTRI 소자의 전류 전압 곡선과 발전 중·열 안정성 전체 패널','a–f는 단면·효율·소자 분포·1 L 재료 결과다. g는1-sun MPP 운전1,000시간 약85% 유지, h는65°C 어두운 곳800시간75.3% 유지다. 보충그림23의 상온 보관90% 초과와 구분한다.','LTRI device performance, operational MPP tracking and thermal stability','Panels a–f cover cross section, device efficiency and distributions, including 1 L material. Panel g reports about 85% retention after 1,000 h of one-sun MPP operation; h reports 75.3% after 800 h at 65°C in darkness. These differ from ambient storage in Supplementary Figure 23.'),
 'mccv1':('MCCv의 대립유전자별 짧은 염색질 구조와 긴 거리 유전자 연결','a·b는 플랫폼, c·d는 서열 좌표의 접촉 지도이며 현미경 사진이 아니다. e는 먼 접촉, f는 위상 연결, g는 ZEB1과 ZNF438의 발현 비교다. single-allele를 single-cell로 바꾸어 읽지 않는다.','MCCv allele-specific local architecture and distant regulatory connections','Panels a and b show the platform; c and d are sequencing-derived contact maps, not microscopy. Panel e shows distant contacts, f phasing and g expression differences for ZEB1 and ZNF438. Single-allele is not synonymous with single-cell.'),
 'mccv4':('위험 대립유전자의 neo-CTCF 모티프와 국소·장거리 접촉 변화','rs4409785에서 a는 질병 연관, b는 모티프, c는 국소 구조, d·e는 CTCF 및 접근성, f는 장거리 접촉이다. 새 결합 자리의 증가가 모든 표적 유전자 발현의 증가를 뜻하지 않는다.','A neo-CTCF motif and altered local and long-range contacts at a risk allele','At rs4409785, a shows disease associations, b the motif, c local architecture, d/e binding and accessibility, and f longer-range contacts. Gaining a binding site does not imply increased expression of every nearby gene.'),
 'paml2':('소아 AML의 진단과 재발 사이 세포 집단 비중 및 전사체 궤적','A·B는 환자별 진단D와 재발R의 집단 변화다. 점선은 개별 세포를 촬영한 궤적이 아니다. C는 집단간 재발 시간의 비유의 차이, D는 추정한 상태 연결을 보여준다.','Pediatric AML population abundance and transcriptomic trajectories between diagnosis and relapse','Panels A/B compare population abundance at diagnosis D and relapse R. Dashed lines do not track filmed individual cells. Panel C shows a nonsignificant group difference in time to relapse, and D inferred state trajectories.'),
 'paml3':('내성 후보 집단과 MRD 유전 위험을 나눈 전체생존 OS 비교','세로축은 EFS가 아니라 OS다. A·C는 AAML1031의829명, B·D는 AML08+AAML0531의263명 분석이다. 모든 비교가 유의한 것은 아니며 이식 효과를 무작위 배정해 측정한 결과가 아니다.','Overall survival by inferred resistance, MRD and genetic risk','The vertical axis is OS, not EFS. A/C use an AAML1031 analysis population of 829; B/D use 263 from AML08+AAML0531. Not every displayed comparison is significant, and these are not randomized estimates of transplant benefit.')}
media=json.loads((A/'site/news-media.json').read_text());enmedia=json.loads((A/'site/news-media-en.json').read_text());edition=json.loads((A/'site/english-edition.json').read_text())
for order,(key,ko,en,nums,score,article,version) in enumerate(config,1):
 kp=A/'site/content/posts'/f'{ko}.mdx';ep=A/'site/content/english'/f'en-{en}.mdx';k=front(kp);e=front(ep)
 assert k['draft'] is False and e['draft'] is False
 assert not any(x['koSlug']==ko or x['enSlug']==en for x in edition['pairs'])
 pair={'key':e['translationKey'],'koSlug':ko,'enSlug':en,'koFile':kp.name,'enFile':ep.name,'sourceSha256':sha(kp.read_bytes()),'englishSha256':sha(ep.read_bytes()),'sourceCommit':SOURCE,'scope':'full-article'}
 edition['pairs'].append(pair)
 entries.append({'key':key,'slug':ko,'enSlug':en,'title':k['title'],'order':order,'mediaIds':[f'oct03-{key}-fig{n}' for n in nums],'doi':'10.1038/'+article,'sourcePublished':'2026-10-02','sourceVersion':version,'providedEditorialScore':score,'scoreOrigin':'user-supplied editorial ranking, not independently rescored','evidenceGrade':'PEER_REVIEWED_FRONTIER','sourceSha256':pair['sourceSha256'],'englishSha256':pair['englishSha256']})
 for fk,n,file,page,clip,width,height,imagehash,pdfhash in figures:
  if fk!=key:continue
  b=(INPUT/key/file).read_bytes();assert sha(b)==pdfhash
  doc=fitz.open(stream=b,filetype='pdf');pix=doc[page-1].get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(clip),alpha=False);png=pix.tobytes('png');assert sha(png)==imagehash and (pix.width,pix.height)==(width,height)
  src=f'/assets/posts/news-20261003/{key}-fig-{n}.png';p=A/'site/assets'/src.lstrip('/');p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(png);changed.add(str(p.relative_to(R)))
  mid=f'oct03-{key}-fig{n}';assert mid not in media and mid not in enmedia
  alt,cap,ealt,ecap=captions[key+str(n)];lic='CC BY 4.0' if key=='mccv' else 'CC BY-NC-ND 4.0';rights='https://creativecommons.org/licenses/'+('by' if key=='mccv' else 'by-nc-nd')+'/4.0/'
  url='https://www.nature.com/articles/'+article+('.pdf' if key=='mccv' else '_reference.pdf')
  credit=({'ltri':'Zhao et al. · Nature Communications','mccv':'Hamley et al. · Nature Genetics','paml':'NajafPanah et al. · Nature Communications'}[key])+f' · Figure {n}'
  media[mid]={'slug':ko,'order':order,'src':src,'width':width,'height':height,'alt':alt,'kind':f'원 논문 Figure {n}','caption':cap,'credit':credit,'source':url+f'#page={page}','rights':rights,'license':lic,'changes':'원도판 전체 패널·축·주석·색상을 유지한 PNG 형식 변환. 주변 본문과 여백만 제외; 도판 재작성·반전 없음.','checkedAt':'2026-10-05','sha256':imagehash}
  enmedia[mid]={'alt':ealt,'kind':f'Original Figure {n}','caption':ecap,'credit':credit,'changes':'PNG format conversion preserves all original panels, axes, annotations and colors. Surrounding article text is excluded; no redraw or color inversion.'}
  assets.append({'id':mid,'src':src,'pdf':url,'pdfSha256':pdfhash,'page':page,'cropPoints':clip,'pixelsPerPoint':4,'renderer':fitz.VersionBind,'width':width,'height':height,'sha256':imagehash,'reviewedImageSha256':imagehash,'license':lic,'rights':rights})
put('spaceship-ui/site/news-media.json',media);put('spaceship-ui/site/news-media-en.json',enmedia);put('spaceship-ui/site/english-edition.json',edition)
put('spaceship-ui/site/news-edition-20261003.json',{'date':'2026-10-03','updatedOn':'2026-10-05','sourceCommit':SOURCE,'selectionRecord':'Supplied ranking and Saturday override retained; no independent 24-item/72-hour discovery scan claimed.','entries':entries})
put('spaceship-ui/site/news-media-provenance-20261003.json',{'checkedAt':'2026-10-05','assets':assets})
patch('scripts/normalize_tags_current.py','if __name__ == "__main__":',"POST_TAXONOMY.update({\n"+''.join(f"    {front(A/'site/content/posts'/(e['slug']+'.mdx'))['slug']+'.mdx'!r}: Taxonomy({front(A/'site/content/posts'/(e['slug']+'.mdx'))['category']!r}, {front(A/'site/content/posts'/(e['slug']+'.mdx'))['subcategory']!r}, 'paper-review', {tuple(front(A/'site/content/posts'/(e['slug']+'.mdx'))['tags'])!r}),\n" for e in entries)+"})\n\nif __name__ == \"__main__\":")
patch('spaceship-ui/src/pages/posts/[...slug]/index.astro',"import sep25 from '../../../../site/news-edition-20260925.json';","import sep25 from '../../../../site/news-edition-20260925.json';\nimport oct03 from '../../../../site/news-edition-20261003.json';")
patch('spaceship-ui/src/pages/posts/[...slug]/index.astro','adsEnabled={!sep25.entries.some','adsEnabled={!oct03.entries.some((entry) => entry.slug === effectiveSlug) && !sep25.entries.some')
patch('spaceship-ui/scripts/browser-news-media-audit.mjs','  const declaredEntries = [',"  const oct03 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20261003.json', import.meta.url), 'utf8'));\n  const declaredEntries = [\n    ...oct03.entries,")
write('spaceship-ui/scripts/oct03-contract.py',r'''import hashlib,json,re,struct
from pathlib import Path
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1]
E=json.loads((R/'site/news-edition-20261003.json').read_text())
P=json.loads((R/'site/news-media-provenance-20261003.json').read_text())
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.tags=[];self.feed(s)
 def handle_starttag(self,t,attrs):self.tags.append((t,dict(attrs)))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def checkpage(html,e,lang):
 p=Page(html)
 assert any(t=='html' and a.get('lang')==lang for t,a in p.tags)
 assert re.search(r'<time[^>]*>\s*(?:2026-10-03|Oct 3, 2026)\s*</time>',html)
 assert 'google-adsense-account' not in html and 'pagead2.googlesyndication.com' not in html
 assert 'katex-error' not in html
 assert [a['data-news-figure'] for t,a in p.tags if 'data-news-figure' in a]==e['mediaIds']
 refs=[a for t,a in p.tags if a.get('id','').startswith('news-ref-')];assert len(refs)==2
 cites=[a for t,a in p.tags if t=='a' and 'data-news-citation' in a];assert len(cites)>=8
 for a in cites:assert a['href']=='#news-ref-'+a['data-news-citation'] and sum(b.get('id')==a['href'][1:] for t,b in p.tags)==1
 equations=[a['data-candidate-equation'] for t,a in p.tags if 'data-candidate-equation' in a]
 assert len(equations)==(2 if e['key']=='ltri' else 1) and len(set(equations))==len(equations)
 assert sum('data-beginner-guide' in a for t,a in p.tags)==1
 return {'citations':len(cites),'equations':len(equations),'figures':2}
assert E['date']=='2026-10-03' and [x['key'] for x in E['entries']]==['ltri','mccv','paml']
assert len(P['assets'])==6
for a in P['assets']:
 b=(R/'site/assets'/a['src'].lstrip('/')).read_bytes();assert hashlib.sha256(b).hexdigest()==a['sha256']==a['reviewedImageSha256']
 assert b[:8]==b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',b[16:24])==(a['width'],a['height'])
rows=[]
for e in E['entries']:
 ko=R/'site/content/posts'/(e['slug']+'.mdx');en=R/'site/content/english'/('en-'+e['enSlug']+'.mdx')
 assert digest(ko)==e['sourceSha256'] and digest(en)==e['englishSha256']
 a,b=ko.read_text(),en.read_text()
 assert len(re.findall(r'^## ',a,re.M))==len(re.findall(r'^## ',b,re.M))==8
 assert len(re.findall(r'^### ',a,re.M))==len(re.findall(r'^### ',b,re.M))==2
 assert re.findall(r'tex=\{String.raw`([^`]+)`\}',a)==re.findall(r'tex=\{String.raw`([^`]+)`\}',b)
 assert re.findall(r'<NewsFigure media="([^"]+)"',a)==re.findall(r'<NewsFigure media="([^"]+)"',b)==e['mediaIds']
 if e['key']=='ltri':
  for token in ['85%','75.3%','800 h','industry-scale','laboratory-scale','19.37%','18.87%','0.91','0.87']:assert token in b
 elif e['key']=='mccv':
  for token in ['405','241','251','Nucleome Therapeutics','academic use','Single-allele and single-cell']:assert token in b
 else:
  for token in ['post-induction','retrospective','33','38%','27%','OS','EFS','not a prospective']:assert token in b
 for lang,path in [('ko','posts/'+e['slug']),('en','en/posts/'+e['enSlug'])]:
  html=(R/'dist'/path/'index.html').read_text();rows.append({'key':e['key'],'lang':lang,**checkpage(html,e,lang)})
# Reject malformed public output using the same validator, not only hashes.
e=E['entries'][0];html=(R/'dist/posts'/e['slug']/'index.html').read_text()
for bad in [html.replace('id="news-ref-1"','id="lost-reference"'),html.replace('oct03-ltri-fig1','lost-figure'),html+'<meta name="google-adsense-account">']:
 assert bad!=html
 try:checkpage(bad,e,'ko')
 except AssertionError:pass
 else:raise AssertionError('Invalid page accepted')
assert abs(27/290.25-0.093)<0.001
out=R/'oct03-review';out.mkdir(exist_ok=True);(out/'static.json').write_text(json.dumps({'passed':True,'rows':rows,'originals':6,'rejectedMutations':3},indent=2))
print('oct03-contract: PASS '+json.dumps(rows))
''')
write('spaceship-ui/scripts/browser-oct03.mjs',r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Cdp,BASE,attach,evaluate,navigate,viewport,waitExpression,startPreview,startChrome,stopChild,removeProfile} from './browser-smoke-harness.mjs';
const edition=JSON.parse(fs.readFileSync(new URL('../site/news-edition-20261003.json',import.meta.url),'utf8'));
const media=JSON.parse(fs.readFileSync(new URL('../site/news-media.json',import.meta.url),'utf8'));
const out='oct03-review';fs.mkdirSync(out,{recursive:true});let preview,chrome,cdp,sessionId;const rows=[];
const timer=setTimeout(()=>{console.error('oct03 browser timed out');process.exit(1)},180_000);
async function enter(selector){
 await evaluate(cdp,sessionId,`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw new Error('Missing input target');el.scrollIntoView({block:'center',behavior:'instant'});el.focus()})()`);
 await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13},sessionId);
 await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
}
async function shot(name){const {data}=await cdp.send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${out}/${name}.png`,Buffer.from(data,'base64'));}
try{
 preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
 for(const width of [390,1440]){
  await viewport(cdp,sessionId,{width,height:900,mobile:width===390,touch:width===390,reduced:false});
  for(const lang of ['ko','en']){
   await navigate(cdp,sessionId,lang==='ko'?'/news/':'/en/news/');
   const expected=edition.entries.map(e=>lang==='ko'?e.slug:e.enSlug);
   const selector=lang==='ko'?'[data-news-card]':'[data-english-card]';const attr=lang==='ko'?'data-news-card':'data-english-card';
   const actual=await evaluate(cdp,sessionId,`[...document.querySelectorAll(${JSON.stringify(selector)})].map(e=>e.getAttribute(${JSON.stringify(attr)})).filter(s=>${JSON.stringify(expected)}.includes(s))`);
   assert.deepEqual(actual,expected,'Same date editorial order');
   for(const e of edition.entries){
    const path=lang==='ko'?`/posts/${e.slug}/`:`/en/posts/${e.enSlug}/`;
    assert.equal((await fetch(new URL(path,BASE))).status,200);await navigate(cdp,sessionId,path);
    const details=await evaluate(cdp,sessionId,`[...document.querySelectorAll('article details[data-beginner-guide],article details[data-candidate-equation]')].map(el=>el.hasAttribute('data-beginner-guide')?'article [data-beginner-guide] summary':'article [data-candidate-equation="'+el.dataset.candidateEquation+'"] summary')`);
    assert.equal(details.length,e.key==='ltri'?3:2);
    for(const selector of details){await enter(selector);await waitExpression(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).closest('details').open`,'native explanation expands');}
    for(const dark of [false,true]){
     await evaluate(cdp,sessionId,`document.documentElement.classList.toggle('dark',${dark})`);
     const state=await evaluate(cdp,sessionId,`({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth+2,mathErrors:document.querySelectorAll('.katex-error').length,ads:!!document.querySelector('meta[name="google-adsense-account"]'),korean:/[가-힣]/.test(document.querySelector('article').innerText)})`);
     assert.equal(state.lang,lang);assert(!state.overflow&&!state.mathErrors&&!state.ads,JSON.stringify(state));if(lang==='en')assert(!state.korean);
    }
    await evaluate(cdp,sessionId,`document.documentElement.classList.remove('dark')`);
    for(const id of e.mediaIds){
     const selector=`article [data-news-figure="${id}"] img`;
     await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
     const state=await waitExpression(cdp,sessionId,`(()=>{const i=document.querySelector(${JSON.stringify(selector)});if(!i.complete||!i.naturalWidth)return null;return {width:i.naturalWidth,height:i.naturalHeight,src:i.getAttribute('src'),href:i.closest('figure').querySelector('a').getAttribute('href')}})()`,'original image decode');
     assert.equal(state.width,media[id].width);assert.equal(state.height,media[id].height);assert.equal(state.src,media[id].src);assert.equal(state.href,media[id].src);
     if(width===390&&id===e.mediaIds[0])await shot(`${e.key}-${lang}-figure-mobile`);
    }
    if(width===390){await evaluate(cdp,sessionId,`document.querySelector('article [data-candidate-equation]').scrollIntoView({block:'center',behavior:'instant'})`);await shot(`${e.key}-${lang}-explanation-mobile`);}
    const other=lang==='ko'?`/en/posts/${e.enSlug}/`:`/posts/${e.slug}/`;
    assert.equal(await evaluate(cdp,sessionId,`document.querySelector('header a[data-locale-choice="${lang==='ko'?'en':'ko'}"]').getAttribute('href')`),other);
    const history=await cdp.send('Page.getNavigationHistory',{},sessionId);const entry=history.entries[history.currentIndex].id;
    await enter('article a[data-news-citation="1"]');await waitExpression(cdp,sessionId,`location.pathname===${JSON.stringify(path)}&&location.hash==='#news-ref-1'`,'same document citation');
    await cdp.send('Page.navigateToHistoryEntry',{entryId:entry},sessionId);await waitExpression(cdp,sessionId,`location.pathname===${JSON.stringify(path)}&&location.hash===''`,'native Back');
    rows.push({key:e.key,lang,width,themes:2,originals:2,explanations:details.length,citationBack:true});console.log('oct03-browser PASS '+JSON.stringify(rows.at(-1)));
   }
  }
 }
 assert.equal(rows.length,12);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,rows},null,2));
}catch(error){console.error(error);fs.writeFileSync(`${out}/failure.json`,JSON.stringify({error:String(error),rows},null,2));if(cdp&&sessionId)await shot('failure').catch(()=>{});process.exitCode=1;}
finally{cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(timer);process.exit(process.exitCode||0);}
''')
write('.github/workflows/oct03-reading.yml','''name: October 3 reading
on:
  pull_request:
    branches: [main]
    paths: ['spaceship-ui/**', '.github/workflows/oct03-reading.yml']
  push:
    branches: [main]
    paths: ['spaceship-ui/**', '.github/workflows/oct03-reading.yml']
permissions:
  contents: read
concurrency:
  group: oct03-reading-${{ github.ref }}
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
      - run: python3 scripts/oct03-contract.py
      - run: node scripts/browser-oct03.mjs
      - name: Preserve tested source
        if: always()
        run: mkdir -p oct03-review && git rev-parse HEAD > oct03-review/tested-sha.txt
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: oct03-reading-${{ github.run_id }}-${{ github.run_attempt }}
          path: spaceship-ui/oct03-review/
          retention-days: 7
''')
write('spaceship-ui/docs/operations/NEWS_20261003_EDITORIAL.md','''# October 3, 2026 — editorial and verification record

Edition date: 2026-10-03. Drafting, primary-source recheck and publication work: 2026-10-05. Supplied ranking LTRI98/MCCv97/pAML96 and the Saturday override are editorial judgments, not scientific probabilities or an independently repeated 24-item/72-hour scan. The three nominated papers were verified; other editions and unfinished October2 work are not marked completed.

## Supplied draft versus publisher evidence

1. LTRI: the supplied >90%/1000h ambient-storage statement is preserved. The accepted paper additionally contains Figure4g one-sun MPP operation at about40C with a gold top electrode, about85% retention at1000h, and Figure4h dark65C testing,75.3% retention at800h. The explainer must not claim that operational testing was absent. SI Table4 uses laboratory prices for HI/small LTRI but industrial prices for Flow-LTRI. The2.16USD/g estimate is not audited factory COGS. ML targets PL peak/FWHM, with the R2 comparison based on20 validation reactions, not PCE.
2. MCCv: the supplied405-target summary is clarified as405 cis-regulatory elements, with phased tracks at241 heterozygous sites across3 donors, and251 nominated genes rather than251 fully established therapeutic targets. Single-allele is not single-cell. The supplied unverified-interest field is updated from the paper's Nucleome patent/license/company-role and other disclosed interests. Some software has academic-use terms rather than unrestricted public licensing.
3. pAML: discovery includes33 unique patients, not13+22 independent people; two are reprofiled. Resistance categories are inferred, not direct lineage tracking. Genetic risk and post-induction MRD accompany diagnostic information. Figure3 is OS, whereas38%/27% are EFS text/supplement findings. Retrospective prognosis, transcriptomic changes, viability in selected PDX experiments and prospective clinical treatment benefit remain distinct.

Publisher versions: LTRI and pAML accepted peer-reviewed early versions dated2026-10-02; MCCv Version of Record dated2026-10-02. Recheck on2026-10-05. No independent synthesis, full sequencing realignment, patient-level model refit, clinical recommendation or experimental replication.

## Figures

Six complete original figure regions were visually reviewed, preserving panels, axes, labels and colors. The first pAML Figure3 draft crop omitted the left edge; it was corrected before publication and the final full crop checked. Exact publisher-PDF SHA256, page, crop, renderer and reviewed PNG SHA256 are in site/news-media-provenance-20261003.json. LTRI/pAML CC BY-NC-ND4.0; MCCv CC BY4.0. New Korean and English articles are ad-free; global advertising settings are unchanged. No separate permission beyond the published licenses is claimed.

## Content and runtime

Six complete blog explainers share heading structure, equations, figure order and evidence boundaries. The English text is a translation of this original blog commentary, not a full translation of the papers. Korean taxonomy uses the site's existing Finance/Industry and Health/Lifestyle categories; subject-specific subcategories retain photovoltaics, regulatory genomics and pediatric leukemia. Existing prose and image bytes are unchanged.

Source hashes, rendering, references, figure dimensions, native disclosure controls, two themes and mobile/desktop layouts are checked separately from factual editorial review. No test bypass, unconditional retry or weakened performance budget is part of this edition. Final PR-head CI and actual deployment must be recorded separately from candidate preview checks. Temporary generation/evidence workers must not enter the production tree.
''')
summaries={
'ltri':'AI가 태양전지 소재의 최고 효율만 높인 것이 아니라 만드는 공정을 연결한 연구입니다. 상온 LTRI 합성, 로봇 실험154개 유효 자료와 광학특성 모델, 약16,000개 가상 조성,1 L 유동 합성과 실제 소자를 연결했습니다. 최고 PCE는19.37%,1 L 재료 최고는18.87%입니다.\n\n계산비용2.16달러/g는 재료·정제·노무의 가정에 따른 값이지 감사된 공장원가가 아닙니다. 모델은 PCE가 아니라 PL peak/FWHM을 예측했습니다. 안정성도 나눠 봅니다. 상온 보관1,000시간90% 초과 유지 외에, 원논문은 빛 아래 MPP1,000시간 약85%,65°C 어두운 곳800시간75.3% 유지도 보고합니다. 작은 소자 시험을 야외 모듈 수명이나 전체 인증으로 확대하지 않습니다.\n\n원도판과 계산 과정을 통해 AI 실험 최적화가 제조공정으로 이어진 지점, 비용 경계와 다음 검증을 설명했습니다.',
'mccv':'질병과 연결된 DNA 변이를 찾았어도 어느 유전자가 영향을 받는지 곧바로 알 수는 없습니다. MCCv는 같은 세포 집단에서 대립유전자별 짧은 염색질 접촉과 먼 유전자 연결을 함께 읽습니다.405개 조절 요소를 조사하고, 세 기증자의241개 이형접합 위치에서 위상별 분석을 수행했습니다.251개 유전자는 후보 표적이지 모두 인과성이 검증된 치료 표적은 아닙니다.\n\nSESN3 사례에서는 새 CTCF 결합 자리가 다른 조절 연결을 줄이는 기전과 세포·동물 실험을 연결합니다. 사람에게 적용할 약물이나 식이 치료가 입증된 것은 아닙니다. 원문의 Nucleome 관련 회사·특허·라이선스 등 이해관계와 일부 코드의 학술 사용 조건도 표시했습니다.\n\nsingle-allele와 single-cell, 접촉과 발현, 표적 후보와 확정된 인과관계를 구분하는 해설입니다.',
'paml':'소아 AML의 진단 표본에는 서로 다른 세포 상태가 섞여 있습니다. 연구진은33명의 진단–재발 단일세포 자료로 내성 후보 집단을 추정하고, 기존 유전 위험과 유도치료 후 MRD를 결합해 후향 자료의 예후 구분을 개선했습니다. 진단 당일 검사 하나로 모든 재발을 확정한 연구는 아닙니다.\n\n논문은 기존 이식 배정에서 놓칠 수 있는 고위험 하위집단의5년 EFS가40% 미만이라고 보고합니다. EFS는 전체생존OS와 다르므로 이를 사망률로 바로 바꾸면 안 됩니다. 원도판 Figure3은OS를 보여줍니다. RNA 상태 변화도 세포 사멸과 같지 않으며 일부 PDX 약물 반응은 전임상 증거입니다.\n\n위험 예측이 좋아졌다는 것과 새 분류로 치료를 배정해 실제 환자의 생존이 나아졌다는 것은 별개입니다. 개인의 이식·약물 결정을 권하는 글이 아니라 발견·검증·임상효용의 경계를 설명하는 연구 해설입니다.'}
for e in entries:
 write('spaceship-ui/docs/blogger-drafts/2026-10-03/'+e['key']+'.md','# '+e['title']+'\n\n편집일:2026-10-03 · 원문 확인:2026-10-05\n상태:Blogger 미발행 초안\n\n'+summaries[e['key']]+'\n\n[전체 해설](https://jjo-0.github.io/posts/'+e['slug']+'/) · [원논문](https://www.nature.com/articles/'+e['doi'].split('/')[-1]+')\n')
# Include the six immutable authored files in the receipt without rewriting them.
for e in entries:
 changed.add('spaceship-ui/site/content/posts/'+e['slug']+'.mdx');changed.add('spaceship-ui/site/content/english/en-'+e['enSlug']+'.mdx')
rows=[]
for name in sorted(changed):
 b=(R/name).read_bytes();rows.append({'path':name,'mode':'100644','type':'blob','sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'sha256':sha(b),'bytes':len(b)})
(OUT/'manifest.json').write_text(json.dumps({'base':'99a2e79f58d95f7a0ca31a13b767f84928bb1732','sourceCommit':SOURCE,'files':rows},ensure_ascii=False,indent=2))
print('October3 candidate assembled:',len(rows),'files; original authored MDX and existing posts unchanged')

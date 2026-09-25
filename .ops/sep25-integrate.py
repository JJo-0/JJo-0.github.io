from pathlib import Path
import hashlib,json,re,subprocess,yaml
R=Path.cwd();A=R/'spaceship-ui';SOURCE='ffd6a8188d9344a75996d48b8750a5fce857d57c'
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==SOURCE
changed=[]
def write(p,s):
 f=R/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(s);changed.append(p)
def put(p,j):write(p,json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def patch(p,a,b):
 f=R/p;s=f.read_text();assert s.count(a)==1,(p,a);write(p,s.replace(a,b))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def front(p):return yaml.safe_load(p.read_text().split('---',2)[1])
config=[
 ('soec','2026-09-25-soec-stack-operational-control-news','soec-stack-operational-control',[1,2],'6aafc34d5bfb1f89ad78db3edda3a2b5baf296b43e749b9b2906c0781f923304','03eda31537df7e13dd317c24626c205553e02c714e7215200d82dd5815068138',98,'2026-09-24','s41467-026-78001-1'),
 ('galleri','2026-09-25-nhs-galleri-screening-performance-news','nhs-galleri-screening-performance',[1,3],'e4ed5bf7ebfcc8f7317ccd3f4f3204e817ad9887b940326c68b0f49a1ee3296b','a1d14733ee71043c68e256b2e52f9ba34d160775f5f562585aa6c483da288490',95,'2026-09-22','s41591-026-04652-8'),
 ('sparrow','2026-09-25-npu-sparrow-wing-tail-coordination-news','npu-sparrow-wing-tail-coordination',[2,6],'e4b4e376580730d52f7cf178ac4bed97c6bec1cf3b8c8939f0017fafcaa9268e','4d40177f02b9286f482d05a05f7bbdfcd8ceb32a8f49cabc83898de0a1d34696',94,'2026-09-24','s41467-026-78005-x')]
figures=[
 ('soec',1,3,[39,43,562,335],2092,1168,'86f2c9118a6d464350bf74492f288b4cf92264399c4980cc59a9e6344bc8ac6b'),
 ('soec',2,4,[39,43,562,245],2092,808,'1bb315f5838b300c808e34795bd46a63f5bdd8e88f7758dd4bc2e2b09c22dad2'),
 ('galleri',1,2,[75,43,523,350],1792,1228,'1d61e617951560f1e4afeb131a1e32a49128272d595bda4609c1b54452bf5e8c'),
 ('galleri',3,7,[34,47,564,466],2120,1676,'5c1b470f965e6a2e267829d321c84590ca10dc6cd30ae137510c193a82ea7c17'),
 ('sparrow',2,3,[90,44,509,351],1676,1228,'b1fc37776fcf4cdca36d3aef9950779568ea756453417da3ca5466db3c250fe3'),
 ('sparrow',6,9,[40,44,562,471],2088,1708,'dba2cf1e672a734d57d33b7f4b3f6ccd3fd5af592556c7c345f2124f675c8069')]
pdfsha={'soec':'e09c9c474b27bd0d20278c593cfec22a70095f7ae0773b5c0f294e3b9e8070c1','galleri':'079ef502fe4f68c3e3794b5e1eb473cac6bc9d50071954c1cecc34d91fbb8dd9','sparrow':'4412f84c29f734a00f4a3c8d9224eaaf18611d7d6b775fdb04ff0aa53fa434f1'}
ko_captions={
 'soec-1':('70셀 SOEC 구조와 AC:DC 운전 개념 및 초기·장기 전압 이력','a는 스택과 셀 구조, b는 전기분해·연료전지 방향의 전환 개념, c는 초기 DC 구간, d는 장기 전압과 온도다. c와 d의 전압 축 범위가 다르므로 보이는 기울기만 비교하지 않는다. 0.05%/kh는 후반 22,268시간 구간의 값이다.'),
 'soec-2':('셀 그룹별 임피던스와 시간에 따른 저항 성분 변화','a는 셀 그룹과 Nyquist 응답, b는 완화시간 분포, c는 등가회로와 적합, d는 저항 성분의 시간 변화다. 전압 이외의 안정화 근거를 제공하지만 각 저항을 하나의 손상 원인에 자동 대응시키지는 않는다.'),
 'galleri-1':('NHS-Galleri 중재군의 회차별 분석 대상 선정 흐름','원논문 Figure 1은 무작위 배정 이후 중재군의 임상 적격성·평가 가능성 및 회차별 분석 집단을 구분한다. 최종 검사 수는 70,325, 64,498, 62,323이며 합계는 서로 다른 사람 수가 아니다.'),
 'galleri-3':('회차별 및 집계 암 신호 기원 예측 혼동행렬','예측한 암 발생 위치와 임상적으로 판정한 위치의 일치를 보여준다. 대각선과 비대각선을 암종별 표본 수와 함께 읽어야 한다. 이 그림을 첫 번째 또는 두 번째 CSO가 맞은 91.1–93.6% 요약값이나 전체 암 검출 정확도와 혼동하지 않는다.'),
 'sparrow-2':('NPU-Sparrow 기체와 꼬리 접기·펼치기 및 날개 설치각 기구','a는 전체 기체, b는 기하 치수, c는 인공 꼬리 깃, d는 꼬리 변형 연결기구, e는 날개 설치각 조절 장치다. 적은 자유도는 기체 전체에 구동기가 두 개뿐이라는 뜻이 아니다.'),
 'sparrow-6':('NPU-Sparrow 비행 전력·속도와 선회·루프·배럴롤 실험','실제 비행에서 전력과 속도, 꼬리 변형, 기동 궤적과 제어 입력·자세·하중 응답을 연결한 전체 패널이다. 375°/s 최고 롤 각속도와 정상 선회 반경 20.4% 감소는 서로 다른 운동의 지표다.')}
en_captions={
 'soec-1':('A 70-cell SOEC, alternating operating directions and voltage histories','Panel a shows the stack and cell, b the alternating operating directions, c early DC operation, and d the long voltage and temperature history. Panels c and d have different voltage-axis ranges. The 0.05%/kh figure applies to the later 22,268-hour window.'),
 'soec-2':('Cell-group impedance and changes in resistance components over time','Panel a links cell groups to Nyquist responses, b shows relaxation-time distributions, c equivalent-circuit fitting, and d resistance histories. These complement voltage evidence but do not uniquely assign every resistance element to one damage mechanism.'),
 'galleri-1':('Round-specific intervention-arm analysis populations in NHS-Galleri','Original Figure 1 distinguishes randomization, clinical eligibility and test evaluability from the three round-specific analysis populations: 70,325, 64,498 and 62,323 tests. Their sum is not a count of distinct people.'),
 'galleri-3':('Cancer-origin prediction confusion matrices by round and in aggregate','Predicted origins are compared with clinically assigned origins. Read diagonal and off-diagonal cells alongside their cancer-specific counts. Do not equate this figure with the first-or-second CSO summary of 91.1–93.6%, or with cancer detection accuracy across everyone screened.'),
 'sparrow-2':('The NPU-Sparrow airframe, tail-morphing linkage and wing-incidence mechanism','Panel a shows the vehicle, b its dimensions, c artificial tail feathers, d the folding linkage, and e wing-incidence actuation. Low degree of freedom does not mean the entire vehicle has only two actuators.'),
 'sparrow-6':('NPU-Sparrow flight power, speeds, turns, loops and barrel rolls','Complete panels connect power and speed, tail changes, maneuver trajectories and input/attitude/load responses. A peak roll rate of 375 degrees per second and a 20.4% smaller steady-turn radius measure different motions.')}
media=json.loads((A/'site/news-media.json').read_text());enmedia=json.loads((A/'site/news-media-en.json').read_text());edition=json.loads((A/'site/english-edition.json').read_text());entries=[];provenance=[]
for order,(key,ko,en,nums,khash,ehash,score,published,doi) in enumerate(config,1):
 kfile=A/'site/content/posts'/f'{ko}.mdx';efile=A/'site/content/english'/f'en-{en}.mdx';assert digest(kfile)==khash and digest(efile)==ehash
 k=front(kfile);e=front(efile);ids=[f'sep25-{key}-fig-{n}' for n in nums]
 assert not any(p['koSlug']==ko or p['enSlug']==en for p in edition['pairs'])
 edition['pairs'].append({'key':e['translationKey'],'koSlug':ko,'enSlug':en,'koFile':kfile.name,'enFile':efile.name,'sourceSha256':khash,'englishSha256':ehash,'sourceCommit':SOURCE,'scope':'full-article'})
 entries.append({'key':key,'slug':ko,'enSlug':en,'title':k['title'],'order':order,'mediaIds':ids,'sourceSha256':khash,'englishSha256':ehash,'sourcePublished':published,'sourceVersion':'Version of Record' if key=='galleri' else 'accepted early version','doi':'10.1038/'+doi,'evidenceGrade':'PEER_REVIEWED_FRONTIER','providedEditorialScore':score,'scoreOrigin':'user-supplied selection record, not independently rescored'})
 for fk,n,page,clip,w,h,sha in figures:
  if fk!=key:continue
  mid=f'sep25-{key}-fig-{n}';assert mid not in media and mid not in enmedia
  src=f'/assets/posts/news-20260925/{key}-fig-{n}.png';path=A/'site/assets'/src.lstrip('/');assert digest(path)==sha
  ka,kc=ko_captions[f'{key}-{n}'];ea,ec=en_captions[f'{key}-{n}'];lic='CC BY 4.0' if key=='galleri' else 'CC BY-NC-ND 4.0';rights='https://creativecommons.org/licenses/'+('by' if key=='galleri' else 'by-nc-nd')+'/4.0/'
  url='https://www.nature.com/articles/'+doi+('.pdf' if key=='galleri' else '_reference.pdf')
  credit=('Neal et al. · Nature Medicine' if key=='galleri' else 'Bilalis et al. · Nature Communications' if key=='soec' else 'Cao et al. · Nature Communications')+f' · Figure {n}'
  media[mid]={'slug':ko,'order':order,'src':src,'width':w,'height':h,'alt':ka,'kind':f'원 논문 Figure {n}','caption':kc,'credit':credit,'source':url+f'#page={page}','license':lic,'rights':rights,'changes':'원문 도판 전체 패널·축·주석을 유지한 PNG 렌더링. 본문과 주변 여백만 제외; 도판 재작성·색상 반전 없음.'}
  enmedia[mid]={'alt':ea,'kind':f'Original Figure {n}','caption':ec,'credit':credit,'license':lic,'changes':'PNG rendering preserves all original figure panels, axes and annotations; surrounding article text is excluded. No redraw or color inversion.'}
  provenance.append({'id':mid,'src':src,'figure':n,'sourceUrl':url,'sourcePdfSha256':pdfsha[key],'pdfPage':page,'cropPoints':clip,'pixelsPerPoint':4,'renderer':'PyMuPDF 1.26.7','width':w,'height':h,'sha256':sha,'reviewedImageSha256':sha,'license':lic})
put('spaceship-ui/site/news-media.json',media);put('spaceship-ui/site/news-media-en.json',enmedia);put('spaceship-ui/site/english-edition.json',edition)
put('spaceship-ui/site/news-edition-20260925.json',{'date':'2026-09-25','sourceCommit':SOURCE,'selectionRecord':'User supplied scores and rotation override; this publication task did not repeat the claimed 24-item/72-hour discovery scan.','entries':entries})
put('spaceship-ui/site/assets/assets/posts/news-20260925/figures.json',{'version':1,'checkedOn':'2026-09-25','figures':provenance})
patch('spaceship-ui/src/pages/posts/[...slug]/index.astro',"import Layout from '@/layouts/Layout.astro';","import Layout from '@/layouts/Layout.astro';\nimport sep25 from '../../../../site/news-edition-20260925.json';")
patch('spaceship-ui/src/pages/posts/[...slug]/index.astro','adsEnabled={!sep22.entries.some','adsEnabled={!sep25.entries.some((entry) => entry.slug === effectiveSlug) && !sep22.entries.some')
p='spaceship-ui/scripts/browser-news-media-audit.mjs';s=(R/p).read_text();needle='  const declaredEntries = ';assert s.count(needle)==1
s=s.replace(needle,"  const sep25 = JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260925.json', import.meta.url), 'utf8'));\n"+needle)
assert s.count('...sep23.entries];')==1;s=s.replace('...sep23.entries];','...sep23.entries, ...sep25.entries];');write(p,s)
patch('spaceship-ui/scripts/browser-english-edition.mjs','nativeLanguageRoundTrips:8,nativeCitationBack:8','nativeLanguageRoundTrips:manifest.pairs.length*2,nativeCitationBack:manifest.pairs.length*2')
write('spaceship-ui/scripts/sep25-contract.py',r'''import hashlib,json,re,struct
from pathlib import Path
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1]
E=json.loads((R/'site/news-edition-20260925.json').read_text())
F=json.loads((R/'site/assets/assets/posts/news-20260925/figures.json').read_text())['figures']
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.tags=[];self.feed(s)
 def handle_starttag(self,t,attrs):self.tags.append((t,dict(attrs)))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pagecheck(text,entry,lang):
 p=Page(text);assert any(t=='html' and a.get('lang')==lang for t,a in p.tags)
 assert 'google-adsense-account' not in text and 'pagead2.googlesyndication.com' not in text
 assert 'katex-error' not in text
 figs=[a.get('data-news-figure') for t,a in p.tags if 'data-news-figure' in a]
 assert figs==entry['mediaIds'],(lang,entry['key'],figs)
 images=[a for t,a in p.tags if t=='img' and '/news-20260925/' in a.get('src','')]
 assert len(images)==2 and all(a['src'].endswith('.png') for a in images)
 cites=[a for t,a in p.tags if t=='a' and 'data-news-citation' in a];assert len(cites)>=10
 for a in cites:
  n=a['data-news-citation'];assert a['href']=='#news-ref-'+n
  assert len([b for t,b in p.tags if b.get('id')=='news-ref-'+n])==1
 refs=[a for t,a in p.tags if a.get('id','').startswith('news-ref-')]
 assert len(refs)==(2 if entry['key']=='galleri' else 3)
 return {'figures':len(figs),'citations':len(cites),'references':len(refs)}
rows=[]
assert len(E['entries'])==3 and len(F)==6
for f in F:
 p=R/'site/assets'/f['src'].lstrip('/');b=p.read_bytes();assert b[:8]==b'\x89PNG\r\n\x1a\n'
 assert digest(p)==f['sha256']==f['reviewedImageSha256'];assert struct.unpack('>II',b[16:24])==(f['width'],f['height'])
for e in E['entries']:
 for lang,folder,filename,hkey,route in [('ko','posts',e['slug']+'.mdx','sourceSha256','posts/'+e['slug']),('en','english','en-'+e['enSlug']+'.mdx','englishSha256','en/posts/'+e['enSlug'])]:
  p=R/'site/content'/folder/filename;s=p.read_text();assert digest(p)==e[hkey]
  assert 'draft: false' in s and 'pubDate: 2026-09-25T00:00:00+09:00' in s
  assert len(re.findall(r'^## ',s,re.M))==10 and '$$' not in s
  assert len(re.findall(r'<Math display',s))==(3 if e['key']=='soec' else 2)
  assert len([line for line in s.splitlines() if line.startswith('|')])>=5
  html=(R/'dist'/route/'index.html').read_text();rows.append({'key':e['key'],'lang':lang,**pagecheck(html,e,lang)})
  if lang=='ko' and e['key']=='soec':
   for value in ['25,011','22,268','0.05%','0.23%','596','91.2','91.1']:assert value in s
  if lang=='en' and e['key']=='galleri':
   for value in ['did not meet','first or second','87.0%','37.2%','27.1%','26.7%']:assert value in s
  if lang=='en' and e['key']=='sparrow':
   for value in ['13-degree','−10-degree','overpredicts','375°/s','20.4%']:assert value in s
# Arithmetic is reproducible without fitting a new scientific model.
late=(86.2-85.2)/85.2/22.268*100;overall=(86.2-81.4)/81.4/25.011*100
assert abs(late-0.0527)<0.0001 and abs(overall-0.2358)<0.0001
assert abs(419/722*100-58.0)<0.05 and abs(68895/69198*100-99.56)<0.01
# Negative controls exercise the same rendered-page validator.
e=E['entries'][0];text=(R/'dist/posts'/e['slug']/'index.html').read_text()
mutations=[text.replace('id="news-ref-1"','id="missing-reference"'),text.replace('sep25-soec-fig-1','missing-figure'),text+'<meta name="google-adsense-account" content="test">']
for m in mutations:
 assert m!=text
 try:pagecheck(m,e,'ko')
 except AssertionError:pass
 else:raise AssertionError('Broken page mutation accepted')
out=R/'sep25-review';out.mkdir(exist_ok=True);(out/'static.json').write_text(json.dumps({'passed':True,'rows':rows,'verifiedOriginalFigures':6,'rejectedMutations':3,'lateRate':late,'overallRate':overall},indent=2))
print('sep25-contract: PASS',json.dumps(rows))
''')
write('spaceship-ui/scripts/browser-sep25.mjs',r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp,BASE,attach,evaluate,navigate,viewport,waitExpression,startPreview,startChrome,stopChild,removeProfile } from './browser-smoke-harness.mjs';
const edition=JSON.parse(fs.readFileSync(new URL('../site/news-edition-20260925.json',import.meta.url),'utf8'));
const media=JSON.parse(fs.readFileSync(new URL('../site/news-media.json',import.meta.url),'utf8'));
fs.mkdirSync('sep25-review',{recursive:true});let preview,chrome,cdp,sessionId;const rows=[];
const timer=setTimeout(()=>{console.error('sep25-browser: timeout');process.exit(1)},180_000);
try{
 preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
 for(const width of [390,1440]){
  await viewport(cdp,sessionId,{width,height:900,mobile:width===390,touch:width===390,reduced:false});
  for(const e of edition.entries)for(const lang of ['ko','en']){
   const route=lang==='ko'?`/posts/${e.slug}/`:`/en/posts/${e.enSlug}/`;
   assert.equal((await fetch(new URL(route,BASE))).status,200);await navigate(cdp,sessionId,route);
   const seen=[];
   for(const id of e.mediaIds){
    const selector=`article [data-news-figure="${id}"] img`;
    await evaluate(cdp,sessionId,`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    const state=await waitExpression(cdp,sessionId,`(()=>{const i=document.querySelector(${JSON.stringify(selector)});if(!i?.complete||!i.naturalWidth)return null;const f=i.closest('figure'),r=i.getBoundingClientRect();return {src:i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight,visible:r.width>0&&r.height>0,link:f.querySelector('a').getAttribute('href'),caption:f.querySelector('figcaption')?.innerText}})()`,'original figure decoded');
    assert.equal(state.src,media[id].src);assert.equal(state.link,media[id].src);assert.equal(state.width,media[id].width);assert.equal(state.height,media[id].height);assert(state.visible&&state.caption);
    if(lang==='en')assert(!/[가-힣]/.test(state.caption));
    if(width===390&&id===e.mediaIds[0]){const {data}=await cdp.send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`sep25-review/${e.key}-${lang}-mobile.png`,Buffer.from(data,'base64'));}
    seen.push(id);
   }
   const state=await evaluate(cdp,sessionId,`({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth+2,errors:document.querySelectorAll('.katex-error').length,ads:!!document.querySelector('meta[name="google-adsense-account"]')})`);
   assert.equal(state.lang,lang);assert(!state.overflow&&!state.errors&&!state.ads);
   // One real keyboard activation; there is no script click or repeated input.
   await evaluate(cdp,sessionId,`const a=document.querySelector('article a[data-news-citation="1"]');a.scrollIntoView({block:'center',behavior:'instant'});a.focus();`);
   await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13},sessionId);
   await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
   await waitExpression(cdp,sessionId,`location.hash==='#news-ref-1' && location.pathname===${JSON.stringify(route)}`,'same-article reference target');
   rows.push({key:e.key,lang,width,originals:seen,nativeCitation:true});console.log('sep25-browser: PASS '+JSON.stringify(rows.at(-1)));
  }
 }
 assert.equal(rows.length,12);fs.writeFileSync('sep25-review/browser.json',JSON.stringify({base:BASE,rows},null,2));
}catch(error){console.error(error);fs.writeFileSync('sep25-review/failure.json',JSON.stringify({error:String(error),rows},null,2));process.exitCode=1;}
finally{cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(timer);process.exit(process.exitCode||0);}
''')
write('.github/workflows/sep25-reading.yml','''name: September 25 reading
on:
  pull_request:
    branches: [main]
    paths: ['spaceship-ui/**', '.github/workflows/sep25-reading.yml']
  push:
    branches: [main]
    paths: ['spaceship-ui/**', '.github/workflows/sep25-reading.yml']
permissions:
  contents: read
concurrency:
  group: sep25-reading-${{ github.ref }}
  cancel-in-progress: true
jobs:
  reading:
    runs-on: ubuntu-latest
    timeout-minutes: 10
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
      - run: python3 scripts/sep25-contract.py
      - run: node scripts/browser-sep25.mjs
      - name: Record tested source
        if: always()
        run: mkdir -p sep25-review && git rev-parse HEAD > sep25-review/tested-sha.txt
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: sep25-reading-${{ github.run_id }}-${{ github.run_attempt }}
          path: spaceship-ui/sep25-review/
          retention-days: 7
''')
write('spaceship-ui/docs/operations/NEWS_20260925_EDITORIAL.md','''# September 25, 2026 — editorial evidence record

Edition date: 2026-09-25, Friday. The supplied selection overrides the Friday Vision/Robotics/Embodied AI rotation in favor of SOEC. Scores 98/95/94 are the user's editorial selection, not calibrated probabilities or scores independently recomputed here. The earlier claim of a nonduplicated 24-item/72-hour scan was supplied by the user; this publication task verified these three nominated papers rather than repeating that discovery scan.

SOEC is the featured `frontier-one` article. NHS-Galleri and NPU-Sparrow are `frontier-candidate` articles. All three have full corresponding English prose, the same explanatory equations, evidence tables, limitations and original-figure order. No existing Korean article or existing English source was rewritten.

## Primary findings and corrections

- SOEC: 70→25,081 h gives the overall 25,011 h window; 2,813→25,081 h gives the stabilized 22,268 h window. Reported rates are respectively 0.23 and 0.05%/kh. Rounded endpoint recalculation is disclosed separately. The intermediate 596 h DC interval has 91.2→91.1 V and a reported zero drift. There is no matched second stack run DC-only throughout 25,000 h. Bidirectional conversion and system-boundary efficiency are not established commercial hydrogen cost.
- Galleri: the 142,250 randomized participants differ from 197,146 repeated test episodes. Table 2 round denominators, PPV, specificity and all-cancer sensitivity are retained. The primary stage III/IV endpoint was not met; this paper describes prespecified secondary intervention-arm performance without hypothesis testing. The 91.1–93.6% CSO range allows the first OR second origin among true positives. First-only aggregate accuracy is 87.0%. GRAIL funding and participation are disclosed.
- Sparrow: 13 degrees is a vehicle-angle-of-attack condition, not the selected minus-10-degree tail installation angle. The model overpredicts aerodynamic-center migration magnitude; the practical selected angle is not claimed as a unique optimum. Peak roll rate, turn radius and mission autonomy remain separate quantities. No competing interests are declared by the authors.

Publication dates: SOEC and Sparrow, 2026-09-24 accepted early versions; Galleri, 2026-09-22 Version of Record. Early versions are peer-reviewed and citable, but may be replaced by the edited record.

## Source and image checks

Publisher article PDFs and relevant supplementary sections were retrieved. SOEC Table S2, Galleri Table 2, and the six selected original figures were visually checked. The original figures were rendered as complete figure regions because extracting raster objects alone omitted vector axes and labels. All panels, axes and annotations are preserved; surrounding article text is excluded. There are no generated replacement diagrams or color inversions. Exact PDF SHA256, crop rectangles, PNG dimensions, renderer and reviewed-image SHA256 are stored in `site/assets/assets/posts/news-20260925/figures.json`.

Source retrieval runs: 36113562458 and 36113863744. Verified figure-blob run: 36115044618. These temporary workers did not update publication branches or deploy content. Their workflows must not enter the final production tree.

Licenses: SOEC/Sparrow CC BY-NC-ND 4.0, Galleri CC BY 4.0, with original attribution and license links. The new Korean and English article routes are ad-free; existing global advertising configuration is unchanged. The publication does not claim independent permission beyond the displayed publisher license.

Scope: no independent laboratory/flight replication, individual clinical-data reanalysis, full Source Data spreadsheet re-fit, or full video reanalysis. Reviewing selected supplementary/peer-review passages is not represented as reproducing every experiment or reading every file in full. Blogger summaries are stored as drafts, not externally posted. Runtime validation must refer to the exact final head, separately from pre-commit candidate results and actual Pages deployment.
''')
summaries={
 'soec':'''그린수소용 고체산화물 수전해(SOEC)는 높은 전기효율을 기대할 수 있지만 고온에서 장기간 작동하는 스택의 수명이 문제입니다. 9월 24일 Nature Communications의 동료심사 완료 초기 공개본은 새 전극을 넣는 대신 전기분해와 짧은 연료전지 운전을 섞는 AC:DC 전략을 보고했습니다.

70셀 스택의 전체 분석 기간은 25,011시간입니다. 전체 평균 전압 열화율은 약 0.23%/1,000시간이고, 초기 조건 안정화 이후 22,268시간의 값이 0.05%/1,000시간입니다. 이 두 구간을 합쳐 2만5000시간 내내 0.05%였다고 설명하면 부정확합니다. 임피던스와 시험 후 단면에서도 안정화를 지지하는 관측이 나왔습니다.

다만 동일 스택 두 개를 DC와 AC:DC로 25,000시간 병렬 비교한 시험은 아닙니다. 중간 596시간 DC 구간은 표에서 전압 drift가 0으로 보고됐습니다. 양방향 전력변환 손실과 열·보조기기까지 포함한 상업 수소 원가도 별도 검증이 필요합니다. 일부 저자의 산업체 소속을 함께 공개합니다.

의미는 수명 문제가 소재뿐 아니라 운전 제어의 설계 문제라는 데 있습니다. 원도판, 구간별 계산과 아직 필요한 대조시험을 전체 해설에서 함께 정리했습니다.''',
 'galleri':'''암을 찾는 혈액검사의 특이도가 99.5%를 넘으면 환자의 건강 결과도 좋아질까요? 9월 22일 Nature Medicine NHS-Galleri 논문은 두 질문을 구분해야 한다는 사례입니다. 142,250명이 무작위 배정된 시험에서 stage III/IV 암 진단을 줄인다는 1차 평가변수는 충족되지 않았습니다. 이번 논문은 중재군의 사전 지정된 2차 검사 성능을 기술하며 가설검정을 하지 않았습니다.

세 회차의 특이도는 99.56%, 99.60%, 99.50%였지만 양성예측도는 58.0%, 50.4%, 45.8%였습니다. 모든 암에 대한 12개월 회차 민감도는 37.2%, 27.1%, 26.7%였습니다. 각 수치는 분모가 달라 서로 바꿔 부를 수 없습니다.

91.1–93.6%의 암 신호 기원 예측은 실제 암이 확인된 양성자에서 첫 번째 또는 두 번째 위치 후보가 맞은 비율입니다. 전체 검사 정확도나 첫 번째 위치만의 정확도가 아닙니다. GRAIL의 연구비·설계·해석 참여와 저자 이해관계도 공개돼 있습니다.

좋은 분류 성능과 임상적 효용 사이의 간격을 원논문 표와 그림으로 살펴봅니다. 개인의 검진을 권하는 글이 아니며 이 결과가 표준 검진을 대체할 근거를 확정한 것은 아닙니다.''',
 'sparrow':'''NPU-Sparrow는 약 90g의 날갯짓 로봇입니다. 9월 24일 Nature Communications에 공개된 연구는 복잡한 관절을 계속 늘리는 대신 꼬리 면적과 날개 설치각을 협응해 순항과 기동의 비행 범위를 넓혔습니다. 풍동과 실외 시험에서 수평 비행 4.5–13.2m/s, 최고 롤 각속도 375°/s, 정상 선회 반경 20.4% 감소와 루프·배럴롤을 보고했습니다.

설계의 핵심은 꼬리 역할의 변화입니다. 낮은 받음각에서는 안정성을 위한 음의 양력과 모멘트를 만들고, 시험한 조건에서 기체 받음각이 13°를 넘으면 보조 양력면이 될 수 있습니다. 이 13°는 선택된 꼬리 설치각 −10°와 다른 변수입니다.

모델은 공력중심 이동의 방향은 설명하지만 크기를 풍동보다 크게 예측했습니다. 최고 롤 속도는 지속 선회 성능이 아니며 반경 감소가 같은 비율의 에너지 절약을 뜻하지도 않습니다. 장거리 자율 임무, 돌풍, 탑재량과 지속시간은 별도 검증이 필요합니다.

원논문 기구와 비행 도판을 통해 적은 자유도의 협응 설계가 실제로 바꾼 것과 아직 검증하지 않은 것을 구분했습니다.'''}
for e in entries:
 key=e['key'];url='https://jjo-0.github.io/posts/'+e['slug']+'/'
 write('spaceship-ui/docs/blogger-drafts/2026-09-25/'+key+'.md','# '+e['title']+'\n\n상태: Blogger 게시용 초안. 외부 계정 발행은 수행하지 않음.\n\n'+summaries[key]+'\n\n[전체 해설]('+url+') · [원논문](https://www.nature.com/articles/'+e['doi'].split('/')[-1]+')\n')
# Preserve the exact assembly output. Immutable blob creation is a separate, gated step.
receipt=R.parent/'sep25-receipt';receipt.mkdir(exist_ok=True)
rows=[]
for p in sorted(set(changed)):
 b=(R/p).read_bytes();rows.append({'path':p,'mode':'100644','type':'blob','sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'sha256':hashlib.sha256(b).hexdigest()})
(receipt/'assembly.json').write_text(json.dumps({'sourceCommit':SOURCE,'files':rows},ensure_ascii=False,indent=2))
print('September 25 assembly:',len(rows),'registered files; Korean/English source digests retained')

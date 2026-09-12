"""One-time, allowlisted NEWS cover integration; source downloads are data, never code."""
from pathlib import Path
import os,io,re,json,hashlib,zipfile
from urllib.parse import urljoin
import requests,fitz
from PIL import Image
from bs4 import BeautifulSoup
ROOT=Path.cwd();APP=ROOT/'spaceship-ui';CACHE=Path(os.environ['RUNNER_TEMP'])/'news-cover-inputs';CACHE.mkdir(exist_ok=True)
ARTIFACTS=[('probe',10296753029,'e04052c84f65a98f351b763d2031862daa544e0328bd683f0673462285b95a36'),('originals',10296743391,'3945c4bf370aee91924a3db8d4d4859ed669a1accf1d42114a16b6b4ba54f928')]
for name,aid,digest in ARTIFACTS:
    r=requests.get(f'https://api.github.com/repos/JJo-0/JJo-0.github.io/actions/artifacts/{aid}/zip',headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json'},timeout=90);r.raise_for_status()
    assert hashlib.sha256(r.content).hexdigest()==digest, 'source artifact changed'
    dest=CACHE/name;dest.mkdir(exist_ok=True)
    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
        for info in z.infolist():
            target=(dest/info.filename).resolve();assert target.is_relative_to(dest.resolve());assert info.file_size<100_000_000
        z.extractall(dest)
INV={r['slug']:r for r in json.loads((CACHE/'probe/inventory.json').read_text())}
OUT=APP/'site/assets/assets/posts/news-covers-20260912';OUT.mkdir(parents=True,exist_ok=True)
MEDIA_PATH=APP/'site/news-media.json';MEDIA=json.loads(MEDIA_PATH.read_text());rows=[]
CC='https://creativecommons.org/licenses/'
def lookup(suffix):
    a=[r for k,r in INV.items() if k[11:]==suffix];assert len(a)==1;return a[0]
def write_image(data,mid,fmt='webp'):
    im=Image.open(io.BytesIO(data));im.load()
    if fmt=='png':
        assert im.format=='PNG';p=OUT/(mid+'.png');p.write_bytes(data)
    else:
        p=OUT/(mid+'.webp');im.save(p,format='WEBP',lossless=True,method=6)
    return p,im.width,im.height

def add(suffix,caption,credit,license,rights,kind,n=None,pdf=None,page=None,clip=None,local=None,source=None,fig=None,mid=None,preserve_png=False):
    info=lookup(suffix);slug=info['slug'];mid=mid or 'cover-'+suffix.removesuffix('-news').removesuffix('-frontier-one');source=source or info['source']
    if pdf:
        folder=CACHE/'originals'/pdf;meta=json.loads((folder/'metadata.json').read_text());data=(folder/'source.pdf').read_bytes();assert data.startswith(b'%PDF-');assert hashlib.sha256(data).hexdigest()==meta['sha256']
        d=fitz.open(stream=data,filetype='pdf');assert 0<page<=len(d)
        pix=d[page-1].get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(clip),alpha=False);pixels=pix.tobytes('png');download=meta['url']
    elif local:
        f=APP/'site/assets'/local.lstrip('/');data=f.read_bytes();pixels=data;download=source
    elif n is not None:
        meta=info['candidates'][n];data=(CACHE/'probe/sources'/slug/meta['file']).read_bytes();assert hashlib.sha256(data).hexdigest()==meta['sha256'];pixels=data;download=meta['url']
    else:
        # Commons returned HTTP 429; use this separately verified open-access primary case report.
        url='https://pmc.ncbi.nlm.nih.gov/articles/PMC10766746/'
        r=requests.get(url,timeout=45);r.raise_for_status();soup=BeautifulSoup(r.content,'html.parser');text=soup.get_text(' ',strip=True)
        assert 'Iron-laden blasts' in text and ('creativecommons.org/licenses/by/4.0' in r.text or 'Creative Commons Attribution 4.0' in text)
        figures=soup.select('figure');assert figures
        figure=next(f for f in figures if re.search(r'Fig\.?\s*1',f.get_text(' ',strip=True)))
        img=figure.find('img');assert img and img.get('src');download=urljoin(url,img['src'])
        rr=requests.get(download,timeout=45);rr.raise_for_status();data=rr.content;pixels=data
        (CACHE/'aml-source.html').write_bytes(r.content);(CACHE/'aml-source.txt').write_text(text)
    p,w,h=write_image(pixels,mid,'png' if preserve_png else 'webp')
    changes='原图内容未改动' if False else ('原본 PNG 바이트 유지 · 자르기·합성·재색상 없음' if preserve_png else '전체 그림 보존 · 무손실 WebP 형식 변환 · 데이터·축·패널 변경 없음')
    if pdf:changes=f'출판사 PDF {page}쪽의 {fig} 전체 발췌 · 144dpi 렌더 · 모든 패널·축 보존; 주변 본문만 제외'
    entry={'slug':slug,'order':sorted(INV).index(slug)+1,'src':'/assets/posts/news-covers-20260912/'+p.name,'width':w,'height':h,'alt':caption[:200],'kind':kind,'caption':caption,'credit':credit,'source':source,'license':license,'rights':rights,'changes':changes}
    MEDIA[mid]=entry
    row={'slug':slug,'date':slug[:10],'media':mid,'src':entry['src'],'width':w,'height':h,'source':source,'downloadUrl':download,'license':license,'rights':rights,'credit':credit,'kind':kind,'checkedAt':'2026-09-12','inputSha256':hashlib.sha256(data).hexdigest(),'assetSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'legacyVisualSuite':mid=='research-cycle'}
    if pdf:row.update(figure=fig,pdfPage=page,clip=clip,pdfSha256=row['inputSha256'])
    post=APP/'site/content/posts'/(slug+'.mdx');old=post.read_text();actual=hashlib.sha1(b'blob '+str(len(post.read_bytes())).encode()+b'\0'+post.read_bytes()).hexdigest();assert actual==info['sourceBlob'],slug+' changed during source review'
    fm,body=old.split('---',2)[1:];assert re.search(r'^draft:\s*false\s*$',fm,re.M)
    if re.search(r'^updatedDate:',fm,re.M):fm=re.sub(r'^updatedDate:.*$', 'updatedDate: 2026-09-12',fm,flags=re.M)
    else:fm=fm.rstrip()+'\nupdatedDate: 2026-09-12\n'
    imports=re.findall(r'^import [^\n]+;[ \t]*\n',body,re.M);body=re.sub(r'^import [^\n]+;[ \t]*\n','',body,flags=re.M).strip()
    row['bodyBaselineSha256']=hashlib.sha256(body.encode()).hexdigest()
    if mid=='research-cycle':
        assert body.count('<NewsFigure media="research-cycle" priority />')==1
        body=body.replace('<NewsFigure media="research-cycle" priority />','').strip()
        row['bodyBaselineSha256']=hashlib.sha256(body.encode()).hexdigest()
    if not any('import NewsFigure ' in i for i in imports):imports.append("import NewsFigure from '@/components/post/NewsFigure.astro';\n")
    post.write_text('---'+fm+'---\n\n'+''.join(imports)+'\n'+f'<NewsFigure media="{mid}" priority />\n\n'+body+'\n')
    rows.append(row)

add('aml-paradigm-news','2023년 별도 AML 증례의 혈액 도말 사진이다. A·B는 Wright–Giemsa 염색, C·D는 철 침착을 확인하는 염색이다. PARADIGM 참여자의 사진이나 치료 효과 자료가 아니다.','Christopher Vossen, Roeun Im, Pedro Horna · J Hematop · 2023 · Figure 1','CC BY 4.0',CC+'by/4.0/','관련 배경 논문의 실제 현미경 사진',source='https://pmc.ncbi.nlm.nih.gov/articles/PMC10766746/')
add('gpt-6-astra-safety-news','간접 프롬프트 주입 공격의 성공률을 모델과 공격 횟수별로 비교한 OpenAI 원본 차트다. 낮을수록 좋으며, 색 농도가 다른 막대는 서로 다른 공격 예산이다. 일반적인 사고 발생률은 아니다.','OpenAI · GPT-6 Astra Deployment Safety · Figure 5','원저작권 유지 · 해설용 인용','https://openai.com/policies/terms-of-use/','공식 안전 보고서 Figure 5',n=4)
add('nvidia-hugging-face-news','NVIDIA가 Hugging Face 관련 인수 발표에 제공한 원본 이미지다. 기업의 계획·계약 발표를 식별하는 자료이며, 거래 종결이나 성능 개선을 증명하는 실험 사진은 아니다.','© NVIDIA · 2026','NVIDIA 원저작권·상표 유지 · 보도 인용','https://www.nvidia.com/en-us/about-nvidia/legal-info/','기업 발표의 공식 대표 이미지',n=0)
add('perovskite-interface-news','MTIm·MAIm 계열 물질의 결정 구조, 결합과 분광 특성을 비교한 원본 Figure 1이다. 원자 연결 방식의 차이를 읽는 자료이며 태양전지 모듈의 실제 발전량 그래프는 아니다.','Yalan Zhang 외 · Nature Materials · 2026 · Figure 1','원저작권 유지 · 해설용 Figure 인용','https://www.nature.com/articles/s41563-026-02722-3#rightslink','원 논문 Figure 1',n=4)
add('weathernext-3-frontier-one','WeatherNext 3의 입력 관측, 시공간 조건, 격자·관측소·사이클론 예측 출력을 연결한 원본 개요도다. 흐름을 설명하는 그림이며, 색상 지도의 한 장면이 독립적인 정확도 검증을 뜻하지는 않는다.','WeatherNext 3 저자진 · arXiv:2609.03582v1 · Figure 1','CC BY 4.0',CC+'by/4.0/','연구 원고의 모델 개요 Figure 1',n=0)
# Related reactor figure: the 2026 Stanford hero is third-party stock photography.
info=lookup('autothermal-methane-news');folder=CACHE/'originals/methane-background';meta=json.loads((folder/'metadata.json').read_text());ca=meta['images'][0]
info['candidates']=[dict(ca,caption='',alt='')];dest=CACHE/'probe/sources'/info['slug'];dest.mkdir(exist_ok=True);(dest/ca['file']).write_bytes((folder/ca['file']).read_bytes())
add('autothermal-methane-news','메탄 공급, 가열 반응기, 압력·온도 측정과 가스 채취를 보여 주는 2023년 배치 반응기 개요다. Stanford의 2026년 자가발열 장치가 아니라, 메탄 열분해 실험의 구성 요소를 이해하기 위한 별도 연구 자료다.','James Tatum 외 · Data in Brief · 2023 · Figure 1','CC BY 4.0',CC+'by/4.0/','2023년 관련 배경 논문 Figure 1',n=0,source='https://pmc.ncbi.nlm.nih.gov/articles/PMC9972487/')
def pdf_add(suffix,key,page,clip,fig,caption,credit,openby=False):
    add(suffix,caption,credit+' · Nature Communications · 2026', 'CC BY 4.0' if openby else 'CC BY-NC-ND 4.0',CC+('by' if openby else 'by-nc-nd')+'/4.0/','원 논문 '+fig,pdf=key,page=page,clip=clip,fig=fig)
pdf_add('clear-ec-news','clear-ec',3,[37,44,564,701],'Figure 1','CLEAR-EC의 치료·검체 수집 일정과 대상자 선정 흐름을 보여 주는 실제 연구 설계도다. 단일군 시험이며, 서로 다른 치료군의 무작위 배정 비교를 그린 것이 아니다.','Lin Zhou 외')
add('feederbw-news','성격이 다른 저압 배전선 4개의 주간 유효전력 분위수 곡선이다. 두 해의 관측을 요일·시간별로 모은 통계이며, 한 주의 실제 경로를 그대로 연결한 그래프가 아니다.','Manuel Treutlein 외 · Scientific Data · 2026 · Figure 4','CC BY 4.0',CC+'by/4.0/','원 논문 Figure 4',local='/assets/posts/frontier-sep5-8/feeder-weekly.webp')
pdf_add('hugcl-news','hugcl',2,[37,385,564,743],'Figure 1','사람의 주행 안내, 여러 지속학습기와 행동 계획을 연결한 HugCL의 원본 구성도다. 학습 절차를 설명하는 그림이며 실제 도로에서 무사고를 보장하는 성능 자료는 아니다.','Haohan Yang 외')
pdf_add('solar-blind-corona-news','solar-blind',3,[37,44,564,663],'Figure 1','유기 광검출기의 소재·소자 구조와 전기적 특성을 함께 보여 주는 원본 Figure 1이다. 상단 전력망·드론 도식은 적용 개념이며 전체 전력망에 배포됐다는 사진이 아니다.','Yang Liu 외',True)
pdf_add('tilted-mnte-news','tilted-mnte',2,[37,45,564,220],'Figure 1','MnTe 결정축을 기울이기 전후의 스핀 전파와 편극 방향을 비교한 원본 개념도다. 화살표의 방향을 읽는 그림이며 그 길이가 측정 효율이나 기록 속도를 뜻하지는 않는다.','Yu Dai 외')
pdf_add('dlcatalysis-neuac-news','dlcatalysis',6,[37,44,564,702],'Figure 3','DLcatalysis의 효소 후보 선별 흐름과 후보들의 촉매 활성·전환·생산량 비교를 담은 원본 Figure 3이다. 각 패널의 실험 조건은 서로 구분해야 하며 전체 생산 개선을 AI 단독 효과로 읽지 않는다.','Nan-Kai Wang 외')
pdf_add('glud1-hsc-news','glud1',7,[37,44,564,639],'Figure 3','Glud1 억제 조건에서 생쥐 조혈줄기세포의 배양·분석 흐름과 세포 수·분포를 살핀 원본 Figure 3이다. 사람 치료나 환자의 장기 예후를 시험한 자료가 아니다.','Michihiro Hashimoto 외',True)
add('openai-research-automation-frontier-one','Epoch AI가 2026년 6월 제시한 연구의 결정·설계·구현·실행·분석·소통 분류다. OpenAI 보고서의 배경 체계이며 원의 넓이나 색은 자동화율·소요시간을 나타내지 않는다.','Jean-Stanislas Denain, Joe Kwon, Anson Ho · Epoch AI · 2026-06-17','CC BY 4.0',CC+'by/4.0/','원문이 사용한 분류 체계의 원본 도식',n=3,mid='research-cycle')
pdf_add('carep-news','carep',3,[37,44,564,659],'Figure 1','CAR-engaging particle의 신호 설계와 사람 유래 CAR T세포의 체외 증식을 비교한 원본 Figure 1이다. 체외 세포 실험이며 암 환자의 치료 반응을 보여 주는 임상 그래프가 아니다.','Qinghe Zeng 외')
pdf_add('chorus-news','chorus',3,[37,44,564,254],'Figure 2','CHORUS의 무진행 생존(A)과 전체 생존(B) 곡선이다. 음영은 95% 신뢰구간이며 두 패널은 서로 다른 치료군이 아니다. 단일군 시험이므로 이 그림만으로 기존 치료보다 우월하다고 결론 내릴 수 없다.','CHORUS 연구진')
add('deepwonder3d-news','여러 방향의 칼슘 영상에서 신경세포를 추출하는 DeepWonder3D의 광학 입력·계산 파이프라인 원본이다. 영상 처리 구조이며 사람의 생각을 해독한 결과를 뜻하지 않는다.','Yujia Chen 외 · Nature Methods · 2026 · Figure 1','원저작권 유지 · 해설용 Figure 인용','https://www.nature.com/articles/s41592-026-03215-6#rightslink','원 논문 Figure 1',n=3)
add('imec-nbtin-news','imec가 공개한 두 금속층과 비아를 포함한 aSi–NbTiN 구조의 실제 단면 이미지다. M1·M2·Via 및 축척을 함께 읽는다. 완성 프로세서의 성능이나 전체 공정 수율을 나타내지는 않는다.','©imec · 2026 · Figure 1','imec 보도·발표용 사진 이용 조건','https://www.imec-int.com/en/terms-use-imec-pictures','이번 발표의 원본 단면 이미지',n=2,preserve_png=True)
add('rentosertib-aging-news','렌토서팁 2a상 자료에 단백체 노화 시계 분석을 연결하는 원본 연구 설계도다. 바이오마커 평가를 설명하며 사람의 수명 연장이나 전신 회춘이 입증됐다는 의미는 아니다.','Alex Zhavoronkov 외 · Nature Biotechnology · 2026 · Figure 1','CC BY 4.0',CC+'by/4.0/','원 논문 Figure 1',local='/assets/posts/frontier-sep5-8/aging-clock-trial.webp')
assert len(rows)==19
# Preserve the existing research-run graphic, but stop loading it from an external host.
info=lookup('openai-research-automation-frontier-one');ca=info['candidates'][4];data=(CACHE/'probe/sources'/info['slug']/ca['file']).read_bytes();assert hashlib.sha256(data).hexdigest()==ca['sha256']
p,w,h=write_image(data,'research-run');MEDIA['research-run'].update(src='/assets/posts/news-covers-20260912/'+p.name,width=w,height=h,changes='전체 그림 보존 · 무손실 WebP 변환 · 내용 변경 없음')
extras=[{'media':'research-run','src':MEDIA['research-run']['src'],'assetSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'inputSha256':ca['sha256'],'downloadUrl':ca['url'],'width':w,'height':h}]
MEDIA_PATH.write_text(json.dumps(MEDIA,ensure_ascii=False,indent=2)+'\n')
manifest={'date':'2026-09-12','expectedDates':{'2026-09-05':5,'2026-09-06':6,'2026-09-07':3,'2026-09-08':5},'entries':rows,'additionalLocalAssets':extras}
(APP/'site/news-covers-20260912.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
# This request specifically asks for today's NEWS posting in main; keep all other drafts unchanged.
today='2026-09-12-lithium-disulfur-dichloride-frontier-one';p=APP/'site/content/posts'/(today+'.mdx');s=p.read_text();fm,body=s.split('---',2)[1:];assert re.search(r'^draft: true$',fm,re.M);fm=re.sub(r'^draft: true$','draft: false',fm,flags=re.M)
if not re.search(r'^updatedDate:',fm,re.M):fm=fm.rstrip()+'\nupdatedDate: 2026-09-12\n'
p.write_text('---'+fm+'---'+body)
contract=APP/'scripts/news-source-media-contract.mjs';s=contract.read_text();old="assert.match(fm[1], /^draft: true$/m, `${slug}: this merge does not authorize publication`);";assert old in s
s=s.replace(old,"const authorizedToday = slug === '2026-09-12-lithium-disulfur-dichloride-frontier-one';\n  assert.match(fm[1], authorizedToday ? /^draft: false$/m : /^draft: true$/m, `${slug}: preserve the explicitly authorized publication scope`);")
s=s.replace('four original-first draft articles','four original-first articles with explicit publication scope');contract.write_text(s)
# Add strict full-coverage, source hash, body preservation, and first-image checks.
static=r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const manifest = JSON.parse(read('../site/news-covers-20260912.json'));
const media = JSON.parse(read('../site/news-media.json'));
const postsDir = new URL('../site/content/posts/', import.meta.url);
const target = fs.readdirSync(postsDir).filter((name) => /^2026-09-0[5678].*\.mdx$/.test(name));
assert.equal(target.length, 19, 'September 5–8 coverage must be explicitly reviewed when adding posts');
assert.deepEqual(manifest.entries.map((r) => r.slug + '.mdx').sort(), target.sort());
assert.deepEqual(manifest.expectedDates, {'2026-09-05':5,'2026-09-06':6,'2026-09-07':3,'2026-09-08':5});
const sha = (v) => crypto.createHash('sha256').update(v).digest('hex');
for (const [date, count] of Object.entries(manifest.expectedDates)) assert.equal(manifest.entries.filter((r) => r.date === date).length, count);
for (const row of manifest.entries) {
  const item = media[row.media];
  assert(item && item.slug === row.slug);
  assert.equal(Object.entries(media).find(([, m]) => m.slug === row.slug)?.[0], row.media, 'cover must be first for NewsListItem');
  assert.equal(item.src, row.src);
  assert(row.src.startsWith('/assets/posts/news-covers-20260912/'));
  for (const field of ['alt','caption','credit','source','license','rights','changes']) assert(typeof item[field] === 'string' && item[field].trim(), `${row.media}: missing ${field}`);
  assert(item.alt.length >= 20);
  assert.equal(item.width, row.width); assert.equal(item.height, row.height);
  assert.equal(new URL(item.source).protocol, 'https:'); assert.equal(new URL(item.rights).protocol, 'https:');
  const bytes = fs.readFileSync(new URL('../site/assets' + row.src, import.meta.url));
  assert.equal(sha(bytes), row.assetSha256); assert.equal(bytes.length, row.bytes);
  assert(bytes.subarray(0,4).toString() === 'RIFF' || bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'real WebP/PNG required');
  const source = read('../site/content/posts/' + row.slug + '.mdx');
  const match = source.match(/^---\n([\s\S]*?)\n---/); assert(match);
  assert.match(match[1], /^draft: false$/m); assert.match(match[1], new RegExp('^pubDate: '+row.date+'$', 'm'));
  const body = source.slice(match[0].length).replace(/^import [^\n]+;[ \t]*\n/gm, '').trim();
  const hero = `<NewsFigure media="${row.media}" priority />`;
  assert(body.startsWith(hero), `${row.slug}: image must precede prose`);
  assert.equal(body.split(hero).length, 2);
  assert.equal(sha(body.slice(hero.length).trim()), row.bodyBaselineSha256, `${row.slug}: original body changed`);
  assert.equal(row.legacyVisualSuite, row.slug === '2026-09-07-openai-research-automation-frontier-one');
}
for (const item of manifest.additionalLocalAssets) {
  assert.equal(media[item.media].src, item.src);
  assert.equal(sha(fs.readFileSync(new URL('../site/assets'+item.src, import.meta.url))), item.assetSha256);
}
console.log('news-cover-contract: PASS 19 original-first covers, local image hashes and original prose retained');
'''
(APP/'scripts/news-cover-contract.mjs').write_text(static)
p=APP/'scripts/news-visual-contract.mjs';s=p.read_text();assert 'news-cover-contract' not in s;p.write_text(s+"\nawait import('./news-cover-contract.mjs');\n")
# New hero-only posts are not silently exempted from legacy 3-image/2-diagram tests.
p=APP/'scripts/browser-news-media-audit.mjs';s=p.read_text();s=s.replace("  // Media registration", "  const covers = JSON.parse(fs.readFileSync(new URL('../site/news-covers-20260912.json', import.meta.url), 'utf8'));\n  assert.equal(covers.entries.length, 19);\n  const coverOnly = new Set(covers.entries.filter((r) => !r.legacyVisualSuite).map((r) => r.slug));\n  // Media registration",1)
s=s.replace('    for (const [id, item] of publishedMedia) {','''    for (const row of covers.entries) {
      await evaluate(cdp, sessionId, `document.querySelector('[data-news-card="${row.slug}"]').scrollIntoView({block:'center',behavior:'instant'})`);
      const card = await waitExpression(cdp, sessionId, `(() => {
        const card = document.querySelector('[data-news-card="${row.slug}"]');
        const img = card?.querySelector('figure.news-figure img');
        const title = card?.querySelector('[data-post-transition-title]');
        if (!img || !title || !img.complete || !img.naturalWidth) return null;
        const ir = img.getBoundingClientRect(), tr = title.getBoundingClientRect();
        return {width:img.naturalWidth,height:img.naturalHeight,src:img.getAttribute('src'),
          before:Boolean(img.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING),
          positioned:innerWidth <= 640 ? ir.bottom <= tr.top + 2 : ir.right <= tr.left + 2,
          overflow:document.documentElement.scrollWidth > innerWidth + 2};
      })()`, `cover decoded ${row.slug}`, 20000);
      assert(card.before && card.positioned && !card.overflow, JSON.stringify(card));
      assert.equal(card.src, row.src); assert.equal(card.width, row.width); assert.equal(card.height, row.height);
      console.log(`news-cover-qa: PASS ${row.slug} at ${size.width}px`);
    }
    for (const [id, item] of publishedMedia) {
      const minFigures = coverOnly.has(item.slug) ? 1 : 3;
      const minDiagrams = coverOnly.has(item.slug) ? 0 : 2;''',1)
s=s.replace("`document.querySelectorAll('article figure.news-figure img').length >= 3`","`document.querySelectorAll('article figure.news-figure img').length >= ${minFigures}`")
s=s.replace('`three visuals ${item.slug}`','`required visuals ${item.slug}`')
s=s.replace('result.imageCount >= 3 &&','result.imageCount >= minFigures &&').replace('result.diagramCount >= 2 &&','result.diagramCount >= minDiagrams &&')
p.write_text(s)
# Append rather than replacing any previous copyright material.
p=ROOT/'THIRD_PARTY_NOTICES.md';s=p.read_text();s+='\n## September 5–8 NEWS representative media (2026-09-12)\n\nThese third-party images are not relicensed under the repository MIT license. See `spaceship-ui/site/news-covers-20260912.json` for exact sources, authors, licenses, original PDF pages and local SHA-256 digests. All figure panels/axes are preserved; format conversion and page extraction are disclosed in each caption. CC BY-NC-ND media are for noncommercial, unadapted use; commercial/ad-bearing reuse needs a separate rights review. Publisher/corporate figures marked quotation retain original copyright and trademarks; no general commercial permission is asserted. Original full papers are not distributed with this change.\n\n'
for row in rows:s+=f"- `{row['media']}` — {row['credit']}; {row['license']}; {row['source']}\n"
p.write_text(s)
counts={d:sum(r['date']==d for r in rows) for d in manifest['expectedDates']};assert counts==manifest['expectedDates']
doc='''# 2026-09-12 NEWS publication and September 5–8 cover update

## Scope and verified source distinction

Today's lithium–disulfur dichloride post was already merged in #109, but was still a draft. The present request is implemented by setting only that September 12 article to `draft: false`. The three September 11 drafts remain unchanged. Blogger, analytics, advertising configuration, the source formula ledgers and unrelated PRs/issues are not modified.

All 19 September 5–8 articles receive local representative images: September 5: 5; September 6: 6; September 7: 3; September 8: 5. Existing `NewsFigure` and `NewsListItem` preserve the September 9 visual system: left image on desktop, image before title on mobile. Each article's representative image precedes the prose. Original prose and existing explanatory figures are retained; the old research-cycle figure is moved rather than duplicated.

Source types are explicit. AML uses a separately published 2023 microscopy case report, not PARADIGM participants. Methane uses a 2023 primary-source batch reactor schematic, not Stanford's 2026 autothermal apparatus. The research-automation cover is the cited Epoch AI June taxonomy. Other covers are the cited paper's own figure or official company/report graphic. No generated illustration is presented as an original experiment.

Downloaded accepted manuscripts were validated by `%PDF-` signature before extraction. The complete chosen figure, all panels and axes are retained; ordinary page prose and margins are omitted. Captions appearing on another page are summarized separately rather than invented. Original files were visually inspected before integration; the newly acquired AML figure is inspected from the integration artifact before merge. Commons returned HTTP 429, so its inaccessible microscopy file was not hotlinked as a pretend local asset.

## Verification contracts

The manifest records local bytes, dimensions, SHA-256, sources, rights and original prose fingerprints. Static checks require exactly the 19 target articles and verify image-first ordering, complete date coverage and unchanged prose. Existing September 9 five-article/two-diagram tests are unchanged. The older browser audit assumed every media-bearing post had three figures and two diagrams; it now applies that rule unchanged to the old visual suites and uses an explicit manifest-bounded one-cover contract only for the 18 newly illustrated posts. All 19 cards must decode at 390px and 1440px, precede titles in DOM and layout, and match the local dimensions. September 11 draft exclusion remains required; today's newly published route must now return 200.

All temporary acquisition/patch workflows are removed before merge. Existing Blog CI and Pages workflows are not changed. Actual lint/type/SEO/build/content/browser status and deployment are checked from GitHub Actions; this document does not predeclare their success.

## Rights

Per-image rights remain with their creators. CC BY-NC-ND and imec limitations are recorded, not converted into MIT. Ads are not enabled by this work. Raw publisher PDFs and scraped pages are temporary review inputs, not public blog assets. Local file availability does not by itself grant additional rights.
'''
(APP/'docs/2026-09-12-news-covers-sep05-08.md').write_text(doc)
print(json.dumps({'counts':counts,'covers':len(rows),'localCoverBytes':sum(r['bytes'] for r in rows),'published':today},ensure_ascii=False))

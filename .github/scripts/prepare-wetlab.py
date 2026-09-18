from pathlib import Path
import base64, json, re, hashlib, shutil, urllib.request, subprocess
BASE=Path('checkout');OUT=Path('wetlab-release/files')
slug='2026-09-19-anthropic-wet-lab-mhs-news'
assert subprocess.check_output(['git','-C',str(BASE),'rev-parse','HEAD'],text=True).strip()=='1737c902d9ebed1c9b52cd10e0099c3f244534e8'
def blob(sha):
    req=urllib.request.Request('https://api.github.com/repos/JJo-0/JJo-0.github.io/git/blobs/'+sha,headers={'Accept':'application/vnd.github+json','User-Agent':'wetlab-publication-review'})
    with urllib.request.urlopen(req,timeout=30) as r:obj=json.load(r)
    data=base64.b64decode(obj['content'])
    assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==sha
    return data
def read(p):return (BASE/p).read_text()
def write(p,s):
    f=OUT/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(s)
def dump(p,obj):write(p,json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def change(p,a,b,count=1):
    s=(OUT/p).read_text() if (OUT/p).exists() else read(p)
    assert s.count(a)==count,(p,a,s.count(a));write(p,s.replace(a,b))
def digest(b):return hashlib.sha256(b if isinstance(b,bytes) else b.encode()).hexdigest()
def canonical(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def prose(s):
    s=re.sub(r'^---\n[\s\S]*?\n---\s*','',s).split('## 9.')[0]
    s=re.sub(r'^import .*;\s*$','',s,flags=re.M);s=re.sub(r'<Math\b[\s\S]*?/>','',s)
    s=re.sub(r'<[^>]*>','',s);s=re.sub(r'\[([^\]]+)\]\([^)]*\)',r'\1',s)
    s=re.sub(r'\[\d+\]','',s);s=re.sub(r'[*#|`>]+','',s)
    return re.sub(r'\s+',' ',s).strip()
article=blob('b46faa60f62a26bbd4b4bbda33208b133afaf906').decode()
assert digest(article)=='febd15ec01b07018917f0a4edfab3771daed00e49775e4734a67a337846999fa'
write(f'spaceship-ui/site/content/posts/{slug}.mdx',article)
write('spaceship-ui/scripts/news-wetlab-20260919-contract.mjs',blob('b5ea3e26313d6974c0f0539f074536a8e6388384').decode())
write('spaceship-ui/src/components/post/WetLabTable.astro','''---
interface Props { id: string; label: string; }
const { id, label } = Astro.props;
if (!id || !label || !Astro.slots.has('default')) throw new Error('A labelled, authored table is required.');
---
<div class="wetlab-table" data-wetlab-table={id} role="region" aria-label={label} tabindex="0">
  <slot />
</div>
<style>
  .wetlab-table { max-width:100%; overflow-x:auto; margin:1.5rem 0; border:1px solid var(--color-border); border-radius:0.5rem; }
  .wetlab-table:focus-visible { outline:2px solid var(--color-primary); outline-offset:3px; }
  .wetlab-table :global(table) { width:100%; min-width:32rem; table-layout:fixed; margin:0; font-size:0.88rem; }
  .wetlab-table :global(th), .wetlab-table :global(td) { white-space:normal; overflow-wrap:anywhere; padding:0.7rem; text-align:left; vertical-align:top; line-height:1.7; }
  .wetlab-table :global(th) { font-weight:700; }
</style>
''')
change('spaceship-ui/src/content.config.ts','    pubDate: z.date(),',"    pubDate: z.date(),\n    publicationTimeZone: z.enum(['UTC', 'Asia/Seoul']).default('UTC'),")
write('spaceship-ui/src/lib/utils/date.ts','''export type PublicationTimeZone = 'UTC' | 'Asia/Seoul';

/** Keep the publication instant separate from its editorial calendar date. */
export function formatDate(date: Date, timeZone: PublicationTimeZone = 'UTC') {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone,
  }).format(date);
}

export function formatDateKey(date: Date, timeZone: PublicationTimeZone = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
''')
change('spaceship-ui/src/pages/news.astro','import Layout',"import { formatDateKey } from '@/lib/utils/date';\nimport Layout")
change('spaceship-ui/src/pages/news.astro','post.data.pubDate.toISOString().slice(0, 10)','formatDateKey(post.data.pubDate, post.data.publicationTimeZone)',2)
for p in ['spaceship-ui/src/pages/posts/[...slug]/index.astro','spaceship-ui/src/components/WritingListItem.astro']:
    change(p,'formatDate(post.data.pubDate)','formatDate(post.data.pubDate, post.data.publicationTimeZone)')
change('spaceship-ui/src/components/WritingListItem.astro','      pubDate: Date;',"      pubDate: Date;\n      publicationTimeZone?: 'UTC' | 'Asia/Seoul';")
change('spaceship-ui/src/pages/posts/[...slug]/index.astro','import candidateEdition',"import wetlabEdition from '../../../../site/news-wetlab-20260919.json';\nimport candidateEdition")
change('spaceship-ui/src/pages/posts/[...slug]/index.astro','adsEnabled={!candidateEdition.entries.some((entry) => entry.slug === effectiveSlug)}','adsEnabled={!candidateEdition.entries.some((entry) => entry.slug === effectiveSlug) && !wetlabEdition.entries.some((entry) => entry.slug === effectiveSlug)}')
media=json.loads(read('spaceship-ui/site/news-media.json'));old=json.loads(json.dumps(media))
images=[
 {'filename':'mhs-genentech-workflow.png','sourceUrl':'https://www-cdn.anthropic.com/images/4zrzovbb/website/0aa7623ba0e545ce39e0de725583c0445ce6b76d-1999x1250.png','width':1999,'height':1250,'bytes':288938,'sha':'87868d49973cdb36e4502154208d98904bb09bb8','sha256':'298a48958fec275133ab6076a09931f13da54cc6e86dab06fc06180b074dfb32','contentType':'image/png','sourceByteIdentical':True},
 {'filename':'mhs-genentech-bubbles.jpg','sourceUrl':'https://www-cdn.anthropic.com/images/4zrzovbb/website/943af4b43644ab0d213ba362eabd609c98cd8887-1999x1125.jpg','width':1999,'height':1125,'bytes':173917,'sha':'18da82b86010f46c77db72ae9f60738064ff088a','sha256':'da4cf378e8f4dde71c53b2384f726dd5203dd6b40b661e30eff8518b03fae584','contentType':'image/jpeg','sourceByteIdentical':True}
]
metadata=[
 ('wetlab-genentech-workflow','Genentech MHS 실험 연결도 · Anthropic 공식 원본',
  'Genentech의 MHS 단백질 분석 실험 연결도. 연구자 A, Claude B, 장비별 MHS C, 액체 처리 장치·로봇 팔·플레이트 리더 D와 유량·흡광도·오차를 잇는 주황색 반복 경로를 보여 준다.',
  'A의 연구자가 실험 의도를 전달하면 B의 Claude가 C의 장비별 인터페이스를 통해 D의 세 장비를 조정한다. 주황색 ①–④는 유량 선택, 액체 이동과 측정, 전문가 기준과의 RMSE 비교, 다음 조건 조정을 잇는다. Genentech 협력사 실험의 구조이며 새 Anthropic 실험실의 내부 배치도가 아니다.'),
 ('wetlab-genentech-bubbles','Genentech의 플레이트 거품 확인 · Anthropic 공식 원본',
  '실험용 장갑을 낀 연구자들이 붉은 액체가 담긴 플레이트를 들어 각 웰의 거품을 확인하는 Genentech 실험 장면.',
  '플레이트의 각 웰에서 액체와 거품의 상태를 확인하는 장면이다. 원문은 같은 웰에서 재시도해 거품이 늘어난 과정과, 전문가의 설명을 통해 깨끗한 웰과 줄인 혼합 횟수를 적용한 과정을 함께 설명한다. 이 사진은 Genentech 사례를 나타내며 Anthropic 자체 wet lab의 시설 사진으로 사용하지 않는다.')]
rows=[]
for im,(id,kind,alt,caption) in zip(images,metadata):
    item=dict(slug=slug,src='/assets/posts/news-20260919/'+im['filename'],kind=kind,alt=alt,caption=caption,credit='Anthropic · Genentech 사례, 2026-08-27',source='https://www.anthropic.com/news/model-hardware-standard-research-preview',license='원저작자 권리 보유',rights='https://www.anthropic.com/news/model-hardware-standard-research-preview',changes='원본 파일 바이트 유지 · 화면 표시 크기만 조정',width=im['width'],height=im['height'],sha256=im['sha256'],order=1)
    assert id not in media;media[id]=item
    rows.append({**item,**im,'id':id,'version':'MHS research preview, 2026-08-27','visualReview':{'status':'REVIEWED','imageSha256':im['sha256'],'scope':'Original image and its explanation inspected; no identity claims about pictured people.'},'rightsReview':'Two limited original figures accompany substantial source-specific commentary. Rights remain with the original holders; no CC/MIT relicensing or separate permission is asserted. No Reuters photographs are reproduced.'})
    f=OUT/('spaceship-ui/site/assets'+item['src']);f.parent.mkdir(parents=True,exist_ok=True);data=blob(im['sha']);assert digest(data)==im['sha256'];f.write_bytes(data)
dump('spaceship-ui/site/news-media.json',media)
dump('spaceship-ui/site/assets/assets/posts/news-20260919/provenance.json',rows)
bpath='spaceship-ui/site/news-candidates-20260918-baseline-media.json';baseline=json.loads(read(bpath))
previous=json.loads(read('spaceship-ui/site/news-candidates-20260918.json'))
base60={k:v for k,v in old.items() if k not in previous['mediaIds']}
assert len(base60)==baseline['entries']==60
assert digest(canonical(base60))==baseline['canonicalSha256']
baseline['ids']=sorted(base60);dump(bpath,baseline)
p='spaceship-ui/scripts/news-candidates-20260918-contract.mjs'
change(p,"const preserved = Object.fromEntries(Object.entries(media).filter(([id])=>!edition.mediaIds.includes(id)));", """assert.equal(oldMedia.ids.length, oldMedia.entries);
assert.equal(new Set(oldMedia.ids).size, oldMedia.entries);
for (const id of oldMedia.ids) assert(Object.hasOwn(media, id), `Missing historic media ${id}`);
const preserved = Object.fromEntries(oldMedia.ids.map(id => [id, media[id]]));""")
urls=[u for _,u in re.findall(r'<a id="news-ref-(\d+)" href="([^"]+)"',article)]
refs={str(i+1):{'url':u} for i,u in enumerate(urls)}
counts={i:len(re.findall('data-news-citation="'+i+'"',article)) for i in refs}
entry={'key':'wetlab','slug':slug,'date':'2026-09-19','pubDate':'2026-09-19T00:00:00+09:00','mediaIds':[r['id'] for r in rows],'equations':['wetlab-rmse'],'references':refs,'citationCounts':counts,'bodyCharacters':len(prose(article)),'sha256':digest(article),'mathExpressions':len(re.findall(r'tex=\{String\.raw`([^`]+)`\}',article))}
manifest={'entries':[entry],'baselineMedia':{'baseCommit':'1737c902d9ebed1c9b52cd10e0099c3f244534e8','ids':sorted(old),'sha256':digest(canonical(old))},'sourceBoundary':{'ownLab':'Reuters 2026-09-18 interview; full Reuters HTML request returned HTTP 401, not treated as acquisition. User supplied reporting and public search excerpt were cross-checked.','hardware':'Official Anthropic HTML and exact original figures acquired; Genentech case distinguished from other partners.','sourceImages':'No separate reproduction license asserted; retained rights attribution, limited analysis-associated quotation.'}}
dump('spaceship-ui/site/news-wetlab-20260919.json',manifest)
p='spaceship-ui/scripts/browser-news-candidates.mjs';s=read(p).replace('news-candidates-20260918.json','news-wetlab-20260919.json').replace("const out='candidates-review'","const out='wetlab-review'").replace('candidates-browser','wetlab-browser')
a=s.index('    const expectedOrder=');b=s.index('    assert.equal(await js',a)
s=s[:a]+'''    assert.equal(await js(`document.querySelector('[data-news-card="${edition.slug}"]')?.closest('[data-news-date]')?.getAttribute('data-news-date')`),edition.date,'Korean editorial date group');
'''+s[b:]
needle="    await js('document.fonts.ready.then(()=>true)');"
s=s.replace(needle,needle+'''\n    assert(await js(`Array.from(document.querySelectorAll('time')).some(t=>t.dateTime==='2026-09-18T15:00:00.000Z'&&t.textContent.includes('Sep 19, 2026'))`),'Correct publication instant and Korean date');
    assert(!(await js(`!!document.querySelector('[data-adsense-deferred],meta[name="google-adsense-account"]')`)),'No advertising on quoted scholarly figures');''')
s=s.replace('    const referenceNumbers=', '''    for(const tableId of ['wetlab-roles','wetlab-results','wetlab-timeline','wetlab-next']){
      const layout=await js(`(()=>{const r=document.querySelector('[data-wetlab-table="${tableId}"]');const t=r?.querySelector('table');return {exists:!!t,focus:r?.tabIndex===0,width:r?.clientWidth,content:r?.scrollWidth};})()`);
      assert(layout.exists&&layout.focus);if(width===1440)assert(layout.content<=layout.width+2,'Table fits desktop article');
    }
    await js(`document.querySelector('[data-wetlab-table="wetlab-results"]').scrollIntoView({block:'center',behavior:'instant'})`);
    await shot(`results-${width}-${dark?'dark':'light'}`);
    const referenceNumbers=''',1)
write('spaceship-ui/scripts/browser-wetlab.mjs',s)
p='.github/workflows/blog-pages-deploy.yml'
needle='      - name: Preserve live candidate reading evidence'
change(p,needle,'''      - name: Live wet-lab article reading
        timeout-minutes: 4
        run: node scripts/browser-wetlab.mjs

'''+needle)
needle='      - name: Publish Pages live-smoke status'
change(p,needle,'''      - name: Preserve live wet-lab reading evidence
        if: always()
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02
        with:
          name: wetlab-live-${{ github.run_id }}-${{ github.run_attempt }}
          path: spaceship-ui/wetlab-review/
          retention-days: 14

'''+needle)
s=read('.github/workflows/news-candidates-reading.yml')
s=s.replace('Candidate articles reading','Wet-lab article reading').replace('news-candidates-reading.yml','wetlab-reading.yml').replace('candidates-reading','wetlab-reading').replace('news-candidates-20260918-contract.mjs','news-wetlab-20260919-contract.mjs').replace('Four articles native reading matrix','Wet-lab native reading matrix').replace('browser-news-candidates.mjs','browser-wetlab.mjs').replace('candidates-review','wetlab-review').replace('site/news-candidates-20260918.json','site/news-wetlab-20260919.json').replace('site/assets/assets/posts/news-20260918-candidates/provenance.json','site/assets/assets/posts/news-20260919/provenance.json').replace('JJO_CANDIDATE_REPORT','JJO_WETLAB_REPORT')
write('.github/workflows/wetlab-reading.yml',s)
change('spaceship-ui/scripts/news-visual-contract.mjs',"import './news-candidates-20260918-contract.mjs';","import './news-wetlab-20260919-contract.mjs';\nimport './news-candidates-20260918-contract.mjs';")
records=[]
for f in sorted(OUT.rglob('*')):
    if not f.is_file():continue
    rel=f.relative_to(OUT).as_posix();assert rel.startswith(('spaceship-ui/','.github/workflows/'));assert '..' not in Path(rel).parts
    data=f.read_bytes();sha=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
    records.append({'path':rel,'sha':sha,'sha256':digest(data),'bytes':len(data)})
    target=BASE/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,target)
assert len(records)==19
(OUT.parent/'files-map.json').write_text(json.dumps(records,indent=2)+'\n')
print(json.dumps({'base':'1737c902d9ebed1c9b52cd10e0099c3f244534e8','entry':entry,'files':records},ensure_ascii=False,indent=2))

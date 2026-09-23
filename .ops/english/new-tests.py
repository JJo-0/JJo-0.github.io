from pathlib import Path
app=Path('spaceship-ui')
def write(p,s):
 f=app/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(s)
write('scripts/english-citations.test.mjs',r'''import assert from 'node:assert/strict';
import transform from '../src/lib/remark/english-citations.mjs';
const paragraph=(s)=>({type:'paragraph',children:[{type:'text',value:s}]});
const fixture=()=>({type:'root',children:[paragraph('Claim [1][2].'),paragraph('[1] Source one'),paragraph('[2] Source two')]});
let tree=fixture(); transform()(tree,{path:'/site/content/english/example.mdx'});
assert.equal(tree.children[0].children.filter(n=>n.type==='link').length,2);
assert.equal(tree.children[1].data.hProperties.id,'news-ref-1');
assert.equal(tree.children[0].children[1].data.hProperties['data-astro-reload'],true);
let ko=fixture(); const saved=JSON.stringify(ko);transform()(ko,{path:'/site/content/posts/example.mdx'});assert.equal(JSON.stringify(ko),saved);
let duplicate=fixture();duplicate.children.push(paragraph('[1] Duplicate'));assert.throws(()=>transform()(duplicate,{path:'/site/content/english/x.mdx'}),/Duplicate/);
let missing=fixture();missing.children[0]=paragraph('Unknown [3]');assert.throws(()=>transform()(missing,{path:'/site/content/english/x.mdx'}),/Undefined/);
console.log('english-citations: PASS real transform, Korean isolation, duplicate and undefined references rejected');
''')
write('scripts/english-edition-audit.py',r'''import hashlib, json, re
from pathlib import Path
from html.parser import HTMLParser
root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'site/english-edition.json').read_text())
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(); self.tags=[]; self.feed(text)
    def handle_starttag(self,tag,attrs): self.tags.append((tag,dict(attrs)))
    def select(self,tag,**attrs): return [a for t,a in self.tags if t==tag and all(a.get(k)==v for k,v in attrs.items())]
def check(value,message):
    if not value: raise AssertionError(message)
def body(s): return s.split('---',2)[2]
def math(s): return re.findall(r'<Math\b[^>]*tex=\{("(?:[^"\\]|\\.)*")\}',s)
pages=[]
for p in manifest['pairs']:
    ko=root/'site/content/posts'/p['koFile']; en=root/'site/content/english'/p['enFile']
    for file,key in [(ko,'sourceSha256'),(en,'englishSha256')]:
        check(hashlib.sha256(file.read_bytes()).hexdigest()==p[key],f'Unreviewed source change: {file}')
    a,b=body(ko.read_text()),body(en.read_text())
    check(len(re.findall(r'^## ',a,re.M))==len(re.findall(r'^## ',b,re.M)),p['key']+' H2 coverage')
    check(len(re.findall(r'^### ',a,re.M))==len(re.findall(r'^### ',b,re.M)),p['key']+' H3 coverage')
    check(math(a)==math(b),p['key']+' equations')
    am=re.findall(r'<NewsFigure media="([^"]+)"',a);bm=re.findall(r'<NewsFigure media="([^"]+)"',b)
    check(am==bm,p['key']+' source figures and order')
    refs=re.findall(r'^\[(\d+)\] ',b,re.M)
    check(refs and len(refs)==len(set(refs)),p['key']+' unique references')
    html=(root/'dist/en/posts'/p['enSlug']/'index.html').read_text(); page=Page(html)
    check(page.select('html',lang='en'),p['key']+' HTML language')
    check(page.select('link',rel='canonical',href=f"https://jjo-0.github.io/en/posts/{p['enSlug']}/"),p['key']+' canonical')
    check(page.select('link',rel='alternate',hreflang='ko-KR',href=f"https://jjo-0.github.io/posts/{p['koSlug']}/"),p['key']+' reciprocal KO')
    check(page.select('meta',property='og:locale',content='en_US'),p['key']+' OG locale')
    for n in refs:
        check(len([a for t,a in page.tags if a.get('id')==f'news-ref-{n}'])==1,p['key']+' reference target '+n)
    links=[a for t,a in page.tags if t=='a' and 'data-news-citation' in a]
    check(links and all(a.get('href')=='#news-ref-'+a['data-news-citation'] for a in links),p['key']+' native citations')
    check('pagead2.googlesyndication.com' not in html and 'google-adsense-account' not in html,p['key']+' no ads')
    check('katex-error' not in html,p['key']+' math rendering')
    koh=Page((root/'dist/posts'/p['koSlug']/'index.html').read_text())
    check(koh.select('link',rel='alternate',hreflang='en',href=f"https://jjo-0.github.io/en/posts/{p['enSlug']}/"),p['key']+' KO to EN hreflang')
    pages.append({'key':p['key'],'headings':len(re.findall(r'^## ',b,re.M)),'figures':len(bm),'references':len(refs),'citations':len(links),'equations':len(math(b))})
for route in ['','research','about','news','posts','translations']:
    html=(root/'dist/en'/route/'index.html').read_text();p=Page(html)
    check(p.select('html',lang='en'),route+' English lang')
    check('translate.google.com' not in html,route+' no proxy')
    check(not p.select('link',rel='alternate',hreflang='ko-KR') if route in ['posts','translations'] else p.select('link',rel='alternate',hreflang='ko-KR'),route+' only equivalent alternates')
search=json.loads((root/'dist/en/api/search.json').read_text())
check(len(search)==len(pages) and all(p['href'].startswith('/en/posts/') for p in search),'locale scoped search')
rss=(root/'dist/en/rss.xml').read_text();check('<language>en</language>' in rss and rss.count('<item>')==len(pages),'English RSS')
check(len(list((root/'site/content/english').glob('*.mdx')))==len(pages),'every published translation registered')
output=root/'english-review';output.mkdir(exist_ok=True)
(output/'static.json').write_text(json.dumps({'passed':True,'articles':pages},indent=2))
print('english-edition-audit: PASS',json.dumps(pages))
''')
write('scripts/browser-english-edition.mjs',r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cdp, BASE, attach, evaluate, navigate, viewport, waitExpression, startPreview, startChrome, stopChild, removeProfile } from './browser-smoke-harness.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../site/english-edition.json',import.meta.url),'utf8'));
const out='english-review';fs.mkdirSync(out,{recursive:true});
const results=[];let preview,chrome,cdp,sessionId;
const hardStop=setTimeout(()=>{console.error('English audit timed out');process.exit(1)},180_000);
async function enter(selector){
  await evaluate(cdp,sessionId,`(()=>{const a=document.querySelector(${JSON.stringify(selector)});if(!a)throw new Error('Missing native link');a.scrollIntoView({block:'center',behavior:'instant'});a.focus()})()`);
  await cdp.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
}
async function screen(name){const {data}=await cdp.send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${out}/${name}.png`,Buffer.from(data,'base64'));}
try{
  preview=await startPreview();chrome=await startChrome();cdp=await Cdp.connect(chrome.url);({sessionId}=await attach(cdp,{normalizeHistoryPath:false}));
  for(const width of [390,1440]){
    await viewport(cdp,sessionId,{width,height:900,mobile:width===390,touch:width===390,reduced:false});
    for(const pair of manifest.pairs){
      await navigate(cdp,sessionId,`/posts/${pair.koSlug}/`);
      await enter('header a[data-locale-choice="en"]');
      await waitExpression(cdp,sessionId,`location.pathname === '/en/posts/${pair.enSlug}/' && document.documentElement.lang === 'en'`,'KO to exact EN article');
      for(const dark of [false,true]){
        await evaluate(cdp,sessionId,`document.documentElement.classList.toggle('dark',${dark})`);
        const rendered=await evaluate(cdp,sessionId,`(()=>{const article=document.querySelector('[data-english-article]');return {language:document.documentElement.lang,text:article.innerText.length,korean:/[가-힣]/.test(article.innerText),images:article.querySelectorAll('[data-news-figure]').length,news:Boolean(document.querySelector('header a[href="/en/news/"][aria-current="page"]')),overflow:document.documentElement.scrollWidth>innerWidth+2,mathErrors:article.querySelectorAll('.katex-error').length}})()`);
        assert.equal(rendered.language,'en');assert(rendered.text>9000 && !rendered.korean && rendered.news && !rendered.overflow && rendered.images>0 && !rendered.mathErrors,JSON.stringify(rendered));
        results.push({width,slug:pair.enSlug,dark,...rendered});
      }
      const history=await cdp.send('Page.getNavigationHistory',{},sessionId);const before=history.entries[history.currentIndex].id;
      await enter('article a[data-news-citation="1"]');
      await waitExpression(cdp,sessionId,`location.pathname === '/en/posts/${pair.enSlug}/' && location.hash === '#news-ref-1'`,'native EN citation');
      await cdp.send('Page.navigateToHistoryEntry',{entryId:before},sessionId);
      await waitExpression(cdp,sessionId,`location.pathname === '/en/posts/${pair.enSlug}/' && location.hash === ''`,'native Back');
      await enter('header a[data-locale-choice="ko"]');
      await waitExpression(cdp,sessionId,`location.pathname === '/posts/${pair.koSlug}/'`,'EN to exact KO article');
    }
    for(const route of ['/en/','/en/research/','/en/about/','/en/news/','/en/posts/','/en/translations/']){
      await navigate(cdp,sessionId,route);
      const result=await evaluate(cdp,sessionId,`({language:document.documentElement.lang,h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth+2,links:[...document.querySelectorAll('header nav a')].map(a=>a.getAttribute('href'))})`);
      assert.equal(result.language,'en');assert.equal(result.h1,1);assert(!result.overflow);assert(result.links.every(h=>h.startsWith('/en/')));
      if(width===390 && ['/en/','/en/news/','/en/about/'].includes(route))await screen('mobile-'+(route.split('/')[2]||'home'));
    }
  }
  await navigate(cdp,sessionId,'/en/news/');await enter('header button[aria-label="Search"]');
  await waitExpression(cdp,sessionId,`document.activeElement === document.querySelector('[data-search-dialog] input[placeholder]')`,'English search dialog focus');
  await cdp.send('Input.insertText',{text:'electrolyte'},sessionId);
  await waitExpression(cdp,sessionId,`Boolean(document.querySelector('[data-search-dialog] a[href="/en/posts/solid-state-electrolyte-thin-films/"]'))`,'English search result');
  await enter('[data-search-dialog] a[href="/en/posts/solid-state-electrolyte-thin-films/"]');
  await waitExpression(cdp,sessionId,`location.pathname === '/en/posts/solid-state-electrolyte-thin-films/'`,'native English result');
  await navigate(cdp,sessionId,'/');await evaluate(cdp,sessionId,`localStorage.removeItem('jjo-locale')`);
  await cdp.send('Emulation.setLocaleOverride',{locale:'en-US'},sessionId);
  await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(navigator,'languages',{get:()=>['en-US','en']});Object.defineProperty(navigator,'language',{get:()=>'en-US'});`},sessionId);
  await navigate(cdp,sessionId,'/');await waitExpression(cdp,sessionId,`document.querySelector('[data-language-hint]')?.hidden === false`,'foreign-language preference hint');
  assert.equal(await evaluate(cdp,sessionId,'location.pathname'),'/');
  await enter('[data-language-dismiss]');
  assert.equal(await evaluate(cdp,sessionId,`localStorage.getItem('jjo-locale')`),'ko');
  await navigate(cdp,sessionId,'/en/translations/?from=%2Fposts%2Funknown%2F');
  assert.equal(await evaluate(cdp,sessionId,`Boolean(document.querySelector('[data-requested-translation]:not([hidden])'))`),true);
  fs.writeFileSync(`${out}/browser.json`,JSON.stringify({base:BASE,results,nativeLanguageRoundTrips:8,nativeCitationBack:8,search:true,preference:true},null,2));
  console.log('english-browser: PASS '+results.length+' article/theme/viewport cases plus exact language navigation, citations/Back, index pages, search and language preference');
}catch(error){console.error(error);fs.writeFileSync(`${out}/failure.json`,JSON.stringify({error:String(error),results},null,2));if(cdp&&sessionId)await screen('failure').catch(()=>{});process.exitCode=1;}
finally{cdp?.close();await stopChild(chrome?.child,'SIGKILL');await stopChild(preview,'SIGTERM');removeProfile(chrome?.profile);clearTimeout(hardStop);process.exit(process.exitCode||0);}
''')
p=Path('.github/workflows/english-edition.yml');p.write_text('''name: English edition
on:
  pull_request:
    branches: [main]
    paths: ['spaceship-ui/**', '.github/workflows/english-edition.yml']
  push:
    branches: [main]
    paths: ['spaceship-ui/**', '.github/workflows/english-edition.yml']
permissions:
  contents: read
concurrency:
  group: english-edition-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
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
      - run: node scripts/english-citations.test.mjs
      - run: pnpm build
      - run: python3 scripts/english-edition-audit.py
      - run: node scripts/browser-english-edition.mjs
      - name: Record source
        if: always()
        run: mkdir -p english-review && git rev-parse HEAD > english-review/tested-sha.txt
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: english-edition-${{ github.run_id }}-${{ github.run_attempt }}
          path: spaceship-ui/english-review/
          retention-days: 7
''')
# Use the same code block styling as the existing reading pages.
p=app/'src/pages/en/posts/[...slug]/index.astro';s=p.read_text().replace("import Layout from '@/layouts/Layout.astro';","import Layout from '@/layouts/Layout.astro';\nimport '@/styles/code-blocks.css';");p.write_text(s)

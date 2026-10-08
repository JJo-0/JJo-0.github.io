import hashlib, json, re
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

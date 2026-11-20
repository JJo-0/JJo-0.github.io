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
def math(s):
    return re.findall(r'<Math\b[^>]*tex=\{(?:String\.raw`([^`]+)`|("(?:[^"\\]|\\.)*"))\}',s)
pages=[]
for p in manifest['pairs']:
    ko=root/'site/content/posts'/p['koFile']; en=root/'site/content/english'/p['enFile']
    for file,key in [(ko,'sourceSha256'),(en,'englishSha256')]:
        check(hashlib.sha256(file.read_bytes()).hexdigest()==p[key],f'Unreviewed source change: {file}')
    a,b=body(ko.read_text()),body(en.read_text())
    check(len(re.findall(r'^## ',a,re.M))==len(re.findall(r'^## ',b,re.M)),p['key']+' H2 coverage')
    check(len(re.findall(r'^### ',a,re.M))==len(re.findall(r'^### ',b,re.M)),p['key']+' H3 coverage')
    check(sorted(math(a))==sorted(math(b)) if p.get('translationMethod')=='direct-chat-translation' else math(a)==math(b),p['key']+' equations')
    check(len(re.findall(r'^\s*\|',a,re.M))==len(re.findall(r'^\s*\|',b,re.M)),p['key']+' table row coverage')
    am=re.findall(r'<NewsFigure media="([^"]+)"',a);bm=re.findall(r'<NewsFigure media="([^"]+)"',b)
    check(am==bm,p['key']+' source figures and order')
    reference_body=re.sub(r'^```[^\n]*\n.*?^```[^\n]*$', '', b, flags=re.M|re.S)
    refs=re.findall(r'^\[(\d+)\] ',reference_body,re.M)
    check(len(refs)==len(set(refs)),p['key']+' unique references')
    html=(root/'dist/en/posts'/p['enSlug']/'index.html').read_text(); page=Page(html)
    check(page.select('html',lang='en'),p['key']+' HTML language')
    check(page.select('link',rel='canonical',href=f"https://jjo-0.github.io/en/posts/{p['enSlug']}/"),p['key']+' canonical')
    check(page.select('link',rel='alternate',hreflang='ko-KR',href=f"https://jjo-0.github.io/posts/{p['koSlug']}/"),p['key']+' reciprocal KO')
    check(page.select('meta',property='og:locale',content='en_US'),p['key']+' OG locale')
    for n in refs:
        check(len([a for t,a in page.tags if a.get('id')==f'news-ref-{n}'])==1,p['key']+' reference target '+n)
    links=[a for t,a in page.tags if t=='a' and 'data-news-citation' in a]
    check(all(a.get('href')=='#news-ref-'+a['data-news-citation'] for a in links),p['key']+' native citations')
    if refs: check(bool(links),p['key']+' bibliography has native citations')
    check('pagead2.googlesyndication.com' not in html and 'google-adsense-account' not in html,p['key']+' no ads')
    check('katex-error' not in html,p['key']+' math rendering')
    koh=Page((root/'dist/posts'/p['koSlug']/'index.html').read_text())
    check(koh.select('link',rel='alternate',hreflang='en',href=f"https://jjo-0.github.io/en/posts/{p['enSlug']}/"),p['key']+' KO to EN hreflang')
    pages.append({'key':p['key'],'headings':len(re.findall(r'^## ',b,re.M)),'figures':len(bm),'references':len(refs),'citations':len(links),'equations':len(math(b))})
for route in ['', 'research', 'about', 'news', 'posts', 'translations', 'bible', 'bible/reading-guide',
              'policies', 'policies/copyright', 'policies/disclaimer', 'policies/health', 'policies/finance',
              'notices/2026-09-11-biblical-studies-and-policies']:
    html=(root/'dist/en'/route/'index.html').read_text();p=Page(html)
    check(p.select('html',lang='en'),route+' English lang')
    check('translate.google.com' not in html,route+' no proxy')
    check(not p.select('link',rel='alternate',hreflang='ko-KR') if route == 'translations' else p.select('link',rel='alternate',hreflang='ko-KR'),route+' only equivalent alternates')
search=json.loads((root/'dist/en/api/search.json').read_text())
sources=json.loads((root/'dist/api/search.json').read_text())
by_source={p['koSlug']:p['enSlug'] for p in manifest['pairs']}
# The reader follows the same subjects, series, publication dates and articles
# in either locale, including originals whose full translation is still pending.
def rendered(route):
    return Page((root/'dist'/route/'index.html').read_text())

def values(page, attribute):
    return [attrs[attribute] for _, attrs in page.tags if attribute in attrs]

def article_links(page):
    return [a['href'].strip('/').rsplit('/', 1)[-1] for tag, a in page.tags
            if tag == 'a' and 'data-post-transition-slug' in a]

for route, markers in [('posts', ['aria-controls', 'data-series-group', 'data-acts-card']),
                       ('research', ['data-research-section', 'data-series-group']),
                       ('news', ['data-news-date', 'data-news-field', 'data-news-figure'])]:
    ko, en = rendered(route), rendered('en/'+route)
    for marker in markers:
        check(values(ko,marker) == values(en,marker), f'{route} matching {marker} and order')
    links = article_links(ko)
    check(links and [by_source.get(slug, slug) for slug in links] == article_links(en),
          f'{route} matching article order')
    check(all(a.get('href', '').startswith('/en/posts/') for tag,a in en.tags
              if tag == 'a' and 'data-post-transition-slug' in a), route+' English article destinations')

topic_path = Path('posts/tag')
ko_tags = {p.name for p in (root/'dist'/topic_path).iterdir() if p.is_dir()}
en_tags = {p.name for p in (root/'dist/en'/topic_path).iterdir() if p.is_dir()}
check(ko_tags and ko_tags == en_tags, 'Matching topic pages')
for tag in ko_tags:
    ko, en = rendered(topic_path/tag), rendered('en'/topic_path/tag)
    links = article_links(ko)
    check(links and [by_source.get(slug, slug) for slug in links] == article_links(en),
          f'{tag} matching topic articles')
    check(en.select('html', lang='en') and all(a['href'].startswith('/en/posts/')
          for t,a in en.tags if t == 'a' and 'data-post-transition-slug' in a),
          f'{tag} English topic destinations')
expected={f"/en/posts/{by_source.get(p['id'],p['id'])}/" for p in sources}
check(len(search)==len(sources) and {p['href'] for p in search}==expected,'locale scoped search covers every published original')
for item in search:
    check(all(isinstance(item['data'].get(k),str) and item['data'][k].strip() for k in ('title','description')),
          item['href']+' missing card copy')
    check(not re.search('[가-힣]', item['data']['title']+' '+item['data']['description']),
          item['href']+' missing English card copy (add title and description to src/data/english-post-cards.json)')
    check((root/'dist'/item['href'].strip('/')/'index.html').is_file(),item['href']+' search destination')
rss=(root/'dist/en/rss.xml').read_text();check('<language>en</language>' in rss and rss.count('<item>')==len(pages),'English RSS')
check(len([p for p in (root/'site/content/english').iterdir() if p.suffix in {'.md', '.mdx'}])==len(pages),'every published translation registered')
output=root/'english-review';output.mkdir(exist_ok=True)
(output/'static.json').write_text(json.dumps({'passed':True,'articles':pages},indent=2))
print('english-edition-audit: PASS',json.dumps(pages))

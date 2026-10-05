import hashlib,json,re,struct
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

import hashlib,json,re,struct,xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1]
E=json.loads((R/'site/news-edition-20261002.json').read_text());P=json.loads((R/'site/news-media-provenance-20261002.json').read_text())
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.tags=[];self.feed(s)
 def handle_starttag(self,t,attrs):self.tags.append((t,dict(attrs)))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def checkpage(html,e,lang):
 p=Page(html)
 assert any(t=='html' and a.get('lang')==lang for t,a in p.tags)
 assert re.search(r'<time[^>]*>\s*(?:2026-10-02|Oct 2, 2026)\s*</time>',html)
 assert 'google-adsense-account' not in html and 'pagead2.googlesyndication.com' not in html
 assert 'katex-error' not in html
 assert [a['data-news-figure'] for t,a in p.tags if 'data-news-figure' in a]==e['mediaIds']
 refs=[a for t,a in p.tags if a.get('id','').startswith('news-ref-')];assert len(refs)==3
 cites=[a for t,a in p.tags if t=='a' and 'data-news-citation' in a];assert len(cites)>=8
 for a in cites:assert a['href']=='#news-ref-'+a['data-news-citation'] and sum(b.get('id')==a['href'][1:] for t,b in p.tags)==1
 eq=[a['data-candidate-equation'] for t,a in p.tags if 'data-candidate-equation' in a]
 assert len(eq)==len(set(eq))==2
 assert sum('data-beginner-guide' in a for t,a in p.tags)==1
 return {'citations':len(cites),'equations':2,'figures':2}
assert E['date']=='2026-10-02' and [e['key'] for e in E['entries']]==['lace','drf','glass']
assert len(P['assets'])==6
for asset in P['assets']:
 p=R/'site/assets'/asset['src'].lstrip('/');b=p.read_bytes();assert digest(p)==asset['sha256']
 if asset['originalPaperFigure']:
  assert b[:8]==b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',b[16:24])==(asset['width'],asset['height'])
  assert asset['reviewedImageSha256']==asset['sha256'] and asset['license']=='CC BY 4.0'
 else:
  root=ET.fromstring(b);assert root.tag.endswith('svg') and (int(root.attrib['width']),int(root.attrib['height']))==(1200,700)
  assert b'Not experimental data' in b and b'<image' not in b and b'<script' not in b
rows=[]
for e in E['entries']:
 ko=R/'site/content/posts'/(e['slug']+'.mdx');en=R/'site/content/english'/('en-'+e['enSlug']+'.mdx')
 assert digest(ko)==e['sourceSha256'] and digest(en)==e['englishSha256']
 a,b=ko.read_text(),en.read_text()
 assert len(re.findall(r'^## ',a,re.M))==len(re.findall(r'^## ',b,re.M))==8
 assert len(re.findall(r'^### ',a,re.M))==len(re.findall(r'^### ',b,re.M))==2
 assert re.findall(r'tex=\{String.raw`([^`]+)`\}',a)==re.findall(r'tex=\{String.raw`([^`]+)`\}',b)
 assert len(re.findall(r'<CandidateEquation ',a))==len(re.findall(r'</CandidateEquation>',a))==2
 assert len(re.findall(r'<CandidateEquation ',b))==len(re.findall(r'</CandidateEquation>',b))==2
 assert re.findall(r'<NewsFigure media="([^"]+)"',a)==re.findall(r'<NewsFigure media="([^"]+)"',b)==e['mediaIds']
 assert len([x for x in a.splitlines() if x.startswith('|')])==len([x for x in b.splitlines() if x.startswith('|')])>=5
 if e['key']=='lace':
  for value in ['0.945','0.870','0.571','7,109','not retrieved','not a guarantee']:assert value in b
 elif e['key']=='drf':
  for value in ['14 datasets','18 metrics','15 of 18','0.63%','10.3%','not a model pass mark']:assert value in b
 else:
  for value in ['917','316','0.323','0.172','0.883','not only','not records of a physical robot','23 July 2026']:assert value in b
 for lang,path in [('ko','posts/'+e['slug']),('en','en/posts/'+e['enSlug'])]:
  html=(R/'dist'/path/'index.html').read_text();rows.append({'key':e['key'],'lang':lang,**checkpage(html,e,lang)})
for lang,path,attr,key in [('ko','news','data-news-card','slug'),('en','en/news','data-english-card','enSlug')]:
 page=Page((R/'dist'/path/'index.html').read_text());expected=[e[key] for e in E['entries']]
 assert [a[attr] for t,a in page.tags if a.get(attr) in expected]==expected
# Scientific teaching arithmetic; no new biological or robot measurements.
assert abs((0.323-0.172)/0.323*100-46.7492)<0.001
assert abs((0.883-0.651)*100-23.2)<1e-8
assert abs(31/4950*100-0.6262626)<0.0001
assert abs((0.91-0.9)/(1-0.9)-0.1)<1e-8
# Lossless source graph transport retains every new article and native anchor.
home=(R/'dist/index.html').read_text();hp=Page(home);match=re.search(r'<script\b[^>]*data-post-graph-source[^>]*>([\s\S]*?)</script>',home);assert match
payload=match.group(1);assert '<' not in payload;graph=json.loads(payload)
assert len(home.encode())<=252*1024
assert len(graph['nodes'])==sum(t=='a' and 'data-post-graph-node' in a for t,a in hp.tags)
for date in ['20261002','20261003']:
 for e in json.loads((R/f'site/news-edition-{date}.json').read_text())['entries']:assert any(n['href'].rstrip('/')=='/posts/'+e['slug'] for n in graph['nodes'])
e=E['entries'][0];html=(R/'dist/posts'/e['slug']/'index.html').read_text()
for bad in [html.replace('id="news-ref-1"','id="lost-reference"'),html.replace('oct02-lace-contract','lost-figure'),html+'<meta name="google-adsense-account">']:
 assert bad!=html
 try:checkpage(bad,e,'ko')
 except AssertionError:pass
 else:raise AssertionError('Invalid page mutation accepted')
out=R/'oct02-review';out.mkdir(exist_ok=True);(out/'static.json').write_text(json.dumps({'passed':True,'rows':rows,'originalPaperFigures':2,'teachingFigures':4,'rejectedMutations':3,'homeBytes':len(home.encode()),'graphNodes':len(graph['nodes'])},indent=2))
print('oct02-contract: PASS '+json.dumps(rows))

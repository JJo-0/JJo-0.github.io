import hashlib,json,re,struct
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
 p=Page(text);assert re.search(r'<time[^>]*>\s*(?:2026-09-25|Sep 25, 2026)\s*</time>',text)
 assert any(t=='html' and a.get('lang')==lang for t,a in p.tags)
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
# Check the actual serialized graph, without reducing its node inventory.
home=(R/'dist/index.html').read_text();hp=Page(home)
graph=json.loads(next(a['data-post-graph'] for t,a in hp.tags if 'data-post-graph' in a))
assert len(home.encode())<=240*1024
assert len(graph['nodes'])==len([1 for t,a in hp.tags if t=='a' and 'data-post-graph-node' in a])
for node in graph['nodes']:
 for axis in ['x','y','z']:assert abs(node[axis]-round(node[axis],4))<1e-10
for entry in E['entries']:assert any(n['href'].rstrip('/')=='/posts/'+entry['slug'] for n in graph['nodes'])
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

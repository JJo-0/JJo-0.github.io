"""Validate complete English Modern AI articles, including shared formula UI."""
from html.parser import HTMLParser
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
class Article(HTMLParser):
 def __init__(self,s):
  super().__init__();self.depth=0;self.skip=0;self.korean=[];self.formulas=[];self.copies={};self.current=None;self.payloads=[];self.payload=False;self.buffer='';self.feed(s)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='article' and ('data-english-article' in a or self.depth):self.depth+=1
  if self.depth:
   if 'data-formula-id' in a:self.formulas.append(a);self.current=a['data-formula-id']
   if 'data-copy-tex' in a:self.copies[self.current]=a['data-copy-tex']
   if tag in ('script','style'):self.skip+=1
   if tag=='script' and 'data-formula-lesson-payload' in a:self.payload=True;self.buffer=''
 def handle_endtag(self,tag):
  if tag=='script' and self.payload:self.payloads.append(json.loads(self.buffer));self.payload=False
  if tag in ('script','style') and self.skip:self.skip-=1
  if tag=='article' and self.depth:self.depth-=1
 def handle_data(self,text):
  if self.payload:self.buffer+=text
  if self.depth and not self.skip and re.search('[가-힣]',text):self.korean.append(text.strip())
m=json.loads((root/'site/english-edition.json').read_text())
for pair in m['pairs']:
 if pair['koFile'] not in ['mordern-artificial-intelligence.mdx','modern-artificial-intelligence-2.mdx','modern-artificial-intelligence-3.mdx','modern-artificial-intelligence-4.mdx','modern-artificial-intelligence-5.mdx','modern-artificial-intelligence-6.mdx','modern-artificial-intelligence-7.mdx','modern-artificial-intelligence-8.mdx']:continue
 a=(root/'site/content/posts'/pair['koFile']).read_text();b=(root/'site/content/english'/pair['enFile']).read_text()
 quoted=lambda s: [(i,json.loads(tex)) for i,tex in re.findall(r'<Math formulaId="([^"]+)" display tex=\{("(?:[^"\\]|\\.)*")\}',s)]
 assert quoted(a)==quoted(b),pair['key']+': direct equation identities and TeX'
 refs=lambda s: re.findall(r'<SourceFormula\b[^>]*formula=\{part\dFormula\([\x27"]([^\x27"]+)[\x27"]\)\}',s)
 assert refs(a)==refs(b),pair['key']+': source-ledger equations'
 html=(root/'dist/en/posts'/pair['enSlug']/'index.html').read_text();article=Article(html)
 assert not article.korean,article.korean[:5]
 assert not re.search('[가-힣]',json.dumps(article.payloads,ensure_ascii=False)),pair['key']+': lesson payload language'
 if pair['koFile'][-5] in '678':
  advanced=lambda s: re.findall(r"modernAiFormula\((\d), ['\"]([^'\"]+)['\"]\)",s)
  assert advanced(a)==advanced(b),pair['key']+': advanced source equations'
  raw=lambda s: re.findall(r'String.raw`([^`]*)`',s)
  assert raw(a)==raw(b),pair['key']+': direct raw TeX'
  assert len(article.formulas)==len(advanced(a)),pair['key']+': advanced formula count'
 else: assert len(article.formulas)==len(quoted(a))+len(refs(a)),(pair['key'],len(article.formulas),len(quoted(a)),len(refs(a)))
 if quoted(a):
  rendered=article.copies
  for ident,tex in quoted(a):assert rendered[ident]==tex,ident
 print(pair['enSlug']+': PASS; '+str(len(article.formulas))+' equations; '+str(len(article.payloads))+' English lesson payloads; no visible Korean')

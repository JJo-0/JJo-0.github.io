from pathlib import Path
import hashlib,json
R=Path.cwd();out=R.parent/'oct02-receipt';j=json.loads((out/'assembly.json').read_text());paths={r['path'] for r in j['files']}
def patch(path,a,b):
 p=R/path;s=p.read_text();assert s.count(a)==1,(path,a);p.write_text(s.replace(a,b));paths.add(path)
patch('spaceship-ui/src/components/experience/ExperienceCanvas.astro','            <span class="post-graph-node__dot" aria-hidden="true" />\n','')
css='spaceship-ui/src/styles/renderer.css'
patch(css,'\n.post-graph-node__dot {\n',"\n.post-graph-node::before {\n  content: '';\n")
patch(css,'.post-graph-node:hover .post-graph-node__dot,','.post-graph-node:hover::before,')
patch(css,'.post-graph-node:focus-visible .post-graph-node__dot {','.post-graph-node:focus-visible::before {')
patch('spaceship-ui/scripts/oct02-contract.py','rows=[]',r'''home=(R/'dist/index.html').read_text();hp=Page(home)
assert len(home.encode())<=258048,'The existing Home HTML budget must not be raised'
graph=json.loads(next(x['data-post-graph'] for t,x in hp.tags if 'data-post-graph' in x))
links={x['data-post-graph-node']:x for t,x in hp.tags if t=='a' and 'data-post-graph-node' in x}
assert len(links)==len(graph['nodes'])
assert not any('post-graph-node__dot' in x.get('class','') for t,x in hp.tags)
for node in graph['nodes']:
 assert links[node['id']]['href']==node['href']
 assert links[node['id']]['aria-label']==node['title']+'. '+node['category']
for entry in E['entries']:assert any(n['href'].rstrip('/')=='/posts/'+entry['slug'] for n in graph['nodes'])
rows=[]''')
patch('spaceship-ui/scripts/browser-oct02.mjs',"  for (const width of [390, 1440]) {",r'''  await viewport(cdp,sessionId,{width:1440,height:900,mobile:false,touch:false,reduced:false});
  await navigate(cdp,sessionId,'/');
  await evaluate(cdp,sessionId,`document.querySelector('[data-post-graph-node]').focus()`);
  await waitExpression(cdp,sessionId,`(() => {
    const a=document.querySelector('[data-post-graph-node]'),s=getComputedStyle(a,'::before');
    return s.content==='""' && parseFloat(s.width)>0 && s.transform!=='none' && getComputedStyle(a).outlineStyle==='dashed';
  })()`,'CSS-only graph marker retains keyboard focus feedback');
  assert.equal(await evaluate(cdp,sessionId,`document.querySelectorAll('.post-graph-node__dot').length`),0);
  await capture('home-graph-css-marker-desktop');
  for (const width of [390, 1440]) {''')
p='spaceship-ui/docs/operations/NEWS_20261002_EDITORIAL.md';s=(R/p).read_text();s+='''
## Bounded Home HTML repair

The new content first exceeded the unchanged 258,048-byte Home HTML cap: 259,909 bytes. Instead of increasing the budget or dropping graph nodes, each repeated aria-hidden marker span was replaced by an empty CSS ::before marker. Every anchor, href, accessible name, graph coordinate, edge and runtime handler is unchanged. The CSS retains the same inset, color, transition and focus/hover scale. Static tests require exact graph/anchor correspondence and the original budget. The focused browser test also requires a visible-sized pseudo-element and the existing dashed keyboard focus outline; old mobile native-link and idle-animation tests remain in place. This modifies only ExperienceCanvas decorative markup and its CSS, not post reader components or renderer JavaScript.
''';(R/p).write_text(s);paths.add(p)
j['files']=[]
for path in sorted(paths):
 b=(R/path).read_bytes();j['files'].append({'path':path,'mode':'100644','type':'blob','sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'sha256':hashlib.sha256(b).hexdigest()})
(out/'assembly.json').write_text(json.dumps(j,indent=2));print('Compact Home decoration: all graph data/links retained;',len(j['files']),'files in candidate')

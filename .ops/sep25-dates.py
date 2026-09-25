from pathlib import Path
import hashlib,json
R=Path.cwd();receipt=R.parent/'sep25-receipt';j=json.loads((receipt/'assembly.json').read_text());paths={r['path'] for r in j['files']}
def patch(path,a,b):
 p=R/path;s=p.read_text();assert s.count(a)==1,(path,a);p.write_text(s.replace(a,b));paths.add(path)
patch('spaceship-ui/src/content.config.ts',"    lang: z.literal('en'), category:","    publicationTimeZone: z.enum(['UTC', 'Asia/Seoul']).default('Asia/Seoul'),\n    lang: z.literal('en'), category:")
for path in ['spaceship-ui/src/components/EnglishPostCard.astro','spaceship-ui/src/pages/en/posts/[...slug]/index.astro']:
 p=R/path;s=p.read_text();assert s.startswith('---\n')
 s=s.replace('---\n',"---\nimport { formatDateKey } from '@/lib/utils/date';\n",1)
 assert s.count('post.data.pubDate.toISOString().slice(0,10)')==1
 s=s.replace('post.data.pubDate.toISOString().slice(0,10)','formatDateKey(post.data.pubDate, post.data.publicationTimeZone)')
 s=s.replace('post.data.updatedDate.toISOString().slice(0,10)','formatDateKey(post.data.updatedDate, post.data.publicationTimeZone)')
 p.write_text(s);paths.add(path)
patch('spaceship-ui/scripts/sep25-contract.py',"p=Page(text);assert any(t=='html'", "p=Page(text);assert re.search(r'<time[^>]*>\\s*(?:2026-09-25|Sep 25, 2026)\\s*</time>',text)\n assert any(t=='html'")
patch('scripts/normalize_tags_current.py','if __name__ == "__main__":', '''POST_TAXONOMY.update({
    '2026-09-25-soec-stack-operational-control-news.mdx': Taxonomy('finance-industry', 'solid-oxide-electrolysis', 'paper-review', ('frontier-one', 'green-hydrogen')),
    '2026-09-25-nhs-galleri-screening-performance-news.mdx': Taxonomy('health-lifestyle', 'multi-cancer-screening', 'paper-review', ('frontier-candidate', 'cancer-screening')),
    '2026-09-25-npu-sparrow-wing-tail-coordination-news.mdx': Taxonomy('robotics-embedded', 'flapping-wing-robotics', 'paper-review', ('frontier-candidate', 'aerial-robotics')),
})

if __name__ == "__main__":''')
# Only decorative coordinates are rounded, with <=0.00005 world-unit error.
# All nodes, links, metadata and edge-selection logic remain unchanged.
path='spaceship-ui/src/lib/experience/post-graph.ts'
for axis,expression in [('x','Math.cos(angle) * cluster + Math.cos(local) * radius'),('y','Math.sin(angle) * cluster + Math.sin(local) * radius'),('z','(((seed >>> 20) % 1000) / 1000 - 0.5) * 3.8')]:
 patch(path,f'{axis}: {expression},',f'{axis}: Number(({expression}).toFixed(4)),')
patch('spaceship-ui/scripts/sep25-contract.py','rows=[]', '''# Check the actual serialized graph, without reducing its node inventory.
home=(R/'dist/index.html').read_text();hp=Page(home)
graph=json.loads(next(a['data-post-graph'] for t,a in hp.tags if 'data-post-graph' in a))
assert len(home.encode())<=240*1024
assert len(graph['nodes'])==len([1 for t,a in hp.tags if t=='a' and 'data-post-graph-node' in a])
for node in graph['nodes']:
 for axis in ['x','y','z']:assert abs(node[axis]-round(node[axis],4))<1e-10
for entry in E['entries']:assert any(n['href'].rstrip('/')=='/posts/'+entry['slug'] for n in graph['nodes'])
rows=[]''')
j['files']=[]
for path in sorted(paths):
 b=(R/path).read_bytes();j['files'].append({'path':path,'mode':'100644','type':'blob','sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'sha256':hashlib.sha256(b).hexdigest()})
(receipt/'assembly.json').write_text(json.dumps(j,ensure_ascii=False,indent=2))
print('Seoul dates and canonical taxonomy registered; existing HTML budget and all graph links retained')

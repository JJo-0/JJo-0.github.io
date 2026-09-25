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
# The Korean date formatter spells the month; the English edition uses ISO dates.
patch('spaceship-ui/scripts/sep25-contract.py',"p=Page(text);assert any(t=='html'", "p=Page(text);assert re.search(r'<time[^>]*>\\s*(?:2026-09-25|Sep 25, 2026)\\s*</time>',text)\n assert any(t=='html'")
j['files']=[]
for path in sorted(paths):
 b=(R/path).read_bytes();j['files'].append({'path':path,'mode':'100644','type':'blob','sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'sha256':hashlib.sha256(b).hexdigest()})
(receipt/'assembly.json').write_text(json.dumps(j,ensure_ascii=False,indent=2))
print('Seoul publication display date verified in candidate; no publication timestamp changed')

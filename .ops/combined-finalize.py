from pathlib import Path
import json,hashlib
R=Path.cwd();A=R/'spaceship-ui';O=R.parent/'oct03-receipt';manifest=json.loads((O/'manifest.json').read_text());edition=json.loads((A/'site/english-edition.json').read_text());release=json.loads((A/'site/news-edition-20261002.json').read_text())
repairs=[
 ('posts','2026-10-02-glassrecon-depth-prior-news.mdx','glass','δ<1.25','δ&lt;1.25',2,'Escape literal less-than table signs; displayed thresholds unchanged.'),
 ('english','en-glassrecon-depth-prior.mdx','glass','δ<1.25','δ&lt;1.25',2,'Escape literal less-than table signs; displayed thresholds unchanged.'),
 ('posts','2026-10-02-lace-complementary-heuristics-news.mdx','lace','**실행 가능한 해(feasible solution)**','<strong>실행 가능한 해(feasible solution)</strong>',1,'Replace ambiguous glossary emphasis delimiters with equivalent strong markup.')]
for folder,name,key,old,new,count,reason in repairs:
 p=A/'site/content'/folder/name;before=hashlib.sha256(p.read_bytes()).hexdigest();s=p.read_text();assert s.count(old)==count
 p.write_text(s.replace(old,new));after=hashlib.sha256(p.read_bytes()).hexdigest();field='sourceSha256' if folder=='posts' else 'englishSha256'
 row=next(x for x in release['entries'] if x['key']==key);pair=next(x for x in edition['pairs'] if x['koSlug']==row['slug'])
 assert pair[field]==row[field]==before;pair[field]=row[field]=after
 pair.setdefault('sourceFormattingRepairs',{})[folder]={'sourceSha256':before,'resultSha256':after,'change':reason}
(A/'site/english-edition.json').write_text(json.dumps(edition,ensure_ascii=False,indent=2)+'\n');(A/'site/news-edition-20261002.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
for row in manifest['files']:
 b=(R/row['path']).read_bytes();row['sha256']=hashlib.sha256(b).hexdigest();row['sha']=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
(O/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('MDX compatibility corrections applied; scientific text, equations and values preserved.')

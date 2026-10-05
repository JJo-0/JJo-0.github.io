from pathlib import Path
import json,hashlib
R=Path.cwd();A=R/'spaceship-ui';O=R.parent/'oct03-receipt';manifest=json.loads((O/'manifest.json').read_text());edition=json.loads((A/'site/english-edition.json').read_text());release=json.loads((A/'site/news-edition-20261002.json').read_text())
for folder,name,field in [('posts','2026-10-02-glassrecon-depth-prior-news.mdx','sourceSha256'),('english','en-glassrecon-depth-prior.mdx','englishSha256')]:
 p=A/'site/content'/folder/name;before=hashlib.sha256(p.read_bytes()).hexdigest();s=p.read_text();assert s.count('δ<1.25')==2
 p.write_text(s.replace('δ<1.25','δ&lt;1.25'));after=hashlib.sha256(p.read_bytes()).hexdigest()
 pair=next(x for x in edition['pairs'] if x['enSlug']=='glassrecon-depth-prior');row=next(x for x in release['entries'] if x['key']=='glass')
 assert pair[field]==row[field]==before;pair[field]=row[field]=after
 pair.setdefault('sourceFormattingRepairs',{})[folder]={'sourceSha256':before,'resultSha256':after,'change':'Escape two less-than signs in MDX table headers; displayed text, data and equations unchanged.'}
(A/'site/english-edition.json').write_text(json.dumps(edition,ensure_ascii=False,indent=2)+'\n');(A/'site/news-edition-20261002.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
for row in manifest['files']:
 b=(R/row['path']).read_bytes();row['sha256']=hashlib.sha256(b).hexdigest();row['sha']=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
(O/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('MDX literal threshold signs escaped; all displayed comparison values preserved.')

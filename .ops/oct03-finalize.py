from pathlib import Path
import json,hashlib
R=Path.cwd();A=R/'spaceship-ui';O=R.parent/'oct03-receipt'
manifest=json.loads((O/'manifest.json').read_text())
edition=json.loads((A/'site/english-edition.json').read_text())
release=json.loads((A/'site/news-edition-20261003.json').read_text())
changed=set()
for folder,name,marker in [
 ('posts','2026-10-03-ai-nanocrystal-photovoltaics-news.mdx','더 중요한 비대칭은'),
 ('english','en-ai-nanocrystal-photovoltaics.mdx','Another important asymmetry is')]:
 p=A/'site/content'/folder/name;s=p.read_text();before=hashlib.sha256(p.read_bytes()).hexdigest()
 assert s.count('<CandidateEquation ')==2 and s.count('</CandidateEquation>')==1
 assert s.count('\n\n'+marker)==1
 s=s.replace('\n\n'+marker,'\n\n</CandidateEquation>\n\n'+marker)
 assert s.count('<CandidateEquation ')==s.count('</CandidateEquation>')==2
 p.write_text(s);after=hashlib.sha256(p.read_bytes()).hexdigest();changed.add(str(p.relative_to(R)))
 field='sourceSha256' if folder=='posts' else 'englishSha256'
 pair=next(x for x in edition['pairs'] if x['koSlug']=='2026-10-03-ai-nanocrystal-photovoltaics-news')
 assert pair[field]==before
 pair[field]=after
 pair.setdefault('sourceFormattingRepairs',{})[folder]={'sourceSha256':before,'resultSha256':after,'change':'Insert missing CandidateEquation closing tag; prose, formulas and references unchanged.'}
 row=next(x for x in release['entries'] if x['key']=='ltri');assert row[field]==before;row[field]=after
for name,obj in [('english-edition.json',edition),('news-edition-20261003.json',release)]:
 p=A/'site'/name;p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');changed.add(str(p.relative_to(R)))
for row in manifest['files']:
 if row['path'] in changed:
  b=(R/row['path']).read_bytes();row['sha256']=hashlib.sha256(b).hexdigest();row['sha']=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
(O/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('Repaired missing LTRI equation closure in both languages; all prose and equations preserved.')

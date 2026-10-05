from pathlib import Path
import json,hashlib
R=Path.cwd();A=R/'spaceship-ui';O=R.parent/'oct03-receipt'
manifest=json.loads((O/'manifest.json').read_text());edition=json.loads((A/'site/english-edition.json').read_text());release=json.loads((A/'site/news-edition-20261003.json').read_text());changed=set()
for folder,name,marker in [('posts','2026-10-03-ai-nanocrystal-photovoltaics-news.mdx','더 중요한 비대칭은'),('english','en-ai-nanocrystal-photovoltaics.mdx','Another important asymmetry is')]:
 p=A/'site/content'/folder/name;s=p.read_text()
 assert s.count('<CandidateEquation ')==2 and s.count('</CandidateEquation>')==1 and s.count('\n\n'+marker)==1
 p.write_text(s.replace('\n\n'+marker,'\n\n</CandidateEquation>\n\n'+marker));changed.add(str(p.relative_to(R)))
terms={
 '2026-10-03-ai-nanocrystal-photovoltaics-news.mdx':['나노결정(nanocrystal)','리간드(ligand)','광발광(photoluminescence, PL)'],
 '2026-10-03-mccv-regulatory-variant-mapping-news.mdx':['유전적 변이(variant)','대립유전자(allele)','증강자(enhancer)','프로모터(promoter)'],
 '2026-10-03-paml-chemoresistant-cell-risk-news.mdx':['소아 급성 골수성 백혈병(pAML)','단일세포 RNA 분석(scRNA-seq)']}
for name,words in terms.items():
 p=A/'site/content/posts'/name;s=p.read_text()
 for word in words:
  old='**'+word+'**';assert s.count(old)==1;s=s.replace(old,'<strong>'+word+'</strong>')
 p.write_text(s);changed.add(str(p.relative_to(R)))
for row in release['entries']:
 pair=next(x for x in edition['pairs'] if x['koSlug']==row['slug'])
 for folder,filename,field in [('posts',pair['koFile'],'sourceSha256'),('english',pair['enFile'],'englishSha256')]:
  p=A/'site/content'/folder/filename
  if str(p.relative_to(R)) not in changed:continue
  before=pair[field];after=hashlib.sha256(p.read_bytes()).hexdigest()
  assert row[field]==before;row[field]=after;pair[field]=after
  pair.setdefault('sourceFormattingRepairs',{})[folder]={'sourceSha256':before,'resultSha256':after,'change':'Close missing equation disclosure and/or replace ambiguous emphasis markers with equivalent strong markup; prose and equations unchanged.'}
for name,obj in [('english-edition.json',edition),('news-edition-20261003.json',release)]:
 p=A/'site'/name;p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');changed.add(str(p.relative_to(R)))
for row in manifest['files']:
 if row['path'] in changed:
  b=(R/row['path']).read_bytes();row['sha256']=hashlib.sha256(b).hexdigest();row['sha']=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
(O/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('Corrected MDX rendering only; all prose, evidence and equations preserved.')

import base64,hashlib,json,os,pathlib,re,subprocess,urllib.request,brotli
root=pathlib.Path.cwd(); out=root/'spaceship-ui/src/data/ezekiel-native';out.mkdir(parents=True,exist_ok=True)
shas=['5c1ab1be57affe0f22489fcd44e4412c245a34d8','2bda30e83e783e99723093ded367ed8e917bb14e','55e787844b862e9ac083302e0e296916df28017e','a95778dc6f54b331300ad6470e6ce775cf87bc3d']
packed=b''
for sha in shas:
 req=urllib.request.Request('https://api.github.com/repos/JJo-0/JJo-0.github.io/git/blobs/'+sha,headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json'})
 with urllib.request.urlopen(req,timeout=40) as response:j=json.load(response)
 b=base64.b64decode(j['content']);assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==sha
 packed+=b
assert hashlib.sha256(packed).hexdigest()=='0854b679e967d21344ee522fab1a5340cdaaeafb1dbdaeac01df13f2dd1a6a3e'
files=json.loads(brotli.decompress(packed)); rows=[]
expected=[('붙여넣은 텍스트(1).txt','28307ffd12ff0debe9e899214b8d3c76976b1bffb94155d6764103782cc038c5','27391a3b98e7bc63f6a623190fd1d6d20fb31dfaceb3fa40c448ab426ee3effe'),('붙여넣은 마크다운(2).md','18f167606a2024c25688c67070c37f5c5f0de6fa87902492d3dd1d8611abd166','a398d6fd5941cca3eeb69402a33ffad2a76c19a41c9d0141fdafc9215a995f98'),('붙여넣은 마크다운(3).md','ec7194196059de5ca340ee25fb42209ae22dd91cf3234ce91845ac6b55efd6b4','320be45c6cbfe144e101a9cfe5277874f9e8a04edfe1c726d5867f577eda2116')]
for order,(name,rawsha,htmlsha) in enumerate(expected,1):
 raw=files[name];assert hashlib.sha256(raw.encode()).hexdigest()==rawsha
 (out/f'upload-{order}.txt').write_text(raw)
 s=raw
 if order>1:
  s=s.replace('&#x20;',' ')
  s=re.sub(r'\\([!"#$%&\'()*+,\-./:;<=>?@\[\]^_`{|}~\\])',r'\1',s)
 s=s[:s.lower().index('</html>')+7]+'\n';assert hashlib.sha256(s.encode()).hexdigest()==htmlsha
 (out/f'report-{order}.html').write_text(s)
 for index,code in enumerate(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>',s)):
  p=pathlib.Path('/tmp')/f'ezekiel-{order}-{index}.js';p.write_text(code);subprocess.run(['node','--check',str(p)],check=True)
 rows.append({'report':order,'slug':f'ezekiel-2-1-3-11-{order}','filename':name,'rawBytes':len(raw.encode()),'rawSha256':rawsha,'htmlBytes':len(s.encode()),'htmlSha256':htmlsha,'title':re.search(r'<title>(.*?)</title>',s).group(1)})
(out/'manifest.json').write_text(json.dumps({'version':1,'suppliedOn':'2026-10-03','normalization':'One Markdown punctuation unescape and &#x20; whitespace decode for uploads 2 and 3; HTML document boundary retained, original uploads retained separately.','pages':rows},ensure_ascii=False,indent=2)+'\n')
print('Verified three raw uploads, normalized HTML bytes, and all inline JavaScript syntax. No content or numeric dataset was rewritten.')

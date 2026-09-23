import os,json,hashlib,zipfile,pathlib,urllib.request
root=pathlib.Path('input')
archive=root/'source.zip'; manifest=root/'source-manifest.json'
assert hashlib.sha256(archive.read_bytes()).hexdigest()==os.environ['SOURCE_ZIP_SHA256']
assert hashlib.sha256(manifest.read_bytes()).hexdigest()==os.environ['SOURCE_MANIFEST_SHA256']
m=json.loads(manifest.read_text());assert m['base']=='2d94748a983f1aaf84aa274eeda2e92f534ed39a'
assert len(m['files'])==44
z=zipfile.ZipFile(archive)
assert sorted(z.namelist())==sorted(row['path'] for row in m['files'])
rows=[]
for row in m['files']:
    name=row['path']; p=pathlib.PurePosixPath(name)
    assert not p.is_absolute() and '..' not in p.parts
    assert name=='.github/workflows/english-edition.yml' or name.startswith('spaceship-ui/')
    assert not name.startswith('spaceship-ui/site/content/posts/')
    assert p.suffix in {'.astro','.svelte','.ts','.mjs','.py','.json','.md','.mdx','.svg','.yml'}
    b=z.read(name);assert len(b)<100000
    assert hashlib.sha256(b).hexdigest()==row['sha256']
    expected=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest();assert expected==row['gitSha']
    request=urllib.request.Request('https://api.github.com/repos/JJo-0/JJo-0.github.io/git/blobs',data=json.dumps({'content':b.decode('utf-8'),'encoding':'utf-8'}).encode(),headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},method='POST')
    with urllib.request.urlopen(request,timeout=30) as response: result=json.load(response)
    assert result['sha']==expected
    rows.append({'path':name,'mode':'100644','type':'blob','sha':expected,'sha256':row['sha256']})
pathlib.Path('output').mkdir(exist_ok=True)
pathlib.Path('output/blob-receipt.json').write_text(json.dumps({'base':m['base'],'sourceOps':m['ops'],'files':rows},indent=2))
print('Immutable blobs verified:',len(rows),'; no commits, trees, refs or branches written')

from pathlib import Path
import subprocess,json

def git(*args,check=True):
    return subprocess.run(['git',*args],check=check,text=True,capture_output=True)

git('config','user.name','JJo Editorial Recovery')
git('config','user.email','76779256+JJo-0@users.noreply.github.com')
git('fetch','--no-tags','origin','main')
base='5c07acd69fe8d569ed5c7cea9895794ff8400973'
current=git('rev-parse','origin/main').stdout.strip()
assert current=='c51e6a797f865a40a572f89c7273f6bbac022684','Concurrent main changed: inspect rather than overwrite'
bp=json.loads(git('show',base+':spaceship-ui/package.json').stdout)
mp=json.loads(git('show','origin/main:spaceship-ui/package.json').stdout)
op=json.loads(Path('spaceship-ui/package.json').read_text())
expected={'spaceship-ui/ops/blog-harness/blogger/2026-09-09-navier-stokes-easy.md','spaceship-ui/package.json','spaceship-ui/scripts/blogger-equation-contract.mjs','spaceship-ui/scripts/browser-interaction-audits-v4.mjs','spaceship-ui/scripts/render-blogger-post.mjs'}
assert set(git('diff','--name-only',base,'origin/main').stdout.splitlines())==expected
result=git('merge','--no-commit','--no-ff','origin/main',check=False)
conflicts=git('diff','--name-only','--diff-filter=U').stdout.splitlines()
assert not(set(conflicts)-{'spaceship-ui/package.json'}),result.stdout+result.stderr
for key,value in mp['scripts'].items():
    if bp['scripts'].get(key)==value:continue
    if key=='content:check':
        assert value==bp['scripts'][key]+' && pnpm blogger:equation-check'
        assert 'blogger:equation-check' not in op['scripts'][key]
        op['scripts'][key]+=' && pnpm blogger:equation-check'
    else:
        assert key not in op['scripts'] or op['scripts'][key]==value,key
        op['scripts'][key]=value
Path('spaceship-ui/package.json').write_text(json.dumps(op,indent=2)+'\n')
git('add','spaceship-ui/package.json')
assert not git('diff','--name-only','--diff-filter=U').stdout.strip()
for name in expected-{'spaceship-ui/package.json'}:
    assert Path(name).read_bytes()==subprocess.check_output(['git','show','origin/main:'+name]),name
git('commit','-m','merge: preserve concurrent Blogger equation and browser fixes (#112)')
allowed=['.github/news-depth-source-list.json','.github/news_resume_integrate.py','.github/workflows/news-depth-snapshot-20260912.yml','.github/workflows/news-depth-sources-20260912.yml','.github/workflows/news-resume-checkpoint-20260913.yml','.github/workflows/news-resume-apply-20260913.yml','.github/workflows/news-resume-integrate-20260913.yml']
temporary=[p for p in git('ls-files','.github').stdout.splitlines() if p.startswith('.github/news-depth-transfer-20260913/') or p in allowed]
assert len(temporary)==21,len(temporary)
git('rm','--',*temporary)
ledger=Path('spaceship-ui/docs/operations/NEWS_I18N_RESUME.md')
ledger.write_text('\n'.join([
'# NEWS / English resume ledger','',
'Updated 2026-09-13. Tracking: #112; Draft PR #113; full English scope: #10.','',
'## Current checkpoint','',
'Actual source restoration and seven original figures committed at `24372183fb283409681a62909fb3470b6818e53d`. Restore run `34737963227` passed. Partial compressed transport is no longer needed.',
'Original editorial base: `5c07acd69fe8d569ed5c7cea9895794ff8400973`. Concurrent main `c51e6a797f865a40a572f89c7273f6bbac022684` merged without losing its Blogger equation contract or browser fixes. Temporary acquisition and transport files removed.','',
'## Resume procedure','',
'1. Read #112 and #113 latest comments; fetch actual branch/main heads.',
'2. Read docs/2026-09-13-english-and-news-depth.md and site/translations.json and the depth/source manifests.',
'3. Run complete CI. Fix evidenced failures without changing Korean URLs, original equations, attributions or concurrent Blogger checks.',
'4. Persist each commit and run URL in #112 before stopping. Merge only reviewed green code, then verify deployed pages.','',
'## Completed checkpoints','',
'- [x] Restore 76 text files and seven pinned original figures.',
'- [x] Verify old partial, recovery suffix, full diff, original PDF and output image SHA256.',
'- [x] Local translation-contract: four paired translations.',
'- [x] Local news-depth-contract: twenty 7,000–10,000-character Korean NEWS articles.',
'- [x] Local taxonomy and canonical manifest: 96 posts.',
'- [x] Preserve concurrent main and remove temporary tooling.',
'- [ ] Full translation meaning and research caveat review.',
'- [ ] PR lint/type/build/SEO/content/browser checks.',
'- [ ] Review fixes, merge and deployment verification.','',
'## Boundaries','',
'Four September 11–12 translations are not a fully translated archive. AI Consciousness I–III, interactive English experiences, the remaining archive and Search Console indexing stay open in #10. Twenty short NEWS articles are expanded; other longer and legacy posts are not blindly padded or truncated. No Blogger publishing, ads or account configuration changes.',
'Persistent hashes and rights receipts live in the repository. Production does not depend on expiring Actions downloads. Full third-party PDFs are not republished.',''
]))
git('add',str(ledger))
git('commit','-m','docs: checkpoint restored source and retire temporary transport (#112)')
git('push','origin','HEAD:content/news-depth-english-20260912')
print('Source checkpoint',git('rev-parse','HEAD').stdout)

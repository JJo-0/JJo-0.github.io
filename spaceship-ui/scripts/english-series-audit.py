"""Verify full English series articles against preserved Korean source material."""
import collections
import hashlib
import json
import re
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
repo = root.parent
manifest = json.loads((root / 'site/english-edition.json').read_text())
ko_guides = json.loads((root / 'src/data/robot-equation-guides.json').read_text())
en_guides = json.loads((root / 'src/data/robot-equation-guides.en.json').read_text())
pairs = [p for p in manifest['pairs'] if p.get('translationMethod') == 'direct-chat-translation']
ids = []
urls = lambda s: collections.Counter(re.findall(r'https?://[^\s"\')]+', s))
images = lambda s: re.findall(r'(?:src="|!\[[^\]]*\]\()([^"\s)]+)', s)
for pair in pairs:
    source = (root / 'site/content/posts' / pair['koFile']).read_text().split('---', 2)[2]
    target_path = root / 'site/content/english' / pair['enFile']
    target = target_path.read_text().split('---', 2)[2]
    assert urls(source) + collections.Counter(pair.get('editorialAdditionUrls', [])) == urls(target), pair['key'] + ': external source links'
    expected_images = [s.replace('reasoning-control.svg', 'reasoning-control.en.svg').replace('deployment-learning.svg', 'deployment-learning.en.svg') for s in images(source)]
    expected_images = [x[:-4] + '.en.svg' if '/ai-consciousness-2026/' in x and x.endswith('.svg') else x for x in expected_images]
    assert expected_images == images(target), pair['key'] + ': image preservation'
    current_ids = re.findall(r'<RobotEquationGuide id="([^"]+)"', target)
    assert current_ids == re.findall(r'<RobotEquationGuide id="([^"]+)"', source)
    ids.extend(current_ids)
    for guide_id in current_ids:
        assert en_guides[guide_id]['tex'] == ko_guides[guide_id]['tex'], guide_id
        assert not re.search('[가-힣]', json.dumps(en_guides[guide_id], ensure_ascii=False)), guide_id
    for src in images(target):
        if src.startswith('/') and src.endswith('.svg'):
            asset = root / 'site/assets' / src.lstrip('/')
            assert asset.exists(), src
            assert not re.search('[가-힣]', asset.read_text()), src
    assert hashlib.sha256(target_path.read_bytes()).hexdigest() == pair['englishSha256']
assert set(ids) == set(en_guides), 'all English equation guides must be used'
# All original Korean files, including those not yet translated, remain unchanged.
subprocess.run(['git', 'diff', '--exit-code', '--quiet', 'HEAD', '--', 'spaceship-ui/site/content/posts'], cwd=repo, check=True)
# Pre-existing English articles must remain byte-for-byte unchanged.
for pair in manifest['pairs']:
    if pair.get('translationMethod') == 'direct-chat-translation':
        continue
    path = 'spaceship-ui/site/content/english/' + pair['enFile']
    original = subprocess.check_output(['git', 'show', 'HEAD:' + path], cwd=repo)
    assert original == (repo / path).read_bytes(), path
print(f'english-series-audit: PASS; {len(pairs)} new articles, {len(en_guides)} equation guides, original Korean and pre-existing English preserved')

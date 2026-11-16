"""Compile the reviewed Markdown drafts to the existing blog MDX contract.
Only lessons 04/05, lesson 03's next link, their taxonomy entries and scoped records change.
Run after render_04_05.py. Production build and browser checks remain separate.
"""
from __future__ import annotations
from pathlib import Path
import hashlib
import html
import json
import math
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]
DOCS = ROOT / 'docs/self-improving-ai'
POSTS = ROOT / 'spaceship-ui/site/content/posts'
SLUGS = {4:'self-improving-ai-04-sparse-rewards-and-shaping', 5:'self-improving-ai-05-reward-design-to-ai-feedback'}

def figure(asset):
    values = {k: html.escape(str(asset[k]), quote=True) for k in ('src', 'alt', 'caption', 'source', 'credit')}
    attrs = '\n'.join(f'  {k}="{v}"' for k, v in values.items())
    extra = '\n  maxWidth={650}' if asset['source_key'] == 'schultz' else ''
    return '<LearningFigure\n' + attrs + f'\n  width={{{asset["width"]}}}\n  height={{{asset["height"]}}}' + extra + '\n/>'

def format_body(body):
    blocks = []
    def protect(match):
        blocks.append(match.group(0))
        return f'@@CODEBLOCK{len(blocks)-1}@@'
    body = re.sub(r'```[^\n]*\n.*?\n```', protect, body, flags=re.S)
    expressions = []
    def math_component(tex, display=False):
        if '`' in tex or '${' in tex:
            raise ValueError('Unexpected template interpolation in equation')
        expressions.append(tex.strip())
        return '<Math tex={String.raw`' + tex.strip() + '`}' + (' display' if display else '') + ' />'
    body = re.sub(r'\$\$\s*(.*?)\s*\$\$', lambda m: math_component(m.group(1), True), body, flags=re.S)
    body = re.sub(r'(?<![\\$])\$(?!\$)([^\n$]+)\$(?!\$)', lambda m: math_component(m.group(1)), body)
    body = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', body)
    for i, block in enumerate(blocks):
        body = body.replace(f'@@CODEBLOCK{i}@@', block)
    return body, expressions

records = []
for chapter, slug in SLUGS.items():
    draft_path = DOCS / 'drafts' / (slug + '.md')
    text = draft_path.read_text(encoding='utf-8')
    pieces = text.split('---', 2)
    assert len(pieces) == 3 and not pieces[0].strip()
    frontmatter, body = pieces[1], pieces[2]
    frontmatter = frontmatter.replace('draft: true', 'draft: false')
    body = re.sub(r'<!-- EDITORIAL STATUS, NOT PUBLICATION EVIDENCE:.*?-->\s*', '', body, flags=re.S)
    body = re.sub(r'^# 자가개선 AI 04[^\n]*\n+', '', body, flags=re.M)
    if chapter == 4:
        old = '17쪽은 그림 중심 페이지다. 아래의 단계 구분은 앞선 문 열기 예제를 이해하기 위한 추가 해설이며, 그림 속 문구의 직접 번역이 아니다.'
        new = '17쪽은 문 손잡이에 접근하는 거리에 따라 중간 점수를 부여하는 그림이다. 원본 아래쪽은 멀리 있으면 0, 가까워지면 +1, 손잡이에 닿으면 +5로 표시한다. 이 숫자는 다음 18쪽의 접촉 +0.5·문 열기 +1과 다른 설명용 예시다. 두 장을 하나의 검증된 보상 설정처럼 합치지 않는다. 아래의 네 단계 구분은 그림의 직접 번역이 아니라, 문 열기를 이해하기 위해 추가한 해설이다.'
        assert old in body
        body = body.replace(old, new)
        old = '다음 범위는 원본 **21–25쪽**이다. 보상 설계 관련 연구 사례를 더 살펴본 뒤, 학습 목표와 평가 신호를 AI가 정하는 문제로 이어진다. 다음 편이 공개되기 전에는 존재하지 않는 게시물 링크를 만들지 않는다.'
        assert old in body
        body = body.replace(old, '다음 [자가개선 AI 05 — 보상을 만드는 AI와 답을 평가하는 AI](/posts/' + SLUGS[5] + '/)는 원본 **21–25쪽**을 다룬다. 보상 설계 관련 연구를 비교하고, RLHF와 RLAIF의 학습 신호를 구별한다.')
        body = body.replace('이 원고는 자료 조사와 집필 초안이며, 이미지 편집·권리 확인·본문 화면 검수·공개 배포의 완료를 뜻하지 않는다.', '')
        intro = '\n\n중국어 제목과 문구는 원본 도형을 유지한 비공식 영어 편집본으로 제시한다. 원래 영어인 19쪽은 그대로 사용한다. 18쪽 원본에 보이는 연결 이미지 누락 표시도 임의의 새 그림으로 바꾸지 않았다. 원문에 없는 계산과 유도는 추가 해설로 구별한다.\n\n'
        anchor = '\n| 원본 페이지 |'
        assert anchor in body
        body = body.replace(anchor, intro + '| 원본 페이지 |', 1)
    else:
        body = body.replace('https://arxiv.org/pdf/2212.08073v1#page=11', 'https://arxiv.org/pdf/2212.08073v1')
    manifest = json.loads((DOCS / f'source-assets/{chapter:02d}/manifest.json').read_text())
    for asset in manifest['assets']:
        pattern = r'<!-- MEDIA_SLOT ' + re.escape(asset['slot']) + r'(?::.*?)?\s*-->'
        body, count = re.subn(pattern, lambda m: figure(asset), body, flags=re.S)
        if count != 1:
            raise ValueError(f'{slug}: {asset["slot"]} matched {count} times')
        actual = ROOT / asset['path']
        if hashlib.sha256(actual.read_bytes()).hexdigest() != asset['sha256']:
            raise RuntimeError('Image hash mismatch')
    assert 'MEDIA_SLOT' not in body
    body, expressions = format_body(body)
    post = '---' + frontmatter + '---\n\n' + "import LearningFigure from '@/components/post/LearningFigure.astro';\nimport Math from '@/components/post/Math.astro';\n" + body
    assert post.count('<LearningFigure\n') == 9
    path = POSTS / (slug + '.mdx')
    path.write_text(post, encoding='utf-8')
    records.append({'chapter': chapter, 'slug': slug, 'manuscript': str(path.relative_to(ROOT)),
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'figures': 9,
        'math_expressions': len(expressions), 'expressions': expressions,
        'images_match_manifest': True, 'publication_status': 'prepared-not-yet-deployed'})

# Add only the two new taxonomy registrations before the existing entry point.
registry = ROOT / 'scripts/normalize_tags_current.py'
code = registry.read_text(encoding='utf-8')
marker = 'if __name__ == "__main__":'
assert marker in code
if '"self-improving-ai-04-sparse-rewards-and-shaping.mdx": Taxonomy(' not in code:
    additions = '# Register Self-Improving AI lessons 04–05.\nPOST_TAXONOMY.update({\n'
    for slug in SLUGS.values():
        additions += f'    "{slug}.mdx": Taxonomy("ai-machine-learning", "self-improving-ai", "study-note", ("self-improvement", "reinforcement-learning", "reward-shaping", "robotics", "ntu")),\n'
    additions += '})\n\n'
    registry.write_text(code.replace(marker, additions + marker), encoding='utf-8')

# Preserve the existing lesson body; add an explicit continuation link only.
previous = POSTS / 'self-improving-ai-03-self-correction-to-rl.mdx'
p = previous.read_text(encoding='utf-8')
link = '\n다음 편: [자가개선 AI 04 — 정답은 드문데, 무엇을 보상해야 할까](/posts/' + SLUGS[4] + '/).\n'
if '/posts/' + SLUGS[4] + '/' not in p:
    p = p.replace('\n## 함께 읽을 자료', link + '\n## 함께 읽을 자료', 1)
    previous.write_text(p, encoding='utf-8')

# Numeric examples are teaching checks, not experiments or publication evidence.
pref = 1 / (1 + math.exp(-1.5))
checks = {
    'independent_trial_success': 1 - 0.999**100,
    'contact_return': sum(0.5 * 0.99**t for t in range(20)),
    'pbrs_shaped_return': 0.46 + 0.9 * 0.42 + 0.9**2 * 1.2,
    'preference_probability': pref,
    'preference_loss': -math.log(pref),
    'td_errors': [1 + 0 - 0, 1 + 0 - 1, 0 + 0 - 1],
    'candidate_seed_runs': 8 * 3,
}
assert math.isclose(checks['pbrs_shaped_return'], 1.81, abs_tol=1e-12)
assert math.isclose(pref, 1 / (1 + math.exp(-(101.2 - 99.7))), abs_tol=1e-12)
assert checks['td_errors'] == [1, 0, -1] and checks['candidate_seed_runs'] == 24
existing_test = DOCS / 'reviews/verify_examples_04.py'
result = subprocess.run([sys.executable, str(existing_test)], check=True, capture_output=True, text=True)
print(result.stdout, result.stderr)
review = {'scope': 'Self-Improving AI 04 and 05', 'posts': records,
    'numeric_examples': checks, 'existing_04_numeric_test_exit_code': result.returncode,
    'image_assets': 18, 'primary_images': 10, 'supplementary_images': 8,
    'checks_completed': ['pinned-source-hashes', 'image-hash-match', 'nine-figures-per-post', 'media-slot-completeness', 'numeric-examples'],
    'production_build': 'not-run-by-this-script', 'browser_qa': 'not-run-by-this-script',
    'deployment': 'not-performed-by-this-script'}
(DOCS / 'reviews/2026-11-16-chapters-04-05-preparation.json').write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n')

progress_path = DOCS / 'progress.json'
progress = json.loads(progress_path.read_text())
progress['prepared_continuation'] = {'chapters': [4, 5], 'primary_pages': [16, 25],
    'status': 'prepared; merge, CI and deployment evidence must be recorded separately',
    'pull_request': 'https://github.com/JJo-0/JJo-0.github.io/pull/202',
    'next_page_after_publication': 26,
    'manuscripts': [{k: v for k, v in r.items() if k != 'expressions'} for r in records]}
progress_path.write_text(json.dumps(progress, ensure_ascii=False, indent=2) + '\n')

approval = {'date': '2026-11-16', 'source': 'explicit user request in this conversation',
    'request': 'Finish publication of 04, continue 05, and group the series under 자가개선 AI.',
    'scope': {'chapters': [4, 5], 'primary_pages': [16, 25], 'channel': 'GitBlog', 'images': 18},
    'source_permissions_verified': False,
    'note': 'Publication intent is recorded separately from third-party rights. No general gate, repository protection, or existing CI rule is weakened. This record is not a rights clearance or deployment receipt.'}
(DOCS / 'publishing/2026-11-16-chapters-04-05-request.json').write_text(json.dumps(approval, ensure_ascii=False, indent=2) + '\n')
print('Compiled two MDX posts; source checks passed. Await production CI and deployment.')

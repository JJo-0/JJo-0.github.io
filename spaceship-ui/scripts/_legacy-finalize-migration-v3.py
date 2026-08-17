from pathlib import Path
import re

root = Path('.')
posts = root / 'site/content/posts'
assets = root / 'site/assets'


def replace_exact(path: Path, old: str, new: str, label: str, expected: int = 1) -> None:
    text = path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise SystemExit(f'{label}: expected {expected} occurrence(s), found {count}')
    path.write_text(text.replace(old, new), encoding='utf-8')


# 1. Move only live legacy assets; prune proven current-orphans after history audit.
moves = {
    assets / 'image/HPE_general_pipline.png': assets / 'assets/posts/human-pose-estimate/hpe-general-pipeline.png',
    assets / 'image/graph_example_1.png': assets / 'assets/posts/2024-06-04-2/graph-example-1.png',
    assets / 'image/mouse_surprised.gif': assets / 'assets/site/mouse-surprised.gif',
}
for old, new in moves.items():
    if not old.exists():
        raise SystemExit(f'asset migration source missing: {old}')
    if new.exists():
        raise SystemExit(f'asset migration destination already exists: {new}')
    new.parent.mkdir(parents=True, exist_ok=True)
    old.rename(new)

replace_exact(posts / 'human-pose-estimate.md', '/image/HPE_general_pipline.png', '/assets/posts/human-pose-estimate/hpe-general-pipeline.png', 'HPE asset reference')
replace_exact(posts / '2024-06-04-2.md', '/image/graph_example_1.png', '/assets/posts/2024-06-04-2/graph-example-1.png', 'data-structure asset reference')
replace_exact(root / 'src/pages/index.astro', '/image/mouse_surprised.gif', '/assets/site/mouse-surprised.gif', 'homepage mouse asset reference')

for name in [
    'AMR_.png', 'AMR_Sample_V1.mp4', 'AMR_Sample_V2.mp4', 'circle_face.JPG',
    'raspberrypi_info.jpeg', 'raspberrypi_setting.jpeg', '증명사진.jpeg',
]:
    path = assets / 'image' / name
    if not path.exists():
        raise SystemExit(f'expected orphan asset missing before prune: {path}')
    path.unlink()

legacy_dir = assets / 'image'
remaining = [p.name for p in legacy_dir.iterdir()]
if remaining:
    raise SystemExit(f'legacy image directory is not empty: {remaining}')
legacy_dir.rmdir()

# 2. Replace the two live fragment aliases at source.
replace_exact(posts / 'linux.md', '#Window', '#window', 'linux fragment')
replace_exact(posts / 'ros2.md', '#유명한-라이브러리', '#유명한-라이브러리-따로-공부해서-포스팅할-예정', 'ros2 fragment')

# 3. Reproduce restoreLegacyHtml at source level.
# Each pass exposes deeper 4-space-indented HTML that CommonMark would otherwise
# turn into a new code node after a blank line. Iterate to a fixed point, but
# only for blocks whose first nonblank line is audited block-level HTML.
html_posts = [
    '2025-05-20.md', '2025-06-27.md', '2025-07-23-2.md', '2025-07-25.md',
    'deep-search-gemini.md', 'deep-search-travel-prompt.md',
]
html_start = re.compile(
    r'^\s*(?:<!--[\s\S]*?-->\s*)*<(?:article|aside|blockquote|canvas|div|figure|footer|form|h[1-6]|header|ins|main|nav|ol|p|script|section|style|table|ul)\b',
    re.I,
)


def dedent_one_pass(text: str) -> tuple[str, int]:
    lines = text.splitlines(keepends=True)
    out: list[str] = []
    i = 0
    changed = 0
    while i < len(lines):
        if not lines[i].startswith('    '):
            out.append(lines[i])
            i += 1
            continue

        block: list[str] = []
        while i < len(lines):
            line = lines[i]
            if line.startswith('    ') or line.strip() == '':
                block.append(line)
                i += 1
                continue
            break

        first_nonblank = next((line for line in block if line.strip()), '')
        first_value = first_nonblank[4:] if first_nonblank.startswith('    ') else first_nonblank
        if html_start.match(first_value):
            out.extend(line[4:] if line.startswith('    ') else line for line in block)
            changed += 1
        else:
            out.extend(block)
    return ''.join(out), changed


def dedent_to_fixed_point(path: Path) -> tuple[int, int]:
    text = path.read_text(encoding='utf-8')
    total = 0
    passes = 0
    for _ in range(12):
        text, changed = dedent_one_pass(text)
        if not changed:
            break
        passes += 1
        total += changed
    else:
        raise SystemExit(f'{path}: HTML dedent did not converge within 12 passes')
    if total == 0:
        raise SystemExit(f'{path}: no audited indented HTML blocks found')
    path.write_text(text, encoding='utf-8')
    return passes, total


for name in html_posts:
    passes, blocks = dedent_to_fixed_point(posts / name)
    print(f'dedented {name}: {blocks} HTML block-pass(es) across {passes} pass(es)')

# 4. Replace only exact literal-strong payloads found by the no-shim audit.
# No generic adjacency rule: strings such as 2~3 or 99~100% must remain untouched.
strong_posts = [
    'raspberry-pi-5.md', 'human-forecasting.md', '2025-03-07.md', '2025-04-25.md',
    '2025-05-08.md', '2025-06-27.md', '2025-07-23.md',
    'venture-global-comprehensive-report.md',
    'ai-consciousness-deep-research-1.md', 'ai-consciousness-deep-research-2.md',
    'ai-consciousness-deep-research-3.md',
]
known_inner = {
    '스펙 간략하게',
    '3D 포즈 추정(HPE, Human Pose Forecasting)',
    'Trajectory Prediction(사람의 이동 경로 예측)',
    '인간 자세 예측(Human Pose Forecasting/Prediction)',
    '기준선(baseline)',
    '40배 빠른 속도 향상(173 FPS)',
    '“양산계의 No.1 브랜드”',
    '“가격 대비 최고의 만족도”',
    '워터프론트(Waterfront)',
    '가격:',
    '마이브렐라(Mybrella)',
    '“양산 쓰니 한여름에도 걸을 만하다”',
    '혼동 행렬(Confusion Matrix)',
    '평균 정밀도(Average Precision, AP)',
    '크기(magnitude)',
    '행렬(matrix)',
    '저녁 식사 후 또는 잠들기 1~2시간 전',
    '마그네슘 비스글리시네이트(Magnesium Bisglycinate)',
    '일반의약품(General Pharmaceutical)',
    '건강기능식품(Health Functional Food)',
    '활성형(L-Methylfolate, Methylcobalamin 등)',
    'DSM(네덜란드)이나 BASF(독일)',
    'GAAP 기준(2025 actual anchor)',
    '2026년 7월 26일(KST)',
    '“현상적 의식의 확정적 증거는 미흡하지만, Access consciousness와 기능적 자기조절을 구성하는 여러 구조는 더 이상 단순한 표면적 언어 모방만으로 치부하기 어려워지고 있다”',
    '“윤리 프레임워크별 8대 파생 질문”',
    '기술 실사(Technical Audit)',
}
strong_re = re.compile(r'\*\*([^*\n]+?)\*\*')

for name in strong_posts:
    path = posts / name
    text = path.read_text(encoding='utf-8')
    replacements = [0]

    def repl(match: re.Match[str]) -> str:
        inner = match.group(1)
        if inner in known_inner:
            replacements[0] += 1
            return f'<strong>{inner}</strong>'
        return match.group(0)

    new_text = strong_re.sub(repl, text)
    if replacements[0]:
        print(f'normalized exact literal strong {name}: {replacements[0]}')
        path.write_text(new_text, encoding='utf-8')

# 5. Remove all compatibility shims.
config = root / 'astro.config.mjs'
cfg = config.read_text(encoding='utf-8')
for old, new in [
    ("import remarkRepairLiteralStrong from './src/lib/remark-repair-literal-strong.mjs';\n", ''),
    ("import restoreLegacyHtml from './src/lib/remark/restore-legacy-html.mjs';\n", ''),
    ("import fixLegacyFragments from './src/lib/rehype/fix-legacy-fragments.mjs';\n", ''),
    ('remarkPlugins: [restoreLegacyHtml, remarkEmoji, remarkRepairLiteralStrong],', 'remarkPlugins: [remarkEmoji],'),
    ('      fixLegacyFragments,\n', ''),
]:
    if old not in cfg:
        raise SystemExit(f'astro.config.mjs expected shim pattern missing: {old!r}')
    cfg = cfg.replace(old, new, 1)
config.write_text(cfg, encoding='utf-8')

for path in [
    root / 'src/lib/remark-repair-literal-strong.mjs',
    root / 'src/lib/remark/restore-legacy-html.mjs',
    root / 'src/lib/rehype/fix-legacy-fragments.mjs',
]:
    if not path.exists():
        raise SystemExit(f'shim file missing before deletion: {path}')
    path.unlink()

"""One-time NEWS citation migration; never publishes or merges.

Run from the repository root: python3 scripts/repair_news_citations_20260916.py older|recent
The second batch requires the first. Every original article is pinned to the
reviewed production commit; restoration is independently checked by the gate.
"""
from collections import Counter
from pathlib import Path
import hashlib
import html
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
UI = ROOT / 'spaceship-ui'
LEDGER = UI / 'site/news-citation-repair-20260916.json'
BASELINE = '995304cdbf317e323f630e5517e3549e4c069def'
MARKER = re.compile(r'\[(\d+(?:\s*,\s*\d+)*)(?:,\s*([A-Za-z][^\]\n]*))?\]')
BASELINE_MARKERS = {
    '2026-09-05-aml-paradigm-news': 13,
    '2026-09-05-gpt-6-astra-safety-news': 7,
    '2026-09-09-navier-stokes-openai-frontier-one': 27,
    '2026-09-11-embryo-base-editing-news': 40,
    '2026-09-11-high-na-large-mask-news': 31,
    '2026-09-11-sulfide-electrolyte-film-news': 18,
    '2026-09-12-lithium-disulfur-dichloride-frontier-one': 28,
    '2026-09-14-d4rt-dynamic-4d-vision-news': 19,
    '2026-09-14-fors-diffusion-sampling-news': 13,
    '2026-09-14-justgrpo-diffusion-reasoning-news': 22,
    '2026-09-15-mspa-fpba-nanopore-news': 16,
    '2026-09-15-apoe-stratified-alzheimer-news': 21,
    '2026-09-15-mos2-snn-in-logic-news': 18,
    '2026-09-16-seawater-hydrogen-water-news': 26,
    '2026-09-16-onprem-medical-agent-news': 26,
    '2026-09-16-oect-swelling-mapping-news': 31,
}
FDA = 'https://www.fda.gov/drugs/news-events-human-drugs/fda-approves-first-therapy-target-muscle-loss-spinal-muscular-atrophy'
AWARDS = 'https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/'
FDA_EDITS = [
    {'before': '이 목록은 접속 가능한 FDA 공식 확인 경로이며, 열람 환경에 따라 갱신 시점이 다른 캐시가 보일 수 있다.',
     'after': '공식 목록 주소는 유지하지만, 2026-09-16 자동접속 재점검에서는 차단 안내로 이동한 뒤 404가 반환됐다. 링크의 존재와 모든 열람 환경에서의 접근 성공을 구분해야 한다.'},
    {'before': '공지 직접 수집은 차단 안내로 이동한 뒤 404를 반환했고 직접 열람도 확인하지 못했으므로, 정상 접속을 확인한 링크처럼 제시하지 않는다. 승인 확인에는 위 FDA 목록을 사용한다.',
     'after': '2026-09-15에는 공지 직접 수집이 차단 안내로 이동한 뒤 404를 반환해 링크를 제공하지 못했다. 2026-09-16에는 웹 열람에서 공식 공지의 제목·본문과 주소를 재확인해 위 번호에 직접 링크를 연결했다. 같은 날 GitHub 자동접속 환경에서는 여전히 차단 안내 뒤 404가 반환됐다. 공식 출처의 식별과 모든 환경에서의 접근 성공은 별개의 확인 사항이다.'},
]
CITATION_CSS = '''
/* Native NEWS citations: explicit authoring, no client-side citation rewrite. */
.prose a[data-news-citation],
.prose a[data-news-reference] {
  color: var(--color-primary);
  text-decoration-line: underline;
  text-decoration-color: currentColor;
  text-underline-offset: 0.2em;
}
.prose a[data-news-citation]:focus-visible,
.prose a[data-news-reference]:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
  border-radius: 0.15rem;
}
.prose a[data-news-reference] {
  scroll-margin-top: calc(7rem + env(safe-area-inset-top, 0px));
}
.prose a[data-news-reference]:target {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
}
'''
STATIC_GATE = '''
// Check the rendered NEWS roster, not only source strings.
const { execFileSync } = await import('node:child_process');
execFileSync('python3', [new URL('./news-citation-contract.test.py', import.meta.url).pathname], { stdio: 'inherit' });
execFileSync('python3', [new URL('./news-citation-contract.py', import.meta.url).pathname], { stdio: 'inherit' });
'''
CI_STEP = '''
      - name: NEWS citation link browser check
        timeout-minutes: 4
        env:
          JJO_SMOKE_BASE_URL: ${{ github.event_name == 'workflow_dispatch' && inputs.base_url || '' }}
        run: pnpm exec node scripts/browser-news-citation-audit.mjs
'''
LIVE_STEP = '''      - name: Live NEWS citation link browser check
        timeout-minutes: 4
        run: pnpm exec node scripts/browser-news-citation-audit.mjs

'''
AUTHORING = '''

## NEWS numeric citations

Use explicit native anchors in MDX. A body citation such as
`<a href="#news-ref-1" data-news-citation="1" aria-label="참고문헌 1로 이동" data-astro-reload>[1]</a>`
points to one bibliography anchor with `id="news-ref-1"`, `data-news-reference="1"`,
and an HTTPS source URL. The source anchor opens in a new tab with
`target="_blank" rel="noopener noreferrer"`. Source titles may retain their
existing descriptive links. For `[1,2]`, link each number separately inside
the original brackets; never convert adjacent `[1][2]` into Markdown reference
syntax. Preserve code, mathematics and already working named reference links.

The rendered NEWS roster is checked for unique targets, every numeric token,
source destinations and the dated link-only repair seals. A separate additive
browser check activates every cited destination by touch/mouse, checks Back,
and presses Enter with scripting disabled at 390px and 1440px. External HTTP
reachability is a separate dated receipt: a 403, abuse-detection redirect or
empty 202 must not be represented as successful source reading.
'''


def sha(value):
    return hashlib.sha256(value.encode()).hexdigest()


def initialize():
    repairs = []
    for slug, count in sorted(BASELINE_MARKERS.items()):
        path = UI / 'site/content/posts' / (slug + '.mdx')
        baseline = subprocess.check_output(['git', 'show', f'{BASELINE}:{path.relative_to(ROOT)}'], cwd=ROOT).decode()
        assert path.read_text() == baseline, f'{slug}: production baseline drift'
        entries = []
        for match in re.finditer(r'^\[(\d+)\] (.+)$', baseline, re.M):
            num = int(match[1])
            urls = re.findall(r'https://[^\s)"<>]+', match[2])
            url = urls[0] if urls else None
            if slug == '2026-09-11-sulfide-electrolyte-film-news' and num == 1:
                url = 'https://www.nature.com/articles/s41467-026-77590-1'
                assert url in urls  # the actual paper, not the topic-index link
            if slug == '2026-09-15-mspa-fpba-nanopore-news' and num == 5:
                url = FDA
            assert url, (slug, num)
            entries.append({'number': num, 'url': url, 'style': 'bracket', 'baselineLabel': f'[{num}]'})
        if not entries:
            heading = re.search(r'^## .*출처.*$', baseline, re.M)
            assert heading
            for match in re.finditer(r'^(\d+)\. .*?\[([^\]]+)\]\((https://[^)]+)\)', baseline[heading.end():], re.M):
                num = int(match[1])
                if slug.startswith('2026-09-14-fors') and num > 2:
                    continue  # attribution note, not a cited source
                url = AWARDS if slug.startswith('2026-09-14-fors') and num == 1 else match[3]
                entries.append({'number': num, 'url': url, 'style': 'ordered',
                                'baselineLabel': f'[{match[2]}]({match[3]})', 'label': match[2]})
        assert entries
        repairs.append({'slug': slug, 'batch': 'older' if slug[:10] < '2026-09-14' else 'recent',
                        'state': 'pending', 'baselineSha256': sha(baseline), 'baselineBareMarkers': count,
                        'references': entries, 'editorialEdits': FDA_EDITS if 'mspa-fpba' in slug else []})
    value = {'edition': '2026-09-16', 'baselineCommit': BASELINE, 'stage': 'unapplied',
             'newsBaselineCount': 37, 'baselineBareMarkers': 356, 'repairs': repairs}
    LEDGER.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def citation(number, label):
    return (f'<a href="#news-ref-{number}" data-news-citation="{number}" '
            f'aria-label="참고문헌 {number}로 이동" data-astro-reload>{label}</a>')


def reference(row):
    number = row['number']
    label = row.get('label', row['baselineLabel'])
    return (f'<a id="news-ref-{number}" href="{html.escape(row["url"], quote=True)}" '
            f'data-news-reference="{number}" target="_blank" rel="noopener noreferrer">{label}</a>')


def transform(source, row):
    assert sha(source) == row['baselineSha256'], f'{row["slug"]}: baseline changed; review required'
    assert 'data-news-citation' not in source and 'data-news-reference' not in source
    citations = Counter()
    references = {str(r['number']): r for r in row['references']}
    replacements = {}
    for num, ref in references.items():
        token = f'NEWS_CITATION_REPAIR_REFERENCE_{num}_SENTINEL'
        assert token not in source
        if ref['style'] == 'bracket':
            source, count = re.subn(rf'^\[{num}\](?= )', token, source, flags=re.M)
        else:
            before = ref['baselineLabel']
            assert source.count(before) == 1, (row['slug'], before)
            source, count = source.replace(before, token), 1
        assert count == 1, (row['slug'], num, count)
        replacements[token] = reference(ref)

    def link(match):
        nums = re.findall(r'\d+', match[1])
        assert all(n in references for n in nums), (row['slug'], match[0])
        citations.update(nums)
        if len(nums) == 1:
            return citation(nums[0], match[0])
        return '[' + re.sub(r'\d+', lambda m: citation(m[0], m[0]), match[1]) + ']'

    # Preserve existing links, fenced/inline code, Math/JSX and reference definitions.
    protected = re.compile(r'(```[\s\S]*?```|~~~[\s\S]*?~~~|`+[^`]*`+|'
                           r'<[A-Z][\s\S]*?/>|<a\b[\s\S]*?</a>|'
                           r'\[[^\]\n]+\]\([^\n]*?\)|^\[\d+\]:[^\n]*$)', re.M)
    parts = protected.split(source)
    for index in range(0, len(parts), 2):
        parts[index] = MARKER.sub(link, parts[index])
    source = ''.join(parts)
    for token, value in replacements.items():
        assert source.count(token) == 1
        source = source.replace(token, value)
    row['citationCounts'] = dict(sorted(citations.items(), key=lambda pair: int(pair[0])))
    row['state'] = 'linked'
    for edit in row['editorialEdits']:
        assert source.count(edit['before']) == 1
        source = source.replace(edit['before'], edit['after'])
    row['linkedSha256'] = sha(source)
    return source


def wire_shared_controls(batch):
    if batch == 'older':
        css = UI / 'src/styles/global.css'
        assert 'Native NEWS citations' not in css.read_text()
        css.write_text(css.read_text() + CITATION_CSS)
        gate = UI / 'scripts/news-visual-contract.mjs'
        assert 'news-citation-contract.py' not in gate.read_text()
        gate.write_text(gate.read_text() + STATIC_GATE)
        ci = ROOT / '.github/workflows/blog-ci.yml'
        ci.write_text(ci.read_text() + CI_STEP)
        pages = ROOT / '.github/workflows/blog-pages-deploy.yml'
        needle = '      - name: Publish Pages live-smoke status'
        assert pages.read_text().count(needle) == 1
        pages.write_text(pages.read_text().replace(needle, LIVE_STEP + needle))
        guide = UI / 'docs/post-authoring.md'
        guide.write_text(guide.read_text() + AUTHORING)
    else:
        gate = UI / 'scripts/news-20260915-contract.mjs'
        lines = gate.read_text().splitlines()
        matches = [i for i, line in enumerate(lines) if line.startswith('assert(!read(') and 'Do not republish the failed FDA announcement URL' in line]
        assert len(matches) == 1 and FDA in lines[matches[0]]
        lines[matches[0]] = """// 2026-09-16: official title/body/address identified via web reading;
// the fresh GitHub GET still hits abuse detection. Preserve that limitation.
const nanoporeCitationSource = read('../site/content/posts/2026-09-15-mspa-fpba-nanopore-news.mdx');
assert(nanoporeCitationSource.includes('""" + FDA + """'));
assert(nanoporeCitationSource.includes('GitHub 자동접속 환경에서는 여전히 차단 안내 뒤 404'));
assert(nanoporeCitationSource.includes('공식 출처의 식별과 모든 환경에서의 접근 성공은 별개의 확인 사항'));"""
        gate.write_text('\n'.join(lines) + '\n')


def main(batch):
    assert batch in ('older', 'recent')
    if not LEDGER.exists():
        assert batch == 'older'
        initialize()
    ledger = json.loads(LEDGER.read_text())
    assert ledger['stage'] == ('unapplied' if batch == 'older' else 'older'), 'Wrong migration order or already applied'
    prepared = []
    for row in ledger['repairs']:
        if row['batch'] != batch:
            continue
        assert row['state'] == 'pending'
        path = UI / 'site/content/posts' / (row['slug'] + '.mdx')
        prepared.append((path, transform(path.read_text(), row)))
        print(row['slug'], sum(row['citationCounts'].values()), 'inline links', len(row['references']), 'sources')
    for path, source in prepared:
        path.write_text(source)
    ledger['stage'] = 'older' if batch == 'older' else 'complete'
    LEDGER.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + '\n')
    wire_shared_controls(batch)
    if batch == 'older':
        manifest = UI / 'site/news-covers-20260912.json'
        value = json.loads(manifest.read_text())
        slugs = {path.stem for path, _ in prepared}
        for row in value['entries']:
            if row['slug'] not in slugs:
                continue
            text = (UI / 'site/content/posts' / (row['slug'] + '.mdx')).read_text()
            fm = re.match(r'^---\n[\s\S]*?\n---', text)
            body = re.sub(r'^import [^\n]+;[ \t]*\n', '', text[fm.end():], flags=re.M).strip()
            hero = f'<NewsFigure media="{row["media"]}" priority />'
            assert body.startswith(hero)
            row['bodyBaselineSha256'] = sha(body[len(hero):].strip())
        manifest.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    else:
        for date in ('20260915', '20260916'):
            manifest = UI / f'site/news-edition-{date}.json'
            value = json.loads(manifest.read_text())
            for row in value['entries']:
                row['postSha256'] = sha((UI / 'site/content/posts' / (row['slug'] + '.mdx')).read_text())
            manifest.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) == 2 else '')

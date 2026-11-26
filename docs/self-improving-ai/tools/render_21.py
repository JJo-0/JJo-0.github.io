"""Reproduce Part 21's lecture slides, original paper panels and comparison chart.

Pass --cache with ntu.pdf, stanford.pdf, hyper-v1.pdf and lse-v1.pdf to run
locally. Sources are hash-pinned; crop regions are in physical PDF points,
measured from the top left. The two research papers are pinned to version 1.
"""
import argparse
import hashlib
import json
from io import BytesIO
from pathlib import Path
from subprocess import run
from urllib.request import Request, urlopen

import fitz
from matplotlib.backends.backend_agg import FigureCanvasAgg
from matplotlib.figure import Figure
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
SLUG = 'self-improving-ai-21-learning-to-improve-the-improver'
OUTPUT = ROOT / 'spaceship-ui/site/assets/assets/posts' / SLUG
CC_BY = 'https://creativecommons.org/licenses/by/4.0/'
SOURCES = {
    'ntu': ('https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf',
            '2e2f6114c8cd29edcbd00ca219e697ce6f6471f027857105238b6a590f862ed6', 'Hung-yi Lee'),
    'stanford': ('https://cs330.stanford.edu/materials/cs330_optbased_metalearning_2023.pdf',
                 '689085bf96ff61ee6d348142bb5bbf9f1ca36c84919aed19d8fd25970f223a1b', 'Chelsea Finn / Stanford CS330'),
    'hyper-v1': ('https://arxiv.org/pdf/2603.19461v1',
                 '92f9a73b43699c08c6000f7d4f1b68bec9fd872d217467fe4a1127e2f7981f1e', 'Jenny Zhang et al.'),
    'lse-v1': ('https://arxiv.org/pdf/2603.18620v1',
               '5ea3d92d73d1d5b094d625b39f964a5fb64db8b730c66a192bda5693e6db2bd1', 'Xiaoyin Chen et al.'),
}
ARCHIVE_PANEL = (68, 284, 543, 388)
AGENT_DETAIL = (330, 310, 489.5, 378)
LSE_FIGURE = (104, 78, 509, 277)
FIGURES = [
    *[('ntu', n, f'ntu-{n}-original.png', None, f'main-{n-35}') for n in range(36, 41)],
    ('stanford', 5, 'stanford-cs330-05-meta-learning-tasks.png', None, 'external-lecture-1'),
    ('hyper-v1', 4, 'hyperagents-fig1-editable-agent.png', ARCHIVE_PANEL, 'paper-figure-1'),
    ('hyper-v1', 57, 'hyperagents-fig11-parent-selection-intervals.png', None, 'paper-figure-2'),
    ('lse-v1', 2, 'lse-fig1-policy-training.png', LSE_FIGURE, 'paper-figure-3'),
]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_sources(cache):
    pdfs = {}
    for key, (url, expected, _) in SOURCES.items():
        if cache:
            data = (cache / f'{key}.pdf').read_bytes()
        else:
            with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60) as response:
                data = response.read()
        if digest(data) != expected:
            raise ValueError(f'Source differs from the reviewed PDF: {url}')
        pdfs[key] = data
    return pdfs


def page_render(page, crop, width=1800):
    area = fitz.Rect(crop) if crop else page.rect
    if area.is_empty or not page.rect.contains(area):
        raise ValueError(f'Invalid crop for PDF page {page.number + 1}: {crop}')
    zoom = width / area.width
    return page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=area, alpha=False).tobytes('png')


def hyperagent_panel(page, path):
    overview = Image.open(BytesIO(page_render(page, ARCHIVE_PANEL))).convert('RGB')
    detail = Image.open(BytesIO(page_render(page, AGENT_DETAIL, 1550))).convert('RGB')
    width = max(overview.width, 1800)
    image = Image.new('RGB', (width, overview.height + 104 + detail.height + 30), 'white')
    image.paste(overview, (0, 0))
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 44)
    draw.text((width / 2, overview.height + 47), 'Detail of the two agent roles', fill='#23394a', font=font, anchor='mm')
    image.paste(detail, ((width - detail.width) // 2, overview.height + 104))
    image.save(path, optimize=True)


def parent_selection_chart(path):
    # Appendix E.5 gives the point estimates and bounds. Section 4.2 defines
    # the aggregation across runs separately from averaging the two domains.
    rows = [('Random', .428, .407, .432), ('Modifiable', .491, .387, .512),
            ('Handcrafted', .532, .384, .586)]
    fig = Figure(figsize=(7.2, 4.9), dpi=250, facecolor='white')
    FigureCanvasAgg(fig)
    ink, teal = '#152e41', '#136d6b'
    fig.text(.05, .93, 'Parent selection on held-out tasks', size=19, weight='bold', color=ink)
    fig.text(.05, .85, 'Five runs per method · median and 95% bootstrap interval', size=12.2, color='#435967')
    ax = fig.add_axes([.06, .16, .88, .61])
    for y, (method, median, low, high) in zip([2, 1, 0], rows):
        ax.text(.35, y + .26, method, size=14, weight='bold', color=ink, va='bottom')
        ax.text(.60, y + .26, f'{median:.3f} [{low:.3f}–{high:.3f}]', size=13.4,
                color=ink, va='bottom', ha='right')
        ax.hlines(y, low, high, color=teal, linewidth=3.2, zorder=2)
        ax.vlines([low, high], y - .08, y + .08, color=teal, linewidth=2, zorder=2)
        ax.scatter([median], [y], color=teal, edgecolor='white', linewidth=.8, s=78, zorder=3)
    ax.set(xlim=(.35, .60), ylim=(-.30, 2.65), yticks=[], xticks=[.35, .40, .45, .50, .55, .60])
    ax.set_xlabel('Test score averaged over the two domains', size=12.5, color=ink, labelpad=5)
    ax.tick_params(axis='x', labelsize=12, colors='#4d626e', length=0, pad=5)
    ax.spines[['top', 'left', 'right']].set_visible(False)
    ax.spines['bottom'].set_color('#a4b2b9')
    ax.grid(axis='x', color='#dbe1e4', linewidth=.7, zorder=0)
    fig.savefig(path, dpi=250, facecolor='white', metadata={'Software': 'Part 21 figure renderer'})


def render(cache):
    pdfs = read_sources(cache)
    docs = {key: fitz.open(stream=data, filetype='pdf') for key, data in pdfs.items()}
    OUTPUT.mkdir(parents=True, exist_ok=True)
    assets = []
    for key, page_no, name, crop, slot in FIGURES:
        url, sha, author = SOURCES[key]
        path = OUTPUT / name
        page = docs[key][page_no - 1]
        details = {}
        if key == 'ntu':
            # Poppler faithfully preserves the original vector figures, as in Part 20.
            data = run(['pdftoppm', '-f', str(page_no), '-l', str(page_no), '-r', '180',
                        '-singlefile', '-png', '-'], input=pdfs[key], capture_output=True, check=True).stdout
            path.write_bytes(data)
            operation = 'Original PDF page rendered without edits'
            details.update(renderer='Poppler pdftoppm at 180 dpi', original_render_sha256=digest(data))
        elif slot == 'paper-figure-1':
            hyperagent_panel(page, path)
            operation = 'Figure 1 lower panel, followed by an enlargement of its two right-hand agent paths'
            details['detail_crop_pdf_points'] = AGENT_DETAIL
        elif slot == 'paper-figure-2':
            parent_selection_chart(path)
            operation = 'New chart of the Figure 11 test results and intervals reported in Appendix E.5, using the run summary from Section 4.2'
        else:
            path.write_bytes(page_render(page, crop))
            operation = 'Original PDF crop of Figure 1' if crop else 'Original PDF page rendered without edits'
        licensed = key in ('hyper-v1', 'lse-v1')
        if licensed:
            details.update(license_url=CC_BY, license_source=url.replace('arxiv.org/pdf/', 'arxiv.org/abs/'))
        with Image.open(path) as image:
            width, height = image.size
        assets.append({'slot': slot, 'pdf': key, 'pdf_page': page_no, 'source': f'{url}#page={page_no}',
                       'source_pdf_sha256': sha, 'author': author, 'path': path.relative_to(ROOT).as_posix(),
                       'src': f'/assets/posts/{SLUG}/{name}', 'width': width, 'height': height,
                       'sha256': digest(path.read_bytes()), 'crop_pdf_points': crop, 'operation': operation,
                       'edits': [], 'rights_status': 'CC BY 4.0' if licensed else 'unverified',
                       'permission_verified': licensed, **details})
    manifest = {'chapter': 21, 'slug': SLUG, 'lecture_part': 2, 'primary_page_range': [36, 40],
                'source_pdf_total_pages': len(docs['ntu']), 'rights_status': 'unverified', 'permission_verified': False,
                'sources': {k: {'url': s[0], 'sha256': s[1], 'pages': len(docs[k])} for k, s in SOURCES.items()},
                'assets': assets}
    fpath = ROOT / 'docs/self-improving-ai/source-assets/21/manifest.json'
    fpath.parent.mkdir(parents=True, exist_ok=True)
    fpath.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    for doc in docs.values():
        doc.close()


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--cache', type=Path, help='Directory containing the four source PDFs')
    render(cli.parse_args().cache)

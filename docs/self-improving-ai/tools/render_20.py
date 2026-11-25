"""Reproduce the nine figures for Part 20 from hash-checked source PDFs.

Use --cache with a directory containing ntu.pdf, mit.pdf, evo.pdf, adas.pdf
and dgm.pdf to render offline. PDF pages are one-based; crops use points
from the page's top left. The Table 1 chart uses the published percentages.
"""
import argparse
import hashlib
import json
from io import BytesIO
from pathlib import Path
from subprocess import run
from urllib.request import Request, urlopen

import fitz
from PIL import Image
from matplotlib.backends.backend_agg import FigureCanvasAgg
from matplotlib.figure import Figure

from render_19 import label, translate

ROOT = Path(__file__).resolve().parents[3]
SLUG = 'self-improving-ai-20-retaining-skills-and-improving-the-improver'
DEST = ROOT / 'spaceship-ui/site/assets/assets/posts' / SLUG
LICENSE = 'https://creativecommons.org/licenses/by/4.0/'
SOURCES = {
    'ntu': ('https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf',
            '2e2f6114c8cd29edcbd00ca219e697ce6f6471f027857105238b6a590f862ed6', 'Hung-yi Lee'),
    'mit': ('https://mit-mi.github.io/how2ai-course/fall2026/schedule/lec4%20-%20harness.pdf',
            'e189bbe914f9cf14efcd36eadcf821a2f3b085d72192dee3f4a70075710ec36a', 'Paul Liang'),
    'evo': ('https://arxiv.org/pdf/2605.09315',
            '05dda16d2f695a5440ea12ca946bdae093c7afd8d29b30a0e45bda2e02bcf300', 'Ye Yu et al.'),
    'adas': ('https://arxiv.org/pdf/2408.08435',
             '32eb1c1a6888e35fae0f618e33c58698b54d9c49bc063fef91ee591719fca376', 'Shengran Hu, Cong Lu and Jeff Clune'),
    'dgm': ('https://arxiv.org/pdf/2505.22954',
            '13ff4abe0c7ad4a7dd3b4876d19a8bf940e39e70dabbf06065aa774a6c3457de', 'Jenny Zhang et al.'),
}
ARXIV_IDS = {'evo': '2605.09315v1', 'adas': '2408.08435v2', 'dgm': '2505.22954v3'}
TITLE = label('目標會改變：避免遺忘', 'Goals Can Change: Avoiding Forgetting', (52, 40, 466, 80), 20.8)
UPDATES = {
    31: [TITLE, label('遺忘舊能力', 'Forgetting old skills', (339, 129, 469, 154), 13.2),
         label('遺忘舊能力', 'Forgetting old skills', (339, 305, 469, 330), 13.2)],
    32: [TITLE],
}
FIGURES = [
    ('ntu', 31, 'ntu-31-english.png', None, 'main-1'),
    ('ntu', 32, 'ntu-32-english.png', None, 'main-2'),
    ('ntu', 33, 'ntu-33-original.png', None, 'main-3'),
    ('ntu', 34, 'ntu-34-original.png', None, 'main-4'),
    ('ntu', 35, 'ntu-35-original.png', None, 'main-5'),
    ('mit', 6, 'mit-lecture4-06-model-and-harness.png', None, 'external-lecture-1'),
    ('evo', 6, 'yu-table1-workflow-retention.png', None, 'paper-table-1'),
    ('adas', 2, 'hu-fig1-meta-agent-search.png', (104, 78, 506, 199), 'paper-figure-1'),
    ('dgm', 7, 'zhang-fig3-agent-lineage.png', (306, 326, 486, 473), 'paper-figure-2'),
]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_sources(cache):
    sources = {}
    for key, (url, expected_hash, _) in SOURCES.items():
        if cache:
            data = (cache / f'{key}.pdf').read_bytes()
        else:
            with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60) as response:
                data = response.read()
        if digest(data) != expected_hash:
            raise ValueError(f'Source differs from the reviewed PDF: {url}')
        sources[key] = data
    return sources


def table_chart(path):
    # Table 1's Avg. rows for GPT-5.1, after adaptation to complex tasks. Each
    # paired set compares two final workflows from parallel optimization runs.
    figure = Figure(figsize=(7.2, 4.4), dpi=250, facecolor='white')
    FigureCanvasAgg(figure)
    ax = figure.add_axes([.22, .17, .72, .56])
    figure.text(.04, .92, 'Which workflows retain simple-task performance?', size=16, weight='bold', color='#17263a')
    figure.text(.04, .84, 'GPT-5.1 optimizer · average across three domains', size=13, color='#42536a')
    series = [('Vanilla', (41.8, 23.9), '#58677e', .17), ('CPE', (52.8, 33.4), '#157d77', -.17)]
    for name, scores, color, offset in series:
        bars = ax.barh([1 + offset, offset], scores, height=.29, color=color, label=name, zorder=2)
        ax.bar_label(bars, fmt='%.1f', padding=5, size=13.5, weight='bold', color=color)
    ax.set_yticks([1, 0], ['Simple', 'Complex'], fontsize=14, color='#182537')
    ax.set_ylim(-.54, 1.54)
    ax.set_xlim(0, 60)
    ax.set_xticks([0, 20, 40, 60])
    ax.set_xlabel('Final task success (%)', fontsize=13, labelpad=6, color='#263950')
    ax.tick_params(axis='x', labelsize=12, colors='#516174', length=0)
    ax.tick_params(axis='y', length=0, pad=8)
    ax.grid(axis='x', color='#d5dce3', linewidth=.8, zorder=0)
    ax.spines[['top', 'bottom', 'right']].set_visible(False)
    ax.spines['left'].set_color('#a8b4c0')
    ax.legend(loc='upper right', bbox_to_anchor=(1.02, 1.23), frameon=False, ncols=2, fontsize=12,
              handlelength=1.2, columnspacing=1.2, handletextpad=.4)
    figure.savefig(path, dpi=250, facecolor='white', metadata={'Software': 'Part 20 figure renderer'})


def render(cache):
    pdfs = read_sources(cache)
    docs = {key: fitz.open(stream=pdf, filetype='pdf') for key, pdf in pdfs.items()}
    DEST.mkdir(parents=True, exist_ok=True)
    assets = []
    for key, number, name, crop, slot in FIGURES:
        url, pdf_hash, author = SOURCES[key]
        page = docs[key][number - 1]
        path = DEST / name
        edits = UPDATES.get(number, []) if key == 'ntu' else []
        details = {}
        if key == 'evo':
            table_chart(path)
            operation = 'Original chart of the GPT-5.1 Avg. rows in Table 1, comparing final workflows'
        else:
            rect = fitz.Rect(crop) if crop else page.rect
            if rect.is_empty or not page.rect.contains(rect):
                raise ValueError(f'Invalid source region in {url}, page {number}')
            scale = 1800 / rect.width
            if key == 'ntu':
                # MuPDF extends page 33’s brace through the robot. Poppler renders
                # the five original slides faithfully at 180 dpi (2.5 px/pt).
                raw = run(['pdftoppm', '-f', str(number), '-l', str(number), '-r', '180',
                           '-singlefile', '-png', '-'], input=pdfs[key], capture_output=True, check=True).stdout
                details['renderer'] = 'Poppler pdftoppm at 180 dpi'
            else:
                raw = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=rect, alpha=False).tobytes('png')
            if edits:
                if scale != 2.5:
                    raise ValueError('Text edits are positioned for NTU slides at scale 2.5')
                image = Image.open(BytesIO(raw)).convert('RGB')
                for edit in edits:
                    translate(image, edit)
                image.save(path, optimize=True)
                operation = 'Original NTU slide with unofficial English text edits'
            else:
                path.write_bytes(raw)
                operation = 'Original PDF crop' if crop else 'Original PDF page rendered without edits'
            if key == 'ntu':
                details['original_render_sha256'] = digest(raw)
        if key in ARXIV_IDS:
            details['license_url'] = LICENSE
            details['license_source'] = f'https://arxiv.org/abs/{ARXIV_IDS[key]}'
        with Image.open(path) as image:
            width, height = image.size
        assets.append({'slot': slot, 'pdf': key, 'pdf_page': number, 'source': f'{url}#page={number}',
                       'source_pdf_sha256': pdf_hash, 'author': author, 'path': path.relative_to(ROOT).as_posix(),
                       'src': f'/assets/posts/{SLUG}/{name}', 'width': width, 'height': height,
                       'sha256': digest(path.read_bytes()), 'crop_pdf_points': crop, 'operation': operation,
                       'edits': [{'original': e['original'], 'english': e['english'], 'rect_pdf_points': e['bounds']}
                                 for e in edits], 'rights_status': 'CC BY 4.0' if key in ARXIV_IDS else 'unverified',
                       'permission_verified': key in ARXIV_IDS, **details})
    manifest = {'chapter': 20, 'slug': SLUG, 'lecture_part': 2, 'primary_page_range': [31, 35],
                'source_pdf_total_pages': len(docs['ntu']), 'rights_status': 'unverified', 'permission_verified': False,
                'sources': {k: {'url': v[0], 'sha256': v[1], 'pages': len(docs[k])} for k, v in SOURCES.items()},
                'assets': assets}
    manifest_path = ROOT / 'docs/self-improving-ai/source-assets/20/manifest.json'
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    for doc in docs.values():
        doc.close()


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--cache', type=Path, help='Directory containing the five source PDFs')
    render(cli.parse_args().cache)

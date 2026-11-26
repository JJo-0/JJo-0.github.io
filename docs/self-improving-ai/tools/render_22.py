"""Reproduce the source slides and supplementary figures used in chapter 22.

Pass --cache with ntu.pdf, stanford.pdf, posttrain.pdf, alpha.pdf and shinka.pdf.
Regions are rectangles in original PDF points measured from the top left.
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
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[3]
SLUG = 'self-improving-ai-22-learning-the-parameter-update-rule'
OUTPUT = ROOT / 'spaceship-ui/site/assets/assets/posts' / SLUG
BY = 'https://creativecommons.org/licenses/by/4.0/'
BY_NC_ND = 'https://creativecommons.org/licenses/by-nc-nd/4.0/'
SOURCES = {
    'ntu': ('https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf',
            '2e2f6114c8cd29edcbd00ca219e697ce6f6471f027857105238b6a590f862ed6', 'Hung-yi Lee', None),
    'stanford': ('https://cs229.stanford.edu/summer2023/cs229-notes1.pdf',
                 '38da2bd54b53066ea7415a4523defa000bd6f9ffccdd61bbaf8b92cc072a68aa',
                 'Andrew Ng / Stanford CS229', None),
    'posttrain': ('https://arxiv.org/pdf/2603.08640v2',
                  '823f11de21206c9ba5be0531bee62f1d29d97cfeb5c8e9a6c90a2256f1f948bc',
                  'Ben Rank et al.', BY),
    'alpha': ('https://arxiv.org/pdf/2506.13131v1',
              'f092c8cbd65da89951ee6496374da9a54963f9035758c25ac6e4625f506df9ad',
              'Alexander Novikov et al. / Google DeepMind', BY_NC_ND),
    'shinka': ('https://arxiv.org/pdf/2509.19349v1',
               'ee287343c53240126e16a444d5ade2cd0ad0f290a400e78b97a040b93d965087',
               'Robert Tjarko Lange, Yuki Imajuku and Edoardo Cetin', BY),
}
FIGURES = [
    *[('ntu', n, f"ntu-{n}-{'english' if n == 42 else 'original'}.png", None, f'main-{n-40}')
      for n in range(41, 46)],
    ('stanford', 6, 'stanford-cs229-gradient-descent-path.png', (191, 202, 417, 382), 'external-lecture-1'),
    ('posttrain', 3, 'posttrainbench-fig2-evaluation.png', (54, 64, 543, 200), 'paper-figure-1'),
    ('alpha', 9, 'alphaevolve-4x4-complex-scalar-multiplications.png', None, 'paper-figure-2'),
    ('shinka', 1, 'shinkaevolve-fig1-program-search.png', (75, 467, 289, 621), 'paper-figure-3'),
]
OPERATIONS = {
    'stanford': 'Upper contour and iterate plot from page 6; original axes and plotted points retained',
    'posttrain': 'Figure 2 in full, followed by an enlarged detail of the judge and the two evaluation paths',
    'alpha': 'Independent chart of scalar-multiplication counts: direct expansion (16 entries × 4 products), and the two reported ranks from Table 2',
    'shinka': 'Figure 1 left panel, the complete program-evolution cycle; right comparison panel omitted',
}
POSTTRAIN_DETAIL = (264, 64, 540, 196)
FONT_DIR = Path('/usr/share/fonts/truetype/dejavu')
TITLE_EDIT = {'source_bbox_pdf_points': [54, 41, 551, 78],
              'original': '上次在課程接近結尾的時候有提到',
              'english': 'Near the end of the previous lecture',
              'replacement_bbox_pdf_points': [54, 39, 679, 84]}
THUMB_EDIT = {'source_bbox_pdf_points': [258, 119, 482, 294],
              'original': 'AI會自己變強？沒人類也行？',
              'english': 'Can AI improve on its own? Even without humans?',
              'replacement_bbox_pdf_points': [246, 103, 500, 311]}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_source(key, cache):
    url, sha, _, _ = SOURCES[key]
    if cache:
        data = (cache / f'{key}.pdf').read_bytes()
    else:
        with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=45) as response:
            data = response.read()
    if digest(data) != sha:
        raise ValueError(f'PDF changed since review: {url}')
    return data


def crop_page(page, clip, width=1800):
    rect = fitz.Rect(clip)
    if rect.is_empty or not page.rect.contains(rect):
        raise ValueError(f'Invalid crop on page {page.number + 1}: {clip}')
    zoom = width / rect.width
    pixels = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=rect, alpha=False)
    return Image.open(BytesIO(pixels.tobytes('png'))).convert('RGB')


def english_recap(data):
    image = Image.open(BytesIO(data)).convert('RGB')
    draw = ImageDraw.Draw(image)
    scale = image.width / 720

    def coords(values):
        return tuple(round(v * scale) for v in values)

    def label(position, value, size, color, font_name):
        font = ImageFont.truetype(str(FONT_DIR / font_name), round(size * scale))
        draw.text(coords(position), value, font=font, fill=color, anchor='lt')

    draw.rectangle(coords(TITLE_EDIT['replacement_bbox_pdf_points']), fill='white')
    label((55, 45), TITLE_EDIT['english'], 28, '#171717', 'DejaVuSans.ttf')
    # The embedded thumbnail has a staggered headline. Keep the robots, arrows,
    # timestamp and video progress bar outside the original lettering intact.
    outline = [(256, 117), (409, 117), (424, 121), (430, 137),
               (437, 154), (451, 170), (481, 175), (492, 199),
               (490, 229), (481, 246), (459, 250), (436, 255),
               (420, 269), (407, 286), (393, 296), (256, 296)]
    mask = Image.new('L', image.size, 0)
    ImageDraw.Draw(mask).polygon([coords(p) for p in outline], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(5 * scale))
    ImageDraw.Draw(mask).rectangle(coords((0, 0, 253, 405)), fill=0)
    image.paste('#11132d', (0, 0, *image.size), mask)
    label((268, 133), 'Can AI', 27, '#fbfaf8', 'DejaVuSans-Bold.ttf')
    label((268, 173), 'improve', 28, '#ffe15a', 'DejaVuSans-Bold.ttf')
    label((268, 209), 'on its own?', 26, '#ffe15a', 'DejaVuSans-Bold.ttf')
    label((268, 260), 'Even without', 15, '#ffffff', 'DejaVuSans-Bold.ttf')
    label((268, 279), 'humans?', 15, '#ffffff', 'DejaVuSans-Bold.ttf')
    return image


def posttrain_zoom(page, original):
    detail = crop_page(page, POSTTRAIN_DETAIL, width=1520)
    image = Image.new('RGB', (original.width, original.height + detail.height + 118), 'white')
    image.paste(original, (0, 0))
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(str(FONT_DIR / 'DejaVuSans.ttf'), 43)
    draw.text((original.width / 2, original.height + 46), 'Detail of the evaluation paths',
              font=font, fill='#203847', anchor='mm')
    image.paste(detail, ((original.width - detail.width) // 2, original.height + 92))
    return image


def multiplication_counts(path):
    # Table 2 reports the upper bounds 49 and 48; the direct count is derived.
    fig = Figure(figsize=(7.2, 5.25), dpi=250, facecolor='white')
    FigureCanvasAgg(fig)
    ink = '#172e40'
    fig.text(.065, .89, 'Multiplying two 4 × 4 matrices', color=ink, weight='bold', size=22)
    fig.text(.065, .825, 'Scalar multiplications over the complex numbers', color='#485d69', size=15)
    axis = fig.add_axes((.07, .15, .855, .565))
    rows = [('Direct expansion', 4 * 4 * 4, '#738894'),
            ('Strassen, two levels', 7 * 7, '#526d7b'),
            ('AlphaEvolve', 48, '#10716f')]
    for height, (name, count, color) in zip((2, 1, 0), rows):
        axis.text(0, height + .22, name, color=ink, weight='bold', size=16, va='bottom')
        axis.barh(height, count, height=.21, color=color, zorder=2)
        axis.text(count + 1.05, height, str(count), color=ink, size=16, va='center', weight='bold')
    axis.set(xlim=(0, 70), ylim=(-.28, 2.7), xticks=[0, 16, 32, 48, 64], yticks=[])
    axis.tick_params(axis='x', colors='#465d6a', length=0, labelsize=14, pad=5)
    axis.set_xlabel('Number of products', size=14, color=ink, labelpad=5)
    axis.grid(axis='x', color='#dbe3e7', linewidth=.75)
    axis.spines[['top', 'left', 'right']].set_visible(False)
    axis.spines['bottom'].set_color('#97a9b2')
    fig.savefig(path, dpi=250, facecolor='white', metadata={'Software': 'Part 22 figure renderer'})


def render(cache):
    pdfs = {key: read_source(key, cache) for key in SOURCES}
    docs = {key: fitz.open(stream=raw, filetype='pdf') for key, raw in pdfs.items()}
    OUTPUT.mkdir(parents=True, exist_ok=True)
    assets = []
    for key, page_no, filename, clip, slot in FIGURES:
        url, sha, author, license_url = SOURCES[key]
        path = OUTPUT / filename
        edits = []
        fields = {}
        if key == 'ntu':
            raw = run(['pdftoppm', '-f', str(page_no), '-l', str(page_no), '-r', '180', '-singlefile',
                       '-png', '-'], input=pdfs[key], capture_output=True, check=True).stdout
            fields.update(renderer='Poppler pdftoppm at 180 dpi', original_render_sha256=digest(raw))
            if page_no == 42:
                english_recap(raw).save(path, optimize=True)
                edits = [TITLE_EDIT, THUMB_EDIT]
                operation = 'English lettering over the original heading and video-thumbnail title; speaker link retained'
            else:
                path.write_bytes(raw)
                operation = 'Original PDF page rendered without edits'
        elif key == 'alpha':
            multiplication_counts(path)
            operation = OPERATIONS[key]
            fields.update(artwork_credit='Chapter 22 editors', reported_counts={'Strassen': 49, 'AlphaEvolve': 48},
                          derived_count={'direct_expansion': 64}, report_license_url=license_url,
                          report_license_source=url.replace('arxiv.org/pdf/', 'arxiv.org/abs/'))
        else:
            page = docs[key][page_no - 1]
            image = crop_page(page, clip)
            if key == 'posttrain':
                image = posttrain_zoom(page, image)
                fields['detail_crop_pdf_points'] = POSTTRAIN_DETAIL
            image.save(path, optimize=True)
            operation = OPERATIONS[key]
        if license_url and key != 'alpha':
            fields.update(license_url=license_url, license_source=url.replace('arxiv.org/pdf/', 'arxiv.org/abs/'))
        with Image.open(path) as image:
            width, height = image.size
        assets.append({'slot': slot, 'pdf': key, 'pdf_page': page_no, 'source': f'{url}#page={page_no}',
                       'source_pdf_sha256': sha, 'author': author, 'path': path.relative_to(ROOT).as_posix(),
                       'src': f'/assets/posts/{SLUG}/{filename}', 'width': width, 'height': height,
                       'sha256': digest(path.read_bytes()), 'crop_pdf_points': clip, 'operation': operation,
                       'edits': edits, 'rights_status': 'original_chart' if key == 'alpha' else
                       {None: 'unverified', BY: 'CC BY 4.0'}[license_url],
                       'permission_verified': license_url is not None, **fields})
    manifest = {'chapter': 22, 'slug': SLUG, 'lecture_part': 2, 'primary_page_range': [41, 45],
                'source_pdf_total_pages': len(docs['ntu']), 'rights_status': 'unverified', 'permission_verified': False,
                'sources': {k: {'url': s[0], 'sha256': s[1], 'pages': len(docs[k])} for k, s in SOURCES.items()},
                'assets': assets}
    path = ROOT / 'docs/self-improving-ai/source-assets/22/manifest.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    for doc in docs.values():
        doc.close()


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--cache', type=Path, help='Directory of the five source PDFs')
    render(cli.parse_args().cache)

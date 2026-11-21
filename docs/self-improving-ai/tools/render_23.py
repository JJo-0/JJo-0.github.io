"""Rebuild chapter 23. With --cache, provide ntu, stanford, seal, optimizer and maml PDFs."""
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
SLUG = 'self-improving-ai-23-self-edits-and-meta-learning'
OUTPUT = ROOT / 'spaceship-ui/site/assets/assets/posts' / SLUG
SOURCES = {
    'ntu': ('https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf',
            '2e2f6114c8cd29edcbd00ca219e697ce6f6471f027857105238b6a590f862ed6', 'Hung-yi Lee / NTU'),
    'stanford': ('https://cs330.stanford.edu/materials/cs330_optbased_metalearning_2023.pdf',
                 '689085bf96ff61ee6d348142bb5bbf9f1ca36c84919aed19d8fd25970f223a1b', 'Chelsea Finn / Stanford CS330'),
    'seal': ('https://arxiv.org/pdf/2506.10943v2',
             '3abf83bcf05862d5e6e72078dc0e47ebfcf2e72866e9fdfe1dbc3663c72a9dc6', 'Adam Zweiger et al.'),
    'optimizer': ('https://papers.nips.cc/paper_files/paper/2016/file/fb87582825f9d28a8d42c5e5e5e8b23d-Paper.pdf',
                  '54b6d630de72993da75ba891d1ffcf9a24bc826487bc859d2ad280e0885d298a', 'Marcin Andrychowicz et al.'),
    'maml': ('https://proceedings.mlr.press/v70/finn17a/finn17a.pdf',
             'e9f197b4b3a18c7d5f693e87442ce8ec7837726b4218451eb726565799612353', 'Chelsea Finn, Pieter Abbeel and Sergey Levine'),
}
SEAL_RATES = [0, 20, 72.5, 100]
MAML_ACCURACY = [48.70, 63.11]
MAML_HALF_INTERVALS = [1.84, 0.92]
LECTURE_CROP = (22, 520, 1383, 856)
TITLES = [
    {'source_bbox_pdf_points': [51, 330, 362, 358],
     'original': '【機器學習2021】元學習 Meta Learning (一) - 元學習跟機器學習一樣也是三個步驟',
     'english': ['ML 2021 · Meta-learning (1)', 'Three steps, as in machine learning']},
    {'source_bbox_pdf_points': [381, 330, 695, 358],
     'original': '【機器學習2021】元學習 Meta Learning (二) - 萬物皆可 Meta',
     'english': ['ML 2021 · Meta-learning (2)', 'Anything can be meta-learned']},
]
FIGURES = [
    *[('ntu', n, f"ntu-{n}-{'english' if n == 50 else 'original'}.png", f'main-{n-45}')
      for n in range(46, 51)],
    ('stanford', 20, 'stanford-cs330-inner-outer-datasets.png', 'external-lecture-1'),
    ('seal', 7, 'seal-arc-success.png', 'paper-figure-1'),
    ('optimizer', 3, 'learned-optimizer-coordinate-update.png', 'paper-figure-2'),
    ('maml', 7, 'maml-miniimagenet-accuracy.png', 'paper-figure-3'),
]
INK = '#193343'
ACCENT = '#087767'
MUTED = '#49616f'
NEUTRAL = '#80949f'
GRID = '#d9e3e6'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_pdf(key, cache):
    url, expected_hash, _ = SOURCES[key]
    if cache:
        data = (cache / f'{key}.pdf').read_bytes()
    else:
        with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=45) as response:
            data = response.read()
    if digest(data) != expected_hash:
        raise ValueError(f'Unexpected PDF contents: {url}')
    return data


def translate_titles(raw, path):
    image = Image.open(BytesIO(raw)).convert('RGB')
    draw = ImageDraw.Draw(image)
    scale = image.width / 720
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', round(10.8 * scale))
    for edit in TITLES:
        left, top, right, bottom = edit['source_bbox_pdf_points']
        draw.rectangle(tuple(round(i * scale) for i in (left, top, right, bottom)), fill='white')
        for row, line in enumerate(edit['english']):
            draw.text((round((left + 1) * scale), round((top + 1 + row * 13) * scale)),
                      line, fill=INK, font=font, anchor='lt')
    image.save(path, optimize=True)


def slide_excerpt(page, rect, width):
    clip = fitz.Rect(rect)
    zoom = width / clip.width
    px = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip, alpha=False)
    return Image.frombytes('RGB', (px.width, px.height), px.samples)


def stanford_algorithm(page, path):
    full = slide_excerpt(page, LECTURE_CROP, 1800)
    details = [
        ('Inner step · Adapt to the support set', (665, 700, 1373, 775)),
        ('Outer step · Score on the query set', (144, 787, 802, 855)),
    ]
    panels = [(title, slide_excerpt(page, rect, 1430)) for title, rect in details]
    image = Image.new('RGB', (full.width, full.height + sum(105 + part.height for _, part in panels)), 'white')
    image.paste(full)
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 53)
    y = full.height
    for title, part in panels:
        draw.text((68, y + 24), title, fill=INK, font=font, anchor='lt')
        image.paste(part, (68, y + 91))
        y += 105 + part.height
    image.save(path, optimize=True)
    return [rect for _, rect in details]


def chart(width, height):
    fig = Figure(figsize=(width, height), dpi=250, facecolor='white')
    FigureCanvasAgg(fig)
    return fig


def save_chart(fig, path):
    fig.savefig(path, dpi=250, facecolor='white', metadata={'Software': 'Chapter 23 figure renderer'})


def x_axis(axis, ticks, label):
    axis.set(xticks=ticks, yticks=[])
    axis.tick_params(axis='x', colors=MUTED, length=0, labelsize=13, pad=5)
    axis.set_xlabel(label, size=15, color=INK, labelpad=8)
    axis.grid(axis='x', color=GRID, linewidth=.7)
    axis.set_axisbelow(True)
    axis.spines[['left', 'right', 'top']].set_visible(False)
    axis.spines['bottom'].set_color(NEUTRAL)


def arc_success(path):
    fig = chart(7.2, 5.5)
    fig.text(.06, .911, 'Self-editing on ARC tasks', size=22, weight='bold', color=INK)
    fig.text(.06, .842, 'Eight held-out tasks selected for oracle solvability', size=14, color=MUTED)
    axis = fig.add_axes((.06, .15, .87, .64))
    labels = ['In-context learning', 'TTT + self-edit, no prior RL', 'SEAL', 'Oracle TTT']
    for y, name, value in zip([3, 2, 1, 0], labels, SEAL_RATES):
        color = ACCENT if name == 'SEAL' else NEUTRAL
        axis.text(0, y + .23, name, size=15, color=INK, weight='bold', va='bottom')
        if value:
            axis.barh(y, value, height=.20, color=color, zorder=3)
        else:
            axis.scatter([0], [y], s=35, color=color, zorder=3, clip_on=False)
        axis.text(value + 1.25, y, f'{value:g}%', va='center', color=INK, size=14)
    axis.set(xlim=(0, 113), ylim=(-.4, 3.65))
    x_axis(axis, [0, 25, 50, 75, 100], 'Reported success rate (%)')
    save_chart(fig, path)


def coordinate_rule(path):
    fig = chart(7.2, 4.95)
    fig.text(.06, .894, 'One learned rule, two coordinates', color=INK, size=20, weight='bold')
    a = fig.add_axes((0, 0, 1, 1), frameon=False)
    a.set(xlim=(0, 1), ylim=(0, 1))
    a.axis('off')
    for x, label in zip((.18, .47, .795), ('Gradient, state', 'Shared rule', 'Step, new state')):
        a.text(x, .737, label, color=MUTED, fontsize=15, ha='center', va='center')
    for coordinate, y in [(1, .56), (2, .37)]:
        arg = rf'$(\nabla_{coordinate} f, h_t^{{({coordinate})}})$'
        output = rf'$(g_t^{{({coordinate})}}, h_{{t+1}}^{{({coordinate})}})$'
        a.text(.18, y, arg, ha='center', va='center', fontsize=20, color=INK)
        a.text(.47, y, r'$m_\phi$', ha='center', va='center', fontsize=21, color='white',
               bbox=dict(boxstyle='round,pad=.32', fc=ACCENT, ec='none'))
        a.text(.795, y, output, ha='center', va='center', fontsize=20, color=INK)
        for start, end in ((.32, .393), (.55, .621)):
            a.annotate('', xy=(end, y), xytext=(start, y), arrowprops=dict(arrowstyle='-|>', lw=1.8, color=MUTED))
    a.plot([.07, .93], [.24, .24], color=GRID, lw=1.2)
    a.text(.50, .128, r'Update each weight:  $\theta_{t+1}^{(i)}=\theta_t^{(i)}+g_t^{(i)}$',
           fontsize=17, color=INK, va='center', ha='center')
    save_chart(fig, path)


def five_way_accuracy(path):
    fig = chart(7.2, 4.65)
    fig.text(.06, .891, 'MAML on 5-way MiniImageNet', size=20, weight='bold', color=INK)
    fig.text(.06, .805, 'Accuracy and reported 95% confidence intervals', size=15, color=MUTED)
    axis = fig.add_axes((.07, .19, .88, .50))
    for y, n, value, half in zip([1, 0], [1, 5], MAML_ACCURACY, MAML_HALF_INTERVALS):
        color = MUTED if n == 1 else ACCENT
        axis.text(40, y + .23, f'{n}-shot', weight='bold', size=16, color=INK, va='bottom')
        axis.errorbar(value, y, xerr=half, fmt='o', color=color, ms=8, elinewidth=2.2, capsize=5, zorder=3)
        axis.text(value, y+.23, f'{value:.2f} ± {half:.2f}%', fontsize=15, va='bottom', ha='center', color=INK)
    axis.set(xlim=(39.5, 71.5), ylim=(-.40, 1.61))
    x_axis(axis, [40, 45, 50, 55, 60, 65, 70], 'Accuracy on held-out tasks (%)')
    save_chart(fig, path)


def render(cache):
    data = {key: read_pdf(key, cache) for key in SOURCES}
    docs = {key: fitz.open(stream=blob, filetype='pdf') for key, blob in data.items()}
    OUTPUT.mkdir(parents=True, exist_ok=True)
    assets = []
    for key, number, filename, slot in FIGURES:
        url, sha, author = SOURCES[key]
        path = OUTPUT / filename
        fields = {}
        crop = None
        edits = []
        if key == 'ntu':
            raw = run(['pdftoppm', '-f', str(number), '-l', str(number), '-r', '180', '-singlefile',
                       '-png', '-'], input=data[key], capture_output=True, check=True).stdout
            fields = {'renderer': 'Poppler pdftoppm at 180 dpi', 'original_render_sha256': digest(raw)}
            if number == 50:
                translate_titles(raw, path)
                edits = TITLES
                operation = 'Replaced the Chinese video titles under the two thumbnails with English translations.'
            else:
                path.write_bytes(raw)
                operation = 'Original PDF page rendered without edits'
        elif key == 'stanford':
            crop = LECTURE_CROP
            fields['detail_crops_pdf_points'] = stanford_algorithm(docs[key][number-1], path)
            operation = 'Four-step algorithm from the optimization-based adaptation lecture with enlarged details of the inner and outer steps.'
        elif key == 'seal':
            arc_success(path)
            operation = 'Independently plotted success rates from Table 1 for the four reported conditions.'
            fields.update(reported_rates_percent=SEAL_RATES, evaluation_tasks=8, self_edits_per_task=5)
        elif key == 'optimizer':
            coordinate_rule(path)
            operation = 'Original two-coordinate illustration of Equation 3 on page 3 and coordinatewise shared weights on page 4.'
            fields['coordinate_sharing_source'] = url + '#page=4'
        else:
            five_way_accuracy(path)
            operation = 'Independent chart of the MAML row in Table 1, lower panel. Whiskers show the reported 95% confidence intervals across tasks.'
            fields.update(shots_per_class=[1, 5], mean_accuracy_percent=MAML_ACCURACY,
                          confidence_half_width_percentage_points=MAML_HALF_INTERVALS)
        original = key not in ('ntu', 'stanford')
        if original:
            fields['artwork_credit'] = 'Chapter 23 editors'
        with Image.open(path) as image:
            width, height = image.size
        assets.append({'slot': slot, 'pdf': key, 'pdf_page': number, 'source': f'{url}#page={number}',
                       'source_pdf_sha256': sha, 'author': author, 'path': path.relative_to(ROOT).as_posix(),
                       'src': f'/assets/posts/{SLUG}/{filename}', 'width': width, 'height': height,
                       'sha256': digest(path.read_bytes()), 'crop_pdf_points': crop, 'operation': operation,
                       'edits': edits, 'rights_status': 'original_artwork' if original else 'unverified',
                       'permission_verified': original, **fields})
    manifest = {'chapter': 23, 'slug': SLUG, 'lecture_part': 2, 'primary_page_range': [46, 50],
                'source_pdf_total_pages': len(docs['ntu']), 'rights_status': 'unverified', 'permission_verified': False,
                'sources': {k: {'url': s[0], 'sha256': s[1], 'pages': len(docs[k])} for k, s in SOURCES.items()},
                'assets': assets}
    dest = ROOT / 'docs/self-improving-ai/source-assets/23/manifest.json'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    for doc in docs.values():
        doc.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=Path, help='Directory of reviewed PDF sources')
    render(parser.parse_args().cache)

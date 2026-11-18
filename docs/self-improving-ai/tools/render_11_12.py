"""Render chapters 11–12 from pinned sources and native PDF text layers.

The numerical tables and plots are preserved from their sources. Chinese text
is localized in the PDF before rasterization; no generative image model is used.
Web figures are copied byte-for-byte from the cited research page.

Usage:
  python docs/self-improving-ai/tools/render_11_12.py --source-dir /tmp/sources

Use --primary-only to inspect the ten main slides before the articles are ready.
The final manifest is generated only by a complete render against the articles.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen

import pymupdf as fitz

SLUGS = {
    11: 'self-improving-ai-11-automated-post-training',
    12: 'self-improving-ai-12-weak-to-strong-generalization',
}
SOURCES = {
    'ntu': {
        'url': 'https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf',
        'sha256': '0bf81bb4af728ed04c21e2811aa2f1cb0210c70d09d7c6ebb2acf3c3f77b4844',
        'pages': 62,
    },
    'posttrainbench-v2': {
        'url': 'https://arxiv.org/pdf/2603.08640v2',
        'sha256': '823f11de21206c9ba5be0531bee62f1d29d97cfeb5c8e9a6c90a2256f1f948bc',
        'pages': 16,
    },
    'ft-dojo-v1': {
        'url': 'https://arxiv.org/pdf/2603.01712v1',
        'sha256': '2b38e2656005726668306f284102ed82d2857a6ba9217b62506b708983fa54e4',
        'pages': 24,
    },
    'openai-w2s': {
        'url': 'https://cdn.openai.com/papers/weak-to-strong-generalization.pdf',
        'sha256': '1f655c3d9a5cfaab535e2c0b1901b56dd9260c15a79ac6b237ef548c03041098',
        'pages': 49,
    },
}
SUPPLEMENTARY = {
    11: [
        ('A', 'ft-dojo-v1', 5, [61, 91, 281, 264], 'ft-dojo-v1-figure2.png'),
        ('B', 'posttrainbench-v2', 3, [57, 66, 539, 195], 'posttrainbench-v2-figure2.png'),
        ('C', 'posttrainbench-v2', 4, [55, 65, 290, 460], 'posttrainbench-v2-figure3.png'),
        ('D', 'posttrainbench-v2', 9, [55, 66, 289, 215], 'posttrainbench-v2-figure7.png'),
    ],
    12: [
        ('B', 'openai-w2s', 10, [145, 90, 465, 250], 'openai-w2s-figure5.png'),
    ],
}
WEB_SOURCE = 'https://alignment.anthropic.com/2026/automated-w2s-researcher/'
WEB_FIGURES = [
    ('A', 'fig4.png', 'anthropic-fig4.png', 'anthropic-aar-setup.png',
     'f126431e2a258f6f144c3568bb7a12c213524abfb65684464ab7d1195389b828'),
    ('C', 'fig5.png', 'anthropic-fig5.png', 'anthropic-directed-search.png',
     '7e374c930fb9219fe6dbcd5fbd13de35fdf30d1d62b85128eb5e5958dd9ed8ac'),
    ('D', 'fig8.png', 'anthropic-fig8.png', 'anthropic-heldout-transfer.png',
     '5efe60091b831866ea4914201f6f3a1a1730670e86e224a22788ca92ac2c0d85'),
]

# Redaction removes native text only. Images, gradients, lines and charts remain.
# The date on page 56 is embedded in a screenshot, so a small PDF rectangle
# masks just that date. The original research title and author names remain.
EDITS = {
    51: [
        ([30, 34, 932, 74], [31, 34, 932, 81],
         'Continual self-improvement is difficult, but AI can train weaker models.', 27, 0),
        ([108, 270, 253, 337], [62, 264, 291, 347],
         'Step 1:\nWhat is the goal?', 23, 1),
        ([393, 270, 567, 337], [365, 264, 595, 347],
         'Step 2:\nWhat are the options?', 22, 1),
        ([692, 270, 866, 337], [665, 257, 900, 319],
         'Step 3:\nChoose the best option', 21, 1),
    ],
    55: [
        ([90, 144, 484, 177], [91, 146, 925, 181],
         'Download test data and use it for training', 27, 0),
        ([90, 220, 459, 255], [91, 222, 925, 261],
         'Call other language model APIs for help', 27, 0),
        ([90, 381, 430, 414], [91, 383, 925, 422],
         'Download a model already trained by someone else', 27, 0),
    ],
    59: [
        ([75, 146, 775, 210], [76, 146, 915, 179],
         'Claude Opus proposes methods for weak-to-strong alignment', 24, 0),
    ],
    60: [
        ([71, 84, 278, 151], [72, 85, 288, 160],
         'As of May 2026,\nprobably still\non the riverbank.', 22, 0),
    ],
}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fetch_source(source_dir: Path, key: str) -> bytes:
    spec = SOURCES[key]
    cached = source_dir / (key + '.pdf')
    if cached.exists():
        data = cached.read_bytes()
    else:
        with urlopen(Request(spec['url'], headers={'User-Agent': 'JJo-source-review/1.0'}), timeout=60) as response:
            data = response.read(80_000_001)
        if len(data) > 80_000_000:
            raise ValueError('Source exceeds size limit: ' + key)
        if digest(data) != spec['sha256']:
            raise ValueError('Source version changed: ' + key)
        cached.parent.mkdir(parents=True, exist_ok=True)
        cached.write_bytes(data)
    if digest(data) != spec['sha256']:
        raise ValueError('Source hash mismatch: ' + key)
    return data


def localize(page: fitz.Page, page_number: int) -> list[dict]:
    edits = EDITS.get(page_number, [])
    for removal, _, _, _, _ in edits:
        page.add_redact_annot(fitz.Rect(removal), fill=None, cross_out=False)
    if edits:
        page.apply_redactions(images=0, graphics=0, text=0)
    records = []
    for removal, target, english, initial_size, align in edits:
        for size in range(initial_size, 11, -1):
            shape = page.new_shape()
            spare = shape.insert_textbox(fitz.Rect(target), english, fontname='helv',
                                        fontsize=size, align=align, lineheight=1.1)
            if spare >= 0:
                shape.commit(overlay=True)
                break
        else:
            raise ValueError('English text overflow on page ' + str(page_number))
        records.append({
            'method': 'native_pdf_text_layer', 'removed_text_bbox_pdf_points': removal,
            'replacement_bbox_pdf_points': target, 'english': english, 'font_size': size,
        })
    if page_number == 56:
        box = fitz.Rect(440, 217, 544, 241)
        page.draw_rect(box, color=None, fill=(0.9765, 0.9725, 0.9608), overlay=True)
        remaining = page.insert_textbox(box, 'April 14, 2026', fontname='helv', fontsize=10, align=1)
        if remaining < 0:
            raise ValueError('Localized date does not fit on page 56')
        records.append({
            'method': 'pdf_overlay_on_embedded_date', 'rectangle_pdf_points': list(box),
            'original': '2026年4月14日', 'english': 'April 14, 2026', 'font_size': 10,
        })
    return records


def article_metadata(root: Path, chapter: int) -> dict[str, dict]:
    article = root / 'spaceship-ui/site/content/posts' / (SLUGS[chapter] + '.mdx')
    figures = re.findall(r'<LearningFigure\b.*?/>', article.read_text(), re.S)
    result = {}
    for figure in figures:
        props = dict(re.findall(r'\b(src|source|caption|alt|credit)="([^"]+)"', figure))
        if len(props) != 5 or not props['src'].startswith('/assets/posts/' + SLUGS[chapter] + '/'):
            raise ValueError('Incomplete figure metadata: ' + str(article))
        name = props['src'].rsplit('/', 1)[-1]
        if name in result:
            raise ValueError('Duplicate figure: ' + name)
        result[name] = props
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument('--source-dir', type=Path, required=True)
    parser.add_argument('--chapter', type=int, choices=[11, 12])
    parser.add_argument('--primary-only', action='store_true')
    args = parser.parse_args()
    chapters = [args.chapter] if args.chapter else [11, 12]
    root = args.root.resolve()
    needed = {'ntu'}
    if not args.primary_only:
        needed.update(row[1] for chapter in chapters for row in SUPPLEMENTARY[chapter])
    documents = {key: fitz.open(stream=fetch_source(args.source_dir, key), filetype='pdf') for key in needed}
    for key, document in documents.items():
        if len(document) != SOURCES[key]['pages']:
            raise ValueError('Source page count mismatch: ' + key)
    try:
        for chapter in chapters:
            metadata = {} if args.primary_only else article_metadata(root, chapter)
            assets = []
            start = 5 * (chapter - 1) + 1

            def render(key: str, page_number: int, crop, name: str, slot: str) -> None:
                document = fitz.open()
                document.insert_pdf(documents[key], from_page=page_number - 1, to_page=page_number - 1)
                page = document[0]
                edit_records = localize(page, page_number) if key == 'ntu' else []
                clip = fitz.Rect(crop) if crop else page.rect
                if clip.is_empty or not page.rect.contains(clip):
                    raise ValueError('Invalid crop: ' + name)
                scale = 1800 / clip.width
                pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip, alpha=False)
                relative = Path('spaceship-ui/site/assets/assets/posts') / SLUGS[chapter] / name
                target = root / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                pixmap.save(target)
                source = SOURCES[key]['url'] + '#page=' + str(page_number)
                props = metadata.get(name, {})
                if props and props['source'] != source:
                    raise ValueError('Article source mismatch: ' + name)
                assets.append({
                    'slot': slot, 'chapter': chapter, 'path': str(relative),
                    'src': '/assets/posts/' + SLUGS[chapter] + '/' + name,
                    'source_type': 'pdf', 'source': source,
                    'source_pdf_sha256': SOURCES[key]['sha256'],
                    'source_pdf_page_count': SOURCES[key]['pages'], 'pdf_page': page_number,
                    **{k: props[k] for k in ['caption', 'alt', 'credit'] if k in props},
                    'width': pixmap.width, 'height': pixmap.height, 'sha256': digest(target.read_bytes()),
                    'crop_pdf_points': crop, 'edits': edit_records, 'rights_status': 'unverified',
                })
                document.close()

            for page_number in range(start, start + 5):
                render('ntu', page_number, None, f'ntu-self-improving-{page_number}-en.png', f'main-{page_number}')
            if not args.primary_only:
                for slot, key, page_number, crop, name in SUPPLEMENTARY[chapter]:
                    render(key, page_number, crop, name, 'supplementary-' + slot)
                if chapter == 12:
                    for slot, original_name, cached_name, name, expected_hash in WEB_FIGURES:
                        cached = args.source_dir / cached_name
                        figure_url = WEB_SOURCE + original_name
                        if cached.exists():
                            data = cached.read_bytes()
                        else:
                            with urlopen(Request(figure_url, headers={'User-Agent': 'JJo-source-review/1.0'}), timeout=60) as response:
                                data = response.read(15_000_001)
                        if len(data) > 15_000_000 or digest(data) != expected_hash:
                            raise ValueError('Web figure version changed: ' + name)
                        pixmap = fitz.Pixmap(data)
                        relative = Path('spaceship-ui/site/assets/assets/posts') / SLUGS[chapter] / name
                        (root / relative).write_bytes(data)
                        props = metadata[name]
                        if props['source'] != WEB_SOURCE:
                            raise ValueError('Web figure article source mismatch: ' + name)
                        assets.append({
                            'slot': 'supplementary-' + slot, 'chapter': chapter, 'path': str(relative),
                            'src': props['src'], 'source_type': 'web_figure', 'source': WEB_SOURCE,
                            'source_figure_url': figure_url, 'source_figure_sha256': expected_hash,
                            **{k: props[k] for k in ['caption', 'alt', 'credit']},
                            'width': pixmap.width, 'height': pixmap.height, 'sha256': digest(data),
                            'edits': [], 'rights_status': 'unverified',
                            'render_note': 'Original PNG bytes retained, including alpha; LearningFigure supplies a white background.',
                        })
                if len(assets) != 9 or {a['src'].rsplit('/', 1)[-1] for a in assets} != set(metadata):
                    raise ValueError('Expected exactly five main and four supplementary assets')
                manifest = {'chapter': chapter, 'slug': SLUGS[chapter],
                            'primary_page_range': [start, start + 4],
                            'page_numbering': 'PDF cover is page 1',
                            'rights_status': 'unverified', 'assets': assets}
                output = root / f'docs/self-improving-ai/source-assets/{chapter}/manifest.json'
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
            print(json.dumps({'chapter': chapter, 'primary_only': args.primary_only,
                              'assets': [{k: a[k] for k in ['src', 'width', 'height', 'sha256']} for a in assets]},
                             ensure_ascii=False, indent=2))
    finally:
        for document in documents.values():
            document.close()


if __name__ == '__main__':
    main()

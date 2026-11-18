"""Render the last two lecture slides and four original paper figures.

Usage:
  python docs/self-improving-ai/tools/render_13.py --source-dir /tmp/sources

Source hashes pin every PDF version. Chinese text is translated in the native
PDF text layer before rasterization. Original diagrams and English paper figures
are preserved; no generated illustrations are substituted for source evidence.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen

import pymupdf as fitz

SLUG = 'self-improving-ai-13-agent-harness-and-system-improvement'
SOURCES = {
    'ntu': {
        'url': 'https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf',
        'sha256': '0bf81bb4af728ed04c21e2811aa2f1cb0210c70d09d7c6ebb2acf3c3f77b4844',
        'pages': 62,
    },
    'react-v3': {
        'url': 'https://arxiv.org/pdf/2210.03629v3',
        'sha256': 'f285b0971ae4a790e402fb93966bed3adde2cf0a04977d08b2b40d6ab0cace69',
        'pages': 33,
    },
    'generative-agents-v2': {
        'url': 'https://arxiv.org/pdf/2304.03442v2',
        'sha256': '1b31e77fb24d25d7598f2c49e955d12a28b95a6dabad34acdac40f44bfb7a139',
        'pages': 22,
    },
    'reflexion-v4': {
        'url': 'https://arxiv.org/pdf/2303.11366v4',
        'sha256': '6059b6f89fea9959bd3dab553fbb97756a3dfb1b15e3cbab2fbf3ab6664333bd',
        'pages': 19,
    },
    'swe-agent-v3': {
        'url': 'https://arxiv.org/pdf/2405.15793v3',
        'sha256': 'd171e0693060b910ceb2cddd0fd4bc7cae302005d42d0d8059bfdbe056c3adba',
        'pages': 118,
    },
}
SUPPLEMENTARY = [
    ('A', 'react-v3', 2, [108, 80, 505, 407], 'react-v3-figure1.png', 'Figure 1'),
    ('B', 'generative-agents-v2', 8, [82, 80, 530, 247], 'generative-agents-v2-figure5.png', 'Figure 5'),
    ('C', 'reflexion-v4', 4, [107, 84, 299, 254], 'reflexion-v4-figure2a.png', 'Figure 2(a)'),
    ('D', 'swe-agent-v3', 1, [171, 574, 442, 658], 'swe-agent-v3-figure1.png', 'Figure 1'),
]
EDITS = {
    61: [
        ([72, 56, 600, 107], [72, 56, 930, 116],
         'AI agents are more than model parameters', 38, 0),
        ([735, 162, 833, 190], [734, 159, 918, 195],
         'Language model', 22, 0),
        ([451, 426, 742, 454], [323, 421, 871, 465],
         'All files created during interaction', 24, 1),
    ],
    62: [
        ([359, 207, 602, 270], [180, 196, 780, 286],
         'To be continued', 54, 1),
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
        request = Request(spec['url'], headers={'User-Agent': 'JJo-source-review/1.0'})
        with urlopen(request, timeout=60) as response:
            data = response.read(80_000_001)
        if len(data) > 80_000_000 or digest(data) != spec['sha256']:
            raise ValueError('Unexpected source version or size: ' + key)
        cached.parent.mkdir(parents=True, exist_ok=True)
        cached.write_bytes(data)
    if digest(data) != spec['sha256']:
        raise ValueError('Source hash mismatch: ' + key)
    return data


def localize(page: fitz.Page, page_number: int) -> list[dict]:
    edits = EDITS[page_number]
    for removal, _, _, _, _ in edits:
        page.add_redact_annot(fitz.Rect(removal), fill=None, cross_out=False)
    # Remove only text, retaining embedded images and vector graphics.
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
            'method': 'native_pdf_text_layer',
            'removed_text_bbox_pdf_points': removal,
            'replacement_bbox_pdf_points': target,
            'english': english,
            'font_size': size,
        })
    if re.search(r'[\u3400-\u9fff]', page.get_text()):
        raise ValueError('Untranslated Chinese text remains on page ' + str(page_number))
    return records


def article_metadata(root: Path) -> dict[str, dict]:
    article = root / 'spaceship-ui/site/content/posts' / (SLUG + '.mdx')
    result = {}
    for figure in re.findall(r'<LearningFigure\b.*?/>', article.read_text(), re.S):
        props = dict(re.findall(r'\b(src|source|caption|alt|credit)="([^"]+)"', figure))
        if len(props) != 5 or not props['src'].startswith('/assets/posts/' + SLUG + '/'):
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
    parser.add_argument('--primary-only', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve()
    keys = ['ntu'] if args.primary_only else list(SOURCES)
    documents = {key: fitz.open(stream=fetch_source(args.source_dir, key), filetype='pdf') for key in keys}
    try:
        for key, document in documents.items():
            if len(document) != SOURCES[key]['pages']:
                raise ValueError('Source page count mismatch: ' + key)
        metadata = {} if args.primary_only else article_metadata(root)
        assets = []

        def render(key, page_number, crop, name, slot, figure=None):
            document = fitz.open()
            document.insert_pdf(documents[key], from_page=page_number - 1, to_page=page_number - 1)
            page = document[0]
            edits = localize(page, page_number) if key == 'ntu' else []
            clip = fitz.Rect(crop) if crop else page.rect
            if clip.is_empty or not page.rect.contains(clip):
                raise ValueError('Invalid crop: ' + name)
            scale = 1800 / clip.width
            pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip, alpha=False)
            relative = Path('spaceship-ui/site/assets/assets/posts') / SLUG / name
            target = root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            pixmap.save(target)
            source = SOURCES[key]['url'] + '#page=' + str(page_number)
            props = metadata.get(name, {})
            if props and props['source'] != source:
                raise ValueError('Article source mismatch: ' + name)
            assets.append({
                'slot': slot, 'chapter': 13, 'path': str(relative),
                'src': '/assets/posts/' + SLUG + '/' + name,
                'source_type': 'pdf', 'source': source,
                'source_pdf_sha256': SOURCES[key]['sha256'],
                'source_pdf_page_count': SOURCES[key]['pages'],
                'pdf_page': page_number,
                **({'source_figure': figure} if figure else {}),
                **{k: props[k] for k in ['caption', 'alt', 'credit'] if k in props},
                'width': pixmap.width, 'height': pixmap.height,
                'sha256': digest(target.read_bytes()),
                'crop_pdf_points': crop, 'edits': edits,
                'rights_status': 'unverified',
            })
            document.close()

        for page_number in [61, 62]:
            render('ntu', page_number, None, f'ntu-self-improving-{page_number}-en.png', f'main-{page_number}')
        if not args.primary_only:
            for slot, key, page_number, crop, name, figure in SUPPLEMENTARY:
                render(key, page_number, crop, name, 'supplementary-' + slot, figure)
            if len(assets) != 6 or {a['src'].rsplit('/', 1)[-1] for a in assets} != set(metadata):
                raise ValueError('Expected exactly two main and four supplementary assets')
            manifest = {
                'chapter': 13, 'slug': SLUG, 'primary_page_range': [61, 62],
                'page_numbering': 'PDF cover is page 1',
                'source_lecture_complete': True, 'source_pdf_total_pages': 62,
                'rights_status': 'unverified', 'assets': assets,
            }
            output = root / 'docs/self-improving-ai/source-assets/13/manifest.json'
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps({
            'chapter': 13, 'primary_only': args.primary_only,
            'assets': [{k: a[k] for k in ['src', 'width', 'height', 'sha256']} for a in assets],
        }, ensure_ascii=False, indent=2))
    finally:
        for document in documents.values():
            document.close()


if __name__ == '__main__':
    main()

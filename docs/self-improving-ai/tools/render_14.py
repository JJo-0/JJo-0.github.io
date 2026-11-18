"""Render Part 2 lecture pages 1-5 and four version-pinned paper figures.

Usage:
  python docs/self-improving-ai/tools/render_14.py --source-dir /tmp/ch14

Only Chinese text on lecture pages 1-2 is translated. On page 5 the original
English bibliography is reflowed to remove source overlaps. Source diagrams,
formula images, photos, and red-X placeholder shapes are preserved. No missing
source object is reconstructed or replaced with a generated illustration.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen

import pymupdf as fitz

CHAPTER = 14
SLUG = 'self-improving-ai-14-proposer-solver-verifier'
SOURCES = {
    'ntu-part2': {
        'url': 'https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf',
        'sha256': '2e2f6114c8cd29edcbd00ca219e697ce6f6471f027857105238b6a590f862ed6',
        'pages': 64,
    },
    'absolute-zero-v3': {
        'url': 'https://arxiv.org/pdf/2505.03335v3',
        'sha256': '6217ccee964c70e42fba116004ae23400c11d2ecc687c37aed062c3689098e18',
        'pages': 52,
    },
    'r-zero-v4': {
        'url': 'https://arxiv.org/pdf/2508.05004v4',
        'sha256': '5e577e627e4d6501544955922257313ca2cd94fbc3c7715cfa0dd200cfe9d139',
        'pages': 21,
    },
    'spice-v1': {
        'url': 'https://arxiv.org/pdf/2510.24684v1',
        'sha256': '719172ee495839ab916640c03d9c77f9558190ec970052eb5082756bf82a0cec',
        'pages': 24,
    },
    'r-few-v1': {
        'url': 'https://arxiv.org/pdf/2512.02472v1',
        'sha256': '30b08e0fa4f56156600f347275ee57cd6d4662f4117ce5cd9e5c25a0361de7f6',
        'pages': 16,
    },
}
# Each crop is verified against the complete original figure before inclusion.
SUPPLEMENTARY = [
    ('A', 'absolute-zero-v3', 5, [75, 65, 525, 255],
     'absolute-zero-training-overview.png', 'Figure 4'),
    ('B', 'r-zero-v4', 3, [107, 77, 509, 225],
     'r-zero-coevolution.png', 'Figure 2'),
    ('C', 'spice-v1', 3, [66, 57, 547, 239],
     'spice-corpus-self-play.png', 'Figure 2'),
    ('D', 'r-few-v1', 4, [87, 73, 524, 223],
     'r-few-guided-self-play.png', 'Figure 2'),
]

EDITS = {
    1: [
        {
            'kind': 'translation',
            'remove': [140, 126, 577, 265],
            'target': [55, 132, 665, 275],
            'text': 'Can AI Improve Itself?\n(Part 2)',
            'font_size': 48, 'font': 'hebo', 'align': 1,
            'color': [14 / 255, 40 / 255, 65 / 255],
        },
    ],
    2: [
        {
            'kind': 'translation',
            'remove': [53, 41, 387, 79],
            'target': [54, 41, 695, 85],
            'text': 'Can AI Improve Itself?',
            'font_size': 33, 'font': 'helv', 'align': 0,
        },
        {
            'kind': 'translation',
            'remove': [136, 103, 213, 146],
            'target': [103, 101, 245, 155],
            'text': "Humanity's last\ninvention",
            'font_size': 18, 'font': 'hebo', 'align': 1,
        },
    ],
    5: [
        {
            'kind': 'citation_reflow',
            'remove': [387, 85, 708, 146],
            'target': [387, 87, 707, 151],
            'text': 'Absolute Zero: https://arxiv.org/abs/2505.03335\n'
                    'R-Zero: https://arxiv.org/abs/2508.05004\n'
                    'Self-Questioning: https://arxiv.org/abs/2508.03682',
            'font_size': 14, 'font': 'helv', 'align': 0,
        },
        {
            'kind': 'citation_reflow',
            'remove': [456, 350, 661, 405],
            'target': [389, 352, 707, 400],
            'text': 'SPICE: https://arxiv.org/abs/2510.24684\n'
                    'R-Few: https://arxiv.org/abs/2512.02472',
            'font_size': 14, 'font': 'helv', 'align': 0,
        },
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
    edits = EDITS.get(page_number, [])
    original_texts = [page.get_textbox(fitz.Rect(edit['remove'])) for edit in edits]
    for edit in edits:
        page.add_redact_annot(fitz.Rect(edit['remove']), fill=None, cross_out=False)
    if edits:
        # Remove text only; keep source images and vector graphics, including
        # the original red-X placeholder shapes visible in both PDF renderers.
        page.apply_redactions(images=0, graphics=0, text=0)
    records = []
    for edit, original in zip(edits, original_texts):
        for size in range(edit['font_size'], 11, -1):
            shape = page.new_shape()
            spare = shape.insert_textbox(
                fitz.Rect(edit['target']), edit['text'],
                fontname=edit['font'], fontsize=size, align=edit['align'],
                color=edit.get('color', [0, 0, 0]), lineheight=1.1,
            )
            if spare >= 0:
                shape.commit(overlay=True)
                break
        else:
            raise ValueError('English text overflow on page ' + str(page_number))
        records.append({
            'method': 'native_pdf_text_layer', 'kind': edit['kind'],
            'removed_text_bbox_pdf_points': edit['remove'],
            'replacement_bbox_pdf_points': edit['target'],
            'original_text': original, 'english': edit['text'],
            'font_size': size, 'font': edit['font'],
            'color_rgb': edit.get('color', [0, 0, 0]),
            'alignment': edit['align'],
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
    keys = ['ntu-part2'] if args.primary_only else list(SOURCES)
    documents = {key: fitz.open(stream=fetch_source(args.source_dir, key), filetype='pdf') for key in keys}
    try:
        for key, document in documents.items():
            if len(document) != SOURCES[key]['pages']:
                raise ValueError('Source page count mismatch: ' + key)
        metadata = {} if args.primary_only else article_metadata(root)
        assets = []

        def render(key, page_number, crop, name, slot, figure=None):
            document = None
            if key == 'ntu-part2':
                document = fitz.open()
                document.insert_pdf(documents[key], from_page=page_number - 1, to_page=page_number - 1)
                page = document[0]
            else:
                # Render paper figures directly from their pinned source PDF.
                page = documents[key][page_number - 1]
            edits = localize(page, page_number) if key == 'ntu-part2' else []
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
                'slot': slot, 'chapter': CHAPTER, 'path': str(relative),
                'src': '/assets/posts/' + SLUG + '/' + name,
                'source_type': 'pdf', 'source': source,
                'source_pdf_sha256': SOURCES[key]['sha256'],
                'source_pdf_page_count': SOURCES[key]['pages'],
                'pdf_page': page_number,
                **({'source_lecture_part': 2} if key == 'ntu-part2' else {}),
                **({'source_figure': figure} if figure else {}),
                **{k: props[k] for k in ['caption', 'alt', 'credit'] if k in props},
                'width': pixmap.width, 'height': pixmap.height,
                'sha256': digest(target.read_bytes()),
                'crop_pdf_points': crop, 'edits': edits,
                'rights_status': 'unverified', 'permission_verified': False,
                **({'source_visual_notes': [
                    'Original red-X placeholder shapes are retained; not introduced by localization.'
                ]} if key == 'ntu-part2' and page_number in [2, 3, 4, 5] else {}),
            })
            if document is not None:
                document.close()

        for page_number in range(1, 6):
            render('ntu-part2', page_number, None,
                   f'ntu-self-evolving-{page_number:02}-en.png', f'main-{page_number}')
        if not args.primary_only:
            for slot, key, page_number, crop, name, figure in SUPPLEMENTARY:
                render(key, page_number, crop, name, 'supplementary-' + slot, figure)
            if len(assets) != 9 or {a['src'].rsplit('/', 1)[-1] for a in assets} != set(metadata):
                raise ValueError('Expected exactly five main and four supplementary assets')
            manifest = {
                'chapter': CHAPTER, 'slug': SLUG,
                'lecture_part': 2, 'primary_page_range': [1, 5],
                'page_numbering': 'Part 2 PDF cover is page 1; independent of Part 1 numbering',
                'source_lecture_complete': False, 'source_pdf_total_pages': 64,
                'rights_status': 'unverified', 'permission_verified': False,
                'assets': assets,
            }
            output = root / 'docs/self-improving-ai/source-assets/14/manifest.json'
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps({
            'chapter': CHAPTER, 'primary_only': args.primary_only,
            'assets': [{k: a[k] for k in ['src', 'width', 'height', 'sha256']} for a in assets],
        }, ensure_ascii=False, indent=2))
    finally:
        for document in documents.values():
            document.close()


if __name__ == '__main__':
    main()

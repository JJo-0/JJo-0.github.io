"""Render chapter 10 from pinned PDF pages and figure regions.

Usage:
    python docs/self-improving-ai/tools/render_10.py --source-dir /tmp/sources

The optional source directory caches verified PDFs by their keys below. The
article supplies captions, alt text, and credits; this script records the exact
source versions, page regions, image dimensions, and hashes in the manifest.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen

import pymupdf as fitz

SLUG = 'self-improving-ai-10-self-play-and-external-feedback'
MAX_SOURCE_BYTES = 80_000_000
SOURCES = {
    'ntu': (
        'https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf',
        '0bf81bb4af728ed04c21e2811aa2f1cb0210c70d09d7c6ebb2acf3c3f77b4844',
        62,
    ),
    'absolute-zero': (
        'https://arxiv.org/pdf/2505.03335v3',
        '6217ccee964c70e42fba116004ae23400c11d2ecc687c37aed062c3689098e18',
        52,
    ),
    'r-zero': (
        'https://arxiv.org/pdf/2508.05004v4',
        '5e577e627e4d6501544955922257313ca2cd94fbc3c7715cfa0dd200cfe9d139',
        21,
    ),
    'spice': (
        'https://arxiv.org/pdf/2510.24684v1',
        '719172ee495839ab916640c03d9c77f9558190ec970052eb5082756bf82a0cec',
        24,
    ),
    'r-few': (
        'https://arxiv.org/pdf/2512.02472v1',
        '30b08e0fa4f56156600f347275ee57cd6d4662f4117ce5cd9e5c25a0361de7f6',
        16,
    ),
}
SUPPLEMENTARY = [
    ('A', 'absolute-zero', 5, [83, 70, 510, 252], 'absolute-zero-v3-figure4.png'),
    ('B', 'r-zero', 3, [106, 79, 506, 223], 'r-zero-v4-figure2.png'),
    ('C', 'spice', 3, [68, 55, 545, 247], 'spice-v1-figure2.png'),
    ('D', 'r-few', 4, [88, 75, 527, 227], 'r-few-v1-figure2.png'),
]


def read_figure_metadata(article: Path) -> dict[str, dict[str, str]]:
    figures = re.findall(r'<LearningFigure\b.*?/>', article.read_text(), re.S)
    metadata = {}
    for figure in figures:
        props = dict(re.findall(r'\b(src|source|caption|alt|credit)="([^"]+)"', figure))
        if set(props) != {'src', 'source', 'caption', 'alt', 'credit'}:
            raise ValueError('Missing figure metadata in ' + str(article))
        if not props['src'].startswith('/assets/posts/' + SLUG + '/'):
            raise ValueError('Unexpected chapter asset: ' + props['src'])
        name = props['src'].rsplit('/', 1)[-1]
        if name in metadata:
            raise ValueError('Duplicate article asset: ' + name)
        metadata[name] = props
    expected = {f'ntu-self-improving-{page}-en.png' for page in range(46, 51)}
    expected.update(row[4] for row in SUPPLEMENTARY)
    if set(metadata) != expected:
        raise ValueError('The article must reference exactly the nine chapter assets')
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument('--source-dir', type=Path,
                        default=Path(tempfile.gettempdir()) / 'jjo-self-improving-source-pdfs')
    parser.add_argument('--ntu-source', type=Path, help='Use a separate cached NTU PDF')
    args = parser.parse_args()
    root = args.root.resolve()
    metadata = read_figure_metadata(root / 'spaceship-ui/site/content/posts' / (SLUG + '.mdx'))

    def load(item):
        key, (url, expected_hash, _) = item
        cached = args.ntu_source if key == 'ntu' and args.ntu_source else args.source_dir / (key + '.pdf')
        if cached.exists():
            data = cached.read_bytes()
        else:
            request = Request(url, headers={'User-Agent': 'JJo-source-review/1.0'})
            with urlopen(request, timeout=60) as response:
                data = response.read(MAX_SOURCE_BYTES + 1)
        if len(data) > MAX_SOURCE_BYTES or hashlib.sha256(data).hexdigest() != expected_hash:
            raise ValueError('Source version changed: ' + key)
        if not cached.exists():
            cached.parent.mkdir(parents=True, exist_ok=True)
            cached.write_bytes(data)
        return key, data

    with ThreadPoolExecutor(max_workers=5) as pool:
        source_data = dict(pool.map(load, SOURCES.items()))
    documents = {key: fitz.open(stream=data, filetype='pdf') for key, data in source_data.items()}
    assets = []

    def render(key, page_number, name, slot, crop=None):
        page = documents[key][page_number - 1]
        clip = fitz.Rect(crop) if crop is not None else page.rect
        if clip.is_empty or not page.rect.contains(clip):
            raise ValueError('Invalid figure region: ' + name)
        scale = 1800 / clip.width
        pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip, alpha=False)
        relative_path = Path('spaceship-ui/site/assets/assets/posts') / SLUG / name
        output = root / relative_path
        output.parent.mkdir(parents=True, exist_ok=True)
        pixmap.save(output)
        url, source_hash, page_count = SOURCES[key]
        props = metadata[name]
        source = url + '#page=' + str(page_number)
        if props['source'] != source:
            raise ValueError('Article/source page mismatch: ' + name)
        assets.append({
            'slot': slot,
            'chapter': 10,
            'path': str(relative_path),
            'src': props['src'],
            'source': source,
            'source_pdf_sha256': source_hash,
            'source_pdf_page_count': page_count,
            'pdf_page': page_number,
            'caption': props['caption'],
            'alt': props['alt'],
            'credit': props['credit'],
            'width': pixmap.width,
            'height': pixmap.height,
            'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
            'crop_pdf_points': crop,
            'edits': [],
            'rights_status': 'unverified',
        })
        if key == 'ntu' and page_number == 50:
            assets[-1]['source_render_note'] = (
                'The faint red-X rectangle beside the book icon is present in the pinned '
                'source PDF and is preserved. Independently confirmed with Poppler.'
            )

    try:
        for key, document in documents.items():
            if len(document) != SOURCES[key][2]:
                raise ValueError('Unexpected source page count: ' + key)
        for page_number in range(46, 51):
            render('ntu', page_number, f'ntu-self-improving-{page_number}-en.png',
                   f'main-{page_number}')
        for slot, key, page_number, crop, name in SUPPLEMENTARY:
            render(key, page_number, name, 'supplementary-' + slot, crop)
        manifest = {
            'chapter': 10,
            'slug': SLUG,
            'primary_page_range': [46, 50],
            'page_numbering': 'PDF cover is page 1',
            'rights_status': 'unverified',
            'assets': assets,
        }
        output = root / 'docs/self-improving-ai/source-assets/10/manifest.json'
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps({
            'assets': len(assets),
            'dimensions': {Path(asset['path']).name: [asset['width'], asset['height']]
                           for asset in assets},
            'manifest_sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
        }, ensure_ascii=False, indent=2))
    finally:
        for document in documents.values():
            document.close()


if __name__ == '__main__':
    main()

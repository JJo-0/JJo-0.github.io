"""Render the five original Part 2 pages and four contextual source extracts.

python docs/self-improving-ai/tools/render_16.py --source-dir /tmp/ch16

All five NTU pages already use English. No translations, overlays, image
generation or diagram changes are applied. The ALMA table is an exact crop;
the remaining eight images are complete original PDF pages.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen

import pymupdf as fitz

SLUG = 'self-improving-ai-16-prompt-memory-code-evolution'
SOURCES = {
    'ntu-part2': {
        'url': 'https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf',
        'sha256': '2e2f6114c8cd29edcbd00ca219e697ce6f6471f027857105238b6a590f862ed6',
        'pages': 64,
    },
    'cmu-llms': {
        'url': 'https://deeplearning.cs.cmu.edu/S25/document/slides/lec20.LLMs.pdf',
        'sha256': 'd0a435fe1d3d3d91a39645f2805b5643251f682dc9981d3a6ff92333b38201f5',
        'pages': 80,
    },
    'gepa-stanford': {
        'url': 'https://web.stanford.edu/class/cs329t/slides/Lecture%209%20-%2020251028%20GEPA_Talk.pdf',
        'sha256': '6406749518ac6cc99a0b1a3f4312d70a7a577786c68b2784aea4530b9b459fcc',
        'pages': 66,
    },
    'alma-v1': {
        'url': 'https://arxiv.org/pdf/2602.07755v1',
        'sha256': '387766822f4fc3aa66d1d0f87dd50a7e825bd37b888d293ff99cc20bd693b82d',
        'pages': 71,
    },
}
SUPPLEMENTS = [
    ('cmu-llms', 58, None, 'cmu-opro-candidate-evaluation.png', 'external-lecture-1', None),
    ('gepa-stanford', 27, None, 'stanford-gepa-textual-feedback.png', 'external-lecture-2', None),
    ('gepa-stanford', 31, None, 'stanford-gepa-instance-pareto.png', 'external-lecture-3', None),
    ('alma-v1', 6, [55, 64, 544, 360], 'alma-v1-table1.png', 'supplementary-paper-1', 'Table 1'),
]


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument('--source-dir', type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    article = root / 'spaceship-ui/site/content/posts' / (SLUG + '.mdx')
    metadata = {}
    for block in re.findall(r'<LearningFigure\b.*?/>', article.read_text(), re.S):
        props = dict(re.findall(r'\b(src|source|caption|alt|credit)="([^"]+)"', block))
        if len(props) != 5:
            raise ValueError('Incomplete article figure metadata')
        metadata[props['src'].rsplit('/', 1)[-1]] = props
    if len(metadata) != 9:
        raise ValueError('Expected five NTU pages, three outside slides, and one paper table')

    documents = {}
    args.source_dir.mkdir(parents=True, exist_ok=True)
    for key, spec in SOURCES.items():
        local = args.source_dir / (key + '.pdf')
        if not local.exists():
            with urlopen(Request(spec['url'], headers={'User-Agent': 'JJo-source-review/1.0'}), timeout=60) as response:
                data = response.read(80_000_001)
            if len(data) > 80_000_000 or digest(data) != spec['sha256']:
                raise ValueError('Unexpected source size or version: ' + key)
            local.write_bytes(data)
        data = local.read_bytes()
        if digest(data) != spec['sha256']:
            raise ValueError('Source hash mismatch: ' + key)
        document = fitz.open(stream=data, filetype='pdf')
        if len(document) != spec['pages']:
            raise ValueError('Source page-count mismatch: ' + key)
        documents[key] = document

    assets = []
    selections = [
        ('ntu-part2', number, None, f'ntu-self-evolving-{number:02}-en.png', f'main-{number - 10}', None)
        for number in range(11, 16)
    ] + SUPPLEMENTS
    try:
        for key, number, crop, name, slot, figure in selections:
            page = documents[key][number - 1]
            clip = fitz.Rect(crop) if crop else page.rect
            if not page.rect.contains(clip) or clip.is_empty:
                raise ValueError('Invalid source crop: ' + name)
            pixmap = page.get_pixmap(matrix=fitz.Matrix(1800 / clip.width, 1800 / clip.width), clip=clip, alpha=False)
            relative = Path('spaceship-ui/site/assets/assets/posts') / SLUG / name
            target = root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            pixmap.save(target)
            props = metadata[name]
            source = SOURCES[key]['url'] + '#page=' + str(number)
            if props['source'] != source:
                raise ValueError('Article source mismatch: ' + name)
            assets.append({
                'slot': slot, 'chapter': 16,
                'path': str(relative), 'src': props['src'],
                'source_type': 'pdf', 'source': source,
                'source_pdf_sha256': SOURCES[key]['sha256'],
                'source_pdf_page_count': SOURCES[key]['pages'],
                'pdf_page': number,
                **({'source_lecture_part': 2} if key == 'ntu-part2' else {}),
                **({'source_figure': figure} if figure else {}),
                'caption': props['caption'], 'alt': props['alt'], 'credit': props['credit'],
                'width': pixmap.width, 'height': pixmap.height,
                'sha256': digest(target.read_bytes()),
                'crop_pdf_points': crop, 'edits': [],
                'operation': 'Exact source-PDF crop' if crop else 'Full original PDF page rendered without edits',
                'rights_status': 'unverified', 'permission_verified': False,
                **({'source_visual_notes': ['The two overlapping OPRO prompt screenshots and partially covered bottom URL are present in the original NTU page; preserved without reconstruction.']} if key == 'ntu-part2' and number == 12 else {}),
            })
    finally:
        for document in documents.values():
            document.close()
    order = {name: i for i, name in enumerate(metadata)}
    assets.sort(key=lambda asset: order[asset['src'].rsplit('/', 1)[-1]])
    manifest = {
        'chapter': 16, 'slug': SLUG, 'lecture_part': 2,
        'primary_page_range': [11, 15],
        'page_numbering': 'Part 2 PDF cover is page 1; independent of Part 1 numbering',
        'source_lecture_complete': False, 'source_pdf_total_pages': 64,
        'rights_status': 'unverified', 'permission_verified': False,
        'source_date_notes': {
            'cmu-llms': 'The official Spring 2025 course links this deck for its March 26 guest lecture; the deck cover itself prints Mar 26, 2024. These two observations are preserved without silently correcting the original.',
            'gepa-stanford': 'Stanford CS329T 2025-10-28 slides, distinct from the ICLR 2026 video used for supplemental speech evidence.',
        },
        'assets': assets,
    }
    output = root / 'docs/self-improving-ai/source-assets/16/manifest.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'chapter': 16, 'assets': len(assets), 'dimensions': {asset['src'].rsplit('/', 1)[-1]: [asset['width'], asset['height']] for asset in assets}}, indent=2))


if __name__ == '__main__':
    main()

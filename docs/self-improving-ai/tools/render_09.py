"""Render chapter 09 from pinned source PDFs without redrawing source figures.

Only the Chinese title on NTU page 44 is localized. The original equation on
page 41, including its missing log, is preserved and corrected in the article.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen

import pymupdf as fitz

SLUG = 'self-improving-ai-09-entropy-paths-and-self-generated-inputs'
SOURCES = {
    'ntu': (
        'https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf',
        '0bf81bb4af728ed04c21e2811aa2f1cb0210c70d09d7c6ebb2acf3c3f77b4844',
        62, 'Hung-yi Lee / NTU ML 2026',
    ),
    'berkeley': (
        'https://rail.eecs.berkeley.edu/deeprlcourse/static/slides/lec-5.pdf',
        '193365e0ede9646b9f1fd28387091ac477f6a9f7ca3feb4c5c9d5fed9072f261',
        23, 'Sergey Levine / UC Berkeley CS 185/285, Policy Gradients',
    ),
    'rethinking-em': (
        'https://arxiv.org/pdf/2605.08186v1',
        'e40d012ca48852bd4e349adad295837c9f22d8c873dbf4bfc6d0388ee9b23ea9',
        11, 'Wei-Ping Huang et al., arXiv:2605.08186v1 (2026)',
    ),
    'rlaif': (
        'https://raw.githubusercontent.com/mlresearch/v235/main/assets/lee24t/lee24t.pdf',
        '36e09a4277f5cdafd09ab0129e2f5fa8b35e1aa0a77108ef1bc259c6df3b50f2',
        28, 'Harrison Lee et al. / ICML 2024, PMLR 235',
    ),
    'self-instruct': (
        'https://aclanthology.org/2023.acl-long.754.pdf',
        '87f1d8476fa041d0c6b09b9239253ed698c4efac973347aebe83c487eab91c78',
        25, 'Yizhong Wang et al. / ACL 2023',
    ),
}
EDITS = {
    44: [([69, 52, 750, 112], 'Let AI define its own loss', 42)],
}
ALTS = {
    41: '낮은 엔트로피를 가진 경로의 확률을 높이는 두 번째 경사 항을 설명하는 원본 41쪽. 상단 수식의 log 누락은 본문에서 정정한다.',
    42: '세 음성인식 데이터셋의 WER를 비교한 원본 42쪽. EM-tok와 EM-tok-b 행이 강조되어 있으며 오류율은 낮을수록 좋다.',
    43: '엔트로피 경사 수학 구간의 끝을 알리는 End of Math Warning 원본 43쪽.',
    44: 'AI가 입력과 출력을 평가해 손실값을 만드는 원본 44쪽 도해. 중국어 제목만 영어로 옮겼다.',
    45: '입력 생성 역할까지 AI가 맡아 학습 고리를 구성하는 No Human in the Loop 원본 45쪽.',
}
SUPPS = [
    (
        'A', 'berkeley', 17, None, 'berkeley-policy-gradients-p17-baselines.png',
        'UC Berkeley CS 185/285 · Policy Gradients · PDF 17쪽 원본 영어 슬라이드.',
        '정책 경사에서 baseline을 빼는 항등식을 설명하는 Berkeley 원본 슬라이드. 고정 baseline과 동일 배치 평균의 차이는 본문에서 구분한다.',
    ),
    (
        'B', 'rethinking-em', 7, [54, 364, 289, 496], 'rethinking-v1-table5.png',
        'Huang et al. · arXiv v1 · PDF 7쪽 Table 5 원본 발췌.',
        'Greedy, Beam Search, EM-tok-b의 WER를 비교한 논문 Table 5. MLS-Polish에서는 Beam Search가 더 낮은 오류율을 보인다.',
    ),
    (
        'C', 'rlaif', 2, [114, 69, 481, 246], 'rlaif-icml2024-figure2.png',
        'Lee et al. · ICML 2024 · PDF 2쪽 Figure 2 원본 발췌.',
        'AI 또는 사람이 응답을 평가하고 보상 모델을 학습한 뒤 강화학습에 사용하는 RLAIF와 RLHF의 원본 비교 도해.',
    ),
    (
        'D', 'self-instruct', 2, [86, 70, 512, 258], 'self-instruct-acl2023-figure2.png',
        'Wang et al. · ACL 2023 · PDF 2쪽 Figure 2 그림 영역 원본 발췌.',
        '175개 seed task에서 시작해 지시문 생성, 과제 식별, 입력·출력 생성, 필터링을 반복하는 Self-Instruct 원본 도해.',
    ),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument('--source-dir', type=Path)
    args = parser.parse_args()
    root = args.root.resolve()

    def load(item):
        key, (url, digest, page_count, _) = item
        cached = args.source_dir / (key + '.pdf') if args.source_dir else None
        if cached and cached.exists():
            data = cached.read_bytes()
        else:
            request = Request(url, headers={'User-Agent': 'JJo-source-review/1.0'})
            with urlopen(request, timeout=60) as response:
                data = response.read(80_000_001)
        if len(data) > 80_000_000 or hashlib.sha256(data).hexdigest() != digest:
            raise ValueError('Source version changed: ' + key)
        document = fitz.open(stream=data, filetype='pdf')
        if len(document) != page_count:
            raise ValueError('Unexpected source page count: ' + key)
        return key, document

    with ThreadPoolExecutor(max_workers=5) as pool:
        documents = dict(pool.map(load, SOURCES.items()))
    assets = []

    def render(key, page_number, name, slot, caption, alt, crop=None, edits=()):
        document = fitz.open()
        document.insert_pdf(documents[key], from_page=page_number - 1, to_page=page_number - 1)
        page = document[0]
        edit_records = []
        for rectangle, text, starting_size in edits:
            box = fitz.Rect(rectangle)
            page.draw_rect(box, color=None, fill=(1, 1, 1), overlay=True)
            for size in range(starting_size, 9, -1):
                shape = page.new_shape()
                remaining = shape.insert_textbox(
                    box + fitz.Rect(3, 1, -3, -1), text,
                    fontname='helv', fontsize=size, lineheight=1.15,
                )
                if remaining >= 0:
                    shape.commit(overlay=True)
                    break
            else:
                raise ValueError('English text overflow')
            edit_records.append({
                'rectangle_pdf_points': list(box), 'english': text, 'font_size': size,
            })
        clip = fitz.Rect(crop) if crop else page.rect
        scale = 1800 / clip.width
        pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip, alpha=False)
        path = Path('spaceship-ui/site/assets/assets/posts') / SLUG / name
        output = root / path
        output.parent.mkdir(parents=True, exist_ok=True)
        pixmap.save(output)
        url, digest, _, credit = SOURCES[key]
        assets.append({
            'slot': slot,
            'chapter': 9,
            'path': str(path),
            'src': '/assets/posts/' + SLUG + '/' + name,
            'source': url + '#page=' + str(page_number),
            'source_pdf_sha256': digest,
            'pdf_page': page_number,
            'caption': caption,
            'alt': alt,
            'credit': credit + (
                '. Unofficial English text adaptation; original equations retained.'
                if edits else '. Original source, not redrawn.'
            ),
            'width': pixmap.width,
            'height': pixmap.height,
            'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
            'crop_pdf_points': crop,
            'edits': edit_records,
            'rights_status': 'unverified',
            'source_equation_note': (
                'Original page 41 omits log in the score term; retained unchanged in the image '
                'and explicitly corrected in the commentary using paper Eq. (8f).'
                if key == 'ntu' and page_number == 41 else None
            ),
            'source_experiment_note': (
                'The red rows EM-tok and EM-tok-b both use the complete token-level '
                'entropy gradient. Their difference is random sampling versus beam-search '
                'transcriptions (paper Section 4.2), not omission versus inclusion of the '
                'score term. The article distinguishes this from the spoken explanation.'
                if key == 'ntu' and page_number == 42 else None
            ),
        })
        document.close()

    for page_number in range(41, 46):
        caption = f'P{page_number:03} — NTU Self-Improving 원본 {page_number}쪽 · '
        caption += '중국어 제목의 비공식 영어 편집본.' if page_number in EDITS else '원본 영어·수식 이미지.'
        if page_number == 41:
            caption += ' 두 번째 경사 항의 log 누락은 아래 본문에서 정정한다.'
        if page_number == 42:
            caption += ' 빨간 두 행은 논문에서 무작위 샘플링과 beam search의 비교다. 영상 설명과의 차이는 본문에서 구분한다.'
        render(
            'ntu', page_number, f'ntu-self-improving-{page_number}-en.png',
            f'main-{page_number}', caption, ALTS[page_number], edits=EDITS.get(page_number, ()),
        )
    for slot, key, page_number, crop, name, caption, alt in SUPPS:
        render(key, page_number, name, 'supplementary-' + slot, caption, alt, crop)

    manifest = {
        'chapter': 9,
        'slug': SLUG,
        'primary_page_range': [41, 45],
        'page_numbering': 'PDF cover is page 1',
        'rights_status': 'unverified',
        'equation_correction': (
            'Keep the original page 41 equation; commentary uses E[g grad log p] per '
            'paper Eq. (8f), not E[g grad p].'
        ),
        'assets': assets,
    }
    output = root / 'docs/self-improving-ai/source-assets/09/manifest.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    for document in documents.values():
        document.close()
    print('Rendered', len(assets), 'assets; manifest SHA256', hashlib.sha256(output.read_bytes()).hexdigest())


if __name__ == '__main__':
    main()

"""Render pinned source slides and original supplementary figures for lessons 04–05.
Run in a repository checkout with PyMuPDF==1.26.6 and Pillow==11.3.0.
Text overlays translate labels; diagrams are not redrawn. No downloaded code runs.
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import urllib.request
import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[3]
SOURCES = {
    'ntu': ('https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf', '0bf81bb4af728ed04c21e2811aa2f1cb0210c70d09d7c6ebb2acf3c3f77b4844', 'Hung-yi Lee / NTU', 62),
    'umass': ('https://people.cs.umass.edu/~sniekum/classes/HCML-S24/lectures/lecture4.pdf', 'b3610b39b530c87a1ef0491d09dcbef738ea2900050699161ecbc5e0e80e657f', 'Scott Niekum / UMass Amherst CS 690, Spring 2024', 24),
    'eureka': ('https://eureka-research.github.io/assets/eureka_paper.pdf', '4733a1bd9083fc1d783ee180823b4763704bcce34ada1da67046082f80932c52', 'Yecheng Jason Ma et al. / Eureka', 39),
    'revolve': ('https://arxiv.org/pdf/2406.01309v4', '8b7cb1d396b53204f7c26d75f287fce53ffe83b30a67255c874a01a6a3dfaae3', 'Rishi Hazra, Alkis Sygkounas, Andreas Persson, Amy Loutfi, Pedro Zuidberg Dos Martires', 42),
    'cs224n': ('https://web.stanford.edu/class/cs224n/slides/cs224n-spr2024-lecture10-prompting-rlhf.pdf', '7510a2f4d2912325efc7877a7ae163c442252df5ce9dfc52eb0a4824fbca720c', 'Archit Sharma / Stanford CS224N; based on Jesse Mu slides', 94),
    'constitutional': ('https://arxiv.org/pdf/2212.08073v1', '9a456a07ad346e3372f9867d346f69f5b0f68b4c65f060aca0b8a13fa9d98e83', 'Yuntao Bai et al. / Anthropic', 34),
    'schultz': ('https://www.gatsby.ucl.ac.uk/~dayan/papers/sdm97.pdf', 'be98208b3d1d5c664af5ee9b8b1d45107a9c8595972ef3d5e0efc218463a7adb', 'Wolfram Schultz, Peter Dayan, P. Read Montague / Science 275 (1997)', 7),
}
SLUGS = {4: 'self-improving-ai-04-sparse-rewards-and-shaping', 5: 'self-improving-ai-05-reward-design-to-ai-feedback'}
EDITS = {
    16: [([80, 40, 485, 108], 'Most real-world rewards are\nsparse, making learning difficult.', 22), ([80, 112, 450, 146], 'Example: a robot opening a door', 18)],
    17: [([156, 19, 335, 72], 'Reward shaping\nmakes learning easier', 18), ([403, 45, 530, 67], 'Goal: turn handle', 13), ([584, 135, 673, 178], 'Near handle\n+1 reward', 13), ([705, 392, 795, 435], 'Touch handle\n+5 reward', 13), ([207, 481, 350, 520], 'Far from handle\n0 reward', 14), ([430, 481, 555, 520], 'Near handle\n+1 reward', 14), ([641, 481, 766, 522], 'Touch handle\n+5 reward', 14)],
    18: [([68, 50, 760, 115], 'AI-Designed Reward Shaping', 34), ([700, 234, 842, 301], 'Open the door: +1\nOtherwise: 0', 18), ([703, 415, 948, 513], 'Open the door: +1\nTouch the handle: +0.5\n...', 20)],
    20: [([69, 40, 510, 117], 'How can AI find a proxy reward\nthat makes learning easier?', 28), ([680, 88, 950, 125], 'Policy (not necessarily an LLM)', 19)],
    23: [([150, 10, 880, 69], 'Dopamine and Reward Shaping', 38)],
    24: [([68, 48, 491, 117], 'Let AI Define the Loss', 32), ([500, 52, 940, 119], 'Real-world objectives are often hard\nto express as a hand-written reward.', 21)],
    25: [([68, 48, 491, 117], 'Let AI Define the Loss', 32)],
}
MAIN_ALT = {
    16: '희소한 실제 보상 때문에 학습이 어려워지는 문제를 로봇의 문 열기 그림으로 소개한다.',
    17: '문 손잡이에서 멀리 있는 상태는 0, 가까워진 상태는 1, 손잡이에 닿은 상태는 5의 보상으로 표시한 원본의 보상 형성 그림이다.',
    18: '문 열기 성공을 평가하는 실제 보상과 손잡이 접촉에 중간 점수를 주는 대리 보상의 관계를 비교한다.',
    19: '모델 출력을 최적화하는 대리 손실과 별도로 성과를 평가하는 실제 손실의 경로를 구분한다.',
    20: 'LLM이 대리 보상을 수정하고, 그 보상으로 학습한 정책을 평가하는 두 반복을 보여준다. 정책이 반드시 LLM인 것은 아니다.',
    21: 'RF-Agent 논문에서 가져온 원본 영어 비교 그림. Eureka, REvolve, RF-Agent의 보상 후보 탐색 구조를 비교한다.',
    22: '보상 후보의 설계 이력과 트리 탐색을 이용하는 RF-Agent의 원본 영어 구성 그림이다.',
    23: '도파민과 보상 형성이라는 제목의 영어 편집본. 공개 PDF 원본처럼 제목 아래 영역은 가려진 상태를 유지했다.',
    24: '사람의 선호를 이용해 보상 모델을 학습하고 그 모델로 생성 정책을 평가하는 RLHF 구성을 보여준다.',
    25: '학습 평가 자료의 출처를 AI 피드백으로 바꾸는 RLAIF 구성을 보여준다.',
}
SUPPLEMENTARY = [
    (4, 'A', 'umass', 4, None, 'umass-hcml-reward-specification-p04.png', 'UMass CS 690 · Reward Specification · PDF 4쪽 전체 원본 슬라이드.', '목표에서만 점수를 주는 격자와 여러 상태에 점수를 주는 격자를 비교한 희소·조밀 보상 슬라이드.'),
    (4, 'B', 'umass', 5, None, 'umass-hcml-reward-specification-p05.png', 'UMass CS 690 · Reward Specification · PDF 5쪽 전체 원본 슬라이드.', '할인된 다음 상태 잠재값과 현재 상태 잠재값의 차이를 보상에 더하는 잠재 함수 기반 보상 설계 슬라이드.'),
    (4, 'C', 'umass', 11, None, 'umass-hcml-reward-specification-p11.png', 'UMass CS 690 · Reward Specification · PDF 11쪽 전체 원본 슬라이드.', '올바른 과제 명세만으로 충분한지 묻고 시행착오 보상 설계의 과적합을 다루는 슬라이드.'),
    (4, 'D', 'eureka', 2, [105, 78, 507, 307], 'eureka-original-figure2.png', 'Eureka · 저자 프로젝트 제공 PDF 2쪽 Figure 2와 캡션 발췌. 원본 내부 내용 변경 없음.', '환경 코드와 과제 설명에서 보상 코드를 만들고 정책 학습·평가와 보상 성찰을 반복하는 Eureka의 원본 Figure 2.'),
    (5, 'E', 'revolve', 3, [105, 72, 508, 354], 'revolve-v4-figure1.png', 'REvolve · arXiv v4, 2025-05-23 · PDF 3쪽 Figure 1 그림 영역 발췌.', 'LLM이 보상 집단을 만들고 각 정책을 학습한 뒤 사람이 실행 결과를 비교하며 선호와 자연어 피드백으로 집단을 개선하는 원본 Figure 1.'),
    (5, 'F', 'schultz', 2, [188, 442, 391, 685], 'schultz-1997-figure1.png', 'Schultz·Dayan·Montague, Science (1997) · PDF 2쪽·인쇄 1594쪽 Figure 1의 세 반응 그래프 발췌.', '예측하지 못한 보상, 단서로 예측한 보상, 예측했지만 누락된 보상의 세 조건에서 도파민 뉴런 반응을 비교한 원본 그래프.'),
    (5, 'G', 'cs224n', 60, None, 'stanford-cs224n-preference-model-p60.png', 'Stanford CS224N Lecture 10 (2024) · PDF 60쪽, 인쇄 슬라이드 63 전체.', '세 요약 답의 선호와 승자·패자 점수 차이의 로지스틱 손실로 보상 모델을 학습하는 원본 영어 슬라이드.'),
    (5, 'H', 'constitutional', 2, [90, 74, 524, 242], 'constitutional-ai-v1-figure1.png', 'Constitutional AI · arXiv v1, 2022-12-15 · PDF 2쪽 Figure 1 그림 영역 발췌.', '위쪽에는 비평·수정 자료의 지도학습, 아래쪽에는 AI 선호 자료·선호 모델·강화학습이 이어지는 원본 두 단계 도해.'),
]

def fetch_source(item):
    key, (url, expected, author, page_count) = item
    request = urllib.request.Request(url, headers={'User-Agent': 'JJo-source-review/1.0'})
    with urllib.request.urlopen(request, timeout=40) as response:
        data = response.read(40_000_001)
    if len(data) > 40_000_000 or hashlib.sha256(data).hexdigest() != expected:
        raise RuntimeError(f'{key}: source size or pinned hash mismatch; review the changed source')
    document = fitz.open(stream=data, filetype='pdf')
    if len(document) != page_count:
        raise RuntimeError(f'{key}: unexpected page count')
    return key, document

def overlay(page, rect, text, size, align):
    rectangle = fitz.Rect(rect)
    page.draw_rect(rectangle, color=None, fill=(1, 1, 1), overlay=True)
    for font_size in range(size, 10, -1):
        shape = page.new_shape()
        remaining = shape.insert_textbox(rectangle + fitz.Rect(3, 2, -3, -2), text,
            fontname='helv', fontsize=font_size, color=(0, 0, 0), align=align, lineheight=1.13)
        if remaining >= 0:
            shape.commit(overlay=True)
            return font_size
    raise ValueError(f'English text cannot fit: {text}')

def render_asset(document, key, number, chapter, filename, slot, caption, alt, crop=None, edits=None):
    copy = fitz.open()
    copy.insert_pdf(document, from_page=number - 1, to_page=number - 1)
    page = copy[0]
    edit_records = []
    for rect, text, size in edits or []:
        actual_size = overlay(page, rect, text, size, 1 if number == 17 and key == 'ntu' else 0)
        edit_records.append({'rectangle_pdf_points': rect, 'english': text, 'font_size': actual_size})
    clip = fitz.Rect(crop) if crop else page.rect
    scale = 1800 / clip.width
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip, alpha=False)
    path = Path('spaceship-ui/site/assets/assets/posts') / SLUGS[chapter] / filename
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    pix.save(target)
    origin, digest, author, _ = SOURCES[key]
    return {'slot': slot, 'chapter': chapter, 'path': str(path),
        'src': '/assets/posts/' + SLUGS[chapter] + '/' + filename,
        'source_key': key, 'source': origin + '#page=' + str(number),
        'source_pdf_sha256': digest, 'pdf_page': number, 'caption': caption, 'alt': alt,
        'credit': author + ('. Unofficial English text adaptation; original diagrams retained.' if edits else '. Original source, not redrawn.'),
        'width': pix.width, 'height': pix.height, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
        'crop_pdf_points': crop, 'edits': edit_records, 'rights_status': 'unverified'}

def main():
    documents = dict(ThreadPoolExecutor(max_workers=4).map(fetch_source, SOURCES.items()))
    assets = []
    for number in range(16, 26):
        chapter = 4 if number < 21 else 5
        operation = '비공식 영어 편집본' if number in EDITS else '원본 영어 슬라이드·내용 변경 없음'
        if number == 23:
            operation += ' · 원본의 가려진 영역 유지; 설명은 발표자 노트와 별도 문헌을 구분해 제시'
        assets.append(render_asset(documents['ntu'], 'ntu', number, chapter,
            f'ntu-self-improving-{number:02d}-en.png', f'main-{number}',
            f'P{number:03d} — NTU Self-Improving 원본 {number}쪽 · {operation}.',
            MAIN_ALT[number], edits=EDITS.get(number)))
    for chapter, slot, key, number, crop, filename, caption, alt in SUPPLEMENTARY:
        assets.append(render_asset(documents[key], key, number, chapter, filename,
            'supplementary-' + slot, caption, alt, crop=crop))
    for chapter in SLUGS:
        selected = [a for a in assets if a['chapter'] == chapter]
        assert len(selected) == 9
        path = ROOT / f'docs/self-improving-ai/source-assets/{chapter:02d}/manifest.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({'chapter': chapter, 'slug': SLUGS[chapter],
            'source_numbering': 'PDF cover is page 1; original page order preserved',
            'primary_page_range': [16, 20] if chapter == 4 else [21, 25],
            'source_and_edit_review': 'Primary text and cited source regions reviewed; software bounds checks do not constitute browser QA.',
            'rights_status': 'unverified; public access and user publication request do not establish source-owner permission',
            'assets': selected}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Prepared 18 final source-linked image assets.', flush=True)

if __name__ == '__main__':
    main()

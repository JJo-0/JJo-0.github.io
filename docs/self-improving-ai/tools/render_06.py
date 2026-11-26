"""Render chapter 06 from hash-pinned originals; translate text, never redraw figures.
Requires PyMuPDF==1.26.7. Use --source-dir for an already-downloaded source cache.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import urllib.request
import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[3]
SLUG = 'self-improving-ai-06-self-evaluation-and-entropy'
SOURCES = {
    'ntu': ('ntu.pdf', 'https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf', '0bf81bb4af728ed04c21e2811aa2f1cb0210c70d09d7c6ebb2acf3c3f77b4844', 'Hung-yi Lee / NTU', 62),
    'self-consistency': ('self-consistency.pdf', 'https://arxiv.org/pdf/2203.11171v4', '1a49ce0373afc89d2d6e97fb1aa8230f6b818c70590d732a3187f753f4df6aba', 'Xuezhi Wang et al. / Google Research, ICLR 2023', 24),
    'tent': ('tent.pdf', 'https://arxiv.org/pdf/2006.10726v3', '215223e9885dd7208cad9dbff2cf315f1cc96554fedc4660d0d2c4932364e5f7', 'Dequan Wang et al. / ICLR 2021', 15),
    'suta': ('suta.pdf', 'https://www.isca-archive.org/interspeech_2022/lin22b_interspeech.pdf', '234b952ca0bed90c0a39f90749a9374675b49f42a4227b1514982fda0c5a53fc', 'Guan-Ting Lin, Shang-Wen Li, Hung-yi Lee / ISCA Interspeech 2022', 5),
    'entropy-llm': ('entropy-llm.pdf', 'https://papers.nips.cc/paper_files/paper/2025/file/9a14cf2ee36cf2524f54d8f196a6734c-Paper-Conference.pdf', 'cd3832f56144780fcce0bb776d7477731e7bd3341aec116d5073ded3e463cf47', 'Shivam Agarwal et al. / NeurIPS 2025', 31),
}
TITLE = ([68, 49, 492, 115], 'Let AI Define the Loss', 32)
EDITS = {
    26: [TITLE],
    27: [TITLE, ([301, 232, 486, 267], 'Give a score from 1 to 5', 17), ([301, 381, 470, 434], 'Do you think this\nanswer is correct?', 17), ([809, 443, 853, 469], 'Yes', 17)],
    28: [TITLE],
    29: [TITLE, ([707, 276, 944, 372], 'More concentrated\nmeans more confident\nand a lower loss', 20), ([768, 482, 947, 520], 'Can we compute this?', 17)],
    30: [TITLE, ([284, 390, 553, 418], 'https://arxiv.org/abs/2203.14222', 17)],
}
ALTS = {
    26: '입력과 생성 답을 평가하는 AI가 각 예제의 손실을 만들고 이를 합하는 RLAIF의 영어 편집 슬라이드.',
    27: '답에 1–5점 점수를 매기는 방법과 Yes 토큰의 확률을 음수 부호와 연결해 손실을 만드는 영어 편집 슬라이드.',
    28: '같은 질문의 답 3, 5, 3에서 다수 답 3을 의사 정답으로 선택해 다른 출력과 비교하는 영어 편집 슬라이드.',
    29: '출력 확률의 집중도와 엔트로피의 합·기대값 표현을 보여주는 영어 편집 슬라이드. 확신은 정확성과 구분해야 한다.',
    30: '이미지의 Tent, 음성의 SUTA, 텍스트의 엔트로피 최소화 연구를 연결하는 영어 편집 슬라이드. SUTA 링크의 잘린 마지막 숫자를 수정했다.',
}
SUPPLEMENTS = [
    ('A', 'self-consistency', 2, [104, 73, 508, 266], 'self-consistency-v4-figure1.png', 'Self-Consistency · arXiv v4 / ICLR 2023 · PDF 2쪽 Figure 1 그림 영역 발췌.', '하나의 탐욕적 답과 여러 추론 경로를 샘플링해 최종 답을 집계하는 자기일관성 방식을 비교한 원본 Figure 1.'),
    ('B', 'tent', 3, [104, 184, 508, 271], 'tent-v3-figure3.png', 'Tent · arXiv v3, 2021-03-18 / ICLR 2021 · PDF 3쪽 Figure 3와 캡션 발췌.', '정답 라벨을 쓰는 훈련과 예측 엔트로피로 제한된 파라미터를 조절하는 테스트 시점 적응을 비교한 Tent 원본 Figure 3.'),
    ('C', 'suta', 1, [310, 211, 544, 386], 'suta-interspeech2022-figure1.png', 'SUTA · Interspeech 2022 정식 논문 · PDF 1쪽, 인쇄 2198쪽 Figure 1 그림 영역 발췌.', '단일 발화에 대해 온도 평활화, 엔트로피 최소화, 클래스 혼동 감소를 결합해 일부 음성 인식 파라미터를 적응시키는 SUTA 원본 그림.'),
    ('D', 'entropy-llm', 9, [104, 75, 508, 185], 'entropy-llm-neurips2025-table5.png', 'Entropy Minimization in LLM Reasoning · NeurIPS 2025 정식 논문 · PDF 9쪽 Table 5와 표제 발췌.', '기본 모델과 과제에 따라 엔트로피 최소화의 효과가 제한되거나 낮아질 수 있음을 보여주는 원본 Table 5.'),
]

def obtain(item, cache):
    key, (filename, url, expected, _, count) = item
    path = cache / filename if cache else None
    if path and path.exists():
        data = path.read_bytes()
    else:
        request = urllib.request.Request(url, headers={'User-Agent': 'JJo-source-review/1.0'})
        with urllib.request.urlopen(request, timeout=70) as response:
            data = response.read(40_000_001)
    if len(data) > 40_000_000 or hashlib.sha256(data).hexdigest() != expected:
        raise ValueError(f'{key}: changed source; review before proceeding')
    doc = fitz.open(stream=data, filetype='pdf')
    if len(doc) != count:
        raise ValueError(f'{key}: page-count mismatch')
    return key, doc


def render(doc, key, number, filename, slot, caption, alt, crop=None):
    copy = fitz.open()
    copy.insert_pdf(doc, from_page=number-1, to_page=number-1)
    page = copy[0]
    edits = []
    for rectangle, text, preferred in EDITS.get(number, []) if key == 'ntu' else []:
        box = fitz.Rect(rectangle)
        page.draw_rect(box, color=None, fill=(1,1,1), overlay=True)
        for size in range(preferred, 10, -1):
            shape = page.new_shape()
            remaining = shape.insert_textbox(box + fitz.Rect(3,2,-3,-2), text, fontname='helv', fontsize=size, color=(0,0,0), lineheight=1.13)
            if remaining >= 0:
                shape.commit(overlay=True)
                edits.append({'rectangle_pdf_points': rectangle, 'english': text, 'font_size': size})
                break
        else:
            raise ValueError(f'Text does not fit: {text}')
    clip = fitz.Rect(crop) if crop else page.rect
    image = page.get_pixmap(matrix=fitz.Matrix(1800/clip.width, 1800/clip.width), clip=clip, alpha=False)
    path = Path('spaceship-ui/site/assets/assets/posts') / SLUG / filename
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target)
    _, source, source_hash, author, _ = SOURCES[key]
    return {'slot':slot, 'chapter':6, 'path':str(path), 'src':f'/assets/posts/{SLUG}/{filename}', 'source':f'{source}#page={number}', 'source_pdf_sha256':source_hash, 'pdf_page':number, 'caption':caption, 'alt':alt, 'credit':author + ('. Unofficial English text adaptation; original diagrams retained.' if edits else '. Original source, not redrawn.'), 'width':image.width, 'height':image.height, 'sha256':hashlib.sha256(target.read_bytes()).hexdigest(), 'crop_pdf_points':crop, 'edits':edits, 'rights_status':'unverified'}


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source-dir',type=Path);args=parser.parse_args()
    if fitz.VersionBind != '1.26.7':
        raise RuntimeError('Use PyMuPDF==1.26.7 for reproducible rendering')
    with ThreadPoolExecutor(max_workers=3) as pool:
        documents=dict(pool.map(lambda item:obtain(item,args.source_dir),SOURCES.items()))
    assets=[]
    for number in range(26,31):
        caption=f'P{number:03d} — NTU Self-Improving 원본 {number}쪽 · 비공식 영어 편집본.'
        if number==30:caption+=' 원본의 SUTA URL 2203.1422를 확인된 논문 번호 2203.14222로 수정.'
        assets.append(render(documents['ntu'],'ntu',number,f'ntu-self-improving-{number}-en.png',f'main-{number}',caption,ALTS[number]))
    for slot,key,number,crop,filename,caption,alt in SUPPLEMENTS:
        assets.append(render(documents[key],key,number,filename,f'supplementary-{slot}',caption,alt,crop))
    path=ROOT/'docs/self-improving-ai/source-assets/06/manifest.json';path.parent.mkdir(parents=True,exist_ok=True)
    payload={'chapter':6,'slug':SLUG,'source_numbering':'PDF cover is page 1; original order preserved','primary_page_range':[26,30],'renderer':'PyMuPDF 1.26.7','rights_status':'unverified; public access and user publication intent do not establish source-owner permission','source_link_correction':{'page':30,'original':'https://arxiv.org/abs/2203.1422','corrected':'https://arxiv.org/abs/2203.14222','basis':'ISCA Interspeech 2022 paper by Guan-Ting Lin, Shang-Wen Li and Hung-yi Lee'},'assets':assets}
    path.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'images':len(assets),'primary_pages':[26,30],'manifest':str(path.relative_to(ROOT))}))

if __name__=='__main__':
    main()

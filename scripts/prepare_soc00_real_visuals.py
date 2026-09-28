#!/usr/bin/env python3
"""One-off, scoped preparation of two source-backed SoC 00 teaching images.

Downloads are public documents/images, never executable code. Existing article
contracts, RTL, and other posts are not rewritten. Run --manifest-only only after
committing the prepared source files so the translation receipt names that commit.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
from pathlib import Path
import re
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
UI = ROOT / 'spaceship-ui'
ASSETS = UI / 'public/images/posts/soc-00'
KO = UI / 'site/content/posts/2026-09-28-soc-00-system-map.mdx'
EN = UI / 'site/content/english/en-soc-00-system-map.mdx'
PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/3/38/Raspberry_Pi_Pico_top.jpg'
PDF = 'https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf'

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def download(url: str, limit: int = 24_000_000) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent': 'SoC00EducationalArticle/1.0 (https://jjo-0.github.io/)'})
    with urllib.request.urlopen(req, timeout=60) as response:
        if not response.geturl().startswith('https://'):
            raise RuntimeError('Refusing an insecure redirect')
        data = response.read(limit + 1)
    if not data or len(data) > limit:
        raise RuntimeError(f'Unexpected download size for {url}')
    return data

def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + '\n', encoding='utf-8')

def replace_once(text: str, old: str, new: str) -> str:
    if text.count(old) != 1:
        raise RuntimeError(f'Expected one insertion point: {old[:80]!r}')
    return text.replace(old, new, 1)

def manifest_only() -> None:
    path = UI / 'site/english-edition.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    pair = next(p for p in data['pairs'] if p['key'] == 'soc-00-20260928')
    pair['sourceSha256'] = sha(KO.read_bytes())
    pair['englishSha256'] = sha(EN.read_bytes())
    pair['sourceCommit'] = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    write(path, json.dumps(data, ensure_ascii=False, indent=2))
    print('Translation receipt updated:', pair['sourceCommit'])

def main() -> None:
    args = argparse.ArgumentParser()
    args.add_argument('--manifest-only', action='store_true')
    if args.parse_args().manifest_only:
        manifest_only()
        return
    from PIL import Image
    import fitz

    if 'SocSourceFigures' in KO.read_text(encoding='utf-8'):
        raise RuntimeError('Visual insertions already exist; refusing duplicate preparation')
    ASSETS.mkdir(parents=True, exist_ok=True)
    photo_bytes, pdf_bytes = download(PHOTO), download(PDF)
    image = Image.open(io.BytesIO(photo_bytes)).convert('RGB')
    if image.size != (7872, 3720):
        raise RuntimeError('The Wikimedia photograph revision/dimensions changed')
    image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    image.save(ASSETS / 'pico-top.webp', 'WEBP', quality=90, method=6)

    document = fitz.open(stream=pdf_bytes, filetype='pdf')
    colophon = document[1].get_text()
    if '3184e62-clean' not in colophon or '2025-02-20' not in colophon:
        raise RuntimeError('RP2040 datasheet edition changed; review the new source before importing')
    page = document[10]
    if 'Figure 2.' not in page.get_text() or 'RP2040' not in page.get_text():
        raise RuntimeError('The reviewed Figure 2 is not on the expected page')
    # Entire original Figure 2 including its margin caption. No overlaid labels,
    # redraw, line removal, translation, or diagram recolouring.
    figure_rect = fitz.Rect(51.5, 78.5, 545, 388.5)
    pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=figure_rect, alpha=False)
    diagram = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    diagram.save(ASSETS / 'rp2040-figure-2.webp', 'WEBP', lossless=True, method=6)
    full = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    Image.frombytes('RGB', (full.width, full.height), full.samples).save(ASSETS / 'rp2040-page-10.webp', 'WEBP', lossless=True, method=6)

    def record(filename: str, source: str, license_name: str) -> dict:
        path = ASSETS / filename
        with Image.open(path) as im:
            width, height = im.size
        return {'src': '/images/posts/soc-00/' + filename, 'width': width, 'height': height,
                'bytes': path.stat().st_size, 'sha256': sha(path.read_bytes()), 'source': source,
                'license': license_name}
    metadata = {
        'board': record('pico-top.webp', PHOTO, 'CC-BY-SA-4.0'),
        'datasheet': record('rp2040-figure-2.webp', PDF + '#page=11', 'CC-BY-ND-4.0'),
        'fullPage': record('rp2040-page-10.webp', PDF + '#page=11', 'CC-BY-ND-4.0'),
        'sourcePhotoSha256': sha(photo_bytes), 'sourcePdfSha256': sha(pdf_bytes),
        'sourcePdfBuild': '3184e62-clean', 'sourcePdfBuildDate': '2025-02-20',
        'pdfZeroBasedPage': 10, 'printedPage': 10, 'figure': 2,
        'figureExcerptRectanglePt': list(figure_rect), 'reviewedOn': '2026-09-28',
        'note': 'Photograph resized/converted; diagram excerpt unaltered apart from rendering format. Full original page retained. Not a die photograph or measured waveform.'}
    write(UI / 'src/data/soc-00-real-media.json', json.dumps(metadata, ensure_ascii=False, indent=2))
    write(UI / 'src/components/post/SocSourceFigures.astro', (ROOT / 'scripts/templates/SocSourceFigures.astro').read_text(encoding='utf-8'))
    write(ASSETS / 'LICENSES.md', '''# Third-party image notices — SoC 00

These assets have individual licenses; the repository software license does not replace them.

## pico-top.webp
Photo: Phiarc, Raspberry Pi Pico top.jpg, photographed 2023-03-18.
Source: https://commons.wikimedia.org/wiki/File:Raspberry_Pi_Pico_top.jpg
Original: https://upload.wikimedia.org/wikipedia/commons/3/38/Raspberry_Pi_Pico_top.jpg
License: https://creativecommons.org/licenses/by-sa/4.0/
Changes: resized and converted to WebP, no graphical additions. This rendition remains CC BY-SA 4.0. No endorsement is implied.

## rp2040-figure-2.webp and rp2040-page-10.webp
© 2020–2025 Raspberry Pi Ltd. RP2040 Datasheet, build 3184e62-clean, 2025-02-20.
Source: https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf#page=11
License: https://creativecommons.org/licenses/by-nd/4.0/
Manufacturer notice: https://www.raspberrypi.com/licensing/
The diagram asset reproduces Figure 2 as an unchanged excerpt, including the original figure caption. The page asset reproduces the complete printed page 10. Technical rendering/format conversion only; labels, lines and diagram content have not been modified. Explanations are separate HTML, not a translated or annotated derivative of the diagram. No endorsement is implied.

The source document also acknowledges portions © Synopsys, Inc. and Arm Limited. Their notices and the complete colophon remain available at the original document, PDF page 2. No broader rights to those third-party materials are granted here.
''')

    for path, lang in [(KO, 'ko'), (EN, 'en')]:
        text = path.read_text(encoding='utf-8')
        old_import = "import SocOverviewFigures from '@/components/post/SocOverviewFigures.astro';"
        text = replace_once(text, old_import, old_import + "\nimport SocSourceFigures from '@/components/post/SocSourceFigures.astro';")
        opener = next(p for p in text.split('\n\n') if p.startswith('**센서 값을') or p.startswith('**Behind a single line'))
        new_opener = ('**이 초록색 보드 전체가 CPU일까요? 가운데 검은 칩 하나가 CPU일까요?** 먼저 실제 Raspberry Pi Pico 사진에서 보드·칩·CPU 코어의 경계를 확인합니다. 그다음 같은 RP2040의 제조사 데이터시트로 들어갑니다. 용어를 외우기 전에, 무엇을 가리키는 말인지 눈으로 잡아봅시다.[4][19][20]'
                     if lang == 'ko' else
                     '**Is the whole green board a CPU? Or is the black chip in the middle the CPU?** Start with a real Raspberry Pi Pico photograph, then open the manufacturer’s datasheet for the same RP2040. Identify the physical board, the chip package and the internal CPU cores before memorising the terms.[4][19][20]')
        text = replace_once(text, opener, new_opener + f'\n\n<SocSourceFigures kind="board" lang="{lang}" />')
        text = text.replace('네 장의 도식은 자체 재구성이며 실제 다이 배치도·측정 파형이 아닙니다.', '실물 사진과 제조사 Figure 2 원문을 먼저 보고, 기존 다섯 학습용 도식으로 단순화합니다. 실물·원문·가상 예제를 구분하며 원본 도식은 실제 다이 배치도·측정 파형이 아닙니다.')
        text = text.replace('All four figures are original reconstructions, not physical die layouts or measured waveforms.', 'The real photograph and the manufacturer’s original Figure 2 come first; five separate teaching diagrams simplify the ideas. Photographs, source figures and invented examples are clearly distinguished, and functional diagrams are not physical die layouts or measured waveforms.')
        if lang == 'en':
            text = re.sub(r"^description:.*$", "description: 'Start with a real Pico photograph and the RP2040 datasheet, then trace the hardware/software boundary.'", text, count=1, flags=re.M)
        header = '| 블록 | 왜 필요한가? | 센서 예제에서 하는 일 |' if lang == 'ko' else '| Block | Why is it needed? | Role in the sensor example |'
        lead = ('사진에서는 칩의 겉만 봤습니다. **이제 그 RP2040의 공식 내부 구조를 봅니다.** 다음은 제조사 데이터시트의 Figure 2이며, 오른쪽 위 `Proc0`·`Proc1`부터 중앙 `Bus Fabric`, 아래 `SRAM`, 왼쪽 `Peripherals` 순서로 읽으면 됩니다. 그림 전체를 한 번에 외울 필요는 없습니다.[20]'
                if lang == 'ko' else
                'The photograph showed the outside of the package. **Now look at the official functional structure of that same RP2040.** In the manufacturer’s Figure 2, read `Proc0`/`Proc1` at upper right, then `Bus Fabric`, `SRAM` and `Peripherals`. You do not need to memorise every block.[20]')
        text = replace_once(text, header, lead + f'\n\n<SocSourceFigures kind="datasheet" lang="{lang}" />\n\n' + header)
        # Fix stale prose version labels only where the URL already names 6.18.
        text = text.replace('Linux MMIO·IIO는 6.12', 'Linux MMIO·IIO는 6.18')
        text = text.replace('), 6.12,', '), 6.18,')
        if re.search(r'^\[19\]', text, re.M):
            raise RuntimeError('Reference IDs 19/20 are no longer free')
        refs = ('\n\n[19] Phiarc, [Raspberry Pi Pico top.jpg](https://commons.wikimedia.org/wiki/File:Raspberry_Pi_Pico_top.jpg), 2023-03-18, CC BY-SA 4.0. '
                + ('실물 사진, 크기 조정 및 WebP 변환.' if lang == 'ko' else 'Real photograph, resized and converted to WebP.')
                + '\n\n[20] Raspberry Pi Ltd, [RP2040 Datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf#page=11), build 3184e62-clean, 2025-02-20, §1.2–1.3, Figure 2, printed p.10 / PDF page 11. CC BY-ND 4.0. '
                + ('원본 그림 발췌, 그림 내용 변경 없음. 실제 다이 배치도가 아닌 기능 구조.' if lang == 'ko' else 'Unchanged figure excerpt. Functional structure, not a physical die layout.'))
        write(path, text + refs)

    browser = UI / 'scripts/soc-overview-browser-check.mjs'
    code = browser.read_text(encoding='utf-8')
    source_checks = '''    const sourceCards = [];
    for (const sourceKind of ['board', 'datasheet']) {
      await evaluate(cdp, sessionId, `document.querySelector('[data-soc-source="${sourceKind}"]').scrollIntoView({block:'center',behavior:'instant'})`);
      await waitExpression(cdp, sessionId, `(() => { const i=document.querySelector('[data-soc-source="${sourceKind}"] img'); return i && i.complete && i.naturalWidth>500; })()`, `Real ${sourceKind} image loaded`);
      const sourceLayout = await evaluate(cdp, sessionId, `(() => {
        const f=document.querySelector('[data-soc-source="${sourceKind}"]');
        const img=f.querySelector('img'); const r=f.getBoundingClientRect();
        const firstChapter=[...document.querySelectorAll('article h2')].find(h=>h.textContent.trim().startsWith('1.'));
        return {kind:'${sourceKind}',local:new URL(img.currentSrc).origin===location.origin,
          beforeTerms:'${sourceKind}'!=='board'||!!(f.compareDocumentPosition(firstChapter)&Node.DOCUMENT_POSITION_FOLLOWING),
          overflow:document.documentElement.scrollWidth>innerWidth+2 || f.scrollWidth>f.clientWidth+2,
          width:img.naturalWidth,height:img.naturalHeight,alt:img.alt,
          zoom:f.querySelector('[data-soc-zoom]').getAttribute('href')===img.getAttribute('src'),
          license:!!f.querySelector('a[href*="creativecommons.org/licenses/"]'),
          bounds:{x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1}};
      })()`);
      assert(sourceLayout.local && sourceLayout.beforeTerms && !sourceLayout.overflow && sourceLayout.zoom && sourceLayout.license && sourceLayout.alt.length>40, JSON.stringify(sourceLayout));
      const {data: sourcePng}=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:sourceLayout.bounds},sessionId);
      fs.writeFileSync(`english-review/soc-${lang}-${width}-${dark?'dark':'light'}-source-${sourceKind}.png`,Buffer.from(sourcePng,'base64'));
      sourceCards.push(sourceLayout);
    }
'''
    code = replace_once(code, '    const diagrams = [];', source_checks + '\n    const diagrams = [];')
    code = replace_once(code, 'themes.push({dark,diagrams});', 'themes.push({dark,diagrams,sourceCards});')
    write(browser, code)
    print(json.dumps({'prepared': True, 'media': metadata}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()

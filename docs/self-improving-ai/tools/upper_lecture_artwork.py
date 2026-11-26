"""Restore the original lecture's click-revealed artwork after localizing the PDF."""
from functools import lru_cache
from io import BytesIO
from urllib.request import urlopen
from zipfile import ZipFile
import hashlib
import re

import pymupdf as fitz
from PIL import Image, ImageChops

PPTX = 'https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pptx'
PPTX_SHA256 = '486763704c627e902d47ec3d9ad4953d672bbef114635261b353e165e656cf47'
TIMES = {18: 910, 19: 950, 23: 1230, 24: 1430, 44: 2720, 50: 3130, 61: 3810}


@lru_cache(maxsize=1)
def lecture_artwork():
    with urlopen(PPTX, timeout=60) as response:
        presentation = response.read()
    if hashlib.sha256(presentation).hexdigest() != PPTX_SHA256:
        raise ValueError('Source PPTX changed; compare its contents with the lecture.')
    with ZipFile(BytesIO(presentation)) as archive:
        return {name: archive.read('ppt/media/' + name) for name in ['image4.svg', 'image55.png']}


def clear_failed_icon(page, scale):
    # The pinned PDF paints two red diagonals and one gray border for a missing
    # SVG. Remove just those strokes so any text or diagram behind it survives.
    document = page.parent
    strokes = [p for p in page.get_drawings() if p.get('color') == (1, 0, 0)]
    if len(strokes) != 2 or strokes[0]['rect'] != strokes[1]['rect']:
        raise ValueError('Unexpected shape for the PDF icon placeholder')
    bounds = (strokes[0]['rect'] * fitz.Matrix(scale, scale)).irect
    xref, = page.get_contents()
    pattern = (rb'1\.0\n0\n0\nRG\n0\n0\nm\n[\d.]+\n[\d.]+\nl\nS\n.*?'
               rb'0\.7529412\n0\.7529412\n0\.7529412\nRG\n.*?\nh\nS\n')
    stream, removed = re.subn(pattern, lambda m: m.group().replace(b'\nS\n', b'\nn\n'),
                              document.xref_stream(xref), flags=re.S)
    if removed != 1:
        raise ValueError('The expected icon placeholder is absent from the pinned PDF')
    document.update_stream(xref, stream)
    return bounds


def page_image(page, scale):
    pixels = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    return Image.frombytes('RGB', (pixels.width, pixels.height), pixels.samples)


def restore_person(image, document, page_number, svg):
    with fitz.open() as working:
        working.insert_pdf(document, from_page=page_number-1, to_page=page_number-1)
        page = working[0]
        scale = image.width / page.rect.width
        before = page_image(page, scale)
        bounds = clear_failed_icon(page, scale)
        clean = page_image(page, scale)
    extent = (bounds.x0-2, bounds.y0-2, bounds.x1+2, bounds.y1+2)
    red, green, blue = ImageChops.difference(before.crop(extent), clean.crop(extent)).split()
    changed = ImageChops.lighter(ImageChops.lighter(red, green), blue).point(lambda x: 255 if x else 0)
    image.paste(clean.crop(extent), extent[:2], changed)
    svg = svg.replace(b'<svg ', b'<svg width="96" height="96" ', 1)
    with fitz.open(stream=svg, filetype='svg') as document_svg:
        pixels = document_svg[0].get_pixmap(matrix=fitz.Matrix(4, 4), alpha=True)
    alpha = Image.frombytes('RGBA', (pixels.width, pixels.height), pixels.samples).getchannel('A')
    alpha = alpha.resize((bounds.width, bounds.height), Image.Resampling.LANCZOS)
    patch = clean.crop(tuple(bounds))
    patch.paste((0, 0, 0), (0, 0, *patch.size), alpha)
    image.paste(patch, (bounds.x0, bounds.y0), alpha.point(lambda x: 255 if x else 0))


def restore_lecture_artwork(target, document, page_number):
    """Restore the native slide artwork on the already-localized PNG and return provenance."""
    if page_number not in TIMES:
        return {}
    art = lecture_artwork()
    image = Image.open(target).convert('RGB')
    if page_number == 23:
        media = 'image55.png'
        source = Image.open(BytesIO(art[media]))
        # Preserve the existing English title. The Chinese title occupies rows 0–100.
        panels = source.crop((0, 101, source.width, source.height))
        height = round(panels.height * image.width / panels.width)
        image.paste(panels.resize((image.width, height), Image.Resampling.LANCZOS),
                    (0, image.height-height))
        operation = 'Restore the three original comic panels beneath the English title.'
    else:
        media = 'image4.svg'
        restore_person(image, document, page_number, art[media])
        operation = 'Restore the human icon from the original presentation at its native position.'
    image.save(target)
    return {'lecture_restoration': {
        'operation': operation,
        'video_url': f'https://www.youtube.com/watch?v=s06mSAGN4gM&t={TIMES[page_number]}s',
        'pptx_url': PPTX, 'pptx_sha256': PPTX_SHA256, 'media': 'ppt/media/' + media,
    }}

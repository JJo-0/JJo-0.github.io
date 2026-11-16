"""Reproducible source-page rendering for lessons 04/05; no publication claim."""
from pathlib import Path
import hashlib
import urllib.request
import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[3]
URL = 'https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf'
EXPECTED = '0bf81bb4af728ed04c21e2811aa2f1cb0210c70d09d7c6ebb2acf3c3f77b4844'
with urllib.request.urlopen(URL, timeout=90) as response:
    data = response.read()
if hashlib.sha256(data).hexdigest() != EXPECTED:
    raise RuntimeError('Source PDF changed; review the new edition before rendering.')
doc = fitz.open(stream=data, filetype='pdf')
assert len(doc) == 62
out = ROOT / 'docs/self-improving-ai/source-assets/review-04-05'
out.mkdir(parents=True, exist_ok=True)
for p in range(16, 26):
    pix = doc[p-1].get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    pix.save(out / f'original-{p:02d}.png')
    print(p, pix.width, pix.height)

"""Render chapter 17 figures from verified, explicitly attributed public PDFs.

Usage:
  python docs/self-improving-ai/tools/render_17.py

Five original NTU pages are unmodified full-page renders.
Two independent teaching slides are full-page renders; two research
figures are precisely cropped from their source PDFs. See manifest.json.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

import fitz

ROOT = Path(__file__).resolve().parents[3]
SLUG = "self-improving-ai-17-archive-dspy-experience"
URLS = {
    "ntu": "https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf",
    "dspy": "https://llmagents-learning.org/slides/dspy_lec.pdf",
    "dgm": "https://arxiv.org/pdf/2505.22954v3",
    "exprag": "https://arxiv.org/pdf/2603.18272v2",
}
# This SHA was previously recorded and checked in render_16.py.
NTU_SHA256 = "2e2f6114c8cd29edcbd00ca219e697ce6f6471f027857105238b6a590f862ed6"
FIGURES = [
    ("ntu", 16, "ntu-16-original.png", None, "main-1"),
    ("ntu", 17, "ntu-17-original.png", None, "main-2"),
    ("ntu", 18, "ntu-18-original.png", None, "main-3"),
    ("ntu", 19, "ntu-19-original.png", None, "main-4"),
    ("ntu", 20, "ntu-20-original.png", None, "main-5"),
    ("dgm", 7, "dgm-v3-figure3.png", (100, 318, 515, 468.8), "paper-figure-1"),
    ("dspy", 26, "llmagents-dspy-adapters-p26.png", None, "lecture-slide-1"),
    ("dspy", 31, "llmagents-dspy-optimizers-p31.png", None, "lecture-slide-2"),
    ("exprag", 1, "exprag-v2-figure1.png", (55, 167, 545, 333.8), "paper-figure-2"),
]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    article = ROOT / "spaceship-ui/site/content/posts" / (SLUG + ".mdx")
    text = article.read_text(encoding="utf-8")
    out_dir = ROOT / "spaceship-ui/site/assets/assets/posts" / SLUG
    out_dir.mkdir(parents=True, exist_ok=True)
    cache_dir = Path("/tmp/self-improving-ch17-pdfs")
    cache_dir.mkdir(parents=True, exist_ok=True)
    docs = {}
    data_hashes = {}
    try:
        for key, url in URLS.items():
            target = cache_dir / (key + ".pdf")
            if not target.exists():
                with urlopen(Request(url, headers={"User-Agent": "JJo-0-source-review/1.0"}), timeout=90) as response:
                    data = response.read(60_000_001)
                if len(data) > 60_000_000 or not data.startswith(b"%PDF"):
                    raise ValueError("Unexpected PDF payload: " + key)
                target.write_bytes(data)
            data = target.read_bytes()
            data_hashes[key] = sha(data)
            if key == "ntu" and data_hashes[key] != NTU_SHA256:
                raise ValueError("Official NTU PDF version drift")
            doc = fitz.open(stream=data, filetype="pdf")
            if key == "ntu" and len(doc) != 64:
                raise ValueError("Expected exactly 64 NTU Part 2 pages")
            docs[key] = doc

        records = []
        for key, page_num, name, crop, slot in FIGURES:
            doc = docs[key]
            if page_num < 1 or page_num > len(doc):
                raise ValueError("Source PDF page out of range: " + name)
            page = doc[page_num - 1]
            rect = fitz.Rect(crop) if crop else page.rect
            if not page.rect.contains(rect) or rect.is_empty:
                raise ValueError("Bad source crop: " + name)
            pix = page.get_pixmap(
                matrix=fitz.Matrix(1800 / rect.width, 1800 / rect.width),
                clip=rect, alpha=False
            )
            dest = out_dir / name
            pix.save(dest)
            article_src = "/assets/posts/" + SLUG + "/" + name
            article_source = URLS[key] + "#page=" + str(page_num)
            if article_src not in text or article_source not in text:
                raise ValueError("Article figure path/source missing: " + name)
            records.append({
                "slot": slot, "chapter": 17, "pdf": key, "pdf_page": page_num,
                "source": article_source, "source_sha256": data_hashes[key],
                "path": str(dest.relative_to(ROOT)), "src": article_src,
                "width": pix.width, "height": pix.height,
                "sha256": sha(dest.read_bytes()),
                "crop_pdf_points": list(crop) if crop else None,
                "operation": "exact PDF crop" if crop else "unaltered full-page PDF render",
                "edits": [], "rights_status": "unverified",
                "permission_verified": False,
            })
        manifest = {
            "chapter": 17, "slug": SLUG, "lecture_part": 2,
            "primary_page_range": [16, 20], "source_pdf_total_pages": 64,
            "rights_status": "unverified", "permission_verified": False,
            "sources": {k: {"url": URLS[k], "sha256": data_hashes[k],
                            "pages": len(docs[k])} for k in URLS},
            "assets": records,
        }
        manifest_path = ROOT / "docs/self-improving-ai/source-assets/17/manifest.json"
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"assets": len(records), "files": [
            {"name": r["path"], "dimensions": [r["width"], r["height"]]}
            for r in records]}, ensure_ascii=False))
    finally:
        for doc in docs.values():
            doc.close()


if __name__ == "__main__":
    main()

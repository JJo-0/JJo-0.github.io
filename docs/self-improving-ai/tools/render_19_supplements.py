"""Render the four English-language sources reviewed for Part 19."""

import argparse
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

import fitz

ROOT = Path(__file__).resolve().parents[3]
SLUG = "self-improving-ai-19-test-time-training-and-forgetting"
SOURCES = {
    "lambert": (
        "https://rlhfbook.com/teach/course/lec5-chap7/slides.pdf",
        "0d207b8da58fdfb15c8fbff7812f80dab9cd734841974ef359384da6be02cb64",
    ),
    "sun": (
        "https://proceedings.mlr.press/v119/sun20b/sun20b.pdf",
        "e146084f89a31d5a0a1ff0aa812173d8ad4b943de79b7ff4598ab5cc6ed0001d",
    ),
    "dsuta": (
        "https://aclanthology.org/2024.emnlp-main.1116.pdf",
        "1782b41c165c2a18acda5b68a45289b4af1e58b7e2665d6e0cae7866d437fc0c",
    ),
    "replay": (
        "https://speech.ee.ntu.edu.tw/~hylee/ml/ml2025-course-data/post_training.pdf",
        "f59f002e2567c5419b1b96b672a65e23a3f2614eea383da75906070f07accd96",
    ),
}
# Page numbers are one-based. Crops are in PDF points, measured from the top left.
FIGURES = [
    ("lambert", 7, "lambert-lecture5-07-inference-scaling.png", None, "external-lecture-1"),
    ("sun", 3, "sun-ttt-figure1-cifar10c.png", (49, 62, 550, 208), "paper-figure-1"),
    ("dsuta", 3, "lin-dsuta-figure2-three-approaches.png", (69, 67, 293, 223), "paper-figure-2"),
    ("replay", 29, "ntu-2025-29-experience-replay.png", None, "external-lecture-2"),
]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def render(cache):
    manifest_path = ROOT / "docs/self-improving-ai/source-assets/19/manifest.json"
    manifest = json.loads(manifest_path.read_text())
    target = ROOT / "spaceship-ui/site/assets/assets/posts" / SLUG
    target.mkdir(parents=True, exist_ok=True)
    entries = []
    for key, number, filename, crop, slot in FIGURES:
        url, expected = SOURCES[key]
        if cache is None:
            with urlopen(Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as response:
                data = response.read()
        else:
            data = (cache / f"{key}.pdf").read_bytes()
        if digest(data) != expected:
            raise ValueError(f"Official PDF changed: {url}")
        with fitz.open(stream=data, filetype="pdf") as source:
            page = source[number - 1]
            area = fitz.Rect(crop) if crop else page.rect
            if area.is_empty or not page.rect.contains(area):
                raise ValueError(f"Crop is outside page {number} of {url}")
            scale = 1800 / area.width
            pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=area, alpha=False)
            output = target / filename
            pixmap.save(output)
            manifest["sources"][key] = {"url": url, "sha256": expected, "pages": len(source)}
        entries.append({
            "slot": slot, "pdf": key, "pdf_page": number, "source": f"{url}#page={number}",
            "source_pdf_sha256": expected, "path": output.relative_to(ROOT).as_posix(),
            "src": f"/assets/posts/{SLUG}/{filename}", "width": pixmap.width, "height": pixmap.height,
            "sha256": digest(output.read_bytes()), "crop_pdf_points": crop,
            "operation": "Original PDF crop" if crop else "Original PDF page rendered without edits",
            "edits": [], "rights_status": "unverified", "permission_verified": False,
        })
    manifest["assets"] = [row for row in manifest["assets"] if row["pdf"] not in SOURCES] + entries
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--cache", type=Path, help="Read reviewed PDFs named lambert, sun, dsuta and replay from this directory.")
    render(cli.parse_args().cache)

"""Localize the five NTU lecture figures for part 19; preserve source artwork.

Invoke from any directory. Supply the official PDF locally with --pdf to reuse
an existing download. Crop coordinates below use the original PDF points.
"""
import argparse
import hashlib
import json
from io import BytesIO
from pathlib import Path
from urllib.request import urlopen

import fitz
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
SLUG = "self-improving-ai-19-test-time-training-and-forgetting"
SOURCE = "https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf"
SOURCE_SHA = "2e2f6114c8cd29edcbd00ca219e697ce6f6471f027857105238b6a590f862ed6"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SCALE = 2.5


def label(original, english, bounds, size, background="white", color="#151515"):
    return {"original": original, "english": english, "bounds": bounds,
            "size": size, "background": background, "color": color}


ttt_title = label("目標會改變：Test Time Training (TTT)",
                  "Goals Can Change: Test-Time Training (TTT)", (53, 39, 675, 80), 28)
edits_by_page = {
    26: [
        label("目標會改變", "Goals Can Change", (52, 40, 275, 79), 23),
        label("拋棄一切太浪費了", "Discarding it all\nwastes progress.", (552, 98, 710, 153), 15),
        label("背負一切太沉重了", "Keeping it all\nis too heavy.", (552, 239, 705, 292), 15),
    ],
    27: [ttt_title],
    28: [ttt_title],
    29: [
        ttt_title,
        label("【生成式人工智慧與機器學習導論2025】第 8 講：通用模型的終身學習 (Fine-tuning, Model Editing, Model Merging, Test-Time Training)",
              "Generative AI and Machine Learning (2025), Lecture 8\nLifelong Learning: Fine-Tuning, Model Editing, Model Merging, and TTT",
              (280, 340, 718, 379), 10.8),
    ],
    30: [
        label("目標會改變：避免遺忘", "Goals Can Change: Avoiding Forgetting", (52, 39, 683, 80), 28),
        # The thumbnail already has the same heading in English directly above.
        label("後訓練與遺忘", "", (464, 229, 651, 270), 15, background="black"),
        label("【生成式AI時代下的機器學習(2025)】第六講：生成式人工智慧的後訓練(Post-Training)與遺忘問題",
              "Machine Learning in the Era of Generative AI (2025), Lecture 6\nPost-Training and Forgetting in Generative AI",
              (227, 348, 692, 391), 11.1),
    ],
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def translate(image, edit):
    draw = ImageDraw.Draw(image)
    rect = tuple(round(x * SCALE) for x in edit["bounds"])
    draw.rectangle(rect, fill=edit["background"])
    if not edit["english"]:
        return
    font = ImageFont.truetype(FONT, round(edit["size"] * SCALE))
    size = draw.multiline_textbbox((0, 0), edit["english"], font=font, spacing=5)
    width, height = size[2] - size[0], size[3] - size[1]
    if width > rect[2] - rect[0] or height > rect[3] - rect[1]:
        raise ValueError(f"English label exceeds source region: {edit['english']}")
    y = rect[1] + (rect[3] - rect[1] - height) / 2 - size[1]
    draw.multiline_text((rect[0], round(y)), edit["english"], font=font, spacing=5, fill=edit["color"])


def render(data):
    if sha(data) != SOURCE_SHA:
        raise ValueError("NTU source differs from the reviewed PDF")
    assets = []
    dest = ROOT / "spaceship-ui/site/assets/assets/posts" / SLUG
    dest.mkdir(parents=True, exist_ok=True)
    with fitz.open(stream=data, filetype="pdf") as pages:
        if len(pages) != 64:
            raise ValueError("Expected 64 NTU pages")
        for page_no, edits in edits_by_page.items():
            page = pages[page_no - 1]
            raw = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), alpha=False).tobytes("png")
            image = Image.open(BytesIO(raw)).convert("RGB")
            for edit in edits:
                translate(image, edit)
            path = dest / f"ntu-{page_no}-english.png"
            image.save(path, optimize=True)
            assets.append({
                "slot": f"main-{page_no - 25}", "pdf": "ntu", "pdf_page": page_no,
                "source": f"{SOURCE}#page={page_no}", "source_pdf_sha256": SOURCE_SHA,
                "original_render_sha256": sha(raw),
                "path": path.relative_to(ROOT).as_posix(), "src": f"/assets/posts/{SLUG}/{path.name}",
                "width": image.width, "height": image.height, "sha256": sha(path.read_bytes()),
                "crop_pdf_points": None, "operation": "Original NTU slide with unofficial English text edits",
                "edits": [{"original": e["original"], "english": e["english"],
                           "rect_pdf_points": list(e["bounds"])} for e in edits],
                "rights_status": "unverified", "permission_verified": False,
            })
    manifest_path = ROOT / "docs/self-improving-ai/source-assets/19/manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    existing = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    others = [item for item in existing.get("assets", []) if item.get("pdf") != "ntu"]
    sources = {**existing.get("sources", {}), "ntu": {"url": SOURCE, "sha256": SOURCE_SHA, "pages": 64}}
    manifest = {**existing, "chapter": 19, "slug": SLUG, "lecture_part": 2,
                "primary_page_range": [26, 30], "source_pdf_total_pages": 64,
                "rights_status": "unverified", "permission_verified": False,
                "sources": sources, "assets": assets + others}
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--pdf", type=Path, help="Path to the official NTU lecture PDF")
    args = cli.parse_args()
    if args.pdf:
        render(args.pdf.read_bytes())
    else:
        with urlopen(SOURCE, timeout=60) as response:
            render(response.read())

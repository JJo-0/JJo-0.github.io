#!/usr/bin/env python3
"""
Normalize frontmatter tags across _posts.

Rules:
- Keep mixed language tags.
- Canonical key is `tags`.
- Remove legacy `tag` key.
- Keep 3~6 tags per post.
- Do not touch markdown body content.
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "_posts"
REPORTS_DIR = ROOT / "reports"

FILE_TAGS: Dict[str, List[str]] = {
    "2022-09-20-블로그를 시작하면서.md": ["blog", "github-blog", "study-notes"],
    "2022-09-26-python_변수.md": ["python", "study-notes", "k-digital", "변수"],
    "2022-10-26-데이터베이스(1).md": ["database", "oracle", "web-development"],
    "2023-03-24-Survey JS 설명.md": ["javascript", "surveyjs", "survey-library", "web-development"],
    "2023-06-20-자료구조(1).md": ["cpp", "data-structure", "study-notes"],
    "2023-06-28-코딩테스트 기본지식.md": ["cpp", "python", "swift", "coding-test"],
    "2023-07-06-SLAM(1).md": ["computer-vision", "robotics", "slam", "graduation-project"],
    "2023-07-06-SLAM(2).md": ["computer-vision", "robotics", "slam", "graduation-project"],
    "2023-07-11-코딩테스트 자료구조 (1).md": [
        "cpp",
        "python",
        "javascript",
        "data-structure",
        "coding-test",
    ],
    "2023-07-11-코딩테스트 자료구조 (2).md": ["data-structure", "algorithms", "coding-test", "programming"],
    "2023-07-13-ROS2 소개.md": ["robotics", "ros2", "system-setup", "development-environment"],
    "2023-07-26-ROS2 개발환경 구축.md": ["robotics", "ros2", "system-setup", "development-environment"],
    "2023-08-08-ROS2 노드와 데이터.md": ["robotics", "ros2", "ros", "python", "cpp"],
    "2024-01-18-SOEM의이해.md": ["robotics", "ros2", "communication-protocols", "ethercat"],
    "2024-01-19-머신러닝 정리.md": ["artificial-intelligence", "machine-learning", "algorithms", "research-analysis"],
    "2024-02-01-PHM.md": ["code-analysis", "data-science", "machine-learning", "python", "pandas"],
    "2024-03-17-English_word.md": [
        "study-notes",
        "vocabulary",
        "technical-terms",
        "computer-vision",
        "artificial-intelligence",
    ],
    "2024-04-05-Raspberry pi 5 설정.md": ["system-setup", "raspberry-pi", "linux", "ubuntu"],
    "2024-04-08-Docker 설정.md": ["system-setup", "docker", "containerization", "development-environment"],
    "2024-05-02-힙 Heap copy.md": ["data-structure", "cpp", "study-notes", "ubuntu", "docker"],
    "2024-06-04-자료구조1.md": ["data-structure", "cpp", "study-notes"],
    "2024-06-04-자료구조2.md": ["data-structure", "cpp", "study-notes"],
    "2024-08-09-숫자야구.md": ["web-development", "javascript", "game-development", "interactive-ui"],
    "2024-10-29-python 코드 분석_1.md": ["python", "code-analysis", "study-notes"],
    "2024-12-26-Human Height Estimation.md": [
        "artificial-intelligence",
        "computer-vision",
        "pose-estimation",
        "research-paper",
    ],
    "2025-01-20-AlphaPose_Model.md": ["computer-vision", "pose-estimation", "ros", "python", "opencv"],
    "2025-02-07-Human_forecasting.md": [
        "artificial-intelligence",
        "deep-learning",
        "computer-vision",
        "pose-estimation",
        "research-paper",
    ],
    "2025-02-07-Human_pose_estimate.md": [
        "artificial-intelligence",
        "deep-learning",
        "computer-vision",
        "pose-estimation",
        "research-paper",
    ],
    "2025-02-18-Vision_공부.md": [
        "computer-vision",
        "artificial-intelligence",
        "deep-learning",
        "machine-learning",
        "linux",
    ],
    "2025-03-07-양산선물.md": ["health-wellness", "product-research", "uv-protection", "lifestyle"],
    "2025-03-18-Calibration.md": ["computer-vision", "calibration", "linux"],
    "2025-04-25-평가지표.md": ["artificial-intelligence", "deep-learning", "computer-vision", "evaluation-metrics"],
    "2025-05-08-선형대수.md": ["artificial-intelligence", "machine-learning", "deep-learning", "linear-algebra"],
    "2025-05-16-Mordern_Artificial_Intelligence.md": [
        "artificial-intelligence",
        "machine-learning",
        "data-science",
        "fundamentals",
    ],
    "2025-05-20-지속적인_보통_수준의_카페인_섭취.md": ["health-wellness", "nutrition", "neuroscience", "research-analysis"],
    "2025-05-23-Deep_Search_gemini.md": [
        "artificial-intelligence",
        "prompt-engineering",
        "tools-guides",
        "research-methods",
    ],
    "2025-05-23-Deep_Search_travel_prompt.md": [
        "artificial-intelligence",
        "prompt-engineering",
        "tools-guides",
        "travel",
    ],
    "2025-06-17-linux_단축어.md": ["linux", "system-setup", "development-environment", "tools-guides", "ros"],
    "2025-06-27-맞춤_마그네슘_영양제_선택.md": ["health-wellness", "health", "nutrition", "supplement", "magnesium"],
    "2025-07-23-맞춤_비타민B_영양제_선택.md": ["health", "nutrition", "supplement", "vitamin-b", "interactive-ui"],
    "2025-07-23-맞춤_오메가3_영양제_선택.md": ["health", "nutrition", "supplement", "omega-3", "interactive-ui"],
    "2025-07-25-인간의_시각.md": [
        "artificial-intelligence",
        "시각신경과학",
        "신경과학",
        "fmri",
        "뉴럴디코딩",
        "시각피질",
    ],
    "2025-08-06-당뇨병_통합관리.md": ["당뇨병", "헬스케어", "환자관리", "혈당관리", "식이요법", "운동치료"],
    "2025-11-08-로봇강화학습_성공사례.md": ["robotics", "artificial-intelligence", "reinforcement-learning", "research-paper"],
    "2027-01-15-AI 아키텍처.md": ["artificial-intelligence", "system-setup", "python", "linux", "windows"],
    "2027-02-27-WHAM_model.md": [
        "artificial-intelligence",
        "computer-vision",
        "pose-estimation",
        "python",
        "linux",
        "wsl",
    ],
    "2027-05-21-Poseforecasting.md": [
        "artificial-intelligence",
        "machine-learning",
        "deep-learning",
        "pose-estimation",
        "robotics",
    ],
}


def parse_frontmatter_sections(text: str) -> Tuple[str, List[str], str] | None:
    lines = text.splitlines(keepends=True)
    start = None
    for i, line in enumerate(lines):
        if line.strip() == "---":
            start = i
            break
    if start is None:
        return None

    end = None
    for i in range(start + 1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        return None

    prefix = "".join(lines[:start])
    fm_lines = lines[start + 1 : end]
    body = "".join(lines[end + 1 :])
    return prefix, fm_lines, body


def extract_tag_values(fm_lines: List[str]) -> List[str]:
    values: List[str] = []
    i = 0
    while i < len(fm_lines):
        line = fm_lines[i]
        m = re.match(r"^(tag|tags):\s*(.*)\s*$", line)
        if not m:
            i += 1
            continue

        tail = m.group(2).strip()
        i += 1

        if tail:
            if tail.startswith("[") and tail.endswith("]"):
                inner = tail[1:-1].strip()
                if inner:
                    parts = [p.strip() for p in inner.split(",")]
                    for p in parts:
                        p = p.strip().strip('"').strip("'")
                        if p:
                            values.append(p)
            else:
                v = tail.strip().strip('"').strip("'")
                if v:
                    values.append(v)
            continue

        while i < len(fm_lines):
            item = fm_lines[i]
            m_item = re.match(r"^\s*-\s*(.*?)\s*$", item)
            if not m_item:
                break
            raw = m_item.group(1).strip().strip('"').strip("'")
            if raw:
                values.append(raw)
            i += 1

    # preserve order and dedupe
    seen = set()
    deduped: List[str] = []
    for t in values:
        if t in seen:
            continue
        seen.add(t)
        deduped.append(t)
    return deduped


def remove_tag_blocks(fm_lines: List[str]) -> List[str]:
    out: List[str] = []
    i = 0
    while i < len(fm_lines):
        line = fm_lines[i]
        m = re.match(r"^(tag|tags):\s*(.*)\s*$", line)
        if not m:
            out.append(line)
            i += 1
            continue

        tail = m.group(2).strip()
        i += 1
        if tail:
            # inline list or scalar handled by removing only this line
            continue

        # block list: consume following "- item" lines
        while i < len(fm_lines) and re.match(r"^\s*-\s*.*$", fm_lines[i]):
            i += 1

    # trim trailing extra blank lines but keep one
    while len(out) >= 2 and out[-1].strip() == "" and out[-2].strip() == "":
        out.pop()
    return out


def format_tag_value(tag: str) -> str:
    if re.match(r"^[A-Za-z0-9_+.#/-]+$", tag):
        return tag
    if re.match(r"^[가-힣0-9A-Za-z_+.#/-]+$", tag):
        return tag
    escaped = tag.replace("'", "''")
    return f"'{escaped}'"


def build_tags_block(tags: List[str]) -> List[str]:
    lines = ["tags:\n"]
    for tag in tags:
        lines.append(f"- {format_tag_value(tag)}\n")
    return lines


def validate_tags(tags: List[str], filename: str) -> None:
    if not (3 <= len(tags) <= 6):
        raise ValueError(f"{filename}: expected 3~6 tags, got {len(tags)} => {tags}")
    seen = set()
    for t in tags:
        if t in seen:
            raise ValueError(f"{filename}: duplicate tag '{t}'")
        seen.add(t)


def normalize_file(path: Path, dry_run: bool) -> Tuple[bool, List[str], List[str]]:
    text = path.read_text(encoding="utf-8")
    parsed = parse_frontmatter_sections(text)
    if parsed is None:
        raise ValueError(f"{path.name}: frontmatter not found")

    prefix, fm_lines, body = parsed
    before_tags = extract_tag_values(fm_lines)

    if path.name not in FILE_TAGS:
        raise ValueError(f"{path.name}: no canonical tags mapping")

    final_tags = FILE_TAGS[path.name]
    validate_tags(final_tags, path.name)

    cleaned_fm = remove_tag_blocks(fm_lines)

    # ensure one blank line before tags block for readability
    if cleaned_fm and cleaned_fm[-1].strip() != "":
        cleaned_fm.append("\n")
    cleaned_fm.extend(build_tags_block(final_tags))

    new_text = f"{prefix}---\n{''.join(cleaned_fm)}---\n{body}"

    changed = new_text != text
    if changed and not dry_run:
        path.write_text(new_text, encoding="utf-8")

    return changed, before_tags, final_tags


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize tag/tags frontmatter in _posts")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing files")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Exit with code 1 if normalization is required (use with --dry-run)",
    )
    parser.add_argument(
        "--no-report",
        action="store_true",
        help="Skip writing reports/tag-audit.md (recommended for CI checks)",
    )
    args = parser.parse_args()

    if args.check and not args.dry_run:
        raise SystemExit("--check requires --dry-run")

    posts = sorted(POSTS_DIR.glob("*.md"))
    missing_mapping = sorted({p.name for p in posts} - set(FILE_TAGS.keys()))
    extra_mapping = sorted(set(FILE_TAGS.keys()) - {p.name for p in posts})

    if missing_mapping:
        raise SystemExit(f"Missing FILE_TAGS mappings for: {missing_mapping}")
    if extra_mapping:
        raise SystemExit(f"FILE_TAGS contains non-existent files: {extra_mapping}")

    report_rows: List[Tuple[str, List[str], List[str], bool]] = []
    changed_count = 0

    for path in posts:
        changed, before_tags, after_tags = normalize_file(path, args.dry_run)
        if changed:
            changed_count += 1
        report_rows.append((path.name, before_tags, after_tags, changed))

    stamp = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    mode = "DRY-RUN" if args.dry_run else "APPLY"

    lines: List[str] = []
    lines.append("# Tag Audit Report\n")
    lines.append(f"\n- Generated: {stamp}\n")
    lines.append(f"- Mode: {mode}\n")
    lines.append(f"- Total posts: {len(posts)}\n")
    lines.append(f"- Changed posts: {changed_count}\n")
    lines.append("\n## Per-File Changes\n")

    for filename, before_tags, after_tags, changed in report_rows:
        status = "changed" if changed else "unchanged"
        lines.append(f"\n### {filename} ({status})\n")
        lines.append(f"- before: {before_tags}\n")
        lines.append(f"- after:  {after_tags}\n")

    report_path = REPORTS_DIR / "tag-audit.md"
    if not args.no_report:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        report_path.write_text("".join(lines), encoding="utf-8")

    print(f"mode={mode}")
    print(f"total_posts={len(posts)}")
    print(f"changed_posts={changed_count}")
    if args.no_report:
        print("report=skipped")
    else:
        print(f"report={report_path}")

    if args.check and changed_count > 0:
        raise SystemExit(
            f"Tag normalization check failed: {changed_count} posts require normalization"
        )


if __name__ == "__main__":
    main()

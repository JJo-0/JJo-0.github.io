#!/usr/bin/env python3
"""
Normalize HTML-heavy post bodies into Markdown-friendly content.

Usage:
  .venv-htmlfix/bin/python scripts/normalize_html_posts.py --write <file> [<file> ...]
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

import html2text


FRONTMATTER_RE = re.compile(r"\A---\n.*?\n---\n?", re.DOTALL)


def split_frontmatter(raw: str) -> tuple[str, str]:
    match = FRONTMATTER_RE.match(raw)
    if not match:
        return "", raw
    return match.group(0), raw[match.end() :]


def sanitize_html(body: str) -> str:
    # Remove scripts/styles and document-level metadata tags.
    body = re.sub(r"(?is)<script\b[^>]*>.*?</script>", "\n", body)
    body = re.sub(r"(?is)<style\b[^>]*>.*?</style>", "\n", body)
    body = re.sub(r"(?is)<!--.*?-->", "\n", body)
    body = re.sub(r"(?im)^\s*<(meta|link|title)\b[^>]*>\s*$", "", body)

    # Remove empty wrapper blocks that only carry classes/JS hooks.
    body = re.sub(r"(?is)</?(?:section|article|main|header|footer|nav)\b[^>]*>", "\n", body)
    return body


def html_to_markdown(cleaned: str) -> str:
    converter = html2text.HTML2Text()
    converter.body_width = 0
    converter.ignore_images = False
    converter.ignore_links = False
    converter.ignore_emphasis = False
    converter.unicode_snob = True
    converter.protect_links = True
    converter.single_line_break = False

    md = converter.handle(cleaned)
    md = md.replace("\u00a0", " ")

    # Basic whitespace cleanup.
    md = re.sub(r"[ \t]+\n", "\n", md)
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip() + "\n"


def normalize_file(path: Path, write: bool) -> bool:
    raw = path.read_text(encoding="utf-8")
    frontmatter, body = split_frontmatter(raw)
    cleaned = sanitize_html(body)
    markdown_body = html_to_markdown(cleaned)
    updated = frontmatter + "\n" + markdown_body

    if updated == raw:
        return False

    if write:
        path.write_text(updated, encoding="utf-8")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize HTML-heavy posts to Markdown")
    parser.add_argument("--write", action="store_true", help="Write changes to files")
    parser.add_argument("files", nargs="+", help="Target markdown files")
    args = parser.parse_args()

    changed = 0
    for file_arg in args.files:
        path = Path(file_arg)
        if not path.exists():
            print(f"[skip] not found: {path}")
            continue
        if normalize_file(path, args.write):
            changed += 1
            print(f"[changed] {path}")
        else:
            print(f"[unchanged] {path}")

    print(f"done: {changed} file(s) changed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

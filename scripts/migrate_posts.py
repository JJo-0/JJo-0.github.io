#!/usr/bin/env python3
"""
Jekyll → Astro post migration script.
Converts _posts/*.md to spaceship-ui/site/content/posts/*.md
"""

import os
import re
import unicodedata
from pathlib import Path

POSTS_SRC = Path(__file__).parent.parent / "_posts"
POSTS_DST = Path(__file__).parent.parent / "spaceship-ui/site/content/posts"

# Demo posts to remove before migration
DEMO_FILES = [
    "configuring-spaceship.md",
    "demo-english.md",
    "demo-russian.md",
    "draft-test-post.md",
    "first-post.md",
    "getting-started.md",
    "how-to-publish-posts.md",
    "interactive-post.mdx",
    "russian-test.md",
    "slug-test.md",
    "test-series-1.md",
    "test-series-2.md",
    "test-series-3.md",
]


def slugify(text: str) -> str:
    """Convert text to URL-safe ASCII slug."""
    text = str(text)
    # Normalize unicode
    text = unicodedata.normalize("NFKD", text)
    # Remove non-ASCII (Korean etc.)
    text = text.encode("ascii", "ignore").decode("ascii")
    # Lowercase
    text = text.lower()
    # Replace spaces/underscores/special chars with hyphens
    text = re.sub(r"[\s_]+", "-", text)
    # Remove anything that's not alphanumeric or hyphen
    text = re.sub(r"[^\w-]", "", text)
    # Collapse multiple hyphens
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def has_korean(text: str) -> bool:
    """Check if text contains Korean characters."""
    return bool(re.search(r"[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]", text))


def parse_frontmatter(content: str):
    """Parse YAML frontmatter from markdown content."""
    if not content.startswith("---"):
        return {}, content

    end = content.find("\n---", 3)
    if end == -1:
        return {}, content

    fm_raw = content[3:end].strip()
    body = content[end + 4:].lstrip("\n")

    fm = {}
    # Simple YAML parser for the fields we need
    current_key = None
    current_list = None

    for line in fm_raw.splitlines():
        # List item
        if line.startswith("- "):
            val = line[2:].strip().strip("'\"")
            if current_list is not None:
                current_list.append(val)
            continue

        # Key: value
        m = re.match(r"^(\w[\w-]*):\s*(.*)", line)
        if m:
            # Save previous list
            if current_list is not None and current_key:
                fm[current_key] = current_list
                current_list = None

            key = m.group(1)
            val = m.group(2).strip()

            if val == "" or val is None:
                # Could be a list start
                current_key = key
                current_list = []
                continue

            # Strip quotes
            if (val.startswith("'") and val.endswith("'")) or (
                val.startswith('"') and val.endswith('"')
            ):
                val = val[1:-1]

            current_key = key
            current_list = None
            fm[key] = val

    # Flush last list
    if current_list is not None and current_key:
        fm[current_key] = current_list

    return fm, body


def extract_date(date_str: str) -> str:
    """Extract YYYY-MM-DD from date string."""
    if not date_str:
        return ""
    m = re.match(r"(\d{4}-\d{2}-\d{2})", str(date_str))
    return m.group(1) if m else str(date_str)


def extract_description(fm: dict, body: str) -> str:
    """Get description from excerpt or first body paragraph."""
    # Try excerpt first
    excerpt = fm.get("excerpt", "")
    if excerpt and not excerpt.startswith("<"):
        desc = re.sub(r"[#*`\[\](){}|>]", "", excerpt).strip()
        if len(desc) > 10:
            return desc[:160]

    # Fall back to first non-empty line of body
    for line in body.splitlines():
        line = line.strip()
        if line and not line.startswith("#") and not line.startswith("|") and not line.startswith("-"):
            desc = re.sub(r"[#*`\[\](){}|>]", "", line).strip()
            if len(desc) > 10:
                return desc[:160]

    return fm.get("title", "")[:160]


def build_astro_frontmatter(fm: dict, body: str, src_filename: str) -> str:
    """Build Astro-compatible frontmatter string."""
    title = fm.get("title", "Untitled")
    # Escape single quotes in title
    title_safe = title.replace("'", "\\'")

    pub_date = extract_date(fm.get("date", ""))
    updated_date = extract_date(fm.get("last_modified_at", ""))

    description = extract_description(fm, body)
    desc_safe = description.replace("'", "\\'")

    # Merge tags + categories, deduplicate, lowercase
    tags = []
    raw_tags = fm.get("tags", [])
    raw_cats = fm.get("categories", [])
    if isinstance(raw_tags, str):
        raw_tags = [raw_tags]
    if isinstance(raw_cats, str):
        raw_cats = [raw_cats]
    seen = set()
    for t in list(raw_tags) + list(raw_cats):
        t = t.strip().lower()
        if t and t not in seen:
            seen.add(t)
            tags.append(t)

    # Language detection
    lang = "ko" if (has_korean(title) or has_korean(body[:500]) or has_korean(src_filename)) else "en"

    # Fallback: extract date from src_filename if frontmatter date is missing
    if not pub_date:
        m = re.match(r"^(\d{4}-\d{2}-\d{2})", src_filename)
        pub_date = m.group(1) if m else "2020-01-01"

    lines = ["---"]
    lines.append(f"title: '{title_safe}'")
    lines.append(f"description: '{desc_safe}'")
    lines.append(f"pubDate: {pub_date}")
    if updated_date and updated_date != pub_date:
        lines.append(f"updatedDate: {updated_date}")
    if tags:
        tags_str = ", ".join(f"'{t}'" for t in tags)
        lines.append(f"tags: [{tags_str}]")
    lines.append(f"lang: '{lang}'")
    lines.append("---")
    return "\n".join(lines)


def migrate():
    """Run migration."""
    POSTS_DST.mkdir(parents=True, exist_ok=True)

    # Remove all existing generated posts (except _template.md)
    removed = []
    for p in POSTS_DST.glob("*.md"):
        if p.name != "_template.md":
            p.unlink()
            removed.append(p.name)
    for p in POSTS_DST.glob("*.mdx"):
        p.unlink()
        removed.append(p.name)
    if removed:
        print(f"Cleared {len(removed)} old files from destination.")

    src_files = sorted(POSTS_SRC.glob("*.md"))
    print(f"\nMigrating {len(src_files)} posts...\n")

    success, skipped, warnings = [], [], []
    slug_counts: dict[str, int] = {}

    for src in src_files:
        filename = src.name  # e.g. "2023-07-13-ROS2 소개.md"

        # Extract date from filename
        date_match = re.match(r"^(\d{4}-\d{2}-\d{2})-?", filename)
        file_date = date_match.group(1) if date_match else ""

        # Strip YYYY-MM-DD- prefix
        base = re.sub(r"^\d{4}-\d{2}-\d{2}-?", "", src.stem).strip()
        slug = slugify(base)

        # Use date-based slug if result is too short (mostly Korean filenames)
        if len(slug) < 3:
            slug = file_date if file_date else "post"

        # Handle collisions
        if slug in slug_counts:
            slug_counts[slug] += 1
            slug = f"{slug}-{slug_counts[slug]}"
        else:
            slug_counts[slug] = 1

        content = src.read_text(encoding="utf-8")
        fm, body = parse_frontmatter(content)

        # Warn about Liquid tags
        if "{%" in body or "{{" in body:
            warnings.append(f"  ⚠ {filename} — contains Liquid tags (may need manual cleanup)")

        new_fm = build_astro_frontmatter(fm, body, filename)
        new_content = new_fm + "\n\n" + body.lstrip("\n")

        dst = POSTS_DST / f"{slug}.md"
        dst.write_text(new_content, encoding="utf-8")
        success.append(f"  ✓ {filename} → {slug}.md")

    print("\n".join(success))

    if warnings:
        print("\nWarnings:")
        print("\n".join(warnings))

    print(f"\n✅ Migrated {len(success)} posts to {POSTS_DST}")
    if removed:
        print(f"🗑  Removed {len(removed)} demo files")


if __name__ == "__main__":
    migrate()

#!/usr/bin/env python3
"""
Apply and verify the blog's explicit post taxonomy.

This script is the canonical migration manifest for the 50 posts that existed
when the explicit taxonomy was introduced. It only rewrites YAML frontmatter;
post bodies, legacy redirect data, slugs, dates, and series metadata are left
untouched.

Usage:
    python scripts/normalize_tags.py --write
    python scripts/normalize_tags.py --check
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "spaceship-ui" / "site" / "content" / "posts"

CATEGORY_IDS = {
    "ai-machine-learning",
    "vision-perception-neuroscience",
    "robotics-embedded",
    "software-engineering-cs",
    "research-methods-tools",
    "health-lifestyle",
    "finance-industry",
    "meta",
}

CONTENT_TYPES = {
    "study-note",
    "tutorial",
    "setup-guide",
    "implementation",
    "paper-review",
    "research-report",
    "interactive-guide",
    "buying-guide",
    "financial-analysis",
    "essay",
    "meta",
}

RESEARCH_AREAS = {
    "robotics-autonomous-systems",
    "vision-pose-human-perception",
    "ml-foundations-evaluation",
    "ai-consciousness-governance",
}

STRUCTURAL_TAGS = {
    "projects",
    "resources",
    "areas",
    "study-notes",
    "research-paper",
    "system-setup",
    "tools-guides",
    "interactive-ui",
    "product-research",
    "code-analysis",
    "research-analysis",
    "graduation-project",
}


@dataclass(frozen=True)
class Taxonomy:
    category: str
    subcategory: str
    content_type: str
    tags: tuple[str, ...]
    research_area: str | None = None
    research_featured: bool = False
    research_order: int | None = None


POST_TAXONOMY: dict[str, Taxonomy] = {
    '2022-09-20.md': Taxonomy('meta', 'site-meta', 'meta', ('github-pages', 'blogging', 'knowledge-management')),
    '2022-10-26.md': Taxonomy('software-engineering-cs', 'databases', 'study-note', ('database', 'oracle', 'structured-data', 'data-modeling')),
    '2023-06-20.md': Taxonomy('software-engineering-cs', 'data-structures', 'study-note', ('c', 'cpp', 'data-structures', 'glib', 'stl')),
    '2023-06-28.md': Taxonomy('software-engineering-cs', 'algorithms', 'study-note', ('coding-test', 'algorithms', 'time-complexity', 'space-complexity')),
    '2023-07-11-2.md': Taxonomy('software-engineering-cs', 'data-structures', 'study-note', ('priority-queue', 'heap', 'map', 'set')),
    '2023-07-11.md': Taxonomy('software-engineering-cs', 'data-structures', 'study-note', ('linked-list', 'stack', 'queue', 'deque')),
    '2024-01-19.md': Taxonomy('ai-machine-learning', 'machine-learning-foundations', 'study-note', ('machine-learning', 'classification', 'logistic-regression'), 'ml-foundations-evaluation'),
    '2024-06-04-2.md': Taxonomy('software-engineering-cs', 'data-structures', 'study-note', ('graph', 'vertex', 'edge', 'network')),
    '2024-06-04.md': Taxonomy('software-engineering-cs', 'data-structures', 'implementation', ('binary-search-tree', 'tree-traversal', 'c', 'algorithms')),
    '2024-08-09.md': Taxonomy('software-engineering-cs', 'web-development', 'implementation', ('javascript', 'browser-game', 'dom', 'number-baseball')),
    '2025-03-07.md': Taxonomy('health-lifestyle', 'consumer-guides', 'buying-guide', ('uv-protection', 'parasol', 'product-comparison', 'lifestyle')),
    '2025-04-25.md': Taxonomy('ai-machine-learning', 'evaluation-metrics', 'research-report', ('anomaly-detection', 'evaluation-metrics', 'class-imbalance', 'time-series', 'computer-vision'), 'ml-foundations-evaluation', True, 3),
    '2025-05-08.mdx': Taxonomy('ai-machine-learning', 'mathematical-foundations', 'study-note', ('linear-algebra', 'vector-norm', 'matrix-norm', 'regularization'), 'ml-foundations-evaluation'),
    '2025-05-20.md': Taxonomy('health-lifestyle', 'nutrition', 'research-report', ('caffeine', 'sleep', 'cognition', 'neuroscience', 'nutrition')),
    '2025-06-27.md': Taxonomy('health-lifestyle', 'supplements', 'interactive-guide', ('magnesium', 'sleep', 'stress', 'fatigue', 'nutrition')),
    '2025-07-23-2.md': Taxonomy('health-lifestyle', 'supplements', 'interactive-guide', ('omega-3', 'epa', 'dha', 'supplement', 'nutrition')),
    '2025-07-23.md': Taxonomy('health-lifestyle', 'supplements', 'interactive-guide', ('vitamin-b', 'fatigue', 'supplement', 'nutrition')),
    '2025-07-25.md': Taxonomy('vision-perception-neuroscience', 'visual-neuroscience', 'research-report', ('visual-system', 'neuroscience', 'visual-cortex', 'neural-decoding', 'fmri'), 'vision-pose-human-perception'),
    '2025-08-06.md': Taxonomy('health-lifestyle', 'medical-management', 'interactive-guide', ('diabetes', 'blood-glucose', 'nutrition', 'exercise', 'patient-management')),
    '2025-11-08.md': Taxonomy('robotics-embedded', 'robot-learning', 'paper-review', ('robotics', 'reinforcement-learning', 'sim-to-real', 'real-world-robotics'), 'robotics-autonomous-systems', True, 1),
    '2027-01-15.md': Taxonomy('ai-machine-learning', 'ai-systems', 'study-note', ('ai-architecture', 'local-ai', 'gpu', 'development-environment')),
    'ai-consciousness-deep-research-1.md': Taxonomy('ai-machine-learning', 'ai-consciousness', 'research-report', ('consciousness', 'philosophy-of-mind', 'ai-welfare', 'deep-research', 'mechanistic-interpretability'), 'ai-consciousness-governance', True, 1),
    'ai-consciousness-deep-research-2.md': Taxonomy('ai-machine-learning', 'ai-consciousness', 'research-report', ('consciousness', 'mechanistic-interpretability', 'global-workspace', 'causal-intervention', 'ai-welfare'), 'ai-consciousness-governance', True, 2),
    'ai-consciousness-deep-research-3.md': Taxonomy('ai-machine-learning', 'ai-consciousness', 'research-report', ('consciousness', 'ai-governance', 'ai-welfare', 'ethics', 'policy'), 'ai-consciousness-governance', True, 3),
    'alphapose-model.md': Taxonomy('vision-perception-neuroscience', 'human-pose', 'setup-guide', ('alphapose', 'human-pose-estimation', 'wsl', 'cuda', 'pytorch'), 'vision-pose-human-perception'),
    'calibration.md': Taxonomy('vision-perception-neuroscience', 'camera-geometry', 'study-note', ('camera-calibration', 'coordinate-systems', 'intrinsic-parameters', 'extrinsic-parameters'), 'vision-pose-human-perception', True, 4),
    'deep-search-gemini.md': Taxonomy('research-methods-tools', 'deep-research', 'interactive-guide', ('gemini', 'deep-research', 'prompt-engineering', 'research-workflow')),
    'deep-search-travel-prompt.md': Taxonomy('research-methods-tools', 'prompt-engineering', 'interactive-guide', ('gemini', 'deep-research', 'travel-planning', 'constraint-modeling', 'prompt-engineering')),
    'docker.md': Taxonomy('software-engineering-cs', 'development-environment', 'setup-guide', ('docker', 'ros2', 'containerization', 'gui', 'networking')),
    'english-word.md': Taxonomy('vision-perception-neuroscience', 'technical-vocabulary', 'interactive-guide', ('technical-english', 'computer-vision', 'vocabulary', 'quiz')),
    'heap-copy.md': Taxonomy('software-engineering-cs', 'data-structures', 'implementation', ('heap', 'priority-queue', 'c', 'algorithms')),
    'human-forecasting.md': Taxonomy('vision-perception-neuroscience', 'human-motion', 'research-report', ('human-pose-forecasting', 'trajectory-prediction', 'motion-prediction', 'diffusion-models', 'multi-agent'), 'vision-pose-human-perception', True, 2),
    'human-height-estimation.md': Taxonomy('vision-perception-neuroscience', 'human-measurement', 'paper-review', ('human-height-estimation', 'monocular-vision', 'camera-calibration', 'object-detection'), 'vision-pose-human-perception', True, 3),
    'human-pose-estimate.md': Taxonomy('vision-perception-neuroscience', 'human-pose', 'paper-review', ('3d-human-pose-estimation', 'transformer', 'graph-neural-network', 'motion-reconstruction'), 'vision-pose-human-perception', True, 1),
    'linux.md': Taxonomy('software-engineering-cs', 'development-environment', 'setup-guide', ('linux', 'cuda', 'wsl', 'bash', 'development-environment')),
    'modern-artificial-intelligence-2.mdx': Taxonomy('ai-machine-learning', 'machine-learning-foundations', 'study-note', ('machine-learning', 'generalization', 'bayes-classifier', 'support-vector-machine', 'uncertainty'), 'ml-foundations-evaluation', True, 2),
    'mordern-artificial-intelligence.mdx': Taxonomy('ai-machine-learning', 'mathematical-foundations', 'study-note', ('artificial-intelligence', 'linear-algebra', 'probability', 'optimization', 'deep-learning'), 'ml-foundations-evaluation', True, 1),
    'phm.md': Taxonomy('ai-machine-learning', 'industrial-ai', 'implementation', ('predictive-maintenance', 'data-preprocessing', 'pca', 'pandas', 'anomaly-detection'), 'ml-foundations-evaluation', True, 4),
    'python-1.md': Taxonomy('software-engineering-cs', 'python', 'study-note', ('python', 'defaultdict', 'collections', 'data-structures')),
    'python.md': Taxonomy('software-engineering-cs', 'python', 'study-note', ('python', 'variables', 'data-types', 'operators')),
    'raspberry-pi-5.md': Taxonomy('robotics-embedded', 'embedded-systems', 'setup-guide', ('raspberry-pi', 'ubuntu', 'ssh', 'embedded-linux'), 'robotics-autonomous-systems'),
    'ros2-2.md': Taxonomy('robotics-embedded', 'ros2', 'setup-guide', ('ros2', 'ubuntu', 'development-environment', 'dds'), 'robotics-autonomous-systems'),
    'ros2-3.md': Taxonomy('robotics-embedded', 'ros2', 'study-note', ('ros2', 'nodes', 'topics', 'services', 'actions'), 'robotics-autonomous-systems'),
    'ros2.md': Taxonomy('robotics-embedded', 'ros2', 'tutorial', ('ros2', 'robot-software', 'ubuntu', 'opencv', 'pcl'), 'robotics-autonomous-systems', True, 3),
    'slam1.md': Taxonomy('robotics-embedded', 'localization-mapping', 'study-note', ('slam', 'localization', 'mapping', 'sensor-fusion', 'robotics'), 'robotics-autonomous-systems', True, 2),
    'slam2.md': Taxonomy('robotics-embedded', 'localization-mapping', 'study-note', ('slam', 'localization', 'sensor-fusion', 'kalman-filter', 'particle-filter'), 'robotics-autonomous-systems'),
    'soem.md': Taxonomy('robotics-embedded', 'industrial-communication', 'study-note', ('ethercat', 'soem', 'industrial-communication', 'real-time-systems'), 'robotics-autonomous-systems', True, 4),
    'survey-js.md': Taxonomy('software-engineering-cs', 'web-development', 'tutorial', ('surveyjs', 'javascript', 'forms', 'web-development')),
    'venture-global-comprehensive-report.md': Taxonomy('finance-industry', 'energy-investing', 'financial-analysis', ('venture-global', 'lng', 'energy', 'financial-analysis', 'commodity-markets')),
    'vision.mdx': Taxonomy('vision-perception-neuroscience', 'computer-vision-foundations', 'study-note', ('computer-vision', 'deep-learning', 'transformer', 'convolutional-neural-network', 'graph-neural-network'), 'vision-pose-human-perception'),
}

MANAGED_KEYS = (
    "category",
    "subcategory",
    "type",
    "tags",
    "researchArea",
    "researchFeatured",
    "researchOrder",
)

SCALAR_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class TaxonomyError(ValueError):
    """Raised when a post violates the taxonomy contract."""


def post_paths() -> list[Path]:
    return sorted(
        path
        for path in POSTS_DIR.iterdir()
        if path.is_file()
        and path.suffix.lower() in {".md", ".mdx"}
        and not path.name.startswith("_")
    )


def split_frontmatter(text: str, filename: str) -> tuple[list[str], str]:
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        raise TaxonomyError(f"{filename}: frontmatter must start on line 1")

    end = next(
        (index for index in range(1, len(lines)) if lines[index].strip() == "---"),
        None,
    )
    if end is None:
        raise TaxonomyError(f"{filename}: closing frontmatter delimiter not found")

    return lines[1:end], "".join(lines[end + 1 :])


def is_top_level_key(line: str) -> bool:
    return bool(re.match(r"^[A-Za-z][A-Za-z0-9]*\s*:", line))


def remove_managed_keys(frontmatter: Sequence[str]) -> list[str]:
    output: list[str] = []
    index = 0

    while index < len(frontmatter):
        line = frontmatter[index]
        key_match = re.match(r"^([A-Za-z][A-Za-z0-9]*):\s*(.*)$", line.rstrip("\n"))
        if not key_match or key_match.group(1) not in MANAGED_KEYS:
            output.append(line)
            index += 1
            continue

        tail = key_match.group(2).strip()
        index += 1

        # Inline scalars/lists occupy one line. Block values continue until the
        # next unindented top-level key.
        if tail:
            continue

        while index < len(frontmatter) and not is_top_level_key(frontmatter[index]):
            index += 1

    return output


def insertion_index(frontmatter: Sequence[str]) -> int:
    preferred = {"title", "description", "pubDate", "updatedDate", "slug"}
    last = -1
    for index, line in enumerate(frontmatter):
        match = re.match(r"^([A-Za-z][A-Za-z0-9]*):", line)
        if match and match.group(1) in preferred:
            last = index
    return last + 1 if last >= 0 else 0


def taxonomy_block(taxonomy: Taxonomy) -> list[str]:
    lines = [
        f"category: {taxonomy.category}\n",
        f"subcategory: {taxonomy.subcategory}\n",
        f"type: {taxonomy.content_type}\n",
        "tags:\n",
    ]
    lines.extend(f"  - {tag}\n" for tag in taxonomy.tags)
    if taxonomy.research_area is not None:
        lines.append(f"researchArea: {taxonomy.research_area}\n")
    lines.append(
        f"researchFeatured: {str(taxonomy.research_featured).lower()}\n"
    )
    if taxonomy.research_order is not None:
        lines.append(f"researchOrder: {taxonomy.research_order}\n")
    return lines


def normalize_blank_lines(lines: list[str]) -> list[str]:
    output: list[str] = []
    previous_blank = False
    for line in lines:
        blank = line.strip() == ""
        if blank and previous_blank:
            continue
        output.append(line)
        previous_blank = blank

    while output and output[0].strip() == "":
        output.pop(0)
    while output and output[-1].strip() == "":
        output.pop()
    return output


def rewrite_frontmatter(text: str, filename: str, taxonomy: Taxonomy) -> str:
    frontmatter, body = split_frontmatter(text, filename)
    cleaned = remove_managed_keys(frontmatter)
    insert_at = insertion_index(cleaned)

    before = normalize_blank_lines(list(cleaned[:insert_at]))
    after = normalize_blank_lines(list(cleaned[insert_at:]))

    merged: list[str] = []
    merged.extend(before)
    if merged and merged[-1].strip() == "":
        merged.pop()
    merged.extend(taxonomy_block(taxonomy))
    if after:
        if after[0].strip() != "":
            merged.append("\n")
        merged.extend(after)

    merged = normalize_blank_lines(merged)
    return "---\n" + "".join(merged) + "---\n" + body


def strip_quotes(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1]
    return value


def scalar_value(frontmatter: Sequence[str], key: str, filename: str) -> str | None:
    matches = []
    pattern = re.compile(rf"^{re.escape(key)}:\s*(.*?)\s*$")
    for line in frontmatter:
        match = pattern.match(line.rstrip("\n"))
        if match:
            matches.append(strip_quotes(match.group(1)))

    if len(matches) > 1:
        raise TaxonomyError(f"{filename}: duplicate top-level '{key}' fields")
    return matches[0] if matches else None


def tags_value(frontmatter: Sequence[str], filename: str) -> tuple[str, ...]:
    tags: list[str] = []
    index = 0

    while index < len(frontmatter):
        match = re.match(r"^tags:\s*(.*?)\s*$", frontmatter[index].rstrip("\n"))
        if not match:
            index += 1
            continue

        tail = match.group(1).strip()
        if tail:
            if not (tail.startswith("[") and tail.endswith("]")):
                raise TaxonomyError(f"{filename}: inline tags must use [a, b] syntax")
            inner = tail[1:-1].strip()
            if inner:
                tags.extend(strip_quotes(part.strip()) for part in inner.split(","))
            index += 1
            continue

        index += 1
        while index < len(frontmatter):
            item = re.match(r"^\s+-\s+(.+?)\s*$", frontmatter[index].rstrip("\n"))
            if not item:
                break
            tags.append(strip_quotes(item.group(1)))
            index += 1

    if not tags:
        raise TaxonomyError(f"{filename}: tags are required")
    return tuple(tags)


def bool_value(frontmatter: Sequence[str], key: str, filename: str) -> bool | None:
    raw = scalar_value(frontmatter, key, filename)
    if raw is None:
        return None
    lowered = raw.lower()
    if lowered not in {"true", "false"}:
        raise TaxonomyError(f"{filename}: {key} must be true or false")
    return lowered == "true"


def int_value(frontmatter: Sequence[str], key: str, filename: str) -> int | None:
    raw = scalar_value(frontmatter, key, filename)
    if raw is None:
        return None
    if not re.fullmatch(r"[1-9][0-9]*", raw):
        raise TaxonomyError(f"{filename}: {key} must be a positive integer")
    return int(raw)


def validate_taxonomy(filename: str, taxonomy: Taxonomy) -> None:
    if taxonomy.category not in CATEGORY_IDS:
        raise TaxonomyError(f"{filename}: unknown category {taxonomy.category!r}")
    if not SCALAR_PATTERN.fullmatch(taxonomy.subcategory):
        raise TaxonomyError(
            f"{filename}: invalid subcategory {taxonomy.subcategory!r}"
        )
    if taxonomy.content_type not in CONTENT_TYPES:
        raise TaxonomyError(
            f"{filename}: unknown type {taxonomy.content_type!r}"
        )
    if not 2 <= len(taxonomy.tags) <= 5:
        raise TaxonomyError(f"{filename}: expected 2-5 semantic tags")
    if len(set(taxonomy.tags)) != len(taxonomy.tags):
        raise TaxonomyError(f"{filename}: duplicate tags")
    for tag in taxonomy.tags:
        if not SCALAR_PATTERN.fullmatch(tag):
            raise TaxonomyError(f"{filename}: invalid tag {tag!r}")
        if tag in STRUCTURAL_TAGS:
            raise TaxonomyError(
                f"{filename}: structural value {tag!r} cannot be a semantic tag"
            )
    if taxonomy.research_area is not None and taxonomy.research_area not in RESEARCH_AREAS:
        raise TaxonomyError(
            f"{filename}: unknown research area {taxonomy.research_area!r}"
        )
    if taxonomy.research_featured:
        if taxonomy.research_area is None:
            raise TaxonomyError(
                f"{filename}: featured research posts require researchArea"
            )
        if taxonomy.research_order is None or taxonomy.research_order < 1:
            raise TaxonomyError(
                f"{filename}: featured research posts require positive researchOrder"
            )
    elif taxonomy.research_order is not None:
        raise TaxonomyError(
            f"{filename}: non-featured posts cannot define researchOrder"
        )


def taxonomy_from_frontmatter(text: str, filename: str) -> Taxonomy:
    frontmatter, _ = split_frontmatter(text, filename)
    category = scalar_value(frontmatter, "category", filename)
    subcategory = scalar_value(frontmatter, "subcategory", filename)
    content_type = scalar_value(frontmatter, "type", filename)
    research_area = scalar_value(frontmatter, "researchArea", filename)
    research_featured = bool_value(
        frontmatter, "researchFeatured", filename
    )
    research_order = int_value(frontmatter, "researchOrder", filename)

    if category is None:
        raise TaxonomyError(f"{filename}: category is required")
    if subcategory is None:
        raise TaxonomyError(f"{filename}: subcategory is required")
    if content_type is None:
        raise TaxonomyError(f"{filename}: type is required")
    if research_featured is None:
        raise TaxonomyError(f"{filename}: researchFeatured is required")

    taxonomy = Taxonomy(
        category=category,
        subcategory=subcategory,
        content_type=content_type,
        tags=tags_value(frontmatter, filename),
        research_area=research_area,
        research_featured=research_featured,
        research_order=research_order,
    )
    validate_taxonomy(filename, taxonomy)
    return taxonomy


def check_manifest_coverage(paths: Iterable[Path]) -> None:
    actual = {path.name for path in paths}
    expected = set(POST_TAXONOMY)
    missing = sorted(expected - actual)
    unmapped = sorted(actual - expected)
    messages = []
    if missing:
        messages.append("manifest entries with no file: " + ", ".join(missing))
    if unmapped:
        messages.append("post files missing from manifest: " + ", ".join(unmapped))
    if messages:
        raise TaxonomyError("; ".join(messages))


def apply(write: bool) -> int:
    paths = post_paths()
    check_manifest_coverage(paths)

    changed: list[str] = []
    errors: list[str] = []

    featured_orders: dict[tuple[str, int], str] = {}

    for path in paths:
        expected = POST_TAXONOMY[path.name]
        try:
            validate_taxonomy(path.name, expected)
            text = path.read_text(encoding="utf-8")
            normalized = rewrite_frontmatter(text, path.name, expected)

            if write:
                if normalized != text:
                    path.write_text(normalized, encoding="utf-8")
                    changed.append(path.name)
                actual = taxonomy_from_frontmatter(normalized, path.name)
            else:
                actual = taxonomy_from_frontmatter(text, path.name)
                if actual != expected:
                    errors.append(
                        f"{path.name}: taxonomy differs from canonical manifest\n"
                        f"  expected={expected}\n"
                        f"  actual={actual}"
                    )

            if actual.research_featured:
                assert actual.research_area is not None
                assert actual.research_order is not None
                key = (actual.research_area, actual.research_order)
                previous = featured_orders.get(key)
                if previous is not None:
                    errors.append(
                        f"duplicate researchOrder {actual.research_order} in "
                        f"{actual.research_area}: {previous}, {path.name}"
                    )
                featured_orders[key] = path.name
        except TaxonomyError as exc:
            errors.append(str(exc))

    if errors:
        print("Taxonomy validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    mode = "updated" if write else "verified"
    print(f"Taxonomy {mode}: {len(paths)} posts")
    if changed:
        for filename in changed:
            print(f"- {filename}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true", help="rewrite canonical frontmatter")
    mode.add_argument("--check", action="store_true", help="verify canonical frontmatter")
    args = parser.parse_args()
    return apply(write=args.write)


if __name__ == "__main__":
    raise SystemExit(main())

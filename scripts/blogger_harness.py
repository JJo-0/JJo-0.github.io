"""A small, safe publishing harness for the JJo Blogger site.

Usage:
  python blogger_harness.py validate path/to/article.html
  python blogger_harness.py publish path/to/article.html --publish
  python blogger_harness.py update path/to/article.html --post-id POST_ID --publish

`validate` never changes Blogger. `publish` requires the explicit --publish
flag and prints the public URL after Blogger accepts the post.
"""

from __future__ import annotations

import argparse
import html
import re
import sys
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

BLOG_ID = "479480592636277136"
TOKEN_PATH = Path.home() / "Library" / "Application Support" / "JJoBlogger" / "token.json"
SCOPES = ["https://www.googleapis.com/auth/blogger"]
TRUSTED_IFRAME_HOSTS = {"www.youtube-nocookie.com", "www.youtube.com"}


@dataclass(frozen=True)
class Article:
    title: str
    labels: list[str]
    content: str
    links: list[str]


class ArticleHTMLInspector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.images: list[str] = []
        self.issues: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag in {"script", "object", "embed", "form"}:
            self.issues.append(f"Reader HTML may not contain <{tag}>.")
        if tag == "iframe":
            host = urlparse(attributes.get("src") or "").netloc.lower()
            if host not in TRUSTED_IFRAME_HOSTS:
                self.issues.append("Only official YouTube embeds are allowed in <iframe>.")
        if tag == "img":
            source = attributes.get("src") or ""
            alt = (attributes.get("alt") or "").strip()
            if urlparse(source).scheme != "https":
                self.issues.append("Every Blogger image must use an absolute https URL.")
            if not alt:
                self.issues.append("Every Blogger image must have non-empty alt text.")
            if source:
                self.images.append(source)
        for name, value in attrs:
            value = value or ""
            if name.lower().startswith("on"):
                self.issues.append(f"Inline event handler {name} is not allowed.")
            if "javascript:" in value.lower():
                self.issues.append("javascript: URLs are not allowed.")
            if name.lower() in {"href", "src"} and value.startswith(("http://", "https://")):
                self.links.append(value)


def extract_article(source: Path) -> Article:
    raw = source.read_text(encoding="utf-8")
    title_match = re.search(r"권장 제목:\s*(.+)", raw)
    labels_match = re.search(r"권장 라벨:\s*(.+)", raw)
    if not title_match:
        raise ValueError("The leading comment must contain '권장 제목:'.")
    title = title_match.group(1).strip().split("\n", 1)[0]
    labels = [label.strip() for label in (labels_match.group(1) if labels_match else "").split(",") if label.strip()]
    content = re.sub(r"<!--.*?-->", "", raw, count=1, flags=re.S).strip()
    inspector = ArticleHTMLInspector()
    inspector.feed(content)
    if inspector.issues:
        raise ValueError("\n".join(inspector.issues))
    if len(inspector.links) < 2:
        raise ValueError("At least two reader-openable source links are required.")
    if len(inspector.images) < 2:
        raise ValueError(f"Blogger requires at least two inline images; got {len(inspector.images)}.")
    if len(set(inspector.images)) != len(inspector.images):
        raise ValueError("Blogger inline images must use distinct sources.")
    if "공식 자료" not in html.unescape(content):
        raise ValueError("Add a reader-facing '공식 자료' source section before publishing.")
    return Article(title=title, labels=labels, content=content, links=inspector.links)


def print_validation(article: Article) -> None:
    print("Validation passed")
    print(f"Title: {article.title}")
    print(f"Labels: {', '.join(article.labels) or '(none)'}")
    print(f"External reader links: {len(article.links)}")
    print("Inline images: validated by the HTML inspector")
    print("Publish requires: python blogger_harness.py publish <file> --publish")


def publish(article: Article, *, draft: bool) -> None:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    credentials = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    service = build("blogger", "v3", credentials=credentials, cache_discovery=False)
    existing = service.posts().list(blogId=BLOG_ID, fetchBodies=False, maxResults=500).execute()
    same_title = [post["url"] for post in existing.get("items", []) if post.get("title") == article.title]
    if same_title:
        raise ValueError(f"Refusing to create a duplicate title. Existing post: {same_title[0]}")
    result = service.posts().insert(
        blogId=BLOG_ID,
        isDraft=draft,
        body={"title": article.title, "labels": article.labels, "content": article.content},
    ).execute()
    state = "Draft created" if draft else "Published"
    print(f"{state}: {result['url']}")


def update(article: Article, *, post_id: str, draft: bool) -> None:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    credentials = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    service = build("blogger", "v3", credentials=credentials, cache_discovery=False)
    existing = service.posts().get(blogId=BLOG_ID, postId=post_id).execute()
    if draft:
        raise ValueError("Blogger does not support changing an existing post to draft through this update path.")
    result = service.posts().update(
        blogId=BLOG_ID,
        postId=post_id,
        body={"title": article.title, "labels": article.labels, "content": article.content},
    ).execute()
    print(f"Published post updated: {result.get('url', existing.get('url', post_id))}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate and publish Blogger HTML safely.")
    parser.add_argument("command", choices=("validate", "publish", "update"))
    parser.add_argument("source", type=Path)
    parser.add_argument("--publish", action="store_true", help="Required for the publish command.")
    parser.add_argument("--draft", action="store_true", help="Create a Blogger draft instead of a public post.")
    parser.add_argument("--post-id", help="Required when updating an existing Blogger post.")
    args = parser.parse_args()
    try:
        article = extract_article(args.source)
    except (OSError, ValueError) as error:
        print(f"Validation failed: {error}", file=sys.stderr)
        raise SystemExit(1)
    print_validation(article)
    if args.command in {"publish", "update"}:
        if not args.publish:
            print("Refusing to change Blogger without --publish.", file=sys.stderr)
            raise SystemExit(2)
        try:
            if args.command == "publish":
                publish(article, draft=args.draft)
            elif not args.post_id:
                print("Updating requires --post-id.", file=sys.stderr)
                raise SystemExit(2)
            else:
                update(article, post_id=args.post_id, draft=args.draft)
        except ValueError as error:
            print(f"Blogger change blocked: {error}", file=sys.stderr)
            raise SystemExit(3)


if __name__ == "__main__":
    main()

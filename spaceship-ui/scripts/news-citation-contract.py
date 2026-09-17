"""Audit the built NEWS roster and native citation links; no network or runtime rewrite."""
from collections import Counter
from dataclasses import dataclass, field
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import json
import re

UI = Path(__file__).resolve().parents[1]
MARKER = re.compile(r'\[(\d+(?:\s*[,–-]\s*\d+)*)(?:,\s*[A-Za-z][^\]\n]*)?\]')
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
BLOCK = {'p', 'li', 'div', 'section', 'article', 'h1', 'h2', 'h3', 'h4', 'td', 'th', 'figcaption'}
SKIP = {'code', 'pre', 'script', 'style', 'math'}


@dataclass
class Node:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def text(self):
        return ''.join(c.text() if isinstance(c, Node) else c for c in self.children)


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = Node('root')
        self.stack = [self.root]
        self.feed(text)
        self.close()

    def handle_starttag(self, tag, attrs):
        assert len(attrs) == len(dict(attrs)), f'duplicate HTML attribute: {tag}'
        node = Node(tag, dict(attrs))
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def unlinked_markers(article):
    """Track text positions: a partially linked [1, 2] cannot hide its bare 2."""
    chunks, ranges = [], []
    offset = 0

    def add(text, anchor):
        nonlocal offset
        chunks.append(text)
        ranges.append((offset, offset + len(text), anchor))
        offset += len(text)

    def visit(node, anchor=None):
        if node.tag in SKIP or 'katex' in node.attrs.get('class', '').split():
            add(' ', None)
            return
        if node.tag == 'a':
            anchor = node
        if node.tag in BLOCK or node.tag == 'br':
            add('\n', None)
        for child in node.children:
            if isinstance(child, Node):
                visit(child, anchor)
            else:
                add(child, anchor)
        if node.tag in BLOCK:
            add('\n', None)

    visit(article)
    text = ''.join(chunks)
    bare = []
    for match in MARKER.finditer(text):
        for number in re.finditer(r'\d+', match[1]):
            start, end = match.start(1) + number.start(), match.start(1) + number.end()
            covered = [(a, b, node) for a, b, node in ranges if a < end and b > start]
            if not covered or any(node is None or not node.attrs.get('href') or node.attrs['href'] == '#' for _, _, node in covered):
                bare.append(match[0])
                break
    return bare


def audit_html(text, expected=None):
    tree = Document(text).root
    bases = [n.attrs.get("href", "") for n in tree.walk() if n.tag == "base"]
    if bases:
        assert len(bases) == 1 and bases[0].startswith("/posts/") and len(bases[0]) > 7, "article fragment base must not target site root"
    articles = [n for n in tree.walk() if n.tag == 'article']
    assert len(articles) == 1, f'expected one article, found {len(articles)}'
    article = articles[0]
    all_nodes = list(tree.walk())
    nodes = list(article.walk())
    ids = Counter(n.attrs['id'] for n in all_nodes if 'id' in n.attrs)
    for name, count in ids.items():
        assert count == 1, f'duplicate target id: {name}'
    bare = unlinked_markers(article)
    pending = expected and expected['state'] == 'pending'
    if pending:
        assert len(bare) == expected['baselineBareMarkers'], 'pending article changed; do not expand migration exception'
    else:
        assert not bare, f'unlinked numeric citations: {bare}'
    for n in nodes:
        if n.tag == 'a' and n.attrs.get('href', '').startswith('#'):
            fragment = unquote(n.attrs['href'][1:])
            assert fragment and ids[fragment] == 1, f'missing fragment: {n.attrs["href"]}'
    citations = [n for n in nodes if 'data-news-citation' in n.attrs]
    references = [n for n in nodes if 'data-news-reference' in n.attrs]
    for node in citations:
        number = node.attrs['data-news-citation']
        assert re.fullmatch(r'[1-9]\d*', number or ''), 'invalid citation number'
        assert node.tag == 'a' and node.attrs.get('href') == '#news-ref-' + number, 'citation destination mismatch'
        assert re.fullmatch(r'\[?' + re.escape(number) + r'(?:,\s*[A-Za-z][^\]]*)?\]?', node.text()), 'citation label mismatch'
        assert node.attrs.get('aria-label') and node.attrs.get('target', '_self') == '_self', 'citation accessibility/navigation mismatch'
        targets = [r for r in references if r.attrs.get('id') == 'news-ref-' + number]
        assert len(targets) == 1 and targets[0].attrs['data-news-reference'] == number, 'reference mapping mismatch'
    for node in references:
        number = node.attrs['data-news-reference']
        assert re.fullmatch(r'[1-9]\d*', number or ''), 'invalid reference number'
        assert node.tag == 'a' and node.attrs.get('id') == 'news-ref-' + number, 'reference ID mismatch'
        url = urlsplit(node.attrs.get('href', ''))
        assert url.scheme == 'https' and url.netloc and not url.username and not url.password, 'invalid source URL'
        assert node.attrs.get('target') == '_blank' and {'noopener', 'noreferrer'} <= set(node.attrs.get('rel', '').split()), 'unsafe external navigation'
    if expected and not pending:
        assert Counter(n.attrs['data-news-citation'] for n in citations) == Counter(expected['citationCounts']), 'missing/extra inline citation'
        assert {n.attrs['data-news-reference'] for n in references} == {str(r['number']) for r in expected['references']}, 'missing/extra reference'
        for row in expected['references']:
            matched = [n for n in references if n.attrs['data-news-reference'] == str(row['number'])]
            assert len(matched) == 1 and matched[0].attrs['href'] == row['url'], 'wrong source identity'
            assert matched[0].text() == row.get('label', row['baselineLabel']), 'reference label changed'
    return {'bareMarkers': len(bare), 'citations': len(citations), 'references': len(references)}


def restored_source(source, row):
    refs = {str(r['number']): r for r in row['references']}

    def restore(m):
        kind, num, content = m[1], m[2], m[3]
        return refs[num]['baselineLabel'] if kind == 'reference' else content

    source = re.sub(r'<a\b[^>]*\bdata-news-(citation|reference)="(\d+)"[^>]*>(.*?)</a>', restore, source, flags=re.S)
    for edit in row['editorialEdits']:
        assert source.count(edit['after']) == 1, 'source-access note differs from reviewed correction'
        source = source.replace(edit['after'], edit['before'])
    return source


def run(dist, report=None):
    ledger = json.loads((UI / 'site/news-citation-repair-20260916.json').read_text())
    assert ledger['stage'] in ('older', 'complete'), 'unapplied migration'
    repairs = {r['slug']: r for r in ledger['repairs']}
    assert len(repairs) == len(ledger['repairs']) == 16 and ledger['baselineBareMarkers'] == 356
    pending = {s for s, r in repairs.items() if r['state'] == 'pending'}
    assert pending == ({s for s, r in repairs.items() if r['batch'] == 'recent'} if ledger['stage'] == 'older' else set())
    assert not pending or len(pending) == 9
    listing = Document((dist / 'news/index.html').read_text()).root
    slugs = [n.attrs['data-news-card'] for n in listing.walk() if 'data-news-card' in n.attrs]
    assert slugs and len(slugs) == len(set(slugs)), 'empty or duplicate NEWS roster'
    assert set(repairs) <= set(slugs), 'repaired article missing from actual NEWS roster'
    rows = []
    for slug in slugs:
        assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug), 'unsafe NEWS route'
        expected = repairs.get(slug)
        if expected:
            source = (UI / 'site/content/posts' / (slug + '.mdx')).read_text()
            if expected['state'] == 'linked':
                assert sha256(source.encode()).hexdigest() == expected['linkedSha256'], f'{slug}: reviewed link source changed'
                source = restored_source(source, expected)
            assert sha256(source.encode()).hexdigest() == expected['baselineSha256'], f'{slug}: non-link source change'
        result = audit_html((dist / 'posts' / slug / 'index.html').read_text(), expected)
        rows.append({'slug': slug, 'state': 'pending' if slug in pending else 'checked', **result})
    result = {'stage': ledger['stage'], 'newsPosts': len(rows), 'pendingPosts': len(pending),
              'bareMarkers': sum(r['bareMarkers'] for r in rows), 'citations': sum(r['citations'] for r in rows),
              'references': sum(r['references'] for r in rows), 'articles': rows}
    print('news-citation-contract: ' + ('PARTIAL ' if pending else 'PASS ') + json.dumps({k: v for k, v in result.items() if k != 'articles'}))
    if report:
        report.parent.mkdir(parents=True, exist_ok=True)
        report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    return result


if __name__ == '__main__':
    args = argparse.ArgumentParser()
    args.add_argument('--dist', type=Path, default=UI / 'dist')
    args.add_argument('--report', type=Path)
    opts = args.parse_args()
    run(opts.dist, opts.report)

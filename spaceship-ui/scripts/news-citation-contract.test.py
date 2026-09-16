"""Mutation regressions for native numeric reference validation."""
from importlib.util import spec_from_file_location, module_from_spec
from pathlib import Path
import sys
import unittest

path = Path(__file__).with_name('news-citation-contract.py')
spec = spec_from_file_location('news_citation_contract', path)
audit = module_from_spec(spec)
sys.modules[spec.name] = audit
spec.loader.exec_module(audit)


def link(n, label=None):
    return f'<a href="#news-ref-{n}" data-news-citation="{n}" aria-label="참고문헌 {n}">{label or f"[{n}]"}</a>'


def ref(n):
    return f'<a id="news-ref-{n}" href="https://example.org/paper{n}" data-news-reference="{n}" target="_blank" rel="noopener noreferrer">[{n}]</a>'


class CitationContract(unittest.TestCase):
    def setUp(self):
        self.expected = {'state': 'linked', 'citationCounts': {'1': 3, '2': 3},
                         'references': [{'number': n, 'url': f'https://example.org/paper{n}', 'baselineLabel': f'[{n}]'} for n in (1, 2)]}
        self.page = ('<article><p>Claim ' + link(1) + link(2) + '</p><p>Group [' + link(1, '1') + ', ' + link(2, '2') + ']</p><p>'
                     + link(2, '[2, Alignment]') + ' ' + link(1) + '</p><pre>[99]</pre><code>arr[2]</code><span class="katex">[98]</span>'
                     + '<p>' + ref(1) + '</p><p>' + ref(2) + '</p></article>')

    def test_adjacent_grouped_qualified_and_code(self):
        self.assertEqual(audit.audit_html(self.page, self.expected)['citations'], 6)

    def test_bare_marker_is_failure(self):
        with self.assertRaisesRegex(AssertionError, 'unlinked'):
            audit.audit_html(self.page.replace(link(1), '[1]', 1), self.expected)

    def test_half_linked_group_is_failure(self):
        with self.assertRaisesRegex(AssertionError, 'unlinked'):
            audit.audit_html(self.page.replace(link(2, '2'), '2'), self.expected)

    def test_missing_target_is_failure(self):
        with self.assertRaisesRegex(AssertionError, 'missing fragment'):
            audit.audit_html(self.page.replace(ref(2), ''), self.expected)

    def test_duplicate_target_is_failure(self):
        with self.assertRaisesRegex(AssertionError, 'duplicate target'):
            audit.audit_html(self.page.replace('</article>', ref(1) + '</article>'), self.expected)

    def test_wrong_reference_number_is_failure(self):
        with self.assertRaises(AssertionError):
            audit.audit_html(self.page.replace('href="#news-ref-1"', 'href="#news-ref-2"', 1), self.expected)

    def test_wrong_external_source_is_failure(self):
        with self.assertRaisesRegex(AssertionError, 'wrong source'):
            audit.audit_html(self.page.replace('https://example.org/paper1', 'https://example.org/home'), self.expected)

    def test_no_inline_count_loss(self):
        with self.assertRaisesRegex(AssertionError, 'missing/extra inline'):
            audit.audit_html(self.page.replace(link(1), '', 1), self.expected)

    def test_numeric_label_mismatch(self):
        with self.assertRaisesRegex(AssertionError, 'label mismatch'):
            audit.audit_html(self.page.replace('>[2, Alignment]<', '>[1, Alignment]<'), self.expected)

    def test_no_empty_or_javascript_reference(self):
        for url in ('', '#', 'javascript:alert(1)', 'https://a:b@example.org'):
            with self.subTest(url=url), self.assertRaises(AssertionError):
                audit.audit_html(self.page.replace('https://example.org/paper1', url), self.expected)

    def test_spans_do_not_hide_number(self):
        with self.assertRaisesRegex(AssertionError, 'unlinked'):
            audit.audit_html('<article><p>[<em>1</em>]</p></article>')

    def test_working_named_markdown_reference_output_is_not_rewritten(self):
        audit.audit_html('<article><p><a href="https://example.org/paper">Named source</a></p><pre>[1]: url</pre></article>')

    def test_unsafe_external_blank_target(self):
        with self.assertRaisesRegex(AssertionError, 'unsafe external'):
            audit.audit_html(self.page.replace('rel="noopener noreferrer"', 'rel=""'), self.expected)

    def test_pending_is_exact_not_blanket(self):
        with self.assertRaises(AssertionError):
            audit.audit_html('<article>[1][2]</article>', {'state': 'pending', 'baselineBareMarkers': 1})

    def test_missing_roster_article_is_not_empty_success(self):
        with self.assertRaisesRegex(AssertionError, 'expected one article'):
            audit.audit_html('<main>No article</main>')


if __name__ == '__main__':
    unittest.main()

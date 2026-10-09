# NEWS citation repair, 2026-09-16

Production baseline: `995304cdbf317e323f630e5517e3549e4c069def`.
Built NEWS roster: 37 articles; 16 articles had 356 unlinked numeric markers,
including bibliography labels. Batch 1 repairs 7 older articles; batch 2
repairs 9 recent articles. Both PRs require user approval before merging.
No Blogger account or payload changes are included.

Body numbers link to unique source records; source records link to HTTPS
primary destinations. Group punctuation and scientific prose remain intact.
Only two FDA access notes change in batch 2. Reversing links and those two
notes must reproduce the original source SHA256. Image/Blogger seals stay fixed.

All 157 originally authored external URLs were requested. Twenty-three
no-Range rechecks included four additional FDA lookup destinations.
See NEWS_CITATION_HTTP_20260916.json for dated results. An HTTP response
does not imply subscription full-text access or scientific verification.
Empty Dataverse 202 is inconclusive; abuse-detection and 403 are restrictions.
DOE and Blogger responded on recheck. No unrelated substitute is introduced.
FDA's exact official announcement was identified through web reading but
GitHub GET still hit abuse detection followed by 404; both facts are disclosed.
FORS now targets the exact ICML awards article rather than its year index.
Sulfide reference 1 targets the actual paper rather than the topic index.

The original complete browser suite and 240-second guard are unchanged.
Additive static/mutation and native touch/mouse/keyboard/Back tests are
provided. Actual test and PR receipts are tracked on issue #123. This
source document does not claim tests or public deployment already succeeded.

# Paper2Agent NEWS — 2026-09-18

## Scope and base

User supplied `붙여넣은 마크다운(1)(9).md`: selected Paper2Agent story, editorial comparison, MDX and Blogger draft. This change publishes the selected story only. Other shortlisted subjects have no new posts in this change. Base main: `39aa52e4da969149f335ebee158c5a2835be8c74` (Acts #130 included). Do not merge or change educational series PR #129 as a side effect.

Public route: `/posts/2026-09-18-paper2agent-news/`.
The source date is 2026-09-16; post date is 2026-09-18. The input score 96/100 is an editorial ranking, not a confidence or scientific validity probability.

## Source-grounded editing

| Input / issue | Editorial treatment | Primary evidence |
|---|---|---|
| 26 failed papers versus 26 resource-layer papers | Explicitly different corpora. Resource-layer corpus: 13 bioRxiv + 13 Nature papers, 2025. | Nature, Methods / Large-scale evaluation |
| 74/100 and 593/599 | Paper coverage versus conditional tool validation. Tutorial questions come from the 74 successful papers. | Nature, Large-scale evaluation |
| 91.2 vs 80.3 | Same Sonnet 4 baseline; 10.9 percentage points. Relative difference separately computed. | Nature, Large-scale evaluation; independent arithmetic |
| Query $0.20/1.6 min vs $0.38/4.3 min | Query-stage means; construction and maintenance are separate costs. | Nature, Large-scale evaluation |
| 26 resource papers: 34x/15x | Separate experiment from executable queries. | Nature, Large-scale evaluation |
| Scientific discovery | Existing perturbation datasets; ten proposed strategies and human-selected signature-correlation analysis. | Nature, Paper agents collaborate for discovery |
| Version clutter / negative captions | Small source note; panel-by-panel positive explanation of tools/resources/prompts and Scanpy workflow. | arXiv v2 Figures 1 and 4 |
| Generic equation help | Three specific native disclosures: numerator, denominator, subtraction, normalization and numeric steps. | Derived from reported counts/means; not a paper equation reproduction |

Primary sources:
- https://www.nature.com/articles/s41586-026-11044-y (2026-09-16)
- https://arxiv.org/html/2509.06917v2 (2025-10-16)
- https://arxiv.org/abs/2509.06917v2 (first submission 2025-09-08; license/version metadata)
- https://github.com/jmiao24/Paper2Agent (current README fetched 2026-09-18, blob `0f3f7cdc7858a35e52be85fff5395f9df8e2df64`; no upstream code executed)
- https://modelcontextprotocol.io/docs/2026-07-28/learn/server-concepts

Nature indexed article and Methods passages were compared with the user's draft. Direct automated publisher GETs returned HTTP 200 but only a JavaScript client challenge, not the paper. This is recorded as failed direct acquisition; no PDF or supplementary file was independently fetched in this change. Indexed article text access is not equivalent to rerunning the research. No news aggregator is used as the numerical source of truth.

## Original figures

Two arXiv v2 originals, Figure 1 overview and Figure 4 Scanpy, CC BY 4.0. They are explicitly labeled as 2025 preprint figures. The 2026 Nature Figure 4 is a different discovery figure. Full paper PDFs are not republished.

Source acquisition: ops run `35306087497`, artifact `10531780468`, SHA256 `0d9401b444a7ab3b43960e316d8a575e3c3bac384789910395413d6fa58976c3`.
Image conversion: ops run `35306297946`, artifact `10531800615`, SHA256 `19a8aa2890ee5022c17e56186bc0b3bccf7b1463751a529a2c0399fe981e0067`.

Native PNGs were converted to lossless WebP at original dimensions. Decoded RGB pixel equality was asserted. Both complete originals were inspected locally, including panel labels and outputs; visual-review records bind the reviewed image digests. Authors, source, license and changes appear beside each figure. These files are local public assets, not remote image hotlinks.

## Validation and release boundary

`news-20260918-contract.mjs`: native citation mapping, source dates/cohorts, six negative controls, exact image bytes, figure attribution, mathematical parsing, actual prose and source hash. Added to existing content gate without removing or relaxing any prior test. The 7000-character minimum has no upper limit.

`browser-paper2agent.mjs`: one article at 390/1440px and light/dark; two real images and trusted full-size navigation; three topic-specific math disclosures with pointer and real Enter; all four citation destinations with pointer/Enter and Back. Keyboard input is tested with page scripts disabled. Existing full browser and NEWS citation matrix remain unchanged. No native click is repeated to turn a failure into success.

`paper2agent-reading.yml`: additive candidate build and reading evidence; supports an optional deployed base URL for the same checks. All final publication claims must identify the exact tested head, actual merge and Pages run. Source writing or a passing PR check alone is not public deployment.

Blogger HTML is a standalone draft with credited image and full-article link. No Blogger account publication is performed. The previous educational-series feedback, uncommitted final figures, English PR #113 and unresolved intermittent citation issue #128 are outside this post change.

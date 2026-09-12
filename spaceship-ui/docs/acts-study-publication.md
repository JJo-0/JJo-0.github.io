# Acts six-part reading path

## Source and scope

The publication adapts the six user-provided HTML dashboards. The six original Gemini share URLs are stored, in the user-specified mapping, in `src/data/acts-series.json`. Those share documents could not be fetched directly; they are external source links, not mirrored full research documents. The native `<details data-acts-original>` panel is closed by default. No inaccessible Gemini content was invented.

Reading order is explicit and independent of publication timestamps:

1. Whole-book narrative and chapter matrix.
2. Whole-book historiography, archaeology and textual criticism.
3. Whole-book comparative theology and reception history.
4. Acts 1:1–5: Greek and textual/compositional questions.
5. Acts 1:1–5: literary and rhetorical analysis.
6. Acts 1:1–5: social memory, pneumatology and reception.

`ActsShelf.astro` renders the same grouped order in Writing and `/bible`. Future non-series Bible posts remain visible below the series. Every post also uses the existing chronological-within-series navigation via `series.order`.

## Editorial distinctions

These are substantive reading editions, not an assertion that external claims were verified. Claims and scholar attributions are attributed to the supplied source. Editorial cautions are explicitly labeled. The source-specific terminology, major sections, all 19 chapter groupings, 25 evidence cases, 20 Greek glossary entries, 8 boundary models, 15 rhetorical labels and 14 synthesis questions are retained as source-derived material.

Corrections to presentation are disclosed in the articles: 28 chapters are grouped into 19 rows; the historical case array contains A17/B5/C0/D2/E1 rather than the hard-coded chart; the comparative table contains 8 content perspectives rather than 9; certain radar series omit models named in their own descriptions. Unsupported confidence/interest/agency scores are retained only in explanatory details, not presented as measured probabilities. Evidence grade E is never graphed as a low truth score. Religious-group generalizations are narrowed and the editorial change is stated.

## Implementation

No external Tailwind runtime, global Chart.js, inline onclick handlers, untrusted HTML injection, positional modal indexes, or page-wide fixed colors. `StudyTable.astro` renders complete HTML at build time and adds scoped custom-element search/filter/reset with AbortController cleanup across Astro navigation. Native details preserve keyboard and no-JS reading. Actual counts use local CSS token bars. All colors reference the site's paper/ink/green variables including dark-mode overrides.

## Verification

The existing Blog CI is retained. `browser-acts-study-audit.mjs` extends, rather than skips, the full browser smoke matrix: six routes, source mapping, closed-by-default original panels, Enter-key interaction, data filtering and empty/reset behavior, source case lookup after filtering, Astro client transitions, reading order on both shelves, SSR content and 320/390/1440-pixel light/dark layout checks. This document describes coverage; CI results and deployed-site checks determine pass/fail, not this statement.

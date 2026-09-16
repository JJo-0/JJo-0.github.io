# Acts overview dashboard restoration — 2026-09-15

The author asked to preserve the provided dashboard code, not a prose rewrite.
Only the three overview post bodies are replaced. Their frontmatter, canonical
URLs and six-part reading order remain unchanged. Passage articles 4–6,
Writing category notices and current news are outside this patch.

## Exact source snapshot

`src/data/acts-dashboards/part-01.br` through `part-08.br` are consecutive
binary parts of ONE Brotli-compressed UTF-8 JSON object. Its three string values
are the full HTML files approved in the preceding conversation. They contain
all original text, data, chart configurations, tabs and cards with the previously
prepared paper/ink/green skin and functional fixes. Parts are NOT executable
loaders. No third-party request, model call or content generation runs at build time.

`manifest.json` records every part, bundle and HTML SHA256. The loader rejects
missing/reordered/corrupt parts, wrong filenames and modified HTML. The static
Astro endpoint writes the exact HTML into `/assets/interactive/acts-overview-N.html`.
The three existing `/posts/acts-overview-N/` pages now embed those documents,
with a standalone full-window link and native collapsed original-source link.
Only preview chrome is hidden in embedded mode; no source section is removed.
A scoped custom element synchronizes the existing site color/font tokens and
dark theme; observers/listeners are released on Astro navigation.

To inspect or edit the complete sources locally (run from spaceship-ui):

```sh
node scripts/extract-acts-dashboards.mjs .acts-dashboard-preview
```

The archive exists to transfer the large approved files losslessly through the
connector, not to conceal source. Extracted HTML is also directly available in
the deployed static site. The snapshot contains compiled Tailwind CSS (MIT),
a Chart.js 4.4.8 CDN reference (MIT), the original source application code,
and the prepared theme adapter with an explicitly marked offline Canvas fallback.
Existing library copyright comments are retained in the snapshot.

## Source preservation / validation

- Overview 1: seven tabs, five theses, journey cards, full chronology, six summary
  statements, nineteen chapter groups, ten debates, modal and concept map.
- Overview 2: ten tabs, complete Gallio inscription card and four emperor cards,
  city/office cards, twenty-five case studies and modal, variant matrix, voyage
  cards, original doughnut and reliability radar.
- Overview 3: tier switcher, ten turning points, comparative matrix, scholar
  search, fourteen questions, hermeneutics switcher, original radar/doughnut.
- Original numbers are preserved, including source inconsistencies. This is a
  presentation restoration, NOT independent scholarly verification or peer review.
- CDN and fallback engines identify themselves with `data-chart-engine`.
  Tests report the engine actually used rather than equating the two.

`browser-acts-study-audit.mjs` remains wired into the existing CI and deployed
Pages live-smoke. It verifies exact served-source hashes, all six post routes and
ordering, three viewport sizes, both themes, five chart datasets and drawn pixels,
all dashboard tabs, filtered modal identity, native source toggles and client
navigation. Passage-table checks for parts 4–6 are retained. No unrelated CI gate,
workflow, credential or deployment setting is changed.

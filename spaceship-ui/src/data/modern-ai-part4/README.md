# Modern AI Part IV source ledgers

Authoritative source: `5_Ch4-General-purpose gradient-based opt(1).pdf`

- PDF pages: 19
- PDF SHA-256: `23272c39a5ad9c0dddf24eb7d42fdebe8575344f74bac3de761b7844fd81e58c`
- Frozen formula records: 211
  - PDF/source-derived formulas: 188 (88 display + 100 inline)
  - original editorial completion/correction records: 23
- Total display formula records: 110
- Total inline formula records: 101
- Content inventory: 151
  - PDF-source blocks: 109
  - editorial-audit blocks: 20
  - dated research-update blocks: 22
- Figure/table records: 10
- Handwritten-annotation records: 17
- Adversarial-review correction overlay: 9 corrected variants (`MAI-P4-212`–`MAI-P4-220`)

## Files

- `source-audit.json`: render-first extraction evidence and source/editorial/research counts
- `page-ledger.json`: **PDF-source-only** page 1–19 coverage; it excludes editorial formula records and non-source prose
- `content-ledger.json`: stable 151-record content inventory
- `content-provenance.json`: authoritative 109 source / 20 editorial / 22 research reader-layer partition
- `formula-ledger.json`: frozen 211-record transcription ledger with exact TeX, original status, correction linkage, and SHA-256
- `review-corrections.json`: source-SHA-bound adversarial-review overlay; it changes effective reader status without rewriting frozen source TeX

## Separation contract

1. The 2025 lecture reconstruction preserves printed blanks, suspect statements, and exact source TeX.
2. The 23 original editorial completion/correction formulas remain separate records linked by `corrects`.
3. Later adversarial review does **not** mutate the frozen transcription ledger. Nine affected source IDs are downgraded to effective `source-suspect` status through `review-corrections.json`, with nine separate corrected variants.
4. PDF page coverage contains only the 188 source formulas and 109 PDF-source content blocks.
5. The editorial-audit layer (`P4-C110`–`P4-C129`) and dated 2026-08-18 research update (`P4-C130`–`P4-C151`) are explicitly outside PDF source coverage.
6. Part IV display formulas are registered in the formula-lesson inventory. At this source-publication milestone they are explicit `unreviewed` items, never `missing`; exact-ID lesson triage is a separate #38 milestone.

`pnpm modern-ai:part4-check` runs both the source/formula/render audit and the content-provenance audit. It fails closed when source/page coverage drifts, an editorial or research block leaks into PDF coverage, a source/review hash changes, a correction link disappears, Part IV display formulas become `missing`, or rendered IDs/counts diverge.

## Merge boundary

The merge candidate is restacked on the current renderer/Modern-AI/semiconductor mainline. Temporary materialization or repair workflows are not part of the final diff. Source tables that contain `SourceFormula` components use MDX-safe accessible grid markup, Part IV SVG text inherits the active theme color, and the normal repository `Blog CI` remains authoritative.

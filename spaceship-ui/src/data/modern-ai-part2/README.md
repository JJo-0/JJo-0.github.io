# Modern AI Part II source ledgers

Authoritative source: `1_Ch2 Fundamentals of ML.pdf`

- PDF pages: 13
- PDF SHA-256: `c6ac9d80c5ae2bc96f0aa8aec70c126f559e6dd5c36d51a46eb1bdb6775e836c`
- Formula records: 103
- Content records: 241
- Figure records: 7
- Handwritten-annotation records: 7

## Files

- `page-ledger.json`: page 1–13 to content/formula/figure/annotation IDs
- `content-ledger.json`: paragraph, bullet, definition, exercise, caption, reference, and annotation inventory
- `formula-ledger.json`: exact TeX, source page/equation number, editorial status, and SHA-256

Every display formula is rendered as a responsive card with a reader-facing `쉽게 설명` disclosure, reading order, symbol guide, source-location note, and an explicit warning when the source is incomplete or mathematically suspect. Internal ledger IDs remain machine-readable attributes rather than visible headings.

The rendered-output audit verifies all 103 formula IDs, the exact source hashes, and the one-to-one explanation-card contract before publication.

`pnpm modern-ai:part2-check` fails closed when a formula disappears, changes hash, is duplicated, loses its explanation card, or is absent from rendered output.

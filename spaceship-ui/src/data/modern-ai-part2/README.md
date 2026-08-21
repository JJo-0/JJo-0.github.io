# Modern AI Part II source ledgers

Authoritative source: `1_Ch2 Fundamentals of ML.pdf`

- PDF pages: 13
- PDF SHA-256: `c6ac9d80c5ae2bc96f0aa8aec70c126f559e6dd5c36d51a46eb1bdb6775e836c`
- Formula records: 103
- Display-formula calculation guides: 65
- Content records: 241
- Figure records: 7
- Handwritten-annotation records: 7

## Files

- `page-ledger.json`: page 1–13 to content/formula/figure/annotation IDs
- `content-ledger.json`: paragraph, bullet, definition, exercise, caption, reference, and annotation inventory
- `formula-ledger.json`: exact TeX, source page/equation number, editorial status, and SHA-256

## Reader explanation contract

Every display formula is rendered as a responsive source card. A reader-facing explanation may contain a formula-specific derivation, worked example, checks, symbols, or references **only when those items add information specific to that formula**.

Generic fallback walkthroughs are forbidden. A formula with no real derivation must not invent a repeated checklist such as “identify the left-hand side → write dimensions → compute inner parentheses → multiply/sum/normalize → sanity-check.” Such formulas receive only concise context/symbol explanation.

The guide is supplemental: it does not alter `sourceLatex`, formula hashes, source page mappings, source equation numbers, or editorial status. Internal ledger IDs remain machine-readable attributes rather than reader-facing headings.

The rendered-output audit verifies all 103 formula IDs and exact source hashes. Curated derivations such as the normal-equation walkthrough remain explicitly checked, while one-to-one formula→walkthrough/example/check counts are intentionally not required.

`pnpm modern-ai:part2-check` fails closed when a formula disappears, changes hash, is duplicated, loses a specifically required derivation, exposes generic calculation boilerplate, or is absent from rendered output.

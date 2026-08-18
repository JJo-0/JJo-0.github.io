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

## Reader calculation contract

Every display formula is rendered as a responsive card with a reader-facing `쉽게 설명 + 계산 과정` disclosure. Each guide contains:

1. the question answered by the formula;
2. a one-line interpretation;
3. numbered intermediate calculation steps;
4. a concrete numerical worked example;
5. dimensional, sign, range, or assumption checks;
6. symbols that occur in the formula; and
7. curated follow-up references.

The guide is supplemental: it does not alter `sourceLatex`, formula hashes, source page mappings, source equation numbers, or editorial status. Internal ledger IDs remain machine-readable attributes rather than reader-facing headings.

The formula status vocabulary distinguishes `source-exact`, `source-suspect`, `editorially-completed`, and `corrected-variant` expressions so that source preservation and mathematical correction are never silently conflated.

The rendered-output audit verifies all 103 formula IDs, the exact source hashes, and the one-to-one **65 display formulas → 65 calculation guides → 65 worked examples → 65 sanity-check sections** contract before publication.

`pnpm modern-ai:part2-check` fails closed when a formula disappears, changes hash, is duplicated, loses its calculation guide, loses its worked example, or is absent from rendered output.

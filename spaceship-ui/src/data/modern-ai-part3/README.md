# Modern AI Part III source ledgers

Authoritative source: `4_CH4-Backgrounds for AI(1).pdf`

- PDF pages: 15
- PDF SHA-256: `2a3855c52d688a79d38e714ab7ef7223dd7a5bc5b46f8385f55da777aa1c78af`
- Formula records: 163
- Source formula records: 140
- Display-formula calculation guides: 99
- Content records: 308
- Figure/table records: 7
- Handwritten-annotation records: 11
- Formula statuses: {"source-exact": 116, "source-suspect": 24, "editorially-completed": 12, "corrected-variant": 11}

## Files

- `page-ledger.json`: page 1–15 to content/formula/figure/annotation IDs
- `content-ledger.json`: paragraph, bullet, definition, exercise, caption, reference, table, and annotation inventory
- `formula-ledger.json`: exact TeX, source page/equation number, editorial status, correction linkage, and SHA-256

## Source separation contract

The article keeps three layers separate:

1. the 2025 lecture reconstruction;
2. the editorial/mathematical audit;
3. the dated 2026-08-18 research update.

The source layer preserves printed `?`, `??`, blank grids, signed-distance wording, dimension-index inconsistencies, patch-vector notation issues, and typographical artifacts. Completed or corrected expressions are separate records and are moved beside the relevant source item only at reader-render time.

## Reader calculation contract

Every display formula is rendered as a responsive card with `쉽게 설명 + 계산 과정`, a worked example, checks, symbols, and reference-quality follow-up. Formula-specific visuals are governed separately by the exact-ID lesson registry; the retired generic formula-visual runtime must not return. The guide never changes protected `sourceLatex` or its hash.

`pnpm modern-ai:part3-check` fails closed when a page, formula, source block, figure, annotation, correction link, hash, reader guide, or rendered marker disappears or is duplicated.

The production branch stores only the reviewed source tree: no source PDF, encoded payload, materialization workflow, bootstrap workflow, or CI self-modification remains.

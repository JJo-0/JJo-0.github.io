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

## Reader explanation contract

Every display formula is rendered as a responsive source card. Formula-specific derivations, worked examples, checks, symbols, and references are shown only when they materially explain that exact expression. Formula-specific visuals remain governed separately by the exact-ID lesson registry.

Generic calculation walkthroughs are forbidden. Definitions, notation-only expressions, and other formulas without a genuine derivation receive concise context/symbol explanation rather than a repeated five-step calculation checklist. This no-generic-walkthrough rule is the default contract for subsequent Modern AI Parts IV–VIII as well.

The guide never changes protected `sourceLatex` or its hash. `pnpm modern-ai:part3-check` fails closed when a page, formula, source block, figure, annotation, correction link, hash, reader guide, or rendered marker disappears or is duplicated, and also fails if retired generic calculation boilerplate returns.

The production branch stores only the reviewed source tree: no source PDF, encoded payload, materialization workflow, bootstrap workflow, or CI self-modification remains.

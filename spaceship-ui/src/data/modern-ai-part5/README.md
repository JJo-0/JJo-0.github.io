# Modern AI Part V — source acquisition staging

Target source: `5_Ch5-Image classification.pdf`

This directory is **not yet the authoritative Part V source ledger**. It exists to make incomplete acquisition visible and fail closed while the original PDF cannot be fully opened through the current file-retrieval path.

## Known source metadata

- Course: `ECE5992: Modern Artificial Intelligence`
- Instructor: Il Yong Chun
- Lecture date: 2025-03-19
- Expected PDF pages: 18
- Source SHA-256: **pending direct byte access**

## Current acquisition state

- 16 pages have only snippet-level evidence.
- Pages **10** and **14** have no page-specific retrievable evidence and are explicitly `unverified`.
- 0 pages are currently promoted to `rendered-inspected` in this staging ledger.
- `sourceComplete=false`
- `canPublish=false`

Snippet evidence is useful for planning the later transcription but is never accepted as a substitute for rendered-page inspection. Candidate formula fragments in `source-acquisition.json` are **not formula-ledger records** and receive no MAI-P5 IDs until the original page is inspected.

## Promotion rule

Part V may move from acquisition staging to source-complete reconstruction only after all of the following are true:

1. source bytes are accessible and SHA-256 is recorded;
2. every page 1–18 is rendered and inspected;
3. text extraction is cross-checked against the rendered page;
4. all display and meaningful inline formulas are assigned exact `MAI-P5-*` IDs and hashes;
5. every heading, paragraph, bullet, question, table, figure, caption, reference, and readable annotation is inventoried;
6. source-suspect / blank expressions are preserved before any editorial correction;
7. page/formula/content ledgers cover the same source-only set exactly;
8. the dated 2026-08-18 research-update layer remains outside PDF source coverage.

`node scripts/modern-ai-part5-acquisition-audit.mjs` validates the current inventory structure. `node scripts/modern-ai-part5-acquisition-audit.mjs --require-complete` is intentionally fail-closed until the conditions above are satisfied.

<!-- materialize-trigger: source-complete-payload-v1 -->

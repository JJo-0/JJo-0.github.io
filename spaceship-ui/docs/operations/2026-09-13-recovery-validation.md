# Recovery and integration validation — 2026-09-13

Tracking issue #112; implementation PR #113; full localization scope #10.

## Verified recovery

- Restore workflow run `34737963227` succeeded.
- Real source and seven exact original figures exist at commit `24372183fb283409681a62909fb3470b6818e53d`.
- The original ten partial transport pieces plus four checksum-pinned suffix pieces were reconstructed as data. Full diff SHA256: `579a2cbe2b7145d0151605a2c57a7ae482acff7fb7a841ca758008be222874be`.
- Four missing newline-at-end-of-file separators in the recovered unified diff were normalized to valid patch syntax. Local application matched every one of the 76 expected text-file hashes. Seven raster files were regenerated from exact original PDFs; all expected dimensions and output SHA256 matched.
- Local translation, NEWS-depth, taxonomy and taxonomy-manifest checks passed. These do not replace a full Astro build or human meaning review.

## Integrated concurrent changes

Commit `b73c6453515b7ff07e9054549716b19937a48f1c` includes current main `c51e6a797f865a40a572f89c7273f6bbac022684`. Its Blogger equation article/renderer/check and browser hash-target readiness fix were retained. The `blogger:equation-check` package command remains in content checks. No force push or main reset was used.

Temporary source snapshots, original-source fetch workflows, patch transport, and integration helpers were removed from the resulting source tree. Production does not depend on an Actions artifact or local chat file.

## Next gate

The bot-originated CI run `34738093037` requested action rather than executing tests; it is not a passing CI result. This checked-in progress record also triggers the normal PR workflow through the authorized repository connection. Follow the newest PR head and its own workflow results; do not reuse success from a previous head.

Before merge: complete lint/type/build/SEO/content/browser tests, review translated meaning and source limitations, resolve genuine review findings, update the resume ledger, and then check deployment. All failures and fixes should be appended to #112 or the PR.

## Explicitly incomplete

Four English articles are the first batch, not full site localization. AI Consciousness I–III and interactive experiences remain in #10. Search Console indexing needs external account evidence. Blogger publication, AdSense activation, analytics permissions and unrelated issues are unchanged.

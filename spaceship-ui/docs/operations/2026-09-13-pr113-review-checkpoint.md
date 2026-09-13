# PR #113 review checkpoint — 2026-09-13

Tracking: #112. Full English project: #10. Branch: `content/news-depth-english-20260912`.

## Durable source state

The twenty expanded Korean NEWS articles, four English translations, locale implementation and seven original raster figures are real repository files. Recovery and main integration are complete. No temporary transport or acquisition workflow remains in the intended diff. Concurrent main `c51e6a797f865a40a572f89c7273f6bbac022684` and its Blogger equation/browser fixes were preserved.

## Content and translation review

All twenty revised NEWS satisfy the stated 7,000–10,000-character prose count and source-body hashes. The original eight longer NEWS and older non-NEWS posts are not silently truncated or padded. See `site/news-depth-review-20260913.json` for individual counts and previous/revised hashes.

The four English explainers were read as complete articles, including their sources. Review focused on preserving the Korean meaning rather than treating length/heading/hash parity as semantic proof:

- Human embryos: early laboratory development is not clinical pregnancy/birth evidence; a target-allele result is not genome-wide safety; mosaicism, off-target/bystander editing, mRNA-specific conditions and disclosed interests remain explicit.
- High-NA: 0.33/0.55 optical comparison is conditional; 2030/2031/2033 refer to different intended milestones, not completed manufacturing; 2024 background photographs are not a 2026 large-mask prototype.
- Sulfide film: actual Figure 2/5 and reported cell conditions remain distinguished from hypothetical resistance examples; the 50 mAh, 2 MPa test is not an EV pack; 83% capacity retention is not energy efficiency; raw-data/supplement limitations remain.
- Lithium–sulfur: theoretical 50% electron-count change and reported 58% capacity change are not conflated; electrode-level 1,700 Wh/kg is not pack-level; public abstract/Figure 1 and institute statements are not presented as complete main-text validation.

This editorial review is not independent experimental replication. Primary-source fetch outcomes and hashes are retained in `site/news-depth-sources-20260913.json`. Not every source was fully accessible. English captions distinguish original figures from author-created explanatory graphics; original rights remain unchanged.

## Evidence-driven code fixes

| Commit | Evidence / fix |
| --- | --- |
| `5509493` | CI 34738129858 caught invalid Astro markup in EnglishPostList. Prepare cards in frontmatter and use expression-only markup. Use credited NewsFigure cards rather than uncredited raw image elements. |
| `fc79ed4` | Validate original media ID before locale object spread, so unknown media cannot become a truthy empty object. |
| `439e55f` | CI 34738320978 passed build then caught an obsolete exact Search marker. Require load-time Search with explicit language; continue rejecting deferred hydration and retain all size budgets. |
| `4a793fb` | CI 34738462056 reached the old release-date assertion. Keep original September 11 publication date, but validate updatedDate as a real ISO date no earlier than original authorization rather than permanently freezing it to September 12. |

The date guard was mutation-tested locally: a valid later update passes; February 30 and a date before original authorization are rejected. Image order, exact prose counts and evidence-stage checks are unchanged.

At this checkpoint, run **34738613097** on head **4a793fb0782bd81691012a7d0fd93c6f1ee0cfa8** passed taxonomy, lint, type, SEO, build and the complete content check; browser smoke was still running. This document does not claim final CI or deployment success. Its commit creates a newer head; verify the new head's checks rather than reusing the earlier run.

## Resume next

1. Read the latest PR #113 and issue #112 comments and current remote heads.
2. Check the newest complete CI including browser translation/image/language-switch tests; resolve any findings with narrow fixes.
3. Verify final diff contains no temporary transfer workflows and no overwritten concurrent source.
4. Merge only the reviewed green head and separately verify the Pages deployment and public English routes.
5. Leave #10 open for the remaining archive, AI Consciousness I–III/interactive English versions and Search Console indexing; record exact completed first-batch coverage.

Blogger publication, advertising enablement and external account permissions are unchanged. Search-engine indexing is not inferred from build success.

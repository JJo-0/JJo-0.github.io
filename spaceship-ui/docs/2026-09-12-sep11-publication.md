# 2026-09-12: September 11 publication and Blogger handoff

The user authorized publication of the three September 11 drafts and requested an update to Blogger publication.

## GitHub scope

Only the three September 11 posts change from draft to published. Their original pubDate remains 2026-09-11; updatedDate is 2026-09-12. All five original figures, captions, rights, equations and evidence limitations remain. Draft-state wording and unused editorial comments are removed. Explicit strong elements prevent the literal Markdown emphasis regression previously found during September 12 publication. One obsolete statement about not having examined the solid-electrolyte manuscript was corrected to reflect the earlier Figure 2/5 inspection, without claiming full supplementary-data validation.

Body counts including spaces, excluding references/imports/components/Markdown markers: embryo 7,459; High NA 7,737; solid electrolyte 8,729 characters.

The three newly public articles have explicit original-figure ID sets of 2/1/2. Browser checks require all those images exactly once and check NEWS cards at 390px and 1440px. Existing September 9 and September 12 educational-diagram requirements remain unchanged. Original image bytes and provenance are not modified. No advertising or account configuration is changed.

## Blogger status — not published

Plugin discovery found no available Blogger connection. The existing scripts/blogger_harness.py requires a local Mac OAuth file; this environment cannot access that login. No private Blogger drafts, scheduled posts or account permissions have been read. No Blogger write was attempted, so duplication cannot yet be ruled out from an authenticated inventory.

The downloadable handoff prepared in the chat contains four independent introductory HTML explainers, eight original teaching PNGs, public-article link targets, offline checks and a guarded local batch publisher. Blogger prose lengths are 1,866 / 1,790 / 1,961 / 2,164 characters. These diagrams do not reproduce publisher/IOCB artwork or NC-ND figures for an advertising-supported context.

The eight new Blogger PNGs are in the handoff only, not in this PR and not yet hosted. Their planned HTTPS image paths must be deployed (or replaced with actual uploaded Blogger image URLs) before publishing. The batch helper checks the original page canonical and PNG responses before any write and will stop while assets are unavailable. Local OAuth is also required. The helper defaults to offline validation, refuses duplicate/ambiguous/scheduled matches, paginates authenticated inventory, uses conditional updates, and verifies the final LIVE result. Its nine offline tests do not substitute for an authenticated end-to-end publication test.

## Execution boundary

A temporary bulk apply helper was blocked by the tool security layer and was not installed or retried. The approved article and test updates were instead made directly as reviewed text-file edits through the ordinary repository contents API. No temporary execution workflow is included. The unused graphics generator briefly added to the branch was removed and retained only in the handoff.

No unrelated PR, issue, source ledger, existing public article or site style is changed. CI and Pages deployment success must be read from the exact final PR head and deployment run, not inferred from this record.

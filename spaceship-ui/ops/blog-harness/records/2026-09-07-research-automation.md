# 2026-09-07 Frontier One publication record

User-approved scope: publish the September 7 OpenAI research-automation article to JJo GitBlog NEWS. Do not publish other drafts or to Blogger/Instagram, and do not change scheduled tasks.

Edition date: 2026-09-07. Original OpenAI report: 2026-09-06. Actual publication preparation and source recheck: 2026-09-10. Article explicitly distinguishes these dates and corporate self-reporting from peer review.

## Evidence

- https://openai.com/index/research-acceleration-view-inside-openai/ — Sections 1–3 and Appendix. Confirmed organization-level 3.1 agent-workdays per human workday; eight-hour normalization; the 4–8 hour horizon is estimated human completion time, not agent runtime; intervention rate is conditional on successful tasks; uncertain classifications are omitted; compute availability also grew.
- https://openai.com/index/introducing-codex/ — Historical May 16, 2025 background only. The page explicitly says its product description is outdated; no current pricing or feature promises are inferred.
- https://epoch.ai/gradient-updates/toward-an-onet-for-ai-rnd — June 17, 2026 six-stage taxonomy, Run example, author credits, and explicit attribution-license statement.
- https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ — Historical randomized study, 16 developers, 246 tasks, 19% time increase in the studied early-2025 setting. Not extrapolated to current models or all developers.
- https://metr.org/blog/2026-02-24-uplift-update/ — Follow-up selection effects and time-measurement limitations included alongside the historical result.
- https://openai.com/index/pacing-model-development-cyber-capabilities/ — August 18, 2026 corporate description of a two-week pause and strengthened controls; not described as stopping all research.

## Media rights and roles

1. research-cycle: Epoch AI o-net.png, 1000x754. Authors Jean-Stanislas Denain, Joe Kwon, Anson Ho. Source page explicitly licenses Epoch AI work under CC BY, linking to https://creativecommons.org/licenses/by/4.0/. Commercial reuse and adaptation allowed with attribution; no content modification made. Source, authors, license and change statement rendered by NewsFigure.
2. research-run: Epoch AI aird_onet_sample.png, 1000x654. Same authors, license and attribution. Subjective category ratings explicitly distinguished from probabilities and OpenAI measurements. No content modification made.
3. research-speedup: JJo-generated mathematical plot. No OpenAI graph or third-party artwork copied. Formula S=1/((1-p)+p/s), p in {0.3,0.7,0.9}, s sampled from 1 to 20. All variables dimensionless. Fixed workload, perfect parallelism and zero coordination overhead. SVG has no external fonts, scripts or executable foreign objects. This record does not grant a new license to unrelated user content.

## Mathematical examples

All toy examples are explicitly labeled. 4*6.2/8 = 3.1 is a time-accounting illustration, not recovered raw data. p=.7,s=4 yields 2.1053; adding h=.1 yields 1.7391. Known 60 successes among 80 known outcomes gives 75%; with 20 unknown among 100 total, the possible all-request success fraction is 60–80%, not a confidence interval. Operational productivity/cost formulas are editorial definitions rather than equations attributed to OpenAI.

## Validation boundary

Pre-publication: frontmatter parsed; title 27 characters and description 111 characters; 7 display equations and 3 visible figure components; all figure keys registered; existing taxonomy entries preserved. Required CI/build/browser checks remain enabled. Local full-repository build was unavailable because this execution container could not resolve remote hosts. GitHub Actions is the build and live-browser verification environment. CI success, deployment success and live media verification must be reported separately after reading their actual results.

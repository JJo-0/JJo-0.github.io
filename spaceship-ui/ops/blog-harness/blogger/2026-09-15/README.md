# 2026-09-15 Blogger payloads

Status: **prepared and structurally validated; not published to Blogger**.

`nanopore.html`, `apoe.html`, `mos2.html` are image-first independent short explainers. Each uses two distinct locally hosted CC BY 4.0 historical background figures, explicit original-source/rights captions, the new paper link and the corresponding GitHub full article link. The caption says the displayed image is NOT the new 2026 result image.

Before publishing, confirm the GitHub Pages articles and images return HTTP 200. Run the authenticated existing `scripts/blogger_harness.py validate <file>` followed by `publish <file> --publish` only with the user's authorized Blogger credentials. Record actual returned URLs in issue #117. Do not mark external publication complete from prepared HTML alone. The current chat environment does not have the user's local Mac OAuth token.

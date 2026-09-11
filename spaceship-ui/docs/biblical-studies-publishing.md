# Biblical Studies publishing

Writing category: `biblical-studies`. The archive at `/bible/` and category at `/posts#biblical-studies` remain visible when there are no published research posts.

The public declaration is `/notices/2026-09-11-biblical-studies-and-policies/`. It is linked prominently from Writing, the Bible archive, reader notices and the footer. Policies are regular static Markdown pages rendered through `PolicyLayout.astro`; they are not research posts and do not belong in the post taxonomy manifest or News feed.

## New research posts

Follow `docs/post-authoring.md`. Set `category: biblical-studies`, a meaningful kebab-case subcategory, a supported type and 2-5 semantic tags. Register the filename and taxonomy in `scripts/normalize_tags_current.py`. Set `researchFeatured: false` unless an appropriate research-area policy is intentionally established. Never put unverified research into the archive solely to make its post count nonzero.

## Reader disclosures

`ContentNotice.astro` renders the category-specific note before each post. It distinguishes the author's personal position from church, denomination and institution positions, and links the reading guide and common policies. Keep the public declaration separate from verification of any individual research article.

## Content boundaries

Preserve the author's supplied theological position. Distinguish biblical text, quoted scholarship, competing readings and the author's conclusions. Do not replace the supplied study's arguments without documenting the editorial change. Disclose primary-source access limits and exact versions used.

Do not present AI self-review as independent peer review or illustrative numerical scores as measured probabilities, scholarly vote shares, manuscript confidence probabilities or historical audience measurements. Identify a basis and interpretation for every numeric graphic, or replace it with a qualitative explanation.

The three uploaded Acts 1:1-5 HTML dashboards are not published by this change. Their citations, manuscript details, claims, charts, translation rights and JavaScript require a separate content review. The public notices do not certify them.

## Verification

Check taxonomy, lint, types, SEO metadata, build, rendered links, sitemap and category routes. Run the normal repository CI without weakening or skipping existing gates. This change adds no browser dependency, inline analytics or tracking-consent implementation; the policy text does not claim privacy compliance certification.

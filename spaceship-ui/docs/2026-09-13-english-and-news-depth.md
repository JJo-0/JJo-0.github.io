# 2026-09-13: English foundation and NEWS depth review

## Scope and status

Requested: implement real English content and search-engine language relationships, and research/expand short NEWS to 7,000–10,000 Korean prose characters with source images.

Base main: `5c07acd69fe8d569ed5c7cea9895794ff8400973`.

Twenty of 28 NEWS articles were under the requested length. All twenty now meet the range under the explicit count method in `site/news-depth-review-20260913.json`. The eight already-long NEWS and non-NEWS legacy posts are not blindly padded or truncated. Source dates and Korean public URLs remain unchanged. This is not a claim that every article on the entire site is 7,000–10,000 characters.

## Research and illustrations

- Original source and linked supplementary documents were downloaded in the preceding research run. Access outcomes and exact document hashes are retained in `site/news-depth-sources-20260913.json`; that historical snapshot was obtained September 12. Current editorial review is September 13.
- Accessible main texts, method/results/limitations and relevant captions were consulted for article-specific expansions. Abstract-only or inaccessible main-text cases retain explicit limits; fetching a supplementary file is not claimed as independent replication or review of every raw dataset.
- Seven additional complete original figures and their captions were visually checked and locally stored: CLEAR-EC, HugCL, solar-blind detection, MnTe, DLCatalysis, GLUD1 and CHORUS. Existing representative photos and explanations remain. No synthetic graph is passed off as experimental data.
- `provenance.json` records PDF hash, page, extraction rectangle, resulting dimensions, image hash and rights. CC BY-NC-ND and other original terms remain; no blanket advertising/commercial reuse license is asserted.
- Specific limitations distinguish cell/mouse/clinical stages, single-arm comparisons from randomized controls, full-cell/pack claims from component values, and correlation from proposed mechanisms. The source material does not authorize stronger claims just because the post is longer.

## Four complete English translations

The first end-to-end batch is the three September 11 long-form explainers and the September 12 lithium–sulfur explainer. Their paragraphs, headings, tables, equations, evidence caveats, source links and original images were translated rather than summarized. Translation identities and reviewed source/target body hashes are in `site/translations.json`. English captions are explicit, and text within the two author-created sulfur diagrams has English versions. English About translates the existing profile, without inventing updated biographical facts.

The rest of the Korean archive, AI Consciousness Parts I–III and their interactive experiences are **not** claimed translated. Issue #10 stays open. No nonexistent English links are generated.

## Architecture

- Korean `/posts/...` URLs stay unchanged; real English articles are `/en/posts/.../`.
- `/en/`, `/en/news/`, `/en/posts/`, `/en/about/`, `/en/rss.xml` and `/en/api/search.json` use actual English content.
- Existing `lang` and `translatedPosts` are reused. `translationKey` adds stable pairing; declared but unavailable/non-reciprocal targets fail the build.
- Paired pages contain reciprocal `ko-KR`, `en` and Korean `x-default` alternate links with language-specific self canonicals. Static language-switch anchors are crawler-readable.
- Default collection reads remain Korean; English and all-language reads are explicit. English pages are not duplicated under Korean post URLs or silently mixed into Korean RSS/search.
- English shared navigation/footer, article notices, comments locale, captions, About, search and explicit `/en/404/` are present. The host's generic fallback 404 and legal pages are not claimed fully localized; links to Korean policies are labelled as such.
- No geolocation redirect, external translation proxy, analytics/advertising changes, account writes or Blogger publication.

## Validation

`translation-contract.mjs`: exact source/translation hashes, pairing reciprocity, heading/table/formula/image/link structure, translated captions and author-owned SVG text.

`translation-rendered-contract.mjs`: built-page self canonicals, reciprocal language metadata, language/OG/inLanguage, sitemap, real routes, language-isolated RSS/search and OG asset existence.

`news-depth-contract.mjs`: all twenty reviewed prose lengths and body hashes, seven real local image hashes/signatures, and traceable revisions of the older cover-only body baselines.

`browser-translation-audit.mjs`: four English articles, original-image decoding, Korean language-switch navigation and no overflow at 390/1440px. Existing published-image and original-series contracts remain enabled.

The existing cover-only checksum baselines for sixteen intentionally expanded September 5–8 articles are updated to their new reviewed bodies. Old and revised hashes are recorded in the depth ledger; checks are not removed. Existing Korean technical equations are retained. No broad parser bypass or disabled CI gate is used.

Local source checks are possible; full dependency installation/build/browser execution requires GitHub Actions because this container cannot resolve external domains. The final PR and Actions state—not this planning document—are the evidence for successful build, merge and deployment.

Official architecture references: Google Search Central localized versions and multilingual-site guidance, consulted September 13, 2026. Search Console indexing confirmation is an external account-dependent follow-up, not inferred from a passing build.

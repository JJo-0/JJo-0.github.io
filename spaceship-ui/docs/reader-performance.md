# Reader performance, second pass

## Writing / search
All article anchors, descriptions, dates, metadata, and series groups remain server-rendered. Repeated card utility strings move into shared CSS. Escape closes a series disclosure via one delegated listener. Search stays behind its existing lazy Svelte dialog; only nonblank input downloads the existing locale-specific index. In-memory request coalescing and a five-minute TTL avoid repeated requests in the same document. Results use 30-item batches with explicit Show more. There is no result truncation or persistent query tracking.

## Math and fonts
KaTeX still emits identical HTML and MathML at build time, with a bounded memoization cache segregated by display and strict modes. Standalone display math skips offscreen layout/paint through content-visibility; native horizontal scrolling and accessibility remain. Outfit 700 remains preloaded; 400 follows CSS demand. The existing system Korean font stack and font-display:swap are retained. Do not claim actual font byte savings without measuring.

## Analytics / Pages
Popular posts are already static and issue no separate reader-side GA4 report request. Avoid constructing the full lookup if the feed is empty. The server-side report retains its date range, dimensions, limit and ranking; two 8-second attempts are allowed only for transient failure. No credentials are stored. Astro ClientRouter prefetch-all is disabled; deliberate Korean header navigation is hover-prefetched. No speculative load on every Writing card. Existing content-addressed assets remain reusable. GitHub Pages controls HTTP cache headers; no unsupported header configuration is introduced. The live workflow records actual CDN headers, request times and conditional status for pages, search indexes and hashed assets.

## Verification
Existing content, route, math, series and locale contracts remain. Added exact KaTeX parity and bounded-cache tests, search request coalescing/expiry/retry, raw/gzip archive metrics, browser cold/open/type/reopen/request counts and all-match ordering, and CDN response evidence. New checks distinguish source/build optimization from measured public LCP/INP and actual HTTP cache behavior. The responsive lecture audit validates original hashes and physical derivative pixels instead of treating density-corrected naturalWidth as the original pixel width. Profile playback diagnostics and actual viewport/decode guards address the previous public-test failure; live verification is still required.

The content-integrity check also counts the actual uncompressed dist files/bytes by top-level directory and warns at 850,000,000 bytes. This is a reporting threshold, not a claim that the compressed deployment artifact equals the published site size. No source assets are deleted to satisfy the warning.

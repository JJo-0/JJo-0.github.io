# Lecture image optimization

This first pass covers local Self-Improving AI lesson imagery (including supplementary figures), the local DRL slide deck, local segmentation slides, and local robot-learning / Modern AI raster assets. It operates only on rendered article images with known local paths. Remote ETH slide URLs and embedded YouTube presentation screens are not fetched, copied, or altered by this pass.

Every original URL, source binary, alt text, caption, and slide order remains unchanged. Responsive derivatives are lossless WebP at widths 640, 960, and 1280 (when smaller than the source); original-resolution lossless derivatives are allowed up to 2400 px. A derivative must save at least 10% of original bytes; smaller assets and existing responsive images are left intact. The original is the highest-resolution fallback unless a lossless same-size preview is smaller. Browser-native lazy loading and async decoding remain in use. Self-Improving AI figures have an explicit full-size link.

The optimizer uses the existing Astro Sharp version, pinned as an optional direct dependency. A supported native Sharp install is required for the build. It generates immutable content-addressed assets once per input within a build and writes a manifest at /assets/lecture-previews/manifest.json with original/preview byte sizes and per-page inventory. The manifest's width estimates are not measured network traffic and must not be reported as actual page speed.

Validation fails if an original's SHA-256 changes, an image's source/alt/order changes, a generated WebP has incorrect dimensions, or no smaller preview exists. Compare mobile/desktop browser Resource Timing before/after on the same source revision and page; do not claim an LCP gain from file sizes alone.

The existing full browser smoke matrix also checks actual mobile and English-desktop image selection, decoded slides, original links, and a distant image's deferred network request. The browser log records Resource Timing for inspected slides.

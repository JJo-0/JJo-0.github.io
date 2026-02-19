# SEO Priority Plan

## P0 - Immediate (Indexing / Crawl / Canonical)

- [x] Canonical URL support in layout (`canonicalUrl` prop)
- [x] Default and per-page robots directives (`index,follow` / `noindex,follow`)
- [x] Open Graph URL/type consistency with canonical (`og:url`, dynamic `og:type`)
- [x] RSS language follows site locale
- [x] `robots.txt` includes sitemap and host
- [x] Tag links URL-encoded (`encodeURIComponent`)
- [x] Optional search engine verification meta slots

Files:
- `src/layouts/Layout.astro`
- `src/pages/404.astro`
- `src/pages/projects.astro`
- `src/pages/appearances.astro`
- `src/pages/posts/index.astro`
- `src/pages/rss.xml.ts`
- `src/pages/robots.txt.ts`
- `site/config.ts`

## P1 - High Impact (Rich Results / Internal Link Graph)

- [x] BlogPosting schema uses `updatedDate` when available
- [x] Posts page has related-post internal links
- [x] Post/tag cards link tags to tag archives (`rel="tag"`)
- [x] CollectionPage + ItemList schema for blog index and tag pages
- [x] Alternate language links in `<head>` (`hreflang`)

Files:
- `src/lib/schemas.ts`
- `src/pages/posts/[...slug]/index.astro`
- `src/pages/posts/index.astro`
- `src/pages/posts/tag/[tag]/index.astro`
- `src/components/PostCard.svelte`

## P2 - Content + Growth (CTR / Topic Authority)

- [ ] Normalize and merge mixed tag taxonomy (Korean/English duplicates)
- [ ] Add pillar pages for top clusters (AI, robotics, health-tech)
- [ ] Improve title/meta description style for CTR by intent
- [ ] Add Search Console + Bing Webmaster + Naver Webmaster submissions
- [ ] Track weekly KPI: impressions, CTR, indexed pages, top queries

Recommended operating cycle:
1. Weekly: run build + manual crawl sanity check.
2. Bi-weekly: update top 10 legacy posts (title/meta/internal links).
3. Monthly: review GSC query clusters and create 2-3 supporting posts.

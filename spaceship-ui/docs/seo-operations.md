# SEO Operations Guide

## 1) Verification Keys

Create `.env` from `.env.example` and fill keys:

```bash
cp .env.example .env
```

```env
PUBLIC_GOOGLE_SITE_VERIFICATION=...
PUBLIC_NAVER_SITE_VERIFICATION=...
PUBLIC_BING_SITE_VERIFICATION=...
```

These values are read in `site/config.ts` and rendered as meta verification tags in the page `<head>`.

## 2) Submit Sitemaps

After deploy, submit the same sitemap URL to each platform:

- `https://jjo-0.github.io/sitemap-index.xml`

Platforms:

- Google Search Console
- Bing Webmaster Tools
- Naver Search Advisor

## 3) Local SEO Checks

Run quality checks:

```bash
pnpm check:all
pnpm build
```

Run SEO audit:

```bash
pnpm seo:audit
```

Fail CI only when critical metadata is missing:

```bash
pnpm seo:check
```

### Audit policy notes

- Scheduled posts should set `draft: true` until publish date.
- Interactive posts that embed Tailwind CDN should include the `interactive-ui` tag.
- These two conventions keep `seo:audit` focused on real indexing risks.

## 4) Weekly Routine

1. Check indexing and query trends in Search Console.
2. Review `reports/seo-audit.md`.
3. Merge one weak/duplicate tag cluster.
4. Update 2-3 old posts (title, description, internal links).

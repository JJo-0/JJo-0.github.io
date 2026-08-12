# JJo-0 Blog Engine

`JJo-0.github.io`의 실제 Astro 애플리케이션입니다. 개인 콘텐츠와 사이트 설정은 `site/`에, 재사용 가능한 UI/라우팅 엔진은 `src/`에 분리되어 있습니다.

## Stack

- Astro 6
- Svelte 5
- Tailwind CSS 4
- Markdown / MDX
- GitHub Pages

## Commands

```bash
pnpm install
pnpm dev
pnpm check
pnpm lint
pnpm seo:check
pnpm build
```

## Structure

```text
spaceship-ui/
├── site/
│   ├── assets/              # favicon, profile/media, static files
│   ├── content/
│   │   ├── posts/           # blog posts
│   │   ├── projects/        # real project entries only
│   │   ├── appearances/     # real talks/articles only
│   │   └── about/           # profile
│   ├── config.ts            # site-wide configuration
│   ├── hero.md
│   └── cta.md
├── src/
│   ├── components/
│   ├── layouts/
│   ├── lib/
│   └── pages/
└── package.json
```

Files beginning with `_` in content directories are authoring templates and are excluded from Astro content collections.

## Deployment

The repository-level workflow `.github/workflows/spaceship-pages-deploy.yml` builds this directory and publishes `spaceship-ui/dist` to GitHub Pages.

## Upstream attribution

This application is derived from **Spaceship** by Alexey Poimtsev and is used under its MIT license. The original copyright and permission notice are preserved in `LICENSE`.

Template demo projects, demo appearances, upstream repository-management files, and upstream branding assets are intentionally excluded from this personal site.

# JJo-0 Blog Engine

`JJo-0.github.io`의 실제 Astro 애플리케이션입니다. 개인 콘텐츠와 사이트 설정은 `site/`에, 재사용 가능한 UI/라우팅 엔진은 `src/`에 분리되어 있습니다.

## Stack

- Astro 6
- Svelte 5
- Tailwind CSS 4
- Markdown / MDX
- KaTeX core via explicit post component
- GitHub Pages

## Commands

```bash
pnpm install
pnpm dev
pnpm post:check
pnpm check
pnpm lint
pnpm seo:check
pnpm build
pnpm content:check
```

## Structure

```text
spaceship-ui/
├── docs/
│   └── post-authoring.md     # post asset/component contract
├── site/
│   ├── assets/
│   │   └── assets/
│   │       ├── posts/        # canonical post-owned assets → /assets/posts/...
│   │       └── site/         # site UI-owned assets → /assets/site/...
│   ├── content/
│   │   ├── posts/            # blog posts + _template.md / _template.mdx
│   │   ├── projects/         # public project entries only when enabled
│   │   ├── appearances/      # public talks/articles only when enabled
│   │   └── about/            # profile
│   ├── config.ts             # site-wide configuration
│   ├── hero.md
│   └── cta.md
├── src/
│   ├── components/
│   │   └── post/             # components allowed to be imported by post MDX
│   ├── layouts/
│   ├── lib/
│   └── pages/
├── scripts/
│   └── post-content-contract.mjs
└── package.json
```

Files beginning with `_` in content directories are authoring templates and are excluded from Astro content collections.

## Post authoring

새 글을 작성하거나 asset/component를 추가할 때는 [`docs/post-authoring.md`](docs/post-authoring.md)를 기준으로 합니다.

핵심 규칙은 다음과 같습니다.

- 일반 글은 `.md`, component가 필요한 글만 `.mdx`
- MDX가 import하는 site component는 `@/components/post/...`
- 새 post-owned asset은 `site/assets/assets/posts/<namespace>/...`
- 공개 URL은 `/assets/posts/<namespace>/...`
- site UI-owned asset은 `site/assets/assets/site/...` → `/assets/site/...`
- 과거 `site/assets/image/`와 `/image/...` 경로는 retired 상태이며 재도입 금지
- code fence는 `c`, `cpp`, `python`, `bash`, `text` 같은 canonical Shiki language ID 사용
- 수식은 `src/components/post/Math.astro`를 통해 KaTeX core로 build-time 렌더링
- `pnpm content:check`가 이 contract를 fail-closed로 검증

## Deployment

The repository-level workflow `.github/workflows/blog-pages-deploy.yml` builds this directory and publishes `spaceship-ui/dist` to GitHub Pages.

## Upstream attribution

This application is derived from **Spaceship** by Alexey Poimtsev and is used under its MIT license. The original copyright and permission notice are preserved in `LICENSE`.

Template demo projects, demo appearances, upstream repository-management files, and upstream branding assets are intentionally excluded from this personal site.

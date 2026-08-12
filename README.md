# JJo-0.github.io

개발, AI, 로보틱스, 연구 과정에서 얻은 내용을 기록하는 개인 기술 블로그입니다.

- Live site: `https://jjo-0.github.io`
- Blog engine: Astro + Svelte + Tailwind CSS
- Main application: `spaceship-ui/`
- Content: `spaceship-ui/site/content/`

## Development

```bash
cd spaceship-ui
pnpm install
pnpm dev
```

검증은 다음 순서로 실행합니다.

```bash
pnpm check
pnpm lint
pnpm seo:check
pnpm build
```

GitHub Pages 배포와 품질 검사는 저장소 루트의 `.github/workflows/`에서 관리합니다.

## Attribution

현재 UI 엔진은 MIT 라이선스의 Spaceship 템플릿을 기반으로 커스터마이즈했습니다. 이전 Jekyll 버전은 Minimal Mistakes를 사용했습니다. 자세한 출처와 저작권 고지는 `THIRD_PARTY_NOTICES.md` 및 `spaceship-ui/LICENSE`를 참고하세요.

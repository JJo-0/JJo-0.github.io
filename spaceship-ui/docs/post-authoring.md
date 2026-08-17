# Post Authoring Contract

이 문서는 `site/content/posts`에 새 글을 추가하거나 기존 글을 수정할 때 지켜야 하는 저장소 규칙을 정의합니다. 목표는 레거시 변환 플러그인을 다시 만들지 않고, Astro 6의 명시적인 Markdown/MDX 모델을 유지하는 것입니다.

## 1. Markdown과 MDX 선택

- 일반 글은 `.md`를 사용합니다.
- Astro/Svelte component가 필요한 글만 `.mdx`를 사용합니다.
- `.md` 안에 `import`를 넣지 않습니다. component가 필요해지는 순간 `.mdx`로 전환합니다.
- MDX에서 직접 `<script>` 또는 `<style>`을 작성하지 않습니다. 동작과 스타일은 component에 캡슐화합니다.

기본 템플릿:

- `site/content/posts/_template.md`: 일반 Markdown
- `site/content/posts/_template.mdx`: component를 사용하는 MDX

## 2. Post component namespace

글 본문에서 import하는 repository component는 다음 경로에 둡니다.

```text
src/components/post/
```

MDX에서는 다음 형태만 사용합니다.

```mdx
import Math from '@/components/post/Math.astro';
```

`src/components/`의 일반 UI component를 글에서 직접 import하지 않습니다. 글 전용 component가 필요하면 `src/components/post/` 아래에 작은 adapter/component를 만듭니다.

### Math

수식은 global Markdown parser가 아니라 `Math.astro`가 build-time에 KaTeX core를 호출해 렌더링합니다.

```mdx
<Math tex={"x_i"} />

<Math display tex={"A\\mathbf{x}=\\mathbf{b}"} />
```

- 새 글에서 `$$ ... $$`를 사용하지 않습니다.
- KaTeX CSS는 `Math.astro`가 소유합니다.
- 수식을 쓰는 글은 `.mdx`를 사용합니다.

## 3. Post asset namespace

새로운 글 전용 이미지, SVG, 짧은 video 등 정적 asset은 다음 위치에 둡니다.

```text
site/assets/assets/posts/<namespace>/...
```

브라우저에서 참조할 때는 다음 URL을 사용합니다.

```text
/assets/posts/<namespace>/...
```

예시:

```text
site/assets/assets/posts/vision/activation-functions.svg
→ /assets/posts/vision/activation-functions.svg
```

`<namespace>`는 보통 post source filename stem을 사용합니다. 여러 글이 하나의 시리즈 asset을 공유한다면 `ai-consciousness-2026`처럼 명시적인 shared-series namespace를 사용할 수 있습니다.

### Naming

`/assets/posts/` 아래 directory와 filename은 lowercase kebab-case를 사용합니다.

좋음:

```text
assets/posts/vision/sigmoid-derivative.svg
assets/posts/ai-consciousness-2026/part-1-cover.svg
```

피함:

```text
assets/posts/Vision/Sigmoid Derivative.svg
```

## 4. `/image`는 frozen legacy storage

`site/assets/image/`는 과거 글을 깨뜨리지 않기 위해 남긴 legacy directory입니다.

- 새 asset을 추가하지 않습니다.
- 새 글에서 `/image/...`를 사용하지 않습니다.
- 기존 파일은 owning post를 손볼 때 `/assets/posts/<namespace>/...`로 점진적으로 이동합니다.
- `scripts/post-content-contract.mjs`의 allowlist는 legacy 부채의 상한선입니다. 새 항목을 추가하는 방식으로 문제를 해결하지 않습니다.

## 5. Code fence language

Shiki가 실제로 아는 canonical language ID를 사용합니다.

```text
```c
```python
```bash
```text
```

- `C` 대신 `c`
- 등록되지 않은 `pseudocode` 대신 `text`

새 alias가 정말 필요한 경우에만 `astro.config.mjs`의 Shiki 설정에 의도적으로 등록합니다.

## 6. External media

원격 hotlink는 장기적으로 깨지기 쉽습니다. 글의 의미에 필요한 이미지라면 repository-owned asset으로 저장하고 `/assets/posts/...`에서 참조합니다.

단, 공식 문서/논문/외부 페이지로 이동하는 일반 hyperlink는 이 규칙의 대상이 아닙니다.

## 7. Verification

로컬에서 다음 순서로 확인합니다.

```bash
pnpm post:check
pnpm lint
pnpm check
pnpm seo:check
pnpm build
pnpm content:check
```

`pnpm content:check`에는 `post:check`가 포함되어 있으며 다음을 fail-closed로 검사합니다.

- `.md`의 module/component import
- MDX의 post namespace 밖 component import
- MDX의 직접 `<script>` / `<style>`
- `/assets/posts/...`의 missing asset
- `/image` legacy directory 신규 추가/신규 참조
- post asset naming convention
- 비표준 `C` / `pseudocode` code fence
- canonical `src/components/post/Math.astro` 존재 여부

## 8. 원칙

호환성 문제가 생겼을 때 우선순위는 다음과 같습니다.

```text
source를 현재 형식으로 정규화
→ 작은 명시적 component 사용
→ CI로 contract 고정
→ runtime compatibility parser/shim은 만들지 않음
```

기존 공개 URL 보존을 위한 static redirect는 별도 compatibility boundary이며, post content runtime parser와 혼동하지 않습니다.

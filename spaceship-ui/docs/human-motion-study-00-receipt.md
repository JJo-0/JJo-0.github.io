# 사람의 움직임을 읽는 공부: 0편 제작 기록

Date: 2026-10-26. Base: `8fce2ea677a9d1c518d802746e3abc7c8a43598c`.
Branch: `content/human-motion-study-00`. 검증 대상은 아래 해시의 작업 트리다.

## 0편 문장 축약 (2026-10-26 후속 수정)

사용자 요청으로 공개 본문에서 작업 폴더 이름, 자료 관리 절차, 신경과학 관련 단서와 반복 설명을 삭제했다. 연구 시작, 저작권 안내, 분야별 지도와 수식 정독 방식만 남겼다. 본문은 7,095자에서 1,450자로 줄었다. 아래 최초 제작 기록은 이전 버전의 이력이며, 현재 본문의 범위 설명과 해시는 이 수정 기록이 우선한다.

- 현재 0편 SHA-256: `192b39e9bae530115f9c08666e0b73bff37c5765d61501e580f2e0a707fad1c4`
- post-content-contract / taxonomy-contract / diff whitespace 검사: PASS.
- 최종 `npm run build`: PASS (694 pages, rendered Markdown audit 통과). 로그: `/tmp/motion-study-short-build.log`.

## 결과와 범위

- Vision, Perception & Neuroscience 아래 기존 SeriesGroup을 재사용해 접이식 연재를 추가했다. 현재 0편 하나도 접혀 표시된다. 다른 단일 글의 표시 방식은 유지한다.
- 제목: 사람의 움직임을 읽는 공부 0편: 논문을 한 글자씩 읽기 위한 지도.
- 사용자 정정에 따라 교수님에게 주제를 받았다는 서술을 포함하지 않는다. 연구 시작은 사용자 제공 2024년 12월이다.
- 모든 reference_paper / external 자료를 공부 범위로 선언했다. 용어·기호·단위·차원·전제·중간 유도·예제·실패 조건·부록·코드 대응·미해결 질문을 추적한다.
- 첫 본문 절은 저작권 안내다. 원문 링크, 개별 라이선스, 그림의 권리와 변경 표시, 코드·데이터 권리 구분을 설명한다. 원문 PDF나 추출 이미지, 번역문을 복제하지 않았다.
- human-motion-study-inventory.json은 현 작업공간 자료 목록이다. reference 문서 파일 93개, external 최상위 항목 32개, 발견한 Git root 31개다. 고유 논문 수가 아니며 백업·중복·부분 checkout을 포함한다. external의 코드 파일 전수 목록이나 모든 README 인용 논문의 서지 추출은 아니다. 각 항목은 source-listed-not-reviewed이며, 앞으로 원문 식별자로 대조한다.
- 0편만 작성했다. 개별 논문 정독, 수식 검증과 재현 완료를 주장하지 않는다.

## 검증

- VERIFIED: `node scripts/post-content-contract.mjs`, `node scripts/taxonomy-contract.mjs`: 223 posts 통과.
- VERIFIED: 새 글은 `scripts/normalize_tags_current.py`의 canonical taxonomy와 정확히 일치한다.
- VERIFIED: `npm run check`: Astro 347 files, 0 errors / 0 warnings; Svelte 0 errors / 0 warnings.
- VERIFIED: `npm run lint`: 0 errors, 기존 파일의 warnings 4개. 변경한 Astro/JS 파일의 targeted ESLint는 통과.
- VERIFIED: `node scripts/seo-check.mjs`: 223 posts 통과.
- VERIFIED: 최종 `npm run build`: 694 pages; rendered Markdown audit 통과.
- VERIFIED: `node scripts/series-navigation-contract.mjs`: 기존 그룹과 새 1편 그룹, Vision 소속, 0편 링크, 기본 접힘 확인.
- VERIFIED: Playwright Chromium 390px / 1440px, 기본 접힘, Enter 열기, Escape 닫기, 0편 이동, 저작권 첫 절, 본문 내부 링크 HTTP 응답, 가로 넘침 없음. 모바일 screenshot도 직접 확인했다.
- FAILED (기존 문제): `pnpm content:check`는 taxonomy manifest의 기존 뉴스 6개 누락으로 중단됐다. base HEAD의 원본 manifest와 tracked posts로 같은 6개 누락을 확인했다. 새 글은 누락 목록에 없다. 그 이후 통합 게이트는 이 명령에서 실행되지 않았다.
- UNVERIFIED: 실제 GitHub Pages 배포. 초안 PR은 배포 증거가 아니다.

## 기존 통합 게이트 차단 항목

- 2026-10-25-chemistry-infused-bandit-electrocatalysis-news.mdx
- 2026-10-25-circular-oligodisulfide-flow-battery-news.mdx
- 2026-10-25-slow-light-silicon-modulator-news.mdx
- 2026-10-26-active-learning-ood-uncertainty-news.mdx
- 2026-10-26-agentic-rl-interference-news.mdx
- 2026-10-26-traceweaver-web-agent-news.mdx

## 원문 확인

2026-10-26 공식 안내 직접 확인:
- https://info.arxiv.org/help/license/index.html
- https://creativecommons.org/licenses/by/4.0/deed.ko

기존 사이트 `src/pages/policies/copyright.md`와 정합성을 확인했다. 개별 논문의 그림 재사용 허락을 받은 것은 아니다.

## 해시와 로컬 검증 자료

- 0편 SHA-256: `254de173af8309c8bb209f4329780a842508b0dcae336e4625647b8d5d58f1d6`
- 자료 목록 SHA-256: `b32b1e33c5bb91d55ce1158e54e1eb76384368c04b4e0ad0d71f2b93d993b075`
- 로컬 로그: `/tmp/motion-study-{build,check,lint,seo,content}.log`
- 로컬 브라우저 결과: `/tmp/motion-study-qa/verdict.json`, `group-{390,1440}.png`, `article-{390,1440}.png`
- 브라우저 결과:

```json
{
  "status": "PASS",
  "checks": [
    {
      "viewport": 390,
      "group": "collapsed by default; keyboard Enter/Escape pass",
      "article": "heading, copyright-first, internal links, no horizontal overflow pass"
    },
    {
      "viewport": 1440,
      "group": "collapsed by default; keyboard Enter/Escape pass",
      "article": "heading, copyright-first, internal links, no horizontal overflow pass"
    }
  ]
}
```

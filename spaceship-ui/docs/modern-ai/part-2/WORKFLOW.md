# 현대 인공지능 II 제작 게이트

이 편은 아래 순서를 바꾸지 않는다.

1. 13페이지 원자료의 page/content/formula ledger를 생성한다.
2. 렌더링된 13페이지와 원장을 한 페이지씩 대조한다.
3. 모든 수식 후보를 병합·분리하고 정확한 LaTeX로 전사한다.
4. 원문 오기·빈칸·의심 표기는 `source-exact`, `source-suspect`, `editorially-completed`, `corrected-variant`로 구분한다.
5. 모든 문단·도표·표·캡션·각주·질문을 본문 위치 또는 `audit_only_reason`에 매핑한다.
6. 원자료 재구성 본문을 작성한다.
7. 2026-08-18 기준 최신 연구 업데이트를 1차 자료로 검증해 별도 층으로 작성한다.
8. publication mode ledger audit, 기존 238개 Part I 수식 audit, Astro/Svelte/SEO/build를 모두 통과한 뒤에만 게시한다.

`modern-ai-part2-ledger-audit.mjs`는 Part II 게시물 파일이 생기는 순간 자동으로 publication mode로 전환한다. 이때 수식 하나라도 LaTeX·상태·본문 anchor가 없거나, 원자료 항목 하나라도 본문 위치 또는 감사 사유에 연결되지 않으면 CI가 실패한다.

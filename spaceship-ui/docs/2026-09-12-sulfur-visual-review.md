# 2026-09-12 리튬–황 해설: 이미지·푸시 기록

## 범위

사용자의 7,000–10,000자 초안을 유지하며 사진과 설명 그림을 넣고 GitHub에 push한다. 본문은 약 8,700자이고, 이 변경의 static contract 계산은 공백 포함 8,762자다. Frontmatter, import, 그림·수식 component, 참고문헌 절, Markdown 표식과 인용 번호는 제외한다.

기준 main: `b4f14b4fec30d2bc44cef8a96a3bc8b47ea457eb`.
브랜치: `content/lithium-sulfur-visuals-20260912`.

글은 `draft: true`, `researchFeatured: false`, `featured: false`다. GitHub push는 블로그 공개 발행과 다르다. Blogger 게시, 다른 글의 공개 상태 변경, 자동 merge는 하지 않는다. 연구 본문·보충자료 전체 검증이 남아 있다는 기존 고지를 유지한다.

## 9월 9일과 같은 이미지 우선 구성

기존 `NewsListItem.astro`는 `news-media.json`에서 slug가 일치하는 첫 항목을 고른다. PC는 사진이 왼쪽, 모바일은 사진이 제목 앞에 놓인다. 기존 component/CSS를 바꾸지 않고 오늘 글의 첫 항목을 `sulfur-crystal`로 등록한다.

본문의 첫 visible node는 `<NewsFigure media="sulfur-crystal" priority />`다. 기존 NewsFigure의 eager/high 우선순위, width/height, 원본 확대 링크, caption/credit/rights 표시를 재사용한다. 이어서 산화수 설명에 `sulfur-electron-range`, 비에너지 질량 예시에 `sulfur-mass-basis`를 둔다.

현재 draft이므로 공개 NEWS 목록과 공개 글 페이지에는 노출되지 않는다. 공개 목록의 카드 배치는 기존 component의 소스 계약을 확인한 것이며, 이 초안을 live에 게시해 확인했다는 뜻이 아니다.

## 이미지 근거와 권리

### 1. 황 결정 사진

- 원본: https://commons.wikimedia.org/wiki/File:Large_Sulfur_Crystal.jpg
- 촬영: Eric Hunt, 2006-10-21. 이탈리아 Agrigento, Sicily의 황 결정.
- 라이선스: CC BY-SA 2.5. https://creativecommons.org/licenses/by-sa/2.5/
- 사용: Wikimedia의 1280×851 축소본. 크롭·색상 보정·합성 없음.
- 원본 설명 페이지와 이미지 픽셀을 2026-09-12 확인했다. 촬영자·라이선스·원본·변경 내역을 본문과 카드에 제공한다.
- 이번 논문의 실제 시료, 배터리 시제품, S₂Cl₂ 사진으로 소개하지 않는다.
- 현재 사진은 Wikimedia CDN에서 직접 읽는다. 컨테이너의 다운로드 시도에 실패하여 로컬 파일로 보관했다고 주장하지 않는다. 핵심 설명용 SVG 두 개는 저장소 내부 자산이며, 대표 배경 사진만 외부 이미지 서버 가용성에 의존한다. 기존 9월 9일 NewsFigure의 외부 사진 방식과 같은 경로를 사용했다.

### 2. 2전자/3전자 산화수 범위

- 저장소 자체 Matplotlib 계산 그림, MIT. 외부 Figure를 복사하지 않았다.
- Li₂S: -2, 원소 황: 0, S₂Cl₂: +1. 황 원자 하나당 차이는 각각 2와 3.
- 가로축은 산화수이며 전압·시간·에너지 축이 아니다.
- 3/2=1.5는 이론적 전자 수의 비율이며, 논문의 실측 용량 증가율 58%를 그린 것이 아니다.
- 개념 맥락: https://www.nature.com/articles/s41560-026-02086-7 (2026-09-10 News & Views 공개 요약).

### 3. 포함 질량과 비에너지

- 저장소 자체 Matplotlib 교육용 계산 그래프, MIT.
- 가상 에너지 100Wh를 고정하고 0.1kg/0.5kg을 분모로 사용해 1000/200Wh/kg을 계산했다.
- 논문의 실제 질량, 실제 비교 셀, 1,700Wh/kg의 pack 환산 또는 수명 곡선이 아니다.
- 단위 정의 맥락: https://web.mit.edu/evt/summary_battery_specifications.pdf

두 SVG는 title/desc, 표기된 축, 실제 데이터가 아니라는 고지를 갖춘다. 폰트 파일·외부 이미지·script는 포함하지 않는다. 한국어 text를 유지하고 기기의 sans-serif fallback으로 표시한다. PNG 렌더를 육안으로 확인했으며 글자나 축의 잘림은 발견하지 않았다.

## 검증

기존 9월 9일의 5개 글/각 2개 설명 그림 검사 조건을 그대로 유지한다. `news-visual-contract.mjs` 마지막에 별도 sulfur contract를 추가한다. 새 검사는 첫 이미지 순서, thumbnail의 사진 우선 선택, 3개 이미지 메타데이터와 권리 고지, 로컬 SVG 존재·title/desc·비율·외부 리소스/스크립트 부재, 본문 분량을 확인한다.

전체 저장소 clone은 컨테이너 DNS 오류로 실패했다. 로컬 전체 Astro build 또는 live 렌더를 완료했다고 주장하지 않는다. 전체 lint/type/SEO/build/content/browser 검증 여부는 이 브랜치 PR의 실제 GitHub Actions 결과로 별도 확인한다. 정적 검사만으로 Wikimedia CDN의 미래 가용성을 보증하지 않는다.

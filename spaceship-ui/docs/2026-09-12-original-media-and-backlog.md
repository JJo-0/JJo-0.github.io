# 2026-09-12 원본 이미지 복구 · 해외 제공 · 미완료 작업 재개

## 실제 변경

PR #109의 사진 우선 배치와 7,000–10,000자 해설을 유지하며, 이번 글뿐 아니라 9월 11일의 배아·대형 마스크·황화물 막 초안에도 원본 자료를 넣었다. 원격 hotlink 대신 저장소 내부 `assets/posts/frontier-source-20260912/`를 사용한다. 과거 9월 9일의 모든 외부 이미지를 일괄 이관했다는 뜻은 아니다.

| 글 | 새 원본 자료 |
| --- | --- |
| 9월 12일 리튬–황 | Nature Energy Figure 1 전체를 대표 이미지로 사용. a·b의 이론 비교와 c의 반응 개념을 구분. 황 결정 사진은 배경 사진으로 본문 뒤에 이동하고 로컬 파일로 보관. 자체 설명 SVG 2개 유지. |
| 9월 11일 배아 | IOCB가 해당 연구에 공개한 실제 배반포 사진과 DNA 복구 비교 그림. 초기 배아 기초연구 고지를 유지. |
| 9월 11일 High-NA 마스크 | imec의 2024년 실제 시설·초기 패턴 자료. 2026년 12인치 마스크 시제품으로 소개하지 않음. |
| 9월 11일 황화물 막 | 출판사 조기 공개 PDF의 Figure 2·5 전체와 원문 캡션. 실제 막 사진·단면·원소 분포·충방전 그래프를 표시. |

배터리 막 PDF는 12쪽을 확보했고, Figure 2와 5의 캡션 및 해당 본문을 대조했다. Figure 5d는 LTO 음극 파우치 셀의 40°C·0.5C·2MPa 조건이다. 과거의 본문 접근 실패 고지를 이번 확인 범위에 맞게 수정했다. 보충자료 전체·원시데이터 재분석 또는 독립 재현까지 완료한 것은 아니다.

## 획득과 재현성

컨테이너의 외부 DNS 실패 때문에 해당 PR 브랜치에서 일회성 GitHub Actions로 공개 자료를 가져왔다. 공개 URL만 읽었으며 외부 서비스 자격증명은 사용하지 않았다. 검토한 원본의 SHA-256과 일치하는 파일만 반영했다. 이미지 픽셀과 PDF 그림·축·범례·캡션을 육안 확인했다. 사용한 임시 workflow 3개와 패치 실행기는 main merge 전에 제거한다. 기존 Blog CI·Pages workflow는 변경하지 않는다.

- 공개 source/hosting probe: Actions run `34688780858`.
- 원본 image/PDF acquisition: Actions run `34688904373`.
- 검토한 바이트의 재획득·로컬 자산 반영: Actions run `34689349236`, asset commit `81ba162de7c722cfe75ec17382c552d9fbd9c500`.
- 최종 검증은 마지막 PR head의 Blog CI 결과를 사용한다. 수집 workflow 성공은 Blog CI 성공의 대체 증거가 아니다.

PNG/JPEG 원본은 가능한 그대로 보존했다. 큰 배반포 PNG와 황 결정 JPEG는 디코딩 픽셀이 동일한 무손실 WebP로 전환했다. PDF의 전체 Figure·원문 캡션 발췌는 개별 패널을 재배열하거나 수치·축·문자를 바꾸지 않았다. 원본 다운로드와 저장 자산의 주소·크기·해시는 `site/assets/assets/posts/frontier-source-20260912/provenance.json`에 기록한다. 정적 CI는 7개 로컬 원본/배경 이미지의 해시·매직 바이트·권리·본문 매핑과 4개 초안의 대표 이미지 순서를 검증한다.

## 권리와 공개 상태

원본이 인터넷에 있다는 사실만으로 자유 이용이 허용되는 것은 아니다. 루트 `THIRD_PARTY_NOTICES.md`와 각 이미지 캡션에 원저작권 및 이용 조건을 명시했다. Nature Energy Figure는 원저작권이 유지되는 제한적 도표 인용이며 CC 라이선스를 임의로 부여하지 않는다. IOCB 자료도 별도 자유 이용 허락이 확인된 것으로 표시하지 않는다. imec 자료는 해당 보도·발표용 조건을 따른다. 황 결정 사진은 CC BY-SA 2.5, 황화물 막 Figure는 CC BY-NC-ND 4.0이다. 후자는 상업 이용이나 개작 배포를 허용하는 라이선스가 아니다.

이번 요청은 main merge이지 공개 발행 승인으로 확대하지 않는다. 4편 모두 `draft: true`를 유지하고, Blogger에 게시하지 않는다. 다만 **public GitHub 저장소와 정적 자산 URL 자체는 공개되어 있으며 `draft`는 접근 통제가 아니다.** 광고를 붙인 글의 공개, 이미지의 상업적 배포, 독자용 본문 발행 전에는 권리와 연구 검증을 별도로 확인한다.

## 해외 호스팅 점검

GitHub Pages는 저장소의 HTML/CSS/JS 정적 결과를 호스팅하는 서비스다. 사용자의 한국 PC에서 외국 방문자에게 직접 파일을 제공하는 구조가 아니다. Fastly의 GitHub 사례 설명은 Pages 앞의 CDN 제공을 명시한다. 특정 원본 서버의 국가나 데이터센터를 사용자가 선택했다는 뜻은 아니다.

이번 GitHub Actions 환경의 실제 GET에서 다음을 확인했다.

| 경로 | 결과 |
| --- | --- |
| `/` | HTTP 200, `Server: GitHub.com`, `X-Served-By: cache-iad-kiad7000140-IAD` |
| `/news` | HTTP 200 |
| `/sitemap-index.xml` | HTTP 200 |
| `/sitemap-0.xml` | HTTP 200 |
| `/robots.txt` | HTTP 200 |
| `/ads.txt` | HTTP 200, 현재 AdSense 비활성 안내 |

IAD 이름의 캐시 응답은 이 요청이 해당 edge를 통과했다는 관찰이다. 원본 서버의 정확한 위치를 입증하거나 전 세계 국가별 지연시간을 측정한 것이 아니다. 한 지역의 200 응답만으로 모든 지역에서 항상 빠르다고 보증하지 않는다.

참고 자료: GitHub Pages 설명(https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), Fastly GitHub 사례(https://www.fastly.com/customers/github), Google 다국어 사이트 가이드(https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), 언어별 페이지 연결 가이드(https://developers.google.com/search/docs/specialty/international/localized-versions). 열람 2026-09-12.

## #10 영어판·국제 SEO의 현황

`b4f14b4` 기반에 #109 초안이 포함된 소스 92개를 조사했다. 템플릿을 제외한 `.md`/`.mdx` 기준이다.

- `lang: ko`, `draft: false`: 82개.
- `lang: ko-KR`, `draft: false`: 6개.
- `lang: ko`, `draft: true`: 4개.
- 영어 글: 0개. 실사용 `translatedPosts` 연결: 0개.

이미 `lang`, `translatedPosts`, `LanguageSelector`, Layout의 alternate link, 네이티브 영어 경로만 허용하는 기초가 있다. 그러나 실제 영문 원고·번역 대응은 없다. 현재 언어 검사는 주로 소스 marker를 검사하며 번역 대상 존재·공개 상태·상호성의 전체 검증을 대신하지 않는다. `/en` 전체 shell, 언어별 RSS/search, hreflang 상호성, language-specific canonical, 구조화 데이터, OG locale 정상화도 후속 범위다.

우선순위는 호스팅 이전이 아니라 실제 영어 본문과 독립 주소를 만드는 것이다. 한국어 공개 URL은 보존하고 영어 URL 구조를 결정한 뒤, 1편에서 전체 번역·수식/표/인용/그림의 대응·상호 언어 링크를 검증한다. 제목이나 메뉴만 영어로 바꾸어 본문 번역이 끝난 것처럼 처리하지 않는다. Google은 언어별 별도 URL과 상호 hreflang을 권장하며 서버 위치나 EN 버튼만으로 영어 본문을 대신할 수 없다.

## 미완료 이슈 복구

사용자는 다음 작업을 중단한 것이 아니라 계속 진행하기를 원했다. 이전 `not_planned` 종료 판단을 바로잡아 #10/#16/#17/#28/#38/#56을 모두 `open/reopened`로 복구했다. 아래 범위는 구현 완료가 아니다.

| 이슈 | 이번 진행과 남은 작업 |
| --- | --- |
| #10 | 92개 원고 언어·번역 메타데이터 조사 및 현재 네이티브 전환 구조 점검. 다음은 실재 영문 원고와 URL/상호 링크·번역 parity 검증. |
| #16 | 공개 수집 코드와 계정의 읽기 권한은 별개. GA4 property/GSC 소유권 및 승인된 보고 API 권한 확보가 필요. 계정이나 민감한 트래픽 데이터를 확인했다고 주장하지 않음. |
| #17 | 공개 ads.txt 비활성 확인. 외부 승인·동의·광고 전후 성능 증거 전에는 광고를 켜지 않음. |
| #28 | 원자료 PDF별 페이지/본문/수식/그림의 원장 대조를 다시 수행해야 함. 이번 media 획득을 강의자료 감사 완료로 보지 않음. |
| #38 | 전체 수식의 exact-ID lesson·계산·가정·렌더링 대응이 잔여 범위. 기존 수식과 SHA 계약은 변경하지 않음. |
| #56 | 기존 PR-1~5 기록 유지. PR-6 소재, PR-7 패키징/HBM/테스트, PR-8 리서치, PR-9 신선도 검증을 단계별로 이어갈 것. |

원래 체크리스트를 지우거나 미확인 항목을 완료 표시하지 않는다. 이슈 상태를 정리하는 일과 실제 기능 구현을 혼동하지 않는다.

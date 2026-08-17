# Google Search Console · GA4 · AdSense 운영 설정

이 문서는 `jjo-0.github.io`의 검색 색인, GA4 집계 리포트, 선택적 AdSense 광고를 운영하기 위한 계정 설정 절차다. 저장소에는 서비스 계정 키나 방문자 원시 데이터를 커밋하지 않는다.

## 현재 식별자

- 사이트: `https://jjo-0.github.io/`
- sitemap: `https://jjo-0.github.io/sitemap-index.xml`
- GA4 측정 ID: `G-JL4J2492X6`
- GA4 속성 ID: `486835586`
- AdSense 게시자 ID: `pub-7495843758830919`
- AdSense client ID: `ca-pub-7495843758830919`

게시자 ID와 client ID는 광고 코드와 `ads.txt`에 공개되는 식별자다. 서비스 계정 JSON 키는 비밀번호와 동일하게 취급한다.

## 1. Search Console 소유권과 색인

1. Search Console에서 **URL 접두어 속성** `https://jjo-0.github.io/`를 추가한다.
2. HTML 태그 인증을 선택하고 `content="..."` 안의 토큰만 복사한다.
3. 저장소의 **Settings → Secrets and variables → Actions**에 `PUBLIC_GOOGLE_SITE_VERIFICATION`을 추가한다.
4. `Deploy Blog to Pages`를 다시 실행한다.
5. 배포 HTML의 `<head>`에 `google-site-verification` 메타 태그가 있는지 확인한 뒤 Search Console에서 인증을 완료한다.
6. Search Console에 `https://jjo-0.github.io/sitemap-index.xml`을 제출한다.

Google Analytics 태그로도 URL 접두어 속성을 인증할 수 있지만, 이 사이트는 GA를 Partytown을 통해 실행하므로 HTML 메타 태그를 기본 인증 방식으로 사용한다.

일반 블로그 문서에는 Google Indexing API를 자동 호출하지 않는다. 이 API는 일반 웹 문서의 범용 색인 요청 수단이 아니다. sitemap 제출과 URL Inspection API로 상태를 확인하고, 긴급한 단일 문서는 Search Console UI의 색인 요청을 사용한다.

## 2. GA4 Data API와 Search Console API

### Google Cloud

1. Google Cloud 프로젝트를 생성한다.
2. **Google Analytics Data API**와 **Google Search Console API**를 활성화한다.
3. `site-insights` 같은 이름의 서비스 계정을 생성한다.
4. 서비스 계정 JSON 키를 한 번만 발급하고 안전하게 보관한다.

### 제품별 권한

- GA4 속성 `486835586`: **관리 → 속성 액세스 관리**에서 서비스 계정 이메일을 `Viewer`로 추가한다.
- Search Console: 속성 인증 후 **설정 → 사용자 및 권한**에서 서비스 계정 이메일을 추가한다. sitemap 제출까지 자동화하려면 충분한 쓰기 권한을 부여한다.

### GitHub 설정

- Repository secret: `GOOGLE_REPORTING_CREDENTIALS` = 서비스 계정 JSON 전체
- Repository variable: `GOOGLE_SITE_INSIGHTS_ENABLED=true`로 설정하면 매월 1일 10:15 KST에 자동 실행된다.
- 선택 변수:
  - `GA4_PROPERTY_ID=486835586`
  - `SEARCH_CONSOLE_SITE_URL=https://jjo-0.github.io/`
  - `SEARCH_CONSOLE_SITEMAP_URL=https://jjo-0.github.io/sitemap-index.xml`

그다음 Actions의 **Google Site Insights**를 수동 실행한다. 첫 실행에서는 `submit_sitemap=true`, `inspect_urls=true`가 권장된다.

리포트는 다음을 포함한다.

- GA4: 활성 사용자, 세션, 참여 세션, 페이지 조회, 주요 페이지, 유입 채널, 주요 이벤트
- Search Console: 클릭, 노출, CTR, 평균 순위, 검색어, 검색 노출 페이지
- URL Inspection: sitemap URL별 색인 판정, coverage, robots, canonical, 마지막 크롤링

리포트 JSON과 Markdown은 Actions artifact로 7일만 보존된다.

## 3. AdSense 선택적 활성화

2025년 5월 11일 AdSense 승인 메일이 도착했으며 게시자 ID는 `pub-7495843758830919`다. 저장소의 `ads.txt`도 이 ID를 사용한다.

사이트는 **전역 Auto Ads를 기본으로 사용하지 않는다.** 선택적 광고는 다음 세 조건을 모두 만족해야 한다.

1. AdSense에서 Auto Ads를 끄고 반응형 디스플레이 광고 단위를 만들어 slot ID를 받는다.
2. GitHub Actions 변수에 다음을 설정한다.
   - `PUBLIC_GOOGLE_ADSENSE_MODE=manual`
   - `PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-7495843758830919`
   - `PUBLIC_GOOGLE_ADSENSE_SLOT=<숫자 slot ID>`
3. 광고를 허용할 게시물 frontmatter에만 `showAds: true`를 추가한다.

기본값은 `showAds: false`다. 홈, About, Research, Privacy, 글 목록, 현대 인공지능 시리즈, 수식·표·인터랙티브 콘텐츠는 데이터 검토 전에는 광고 대상에 넣지 않는다.

광고 활성화 전 AdSense **Privacy & messaging**에서 EEA·영국·스위스용 Google 인증 CMP와 TCF v2.3 메시지를 설정하고, privacy URL로 `/privacy/`를 등록한다. CMP 설정이 확인되지 않으면 광고 모드를 `off`로 유지한다.

## 롤백

- 광고 즉시 중지: `PUBLIC_GOOGLE_ADSENSE_MODE=off` 또는 변수 삭제 후 재배포
- 월간 리포트 중지: `GOOGLE_SITE_INSIGHTS_ENABLED=false`
- 서비스 계정 폐기: Google Cloud에서 해당 키를 비활성화·삭제하고 GitHub secret도 삭제

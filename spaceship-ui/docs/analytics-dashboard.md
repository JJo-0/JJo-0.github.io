# JJO Blog Analytics — 관리자 및 공개 인기 글

## 현재 구조 (2026-11-09)

- GitHub Pages + Astro 정적 사이트입니다. 기존 GA4 측정 ID는 G-JL4J2492X6입니다. 중복 추적기를 설치하지 않았습니다. 측정 ID로는 GA4 숫자 속성 ID를 추론할 수 없습니다.
- 메인 페이지는 지난 30개의 완료된 날짜를 기준으로 공개 인기 글 TOP 5를 보여줍니다. 자격증명이 없으면 실제 수치를 가장하지 않고 통계 연결 안내를 표시합니다.
- /analytics/ 화면은 Google 계정으로 로그인하여 GA4 일간·주간·월간 TOP 10, 카테고리 집계, GSC 검색어와 유입 페이지를 보는 관리자용 화면입니다. 정적 페이지 자체는 공개되지만 **보고서 데이터는 Google API 권한이 있는 사용자만 조회**할 수 있습니다. noindex 및 사이트맵 제외 적용.
- Pages 배포 결과에는 사용자별 IP, 쿠키, 개인 식별자, 접근 토큰, 서비스 계정 키 또는 원시 검색어를 포함하지 않습니다.

## 관리자용 Google OAuth 설정

1. Google Analytics 관리자(https://analytics.google.com/)의 속성 상세 화면에서 **숫자 GA4 Property ID**를 확인합니다. 이는 G-로 시작하는 측정 ID와 다릅니다.
2. Google Cloud Console에서 **Google Analytics Data API** 및 **Google Search Console API**를 활성화하고 OAuth 동의 화면을 설정합니다. 외부 테스트 모드라면 본인 계정을 테스트 사용자로 등록합니다.
3. OAuth 클라이언트 유형은 **웹 애플리케이션**, 승인된 JavaScript 출처는 https://jjo-0.github.io 입니다. API 인증은 브라우저에서 Google Identity Services를 통해 수행됩니다. OAuth 클라이언트 보안 비밀을 프런트엔드에 넣지 마세요.
4. GitHub 저장소 Settings → Secrets and variables → Actions → **Variables** 에 다음 값을 추가합니다.
   - PUBLIC_GOOGLE_OAUTH_CLIENT_ID: 웹 OAuth Client ID
   - PUBLIC_GA4_PROPERTY_ID: 숫자 GA4 Property ID
   - PUBLIC_GSC_SITE_URL: Search Console에 등록한 정확한 속성 ID (예: https://jjo-0.github.io/). URL-prefix 속성은 후행 슬래시 포함 원형 그대로 입력. 도메인 속성은 sc-domain:example.com 형식.
5. Google 로그인 계정에 기존 GA4 속성의 Viewer 이상, Search Console 속성의 사용자/소유자 권한이 있어야 합니다. main 배포 후 /analytics/ 에서 로그인하면 됩니다.

OAuth 범위는 analytics.readonly와 webmasters.readonly입니다. 토큰은 브라우저 메모리에만 보관하고 페이지를 떠나면 버립니다. 관리자 비밀번호를 공개 HTML이나 JS에 저장하지 않습니다. OAuth 설정이 없는 경우 관리자 화면에 설정 안내와 공식 서비스 링크가 표시됩니다.

## 공개 인기 글 TOP 5 자동 갱신

GitHub Actions는 **GA4 읽기 전용 서비스 계정**으로 집계값만 가져옵니다. 관리자 OAuth와 별도입니다.

1. Google Cloud에서 전용 서비스 계정을 만듭니다. 프로젝트 Editor 등 광범위한 역할이나 JSON 비밀키는 필요하지 않습니다.
2. Google Analytics의 기존 속성에 서비스 계정 이메일을 **Viewer**로 추가합니다. Search Console 원시 데이터는 자동 집계 계정에 제공하지 않습니다.
3. Workload Identity Federation 풀과 GitHub OIDC 공급자를 만들고, 신뢰 조건을 저장소의 **숫자 repository_id·repository_owner_id**, `refs/heads/main`, `.github/workflows/blog-pages-deploy.yml@refs/heads/main`으로 제한합니다. 이름만 검사하면 삭제 후 재사용 위험이 있습니다.
4. 이 조건을 통과하는 GitHub 주체에만 해당 서비스 계정의 `roles/iam.workloadIdentityUser`를 부여합니다. 프로젝트 전체 역할이나 `Service Account Token Creator`는 부여하지 않습니다.
5. 저장소 Actions **Variables**에 `GA4_WORKLOAD_IDENTITY_PROVIDER`(전체 공급자 리소스 이름), `GA4_SERVICE_ACCOUNT_EMAIL`, `PUBLIC_GA4_PROPERTY_ID`를 등록합니다. 모두 비밀키가 아닌 식별자입니다.
6. Google Cloud에서 Analytics Data API, IAM API, IAM Service Account Credentials API, Security Token Service API를 활성화합니다.
7. Deploy Blog to Pages는 Google 공식 인증 액션을 고정 커밋으로 사용하여 Analytics 읽기 전용 범위의 **10분짜리 토큰**을 발급받습니다. 토큰은 집계 단계의 환경변수로만 전달합니다. 자격증명 파일 생성과 공통 환경변수 내보내기를 꺼 두며, Astro 빌드에는 토큰을 전달하지 않습니다.
8. main push, 수동 실행 및 매일 한국시간 08:30 예정 실행에서 집계한 뒤 Astro 빌드를 배포합니다. GitHub 예약 실행은 지연될 수 있습니다.

장기 JSON 키와 `GA4_SERVICE_ACCOUNT_JSON`은 사용하지 않습니다. 관리자 OAuth는 별도로 본인의 Google 계정에서 읽기 권한을 요청합니다. WIF 또는 API 오류 시 사이트 배포는 계속되지만, 빈 통계를 실제 연결 성공이라고 표시하지 않습니다.

공개 파일 URL은 https://jjo-0.github.io/analytics/popular.json 입니다. 공개 데이터는 version, updatedAt, window, posts의 path/title/views로 제한합니다. GA4 screenPageViews를 pagePath/pageTitle 기준으로 조회하며 /posts/... 와 /en/posts/...의 글 경로만 남기고 상위 최대 5개만 게시합니다. 검색어 등 상세 개인 분석 데이터를 공개하지 않습니다.

Google 단기 인증 또는 API가 실패하면 배포는 계속되고, UI는 통계 준비 중/일시적 불가를 표시합니다. 과거에 추적하지 않은 방문량을 소급 생성할 수는 없습니다.

## 통계 해석·검증

- 조회수(Views)는 방문자 수(Users)와 다릅니다. 반복 조회가 포함됩니다.
- GA4 조회 기간은 속성에서 설정한 시간대 기준 **어제, 지난 7일, 지난 30일의 완료된 날짜**입니다. 속성 시간대는 Asia/Seoul 권장.
- 카테고리는 실제 게시물 분류(src/lib/taxonomy.mjs)를 사용하며 News는 별도 구분합니다. AI·Robotics·Semiconductor·Research 주제별 지표는 제목·태그 기반 **참고 분류**로 중복될 수 있습니다.
- Search Console API는 미국 태평양 시간 기준으로 최근 3일을 제외한 확정 데이터만 조회합니다. 일부 검색어는 익명 처리되거나 상위 행만 반환됩니다. 검색어 합계를 전체 클릭과 동일시하지 마세요.
- 검증 절차: GA4 Reports → Engagement → Pages and screens 에서 인기 글 수치 대조, Search Console 실적에서 검색어 비교, /analytics/ 관리자 수치 확인, /analytics/popular.json 갱신 시각·내용 확인.
- Astro ClientRouter로 페이지를 옮길 때 GA4 page_view가 누락/중복되지 않는지 배포 후 GA4 DebugView/실시간 보고서로 직접 검증하세요. 추적 코드 중복 삽입을 피하기 위해 기존 GA4 코드는 변경하지 않았습니다.
- 분석과 광고 서비스에서 발생하는 개인정보 처리 관련 법적 동의 및 안내는 별도로 확인해야 합니다.

## 로컬 테스트

    cd spaceship-ui
    node scripts/analytics-contract.mjs
    node scripts/sync-popular-analytics.mjs
    pnpm check
    pnpm lint
    pnpm build

Google API 자격증명 없는 CI도 빈 공개 JSON을 안전하게 빌드하며 집계 처리 계약을 검증합니다.

## 화면의 안내와 세션 정리

`/analytics/`에는 기능, 설정 순서, 공개 범위와 최신 배포 확인 링크를 직접 표시합니다. 빌드 시 OAuth·숫자 속성 ID의 등록 여부만 설명하며 API 접속 성공으로 표시하지 않습니다. 서비스 계정 키나 비밀 입력 폼은 넣지 않습니다.

GitHub Pages의 정적 HTML과 JavaScript, `PUBLIC_` 식별자는 공개됩니다. noindex나 로그인 버튼으로 안내문 자체를 비밀로 만들 수 없습니다. 실제 GA4·Search Console 보고서의 접근 제어는 Google API가 로그인한 계정의 권한으로 수행합니다. 안내문까지 소유자만 보이게 할 필요가 있다면 인증 가능한 서버/프록시나 접근 제어 호스팅이 추가로 필요합니다.

토큰은 브라우저 메모리에만 두고, 로그아웃·페이지 전환·Google 토큰 만료 때 보고서 DOM을 비우며 진행 중 요청을 취소합니다. 취소 직전 응답이 뒤늦게 도착해도 새 세션이나 로그아웃 화면에 반영하지 않습니다. 기간 변경 때도 이전 결과를 지워 새 날짜에 예전 수치가 남지 않게 합니다. 이 처리는 브라우저에 이미 표시됐던 내용을 복사하거나 개발자 도구로 관찰하는 것을 막는 기능은 아닙니다.

브라우저 회귀 검사는 실제 계정 없이 Google SDK/API의 명시적 시험 응답을 사용해 로그인·안전한 텍스트 표시·로그아웃·토큰 만료·지연 응답·페이지 이탈을 검사합니다. 이 검사 통과를 실제 Google 권한 연결이나 방문 데이터 수집 검증으로 보고하지 않습니다.

- [GitHub Pages의 정적 호스팅](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Google 브라우저 토큰 모델](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [서비스 계정 키 보호](https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)

## 이 블로그에 확인된 연결 대상

- 전용 Google Cloud 프로젝트: `jjo-blog-analytics` (번호 `73744091730`)
- GA4 숫자 속성: `486835586` / 측정 ID: `G-JL4J2492X6`
- Search Console URL-prefix 속성: `https://jjo-0.github.io/`
- GitHub 저장소 숫자 ID: `533363511`, 소유자 숫자 ID: `76779256`

위 값은 공개 식별자이며, 실제 API 조회가 성공했다는 증거와는 구별합니다. 데이터가 5개보다 적으면 존재하는 글만 표시하며, Search Console이 0건을 반환하면 실제 0건으로 표시합니다. 방문 기록을 만들어 채우지 않습니다.

- [배포 파이프라인의 비밀키 없는 인증](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [Google 공식 GitHub 인증 액션](https://github.com/google-github-actions/auth)

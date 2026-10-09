# 이사야 43:18–21 연구 3편 — 2026-10-09

## 제공 자료와 구현

세 대시보드를 원본 그대로 `src/data/isaiah43/originals/`에 보존한다. Library 텍스트 읽기의 모든 연속 구간을 조합했고 68,296 / 81,660 / 77,559 bytes가 원본 메타데이터와 일치했다. 별도로 전달받은 전체 연구 JSON은 674,392 bytes이며 SHA256은 manifest에 기록했다. 비공개 Gemini 대화 URL이 포함된 원본 JSON은 공개 저장소에 넣지 않는다.

각 글은 기존 MDX/성경 연구 컴포넌트 구조에 맞춘다.

1. 이사야 43:18–21 ① — 역사·문법·통합 연구
2. 이사야 43:18–21 ② — 문학·수사·담화·은유 비평
3. 이사야 43:18–21 ③ — 사회과학·기억론·신학·수용사

경로는 `/posts/isaiah-43-18-21-1/`부터 `-3/`까지다. 각 글에서 세 연구 링크, 대시보드, `Gemini 채팅 본문`, 전체 본문과 인용 출처를 제공한다. 성경/Writing 목록에서도 하나의 접힌 연구 묶음으로 연결된다. 새 목록은 기존 Writing HTML 용량 한도 안에서 간결한 링크를 사용한다.

## 원문 보존과 표시 계층

`compile-isaiah43.mjs`는 확인된 수정만 적용한다.

- 1·3번: Markdown 전송 과정의 HTML/URL/문장부호 앞 백슬래시와 `&#x20;`를 복원한다. 실제 파일에 `&amp;#x20;`는 없었다.
- 2번: 24행의 `slate-navy:`를 `'slate-navy':`로 인용하여 JavaScript 구문 오류를 수정한다.
- 대시보드의 원래 데이터와 앱 스크립트는 위 정규화 외에 바꾸지 않는다. Tailwind 3.4.17 CSS를 컴파일하고 기존 저장소의 로컬 Chart.js를 사용한다.
- 별도 adapter가 배경 #f3efe4, 글자 #1d211c, 강조 #315e51과 다크 테마를 적용한다. 차트는 수치를 유지하며 색상만 바꾼다. 클릭 카드의 키보드 동작과 입력 접근성도 추가한다.
- 연구 본문은 UI용 빈 Gemini carousel/Angular 래퍼만 제거한다. 일반 텍스트의 완전 일치를 컴파일 단계에서 검증하며, 표는 7/4/6개 보존한다.
- 본문에 남은 `**물(홍해)**`, `**물(강)**`는 `<strong>` 표시로 정규화한다. 어휘는 바꾸지 않고, 비교 시 해당 강조 구분자만 제외한다.
- `sup[data-turn-source-index]`를 보고서별 참고문헌 anchor로 연결한다. 출처는 17/41/51개, 본문 인용은 58/29/76개다.
- 학술자료 접근 제한 문구와 원자료의 주장은 보존한다. 출처의 실재·내용·학설을 독립적으로 검증 완료했다는 의미는 아니다.

## 재현

프로젝트의 `pnpm@10.19.0`을 사용한다. 환경 기본 pnpm 11은 별도의 사용자 경로 생성 오류를 냈으므로 이번 실행에서는 npm exec로 명시한 10.19.0을 사용했다. 기존 lockfile과 의존성은 변경하지 않았다.

```sh
node scripts/compile-isaiah43.mjs /absolute/private/isaiah-43-18-21-full-reports.json
pnpm isaiah:check
pnpm build
pnpm content:check
```

브라우저 검사는 Playwright 설치 경로를 `JJO_PLAYWRIGHT_MODULE`, Chromium 경로를 `JJO_CHROMIUM`으로 지정할 수 있다. 기본 검증 URL은 localhost:4321이며 `JJO_ISAIAH_BASE`로 변경한다. 결과와 screenshots는 `JJO_ISAIAH_OUTPUT`에 저장한다.

## 검증

- Astro production build: 558 pages 완료. rendered-markdown-audit 통과.
- Astro check: 0 errors, 0 warnings, 기존/제3자 코드를 포함한 hints 78개.
- Svelte check: 0 errors / 0 warnings.
- ESLint: 0 errors, 기존 다른 파일 경고 3개.
- SEO: 183 posts 통과.
- 전체 content:check 및 새 isaiah:check 통과. 원본 해시, 명시적 정규화, JavaScript 파싱, 표/인용, 비공개 링크 배제 포함.
- 브라우저: 390/1440px × 3개 글 × 밝은/어두운 테마. 실제 탭 클릭, 차트 6개, 검색/초기화, 키보드 모달, 인용 링크, 가로 넘침, 오류 및 비공개 링크 부재 확인. 최종 production build를 별도 HTTP 서버에서 동일하게 재검증하여 통과했다.
- 이미지 3개의 실제 픽셀과 원출처 이용조건을 확인했다. 연구 ① N절 첫 문단 뒤에 느부갓네살 원통, 연구 ③ A절 첫 문단 뒤에 바빌론 지도, F절 첫 문단 뒤에 사자 부조를 표시 계층으로 삽입한다. 원래 본문 파일은 바꾸지 않는다. 각 이미지에 출처·이용조건·대체 텍스트·원본 크기와 역사적 설명의 한계를 표시한다.

## 전송 진단과 네이버 인계

Library prepare_materialize는 정상 응답했지만 서명 다운로드 호스트는 소비 환경의 프록시에서 `Tunnel connection failed: 403 Forbidden`을 반환했다. `/workspace/isaiah43-inputs`와 명시적 재시도 경로 `/workspace/JJo-0.github.io/.isaiah-inputs`의 전송은 실패했으며 부분 파일은 없었다. 같은 호출을 추가 반복하지 않고, 지원되는 Library read 경로로 전체 텍스트를 받아 원본 크기와 로컬 Library 메타데이터를 검증했다. GitHub와 Library 읽기/저장은 정상 동작했다.

이 작업에는 적용 가능한 AGENTS.md/.agents/skills가 없었다. 저장소의 `docs/post-authoring.md`, 기존 성경 대시보드 및 본문 컴파일 방식, `ops/blog-harness/RUNBOOK.md`를 참고했다. 런북은 GitBlog/Blogger/Instagram 흐름이며 네이버 자동 임시저장 절차로 확인된 것은 아니다.

전달 묶음에는 코드 패치, 독립 대시보드 미리보기, 네이버 편집용 전체 본문 HTML 3개, 브라우저 증거, 기존 바빌론 이미지 3개와 출처/캡션이 들어 있다. 네이버 편집기에 옮긴 뒤 표·각주·사진을 실제 편집기에서 확인해야 한다. 바빌론 도시 지도에는 후대 그리스 극장이 포함되므로 기원전 6세기만의 정확한 복원도로 설명하지 않는다. 네이버 전체 연구는 부모 작업에서 발행을 확인했다: https://blog.naver.com/jjo_09_/224436720898 . 각 글 하단의 접힌 원문·출처 영역에서 이 확인된 공개 원문을 연결한다. 후속 사용자 승인에 따라 이 변경은 GitHub PR/검사/main 병합과 기존 Pages 배포 워크플로를 통해 공개한다.

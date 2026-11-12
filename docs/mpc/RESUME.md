# MPC 제어 — 이어쓰기 진입점

갱신일: 2026-11-12 (Asia/Seoul)

## 사용자 선택

Stanford AA203을 기본 설명 흐름으로, IMT Lucca Alberto Bemporad MPC를 심화 자료로 사용한다. 기존 강화학습 시리즈는 별도로 유지한다.

## 블로그 구성

- 묶음 제목: **MPC 제어**
- 챕터 제목: **MPC 제어 NN — 부제**
- series.id: `mpc-control`
- category: `robotics-embedded`; subcategory: `model-predictive-control`
- 챕터 하나가 게시글 하나다. 각 글 안에서 원본 슬라이드 한 장과 바로 아래 한국어 설명을 반복한다.
- 기존 `SeriesGroup.astro`를 재사용한다. `GroupedWritingList.astro`에 표시 이름과 한 챕터만 있을 때의 묶음 조건을 추가했다.
- 실제 게시된 챕터만 편수로 센다. 계획된 장의 빈 게시글을 만들지 않는다.
- UI 변경 커밋: `566c0b29da172dadb9866705f5556b5866a5cfb1`.

## 비공개 작업본

Repository: `JJo-0/Onto_base` (private)
Branch: `blog-mpc-series`
Directory: `blog/mpc/`
Verified chapter-01 checkpoint: `d92750bf1637e36943a31242fc3944ab5b6d84f5`

[재개 규칙](https://github.com/JJo-0/Onto_base/blob/blog-mpc-series/blog/mpc/RESUME.md) · [현재 상태](https://github.com/JJo-0/Onto_base/blob/blog-mpc-series/blog/mpc/state.json)

접근 권한이 있는 작업자는 브랜치 최신 HEAD와 상태를 먼저 확인한다. 위 checkpoint만으로 이후 변경이 없다고 가정하지 않는다.

## 현재와 다음 작업

01장 「미래를 계산하고 첫 행동만 실행하는 이유」의 한국어 초안, 출처·검토 기록, 자체 MPC 입문 실습을 비공개 작업본에 저장했다. 본문 범위는 AA203 L11 PDF 1–6쪽이며, IMT PDF 5·6·12쪽의 관련 텍스트를 보충했다. 원본은 공식 PDF 페이지별 뷰어와 fallback 링크로 연결한다. 개별 이미지 업로드나 브라우저 렌더 검증을 완료한 상태는 아니다.

원본 PDF/PPTX 확보 및 파일 검증을 마쳤다. 직접 시각 검수와 영상 자막 확보는 미완료다. 자체 스칼라 예제는 실제 실행했고 단위 테스트 15개, 원고 구조 검사 14개가 통과했다. 공식 PORA 과제 실행이나 논문 재현은 아니다.

다음 순서: 기존 01장 원고·검토 기록 읽기 → AA203 1–6쪽 및 IMT 5·6·12쪽 실제 그림 대조 → 데스크톱/모바일 원본 표시와 재사용 범위 확인 → 02장을 AA203 L11 P007 이후에서 시작. 자막은 실제 확보한 범위만 기록한다. 이미 작성된 01장을 새로 만들지 않는다.

## 공개 제한과 검증

이 브랜치에는 UI 변경과 이 안내만 있다. 비공개 원고, 강의 파일, 자막 원문을 공개 저장소에 복사하지 않았다. 공개 게시글 파일을 생성하지 않았고 main 병합·사이트 배포도 실행하지 않았다. 전체 Astro 빌드 및 브라우저 렌더 검증은 미실행이다. 공개 전환은 별도 지시를 따른다. 이 파일은 예약 실행이 아니다.

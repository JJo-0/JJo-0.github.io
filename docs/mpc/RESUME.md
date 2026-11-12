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
Verified initialization checkpoint: `bdb6f7c721d4f259b4dc76a54af5bda95816d821`

[재개 규칙](https://github.com/JJo-0/Onto_base/blob/blog-mpc-series/blog/mpc/RESUME.md) · [현재 상태](https://github.com/JJo-0/Onto_base/blob/blog-mpc-series/blog/mpc/state.json)

접근 권한이 있는 작업자는 브랜치 최신 HEAD와 상태를 먼저 확인한다. 위 checkpoint만으로 이후 변경이 없다고 가정하지 않는다.

## 현재와 다음 작업

12개 챕터의 잠정 편집 계획, 01장 집필 설계, 공식 선형 MPC 코드 정적 검토를 비공개 작업본에 저장했다. 원본 슬라이드별 완성 원고, 자막 확보, 실습 실행은 아직 완료하지 않았다.

다음 순서: AA203 L11 공식 PDF/PPTX 확보와 판본 대조 → 원본 페이지별 색인·시각 검토 → IMT Linear MPC의 대응 페이지 확인 → 01장 본문 작성. 공식 실습은 TODO·solver 상태 처리·제약 검증을 확인하며 별도로 구현한다.

## 공개 제한과 검증

이 브랜치에는 UI 변경과 이 안내만 있다. 비공개 원고, 강의 파일, 자막 원문을 공개 저장소에 복사하지 않았다. 게시글 파일을 생성하지 않았고 main 병합·사이트 배포도 실행하지 않았다. 전체 Astro 빌드 및 브라우저 렌더 검증은 미실행이다. 공개 전환은 별도 지시를 따른다. 이 파일은 예약 실행이 아니다.

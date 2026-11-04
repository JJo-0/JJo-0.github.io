# 강화학습 시리즈 — 이어쓰기 진입점

최종 게시 대상은 이 블로그지만, 원고는 아직 비공개 작업본이다. 이 파일은 콘텐츠가 아니라 승인된 작업자가 다시 시작할 위치만 안내한다.

시리즈의 주제목은 **강화학습**이며 각 장의 제목은 **강화학습 NN — 부제** 형식으로 작성한다. 원본 강의명은 출처 표기에서 유지한다.

## 기존 블로그와 같은 챕터 묶음

- 기존 ‘현대 인공지능’, ‘Human and Robotics’와 같은 접이식 `SeriesGroup.astro`를 재사용한다.
- 묶음 이름은 **강화학습**이다. 챕터 하나가 게시글 하나이며, 슬라이드별로 게시글을 나누지 않는다.
- 각 챕터 본문 안에서 원본 슬라이드 한 장과 그 아래 한국어 해설을 순서대로 배치한다. 관련 강의·논문·코드는 해당 구간에 연결한다.
- 공통 `series.id`는 `rl-robot-learning`이고 `series.order`는 챕터 순서다. 같은 category/subcategory를 유지한다.
- 01장만 있어도 묶음으로 표시하고, 게시된 챕터 수만 편수로 센다. 미작성 챕터의 빈 게시글은 만들지 않는다.
- 구현: `spaceship-ui/src/components/GroupedWritingList.astro`의 표시 이름 및 단일 챕터 묶음 조건. 구현 커밋: `d72e087ed94d712bf10ba1a5f23cfe8f92b11e84`.
- 로컬 검증: Node v22.16.0에서 실제 컴포넌트 frontmatter의 분류·정렬 로직을 실행한 8개 검증 통과. 기존 시리즈 동작과 빈 목록도 확인했다. 전체 Astro 빌드·브라우저 렌더·배포 검증은 하지 않았다.

## 작업 원본

- Repository: `JJo-0/Onto_base` (private)
- Branch: `blog-rl-series`
- Directory: `blog/robot-learning/`
- [이어쓰기 규칙](https://github.com/JJo-0/Onto_base/blob/blog-rl-series/blog/robot-learning/RESUME.md)
- [진행 상태](https://github.com/JJo-0/Onto_base/blob/blog-rl-series/blog/robot-learning/state.json)
- 이번에 확인한 private checkpoint: `e0a9682a305e14a0cbdf3a0c6b117eef48ab91e5`
- 갱신일: 2026-11-04 (Asia/Seoul)

위 링크는 해당 비공개 저장소의 접근 권한이 필요하다. 향후 작업에서는 고정 checkpoint만 보지 말고 비공개 브랜치의 최신 상태를 읽는다.

## 이어서 작업할 때

비공개 저장소의 `RESUME.md`와 `state.json`을 먼저 읽고 기록된 다음 작업부터 진행한다. 원고와 근거·검증 상태를 함께 저장한 뒤 이 안내의 checkpoint를 갱신한다. 챕터 묶음 변경만으로 원본·영상·실습 검토 진도를 올리지 않는다.

## 공개 제한

- `draft: true`와 Draft PR은 공개 저장소의 원문을 숨기지 않는다.
- 비공개 원고, 원본 슬라이드 파일, 자막 원문을 이 공개 브랜치에 복사하지 않는다.
- 사용자의 공개 전환 지시 없이 main 병합·게시글 생성·사이트 배포를 하지 않는다.
- 이 파일은 자동 실행 예약이 아니다.

이 브랜치에는 이어쓰기 안내와 챕터 묶음 UI 변경만 있다. `spaceship-ui/site/content/posts`와 공개 게시글은 변경하지 않았고, main 병합이나 사이트 배포도 하지 않았다.

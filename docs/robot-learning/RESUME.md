# 강화학습 시리즈 — 이어쓰기 진입점

최종 게시 대상은 이 블로그지만 원고는 아직 비공개 작업본이다. 이 파일은 미발표 본문이 아니라 승인된 작업자가 다시 시작할 위치를 안내한다.

시리즈의 주제목은 **강화학습**이며 각 장의 제목은 **강화학습 NN — 부제** 형식이다. 원본 강의명은 출처 표기에서 유지한다.

## 기존 블로그와 같은 챕터 묶음

- 기존 ‘현대 인공지능’, ‘Human and Robotics’와 같은 접이식 `SeriesGroup.astro`를 재사용한다.
- 묶음 이름은 **강화학습**이다. 챕터 하나가 게시글 하나이며 슬라이드별 게시글을 만들지 않는다.
- 챕터 본문 안에서 원본 슬라이드 한 장과 그 아래 한국어 해설을 반복한다. 관련 강의·논문·코드는 해당 구간에 연결한다.
- 공통 `series.id`는 `rl-robot-learning`이고 `series.order`는 챕터 순서다. category/subcategory를 통일한다.
- 01장만 있어도 묶음으로 표시하고 게시된 챕터 수만 편수로 센다. 미작성 챕터의 빈 글은 만들지 않는다.
- 구현: `spaceship-ui/src/components/GroupedWritingList.astro`의 표시 이름과 단일 챕터 조건. 구현 커밋: `d72e087ed94d712bf10ba1a5f23cfe8f92b11e84`.
- 이전 로컬 검증은 Node v22.16.0에서 분류·정렬 로직 8개 경우 통과다. 전체 Astro 빌드·브라우저 렌더·배포 검증이 아니며 이번 원고 검토에서 다시 실행한 것도 아니다.

## 작업 원본

- Repository: `JJo-0/Onto_base` (private)
- Branch: `blog-rl-series`
- Directory: `blog/robot-learning/`
- [원고 목록과 진행 요약](https://github.com/JJo-0/Onto_base/blob/blog-rl-series/blog/robot-learning/README.md)
- [이어쓰기 규칙](https://github.com/JJo-0/Onto_base/blob/blog-rl-series/blog/robot-learning/RESUME.md)
- [진행 상태](https://github.com/JJo-0/Onto_base/blob/blog-rl-series/blog/robot-learning/state.json)
- 이번 private checkpoint: `1f0359de411569d12e0fa5e13babc2f90ad6495c`
- 갱신일: 2026-11-04 (Asia/Seoul)

위 링크는 비공개 저장소 접근 권한이 필요하다. 다음 작업에서는 고정 checkpoint만 보지 말고 비공개 브랜치 최신 HEAD와 파일을 읽는다.

## 현재 재개 지점

01장의 44개 텍스트 구간 중 P001–P008은 축소 사본의 제목·구성을 대조하고 해설을 수정했다. 다음 기본 작업은 **01장 P009–P016**이다. 첫 8쪽의 원해상도 세부·공식 PDF·영상 대조는 별도 미완료 항목으로 유지한다. 02장을 시작한 상태는 아니다.

축소 이미지 구성 검토, 원해상도 정밀 검수, 자막 확인, 코드 실행은 서로 다른 진도다. 정확한 범위는 비공개 `state.json`과 검토 기록에서 읽으며, 안내나 UI 변경만으로 진도를 올리지 않는다. 이번 자체 실습은 기존 소스 동일성 확인 후 13개 테스트와 실행을 재확인했다. 이는 강화학습 훈련이나 논문 재현이 아니다.

## 이어서 작업할 때

비공개 `RESUME.md`와 `state.json`을 읽고 기록된 다음 작업부터 진행한다. 기존 원고를 새로 만들지 말고, 변경한 본문과 근거·검증·상태를 함께 저장한 뒤 이 안내의 checkpoint를 갱신한다.

## 공개 제한

- `draft: true`와 Draft PR은 공개 저장소 원문을 숨기지 않는다.
- 미발표 원고, 원본 슬라이드 바이너리, 자막 원문을 공개 브랜치에 복사하지 않는다.
- 사용자의 공개 전환 지시 없이 main 병합·공개 게시글 생성·사이트 배포를 하지 않는다.
- 이 안내는 자동 실행 예약이 아니다.

이번 공개 저장소 변경은 이 이어쓰기 안내뿐이다. 미발표 원고는 비공개 저장소에 유지했으며 공개 게시글·main·사이트 배포는 변경하지 않았다.

# 자가개선 AI 강의 해설

Hung-yi Lee의 NTU Machine Learning 2026 Spring, **Self-Improving 상편**을 한 장씩 해설한다. 표지는 1쪽이며 원본은 총 62쪽이다.

| 글 | 원본 페이지 | 내용 |
|---|---|---|
| [01](https://jjo-0.github.io/posts/self-improving-ai-01-overview/) | 1–5 | 자기개선의 범위, 재귀적 개선, 피드백과 평가 |
| [02](https://jjo-0.github.io/posts/self-improving-ai-02-learning-targets/) | 6–10 | 학습 목표, 손실, 지식 증류, 자기 생성 의사 정답 |
| [03](https://jjo-0.github.io/posts/self-improving-ai-03-self-correction-to-rl/) | 11–15 | 자기수정, 고정 파라미터, 미세조정, 지도학습과 강화학습 |

독자 화면은 영어로 편집한 슬라이드 다음에 한국어 해설을 배치한다. 이미지의 중국어를 옮긴 자료는 **비공식 영어 편집본**이며, 공식 영문판으로 소개하지 않는다. 그림과 수식의 원본 페이지는 각 이미지에서 직접 연결한다. 원래 영어로 구성된 3·4쪽은 원본 렌더를 그대로 사용한다. 원문에 없는 계산 예시와 유도는 본문에서 추가 해설임을 밝힌다.

- [공식 강의](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php)
- [공식 PDF](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf)
- [공식 PPTX](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pptx)
- [강의 영상](https://www.youtube.com/watch?v=s06mSAGN4gM)

원문·제공 자막 대조일은 2026-11-12, 영어 편집본의 준비일은 2026-11-16이다. 영상 시간은 제공 자막의 주제 설명 구간이며 정확한 화면 전환 프레임과 동일하다고 주장하지 않는다.

## 기록

- `source-assets/01/manifest.json`: 1–5쪽의 원문과 출력 이미지 메타데이터
- `source-assets/02/manifest.json`: 6–10쪽의 원문과 출력 이미지 메타데이터
- `progress.json`: 현재 작성 범위와 다음 시작 페이지

원본 자료의 재사용·수정 조건은 `unverified`로 기록한다. 공개 접근과 출처 표시를 라이선스로 취급하지 않으며, 포함된 제3자 이미지에도 별도 권리가 있을 수 있다.

## 2026-11-16 발행 승인 범위

저장소 소유자가 원본 1–15쪽을 다루는 세 편의 GitBlog 발행을 명시적으로 승인했다. 이 결정은 해당 묶음에 한정한 운영 정책 예외이며 원본 저작권자의 이용·수정 허가를 확인한 것으로 취급하지 않는다. `rightsStatus`는 `unverified`를 유지한다.

일반 자동 권리확인 경로의 `publish-gate` 실패 기록과 소유자의 별도 발행 결정은 [승인 범위 기록](publishing/2026-11-16-owner-exception.json)에 구분했다. 하네스, CI, 저장소 권한과 일반 콘텐츠 정책은 변경하지 않았다. 과거 검수 기록은 당시 원고 해시와 결과를 보존하며, 새 발행본의 검사·배포 상태는 별도로 기록한다.

## 공개 상태

2026-11-16에 [PR #200](https://github.com/JJo-0/JJo-0.github.io/pull/200)을 `main`에 병합하고 세 공개 페이지를 확인했다. 영어 슬라이드 15장과 한국어 해설 3편의 발행 범위는 원본 1–15쪽이다. **다음 시작은 16쪽이며, 희소 보상(Sparse reward)과 로봇의 문 열기 예제를 다룬다.**

정확한 커밋·CI·배포·페이지 확인 기록은 [발행 검증](reviews/2026-11-16-publication.json)에 있다.

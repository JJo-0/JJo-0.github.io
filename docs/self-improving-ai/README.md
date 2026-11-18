# 자가개선 AI 강의 해설

Hung-yi Lee의 NTU Machine Learning 2026 Spring, **Self-Improving 상편**을 한 장씩 해설한다. 표지는 1쪽이며 원본은 총 62쪽이다.

| 글 | 원본 페이지 | 내용 |
|---|---|---|
| [01](https://jjo-0.github.io/posts/self-improving-ai-01-overview/) | 1–5 | 자기개선의 범위, 재귀적 개선, 피드백과 평가 |
| [02](https://jjo-0.github.io/posts/self-improving-ai-02-learning-targets/) | 6–10 | 학습 목표, 손실, 지식 증류, 자기 생성 의사 정답 |
| [03](https://jjo-0.github.io/posts/self-improving-ai-03-self-correction-to-rl/) | 11–15 | 자기수정, 고정 파라미터, 미세조정, 지도학습과 강화학습 |
| [04](https://jjo-0.github.io/posts/self-improving-ai-04-sparse-rewards-and-shaping/) | 16–20 | 희소 보상과 보상 설계 |
| [05](https://jjo-0.github.io/posts/self-improving-ai-05-reward-design-to-ai-feedback/) | 21–25 | 보상 설계와 AI 피드백 |
| [06](https://jjo-0.github.io/posts/self-improving-ai-06-self-evaluation-and-entropy/) | 26–30 | 자기평가와 엔트로피 |
| [07](https://jjo-0.github.io/posts/self-improving-ai-07-unsupervised-rlvr-and-test-time-training/) | 31–35 | 자기학습의 한계와 테스트 시점 학습 |
| [08](https://jjo-0.github.io/posts/self-improving-ai-08-entropy-estimation-and-gradients/) | 36–40 | 엔트로피 추정과 빠진 경사 |
| [09](https://jjo-0.github.io/posts/self-improving-ai-09-entropy-paths-and-self-generated-inputs/) | 41–45 | 경로 선택, 음성인식 결과표, AI 평가와 입력 생성 |
| [10](https://jjo-0.github.io/posts/self-improving-ai-10-self-play-and-external-feedback/) | 46–50 | 문제 생성과 자기대결, 의사정답의 신뢰도, 외부 정보 |

2026-11-18 소스 체크포인트: 9편의 main 병합과 공개 배포는 [PR #206](https://github.com/JJo-0/JJo-0.github.io/pull/206), [발행 기록](reviews/2026-11-18-chapter-09-publication.json)으로 확인했다. 이번 리비전은 1–9편의 읽기 흐름을 정리하고 10편을 추가한다. 실제 최종 배포 상태는 이 리비전 PR에 기록한다. **다음 제작 범위는 11편, 원본 51–55쪽**이다. 아래의 이전 날짜 기록은 당시 작업 범위와 증거를 보존한다.

## 독자 본문 편집 기준

2026-11-18 사용자 요청을 이후 편에도 적용한다.

- 글은 핵심 개념과 앞 편의 질문에서 시작한다. 강의일, 표지를 포함한 페이지 세기, 작업 날짜, 도구와 자막 트랙 종류, 이미지 제작·편집 범위는 도입이나 캡션에 나열하지 않는다.
- 실제 강의 설명과 시각 링크는 관련 개념 곁에 유지한다. 전체 시간 대응표는 기본 닫힘인 `<details>` 안에 두며 summary는 **슬라이드별 영상 위치**로 통일한다.
- 그림 캡션은 그림이 설명하는 내용을 짧게 쓴다. 저자·기관과 원문 페이지 링크를 유지한다. 원본 렌더·비공식 편집·재현 여부 같은 제작 기록은 manifest에 둔다.
- 가정, 실험 조건, 단위, 계산 예의 설정, 실제 수식 오류를 바로잡는 설명은 필요한 절에서 간결하게 설명한다. 원문과 다른 수식을 오류인 채 옮기지 않는다.
- 검산 기록과 재현 코드는 글 끝의 기본 닫힘 details에서 연결한다. 본문을 검사 결과 보고서로 만들지 않는다.
- 출처·제공 자막·버전·파일 해시·편집 내역은 이 문서 디렉터리에서 추적한다. 독자에게 필요 없는 과정 설명을 본문에 다시 넣지 않는다.

이번 정리에서 1–9편의 수식 298개와 이미지 81개는 그대로 유지했다. [리비전 기록](reviews/2026-11-18-editorial-cleanup-01-09.json)은 본문 전후 해시와 보존 검사를 담는다.

## 원자료 관리

독자 화면은 슬라이드 다음에 한국어 해설을 배치한다. 이미지의 중국어를 옮긴 자료는 비공식 영어 편집본이며, 공식 영문판으로 소개하지 않는다. 그림과 수식의 원본 페이지는 각 이미지에서 직접 연결한다. 원래 영어로 구성된 페이지는 원본 렌더를 그대로 사용한다. 계산 예의 설정은 해당 설명에서 밝히며, 제작 과정 자체에 대한 반복 안내는 위 편집 기준에 따라 본문에서 생략한다.

- [공식 강의](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php)
- [공식 PDF](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf)
- [공식 PPTX](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pptx)
- [강의 영상](https://www.youtube.com/watch?v=s06mSAGN4gM)

원문·제공 자막 대조일은 2026-11-12, 영어 편집본의 준비일은 2026-11-16이다. 영상 시간은 제공 자막의 주제 설명 구간이며 정확한 화면 전환 프레임과 동일하다고 주장하지 않는다.

## 기록

- `source-assets/01/manifest.json`: 1–5쪽의 원문과 출력 이미지 메타데이터
- `source-assets/02/manifest.json`: 6–10쪽의 원문과 출력 이미지 메타데이터
- `source-assets/03/manifest.json`: 11–15쪽의 원문과 출력 이미지 메타데이터
- `progress.json`: 현재 작성 범위와 다음 시작 페이지

원본 자료의 재사용·수정 조건은 `unverified`로 기록한다. 공개 접근과 출처 표시를 라이선스로 취급하지 않으며, 포함된 제3자 이미지에도 별도 권리가 있을 수 있다.

## 2026-11-16 발행 승인 범위

저장소 소유자가 원본 1–15쪽을 다루는 세 편의 GitBlog 발행을 명시적으로 승인했다. 이 결정은 해당 묶음에 한정한 운영 정책 예외이며 원본 저작권자의 이용·수정 허가를 확인한 것으로 취급하지 않는다. `rightsStatus`는 `unverified`를 유지한다.

일반 자동 권리확인 경로의 `publish-gate` 실패 기록과 소유자의 별도 발행 결정은 [승인 범위 기록](publishing/2026-11-16-owner-exception.json)에 구분했다. 하네스, CI, 저장소 권한과 일반 콘텐츠 정책은 변경하지 않았다. 과거 검수 기록은 당시 원고 해시와 결과를 보존하며, 새 발행본의 검사·배포 상태는 별도로 기록한다.

## 기존 발행 상태 — PR #200

2026-11-16에 [PR #200](https://github.com/JJo-0/JJo-0.github.io/pull/200)을 `main`에 병합하고 세 공개 페이지를 확인했다. 영어 슬라이드 15장과 한국어 해설 3편의 발행 범위는 원본 1–15쪽이다. **다음 시작은 16쪽이며, 희소 보상(Sparse reward)과 로봇의 문 열기 예제를 다룬다.**

정확한 커밋·CI·배포·페이지 확인 기록은 [발행 검증](reviews/2026-11-16-publication.json)에 있다.

## 2026-11-16 보충 원본 자료 리비전

사용자의 1·2·3편 업데이트 요청에 따라 관련 설명 곁에 보충 자료를 배치했다. 각 편에 4개씩, **원본 영어 강의 슬라이드 9장과 원본 논문 그림 3개**를 추가한다. 기존 NTU 1–15쪽 이미지와 본문 수식은 유지하며, 02편에는 보충 해설 수식 11개를 추가한다. 다음 본 강의 시작 페이지는 16쪽 그대로다.

| 글 | 보충 원본 자료 | 출처·추출 기록 |
|---|---|---|
| 01 | DeepMind × UCL PDF 17쪽, GEPA 저자 강연 PDF 33·34쪽, DGM Figure 1 | [01 supplementary manifest](source-assets/01/supplementary-manifest.json) |
| 02 | Stanford CS229 PDF 9쪽, Lambert Lecture 7 PDF 14·21쪽, Noisy Student Figure 1 | [02 supplementary manifest](source-assets/02/supplementary-manifest.json) |
| 03 | Stanford CS329T PDF 45쪽, Aviral Kumar 발표 PDF 5쪽, Stanford CS224N PDF 92쪽, SCoRe arXiv v2 Figure 7 | [03 supplementary manifest](source-assets/03/supplementary-manifest.json) |

각 기록은 원작자, 원문 URL, PDF 쪽수와 인쇄 번호, 발췌 범위, 파일 해시, 본문 삽입 위치를 남긴다. 논문 그림은 강의 PPT로 부르지 않는다. 추가 이미지의 `rightsStatus`는 `unverified`, 이용·수정 허가 확인 값은 `false`로 유지한다. 관측한 라이선스 표시는 허가 확인과 별도 기록한다. 현재 사용자의 요청은 각 publishing job의 `revisionAuthorization`에 이 추가 12개 범위로 기록했으며, 이전 15개 본 강의 이미지의 발행 승인과 구분한다.

검수 기록은 [보충 자료 QA](reviews/2026-11-16-supplementary-qa.json)에 연결한다. publishing job의 `previousPublicationEvidence`와 progress의 `originalPublication`은 PR #200의 과거 발행 증거를 보존한다. 새 원고 해시는 이번 준비 리비전을 가리키며, **이번 리비전의 최종 병합·배포·공개 페이지 확인 증거는 [PR #201](https://github.com/JJo-0/JJo-0.github.io/pull/201)에 기록한다.** 이 준비 기록 자체가 현재 `main` 배포 완료를 뜻하지 않는다.

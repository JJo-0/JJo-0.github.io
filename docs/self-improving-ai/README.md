# 자가개선 AI 강의 해설

Hung-yi Lee의 NTU Machine Learning 2026 강의를 **상편과 하편**으로 나누어 한 장씩 해설한다. 글 번호는 연속으로 유지한다. 상편은 1–13편, 하편은 14–26편이며 두 PDF의 페이지 번호는 각각 1쪽에서 시작한다.

## 상편 — 1–13편

기준 자료는 `Self-Improving.pdf`이며 총 62쪽이다. **상편 1–13편의 main 병합과 공개 배포를 확인했다.**

| 글 | 상편 원본 페이지 | 내용 |
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
| [11](https://jjo-0.github.io/posts/self-improving-ai-11-automated-post-training/) | 51–55 | 후학습 자동화, 시간 예산, 가중 평가와 데이터 오염 |
| [12](https://jjo-0.github.io/posts/self-improving-ai-12-weak-to-strong-generalization/) | 56–60 | 약한 감독에서 강한 모델로의 일반화, PGR, 자동 정렬 연구와 전이 한계 |
| [13](https://jjo-0.github.io/posts/self-improving-ai-13-agent-harness-and-system-improvement/) | 61–62 | 에이전트 하네스, 도구·메모리·상호작용 기록의 개선 |

## 하편 — 14–26편

기준 자료는 [공식 하편 PDF](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf)이며 총 64쪽이다. 상편의 63쪽으로 이어서 세지 않는다.

| 글 | 하편 원본 페이지 | 내용·현재 상태 |
|---|---|---|
| [14](https://jjo-0.github.io/posts/self-improving-ai-14-proposer-solver-verifier/) | 1–5 | 출제자·풀이자·검증자, 학습 손실과 평가 손실, 자기학습의 외부 신호 — 발행·공개 검증 완료 |
| [15 원고](../../spaceship-ui/site/content/posts/self-improving-ai-15-harness-optimization-and-evaluation.mdx) | 6–10 | 모델과 하네스, AI의 수정안 생성, 비교 조건·토큰 예산·반복 신뢰성 — 원고·원전 검토와 로컬 빌드 완료 |
| [16 원고](../../spaceship-ui/site/content/posts/self-improving-ai-16-prompt-memory-code-evolution.mdx) | 11–15 | OPRO·GEPA·ALMA·DGM — 프롬프트·메모리·코드의 개선; 원고·이미지·수치·출처 검토 완료, 발행 검증 진행 |
| [17 원고](../../spaceship-ui/site/content/posts/self-improving-ai-17-archive-dspy-experience.mdx) | 16–20 | DGM 아카이브 계보·DSPy·하네스와 모델·ExpRAG 경험 검색 학습 — 원고 작성, 원본 이미지 및 보충 자료 렌더·배포 검증 진행 |
| [18 원고](../../spaceship-ui/site/content/posts/self-improving-ai-18-better-together-and-evolving-goals.mdx) | 21–25 | ExpRAG 경험 활용, BetterTogether, E-SPL, 목표 변화 — 원본·외부 강의 해설 9개 이미지 준비 및 17편 중국어 레이블 수정 |
| [19 한국어](../../spaceship-ui/site/content/posts/self-improving-ai-19-test-time-training-and-forgetting.mdx) · [English](../../spaceship-ui/site/content/english/en-self-improving-ai-19-test-time-training-and-forgetting.mdx) | 26–30 | 입력별·연속 TTT, 소음 속 음성인식의 빠른 적응과 느린 갱신, 경험 재생과 망각 |
| [20 한국어](../../spaceship-ui/site/content/posts/self-improving-ai-20-retaining-skills-and-improving-the-improver.mdx) · [English](../../spaceship-ui/site/content/english/en-self-improving-ai-20-retaining-skills-and-improving-the-improver.mdx) | 31–35 | 하네스의 망각, 워크플로 성공률과 능력 유지율, 고정 편집자와 DGM 비교 |
| [21 한국어](../../spaceship-ui/site/content/posts/self-improving-ai-21-learning-to-improve-the-improver.mdx) · [English](../../spaceship-ui/site/content/english/en-self-improving-ai-21-learning-to-improve-the-improver.mdx) | 36–40 | 다음 편집자의 학습, 부모 선택 실험, 손실 차이로 계산하는 편집 보상 |
| [22 한국어](../../spaceship-ui/site/content/posts/self-improving-ai-22-learning-the-parameter-update-rule.mdx) · [English](../../spaceship-ui/site/content/english/en-self-improving-ai-22-learning-the-parameter-update-rule.mdx) | 41–45 | 가중치 갱신과 학습 규칙의 구분, PostTrainBench의 후학습 성적, autoresearch의 실험 기록, AlphaEvolve와 ShinkaEvolve |
| [23 한국어](../../spaceship-ui/site/content/posts/self-improving-ai-23-self-edits-and-meta-learning.mdx) · [English](../../spaceship-ui/site/content/english/en-self-improving-ai-23-self-edits-and-meta-learning.mdx) | 46–50 | SEAL의 자기 편집, 학습 시간 척도, 학습된 최적화기와 MAML, 지원·질의 집합 |
| [24 한국어](../../spaceship-ui/site/content/posts/self-improving-ai-24-learning-inside-the-hidden-state.mdx) · [English](../../spaceship-ui/site/content/english/en-self-improving-ai-24-learning-inside-the-hidden-state.mdx) | 51–55 | TTT 층의 은닉 가중치, Titans와 Nested Learning, 문맥 학습과 상태 초기화 |
| [25 한국어](../../spaceship-ui/site/content/posts/self-improving-ai-25-memory-and-intrinsic-motivation.mdx) · [English](../../spaceship-ui/site/content/english/en-self-improving-ai-25-memory-and-intrinsic-motivation.mdx) | 56–60 | 세션 간 기억, 목표의 출처, 호기심과 행동 영향력, ICM 탐색 보상 |
| [26 한국어](../../spaceship-ui/site/content/posts/self-improving-ai-26-when-the-score-and-the-goal-diverge.mdx) · [English](../../spaceship-ui/site/content/english/en-self-improving-ai-26-when-the-score-and-the-goal-diverge.mdx) | 61–64 | 대리 점수와 의도한 목표, 공작 꼬리 비유, 《아이, 로봇》으로 살펴보는 복지 지표와 제약 |

### 하편 14–26편의 식 풀이

각 글 첫머리의 **식 풀이 바로가기**에서 해당 슬라이드의 계산 예제로 이동할 수 있다. 14–18편에는 각각 세 곳, 19편에는 다섯 곳, 20편에는 여섯 곳, 21–26편에는 각각 일곱 곳을 연결했다. 한국어판과 영어판에서 같은 예제와 수식을 사용한다. 26편은 하편의 마지막 네 장(61–64쪽)을 다룬다.

## 현재 발행과 집필 위치

2026-11-18 확인: [PR #210](https://github.com/JJo-0/JJo-0.github.io/pull/210)는 `17df9790c2494d5bbd0bc6920e0b64938b8af7e1`에 **20:32:40 KST**로 병합됐다. Pages 배포는 20:34:57 KST에 완료됐고, 후속 검사를 포함한 [전체 Pages 실행](https://github.com/JJo-0/JJo-0.github.io/actions/runs/44295652150)은 20:52:17 KST에 성공으로 종료됐다. [공개 읽기 검사](https://github.com/JJo-0/JJo-0.github.io/actions/runs/44298594773)는 20:54:38 KST에 **28개 화면·공개 이미지 123/123 해시 일치**를 확인했다. [공개 모바일 검사](https://github.com/JJo-0/JJo-0.github.io/actions/runs/44298594721)도 성공했다.

14편 PR 검사는 18개 모두 성공했다. 병합 후 Pages를 제외한 push 검사는 17개가 성공했고, 기존 September 21 검사 한 건은 Ubuntu 한글 폰트 설치 중 시간 제한으로 취소됐다. 배포 직후 직접 확인한 공개 화면과 이미지 검증, 뒤이어 완료된 자동 검증의 관측 시점을 [14편 발행 기록](reviews/2026-11-18-chapter-14-publication.json)에 구분해 보존한다. [13편 발행 기록](reviews/2026-11-18-chapter-13-publication.json)과 이전 준비 기록도 유지한다.

현재 **14·15편에 외부 강의 슬라이드와 영상 해설을 보강했다.** 각 편은 NTU 본강의 5장, 보충 논문 자료 4개, 추가 외부 강의 슬라이드 3개로 총 12개 이미지를 포함한다. 14편은 Lambert L9·L7과 CMU L9, 15편은 CMU L12·NAIRR·MIT 강의를 해당 논점 곁에 연결했다. 네 영상의 실제 영어 자동 자막 구간을 확인했다. 15편의 기존 수식 15개와 계산 검산 20개는 보존한다. 독립 원고 검토와 별도 수치 검산 12개 묶음도 통과했다. 문제 생성 지시에 담긴 사람의 설계에서 출발해, 가중치 θ와 하네스 h의 구분, 하네스에 경사하강식을 바로 적용하기 어려운 이유, AI가 만든 수정안의 평가·선택을 설명한다. 기존 상편·하편 구분과 글 번호·URL·연속 탐색을 유지한다. 준비 기록은 공개 배포 완료를 뜻하지 않으며, 15편의 최종 병합·배포·공개 검증은 해당 발행 PR에 기록한다. **17편은 하편 PDF 16–20쪽 원고를 작성했다. 원본 이미지 자동 생성과 원격 검증은 독립적으로 완료 여부를 확인해야 한다. 19편은 하편 PDF 26–30쪽을 다룬다. 20편은 31–35쪽, 21편은 36–40쪽을 다룬다. 22편은 41–45쪽, 23편은 46–50쪽을 다룬다. 24편은 51–55쪽을 다룬다. 25편은 56–60쪽을 다룬다. 26편은 마지막 61–64쪽을 다룬다.** [15편 준비 기록](reviews/2026-11-18-chapter-15-preparation.json)에서 범위와 검증을 확인할 수 있다.

이전 11·12편 발행 기록은 [PR #208](https://github.com/JJo-0/JJo-0.github.io/pull/208), 이전 10편과 1–9편 읽기 흐름 정리는 [PR #207](https://github.com/JJo-0/JJo-0.github.io/pull/207)에 있다. `progress.json`의 과거 준비·발행 기록은 당시 날짜와 범위를 보존한다.

## 16편 작성 위치

16편은 NTU 하편 11–15쪽의 OPRO·GEPA·ALMA·DGM을 한 장씩 해설한다. 원본 5장에 CMU OPRO 강의 1장, Stanford GEPA 저자 강연 2장, ALMA Table 1을 연결했다. 본강의와 GEPA ICLR 발표의 실제 제공 자막을 읽고 관련 문단에 시간 링크를 배치했다. Stanford 2025 슬라이드와 ICLR 2026 영상은 다른 행사로 구분한다.

원고에는 수식 11개와 이미지 9개가 있으며 계산 검산 17개가 통과했다. [준비 기록](reviews/2026-11-18-chapter-16-preparation.json), [독립 검토](reviews/2026-11-18-chapter-16-independent-review.json), [원전 대조](source-assets/16/source-review.json)에서 범위와 한계를 확인할 수 있다. 이 작성 기록은 배포 완료를 뜻하지 않는다. 14·15편 보강 브랜치를 기준으로 이어서 작업했으며, 최종 원격 검사와 Pages 배포는 별도 관측 결과로 기록한다. 다음 원본은 **하편 16쪽**, 다음 글은 **17편**이다.

## 17편 작성 위치

17편은 하편 16–20쪽의 DGM 후보 아카이브·실제 탐색 계보·DSPy·하네스와 LLM·ExpRAG를 연결한다. 원본 다섯 장, Omar Khattab의 DSPy 외부 강의 슬라이드 두 장(26·31쪽), DGM Figure 3과 ExpRAG Figure 1을 보충한다. 원본 전체 슬라이드는 무수정 렌더, 논문 그림은 원전의 정해진 영역에서 발췌하며, 수치 예제는 출판된 실험과 분리한다.

원본 PDF는 기존 16편과 동일한 해시를 검사한다. `tools/render_17.py`와 별도 GitHub Actions 작업이 원자료와 이미지 출처·해시를 담은 `source-assets/17/manifest.json`을 생성하도록 구성했다. 보충 자료의 재사용 조건은 확인되지 않았으므로 `rights_status=unverified`를 유지한다. 강의 16–20쪽 발화의 정확한 타임코드는 확인되지 않아 특정 초를 임의로 배치하지 않았다.

이 문단은 **원고와 렌더링 작업의 준비 설명**이다. CI, PR 병합, Pages 배포, 공개 화면 검증의 실제 결과를 대신하지 않는다.

## 독자 본문 편집 기준

2026-11-18 사용자 요청을 이후 편에도 적용한다.

- 글은 핵심 개념과 앞 편의 질문에서 시작한다. 강의일, 표지를 포함한 페이지 세기, 작업 날짜, 도구와 자막 트랙 종류, 이미지 제작·편집 범위는 도입이나 캡션에 나열하지 않는다.
- 실제 강의 설명과 시각 링크는 관련 개념 곁에 유지한다. 전체 시간 대응표는 기본 닫힘인 `<details>` 안에 두며 summary는 **슬라이드별 영상 위치**로 통일한다.
- 그림 캡션은 그림이 설명하는 내용을 짧게 쓴다. 저자·기관과 원문 페이지 링크를 유지한다. 원본 렌더·비공식 편집·재현 여부 같은 제작 기록은 manifest에 둔다.
- 가정, 실험 조건, 단위, 계산 예의 설정, 실제 수식 오류를 바로잡는 설명은 필요한 절에서 간결하게 설명한다. 원문과 다른 수식을 오류인 채 옮기지 않는다.
- 검산 기록과 재현 코드는 글 끝의 기본 닫힘 details에서 연결한다. 본문을 검사 결과 보고서로 만들지 않는다.
- 출처·제공 자막·버전·파일 해시·편집 내역은 이 문서 디렉터리에서 추적한다. 독자에게 필요 없는 과정 설명을 본문에 다시 넣지 않는다.

PR #207의 읽기 흐름 정리에서 1–9편의 수식 298개와 이미지 81개는 그대로 유지했다. [리비전 기록](reviews/2026-11-18-editorial-cleanup-01-09.json)은 본문 전후 해시와 보존 검사를 담는다.

## 외부 강의 보충 기준

2026-11-18의 14·15편 보강 요청은 [처음 수집한 강의 목록](https://chatgpt.com/share/6afd95c6-00c0-83ee-ae8f-e69ca9b3448a)에 근거한다. 원래 연재 방식은 **NTU 한 장 → 한국어 설명 → 다른 강의·논문으로 개념 확장**이다. 논문 그림만 추가하면 외부 강의의 설명 방식과 영상 해설을 연결한다는 요구를 충족하지 못한다.

- 다음 편을 쓸 때 관련 개념을 실제로 설명하는 외부 강의의 슬라이드·강의노트를 먼저 검토한다. 이번 14·15편에는 편당 외부 강의 슬라이드 3장을 추가한다.
- 보충 설명은 연결되는 NTU 슬라이드나 원전 논점 바로 뒤에 둔다. 해당 자료가 설명하는 내용, 본강의와의 연결, 독자가 확인할 예 또는 한계를 한국어로 풀어 쓴다.
- 자료 이름만 나열하거나 참고문헌에 링크만 추가한 것은 본문 보충으로 세지 않는다. 강의 슬라이드, 논문 그림, 공식 설명 문서, 실제 영상 발화를 구분한다.
- 영상 설명은 실제로 확보한 자막·전사에서 확인한 구간에 시간 링크를 단다. 슬라이드만 읽은 설명을 영상 발화로 쓰지 않는다. 자막 언어·종류·범위와 원본 해시는 별도 provenance에 기록한다.
- 원자료가 다루지 않는 연결은 이 글의 해설 또는 가상 예제로 쓴다. 원문에 없는 수치·인과·보장을 저자에게 돌리지 않는다.
- 관련성이 낮은 강의를 수량을 맞추기 위해 넣지 않는다. 필요한 개념에 맞는 자료를 선택하고, 원 슬라이드 번호·출처와 기존 글의 탐색 링크를 유지한다.

이번 추가 자료의 위치와 검증 근거는 [14·15편 보충 기록](reviews/2026-11-18-chapters-14-15-lecture-supplements.json)에 보존한다. 이 기록의 준비 상태와 최종 공개 배포 확인은 구분한다.

## 원자료 관리

독자 화면은 슬라이드 다음에 한국어 해설을 배치한다. 이미지의 중국어를 옮긴 자료는 비공식 영어 편집본이며, 공식 영문판으로 소개하지 않는다. 그림과 수식의 원본 페이지는 각 이미지에서 직접 연결한다. 원래 영어로 구성된 페이지는 원본 렌더를 그대로 사용한다. 계산 예의 설정은 해당 설명에서 밝히며, 제작 과정 자체에 대한 반복 안내는 위 편집 기준에 따라 본문에서 생략한다.

- [공식 강의](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php)
- [공식 상편 PDF](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pdf)
- [공식 상편 PPTX](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/Self-Improving.pptx)
- [상편 영상](https://www.youtube.com/watch?v=s06mSAGN4gM)
- [공식 하편 PDF](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/self-evolving-agent.pdf)
- [하편 영상](https://www.youtube.com/watch?v=cQLKVzbwN7I)

초기 1–3편의 원문·제공 자막 대조일은 2026-11-12, 영어 편집본의 준비일은 2026-11-16이다. 이후 편의 조회일·버전·해시는 각 manifest와 transcript provenance에 기록한다. 하편 1–10쪽과 제공 자막은 2026-11-18에 대조했다. 영상 시간은 제공 자막의 주제 설명 구간이며 정확한 화면 전환 프레임과 동일하다고 주장하지 않는다.

하편 5쪽은 원본 PDF에서 서로 겹치거나 하단에 잘린 논문 URL 텍스트만 같은 문구로 재배치했다. 원본 도형·수식·사진·빨간 X 요소는 보존했으며, 세부 변경은 14편 manifest에 기록한다. 하편 7·8쪽은 중국어 표제 하나를 영어로 바꿨으며, 6·9·10쪽과 보충 자료의 내용·도형은 그대로 보존했다. 15편의 보충 자료는 SWE-agent·AFlow·τ-bench 논문 그림 세 개와 DSPy의 번호 없는 RAG 코드 예제 한 개다. 세부 출처와 편집 범위는 15편 manifest에서 확인한다.

## 기록

- `source-assets/01/manifest.json`: 1–5쪽의 원문과 출력 이미지 메타데이터
- `source-assets/02/manifest.json`: 6–10쪽의 원문과 출력 이미지 메타데이터
- `source-assets/03/manifest.json`: 11–15쪽의 원문과 출력 이미지 메타데이터
- `source-assets/11/manifest.json`: 51–55쪽과 보충 자료 4개의 이미지 메타데이터
- `source-assets/12/manifest.json`: 56–60쪽과 보충 자료 4개의 이미지 메타데이터
- `source-assets/13/manifest.json`: 마지막 61–62쪽과 보충 자료 4개의 이미지 메타데이터
- `source-assets/14/manifest.json`: 하편 1–5쪽과 보충 논문 그림 4개의 이미지 메타데이터
- `source-assets/15/manifest.json`: 하편 6–10쪽과 보충 원전 자료 4개의 이미지 메타데이터
- `source-assets/11/transcript-provenance.json`, `source-assets/12/transcript-provenance.json`: 제공 자막과 영상 위치의 근거
- `source-assets/13/transcript-provenance.json`: 1:03:02–1:03:40과 1:03:40–끝의 제공 자막 근거
- `source-assets/14/transcript-provenance.json`: 하편 첫 5쪽에 대응하는 0:00·0:07·0:45·3:36·4:45의 제공 자막 근거
- `reviews/verify_examples_13.py`, `reviews/numeric-checks-13.json`: 13편의 계산 예제와 검산 결과
- `reviews/verify_examples_14.py`, `reviews/numeric-checks-14.json`: 14편의 계산 예제와 검산 결과
- `reviews/verify_examples_15.py`, `reviews/numeric-checks-15.json`: 15편의 짝지은 비교·토큰 예산·반복 성공률 계산과 검산 결과
- `source-assets/15/transcript-provenance.json`: 하편 6–10쪽의 4:45·5:15·5:36·5:48·7:07 주제 발언 근거. 6쪽은 앞편 회고와 겹치는 문맥이며 고유한 화면 전환이 확인된 시각은 아니다.
- `spaceship-ui/src/data/self-improving-series.json`: 상편·하편의 표시 이름과 연속 글 번호 범위
- `progress.json`: 현재 작성 범위와 다음 시작 페이지

NTU 원본 자료의 재사용·수정 조건은 `unverified`로 기록한다. 공개 접근과 출처 표시를 라이선스로 취급하지 않으며, 포함된 제3자 이미지에도 별도 권리가 있을 수 있다.

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

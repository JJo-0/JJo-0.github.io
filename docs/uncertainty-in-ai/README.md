# AI의 예측 불확실성 — Cambridge 2026 강의 해설 설계

**설계일 2026년 11월 25일 · 공개 목차 00편과 본강의 해설 01–09편을 위한 편집 문서**

독자가 예측값 옆의 오차 막대를 보고 세 가지를 설명할 수 있도록 한다. 무엇이 그 폭을 만들었는가? 어떤 결정을 내릴 때 그 폭이 중요한가? 시험 데이터에서 실제로 그만큼의 오차가 관측되는가? 한국어 해설은 케임브리지 강의의 순서를 따른다. 다른 강의는 그 질문을 푸는 데 필요한 지점에 연결한다.

## 원본과 읽는 방법

케임브리지대 Accelerate Programme의 *Uncertainty Estimation in AI*는 2026년 11월 3–4일 진행한 워크숍이다. 강사 저장소의 11월 3일 판본으로 쪽수를 고정한다. Block 1은 93쪽, Block 2는 150쪽, Block 3은 45쪽이다. 각 PDF의 표지가 1쪽이며, 쪽수에는 같은 도식이 단계별로 완성되는 화면, 전환·휴식 화면도 들어 있다. 원본 실습은 용량–반응 예제의 데이터 생성에서 예측·의사결정·평가까지 이어진다. [대학 강의 안내](https://science.ai.cam.ac.uk/events/training-workshop-uncertainty-estimation-in-ai) · [고정한 원본 3개](https://github.com/ErikEnglesson/UncertaintyInAIWorkshop/tree/07668d8b685422a52bd546eb1ccc4fcf53506b57/Slides) · [강사 자료실](https://github.com/ErikEnglesson/UncertaintyInAIWorkshop) · [원본 Colab](https://colab.research.google.com/drive/1ImqSxUHvji0EwndIWn9RahP2rDfkMJwy?usp=sharing)

00편은 세 PDF, 회차별 쪽수, 기호표, 실습 진입점을 제공하는 독서 안내다. 01편에서 원본 읽기를 시작한다. 각 회차에는 담당 범위 안에서 PDF 쪽 또는 연속 쪽 묶음을 원본과 대조할 수 있는 색인을 둔다. 같은 그림에 한 줄씩 추가되는 장면은 한 묶음으로 읽고, 새로 나타난 단계와 의미를 적는다. 전환 화면은 색인에 표시한다.

## 회차별 원본 범위와 한국어 해설

| 회차 | 원본 PDF 뷰어 쪽 | 독자의 질문 | 본문과 보충 설명 |
|---|---|---|---|
| 01 | [Block 1 · 1–25쪽](https://raw.githubusercontent.com/ErikEnglesson/UncertaintyInAIWorkshop/07668d8b685422a52bd546eb1ccc4fcf53506b57/Slides/uncertainty-in-ai-block1.pdf#page=1) | 비가 올 확률을 알면 우산을 챙기는 결정이 어떻게 달라질까? | 강의의 우산 사례에서 예측과 의사결정을 분리한다. 같은 강수 확률에서도 우산을 들 비용과 비를 맞을 비용을 바꾸면 행동이 달라지는 손계산을 붙인다. |
| 02 | [Block 1 · 26–54쪽](https://raw.githubusercontent.com/ErikEnglesson/UncertaintyInAIWorkshop/07668d8b685422a52bd546eb1ccc4fcf53506b57/Slides/uncertainty-in-ai-block1.pdf#page=26) | 관측 하나가 들어오면 무엇을 새로 알게 될까? | 결합·주변·조건부 확률을 빈도표 한 장으로 읽고 베이즈 규칙을 유도한다. IJCAI의 데이터 불확실성(aleatoric)과 지식 부족에 따른 불확실성(epistemic)을 관측 조건을 고정한 사례로 보충한다. |
| 03 | [Block 1 · 55–93쪽](https://raw.githubusercontent.com/ErikEnglesson/UncertaintyInAIWorkshop/07668d8b685422a52bd546eb1ccc4fcf53506b57/Slides/uncertainty-in-ai-block1.pdf#page=55) | 데이터가 부족한 경우와 관측 환경이 달라진 경우는 어떻게 구별할까? | 데이터 생성 과정, 잡음, 표본 추출, 입력 분포 변화와 조건부 분포 변화의 차이를 그린다. 카메라 시점·가림이 바뀌는 예시는 블로그 적용으로 표시한다. |
| 04 | [Block 2 · 1–49쪽](https://raw.githubusercontent.com/ErikEnglesson/UncertaintyInAIWorkshop/07668d8b685422a52bd546eb1ccc4fcf53506b57/Slides/uncertainty-in-ai-block2.pdf#page=1) | 데이터를 보기 전에 모델은 무엇을 예측할까? | 우도·사전분포에서 사전예측분포를 만든다. 원본 용량–반응(dose–response) 모형에서 여러 곡선을 그려 함수의 변동과 관측값의 산포를 눈으로 구분한다. 49쪽 데이터 도착 장면에서 다음 글로 잇는다. |
| 05 | [Block 2 · 50–73쪽](https://raw.githubusercontent.com/ErikEnglesson/UncertaintyInAIWorkshop/07668d8b685422a52bd546eb1ccc4fcf53506b57/Slides/uncertainty-in-ai-block2.pdf#page=50) | 새 관측값의 예측 분산은 어디에서 생길까? | 사후예측분포를 만들고 데이터가 늘 때 줄어드는 항과 남는 항을 비교한다. Georgia Tech 10–11쪽으로 선형회귀의 두 항을 유도한 뒤 IJCAI 자료와 전체 분산의 법칙으로 일반화한다. GP 식은 심화 상자에 둔다. |
| 06 | [Block 2 · 74–126쪽](https://raw.githubusercontent.com/ErikEnglesson/UncertaintyInAIWorkshop/07668d8b685422a52bd546eb1ccc4fcf53506b57/Slides/uncertainty-in-ai-block2.pdf#page=74) | 언제 분산이 ‘예측하고도 남는 오차’가 될까? | 기댓손실에서 최적 행동을 구한다. 114–116쪽을 중심으로 제곱손실의 평균, 절대손실의 중앙값, 0–1 손실의 최빈 클래스를 같은 관점에서 비교한다. 05편 분포를 재사용해 손실을 바꿔 계산한다. |
| 07 | [Block 2 · 127–150쪽](https://raw.githubusercontent.com/ErikEnglesson/UncertaintyInAIWorkshop/07668d8b685422a52bd546eb1ccc4fcf53506b57/Slides/uncertainty-in-ai-block2.pdf#page=127) | 잘 맞는 확률과 잘 맞는 90% 예측구간을 어떻게 검증할까? | 확률분포 자체를 평가하는 점수, 엔트로피, 보류 데이터 평가를 읽는다. 원본 Colab의 중앙 90% 구간 실습에서 CMU의 포함률·구간 폭으로 이어간다. ICML의 사건 확률 보정, 고려대의 다출력 동시 포함을 각각 다른 예제로 붙인다. |
| 08 | [Block 3 · 1–25쪽](https://raw.githubusercontent.com/ErikEnglesson/UncertaintyInAIWorkshop/07668d8b685422a52bd546eb1ccc4fcf53506b57/Slides/uncertainty-in-ai-block3.pdf#page=1) | 여러 모델의 예측이 다르면 무엇을 측정한 것일까? | 최대사후추정(MAP), 딥 앙상블, 몬테카를로 표집을 비교한다. 05편의 분산식을 두 모델의 혼합 예측에 적용한다. CMU 실습에서 앙상블 평균 간 산포만 쓸 때 새 관측의 구간이 어떻게 달라지는지 짚는다. |
| 09 | [Block 3 · 26–45쪽](https://raw.githubusercontent.com/ErikEnglesson/UncertaintyInAIWorkshop/07668d8b685422a52bd546eb1ccc4fcf53506b57/Slides/uncertainty-in-ai-block3.pdf#page=26) | 근사법을 바꾸면 같은 데이터에서 예측과 행동은 얼마나 달라질까? | 라플라스 근사·변분추론(VI)·확률적 경사 랑주뱅 동역학(SGLD)을 33–35쪽의 예측·결정 비교와 연결한다. 원본 Colab 5–6절로 마무리한다. ECC의 사람–로봇 사례는 판단 기준이 바뀌는 응용으로 놓는다. |

## 보충 강의를 붙이는 위치

| 자료 | 해당 회차 | 원고에 넣을 내용 |
|---|---|---|
| [Georgia Tech · 9월 28일 · 원본 PDF](https://gt-koala.github.io/Gatech-CSE6740/assets/semesters/fall-2026/lectures/10/lecture-10-gaussian-processes.pdf#page=10) · [수식 해설](https://gt-koala.github.io/Gatech-CSE6740/fall-2026/lectures/10-gaussian-processes/) | 05 | 10–11쪽의 베이지안 선형회귀를 한국어로 한 줄씩 전개한다. 새 관측값의 분산과 잡음 없는 잠재 평균의 분산을 함께 표시한다. 16–19쪽을 GP 심화 읽기로 연결한다. |
| [IJCAI · 8월 16일 · 튜토리얼](https://sites.google.com/view/aeuml-tutorialijcai/home) · [원본 PDF](https://drive.google.com/file/d/15IQAra-QGtUlXqs2r57mn229anOS-3q_/view) | 02, 05 | 02편은 두 불확실성의 한국어 뜻에 집중한다. 05편은 30–38쪽을 참조해 사후예측과 앙상블로 해석을 확장한다. 어떤 입력 정보와 모형을 가정했는지 식 옆에 남긴다. |
| [CMU · 10월 19일 · 슬라이드](https://kitchingroup.cheme.cmu.edu/f26-06763/slides/l14/) · [노트와 수치](https://kitchingroup.cheme.cmu.edu/f26-06763/lectures/l14/notes.html) · [실습](https://kitchingroup.cheme.cmu.edu/f26-06763/lectures/l14/l14-uq.html) | 07, 08 | 07편에서는 콘크리트 강도 예제의 명목 90% 구간이 시험 표본의 79%를 포함하고 보정 뒤 약 90%를 포함한 결과를 읽는다. 보정에 쓴 표본과 시험 표본을 그림으로 구분한다. 08편에서는 같은 예제로 앙상블 산포의 의미를 해석한다. 수치는 수업의 해당 데이터 분할에서 얻은 값이다. |
| [ICML · 7월 6일 · 32–33쪽](https://calibration-tutorial.github.io/assets/slides/calibration-decisions-collaboration-icml-2026-tutorial-slides.pdf#page=32) · [PPTX·녹화·노트](https://calibration-tutorial.github.io/) | 07 | 예측 확률이 0.7인 사례들의 실제 사건 빈도를 조사하는 분류 예제로 확률 보정과 ECE를 설명한다. 회귀 예제에서는 명목 포함률, 관측 포함률, 구간 폭을 보고한다. |
| [고려대 DMQA · 9월 18일 · 이용우 · 한국어 영상 및 세미나](https://dmqa.korea.ac.kr/activity/seminar/555) · [PDF 11쪽](https://dmqa.korea.ac.kr/uploads/seminar/%5B260918%20DMQA%20Open%20Seminar%5D%20Multi-Output%20Conformal%20Prediction.pdf#page=11) | 07, 09 | 07편 본문 옆에 5–10쪽의 포함률과 구간 폭, 11–15쪽의 여러 출력 간 의존성을 설명한다. 09편에서 전신과 미래 시점 전체를 하나의 사건으로 묶는 평가 예시로 다시 사용한다. |
| [ECC · 7월 8일 · 전체 튜토리얼](https://github.com/KohlerJohannes/ECC_Tutorial_SafeByDesignMPC) · [V강 PDF 30쪽](https://raw.githubusercontent.com/KohlerJohannes/ECC_Tutorial_SafeByDesignMPC/main/ECC_Tutorial_Talk5_Conformal_Lars.pdf#page=30) · [VI강 PDF 11쪽](https://raw.githubusercontent.com/KohlerJohannes/ECC_Tutorial_SafeByDesignMPC/main/ECC_Tutorial_Talk6_Human_Laura.pdf#page=11) | 09 | V강 14–22쪽으로 로봇의 행동 변화에 따른 상대 반응과 분포 이동을 소개한다. 30쪽의 자동차–보행자 예제에서 예측 영역의 포함과 안전 조건 충족을 따로 읽는다. VI강 11–24쪽은 시나리오 기반 MPC 후속 읽기다. |

## 식과 그림의 편집 견본

**05편에서 08편까지 이어 쓰는 작은 계산.** 가상의 한 관절 위치를 두 모델이 각각 0.36 m와 0.44 m로 예측한다고 가정한다. 두 모델의 가중치는 각각 1/2, 각 모델에서 새 관측의 표준편차는 0.03 m다. 혼합 예측 평균은 0.40 m다. 전체 분산의 법칙을 적용하면 모델 내부 분산의 평균은 0.0009 m², 모델별 평균의 분산은 0.0016 m²다. 합계는 0.0025 m², 예측 표준편차는 0.05 m다. 그림에는 모델별 분포와 혼합분포를 겹쳐 표시한다. 이 수치는 설명용이다. 두 성분을 섞은 분포의 90% 구간은 혼합분포의 분위수로 계산할 수 있다.

**06편에서는 같은 계산의 의미를 바꿔 본다.** 유한한 이차 모멘트를 갖는 예측분포에서 예측 행동을 $a$, 예측 평균을 $\mu$라 두면 $\mathbb{E}[(Y-a)^2]=\operatorname{Var}(Y)+(\mu-a)^2$다. 위 예제에서 0.40 m를 고르면 평균제곱오차는 0.0025 m²다. 0.45 m를 고르면 0.0050 m²다. 원고에서는 모든 기댓값이 입력과 학습 데이터에 조건부임을 적고, 절대오차를 쓸 때 중앙값이 최적이 되는 사례를 이어 붙인다.

**07편과 09편에서는 포함을 세는 단위를 적는다.** 원본 Colab 6절은 5·95 분위수 사이에 시험값이 들어간 비율을 묻는다. 고려대 11쪽의 네 포함 사건이 서로 독립이고 각각 확률이 0.9인 가상 예에서는 동시 확률이 약 65.6%다. 0.4초 전신 예측에 적용하는 블로그 예제에서는 한 시험 에피소드의 지정된 예측 시점에서 모든 대상 관절과 미래 시점이 동시에 들어왔는지를 한 번 센다. 보정·평가 데이터를 에피소드 단위로 분리하고, 가림 구간의 관측 가능 여부와 평가 분모를 명시한다. 표에는 해당 동시 포함률과 영역 크기를 함께 둔다. 제어기에 관한 결론에는 별도로 관측한 결과가 필요하다.

## 첫 글의 집필 단위와 블로그 반영

1. **01편 도입**은 “비가 올 확률이 30%일 때 누구나 우산을 챙길까?”로 연다. 원본 1–25쪽의 사례와 우산 결정을 읽은 뒤, 블로그 계산에서는 우산을 들 때 손실을 1, 두고 갔다가 비를 맞으면 5, 맑으면 0으로 둔다. 두 선택의 기댓손실 1과 1.5를 비교한다. 비를 맞는 손실을 2로 바꾸면 결과가 뒤집힌다. 이는 원본 그림에 덧붙인 가상 수치다.
2. **각 회차 본문**은 질문 → 해당 쪽과 한국어 풀이 → 독자가 검산할 계산·그림 → 외부 보충 또는 실습 → 다음 질문의 순서로 읽힌다. 07편의 본문 실습은 Colab과 CMU 예제에 집중한다. ICML의 분류 확률 보정과 고려대의 다출력 예측은 각각 펼쳐 읽는 보충란에 둔다. 원본에서 온 그림·설명, 다른 강의의 결과, 블로그에서 만든 예제에는 각각 출처를 표시한다. PDF를 바로 읽을 링크와 자체 도해를 쓰고, 영상은 실제 확인한 강의와 구간에 연결한다. [블로그 인용 안내](../../spaceship-ui/src/pages/policies/copyright.md)
3. **기존 블로그 안에서 연결**할 글은 05편의 [가우시안 과정으로 다음 실험을 고르는 사례](https://jjo-0.github.io/posts/2026-09-29-agent-thermostable-mrna-vaccine-news/)와 [칼만 필터와 센서 분산](https://jjo-0.github.io/posts/2026-09-19-whisker-tactile-flight-news/), 07편의 [현대 인공지능 II](https://jjo-0.github.io/posts/2026-08-18-modern-artificial-intelligence-2/), 09편의 [인간 동작 연구 개요](https://jjo-0.github.io/posts/human-motion-study-0/)다. 칼만 필터의 상태·측정 분산과 베이지안 회귀의 두 분산 항은 각 모형의 정의를 살려 비교한다.
4. **게시 구성**은 `category: ai-machine-learning`, `subcategory: uncertainty-quantification`, `type: study-note`, `series.id: uncertainty-in-ai`를 사용한다. 00은 목차, 01–09는 정수 순번 1–9다. 한국어는 `spaceship-ui/site/content/posts/`, 대응 영어판은 `spaceship-ui/site/content/english/`에 같은 slug·순번으로 둔다. 첫 글의 제안 slug는 `uncertainty-in-ai-01-why-uncertainty-changes-decisions`다. 수식에는 기존 Math 컴포넌트를 사용한다. 목차에는 공개된 회차만 링크하고 준비 중인 회차에는 제목과 쪽수를 표시한다. [글 작성 규칙](../../spaceship-ui/docs/post-authoring.md) · [연재 문서 선례](../self-improving-ai/README.md)
5. **원고 검토** 때는 원본 쪽수와 단계별 도식, 식의 단위·가정, 실습 수치의 데이터 분할, 한국어·영어판의 그림과 수치 대응을 확인한다. 실제 원고가 들어간 변경에서는 작성 규칙의 콘텐츠·빌드 검사와 공개 링크·모바일 수식 확인을 적용한다. 첫 집필 묶음은 00편 독서 안내와 01편이다.

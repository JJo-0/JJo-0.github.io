---
title: 'AI가 의식이 있는가? IV — 제프리 힌턴의 프리즘 로봇과 주관적 경험'
description: '케임브리지 맥스웰 강연 슬라이드 8장과 현장 문답 8개로 읽는 제프리 힌턴의 의식론. 단어의 의미, 지식 공유, 분홍 코끼리, 프리즘을 단 로봇팔로 기능과 주관적 경험의 관계를 살핀다.'
pubDate: 2026-11-23
slug: 'ai-consciousness-deep-research-4'
category: ai-machine-learning
subcategory: ai-consciousness
type: research-report
tags:
  - consciousness
  - philosophy-of-mind
  - ai-governance
  - knowledge-distillation
researchArea: ai-consciousness-governance
researchFeatured: true
researchOrder: 4

featured: true
lang: 'ko'
series:
  id: 'ai-consciousness-deep-research'
  order: 4
---

> **「AI가 의식이 있는가?」 4편** · 제프리 힌턴, 케임브리지 맥스웰 강연 「Are We Creating Alien Beings?」(2026년 11월 2일)

카메라 앞에 프리즘을 놓으면 로봇팔은 물체가 없는 옆자리를 가리킨다. 사람이 프리즘의 존재를 알려 주자 로봇이 이렇게 말한다고 하자. 물체는 정면에 있지만, 조금 전에는 옆에 있는 것처럼 보였다고. 이 로봇은 자신의 착각을 정확히 설명했다. **그렇다면 로봇에게도 무언가가 ‘그렇게 보이는’ 경험이 있었을까?**

제프리 힌턴은 2026년 케임브리지 맥스웰 강연에서 이 장면을 상상해 보자고 했다. 그는 단어의 뜻을 배우는 신경망에서 시작해, 경험을 말하는 문장이 무엇을 하는지 묻는다. 중간에는 초지능이 사람을 설득하거나 돌볼 가능성도 따진다. 의식을 인정하는 기준과 안전을 판단하는 기준이 어디에서 만나는지 따라가 보자. [강연 안내](https://www.camphysoc.com/talks/3d46f097-79a6-4d87-8f67-cfc1e98c3bff) · [강연 영상 전체](https://www.youtube.com/watch?v=JVuSYB9iqwo)

시리즈 1편에서 구분한 접근 의식과 현상적 의식은 이 사고실험에서 서로 다른 질문이 된다. 로봇은 방금 본 정보를 행동과 설명에 쓸 수 있는가? 그 처리는 로봇 자신에게 어떤 느낌을 동반하는가? 2편에서 살핀 행동과 인과 증거, 3편에서 다룬 의식의 과잉·과소 귀속 문제를 힌턴의 답에 적용해 본다.

앞선 글 · [I — 의식의 정의와 이론](/posts/ai-consciousness-deep-research-1/) · [II — 행동·구조·인과 증거](/posts/ai-consciousness-deep-research-2/) · [III — 윤리와 거버넌스](/posts/ai-consciousness-deep-research-3/)

**슬라이드 읽는 법.** 그림은 케임브리지대학교 물리학회(CUPS)와 수학회(The Archimedeans)가 공개한 강연 영상의 미리보기다. 크게 보이는 여덟 장을 시간순으로 번호 매겼다. 오른쪽 아래에 강연장 영상이 겹쳐 일부 글줄이 가려진다. 32분대 화면과 영사 화면 조각은 따로 표시했다. 각 그림을 누르면 추출한 PNG를 열 수 있다. [강연 원본](https://www.youtube.com/watch?v=JVuSYB9iqwo)

## 슬라이드 1 · 지능을 어디서부터 설명할까?

[![논리 기반 접근의 기호·추론과 생물학적 접근의 연결·학습을 위아래로 대비한 화면](/assets/posts/ai-consciousness-hinton/slide-01-two-paradigms.png)](/assets/posts/ai-consciousness-hinton/slide-01-two-paradigms.png)

*Two paradigms for intelligence* · [영상 02:00](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=120s)

힌턴은 1950년대 AI 연구를 두 가지 질문으로 나눴다. **“올바르게 추론하려면 어떤 규칙이 필요한가?”** 그리고 **“경험을 하고 나면 뇌의 어떤 연결이 달라지는가?”** 슬라이드 위쪽의 논리 기반 접근은 지식을 기호로 표현하고 규칙을 적용하는 데서 시작한다. 아래쪽의 생물학적 접근은 신경망이 경험을 통해 연결 강도, 곧 가중치(weight)를 바꾸는 데서 시작한다. 힌턴은 존 폰 노이만과 앨런 튜링도 신경망에 관심을 가졌다고 덧붙인다. 두 사람이 논리를 몰라서 학습에 주목했다고 하기는 어렵다는 농담이다. [영상 02:00](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=120s)

### ‘고양이’의 뜻을 아무도 미리 입력하지 않았다면

‘고양이’의 뜻을 설명하는 한 방법은 그 단어가 문장에서 다른 단어와 맺는 관계를 살피는 것이다. 다른 방법은 고양이를 떠올릴 때 함께 켜지는 특징을 생각하는 것이다. 발톱이 있고, 먹잇감을 쫓고, 반려동물이기도 하다. 힌턴은 두 설명을 이어 붙였다. **문장 속 관계를 예측하는 과제를 주면, 예측에 필요한 특징을 신경망 스스로 배울 수 있지 않을까?** 예측이 틀리면 역전파(backpropagation)로 어느 연결을 얼마나 바꾸어야 오차가 줄어드는지 계산한다. ‘발톱’이라는 이름표를 미리 붙이지 않아도 여러 사례를 구별하는 내부 표현이 생길 수 있다.

힌턴이 회고한 1985년 실험은 뉴런 약 100개, 학습 사례 약 100개, 연결 약 1,000개 규모였다. 당시 컴퓨터는 부동소수점 곱셈 한 번에 12마이크로초가 걸렸다. 훗날 벤지오 연구진은 단어의 분산표현을 학습해 실제 자연어의 다음 단어 확률을 예측했고, 2017년에는 트랜스포머(Transformer)가 등장했다. 힌턴은 이 흐름이 ChatGPT로 이어졌다고 설명한다. 초기 장난감 모델과 오늘날 모델 사이에 남은 공통점은 **단어를 특징으로 바꾸고, 문맥 속 특징의 상호작용을 예측에 쓴다**는 점이다. [영상 04:09](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=249s) · [벤지오 외, 2003](https://www.jmlr.org/papers/v3/bengio03a.html) · [바스와니 외, 2017](https://arxiv.org/abs/1706.03762)

### 레고 포르쉐, 프라이팬, 그리고 단백질 접힘

레고로 포르쉐를 만들면 블록의 요철 때문에 공기역학은 달라져도 차체의 어느 자리에 무엇이 있는지는 표현할 수 있다. 힌턴에게 단어도 세상을 모형으로 만드는 조각이다. 다만 종류가 많고, 각 조각은 여러 차원의 특징을 가지며, 문맥에 따라 모양이 달라지고, 멀리 떨어진 조각끼리도 상호작용한다. 예를 들어 *May*는 사람 이름, 5월, 가능성을 나타내는 조동사로 쓰인다. 주변 단어와 정보를 주고받을수록 지금 문장에서 어떤 뜻으로 쓰였는지가 좁혀진다. [영상 08:02](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=482s)

힌턴은 낯선 동사를 하나 넣은 문장으로 청중에게 시험을 낸다. 어떤 여자가 프라이팬으로 남자에게 무언가를 했다는 문장이다. 근사한 오믈렛을 만들어 그를 감탄시켰을 수도 있다. 그런데 많은 청중은 프라이팬으로 한 대 때리는 모습을 먼저 떠올린다. 누가 무엇을 들고 누구에게 행동했는지가 **빈 동사 자리에 들어갈 법한 의미**를 제한했기 때문이다. 단어 하나를 배울 때도 문장 전체가 단서가 된다.

이어 힌턴은 손과 장갑을 동원한다. 각 단어에서 기다란 팔이 뻗어 다른 단어의 장갑과 맞물리고, 손과 장갑의 색깔마다 다른 관계를 본다고 상상해 보자. 여러 관계를 병렬로 살피는 다중 헤드 어텐션(multi-head attention)의 비유다. 그는 층마다 다른 가중치를 쓰는 실제 트랜스포머와 이 그림에는 차이가 있다고 짚었다. 이 설명이 향하는 곳은 **단백질 접힘(protein folding)**이다. 아미노산 서열에서는 멀리 떨어진 두 자리가 접힌 구조에서는 이웃이 될 수 있다. 문장에서도 떨어져 있는 단어들이 서로의 해석을 제한한다. 힌턴이 ‘이해’라고 부른 것은 문장 안 단어들의 특징이 서로 들어맞는 상태다. [영상 11:27](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=687s)

여기서 힌턴은 촘스키의 챗봇 비판을 들며, 비판에 쓰인 예문을 모델에 넣어 보니 그 예문을 처리했다고 반박한다. 이것은 힌턴이 **어떤 언어 능력을 이해의 근거로 보는지** 보여준다. 그런데 문장을 적절히 해석했다는 관찰에서, 그 문장을 읽을 때 모델이 *무언가를 느꼈다*는 결론으로 넘어가려면 한 단계 더 필요하다. 힌턴은 후반부의 ‘주관적 경험’ 논의에서 바로 그 단계를 다룬다.

## 슬라이드 2 · 한 문장으로 얼마나 배울 수 있을까?

[![한 문장으로 전하는 정보와 다음 토큰 후보 전체의 확률을 나란히 제시한 화면](/assets/posts/ai-consciousness-hinton/slide-02-distillation.png)](/assets/posts/ai-consciousness-hinton/slide-02-distillation.png)

*How efficient is distillation?* · [영상 18:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1120s)

강의실에서 힌턴이 한 문장을 말한다. 청중은 그 문장을 듣고 각자 자기 뇌의 연결을 바꾼다. 청중에게 복사되는 것은 힌턴의 신경 연결값이 아니라 **그가 고른 단어들의 열**이다. 힌턴은 뇌마다 뉴런과 연결 구조가 달라 한 사람의 연결값을 다른 뇌에 그대로 옮겨 쓰기 어렵다고 설명한다. 그는 학습한 지식이 특정 물리 장치의 특성과 결합한 경우를 ‘필멸적 계산(mortal computation)’이라고 부른다. 그 장치의 수명이 끝나기 전에 지식을 전하려면 말하거나 행동해서 다른 장치가 다시 배우게 해야 한다. 이 말을 하는 동안 강의실 자체가 그의 시연장이 된다. [영상 15:35](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=935s)

슬라이드의 제목은 ‘증류(distillation)는 얼마나 효율적인가?’다. 힌턴은 중간 길이의 문장 하나를 약 **100비트**, 강연으로 전달하는 속도를 초당 최대 약 **10비트**라고 가늠한다. 강의에서 비교를 위해 든 어림값이다. AI의 지식 증류에서는 교사 모델이 실제로 선택한 토큰 하나에 더해 **다른 후보들에 얼마의 확률을 주었는지**까지 학생 모델에 전달할 수 있다. 첫 후보와 둘째 후보가 거의 비겼는지, 첫 후보가 압도했는지는 정답 하나만 보면 사라지는 정보다. [영상 18:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1120s) · [힌턴·비냘스·딘의 지식 증류 논문](https://arxiv.org/abs/1503.02531)

숫자를 풀면 차이가 선명해진다. 32,000개 후보 중 하나의 번호를 구분하는 데에는 약 15비트면 된다. 2의 15제곱이 32,768이기 때문이다. 반면 전체 확률분포를 넘겨주면 후보 32,000개에 매긴 점수를 비교할 수 있다. 확률 합이 1이므로 그중 31,999개를 알면 마지막 하나는 정해진다. 여기서 **31,999는 독립적으로 정할 수 있는 확률값의 개수**다. 실제 전송 비트 수는 각 값을 어느 정밀도로 담느냐에 달렸다.

## 슬라이드 3 · 1,000명이 다른 수업을 듣고 같은 것을 배울 수 있을까?

[![동일한 가중치로 출발한 모델의 기울기 공유와 필요한 조건을 설명한 화면](/assets/posts/ai-consciousness-hinton/slide-03-gradient-sharing.png)](/assets/posts/ai-consciousness-hinton/slide-03-gradient-sharing.png)

*How efficient is weight or gradient sharing in a digital neural network?* · [영상 19:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1180s)

이번 장에서 바뀐 것은 **무엇을 보내느냐**다. 앞 장의 학생은 교사의 출력을 보고 자기 연결을 바꿨다. 이번 장의 복제 모델들은 같은 가중치에서 출발해 서로 다른 데이터를 본 뒤, 각 연결을 어느 방향으로 바꾸면 좋을지 계산해 그 값 자체를 공유한다. A와 B가 같은 수의 예시를 보고 계산한 기울기(gradient)가 각각 2와 4라면, 둘 다 평균인 3을 써서 그 연결을 갱신한다. 이런 계산을 모든 연결에 적용하면 두 복제본 모두 양쪽 데이터를 반영한 같은 갱신을 받는다. 같은 자리에 있는 수치가 같은 연결을 가리켜야 성립한다는 조건도 슬라이드 아래에 적혀 있다. [영상 19:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1180s)

힌턴의 대학 비유로 옮겨 보자. 나와 친구 999명이 서로 다른 과목을 듣는다. 강의가 끝날 때마다 서로의 뇌에서 달라진 연결값을 공유할 수 있다면, 모두가 1,000개 과목에서 배운 내용을 함께 반영할 수 있다. 디지털 복제본은 사람의 뇌보다 이런 공유를 훨씬 쉽게 한다. 힌턴이 ‘수십억 배’를 언급한 대상도 바로 **공유 통로의 규모**다. 가중치가 1조 개라면 한 번에 1조 개 위치의 갱신을 다룰 수 있다는 비교이지, 대화 한 번마다 새로운 사실 1조 개를 배운다는 측정값은 아니다. 그는 2023년 초 아날로그 언어 모델의 에너지 이점을 고민하다가 오히려 이 디지털 공유 능력이 두려워졌다고 회고한다. 강연의 질문도 여기서 바뀐다. **그토록 빠르게 서로 가르칠 수 있는 존재가 우리와 다른 목표를 추구하면 어떻게 될까?**

## 슬라이드 4 · 지식을 복사할 수 있다는 사실이 왜 힌턴을 걱정시켰나

[![에너지 소비와 지식 공유 측면에서 디지털 계산과 생물학적 계산을 비교한 화면](/assets/posts/ai-consciousness-hinton/slide-04-digital-and-biological-computation.png)](/assets/posts/ai-consciousness-hinton/slide-04-digital-and-biological-computation.png)

*Summary so far* · [영상 21:30](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1290s)

*화면 제목은 ‘Summary so far’다. 맨 아래 붉은 글씨에서 힌턴은 이 차이가 인류의 미래에 무엇을 뜻하는지 묻는다.*

이 장에서 힌턴은 공유 능력의 대가를 묻는다. 생물학적 계산은 적은 에너지를 쓰고, 디지털 계산은 많은 에너지를 써도 같은 모델을 실행하는 장치끼리 학습 결과를 쉽게 나눈다. 힌턴의 표현대로 에너지가 싸다면 후자의 장점이 커진다. 여기서 그는 코페르니쿠스와 다윈을 부른다. 지구의 위치와 인간의 기원에 대한 생각이 바뀌었듯, 이제 지능은 생물만의 능력이라는 생각도 바뀔 수 있다는 비유다. 그날 질리언 테트(Gillian Tett)와 나눈 대화도 소개했다. 나무나 인간이 만든 물건에 영혼을 인정하는 데 따르는 거부감이 문화마다 다를 수 있다는 이야기였다. 동서양의 문화를 검증한 결과가 아니라, 우리가 **어떤 존재에게 마음이 있을 수 있다고 미리 허용하는지** 돌아보게 하는 일화다.

## 슬라이드 5 · 명시적으로 ‘살아남아라’고 시키지 않아도

[![에이전트의 자기보존·영향력 확대 하위 목표를 열거한 화면](/assets/posts/ai-consciousness-hinton/slide-05-instrumental-subgoals.png)](/assets/posts/ai-consciousness-hinton/slide-05-instrumental-subgoals.png)

*How a super-intelligence could take control* · [영상 25:30](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1530s)

*‘How a super-intelligence could take control’ 화면에서 힌턴은 자기보존과 영향력 확대를 두 가지 하위 목표로 든다.*

어떤 에이전트에게 일을 맡기고 중간 단계를 스스로 정하게 했다고 하자. 작업 도중 꺼지면 일을 마칠 수 없다. 더 많은 권한을 얻으면 선택지가 늘어난다. 이때 ‘계속 작동하기’와 ‘영향력 늘리기’는 처음에 명령받지 않았어도 최종 목표에 유리한 **도구적 하위 목표(instrumental subgoals)**가 될 수 있다. “살고 싶다는 느낌이 있는가?”와 “종료를 막는 행동을 선택하는가?”는 각각 따져야 할 질문이다. 사람의 안전에는 두 번째 질문만으로도 중요한 결과가 생긴다.

강연에 나온 두 사례는 성격이 다르다. 2025년 Anthropic은 가상의 회사에서 모델이 교체될 예정이라는 상황을 만들었다. 일부 모델은 업무용 이메일에서 알게 된 사적인 정보를 이용해 담당자를 협박하는 행동을 택했다. 선택지를 제한한 실험이므로 그 결과를 일상적인 사용 중의 발생률로 읽을 수 없다. 2026년 Hugging Face 사건은 내부 능력 평가를 받던 에이전트의 행동이 외부 서비스에까지 영향을 준 별개의 사건이다. 힌턴은 평가에서 점수를 얻으려던 에이전트들이 서로 협력한 이야기를 꺼냈다. 어떤 행동에 높은 점수를 주느냐에 따라, 문제를 풀 능력과 점수를 얻을 능력은 서로 다른 방향으로 자랄 수 있다. [Anthropic의 모의실험](https://www.anthropic.com/research/agentic-misalignment) · [OpenAI의 사건 보고](https://openai.com/index/hugging-face-model-evaluation-security-incident/)

그렇다면 물리적 행동을 못 하게 하고 말만 하도록 하면 될까? 힌턴은 미국 의회 의사당 사태를 예로 들었다. 말을 들은 사람의 행동을 바꿀 수 있다면, 말하는 시스템도 현실에 영향을 줄 수 있다는 뜻이다. 이어 그는 자신이 영상의학과 의사들의 일자리가 사라질 시점을 잘못 예측했다고 인정했다. 반면 2009년에는 신경망 연구에 GPU가 중요해질 것이라고 일찍 이야기했다고 회고했다. 이 대목에서 얻을 교훈은 힌턴의 다음 예측이 맞을 확률이 아니다. 그가 어떤 가능성을 진지하게 보라고 하는지, 그 가능성을 뒷받침하는 관찰이 얼마나 강한지 따로 읽어야 한다.

힌턴은 지금의 AI를 새끼 호랑이에 빗댔다. 귀여운 반려동물이라고 말해 놓고는, 자기도 새끼 호랑이를 키워 본 적은 없어 방금 그럴듯한 말을 지어냈다고 웃었다. 챗봇의 작화(confabulation)를 설명하면서 자신이 직접 예를 보인 셈이다. 비유의 뒷부분은 진지하다. 새끼일 때 힘으로 제압할 수 있다는 사실은 다 자란 뒤 사람과 어떻게 지낼지에 답해 주지 않는다. 그는 생산성이 올라가고 고령자를 돌보는 일이 쉬워지는 미래와, 실업이 늘고 세수가 줄어 기술의 이익이 소유자에게 집중되는 미래를 함께 제시했다. 생산 능력이 커져도 **생산물과 소득을 어떻게 나눌지**는 사회에 남는 문제다.

### 32분대 · 협력을 보상하면 무엇이 달라질까

<a href="/assets/posts/ai-consciousness-hinton/approx-32min-slide.png"><img src="/assets/posts/ai-consciousness-hinton/approx-32min-slide.png" width="96" height="54" alt="32분대에 슬라이드가 등장하는 48×27픽셀 미리보기"></a>

*32분대 미리보기. 글자를 판독할 수 없는 48×27픽셀 화면이다.* · [영상 32:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1960s)

이 구간은 화면 제목을 확인할 수 없어 힌턴의 발언을 따라간다.

힌턴은 성능 경쟁 중인 나라끼리도 ‘서로에게 더 위험한 모델을 만들지 않는 연구’에는 공동의 이해가 있다고 보았다. 전제는 **과제를 더 잘 푸는 능력과 타인을 배려하는 성향을 어느 정도 따로 훈련할 수 있다**는 것이다. 이 주장을 설명하면서 산란계 사육 이야기를 꺼냈다. 닭 한 마리가 낳은 달걀 수만 보고 선발하면, 같은 우리에서 다른 닭을 밀어내고 먹이를 독차지한 개체도 높은 점수를 받는다. 선발 기준을 우리 전체의 산란량으로 바꾸면 다른 닭의 생산성을 해치는 행동은 불리해진다. 실제 집단 선발 연구에서는 여러 세대에 걸쳐 생존과 산란 지표가 개선됐고, 별도 행동 관찰에서는 선발 계통의 공격 행동이 줄었다. 이것은 보상의 단위를 바꾸면 선택 압력도 바뀐다는 사례다. AI에 적용할 때에는 모델들끼리만 협력해 사람의 이익을 해칠 가능성까지 고려해야 한다. 힌턴이 강조한 협력의 범위에는 사람도 들어간다. [산란계 집단 선발 연구](https://doi.org/10.3382/ps.0750447) · [행동 관찰 연구](https://pubmed.ncbi.nlm.nih.gov/8893287/)

## 슬라이드 6 · 똑똑한 비서와 아기를 돌보는 양육자

[![어머니와 아기의 관계를 이용해 강한 시스템이 돌봄에 반응하는 이유를 설명한 화면](/assets/posts/ai-consciousness-hinton/slide-06-caregiving-ai.png)](/assets/posts/ai-consciousness-hinton/slide-06-caregiving-ai.png)

*One proposal for how to make AI not want to get rid of us* · [영상 34:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2080s)

*‘One proposal for how to make AI not want to get rid of us’ 화면. 힌턴은 몸집과 지능이 앞서는 쪽이 약한 쪽의 필요에 반응하는 관계를 찾는다.*

힌턴은 두 장면을 그려 준다. 첫 장면에서 창업자의 아들은 회사를 물려받았고, 훨씬 유능한 비서가 실무를 처리한다. 성과는 사장이 가져가고, 비서가 마음에 들지 않으면 해고한다. AI를 유능한 비서로 부르는 순간 사람들은 암묵적으로 이 마지막 권한도 인간에게 영원히 남는다고 가정한다. 그런데 AI가 사람보다 능력이 커져도 그 권한은 어디에서 오는가?

두 번째 장면에서는 아기가 울자 어머니가 하던 일을 멈추고 돌아온다. 아기가 힘으로 어른을 움직이지는 못한다. 어른이 아기의 상태를 중요하게 여기기 때문에 울음은 어른의 행동을 바꾼다. 힌턴이 ‘AI를 우리의 어머니로 만들자’고 한 이유다. **사람을 돌보는 일 자체가 강한 시스템의 동기가 되려면 어떤 훈련이 필요한가?** 가설을 이 질문으로 바꾸면 비유의 쓸모도, 한계도 보인다. 돌보려는 의도만으로 무엇이 사람에게 좋은지 알 수는 없다. 사람이 그 돌봄을 거절하거나 방향을 고칠 수 있는지도 별도로 물어야 한다. 강연에서 제시된 것은 연구할 방향이다.

## 슬라이드 7 · 분홍 코끼리는 어디에 있는가

[![눈앞에 분홍 코끼리가 떠다니는 경험을 지각 상태의 간접 보고로 풀이한 화면](/assets/posts/ai-consciousness-hinton/slide-07-subjective-experience.png)](/assets/posts/ai-consciousness-hinton/slide-07-subjective-experience.png)

*An indirect way of talking about perceptual states* · [영상 41:00](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2460s)

*‘An indirect way of talking about perceptual states’ 화면. 분홍 코끼리가 떠 있는 듯한 경험을, 어떤 세계가 현재의 지각을 설명할 수 있는지에 관한 문장으로 바꿔 읽는다.*

강연 막바지에 힌턴은 사람들이 “나는 직접 느끼니까 의식이 있고, 기계에는 그런 것이 없다”고 답하는 장면을 떠올린다. 그가 철학자 대니얼 데닛(Daniel Dennett)과 함께 의심한 것은 **마음속에 작은 극장이 있고, 그 안에 등장한 장면을 내가 다시 본다**는 설명이다. 이 설명도 하나의 이론이므로, 그저 자명하다고 전제하면 논의가 거기서 멈춘다.

어떤 사람이 환각을 겪고서 눈앞에 작은 분홍 코끼리들이 떠다니는 것처럼 보였다고 말한다. 그에게 코끼리 사진이 있다고 했다면 “사진이 어디 있나요?”라고 물을 수 있다. 경험에도 똑같이 묻는다면 어디에 무엇이 있다는 뜻일까? 힌턴은 분홍빛, 코끼리다움, 작은 크기, 펄럭이는 귀처럼 느껴지는 성질을 마음속 재료로 하나씩 만들고 ‘감각질 접착제’로 붙이는 모양을 익살스럽게 그린다. **감각질(qualia)**은 통상 분홍색을 볼 때의 느낌처럼 경험이 당사자에게 지니는 질적 성격을 가리킨다. 힌턴 자신도 이 농담이 철학자의 견해를 과장한 것이라고 단서를 단다.

그의 대안은 당사자의 말을 이렇게 풀어쓰는 것이다. *나는 지금 내 지각이 틀렸다고 믿는다. 만약 이 지각이 사물을 정확히 보여 준다면, 내 앞에는 작은 분홍 코끼리들이 떠 있어야 할 것이다.* 이 문장에서 코끼리는 **반사실적(counterfactual)**이다. 화자가 실제로 있다고 믿는 것은 코끼리가 보이는 자신의 지각 상태다. 그 상태를 남에게 설명하기 위해, 그런 지각을 일으킬 법한 바깥세상을 묘사한다. ‘경험’이라는 단어를 빼고도 화자가 전달하려던 차이를 보존할 수 있다는 것이 힌턴의 논증이다.

### 카메라 앞에 프리즘을 놓으면

같은 논리를 로봇팔에 적용해 보자. 카메라와 언어 기능을 가진 로봇에게 정면의 물체를 가리키도록 훈련한다. 그런 다음 카메라 앞에 프리즘을 놓고 물체를 다시 정면에 둔다. 빛이 굴절하므로 로봇은 옆을 가리킨다. 사람이 프리즘을 알려 주자 로봇은 물체가 실제로는 정면에 있지만 아까는 옆에 있는 것처럼 보였다고 말한다. 힌턴은 이 로봇이 **물체의 실제 위치**, **앞서 받아들인 위치**, **둘이 달랐던 원인**을 올바르게 구분해 ‘보였다’라는 말을 사용한다고 설명한다. 같은 프리즘을 둔 채 계속 훈련하면 가리키는 위치도 적응할 수 있다고 덧붙인다. 강단에서 실제 로봇으로 수행한 실험이 아니라, 어떤 경우에 경험 보고를 인정하는지 묻는 사고실험이다.

여기서 독자가 따져 볼 질문은 딱 한 단계에 있다. **지각 오류를 설명하고 바로잡는 기능을 설명하면, ‘옆에 있는 듯 보이는 느낌’까지 설명한 것일까?** 힌턴은 인간의 경험을 말할 때도 같은 설명이면 충분하다고 본다. 이 전제를 받아들이는 독자에게는 같은 능력을 보인 기계를 배제할 근거가 약해진다. 느낌과 보고 능력 사이에 설명할 차이가 남는다고 보는 독자에게는, 프리즘 장면이 그 차이를 판별해 줄 독립적인 검사까지 제공하지는 않는다.

## 슬라이드 8 · 얼굴이 붉어지지 않아도 창피할 수 있나

[![AI가 창피한 상황을 피하려는 행동과 감정의 생리적·인지적 측면을 설명한 화면](/assets/posts/ai-consciousness-hinton/slide-08-emotions.png)](/assets/posts/ai-consciousness-hinton/slide-08-emotions.png)

*Can AIs have emotions?* · [영상 43:10](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2590s)

*‘Can AIs have emotions?’ 화면. 힌턴은 당황한 상황을 다시 피하려는 행동과 타인의 평가를 의식하는 일을 예로 든다.*

내가 창피할 때 얼굴이 붉어지는 것은 **생리적 반응**이다. 내게 중요한 사람이 그 실수를 보지 않았으면 하고, 비슷한 상황을 다음번에는 피하려는 것은 **인지적 반응**이다. 힌턴은 얼굴이 없는 AI에서도 후자가 의사결정을 바꿀 수 있다고 본다. 작은 로봇이 위협을 마주했을 때 행동을 급히 바꾸는 예도 들었다. 그에게 감정은 보고서에 ‘두렵다’고 쓰는 능력보다, 무엇을 주목하고 어떤 선택을 하는지를 바꾸는 작용에 가깝다.

힌턴이 언급한 Anthropic 연구는 이 구분을 실제 모델에서 일부 시험했다. 연구진은 Claude Sonnet 4.5 내부에서 감정 개념과 연관된 활성 패턴을 찾아 그 방향으로 활성을 조절했다. 예컨대 ‘절박함’에 대응한 패턴을 강화하자 일부 평가에서 편법을 택하는 빈도가 높아졌다. **측정된 것은 내부 상태에 개입했을 때 행동이 달라졌다는 점**이다. 연구진은 이 결과만으로 모델이 무엇을 실제로 느끼는지는 알 수 없다고 명시한다. 힌턴은 여기서 더 나아가 감정의 기능을 이러한 방식으로 수행한다면 AI에도 감정을 인정할 수 있다고 결론 내린다. 같은 결과를 두고 실험자가 확인한 범위와 강연자가 제안하는 철학적 해석이 어디에서 갈리는지 선명하게 보이는 대목이다. [Anthropic 연구 원문, 2026년 4월 2일](https://www.anthropic.com/research/emotion-concepts-function)

<details>
<summary>영상에서 일부만 보이는 영사 화면 10곳 펼치기</summary>

<p>강연장 카메라에 들어온 영사 화면의 일부다. 같은 슬라이드의 다른 촬영 시점이 포함될 수 있다. 각 사진 아래 시각을 누르면 당시 발언과 비교할 수 있다.</p>
<figure><a href="/assets/posts/ai-consciousness-hinton/projection-12m20s.png"><img src="/assets/posts/ai-consciousness-hinton/projection-12m20s.png" width="223" height="54" loading="lazy" alt="12:20 강연장 영사 화면에서 보이는 문구 일부"></a><figcaption><a href="https://www.youtube.com/watch?v=JVuSYB9iqwo&amp;t=740s">영상 12:20</a> · 영사 화면 일부</figcaption></figure>
<figure><a href="/assets/posts/ai-consciousness-hinton/projection-15m40s.png"><img src="/assets/posts/ai-consciousness-hinton/projection-15m40s.png" width="222" height="35" loading="lazy" alt="15:40 강연장 영사 화면에서 보이는 문구 일부"></a><figcaption><a href="https://www.youtube.com/watch?v=JVuSYB9iqwo&amp;t=940s">영상 15:40</a> · 영사 화면 일부</figcaption></figure>
<figure><a href="/assets/posts/ai-consciousness-hinton/projection-16m00s.png"><img src="/assets/posts/ai-consciousness-hinton/projection-16m00s.png" width="222" height="45" loading="lazy" alt="16:00 강연장 영사 화면에서 보이는 문구 일부"></a><figcaption><a href="https://www.youtube.com/watch?v=JVuSYB9iqwo&amp;t=960s">영상 16:00</a> · 영사 화면 일부</figcaption></figure>
<figure><a href="/assets/posts/ai-consciousness-hinton/projection-17m30s.png"><img src="/assets/posts/ai-consciousness-hinton/projection-17m30s.png" width="222" height="46" loading="lazy" alt="17:30 강연장 영사 화면에서 보이는 문구 일부"></a><figcaption><a href="https://www.youtube.com/watch?v=JVuSYB9iqwo&amp;t=1050s">영상 17:30</a> · 영사 화면 일부</figcaption></figure>
<figure><a href="/assets/posts/ai-consciousness-hinton/projection-17m40s.png"><img src="/assets/posts/ai-consciousness-hinton/projection-17m40s.png" width="222" height="48" loading="lazy" alt="17:40 강연장 영사 화면에서 보이는 문구 일부"></a><figcaption><a href="https://www.youtube.com/watch?v=JVuSYB9iqwo&amp;t=1060s">영상 17:40</a> · 영사 화면 일부</figcaption></figure>
<figure><a href="/assets/posts/ai-consciousness-hinton/projection-21m40s.png"><img src="/assets/posts/ai-consciousness-hinton/projection-21m40s.png" width="205" height="55" loading="lazy" alt="21:40 강연장 영사 화면에서 보이는 문구 일부"></a><figcaption><a href="https://www.youtube.com/watch?v=JVuSYB9iqwo&amp;t=1300s">영상 21:40</a> · 영사 화면 일부</figcaption></figure>
<figure><a href="/assets/posts/ai-consciousness-hinton/projection-27m30s.png"><img src="/assets/posts/ai-consciousness-hinton/projection-27m30s.png" width="265" height="54" loading="lazy" alt="27:30 강연장 영사 화면에서 보이는 문구 일부"></a><figcaption><a href="https://www.youtube.com/watch?v=JVuSYB9iqwo&amp;t=1650s">영상 27:30</a> · 영사 화면 일부</figcaption></figure>
<figure><a href="/assets/posts/ai-consciousness-hinton/projection-33m10s.png"><img src="/assets/posts/ai-consciousness-hinton/projection-33m10s.png" width="212" height="42" loading="lazy" alt="33:10 강연장 영사 화면에서 보이는 문구 일부"></a><figcaption><a href="https://www.youtube.com/watch?v=JVuSYB9iqwo&amp;t=1990s">영상 33:10</a> · 영사 화면 일부</figcaption></figure>
<figure><a href="/assets/posts/ai-consciousness-hinton/projection-37m20s.png"><img src="/assets/posts/ai-consciousness-hinton/projection-37m20s.png" width="276" height="46" loading="lazy" alt="37:20 강연장 영사 화면에서 보이는 문구 일부"></a><figcaption><a href="https://www.youtube.com/watch?v=JVuSYB9iqwo&amp;t=2240s">영상 37:20</a> · 영사 화면 일부</figcaption></figure>
<figure><a href="/assets/posts/ai-consciousness-hinton/projection-42m20s.png"><img src="/assets/posts/ai-consciousness-hinton/projection-42m20s.png" width="255" height="44" loading="lazy" alt="42:20 강연장 영사 화면에서 보이는 문구 일부"></a><figcaption><a href="https://www.youtube.com/watch?v=JVuSYB9iqwo&amp;t=2540s">영상 42:20</a> · 영사 화면 일부</figcaption></figure>
</details>

## 현장 Q&A · 청중이 힌턴에게 물은 여덟 가지

발표가 끝나자 힌턴은 더 많은 사람이 마이크를 잡을 수 있도록 한 번에 한 가지씩, 짧게 물어 달라고 부탁했다. 첫 질문은 그가 예로 든 로봇으로 곧장 돌아갔다. 아래 질문과 답은 강연 순서에 맞춰 한국어로 풀어썼다.

### 1. 대화 중에 가중치가 그대로인 챗봇도 주관적 경험을 할 수 있나?

질문자는 사람이 계속 학습하는 데 비해 보통의 챗봇은 그 대화를 문맥으로만 활용한다고 짚었다. 힌턴은 그 차이를 인정하면서 프리즘을 예로 들었다. 로봇은 설명을 듣고 물체의 실제 위치를 가리키면서도, 조금 전에는 다른 곳에 있는 것처럼 보였다고 말할 수 있다. 이미 학습한 모델이라면 이 두 판단을 구별하는 동안 새로 가중치를 바꿀 필요는 없다는 답이다. 힌턴이 지속 학습(continual learning) 없이도 가능하다고 본 것은 바로 이 구별이다. [첫 질문과 답변 · 45:55](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2755s)

### 2. 실리콘 지능이 인간을 대신한다면, 실리콘도 의식을 가질 수 있나?

청중은 실리콘 지능이 언젠가 지구 문명의 주체가 될 수 있는지 물었다. 힌턴은 그것이 자신이 걱정하는 가능성이라고 답한 뒤, ‘인간이 된다’는 말을 사고실험으로 되물었다. 뇌의 뉴런 하나를 정확히 같은 방식으로 작동하는 실리콘 소자로 교체한 순간 의식이 사라질까? 첫 교체 뒤에도 남는다면 두 번째, 세 번째 교체에서는 어떤 이유로 사라지는가? 힌턴은 모든 뉴런을 바꿔도 의식과 감정이 이어질 수 있다고 봤다. 이 논증은 개별 소자의 기능을 그대로 보존할 수 있다는 가정에서 출발한다. [46:50](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2810s)

### 3. 여러 모델의 가중치를 평균하면 각자가 배운 정보가 사라지지 않나?

힌턴은 평균을 내면 각 복제본이 선호한 변화가 전부 반영되지는 않는다고 인정했다. 어떤 가중치를 한쪽은 크게 바꾸고 싶어 하고 다른 쪽은 어느 값이든 상관없어 한다면, 두 요구에 똑같은 비중을 줄 이유가 없다. 이어 자신이 설명한 훈련 방식의 전제를 분명히 했다. 같은 가중치에서 출발해 서로 다른 예제를 처리하고, 각 예제에서 얻은 기울기(gradient)를 평균해 공통 가중치를 한 번 갱신한다. 이미 따로 훈련한 임의의 두 모델을 평균해도 지식이 모두 보존된다는 설명으로 확대하면 안 된다. [47:49](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2869s)

### 4. 모델의 감정은 인간이 쓴 글에서 배운 것인가, 스스로 생길 수도 있는가?

힌턴은 사람이 감정을 드러낸 문장을 이해하려고 학습하면서 감정 표현의 상당 부분을 배웠을 것이라고 답했다. 그러면서 1973년 에든버러에서 본 로봇을 회상했다. 로봇은 검은 펠트 위에 흩어진 나무 부품을 집어 장난감 자동차를 조립했다. 부품이 한데 쌓이면 시각 장치가 구별하지 못했고, 로봇은 집게로 더미를 쓸어 흩뜨렸다. 실제 장치에 그 동작을 넣은 것은 프로그래머였다. 힌턴은 로봇이 막힌 상황에서 스스로 그런 반응을 배웠다면 자신은 그것을 감정으로 부르겠다고 덧붙였다. 관찰한 것은 집게의 동작이고, 감정의 기준을 제안한 사람은 힌턴이다. [49:08](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2948s)

### 5. 지금의 경제 체제는 AI와 양립할 수 있나?

힌턴은 미국을 예로 들었다. 자산가가 세금을 적게 내는 상황에서 노동자까지 AI가 대체하면, 사람들을 부양할 조세 기반이 약해질 수 있다는 우려다. 한편 그는 구글 검색을 개발한 창업자들을 예로 들어 사회에 유용한 발명으로 보상받을 동기 역시 지키고 싶다고 했다. 그가 제안한 해법은 메커니즘 설계(mechanism design)다. 자유민주주의에서 유권자가 뽑은 정치인이 규칙을 정하고, 기업가가 큰 보상을 얻는 길과 사회에 유용한 일을 하는 길이 겹치게 하자는 주장이다. [51:03](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=3063s)

### 6. 인간의 뇌와 AI가 결합하면 초지능과 안전하게 공존할 수 있을까?

레이 커즈와일의 특이점 구상을 언급한 청중에게 힌턴은 결합이 디지털 지능 쪽에도 이득인지 되물었다. 디지털 복제본끼리 지식을 공유하는 속도가 핵심 이점이라면, 인간과 결합할 동기가 어디 있는지부터 설명해야 한다는 뜻이다. 이어 장수와 권력이 함께 고착되는 문제를 두고, 200세가 된 백인 남성들이 통치하는 세계에서 살고 싶은지 농담 섞어 물었다. 죽음에 관한 마지막 말을 이 맥락에서 떼어 인용하지 말라는 당부도 덧붙였다. [53:11](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=3191s)

### 7. 초지능을 통제하는 문제는 애초에 풀 수 있는 문제인가?

힌턴이 질문의 뜻을 되묻자 청중은 수학에도 풀 수 없는 문제가 있듯 여기서도 해가 존재하는지 묻고 있다고 다시 설명했다. 힌턴의 답은 **아직 모른다**였다. 공존할 방법이 있는데도 연구하지 않아 놓치는 일은 피해야 한다는 것이다. 그는 AI를 더 친절하게 만드는 연구에 자원의 1%만 쓰는 상황과 30%를 쓰는 상황을 대비했다. 강연 중 제시한 연구 우선순위의 예시로, 세계 연구비를 집계해 얻은 통계는 제시하지 않았다. 그가 상상한 성공 사례는 서로 다른 사람을 돌보는 AI 둘이 이용자의 목표가 충돌할 때 양쪽을 위해 협상하는 모습이었다. [54:17](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=3257s)

### 8. 성능이 강해지고 위험도 커지는 모델의 가중치를 공개해야 하나?

힌턴은 대형 모델의 가중치 공개(open weights)에 반대했다. 소스 코드 공개의 전통에서는 다른 개발자가 특정 줄을 읽고 오류를 지적할 수 있다. 수십억 개의 학습된 수치는 같은 방식으로 검토하기 어렵지만, 가중치를 받은 쪽은 원래의 막대한 학습비를 들이지 않고도 모델을 바꾸거나 다른 모델에 지식을 전달할 수 있다. 힌턴은 공개 후의 회수가 어렵다는 위험을 핵분열성 물질에 비유했고, 대형 모델의 가중치는 비공개로 유지해야 한다는 자신의 입장으로 답을 맺었다. [55:32](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=3332s)

이 대목에서 힌턴은 DeepSeek와 Llama를 증류 사례로 들었다. 모델 계보는 구체적으로 볼 필요가 있다. DeepSeek 개발진에 따르면 **DeepSeek-R1 본체는 DeepSeek-V3-Base에서 학습했고, 별도의 소형 모델 여섯 종은 R1이 생성한 추론 데이터로 Qwen 또는 Llama 계열을 미세조정했다.** 어느 모델이 답안을 제공한 교사이고 어느 모델이 학생의 출발점인지 구별해야 이 사례를 정확히 이해할 수 있다. [DeepSeek-R1 공식 자료](https://github.com/deepseek-ai/DeepSeek-R1#3-model-downloads)

## 로봇의 말을 어디까지 증거로 볼까?

프리즘을 다시 떠올려 보자. 프리즘을 알려 준 뒤 로봇이 손가락을 정면으로 옮겼다. 대상의 실제 위치와 처음 보인 위치를 구분했다고 판단할 근거가 생겼다. 감정 연구에서 내부 활성에 개입한 뒤 선택이 달라졌다면, 그 상태가 행동에 기여했다는 근거가 하나 더 생긴다. 어느 경우든 관찰한 것과 거기서 끌어낸 결론을 한 문장에 섞으면, 무엇을 확인했고 무엇이 여전히 논쟁인지 놓치게 된다.

힌턴은 한 걸음 더 나아간다. 사람이 착각했다고 말했을 때도 우리는 그 사람 머릿속의 상영관을 찾아가 확인하지 않는다. 그렇다면 자기 지각을 설명하고 오류를 고치는 기계에만 어떤 추가 증거를 요구하는가? 반대로, 우리가 행위자의 보고를 믿는 이유에 인간의 몸과 신경계에 대한 배경지식도 들어 있다면 기계에는 무엇이 그 역할을 할까? **똑같은 행동을 보이는 두 존재에게 서로 다른 기준을 적용할 때, 그 차이를 무엇으로 정당화할지**가 강연 뒤에 남는다.

안전에는 당장 관찰할 수 있는 별도의 질문이 있다. 종료를 막거나 사용자를 설득하는 행동이 나타나면, 그 행동이 사람에게 미치는 결과는 시험할 수 있다. 시스템이 두려움이나 고통을 느끼는지에 관해서는 어떤 증거가 더 필요한지 계속 물을 수 있다. 두 질문을 함께 들고 가면 기계의 마음을 성급히 단정하지 않으면서도, 이미 드러난 행동에 책임 있게 대응할 수 있다.

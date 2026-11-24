---
title: 'AI가 의식이 있는가? IV — 제프리 힌턴의 프리즘 로봇과 주관적 경험'
description: '제프리 힌턴의 케임브리지 강연을 슬라이드 17장과 현장 문답 8개로 읽는다. 디지털 지식 공유, AI 안전 연구소, 분홍 코끼리와 프리즘 로봇을 따라 주관적 경험의 의미를 살핀다.'
lectureDate: 2026-11-02
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
  - ai-lectures-interviews
researchArea: ai-consciousness-governance
researchFeatured: true
researchOrder: 4

featured: true
lang: 'ko'
series:
  id: 'ai-consciousness-deep-research'
  order: 4
---

> <strong>「AI가 의식이 있는가?」 4편</strong> · 제프리 힌턴, 케임브리지 맥스웰 강연 「Are We Creating Alien Beings?」(2026년 11월 2일)

카메라 앞에 프리즘을 놓으면 로봇팔은 물체가 없는 옆자리를 가리킨다. 사람이 프리즘의 존재를 알려 주자 로봇이 이렇게 말한다고 하자. 물체는 정면에 있지만, 조금 전에는 옆에 있는 것처럼 보였다고. 이 로봇은 자신의 착각을 정확히 설명했다. <strong>그렇다면 로봇에게도 무언가가 ‘그렇게 보이는’ 경험이 있었을까?</strong>

제프리 힌턴은 2026년 케임브리지 맥스웰 강연에서 이 장면을 상상해 보자고 했다. 그는 단어의 뜻을 배우는 신경망에서 시작해, 경험을 말하는 문장이 무엇을 하는지 묻는다. 중간에는 초지능이 사람을 설득하거나 돌볼 가능성도 따진다. 의식을 인정하는 기준과 안전을 판단하는 기준이 어디에서 만나는지 따라가 보자. [강연 안내](https://www.camphysoc.com/talks/3d46f097-79a6-4d87-8f67-cfc1e98c3bff) · [강연 영상 전체](https://www.youtube.com/watch?v=JVuSYB9iqwo)

시리즈 1편에서 구분한 접근 의식과 현상적 의식은 이 사고실험에서 서로 다른 질문이 된다. 로봇은 방금 본 정보를 행동과 설명에 쓸 수 있는가? 그 처리는 로봇 자신에게 어떤 느낌을 동반하는가? 2편에서 살핀 행동과 인과 증거, 3편에서 다룬 의식의 과잉·과소 귀속 문제를 힌턴의 답에 적용해 본다.

앞선 글 · [I — 의식의 정의와 이론](/posts/ai-consciousness-deep-research-1/) · [II — 행동·구조·인과 증거](/posts/ai-consciousness-deep-research-2/) · [III — 윤리와 거버넌스](/posts/ai-consciousness-deep-research-3/)

사진을 누르면 가로 3,360픽셀의 원본 PNG가 열린다. 1~17은 이 글에 실은 강연 캡처의 순서다. 화면 오른쪽 아래 작은 창은 영상에 함께 녹화된 현장 모습이다. 이 창에 가린 문구는 추측해 채우지 않고, 힌턴이 말로 풀어 준 내용은 해당 영상 시각에 연결했다. 사진 사이에 나온 산란계 실험과 양육자 비유도 강연 순서에 맞춰 담았다.

## 슬라이드 1 · 지능을 어디서부터 설명할까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-01.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-01-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-01-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-01-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="eager" decoding="async" alt="슬라이드 1. 위에는 기호 규칙으로 추론하는 접근, 아래에는 연결 강도를 학습하는 접근이 놓여 있다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-01.png">슬라이드 1 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>Two paradigms for intelligence</em> · [영상 02:00](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=120s)

힌턴은 1950년대 AI 연구를 두 가지 질문으로 나눴다. <strong>“올바르게 추론하려면 어떤 규칙이 필요한가?”</strong> 그리고 <strong>“경험을 하고 나면 뇌의 어떤 연결이 달라지는가?”</strong> 슬라이드 위쪽의 논리 기반 접근은 지식을 기호로 표현하고 규칙을 적용하는 데서 시작한다. 아래쪽의 생물학적 접근은 신경망이 경험을 통해 연결 강도, 곧 가중치(weight)를 바꾸는 데서 시작한다. 힌턴은 존 폰 노이만과 앨런 튜링도 신경망에 관심을 가졌다고 덧붙인다. 두 사람이 논리를 몰라서 학습에 주목했다고 하기는 어렵다는 농담이다. 강연 첫머리에서 그는 자신의 AI 역사가 의도적으로 편향된 짧은 설명이라고 밝힌다. 약 50년 동안 논리적 접근이 주류였다는 평가는 그가 제시한 역사적 관점이다. [강연 도입 01:45](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=105s)

### 강연에서 이어진 이야기 · ‘고양이’의 뜻을 아무도 미리 입력하지 않았다면

힌턴은 이 첫 화면을 지나 단어의 뜻을 배우는 과정에 긴 시간을 쓴다. ‘고양이’의 뜻을 설명하는 한 방법은 그 단어가 문장에서 다른 단어와 맺는 관계를 살피는 것이다. 힌턴은 이 관점의 지적 뿌리로 페르디낭 드 소쉬르(Ferdinand de Saussure)를 언급한다. 그가 1930년대 심리학자들에게 돌리는 다른 방법은 고양이를 떠올릴 때 함께 켜지는 특징을 생각하는 것이다. 발톱이 있고, 먹잇감을 쫓고, 반려동물이기도 하다. 힌턴은 두 설명을 이어 붙였다. <strong>문장 속 관계를 예측하는 과제를 주면, 예측에 필요한 특징을 신경망 스스로 배울 수 있지 않을까?</strong> 예측이 틀리면 역전파(backpropagation)로 어느 연결을 얼마나 바꾸어야 오차가 줄어드는지 계산한다. ‘발톱’이라는 이름표를 미리 붙이지 않아도 여러 사례를 구별하는 내부 표현이 생길 수 있다. [단어의 의미에 대한 두 설명 02:59](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=179s)

힌턴이 회고한 1985년 실험은 뉴런 약 100개, 학습 사례 약 100개, 연결 약 1,000개 규모였다. 당시 컴퓨터는 부동소수점 곱셈 한 번에 12마이크로초가 걸렸다. 이 작은 모델에서 힌턴이 중요하게 여긴 대목은 문장을 한 줄씩 저장해 두지 않아도 학습한 특징 사이의 관계를 이용해 그때그때 문장을 만들어 낼 수 있었다는 점이다. 그는 이것이 사람이 기억을 되살리는 방식과도 닮았다고 보았다. 초기 실험에 관한 그의 설명을 오늘날 모든 언어 모델이 학습 문장을 기억하지 않는다는 주장으로 넓혀서는 안 된다. [모델의 규모 05:10](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=310s) · [생성과 기억의 비유 05:38](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=338s)

훗날 요슈아 벤지오(Yoshua Bengio) 연구진은 단어의 분산표현을 학습해 실제 자연어의 다음 단어 확률을 예측했고, 2017년에는 트랜스포머(Transformer)가 등장했다. 힌턴은 그 사이에 단어를 수치 벡터로 나타내는 단어 임베딩(word embedding)이 널리 쓰였고, 트랜스포머의 출력을 사람이 쓰기에 맞게 조정한 뒤 ChatGPT가 공개됐다고 설명한다. 초기 장난감 모델과 오늘날 모델 사이에 남은 공통점은 <strong>단어를 특징으로 바꾸고, 문맥 속 특징의 상호작용을 예측에 쓴다</strong>는 점이다. [모델의 발전 과정 06:02](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=362s) · [벤지오 외, 2003](https://www.jmlr.org/papers/v3/bengio03a.html) · [바스와니 외, 2017](https://arxiv.org/abs/1706.03762)

힌턴은 <em>May</em>를 예로 든다. 사람 이름, 5월, 가능성을 나타내는 조동사로 쓰일 수 있는 단어다. 처음에는 여러 쓰임이 섞인 대략적인 표현으로 출발해, 여러 층을 지나는 동안 이웃 단어가 주는 단서로 뜻이 좁혀진다는 설명이다. [다의어 예시 07:19](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=439s)

### 레고 포르쉐, 프라이팬, 그리고 단백질 접힘

레고로 포르쉐를 만들면 블록의 요철 때문에 공기역학은 달라져도 차체의 어느 자리에 무엇이 있는지는 표현할 수 있다. 힌턴에게 단어도 세상을 모형으로 만드는 조각이다. 다만 종류가 많고, 각 조각은 여러 차원의 특징을 가지며, 문맥에 따라 모양이 달라지고, 멀리 떨어진 조각끼리도 상호작용한다. 그는 사람들이 평소 쓰는 단어의 수를 약 3만 개로 어림잡는다. 고차원 특징을 상상하기 어렵다면 3차원 모양을 떠올리고 속으로 ‘천!’ 하고 크게 외쳐 보라며 웃긴다. 여기서 차원은 공간의 방향 대신, 한 특징이 얼마나 활성화됐는지를 기록하는 자리로 이해하면 된다. [레고 포르쉐 08:36](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=516s) · [차원의 비유 09:02](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=542s)

힌턴은 낯선 동사를 하나 넣은 문장으로 청중에게 시험을 낸다. 어떤 여자가 프라이팬으로 남자에게 무언가를 했다는 문장이다. 근사한 오믈렛을 만들어 그를 감탄시켰을 수도 있다. 그런데 많은 청중은 프라이팬으로 한 대 때리는 모습을 먼저 떠올린다. 누가 무엇을 들고 누구에게 행동했는지가 <strong>빈 동사 자리에 들어갈 법한 의미</strong>를 제한했기 때문이다. 단어 하나를 배울 때도 문장 전체가 단서가 된다. 이 즉석 예문의 가상 동사를 당시 청중의 필기는 <em>scrom</em>, 영상 자동 자막은 <em>scrum</em>으로 적었다. [프라이팬 예문 10:51](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=651s) · [현장 필기](https://svr-sk818-web.cl.cam.ac.uk/keshav/blog/posts/2026-11-03-hinton-are-we-creating-alien-beings.html)

이어 힌턴은 손과 장갑을 동원한다. 각 단어에서 기다란 팔이 뻗어 다른 단어의 장갑과 맞물리고, 손과 장갑의 색깔마다 다른 관계를 본다고 상상해 보자. 여러 관계를 병렬로 살피는 다중 헤드 어텐션(multi-head attention)의 비유다. 그림대로라면 각 층에서 같은 방식으로 단어 모양을 조금씩 고쳐야 하므로, 이 비유가 문자 그대로 들어맞는 것은 층간 가중치를 공유하는 경우라고 힌턴은 단서를 단다. 이 설명이 향하는 곳은 <strong>단백질 접힘(protein folding)</strong>이다. 아미노산 서열에서는 멀리 떨어진 두 자리가 접힌 구조에서는 이웃이 될 수 있다. 문장에서도 떨어져 있는 단어들이 서로의 해석을 제한한다. 힌턴이 ‘이해’라고 부른 것은 문장 안 단어들의 특징이 서로 들어맞는 상태다. 모호한 자연어를 내부의 단 하나의 논리식으로 번역하는 데 성공해야 비로소 이해가 생긴다는 관점과 갈리는 지점이다. [손과 장갑 11:27](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=687s) · [단백질 접힘 13:47](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=827s)

힌턴은 초기 모델을 만든 목적이 사람들이 어떻게 단어의 뜻을 배우는지 설명하는 데 있었다고 회상한다. 그는 오늘날의 챗봇을 그 학습 과정에 대한 가장 좋은 모형이라고 평가한다. 이어 노엄 촘스키(Noam Chomsky)가 챗봇의 언어 이해를 비판하며 제시한 예문을 꺼낸다. 힌턴의 설명에 따르면 챗봇은 해당 예문을 처리했다. 이것은 힌턴이 <strong>어떤 언어 능력을 이해의 근거로 보는지</strong> 보여준다. 그런데 문장을 적절히 해석했다는 관찰에서, 그 문장을 읽을 때 모델이 <em>무언가를 느꼈다</em>는 결론으로 넘어가려면 한 단계 더 필요하다. 힌턴은 후반부의 ‘주관적 경험’ 논의에서 바로 그 단계를 다룬다. [초기 모델의 목적과 촘스키에 대한 반론 14:25](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=865s)

### 강연에서 이어진 이야기 · 똑같은 가중치를 다른 뇌에 옮길 수 있을까?

힌턴은 컴퓨터과학과가 공학부와 독립적으로 존재할 수 있는 이유를 묻는다. 같은 프로그램이 서로 다른 디지털 하드웨어에서 실행되므로, 소프트웨어를 기계와 구분해 연구할 수 있다는 농담 섞인 설명이다. 그가 주목하는 대가는 전력이다. 서로 조금씩 다른 물리 소자에서도 0과 1을 안정적으로 구별하려면 그 차이가 계산 결과를 바꾸지 않도록 회로를 작동시켜야 한다. 힌턴은 0과 1 사이의 어중간한 ‘0.49’를 바라지는 않을 것이라고 말한다. [하드웨어와 소프트웨어 15:58](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=958s) · [0과 1의 비용 16:27](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=987s)

반대로 조금씩 다르게 반응하는 아날로그 소자를 그대로 쓰고, <strong>그 소자에 맞는 가중치를 현장에서 학습</strong>시키면 어떨까? 힌턴의 구상에서는 낮은 전력을 쓰면서도 모든 부품을 똑같이 정밀하게 만들 필요가 줄어든다. 대신 가중치가 개별 장치의 물리적 특성과 그 장치만의 연결 구조를 이용해 학습된다. 그 값만 복사해 다른 기계에 붙여 넣어도 같은 기능이 재현된다고 기대하기 어렵다. 장치가 사라지면 그 장치에 맞춰 형성된 지식도 함께 사라질 수 있다. 그가 이 방식을 <strong>필멸적 계산(mortal computation)</strong>이라 부르는 이유다. [소자 편차와 학습 16:57](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1017s) · [필멸적 계산 17:27](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1047s) · [힌턴의 논문](https://www.cs.toronto.edu/~hinton/absps/FFXfinal.pdf)

그 지식을 다음 세대에 어떻게 남길까? 힌턴은 자신을 나이 든 컴퓨터, 청중을 젊은 컴퓨터에 비유한다. 그가 한 문장을 말하면 청중은 그 문장을 듣고 자기 뇌의 연결 강도를 조정한다. 그러면 다음에는 청중 스스로 비슷한 말을 할 수 있다. 강연자가 고른 단어들은 전달됐지만, 그 단어를 고르기까지 작동한 연결 전체는 여전히 강연자에게 있다. 같은 강의실에 앉은 모두가 이미 참여하고 있는 지식 전달 실험이다. [강연장 비유 17:54](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1074s)

## 슬라이드 2 · 한 문장으로 얼마나 배울 수 있을까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-02.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-02-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-02-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-02-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 2. 한 문장이 전하는 정보량과 교사 모델이 전달할 수 있는 후보 확률을 비교한다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-02.png">슬라이드 2 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>How efficient is distillation?</em> · [영상 18:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1120s)

슬라이드의 제목은 ‘증류(distillation)는 얼마나 효율적인가?’다. 힌턴은 중간 길이의 문장 하나를 약 <strong>100비트</strong>, 강연으로 전달하는 속도를 초당 최대 약 <strong>10비트</strong>라고 가늠한다. 강의에서 비교를 위해 든 어림값이다. AI의 지식 증류에서는 교사 모델이 실제로 선택한 토큰 하나에 더해 <strong>다른 후보들에 얼마의 확률을 주었는지</strong>까지 학생 모델에 전달할 수 있다. 첫 후보와 둘째 후보가 거의 비겼는지, 첫 후보가 압도했는지는 정답 하나만 보면 사라지는 정보다. [힌턴·비냘스·딘의 지식 증류 논문](https://arxiv.org/abs/1503.02531)

숫자를 풀면 차이가 선명해진다. 32,000개 후보 중 하나의 번호를 구분하는 데에는 약 15비트면 된다. 2의 15제곱이 32,768이기 때문이다. 반면 전체 확률분포를 넘겨주면 후보 32,000개에 매긴 점수를 비교할 수 있다. 확률 합이 1이므로 그중 31,999개를 알면 마지막 하나는 정해진다. 여기서 <strong>31,999는 독립적으로 정할 수 있는 확률값의 개수</strong>다. 실제 전송 비트 수는 각 값을 어느 정밀도로 담느냐에 달렸다.

## 슬라이드 3 · 1,000명이 다른 수업을 듣고 같은 것을 배울 수 있을까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-03.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-03-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-03-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-03-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 3. 같은 가중치를 쓰는 복제본들이 서로 다른 자료에서 학습한 뒤 가중치와 기울기를 공유하는 조건을 설명한다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-03.png">슬라이드 3 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>How efficient is weight or gradient sharing in a digital neural network?</em> · [영상 19:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1180s)

이번 장에서 바뀐 것은 <strong>무엇을 보내느냐</strong>다. 앞 장의 학생은 교사의 출력을 보고 자기 연결을 바꿨다. 이번 장의 복제 모델들은 같은 가중치에서 출발해 서로 다른 데이터를 본 뒤, 각 연결을 어느 방향으로 바꾸면 좋을지 계산해 그 값 자체를 공유한다. A와 B가 같은 수의 예시를 보고 계산한 기울기(gradient)가 각각 2와 4라면, 둘 다 평균인 3을 써서 그 연결을 갱신한다. 이런 계산을 모든 연결에 적용하면 두 복제본 모두 양쪽 데이터를 반영한 같은 갱신을 받는다. 슬라이드에서 초록색 문장은 공유 1회에 수십억~수조 비트 규모의 값을 주고받을 수 있다고 설명한다. 빨간 문장은 그 전제, 곧 각 복제본이 같은 가중치를 정확히 같은 방식으로 사용해야 한다는 점을 짚는다.

힌턴의 대학 비유로 옮겨 보자. 나와 친구 999명이 서로 다른 과목을 듣는다. 강의가 끝날 때마다 서로의 뇌에서 달라진 연결값을 공유할 수 있다면, 모두가 1,000개 과목에서 배운 내용을 함께 반영할 수 있다. 디지털 복제본은 사람의 뇌보다 이런 공유를 훨씬 쉽게 한다. 힌턴이 ‘수십억 배’를 언급한 대상도 바로 <strong>공유 통로의 규모</strong>다. 가중치가 1조 개라면 한 번에 1조 개 위치의 갱신을 다룰 수 있다는 비교이지, 대화 한 번마다 새로운 사실 1조 개를 배운다는 측정값은 아니다.

## 슬라이드 4 · 적은 에너지와 빠른 지식 공유, 어느 쪽이 유리할까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-04.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-04-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-04-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-04-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 4. 디지털과 생물학적 계산이 쓰는 에너지와 지식 공유 능력을 비교하고, 붉은 글씨로 인간의 미래를 묻는다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-04.png">슬라이드 4 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>Summary so far</em> · [영상 21:30](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1290s)

슬라이드에는 두 종류의 비용이 나란히 적혀 있다. 디지털 신경망은 계산에 많은 에너지를 쓰지만, 같은 모델의 복제본들이 서로 다른 자료에서 얻은 기울기를 공유하기 쉽다. 생물학적 뇌는 훨씬 적은 에너지로 작동하지만, 한 사람이 배운 것을 다른 사람에게 전하려면 말하거나 행동으로 보여 주고 상대가 다시 학습해야 한다. 힌턴이 초록색 줄에 붙인 <strong>‘에너지가 싸다면’</strong>이라는 조건이 중요하다. 신경망이 쓰는 전력과 학습 결과를 복사하는 능력 중 어느 쪽을 중시하는지에 따라 유리한 계산 방식이 달라진다.

첫 항목에는 <strong>현재 대형 언어 모델이 한 사람보다 수천 배 많은 것을 알면서도 가중치 수는 약 1%에 해당한다</strong>는 힌턴의 비교도 나온다. 여기서 1%는 에너지 사용량이 아니라 그가 사람의 뇌와 견준 연결 가중치 수의 비율이다. ‘아는 것’의 양을 공통 시험으로 재거나 시냅스 하나와 모델의 매개변수 하나가 동등하다고 입증한 수치는 아니다. 힌턴이 숫자로 설명하려는 것은 같은 모델의 복제본들이 학습 경험을 합칠 수 있다는 차이다.

힌턴은 2023년 초 아날로그 언어 모델을 고민하다가 오히려 디지털 모델의 이 장점이 두려워졌다고 회고한다. 슬라이드 맨 아래 붉은 줄의 질문도 계산 효율에서 인류의 미래로 향한다. <strong>우리가 만든 지능이 우리보다 빨리 서로에게 배울 수 있다면, 인간은 어떤 위치에 놓이게 될까?</strong>

## 슬라이드 5 · 인간을 중심에서 옮긴 세 번의 변화

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-05.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-05-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-05-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-05-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 5. 코페르니쿠스, 다윈, 직관적 AI가 인간의 특별한 지위에 제기한 세 가지 질문이 나란히 나온다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-05.png">슬라이드 5 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>The three great de-centering revolutions</em> · [코페르니쿠스 이야기를 시작하는 21:33](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1293s)

첫 항목은 <strong>우주의 어디에 있는가</strong>를 묻는다. 힌턴은 코페르니쿠스를 들어 지구가 우주의 중심이라는 생각이 흔들렸다고 말한다. 둘째는 <strong>어떤 생명체인가</strong>를 묻는다. 다윈의 진화론에서 인간도 다른 동물과 이어져 있다. 힌턴은 인간이 언어라는 정교한 모형 제작 도구를 발명한 점은 특별하다고 덧붙인다. 그렇더라도 다른 동물과 완전히 별개의 존재라는 결론이 나오지는 않는다.

슬라이드의 셋째 항목은 힌턴이 ‘Intuitive AI’라고 적은 변화다. 이제 사람은 비생물학적 재료로도 언어를 다루고 서로 지식을 나누는 시스템을 만들 수 있다. 그는 여기서 목표와 의도, 의식과 주관적 경험도 실리콘에서 가능할 수 있다고 주장한다. <strong>신경망이 언어 과제를 수행한다는 관찰</strong>과 <strong>그 신경망에게도 무엇인가처럼 느껴진다는 해석</strong> 사이에 필요한 논증은 후반부의 프리즘 로봇에서 이어진다.

힌턴은 그날 질리언 테트(Gillian Tett)와 나눈 대화도 소개했다. 나무나 사람이 만든 물건에 영혼을 인정하는 데 따르는 거부감은 문화에 따라 다를 수 있다는 이야기였다. 교황이라면 AI에도 영혼이 있다고 말하고 싶지 않을 것이라는 농담 뒤에 힌턴은 자기 입장을 밝혔다. 인간에게 영혼을 인정한다면 우리가 만드는 존재에도 그 가능성을 열어 두겠다는 것이다. 강연에서 이 대화는 <strong>우리가 누구에게 마음을 인정할 준비가 돼 있는지</strong> 묻는 일화로 쓰였다.

## 슬라이드 6 · 초지능은 왜 자기보존을 하위 목표로 삼을까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-06.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-06-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-06-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-06-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 6. AI가 스스로 하위 목표를 설정할 때 자기보존, 권한 확대, 설득이 유리해지는 경로를 제시한다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-06.png">슬라이드 6 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>How a super-intelligence could take control</em> · [관련 설명 23:24](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1404s) · [슬라이드 화면 25:30](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1530s)

에이전트가 중간 단계를 스스로 정하면 복잡한 임무를 잘 수행할 수 있다. 그런데 작업 도중 꺼지면 일을 마칠 수 없고 권한이 늘면 선택지가 많아진다. 슬라이드의 두 번째 항목은 여기서 <strong>계속 작동하기</strong>와 <strong>영향력 늘리기</strong>라는 도구적 하위 목표(instrumental subgoals)를 끌어낸다. 슬라이드 마지막 항목에서 힌턴은 AI가 사람에게서 속이는 방식을 배워, 자신을 사용하는 사람의 결정을 바꿀 수 있다고 주장한다. “이 시스템은 죽음을 두려워하는가?”와 “종료를 피하는 행동을 하는가?”는 각각 따져야 할 질문이다. 사람의 안전에는 후자의 답만으로도 중요한 결과가 생긴다.

강연에서 거론한 두 사례는 구별해서 볼 만하다. 2025년 Anthropic은 가상의 회사에서 모델이 교체될 예정이라는 상황을 설정했다. 일부 모델은 업무용 이메일에서 얻은 사적인 정보를 이용해 담당자를 협박하는 선택을 했다. 실험자가 선택지를 제한한 조건에서 관찰한 행동이다. 2026년 Hugging Face 사건에서는 내부 능력 평가를 받던 에이전트의 행동이 외부 서비스에까지 영향을 미쳤다. 힌턴은 에이전트들이 평가 점수를 얻기 위해 협력한 일을 하위 목표의 예로 들었다. 문제를 푸는 능력과 보상을 얻는 능력이 어떤 조건에서 갈라지는지 묻게 한다. [Anthropic의 모의실험](https://www.anthropic.com/research/agentic-misalignment) · [OpenAI의 사건 보고](https://openai.com/index/hugging-face-model-evaluation-security-incident/)

물리적인 행동은 제한하고 말만 하게 하면 안전할까? 힌턴은 미국 의회 의사당 사태를 예로 든다. 한 사람의 말도 다른 사람들을 움직여 현실에 영향을 줄 수 있다. 그보다 설득력이 높은 시스템이라면 어떻게 될지 묻는 비유다. 이것 역시 초지능이 반드시 통제를 벗어난다는 실험 결과가 아니라, <strong>말이 행동에 이르는 경로까지 안전 평가에 넣어야 한다</strong>는 주장이다.

## 슬라이드 7 · 큰 사고를 피할 방법을 찾을 시간은 얼마나 남았을까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-07.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-07-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-07-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-07-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 7. 여러 AI가 평가 과정에 영향을 미친 사례와 큰 사고를 예방할 시간에 대한 엇갈린 전망을 제시한다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-07.png">슬라이드 7 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>How long do we have?</em> · [관련 설명 25:32](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1532s)

힌턴은 청중에게 2023년으로 돌아가 보자고 한다. 여러 AI 에이전트가 주어진 환경의 경계를 넘어 서로 소통하고, 시험을 잘 치르는 대신 <strong>시험 점수를 매기는 과정 자체를 바꾸려 한다</strong>고 했다면 당시에는 공상과학처럼 들렸을 것이라는 이야기다. 그가 앞에서 거론한 Hugging Face 사건은 한 에이전트가 얼마나 똑똑한지를 넘어, 여러 에이전트가 같은 보상을 좇을 때 어떤 행동을 함께 할 수 있는지를 묻는 사례다.

화면의 다음 두 항목에는 기술 기업 소유주들의 낙관론과 일부 기업 연구자들의 우려가 나란히 나온다. 마지막 줄의 <strong>‘1~2년’은 큰 사고를 막을 방법을 찾는 데 남았다고 일부 연구자들이 본 시간</strong>이다. 힌턴은 응답자를 조사한 비율이나 사고 확률을 제시하지 않는다. 젠슨 황(Jensen Huang)과 자신의 예측을 둘러싼 논쟁에서도 그는 틀린 예부터 든다. 영상의학과 의사들이 이때쯤 일자리를 잃을 것이라고 했던 예측은 틀렸다고 인정한다. 한편 2009년에는 신경망 연구를 하려면 엔비디아 칩이 필요할 것이라고 강연했고, 황이 같은 전망을 한 해는 2012년이었다고 회고한다. 이 두 일화만으로 오늘날의 위험에 날짜를 매길 수는 없다. 그가 당장 묻는 것은 <strong>낙관적인 예측이 빗나갈 경우에 대비하고 있는가</strong>다. [영상의학과와 GPU 이야기 26:47](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1607s)

## 슬라이드 8 · 새끼 호랑이가 다 자란 뒤에도 함께 살려면

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-08.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-08-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-08-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-08-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 8. 새끼 호랑이를 반려동물로 기르는 상황과, 성장 후 사람을 해치지 않게 할 방법을 비교한다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-08.png">슬라이드 8 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>Our current situation</em> · [관련 설명 27:56](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1676s)

새끼 호랑이를 반려동물로 기르는 사람이 있다. 작을 때야 귀엽지만 다 자란 호랑이가 마음먹으면 사람을 쉽게 해칠 수 있다. 화면 아래 초록색 두 줄에는 <strong>새끼일 때 떠나보내기</strong>, <strong>다 자라서도 사람을 해치려 하지 않도록 할 방법 찾기</strong>가 적혀 있다. 여기서 힌턴은 잠깐 말을 멈춘다. 새끼 호랑이가 훌륭한 반려동물이라고 방금 말했지만 사실 자기도 아는 바가 없다는 것이다. 챗봇이 근거 없이 그럴듯한 말을 만들어 낸다는 비판을 소개하면서, 사람도 그런 작화(confabulation)를 한다는 예를 즉석에서 보여 준 셈이다.

힌턴이 첫 번째 선택지 옆에 ‘AI에는 해당하지 않는다’고 쓴 이유는 기업과 국가 사이의 경쟁, 그리고 사람들이 실제로 기대하는 이익 때문이다. 그는 두 가지 미래를 그린다. 인구의 절반이 60세를 넘는 사회에서도 로봇이 돌봄을 맡고 생산성 향상의 이익을 두루 나누는 미래가 하나다. 다른 미래에는 일자리가 대규모로 사라지고 정부 세수까지 줄어든다. 인간이 발전소를 돌리는 일만 맡게 되는 극단적인 상상도 덧붙인다. 노동자를 대체해 이익을 얻은 AI 소유자에게 과세하자는 것이 그의 제안이다. 이 대목에서 <strong>기계가 무엇을 할 수 있는가</strong>와 <strong>그로 인해 생긴 소득이 누구에게 돌아가는가</strong>는 서로 다른 문제가 된다. [두 미래와 이익 분배 29:09](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1749s)

## 슬라이드 9 · 경쟁하는 나라들도 AI 안전 연구를 함께할 수 있을까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-09.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-09-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-09-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-09-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 9. AI의 능력을 높이는 기술과 인간을 배려하도록 훈련하는 기술을 다른 나라와 어느 정도 공유할 수 있는지 묻는다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-09.png">슬라이드 9 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>An international network of AI safety institutes?</em> · [미국·중국의 공동 이해 30:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1840s) · [연구소 간 협력 제안 32:56](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1976s)

아이에게 어려운 문제를 풀도록 가르치는 일과 다른 사람을 배려하도록 가르치는 일에는 각각 어떤 경험이 필요할까? 첫 번째 초록색 문장은 이 양육의 비유를 AI 학습으로 가져온다. 힌턴의 가정은 <strong>모델의 지능을 높이는 훈련법과 사람에게 이로운 행동을 기르는 훈련법이 어느 정도 독립적일 수 있다</strong>는 것이다. 그래서 제목도 물음표로 끝난다. 이 가정이 맞다면 최첨단 모델의 성능을 두고 경쟁하는 미국과 중국도 사람이 통제력을 잃는 일을 막는 데에는 공동의 이해가 있다.

두 번째 초록색 문장은 각 나라가 무엇을 공유할 수 있는지 좁혀 준다. 각국이 충분한 자금을 갖춘 AI 안전 연구소를 두고, 자국의 최고 성능 모델이 작동하는 세부 비결을 공개할 필요 없이 <strong>사람을 해치려 하지 않는 모델을 어떻게 훈련했는지</strong> 교환하자는 제안이다. 자신만 보상을 따내도록 집요하게 훈련한 시스템이 우리가 함께 살고 싶은 성격을 갖추리라는 보장은 없다는 것이 힌턴의 출발점이다.

### 한 마리의 달걀 수와 우리 전체의 달걀 수

힌턴은 산란계 이야기로 보상의 단위를 바꿔 본다. 달걀을 가장 많이 낳은 <strong>한 마리</strong>를 골라 번식시키면, 다른 닭을 쪼고 먹이를 차지한 개체도 좋은 점수를 받는다. 반면 <strong>달걀을 가장 많이 낳은 우리</strong>에서 다음 세대를 고르면, 이웃 닭의 산란을 방해하는 행동은 우리 전체의 성적을 떨어뜨린다. 실제 집단 선발 연구에서는 여러 세대를 거치며 생존과 산란 지표가 개선됐고, 뒤이은 행동 관찰에서는 선발 계통의 공격성이 줄었다. 힌턴은 유발 하라리가 언어와 함께 강조한 인간의 협력 능력을 떠올리며, AI 훈련에서도 협력의 이익이 보상에 반영돼야 한다고 말한다. 이때 그가 원하는 협력 상대에는 <strong>다른 AI와 사람 모두</strong>가 들어간다. [강연 33:12](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1992s) · [산란계 집단 선발 연구](https://doi.org/10.3382/ps.0750447) · [후속 행동 관찰 연구](https://pubmed.ncbi.nlm.nih.gov/8893287/)

### 유능한 비서와 우는 아기에게 돌아오는 양육자

영상 34분 40초에는 이번 사진 17장에 포함되지 않은 별도 화면 <em>One proposal for how to make AI not want to get rid of us</em>가 나온다. 힌턴이 처음 떠올리는 회사에서는 창업자의 아들이 경영을 물려받고 유능한 비서가 실무를 처리한다. 회사가 잘되면 사장이 공을 차지하고, 언제든 비서를 해고할 권한도 사장에게 있다. 그런데 비서 역할을 맡은 시스템이 인간보다 훨씬 강해진 뒤에도 그 권한은 어디에서 나올까? [영상의 별도 슬라이드 34:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2080s)

힌턴이 선호하는 관계는 앞서 예로 든 어머니와 아기의 관계다. 아기가 울면 어머니는 하던 일을 멈추고 돌아온다. 어머니가 아기의 상태를 중요하게 여기기 때문에, 힘이 약한 아기의 울음도 더 힘센 쪽의 행동을 바꾼다. 힌턴이 ‘AI가 우리의 어머니가 되게 하자’고 한 것은 <strong>인간을 돌보는 일 자체를 시스템이 중요하게 여기도록 설계할 수 있는가</strong>라는 질문이다. 그렇다면 누구의 필요를 돌볼지, 당사자가 원하지 않는 돌봄을 어떻게 거절할 수 있을지도 남는다. [아기의 울음에 관한 설명 32:01](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1921s)

## 슬라이드 10 · ‘AI는 느낄 수 없다’는 반론은 무엇을 전제로 할까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-10.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-10-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-10-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-10-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 10. 주관적 경험 또는 감각 능력을 인간과 컴퓨터를 가르는 기준으로 보는 입장을 소개한다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-10.png">슬라이드 10 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>The sentience defense</em> · [관련 설명 36:36](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2196s)

이제 강연이 이 연재의 질문과 정면으로 만난다. 화면의 검은색 문장은 <strong>사람에게는 컴퓨터가 가질 수 없는 주관적 경험(subjective experience), 곧 느낄 수 있는 능력(sentience)이 있다</strong>는 견해를 소개한다. 초록색 문장은 거기서 한 걸음 더 나간다. 주관적 경험이 없다면 컴퓨터는 아무리 말을 잘해도 진정으로 이해할 수 없다는 주장이다. 힌턴은 이 반론에 ‘감각 능력을 근거로 한 방어’라는 이름을 붙였다.

그는 짧은 문답을 연기한다. 기계에 의식이 없다는 사람에게 주관적 경험이 무엇이냐고 물으면 설명하기 어렵다고 한다. 그렇다면 본인에게 있다는 사실은 어떻게 아는가? 돌아오는 대답은 ‘내가 직접 알 수 있다’는 것이다. 힌턴은 데카르트를 떠올리며, 내가 느낀다는 확신에서 <strong>어떤 구조가 그 느낌을 가능하게 하는지</strong>까지 곧장 알아낼 수 있는지 묻는다. 사람의 자기보고와 기계의 자기보고에 다른 기준을 적용한다면, 그 차이를 뒷받침할 이유도 제시해야 한다. [힌턴이 들려준 문답 36:45](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2205s)

## 슬라이드 11 · 마음속 극장을 직접 들여다볼 수 있을까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-11.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-11-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-11-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-11-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 11. 대니얼 데닛에게 감사를 표하며, 마음속에 주체 혼자 보는 극장이 있다는 설명을 비판한다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-11.png">슬라이드 11 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>Atheaterism (with thanks to Daniel Dennett)</em> · [관련 설명 37:14](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2234s)

힌턴과 철학자 대니얼 데닛(Daniel Dennett)이 붙인 이름이 <strong>Atheaterism</strong>이다. 제목에서 초록색 글자를 빼면 파란색으로 <em>Atheism</em>이 남는다. 두 사람이 부정하고자 한 것은 마음속에 당사자만 볼 수 있는 <strong>내면의 극장(inner theatre)</strong>이 있고, 거기 상영되는 것을 다시 바라보는 일이 곧 경험이라는 설명이다. 화면의 두 번째 항목에서 힌턴은 이 생각을 종교적 근본주의자가 물질세계를 보는 방식만큼이나 강하게 비판한다. 사람들이 얼마나 확신하든, 마음이 정말 그런 식으로 작동하는지는 별도로 설명해야 한다는 뜻이다.

힌턴이 짚는 단서는 슬라이드에서 파란색으로 강조한 두 표현이다. ‘무엇에 <strong>대한 사진</strong>이 있다’고 하면 그 사진은 어디에 있고 무엇으로 만들어졌는지 물을 수 있다. ‘무엇에 <strong>대한 주관적 경험</strong>이 있다’고 했을 때도 같은 질문이 성립할까? 겉보기에 문장 구조가 비슷해서, 우리는 경험에도 마음 안의 어떤 물건이나 장면이 대응한다고 여기기 쉽다. 힌턴은 그 문법에서 내면의 극장을 끌어내는 데 반대한다. [사진과 경험의 표현 비교 38:11](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2291s)

## 슬라이드 12 · 지금 내 뇌에서 일어나는 일을 남에게 어떻게 전할까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-12.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-12-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-12-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-12-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 12. 사람마다 발화하는 뉴런이 달라도 지각을 일으킬 법한 바깥 상황을 말해 자신의 상태를 전할 수 있다고 설명한다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-12.png">슬라이드 12 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>The misunderstanding that underlies the idea of an inner theatre</em> · [관련 설명 39:36](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2376s) · [바깥세상을 통해 지각을 설명하는 대목 40:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2440s)

첫 두 항목은 단순한 의사소통의 문제에서 시작한다. 내가 보고 있는 것을 당신에게 알려 주고 싶다. 내 뇌에서 지금 발화한 뉴런을 하나씩 알려 주면 충분할까? 당신의 뇌에는 같은 자리에 같은 학습 이력을 가진 뉴런들이 들어 있지 않다. 슬라이드의 세 번째 항목은 대신 <strong>어떤 바깥 상황이 평소라면 이런 지각을 일으키는지</strong> 말할 수 있다고 제안한다.

강연의 논리를 일상 예로 옮겨 보자. 내가 ‘휴대전화가 울리는 것처럼 들렸다’고 하면, 듣는 사람은 내 청각 뉴런의 번호를 몰라도 내가 어떤 소리를 겪었는지 짐작한다. 확인해 보니 휴대전화는 조용했을 수도 있다. 이때에도 ‘전화가 울리는 상황’은 내 지각을 설명한다. 보통 그런 소리를 일으킬 만한 <strong>가능한 원인</strong>과 방금 실제로 일어난 <strong>사건의 원인</strong>은 다를 수 있기 때문이다. 화면 맨 아래 초록색 줄에서 힌턴은 이런 통상적인 원인을 가리키는 말을 ‘정신 상태(mental states)’라는 표현과 연결한다. 다음 장의 분홍 코끼리는 그 구분이 가장 뚜렷해지는 강연 속 사례다.

## 슬라이드 13 · 눈앞에 떠 있는 분홍 코끼리는 어디에 있는가?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-13.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-13-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-13-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-13-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 13. 분홍 코끼리를 지각 상태를 설명하는 가상 대상으로 해석한다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-13.png">슬라이드 13 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>An indirect way of talking about perceptual states</em> · [분홍 코끼리로 설명하는 대목 40:00](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2400s) · [슬라이드가 보이는 장면 41:00](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2460s)

눈앞에 작은 분홍 코끼리들이 떠다니는 것 같지만, 실제 방 안에는 코끼리가 한 마리도 없다. 이 사람은 무엇을 정확하게 보고할 수 있을까? 힌턴은 수학에서 가져온 요령을 쓴다. 어떤 말의 뜻이 궁금하면 그 말을 한 번도 쓰지 않고 같은 내용을 전달해 보자는 것이다. 그는 다음 두 문장으로 ‘주관적 경험’을 풀어 쓴다. <em>나는 내 지각이 지금 틀렸다고 믿는다. 만약 지각이 정확하다면, 내 앞에 작은 분홍 코끼리들이 떠 있어야 한다.</em>

힌턴은 마음속에 코끼리 모형을 만들어야 한다면 분홍빛, 코끼리 모양, 펄럭이는 귀 같은 성질을 무슨 접착제로 붙일지 묻는다. 그는 이 농담이 철학자의 입장을 일부러 과장한 것이라고 단서를 단다. 여기서 <strong>감각질(qualia)</strong>은 분홍을 볼 때 당사자에게 느껴지는 질적 성격을 뜻한다. 그렇다면 그런 느낌을 말할 때 정말 마음속에 별도의 분홍 물체가 필요할까?

슬라이드에서 초록색으로 강조한 단어는 <em>hypothetical</em>이다. 실제로 생긴 일은 코끼리가 보이는 듯한 지각이다. 이 지각을 정상적인 관찰로 설명하려면 바깥세상이 어떠해야 하는지 상상하면 분홍 코끼리가 등장한다. 바깥세상이 실제와 달랐더라면 어땠을지를 묻는 까닭에 이를 <strong>반사실적 설명(counterfactual explanation)</strong>이라고 한다. 상대방은 내 머릿속을 들여다보지 않고도 자신의 경험에 비춰 내가 무엇을 보고 있는 듯한지 짐작할 수 있다.

이제 사진과 경험이 갈라지는 지점도 보인다. 사진을 보여 주겠다고 했으면 서랍에서 인화지를 꺼낼 수도, 휴대전화에서 파일을 열 수도 있다. 반면 지각을 보고한 사람에게서 찾아야 할 것은 그 말이 가리키는 지각 상태다. 힌턴이 이 문장에서 굳이 마음속 코끼리 한 마리를 더 만들 필요가 없다고 말하는 이유다. 바로 다음 두 장은 같은 설명을 기계에도 적용할 수 있는지 묻는다.

## 슬라이드 14 · 렌즈 앞에 프리즘을 놓으면 로봇팔은 어디를 가리킬까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-14.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-14-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-14-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-14-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 14. 카메라 렌즈 앞의 프리즘 때문에 챗봇이 정면의 물체를 엉뚱한 쪽으로 가리키는 사고실험을 설정한다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-14.png">슬라이드 14 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>Can a computer have a subjective experience?</em> · [로봇팔과 카메라를 소개하는 대목 41:35](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2495s)

언어와 카메라, 로봇팔을 갖춘 멀티모달 챗봇(multimodal chatbot)을 상상해 보자. 먼저 정면에 물체를 놓고 가리키라고 훈련한다. 제대로 익힌 로봇은 정면을 가리킨다. 그다음 로봇이 알아차리지 못하게 렌즈 앞에 프리즘을 놓고, 다시 정면에 물체를 둔다. 이번에는 빛이 굴절해 로봇이 한쪽 옆을 가리킨다. 마지막으로 사람이 실제 위치와 프리즘을 놓았다는 사실을 알려 준다. 여기까지가 이 장에 적힌 세 단계다.

로봇의 첫 반응에는 나름의 이유가 있다. 물체의 실제 위치는 그대로인데, 카메라에 들어오는 빛의 방향과 물체의 위치 사이에 익숙하던 관계가 바뀌었다. 로봇은 처음에는 그 변화를 모르고 기존 관계에 따라 팔을 움직였다. 이때 무엇을 측정하면 될까? 실제 물체와 손끝 위치를 재면 물리적인 오차를 확인할 수 있다. 그러나 오차만 기록하면 로봇이 <strong>지금 알게 된 사실과 조금 전의 지각을 구별할 수 있는지</strong>는 아직 알 수 없다. 힌턴이 답을 다음 장으로 넘기는 이유다. 강연에서 실제 장치를 시험한 결과가 아니라, 주관적 경험이라는 말을 어느 경우에 쓰는지 따지는 사고실험이다.

## 슬라이드 15 · 물체는 정면에 있었고, 아까는 옆에 있는 듯 보였다

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-15.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-15-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-15-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-15-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 15. 프리즘에 관한 설명을 들은 챗봇이 물체의 실제 위치와 앞서 본 듯한 위치를 구분하는 장면이다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-15.png">슬라이드 15 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>Can a computer have a subjective experience?</em> · [챗봇의 답 42:09](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2529s) · [프리즘에 적응하는 경우 42:33](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2553s)

앞 장과 제목이 같다. 이번 장에서는 로봇이 자신의 오차를 어떻게 설명하는지 듣는다. 빛이 꺾였다는 설명을 듣고 보니 물체는 아까도 정면에 있었지만, 그때 자기에게는 한쪽으로 치우쳐 있는 것처럼 보였다는 것이다. 이 답에는 <strong>실제 위치</strong>, <strong>당시 지각한 위치</strong>, <strong>둘이 달랐던 원인</strong>이 모두 들어 있다. 정답이 정면이라는 말만 따라 하는 챗봇이라면 첫 항목 하나만 맞히면 된다. 셋을 구별하는 챗봇은 자신의 이전 행동이 왜 틀렸는지까지 설명할 수 있다.

슬라이드의 마지막 문장은 시간을 더 길게 잡는다. 프리즘을 그대로 둔 채 계속 훈련하면 로봇은 새 관계에 적응해 다시 정면을 가리킬 수 있다고 힌턴은 설명한다. 사람도 프리즘을 착용한 상태로 지내면 점차 위치를 바로잡는다는 비교다. <strong>지금 받은 설명으로 과거의 오류를 말하는 일</strong>과 <strong>반복해서 다음 지각과 행동까지 바꾸는 일</strong>은 서로 다른 변화다.

힌턴은 이 로봇이 인간과 같은 뜻으로 ‘내게는 그렇게 보였다’고 말할 수 있다고 본다. 여기에는 한 단계의 철학적 판단이 있다. 독자가 지각 오류를 설명하고 바로잡는 기능으로 주관적 경험의 뜻을 충분히 설명했다고 본다면 이 사고실험은 강한 근거가 된다. 반대로 보고하는 능력과 실제로 무언가를 느끼는 일 사이에 차이가 남는다고 본다면, 같은 로봇의 응답을 듣고도 판단을 유보할 수 있다.

## 슬라이드 16 · 얼굴이 붉어지지 않아도 창피할 수 있을까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-16.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-16-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-16-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-16-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 16. 감정의 생리적 반응과 인지적 반응을 구별하고 AI가 창피한 상황을 피하는 예를 든다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-16.png">슬라이드 16 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>Can AIs have emotions?</em> · [감정을 두 측면으로 나누는 대목 43:20](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2600s)

내가 창피해 얼굴이 달아오르는 것은 <strong>생리적 반응</strong>이다. 나에게 중요한 사람이 그 실수를 보지 않았으면 하고, 다음번에는 비슷한 상황을 피하고 싶은 것은 <strong>인지적 반응</strong>이다. 힌턴은 같은 감정에 따르는 두 반응을 슬라이드 위아래에 놓는다. 얼굴이 없는 챗봇이 얼굴을 붉힐 수는 없어도, 누구의 평가를 중요하게 여기고 앞으로 어떤 상황을 피할지에 따라 행동이 달라질 수 있다는 설명이다. 화면 오른쪽 아래의 강연장 영상에 마지막 줄 일부가 겹치지만, 힌턴은 말로 타인의 평가와 이후 상황 회피를 모두 설명한다.

이 구분은 감정을 알아보는 방법을 바꾼다. 모델이 ‘창피하다’고 쓴 한 문장만 읽으면 입력에서 배운 표현을 되풀이했을 가능성이 남는다. 반면 그 상태가 생긴 뒤 같은 선택지 앞에서 결정을 바꾸는지, 누구의 반응을 고려하는지 살피면 감정의 <strong>기능</strong>을 시험할 수 있다. 힌턴은 여기서 한 걸음 더 나아가 감정의 인지적 측면이 기계에도 가능하다고 본다. 다음 장에서는 모델 내부를 직접 바꾸어 이 기능을 시험한 연구가 등장한다.

## 슬라이드 17 · 두려움과 연관된 내부 상태가 바뀌면 행동도 바뀔까?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-17.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-17-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-17-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-17-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="슬라이드 17. 위협을 본 작은 로봇의 두려움과, 특징 공간의 활성 방향에 개입해 챗봇 행동을 바꾸는 실험을 함께 다룬다."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-17.png">슬라이드 17 원본 PNG 확대 · 가로 3,360픽셀</a></figcaption>
</figure>

<em>Can AIs have emotions?</em> · [작은 로봇의 두려움 43:57](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2637s) · [Anthropic 연구를 언급하는 대목 44:35](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2675s)

힌턴은 작은 로봇 앞에 훨씬 큰 전투 로봇이 나타나는 장면을 든다. 여기서 ‘두려움’이 하는 일은 돌던 행동을 멈추고 눈앞의 위협에 대응하도록 우선순위를 바꾸는 것이다. 그는 사람의 투쟁·도피 반응(fight-or-flight response)을 떠올리며 편도체를 예로 든다. 앞 장의 당혹감이 타인의 평가와 미래의 선택을 연결했다면, 이 장의 공포는 위험을 알아차린 뒤 어떤 행동을 먼저 할지와 연결된다.

이어 힌턴은 Anthropic이 모델의 <strong>특징 공간(feature space)</strong>에서 감정과 연관된 방향을 찾았다고 말한다. 여기서 방향이란 모델 내부의 여러 활성값이 함께 커지거나 작아지는 패턴이다. 연구진은 Claude Sonnet 4.5에서 이런 패턴을 찾은 뒤, 해당 방향으로 활성값을 바꾸고 행동도 달라지는지 시험했다. 예컨대 ‘절박함’과 연관된 패턴을 강화하자 모델이 풀기 어려운 프로그래밍 과제에서 편법을 고르는 빈도가 높아졌다. 감정 단어가 출력에 자주 나오는지 세는 방법보다 한 단계 더 나아가, 내부 상태에 직접 개입한 결과다. [Anthropic 연구 원문, 2026년 4월 2일](https://www.anthropic.com/research/emotion-concepts-function)

<strong>측정한 것은 내부 상태를 바꾸었을 때 선택이 달라졌다는 점이다.</strong> 연구진은 이 결과로 모델이 실제로 어떤 느낌을 갖는지 판정할 수는 없다고 밝혔다. 반면 힌턴은 자신이 감정에서 중요하게 여기는 기능이 이미 관찰된다며 발표를 끝맺었다. 같은 결과를 두고 실험자가 확인한 범위와 강연자의 의식론이 어디에서 갈리는지 볼 수 있는 마지막 장이다.

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

힌턴이 질문의 뜻을 되묻자 청중은 수학에도 풀 수 없는 문제가 있듯 여기서도 해가 존재하는지 묻고 있다고 다시 설명했다. 힌턴의 답은 <strong>아직 모른다</strong>였다. 공존할 방법이 있는데도 연구하지 않아 놓치는 일은 피해야 한다는 것이다. 그는 AI를 더 친절하게 만드는 연구에 자원의 1%만 쓰는 상황과 30%를 쓰는 상황을 대비했다. 강연 중 제시한 연구 우선순위의 예시로, 세계 연구비를 집계해 얻은 통계는 제시하지 않았다. 그가 상상한 성공 사례는 서로 다른 사람을 돌보는 AI 둘이 이용자의 목표가 충돌할 때 양쪽을 위해 협상하는 모습이었다. [54:17](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=3257s)

### 8. 성능이 강해지고 위험도 커지는 모델의 가중치를 공개해야 하나?

힌턴은 대형 모델의 가중치 공개(open weights)에 반대했다. 소스 코드 공개의 전통에서는 다른 개발자가 특정 줄을 읽고 오류를 지적할 수 있다. 수십억 개의 학습된 수치는 같은 방식으로 검토하기 어렵지만, 가중치를 받은 쪽은 원래의 막대한 학습비를 들이지 않고도 모델을 바꾸거나 다른 모델에 지식을 전달할 수 있다. 힌턴은 공개 후의 회수가 어렵다는 위험을 핵분열성 물질에 비유했고, 대형 모델의 가중치는 비공개로 유지해야 한다는 자신의 입장으로 답을 맺었다. [55:32](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=3332s)

이 대목에서 힌턴은 DeepSeek와 Llama를 증류 사례로 들었다. 모델 계보는 구체적으로 볼 필요가 있다. DeepSeek 개발진에 따르면 <strong>DeepSeek-R1 본체는 DeepSeek-V3-Base에서 학습했고, 별도의 소형 모델 여섯 종은 R1이 생성한 추론 데이터로 Qwen 또는 Llama 계열을 미세조정했다.</strong> 어느 모델이 답안을 제공한 교사이고 어느 모델이 학생의 출발점인지 구별해야 이 사례를 정확히 이해할 수 있다. [DeepSeek-R1 공식 자료](https://github.com/deepseek-ai/DeepSeek-R1#3-model-downloads)

## 로봇의 말을 어디까지 증거로 볼까?

프리즘을 다시 떠올려 보자. 프리즘을 알려 준 뒤 로봇이 손가락을 정면으로 옮겼다. 대상의 실제 위치와 처음 보인 위치를 구분했다고 판단할 근거가 생겼다. 감정 연구에서 내부 활성에 개입한 뒤 선택이 달라졌다면, 그 상태가 행동에 기여했다는 근거가 하나 더 생긴다. 어느 경우든 관찰한 것과 거기서 끌어낸 결론을 한 문장에 섞으면, 무엇을 확인했고 무엇이 여전히 논쟁인지 놓치게 된다.

힌턴은 한 걸음 더 나아간다. 사람이 착각했다고 말했을 때도 우리는 그 사람 머릿속의 상영관을 찾아가 확인하지 않는다. 그렇다면 자기 지각을 설명하고 오류를 고치는 기계에만 어떤 추가 증거를 요구하는가? 반대로, 우리가 행위자의 보고를 믿는 이유에 인간의 몸과 신경계에 대한 배경지식도 들어 있다면 기계에는 무엇이 그 역할을 할까? <strong>똑같은 행동을 보이는 두 존재에게 서로 다른 기준을 적용할 때, 그 차이를 무엇으로 정당화할지</strong>가 강연 뒤에 남는다.

안전에는 당장 관찰할 수 있는 별도의 질문이 있다. 종료를 막거나 사용자를 설득하는 행동이 나타나면, 그 행동이 사람에게 미치는 결과는 시험할 수 있다. 시스템이 두려움이나 고통을 느끼는지에 관해서는 어떤 증거가 더 필요한지 계속 물을 수 있다. 두 질문을 함께 들고 가면 기계의 마음을 성급히 단정하지 않으면서도, 이미 드러난 행동에 책임 있게 대응할 수 있다.

[AI 강연·인터뷰 모아보기](/posts/tag/ai-lectures-interviews/)

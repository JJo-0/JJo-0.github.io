---
title: '반도체 설계 AI'
description: '칩이 설계에서 실제 제조 가능한 도면이 되기까지의 과정과, AlphaChip·상용 EDA·OpenROAD 같은 AI가 그 과정에서 실제로 돕는 일을 쉽게 설명한다.'
pubDate: 2026-08-29
slug: 'self-improving-ai-chip-design'
category: ai-machine-learning
subcategory: semiconductor-ai
type: research-report
tags:
  - ai-for-eda
  - reinforcement-learning
  - chip-design
  - openroad
  - semiconductor
featured: true
researchArea: ml-foundations-evaluation
researchFeatured: true
researchOrder: 12
lang: 'ko'
---

## 칩을 설계한다는 것은 무엇일까

스마트폰이나 AI 서버 안의 칩은 아주 많은 전자 스위치와 금속선을 한 장의 작은 판 위에 넣은 결과물이다. 먼저 설계자는 “이 칩이 무엇을 계산하고, 어떤 순서로 신호를 처리할지”를 코드와 도면으로 적는다. 그러나 그 초안은 아직 공장에서 만들 수 있는 칩이 아니다.

그다음에는 수많은 회로 블록을 어디에 놓을지 정하고, 서로 연결할 금속선을 그리며, 전기가 제시간에 도착하는지와 공장 규칙을 지키는지를 검사해야 한다. 이 긴 작업을 돕는 전문 소프트웨어가 EDA(Electronic Design Automation)다. AI는 이 과정을 통째로 대체하기보다, 사람이 고르기 어려운 수많은 설계 선택지에서 더 좋은 후보를 빠르게 찾아 주는 역할을 맡기 시작했다.

```text
칩이 할 일 결정
  → 회로 초안 작성
  → 부품을 칩 위에 배치
  → 금속선으로 연결
  → 속도·전력·제조 가능성 검사
  → 실제 생산
```

## AI는 설계 과정에서 무엇을 돕나

### 1. 너무 많은 선택지에서 후보를 찾아 준다

칩 안의 큰 부품을 어느 위치에 놓을지, 배선 도구의 설정을 어떻게 조절할지에 따라 결과가 달라진다. 한 가지 설정이 속도에는 좋아도 전력 소모나 칩 면적에는 나쁠 수 있다. 그래서 설계팀은 보통 **더 빠르게, 전기를 덜 쓰게, 면적은 더 작게** 만들 방법을 함께 찾는다. 이 세 가지를 묶어 PPA(Performance·Power·Area)라고 부른다.

AI는 수백~수천 가지 후보를 비교해 “다음에는 이 설정을 시험해 보자”고 제안한다. 좋은 답을 한 번에 알아맞히는 마법이 아니라, 결과를 보고 더 나은 다음 실험을 고르는 조수에 가깝다.

### 2. 사람이 읽기 어려운 설계 보고서를 읽게 돕는다

검사 뒤에는 “어느 구역의 배선이 너무 붐빈다”, “신호가 늦는다”, “금속선 간격이 공장 규칙보다 좁다” 같은 보고서가 나온다. AI agent는 이 보고서를 읽어 다음에 바꿔 볼 설정을 계획할 수 있다. 최근 OpenROAD MCP 같은 도구는 AI가 OpenROAD를 실행하고 보고서와 측정값을 다시 읽을 수 있게 연결한다.

다만 AI가 변경을 제안했다고 바로 생산하는 것은 아니다. EDA의 검사와 최종 signoff가 매번 “정말 만들 수 있는가”를 확인한다. **AI는 조수이고, 검증 도구는 심사관**이다.

### 3. 이전 실험을 다음 설계에 재사용할 수 있게 한다

어떤 AI는 한 설계에서 잘 작동한 배치 전략을 비슷한 다음 설계의 출발점으로 가져간다. 이를 전이학습이라고 한다. 예를 들어 이전 설계에서 배선이 덜 꼬였던 부품 배치의 감각을 새 설계의 첫 후보에 반영하는 식이다. 하지만 설계 크기, 제조 공정, 라이브러리가 달라지면 이전 경험이 그대로 통하지 않을 수도 있다. 그래서 새 설계에서도 실제 검사로 다시 확인해야 한다.

<details>
<summary><strong>처음 읽는 사람을 위한 용어 사전</strong></summary>

| 용어 | 쉽게 말하면 |
|---|---|
| **RTL** | 칩이 어떤 일을 할지 코드처럼 적은 초안 |
| **EDA** | 초안을 실제 제조 가능한 칩 배치도로 바꾸고 검사하는 도구 |
| **PPA** | 속도(Performance), 전력(Power), 면적(Area)의 균형 |
| **timing** | 신호가 제시간에 도착하는지 검사하는 일 |
| **congestion** | 배선이 한곳에 너무 몰려 막힌 상태 |
| **DRC** | 선폭·간격 같은 공장 규칙 위반 검사 |
| **signoff** | 생산 직전 ‘만들어도 된다’를 확인하는 최종 합격 판정 |

</details>

## 실제 사례로 보면 더 쉽다

### Google AlphaChip: 큰 부품을 어디에 놓을지 배우는 AI

[circuit_training](https://github.com/google-research/circuit_training)은 큰 회로 블록을 칩의 어느 위치에 둘지 반복해서 배운다. 부품 위치가 좋으면 연결선이 짧아지고 배선이 덜 막힐 가능성이 있다. AI는 한 부품을 놓고 결과를 확인한 다음, 다음 부품의 위치를 고른다. 이를 reinforcement learning(RL)이라고 부른다.

### Synopsys DSO.ai와 Cadence Cerebrus: 설계 도구의 설정을 탐색하는 AI

상용 도구는 보통 칩을 새로 발명하기보다, 기존 설계 도구가 가진 많은 설정을 더 효율적으로 탐색한다. [Synopsys DSO.ai](https://www.synopsys.com/ai/ai-powered-eda/dso-ai.html)와 [Cadence Cerebrus](https://www.cadence.com/en_US/home/tools/digital-design-and-signoff/soc-implementation-and-floorplanning/cadence-cerebrus-ai-studio.html)가 대표적이다. 설계자는 목표와 제약을 정하고, AI는 여러 후보를 실행·비교해 팀이 검토할 결과를 만든다.

### OpenROAD: 직접 실험해 볼 수 있는 공개 도구

[OpenROAD](https://github.com/The-OpenROAD-Project/OpenROAD)는 칩 설계의 많은 단계를 공개 도구로 실행할 수 있게 만든 프로젝트다. 여기에 [AutoTuner](https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts/blob/master/docs/user/InstructionsForAutoTuner.md)를 붙이면 사람이 하나씩 설정을 바꾸지 않아도 여러 후보를 비교할 수 있다. [OpenROAD MCP](https://github.com/The-OpenROAD-Project/OpenROAD-MCP)는 AI assistant가 이 도구의 실행 결과와 보고서를 읽도록 연결한다.

## 그럼 AI가 칩을 혼자 설계하는 시대인가

아직은 아니다. 현재 AI가 특히 잘하는 일은 **반복 실험을 줄이고, 많은 후보 중에서 유망한 방향을 찾는 일**이다. 반면 칩을 생산할 수 있는지의 최종 판단은 전기적 규칙, 물리 현상, 제조 규칙을 확인하는 결정론적 검증 도구가 맡는다.

이 차이를 알고 있으면 “AI가 반도체 설계를 했다”는 표현도 훨씬 정확하게 읽을 수 있다. 대개는 AI가 설계 과정의 한 부분—배치, 설정 탐색, 보고서 해석, 실험 계획—을 더 빠르게 돕고 있다는 뜻이다.

## 더 깊이 보기: 조사와 실험에 쓰는 지도

아래부터는 이 글을 조사·실험에 사용하려는 독자를 위한 상세 자료다. 처음 읽을 때는 건너뛰어도 된다.

<details>
<summary><strong>AI가 ‘스스로 개선한다’는 말을 나누어 보는 기준</strong></summary>

`설정 변경 → EDA 실행 → 속도·전력·면적·규칙 위반 확인 → 다음 설정 변경`이 설계 AI의 기본 고리다. 여기서 앞선 실험 결과로 다음 선택을 더 잘하면 adaptive optimization, 그 선택 규칙 자체를 보상으로 학습하면 RL, 다른 설계에 경험을 옮기면 transfer learning이라고 부른다.

| 단계 | 조사용 이름 | 뜻 |
|---|---|---|
| 0 | Automation | 정해진 script/flow를 실행한다. |
| 1 | Parameter search | grid/random으로 설정을 넓게 시험한다. |
| 2 | Adaptive optimization | 이전 결과로 다음 후보를 더 유망하게 고른다. |
| 3 | Reinforcement learning | 행동 결과의 보상으로 선택 규칙을 갱신한다. |
| 4 | Transfer learning | 한 설계의 경험을 다음 설계의 출발점으로 가져간다. |
| 5 | Continual learning | 여러 프로젝트의 경험을 장기적으로 보존·재사용한다. |
| 6 | Agentic EDA | agent가 계획하고 도구를 호출하고 보고서를 읽는다. |
| 7 | Self-verifying agentic EDA | agent의 행동을 EDA·물리 검증이 매번 통과/거부한다. |
| 8 | Recursive improvement | 탐색 전략·목표·도구 순서까지 실험으로 개선한다. |

이 표는 제품의 등급표가 아니다. 공개 근거가 어디까지 있는지 분리하기 위한 조사 틀이다. 특히 장기 기억과 재귀 개선은 공개적으로 검증된 일반 해법이라고 보기 어렵다.

</details>

### 어떤 방식으로 다음 후보를 고르는가

| 방법 | 무엇을 배우나 | 피드백 | 표본 효율 | 일반화 | EDA에 맞는 자리 | 공개 구현 |
|---|---|---|---|---|---|---|
| Grid / random | 학습 없음 | 각 trial QoR | 낮음 | 없음 | 작은 knob sanity check | OpenROAD AutoTuner sweep |
| Bayesian optimization / Gaussian process | objective의 대리모형 | 소수의 비싼 EDA trial | 높음 | feature 설계에 좌우 | flow tuning, HPO | Ax/Optuna 기반 AutoTuner |
| Evolutionary / genetic / CMA-ES | 후보 population·분포 | 세대별 QoR | 중간 | 약함~중간 | 비미분·mixed discrete knob | Nevergrad, Optuna |
| Simulated annealing | 현재 해의 수용 확률 | objective 변화 | 중간 | 없음 | placement·combinatorial baseline | cyclic RL+SA 연구 |
| Contextual bandit | context별 action 가치 | 빠른 보상 | 높음 | context 품질에 좌우 | 반복 recipe 선택 | BO+bandit search |
| RL | policy/value | trajectory reward | 보통 낮음 | pretrain 시 개선 가능 | placement, sequential optimization | circuit_training |
| GNN + RL | netlist/graph 표현과 policy | physical QoR | 학습 비용 큼 | graph transfer 가능성 | macro placement, HLS DSE | AlphaChip 계열 연구 |
| Surrogate model | 빠른 QoR 예측기 | 과거 EDA label | 매우 높음 | distribution shift 위험 | expensive run filter | CircuitNet 기반 연구 |
| Differentiable / gradient placement | 위치·density의 gradient | analytic surrogate | 높음 | tool/assumption 의존 | global placement | DREAMPlace |
| Meta / transfer / continual learning | 초기화·policy·memory | 여러 design 결과 | 장기적으로 잠재력 큼 | 핵심 과제 | cross-design warm start | 연구 단계 |
| LLM / multi-agent | 계획·tool sequence·설명 | report·tool output | tool 비용에 좌우 | prompt/tool schema 의존 | flow orchestration | OpenROAD MCP, vendor agents |

**중요한 구분:** Gaussian process는 Bayesian optimization에서 자주 쓰는 surrogate이고, evolutionary algorithm·genetic algorithm·CMA-ES는 후보 분포를 진화시키는 서로 다른 계열이다. “AI”라는 한 단어로 묶으면 표본 효율, 실패 모드, 재현 비용이 사라진다.

## 대표 사례를 더 자세히 보기

### AlphaChip / Google circuit_training — RL이 실제 배치를 어떻게 다루는가

[circuit_training](https://github.com/google-research/circuit_training)은 Google Research가 공개한 distributed deep RL 기반 chip floorplanning framework다. 큰 회로를 graph로 표현하고, macro를 어느 위치에 놓을지를 순차 action으로 선택한다. state에는 이미 배치된 macro와 연결 구조, action에는 다음 macro의 위치 후보, reward에는 wirelength·congestion·density 같은 물리 proxy가 들어간다. 좋은 proxy reward로 빠르게 후보를 거른 뒤 실제 physical implementation으로 평가한다.

이 구조에서 “학습이 더 좋아진다”는 뜻은 policy가 이전 placement trajectory의 reward를 사용해 다음 placement 선택을 갱신한다는 것이다(Level 3). 공개 저장소는 pretraining과 fine-tuning이 placement 속도·품질에 도움을 준다고 설명하므로, 다른 block으로 초기 policy를 옮기는 부분은 Level 4 주장에 해당한다. 다만 이는 저장소·저자 측 근거이며 모든 회사·PDK·block에서의 보편적 우월성을 뜻하지 않는다. Nature 논문에는 2024년 addendum도 있으므로, 결과를 인용할 때는 재현 조건과 평가 protocol을 함께 읽어야 한다. [Nature 논문](https://www.nature.com/articles/s41586-021-03544-w) · [공개 비판적 평가](https://arxiv.org/abs/2302.11014) · [2024 addendum](https://www.nature.com/articles/s41586-024-07949-9)

### Synopsys DSO.ai — 상용 design-space optimization

[DSO.ai](https://www.synopsys.com/ai/ai-powered-eda/dso-ai.html)는 reinforcement learning 기반으로 implementation flow의 넓은 설정 공간을 탐색한다고 설명한다. 즉 AI가 chip 자체를 직접 “발명”한다기보다 Fusion Compiler/IC Compiler II 같은 EDA flow의 선택지를 반복 평가하는 DSO 엔진에 가깝다. vendor는 상용 tapeout과 PPA 성과를 발표했지만, 특정 배수 개선·tapeout 수는 vendor/customer 발표라는 성격을 유지해야 한다. 독립 benchmark·동일 조건 재현 없이 일반 성능으로 확장하면 안 된다. [Synopsys의 100 commercial tapeout 발표](https://news.synopsys.com/2023-02-07-AI-designed-Chips-Reach-Scale-with-First-100-Commercial-Tape-outs-Using-Synopsys-Technology?asPDF=1)

### Cadence Cerebrus — 탐색에서 agentic multi-block으로

[Cerebrus](https://www.cadence.com/en_US/home/tools/digital-design-and-signoff/soc-implementation-and-floorplanning/cadence-cerebrus-ai-studio.html)는 2021년 Intelligent Chip Explorer에서 출발해 physical implementation 전반의 AI exploration을 내세웠고, 이후 AI Studio에서 subsystem·multi-block·multi-user·transfer를 강조한다. 이것은 Level 2–4의 DSE 위에 Level 6 성격의 orchestration을 얹는 방향이다. 그러나 장기 cross-project memory가 regression 없이 축적된다는 강한 독립 검증과, agent가 signoff 없이 판단해도 된다는 뜻은 아니다. [Cadence multi-block white paper](https://www.cadence.com/en_US/home/resources/white-papers/cadence-cerebrus-ai-studio-agentic-ai-multi-block-multi-user-soc-wp.html)

### Siemens Fuse / Solido — ‘self-verifying’이 의미 있는 이유

Siemens는 2026년 [Fuse EDA AI Agent](https://news.siemens.com/en-gb/siemens-fuse-eda-ai-agent/)와 [self-verifying architecture](https://blogs.sw.siemens.com/cicv/2026/07/29/self-verifying-eda-ai-agents/)를 발표했다. 여기서 좋은 설계 원리는 LLM이 정답을 선언하지 않고, agent가 계획·실행한 매 step을 deterministic EDA engine 및 physics 기반 분석이 다시 검증한다는 것이다. 이것이 Level 7의 정의에 가장 가깝다. 다만 “every project에서 학습한다” 같은 표현은 vendor architecture/roadmap 주장으로 읽고, public benchmark와 모델 업데이트 범위를 따로 확인해야 한다.

## OpenROAD: 누구나 재현할 수 있는 설계 실험

[OpenROAD](https://github.com/The-OpenROAD-Project/OpenROAD)와 [OpenROAD-flow-scripts (ORFS)](https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts)는 RTL-to-GDSII 흐름을 공개한다. [AutoTuner](https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts/blob/master/docs/user/InstructionsForAutoTuner.md)는 JSON으로 knob 범위를 정의하고 Ray Tune으로 grid/random, PBT, HyperOpt/TPE, AxSearch, Optuna+CMA-ES, Nevergrad evolutionary search를 고를 수 있다. PPA coefficient와 METRICS2.1 결과를 보상/목표로 쓰므로 Level 1–2의 좋은 기준선이다. RL이 아니어도 충분히 유용한 이유가 여기에 있다.

2026년 [OpenROAD MCP](https://github.com/The-OpenROAD-Project/OpenROAD-MCP)는 AI client가 OpenROAD/ORFS session, command history, metrics, report image를 읽고 실행하도록 연결한다. 가능한 폐루프는 `LLM agent → MCP → ORFS/OpenROAD → metrics·reports → analysis → revised config → re-run`이다. 하지만 MCP는 **도구 연결 규약**일 뿐, 자동으로 학습·전이·안전을 보장하는 optimizer는 아니다. agent가 설정을 바꾸는 권한, command allowlist, experiment DB, deterministic signoff gate를 별도로 설계해야 Level 7에 가까워진다.

## 공개 생태계: AI 프로젝트와 재현 도구

아래는 연구·실험을 실제로 조립할 때 유용한 공개 프로젝트다. 첫 묶음은 직접적인 optimization/EDA ML/automation이고, 두 번째 묶음은 이를 평가·재현하기 위한 flow·PDK·검증 기반이다. 모두가 2024–26년에 새로 나온 “자율 설계 AI”라는 뜻은 아니다.

| 역할 | 프로젝트 | 왜 보는가 |
|---|---|---|
| RL placement | [circuit_training](https://github.com/google-research/circuit_training) | AlphaChip 계열 RL framework |
| RTL-to-GDS | [OpenROAD](https://github.com/The-OpenROAD-Project/OpenROAD) · [ORFS](https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts) | 공개 physical-design ground truth |
| tuning | [AutoTuner](https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts/tree/master/tools/AutoTuner) | Ray 기반 DSE baseline |
| agent tool bridge | [OpenROAD MCP](https://github.com/The-OpenROAD-Project/OpenROAD-MCP) | tool calls, metrics, reports |
| open flow | [LibreLane](https://github.com/librelane/librelane) · [OpenLane](https://github.com/The-OpenROAD-Project/OpenLane) | reproducible ASIC flow |
| differentiable placement | [DREAMPlace](https://github.com/limbo018/DREAMPlace) · [AutoDMP](https://github.com/rachelselinar/AutoDMP) | GPU placement / design automation research |
| ML data | [CircuitNet](https://github.com/circuitnet/CircuitNet) | congestion·DRC·IR-drop dataset |
| implementation | [iEDA](https://github.com/OSCC-Project/iEDA) | open EDA implementation |
| analog automation | [ALIGN](https://github.com/ALIGN-analoglayout/ALIGN-public) | SPICE netlist to analog layout |
| architecture/RTL | [Chipyard](https://github.com/ucb-bar/chipyard) · [OpenFASoC](https://github.com/idea-fasoc/OpenFASOC) | design generation/evaluation input |
| compiler/simulation | [Yosys](https://github.com/YosysHQ/yosys) · [Verilator](https://github.com/verilator/verilator) · [Cocotb](https://github.com/cocotb/cocotb) | synthesis·simulation regression |
| FPGA / layout | [nextpnr](https://github.com/YosysHQ/nextpnr) · [VTR](https://github.com/verilog-to-routing/vtr-verilog-to-routing) · [Coriolis](https://github.com/lip6/coriolis) | alternative CAD experiments |
| HDLs / generators | [Amaranth](https://github.com/amaranth-lang/amaranth) · [Magma](https://github.com/phanrahan/magma) · [PyMTL3](https://github.com/pymtl/pymtl3) · [LiteX](https://github.com/enjoy-digital/litex) | parameterized design sources |
| PDK / reproducibility | [SkyWater PDK](https://github.com/google/skywater-pdk) · [Hammer](https://github.com/ucb-bar/hammer) · [Fault](https://github.com/leonardt/fault) | open PDK·flow orchestration·test |

이 directory는 최소 26개 project를 직접 연결한다. 연구를 시작할 때 “repo가 있다”와 “논문 결과를 재현했다”를 구분해야 한다. commit, version, PDK license, design input, seed, run log가 없으면 둘은 다르다.

## 설계 밖에서도 같은 일이 일어난다: 제조 AI

fab에서의 self-optimization은 설계와 다른 시간척도를 가진다.

```text
equipment sensor → process measurement / metrology → AI model
→ recipe recommendation or bounded change → wafer processing
→ inspection · yield → model update
```

여기에는 서로 다른 다섯 일을 혼동하지 않는 것이 중요하다.

| 종류 | 질문 | 예 |
|---|---|---|
| Adaptive process control / APC | 지금 공정 조건을 얼마나 보정할까? | overlay·CD feedback |
| Virtual metrology | 매번 직접 재지 않고 값을 추정할 수 있나? | sensor→film thickness estimate |
| Run-to-run control | 이전 wafer/lot 결과를 다음 recipe에 반영할까? | drift correction |
| Predictive maintenance / anomaly | 장비가 나빠지기 전에 알 수 있나? | chamber health, pump anomaly |
| Digital twin / autonomous process optimization | 안전 범위 안에서 recipe 자체를 탐색할까? | bounded experiment + yield gate |

ASML은 [2025 annual report](https://www.asml.com/en/investors/annual-report/2025)에서 computational lithography와 wafer metrology/inspection을 연결해 process window를 예측·제어하는 holistic lithography를 설명한다. Applied Materials의 AIx/ExtractAI, Lam의 Equipment Intelligence/Fabtex, KLA의 inspection·data analytics도 같은 넓은 방향에 놓인다. 하지만 이들은 대부분 고객 fab의 recipe·data·안전 제약 속에서 작동한다. “AI가 fab을 자율 운영한다”는 말보다 **제한된 action space 안에서 측정·검사·수율이 validator가 되는 폐루프**라고 쓰는 편이 정확하다. [Lam Equipment Intelligence](https://www.lamresearch.com/wp-content/uploads/2021/08/Lam-Research-2020-ESG-Report.pdf) · [KLA process control](https://ir.kla.com/sec-filings/all-sec-filings/content/0000319201-25-000024/klac-20250630.htm)

## 조사용 성숙도 매트릭스

| 시스템 | Automation | Adaptive | RL | Transfer | Continual | Agentic | Self-verification | Recursive |
|---|---|---|---|---|---|---|---|---|
| Grid/script flow | YES | NO | NO | NO | NO | NO | PARTIAL | NO |
| OpenROAD AutoTuner | YES | YES | NO | NO | NO | NO | PARTIAL | NO |
| AlphaChip 공개 framework | YES | YES | YES | PARTIAL | UNKNOWN | NO | PARTIAL | NO |
| Synopsys DSO.ai | YES | YES | YES | PARTIAL | UNKNOWN | PARTIAL | PARTIAL | UNKNOWN |
| Cadence Cerebrus / AI Studio | YES | YES | YES | PARTIAL | UNKNOWN | PARTIAL | PARTIAL | UNKNOWN |
| Siemens Fuse agent architecture | YES | PARTIAL | UNKNOWN | UNKNOWN | vendor claim | YES | YES | UNKNOWN |
| OpenROAD MCP + agent (직접 구축) | YES | 구축 방식에 따름 | 구축 방식에 따름 | 구축 방식에 따름 | 구축 방식에 따름 | YES | 구축 방식에 따름 | NO 기본값 |
| fab APC / process control | YES | YES | 일부 | 제한적 | 제한적 | 일부 | measurement gate | NO 일반화 |

`UNKNOWN`은 실패를 뜻하지 않는다. 공개 자료만으로 업데이트 대상·retention·cross-project benchmark를 검증할 수 없다는 뜻이다. 특히 vendor 발표는 capability와 방향을 알려 주지만, 독립 성능 비교를 대체하지 않는다.

## 재현 가능한 실험 로드맵

가장 좋은 출발은 거대한 agent가 아니라, 실패해도 원인을 알 수 있는 작은 closed loop다.

| 단계 | 구성 | 목표 / metric | 위험 | 연구 기여 |
|---|---|---|---|---|
| 1. BO/AutoTuner baseline | RTL → Yosys → ORFS/OpenROAD → public PDK → Ray Tune | PPA, WNS, DRC, runtime, cost | search-space leakage, seed variance | 공개 가능한 기준선 |
| 2. RL optimizer | graph/state, action mask, reward, replay, physical eval | constraint-satisfying Pareto QoR | sparse reward, simulator/proxy gap, compute | policy가 baseline을 넘는지 검증 |
| 3. Agentic self-verifying | LLM agent → OpenROAD MCP → ORFS → experiment DB → signoff gate | valid action rate, recovery, regression-free QoR | hallucinated command, unsafe mutation | 계획과 검증의 분리 |

Stage 1은 PDK·RTL·constraint·seed·trial budget을 고정하고 모든 log를 저장한다. Stage 2는 RL reward가 실제 signoff metric과 어긋나는지 확인한다. Stage 3은 agent가 결과를 “해석”해도 **EDA signoff만이 실행 권한을 승인**하게 한다. 필요한 compute, dataset, objective, metric, risk를 논문마다 표준화해 기록하면 어떤 성과가 알고리즘 덕분이고 어떤 성과가 benchmark 선택 덕분인지 보인다.

### 최소 experiment database 스키마

`design_id, rtl_commit, pdk_version, flow_version, config, seed, action, metrics, constraint_status, reports, runtime, compute_cost, reviewer_decision`을 trial마다 append-only로 남긴다. 이 데이터가 있어야 transfer/continual learning도 검증할 수 있다. memory가 있다는 말은 대화 기록을 저장했다는 뜻이 아니라, **새 design의 성능을 개선하면서 과거 design을 퇴행시키지 않았다는 측정**까지 포함한다.

## 조사할 때 확인할 질문

앞으로 어떤 “AI가 반도체 설계를 스스로 개선했다”는 주장을 만나면 다음을 묻자.

1. 개선된 것은 policy인가, hyperparameter인가, script인가, physical design인가, model weight인가, workflow인가, memory인가, recipe인가?
2. feedback은 proxy인가, full EDA인가, deterministic signoff인가, 실제 wafer/yield인가?
3. online인가 offline인가? action은 사람이 승인했는가?
4. 한 benchmark만 좋아졌나, 새로운 design·block·PDK에도 일반화됐나?
5. 지식이 남는가? catastrophic regression은 어떻게 측정했나?
6. 어떤 validator가 잘못된 결정을 거부하나? timing·DRC·IR·EM·formal·physics 중 무엇인가?
7. system이 스스로 바꾸는 범위는 후보 설정까지인가, search strategy·objective·tool sequence까지인가?

이 질문에 답하지 못하면 그 시스템은 훌륭한 자동화 또는 탐색 도구일 수는 있어도, 검증된 recursive self-improving design system이라고 부르기 어렵다. 반대로 이 질문에 답할 수 있는 폐루프를 만드는 것이 AI-for-EDA 연구의 가장 실용적인 다음 단계다.

## 공식 자료와 더 읽을 거리

- [Google circuit_training](https://github.com/google-research/circuit_training) · [AlphaChip/Nature](https://www.nature.com/articles/s41586-021-03544-w) · [비판적 공개 평가](https://arxiv.org/abs/2302.11014)
- [Synopsys DSO.ai](https://www.synopsys.com/ai/ai-powered-eda/dso-ai.html) · [Cadence Cerebrus](https://www.cadence.com/en_US/home/tools/digital-design-and-signoff/soc-implementation-and-floorplanning/cadence-cerebrus-ai-studio.html) · [Siemens Fuse](https://news.siemens.com/en-gb/siemens-fuse-eda-ai-agent/)
- [OpenROAD](https://github.com/The-OpenROAD-Project/OpenROAD) · [ORFS AutoTuner](https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts/blob/master/docs/user/InstructionsForAutoTuner.md) · [OpenROAD MCP](https://github.com/The-OpenROAD-Project/OpenROAD-MCP)
- [ASML 2025 Annual Report](https://www.asml.com/en/investors/annual-report/2025) · [Applied Materials 기술 포트폴리오](https://www.appliedmaterials.com/us/en/semiconductor/products.html) · [Lam etch 기초](https://newsroom.lamresearch.com/etch-essentials-semiconductor-manufacturing) · [KLA Annual Report](https://ir.kla.com/sec-filings/all-sec-filings/content/0000319201-25-000024/klac-20250630.htm)

> **자료 해석 원칙** — 논문·공식 GitHub·공식 문서가 1차 근거다. vendor 제품 페이지·보도자료는 기능과 vendor claim의 근거로 사용했고, 독립적으로 확인되지 않은 성능·전이·자율성은 일반 사실로 쓰지 않았다. 이 글은 투자 조언이나 tapeout 보증이 아니다.

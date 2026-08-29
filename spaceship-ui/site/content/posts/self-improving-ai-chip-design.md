---
title: '반도체 설계 AI는 정말 스스로 더 좋은 칩을 찾는가 — 폐루프 최적화·RL·전이학습·에이전트 EDA'
description: '반도체 설계 AI의 “self-improving”을 자동화부터 재귀적 개선까지 0–8단계로 나누고, AlphaChip·DSO.ai·Cerebrus·Fuse·OpenROAD와 제조 AI를 폐루프 검증 관점에서 비교한다.'
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

> **읽기 전 결론** — 반도체 설계 AI가 EDA를 여러 번 돌려 PPA가 더 좋은 설정을 찾는 일은 이미 현실이다. 그러나 그 자체가 곧 “스스로 진화하는 설계자”는 아니다. 이 글에서는 **피드백을 받는가, 무엇을 실제로 업데이트하는가, 그 지식이 다음 설계에도 남는가, 독립적인 signoff가 매번 막아 주는가**를 기준으로 구분한다. 2026년 공개 근거에서 강하게 확인되는 것은 주로 Level 2–4이며, Level 6–7은 빠르게 등장 중인 실행 구조다. Level 5와 Level 8은 공개적으로 검증된 일반 해법이라고 부르기 어렵다.

<details>
<summary><strong>처음 읽는 사람을 위한 핵심 용어 — 이것만 알고 시작해도 됩니다</strong></summary>

이 글의 주인공은 AI 자체가 아니라 **칩을 실제로 만들 수 있는 설계로 바꾸는 과정**이다. 아래 단어는 외울 필요가 없고, 읽다가 다시 열어 보면 된다.

| 용어 | 쉬운 설명 | 이 글에서 왜 중요한가 |
|---|---|---|
| **칩 설계** | 스마트폰·서버 칩 안의 수십억 개 스위치를 어떤 순서로 연결할지 정하는 도면 | 좋은 아이디어도 실제 공장에서 만들 수 있어야 한다. |
| **RTL** | 칩이 “어떤 일을 어떤 순서로 할지”를 코드처럼 적은 초안 | AI와 EDA가 출발하는 입력이다. |
| **EDA** | 초안을 실제 칩 배치도로 바꾸고 문제가 없는지 검사하는 전문 소프트웨어 묶음 | AI는 보통 이 도구를 대신하는 것이 아니라, 이 도구를 여러 번 돌리며 설정을 고른다. |
| **PPA** | Performance(속도), Power(전력), Area(면적)의 줄임말 | 칩은 더 빠르고, 전기를 덜 쓰고, 작을수록 대체로 좋다. 하지만 셋을 동시에 최고로 만들기는 어렵다. |
| **배치·배선** | 칩 안의 부품을 어디에 놓고, 그 사이를 어떤 금속선으로 연결할지 정하는 일 | 책상 위 부품을 배치하고 너무 길거나 엉킨 전선을 다시 정리하는 일에 가깝다. |
| **timing** | 신호가 정해진 시간 안에 목적지에 도착하는지 보는 검사 | 늦게 도착하면 빠른 칩이라도 오류가 난다. |
| **congestion** | 한 구역에 배선이 너무 몰린 상태 | 도로가 막히면 길이 있어도 차가 못 가듯, 배선이 막히면 설계가 완성되지 않는다. |
| **DRC** | 공장 규칙 위반 검사 | 선 사이 간격, 폭 같은 제조 규칙을 어겼는지 보는 빨간불 검사다. |
| **signoff** | 생산 직전의 최종 합격 판정 | AI의 추천이 아니라, 결정론적인 검증 도구가 ‘만들어도 된다’를 확인하는 마지막 문이다. |
| **폐루프(closed loop)** | 바꿔 본 결과를 보고 다음 선택을 다시 고르는 고리 | `설정 변경 → EDA 검사 → 점수 확인 → 다음 설정 변경`이 바로 이 글의 핵심 구조다. |

**한 문장으로:** AI는 ‘더 나은 설계 설정을 제안하는 조수’이고, EDA/signoff는 ‘그 제안이 실제 공장에서 통하는지 채점하고 불합격시키는 심사관’이다.

</details>

## 1. 먼저 ‘스스로 개선’이라는 말을 분해하자

칩 설계는 RTL에서 끝나지 않는다. 합성, 배치, 배선, 타이밍, 전력, 혼잡, 설계규칙검사(DRC)를 거친 뒤에야 실제로 만들 수 있는지 알 수 있다. AI가 하는 일은 이 과정의 knob—예를 들어 floorplan, placement 순서, router 설정, clock 목표, tool recipe—를 바꾸고 결과를 보고 다음 후보를 고르는 것이다.

그런데 “다음 후보를 더 잘 고른다”와 “시스템이 장기적으로 자기 자신을 개선한다”는 다르다. 아래 네 질문 모두에 답해야 후자에 가까워진다.

1. **피드백**: 실제 EDA·signoff·물리 검증 결과를 받는가?
2. **업데이트**: 단순 후보 목록이 아니라 policy·surrogate·workflow·memory 중 무엇이 바뀌는가?
3. **보존**: 한 번 얻은 지식이 다음 실행과 다음 설계에 남는가?
4. **일반화와 안전장치**: 새로운 block/node/PDK에서도 통하고, 결정론적 검증이 나쁜 변경을 거부하는가?

### 성숙도 0–8: 같은 단어를 같은 뜻으로 쓰기 위한 사다리

| 단계 | 이름 | 실제 의미 | 흔한 예 |
|---|---|---|---|
| 0 | Automation | 정해진 script/flow를 실행한다. 학습은 없다. | Makefile, Tcl flow |
| 1 | Parameter search | grid/random sweep으로 후보를 넓게 돌린다. | clock period sweep |
| 2 | Adaptive optimization | 이전 결과를 써서 다음 후보를 더 유망하게 고른다. | Bayesian optimization, evolutionary search, HPO |
| 3 | Reinforcement learning | state → action → EDA run → reward → policy update가 반복된다. | macro placement RL |
| 4 | Transfer learning | 한 block/chip에서 배운 표현·policy를 다음 설계 초기값으로 쓴다. | pretrained placement policy fine-tuning |
| 5 | Continual / cross-project learning | 여러 프로젝트의 결과가 장기 memory가 되어 이후 전략을 개선한다. | regression을 피하는 project memory |
| 6 | Agentic EDA | LLM/agent가 계획하고 tool을 호출하고 보고서를 읽어 설정을 고쳐 다시 실행한다. | agent → EDA API/MCP → report |
| 7 | Self-verifying agentic EDA | agent의 매 행동을 deterministic EDA·physics·signoff가 검증하고 실패하면 수정한다. | signoff-gated agent loop |
| 8 | Recursive design improvement | search strategy, tool sequence, model, objective 자체를 실험으로 개선한다. | 검증된 meta-optimizer of optimizers |

Level은 “제품이 좋다/나쁘다”의 등급이 아니다. **어디까지의 개선 주장이 증거로 뒷받침되는가**를 적는 좌표다. 예를 들어 자동 parameter tuning은 매우 유용해도 Level 8은 아니다.

<details>
<summary><strong>처음 읽는 사람을 위한 90초 비유</strong></summary>

EDA를 매우 비싼 모의고사 채점기라고 생각해도 좋다. 설계자는 답안(회로와 설정)을 내고, 채점기는 성능·전력·면적·규칙 위반을 돌려준다. random search는 답안을 무작위로 고쳐 보는 방식이고, Bayesian optimization은 “이 근처를 고치면 점수가 오를 것 같다”고 추정하는 방식이다. RL은 “이 상태에서는 이 행동을 하면 점수가 좋아진다”는 정책을 배운다. agent는 사람 대신 채점표를 읽고 다음 행동을 계획한다. 하지만 최종 합격 판정은 여전히 EDA/signoff가 한다. agent의 말이 물리 법칙을 바꾸지는 않는다.

</details>

## 2. 설계 AI의 중심은 하나의 폐루프다

```text
Design / RTL
  → EDA configuration
  → synthesis · place & route · verification
  → metrics: PPA · timing · congestion · DRC · power
  → AI evaluator / candidate selector
  → updated configuration
  └───────────────────────────────────────────────→ re-run
```

여기서 최적화 대상은 하나가 아니다. 성능(performance), 전력(power), 면적(area), wirelength, congestion, timing slack, IR drop, DRC violations, runtime, compute cost가 서로 충돌한다. clock을 공격적으로 잡으면 성능 목표에는 가까워져도 전력·배선 혼잡·DRC·실행 시간이 나빠질 수 있다. 따라서 실제 문제는 단일 최고점 찾기보다 **제약을 만족하는 Pareto 후보군**을 찾는 multi-objective optimization이다.

좋은 실험 기록은 “최고 PPA” 한 줄이 아니라 다음을 남긴다: 기준 flow와 PDK, 설계와 commit, search space, seed, trial 수·compute, 실패 trial, 각 constraint, signoff 결과, 그리고 새 design에서의 재현 여부. 그래야 optimizer가 우연히 한 benchmark를 외운 것인지 판단할 수 있다.

## 3. 방법 지도: 무엇이 배우고, 어떤 피드백을 쓰는가

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

## 4. 대표 사례를 제대로 읽기

### AlphaChip / Google circuit_training — RL이 실제 배치를 어떻게 다루는가

[circuit_training](https://github.com/google-research/circuit_training)은 Google Research가 공개한 distributed deep RL 기반 chip floorplanning framework다. 큰 회로를 graph로 표현하고, macro를 어느 위치에 놓을지를 순차 action으로 선택한다. state에는 이미 배치된 macro와 연결 구조, action에는 다음 macro의 위치 후보, reward에는 wirelength·congestion·density 같은 물리 proxy가 들어간다. 좋은 proxy reward로 빠르게 후보를 거른 뒤 실제 physical implementation으로 평가한다.

이 구조에서 “학습이 더 좋아진다”는 뜻은 policy가 이전 placement trajectory의 reward를 사용해 다음 placement 선택을 갱신한다는 것이다(Level 3). 공개 저장소는 pretraining과 fine-tuning이 placement 속도·품질에 도움을 준다고 설명하므로, 다른 block으로 초기 policy를 옮기는 부분은 Level 4 주장에 해당한다. 다만 이는 저장소·저자 측 근거이며 모든 회사·PDK·block에서의 보편적 우월성을 뜻하지 않는다. Nature 논문에는 2024년 addendum도 있으므로, 결과를 인용할 때는 재현 조건과 평가 protocol을 함께 읽어야 한다. [Nature 논문](https://www.nature.com/articles/s41586-021-03544-w) · [공개 비판적 평가](https://arxiv.org/abs/2302.11014) · [2024 addendum](https://www.nature.com/articles/s41586-024-07949-9)

### Synopsys DSO.ai — 상용 design-space optimization

[DSO.ai](https://www.synopsys.com/ai/ai-powered-eda/dso-ai.html)는 reinforcement learning 기반으로 implementation flow의 넓은 설정 공간을 탐색한다고 설명한다. 즉 AI가 chip 자체를 직접 “발명”한다기보다 Fusion Compiler/IC Compiler II 같은 EDA flow의 선택지를 반복 평가하는 DSO 엔진에 가깝다. vendor는 상용 tapeout과 PPA 성과를 발표했지만, 특정 배수 개선·tapeout 수는 vendor/customer 발표라는 성격을 유지해야 한다. 독립 benchmark·동일 조건 재현 없이 일반 성능으로 확장하면 안 된다. [Synopsys의 100 commercial tapeout 발표](https://news.synopsys.com/2023-02-07-AI-designed-Chips-Reach-Scale-with-First-100-Commercial-Tape-outs-Using-Synopsys-Technology?asPDF=1)

### Cadence Cerebrus — 탐색에서 agentic multi-block으로

[Cerebrus](https://www.cadence.com/en_US/home/tools/digital-design-and-signoff/soc-implementation-and-floorplanning/cadence-cerebrus-ai-studio.html)는 2021년 Intelligent Chip Explorer에서 출발해 physical implementation 전반의 AI exploration을 내세웠고, 이후 AI Studio에서 subsystem·multi-block·multi-user·transfer를 강조한다. 이것은 Level 2–4의 DSE 위에 Level 6 성격의 orchestration을 얹는 방향이다. 그러나 장기 cross-project memory가 regression 없이 축적된다는 강한 독립 검증과, agent가 signoff 없이 판단해도 된다는 뜻은 아니다. [Cadence multi-block white paper](https://www.cadence.com/en_US/home/resources/white-papers/cadence-cerebrus-ai-studio-agentic-ai-multi-block-multi-user-soc-wp.html)

### Siemens Fuse / Solido — ‘self-verifying’이 의미 있는 이유

Siemens는 2026년 [Fuse EDA AI Agent](https://news.siemens.com/en-gb/siemens-fuse-eda-ai-agent/)와 [self-verifying architecture](https://blogs.sw.siemens.com/cicv/2026/07/29/self-verifying-eda-ai-agents/)를 발표했다. 여기서 좋은 설계 원리는 LLM이 정답을 선언하지 않고, agent가 계획·실행한 매 step을 deterministic EDA engine 및 physics 기반 분석이 다시 검증한다는 것이다. 이것이 Level 7의 정의에 가장 가깝다. 다만 “every project에서 학습한다” 같은 표현은 vendor architecture/roadmap 주장으로 읽고, public benchmark와 모델 업데이트 범위를 따로 확인해야 한다.

## 5. OpenROAD: 누구나 재현할 수 있는 폐루프

[OpenROAD](https://github.com/The-OpenROAD-Project/OpenROAD)와 [OpenROAD-flow-scripts (ORFS)](https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts)는 RTL-to-GDSII 흐름을 공개한다. [AutoTuner](https://github.com/The-OpenROAD-Project/OpenROAD-flow-scripts/blob/master/docs/user/InstructionsForAutoTuner.md)는 JSON으로 knob 범위를 정의하고 Ray Tune으로 grid/random, PBT, HyperOpt/TPE, AxSearch, Optuna+CMA-ES, Nevergrad evolutionary search를 고를 수 있다. PPA coefficient와 METRICS2.1 결과를 보상/목표로 쓰므로 Level 1–2의 좋은 기준선이다. RL이 아니어도 충분히 유용한 이유가 여기에 있다.

2026년 [OpenROAD MCP](https://github.com/The-OpenROAD-Project/OpenROAD-MCP)는 AI client가 OpenROAD/ORFS session, command history, metrics, report image를 읽고 실행하도록 연결한다. 가능한 폐루프는 `LLM agent → MCP → ORFS/OpenROAD → metrics·reports → analysis → revised config → re-run`이다. 하지만 MCP는 **도구 연결 규약**일 뿐, 자동으로 학습·전이·안전을 보장하는 optimizer는 아니다. agent가 설정을 바꾸는 권한, command allowlist, experiment DB, deterministic signoff gate를 별도로 설계해야 Level 7에 가까워진다.

## 6. 공개 생태계: ‘AI repo’와 ‘재현 stack’을 섞지 말자

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

## 7. 설계 밖에서도 같은 일이 일어난다: 제조 AI 폐루프

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

## 8. 그래서 현재 어디까지 왔나: 성숙도 매트릭스

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

## 9. 재현 가능한 실험 로드맵

가장 좋은 출발은 거대한 agent가 아니라, 실패해도 원인을 알 수 있는 작은 closed loop다.

| 단계 | 구성 | 목표 / metric | 위험 | 연구 기여 |
|---|---|---|---|---|
| 1. BO/AutoTuner baseline | RTL → Yosys → ORFS/OpenROAD → public PDK → Ray Tune | PPA, WNS, DRC, runtime, cost | search-space leakage, seed variance | 공개 가능한 기준선 |
| 2. RL optimizer | graph/state, action mask, reward, replay, physical eval | constraint-satisfying Pareto QoR | sparse reward, simulator/proxy gap, compute | policy가 baseline을 넘는지 검증 |
| 3. Agentic self-verifying | LLM agent → OpenROAD MCP → ORFS → experiment DB → signoff gate | valid action rate, recovery, regression-free QoR | hallucinated command, unsafe mutation | 계획과 검증의 분리 |

Stage 1은 PDK·RTL·constraint·seed·trial budget을 고정하고 모든 log를 저장한다. Stage 2는 RL reward가 실제 signoff metric과 어긋나는지 확인한다. Stage 3은 agent가 결과를 “해석”해도 **EDA signoff만이 실행 권한을 승인**하게 한다. 필요한 compute, dataset, objective, metric, risk를 논문마다 표준화해 기록하면 어떤 성과가 알고리즘 덕분이고 어떤 성과가 benchmark 선택 덕분인지 보인다.

### 최소 experiment database 스키마

`design_id, rtl_commit, pdk_version, flow_version, config, seed, action, metrics, constraint_status, reports, runtime, compute_cost, reviewer_decision`을 trial마다 append-only로 남긴다. 이 데이터가 있어야 transfer/continual learning도 검증할 수 있다. memory가 있다는 말은 대화 기록을 저장했다는 뜻이 아니라, **새 design의 성능을 개선하면서 과거 design을 퇴행시키지 않았다는 측정**까지 포함한다.

## 10. 비판적으로 끝맺기: 무엇이 실제로 개선되는가

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

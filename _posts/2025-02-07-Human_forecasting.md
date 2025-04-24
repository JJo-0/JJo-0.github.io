---
title: "[Google research] Pedestrian Trajectory & Pose Prediction/Forecasting"
date: 2025-02-07 16:19:00
categories:
  - 정리
  - 논문
  - Project
tags:
  - paper
  - estimation
toc: true
toc_sticky: true
toc_label: "페이지 주요 목차"
---

---

## 주제

- 사람의 **3D 포즈 추정(HPE, Human Pose Forecasting)**과 **Trajectory Prediction(사람의 이동 경로 예측)**은 차이가 크다는 것을 알게 되었습니다.
- 관련 보고서입니다.

---

## 최신 인간 자세 예측 비교 연구 동향 분석 보고서

### I. 서론

**인간 자세 예측(Human Pose Forecasting/Prediction)**은 과거의 관찰된 인간 동작 시퀀스를 바탕으로 미래의 인간 자세 또는 동작을 예측하는 컴퓨터 비전 및 그래픽스 분야의 핵심 연구 주제입니다.[^1]

인간은 본능적으로 타인의 움직임을 예측하여 복잡한 환경 속에서 자연스럽게 이동하고 잠재적 위험을 회피하지만, 기계가 이러한 능력을 갖추는 것은 다양한 응용 분야에서 중요한 역할을 합니다.[^1] 특히 **로봇 공학, 자율 주행 자동차, 인간-컴퓨터 상호작용(HCI), 가상/증강 현실(VR/AR), 스포츠 분석, 의료 및 헬스케어** 등에서 그 중요성이 부각되고 있습니다.[^3]

초기 연구는 주로 단일 인물의 **짧은 시간(약 1초 이내)** 동안의 동작 예측에 초점을 맞추었으나[^1], 최근 연구 동향은 보다 현실적이고 복잡한 시나리오를 다루는 방향으로 확장되고 있습니다. 이는 예측 시간 지평을 수 초 이상으로 늘리는 **장기 예측(Long-term Prediction)**[^1], 여러 사람의 상호작용을 고려하는 **다중 에이전트 예측(Multi-agent Prediction)**[^1], 예측의 불확실성을 모델링하는 **확률론적 예측(Probabilistic Prediction)**[^3], 그리고 특정 개인의 고유한 움직임 패턴에 적응하는 **개인화 예측(Personalized Prediction)**[^5] 등으로 나타나고 있습니다.

이러한 연구 동향의 변화는 더 정확하고 현실적인 예측을 가능하게 하는 새로운 방법론의 개발을 촉진하는 동시에, 기존 방법론들의 성능을 객관적으로 비교하고 평가할 필요성을 증대시킵니다.

본 보고서는 **2020년부터 2025년 사이 발표된 최신 연구**, 특히 다양한 예측 방법론들을 직접적으로 비교, 분석, 평가한 논문들을 중심으로 인간 자세 예측 분야의 연구 동향을 심층적으로 검토하고 분석하는 것을 목표로 합니다. 이를 위해 주요 예측 모델, 평가 데이터셋 및 지표, 비교 실험 결과, 그리고 연구의 강점과 한계점을 종합적으로 살펴보고, 향후 연구 방향을 제시하고자 합니다.

### II. 인간 자세 예측 방법론 개요

인간 자세 예측 연구는 다양한 딥러닝 아키텍처를 기반으로 발전해왔습니다. 각 방법론은 인간 동작의 시공간적 특성을 포착하고 미래를 예측하기 위해 고유한 접근 방식을 채택합니다.

-   **순환 신경망 (Recurrent Neural Networks, RNNs)**:
    -   LSTM(Long Short-Term Memory)과 같은 RNN 기반 모델은 순차적인 데이터 처리에 강점을 보여 초기 인간 자세 예측 연구에서 널리 사용되었습니다.[^3]
    -   이 모델들은 과거 동작의 시간적 맥락을 인코딩하여 다음 프레임의 자세를 예측합니다.
    -   그러나 긴 시퀀스에 대한 의존성 학습에 어려움을 겪고 오차가 누적되는 경향이 있어 **장기 예측에는 한계**를 보입니다.[^10]

-   **그래프 컨볼루션 네트워크 (Graph Convolutional Networks, GCNs)**:
    -   인간 골격 구조를 그래프로 간주하고, 관절 간의 공간적 관계를 명시적으로 모델링하기 위해 GCN이 도입되었습니다.[^3]
    -   GCN은 신체 부위 간의 상호작용을 효과적으로 포착할 수 있으며, RNN과 결합되어 시공간적 특징을 함께 학습하는 모델(예: DMST-GRNN[^10])도 제안되었습니다.

-   **트랜스포머 (Transformers)**:
    -   자연어 처리 분야에서 성공을 거둔 트랜스포머는 어텐션 메커니즘을 통해 시퀀스 내의 **장거리 의존성을 효과적으로 모델링**할 수 있다는 장점 때문에 인간 자세 예측 분야에서도 주목받고 있습니다.[^10]
    -   트랜스포머는 시간적, 공간적 관계를 동시에 학습하며, 특히 장기 예측에서 강력한 성능을 보일 잠재력을 가지고 있습니다.
    -   MotionBERT[^18]와 같은 모델은 대규모 데이터셋으로 사전 훈련된 트랜스포머 기반 인코더를 사용하여 다양한 하위 작업에서 우수한 성능을 달성했습니다.

-   **변이형 오토인코더 (Variational Autoencoders, VAEs) 및 생성적 적대 신경망 (Generative Adversarial Networks, GANs)**:
    -   미래 동작의 **불확실성과 다중 모드(multi-modal) 특성**을 모델링하기 위해 VAE나 GAN과 같은 생성 모델이 활용됩니다.[^3]
    -   이 모델들은 단일 예측 대신 가능한 여러 미래 동작의 분포를 학습하여 보다 현실적이고 다양한 예측을 생성할 수 있습니다.
    -   예를 들어, Parsaeifard 등은 VAE를 사용하여 지역적 자세 동역학을 위한 생성적 접근 방식을 제안했습니다.[^3]

-   **확산 모델 (Diffusion Models)**:
    -   최근 이미지 및 비디오 생성 분야에서 최첨단 성능을 달성한 확산 모델이 인간 동작 예측 및 생성 분야에도 활발히 적용되고 있습니다.[^4]
    -   확산 모델은 복잡한 데이터 분포를 효과적으로 학습하고 **고품질의 다양한 샘플을 생성**할 수 있는 능력으로 주목받고 있습니다.
    -   MDM[^29], PhysDiff[^12], AAMDM[^30] 등이 대표적인 예시입니다.

-   **하이브리드 및 분리 모델 (Hybrid & Decoupled Models)**:
    -   전역적인 이동 경로(trajectory) 예측과 지역적인 자세(local pose) 예측을 분리하여 처리하는 접근 방식도 제안되었습니다.[^1]
    -   이는 특히 장기 예측이나 다중 에이전트 시나리오에서 복잡성을 관리하고 성능을 향상시키는 데 효과적인 것으로 나타났습니다.
    -   T2P[^2] 모델은 이러한 접근 방식을 사용하여 좋은 결과를 보고했습니다.

이러한 다양한 방법론들은 각각의 장단점을 가지며, 예측하려는 동작의 특성(단기/장기, 단일/다중 에이전트, 결정론적/확률론적)과 응용 분야의 요구사항에 따라 선택적으로 사용되거나 결합되고 있습니다.

### III. 벤치마킹 데이터셋 및 평가 지표

인간 자세 예측 모델의 성능을 객관적으로 평가하고 비교하기 위해서는 표준화된 벤치마킹 데이터셋과 적절한 평가 지표가 필수적입니다.

#### A. 주요 벤치마킹 데이터셋

다양한 데이터셋이 인간 자세 예측 연구에 활용되고 있으며, 각 데이터셋은 수집 환경, 인원수, 동작 유형, 주석 정확도 등에서 특징을 가진다.

-   **Human3.6M (H3.6M)**[^5]:
    -   3D 인간 자세 예측 및 관련 작업에서 가장 널리 사용되는 실내 데이터셋 중 하나.[^5]
    -   마커 기반 모션 캡처 시스템으로 **360만 개의 정확한 3D 자세 주석** 제공.
    -   주로 단일 인물의 다양한 일상 활동 포함, 짧은 시간 예측(예: 과거 0.4초 관찰 후 미래 1초 예측)[^5] 벤치마크에 주로 사용.
    -   **한계**: 통제된 환경, 동작 다양성 제한, 평균적 움직임 초점.[^5]

-   **CMU Motion Capture (CMU MoCap)**[^5]:
    -   다양한 유형의 인간 동작(예: 걷기, 달리기, 스포츠) 포함 대규모 모션 캡처 데이터셋.[^5]
    -   H3.6M과 함께 단기 및 장기 예측 성능 평가에 자주 사용.[^10]

-   **HumanEva**[^5]:
    -   H3.6M과 유사하게 실내 환경에서 수집, 비디오와 동기화된 3D 모션 캡처 데이터 제공.[^5]

-   **AMASS (Archive of Motion Capture as Surface Shapes)**[^18]:
    -   여러 모션 캡처 데이터셋 통합, **SMPL 신체 모델 파라미터** 형태로 제공하는 대규모 데이터셋.[^18]
    -   다양한 동작과 신체 형태 포함, 일반화 성능 평가에 유용.
    -   MotionBERT 사전 훈련[^18] 및 물리 기반 예측 모델 평가[^33] 등에 사용.

-   **3DPW (3D Poses in the Wild)**[^1]:
    -   **실제 야외 환경**에서 촬영된 비디오 시퀀스, IMU 센서 사용 3D 자세 정보 제공.[^1]
    -   'in-the-wild' 환경 예측 성능 평가 사용.
    -   **한계**: 다중 에이전트 상호작용 제한 (최대 2명).[^1]

-   **MuPoTS-3D (Multi-Person Pose Tracking in 3D)**[^1]:
    -   다중 시점 마커리스 모션 캡처 시스템 사용, 실제 환경 **여러 사람(최대 20명)** 3D 자세 캡처.[^1]
    -   가려짐(occlusion), 조명 변화 등 현실적 어려움 포함.[^36]

-   **JRDB-GMP (JRDB-GlobMultiPose)**[^1]:
    -   **장기(최대 5초), 다중 에이전트(최대 24명)** 인간 자세 예측 위해 JRDB 데이터셋[^1] 기반 구축된 실제 환경 데이터셋.[^1]
    -   기존 데이터셋 한계 극복, 현실적 상호작용 시나리오 예측 성능 평가 목표.[^1]

-   **THÖR**[^37]:
    -   **로봇과의 상호작용** 포함 실내 환경, 고정밀 모션 캡처 시스템(Qualisys) 사용 수집.[^37]
    -   동적 작업 할당 통해 다양한 상호작용 상황(예: 추월, 정지, 방해) 생성, 기존 데이터셋 단조로움 극복 시도.[^37]

기존의 H3.6M, CMU MoCap과 같은 데이터셋은 통제된 환경에서 수집되어 동작 다양성이 부족하고, 주로 짧은 시간 지평의 평균적인 움직임에 초점을 맞추고 있습니다.[^1] 이는 로봇 공학이나 HCI와 같이 장기간, 다수의 사람들과 상호작용하며 개인화된 예측이 필요한 실제 응용 시나리오의 요구사항을 충분히 반영하지 못합니다.[^1]

이러한 한계를 인식하고 JRDB-GMP[^1]나 THÖR[^37]과 같이 보다 현실적이고 도전적인 시나리오를 포함하는 새로운 데이터셋을 구축하려는 노력이 이루어지고 있으며, 이는 모델의 실제 적용 가능성과 일반화 성능을 평가하는 데 중요한 진전을 의미합니다.

**표 1: 인간 자세 예측 주요 벤치마킹 데이터셋 개요**

| 데이터셋      | 유형                      | 주요 특징                                                        | 예측 시간 지평      | 주요 한계점                                         | 관련 Snippet |
|:-------------|:-------------------------|:-----------------------------------------------------------------|:-------------------|:---------------------------------------------------|:-------------|
| Human3.6M    | 실내, 마커 기반 Mocap    | 3.6M 3D 자세, 단일 인물 위주, 다양한 활동                        | 단기 위주 (~1s)    | 통제된 환경, 동작 다양성 부족, 평균적 움직임 초점    | [^5]   |
| CMU MoCap    | 실내, 마커 기반 Mocap    | 대규모, 다양한 동작 유형 (일상, 스포츠 등)                      | 단기/장기          | 통제된 환경                                        | [^5]   |
| HumanEva     | 실내, 마커 기반 Mocap    | 비디오와 동기화된 3D Mocap 데이터                               | 단기 위주           | 통제된 환경                                        | [^5]   |
| AMASS        | Mocap 데이터 통합         | SMPL 파라미터, 다양한 동작 및 신체 형태                         | 다양                | Mocap 데이터 기반 (직접 수집 아님)                  | [^18] |
| 3DPW         | 야외, 비디오+IMU          | 실제 야외 환경, 'in-the-wild'                                   | 단기 위주           | 최대 2명, IMU 기반 자세 정확도 이슈 가능성          | [^1]   |
| MuPoTS-3D    | 실내/외, 마커리스 Mocap   | 다중 시점, 다중 인물(최대 20명), 가려짐/조명 변화 포함           | 단기 위주           | 마커리스 기반 자세 정확도 이슈 가능성                | [^1]   |
| JRDB-GMP     | 실제 환경, 비디오 기반    | 장기(최대 5초), 다중 에이전트(최대 24명), 실제 상호작용         | 장기                | 새로운 데이터셋, 표준화/검증 필요                   | [^1]   |
| THÖR         | 실내, 고정밀 Mocap        | 로봇 포함 환경, 동적 작업 할당, 다양한 상호작용 (추월, 정지 등) 생성 시도 | 다양                | 특정 환경(Örebro 대학), 데이터 규모 확장 필요        | [^37] |
| LaFAN1       | 실내, Mocap               | Ubisoft 개발, 게임 애니메이션 목적, 상호작용 포함               | 다양                | 특정 게임/애니메이션 도메인 편향 가능성             | [^30] |
| KIT-ML       | 실내, Mocap               | 텍스트-동작 쌍 데이터셋                                         | 다양                | 텍스트 주석 기반, 언어-동작 매핑 초점               | [^12] |
| HumanAct12   | Mocap 데이터 기반         | 12개 액션 카테고리 분류                                         | 다양                | 액션 분류 기반, 특정 액션 편향 가능성                | [^12] |
| UESTC        | 실내, Mocap               | 40개 액션 클래스, 40명 피험자                                   | 다양                | 액션 분류 기반, 특정 액션 편향 가능성                | [^12] |
| HumanML3D    | Mocap 데이터 + 텍스트     | AMASS/HumanAct12 기반, 텍스트 주석 재작업                       | 다양                | 텍스트 주석 품질/일관성 이슈 가능성                  | [^12] |

### IV. 비교 연구 결과 및 성능 분석

최근 비교 연구들은 다양한 방법론들의 성능을 여러 벤치마크 데이터셋과 평가 지표를 사용하여 분석하고 있습니다. 이를 통해 각 방법론의 강점과 약점, 그리고 특정 조건에서의 우수성을 파악할 수 있습니다.

#### A. 방법론별 성능 분석

-   **RNNs/LSTMs**:
    -   종종 비교 연구에서 **기준선(baseline)**으로 사용됩니다.
    -   단기 예측에서는 합리적인 성능을 보이지만, 장기 예측에서는 오차 누적과 장거리 의존성 학습의 어려움으로 인해 성능이 저하되는 경향이 있습니다.[^10]
    -   GCN과 결합된 DMST-GRNN 모델은 H3.6M 및 CMU MoCap 데이터셋에서 단순 RNN보다 단기 및 장기 예측 모두에서 개선된 평균 각도 오차(MAE)를 보였습니다.[^10]

-   **GCNs**:
    -   골격 구조를 명시적으로 모델링하여 공간적 관계를 잘 포착하며, 특히 구조 정보가 중요한 예측 작업에서 강점을 보입니다.[^10]
    -   하지만 순수하게 시간적인 장거리 의존성 포착에는 트랜스포머보다 약할 수 있습니다.
    -   트랜스포머 기반인 MotionBERT가 GCN 기반 모델들(ST-GCN, 2s-AGCN)보다 액션 인식 작업에서 더 나은 성능을 보인 점[^18]은 트랜스포머가 시공간적 특징을 더 효과적으로 학습할 수 있음을 시사합니다.

-   **Transformers**:
    -   **장거리 의존성을 효과적으로 모델링**하는 능력 덕분에 자세 추정, 동작 생성 등 관련 분야에서 최첨단 결과를 달성하고 있으며[^12], 이는 자세 예측 분야에서도 높은 잠재력을 나타냅니다.
    -   MotionBERT는 H3.6M 데이터셋에서 3D 자세 추정(MPJPE 기준) SOTA를 달성했으며[^18], MDM은 HumanML3D, KIT, HumanAct12, UESTC 등 다양한 데이터셋에서 텍스트/액션 조건부 동작 생성 관련 지표(FID, R-Precision, Diversity 등)에서 SOTA 성능을 보였습니다.[^29]
    -   이는 트랜스포머가 복잡한 시공간적 패턴 학습에 효과적임을 보여줍니다.[^10]

-   **Diffusion Models**:
    -   비교 연구는 주로 동작 '생성' 작업에 초점을 맞추고 있지만, 그 결과는 '예측' 성능에 대한 통찰력을 제공합니다.
    -   Diffusion 모델은 **생성 품질과 다양성 측면에서 SOTA 성능**을 보입니다.[^12]
    -   특히 PhysDiff는 MDM이나 MotionDiffuse와 같은 기존 확산 모델 대비 **물리적 타당성을 크게 개선**하면서도 FID나 관련성 점수는 경쟁력 있게 유지하거나 향상시켰습니다.[^12]
    -   AAMDM은 느린 샘플링 속도라는 확산 모델의 단점을 개선하여, AMDM200과 유사한 품질과 다양성을 훨씬 높은 FPS로 달성했습니다.[^30]
    -   이는 확산 모델 기반 예측이 높은 충실도와 다양성을 제공할 수 있지만, 효율성과 제어 가능성은 여전히 연구가 필요한 영역임을 시사합니다.

-   **Decoupled/Hierarchical Models**:
    -   전역 경로와 지역 자세를 분리하는 모델들은 특히 **장기, 다중 에이전트 시나리오**에서 강력한 성능을 보고하고 있습니다.[^1]
    -   T2P 모델은 JRDB-GMP 및 이전 데이터셋에서 이러한 접근 방식으로 SOTA 성능을 주장했으며[^2], Parsaeifard 등의 VAE 기반 분리 모델도 기준 모델 대비 우수성을 주장했습니다.[^3]
    -   이는 복잡한 문제를 분해하여 다루는 것이 효과적일 수 있음을 보여줍니다.

#### B. 비교 문헌에서 확인된 강점과 약점

-   **RNNs**:
    -   **강점**: 구현 용이성, 짧은 시퀀스에 적합.
    -   **약점**: 그래디언트 소실, 오차 누적, 장거리 의존성 모델링 취약.[^10]
-   **GCNs**:
    -   **강점**: 골격 구조 명시적 모델링.
    -   **약점**: 순수 시간적 장거리 의존성 학습에 트랜스포머보다 약할 수 있음.
-   **Transformers**:
    -   **강점**: 장거리 의존성 모델링 탁월, 병렬 처리 가능.
    -   **약점**: 계산 비용 높음, 대규모 데이터 필요 가능성, GCN 대비 내재적 구조 편향 부족.
-   **VAEs/GANs**:
    -   **강점**: 불확실성/다중 모드 모델링.
    -   **약점**: 학습 불안정성(GANs), 확산 모델 대비 표현력 제한 또는 모드 붕괴 가능성.
-   **Diffusion Models**:
    -   **강점**: 최첨단 생성 품질 및 다양성, 유연한 조건 부여.
    -   **약점**: 느린 샘플링 속도(개선 중[^25]), 물리적 타당성 확보 위한 별도 메커니즘 필요[^12], 직접적인 예측 비교 연구는 상대적으로 부족.
-   **Deterministic Models**:
    -   **강점**: 학습 및 평가 용이(MPJPE 사용).
    -   **약점**: 미래 불확실성 포착 실패, 지나치게 부드럽거나 평균적인 예측 생성 경향.[^10]
-   **Stochastic Models**:
    -   **강점**: 다양한 미래를 모델링하여 현실성 높음.
    -   **약점**: 평가 어려움(분포 지표 필요), 제어 어려울 수 있음.

#### C. 최근 비교 연구의 최첨단 성능 하이라이트

-   **단기 예측 (H3.6M/CMU)**: GCN 기반(예: DMST-GRNN[^10]) 및 트랜스포머 기반 모델들이 일반적으로 이전 RNN 접근 방식보다 우수한 성능을 보입니다. 구체적인 SOTA MPJPE 값은 정확한 시간 범위와 평가 프로토콜에 따라 달라집니다.
-   **장기 예측 (H3.6M/CMU/JRDB-GMP)**: 동작 맥락[^10], 상호작용 인식[^1], 목표 조건화[^1], 또는 분리 기법[^1]을 통합한 모델들이 더 나은 성능을 보이는 경향이 있습니다. T2P 모델은 장기, 다중 에이전트 데이터셋인 JRDB-GMP에서 SOTA 성능을 주장했습니다.[^2]
-   **생성 품질/다양성 (HumanML3D/KIT)**: MDM[^29] 및 PhysDiff[^12]와 같은 확산 모델은 텍스트/액션 조건부 '생성' 작업에서 SOTA 수준의 FID, 다양성, 다중 모드 점수를 보여주었습니다. 이는 고품질 확률론적 '예측'에 대한 강력한 잠재력을 시사합니다.
-   **물리적 타당성**: PhysDiff[^12]는 여러 데이터셋(HumanML3D, HumanAct12, UESTC)에서 기준 확산 모델(MDM, MotionDiffuse) 대비 물리적 오류(발 미끄러짐, 지면 통과, 공중 부양)를 **78%~94%까지 크게 감소**시켰습니다.
-   **효율성**: AAMDM[^30]은 LaFAN1 데이터셋에서 표준 자기회귀 확산 모델(AMDM200) 대비 품질/다양성을 유지하면서 약 **40배 빠른 속도 향상(173 FPS)**을 보여 실시간 상호작용 가능성을 제시했습니다. EMDM[^25] 역시 실시간 생성을 목표로 합니다.

이러한 비교 결과들을 종합해 볼 때, 트랜스포머가 장거리 의존성 포착에 강력한 능력을 보이지만[^10], 특히 복잡한 장기 예측이나 상호작용 시나리오에서는 GCN을 통한 구조 정보 활용[^10], 명시적인 전역/지역 분리[^1], 또는 물리 법칙 안내[^12]와 같이 도메인 지식을 통합한 하이브리드 접근 방식이 종종 최상의 성능을 이끌어낸다는 점을 알 수 있습니다.

이는 강력한 표현력을 가진 아키텍처와 명시적인 구조적 또는 물리적 제약을 결합하는 것이 인간 동작 예측의 미묘한 측면을 효과적으로 다루는 데 중요함을 시사합니다. 또한, 확산 모델에서 나타나는 예측 품질/다양성과 효율성 간의 명백한 상충 관계[^25]는 실시간 예측 응용을 위한 가속화 기술 연구의 필요성을 부각시킨다. 마지막으로, 순수 데이터 기반 생성 모델의 주요 실패 모드 중 하나인 물리적 타당성 문제[^12]는 PhysDiff[^12]와 같은 명시적 해결책을 통해 다른 지표에 큰 손상 없이 크게 개선될 수 있음을 보여주며, 물리 법칙을 고려한 모델링이 표준적인 고려 사항이 되어야 함을 암시합니다.

**표 3: 주요 벤치마크에서의 모델 계열별 비교 성능 요약**

| 모델 계열                 | 주요 예시 모델/논문                               | 강점 (비교 기반)                               | 약점 (비교 기반)                               | 주요 벤치마크/작업 성능 요약 (예시)                                                                                                                               | 관련 Snippet |
| :------------------------ | :------------------------------------------------ | :--------------------------------------------- | :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------- |
| **RNN 기반**              | LSTM[^3], DMST-GRNN (GCN+RNN)[^10]                | 단순성, 단기 시퀀스 처리                       | 장기 의존성 약함, 오차 누적                    | DMST-GRNN: H3.6M/CMU 단기/장기 MAE 개선 (vs RNN)                                                                                                                  | [^3]         |
| **GCN 기반**              | ST-GCN, 2s-AGCN[^18], DMST-GRNN[^10]              | 골격 구조 명시적 모델링                        | 순수 시간적 장거리 의존성 약할 수 있음         | DMST-GRNN: H3.6M/CMU MAE SOTA (당시)                                                                                                                              | [^3]         |
| **Transformer 기반**      | MotionBERT[^18], MDM[^29], T2P[^2]                 | 장거리 의존성 모델링 탁월                      | 계산 비용 높음, 구조 편향 부족                 | MotionBERT: H3.6M 3D 추정 MPJPE SOTA. <br> MDM: HumanML3D/KIT/HumanAct12/UESTC 생성 FID/Diversity SOTA. <br> T2P: JRDB-GMP 예측 SOTA 주장.                               | [^10]        |
| **VAE/GAN 기반**          | Parsaeifard et al.[^3]                            | 불확실성/다중 모드 모델링                      | 학습 불안정성, 표현력 제한 가능성              | Parsaeifard: 분리 모델 기준선 대비 우수 주장                                                                                                                      | [^3]         |
| **Diffusion 기반**        | MDM[^29], MotionDiffuse[^12], PhysDiff[^12], AAMDM[^30] | 생성 품질/다양성 SOTA, 유연한 조건 부여        | 느린 샘플링, 물리적 타당성 확보 어려움         | PhysDiff: 물리적 오류 대폭 감소 (vs MDM/MD). <br> AAMDM: AMDM200 대비 ~40배 빠름 (FPS)                                                                               | [^4]         |
| **Decoupled/Hierarchical** | T2P[^2], Parsaeifard et al.[^3]                   | 복잡성 관리 용이 (특히 장기/다중 에이전트)     | 분리 과정에서의 정보 손실 가능성               | T2P: JRDB-GMP 및 이전 데이터셋 SOTA 주장                                                                                                                          | [^1]         |

### V. 주요 연구 동향 및 지속적인 과제

인간 자세 예측 분야는 응용 분야의 요구사항 증가와 딥러닝 기술의 발전에 힘입어 빠르게 진화하고 있습니다. 몇 가지 주요 연구 동향과 함께 여전히 해결해야 할 과제들이 존재합니다.

#### A. 분야를 형성하는 주요 동향

-   **장기 예측 (Long-Term Prediction)**: 예측 시간 지평을 1초 이내에서 수 초 이상으로 확장하려는 노력.[^1] 이는 불확실성 처리와 더 높은 수준의 계획 및 의도 추론 능력을 요구합니다.
-   **다중 에이전트 상호작용 (Multi-Agent Interaction)**: 여러 사람이 동시에 상호작용하는 상황에서의 움직임을 모델링하고 예측.[^1] 현실적인 장면 이해에 필수적이며, 적합한 데이터셋[^1]과 상호작용 인식 모델이 필요합니다.
-   **확률론적/다양한 예측 (Probabilistic/Diverse Forecasting)**: 결정론적 단일 예측 대신, 미래의 본질적인 불확실성을 반영하여 가능한 여러 미래를 생성.[^1] VAE, GAN, 확산 모델과 같은 생성 모델에 의해 주도됩니다.
-   **개인화 (Personalization)**: 특히 장기간의 HCI 시나리오에서 개인의 고유한 움직임 스타일, 신체 비율, 행동 특성 등에 예측 모델을 적응시키는 연구.[^5] 온라인 적응 또는 개인별 모델 학습이 필요합니다.
-   **장면/맥락/물리 인식 (Scene/Context/Physics Awareness)**: 3D 환경 정보[^27], 물체와의 상호작용[^26], 또는 물리 법칙[^12]을 통합하여 보다 현실적이고 환경에 적합한 예측을 생성하려는 시도.
-   **조건부 예측 (Conditioned Prediction)**: 텍스트[^12], 액션[^12], 경로[^1], 이미지[^40] 등 다양한 입력 조건에 따라 동작을 생성/예측. 조건부 생성과 경계가 모호하지만 제어 가능한 예측과 관련이 깊습니다.
-   **향상된 아키텍처 (Improved Architectures)**: GCN, 트랜스포머, 확산 모델의 지속적인 탐구 및 이들의 강점 결합 또는 도메인 지식(예: 분리, 물리) 통합. 대규모 데이터셋을 이용한 사전 훈련.[^18]

이러한 주요 동향들(장기, 다중 에이전트, 확률론적, 맥락 인식)은 서로 밀접하게 연관되어 있으며, 복잡하고 상호작용적인 환경에서 보다 현실적이고 유용한 예측을 가능하게 하려는 공동의 목표를 향해 나아가고 있습니다.

예를 들어, 장기 예측은 필연적으로 맥락과 상호작용에 대한 이해를 요구하며, 실제 상호작용은 여러 에이전트를 포함하고 미래는 불확실하므로 확률론적 접근이 필요합니다. 이처럼 각 동향은 단편적인 발전이 아니라, 통제된 환경에서의 단순한 기구학적 외삽을 넘어서려는 포괄적인 목표의 여러 측면을 나타냅니다.

#### B. 비교 리뷰에서 강조된 주요 장애물

-   **데이터 품질, 양, 편향 (Data Quality, Quantity, and Bias)**: 특히 다중 에이전트, 장기, 실제 환경 시나리오를 위한 더 크고, 다양하며, 정확하게 주석 처리된 데이터셋의 필요성.[^1] 기존 데이터셋은 한계를 가지며[^1], 실제 데이터(ground truth) 정확도도 문제가 될 수 있습니다.[^37]
-   **평가의 엄밀성 (Evaluation Rigor)**: MPJPE와 같은 단순 지표에 대한 과도한 의존.[^8] 정확도, 다양성, 타당성, 관련성, 효율성을 포괄하는 종합적인 평가 체계의 필요성.[^36] 벤치마킹 프로토콜의 발전 필요.[^5]
-   **일반화 (Generalization)**: 특정 데이터셋(주로 모션 캡처)에서 훈련된 모델이 다양한 실제 환경 시나리오('in-the-wild')로 잘 일반화되지 않을 수 있음. 도메인 간극 문제.[^44]
-   **물리적 타당성 (Physical Plausibility)**: 특히 생성 모델과 장기 예측에서 예측 결과가 물리 법칙을 준수하고 인공적인 오류(artifact)를 회피하도록 보장하는 것이 여전히 어려운 과제.[^12]
-   **제어 가능성 (Controllability)**: 생성 모델을 효과적으로 제어하여 특정 원하는 동작(조건부 예측 관련)을 생성하는 것의 어려움.[^29]
-   **계산 비용 / 실시간 제약 (Computational Cost / Real-time Constraints)**: 트랜스포머, 특히 확산 모델과 같은 복잡한 모델은 계산 비용이 높아 실시간 응용을 저해할 수 있음.[^29]
-   **가려짐 및 노이즈 처리 (Handling Occlusion and Noise)**: 실제 입력 데이터(자세 추정 결과)는 가려짐으로 인해 종종 노이즈가 있거나 불완전함.[^4] 예측 모델은 이러한 불완전성에 강인해야 한다.

지속적인 과제 중 상당수가 **데이터 및 평가**와 관련되어 있다는 점[^1]은 주목할 만합니다. 이는 연구 발전이 모델 아키텍처뿐만 아니라 기존 벤치마크와 평가 방법의 한계에 의해서도 제약을 받을 수 있음을 시사합니다. 만약 데이터셋의 다양성이 부족하거나 평가 지표가 타당성 또는 상호작용 품질과 같은 중요한 측면을 포착하지 못한다면, 정교한 모델이라 할지라도 실제 유용성을 위해 효과적으로 개발되거나 평가되지 못할 수 있습니다. 새로운 데이터셋[^1]과 지표[^12] 개발에 대한 강조는 이러한 문제 인식을 반영합니다.

또한, 물리적 타당성 문제[^12]는 유연한 데이터 기반 생성 모델과 물리 세계의 엄격한 제약 사이의 근본적인 긴장을 드러냅니다. 딥러닝 모델은 데이터로부터 상관관계를 학습하는 데는 능숙하지만, 명시적으로 표현되지 않은 엄격한 제약을 강제하는 데는 어려움을 겪습니다. 물리 엔진은 물리 법칙에 대한 기준 정보를 제공하므로, 통합 시뮬레이션[^12]이나 물리 정보 기반 손실/강화학습[^26] 등을 통해 이 둘을 결합하는 것이 진정으로 현실적인 동작을 생성하는 데 필요한 접근 방식으로 보입니다.

### VI. 향후 연구 방향 및 결론

인간 자세 예측 분야의 비교 연구들은 현재 기술 수준을 조명하고 향후 연구가 나아가야 할 방향에 대한 중요한 통찰력을 제공합니다.

#### A. 리뷰에서 종합된 향후 연구 기회

-   **더 나은 벤치마크 구축**: 장기, 다중 에이전트, 상호작용, 실제 환경 예측을 위한 더 다양하고, 대규모이며, 정확하게 주석 처리된 데이터셋 개발.[^1] 정확도, 다양성, 타당성, 효율성, 작업 관련성을 포괄하는 전체론적 성능에 초점을 맞춘 표준화된 평가 프로토콜 정립. 개인화 예측을 위한 특정 벤치마크 개발.[^5]
-   **장기 및 상호작용 모델 개선**: 장거리 의존성, 목표 지향적 행동, 복잡한 다중 에이전트 상호작용을 더 잘 모델링할 수 있는 아키텍처 개발.[^1] 계층적 모델, 메모리 메커니즘, 사회적 상호작용 사전 지식 탐구.
-   **효율적이고 제어 가능한 생성 모델**: 확산 모델의 더 빠른 샘플링 방법 연구[^25] 및 조건부 예측을 위한 생성 출력 제어 능력 향상.[^32] 플로우 기반 모델과 같은 대안 탐색.[^4]
-   **향상된 물리적 현실성**: 물리적 사전 지식을 모델에 더 깊고 효율적으로 통합하여, 사후 보정이나 비용이 많이 드는 시뮬레이션 단계를 넘어서는 방안 모색.[^12] 물리학을 암시적으로 학습하거나 미분 가능한 물리학 활용 탐구.
-   **개인화 및 적응**: 제한된 데이터로부터 강인한 개인화 모델을 학습하거나 온라인에서 개별 사용자에게 빠르게 적응할 수 있는 방법 개발.[^5]
-   **설명 가능성 및 신뢰성 (Explainability and Trustworthiness)**: 모델이 복잡해짐에 따라, 특히 안전이 중요한 응용 분야에서 특정 예측이 이루어진 이유를 이해하는 것이 중요해짐.[^46]
-   **교차 모달 예측 (Cross-Modal Forecasting)**: 과거 자세 외에 장면 정보(이미지[^40], 3D 스캔[^27]), 오디오, 텍스트 지침과 같은 다른 양식(modalities)을 예측 프로세스에 보다 효과적으로 통합.

주목할 점은, 제시된 많은 향후 연구 방향들이 앞서 식별된 지속적인 과제들(예: 데이터 한계를 위한 더 나은 벤치마크, 타당성 문제를 위한 물리 통합, 확산 모델의 효율성 문제 해결)을 직접적으로 다루고 있다는 것입니다.[^1] 이는 연구 커뮤니티 내에서 현재의 병목 현상에 대한 강한 인식이 있으며, 연구가 알려진 약점을 적극적으로 목표로 하고 있음을 나타냅니다. 이는 향후 몇 년 안에 상당한 발전이 이루어질 가능성이 있는 영역을 시사합니다.

또한, 개인화[^5]와 설명 가능성[^46]에 대한 관심 증가는 예측 모델이 평균적으로 정확할 뿐만 아니라 특정 인간 중심 응용 분야에 맞게 조정되고 신뢰할 수 있어야 하는 미래를 암시합니다. AI 시스템이 인간과 더 긴밀하게 상호작용함에 따라, 일반적이고 블랙박스적인 모델은 덜 수용 가능해질 것이며, 개인의 미묘한 차이를 이해하고 그 행동을 이해하거나 예측할 수 있는 모델에 대한 요구가 증가하여 연구가 단순한 벤치마크 성능을 넘어서도록 이끌 가능성이 높습니다.

#### B. 종합 결론

인간 자세 예측 연구는 단기 결정론적 예측에서 **장기, 다중 에이전트, 확률론적 시나리오**를 다루는 방향으로 크게 발전했습니다. RNN, GCN, 특히 **트랜스포머**는 모델링 능력을 향상시켰습니다. 생성 모델, 특히 (생성 작업에서 차용된) **확산 모델**은 불확실성과 다양성을 처리하는 데 유망함을 보이지만 효율성과 물리적 타당성 측면에서 과제를 안고 있습니다.

비교 연구들의 핵심 메시지는 **모든 측면에서 단일 방법론이 지배적이지 않다**는 것입니다. 트랜스포머는 강력한 시퀀스 모델링을 제공하고, GCN은 구조를 활용하며, 분리 기법은 복잡성 관리를 돕고, 물리 안내는 현실성을 높입니다. 평가는 MPJPE를 넘어서는 다면적인 접근이 필요하며, 벤치마크의 한계는 여전히 중요한 병목 현상으로 남아 있습니다.

향후 연구는 더 나은 벤치마크 개발, 맥락과 상호작용 이해를 통합하는 더 정교한 모델 개발, 효율적이고 제어 가능한 생성 기법 연구, 그리고 물리적 타당성과 개인화를 보장하는 강인한 방법 개발에 달려 있습니다. 이 분야는 HCI, 로봇 공학, 자율 시스템 등 까다로운 응용 분야에 의해 주도되는 역동적인 영역으로, **현실성, 상호작용, 효율성, 개인화**에 대한 지속적인 추구가 연구 발전을 이끌어갈 것으로 전망됩니다.

---

## 참고 자료

[^1]: Jeong, H., Choi, J., & Lee, G. (2024). Multi-agent Long-term 3D Human Pose Forecasting via Interaction-aware Trajectory Conditioning. In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*. [https://openaccess.thecvf.com/content/CVPR2024/papers/Jeong_Multi-agent_Long-term_3D_Human_Pose_Forecasting_via_Interaction-aware_Trajectory_Conditioning_CVPR_2024_paper.pdf](https://openaccess.thecvf.com/content/CVPR2024/papers/Jeong_Multi-agent_Long-term_3D_Human_Pose_Forecasting_via_Interaction-aware_Trajectory_Conditioning_CVPR_2024_paper.pdf)
[^2]: T2P 모델 관련 논문 (링크 필요)
[^3]: Parsaeifard, B., & Stiefelhagen, R. (2021). Learning Decoupled Representations for Human Pose Forecasting. In *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV) Workshops*. [https://openaccess.thecvf.com/content/ICCV2021W/SoMoF/papers/Parsaeifard_Learning_Decoupled_Representations_for_Human_Pose_Forecasting_ICCVW_2021_paper.pdf](https://openaccess.thecvf.com/content/ICCV2021W/SoMoF/papers/Parsaeifard_Learning_Decoupled_Representations_for_Human_Pose_Forecasting_ICCVW_2021_paper.pdf)
[^4]: Xu, Z., Chai, J., & Lv, X. (2025). Human Motion Prediction, Reconstruction, and Generation. *arXiv preprint arXiv:2502.15956*. [https://arxiv.org/html/2502.15956v1](https://arxiv.org/html/2502.15956v1)
[^5]: Adeli, V., Shariat, N., Marin, R., Reid, I., & Salzmann, M. (2023). Personalized Pose Forecasting. *arXiv preprint arXiv:2312.03528*. [https://arxiv.org/pdf/2312.03528](https://arxiv.org/pdf/2312.03528)
[^6]: Li, C., Zhang, Z., Sun, W., & Zou, Q. (2023). Recent Advances in Deterministic Human Motion Prediction: A Review. *arXiv preprint arXiv:2312.06184*. [https://arxiv.org/html/2312.06184v1](https://arxiv.org/html/2312.06184v1)
[^7]: Human Fall Motion Prediction – A Review. (2025). *ResearchGate*. [https://www.researchgate.net/publication/384617145_Human_Fall_Motion_Prediction_-_A_Review](https://www.researchgate.net/publication/384617145_Human_Fall_Motion_Prediction_-_A_Review)
[^8]: Martinez, J., Black, M. J., & Romero, J. (2017). On Human Motion Prediction Using Recurrent Neural Networks. In *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*. [https://typeset.io/papers/on-human-motion-prediction-using-recurrent-neural-networks-2i62b0kvs1](https://typeset.io/papers/on-human-motion-prediction-using-recurrent-neural-networks-2i62b0kvs1)
[^9]: PoseRL-Net: human pose analysis for motion training guided by robot vision. (2025). *Frontiers in Neurorobotics*. [https://www.frontiersin.org/journals/neurorobotics/articles/10.3389/fnbot.2025.1531894/full](https://www.frontiersin.org/journals/neurorobotics/articles/10.3389/fnbot.2025.1531894/full)
[^10]: Mao, W., Liu, M., & Salzmann, M. (2019). Long-Term Human Motion Prediction by Modeling Motion Context and Enhancing Motion Dynamics. *ResearchGate*. [https://www.researchgate.net/publication/326206421_Long-Term_Human_Motion_Prediction_by_Modeling_Motion_Context_and_Enhancing_Motion_Dynamics](https://www.researchgate.net/publication/326206421_Long-Term_Human_Motion_Prediction_by_Modeling_Motion_Context_and_Enhancing_Motion_Dynamics)
[^11]: Human motion prediction. *Papers With Code*. [https://paperswithcode.com/task/human-motion-prediction/codeless](https://paperswithcode.com/task/human-motion-prediction/codeless)
[^12]: Yuan, Y., Rempe, D., Liu, Z., Wang, T., Snavely, N., & Black, M. J. (2023). PhysDiff: Physics-Guided Human Motion Diffusion Model. In *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*. [https://openaccess.thecvf.com/content/ICCV2023/papers/Yuan_PhysDiff_Physics-Guided_Human_Motion_Diffusion_Model_ICCV_2023_paper.pdf](https://openaccess.thecvf.com/content/ICCV2023/papers/Yuan_PhysDiff_Physics-Guided_Human_Motion_Diffusion_Model_ICCV_2023_paper.pdf)
[^13]: Human Pose Estimation Using Deep Learning: A Systematic Literature Review. (2023). *MDPI*. [https://www.mdpi.com/2504-4990/5/4/81](https://www.mdpi.com/2504-4990/5/4/81)
[^14]: A Review on Human Pose Estimation Based on Deep Learning. (2025). *ResearchGate*. [https://www.researchgate.net/publication/386138886_A_Review_on_Human_Pose_Estimation_Based_on_Deep_Learning](https://www.researchgate.net/publication/386138886_A_Review_on_Human_Pose_Estimation_Based_on_Deep_Learning)
[^15]: PoseRL-Net: human pose analysis for motion training guided by robot vision. (2025). *PMC*. [https://pmc.ncbi.nlm.nih.gov/articles/PMC11920136/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11920136/)
[^16]: A Review of 3D Human Pose Estimation. (2024). *Applied and Computational Engineering*. [https://www.ewadirect.com/proceedings/ace/article/view/17679](https://www.ewadirect.com/proceedings/ace/article/view/17679)
[^17]: Prof. Dr. Otmar Hilliges. *AIT Lab - ETH Zürich*. [https://ait.ethz.ch/people/hilliges](https://ait.ethz.ch/people/hilliges)
[^18]: Zheng, W., Liu, M., & Salzmann, M. (2023). MotionBERT: A Unified Perspective On Learning Human Motion Representations. *Scribd*. [https://www.scribd.com/document/714836400/MotionBERT-A-Unified-Perspective-on-Learning-Human-Motion-Representations](https://www.scribd.com/document/714836400/MotionBERT-A-Unified-Perspective-on-Learning-Human-Motion-Representations)
[^19]: HuTuMotion: Human-Tuned Navigation of Latent Motion Diffusion Models with Minimal Feedback. (2023). *arXiv preprint arXiv:2312.12227*. [https://arxiv.org/html/2312.12227v1](https://arxiv.org/html/2312.12227v1)
[^20]: LEAD: Latent Realignment for Human Motion Diffusion. (2024). *arXiv preprint arXiv:2410.14508*. [https://arxiv.org/html/2410.14508v1](https://arxiv.org/html/2410.14508v1)
[^21]: Xu, Z., Chai, J., & Lv, X. (2025). Human Motion Prediction, Reconstruction, and Generation. *arXiv preprint arXiv:2502.15956*. [https://www.arxiv.org/abs/2502.15956](https://www.arxiv.org/abs/2502.15956)
[^22]: Paper page - Human Motion Prediction, Reconstruction, and Generation. *Hugging Face*. [https://huggingface.co/papers/2502.15956](https://huggingface.co/papers/2502.15956)
[^23]: Tianyu Li (黎天宇). *Google Scholar*. [https://scholar.google.com/citations?user=LaPb8-YAAAAJ&hl=en](https://scholar.google.com/citations?user=LaPb8-YAAAAJ&hl=en)
[^24]: Sampieri, A. (2023). On Modelling Humans: Forecasting, Synthesis and Human-X Interaction. *IRIS*. [https://iris.uniroma1.it/retrieve/a39246dd-ef6a-4c7d-a446-f94ce30d6184/Tesi_dottorato_Sampieri.pdf](https://iris.uniroma1.it/retrieve/a39246dd-ef6a-4c7d-a446-f94ce30d6184/Tesi_dottorato_Sampieri.pdf)
[^25]: EMDM: Efficient Motion Diffusion Model for Fast and High-Quality Motion Generation. (2023). *arXiv preprint arXiv:2312.02256*. [https://arxiv.org/html/2312.02256v3](https://arxiv.org/html/2312.02256v3)
[^26]: ReinDiffuse: Crafting Physically Plausible Motions with Reinforced Diffusion Model. (2024). *arXiv preprint arXiv:2410.07296*. [https://arxiv.org/html/2410.07296v1](https://arxiv.org/html/2410.07296v1)
[^27]: Harmonizing Stochasticity and Determinism: Scene-responsive Diverse Human Motion Prediction. (2024). *OpenReview*. [https://openreview.net/forum?id=NQCkNM6TES](https://openreview.net/forum?id=NQCkNM6TES)
[^28]: Shape Conditioned Human Motion Generation with Diffusion Model. (2024). *arXiv preprint arXiv:2405.06778*. [https://arxiv.org/html/2405.06778v1](https://arxiv.org/html/2405.06778v1)
[^29]: Tevet, G., et al. (2022). Human Motion Diffusion Model. *OpenReview*. [https://openreview.net/pdf?id=SJ1kSyO2jwu](https://openreview.net/pdf?id=SJ1kSyO2jwu)
[^30]: Li, T., et al. (2024). AAMDM: Accelerated Auto-regressive Motion Diffusion Model. In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*. [https://openaccess.thecvf.com/content/CVPR2024/html/Li_AAMDM_Accelerated_Auto-regressive_Motion_Diffusion_Model_CVPR_2024_paper.html](https://openaccess.thecvf.com/content/CVPR2024/html/Li_AAMDM_Accelerated_Auto-regressive_Motion_Diffusion_Model_CVPR_2024_paper.html)
[^31]: Human Motion Diffusion Model. (2022). *ResearchGate*. [https://www.researchgate.net/publication/364025683_Human_Motion_Diffusion_Model](https://www.researchgate.net/publication/364025683_Human_Motion_Diffusion_Model)
[^32]: Enhanced Fine-grained Motion Diffusion for Text-driven Human Motion Synthesis. (2023). *arXiv preprint arXiv:2305.13773*. [https://arxiv.org/html/2305.13773v2](https://arxiv.org/html/2305.13773v2)
[^33]: Towards Realistic Human Motion Prediction with Latent Diffusion and Physics-Based Models. (2025). *MDPI*. [https://www.mdpi.com/2079-9292/14/3/605](https://www.mdpi.com/2079-9292/14/3/605)
[^34]: AAMDM: Accelerated Auto-regressive Motion Diffusion Model. *CVPR 2024 Open Access Repository*. [https://openaccess.thecvf.com/content/CVPR2024/html/Li_AAMDM_Accelerated_Auto-regressive_Motion_Diffusion_Model_CVPR_2024_paper.html](https://openaccess.thecvf.com/content/CVPR2024/html/Li_AAMDM_Accelerated_Auto-regressive_Motion_Diffusion_Model_CVPR_2024_paper.html)
[^35]: AAMDM: Accelerated Auto-regressive Motion Diffusion Model. *Bytez*. [https://bytez.com/docs/cvpr/31407/paper](https://bytez.com/docs/cvpr/31407/paper)
[^36]: Review of models for estimating 3D human pose using deep learning. (2025). *PMC*. [https://pmc.ncbi.nlm.nih.gov/articles/PMC11888865/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11888865/)
[^37]: Kjellström, H., et al. (2021). The THÖR dataset: A dataset for human-robot interaction. *Örebro University*. [http://oru.diva-portal.org/smash/get/diva2:1524236/FULLTEXT01.pdf](http://oru.diva-portal.org/smash/get/diva2:1524236/FULLTEXT01.pdf)
[^38]: FG-MDM: Towards Zero-Shot Human Motion Generation via ChatGPT-Refined Descriptions. (2023). *arXiv preprint arXiv:2312.02772*. [https://arxiv.org/html/2312.02772v3](https://arxiv.org/html/2312.02772v3)
[^39]: Pose ResNet: 3D Human Pose Estimation Based on Self-Supervision. (2023). *PMC*. [https://pmc.ncbi.nlm.nih.gov/articles/PMC10054156/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10054156/)
[^40]: Move-in-2D: 2D-Conditioned Human Motion Generation. (2024). *arXiv preprint arXiv:2412.13185*. [https://arxiv.org/html/2412.13185v1](https://arxiv.org/html/2412.13185v1)
[^41]: Human Motion Prediction, Reconstruction, and Generation. (2025). *ResearchGate*. [https://www.researchgate.net/publication/389314800_Human_Motion_Prediction_Reconstruction_and_Generation](https://www.researchgate.net/publication/389314800_Human_Motion_Prediction_Reconstruction_and_Generation)
[^42]: 灯塔索引. [https://www.dotaindex.com/paper_search?type=1&ex=1&cites=17023456786400194006](https://www.dotaindex.com/paper_search?type=1&ex=1&cites=17023456786400194006)
[^43]: Deep Learning-Based Human Pose Estimation: A Survey. (2020). *ResearchGate*. [https://www.researchgate.net/publication/347881067_Deep_Learning-Based_Human_Pose_Estimation_A_Survey](https://www.researchgate.net/publication/347881067_Deep_Learning-Based_Human_Pose_Estimation_A_Survey)
[^44]: A Survey on Deep Learning-Based 2D Human Pose Estimation Models. (2023). *Tech Science Press*. [https://www.techscience.com/cmc/v76n2/53975/html](https://www.techscience.com/cmc/v76n2/53975/html)
[^45]: A Systematic Review of Recent Deep Learning Approaches for 3D Human Pose Estimation. (2023). *Preprints.org*. [https://www.preprints.org/manuscript/202311.0197/v1](https://www.preprints.org/manuscript/202311.0197/v1)
[^46]: Neuro-Symbolic AI in 2024: A Systematic Review. (2025). *arXiv preprint arXiv:2501.05435*. [https://arxiv.org/html/2501.05435v1](https://arxiv.org/html/2501.05435v1)



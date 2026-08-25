---
title: '모터 진동 PHM 데이터 파이프라인 회고'
description: '16GB 규모 진동 CSV를 읽고 라벨링·IQR 클리핑·스케일링·PCA·t-SNE까지 실험했던 코드를 재현성과 데이터 누수 관점에서 다시 검토한다.'
pubDate: 2024-02-01
updatedDate: 2026-08-25
category: ai-machine-learning
subcategory: industrial-ai
type: implementation
tags:
  - predictive-maintenance
  - data-preprocessing
  - pca
  - pandas
  - anomaly-detection
researchArea: ml-foundations-evaluation
researchFeatured: true
researchOrder: 4
lang: 'ko'
---

이 글은 연구실 모터 진동 데이터로 진행했던 초기 PHM(Prognostics and Health Management) 탐색을 다시 정리한 회고다. 원 데이터는 연구실 소유이고 공개할 수 없으므로 결과를 재현 가능한 벤치마크처럼 제시하지 않는다. 대신 당시 코드가 실제로 수행한 처리, 그 코드의 결함, 다시 실험한다면 지켜야 할 검증 절차를 분리해 기록한다.

## PHM을 처음 보는 사람을 위한 설명

모터나 기어가 손상되면 회전할 때 생기는 진동의 크기와 주파수 구성이 달라질 수 있다. PHM은 이런 신호로 현재 상태를 진단하고, 가능하다면 고장까지 남은 시간도 추정하는 분야다.

```text
회전 장치 → 진동 센서 → 시간 파형 → 특징/주파수 변환
         → 정상·이상 구분 → 경고 또는 잔여수명 추정
```

이 실험의 `H`, `B`, `F`는 원본 코드에서 사용한 센서 그룹 라벨이다. 그림에서 세 색이 나뉜다고 세 고장 종류가 분류된 것은 아니다. 센서 장착 위치, gain, 속도 또는 부하가 만든 차이일 수 있다.

## 실제 코드에서 확인한 흐름

2024년 작업 폴더에는 다음 역할의 스크립트가 남아 있었다.

| 단계 | 실제 처리 | 확인된 한계 |
|---|---|---|
| 입력 점검 | `read_csv(..., chunksize=1000)`으로 행 수와 메모리 사용량 누적 | 청크를 읽은 뒤 다시 전부 결합하는 코드도 있어 peak memory가 충분히 줄지 않음 |
| 스키마 부여 | 별도 Excel 파일의 열 이름을 센서 CSV에 적용 | 원본 스키마 파일 없이는 재현 불가, 열 개수 검증 없음 |
| 특징 선택 | metadata 열 제거, Time/FFT 계열과 `Peak`, `RMS`, `Crestfactor` 선택 | 열 이름 규칙이 코드에 하드코딩됨 |
| 라벨링 | 파일명의 sensor·speed·weight를 파싱 | 파일명 오류를 잡는 validation이 없음 |
| 이상치 처리 | 각 행의 Time/FFT 구간에 1.5×IQR winsorization | 고장 impulse가 실제 신호인데 제거될 수 있음 |
| 스케일링 | MinMaxScaler와 StandardScaler를 각각 시험 | 전체 데이터에 먼저 fit하면 test 정보 누수 발생 |
| 차원 축소 | PCA 99% 분산 또는 고정 12 component, t-SNE 2D | label 열 혼입 가능성, t-SNE 재현 seed·표본화 전략 없음 |

원본 탐색 스크립트도 당시 상태 그대로 공개했다. 절대경로와 중간 실험 코드가 포함된 archive라서 바로 실행하는 package는 아니다.

- [코드 archive 안내](/assets/posts/phm/source/readme.md)
- [정리된 IncrementalPCA 파이프라인](/assets/posts/phm/source/phm-reproducible.py)
- [원본 전처리 코드](/assets/posts/phm/source/v-preprocessing.py)
- [전체 파일 병합 코드](/assets/posts/phm/source/v-preprocessing-all.py)
- [원본 PCA 코드](/assets/posts/phm/source/v-pca-all.py)
- [원본 t-SNE 코드](/assets/posts/phm/source/v-tsne-all.py)

## 당시 결과를 어떻게 읽어야 하는가

초기 PCA 실행에서 다음 explained variance ratio가 기록됐다.

```text
[0.7861, 0.0932, 0.0514, 0.0321, 0.0129,
 0.0048, 0.0042, 0.0034, 0.0024]
```

첫 주성분의 비중이 크다는 사실만으로 고장 상태가 잘 분리된다고 말할 수는 없다. 회전 속도, 부하, 센서 위치 또는 측정 gain이 분산을 지배했을 수도 있다. PCA는 label을 모르는 비지도 선형 투영이므로 반드시 component loading과 운전 조건별 분포를 함께 봐야 한다.

또한 기존 글의 “PCA 99% = 정보 99% 유지”라는 표현은 정확하지 않다. 이는 입력 변수의 <strong>표본 분산 99%</strong>를 선형 부분공간이 설명한다는 뜻이다. 고장 판별에 중요한 저분산 신호까지 99% 보존한다는 보장은 없다. `whiten=True`도 일반적인 normalization과 같지 않다. PCA 좌표를 각 component의 분산으로 다시 조정하는 변환이다.

## 당시 결과 그림 다시 읽기

### 1. 라벨 누수를 의심해야 하는 PCA

![G B M 그룹이 세 개의 수직선으로 갈라진 과거 PCA 결과](/assets/posts/phm/results/pca-label-only.png)

`G/B/M` 세 그룹이 첫 번째 축의 `-1, 0, 1` 부근에 정확히 놓인다. 자연스러운 진동 feature가 이처럼 세 수직선을 만들었다고 보기 어렵다. category label 또는 이를 직접 반영한 열이 PCA 입력에 남았을 가능성이 크다. 이것은 좋은 분류 결과가 아니라 **target leakage를 의심해야 하는 진단 증거**다.

### 2. 센서 feature를 사용한 PCA

![H B F 센서 그룹의 PCA 2차원 분포](/assets/posts/phm/results/pca-sensor-features.png)

`H`, `B`, `F`가 서로 다른 곡선 영역을 만들지만 경계에서는 겹친다. PCA는 class를 분리하는 알고리즘이 아니라 전체 분산이 큰 방향을 찾는다. 따라서 이 분리가 센서 위치, gain, speed·weight 구성 또는 실제 vibration pattern 중 무엇에서 왔는지 추가 대조가 필요하다.

같은 speed·weight 안에서 센서별 그림을 다시 그리고, 반대로 같은 센서 안에서 speed·weight별 분포를 그려야 confounder를 구분할 수 있다.

### 3. t-SNE 결과

![H B F 센서 그룹의 t-SNE 2차원 분포](/assets/posts/phm/results/tsne-sensor-features.png)

t-SNE에서는 세 그룹이 여러 섬처럼 갈라진다. t-SNE는 국소 이웃 관계를 강조해 cluster를 만들기 때문에 축의 값이나 멀리 떨어진 cluster 사이 거리를 물리량처럼 읽으면 안 된다. 이 결과는 “국소 구조가 다를 가능성”을 보여 주는 탐색 그림이지, 새 측정 session에서도 분류된다는 검증은 아니다.

재생성할 때는 `random_state`, perplexity, learning rate, 표본 추출 방법과 PCA 사전 축소 여부를 함께 기록해야 한다.

## 공개 가능한 개선 파이프라인

```python
from pathlib import Path
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import IncrementalPCA
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

META = ["sensor", "speed", "weight", "session_id", "condition"]

def iter_chunks(paths: list[Path], schema: list[str], chunksize: int = 10_000):
    for path in paths:
        for chunk in pd.read_csv(path, header=None, names=schema, chunksize=chunksize):
            labels = parse_and_validate_filename(path.name)
            yield chunk.assign(**labels)

# split은 행이 아니라 session 또는 run 단위로 먼저 만든다.
train_files, valid_files, test_files = split_by_session(all_files)

# scaler와 PCA는 train에만 fit한다. 대용량이면 partial_fit을 사용한다.
scaler = StandardScaler()
ipca = IncrementalPCA(n_components=12, batch_size=10_000)
```

위 코드는 설계 골격이다. `parse_and_validate_filename`, `split_by_session`, schema는 공개 데이터 형식에 맞게 정의해야 한다. 중요한 점은 데이터를 합치기 전에 측정 세션을 분할하고, scaler·PCA를 학습 세트에만 맞추는 것이다.

## IQR 처리는 왜 조심해야 하는가

진동 PHM에서 큰 진폭은 센서 오류일 수도 있지만 bearing fault나 impact의 핵심 증거일 수도 있다. 따라서 무조건 삭제하거나 clipping하지 말고 다음 순서로 판단해야 한다.

1. 센서 허용 범위와 saturation 여부를 확인한다.
2. 시간 파형에서 spike가 반복·주기적인지 본다.
3. FFT envelope 또는 order spectrum에서 고장 주파수와 일치하는지 확인한다.
4. raw, clipped, robust-scaled 세 조건을 동일한 split에서 비교한다.
5. 처리 규칙은 test 결과를 본 뒤 바꾸지 않는다.

## 시각화 설계

- raw waveform과 zoomed impulse
- FFT 또는 power spectral density
- speed·load별 RMS와 crest factor 분포
- PCA score plot과 component loading
- 세션별 색상과 고장 조건별 marker를 분리한 embedding
- t-SNE는 탐색용으로만 사용하고 `random_state`, perplexity, 표본 수를 기록

클래스가 예쁘게 갈라지는 2D 그림만으로 모델의 일반화 가능성을 판단하지 않는다. 동일 운전 세션의 인접 window가 양쪽 split에 들어가면 시각화와 분류 점수가 모두 과도하게 좋아질 수 있다.

## 재실험 체크리스트

- [ ] 데이터 사전과 단위, sampling rate 기록
- [ ] motor·gearbox·bearing 센서 위치 구분
- [ ] run/session 단위 split과 시간 순서 보존
- [ ] 결측·무한값·상수열·중복 행 감사
- [ ] speed/load confounder baseline 측정
- [ ] train-only preprocessing 보장
- [ ] 정상-only 학습과 supervised 분류를 별도 평가
- [ ] PR-AUC, false alarms per hour, detection delay 보고
- [ ] seed·환경·라이브러리 버전 기록

이 글의 숫자는 과거 비공개 데이터에서 나온 탐색 기록이며 공개 benchmark 결과가 아니다. 향후에는 Case Western Reserve University Bearing Data Center나 Paderborn bearing dataset처럼 출처와 라이선스가 명확한 공개 데이터로 동일 파이프라인을 다시 실행해 결과를 추가한다.

## 참고 원문

- [scikit-learn PCA](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html)
- [scikit-learn IncrementalPCA](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.IncrementalPCA.html)
- [scikit-learn common pitfalls: inconsistent preprocessing and data leakage](https://scikit-learn.org/stable/common_pitfalls.html)
- [Case Western Reserve University Bearing Data Center](https://engineering.case.edu/bearingdatacenter)
- [Paderborn University Bearing Data Center](https://mb.uni-paderborn.de/kat/forschung/datacenter/bearing-datacenter)

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

## 당시 결과를 어떻게 읽어야 하는가

초기 PCA 실행에서 다음 explained variance ratio가 기록됐다.

```text
[0.7861, 0.0932, 0.0514, 0.0321, 0.0129,
 0.0048, 0.0042, 0.0034, 0.0024]
```

첫 주성분의 비중이 크다는 사실만으로 고장 상태가 잘 분리된다고 말할 수는 없다. 회전 속도, 부하, 센서 위치 또는 측정 gain이 분산을 지배했을 수도 있다. PCA는 label을 모르는 비지도 선형 투영이므로 반드시 component loading과 운전 조건별 분포를 함께 봐야 한다.

또한 기존 글의 “PCA 99% = 정보 99% 유지”라는 표현은 정확하지 않다. 이는 입력 변수의 <strong>표본 분산 99%</strong>를 선형 부분공간이 설명한다는 뜻이다. 고장 판별에 중요한 저분산 신호까지 99% 보존한다는 보장은 없다. `whiten=True`도 일반적인 normalization과 같지 않다. PCA 좌표를 각 component의 분산으로 다시 조정하는 변환이다.

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

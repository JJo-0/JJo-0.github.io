# 02장: 좌표·궤적 계산과 실제 Pendulum 실행

이 예제는 고정 PD 제어기를 위쪽 근처의 역진자에 실행한다. 파라미터 학습, RL 훈련, ETH 과제 실행, 실물 로봇 구동을 포함하지 않는다.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python control_mdp.py
```

환경: Python 3.13.15, Gymnasium 1.2.2, NumPy 2.5.4, Matplotlib 3.10.7, Pygame 2.6.1. 실제 실행 버전과 파일 해시는 `results/summary.json`에 기록한다. 그래픽 창 없이 RGB 프레임을 생성한다.

- `results/time-scaling.png`: 1초 동안 0→1rad 선형·5차 보간의 위치·속도·가속도. 선형 보간의 충격 가속도는 유한 값으로 그리지 않는다.
- `results/pendulum-{zero,pd}.csv`: 매 단계 관측에서 구한 각도·각속도, 행동 토크, 보상, 종료·시간 제한 여부.
- `results/pendulum-{zero,pd}.gif`: 실행 중 5단계마다 저장한 40프레임. 프레임 간격은 시뮬레이션의 0.25초다.
- `results/summary.json`: 13개 수치 검사, 같은 시드·초기 조건의 200단계 실행 요약, 실행 파일 SHA256.

각도 범위 ±0.2rad, 초기 각속도 0, seed=7. PD는 `clip(-15*theta-3*velocity,-2,2)`이며 위쪽 근처 유지 예다. 전체 무작위 초기 상태에서의 스윙업 능력을 주장하지 않는다. 마지막 위치만 비슷해도 전체 리턴과 운동은 다를 수 있다. 두 실행은 과업 종료가 아니라 200단계 시간 제한으로 중단된다. 기대 리턴이나 여러 시드의 통계적 성능을 추정한 결과가 아니다.

[Gymnasium 원본 환경 설명](https://gymnasium.farama.org/environments/classic_control/pendulum/). 환경 렌더러의 저작권은 Farama Foundation 등 해당 권리자에게 있으며, 자체 계산과 실행 기록은 JJo 작성이다.

## 원본·보충 강의 대조 뒤 추가 계산

`supplement_checks.py`는 NumPy만으로 역변환, 정책 전이 혼합, 정규화 행동의 관절 범위 대응, 시간 간격별 할인율, PD 평형 오차, 거의 편 2R 팔의 의사역행렬·DLS 계산을 검사한다.

```sh
.venv/bin/python supplement_checks.py
```

추가 검사 8개를 통과했으며 결과는 `results/supplement-checks.json`에 저장한다. 한 번의 국소 선형 계산을 비교한 것으로 Isaac Lab 실행·로봇 움직임·RL 훈련 또는 IK 수렴 결과가 아니다. DLS는 큰 갱신을 줄이는 대신 선형 잔차를 남길 수 있다.

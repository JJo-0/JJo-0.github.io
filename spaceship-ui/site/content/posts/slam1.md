---
title: 'SLAM의 흐름: 센서 측정에서 pose graph까지'
description: 'SLAM을 front-end data association과 back-end optimization으로 나누고 좌표계·불확실성·loop closure를 연결해 설명한다.'
pubDate: 2023-07-06
updatedDate: 2026-08-25
category: robotics-embedded
subcategory: localization-mapping
type: study-note
tags:
  - slam
  - localization
  - mapping
  - sensor-fusion
  - robotics
researchArea: robotics-autonomous-systems
researchFeatured: true
researchOrder: 2
lang: 'ko'
---

SLAM(Simultaneous Localization and Mapping)은 미지의 환경에서 로봇의 trajectory와 map을 함께 추정하는 문제다. “위치를 알면 지도를 만들고 지도를 알면 위치를 찾는다”는 순환을 센서 관측과 확률적 최적화로 푼다.

## 상태와 관측

```text
x_t = f(x_{t-1}, u_t) + motion noise
z_t = h(x_t, m)       + measurement noise
```

`x_t`는 시각 `t`의 pose, `u_t`는 odometry 또는 control, `z_t`는 camera·LiDAR·IMU 관측, `m`은 landmark 또는 map이다. 센서는 정답을 주는 것이 아니라 noise와 bias가 있는 제약을 제공한다.

## 전체 파이프라인

```text
sensor -> calibration/time sync -> feature or scan extraction
       -> data association -> relative-pose constraints
       -> local optimization -> loop detection
       -> pose-graph optimization -> map update
```

### Front-end

raw sensor에서 대응 관계와 상대 motion을 만든다. visual SLAM은 keypoint·descriptor·optical flow를, LiDAR SLAM은 point correspondence와 scan matching을 사용할 수 있다. 가장 위험한 실패는 “대응 관계는 찾았지만 틀린 대응”이다.

### Back-end

여러 pose와 landmark 제약을 동시에 만족하도록 최적화한다. pose graph에서 node는 pose, edge는 odometry·scan matching·loop closure 같은 상대 transform과 uncertainty다. robust loss 또는 outlier rejection 없이 잘못된 loop edge가 들어가면 전체 map이 무너질 수 있다.

## Loop closure

오래 이동한 뒤 이전 장소를 다시 봤다는 제약은 누적 drift를 줄인다. 하지만 비슷하게 생긴 복도처럼 perceptual aliasing이 있으면 거짓 loop가 생긴다. appearance 후보 검색, geometric verification, temporal consistency를 단계적으로 확인한다.

## 센서별로 바뀌는 관측 가능성

- monocular camera: metric scale이 직접 관측되지 않는다.
- stereo/RGB-D: 제한 범위에서 depth를 얻지만 texture·조명·반사에 취약할 수 있다.
- 2D LiDAR: 평면 geometry에는 강하지만 높이 변화 정보가 제한된다.
- 3D LiDAR: 넓은 geometry를 측정하지만 비용·연산량과 motion distortion을 고려해야 한다.
- IMU: 고주기 motion을 보완하지만 bias가 적분되어 drift한다.

센서를 추가한다고 무조건 정확해지지 않는다. extrinsic calibration과 timestamp가 틀리면 서로 다른 시점·좌표의 관측을 결합하게 된다.

## 좌표계

ROS 2에서 흔히 다음 관계를 사용한다.

```text
map -> odom -> base_link -> sensor frames
```

`odom`은 짧은 시간 동안 연속적이지만 drift할 수 있고 `map`은 loop closure나 global localization으로 보정되며 불연속적으로 움직일 수 있다. controller가 어느 frame의 pose를 소비하는지 명확해야 한다.

## 평가

- ATE: 정렬 후 global trajectory 차이
- RPE: 일정 시간·거리 구간의 상대 motion 오차
- tracking success와 lost 횟수
- loop precision/recall
- CPU/GPU, memory, latency
- map consistency와 재localization 시간

trajectory 정렬에 scale이나 full similarity transform을 허용했는지 기록하지 않으면 ATE 숫자를 공정하게 비교할 수 없다.

## 구현 전 체크리스트

- [ ] camera/LiDAR intrinsic과 sensor-to-body extrinsic 검증
- [ ] hardware timestamp와 clock offset 확인
- [ ] dataset 좌표축·단위·ground truth convention 기록
- [ ] 정적·동적 환경을 분리 평가
- [ ] loop closure를 끈 baseline과 비교
- [ ] tracking loss 후 안전 동작과 복구 확인
- [ ] 설정 파일·commit·지도 생성 조건 보존

## 원본 자료

- [Cadena et al., Past, Present, and Future of SLAM](https://doi.org/10.1109/TRO.2016.2624754)
- [Dellaert and Kaess, Factor Graphs for Robot Perception](https://doi.org/10.1561/2300000043)
- [TUM RGB-D benchmark](https://cvg.cit.tum.de/data/datasets/rgbd-dataset)
- [KITTI odometry benchmark](https://www.cvlibs.net/datasets/kitti/eval_odometry.php)
- [evo trajectory evaluation toolkit](https://github.com/MichaelGrupp/evo)

SLAM package와 순위는 바뀌어도 measurement model, data association, uncertainty, coordinate convention과 evaluation alignment를 확인하는 원칙은 바뀌지 않는다.

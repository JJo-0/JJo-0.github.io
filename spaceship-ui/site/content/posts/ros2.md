---
title: 'ROS 2를 시스템으로 이해하기'
description: '노드·통신·QoS·executor·workspace를 연결해 ROS 2가 로봇 소프트웨어를 어떻게 구성하는지 설명한다.'
pubDate: 2023-07-13
updatedDate: 2026-08-25
category: robotics-embedded
subcategory: ros2
type: tutorial
tags:
  - ros2
  - robot-software
  - ubuntu
  - opencv
  - pcl
researchArea: robotics-autonomous-systems
researchFeatured: true
researchOrder: 3
lang: 'ko'
---

ROS 2는 Ubuntu 같은 범용 운영체제가 아니다. 로봇의 센서·인지·판단·제어 기능을 독립된 process 또는 component로 나누고, typed message와 discovery를 통해 연결하는 middleware 기반 개발 생태계다.

> 배포판과 설치 명령은 계속 바뀐다. 2026-08-25 기준 선택표와 갱신 절차는 [ROS 2 배포판과 개발환경을 고르는 법](/posts/2023-07-26-ros2-2)에서 분리해 관리한다.

## 로봇 하나를 그래프로 보기

```text
camera driver --Image--> detector --Detection2DArray--> tracker
lidar driver  --Scan----> localization --Pose-----------> planner
planner       --Path----> controller  --Twist----------> base driver
```

각 상자가 node이고 화살표가 topic이라고 생각하면 된다. 하드웨어 driver를 교체해도 message contract가 같다면 상위 perception node를 크게 바꾸지 않을 수 있다. ROS 2의 가치는 “기능을 자동으로 만들어 준다”가 아니라 **기능 사이의 계약·발견·전송·도구를 표준화한다**는 데 있다.

## 통신 수단 선택

| 수단 | 관계 | 적합한 예 |
|---|---|---|
| Topic | 지속적인 비동기 stream | camera image, joint state, velocity command |
| Service | 짧은 request/response | parameter 조회, map 저장 요청 |
| Action | 오래 걸리고 feedback·cancel이 필요한 작업 | navigation goal, manipulation task |
| Parameter | node의 runtime configuration | frame rate, threshold, frame name |

고주기 sensor stream을 service로 만들거나 몇 분 걸리는 navigation을 service로 만들면 timeout·취소·상태 표현이 어려워진다.

## QoS는 데이터의 의미다

DDS/RMW는 연결만 제공하는 것이 아니라 reliability, durability, history, deadline 같은 QoS 정책을 제공한다.

- camera·LiDAR: 최신 frame이 중요하면 best effort와 작은 queue가 지연을 줄일 수 있다.
- command·상태 전이: 전달 보장이 중요하면 reliable을 검토한다.
- 뒤늦게 들어온 subscriber가 마지막 map을 받아야 하면 transient local을 고려한다.
- publisher와 subscriber QoS가 호환되지 않으면 topic 이름이 같아도 통신하지 않는다.

```bash
ros2 topic info /camera/image_raw --verbose
ros2 topic hz /camera/image_raw
ros2 topic delay /camera/image_raw
```

## Executor와 real-time

ROS 2가 real-time 사용을 고려해 설계됐다는 말은 모든 node가 자동으로 deadline을 만족한다는 뜻이 아니다. callback이 어느 thread에서 언제 실행되는지는 executor와 callback group에 좌우된다. dynamic allocation, logging, page fault, blocking I/O도 jitter를 만든다.

제어 loop에서는 다음을 측정한다.

- callback period p50/p99/max
- deadline miss 횟수
- sensor timestamp부터 actuator command까지 end-to-end latency
- CPU load와 scheduling policy
- 통신 단절 시 safe command 도달 시간

## Package와 workspace

```text
robot_ws/
├── src/      # source packages
├── build/    # build intermediate
├── install/  # setup files and installed artifacts
└── log/      # colcon logs
```

```bash
mkdir -p robot_ws/src
cd robot_ws
rosdep install --from-paths src --ignore-src -y
colcon build --symlink-install
source install/setup.bash
```

package는 `package.xml`에 dependency와 metadata를 선언한다. 시스템 package를 수동으로 하나씩 설치한 기록보다 `rosdep` key를 선언해야 다른 장비와 CI에서 같은 환경을 복원하기 쉽다.

## TF2와 좌표계

로봇 software에서 숫자 세 개가 position인지 velocity인지보다 어느 frame의 값인지가 중요하다. TF2는 시간에 따라 변하는 coordinate transform tree를 관리한다.

```text
map -> odom -> base_link -> camera_link -> camera_optical_frame
```

tree는 연결되어야 하고 cycle이 없어야 한다. sensor message의 `frame_id`와 timestamp를 무시하면 visualization은 그럴듯해도 fusion 결과가 틀릴 수 있다.

## 첫 프로젝트의 검증 순서

1. talker/listener로 설치와 RMW를 확인한다.
2. sensor driver 하나를 실행하고 timestamp·frame·rate를 검사한다.
3. rosbag2로 입력을 고정해 perception node를 반복 검증한다.
4. launch test에서 필수 topic·service·TF가 제한 시간 안에 나타나는지 확인한다.
5. 실제 네트워크 손실과 node crash를 주입해 복구를 확인한다.
6. 마지막에 low-speed hardware test로 넘어간다.

## ROS 1과 비교할 때 피할 표현

ROS 1이 “멀티프로세스를 지원하지 않는다”거나 “C++만 지원한다”는 식의 기존 비교표는 부정확해 삭제했다. ROS 1도 여러 process와 Python client를 사용한다. 중요한 차이는 ROS 2가 DDS 기반 discovery와 QoS, lifecycle, security, multi-platform과 real-time 요구를 설계 목표로 삼았다는 점이다. 실제 지원 범위는 package와 platform별로 확인해야 한다.

## 공식 원문

- [ROS 2 documentation](https://docs.ros.org/en/rolling/)
- [ROS 2 concepts](https://docs.ros.org/en/rolling/Concepts.html)
- [ROS 2 design](https://design.ros2.org/)
- [REP-2000: releases and target platforms](https://www.ros.org/reps/rep-2000.html)
- [ROS Discourse](https://discourse.ros.org/)
- [Robotics Stack Exchange](https://robotics.stackexchange.com/)

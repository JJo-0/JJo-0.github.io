---
title: 'ROS 2 배포판과 개발환경을 고르는 법'
description: '고정된 배포판 이름을 외우는 대신 REP-2000과 공식 설치 문서로 운영체제·지원기간·아키텍처를 선택하는 방법을 정리한다.'
pubDate: 2023-07-26
updatedDate: 2026-08-25
category: robotics-embedded
subcategory: ros2
type: setup-guide
tags:
  - ros2
  - ubuntu
  - development-environment
  - dds
researchArea: robotics-autonomous-systems
researchFeatured: false
lang: 'ko'
---

ROS 2 설치 글에서 가장 빨리 낡는 부분은 “현재 지원되는 배포판” 목록이다. 이 글은 특정 이름을 영구 권장하지 않고 공식 지원표를 읽어 선택하는 절차를 남긴다.

> 확인 기준일: 2026-08-25. 현재 상태는 반드시 [REP-2000](https://www.ros.org/reps/rep-2000.html)에서 다시 확인한다.

## 2026-08-25 기준 선택

| 목적 | 권장 기준 | 이유 |
|---|---|---|
| 장기 프로젝트·제품 | ROS 2 Jazzy + Ubuntu 24.04 | LTS 조합, Jazzy 지원 기간은 2029년 5월까지 |
| 최신 기능 평가 | ROS 2 Kilted + Ubuntu 24.04 | 최신 regular release지만 지원은 2026년 11월까지 |
| 기존 Ubuntu 22.04 유지 | ROS 2 Humble | 지원은 2027년 5월까지, 새 설치라면 OS 전환 비용과 비교 |
| 다음 기능 추적 | Rolling | 계속 변하는 개발 배포판이므로 고정 제품 baseline에는 부적합 |

Iron은 2024년 11월에 지원이 끝났고 Foxy는 2023년 5월에 끝났다. 기존 장비를 당장 폐기할 이유는 아니지만 보안·버그 수정이 계속 제공된다고 전제해서는 안 된다.

## 시간이 지나도 같은 선택 절차

1. [REP-2000](https://www.ros.org/reps/rep-2000.html)에서 지원 종료일과 Tier 1 플랫폼을 확인한다.
2. 설치할 Ubuntu release와 ROS distribution의 조합을 맞춘다.
3. [공식 Installation 문서](https://docs.ros.org/en/ros2_documentation/kilted/Installation.html)의 binary package 지원 여부를 확인한다.
4. 필요한 driver·Nav2·MoveIt·ros2_control이 해당 배포판에 release됐는지 확인한다.
5. 배포판 이름과 container digest를 프로젝트에 고정하고 업그레이드 날짜를 기록한다.

## 새 Ubuntu 24.04 장비의 안전한 설치 방식

공식 deb 설치 명령은 key와 repository 구성 방식이 바뀔 수 있다. 이 글에 복사한 오래된 명령보다 아래 공식 페이지를 그대로 따른다.

- [Jazzy Ubuntu deb packages](https://docs.ros.org/en/jazzy/Installation/Ubuntu-Install-Debs.html)
- [Kilted Ubuntu deb packages](https://docs.ros.org/en/kilted/Installation/Ubuntu-Install-Debs.html)
- [ROS 2 distributions](https://docs.ros.org/en/rolling/Releases.html)

설치 후 최소 검증은 다음과 같다.

```bash
source /opt/ros/$ROS_DISTRO/setup.bash
printenv ROS_DISTRO
ros2 doctor --report
ros2 run demo_nodes_cpp talker
# 다른 terminal에서
ros2 run demo_nodes_py listener
```

workspace dependency는 임의의 `pip install`보다 `rosdep`을 우선한다.

```bash
sudo rosdep init       # 장비당 최초 1회
rosdep update
rosdep install --from-paths src --ignore-src -y
colcon build --symlink-install
```

공식 설명: [Managing Dependencies with rosdep](https://docs.ros.org/en/kilted/Tutorials/Intermediate/Rosdep.html)

## DDS/RMW 선택

“DDS를 아직 고르지 않았다”는 상태로 끝내지 말고 프로젝트 요구사항으로 결정한다.

- 동일 PC 개발: 기본 RMW로 시작
- 불안정한 Wi-Fi와 다수 노드: discovery·QoS·packet loss를 실제 네트워크에서 측정
- vendor 교체 가능성: 표준 message와 QoS profile을 유지하고 RMW별 smoke test 작성
- 실시간 제어: DDS latency뿐 아니라 executor, allocation, OS scheduling을 함께 측정

```bash
printenv RMW_IMPLEMENTATION
ros2 doctor --report
```

배포판마다 Tier 1 RMW 구성이 바뀔 수 있으므로 역시 REP-2000과 해당 release notes를 확인한다.

## Python 환경 주의

공식 binary ROS 2 package는 배포판이 사용하는 system Python과 맞춰 빌드된다. Conda나 임의 Python을 섞으면 `rclpy` 또는 binary extension 충돌이 날 수 있다. 별도 환경이 필요하면 [공식 Python packages 가이드](https://docs.ros.org/en/jazzy/How-To-Guides/Using-Python-Packages.html)를 따르고 workspace 안 virtual environment에는 `COLCON_IGNORE`를 둔다.

## 설치 기록 템플릿

```text
Checked: 2026-08-25
OS: Ubuntu 24.04.x amd64/arm64
ROS_DISTRO: jazzy
Install source: official deb repository
RMW: <implementation>
Workspace commit: <sha>
rosdep snapshot: <date>
Verification: talker/listener + project smoke test
```

이 기록이 있어야 몇 달 후 설치 실패가 문서의 노후화인지 프로젝트 변경인지 구분할 수 있다.


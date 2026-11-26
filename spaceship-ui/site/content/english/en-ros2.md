---
title: Understanding ROS 2 as a system
description: Nodes, communication, quality of service, executors and workspaces explain how ROS 2 organizes robot
  software.
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
lang: en
slug: 2023-07-13-ros2
translationKey: en-2023-07-13-ros2
translatedPosts:
  ko-KR: 2023-07-13-ros2
---

ROS 2 is a middleware-based development ecosystem. It runs on operating systems such as Ubuntu and splits a robot's sensing, perception, decision-making, and control into independent processes or components, connected through typed messages and discovery.

> Distributions and installation commands change. The [guide to choosing a ROS 2 distribution and development environment](/en/posts/2023-07-26-ros2-2/) contains the selection table dated August 25, 2026, and explains how to update that choice.

## Viewing a robot as a graph

```text
camera driver --Image--> detector --Detection2DArray--> tracker
lidar driver  --Scan----> localization --Pose-----------> planner
planner       --Path----> controller  --Twist----------> base driver
```

Each box represents a node, and each arrow a topic. A hardware driver can be replaced with few changes to the perception node if the message contract stays the same. ROS 2 **standardizes the contracts, discovery, transport, and tools** that connect independently implemented functions.

## Choosing a communication mechanism

| Mechanism | Communication pattern | Typical use |
|---|---|---|
| Topic | Continuous asynchronous stream | Camera images, joint states, velocity commands |
| Service | Short request and response | Query a parameter or request a map save |
| Action | Long-running task with feedback and cancellation | Navigation goal or manipulation task |
| Parameter | Runtime configuration of a node | Frame rate, threshold, frame name |

Using a service for a high-rate sensor stream or a navigation task that takes minutes makes it hard to express timeouts, cancellation, and progress.

## How QoS expresses what the data needs

DDS and the RMW layer offer quality-of-service policies for reliability, durability, history, and deadlines.

- For cameras and LiDAR, best effort and a small queue can reduce latency when the newest frame matters most.
- For commands and state transitions, consider reliable delivery when losing a message matters.
- Consider transient local durability when a late-joining subscriber needs the last map.
- Incompatible publisher and subscriber QoS policies can prevent communication even on the same topic.

```bash
ros2 topic info /camera/image_raw --verbose
ros2 topic hz /camera/image_raw
ros2 topic delay /camera/image_raw
```

## Executors and real-time behavior

ROS 2 accounts for real-time use in its design, but a node can still miss a deadline. The executor and callback group determine when callbacks run and on which threads. Dynamic allocation, logging, page faults, and blocking I/O also introduce jitter.

Measure the following in a control loop.

- callback period p50/p99/max
- Number of missed deadlines
- End-to-end latency from sensor timestamp to actuator command
- CPU load and scheduling policy
- Time to reach a safe command after loss of communication

## Packages and workspaces

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

A package declares its dependencies and metadata in `package.xml`. Declaring `rosdep` keys makes it easier to reproduce the environment on another machine or in CI than keeping a manual record of installed system packages.

## TF2 and coordinate frames

Three numbers alone cannot tell a robot how to interpret a position or velocity. It also needs the frame in which they are expressed. TF2 maintains a tree of coordinate transforms that change over time.

```text
map -> odom -> base_link -> camera_link -> camera_optical_frame
```

The tree must be connected and free of cycles. Ignoring a sensor message's `frame_id` and timestamp can produce plausible visualizations even when the fused result is wrong.

## A verification sequence for a first project

1. Check the installation and RMW with a talker and listener.
2. Start one sensor driver and inspect its timestamps, frame, and rate.
3. Replay fixed inputs with rosbag2 to test the perception node repeatedly.
4. In a launch test, check that required topics, services, and TF transforms appear within a deadline.
5. Introduce network loss and node crashes to verify recovery.
6. Finish with a low-speed hardware test.

## Comparing ROS 1 and ROS 2 accurately

An earlier comparison incorrectly described ROS 1 as lacking multiprocessing and supporting only C++. ROS 1 also supports multiple processes and Python clients. ROS 2 made DDS-based discovery, QoS, lifecycle management, security, multiple platforms, and real-time requirements explicit design goals. Check the support provided by each package and platform.

## Official references

- [ROS 2 documentation](https://docs.ros.org/en/rolling/)
- [ROS 2 concepts](https://docs.ros.org/en/rolling/Concepts.html)
- [ROS 2 design](https://design.ros2.org/)
- [REP-2000: releases and target platforms](https://www.ros.org/reps/rep-2000.html)
- [ROS Discourse](https://discourse.ros.org/)
- [Robotics Stack Exchange](https://robotics.stackexchange.com/)

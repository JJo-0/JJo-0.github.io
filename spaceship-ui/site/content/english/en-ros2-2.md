---
title: Choosing a ROS 2 distribution and development environment
description: Use REP-2000 and the official installation documents to match an operating system, support window and
  hardware architecture.
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
lang: en
slug: 2023-07-26-ros2-2
translationKey: en-2023-07-26-ros2-2
translatedPosts:
  ko-KR: 2023-07-26-ros2-2
---

The list of supported distributions is often the first part of a ROS 2 installation guide to go out of date. Here is how to make a choice using the official support matrix and repeat the process later.

> Snapshot checked on August 25, 2026. Use [REP-2000](https://www.ros.org/reps/rep-2000.html) to verify the current support status.

## Distribution choices as of August 25, 2026

| Goal | Suggested starting point | Rationale |
|---|---|---|
| Long-term project or product | ROS 2 Jazzy + Ubuntu 24.04 | LTS combination with Jazzy support through May 2029 |
| Evaluate new features | ROS 2 Kilted + Ubuntu 24.04 | Regular release with support through November 2026 |
| Keep an existing Ubuntu 22.04 installation | ROS 2 Humble | Supported through May 2027. For a new installation, weigh the cost of changing the OS. |
| Track upcoming features | Rolling | A continuously changing development distribution makes a poor fixed product baseline. |

Iron reached end of support in November 2024 and Foxy in May 2023. Existing hardware can remain in use, but continued upstream security and bug fixes should no longer be assumed.

## A selection process that can be repeated

1. Check end-of-support dates and Tier 1 platforms in [REP-2000](https://www.ros.org/reps/rep-2000.html).
2. Match the Ubuntu release to a compatible ROS distribution.
3. Check binary-package availability in the [official installation guide](https://docs.ros.org/en/ros2_documentation/kilted/Installation.html).
4. Verify that the required drivers, Nav2, MoveIt, and ros2_control have releases for that distribution.
5. Pin the distribution name and container digest in the project and record the upgrade date.

## Installing on a new Ubuntu 24.04 machine

The official deb installation procedure can change as repository and signing-key configuration evolves. Follow the official page below for the commands.

- [Jazzy Ubuntu deb packages](https://docs.ros.org/en/jazzy/Installation/Ubuntu-Install-Debs.html)
- [Kilted Ubuntu deb packages](https://docs.ros.org/en/kilted/Installation/Ubuntu-Install-Debs.html)
- [ROS 2 distributions](https://docs.ros.org/en/rolling/Releases.html)

After installation, run a basic check.

```bash
source /opt/ros/$ROS_DISTRO/setup.bash
printenv ROS_DISTRO
ros2 doctor --report
ros2 run demo_nodes_cpp talker
# In a second terminal
ros2 run demo_nodes_py listener
```

For workspace dependencies, start with `rosdep` before installing individual packages with `pip install`.

```bash
sudo rosdep init       # Once per machine
rosdep update
rosdep install --from-paths src --ignore-src -y
colcon build --symlink-install
```

Official guide: [Managing Dependencies with rosdep](https://docs.ros.org/en/kilted/Tutorials/Intermediate/Rosdep.html)

## Choosing a DDS implementation and RMW

Select an RMW implementation according to the project's requirements.

- Development on a single PC: start with the default RMW.
- Unstable Wi-Fi and many nodes: measure discovery, QoS behavior, and packet loss on the actual network.
- Multiple potential vendors: use standard messages and QoS profiles and run a smoke test for each RMW.
- Real-time control: measure executor behavior, allocation, and OS scheduling alongside DDS latency.

```bash
printenv RMW_IMPLEMENTATION
ros2 doctor --report
```

Tier 1 RMW support can vary by distribution. Check REP-2000 and the relevant release notes.

## Python environment considerations

Official binary ROS 2 packages are built for the distribution's system Python. Mixing Conda or another Python installation into that environment can cause conflicts with `rclpy` or binary extensions. For a separate environment, follow the [official Python packages guide](https://docs.ros.org/en/jazzy/How-To-Guides/Using-Python-Packages.html) and place `COLCON_IGNORE` in any virtual environment inside the workspace.

## Installation record template

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

A record like this helps distinguish outdated installation instructions from project changes when a setup fails months later.

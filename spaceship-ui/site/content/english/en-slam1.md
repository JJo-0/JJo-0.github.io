---
title: From sensor measurements to pose graphs in SLAM
description: Data association and back-end optimization connect coordinate frames, uncertainty and loop closure
  in a SLAM system.
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
lang: en
slug: 2023-07-06-slam1
translationKey: en-2023-07-06-slam1
translatedPosts:
  ko-KR: 2023-07-06-slam1
---

SLAM (simultaneous localization and mapping) estimates a robot's trajectory and a map of an unfamiliar environment together. Sensor observations and probabilistic optimization address the circular dependency: building a map requires knowing the robot's pose, and locating the robot requires a map.

## States and observations

```text
x_t = f(x_{t-1}, u_t) + motion noise
z_t = h(x_t, m)       + measurement noise
```

`x_t` is the pose at time `t`, `u_t` denotes odometry or control, `z_t` represents camera, LiDAR, or IMU observations, and `m` denotes landmarks or the map. A sensor provides constraints subject to noise and bias.

## The full pipeline

```text
sensor -> calibration/time sync -> feature or scan extraction
       -> data association -> relative-pose constraints
       -> local optimization -> loop detection
       -> pose-graph optimization -> map update
```

### Front-end

The front end extracts correspondences and relative motion from raw sensor data. Visual SLAM can use keypoints, descriptors, and optical flow. LiDAR SLAM can use point correspondences and scan matching. A plausible but incorrect match is a particularly dangerous failure.

### Back-end

The back end optimizes multiple pose and landmark constraints together. A pose graph represents poses as nodes. Its edges carry relative transforms and uncertainties from odometry, scan matching, or loop closure. Without robust losses or outlier rejection, a false loop edge can distort the entire map.

## Loop closure

Recognizing a previously visited place constrains accumulated drift. Similar-looking corridors can also produce false loops through perceptual aliasing. Check appearance-based candidates, geometric verification, and temporal consistency in sequence.

## What each sensor can observe

- Monocular camera: metric scale is not directly observable.
- Stereo or RGB-D: provides depth over a limited range, with possible sensitivity to texture, lighting, or reflections.
- 2D LiDAR: works well on planar geometry but captures limited information about changes in height.
- 3D LiDAR: measures a wider range of geometry, with trade-offs in cost, computation, and motion distortion.
- IMU: captures high-rate motion, but integrated bias causes drift.

Adding a sensor does not guarantee better accuracy. Inaccurate extrinsics or timestamps cause fusion to combine observations from different frames or times.

## Coordinate frames

ROS 2 commonly uses the following relationship.

```text
map -> odom -> base_link -> sensor frames
```

`odom` is locally continuous but can drift. Loop closure or global localization corrects `map`, which can introduce discontinuous jumps. Specify the frame of the pose used by the controller.

## Evaluation

- ATE: difference between global trajectories after alignment
- RPE: relative motion error over a fixed time or distance interval
- Tracking success and number of tracking losses
- loop precision/recall
- CPU/GPU, memory, latency
- Map consistency and time to relocalize

Report whether trajectory alignment allowed scale changes or a full similarity transform. Otherwise ATE values are difficult to compare fairly.

## Before implementation

- [ ] Verify camera or LiDAR intrinsics and sensor-to-body extrinsics.
- [ ] Check hardware timestamps and clock offsets.
- [ ] Record dataset axes, units, and ground-truth conventions.
- [ ] Evaluate static and dynamic environments separately.
- [ ] Compare against a baseline with loop closure disabled.
- [ ] Check safe behavior and recovery after tracking loss.
- [ ] Keep the configuration, commit, and map-generation conditions.

## Original sources

- [Cadena et al., Past, Present, and Future of SLAM](https://doi.org/10.1109/TRO.2016.2624754)
- [Dellaert and Kaess, Factor Graphs for Robot Perception](https://doi.org/10.1561/2300000043)
- [TUM RGB-D benchmark](https://cvg.cit.tum.de/data/datasets/rgbd-dataset)
- [KITTI odometry benchmark](https://www.cvlibs.net/datasets/kitti/eval_odometry.php)
- [evo trajectory evaluation toolkit](https://github.com/MichaelGrupp/evo)

SLAM packages and rankings change. The measurement model, data association, uncertainty, coordinate conventions, and evaluation alignment remain central to interpreting any result.

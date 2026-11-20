---
title: SLAM, Part 2
description: A second set of study notes reviewing the stages of simultaneous localization and mapping.
pubDate: 2023-07-06
category: robotics-embedded
subcategory: localization-mapping
type: study-note
tags:
- slam
- localization
- sensor-fusion
- kalman-filter
- particle-filter
researchArea: robotics-autonomous-systems
researchFeatured: false
lang: en
slug: 2023-07-06-slam2
translationKey: en-2023-07-06-slam2
translatedPosts:
  ko-KR: 2023-07-06-slam2
---

I wrote this post to review the stages of a SLAM pipeline.

# What is SLAM?
SLAM stands for **simultaneous localization and mapping**. A robot estimates its own pose while building a map.
1. If a moving robot knows its pose, it can build a map.
2. If it has a map, it can estimate its pose.
SLAM solves these two problems together.

# The SLAM pipeline
The pipeline has three main stages.
1. Receive sensor data.
2. Estimate the robot's pose.
3. Build a map.

## Sensor data
For more on the sensors, see the [first SLAM article](/en/posts/2023-07-06-slam1/). 🤗

## Estimating the robot's pose
**The robot estimates its pose from the observations it receives.**
A walkthrough of the principle: [MATLAB's SLAM explanation](https://www.youtube.com/watch?v=Fw8JQ5Q-ZwU)
The video gives an accessible introduction.

**Processing sensor data**
Raw measurements contain errors. Typical processing steps include (1) noise reduction, (2) data registration, and (3) interpolation.
The details depend on the sensor. Vision, LiDAR, and IMU data each merit a separate discussion.

**Robot pose estimation**
Several estimation algorithms can be used for this stage.

1. EKF (Extended Kalman Filter)
2. UKF (Unscented Kalman Filter)
3. PF (Particle Filter)
4. Other estimators.

I plan to cover these methods in a later post.

---

---
title: 'Human and Robotics 0: A Map for Reading Papers One Symbol at a Time'
description: Beginning a study of human pose estimation, motion prediction and collaborative
  robot safety by unpacking the terms and equations in research papers.
pubDate: 2026-10-26
publicationTimeZone: Asia/Seoul
slug: human-motion-study-0
category: vision-perception-neuroscience
subcategory: human-motion
type: study-note
tags:
- human-pose-estimation
- motion-prediction
- human-robot-interaction
- uncertainty
researchArea: vision-pose-human-perception
researchFeatured: true
researchOrder: 5
lang: en
series:
  id: human-motion-study
  order: 0
draft: false
translationKey: series-human-motion-study-0-20261109
translatedPosts:
  ko-KR: human-motion-study-0
showComments: false
---



In December 2024, I began studying human motion prediction. My starting point was a question about people and collaborative robots working together: if someone suddenly runs toward a robot, can the robot recognize that movement and stop or avoid them? That question led me toward predicting human behavior and paths, and recognizing intent in interactions with robots, including humanoids and autonomous mobile robots. I would like to introduce that short journey.

“Human and Robotics” is a series in which I follow this question by reading related papers one at a time. I will study how to estimate a person’s current pose, predict their future movements, and connect those predictions to a robot’s actions.

## First, copyright in the original text and figures

The text, tables, figures and code in a paper belong to their respective rights holders. **Attribution alone does not authorize every form of reuse**, so I check the license and any permission required for each item. The detailed principles are set out in the [copyright, quotation and reuse policy](/policies/copyright/).

For paper figures needed in an explanation, I record the authors, paper title, figure number, original link and basis for use, and identify any translation or annotations I add. When the terms of use for a figure cannot be confirmed, I link to the original. I distinguish quotations from my own commentary and do not reproduce an entire PDF or a complete translation of a paper.

## What I will study

- **Pose estimation and human body representations:** 2D and 3D poses, multiple cameras, skeletons and meshes, joints and coordinate frames.
- **State estimation and motion prediction:** filters, kinematics, human trajectories and future poses.
- **Uncertainty:** observation errors, predictive distributions and calibration, and the conditions under which predictions can be trusted.
- **Safety zones and control:** distances between people and robots, speed adjustment, stopping and avoidance.
- **Verification and standards:** reachability, safety conditions and the assumptions under which those conditions hold.
- **Implementation and reproduction:** datasets, evaluation metrics, execution speed and the behavior of actual code.

When a paper requires mathematics or background concepts, I will return to those foundations and explain them alongside the paper.

## How I will read and record

**I begin by listing unfamiliar words and symbols.** I look up and record their meanings, and keep questions about anything I do not understand. I work through each paper in this order:

1. **Problem and background:** what it aims to solve and where earlier methods fall short.
2. **Figures and structure:** the meanings of axes, legends and arrows, and each module’s inputs and outputs.
3. **Every symbol in the equations:** letters, subscripts and operators; vector and matrix dimensions; units and coordinate frames.
4. **Omitted calculations:** intermediate steps between equations, assumptions and theorems, and small examples I calculate myself. I also read the relevant appendices and proofs.
5. **Experiments and code:** the comparison conditions and results, and how the equations are implemented in code.

If one paper needs several entries, I will divide it accordingly. I distinguish results reported in a paper from results I obtain by running code myself, and identify any derivation or interpretation I add. I also keep questions that remain unresolved.

Starting with this entry, I hope to build a record of reading papers one at a time and **explaining every symbol in words I understand**.

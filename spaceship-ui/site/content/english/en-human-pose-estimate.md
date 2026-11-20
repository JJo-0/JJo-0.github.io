---
title: Coordinate frames for comparing 3D human pose estimates
description: Compare the inputs and outputs of MotionAGFormer, HybrIK and TRAM across 2D-to-3D lifting, mesh recovery
  and world-space motion recovery.
pubDate: 2025-02-07
updatedDate: 2026-08-25
category: vision-perception-neuroscience
subcategory: human-pose
type: paper-review
tags:
- 3d-human-pose-estimation
- transformer
- graph-neural-network
- motion-reconstruction
researchArea: vision-pose-human-perception
researchFeatured: true
researchOrder: 1
lang: en
slug: 2025-02-07-human-pose-estimate
translationKey: en-2025-02-07-human-pose-estimate
translatedPosts:
  ko-KR: 2025-02-07-human-pose-estimate
---

“3D human pose estimation” covers several tasks. Lifting 2D joints into camera-relative 3D, recovering an SMPL mesh from RGB, and recovering a person's world-space trajectory with a moving camera all require different inputs, outputs, and metrics. This article groups the papers by the question each model answers.

> Sources checked on August 25, 2026. Compare numerical results within the protocols defined by each paper. The links lead to CVF, ECVA, DOI records, and the authors' repositories where available.

## Three estimation tasks

| Task | Typical input | Output coordinates | Typical error metric |
|---|---|---|---|
| 2D-to-3D pose lifting | 2D joints per frame | Root-relative 3D joints | MPJPE, PA-MPJPE |
| Human mesh recovery | RGB image/video | camera-relative joints + body mesh | MPJPE, PA-MPJPE, PVE |
| Global motion recovery | moving-camera video | world-space trajectory + local body motion | global position/orientation/trajectory error |

The first task can omit global translation and scale. The second includes body surface and shape, though position in the world can remain ambiguous. The third also requires camera motion and metric scale.

## MotionAGFormer lifts a sequence of 2D joints into 3D

[MotionAGFormer](https://openaccess.thecvf.com/content/WACV2024/html/Mehraban_MotionAGFormer_Enhancing_3D_Human_Pose_Estimation_With_a_Transformer-GCNFormer_Network_WACV_2024_paper.html) estimates 3D joints from a time series of 2D joints. A Transformer stream models global joint relationships. A GCNFormer stream models local connections in the skeleton graph. The model adaptively fuses the two representations.

- Paper: [WACV 2024 CVF Open Access](https://openaccess.thecvf.com/content/WACV2024/papers/Mehraban_MotionAGFormer_Enhancing_3D_Human_Pose_Estimation_With_a_Transformer-GCNFormer_Network_WACV_2024_paper.pdf)
- Code: [TaatiTeam/MotionAGFormer](https://github.com/TaatiTeam/MotionAGFormer)
- Reported MotionAGFormer-B P1 errors: `38.4 mm` on Human3.6M and `16.2 mm` on MPI-INF-3DHP

Check the metric and protocol separately for each dataset. End-to-end accuracy also depends heavily on whether the 2D inputs are ground-truth joints or detector predictions.

## HybrIK combines joint accuracy with mesh structure

[HybrIK](https://openaccess.thecvf.com/content/CVPR2021/html/Li_HybrIK_A_Hybrid_Analytical-Neural_Inverse_Kinematics_Solution_for_3D_Human_CVPR_2021_paper.html) proposes hybrid inverse kinematics to map 3D joints to body-part rotations. It solves swing rotation analytically from the joints and learns twist rotation from visual cues. The result is a mesh that represents pose and body shape.

- Paper: [CVPR 2021 CVF Open Access](https://openaccess.thecvf.com/content/CVPR2021/papers/Li_HybrIK_A_Hybrid_Analytical-Neural_Inverse_Kinematics_Solution_for_3D_Human_CVPR_2021_paper.pdf)
- Code: [Jeff-sjtu/HybrIK](https://github.com/Jeff-sjtu/HybrIK)
- The paper emphasizes combining pixel-aligned 3D joints with a plausible parametric body structure.

PVE and MPJPE measure error on different outputs. A pose-only model that produces no mesh cannot be compared directly on PVE.

## TRAM recovers world-space motion from a moving camera

[TRAM](https://www.ecva.net/papers/eccv_2024/papers_ECCV/html/1796_ECCV_2024_paper.php) appeared at ECCV 2024, correcting the 2025 date given in an earlier version of this article. The authors adapt SLAM to handle moving people and recover camera motion and scene scale. They combine these estimates with VIMO's local body motion to reconstruct the world-space trajectory.

- Paper: [ECCV 2024 ECVA PDF](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/01796.pdf)
- Project: [TRAM project page](https://yufu-wang.github.io/tram4d/)
- Code: [yufu-wang/tram](https://github.com/yufu-wang/tram)

Camera-relative MPJPE captures only part of TRAM's output. Evaluation also covers drift that makes a walking person appear to walk in place, separation of camera and human motion, and metric scale.

## Why a monocular image admits multiple 3D poses

Different 3D poses can produce similar 2D projections. Occlusion, foreshortening, and left–right symmetry make them harder to distinguish. A model narrows the possible solutions using learned body priors and temporal smoothness. Details absent from the image remain inferred.

For robot safety or medical measurements, consider confidence, uncertainty, and out-of-distribution signals alongside the estimated coordinates.

## What to record in a fair comparison

```text
input | detector | temporal window | output representation | coordinate frame
training datasets | test protocol | metric | params/MACs | FPS/hardware
occlusion handling | multi-person tracking | license | code/model version
```

“RGB input” leaves several choices unspecified. Record the 2D detector, bounding-box crop, test-time augmentation, and whether the evaluation uses root alignment or Procrustes alignment.

## Choosing an approach for a robotics project

- If only joint directions matter, start by measuring the latency of a pose-lifting model.
- If collision distances and body volume matter, consider calibrated depth or a mesh with uncertainty estimates.
- To recover world-space human trajectories from a moving camera, choose an approach that estimates camera pose and scale together.
- For a safety stop, the ability to detect failure under occlusion or loss of view matters more than mean MPJPE.

## Reproduction steps

1. Pin the commit and weight checksum from the paper's official repository.
2. Check the dataset license and evaluation protocol.
3. Report results with supplied 2D keypoints separately from those with your detector.
4. Keep camera-relative and world-space metrics separate.
5. On the same video, measure latency, peak VRAM, and throughput as the number of people increases.
6. Document failures under occlusion, motion blur, and camera motion.

As models change, the same questions still make comparisons meaningful. Specify the **input, representation, coordinate system, alignment, and evaluation protocol** before interpreting a ranking.

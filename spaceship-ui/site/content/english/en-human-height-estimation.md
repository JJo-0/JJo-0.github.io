---
title: Estimating human height with a single camera
description: Three source papers illustrate the assumptions and error sources of geometric, regression and AI methods
  for estimating height with one CCTV camera.
pubDate: 2024-12-26
updatedDate: 2026-08-25
category: vision-perception-neuroscience
subcategory: human-measurement
type: paper-review
tags:
- human-height-estimation
- monocular-vision
- camera-calibration
- object-detection
researchArea: vision-pose-human-perception
researchFeatured: true
researchOrder: 3
lang: en
slug: 2024-12-26-human-height-estimation
translationKey: en-2024-12-26-human-height-estimation
translatedPosts:
  ko-KR: 2024-12-26-human-height-estimation
---

A single CCTV image provides no absolute length reference. A person closer to the camera appears larger, so equal pixel heights can correspond to different physical heights. Monocular height estimation needs information about **camera geometry**, the **ground plane**, **head and foot locations**, and a **reference for metric scale**. An AI detector can locate the head and feet more reliably, but the geometric ambiguity remains.

> Sources checked on August 25, 2026. The bibliographic details and figures below were checked against publisher or DOI records. Review the DOI for corrections and the dataset's terms of use before implementation.

## Main findings

- For a fixed camera with known or estimable height, tilt, and focal length, classical photogrammetry or a small regression model offers an interpretable estimate.
- An AI detector can help under difficult surveillance conditions. Evaluate detection performance separately from height error.
- The studies use different distances, field-of-view regions, poses, age distributions, and calibration methods. Their MAEs cannot be ranked directly.
- Occluded feet, a person standing off the assumed ground plane, and uncorrected lens distortion can each introduce systematic bias.

## The projection equation

A pinhole camera projects a 3D point onto the image according to the following relation.

```text
s [u, v, 1]ᵀ = K [R | t] [X, Y, Z, 1]ᵀ
```

`K` contains intrinsics such as focal length and principal point. `R, t` are the extrinsics relating world and camera coordinates. Head and foot pixels alone cannot determine height because both depth `Z` and physical scale are unknown. Each study below constrains these unknowns differently.

## Three studies compared

| Study | Input and reference | Method | Reported result | Interpretation |
|---|---|---|---|---|
| Lee et al. (2008) | Fixed CCTV, reference points in the scene | Project a virtual 3D ruler after linear and nonlinear 3D–2D calibration | The abstract reports greater stability during data convergence than earlier methods | A photogrammetry study. The earlier references to YOLO and OpenPose have been removed. |
| Li et al. (2015) | Head and foot observations of people walking | Fit focal length, tilt angle, and camera height by nonlinear regression | Approximately 1.39 cm MAE against ground truth | Assumes a fixed, elevated camera with a small downward tilt. |
| Ratthi et al. (2024) | Monocular surveillance video and a custom height dataset | Use YOLOv7-OA and attention to detect occluded people, then estimate height by field-of-view region | The paper highlights and conference summary report MAEs of 0.02–0.8 cm across regions | The 1.39 cm figure comes from a different dataset. The two results do not establish a general ranking. |

## 1. Reference points and a virtual ruler in Lee et al. (2008)

The authors use reference points in the scene to calibrate the relationship between 3D space and the 2D image. They then project a virtual 3D ruler into the image. The measurement depends on **on-site calibration and photogrammetry**.

- Source: [PubMed record and abstract](https://pubmed.ncbi.nlm.nih.gov/18096339/)
- DOI: [10.1016/j.forsciint.2007.10.008](https://doi.org/10.1016/j.forsciint.2007.10.008)
- Citation: Joong Lee, Eung-Dae Lee, Hyun-Oh Tark, Jin-Woo Hwang, Do-Young Yoon, *Forensic Science International* 177(1), 17–23, 2008

The method suits forensic analysis when investigators can obtain reference points in the scene. A moving camera or an inaccessible scene makes direct application difficult.

## 2. Three-parameter regression in Li et al. (2015)

The method assumes a typical surveillance camera mounted high and angled slightly downward. It fits just three camera parameters to head and foot observations: focal length `f`, tilt `θ`, and camera height `Hc`. This avoids the sensitivity of vanishing-line detection to noise.

- Open-access paper: [Springer Nature](https://link.springer.com/article/10.1186/s13640-015-0086-1)
- DOI: [10.1186/s13640-015-0086-1](https://doi.org/10.1186/s13640-015-0086-1)
- Reported error against ground truth: approximately `1.39 cm MAE`

The result applies to the mounting conditions and observations in the paper. Camera shake, uneven ground, and occlusion at the foot–ground contact point can change the error.

## 3. Improving detection in Ratthi et al. (2024)

The authors use a monocular camera and combine YOLOv7-OA with attention to detect people under occlusion. They examine camera height, deflection angle, field of view, age, and sex alongside the geometry.

- Publisher: [Measurement, article 115133](https://www.sciencedirect.com/science/article/pii/S0263224124010182)
- DOI: [10.1016/j.measurement.2024.115133](https://doi.org/10.1016/j.measurement.2024.115133)
- Authors' conference summary: [ICVGIP 2024 PDF](https://icvgip.in/2024/downloads/185_YFS.pdf)

The conference summary gives `0.02–0.8 cm MAE` across field-of-view regions. Its two pages provide too little detail about the data split, sample size, repeated trials, and generalization to assess the result independently. These figures are **reported by the authors**.

## Sources of implementation error

1. **Detection error.** How does the bounding box handle hair, shoes, or occlusion?
2. **Posture error.** When a person bends their knees or walks, the vertical head-to-foot distance differs from standing height.
3. **Geometric error.** Estimates of `K`, distortion, camera pose, or the ground plane may be wrong.
4. **Scale error.** A reference length or camera mounting height may be inaccurate.
5. **Evaluation error.** Assigning adjacent frames of the same person to both training and test sets can inflate apparent performance.

## Designing a reproducible evaluation

- Separate training, validation, and test data by person and recording session.
- Report MAE and bias by distance, field-of-view region, occlusion, pose, and age group.
- Include a 95% interval and the within-person variance over repeated measurements alongside the mean error.
- Run an oracle experiment with ground-truth head and foot locations separately from the end-to-end detector experiment.
- Perturb the calibration parameters slightly and measure sensitivity.

## What the comparison leaves open

The available results do not identify a single best method for every setting. A fair next experiment would run the `virtual ruler`, `three-parameter regression`, and `AI detector + geometry` on the same video and data split. That comparison could show whether better detection actually reduces height error.

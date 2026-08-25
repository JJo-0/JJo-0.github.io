---
title: '단안 카메라 사람 키 추정: 기하학, 회귀, AI의 차이'
description: 'CCTV 한 대로 사람의 키를 추정할 때 필요한 가정과 오차원을 세 편의 원문을 기준으로 비교한다.'
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
lang: 'ko'
---

한 장의 CCTV 영상에는 절대 길이의 기준이 없다. 같은 픽셀 높이라도 카메라와 가까운 사람은 더 크게 보인다. 따라서 단안 카메라로 키를 추정하려면 최소한 **카메라 기하**, **바닥면**, **머리·발 위치**, 그리고 **미터 단위로 환산할 기준** 중 일부가 필요하다. AI 탐지기는 머리와 발을 더 안정적으로 찾을 수 있지만 이 기하학적 모호성을 저절로 없애지는 않는다.

> 검증 기준일: 2026-08-25. 아래의 서지 정보와 수치는 출판사·DOI 원문에서 확인했다. 구현 전에는 DOI의 최신 정정 사항과 데이터 이용 조건을 다시 확인해야 한다.

## 먼저 결론

- 카메라가 고정되고 설치 높이·기울기·초점 거리를 추정할 수 있다면 고전적 photogrammetry 또는 간소화한 회귀 모델이 설명 가능성이 높다.
- 사람 탐지가 어려운 실제 감시 환경에서는 AI 검출기가 유용하지만, 검출 성능과 키 추정 오차를 분리해서 평가해야 한다.
- 논문 간 MAE는 촬영 거리, FOV 구역, 자세, 연령 구성, calibration 방식이 다르므로 숫자만 직접 순위화하면 안 된다.
- 발이 가려지거나 사람이 바닥면에 서 있지 않거나 렌즈 왜곡이 보정되지 않으면 추정값은 체계적으로 틀어질 수 있다.

## 문제를 식으로 보기

핀홀 카메라에서 3차원 점은 다음 관계로 영상에 투영된다.

```text
s [u, v, 1]ᵀ = K [R | t] [X, Y, Z, 1]ᵀ
```

`K`는 초점 거리와 주점 같은 내부 파라미터, `R, t`는 세계 좌표계와 카메라 좌표계 사이의 외부 파라미터다. 머리와 발 픽셀만으로 실제 키를 구할 수 없는 이유는 깊이 `Z`와 실제 길이의 scale이 동시에 미지수이기 때문이다. 아래 연구들은 이 미지수를 서로 다른 방식으로 제한한다.

## 세 연구 비교

| 연구 | 입력과 기준 | 핵심 방법 | 원문이 보고한 결과 | 읽을 때 주의할 점 |
|---|---|---|---|---|
| Lee et al. (2008) | 고정 CCTV, 촬영 영역의 기준점 | 3D–2D 선형·비선형 calibration 후 영상에 3D virtual ruler 투영 | 초록은 기존 방법보다 data-convergence 구간에서 더 안정적이라고 보고 | 딥러닝 연구가 아니다. 기존 글의 YOLO·OpenPose 설명은 삭제했다. |
| Li et al. (2015) | 걷는 사람의 머리·발 관측값 | 초점 거리·tilt angle·camera height 세 변수만 nonlinear regression으로 추정 | ground truth 대비 약 1.39 cm MAE | 고정·고위치·낮은 tilt라는 설치 가정에 의존한다. |
| Ratthi et al. (2024) | 단안 감시 영상, 자체 height dataset | YOLOv7-OA와 attention으로 가림 상황의 사람을 검출하고 FOV 조건별 높이 추정 | 논문 highlights와 conference summary는 FOV 영역별 0.02–0.8 cm MAE를 보고 | 1.39 cm와의 비교는 동일 데이터셋 재현 결과가 아니므로 보편적 우월성으로 해석하면 안 된다. |

## 1. 기준점과 가상 자: Lee et al. (2008)

이 연구는 촬영 영역의 기준점을 이용해 3차원 공간과 2차원 영상의 관계를 보정하고, 그 관계로 만든 가상의 3D 자를 영상에 투영한다. 핵심은 사람 검출 모델이 아니라 **현장 calibration과 photogrammetry**다.

- 원문: [PubMed 서지·초록](https://pubmed.ncbi.nlm.nih.gov/18096339/)
- DOI: [10.1016/j.forsciint.2007.10.008](https://doi.org/10.1016/j.forsciint.2007.10.008)
- 정확한 서지: Joong Lee, Eung-Dae Lee, Hyun-Oh Tark, Jin-Woo Hwang, Do-Young Yoon, *Forensic Science International* 177(1), 17–23, 2008

원 논문의 방법은 현장 기준점을 확보할 수 있는 법과학적 분석에는 적합하지만, 카메라가 움직이거나 현장 측량을 할 수 없는 상황에는 그대로 적용하기 어렵다.

## 2. 세 변수 회귀: Li et al. (2015)

일반적인 감시 카메라가 높은 위치에서 약간 아래를 향한다는 조건을 이용한다. 전체 camera model을 모두 추정하는 대신 초점 거리 `f`, 기울기 `θ`, 카메라 높이 `Hc`만 머리·발 관측값에 맞춘다. vanishing line 검출의 노이즈 민감성을 피한다는 것이 설계의 핵심이다.

- 오픈 액세스 원문: [Springer Nature](https://link.springer.com/article/10.1186/s13640-015-0086-1)
- DOI: [10.1186/s13640-015-0086-1](https://doi.org/10.1186/s13640-015-0086-1)
- 보고 결과: ground truth 대비 약 `1.39 cm MAE`

이 결과는 논문이 사용한 설치 조건과 관측 데이터 안에서 해석해야 한다. 카메라가 흔들리거나 바닥이 평면이 아니거나 발 접점이 가려진 장면까지 1.39 cm가 보장된다는 의미는 아니다.

## 3. 검출을 강화한 AI 파이프라인: Ratthi et al. (2024)

이 연구는 단안 카메라라는 조건을 유지하면서 YOLOv7-OA와 attention을 이용해 가림에 강한 사람 영역 검출을 시도한다. 카메라 높이, deflection angle, FOV, 연령과 성별 조건을 분석한 점이 이전의 순수 기하 접근과 다르다.

- 출판사 원문: [Measurement, article 115133](https://www.sciencedirect.com/science/article/pii/S0263224124010182)
- DOI: [10.1016/j.measurement.2024.115133](https://doi.org/10.1016/j.measurement.2024.115133)
- 저자 제공 conference summary: [ICVGIP 2024 PDF](https://icvgip.in/2024/downloads/185_YFS.pdf)

conference summary는 FOV 영역에 따라 `0.02–0.8 cm MAE`를 제시하지만 2쪽 요약본만으로는 데이터 분할, 표본 수, 반복 실험과 일반화 성능을 충분히 판단하기 어렵다. 따라서 이 글은 해당 숫자를 독립적으로 재현된 사실이 아니라 **저자가 보고한 결과**로 기록한다.

## 실제 구현에서 분리해야 할 오차

1. **검출 오차** — bounding box가 머리카락·신발·가림을 어떻게 처리하는가.
2. **자세 오차** — 무릎을 굽히거나 걷는 중이면 머리–발 수직 길이가 신장과 다르다.
3. **기하 오차** — `K`, 왜곡계수, camera pose, 바닥 평면 추정이 틀릴 수 있다.
4. **scale 오차** — 실제 길이를 알려 주는 기준점 또는 알려진 camera height가 부정확할 수 있다.
5. **평가 오차** — 같은 사람의 인접 프레임이 train/test에 함께 들어가면 성능이 과대평가된다.

## 재현 가능한 평가 설계

- 사람 단위와 촬영 세션 단위로 train/validation/test를 분리한다.
- 거리·FOV 구역·가림·자세·연령대별 MAE와 bias를 함께 보고한다.
- 평균 오차뿐 아니라 95% 구간과 사람별 반복 측정 분산을 기록한다.
- 완벽한 head/foot 좌표를 넣은 oracle 실험과 detector 출력을 넣은 end-to-end 실험을 분리한다.
- calibration parameter에 작은 노이즈를 주어 민감도를 측정한다.

## 이 글에서 확정하지 않는 것

이 비교만으로 특정 방법이 모든 환경에서 최고라고 결론 내리지 않는다. 다음 단계는 동일 영상과 동일 분할에서 `virtual ruler`, `three-parameter regression`, `AI detector + geometry`를 나란히 구현하는 것이다. 그래야 검출기의 개선이 실제 키 오차 감소로 이어지는지 판단할 수 있다.

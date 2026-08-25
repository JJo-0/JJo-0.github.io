---
title: '카메라 Calibration: 좌표계에서 재투영 오차까지'
description: '월드·카메라·정규화 영상·픽셀 좌표의 변환과 intrinsic, extrinsic, distortion을 하나의 투영식으로 정리한다.'
pubDate: 2025-03-18
updatedDate: 2026-08-25
category: vision-perception-neuroscience
subcategory: camera-geometry
type: study-note
tags:
  - camera-calibration
  - coordinate-systems
  - intrinsic-parameters
  - extrinsic-parameters
researchArea: vision-pose-human-perception
researchFeatured: true
researchOrder: 4
lang: 'ko'
---

카메라 calibration의 목적은 “3차원 점이 왜 이 픽셀에 보였는가”를 설명하는 파라미터를 찾는 것이다. 내부 파라미터, 카메라 자세, 렌즈 왜곡을 분리해서 이해하면 pose estimation, SLAM, 사람 키 추정에서 같은 좌표계 혼동을 반복하지 않게 된다.

## 네 좌표계

![월드·카메라·영상·픽셀 좌표계](/assets/posts/calibration/calibration-coordinate-system.svg)

1. **World** `Pw=[Xw,Yw,Zw,1]ᵀ`: 물체와 카메라가 놓인 공통 기준.
2. **Camera** `Pc=[Xc,Yc,Zc]ᵀ`: 광학 중심을 원점으로 한 좌표.
3. **Normalized image** `[x,y]=[Xc/Zc,Yc/Zc]`: 초점 거리와 픽셀 단위를 적용하기 전 투영.
4. **Pixel** `[u,v]`: 센서에서 실제로 읽는 영상 좌표.

월드 점을 픽셀로 옮기는 기본식은 다음과 같다.

```text
s [u, v, 1]ᵀ = K [R | t] [Xw, Yw, Zw, 1]ᵀ
```

`[R|t]`는 world에서 camera로 가는 rigid transform이고 `K`는 normalized image를 pixel로 바꾼다. rigid transform은 회전과 이동이며 **scale은 포함하지 않는다**. 서로 다른 scale까지 허용하면 similarity transform이다.

## Extrinsic: 카메라가 어디를 보는가

```text
Pc = R Pw + t
```

여기서 `R`은 3×3 회전행렬, `t`는 3×1 이동벡터다. `t`를 단순히 “world에서 본 카메라 위치”라고 읽으면 부호를 틀리기 쉽다. world 좌표의 camera center를 `C`라 하면 `t=-RC`다. 라이브러리 함수가 어느 방향의 transform을 반환하는지 항상 문서로 확인해야 한다.

## Intrinsic: 광선을 픽셀로 바꾸는 법

```text
K = [ fx  s  cx
       0 fy  cy
       0  0   1 ]
```

- `fx, fy`: 픽셀 단위 초점 거리
- `cx, cy`: principal point
- `s`: axis skew. 현대 카메라에서는 대개 0으로 둔다.

화각이 같더라도 해상도가 바뀌면 픽셀 단위 `fx`, `fy`, `cx`, `cy`도 함께 바뀐다. calibration한 해상도와 실제 추론 해상도가 다르면 `K`를 같은 비율로 조정해야 한다.

## Distortion: 핀홀 모델과 실제 렌즈의 차이

일반적인 OpenCV pinhole model은 radial `k1,k2,k3...`와 tangential `p1,p2` 계수를 사용한다. fisheye 카메라는 별도 모델이 더 적합할 수 있다. 계수 개수를 늘리면 calibration image에는 더 잘 맞아도 실제 시야에 과적합될 수 있으므로, 사용한 모델과 flag를 결과와 함께 저장한다.

## Calibration 절차

1. 크기를 아는 checkerboard 또는 ChArUco board를 준비한다.
2. 화면 중앙뿐 아니라 모서리·거리·기울기를 다양하게 촬영한다.
3. corner를 sub-pixel 수준으로 검출한다.
4. object points와 image points로 `K`, distortion, 각 장면의 `R,t`를 최적화한다.
5. calibration에 쓰지 않은 영상에서 undistortion과 reprojection error를 확인한다.

```python
ok, K, dist, rvecs, tvecs = cv2.calibrateCamera(
    object_points,
    image_points,
    image_size,
    None,
    None,
)

projected, _ = cv2.projectPoints(
    object_points[0], rvecs[0], tvecs[0], K, dist
)
```

## 평균 reprojection error만 보면 안 되는 이유

평균이 작아도 특정 모서리, 특정 거리, 특정 촬영 자세에서 오차가 클 수 있다. 다음을 함께 확인한다.

- 이미지별 RMS와 전체 point error 분포
- 화면 위치에 따른 residual vector map
- 사용 거리 범위 밖에서의 검증
- board가 한 평면·한 자세에만 몰리지 않았는지
- focus/zoom이 calibration 이후 바뀌지 않았는지

사람 키 추정이라면 0.2 pixel의 차이가 몇 cm가 되는지 거리별 sensitivity까지 계산해야 한다. SLAM이라면 작은 calibration bias가 긴 trajectory에서 누적될 수 있다.

## 저장해야 할 실험 정보

- 카메라·렌즈 모델, 해상도, focus/zoom
- board 규격과 square 길이 단위
- OpenCV 버전과 calibration flags
- `K`, distortion coefficients, image size
- 이미지별 reprojection error와 제외 기준
- 좌표계 축 방향과 transform convention

## 공식 원문

- [OpenCV camera calibration tutorial](https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html)
- [OpenCV calibrateCamera API](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html)
- [Zhang, A Flexible New Technique for Camera Calibration](https://doi.org/10.1109/34.888718)


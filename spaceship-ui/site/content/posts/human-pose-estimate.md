---
title: '3D Human Pose Estimation을 비교하는 좌표계'
description: '2D-to-3D lifting, mesh recovery, world-space motion recovery를 구분하고 MotionAGFormer·HybrIK·TRAM의 입력과 출력을 원문 기준으로 비교한다.'
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
lang: 'ko'
---

“3D human pose estimation”이라는 이름 아래에는 서로 다른 문제가 섞여 있다. 2D 관절을 camera-relative 3D 관절로 올리는 모델과, RGB에서 SMPL mesh를 복원하는 모델, 움직이는 카메라 영상에서 사람의 world-space trajectory까지 복원하는 모델은 입력·출력·평가지표가 다르다. 이 글은 논문을 많이 나열하는 대신 비교 가능한 세 문제로 나눈다.

> 검증 기준일: 2026-08-25. 결과 수치는 논문이 정의한 protocol 안에서만 비교한다. 원문 링크는 CVF·ECVA·DOI·저자 저장소를 우선했다.

## 세 가지 문제

| 문제 | 대표 입력 | 출력 좌표 | 대표 오차 |
|---|---|---|---|
| 2D-to-3D pose lifting | frame별 2D joints | root-relative 3D joints | MPJPE, PA-MPJPE |
| Human mesh recovery | RGB image/video | camera-relative joints + body mesh | MPJPE, PA-MPJPE, PVE |
| Global motion recovery | moving-camera video | world-space trajectory + local body motion | global position/orientation/trajectory error |

첫 번째는 scale과 global translation을 생략할 수 있다. 두 번째는 몸 표면과 shape를 포함하지만 world 안에서 어디에 있는지는 여전히 모호할 수 있다. 세 번째는 camera motion과 metric scale까지 풀어야 한다.

## MotionAGFormer: 2D 관절 시퀀스를 3D로 lifting

[MotionAGFormer](https://openaccess.thecvf.com/content/WACV2024/html/Mehraban_MotionAGFormer_Enhancing_3D_Human_Pose_Estimation_With_a_Transformer-GCNFormer_Network_WACV_2024_paper.html)는 temporal 2D joints를 받아 3D joints를 추정한다. Transformer stream은 전역 joint 관계를, GCNFormer stream은 skeleton graph의 local 관계를 다루고 두 표현을 adaptive fusion한다.

- 원문: [WACV 2024 CVF Open Access](https://openaccess.thecvf.com/content/WACV2024/papers/Mehraban_MotionAGFormer_Enhancing_3D_Human_Pose_Estimation_With_a_Transformer-GCNFormer_Network_WACV_2024_paper.pdf)
- 코드: [TaatiTeam/MotionAGFormer](https://github.com/TaatiTeam/MotionAGFormer)
- 논문 보고값: MotionAGFormer-B의 P1 error는 Human3.6M `38.4 mm`, MPI-INF-3DHP `16.2 mm`

두 데이터셋의 숫자가 같은 metric·protocol을 뜻한다고 가정해서는 안 된다. 또한 2D detector ground truth를 넣었는지 detector prediction을 넣었는지가 end-to-end 성능에 큰 영향을 준다.

## HybrIK: 관절 정확도와 mesh 구조를 결합

[HybrIK](https://openaccess.thecvf.com/content/CVPR2021/html/Li_HybrIK_A_Hybrid_Analytical-Neural_Inverse_Kinematics_Solution_for_3D_Human_CVPR_2021_paper.html)은 3D joint를 body-part rotation으로 바꾸는 hybrid inverse kinematics를 제안한다. swing rotation은 joints에서 해석적으로 풀고 twist rotation은 visual cue에서 학습한다. 단순 joint lifting이 아니라 pose와 body shape를 포함하는 mesh recovery 문제다.

- 원문: [CVPR 2021 CVF Open Access](https://openaccess.thecvf.com/content/CVPR2021/papers/Li_HybrIK_A_Hybrid_Analytical-Neural_Inverse_Kinematics_Solution_for_3D_Human_CVPR_2021_paper.pdf)
- 코드: [Jeff-sjtu/HybrIK](https://github.com/Jeff-sjtu/HybrIK)
- 원문이 강조한 차이: pixel-aligned 3D joints와 plausible parametric body structure의 결합

PVE와 MPJPE는 다른 출력의 오차다. mesh model을 쓰지 않는 pose-only 모델과 PVE를 직접 비교할 수 없다.

## TRAM: 움직이는 카메라에서 world-space motion 복원

[TRAM](https://www.ecva.net/papers/eccv_2024/papers_ECCV/html/1796_ECCV_2024_paper.php)은 ECCV 2024 논문이다. 기존 글의 출판 연도 2025 표기는 수정했다. 이 모델은 dynamic human에 강하도록 SLAM을 보완해 camera motion과 scene scale을 얻고, VIMO가 추정한 local body motion과 결합해 world-space trajectory를 복원한다.

- 원문: [ECCV 2024 ECVA PDF](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/01796.pdf)
- 프로젝트: [TRAM project page](https://yufu-wang.github.io/tram4d/)
- 코드: [yufu-wang/tram](https://github.com/yufu-wang/tram)

TRAM의 출력은 camera-relative MPJPE만 잘 맞추는 문제보다 넓다. 사람이 제자리에서 걷는 것처럼 보이는 drift, camera와 human motion의 분리, metric scale이 모두 평가 대상이다.

## 왜 단안 3D pose는 하나로 정해지지 않는가

서로 다른 3D 자세가 비슷한 2D projection을 만들 수 있다. 가림, foreshortening, 좌우 대칭은 ambiguity를 키운다. 모델은 학습 데이터의 body prior와 temporal smoothness로 가능한 해를 좁힐 뿐, 영상에 없는 정보를 측정한 것은 아니다.

따라서 로봇 안전이나 의료 측정에 사용할 때는 단일 좌표만 반환하기보다 confidence·uncertainty·out-of-distribution 신호를 함께 다뤄야 한다.

## 공정한 실험표에 반드시 넣을 열

```text
input | detector | temporal window | output representation | coordinate frame
training datasets | test protocol | metric | params/MACs | FPS/hardware
occlusion handling | multi-person tracking | license | code/model version
```

“RGB 입력”이라는 한 칸만으로는 부족하다. 어떤 2D detector와 bounding-box crop을 썼는지, test-time augmentation을 적용했는지, root alignment 또는 Procrustes alignment를 했는지 기록한다.

## 로봇 프로젝트에서의 선택

- 사람의 관절 방향만 필요: pose lifting 계열부터 latency를 검증한다.
- 충돌 거리와 체적이 필요: calibrated depth 또는 mesh + uncertainty를 고려한다.
- 이동 카메라에서 사람의 세계 궤적이 필요: camera pose와 scale을 함께 추정하는 계열이 필요하다.
- 안전 정지가 필요: 평균 MPJPE보다 가림·시야 이탈에서 failure detection이 중요하다.

## 재현 순서

1. 원 논문의 공식 repository에서 commit과 weight checksum을 고정한다.
2. dataset license와 evaluation protocol을 확인한다.
3. 제공된 2D keypoint와 자체 detector 결과를 분리한다.
4. camera-relative와 world-space metric을 섞지 않는다.
5. 동일 영상에서 latency, peak VRAM, 사람 수 증가에 따른 처리량을 측정한다.
6. 가림·motion blur·camera motion별 실패 사례를 공개한다.

이 글의 목적은 최신 모델 순위를 고정하는 것이 아니다. 모델이 바뀌어도 **입력, 표현, 좌표계, 정렬 조건, 평가 protocol**을 먼저 묻는 비교 틀을 유지하는 것이다.

---
title: "[Paper Review] Human height Estimation"
date: 2024-12-26 16:58:00
categories:
  - 정리
  - 논문
  - Project
tags:
  - paper
  - estimation
toc: true
toc_sticky: true
toc_label: "페이지 주요 목차"
---

# Paper Research

---

## A Real-Time Human Height Measurement Algorithm Based on Monocular Vision

### 논문을 고른 이유

이유는 단순하다.  

1. 2018년에 나온 논문이라 TopDown 하기 쉬웠다.  
2. 실시간으로 처리 -> 빠른 속도로 처리 한다는 것은 기존의 이미지 처리 기반 방식이라 적용되기 쉽다고 판단.  
3. 모두 코드가 없었다.

### 논문의 전체 과정
1. 카메라 캘리브레이션, (Checker board 이용해 캘리브레이션을 통해 보정)
      논문에선ㄴ 
2. 최적화 혼합 가우시안 모델(Optimized Mixed Gaussian Model) 사용해 전경 추출3. 사람의 키포인트 머리 꼭지점(Head Vertices), 발 지점(Foot Points) 추출, (yolo-pose)
3. 수직 소실점(Vertical Vanishing Point), 수평 소실선(Horizontal Vanishing Line) 계산5. 여러 기준 대상(Reference Targets) 설정 6. 네 점 공선 비율(Four-Point Collinearity Ratio) 사용해 움직이는 대상 실제 높이 계산

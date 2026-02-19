---
title: Calibration
description: "- 컴퓨터 비전 관련 수업을 듣는 도중, 필수로 알아야 하는 부분이라고 생각이 들어서 따로 정리한다. 사실 이 부분은 [다크_프로그래머](https://darkpgmr.tistor..."
pubDate: 2025-03-18
tags:
- computer-vision
- calibration
- linux
---

- 컴퓨터 비전 관련 수업을 듣는 도중, 필수로 알아야 하는 부분이라고 생각이 들어서 따로 정리한다. 사실 이 부분은 [다크_프로그래머](https://darkpgmr.tistory.com/32) 이분이 정리를 잘 해 놓았다. 광학계, 영상처리 쪽 볼꺼면 이 블로그 참조 하는 것을 추천한다.

---

## 고른 것

### 목차

|목차|내용|비고|링크|
|:--:|:--|:--|:--|
|**Transformer**|||<a href="#transformer">바로가기</a>|


---

카메라의 좌표계는 밑에 처럼, World Coordinate, Camera Coordinate, Pixel Coordinate(Image Coordinate) 이렇게 있다.  
![https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F995410365E9F957133]

Calibration Parameters는 intrinsic parameters, extrinsic parameters로 나뉘다.  
  
**extrinsic parameters**  
extrinsic parameters는 카메라 pose에 대한 것인다 (Position, Orientation).
  
**intrinsic parameters**  
intrinsic parameters는 카메라 내부 파라미터에 대한 것이다. (Focal length, Principal point, Distortion parameters)  
  
**Rigid**  
좌표 시스템 변환은 rigid transformation으로 이루어진다.  
rigid transformation이란 scale, rotation, translation으로 이루어진 변환을 말한다.  
rigid 란 뜻은 '단단한' 이라는 뜻이다.  

---  

**Transformations에 대한 간략한 설명**  


---
author_profile: true
categories:
- Projects
- Computer-Vision
date: 2024-12-26 16:58:00
excerpt: '---...'
layout: single
tag:
- artificial-intelligence
- estimation
- paper
tags:
- paper
- estimation
title: '[Paper Research] Human height estimation '
toc: true
toc_label: 페이지 주요 목차
toc_sticky: true
---

# Paper Research

---

## 주제

- Monocular Camera를 이용한 사람의 신장 추정   
단안 카메라(일반 카메라)를 사용하여 사람의 신장을 추정하는 방법에 대한 논문을 찾았다.   
중력을 기반으로, 사람이 땅에 딛고 있다고 가정을 하고 픽셀의 값으로, 지금은 AI를 사용하지만, 고전적인 계산 방식으로 사람의 신장을 추정하는 방법을 찾았다.
그래도 혹시 몰라서 AI 를 이용한 것도 찾았다.  

## AI를 이용한 방법

---

### 0. 논문 제목

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">
    Human Height Estimation Using AI-Assisted Computer Vision for Intelligent Video Surveillance System: 논문 관련 정보
  </summary>
  
  <h3 style="color: #0056b3; margin-top: 1em;">"Human Height Estimation Using AI-Assisted Computer Vision for Intelligent Video Surveillance System"</h3>
  
  <p><strong>📚 출처:</strong> KI Ratthi, B Yogameena, SS Perumaal – <em>Measurement</em>, <strong>2024</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://www.sciencedirect.com/science/article/pii/S0263224124010182" style="color: #0078D4;">ScienceDirect 논문 링크</a></p>
  <p><strong>📄 PDF 다운로드:</strong> <a href="https://icvgip.in/downloads/185_YFS.pdf" style="color: #0078D4;">PDF 파일 링크</a> (논문 링크를 통해 다운로드 시 자세한 버전 제공됨; 위 PDF는 간략 버전)</p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">
  
  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li>감시 시스템에서 <strong>AI 및 컴퓨터 비전</strong>을 활용하여 사람의 <strong>키를 정확하게 추정</strong>하는 새로운 방법 제안.</li>
    <li>얼굴 인식의 한계(가림, 마스크 착용 등)를 보완하기 위해 <strong>키, 체형, 상체 비율</strong>을 활용.</li>
  </ul>
  
  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>카메라 교정 (Camera Calibration):</strong>
      <ul>
        <li>렌즈 왜곡 보정 및 <strong>카메라 높이와 기울기 각도</strong>를 정확하게 보정.</li>
      </ul>
    </li>
    <li>
      <strong>객체 탐지 (Object Detection):</strong>
      <ul>
        <li><strong>YOLOv7-OA (Occlusion-Aware)</strong> 알고리즘을 사용하여 프레임 내 사람을 정확하게 감지.</li>
      </ul>
    </li>
    <li>
      <strong>높이 추정 (Height Estimation):</strong>
      <ul>
        <li>감지된 <strong>머리와 발의 픽셀 좌표</strong>를 사용하여 실제 키 계산.</li>
      </ul>
    </li>
    <li>
      <strong>시야각 분석 (Field of Vision, FOV Analysis):</strong>
      <ul>
        <li>카메라 <strong>높이 및 기울기 각도</strong>가 키 측정 정확도에 미치는 영향 분석.</li>
      </ul>
    </li>
  </ol>
  
  <h4 style="color: #0056b3;">3. 실험 및 결과</h4>
  <ul>
    <li>다양한 FOV 영역에서 키를 측정하여 정확도 평가.</li>
    <li><strong>평균 절대 오차 (MAE):</strong> <code>0.02cm ~ 0.8cm</code></li>
    <li>기존 방법(1.39cm 오차)보다 높은 정확도 입증.</li>
    <li>다양한 각도 및 거리에서도 일관된 성능 유지.</li>
  </ul>
  
  <h4 style="color: #0056b3;">4. 주요 기여</h4>
  <ul>
    <li>✅ <strong>YOLOv7-OA 통합:</strong> 가림(Occlusion) 상황에서도 높은 탐지 정확도 확보.</li>
    <li>✅ <strong>고정밀 교정:</strong> 카메라 매개변수 최적화를 통해 오류 최소화.</li>
    <li>✅ <strong>효율적 데이터셋 활용:</strong> 전용 데이터셋 구축으로 학습 및 테스트 수행.</li>
  </ul>
  
  <h4 style="color: #0056b3;">5. 응용 분야</h4>
  <ul>
    <li>🛡️ <strong>스마트 감시 시스템:</strong> 출입 통제 및 보안 강화.</li>
    <li>👥 <strong>공공 안전:</strong> 대규모 군중 분석 및 이상 행동 감지.</li>
    <li>🏙️ <strong>도시 관리:</strong> 인구 통계 분석 및 스마트 시티 구축.</li>
  </ul>
  
  <h4 style="color: #0056b3;">6. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>복잡한 배경이나 빠른 움직임 대상에서는 성능 저하 가능.</li>
    <li><strong>야간 조명 조건</strong>에서 추가 최적화 필요.</li>
  </ul>
  
  <h4 style="color: #0056b3;">7. 결론</h4>
  <ul>
    <li>본 논문은 <strong>AI 기반 YOLOv7-OA 알고리즘</strong>과 <strong>카메라 교정</strong>을 결합하여 감시 환경에서 사람의 키를 높은 정확도로 추정하는 시스템을 개발.</li>
    <li>다양한 조건에서도 신뢰성 있는 결과를 도출하며 감시 시스템 성능을 획기적으로 개선.</li>
  </ul>
  
  <p><strong>🗓️ 출판 연도:</strong> <strong>2024</strong></p>
</details>

<br>

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">
    Efficient Height Measurement Method of Surveillance Camera Image: 논문 관련 정보
  </summary>
  
  <h3 style="color: #0056b3; margin-top: 1em;">"Efficient Height Measurement Method of Surveillance Camera Image"</h3>
  
  <p><strong>📚 출처:</strong> H Würschinger, N Hanenkamp – <em>Measurement</em>, <strong>2007</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://www.sciencedirect.com/science/article/pii/S0263224124023455" style="color: #0078D4;">ScienceDirect 논문 링크</a></p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">
  
  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li>감시 카메라 영상을 사용하여 사람의 <strong>키를 효율적으로 측정</strong>하는 새로운 방법 제안.</li>
    <li>비용 효율적이며 실시간으로 키를 정확히 추정할 수 있는 시스템 설계.</li>
  </ul>
  
  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>카메라 교정 (Camera Calibration):</strong>
      <ul>
        <li>카메라의 <strong>기울기, 초점 거리, 설치 높이</strong>를 정확히 보정.</li>
      </ul>
    </li>
    <li>
      <strong>머리-발 탐지 (Head-Foot Detection):</strong>
      <ul>
        <li>이미지에서 사람의 <strong>머리와 발 좌표</strong>를 정확히 식별.</li>
      </ul>
    </li>
    <li>
      <strong>깊이 추정 (Depth Estimation):</strong>
      <ul>
        <li>이미지 픽셀 좌표를 사용해 <strong>3D 깊이 정보</strong>를 계산.</li>
      </ul>
    </li>
    <li>
      <strong>비선형 회귀 (Nonlinear Regression):</strong>
      <ul>
        <li>비선형 회귀 모델을 사용해 픽셀 데이터를 실제 세계 좌표로 변환.</li>
      </ul>
    </li>
  </ol>
  
  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li><strong>객체 탐지 (Object Detection):</strong> YOLO 및 OpenPose 알고리즘을 사용하여 사람 감지.</li>
    <li><strong>스케일 변환 (Scale Transformation):</strong> 카메라 캘리브레이션 값을 통해 픽셀 단위를 실제 키로 변환.</li>
    <li><strong>보정 알고리즘 (Correction Algorithm):</strong> 환경적 요인(각도, 거리 등)을 보정하여 정확도 향상.</li>
  </ul>
  
  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li>다양한 환경과 거리 조건에서 실험 수행.</li>
    <li><strong>평균 절대 오차 (MAE):</strong> 약 1.5cm 이하.</li>
    <li>기존 방법 대비 계산 시간이 <strong>25% 단축</strong>.</li>
    <li>정확도와 속도 모두 개선됨.</li>
  </ul>
  
  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>저비용 솔루션:</strong> 고가의 센서나 다중 카메라 시스템 없이 구현 가능.</li>
    <li>✅ <strong>실시간 처리:</strong> 빠른 연산 속도로 실시간 키 측정 가능.</li>
    <li>✅ <strong>높은 정확도:</strong> 다양한 환경에서도 일관된 결과 제공.</li>
  </ul>
  
  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🛡️ <strong>보안 및 감시 시스템:</strong> 출입 통제 및 비정상 행동 감지.</li>
    <li>🏙️ <strong>스마트 시티:</strong> 군중 관리 및 안전 모니터링.</li>
    <li>📊 <strong>공공 안전:</strong> 대규모 인구 분석 및 군중 행동 예측.</li>
  </ul>
  
  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>어두운 환경이나 카메라 각도가 극단적인 경우 정확도가 감소할 수 있음.</li>
    <li>복잡한 배경에서는 객체 탐지 오류 발생 가능.</li>
  </ul>
  
  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li>감시 카메라 이미지를 활용해 사람의 키를 효율적이고 정확하게 측정할 수 있는 방법을 제안.</li>
    <li><strong>실시간 처리</strong> 및 높은 정확도를 통해 감시 및 안전 관리 시스템에 유용하게 활용될 수 있음.</li>
  </ul>
  
  <p><strong>🗓️ 출판 연도:</strong> <strong>2007</strong></p>
  <p><strong>📆 제출일(Received):</strong> 19 March 2005</p>
  <p><strong>📆 수정 제출일(Revised):</strong> 9 October 2007</p>
  <p><strong>📆 승인일(Accepted):</strong> 15 October 2007</p>
  <p><strong>📆 온라인 게시일(Available Online):</strong> 21 December 2007</p>
</details>

---

### 0. 논문 제목

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">
    A Simplified Nonlinear Regression Method for Human Height Estimation in Video Surveillance: 논문 관련 정보
  </summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"A Simplified Nonlinear Regression Method for Human Height Estimation in Video Surveillance"</h3>
  
  <p><strong>📚 출처:</strong> S Li, VH Nguyen, M Ma, CB Jin, TD Do – <em>EURASIP Journal on Image and Video Processing</em>, <strong>2015</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://link.springer.com/article/10.1186/s13640-015-0086-1" style="color: #0078D4;">Springer Link</a></p>
  <p><strong>📄 PDF 다운로드:</strong> <a href="https://link.springer.com/content/pdf/10.1186/s13640-015-0086-1.pdf" style="color: #0078D4;">PDF 파일 링크</a></p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">
  
  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li>감시 카메라 시스템에서 <strong>비선형 회귀 모델 (Nonlinear Regression Model)</strong>을 사용하여 사람의 키를 정밀하게 추정.</li>
    <li>기존 소멸선 및 소멸점 (Vanishing Line and Point) 기반 방법이 가진 <strong>노이즈 민감성 문제</strong>를 해결.</li>
  </ul>
  
  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>카메라 교정 (Camera Calibration):</strong>
      <ul>
        <li>카메라 모델의 3가지 주요 매개변수 사용: <em>초점 거리 (Focal Length)</em>, <em>기울기 각도 (Tilting Angle)</em>, <em>카메라 설치 높이 (Camera Height)</em>.</li>
      </ul>
    </li>
    <li>
      <strong>머리-발 탐지 (Head-Foot Detection):</strong>
      <ul>
        <li>이미지에서 사람의 머리와 발 좌표를 정확하게 감지.</li>
      </ul>
    </li>
    <li>
      <strong>비선형 회귀 모델 (Nonlinear Regression Model):</strong>
      <ul>
        <li>머리와 발의 좌표를 사용해 키를 예측하며, 노이즈에 강하고 계산 효율성이 높음.</li>
      </ul>
    </li>
  </ol>
  
  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li>머리와 발의 좌표 검출: 객체 감지 알고리즘 사용.</li>
    <li>비선형 회귀 모델 적용: 3가지 주요 카메라 매개변수를 사용하여 키 계산.</li>
    <li>최적화 및 보정: 노이즈와 환경적 요인을 최소화.</li>
  </ul>
  
  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li>다양한 카메라 각도 및 설치 높이에서 실험 수행.</li>
    <li><strong>평균 절대 오차 (MAE):</strong> 약 1.39cm 이하.</li>
    <li>소멸선 및 소멸점 기반 방법보다 견고한 성능 보임.</li>
  </ul>
  
  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>단순화된 매개변수:</strong> 3가지 주요 매개변수만으로 정확한 결과 도출.</li>
    <li>✅ <strong>노이즈 저항성:</strong> 기존 방법의 노이즈 민감성 문제 해결.</li>
    <li>✅ <strong>계산 효율성:</strong> 실시간 감시 시스템에 적용 가능.</li>
  </ul>
  
  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🛡️ <strong>보안 및 감시 시스템:</strong> 출입 통제 및 이상 행동 감지.</li>
    <li>🏙️ <strong>스마트 시티:</strong> 군중 관리 및 실시간 모니터링.</li>
    <li>📊 <strong>공공 안전:</strong> 대규모 인구 분석 및 행동 패턴 분석.</li>
  </ul>
  
  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>조명이나 가려짐에 따라 정확도가 저하될 수 있음.</li>
    <li>카메라 각도가 비표준적일 경우 성능 저하 가능.</li>
  </ul>
  
  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li>비선형 회귀 모델을 통해 사람의 키를 정밀하게 추정할 수 있는 간단하고 효율적인 솔루션을 제시.</li>
    <li>노이즈에 강하며 계산 효율성이 뛰어나 실시간 감시 시스템에 적합함.</li>
  </ul>
  
  <p><strong>🗓️ 출판 연도:</strong> <strong>2015</strong></p>
</details>

<br>

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">
    A Real-Time Human Height Measurement Algorithm Based on Monocular Vision: 논문 관련 정보
  </summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"A Real-Time Human Height Measurement Algorithm Based on Monocular Vision"</h3>
  
  <p><strong>📚 출처:</strong> IEEE Xplore</p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://ieeexplore.ieee.org/document/8469428" style="color: #0078D4;">IEEE Xplore 논문 링크</a></p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">
  
  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li>단안 카메라 (Monocular Camera)를 사용하여 실시간으로 사람의 키를 정밀하게 측정하는 알고리즘 제안.</li>
    <li>저비용, 저복잡도의 솔루션으로 실시간 키 추정을 목표로 함.</li>
  </ul>
  
  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>단안 카메라 기반 시스템:</strong>
      <ul>
        <li>단일 카메라를 사용하여 키를 추정하며, 추가 센서 없이 거리와 깊이 계산.</li>
      </ul>
    </li>
    <li>
      <strong>객체 탐지 (Object Detection):</strong>
      <ul>
        <li>사람의 머리와 발 위치를 정확하게 식별하기 위해 객체 탐지 알고리즘 사용.</li>
      </ul>
    </li>
    <li>
      <strong>카메라 캘리브레이션 (Camera Calibration):</strong>
      <ul>
        <li>카메라의 초점 거리, 설치 각도, 높이를 교정하여 측정 정확도 향상.</li>
      </ul>
    </li>
    <li>
      <strong>깊이 예측 (Depth Estimation):</strong>
      <ul>
        <li>단안 카메라의 픽셀 좌표를 통해 간접적으로 깊이 정보를 예측.</li>
      </ul>
    </li>
  </ol>
  
  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li><strong>객체 인식 (Object Recognition):</strong> 머리와 발의 픽셀 좌표를 감지.</li>
    <li><strong>좌표 변환 (Coordinate Transformation):</strong> 2D 픽셀 좌표를 3D 공간 좌표로 변환.</li>
    <li><strong>실제 키 측정 (Height Calculation):</strong> 카메라 파라미터를 사용하여 최종 키 계산.</li>
  </ul>
  
  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li>다양한 거리 및 각도에서 테스트 수행.</li>
    <li><strong>평균 절대 오차 (MAE):</strong> 약 1.5cm 이하.</li>
    <li><strong>실시간 처리 프레임 속도:</strong> 30FPS 이상.</li>
    <li>다양한 환경에서도 일관된 성능 확인.</li>
  </ul>
  
  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>저비용 구현:</strong> 단일 카메라로 시스템 구현 가능.</li>
    <li>✅ <strong>높은 정확도:</strong> 정밀한 키 측정 결과 제공.</li>
    <li>✅ <strong>실시간 처리:</strong> 낮은 지연 시간으로 실시간 키 추정 가능.</li>
  </ul>
  
  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🛡️ <strong>스마트 감시 시스템:</strong> 공공 장소에서 보안 및 이상 행동 감지.</li>
    <li>📊 <strong>공공 안전:</strong> 군중 관리 및 위험 요소 분석.</li>
    <li>🏙️ <strong>스마트 시티:</strong> 출입 통제 및 안전 강화.</li>
  </ul>
  
  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>카메라 각도가 극단적일 경우 정확도 저하 가능.</li>
    <li>어두운 환경에서는 객체 탐지 성능이 저하될 수 있음.</li>
  </ul>
  
  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li>단안 카메라를 사용한 실시간 키 측정 알고리즘을 제안하여 비용 효율성과 실시간성을 모두 충족.</li>
    <li>다양한 환경에서도 높은 정확도를 유지하며 보안, 안전, 스마트 감시 시스템에 활용 가능.</li>
  </ul>
  
  <p><strong>🗓️ 출판 연도:</strong> <strong>2018</strong></p>
</details>

### 논문을 고른 이유

이유는 단순하다.  

1. 2018년에 나온 논문이라 TopDown 하기 쉬웠다.  
2. 실시간으로 처리 -> 빠른 속도로 처리 한다는 것은 기존의 이미지 처리 기반 방식이라 적용되기 쉽다고 판단.  
3. 모두 코드가 없었다.

### 논문의 전체 과정
1. 카메라 캘리브레이션, (Checker board 이용해 캘리브레이션을 통해 보정)
2. 최적화 혼합 가우시안 모델(Optimized Mixed Gaussian Model) 사용해 전경 추출3. 사람의 키포인트 머리 꼭지점(Head Vertices), 발 지점(Foot Points) 추출, (yolo-pose)
3. 수직 소실점(Vertical Vanishing Point), 수평 소실선(Horizontal Vanishing Line) 계산5. 여러 기준 대상(Reference Targets) 설정 6. 네 점 공선 비율(Four-Point Collinearity Ratio) 사용해 움직이는 대상 실제 높이 계산

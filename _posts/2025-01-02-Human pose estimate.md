---
title: "monocular camera, estimation of human height"
date: 2024-12-24 18:14:00
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

## 주제

- 사람의 3d 포즈 추정(HPE, Human Pose Estimation)   
최신 연구들은 주로 2D 이미지에서 사람의 포즈를 추정하는 방법에 대해 다루고 있다. 일단 2d의 센서 데이터이든지, 3d 센서 데이터이든지 pose를 추정하는 것은 비슷하다고 가설을 세워놓고, 3d pose estimation을 하는 논문을 찾아보았다.

---

### 0. 논문 제목

### **"MotionAGFormer: Enhancing 3D Human Pose Estimation with a Transformer-GCNFormer Network"**

**📚 출처:** S Mehraban, V Adeli, B Taati – *Proceedings of the IEEE/CVF WACV*, **2024**  
**🔗 논문 링크:** [WACV 논문 링크](https://openaccess.thecvf.com/content/WACV2024/html/Mehraban_MotionAGFormer_Enhancing_3D_Human_Pose_Estimation_With_a_Transformer-GCNFormer_Network_WACV_2024_paper.html)  
**📄 PDF 다운로드:** [PDF 파일 링크](https://openaccess.thecvf.com/content/WACV2024/papers/Mehraban_MotionAGFormer_Enhancing_3D_Human_Pose_Estimation_With_a_Transformer-GCNFormer_Network_WACV_2024_paper.pdf)  
**🧠 코드 저장소:** [GitHub Repository](https://github.com/TaatiTeam/MotionAGFormer)  

---

#### **1. 연구 목적**  

- **3D 인간 포즈 추정(3D Human Pose Estimation)**을 개선하기 위해 Transformer와 Graph Convolutional Network (GCN)을 결합한 새로운 네트워크 구조를 제안.  
- 기존 Transformer 기반 모델이 **글로벌 관계(Global Relationships)**는 잘 포착하지만 **로컬 의존성(Local Dependencies)**을 정확하게 처리하지 못하는 한계를 극복.

---

#### **2. 기술적 접근법**  

1. **Attention-GCNFormer (AGFormer) 블록:**  
   - 두 개의 병렬 스트림: **Transformer 스트림**과 **GCNFormer 스트림**을 사용하여 글로벌 및 로컬 관계를 동시에 포착.  
2. **로컬 관계(Local Relationships):**  
   - GCNFormer는 인접한 관절(Joint) 간의 로컬 의존성을 학습하여 Transformer의 글로벌 관계를 보완.  
3. **어댑티브 융합(Adaptive Fusion):**  
   - Transformer와 GCNFormer 출력을 통합하여 3D 구조를 보다 정확하게 재구성.  
4. **다중 AGFormer 블록 스태킹:**  
   - 여러 AGFormer 블록을 스택하여 **MotionAGFormer** 네트워크를 구성.

---

#### **3. 알고리즘 설계**  

- **입력:** 2D 또는 3D 포즈 데이터.  
- **Transformer 스트림:** 전체 포즈 구조의 글로벌 관계 학습.  
- **GCNFormer 스트림:** 인접한 관절 간 로컬 의존성 학습.  
- **출력:** 통합된 3D 포즈 재구성.

---

#### **4. 실험 및 결과**  
- **벤치마크 데이터셋:** Human3.6M, MPI-INF-3DHP.  
- **평균 재구성 오류 (P1 Error):**  
   - Human3.6M: **38.4 mm**  
   - MPI-INF-3DHP: **16.2 mm**  
- **효율성:** 이전 최고 성능 모델 대비 **1/4 수준의 파라미터**와 **3배 높은 계산 효율성**.  
- **속도-정확도 균형:** 네 가지 다양한 변형(Variants)을 제공하여 다양한 응용 사례 지원.

---

#### **5. 주요 기여**  
- **✅ Attention-GCNFormer 블록 도입:** 글로벌 및 로컬 관계를 모두 효과적으로 학습.  
- **✅ 적응형 융합:** Transformer와 GCNFormer 출력을 최적화된 방식으로 통합.  
- **✅ 효율성 최적화:** 더 적은 파라미터로 뛰어난 성능 달성.

---

#### **6. 응용 분야**  
- 🛡️ **휴먼-로봇 상호작용(HRI):** 로봇이 사람의 움직임을 정확하게 인식.  
- 🎮 **게임 및 영화 산업:** 자연스러운 캐릭터 애니메이션 생성.  
- 🏃 **스포츠 분석:** 선수의 움직임을 정밀하게 분석.  
- 🩺 **의료 및 재활:** 환자의 자세 및 움직임 모니터링.

---

#### **7. 한계 및 향후 연구 방향**  
- 복잡한 환경 및 가려진 부분(Occlusion)에서는 정확도 저하 가능.  
- 높은 계산 리소스를 요구할 수 있음.

---

#### **8. 결론**  
- **MotionAGFormer**는 Transformer와 GCNFormer의 장점을 결합하여 **3D 인간 포즈 추정의 정확도와 효율성**을 크게 향상시킴.  
- 다양한 환경과 애플리케이션에서 활용 가능성이 높음.

---

**🗓️ 출판 연도:** **2024**  

### **"TRAM: Global Trajectory and Motion of 3D Humans from in-the-Wild Videos"**

**📚 출처:** Y Wang, Z Wang, L Liu, K Daniilidis – *European Conference on Computer Vision (ECCV)*, **2025**  
**🔗 논문 링크:** [Springer Link](https://link.springer.com/chapter/10.1007/978-3-031-73247-8_27)  
**📄 PDF 다운로드:** [arXiv PDF 링크](https://arxiv.org/pdf/2403.17346)  
**🧠 저자 정보:**  
- [Y Wang](https://scholar.google.com/citations?user=kvpdLj0AAAAJ&hl=en)  
- [Z Wang](https://scholar.google.com/citations?user=Wq7iaonvhawC&hl=en)  
- [L Liu](https://scholar.google.com/citations?user=HZPnJ9gAAAAJ&hl=en)  
- [K Daniilidis](https://scholar.google.com/citations?user=dGs2BcIAAAAJ&hl=en)  
**🌐 프로젝트 페이지:** [TRAM Project](https://yufu-wang.github.io/tram4d/)

---

#### **1. 연구 목적**  

- **3D 인간의 전역 궤적(Global Trajectory)**과 **동작(Motion)**을 **자연 영상(In-the-Wild Videos)**에서 정확하게 재구성.  
- 기존 SLAM(동시적 위치추정 및 지도작성) 시스템의 **동적 인간 객체 문제(Dynamic Human Object Issues)**를 해결.  
- 카메라 움직임을 기준 척도(Metric-Scale Reference)로 사용해 **정확한 3D 인간 포즈와 궤적을 복원**.

---

#### **2. 기술적 접근법**  

1. **SLAM 최적화:**  
   - SLAM 시스템을 개선하여 **동적 인간 객체로 인한 오류를 최소화**.  
   - 배경(Scene Background)을 활용하여 **동작 스케일(Motion Scale)**을 복원.  

2. **Video Transformer Model (VIMO):**  
   - 비디오 기반 Transformer 모델을 도입해 **신체 동작(Kinematic Body Motion)**을 회귀 예측.  
   - 시간적 연속성(Temporal Consistency)을 유지하며 프레임 간 변화를 포착.  

3. **두 동작의 통합:**  
   - **카메라 움직임**과 **인체 움직임**을 결합해 정확한 **세계 좌표계(World Space)**에서의 3D 인간 포즈 복원.

---

#### **3. 알고리즘 설계**  

- **입력:** 자연 영상(In-the-Wild Videos).  
- **Step 1:** SLAM을 사용하여 카메라 움직임과 배경 정보를 분석.  
- **Step 2:** VIMO를 통해 신체 동작을 프레임 단위로 예측.  
- **Step 3:** 카메라 궤적과 신체 동작을 통합하여 전역 좌표계에서 포즈를 복원.  
- **출력:** 정확한 3D 인간 궤적 및 움직임 재구성.

---

#### **4. 실험 및 결과**  

- **벤치마크 데이터셋:** Human3.6M, 3DPW, EgoBody.  
- **정확도 개선:** 기존 방법 대비 **글로벌 모션 오차(Global Motion Error)**가 크게 감소.  
- **시간 일관성:** 프레임 간 인간 움직임이 자연스럽고 일관되게 유지됨.  
- **실제 환경 적용:** 자연스러운 비디오 데이터셋에서도 강건한 성능 입증.

---

#### **5. 주요 기여**  

- **✅ SLAM 최적화:** 동적 인간 객체로 인한 오류를 효과적으로 완화.  
- **✅ Video Transformer (VIMO):** 비디오 데이터를 활용해 시간적 일관성을 유지.  
- **✅ 글로벌 궤적 복원:** 카메라 궤적과 인간 움직임을 통합하여 현실적 3D 복원.  
- **✅ 도메인 일반화:** 다양한 자연 비디오에서 강력한 성능 검증.

---

#### **6. 응용 분야**  

- 🛡️ **스마트 감시 시스템:** 자연스러운 인간 행동 분석 및 모니터링.  
- 🎮 **게임 및 VR/AR:** 실제 인간 움직임 기반의 캐릭터 애니메이션.  
- 🎥 **영화 및 VFX:** 사실적인 인간 움직임 재현.  
- 🤖 **휴먼-로봇 상호작용:** 로봇이 사람의 움직임을 정확하게 인식 및 추적.

---

#### **7. 한계 및 향후 연구 방향**  

- 극단적인 동작이나 복잡한 배경에서의 성능 저하 가능성.  
- 실시간 처리를 위한 추가 최적화 필요.

---

#### **8. 결론**  

- **TRAM**은 SLAM과 Transformer 모델을 통합하여 **3D 인간 궤적 및 동작을 자연 비디오 데이터에서 정확하게 재구성**.  
- 글로벌 좌표계에서의 일관된 움직임을 재현하며 다양한 응용 분야에서 활용 가능성을 입증.

---

**🗓️ 출판 연도:** **2025**  

## RGB-D 기반 3D 포즈 추정

### **"Impact of 3D Cartesian Positions and Occlusion on Self-Avatar Full-Body Animation in Virtual Reality"**

**🚨 코드** : 코드 없음  
**📚 출처:** G Fletcher, SA Ghasemzadeh, T Ravet – *Proceedings of Advanced Virtual Reality and Extended Reality*, **2025**  
**🔗 논문 링크:** [UCLouvain Repository](https://dial.uclouvain.be/pr/boreal/object/boreal:295626)  
**🧠 저자 정보:**  
- [SA Ghasemzadeh](https://scholar.google.com/citations?user=famd3lQAAAAJ&hl=en)  

---

#### **1. 연구 목적**  
- **RGB-D 데이터(RGB-Depth Data)**를 사용하여 **3D 인간 포즈 재구성(3D Human Pose Reconstruction)**의 정확도를 높임.  
- **가려짐(Occlusions)**이 발생한 상황에서 인간 포즈의 정확한 추정을 목표로 함.  
- **Self-Avatar Animation**에서 **3D Cartesian 위치 오류**의 영향을 분석.

---

#### **2. 기술적 접근법**  
1. **RGB-D 데이터 통합:**  
   - RGB 이미지와 깊이(Depth) 데이터를 융합하여 포즈 추정 정확도 향상.  
   
2. **Occlusion Handling Module:**  
   - 가려짐(Occlusion) 상황을 감지하고 예측된 포즈를 보정.  
   - 비가려진 관절 정보를 기반으로 가려진 부분을 예측.

3. **Self-Avatar Animation Pipeline:**  
   - 3D Cartesian 좌표를 사용하여 사용자 아바타의 전체 움직임을 재구성.  
   - 실시간 상호작용을 보장하기 위한 최적화된 알고리즘 적용.

---

#### **3. 알고리즘 설계**  
- **입력:** RGB-D 비디오 프레임.  
- **Step 1:** RGB 이미지에서 초기 포즈를 예측.  
- **Step 2:** 깊이 데이터(Depth Map)를 사용하여 포즈를 3D 좌표로 변환.  
- **Step 3:** Occlusion Handling Module을 통해 가려진 관절의 위치를 예측.  
- **Step 4:** Self-Avatar Animation으로 최종 포즈를 시각화.  
- **출력:** 가려짐이 보정된 3D 인간 포즈 및 실시간 아바타 애니메이션.

---

#### **4. 실험 및 결과**  
- **벤치마크 데이터셋:** Human3.6M, MPI-INF-3DHP.  
- **오류 분석:** 가려진 환경에서의 MPJPE (Mean Per Joint Position Error) 분석.  
- **정확도 향상:** RGB-D 데이터를 통합한 후 포즈 정확도가 18% 개선.  
- **실시간 성능:** 아바타 움직임이 실시간으로 재구성됨.

---

#### **5. 주요 기여**  
- **✅ RGB-D 데이터 통합:** RGB 이미지와 깊이 정보를 함께 사용해 포즈 정확도 개선.  
- **✅ Occlusion Handling Module:** 가려진 포즈 부분을 예측하여 전체 포즈의 일관성 유지.  
- **✅ Self-Avatar Animation:** 3D Cartesian 좌표 기반으로 아바타 움직임을 자연스럽게 재현.  
- **✅ 실시간 성능:** 아바타 애니메이션을 실시간으로 구현.

---

#### **6. 응용 분야**  
- 🎮 **VR/AR 게임:** 사용자 움직임을 정확하게 반영한 아바타 애니메이션.  
- 🩺 **의료 재활:** 환자의 움직임 분석 및 물리 치료 보조.  
- 🛡️ **스마트 감시 시스템:** 가려진 상황에서도 인간 움직임 추적.  
- 🤖 **로봇 상호작용:** 인간 포즈를 실시간으로 재구성하여 로봇에 반영.

---

#### **7. 한계 및 향후 연구 방향**  
- 복잡한 가려짐 상황에서는 여전히 예측 오류 발생 가능성.  
- 실시간 시스템을 위한 추가 최적화 필요.  
- 다양한 조명 및 환경 조건에서 추가 실험 필요.

---

#### **8. 결론**  
- **RGB-D 데이터를 활용한 3D 인간 포즈 재구성**은 **가려짐(Occlusion) 문제를 효과적으로 해결**하여 정확한 포즈 예측을 가능하게 함.  
- **Self-Avatar Animation**은 **3D Cartesian 좌표**를 통해 보다 자연스러운 인간 움직임을 시각화.  
- VR, 의료, 로봇 등 다양한 분야에 응용될 가능성을 입증.

---

**🗓️ 출판 연도:** **2025**  

### **"A Real-time Multi-Person 3D Pose Estimation System from Multiple RGB-D Views for Live Streaming of 3D Animation"**

**📚 출처:** T Hwang, J Kim, M Kim, M Kim – *Proceedings of the 28th International Conference on Virtual Reality and 3D User Interfaces (VR)*, **2023**  
**🔗 논문 링크:** [ACM Digital Library](https://dl.acm.org/doi/abs/10.1145/3581754.3584144)  
**📄 DOI:** [10.1145/3581754.3584144](https://doi.org/10.1145/3581754.3584144)  
**🧠 저자 정보:**  
- [T Hwang](https://scholar.google.com/citations?user=HwangTProfile)  
- [J Kim](https://scholar.google.com/citations?user=KimJProfile)  
- [M Kim](https://scholar.google.com/citations?user=KimMProfile)  

---

#### **1. 연구 목적**  
- **다중 RGB-D 카메라(Multiple RGB-D Views)**를 활용해 **실시간 다중 인물 3D 포즈 추정(Multi-Person 3D Pose Estimation)** 시스템을 설계.  
- **라이브 스트리밍(Live Streaming)** 애니메이션과 가상 현실(VR) 애플리케이션을 목표로 함.  
- 중앙 서버와 엣지 장치(Edge Devices) 간의 효율적인 데이터 통신을 통해 **실시간 처리 성능**을 최적화.

---

#### **2. 기술적 접근법**  
1. **Edge Device Processing:**  
   - 각 **엣지 장치(Edge Device)**에서 **2D 포즈 감지(2D Pose Detection)** 및 **깊이 감지(Depth Sensing)**를 로컬로 수행.  
   - 연산 부담을 분산 처리하여 네트워크 트래픽을 최소화.

2. **Central Server Coordination:**  
   - 중앙 서버(Central Server)는 다중 카메라 뷰의 좌표를 **세계 좌표계(World Plane)**에 정렬.  
   - **멀티뷰 삼각측량(Multi-view Triangulation)**을 통해 3D 포즈를 재구성.

3. **Person Matching Across Cameras:**  
   - 각 카메라에서 검출된 **2D 포즈 키포인트**를 사람 단위로 매칭.  
   - 거리를 기반으로 **다중 카메라 뷰 통합(Person Association)**.

4. **Real-Time Streaming:**  
   - 최종적으로 실시간으로 3D 포즈를 재구성하고 **라이브 스트리밍** 시스템에 통합.

---

#### **3. 알고리즘 설계**  
- **입력:** 다중 RGB-D 카메라에서 얻은 비디오 및 깊이 데이터.  
- **Step 1:** 각 엣지 장치에서 2D 포즈 및 깊이 데이터 수집.  
- **Step 2:** 중앙 서버로 데이터를 전송.  
- **Step 3:** 중앙 서버에서 멀티뷰 삼각측량으로 3D 포즈 재구성.  
- **Step 4:** 좌표계 정렬 및 사람 매칭 수행.  
- **출력:** 실시간으로 다중 사람 3D 포즈 재구성 및 라이브 스트리밍.

---

#### **4. 실험 및 결과**  
- **벤치마크 환경:** 자체 구축된 다중 RGB-D 카메라 설정.  
- **성능 평가:**  
   - **실시간 처리 속도:** 평균 30 FPS 유지.  
   - **정확도:** MPJPE (Mean Per Joint Position Error) 개선.  
- **라이브 스트리밍 테스트:** PC 및 웹(Web) 애플리케이션을 통해 안정적인 스트리밍 성능 입증.

---

#### **5. 주요 기여**  
- **✅ Edge-Central 분산 아키텍처:** 엣지 장치와 중앙 서버 간의 협업 처리.  
- **✅ Multi-View Triangulation:** 멀티 카메라 데이터를 통해 3D 포즈 정밀도 향상.  
- **✅ Real-Time Live Streaming:** 실시간으로 다중 인물의 포즈를 재구성 및 스트리밍.  
- **✅ Person Matching Across Cameras:** 거리 기반으로 신뢰성 높은 사람 매칭.

---

#### **6. 응용 분야**  
- 🎮 **게임 및 VR/AR:** 다중 사용자의 움직임을 실시간으로 반영한 몰입형 환경 구축.  
- 🩺 **의료 재활:** 여러 환자의 자세와 움직임을 실시간으로 모니터링.  
- 🎥 **영화 및 VFX:** 라이브 애니메이션 제작 및 시각 효과.  
- 🛡️ **스마트 감시:** 다중 인물의 움직임을 실시간으로 감지 및 분석.

---

#### **7. 한계 및 향후 연구 방향**  
- 네트워크 대역폭 사용이 높은 환경에서는 성능 저하 가능성.  
- 가려짐(Occlusion) 상황에서 일부 부정확한 결과 발생.  
- 더 많은 카메라 뷰를 통합하기 위한 스케일링 문제.

---

#### **8. 결론**  
- 이 시스템은 **다중 RGB-D 뷰를 통합하여 실시간으로 다중 인물 3D 포즈를 재구성**하며, **라이브 스트리밍** 애플리케이션에서 효율적으로 작동.  
- **게임, 의료, 감시, 영화 등 다양한 산업 분야**에서 광범위한 활용 가능성을 입증.

---

**🗓️ 출판 연도:** **2023**  

### **"RGB-D Fusion for Point-Cloud-Based 3D Human Pose Estimation"**

**🚨 코드** : 코드 없음  
**📚 출처:** J Ying, X Zhao – *2021 IEEE International Conference on Image Processing (ICIP)*, **2021**  
**🔗 논문 링크:** [IEEE Xplore 논문 링크](https://ieeexplore.ieee.org/abstract/document/9506588/)  
**📄 PDF 다운로드:** [PDF 파일 링크](https://cvl.sjtu.edu.cn/Upload/Paper/Rgb-D%20Fusion%20For%20Point-Cloud-Based%203d%20Human%20Pose%20Estimation.pdf)  
**🧠 저자 정보:**  
- [X Zhao](https://scholar.google.com/citations?user=bsp_RSUAAAAJ&hl=en)  

---

#### **1. 연구 목적**  
- **RGB-D 이미지(RGB-Depth Images)**를 활용하여 **3D 인간 포즈 추정(3D Human Pose Estimation)**을 개선.  
- **포인트 클라우드(Point Cloud)**를 사용해 RGB 이미지와 깊이 데이터를 통합.  
- **정확한 3D 포즈 추정**을 달성하여 기존 2D 기반 포즈 추정의 한계를 극복.

---

#### **2. 기술적 접근법**  
1. **2D Pose Estimation Module:**  
   - RGB 이미지에서 **2D 포즈 키포인트(Keypoints)**를 추출.  
   - 고해상도 색상 정보를 사용해 초기 특징 학습.

2. **RGB-D Fusion via Point Cloud:**  
   - RGB에서 얻은 **색상 특징(Color Features)**과 깊이(Depth) 정보를 **포인트 클라우드(Point Cloud)**로 통합.  
   - 각 포인트를 개별적으로 학습.

3. **3D Learning Module:**  
   - 포인트 클라우드에서 **포인트 단위 특징(Point-wise Features)**을 추출.  
   - 복잡한 포즈 구조를 포착하도록 설계.

4. **Dense Prediction Module:**  
   - 포인트에서 **Offset Vectors** 및 **Closeness Scores**를 예측.  
   - 각 포인트의 예측을 가중 평균하여 최종 3D 포즈를 생성.

---

#### **3. 알고리즘 설계**  
- **입력:** RGB 이미지 및 깊이(Depth) 이미지.  
- **Step 1:** 2D Pose Estimation을 통해 RGB 이미지에서 키포인트 특징 추출.  
- **Step 2:** RGB와 Depth를 통합하여 Point Cloud로 변환.  
- **Step 3:** 3D Learning Module로 포인트 클라우드 특징 학습.  
- **Step 4:** Dense Prediction Module로 최종 포즈 키포인트를 예측.  
- **출력:** 최적화된 3D 인간 포즈 데이터.

---

#### **4. 실험 및 결과**  
- **벤치마크 데이터셋:** MHAD, SURREAL.  
- **성능 개선:** 기존 RGB 기반 모델보다 더 낮은 **Mean Per Joint Position Error (MPJPE)**를 달성.  
- **로컬 및 글로벌 특징 통합:** 포즈 추정의 강건성(Robustness) 및 정확도 향상.  
- **포인트 클라우드 최적화:** 포즈 예측 속도와 정확도가 균형을 이룸.

---

#### **5. 주요 기여**  
- **✅ RGB-D 통합:** RGB 이미지와 깊이 데이터를 포인트 클라우드로 변환하여 정보 손실 최소화.  
- **✅ 3D Learning Module:** 포인트 단위의 복잡한 특징을 학습하여 포즈 예측 정확도 향상.  
- **✅ Dense Prediction Module:** Offset Vectors와 Closeness Scores로 포즈 키포인트 예측 최적화.  
- **✅ 벤치마크 데이터셋 검증:** MHAD 및 SURREAL 데이터셋에서 최첨단(SOTA) 성능 달성.

---

#### **6. 응용 분야**  
- 🛡️ **스마트 감시 시스템:** 인간 움직임을 3D로 정확하게 감지.  
- 🎮 **게임 및 VR/AR:** 현실적인 사용자 포즈 및 움직임 반영.  
- 🩺 **의료 및 재활:** 환자의 자세 및 움직임 분석.  
- 🤖 **로봇 비전:** 로봇이 인간의 3D 움직임을 실시간으로 인식.

---

#### **7. 한계 및 향후 연구 방향**  
- 포인트 클라우드 데이터가 밀집하지 않을 경우 정확도 저하 가능.  
- 극단적 가려짐(Occlusion) 상황에서의 예측 오류 발생.  
- 실시간 처리를 위한 추가 최적화 필요.

---

#### **8. 결론**  
- **RGB-D Fusion**은 **포인트 클라우드 기반 3D 인간 포즈 추정**의 정확도와 효율성을 개선.  
- RGB 이미지의 고해상도 특징과 깊이 데이터의 공간 정보를 통합하여 **현실적이고 정확한 포즈 재구성**을 달성.  
- 다양한 분야에서 응용 가능성을 입증.

---

**🗓️ 출판 연도:** **2021**  

### **"Real-time RGBD-Based Extended Body Pose Estimation"**

**📚 출처:** R Bashirov, A Ianina, K Iskakov – *Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision (WACV)*, **2021**  
**🔗 논문 링크:** [WACV 논문 링크](http://openaccess.thecvf.com/content/WACV2021/html/Bashirov_Real-Time_RGBD-Based_Extended_Body_Pose_Estimation_WACV_2021_paper.html)  
**📄 PDF 다운로드:** [PDF 파일 링크](https://openaccess.thecvf.com/content/WACV2021/papers/Bashirov_Real-Time_RGBD-Based_Extended_Body_Pose_Estimation_WACV_2021_paper.pdf)  
**🧠 저자 정보:**  
- [R Bashirov](https://scholar.google.com/citations?user=1pFCtykAAAAJ&hl=en)  
- [K Iskakov](https://scholar.google.com/citations?user=YSYA9_4AAAAJ&hl=en)  

---

#### **1. 연구 목적**  
- **RGB-D 카메라(Kinect Azure RGB-D Camera)**를 사용해 **실시간 확장된 신체 포즈 추정(Extended Body Pose Estimation)** 시스템을 개발.  
- **파라메트릭 3D 인간 메쉬 모델(SMPL-X)**을 기반으로 신체 포즈, 손 포즈, 얼굴 표정을 통합적으로 예측.  
- 실시간 성능을 유지하면서 **높은 정확도와 일관성**을 보장.

---

#### **2. 기술적 접근법**  
1. **SMPL-X Representation:**  
   - **3D 변형 가능한 인간 메쉬 모델(Parametric 3D Deformable Human Mesh Model, SMPL-X)**을 사용하여 전체 신체, 손, 얼굴을 표현.  

2. **Body Pose Estimation:**  
   - Kinect Azure RGB-D 카메라로부터 얻은 데이터를 사용해 신체 포즈 파라미터를 예측.  
   - **AMASS Dataset**과 사용자 정의 데이터셋(56명의 포즈 데이터)을 학습에 사용.

3. **Hand Pose Estimation:**  
   - 기존에 발표된 손 포즈 예측 모델을 직접 활용.  
   - 신체 포즈와 손 포즈를 일관되게 통합.

4. **Facial Expression Estimation:**  
   - 대규모 **Talking Face Dataset**으로 훈련된 얼굴 표정 추출기 사용.  
   - RGB-D 데이터를 통해 얼굴 표정 특징을 세밀하게 추출.

5. **Temporal Smoothing:**  
   - 시간적 일관성(Temporal Consistency)을 유지하기 위해 연속된 프레임을 정교하게 조정.  

---

#### **3. 알고리즘 설계**  
- **입력:** RGB-D 데이터(Kinect Azure).  
- **Step 1:** RGB-D 입력에서 랜드마크 검출.  
- **Step 2:** 신체, 손, 얼굴 표정 파라미터 추정.  
- **Step 3:** 시간적 일관성 보정 (Temporal Smoothing).  
- **출력:** 신체, 손, 얼굴 표정을 포함한 통합 3D 포즈 예측.

---

#### **4. 실험 및 결과**  
- **벤치마크 데이터셋:** AMASS Dataset, 사용자 정의 Kinect Azure 데이터셋 (56명).  
- **정확도 개선:** RGB 전용(RGB-Only) 방법보다 뛰어난 성능.  
- **실시간 처리:** GPU 서버에서 평균 **25 FPS** 유지.  
- **성능 비교:** 더 느린 RGB-D 최적화 기반 솔루션과 유사한 정확도 달성.

---

#### **5. 주요 기여**  
- **✅ SMPL-X 모델 활용:** 신체, 손, 얼굴을 통합적으로 표현.  
- **✅ RGB-D 기반 포즈 추정:** RGB-Only 접근법보다 높은 정확도 제공.  
- **✅ Temporal Smoothing:** 프레임 간 일관성 유지로 포즈의 안정성 향상.  
- **✅ 실시간 처리:** GPU 환경에서 초당 25 프레임으로 안정적인 실시간 예측.

---

#### **6. 응용 분야**  
- 🎮 **게임 및 VR/AR:** 캐릭터 포즈와 표정을 실시간으로 정확하게 재현.  
- 🩺 **의료 및 재활:** 환자의 자세 및 표정 분석을 통해 치료 계획 수립.  
- 🛡️ **스마트 감시 시스템:** 비정상적인 움직임 및 행동 감지.  
- 🤖 **로봇 비전:** 인간 포즈 및 표정을 분석하여 로봇과 자연스러운 상호작용 구현.

---

#### **7. 한계 및 향후 연구 방향**  
- 가려짐(Occlusion) 문제에서 성능 저하 가능성.  
- 다양한 환경 조건(조명, 배경)에서의 추가 검증 필요.  
- 엣지 디바이스 환경에서의 성능 최적화 필요.

---

#### **8. 결론**  
- **RGB-D 기반 실시간 확장 신체 포즈 추정 시스템**은 SMPL-X 모델을 통해 **신체, 손, 얼굴 포즈 및 표정을 통합적으로 예측**.  
- **시간적 일관성**을 보장하며 높은 정확도와 실시간 처리 속도를 달성.  
- **게임, 의료, 감시, 로봇 공학 등 다양한 응용 분야**에 효과적으로 활용될 수 있음.

---

**🗓️ 출판 연도:** **2021**  

### **"A Method for 3D Human Pose Estimation based on 2D Keypoint Detection using RGB-D Information"**

**📚 출처:** Seohee Park, Myunggeun Ji, Junchul Chun – *Journal of Internet Computing and Services*, **2018**  
**🔗 논문 링크:** [Journal of Internet Computing and Services 링크](https://doi.org/10.7472/jksii.2018.19.6.41)  
**📄 DOI:** [10.7472/jksii.2018.19.6.41](https://doi.org/10.7472/jksii.2018.19.6.41)  
**🧠 저자 정보:**  
- [Seohee Park](https://scholar.google.com/citations?user=SeoheeParkProfile)  
- [Myunggeun Ji](https://scholar.google.com/citations?user=MyunggeunJiProfile)  
- [Junchul Chun](https://scholar.google.com/citations?user=JunchulChunProfile)  

---

#### **1. 연구 목적**  
- **영상 감시(Video Surveillance)** 분야에서 **딥러닝 기반의 인간 포즈 추정**을 구현.  
- **RGB-D 데이터(RGB와 깊이 정보)**를 활용하여 가려짐(Occlusion) 문제를 해결.  
- **2D 키포인트 검출(2D Keypoint Detection)**을 통해 인간 포즈를 예측한 후, **3D 포즈로 확장**.

---

#### **2. 기술적 접근법**  
1. **RGB-D 데이터 활용:**  
   - 기존 **RGB 데이터**에 **깊이(Depth) 정보**를 추가하여 객체 감지의 정확도를 높임.  

2. **2D 키포인트 검출:**  
   - 컨볼루션 신경망(Convolution Neural Network, CNN)을 사용하여 인간 관절 14개의 **2D 키포인트**를 검출.  

3. **3D 포즈 확장:**  
   - 예측된 2D 키포인트를 바탕으로 **3D 공간으로 확장**하여 포즈를 재구성.  
   - **깊이 정보**를 활용해 **Self-Occlusion 문제**를 해결.

4. **Occlusion 문제 해결:**  
   - 객체가 다른 물체에 가려졌을 때 발생하는 가려짐 문제를 RGB-D 데이터의 깊이 정보를 활용하여 해결.

---

#### **3. 알고리즘 설계**  
- **입력:** RGB 이미지 및 깊이(Depth) 데이터.  
- **Step 1:** RGB-D 데이터를 사용해 객체 감지 및 2D 키포인트 예측.  
- **Step 2:** CNN을 통해 14개 관절의 키포인트 검출.  
- **Step 3:** 깊이 정보를 통합하여 키포인트를 3D로 변환.  
- **Step 4:** Self-Occlusion 문제를 보정하여 최종 3D 포즈 생성.  
- **출력:** 3D 인간 포즈 예측 결과.

---

#### **4. 실험 및 결과**  
- **데이터셋:** 자체 실험 환경 데이터셋 사용.  
- **정확도 개선:** 깊이 데이터를 추가함으로써 기존 2D 포즈 추정보다 정확도가 향상됨.  
- **Occlusion 문제 해결:** Self-Occlusion 현상이 보정됨으로써 포즈 재구성의 신뢰도가 향상.  
- **응용 사례:** 인간 행동 인식, 비정상 행동 탐지.

---

#### **5. 주요 기여**  
- **✅ RGB-D 데이터 통합:** RGB와 깊이 데이터를 활용하여 가려짐 문제 해결.  
- **✅ 2D 키포인트 기반 포즈 추정:** 14개의 키포인트를 정확하게 검출.  
- **✅ 3D 포즈 확장:** 깊이 정보를 바탕으로 2D 키포인트를 3D 공간으로 확장.  
- **✅ Self-Occlusion 문제 해결:** 가려짐 현상을 보정하여 포즈 정확도 개선.

---

#### **6. 응용 분야**  
- 🛡️ **스마트 감시 시스템:** 비정상 행동 및 비상 상황 감지.  
- 🎮 **게임 및 VR/AR:** 현실감 있는 캐릭터 움직임 생성.  
- 🩺 **의료 재활:** 환자의 움직임 및 자세 분석.  
- 🤖 **로봇 비전:** 로봇이 인간의 3D 포즈를 정확히 인식 및 상호작용.

---

#### **7. 한계 및 향후 연구 방향**  
- **깊이 데이터 품질 저하:** 깊이 센서의 품질에 따라 정확도가 저하될 수 있음.  
- **가려짐이 심한 상황:** 심각한 Occlusion이 있는 경우 정확도가 제한될 가능성.  
- **실시간 처리 최적화:** 실시간 시스템을 위해 계산 속도 개선 필요.

---

#### **8. 결론**  
- **RGB-D 데이터를 활용한 3D 인간 포즈 추정**은 **Self-Occlusion 문제**를 효과적으로 해결하며, 더 높은 정확도를 달성.  
- **2D 키포인트 검출과 3D 포즈 확장**의 결합은 다양한 응용 분야에서 유용하게 활용될 수 있음.  
- **스마트 감시, 의료, 로봇 기술** 등 다양한 분야에 기여할 수 있는 가능성을 입증.

---

**🗓️ 출판 연도:** **2018**  

## 이벤트 카메라

### **"Efficient Human Pose Estimation via 3D Event Point Cloud"**

**📚 출처:** Jiaan Chen, Hao Shi, Yaozu Ye, Kailun Yang, Lei Sun, Kaiwei Wang – *2022 International Conference on 3D Vision (3DV)*, **2022**  
**🔗 논문 링크:** [arXiv 링크](https://arxiv.org/abs/2206.04511)  
**📄 DOI:** [10.48550/arXiv.2206.04511](https://doi.org/10.48550/arXiv.2206.04511)  
**🧠 저자 정보:**  
- [Jiaan Chen](https://scholar.google.com/citations?user=ChenJiaanProfile)  
- [Hao Shi](https://scholar.google.com/citations?user=ShiHaoProfile)  
- [Yaozu Ye](https://scholar.google.com/citations?user=YeYaozuProfile)  
- [Kailun Yang](https://scholar.google.com/citations?user=YangKailunProfile)  
- [Lei Sun](https://scholar.google.com/citations?user=SunLeiProfile)  
- [Kaiwei Wang](https://scholar.google.com/citations?user=WangKaiweiProfile)  

---

#### **1. 연구 목적**  
- **이벤트 기반(Event-Based)** 데이터로부터 **3D 인간 포즈 추정(3D Human Pose Estimation, HPE)**을 실시간으로 수행.  
- RGB 이미지 기반 포즈 추정의 한계를 극복하고, 극단적 환경(Extreme Scenes) 및 **효율성 중심 조건(Efficiency-Critical Conditions)**에서 성능을 최적화.  
- 새로운 이벤트 표현 방법을 통해 **메모리 사용량 및 계산 복잡도**를 줄이면서 높은 정확도를 달성.

---

#### **2. 기술적 접근법**  
1. **Rasterized Event Point Cloud Representation:**  
   - **이벤트 포인트 클라우드(Event Point Cloud)**를 소형 시간 단위(Time Slice)로 나누어 **라스터화(Rasterization)**.  
   - 통계적 특징을 사용해 3D 공간 정보를 유지하면서 메모리 및 계산 요구사항을 최소화.

2. **Backbone Network Integration:**  
   - 세 가지 대표적인 백본 네트워크 적용:  
     - **PointNet:** 높은 처리 속도.  
     - **DGCNN (Dynamic Graph CNN):** 그래프 기반 특징 학습.  
     - **Point Transformer:** 가장 높은 정확도 제공.

3. **Linear Layer Decoder:**  
   - 두 개의 선형 계층(Linear Layers)을 사용하여 최종 **키포인트(Keypoints)** 위치 예측.

4. **Optimization for Real-Time Inference:**  
   - NVIDIA Jetson Xavier NX와 같은 **엣지 디바이스(Edge Devices)**에서 최적화.

---

#### **3. 알고리즘 설계**  
- **입력:** 3D 이벤트 포인트 클라우드 데이터.  
- **Step 1:** 이벤트 데이터를 라스터화하여 포인트 클라우드로 변환.  
- **Step 2:** PointNet, DGCNN, Point Transformer 백본으로 포인트 클라우드 특징 학습.  
- **Step 3:** 두 개의 선형 디코더로 3D 키포인트 예측.  
- **Step 4:** 시간 일관성(Temporal Consistency) 및 최종 포즈 최적화.  
- **출력:** 3D 인간 포즈 예측.

---

#### **4. 실험 및 결과**  
- **벤치마크 데이터셋:** DHP19 Dataset.  
- **정확도:**  
   - PointNet: MPJPE3D (Mean Per Joint Position Error) **82.46mm**.  
   - Point Transformer: 가장 높은 정확도.  
- **처리 속도:** NVIDIA Jetson Xavier NX 기준 **12.29ms**의 지연 시간(latency).  
- **리소스 사용:** 효율적인 메모리 및 연산 최적화로 엣지 디바이스에서도 강력한 성능 제공.

---

#### **5. 주요 기여**  
- **✅ Rasterized Event Point Cloud:** 시간 단위로 라스터화하여 계산 복잡도 최소화.  
- **✅ Backbone Integration:** PointNet, DGCNN, Point Transformer의 비교 및 성능 분석.  
- **✅ Linear Decoder:** 효율적인 키포인트 예측.  
- **✅ Real-Time Edge Processing:** NVIDIA Jetson Xavier NX에서 12.29ms의 낮은 지연 시간 달성.

---

#### **6. 응용 분야**  
- 🎮 **게임 및 VR/AR:** 극단적 환경에서도 사용자 움직임을 정확하게 반영.  
- 🩺 **의료 재활:** 환자의 움직임과 자세를 실시간으로 분석.  
- 🛡️ **스마트 감시:** 어두운 환경이나 빠른 움직임에서도 신뢰할 수 있는 행동 감지.  
- 🤖 **로봇 비전:** 이벤트 카메라를 통해 빠르게 인간 행동을 인식.

---

#### **7. 한계 및 향후 연구 방향**  
- 낮은 해상도의 이벤트 포인트 클라우드에서 정확도가 제한될 가능성.  
- 빠른 움직임에서의 노이즈 발생 가능성.  
- 다양한 환경 및 더 큰 데이터셋에서 추가적인 검증 필요.

---

#### **8. 결론**  
- **Efficient Human Pose Estimation via 3D Event Point Cloud**는 이벤트 기반 데이터로 실시간 3D 포즈를 예측하는 혁신적인 접근법을 제시.  
- **속도와 정확도 모두를 달성**하면서 엣지 디바이스에서도 강력한 성능을 입증.  
- **게임, 의료, 스마트 감시, 로봇 비전** 등 다양한 분야에서의 활용 가능성을 확인.

---

**🗓️ 출판 연도:** **2022**  
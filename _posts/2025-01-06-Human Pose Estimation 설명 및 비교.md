---
title: "Human Pose Estimation 설명 및 비교"
date: 2025-01-06 21:47:00
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

## 주제

- 사람의 3d 포즈 추정(HPE, Human Pose Estimation)   
앞에서는 선택한 논문들의 요약을 살펴보았다면 이제는 설명을 하려고 한다. 2024년 11월에 나온 리뷰 논문이 있어서 읽고 약간의 설명을 함께 붙여놓려고 한다. 

---
## **"From Methods to Applications: A Review of Deep 3D Human Motion Capture"**
방법과 응용까지, 3D 인간 모션 캡처에 대한 리뷰

<details>
  <summary>논문 관련 정보!</summary>

  ### **"From Methods to Applications: A Review of Deep 3D Human Motion Capture"**
  
  **📚 출처:** AH AH, OO Khalifa, AA Ibrahim – *PERINTIS eJournal*, **2024**  
  **🔗 논문 링크:** ![PERINTIS eJournal 링크](https://perintis.org.my/ejournalperintis/index.php/PeJ/article/view/180)  
  **📄 PDF 다운로드:** ![PDF 파일 링크](https://perintis.org.my/ejournalperintis/index.php/PeJ/article/download/180/148)  
  **🧠 저자 정보:**  
  - ![AH AH](https://scholar.google.com/citations?user=AHProfile)  
  - ![OO Khalifa](https://scholar.google.com/citations?user=KhalifaProfile)  
  - ![AA Ibrahim](https://scholar.google.com/citations?user=IbrahimProfile)  

  ---

  #### **1. 연구 목적**  
  - **3D 인간 모션 캡처(3D Human Motion Capture)** 기술의 최근 발전과 응용 사례를 검토.  
  - **딥러닝(Deep Learning)** 기반 접근법을 분석하여 다양한 기술적 방법론과 실제 응용 사례를 강조.  
  - 기존 기술의 한계점을 파악하고, 향후 연구 방향을 제시.

  ---

  #### **2. 기술적 접근법 및 분류**  
  1. **비전 기반 모션 캡처(Vision-Based Motion Capture):**  
      - RGB 및 RGB-D 카메라 데이터를 사용해 포즈와 움직임을 추정.  
      - 딥러닝 아키텍처 (예: ResNet, Transformer) 활용.  
  2. **센서 융합(Sensor Fusion):**  
      - IMU, LiDAR, RGB-D 데이터를 통합하여 포즈 정확도 개선.  
      - 센서 기반 접근법의 강건성을 강조.  
  3. **Graph-Based Methods:**  
      - 그래프 뉴럴 네트워크(GNN)를 사용해 키포인트 간의 관계를 모델링.  
      - 시간적 일관성(Temporal Consistency) 유지.  
  4. **Zero-shot Learning 및 Few-shot Learning:**  
      - 학습 데이터 부족 문제를 해결하기 위한 접근법.  
      - 새로운 환경에서도 신속하게 적응 가능.  
  5. **Interpretable Models:**  
      - 모델 해석 가능성을 향상시켜 사용자 신뢰성 확보.  
      - 실시간 상호작용 및 적용 사례 최적화.  

  ---

  #### **3. 응용 사례**  
  - **스마트 감시(Smart Surveillance):** 이상 행동 및 위험 상황 감지.  
  - **스포츠 및 훈련(Sports & Training):** 선수의 움직임을 실시간으로 분석하여 최적화된 훈련 제공.  
  - **의료 및 재활(Medical Rehabilitation):** 환자의 자세 및 움직임을 모니터링하여 맞춤형 치료 제공.  
  - **게임 및 VR/AR:** 사용자의 움직임을 가상 환경에 정확히 반영.  
  - **로봇 공학(Robotics):** 인간의 행동을 실시간으로 인식하고 협업 로봇에 적용.  

  ---

  #### **4. 실험 및 결과**  
  - 기존 딥러닝 기반 모션 캡처 시스템과의 성능 비교.  
  - **데이터셋:** Human3.6M, MPI-INF-3DHP, CMU Panoptic.  
  - **정확도:** 평균 오차율(MPJPE)이 개선되었으며, 시간적 일관성 향상.  
  - **처리 속도:** 실시간 추론 속도 향상.  

  ---

  #### **5. 주요 기여**  
  - ✅ **종합적 리뷰:** 3D 모션 캡처의 기술적, 응용적 측면을 포괄적으로 분석.  
  - ✅ **기술적 통찰:** 현대적 접근법 검토(Graph-based Methods, Sensor Fusion, Zero-shot Learning).  
  - ✅ **실질적 응용:** 스마트 감시, 스포츠, 의료, 게임 등 실제 적용 사례 강조.  
  - ✅ **연구 방향 제시:** 향후 연구를 위한 기술적 도전 과제 및 기회 분석.  

  ---

  #### **6. 한계 및 향후 연구 방향**  
  - 복잡한 가려짐(Occlusion) 문제에 대한 한계.  
  - 실시간 처리 속도의 한계와 고성능 하드웨어 의존성.  
  - 데이터셋의 부족과 도메인 간 성능 저하 문제.  
  - 개인정보 보호 및 기술적 규제 필요.  

  ---

  #### **7. 결론**  
  - **3D 인간 모션 캡처 기술의 딥러닝 기반 접근법**과 응용 사례를 포괄적으로 분석.  
  - 실질적 응용 사례를 통해 미래 연구 방향을 제시.  
  - 다양한 산업 분야(스마트 감시, 스포츠, 의료, 게임, 로봇 공학)에서 활용 가능성을 입증.  

  **🗓️ 출판 연도:** **2024**
</details>

## 고른 것

### RGB-D 기반의 3D 포즈 추정

<details>
  <summary>논문 관련 정보!</summary>
  
  ### **"Real-time RGBD-Based Extended Body Pose Estimation"**

   **📚 출처:** R Bashirov, A Ianina, K Iskakov – *Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision (WACV)*, **2021**  
   **🔗 논문 링크:** ![WACV 논문 링크](http://openaccess.thecvf.com/content/WACV2021/html/Bashirov_Real-Time_RGBD-Based_Extended_Body_Pose_Estimation_WACV_2021_paper.html)  
   **📄 PDF 다운로드:** ![PDF 파일 링크](https://openaccess.thecvf.com/content/WACV2021/papers/Bashirov_Real-Time_RGBD-Based_Extended_Body_Pose_Estimation_WACV_2021_paper.pdf)  
   **🧠 저자 정보:**  
   - [R Bashirov](https://scholar.google.com/citations?user=1pFCtykAAAAJ&hl=en)  
   - [K Iskakov](https://scholar.google.com/citations?user=YSYA9_4AAAAJ&hl=en)  
   **📦 코드 저장소:** ![GitHub Repository](https://github.com/rmbashirov/rgbd-kinect-pose)  

   #### **1. 연구 목적**  
   - **RGB-D 카메라(Kinect Azure RGB-D Camera)**를 사용해 **실시간 확장된 신체 포즈 추정(Extended Body Pose Estimation)** 시스템을 개발.  
   - **파라메트릭 3D 인간 메쉬 모델(SMPL-X)**을 기반으로 신체 포즈, 손 포즈, 얼굴 표정을 통합적으로 예측.  
   - 실시간 성능을 유지하면서 **높은 정확도와 일관성**을 보장.

   #### **2. 기술적 접근법**  
   1. **SMPL-X Representation:**  
   - **3D 변형 가능한 인간 메쉬 모델(Parametric 3D Deformable Human Mesh Model, SMPL-X)**을 사용하여 전체 신체, 손, 얼굴을 표현.  
   1. **Body Pose Estimation:**  
   - Kinect Azure RGB-D 카메라로부터 얻은 데이터를 사용해 신체 포즈 파라미터를 예측.  
   - **AMASS Dataset**과 사용자 정의 데이터셋(56명의 포즈 데이터)을 학습에 사용.
   1. **Hand Pose Estimation:**  
   - 기존에 발표된 손 포즈 예측 모델을 직접 활용.  
   - 신체 포즈와 손 포즈를 일관되게 통합.
   1. **Facial Expression Estimation:**  
   - 대규모 **Talking Face Dataset**으로 훈련된 얼굴 표정 추출기 사용.  
   - RGB-D 데이터를 통해 얼굴 표정 특징을 세밀하게 추출.
   1. **Temporal Smoothing:**  
   - 시간적 일관성(Temporal Consistency)을 유지하기 위해 연속된 프레임을 정교하게 조정.  

   #### **3. 알고리즘 설계**  
   - **입력:** RGB-D 데이터(Kinect Azure).  
   - **Step 1:** RGB-D 입력에서 랜드마크 검출.  
   - **Step 2:** 신체, 손, 얼굴 표정 파라미터 추정.  
   - **Step 3:** 시간적 일관성 보정 (Temporal Smoothing).  
   - **출력:** 신체, 손, 얼굴 표정을 포함한 통합 3D 포즈 예측.

   #### **4. 실험 및 결과**  
   - **벤치마크 데이터셋:** AMASS Dataset, 사용자 정의 Kinect Azure 데이터셋 (56명).  
   - **정확도 개선:** RGB 전용(RGB-Only) 방법보다 뛰어난 성능.  
   - **실시간 처리:** GPU 서버에서 평균 **25 FPS** 유지.  
   - **성능 비교:** 더 느린 RGB-D 최적화 기반 솔루션과 유사한 정확도 달성.

   #### **5. 주요 기여**  
   - **✅ SMPL-X 모델 활용:** 신체, 손, 얼굴을 통합적으로 표현.  
   - **✅ RGB-D 기반 포즈 추정:** RGB-Only 접근법보다 높은 정확도 제공.  
   - **✅ Temporal Smoothing:** 프레임 간 일관성 유지로 포즈의 안정성 향상.  
   - **✅ 실시간 처리:** GPU 환경에서 초당 25 프레임으로 안정적인 실시간 예측.

   #### **6. 응용 분야**  
   - 🎮 **게임 및 VR/AR:** 캐릭터 포즈와 표정을 실시간으로 정확하게 재현.  
   - 🩺 **의료 및 재활:** 환자의 자세 및 표정 분석을 통해 치료 계획 수립.  
   - 🛡️ **스마트 감시 시스템:** 비정상적인 움직임 및 행동 감지.  
   - 🤖 **로봇 비전:** 인간 포즈 및 표정을 분석하여 로봇과 자연스러운 상호작용 구현.

   #### **7. 한계 및 향후 연구 방향**  
   - 가려짐(Occlusion) 문제에서 성능 저하 가능성.  
   - 다양한 환경 조건(조명, 배경)에서의 추가 검증 필요.  
   - 엣지 디바이스 환경에서의 성능 최적화 필요.

   #### **8. 결론**  
   - **RGB-D 기반 실시간 확장 신체 포즈 추정 시스템**은 SMPL-X 모델을 통해 **신체, 손, 얼굴 포즈 및 표정을 통합적으로 예측**.  
   - **시간적 일관성**을 보장하며 높은 정확도와 실시간 처리 속도를 달성.  
   - **게임, 의료, 감시, 로봇 공학 등 다양한 응용 분야**에 효과적으로 활용될 수 있음.

   **🗓️ 출판 연도:** **2021**  

</details>
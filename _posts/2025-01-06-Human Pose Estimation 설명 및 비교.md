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
## "From Methods to Applications: A Review of Deep 3D Human Motion Capture"
방법과 응용까지, 3D 인간 모션 캡처에 대한 리뷰

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1.1em; margin-bottom: 0.5em; color: #333;">논문 관련 정보!</summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"From Methods to Applications: A Review of Deep 3D Human Motion Capture"</h3>

  <p><strong>📚 출처:</strong> AH AH, OO Khalifa, AA Ibrahim – <em>PERINTIS eJournal</em>, <strong>2024</strong></p>
  <p><strong>🔗 논문 링크:</strong> 
    <a href="https://perintis.org.my/ejournalperintis/index.php/PeJ/article/view/180" style="color: #0078D4;">PERINTIS eJournal 링크</a>
  </p>
  <p><strong>📄 PDF 다운로드:</strong> 
    <a href="https://perintis.org.my/ejournalperintis/index.php/PeJ/article/download/180/148" style="color: #0078D4;">PDF 파일 링크</a>
  </p>
  <p><strong>🧠 저자 정보:</strong></p>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><a href="https://scholar.google.com/citations?user=AHProfile" style="color: #0078D4;">AH AH</a></li>
    <li><a href="https://scholar.google.com/citations?user=KhalifaProfile" style="color: #0078D4;">OO Khalifa</a></li>
    <li><a href="https://scholar.google.com/citations?user=IbrahimProfile" style="color: #0078D4;">AA Ibrahim</a></li>
  </ul>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">

  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <p>✅ <strong>3D 인간 모션 캡처(3D Human Motion Capture)</strong> 기술의 최근 발전과 응용 사례를 검토.</p>
  <p>✅ <strong>딥러닝(Deep Learning)</strong> 기반 접근법을 분석하여 다양한 기술적 방법론과 실제 응용 사례를 강조.</p>
  <p>✅ 기존 기술의 한계점을 파악하고, 향후 연구 방향을 제시.</p>

  <h4 style="color: #0056b3;">2. 기술적 접근법 및 분류</h4>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><strong>비전 기반 모션 캡처(Vision-Based Motion Capture):</strong> RGB 및 RGB-D 카메라 데이터를 사용해 포즈와 움직임을 추정.</li>
    <li><strong>센서 융합(Sensor Fusion):</strong> IMU, LiDAR, RGB-D 데이터를 통합하여 포즈 정확도 개선.</li>
    <li><strong>Graph-Based Methods:</strong> 그래프 뉴럴 네트워크(GNN)를 사용해 키포인트 간의 관계를 모델링.</li>
    <li><strong>Zero-shot Learning 및 Few-shot Learning:</strong> 학습 데이터 부족 문제를 해결.</li>
    <li><strong>Interpretable Models:</strong> 실시간 상호작용 및 적용 사례 최적화.</li>
  </ul>

  <h4 style="color: #0056b3;">3. 응용 사례</h4>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><strong>스마트 감시(Smart Surveillance):</strong> 이상 행동 및 위험 상황 감지.</li>
    <li><strong>스포츠 및 훈련(Sports & Training):</strong> 최적화된 훈련 제공.</li>
    <li><strong>의료 및 재활(Medical Rehabilitation):</strong> 맞춤형 치료 제공.</li>
    <li><strong>게임 및 VR/AR:</strong> 가상 환경에 정확하게 반영.</li>
    <li><strong>로봇 공학(Robotics):</strong> 인간의 행동을 실시간으로 인식.</li>
  </ul>

  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <p>✅ <strong>데이터셋:</strong> Human3.6M, MPI-INF-3DHP, CMU Panoptic.</p>
  <p>✅ <strong>정확도:</strong> 평균 오차율(MPJPE)이 개선됨.</p>
  <p>✅ <strong>처리 속도:</strong> 실시간 추론 속도 향상.</p>

  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <p>✅ <strong>종합적 리뷰:</strong> 기술적, 응용적 측면 포괄 분석.</p>
  <p>✅ <strong>기술적 통찰:</strong> 다양한 접근법 검토.</p>
  <p>✅ <strong>실질적 응용:</strong> 스마트 감시, 스포츠, 의료 등 강조.</p>

  <h4 style="color: #0056b3;">6. 한계 및 향후 연구 방향</h4>
  <p>✅ 가려짐(Occlusion) 문제.</p>
  <p>✅ 실시간 처리 속도 한계.</p>
  <p>✅ 데이터셋 부족 문제.</p>
  <p>✅ 윤리적 문제 및 기술적 규제 필요.</p>

  <h4 style="color: #0056b3;">7. 결론</h4>
  <p>✅ <strong>3D 인간 모션 캡처 기술의 딥러닝 기반 접근법</strong> 분석.</p>
  <p>✅ 다양한 산업 분야(스마트 감시, 스포츠, 의료, 게임, 로봇 공학)에서 활용 가능성 입증.</p>

  <p><strong>🗓️ 출판 연도:</strong> <strong>2024</strong></p>
</details>

## 고른 것

### RGB-D 기반의 3D 포즈 추정

#### 모델

|model 명|연도|특징|학회|input|output|단점|
|:--:|:--:|:--|:--|:--|:--|:--|
|**[Real-time RGBD-Based Extended Body Pose Estimation](https://github.com/rmbashirov/rgbd-kinect-pose)**|2021|RGB-D 카메라 기반 실시간 확장된 신체 포즈 추정|WACV|RGB-D 이미지|3D 포즈|가려짐 문제에 대한 한계점, 부자연성, 특정 디바이스 필요|
|**[HuMoR](https://github.com/davrempe/humor)**|2021|딥러닝 기반 자세 추정, 가려짐 강함|ICCV|RGB-D 이미지 <br> 3D 포인트 클라우드 <br> 2D 키포인트|3D 포즈|실시간성, 등 결과 데이터 없음|

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1.1em; margin-bottom: 0.5em; color: #333;">논문 관련 정보!</summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"Real-time RGBD-Based Extended Body Pose Estimation"</h3>

  <p><strong>📚 출처:</strong> R Bashirov, A Ianina, K Iskakov – *Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision (WACV)*, <strong>2021</strong></p>
  <p><strong>🔗 논문 링크:</strong> 
    <a href="http://openaccess.thecvf.com/content/WACV2021/html/Bashirov_Real-Time_RGBD-Based_Extended_Body_Pose_Estimation_WACV_2021_paper.html" style="color: #0078D4;">WACV 논문 링크</a>
  </p>
  <p><strong>📄 PDF 다운로드:</strong> 
    <a href="https://openaccess.thecvf.com/content/WACV2021/papers/Bashirov_Real-Time_RGBD-Based_Extended_Body_Pose_Estimation_WACV_2021_paper.pdf" style="color: #0078D4;">PDF 파일 링크</a>
  </p>
  <p><strong>🧠 저자 정보:</strong></p>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><a href="https://scholar.google.com/citations?user=1pFCtykAAAAJ&hl=en" style="color: #0078D4;">R Bashirov</a></li>
    <li><a href="https://scholar.google.com/citations?user=YSYA9_4AAAAJ&hl=en" style="color: #0078D4;">K Iskakov</a></li>
  </ul>
  <p><strong>📦 코드 저장소:</strong> 
    <a href="https://github.com/rmbashirov/rgbd-kinect-pose" style="color: #0078D4;">GitHub Repository</a>
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">

  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <p>✅ RGB-D 카메라(Kinect Azure RGB-D Camera)를 사용해 실시간 확장된 신체 포즈 추정(Extended Body Pose Estimation) 시스템을 개발.</p>
  <p>✅ 파라메트릭 3D 인간 메쉬 모델(SMPL-X)을 기반으로 신체 포즈, 손 포즈, 얼굴 표정을 통합적으로 예측.</p>
  <p>✅ 실시간 성능을 유지하면서 높은 정확도와 일관성을 보장.</p>

  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><strong>SMPL-X Representation:</strong> 3D 변형 가능한 인간 메쉬 모델(SMPL-X) 사용.</li>
    <li><strong>Body Pose Estimation:</strong> Kinect Azure RGB-D 카메라 데이터 사용.</li>
    <li><strong>Hand Pose Estimation:</strong> 기존 손 포즈 예측 모델 활용.</li>
    <li><strong>Facial Expression Estimation:</strong> 얼굴 표정 특징을 세밀하게 추출.</li>
    <li><strong>Temporal Smoothing:</strong> 시간적 일관성을 유지.</li>
  </ul>

  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <p>✅ <strong>입력:</strong> RGB-D 데이터(Kinect Azure).</p>
  <p>✅ <strong>Step 1:</strong> RGB-D 입력에서 랜드마크 검출.</p>
  <p>✅ <strong>Step 2:</strong> 신체, 손, 얼굴 표정 파라미터 추정.</p>
  <p>✅ <strong>Step 3:</strong> 시간적 일관성 보정.</p>
  <p>✅ <strong>출력:</strong> 신체, 손, 얼굴 표정을 포함한 통합 3D 포즈 예측.</p>

  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <p>✅ <strong>벤치마크 데이터셋:</strong> AMASS Dataset, Kinect Azure 데이터셋(56명).</p>
  <p>✅ <strong>정확도 개선:</strong> RGB 전용 방법보다 높은 성능.</p>
  <p>✅ <strong>실시간 처리:</strong> GPU 서버에서 평균 25 FPS 유지.</p>

  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <p>✅ SMPL-X 모델로 신체, 손, 얼굴 통합 표현.</p>
  <p>✅ RGB-D 기반 포즈 예측.</p>
  <p>✅ Temporal Smoothing.</p>
  <p>✅ 실시간 처리.</p>

  <h4 style="color: #0056b3;">6. 결론</h4>
  <p>✅ RGB-D 기반 실시간 확장 신체 포즈 추정 시스템.</p>
  <p>✅ 시간적 일관성과 높은 정확도.</p>
  <p>✅ 다양한 산업 분야 활용 가능.</p>

  <p><strong>🗓️ 출판 연도:</strong> <strong>2021</strong></p>
</details>


## 모델별 특징

[paperwithcode_3D_HPE](https://paperswithcode.com/task/3d-multi-person-pose-estimation/latest)   
[CVPR](https://github.com/52CV/CVPR-2024-Papers?tab=readme-ov-file)   

|model 명|연도|특징|학회|input|output|단점|
|:--:|:--:|:--|:--|:--|:--|:--|
|**[Multi-HMR](https://github.com/naver/multi-hmr)**|2025|백본 ViT-S 사용시 높은 성능|ICCV|RGB 이미지(Single RGB Image)|다중 인물의 3D 메쉬|복잡한 가려짐(Occlusion) 상황에서 정확도 저하 가능성, 고사양 장치 요구|
|**[Sapien](https://github.com/facebookresearch/sapiens)**|2024|멀티 모달 모델 : 깊이 추정, 포즈 추정 미세 조정 가능|ECCV|이미지, 비디오, 텍스트 데이터|Pose, Seg, Depth|Fps 에 대한 데이터 없음, 고사양 장치 요구할 수도|
|**[Gan-base model](https://www.sciencedirect.com/science/article/abs/pii/S0921889024000605)**|2024|GAN 기반 모델, 생성기, 판별기 균형|...|RGB 이미지|3D 포즈|code 데이터 셋의 부족|
|**[DensePose](https://github.com/facebookresearch/Densepose)**|2018|인간의 3D 포즈를 2D 이미지에 투영|CVPR|RGB 이미지|3D 인간 메쉬 모델 좌표(U, V, I)|가려짐, 손, 얼굴 구체적 신체구조 구현 부족|
|**[Lifting 2D to 3D pose](https://cs231n.stanford.edu/reports/2022/pdfs/121.pdf)**|2017|실시간성, |CVPR|2D 키포인트|3D 포즈 좌표|가려짐, 손, 얼굴 구체적 신체구조 구현 부족|

### 2D Pose detectors

|model 명|연도|특징|학회|input|output|
|:--:|:--:|:--|:--|:--|:--|
|**[AlphaPose](https://github.com/MVIG-SJTU/AlphaPose)**|2022|top-down 방식, OpenPose 기반, 높은 정확도|CVPR|RGB 이미지|2D 포즈|
|**[CPN](https://github.com/GengDavid/pytorch-cpn)**|2018|이미지에서 관절 keypoints heatmap 형태 추출|CVPR|RGB 이미지|2D 포즈|
|**[OpenPose](https://github.com/CMU-Perceptual-Computing-Lab/openpose)**|2018|실시간 2D 인간 포즈 추정 + 3D keypoints|CVPR|RGB 이미지|2D 포즈, 3D pose keypoints|


### 평가 요소
Motion Capture 시스템의 설계 및 평가 필수 요소들

**평가 요소 설명**

|영어|한국어|설명|사용되는 지표|
|:--:|:--:|:--|:--|
|**Accuracy**|정확도|모션 캡처의 높은 정밀도|Mean Per Joint Position Error(MPJPE), Mean Per Joint Rotation Error(MPJRE)|
|**Robustness**|강건성|다양한 환경(조명, 가려진 상태 등)에서의 신뢰성, 안정성|Average Precision(AP), Percentage of Correct KeyPoints(PCK)|
|**Smoothness**|부드러움|모션의 시간적 일관성, 부드러운 모션 캡처|Acceleration Error[^1], Jitter Error[^2]|
|**Lightweight**|가벼움|계산 효율성, 실시간성, 하드웨어 요구 사항 관련|Frames Per Second(FPS), number of parameters, memory cosumption|

### 2D human pose estimation

1) Top-down 방식  
2) Bottom-up 방식

#### Monocular 3D human pose estimation

**1) Multi-Person Architecture**  
다중 인물 시나리오의 모노큘러 카메라 기반 3D 사람 자세 추정은 크게 2가지로 나뉜다.  
   - **Lifting-based methods:**   
     - **2D Human Pose Estimation의  3D 공간으로 변환하는 방법.**   
       - 예) Martinez : 2D human pose(input) + adapting a suitable network structure -> 3D human pose(output)   
       - 예) VideoPose : 2D human pose(input) + utilizes temporal information -> 3D human pose(output)   
   - **Direct Estimation methods:** 
     - 2D 입력 이미지에서 3D 포즈로 직접 변환하는 방법.
       - Top-down  
         사람 탐지기 -> 각 개인 감지 + 자르기 -> 3D 포즈 추정
         - 예) CLIFF, 
       - Bottom-up  
         추론 속도 저하하지 X, 다른 인체 구별하는데 중점
         - 예) XNect,LCR-Net, ROMP
   
**2) Performance Enhancement**   
카메라 입력에 의존하다보니, 정확도 높이기 위한 Camera model 개선, 보조 정보(Auxiliary Information) 활용, 새로운 표현(new representation) 사용 하는 것.

**3) Reality Enhancement**  
떨림, 물리 법칙 위반, 인간 얼굴 손 세부 사항 부족을 해결하고자 하는 것.  
후처리 기법, Physical Constraints(물리적 제약) 통합, 자세 추정 방법 위한 Whole-body models 개발 등. 

![general pipeline for developing an application-oriented Monocular 3D human Pose Estimation method](/image/HPE_general_pipline.png)
일반적인 파이프라인  



[^1]: Y. Huang, M. Kaufmann, E. Aksan, M. J. Black, O. Hilliges, and G. Pons-Moll, “Deep inertial poser: Learning to reconstruct human pose from sparse inertial measurements in real time,” ACM Trans. Graph., vol. 37, no. 6, pp. 1–15, Dec. 2018. 가속도 에러는 모션의 변화량을 측정하여, 이 변화량이 너무 크거나 작을 때 에러로 판단한다.  

[^2]: T. Flash and N. Hogan, “The coordination of arm movements: An experimentally confirmed mathematical model,” J. Neurosci., vol. 5, no. 7, pp. 1688–1703, Jul. 1985. 지터 에러는 모션의 불안정성을 측정하여, 이 불안정성이 너무 크거나 작을 때 에러로 판단한다.   




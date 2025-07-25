---
author_profile: true
categories:
- Projects
- Computer-Vision
date: 2025-02-07 16:19:00
excerpt: '---...'
layout: single
tag:
- artificial-intelligence
- estimation
- paper
- ros
- deep-learning
- game
tags:
- paper
- estimation
title: '[Paper research] Human pose estimate'
toc: true
toc_label: 페이지 주요 목차
toc_sticky: true
---

---

## 주제

- 사람의 3d 포즈 추정(HPE, Human Pose Estimation)   
최신 연구들은 주로 2D 이미지에서 사람의 포즈를 추정하는 방법에 대해 다루고 있다. 일단 2d의 센서 데이터이든지, 3d 센서 데이터이든지 pose를 추정하는 것은 비슷하다고 가설을 세워놓고, 3d pose estimation을 하는 논문을 찾아보았다.

---

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">MotionAGFormer: 논문 관련 정보</summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"MotionAGFormer: Enhancing 3D Human Pose Estimation with a Transformer-GCNFormer Network"</h3>

  <p><strong>📚 출처:</strong> S Mehraban, V Adeli, B Taati – <em>Proceedings of the IEEE/CVF WACV</em>, <strong>2024</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://openaccess.thecvf.com/content/WACV2024/html/Mehraban_MotionAGFormer_Enhancing_3D_Human_Pose_Estimation_With_a_Transformer-GCNFormer_Network_WACV_2024_paper.html" style="color: #0078D4;">WACV 논문 링크</a></p>
  <p><strong>📄 PDF 다운로드:</strong> <a href="https://openaccess.thecvf.com/content/WACV2024/papers/Mehraban_MotionAGFormer_Enhancing_3D_Human_Pose_Estimation_With_a_Transformer-GCNFormer_Network_WACV_2024_paper.pdf" style="color: #0078D4;">PDF 파일 링크</a></p>
  <p><strong>🧠 코드 저장소:</strong> <a href="https://github.com/TaatiTeam/MotionAGFormer" style="color: #0078D4;">GitHub Repository</a></p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">

  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li><strong>3D 인간 포즈 추정 (3D Human Pose Estimation)</strong>을 개선하기 위해 Transformer와 Graph Convolutional Network (GCN)을 결합한 새로운 네트워크 구조를 제안.</li>
    <li>기존 Transformer 기반 모델이 <strong>글로벌 관계 (Global Relationships)</strong>는 잘 포착하지만 <strong>로컬 의존성 (Local Dependencies)</strong>을 정확하게 처리하지 못하는 한계를 극복.</li>
  </ul>

  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>Attention-GCNFormer (AGFormer) 블록:</strong><br>
      - 두 개의 병렬 스트림, 즉 <strong>Transformer 스트림</strong>과 <strong>GCNFormer 스트림</strong>을 사용하여 글로벌 및 로컬 관계를 동시에 포착.
    </li>
    <li>
      <strong>로컬 관계 (Local Relationships):</strong><br>
      - GCNFormer는 인접한 관절 (Joint) 간의 로컬 의존성을 학습하여 Transformer의 글로벌 관계를 보완.
    </li>
    <li>
      <strong>어댑티브 융합 (Adaptive Fusion):</strong><br>
      - Transformer와 GCNFormer의 출력을 통합하여 3D 구조를 보다 정확하게 재구성.
    </li>
    <li>
      <strong>다중 AGFormer 블록 스태킹:</strong><br>
      - 여러 AGFormer 블록을 스택하여 <strong>MotionAGFormer</strong> 네트워크를 구성.
    </li>
  </ol>

  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li><strong>입력:</strong> 2D 또는 3D 포즈 데이터.</li>
    <li><strong>Transformer 스트림:</strong> 전체 포즈 구조의 글로벌 관계 학습.</li>
    <li><strong>GCNFormer 스트림:</strong> 인접한 관절 간의 로컬 의존성 학습.</li>
    <li><strong>출력:</strong> 통합된 3D 포즈 재구성.</li>
  </ul>

  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li><strong>벤치마크 데이터셋:</strong> Human3.6M, MPI-INF-3DHP.</li>
    <li><strong>평균 재구성 오류 (P1 Error):</strong>
      <ul>
        <li>Human3.6M: <strong>38.4 mm</strong></li>
        <li>MPI-INF-3DHP: <strong>16.2 mm</strong></li>
      </ul>
    </li>
    <li><strong>효율성:</strong> 이전 최고 성능 모델 대비 <strong>1/4 수준의 파라미터</strong>와 <strong>3배 높은 계산 효율성</strong>.</li>
    <li><strong>속도-정확도 균형:</strong> 네 가지 다양한 변형(Variants)을 제공하여 다양한 응용 사례 지원.</li>
  </ul>

  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>Attention-GCNFormer 블록 도입:</strong> 글로벌 및 로컬 관계를 모두 효과적으로 학습.</li>
    <li>✅ <strong>적응형 융합:</strong> Transformer와 GCNFormer 출력을 최적화된 방식으로 통합.</li>
    <li>✅ <strong>효율성 최적화:</strong> 더 적은 파라미터로 뛰어난 성능 달성.</li>
  </ul>

  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🛡️ <strong>휴먼-로봇 상호작용 (HRI):</strong> 로봇이 사람의 움직임을 정확하게 인식.</li>
    <li>🎮 <strong>게임 및 영화 산업:</strong> 자연스러운 캐릭터 애니메이션 생성.</li>
    <li>🏃 <strong>스포츠 분석:</strong> 선수의 움직임을 정밀하게 분석.</li>
    <li>🩺 <strong>의료 및 재활:</strong> 환자의 자세 및 움직임 모니터링.</li>
  </ul>

  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>복잡한 환경 및 가려진 부분 (Occlusion)에서는 정확도 저하 가능.</li>
    <li>높은 계산 리소스를 요구할 수 있음.</li>
  </ul>

  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li><strong>MotionAGFormer</strong>는 Transformer와 GCNFormer의 장점을 결합하여 <strong>3D 인간 포즈 추정의 정확도와 효율성</strong>을 크게 향상시킴.</li>
    <li>다양한 환경과 애플리케이션에서 활용 가능성이 높음.</li>
  </ul>

  <p><strong>🗓️ 출판 연도:</strong> <strong>2024</strong></p>
</details>

---

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">TRAM: 논문 관련 정보</summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"TRAM: Global Trajectory and Motion of 3D Humans from in-the-Wild Videos"</h3>

  <p><strong>📚 출처:</strong> Y Wang, Z Wang, L Liu, K Daniilidis – <em>European Conference on Computer Vision (ECCV)</em>, <strong>2025</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://link.springer.com/chapter/10.1007/978-3-031-73247-8_27" style="color: #0078D4;">Springer Link</a></p>
  <p><strong>📄 PDF 다운로드:</strong> <a href="https://arxiv.org/pdf/2403.17346" style="color: #0078D4;">arXiv PDF 링크</a></p>
  
  <p><strong>🧠 저자 정보:</strong></p>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><a href="https://scholar.google.com/citations?user=kvpdLj0AAAAJ&hl=en" style="color: #0078D4;">Y Wang</a></li>
    <li><a href="https://scholar.google.com/citations?user=Wq7iaonvhawC&hl=en" style="color: #0078D4;">Z Wang</a></li>
    <li><a href="https://scholar.google.com/citations?user=HZPnJ9gAAAAJ&hl=en" style="color: #0078D4;">L Liu</a></li>
    <li><a href="https://scholar.google.com/citations?user=dGs2BcIAAAAJ&hl=en" style="color: #0078D4;">K Daniilidis</a></li>
  </ul>
  
  <p><strong>🌐 프로젝트 페이지:</strong> <a href="https://yufu-wang.github.io/tram4d/" style="color: #0078D4;">TRAM Project</a></p>
  <p><strong>📦 코드 저장소:</strong> <a href="https://github.com/yufu-wang/tram" style="color: #0078D4;">GitHub Repository</a></p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">

  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li><strong>3D 인간의 전역 궤적 (Global Trajectory)</strong>과 <strong>동작 (Motion)</strong>을 <strong>자연 영상 (In-the-Wild Videos)</strong>에서 정확하게 재구성.</li>
    <li>기존 SLAM (동시적 위치추정 및 지도작성) 시스템의 <strong>동적 인간 객체 문제 (Dynamic Human Object Issues)</strong>를 해결.</li>
    <li>카메라 움직임을 기준 척도 (Metric-Scale Reference)로 사용해 <strong>정확한 3D 인간 포즈와 궤적을 복원</strong>.</li>
  </ul>

  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>SLAM 최적화:</strong>
      <ul>
        <li>SLAM 시스템을 개선하여 <strong>동적 인간 객체로 인한 오류를 최소화</strong>.</li>
        <li>배경 (Scene Background)을 활용하여 <strong>동작 스케일 (Motion Scale)</strong>을 복원.</li>
      </ul>
    </li>
    <li>
      <strong>Video Transformer Model (VIMO):</strong>
      <ul>
        <li>비디오 기반 Transformer 모델을 도입해 <strong>신체 동작 (Kinematic Body Motion)</strong>을 회귀 예측.</li>
        <li>시간적 연속성 (Temporal Consistency)을 유지하며 프레임 간 변화를 포착.</li>
      </ul>
    </li>
    <li>
      <strong>두 동작의 통합:</strong>
      <ul>
        <li><strong>카메라 움직임</strong>과 <strong>인체 움직임</strong>을 결합해 정확한 <strong>세계 좌표계 (World Space)</strong>에서의 3D 인간 포즈 복원.</li>
      </ul>
    </li>
  </ol>

  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li><strong>입력:</strong> 자연 영상 (In-the-Wild Videos).</li>
    <li><strong>Step 1:</strong> SLAM을 사용하여 카메라 움직임과 배경 정보를 분석.</li>
    <li><strong>Step 2:</strong> VIMO를 통해 신체 동작을 프레임 단위로 예측.</li>
    <li><strong>Step 3:</strong> 카메라 궤적과 신체 동작을 통합하여 전역 좌표계에서 포즈를 복원.</li>
    <li><strong>출력:</strong> 정확한 3D 인간 궤적 및 움직임 재구성.</li>
  </ul>

  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li><strong>벤치마크 데이터셋:</strong> Human3.6M, 3DPW, EgoBody.</li>
    <li><strong>정확도 개선:</strong> 기존 방법 대비 <strong>글로벌 모션 오차 (Global Motion Error)</strong>가 크게 감소.</li>
    <li><strong>시간 일관성:</strong> 프레임 간 인간 움직임이 자연스럽고 일관되게 유지됨.</li>
    <li><strong>실제 환경 적용:</strong> 자연스러운 비디오 데이터셋에서도 강건한 성능 입증.</li>
  </ul>

  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>SLAM 최적화:</strong> 동적 인간 객체로 인한 오류를 효과적으로 완화.</li>
    <li>✅ <strong>Video Transformer (VIMO):</strong> 비디오 데이터를 활용해 시간적 연속성을 유지.</li>
    <li>✅ <strong>글로벌 궤적 복원:</strong> 카메라 궤적과 인간 움직임을 통합하여 현실적 3D 복원.</li>
    <li>✅ <strong>도메인 일반화:</strong> 다양한 자연 비디오에서 강력한 성능 검증.</li>
  </ul>

  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🛡️ <strong>스마트 감시 시스템:</strong> 자연스러운 인간 행동 분석 및 모니터링.</li>
    <li>🎮 <strong>게임 및 VR/AR:</strong> 실제 인간 움직임 기반의 캐릭터 애니메이션.</li>
    <li>🎥 <strong>영화 및 VFX:</strong> 사실적인 인간 움직임 재현.</li>
    <li>🤖 <strong>휴먼-로봇 상호작용:</strong> 로봇이 사람의 움직임을 정확하게 인식 및 추적.</li>
  </ul>

  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>극단적인 동작이나 복잡한 배경에서의 성능 저하 가능성.</li>
    <li>실시간 처리를 위한 추가 최적화 필요.</li>
  </ul>

  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li><strong>TRAM</strong>은 SLAM과 Transformer 모델을 통합하여 <strong>3D 인간 궤적 및 동작을 자연 비디오 데이터에서 정확하게 재구성</strong>.</li>
    <li>글로벌 좌표계에서의 일관된 움직임을 재현하며 다양한 응용 분야에서 활용 가능성을 입증.</li>
  </ul>

  <p><strong>🗓️ 출판 연도:</strong> <strong>2025</strong></p>
</details>

---

## RGB-D 기반 3D 포즈 추정

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">
    Impact of 3D Cartesian Positions and Occlusion on Self-Avatar Full-Body Animation in Virtual Reality: 논문 관련 정보
  </summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"Impact of 3D Cartesian Positions and Occlusion on Self-Avatar Full-Body Animation in Virtual Reality"</h3>

  <p><strong>🚨 코드:</strong> 코드 없음</p>
  <p><strong>📚 출처:</strong> G Fletcher, SA Ghasemzadeh, T Ravet – <em>Proceedings of Advanced Virtual Reality and Extended Reality</em>, <strong>2025</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://dial.uclouvain.be/pr/boreal/object/boreal:295626" style="color: #0078D4;">UCLouvain Repository</a></p>
  
  <p><strong>🧠 저자 정보:</strong></p>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><a href="https://scholar.google.com/citations?user=famd3lQAAAAJ&hl=en" style="color: #0078D4;">SA Ghasemzadeh</a></li>
  </ul>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">

  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li><strong>RGB-D 데이터 (RGB-Depth Data)</strong>를 사용하여 <strong>3D 인간 포즈 재구성 (3D Human Pose Reconstruction)</strong>의 정확도를 높임.</li>
    <li><strong>가려짐 (Occlusions)</strong>이 발생한 상황에서 인간 포즈의 정확한 추정을 목표로 함.</li>
    <li><strong>Self-Avatar Animation</strong>에서 <strong>3D Cartesian 위치 오류</strong>의 영향을 분석.</li>
  </ul>

  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>RGB-D 데이터 통합:</strong>
      <ul>
        <li>RGB 이미지와 깊이(Depth) 데이터를 융합하여 포즈 추정 정확도 향상.</li>
      </ul>
    </li>
    <li>
      <strong>Occlusion Handling Module:</strong>
      <ul>
        <li>가려짐 (Occlusion) 상황을 감지하고 예측된 포즈를 보정.</li>
        <li>비가려진 관절 정보를 기반으로 가려진 부분을 예측.</li>
      </ul>
    </li>
    <li>
      <strong>Self-Avatar Animation Pipeline:</strong>
      <ul>
        <li>3D Cartesian 좌표를 사용하여 사용자 아바타의 전체 움직임을 재구성.</li>
        <li>실시간 상호작용을 보장하기 위한 최적화된 알고리즘 적용.</li>
      </ul>
    </li>
  </ol>

  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li><strong>입력:</strong> RGB-D 비디오 프레임.</li>
    <li><strong>Step 1:</strong> RGB 이미지에서 초기 포즈를 예측.</li>
    <li><strong>Step 2:</strong> 깊이 데이터(Depth Map)를 사용하여 포즈를 3D 좌표로 변환.</li>
    <li><strong>Step 3:</strong> Occlusion Handling Module을 통해 가려진 관절의 위치를 예측.</li>
    <li><strong>Step 4:</strong> Self-Avatar Animation으로 최종 포즈를 시각화.</li>
    <li><strong>출력:</strong> 가려짐이 보정된 3D 인간 포즈 및 실시간 아바타 애니메이션.</li>
  </ul>

  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li><strong>벤치마크 데이터셋:</strong> Human3.6M, MPI-INF-3DHP.</li>
    <li><strong>오류 분석:</strong> 가려진 환경에서의 MPJPE (Mean Per Joint Position Error) 분석.</li>
    <li><strong>정확도 향상:</strong> RGB-D 데이터를 통합한 후 포즈 정확도가 18% 개선.</li>
    <li><strong>실시간 성능:</strong> 아바타 움직임이 실시간으로 재구성됨.</li>
  </ul>

  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>RGB-D 데이터 통합:</strong> RGB 이미지와 깊이 정보를 함께 사용해 포즈 정확도 개선.</li>
    <li>✅ <strong>Occlusion Handling Module:</strong> 가려진 포즈 부분을 예측하여 전체 포즈의 일관성 유지.</li>
    <li>✅ <strong>Self-Avatar Animation:</strong> 3D Cartesian 좌표 기반으로 아바타 움직임을 자연스럽게 재현.</li>
    <li>✅ <strong>실시간 성능:</strong> 아바타 애니메이션을 실시간으로 구현.</li>
  </ul>

  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🎮 <strong>VR/AR 게임:</strong> 사용자 움직임을 정확하게 반영한 아바타 애니메이션.</li>
    <li>🩺 <strong>의료 재활:</strong> 환자의 움직임 분석 및 물리 치료 보조.</li>
    <li>🛡️ <strong>스마트 감시 시스템:</strong> 가려진 상황에서도 인간 움직임 추적.</li>
    <li>🤖 <strong>로봇 상호작용:</strong> 인간 포즈를 실시간으로 재구성하여 로봇에 반영.</li>
  </ul>

  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>복잡한 가려짐 상황에서는 여전히 예측 오류 발생 가능성.</li>
    <li>실시간 시스템을 위한 추가 최적화 필요.</li>
    <li>다양한 조명 및 환경 조건에서 추가 실험 필요.</li>
  </ul>

  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li><strong>RGB-D 데이터를 활용한 3D 인간 포즈 재구성</strong>은 <strong>가려짐 (Occlusion) 문제를 효과적으로 해결</strong>하여 정확한 포즈 예측을 가능하게 함.</li>
    <li><strong>Self-Avatar Animation</strong>은 <strong>3D Cartesian 좌표</strong>를 통해 보다 자연스러운 인간 움직임을 시각화.</li>
    <li>VR, 의료, 로봇 등 다양한 분야에 응용될 가능성을 입증.</li>
  </ul>

  <p><strong>🗓️ 출판 연도:</strong> <strong>2025</strong></p>
</details>

---

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">
    A Real-time Multi-Person 3D Pose Estimation System from Multiple RGB-D Views for Live Streaming of 3D Animation: 논문 관련 정보
  </summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"A Real-time Multi-Person 3D Pose Estimation System from Multiple RGB-D Views for Live Streaming of 3D Animation"</h3>

  <p><strong>📚 출처:</strong> T Hwang, J Kim, M Kim, M Kim – <em>Proceedings of the 28th International Conference on Virtual Reality and 3D User Interfaces (VR)</em>, <strong>2023</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://dl.acm.org/doi/abs/10.1145/3581754.3584144" style="color: #0078D4;">ACM Digital Library</a></p>
  <p><strong>📄 DOI:</strong> <a href="https://doi.org/10.1145/3581754.3584144" style="color: #0078D4;">10.1145/3581754.3584144</a></p>
  
  <p><strong>🧠 저자 정보:</strong></p>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><a href="https://scholar.google.com/citations?user=HwangTProfile" style="color: #0078D4;">T Hwang</a></li>
    <li><a href="https://scholar.google.com/citations?user=KimJProfile" style="color: #0078D4;">J Kim</a></li>
    <li><a href="https://scholar.google.com/citations?user=KimMProfile" style="color: #0078D4;">M Kim</a></li>
  </ul>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">

  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li>다중 RGB-D 카메라 (<strong>Multiple RGB-D Views</strong>)를 활용해 실시간 다중 인물 3D 포즈 추정 (<strong>Multi-Person 3D Pose Estimation</strong>) 시스템을 설계.</li>
    <li>라이브 스트리밍 (<strong>Live Streaming</strong>) 애니메이션과 가상 현실 (<strong>VR</strong>) 애플리케이션을 목표로 함.</li>
    <li>중앙 서버와 엣지 장치 (<strong>Edge Devices</strong>) 간의 효율적인 데이터 통신을 통해 실시간 처리 성능을 최적화.</li>
  </ul>

  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>Edge Device Processing:</strong>
      <ul>
        <li>각 엣지 장치에서 2D 포즈 감지 (<strong>2D Pose Detection</strong>) 및 깊이 감지 (<strong>Depth Sensing</strong>)를 로컬로 수행.</li>
        <li>연산 부담을 분산 처리하여 네트워크 트래픽을 최소화.</li>
      </ul>
    </li>
    <li>
      <strong>Central Server Coordination:</strong>
      <ul>
        <li>중앙 서버는 다중 카메라 뷰의 좌표를 <strong>세계 좌표계 (World Plane)</strong>에 정렬.</li>
        <li><strong>멀티뷰 삼각측량 (Multi-view Triangulation)</strong>을 통해 3D 포즈를 재구성.</li>
      </ul>
    </li>
    <li>
      <strong>Person Matching Across Cameras:</strong>
      <ul>
        <li>각 카메라에서 검출된 2D 포즈 키포인트를 사람 단위로 매칭.</li>
        <li>거리를 기반으로 다중 카메라 뷰 통합 (<strong>Person Association</strong>).</li>
      </ul>
    </li>
    <li>
      <strong>Real-Time Streaming:</strong>
      <ul>
        <li>실시간으로 3D 포즈를 재구성하여 라이브 스트리밍 시스템에 통합.</li>
      </ul>
    </li>
  </ol>

  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li><strong>입력:</strong> 다중 RGB-D 카메라에서 얻은 비디오 및 깊이 데이터.</li>
    <li><strong>Step 1:</strong> 각 엣지 장치에서 2D 포즈 및 깊이 데이터 수집.</li>
    <li><strong>Step 2:</strong> 중앙 서버로 데이터를 전송.</li>
    <li><strong>Step 3:</strong> 중앙 서버에서 멀티뷰 삼각측량으로 3D 포즈 재구성.</li>
    <li><strong>Step 4:</strong> 좌표계 정렬 및 사람 매칭 수행.</li>
    <li><strong>출력:</strong> 실시간으로 다중 인물 3D 포즈 재구성 및 라이브 스트리밍.</li>
  </ul>

  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li><strong>벤치마크 환경:</strong> 자체 구축된 다중 RGB-D 카메라 설정.</li>
    <li>
      <strong>성능 평가:</strong>
      <ul>
        <li>실시간 처리 속도: 평균 30 FPS 유지.</li>
        <li>정확도: MPJPE (Mean Per Joint Position Error) 개선.</li>
      </ul>
    </li>
    <li><strong>라이브 스트리밍 테스트:</strong> PC 및 웹 애플리케이션을 통해 안정적인 스트리밍 성능 입증.</li>
  </ul>

  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>Edge-Central 분산 아키텍처:</strong> 엣지 장치와 중앙 서버 간의 협업 처리.</li>
    <li>✅ <strong>Multi-View Triangulation:</strong> 멀티 카메라 데이터를 통해 3D 포즈 정밀도 향상.</li>
    <li>✅ <strong>Real-Time Live Streaming:</strong> 실시간으로 다중 인물의 포즈를 재구성 및 스트리밍.</li>
    <li>✅ <strong>Person Matching Across Cameras:</strong> 거리 기반으로 신뢰성 높은 사람 매칭.</li>
  </ul>

  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🎮 <strong>게임 및 VR/AR:</strong> 다중 사용자의 움직임을 실시간으로 반영한 몰입형 환경 구축.</li>
    <li>🩺 <strong>의료 재활:</strong> 여러 환자의 자세와 움직임을 실시간으로 모니터링.</li>
    <li>🎥 <strong>영화 및 VFX:</strong> 라이브 애니메이션 제작 및 시각 효과.</li>
    <li>🛡️ <strong>스마트 감시:</strong> 다중 인물의 움직임을 실시간으로 감지 및 분석.</li>
  </ul>

  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>네트워크 대역폭 사용이 높은 환경에서는 성능 저하 가능성.</li>
    <li>가려짐 (Occlusion) 상황에서 일부 부정확한 결과 발생.</li>
    <li>더 많은 카메라 뷰를 통합하기 위한 스케일링 문제.</li>
  </ul>

  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li>이 시스템은 다중 RGB-D 뷰를 통합하여 실시간으로 다중 인물 3D 포즈를 재구성하며, 라이브 스트리밍 애플리케이션에서 효율적으로 작동.</li>
    <li>게임, 의료, 감시, 영화 등 다양한 산업 분야에서 광범위한 활용 가능성을 입증.</li>
  </ul>

  <p><strong>🗓️ 출판 연도:</strong> <strong>2023</strong></p>
</details>

---

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">
    RGB-D Fusion for Point-Cloud-Based 3D Human Pose Estimation: 논문 관련 정보
  </summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"RGB-D Fusion for Point-Cloud-Based 3D Human Pose Estimation"</h3>

  <p><strong>🚨 코드:</strong> 코드 없음</p>
  <p><strong>📚 출처:</strong> J Ying, X Zhao – <em>2021 IEEE International Conference on Image Processing (ICIP)</em>, <strong>2021</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://ieeexplore.ieee.org/abstract/document/9506588/" style="color: #0078D4;">IEEE Xplore 논문 링크</a></p>
  <p><strong>📄 PDF 다운로드:</strong> <a href="https://cvl.sjtu.edu.cn/Upload/Paper/Rgb-D%20Fusion%20For%20Point-Cloud-Based%203d%20Human%20Pose%20Estimation.pdf" style="color: #0078D4;">PDF 파일 링크</a></p>
  
  <p><strong>🧠 저자 정보:</strong></p>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><a href="https://scholar.google.com/citations?user=bsp_RSUAAAAJ&hl=en" style="color: #0078D4;">X Zhao</a></li>
  </ul>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">
  
  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li><strong>RGB-D 이미지 (RGB-Depth Images)</strong>를 활용하여 <strong>3D 인간 포즈 추정 (3D Human Pose Estimation)</strong>을 개선.</li>
    <li><strong>포인트 클라우드 (Point Cloud)</strong>를 사용해 RGB 이미지와 깊이 데이터를 통합.</li>
    <li><strong>정확한 3D 포즈 추정</strong>을 달성하여 기존 2D 기반 포즈 추정의 한계를 극복.</li>
  </ul>
  
  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>2D Pose Estimation Module:</strong>
      <ul>
        <li>RGB 이미지에서 <strong>2D 포즈 키포인트 (Keypoints)</strong>를 추출.</li>
        <li>고해상도 색상 정보를 사용해 초기 특징 학습.</li>
      </ul>
    </li>
    <li>
      <strong>RGB-D Fusion via Point Cloud:</strong>
      <ul>
        <li>RGB에서 얻은 <strong>색상 특징 (Color Features)</strong>과 깊이(Depth) 정보를 <strong>포인트 클라우드 (Point Cloud)</strong>로 통합.</li>
        <li>각 포인트를 개별적으로 학습.</li>
      </ul>
    </li>
    <li>
      <strong>3D Learning Module:</strong>
      <ul>
        <li>포인트 클라우드에서 <strong>포인트 단위 특징 (Point-wise Features)</strong>을 추출.</li>
        <li>복잡한 포즈 구조를 포착하도록 설계.</li>
      </ul>
    </li>
    <li>
      <strong>Dense Prediction Module:</strong>
      <ul>
        <li>포인트에서 <strong>Offset Vectors</strong> 및 <strong>Closeness Scores</strong>를 예측.</li>
        <li>각 포인트의 예측을 가중 평균하여 최종 3D 포즈를 생성.</li>
      </ul>
    </li>
  </ol>
  
  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li><strong>입력:</strong> RGB 이미지 및 깊이(Depth) 이미지.</li>
    <li><strong>Step 1:</strong> 2D Pose Estimation을 통해 RGB 이미지에서 키포인트 특징 추출.</li>
    <li><strong>Step 2:</strong> RGB와 Depth를 통합하여 Point Cloud로 변환.</li>
    <li><strong>Step 3:</strong> 3D Learning Module로 포인트 클라우드 특징 학습.</li>
    <li><strong>Step 4:</strong> Dense Prediction Module로 최종 포즈 키포인트를 예측.</li>
    <li><strong>출력:</strong> 최적화된 3D 인간 포즈 데이터.</li>
  </ul>
  
  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li><strong>벤치마크 데이터셋:</strong> MHAD, SURREAL.</li>
    <li><strong>성능 개선:</strong> 기존 RGB 기반 모델보다 더 낮은 <strong>Mean Per Joint Position Error (MPJPE)</strong>를 달성.</li>
    <li><strong>로컬 및 글로벌 특징 통합:</strong> 포즈 추정의 강건성 (Robustness) 및 정확도 향상.</li>
    <li><strong>포인트 클라우드 최적화:</strong> 포즈 예측 속도와 정확도가 균형을 이룸.</li>
  </ul>
  
  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>RGB-D 통합:</strong> RGB 이미지와 깊이 데이터를 포인트 클라우드로 변환하여 정보 손실 최소화.</li>
    <li>✅ <strong>3D Learning Module:</strong> 포인트 단위의 복잡한 특징을 학습하여 포즈 예측 정확도 향상.</li>
    <li>✅ <strong>Dense Prediction Module:</strong> Offset Vectors와 Closeness Scores로 포즈 키포인트 예측 최적화.</li>
    <li>✅ <strong>벤치마크 데이터셋 검증:</strong> MHAD 및 SURREAL 데이터셋에서 최첨단 (SOTA) 성능 달성.</li>
  </ul>
  
  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🛡️ <strong>스마트 감시 시스템:</strong> 인간 움직임을 3D로 정확하게 감지.</li>
    <li>🎮 <strong>게임 및 VR/AR:</strong> 현실적인 사용자 포즈 및 움직임 반영.</li>
    <li>🩺 <strong>의료 및 재활:</strong> 환자의 자세 및 움직임 분석.</li>
    <li>🤖 <strong>로봇 비전:</strong> 로봇이 인간의 3D 움직임을 실시간으로 인식.</li>
  </ul>
  
  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>포인트 클라우드 데이터가 밀집하지 않을 경우 정확도 저하 가능.</li>
    <li>극단적 가려짐 (Occlusion) 상황에서의 예측 오류 발생.</li>
    <li>실시간 처리를 위한 추가 최적화 필요.</li>
  </ul>
  
  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li><strong>RGB-D Fusion</strong>은 포인트 클라우드 기반 3D 인간 포즈 추정의 정확도와 효율성을 개선.</li>
    <li>RGB 이미지의 고해상도 특징과 깊이 데이터의 공간 정보를 통합하여 <strong>현실적이고 정확한 포즈 재구성</strong>을 달성.</li>
    <li>다양한 분야에서 응용 가능성을 입증.</li>
  </ul>
  
  <p><strong>🗓️ 출판 연도:</strong> <strong>2021</strong></p>
</details>

---

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">
    Real-time RGBD-Based Extended Body Pose Estimation: 논문 관련 정보
  </summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"Real-time RGBD-Based Extended Body Pose Estimation"</h3>

  <p><strong>📚 출처:</strong> R Bashirov, A Ianina, K Iskakov – <em>Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision (WACV)</em>, <strong>2021</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="http://openaccess.thecvf.com/content/WACV2021/html/Bashirov_Real-Time_RGBD-Based_Extended_Body_Pose_Estimation_WACV_2021_paper.html" style="color: #0078D4;">WACV 논문 링크</a></p>
  <p><strong>📄 PDF 다운로드:</strong> <a href="https://openaccess.thecvf.com/content/WACV2021/papers/Bashirov_Real-Time_RGBD-Based_Extended_Body_Pose_Estimation_WACV_2021_paper.pdf" style="color: #0078D4;">PDF 파일 링크</a></p>
  
  <p><strong>🧠 저자 정보:</strong></p>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><a href="https://scholar.google.com/citations?user=1pFCtykAAAAJ&hl=en" style="color: #0078D4;">R Bashirov</a></li>
    <li><a href="https://scholar.google.com/citations?user=YSYA9_4AAAAJ&hl=en" style="color: #0078D4;">K Iskakov</a></li>
  </ul>
  
  <p><strong>📦 코드 저장소:</strong> <a href="https://github.com/rmbashirov/rgbd-kinect-pose" style="color: #0078D4;">GitHub Repository</a></p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">
  
  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li><strong>RGB-D 카메라 (Kinect Azure RGB-D Camera)</strong>를 사용해 실시간 확장된 신체 포즈 추정 시스템을 개발.</li>
    <li><strong>파라메트릭 3D 인간 메쉬 모델 (SMPL-X)</strong>을 기반으로 신체 포즈, 손 포즈, 얼굴 표정을 통합적으로 예측.</li>
    <li>실시간 성능을 유지하면서 <strong>높은 정확도와 일관성</strong>을 보장.</li>
  </ul>
  
  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>SMPL-X Representation:</strong>
      <ul>
        <li>3D 변형 가능한 인간 메쉬 모델 (Parametric 3D Deformable Human Mesh Model, SMPL-X)을 사용하여 전체 신체, 손, 얼굴을 표현.</li>
      </ul>
    </li>
    <li>
      <strong>Body Pose Estimation:</strong>
      <ul>
        <li>Kinect Azure RGB-D 카메라로부터 얻은 데이터를 사용해 신체 포즈 파라미터를 예측.</li>
        <li><strong>AMASS Dataset</strong>과 사용자 정의 데이터셋(56명의 포즈 데이터)을 학습에 사용.</li>
      </ul>
    </li>
    <li>
      <strong>Hand Pose Estimation:</strong>
      <ul>
        <li>기존에 발표된 손 포즈 예측 모델을 직접 활용하여 신체 포즈와 손 포즈를 일관되게 통합.</li>
      </ul>
    </li>
    <li>
      <strong>Facial Expression Estimation:</strong>
      <ul>
        <li>대규모 <strong>Talking Face Dataset</strong>으로 훈련된 얼굴 표정 추출기를 사용.</li>
        <li>RGB-D 데이터를 통해 얼굴 표정 특징을 세밀하게 추출.</li>
      </ul>
    </li>
    <li>
      <strong>Temporal Smoothing:</strong>
      <ul>
        <li>시간적 일관성 (Temporal Consistency)을 유지하기 위해 연속된 프레임을 정교하게 조정.</li>
      </ul>
    </li>
  </ol>
  
  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li><strong>입력:</strong> RGB-D 데이터 (Kinect Azure).</li>
    <li><strong>Step 1:</strong> RGB-D 입력에서 랜드마크 검출.</li>
    <li><strong>Step 2:</strong> 신체, 손, 얼굴 표정 파라미터 추정.</li>
    <li><strong>Step 3:</strong> 시간적 일관성 보정 (Temporal Smoothing).</li>
    <li><strong>출력:</strong> 신체, 손, 얼굴 표정을 포함한 통합 3D 포즈 예측.</li>
  </ul>
  
  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li><strong>벤치마크 데이터셋:</strong> AMASS Dataset, 사용자 정의 Kinect Azure 데이터셋 (56명).</li>
    <li><strong>정확도 개선:</strong> RGB 전용 (RGB-Only) 방법보다 뛰어난 성능을 보임.</li>
    <li><strong>실시간 처리:</strong> GPU 서버에서 평균 <strong>25 FPS</strong> 유지.</li>
    <li><strong>성능 비교:</strong> 더 느린 RGB-D 최적화 기반 솔루션과 유사한 정확도 달성.</li>
  </ul>
  
  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>SMPL-X 모델 활용:</strong> 신체, 손, 얼굴을 통합적으로 표현.</li>
    <li>✅ <strong>RGB-D 기반 포즈 추정:</strong> RGB-Only 접근법보다 높은 정확도 제공.</li>
    <li>✅ <strong>Temporal Smoothing:</strong> 프레임 간 일관성 유지로 포즈의 안정성 향상.</li>
    <li>✅ <strong>실시간 처리:</strong> GPU 환경에서 초당 25 프레임으로 안정적인 실시간 예측.</li>
  </ul>
  
  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🎮 <strong>게임 및 VR/AR:</strong> 캐릭터 포즈와 표정을 실시간으로 정확하게 재현.</li>
    <li>🩺 <strong>의료 및 재활:</strong> 환자의 자세 및 표정 분석을 통해 치료 계획 수립.</li>
    <li>🛡️ <strong>스마트 감시 시스템:</strong> 비정상적인 움직임 및 행동 감지.</li>
    <li>🤖 <strong>로봇 비전:</strong> 인간 포즈 및 표정을 분석하여 로봇과 자연스러운 상호작용 구현.</li>
  </ul>
  
  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>가려짐 (Occlusion) 문제에서 성능 저하 가능성.</li>
    <li>다양한 환경 조건 (조명, 배경)에서의 추가 검증 필요.</li>
    <li>엣지 디바이스 환경에서의 성능 최적화 필요.</li>
  </ul>
  
  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li><strong>RGB-D 기반 실시간 확장 신체 포즈 추정 시스템</strong>은 SMPL-X 모델을 통해 신체, 손, 얼굴 포즈 및 표정을 통합적으로 예측.</li>
    <li>시간적 일관성을 보장하며 높은 정확도와 실시간 처리 속도를 달성.</li>
    <li>게임, 의료, 감시, 로봇 공학 등 다양한 응용 분야에 효과적으로 활용될 수 있음.</li>
  </ul>
  
  <p><strong>🗓️ 출판 연도:</strong> <strong>2021</strong></p>
</details>

---

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">
    A Method for 3D Human Pose Estimation based on 2D Keypoint Detection using RGB-D Information: 논문 관련 정보
  </summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"A Method for 3D Human Pose Estimation based on 2D Keypoint Detection using RGB-D Information"</h3>

  <p><strong>📚 출처:</strong> Seohee Park, Myunggeun Ji, Junchul Chun – <em>Journal of Internet Computing and Services</em>, <strong>2018</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://doi.org/10.7472/jksii.2018.19.6.41" style="color: #0078D4;">Journal of Internet Computing and Services 링크</a></p>
  <p><strong>📄 DOI:</strong> <a href="https://doi.org/10.7472/jksii.2018.19.6.41" style="color: #0078D4;">10.7472/jksii.2018.19.6.41</a></p>
  
  <p><strong>🧠 저자 정보:</strong></p>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><a href="https://scholar.google.com/citations?user=SeoheeParkProfile" style="color: #0078D4;">Seohee Park</a></li>
    <li><a href="https://scholar.google.com/citations?user=MyunggeunJiProfile" style="color: #0078D4;">Myunggeun Ji</a></li>
    <li><a href="https://scholar.google.com/citations?user=JunchulChunProfile" style="color: #0078D4;">Junchul Chun</a></li>
  </ul>
  
  <p><strong>📦 논문이 참고한 코드 저장소:</strong></p>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><a href="https://github.com/Vegetebird/MHFormer" style="color: #0078D4;">GitHub Repository</a></li>
    <li><a href="https://github.com/zczcwh/PoseFormer" style="color: #0078D4;">GitHub Repository</a></li>
  </ul>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">
  
  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li><strong>영상 감시 (Video Surveillance)</strong> 분야에서 <strong>딥러닝 기반의 인간 포즈 추정</strong>을 구현.</li>
    <li><strong>RGB-D 데이터 (RGB와 깊이 정보)</strong>를 활용하여 가려짐 (Occlusion) 문제를 해결.</li>
    <li><strong>2D 키포인트 검출 (2D Keypoint Detection)</strong>을 통해 인간 포즈를 예측한 후, <strong>3D 포즈로 확장</strong>.</li>
  </ul>
  
  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>RGB-D 데이터 활용:</strong>
      <ul>
        <li>기존 RGB 데이터에 깊이(Depth) 정보를 추가하여 객체 감지의 정확도를 높임.</li>
      </ul>
    </li>
    <li>
      <strong>2D 키포인트 검출:</strong>
      <ul>
        <li>컨볼루션 신경망 (CNN)을 사용하여 인간 관절 14개의 2D 키포인트를 검출.</li>
      </ul>
    </li>
    <li>
      <strong>3D 포즈 확장:</strong>
      <ul>
        <li>예측된 2D 키포인트를 바탕으로 3D 공간으로 확장하여 포즈를 재구성.</li>
        <li>깊이 정보를 활용해 <strong>Self-Occlusion 문제</strong>를 해결.</li>
      </ul>
    </li>
    <li>
      <strong>Occlusion 문제 해결:</strong>
      <ul>
        <li>객체가 다른 물체에 가려졌을 때 발생하는 가려짐 문제를 RGB-D 데이터의 깊이 정보를 활용하여 해결.</li>
      </ul>
    </li>
  </ol>
  
  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li><strong>입력:</strong> RGB 이미지 및 깊이(Depth) 데이터.</li>
    <li><strong>Step 1:</strong> RGB-D 데이터를 사용해 객체 감지 및 2D 키포인트 예측.</li>
    <li><strong>Step 2:</strong> CNN을 통해 14개 관절의 키포인트 검출.</li>
    <li><strong>Step 3:</strong> 깊이 정보를 통합하여 키포인트를 3D로 변환.</li>
    <li><strong>Step 4:</strong> Self-Occlusion 문제를 보정하여 최종 3D 포즈 생성.</li>
    <li><strong>출력:</strong> 3D 인간 포즈 예측 결과.</li>
  </ul>
  
  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li><strong>데이터셋:</strong> 자체 실험 환경 데이터셋 사용.</li>
    <li><strong>정확도 개선:</strong> 깊이 데이터를 추가함으로써 기존 2D 포즈 추정보다 정확도가 향상됨.</li>
    <li><strong>Occlusion 문제 해결:</strong> Self-Occlusion 현상이 보정되어 포즈 재구성의 신뢰도가 향상됨.</li>
    <li><strong>응용 사례:</strong> 인간 행동 인식, 비정상 행동 탐지.</li>
  </ul>
  
  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>RGB-D 데이터 통합:</strong> RGB와 깊이 데이터를 활용하여 가려짐 문제 해결.</li>
    <li>✅ <strong>2D 키포인트 기반 포즈 추정:</strong> 14개의 키포인트를 정확하게 검출.</li>
    <li>✅ <strong>3D 포즈 확장:</strong> 깊이 정보를 바탕으로 2D 키포인트를 3D 공간으로 확장.</li>
    <li>✅ <strong>Self-Occlusion 문제 해결:</strong> 가려짐 현상을 보정하여 포즈 정확도 개선.</li>
  </ul>
  
  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🛡️ <strong>스마트 감시 시스템:</strong> 비정상 행동 및 비상 상황 감지.</li>
    <li>🎮 <strong>게임 및 VR/AR:</strong> 현실감 있는 캐릭터 움직임 생성.</li>
    <li>🩺 <strong>의료 재활:</strong> 환자의 움직임 및 자세 분석.</li>
    <li>🤖 <strong>로봇 비전:</strong> 로봇이 인간의 3D 포즈를 정확히 인식 및 상호작용.</li>
  </ul>
  
  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li><strong>깊이 데이터 품질 저하:</strong> 깊이 센서의 품질에 따라 정확도가 저하될 수 있음.</li>
    <li><strong>가려짐이 심한 상황:</strong> 심각한 Occlusion이 있는 경우 정확도가 제한될 가능성.</li>
    <li><strong>실시간 처리 최적화:</strong> 실시간 시스템을 위해 계산 속도 개선 필요.</li>
  </ul>
  
  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li><strong>RGB-D 데이터를 활용한 3D 인간 포즈 추정</strong>은 Self-Occlusion 문제를 효과적으로 해결하며, 더 높은 정확도를 달성함.</li>
    <li><strong>2D 키포인트 검출과 3D 포즈 확장</strong>의 결합은 다양한 응용 분야에서 유용하게 활용될 수 있음.</li>
    <li><strong>스마트 감시, 의료, 로봇 기술</strong> 등 다양한 분야에 기여할 수 있는 가능성을 입증함.</li>
  </ul>
  
  <p><strong>🗓️ 출판 연도:</strong> <strong>2018</strong></p>
</details>

---

## 이벤트 카메라

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">
    Efficient Human Pose Estimation via 3D Event Point Cloud: 논문 관련 정보
  </summary>

  <h3 style="color: #0056b3; margin-top: 1em;">"Efficient Human Pose Estimation via 3D Event Point Cloud"</h3>

  <p><strong>📚 출처:</strong> Jiaan Chen, Hao Shi, Yaozu Ye, Kailun Yang, Lei Sun, Kaiwei Wang – <em>2022 International Conference on 3D Vision (3DV)</em>, <strong>2022</strong></p>
  <p><strong>🔗 논문 링크:</strong> <a href="https://arxiv.org/abs/2206.04511" style="color: #0078D4;">arXiv 링크</a></p>
  <p><strong>📄 DOI:</strong> <a href="https://doi.org/10.48550/arXiv.2206.04511" style="color: #0078D4;">10.48550/arXiv.2206.04511</a></p>
  
  <p><strong>🧠 저자 정보:</strong></p>
  <ul style="list-style-type: disc; margin-left: 1em;">
    <li><a href="https://scholar.google.com/citations?user=ChenJiaanProfile" style="color: #0078D4;">Jiaan Chen</a></li>
    <li><a href="https://scholar.google.com/citations?user=ShiHaoProfile" style="color: #0078D4;">Hao Shi</a></li>
    <li><a href="https://scholar.google.com/citations?user=YeYaozuProfile" style="color: #0078D4;">Yaozu Ye</a></li>
    <li><a href="https://scholar.google.com/citations?user=YangKailunProfile" style="color: #0078D4;">Kailun Yang</a></li>
    <li><a href="https://scholar.google.com/citations?user=SunLeiProfile" style="color: #0078D4;">Lei Sun</a></li>
    <li><a href="https://scholar.google.com/citations?user=WangKaiweiProfile" style="color: #0078D4;">Kaiwei Wang</a></li>
  </ul>
  
  <p><strong>📦 코드 저장소:</strong> <a href="https://github.com/MasterHow/EventPointPose" style="color: #0078D4;">GitHub Repository</a></p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">
  
  <h4 style="color: #0056b3;">1. 연구 목적</h4>
  <ul>
    <li><strong>이벤트 기반 (Event-Based)</strong> 데이터를 이용하여 <strong>3D 인간 포즈 추정 (3D Human Pose Estimation, HPE)</strong>을 실시간으로 수행.</li>
    <li>RGB 이미지 기반 포즈 추정의 한계를 극복하고, 극단적 환경(Extreme Scenes) 및 <strong>효율성 중심 조건 (Efficiency-Critical Conditions)</strong>에서 성능을 최적화.</li>
    <li>새로운 이벤트 표현 방법을 통해 <strong>메모리 사용량 및 계산 복잡도</strong>를 줄이면서 높은 정확도를 달성.</li>
  </ul>
  
  <h4 style="color: #0056b3;">2. 기술적 접근법</h4>
  <ol>
    <li>
      <strong>Rasterized Event Point Cloud Representation:</strong>
      <ul>
        <li>이벤트 포인트 클라우드를 소형 시간 단위(Time Slice)로 나누어 <strong>라스터화 (Rasterization)</strong>.</li>
        <li>통계적 특징을 사용해 3D 공간 정보를 유지하면서 메모리 및 계산 요구사항 최소화.</li>
      </ul>
    </li>
    <li>
      <strong>Backbone Network Integration:</strong>
      <ul>
        <li>세 가지 대표적인 백본 네트워크 적용:</li>
        <ul style="list-style-type: circle; margin-left: 2em;">
          <li><strong>PointNet:</strong> 높은 처리 속도.</li>
          <li><strong>DGCNN (Dynamic Graph CNN):</strong> 그래프 기반 특징 학습.</li>
          <li><strong>Point Transformer:</strong> 가장 높은 정확도 제공.</li>
        </ul>
      </ul>
    </li>
    <li>
      <strong>Linear Layer Decoder:</strong>
      <ul>
        <li>두 개의 선형 계층(Linear Layers)을 사용하여 최종 <strong>키포인트 (Keypoints)</strong> 위치 예측.</li>
      </ul>
    </li>
    <li>
      <strong>Optimization for Real-Time Inference:</strong>
      <ul>
        <li>NVIDIA Jetson Xavier NX와 같은 <strong>엣지 디바이스 (Edge Devices)</strong>에서 최적화.</li>
      </ul>
    </li>
  </ol>
  
  <h4 style="color: #0056b3;">3. 알고리즘 설계</h4>
  <ul>
    <li><strong>입력:</strong> 3D 이벤트 포인트 클라우드 데이터.</li>
    <li><strong>Step 1:</strong> 이벤트 데이터를 라스터화하여 포인트 클라우드로 변환.</li>
    <li><strong>Step 2:</strong> PointNet, DGCNN, Point Transformer 백본으로 포인트 클라우드 특징 학습.</li>
    <li><strong>Step 3:</strong> 두 개의 선형 디코더로 3D 키포인트 예측.</li>
    <li><strong>Step 4:</strong> 시간 일관성 (Temporal Consistency) 및 최종 포즈 최적화.</li>
    <li><strong>출력:</strong> 3D 인간 포즈 예측.</li>
  </ul>
  
  <h4 style="color: #0056b3;">4. 실험 및 결과</h4>
  <ul>
    <li><strong>벤치마크 데이터셋:</strong> DHP19 Dataset.</li>
    <li>
      <strong>정확도:</strong>
      <ul>
        <li>PointNet: MPJPE3D (Mean Per Joint Position Error) <strong>82.46mm</strong>.</li>
        <li>Point Transformer: 가장 높은 정확도 제공.</li>
      </ul>
    </li>
    <li><strong>처리 속도:</strong> NVIDIA Jetson Xavier NX 기준 <strong>12.29ms</strong>의 지연 시간 (latency).</li>
    <li><strong>리소스 사용:</strong> 효율적인 메모리 및 연산 최적화로 엣지 디바이스에서도 강력한 성능 제공.</li>
  </ul>
  
  <h4 style="color: #0056b3;">5. 주요 기여</h4>
  <ul>
    <li>✅ <strong>Rasterized Event Point Cloud:</strong> 시간 단위로 라스터화하여 계산 복잡도 최소화.</li>
    <li>✅ <strong>Backbone Integration:</strong> PointNet, DGCNN, Point Transformer의 비교 및 성능 분석.</li>
    <li>✅ <strong>Linear Decoder:</strong> 효율적인 키포인트 예측.</li>
    <li>✅ <strong>Real-Time Edge Processing:</strong> NVIDIA Jetson Xavier NX에서 12.29ms의 낮은 지연 시간 달성.</li>
  </ul>
  
  <h4 style="color: #0056b3;">6. 응용 분야</h4>
  <ul>
    <li>🎮 <strong>게임 및 VR/AR:</strong> 극단적 환경에서도 사용자 움직임을 정확하게 반영.</li>
    <li>🩺 <strong>의료 재활:</strong> 환자의 움직임과 자세를 실시간으로 분석.</li>
    <li>🛡️ <strong>스마트 감시:</strong> 어두운 환경이나 빠른 움직임에서도 신뢰할 수 있는 행동 감지.</li>
    <li>🤖 <strong>로봇 비전:</strong> 이벤트 카메라를 통해 빠르게 인간 행동을 인식.</li>
  </ul>
  
  <h4 style="color: #0056b3;">7. 한계 및 향후 연구 방향</h4>
  <ul>
    <li>낮은 해상도의 이벤트 포인트 클라우드에서 정확도가 제한될 가능성.</li>
    <li>빠른 움직임에서의 노이즈 발생 가능성.</li>
    <li>다양한 환경 및 더 큰 데이터셋에서 추가적인 검증 필요.</li>
  </ul>
  
  <h4 style="color: #0056b3;">8. 결론</h4>
  <ul>
    <li><strong>Efficient Human Pose Estimation via 3D Event Point Cloud</strong>는 이벤트 기반 데이터로 실시간 3D 포즈 예측을 위한 혁신적인 접근법을 제시.</li>
    <li><strong>속도와 정확도 모두를 달성</strong>하며 엣지 디바이스에서도 강력한 성능을 입증.</li>
    <li><strong>게임, 의료, 스마트 감시, 로봇 비전</strong> 등 다양한 분야에서의 활용 가능성을 확인.</li>
  </ul>
  
  <p><strong>🗓️ 출판 연도:</strong> <strong>2022</strong></p>
</details>

---

## 주제

- 사람의 3d 포즈 추정(HPE, Human Pose Estimation)   
앞에서는 선택한 논문들의 요약을 살펴보았다면 이제는 설명을 하려고 한다. 2024년 11월에 나온 리뷰 논문이 있어서 읽고 약간의 설명을 함께 붙여놓려고 한다. 

---

### 비교 논문 내용

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


### 현재 발생한 문제점, 

tram의 경우 DROID-SLAM이 쓰이는데, Droid-Slam의 경우 추론 모델만 11GB이다. 내가 가지고 있는 노트북 GPU는 8GB라서, 해결 방법을 찾든지 아니면, 다른 모델을 찾아야 할 것 같다.

## 고른 것

### RGB-D 기반의 3D 포즈 추정

#### 모델

|model 명|연도|특징|학회|input|output|단점|
|:--:|:--:|:--|:--|:--|:--|:--|
|**[Real-time RGBD-Based Extended Body Pose Estimation](https://github.com/rmbashirov/rgbd-kinect-pose)**|2021|RGB-D 카메라 기반 실시간 확장된 신체 포즈 추정|WACV|RGB-D 이미지|3D 포즈|가려짐 문제에 대한 한계점, 부자연성, 특정 디바이스 필요|
|**[HuMoR](https://github.com/davrempe/humor)**|2021|딥러닝 기반 자세 추정, 가려짐 강함|ICCV|RGB-D 이미지 <br> 3D 포인트 클라우드 <br> 2D 키포인트|3D 포즈|실시간성, 등 결과 데이터 없음|

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">논문 관련 정보!</summary>

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

### 2D image 기반 3D 포즈 추정

|model 명|연도|특징|학회|input|output|단점|
|:--:|:--:|:--|:--|:--|:--|:--|
|**[Multi-HMR](https://github.com/naver/multi-hmr)**|2025|백본 ViT-S 사용시 높은 성능|ICCV|RGB 이미지(Single RGB Image)|다중 인물의 3D 메쉬|복잡한 가려짐(Occlusion) 상황에서 정확도 저하 가능성, 고사양 장치 요구|
|**[TRAM](https://github.com/yufu-wang/tram?tab=readme-ov-file)**|2025|in-the-wild videos에서 인간의 3D 전역 궤적 및 동작 복원하기 위해 제안된 2단계 방법|ECCV|RGB 이미지|글로벌 좌표에서 동작|복잡한 가려짐(Occlusion) 상황에서 정확도 저하|
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

#### 관련 사이트

[paperwithcode_3D_HPE](https://paperswithcode.com/task/3d-multi-person-pose-estimation/latest)   
[CVPR](https://github.com/52CV/CVPR-2024-Papers?tab=readme-ov-file)   

### 비교 논문 리뷰

### "From Methods to Applications: A Review of Deep 3D Human Motion Capture"
방법과 응용까지, 3D 인간 모션 캡처에 대한 리뷰   

<details style="margin: 1em 0; padding: 0.5em; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1em; margin-bottom: 0.5em; color: #333;">논문 관련 정보!</summary>

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



[^1]: Y. Huang, M. Kaufmann, E. Aksan, M. J. Black, O. Hilliges, and G. Pons-Moll, “Deep inertial poser: Learning to reconstruct human pose from sparse inertial measurements in real time,” ACM Trans. Graph., vol. 37, no. 6, pp. 1–15, Dec. 2018. 가속도 에러는 모션의 변화량을 측정하여, 이 변화량이 너무 크거나 작을 때 에러로 판단한다.  

[^2]: T. Flash and N. Hogan, “The coordination of arm movements: An experimentally confirmed mathematical model,” J. Neurosci., vol. 5, no. 7, pp. 1688–1703, Jul. 1985. 지터 에러는 모션의 불안정성을 측정하여, 이 불안정성이 너무 크거나 작을 때 에러로 판단한다.   

---

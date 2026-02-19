---
title: WHAM Model
description: "Windows 11 + WSL 2 환경에서 WHAM 모델 설치와 실행 과정을 정리하고, 재현 시 주의사항을 함께 기록했습니다."
pubDate: 2025-02-28
tags:
- artificial-intelligence
- computer-vision
- pose-estimation
- python
- linux
- wsl
---

## 주제
WSL에서 conda 모델 돌리기  

| 목차 | 설명 | 링크 |
|:---:|:---:|:---:|
| 환경 | Window 11, WSL 2.0 |<a href="#환경">바로가기</a>|
| 코드 | WHAM Installation 코드 |<a href="#코드">바로가기</a>|
| 구현 코드 | WHAM Installation 코드 |<a href="#구현-코드">바로가기</a>|

### 환경 
- Window 11
- WSL 2.0

### 코드 

원본 Installation 코드는 아래와 같다.  
[github](https://github.com/yohanshin/WHAM/tree/main)  
[링크](https://wham.is.tue.mpg.de/)  

[pytorch_install](https://pytorch.org/get-started/locally/)  

### 구현 코드  

    
```bash
# Clone the repo
git clone https://github.com/yohanshin/WHAM.git --recursive
cd WHAM/

# Create Conda environment
conda create -n wham python=3.9 
conda activate wham

# Install PyTorch libraries
conda install pytorch==1.11.0 torchvision==0.12.0 torchaudio==0.11.0 cudatoolkit=11.3 -c pytorch

# Install PyTorch3D (optional) for visualization
conda install -c fvcore -c iopath -c conda-forge fvcore iopath
pip install pytorch3d -f https://dl.fbaipublicfiles.com/pytorch3d/packaging/wheels/py39_cu113_pyt1110/download.html

# Install WHAM dependencies
pip install -r requirements.txt

# Install ViTPose
pip install -v -e third-party/ViTPose

# Install DPVO
cd third-party/DPVO
wget https://gitlab.com/libeigen/eigen/-/archive/3.4.0/eigen-3.4.0.zip
unzip eigen-3.4.0.zip -d thirdparty && rm -rf eigen-3.4.0.zip
conda install pytorch-scatter=2.0.9 -c rusty1s
conda install cudatoolkit-dev=11.3.1 -c conda-forge

# 그냥 붙여넣기 하시면 됩니다. 
# ONLY IF your GCC version is larger than 10
conda install -c conda-forge gxx=9.5

pip install .

# 생긴 오류 : undefined symbol: iJIT_NotifyEvent
# 해결 코드 (원인 : mkl 버전 문제)
conda install mkl==2024.0

pip install .

# Download demo data
# 여기 다운로드 받기 전에 밑에 SMPL, SMPLify에 회원가입해야한다.
# 중간에 아이디 비번 치는 것이 있음 (등록 안하고 하면 모델 다운로드 안됨..)
bash fetch_demo_data.sh

```   
[SMPL](https://smpl.is.tue.mpg.de/), [SMPLify](https://smplify.is.tue.mpg.de/)   

### 돌리다가 그만 두었다.
- 왜냐하면, 모델이 너무 무거워서, 8GB GPU에서는 추론 조차 안되었다.
- Github Issue 들어가보면 알 수 있다.   

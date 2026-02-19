---
author_profile: true
categories:
- Projects
- Computer-Vision
classes: wide
date: 2025-01-20 11:15:00
excerpt: WSL 환경에서 AlphaPose 모델을 사용한 2D-3D 인간 자세 추정 프로젝트
last_modified_at: 2025-01-20 11:15:00
layout: single
sidebar:
  nav: docs
title: AlphaPose Model
toc: true
toc_icon: cog
toc_label: 목차
toc_sticky: true

tags:
- computer-vision
- pose-estimation
- ros
- python
- opencv
---

## 주제
WSL에서 AlphaPose 모델 돌리기  

### 설명
RGB에서 바로 3D 모델을 만드는 M3DHPE(Monocular 3D Human Pose Estimation) 모델은 주로 8GB가 넘었다.  
그래서 찾은 것이 2D Pose를 먼저 추출하고, 그것을 3D로 변환하는 방법이다.  


| 목차 | 설명 |
|:---:|:---:|
| [Window](#Window) | Window에서의 Multi-Cuda Setting |

### 환경 
- Window 11
- WSL 2.0

### 코드  

원본 Installation 코드는 아래와 같다.  
[github](https://github.com/MVIG-SJTU/AlphaPose)  
[논문](https://arxiv.org/abs/2211.03375)  

### 실행 코드

  
```bash
# pip install 방법 (AlphaPose 원래)
# 1. Install PyTorch
pip3 install torch torchvision --extra-index-url https://download.pytorch.org/whl/cu12.6
# Check torch environment by:  python3 -m torch.utils.collect_env

# 2. Get AlphaPose
git clone https://github.com/MVIG-SJTU/AlphaPose.git
cd AlphaPose
export PATH=/usr/local/cuda/bin/:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda/lib64/:$LD_LIBRARY_PATH
pip install cython
sudo apt-get install libyaml-dev

# 4. 이대로 
python -m pip install cython
pip install ninja easydict matplotlib opencv-python tensorboardx terminaltables visdom numpy scipy pyyaml cython_bbox

sudo apt-get install libyaml-dev
pip install --upgrade pip setuptools wheel
pip3 install git+https://github.com/Ambrosiussen/HalpeCOCOAPI.git#subdirectory=PythonAPI

python setup.py build develop

# 4. Install PyTorch3D (Optional, only for visualization)
conda install -c fvcore -c iopath -c conda-forge fvcore iopath
conda install -c bottler nvidiacub
pip install git+ssh://git@github.com/facebookresearch/pytorch3d.git@stable

# Create Pyenv virtual environment
pyenv install 3.9.21
pyenv virtualenv 3.9.21 alphapose
pyenv activate alphapose

# Install PyTorch libraries



```  



---
title: The AlphaPose model
description: A project using AlphaPose in WSL to explore 2D and 3D human pose estimation.
pubDate: 2025-01-20
category: vision-perception-neuroscience
subcategory: human-pose
type: setup-guide
tags:
- alphapose
- human-pose-estimation
- wsl
- cuda
- pytorch
researchArea: vision-pose-human-perception
researchFeatured: false
lang: en
slug: 2025-01-20-alphapose-model
translationKey: en-2025-01-20-alphapose-model
translatedPosts:
  ko-KR: 2025-01-20-alphapose-model
---

## Topic
Running AlphaPose on WSL

### Background
Most of the monocular 3D human pose estimation (M3DHPE) models I looked at needed more than 8 GB to produce 3D pose directly from RGB.\
I looked for an alternative that would first extract a 2D pose, then lift it into 3D.

| Contents | Description |
|:---:|:---:|
| [Windows](#windows) | Setting up multiple CUDA versions on Windows |

### Windows

### Environment
- Windows 11
- WSL 2.0

### Code

Here are the original installation commands.\
[github](https://github.com/MVIG-SJTU/AlphaPose)\
[Paper](https://arxiv.org/abs/2211.03375)

### Commands to run


```bash
# Original AlphaPose installation method using pip
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

# 4. Continue as shown
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

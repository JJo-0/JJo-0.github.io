---
title: "Multi-Cuda Setting"
classes: wide
toc: true
toc_sticky: true
toc_label: "-"
date: 2025-01-20 11:15:00
categories:
  - 정리
  - Dev
tags:
  - setting
  - python
  - linux
  - window
---

## 주제
Multi-Cuda Setting을 해야하는 상황이 왔다. 실제로 내가 했던 방법을 정리할 생각이다.  
연구소에서 많은 AI 모델을 돌려야하는데, 모델마다 요구하는 CUDA 버전이 달랐다.   

| 목차 | 설명 |
|:---:|:---:|
| [Window](#Window) | Window에서의 Multi-Cuda Setting |



### Window 

#### 환경 
- Window 11
- WSL 2.0

### CUDA ToolKit 설치 runfile (Local)
**설치 링크**
[11.8](https://developer.nvidia.com/cuda-11-8-0-download-archive?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=runfile_local)   
[12.4](https://developer.nvidia.com/cuda-12-4-0-download-archive?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=runfile_local)  
[12.6](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=runfile_local)  
[전체 Archive](https://developer.nvidia.com/cuda-toolkit-archive)

### GCC 설치
CUDA 11.8의 경우 기본으로 설치되어 있는 gcc 버전 13.3과는 호환되지 않아서 다운 그레이드 해야한다. 

**코드**
```bash
# ==============================
# 1) CUDA 기존 것 제거 (WSL 안에서)
# ==============================
sudo apt-get purge nvidia-cuda-toolkit # cuda 제거
sudo apt-get autoremove # 
sudo rm -rf /usr/local/cuda* 

# Gcc version 확인 코드
gcc --version

# gcc 12, 13 버전 설치
sudo apt-get install gcc-12 g++-12

# gcc 12 버전으로 변경
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-12 60 --slave /usr/bin/g++ g++ /usr/bin/g++-12

# update-alternatives: 이 명령어는 여러 버전의 프로그램을 관리, 사용자가 선택할 수 있도록 대체 항목을 설정하는 도구.
# --install : 대체 항목을 추가
# /usr/bin/gcc: 이 경로는 gcc라는 명령어의 기본 위치를 지정 
# gcc: 이 부분은 대체 항목의 이름을 지정
# /usr/bin/gcc-12: 이 경로는 실제로 사용할 GCC의 버전(여기서는 GCC 12)의 위치를 지정
# 60: 이 숫자는 우선 순위 나타낸다. 여러 개의 대체 항목이 있을 때, 숫자가 높을수록 우선적으로 선택된다. 여기서 GCC 12의 우선 순위를 60 설정했다. 
# --slave /usr/bin/g++ g++ /usr/bin/g++-12: 이 부분은 "슬레이브" 항목을 설정하는 것입니다. 슬레이브 항목은 주 항목(여기서는 gcc)이 선택될 때 자동으로 선택되는 항목입니다. 즉, gcc가 gcc-12로 설정되면, g++도 자동으로 g++-12로 설정
  # /usr/bin/g++: 슬레이브 항목의 기본 위치입니다.
  # g++: 슬레이브 항목의 이름입니다.
  # /usr/bin/g++-12: 슬레이브 항목이 가리키는 실제 프로그램의 경로입니다.

# gcc 12 버전으로 변경 확인
gcc --version

# ==============================
# 2) Cuda 버전별 설치
# ==============================
# cuda 11.8 설치
sudo sh cuda_11.8.0_520.61.05_linux.run

# gcc 13 버전으로 변경
sudo apt install gcc-13 g++-13
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-13 70 --slave /usr/bin/g++ g++ /usr/bin/g++-13

```



## 나의 환경 설정

WSL에서 CUDA 설정 링크 참조 : [WSL](https://cjkangme.github.io/posts/2024-02-15-wsl2로-cuda-환경-설정하기-cudacudnn-설치까지/)  
WSL 관련 프로그램 설치 : [WSL_GUI_앱_실행](https://learn.microsoft.com/ko-kr/windows/wsl/tutorials/gui-apps)



```bash
# > ~/.bashrc file 내부

#####################
### User Setting ###
#####################

# Pyenv 초기화
export PATH="/home/jo/.pyenv/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv virtualenv-init -)" # Miniforge3 경로 추가
export PATH="/home/jo/.pyenv/versions/miniforge3-24.11.0-1/bin:$PATH"

alias update='sudo apt update && sudo apt upgrade -y && sudo apt autoclean -y && sudo apt autoremove -y'

function switch_cuda {
    local version=$1
    local gcc_version

    case "$version" in
        11.3)
            gcc_version="gcc-9"
            cuda_path="/usr/local/cuda-11.3"
            ;;
        11.8)
            gcc_version="gcc-12"
            cuda_path="/usr/local/cuda-11.8"
            ;;
        12.4)
            gcc_version="gcc-13"
            cuda_path="/usr/local/cuda-12.4"
            ;;
        12.6)
            gcc_version="gcc-13"
            cuda_path="/usr/local/cuda-12.6"
            ;;
        *)
            echo "지원되지 않는 CUDA 버전입니다. 사용 가능한 버전: 11.3, 11.8, 12.4, 12.6"
            return 1
            ;;
    esac

    # GCC 전환
    sudo update-alternatives --set gcc /usr/bin/$gcc_version

    # CUDA 전환
    sudo update-alternatives --set cuda $cuda_path

    # 환경 변수 설정
    export PATH=$cuda_path/bin:$PATH
    export LD_LIBRARY_PATH=$cuda_path/lib64:$LD_LIBRARY_PATH

    echo "CUDA 버전 $version 로 전환되었습니다."
    gcc --version
    g++ --version
    nvcc --version
}

```

#### 명령어

```bash
#cudnn version 확인
dpkg -l | grep cudnn
```

### Cuda 란?

CUDA(Compute Unified Device Architecture)는 NVIDIA가 개발한 병렬 컴퓨팅 플랫폼. CUDA를 통해 개발자들은 GPU의 병렬 처리 능력을 활용할 수 있게 되었습니다. CUDA는 GPU의 가상 명령어 집합과 병렬 연산 요소에 직접 접근할 수 있는 소프트웨어 계층을 제공하며, C 언어 등 표준 언어로 GPU 기반의 병렬 처리 알고리즘을 작성할 수 있습니다  
  
1. CUDA의 주요 특징은 다음과 같습니다.  
   1. 첫째, GPU의 병렬 처리 기능을 활용하여 계산해 다양한 분야에서 10배 이상의 성능 향상 시킴
   2. 둘째, 흩뿌린 읽기, 고속 공유 메모리, 정수 및 비트 단위 연산 지원 등 GPU 고유의 특성을 활용 가능
   3. 셋째, 저수준 API와 고수준 API를 모두 제공하여 개발자의 편의성 상승
   
CUDA의 개념, 특성, 버전별 차이점, 설치 및 구성 방법, 멀티 CUDA 환경 구축 등   
CUDA 플랫폼에 대한 전반적인 내용을 다루고자 합니다. 이를 통해 CUDA의 중요성과 활용 방법을 소개하고, 관련 기술에 대한 이해를 높이고자 합니다.   

### CUDA 개념

CUDA(Compute Unified Device Architecture)는 NVIDIA가 개발한 병렬 컴퓨팅 플랫폼이다.  
GPU는 CPU와 달리 병렬 다수 코어 구조를 가지고 있어, 수천 개의 스레드를 동시에 실행할 수 있다.  

### CUDA 특징  

1. GPU 고유 특성을 활용해 병렬 처리에 최적화된 환경을 제공합니다.  
2. 디바이스 상에서 읽기·쓰기 속도가 호스트보다 빠르며, 공유 메모리를 통한 고속 데이터 처리가 가능합니다.  

### CUDA 버전별 차이점  

CUDA는 2007년 1.0부터 시작하여 2.0(2008), 3.0(2010), 4.0(2011), 5.0(2012), 6.0(2014), 7.0(2015), 8.0(2016), 9.0(2017), 10.0(2018), 11.0(2020) 등으로 꾸준히 발전해 왔습니다. 각 버전에서는 병렬 처리·메모리 관리 개선, SIMD(Single Instruction, Multiple Data) 처리 성능 향상, 에너지 효율 개선, 새로운 GPU 아키텍처 지원 등이 추가되었습니다.  
  
버전별 하드웨어 및 소프트웨어 호환성도 중요합니다. 예를 들어, 특정 버전은 특정 GPU 아키텍처에 최적화되며, 운영 체제·컴파일러·라이브러리와의 호환성을 구성 시 반드시 확인해야 합니다.  

### CUDA 설치 고려사항  

1. 시스템 요구사항과 호환성: 최소 GPU 아키텍처와 커널 버전을 만족해야 하며, Pascal 이상의 GPU 사용이 권장됩니다.  
2. NVIDIA 드라이버 설치: Windows에서는 최신 x86 프로덕션 드라이버(R495 이상), Linux 환경에서는 CUDA Toolkit 패키지를 사용합니다.  
3. 개발 환경 준비: Windows, Linux, WSL 등 각 환경마다 설치 법이 다르므로 유의해야 하며, 일부 개발자 도구나 Unified Memory 기능에 제한 사항이 있을 수 있습니다.  

### 멀티 CUDA 환경 구성  
아래는 Windows, Linux, WSL 등에서 CUDA를 병행 사용하기 위한 핵심 사항입니다.

- Windows  
  - 최신 프로덕션 드라이버(R495 이상) 설치.  
  - WSL 2 설정 후 Ubuntu 등 Linux 배포판을 설치해 CUDA Toolkit 이용.  
  - 드라이버 충돌 없이 멀티 GPU 환경을 구성 가능.  

- Linux  
  - 준수하는 GPU 아키텍처 및 최신 패키지 확인.  
  - CUDA Toolkit 설치 시, 기존 드라이버 충돌를 피해야 함.  
  - Maxwell GPU 미지원 이슈가 있으나 실제로 동작할 수도 있음.  

- WSL  
  - Windows 드라이버만 설치하면 됨. WSL 내부에서 Linux 드라이버 추가 설치 필요 없음.  
  - nvidia-smi 명령어 위치, Unified Memory 제약, 멀티 GPU 선택 제한 등에 유의해야 함.  
  - 커널 버전(4.19.121 이상, 5.10.16.3 이상 권장) 및 Pascal 이상의 GPU 요구.  

### 자주 발생하는 문제와 해결책  
- 경쟁 상태(Race Condition): 공유 자원 접근 시 동기화 기법 사용.  
- 교착 상태(Deadlock): 자원 할당 순서 지정으로 스레드 간 충돌 방지.  
- 라이브락(Livelock): 타임아웃 등 기법으로 스레드 간 상호작용 최소화.  
- 확장성(Scalability): 알고리즘 최적화·메모리 효율화·데이터 분할로 병렬 처리 성능 향상.  

### 추가 학습 자료  
- NVIDIA CUDA 공식 문서: https://docs.nvidia.com/cuda/  
- 서적: “CUDA by Example” (Jason Sanders, Edward Kandrot)  
- 포럼: https://forums.developer.nvidia.com/c/gpu-computing/cuda/  
- Stack Overflow CUDA 태그: https://stackoverflow.com/questions/tagged/cuda  

### 결론  

CUDA는 병렬 컴퓨팅 분야에서 중요한 역할을 담당하며, 다양한 버전과 아키텍처를 통해 GPU의 강력한 성능을 활용할 수 있게 합니다. Windows·Linux·WSL 등 여러 환경에서 사용 가능하며, 설치 시 드라이버·GPU 아키텍처 호환성·개발 툴 제한 사항 등을 주의해야 합니다. 앞으로도 CUDA는 인공지능·머신러닝·데이터 과학 등 분야에서 발전을 거듭하며, GPU 병렬 처리 기술의 핵심으로 자리 잡을 것입니다.

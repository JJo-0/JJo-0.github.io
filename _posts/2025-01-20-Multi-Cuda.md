---
title: "Multi-Cuda Setting"
classes: wide
toc: true
toc_sticky: true
toc_label: "-"
date: 2025-01-20 11:15:00
categories:
  - 정리
  - 개발
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
1. 흩뿌린 읽기, 고속 공유 메모리, 정수 및 비트 단위 연산 지원 등 GPU 고유의 특성을 활용 가능 
2. 디바이스 상의 읽기, 쓰기 속도가 호스트보다 더 빠르다.

CUDA 버전별 차이점
CUDA의 주요 버전 및 출시 연도.  
CUDA 1.0은 2007년에 처음 공개,  
CUDA 2.0(2008년),  
CUDA 3.0(2010년),  
CUDA 4.0(2011년),   
CUDA 5.0(2012년),   
CUDA 6.0(2014년),   
CUDA 7.0(2015년),   
CUDA 8.0(2016년),   
CUDA 9.0(2017년),   
CUDA 10.0(2018년),   
CUDA 11.0(2020년)   
등으로 지속적인 업데이트가 이루어지고 있다. 

각 CUDA 버전의 주요 기능 및 성능 변화를 살펴보면 다음과 같습니다.  
CUDA 2.0에서는 GPU 직접 액세스, 동적 병렬 처리, 동적 메모리 할당 등이 추가되었고, 3.0에서는 병렬 처리 및 메모리 관리 기능이 개선되었습니다. 이후 버전에서는 SIMD(Single Instruction, Multiple Data) 처리 성능 향상, 에너지 효율 개선, 메모리 관리 최적화, 새로운 GPU 아키텍처 지원 등 다양한 발전이 있었습니다 4.

CUDA 버전별 하드웨어 및 소프트웨어 호환성은 매우 중요한 고려사항입니다. 각 CUDA 버전은 특정 NVIDIA GPU 아키텍처를 지원하며, 이에 따라 하드웨어 호환성이 달라집니다. 또한 운영 체제, 컴파일러, 라이브러리 등 소프트웨어 의존성도 버전마다 다르기 때문에 개발 환경 구축 시 이를 확인해야 합니다 17.

CUDA 설치 고려사항
CUDA 설치 시 고려해야 할 사항은 다음과 같습니다.

시스템 요구사항 및 호환성 확인:
WSL 2에서 GPU 가속은 NVIDIA의 Pascal 및 이후 GPU 아키텍처의 GeForce와 Quadro 제품군에서 WDDM 모드로 지원됩니다. 최신 WSL 커널 버전 4.19.121 이상을 사용해야 하며, 성능과 기능 향상을 위해 5.10.16.3 이상 버전 사용을 권장합니다 21. Windows 11을 사용하는 경우 Windows Insider 프로그램에 가입할 필요가 없습니다 21.

NVIDIA 드라이버 및 도구 설치:
CUDA 사용을 위해서는 NVIDIA의 최신 Windows x86 프로덕션 드라이버(R495 이상)를 설치해야 합니다 22. NVIDIA-SMI는 WSL 2에서 제한적인 기능 세트를 제공하므로, 드라이버 이외의 추가 Linux 드라이버를 설치해서는 안 됩니다 22.

개발 환경 구축 및 설정:
CUDA Toolkit은 NVIDIA에서 제공하는 WSL-Ubuntu 패키지를 통해 설치할 수 있습니다 22. 이 패키지에는 Linux NVIDIA 드라이버가 포함되어 있지 않으므로, 기존 WSL 환경의 NVIDIA 드라이버와 충돌이 발생하지 않습니다. 개발자들은 CUDA Toolkit을 통해 Linux 기반의 CUDA 애플리케이션을 개발할 수 있습니다.

멀티 CUDA 환경 구성 - Windows
Windows 환경에서 CUDA를 설치하고 구성하는 방법은 다음과 같습니다.

먼저 NVIDIA의 최신 Windows x86 프로덕션 드라이버(R495 이상)를 설치해야 합니다. 이것이 WSL 2에서 CUDA를 사용하기 위해 필요한 유일한 드라이버입니다. Linux NVIDIA 드라이버는 WSL 2 내부에 매핑되어 있으므로 별도로 설치할 필요가 없습니다.

다음으로 WSL 2를 설치하고 Ubuntu 등의 Linux 개발 환경을 구축합니다. 이를 통해 Windows 내에서 네이티브 Linux 환경을 구성할 수 있으며, CUDA 애플리케이션을 빌드하고 실행할 수 있습니다.

마지막으로 CUDA Toolkit for Linux x86을 WSL-Ubuntu 패키지를 사용하여 설치합니다. 이 패키지에는 NVIDIA Linux 드라이버가 포함되어 있지 않으므로, WSL 2 환경의 드라이버를 덮어쓰지 않습니다.

이 과정에서 발생할 수 있는 몇 가지 문제와 해결책은 다음과 같습니다:

GPU 아키텍처와 WSL 커널 버전이 최소 요구사항을 충족하는지 확인해야 합니다.
CUDA 개발자 도구(프로파일러, 디버거 등)의 호환성 문제를 해결해야 합니다.
멀티 GPU 시스템을 구성하고 GPU 장치 선택의 제한사항을 해결해야 합니다.
이와 같은 단계를 따라 Windows 환경에서 CUDA 개발 및 배포를 성공적으로 수행할 수 있습니다. 2221

멀티 CUDA 환경 구성 - Linux
Linux 환경에서 CUDA를 설치하고 구성하는 방법은 다음과 같습니다.

먼저, NVIDIA의 최신 Linux x86 CUDA Toolkit 패키지를 설치해야 합니다. CUDA Toolkit for Linux x86 WSL-Ubuntu 패키지를 사용하면 Linux NVIDIA 드라이버가 포함되어 있지 않아 WSL 2 환경의 기존 드라이버와 충돌이 발생하지 않습니다 22.

이 패키지를 설치하면 WSL-Ubuntu 내에서 CUDA 개발 도구와 라이브러리를 사용할 수 있습니다. 단, CUDA 개발자 도구 중 일부는 아직 WSL 2에서 제한적으로 지원되므로 이점을 유의해야 합니다 22.

Linux 환경에서 CUDA를 사용할 때 고려해야 할 주요 이슈와 해결 방안은 다음과 같습니다. 첫째, Maxwell GPU는 공식적으로 지원되지 않지만 여전히 동작할 수 있으므로 Pascal 이상의 GPU 사용을 권장합니다 21. 둘째, Unified Memory의 전체 기능과 Pinned system memory 사용에 제한이 있으므로 이를 고려해야 합니다 21. 셋째, nvidia-smi 명령어의 위치가 다르므로 /usr/lib/wsl/lib/nvidia-smi를 사용해야 합니다 21.

이와 같은 방법으로 Linux 환경에서 CUDA를 성공적으로 설치하고 활용할 수 있습니다.

멀티 CUDA 환경 구성 - WSL
WSL 2 환경에서 CUDA를 설치하고 구성하는 방법은 다음과 같습니다.

먼저, WSL 2에서 GPU 가속을 지원하는 시스템 요구사항을 확인해야 합니다. WSL 2는 Pascal 및 이후 GPU 아키텍처의 GeForce와 Quadro 제품군에서 WDDM 모드로 GPU 가속을 지원합니다. 또한 최신 WSL 커널 버전 4.19.121 이상을 사용해야 하며, 성능과 기능 향상을 위해 5.10.16.3 이상 버전 사용이 권장됩니다 21.

다음으로 NVIDIA의 최신 Windows x86 프로덕션 드라이버를 설치해야 합니다. 이것이 WSL 2에서 CUDA를 사용하기 위해 필요한 유일한 드라이버입니다 22.

그 다음 CUDA Toolkit을 설치합니다. CUDA WSL-Ubuntu 패키지를 사용하면 기존 NVIDIA 드라이버와 충돌하지 않고 CUDA Toolkit만 설치할 수 있습니다 22.

이 과정에서 발생할 수 있는 주요 이슈는 다음과 같습니다. Maxwell GPU는 공식적으로 지원되지 않지만 여전히 동작할 수 있으므로 Pascal 이상의 GPU 사용을 권장합니다 21. Unified Memory의 전체 기능과 Pinned system memory 사용에 제한이 있으며, nvidia-smi 명령어의 위치가 다릅니다 21. 또한 멀티 GPU 시스템에서 특정 GPU를 선택할 수 없습니다 21.

이와 같은 방법으로 WSL 2 환경에서 CUDA를 성공적으로 설치하고 활용할 수 있습니다.

질문 정리
CUDA 사용 시 자주 발생하는 문제와 해결 방안은 다음과 같습니다:

경쟁 상태(Race Condition)
설명: 여러 스레드가 공유 자원에 동시에 접근하여 발생하는 문제
해결 방안: 동기화 메커니즘(뮤텍스, 세마포어 등)을 사용하여 공유 자원에 대한 접근을 제어
교착 상태(Deadlock)
설명: 여러 스레드가 서로의 자원을 기다리며 발생하는 문제
해결 방안: 자원 할당 순서를 정해 스레드 간 자원 요청 순서를 관리
라이브락(Livelock)
설명: 스레드가 서로의 상태 변화를 감지하여 계속해서 자원을 요청하는 문제
해결 방안: 스레드 간 상호작용을 최소화하고, 타임아웃 등의 기법을 사용
확장성(Scalability) 문제
설명: 코어 수 증가에 따른 성능 향상이 선형적으로 이루어지지 않는 문제
해결 방안: 알고리즘 최적화, 메모리 사용 효율화, 데이터 분할 및 로드밸런싱 등
CUDA에 대한 추가 학습 자료와 관련 커뮤니티는 다음과 같습니다:

NVIDIA CUDA 공식 문서: https://docs.nvidia.com/cuda/
CUDA 프로그래밍 관련 서적: "CUDA by Example" by Jason Sanders, Edward Kandrot
CUDA 개발자 포럼: https://forums.developer.nvidia.com/c/gpu-computing/cuda/
Stack Overflow의 CUDA 태그: https://stackoverflow.com/questions/tagged/cuda
결론

NVIDIA의 병렬 컴퓨팅 플랫폼인 CUDA에 대해 살펴보았습니다. CUDA는 GPU의 병렬 처리 능력을 활용하여 다양한 분야에서 뛰어난 성능 향상을 가져왔으며, 개발자들에게 GPU 고유의 특성을 활용할 수 있는 기회를 제공하고 있습니다.

CUDA 버전별 차이점을 살펴보면, 시간이 지남에 따라 병렬 처리 및 메모리 관리 기능이 개선되었고, SIMD 처리 성능과 에너지 효율성이 향상되었습니다. 또한 새로운 GPU 아키텍처에 대한 지원이 추가되었습니다. 이러한 발전은 CUDA가 다양한 하드웨어와 소프트웨어 환경에서 효과적으로 활용될 수 있게 만들었습니다.

CUDA 설치 및 구성 시에는 시스템 요구사항과 호환성, NVIDIA 드라이버 및 도구 설치, 개발 환경 구축 등의 고려사항이 중요합니다. Windows, Linux, WSL 등 다양한 플랫폼에서 CUDA를 활용할 수 있으며, 각 환경에 맞는 설치 및 구성 방법을 숙지해야 합니다.

앞으로 CUDA는 인공지능, 머신러닝, 데이터 과학 등 다양한 분야에서 더욱 널리 활용될 것으로 예상됩니다. GPU 성능과 병렬 처리 기술의 지속적인 발전으로 CUDA의 활용 범위와 영향력이 확대될 것입니다. 또한 하드웨어-소프트웨어 통합, 에너지 효율성 향상, 사용자 경험 개선 등의 측면에서 CUDA의 발전이 이루어질 것으로 보입니다. CUDA는 앞으로도 병렬 컴퓨팅 기술 발전의 핵심적인 역할을 할 것으로 기대됩니다.

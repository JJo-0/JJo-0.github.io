---
author_profile: true
categories:
- Areas
- System-Setup
date: 2024-04-05 02:06:00
excerpt: <details>...
layout: single
title: Raspberry pi 5 설정
toc: true
toc_label: Raspberry pi 5 설정
toc_sticky: true

tags:
- system-setup
- raspberry-pi
- linux
- ubuntu
---

# 🍽️ Raspberry pi 5 설정   
라즈베리파이 5 시키고 환경설정을 정리하기 위해 글을 끄적여본다.    

## 라즈베리파이 5 구매
라즈베리파이 5를 구매하였다, 졸업작품을 제작하기 위해서 컴퓨터 파워가 필요한데, 전력을 적게 쓰면서 사용할 수 있는 미니 PC 중에서 소스가 많고 사용하기 좋은 Raspberry pi 5를 선택하였다.  

## 라즈베리파이 5 스펙
[관련 링크](https://www.raspberrypi.com/products/raspberry-pi-5/)  

<details>
  <summary>**스펙 간략하게**</summary>
  Broadcom BCM2712 2.4GHz quad-core 64-bit Arm Cortex-A76 CPU, with cryptography extensions, 512KB per-core L2 caches and a 2MB shared L3 cache  
  VideoCore VII GPU, supporting OpenGL ES 3.1, Vulkan 1.2  
  Dual 4Kp60 HDMI® display output with HDR support  
  4Kp60 HEVC decoder  
  LPDDR4X-4267 SDRAM (2GB, 4GB, and 8GB)  
  Dual-band 802.11ac Wi-Fi®  
  Bluetooth 5.0 / Bluetooth Low Energy (BLE)  
  microSD card slot, with support for high-speed SDR104 mode  
  2 × USB 3.0 ports, supporting simultaneous 5Gbps operation  
  2 × USB 2.0 ports  
  Gigabit Ethernet, with PoE+ support (requires separate PoE+ HAT)  
  2 × 4-lane MIPI camera/display transceivers  
  PCIe 2.0 x1 interface for fast peripherals (requires separate M.2 HAT or other adapter)  
  5V/5A DC power via USB-C, with Power Delivery support  
  Raspberry Pi standard 40-pin header  
  Real-time clock (RTC), powered from external battery  
  Power button  
</details>

## 라즈베리파이 5 OS 설치
라즈베리파이 5에 OS를 설치하기 위해서는 라즈베리파이 공식 홈페이지에서 제공하는 Raspberry Pi Imager를 사용하면 된다.

### 초기 세팅
1. 라즈베리파이 공식 홈페이지에서 Raspberry Pi Imager를 다운로드 받는다.
2. Raspberry Pi Imager를 실행하고, OS를 선택한다. (Ubuntu 24.04 LTS를 선택하였다.)
3. SD 카드를 선택하고, Write 버튼을 눌러 OS를 설치한다. (쓰기 전 와이파이 설정, 국가 설정 필수)
4. SD 카드를 라즈베리파이 5에 삽입하고 부팅한다.

여기서 와이파이 설정을 다른 나라로 할 경우 와이파이 연결이 안될 수도 있다.  
특히 모니터, 키보드가 없는 상황에서 초기 세팅을 하기 위해서는 SSH로 원격으로 들어가서 설정을 해줘야 하는데, 이때 와이파이 설정을 잘못하면 접속이 안되면 곤란하다.

### SSH 설정
라즈베리파이 5에 OS를 설치하고 초기 세팅을 완료했다면, SSH를 통해 원격으로 접속할 수 있다.
인터넷이 연결되어 있다는 상황이다.  

라즈베리파이 설정 구체적으로 IP가 세팅한 값으로 될텐데, imager
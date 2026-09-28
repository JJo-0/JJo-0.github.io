# SoC 00편 — 근거 패키지 작업 로그

> 제목: **SoC는 무엇인가: 회로와 소프트웨어가 만나는 전체 지도**  
> 연구 기준일: **2026-09-28**  
> 기획서 기준일: 2026-09-27  
> 상태: **RESEARCH IN PROGRESS — 최종 집필 판정 전**  
> 주의: 이 문서는 조사 진행 중인 evidence ledger다. `VERIFIED`는 실제 원문 확인 뒤에만 부여한다.

## 진행 원칙

- 공식 표준/프로젝트 문서/제조사 문서를 우선한다.
- 표준 판본, release, 문서 업데이트 시점을 구분한다.
- 보편 원리와 특정 구현을 분리한다.
- SoC/CPU/ISA/MCU/ASIC/FPGA를 하나의 분류축으로 섞지 않는다.
- 공통 예제는 센서 샘플을 저장하고 CPU가 읽는 작은 register/FIFO IP로 제한한다.
- Linux, RTOS/MCAL, RTL/FPGA 실습 환경은 서로 독립된 환경으로 취급한다.
- 실행하지 않은 실습은 반드시 **미실행 실습안**으로 표시한다.

## 단계별 체크포인트

- [x] 0. 저장소/작업 브랜치 준비
- [ ] 1. 정의·분류축 및 SoC 주요 블록 근거 고정
- [ ] 2. 센서→register/FIFO→interconnect→CPU→driver/application 경로 근거 고정
- [ ] 3. specification→model→RTL→implementation→bring-up→verification 산출물 지도
- [ ] 4. 역할별 HW/SW 계약 및 register interface 조사
- [ ] 5. 실패 사례·오해·검증 증거 수준 정리
- [ ] 6. storyboard 3–5개 설계
- [ ] 7. 최소 실습안·환경/버전·pass/fail 조건 고정
- [ ] 8. 복습 문제·미확인 항목·READY/NEEDS EVIDENCE 판정

## 출처 탐색 시작점

| ID | 기관 | 문서 | 현재 상태 |
|---|---|---|---|
| S01 | Arm | AMBA system architectures | 판본/세부 protocol 원문 재확인 예정 |
| S02 | RISC-V International | Ratified Specifications | 실제 ISA/privileged 판본 고정 예정 |
| S10 | Linux Kernel | Device Model overview | 고정 kernel source/API와 대조 예정 |
| S12 | Zephyr Project | Device Driver Model | `latest`가 아닌 release 문서로 고정 예정 |

## 핵심 Claim ledger — 초기 상태

| Claim ID | 주장 | 상태 |
|---|---|---|
| C01 | ISA는 명령어 집합/소프트웨어-하드웨어 인터페이스의 규격이며 CPU라는 물리/논리 구현 그 자체와 동일하지 않다. | PENDING |
| C02 | MCU와 SoC는 통합 범위/시장 용례가 겹칠 수 있어 단순 포함관계 하나로만 정의하면 부정확하다. | PENDING |
| C03 | ASIC/FPGA는 CPU/MCU/SoC와 다른 분류축(구현/제조 방식)이다. | PENDING |
| C04 | CPU가 memory-mapped register를 읽는 것은 interconnect/address map/register semantics에 걸친 HW/SW 계약이다. | PENDING |
| C05 | Linux driver model의 device/driver/bus 관계는 특정 커널 구현이며 bare-metal/RTOS에 그대로 일반화할 수 없다. | PENDING |
| C06 | reset/overflow/concurrent access/timeout/error semantics는 register/FIFO IP의 기능 계약에 포함되어야 한다. | PENDING |
| C07 | RTL simulation, static analysis, formal verification, FPGA/silicon measurement는 서로 다른 증거 범위와 보장을 제공한다. | PENDING |

## 예정 산출물

최종 문서는 요청 형식 A–J를 그대로 사용한다.

A. 정의·범위·학습목표·선수지식·5문장 요약  
B. 출처 지도  
C. 주장-근거 원장  
D. 목차별 조사 메모  
E. 메커니즘/설계 대안/실패 사례  
F. 시각자료 storyboard  
G. 최소 실습안 및 검증 범위  
H. 복습 문제 5개  
I. 미확인/접근 제한/상충 근거/추가 질문  
J. 집필 준비 판정

---
마지막 업데이트: 2026-09-28 — checkpoint 0.

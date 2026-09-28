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
- [x] 1. 정의·ISA/interconnect/driver-model/register-contract 1차 근거 고정
- [ ] 2. 센서→register/FIFO→interconnect→CPU→driver/application 경로 근거 고정
- [ ] 3. specification→model→RTL→implementation→bring-up→verification 산출물 지도
- [ ] 4. 역할별 HW/SW 계약 및 register interface 조사
- [ ] 5. 실패 사례·오해·검증 증거 수준 정리
- [ ] 6. storyboard 3–5개 설계
- [ ] 7. 최소 실습안·환경/버전·pass/fail 조건 고정
- [ ] 8. 복습 문제·미확인 항목·READY/NEEDS EVIDENCE 판정

## B 초안 — 출처 지도 (checkpoint 1)

| ID | 기관/저자 | 문서 | 판본/상태 | URL | 해당 절/확인 범위 | 사용 목적 |
|---|---|---|---|---|---|---|
| S01 | Arm | AMBA AXI Protocol Specification | 현재 Arm 문서 색인에서 Issue L이 Latest로 표시됨; 검색으로 확인한 Issue C 페이지는 superseded | https://developer.arm.com/documentation/ihi0022/latest/ | AXI protocol 문서 색인 및 memory-mapped protocol 계열 | SoC interconnect가 CPU 자체와 별개인 시스템 구성요소임을 설명. 최종 원장에서는 Issue L 세부 절 재확인 필요 |
| S02 | RISC-V International | RISC-V Ratified Specifications Library — Unprivileged ISA | **v20260120, Official Release**, 2026-01 | https://docs.riscv.org/reference/isa/unpriv/unpriv-index.html | Volume I / Unprivileged Architecture | ISA가 CPU 제품명이 아니라 명령어 집합 아키텍처 규격임을 고정 |
| S03 | RISC-V International | RISC-V Ratified Specifications Library — Privileged ISA | **v20260120**, 2026-01 | https://docs.riscv.org/reference/isa/v20260120/priv/priv-preface.html | Preface; Machine/Supervisor ISA 및 확장 버전 표 | unprivileged ISA와 privileged architecture를 구분 |
| S04 | Linux Kernel | The Linux Kernel Device Model | 본문 자체는 Drafted 2002-08-26 / Updated 2006-01-31; 현재 docs에도 유지 | https://docs.kernel.org/driver-api/driver-model/overview.html | Overview, Downstream Access, User Interface | Linux의 bus/device/driver 공통 모델은 Linux 구현 모델임을 설명 |
| S05 | Linux Kernel | Driver Binding | 현재 docs 경로, 열람 2026-09-28 | https://docs.kernel.org/driver-api/driver-model/binding.html | Bus, device_register, Driver/probe | device↔driver matching/probe가 Linux driver core의 구체 동작임을 설명 |
| S06 | Linux Kernel Organization | kernel.org front page | 열람 2026-09-28; LTS 6.18.53(2026-09-21) 등 표시 | https://www.kernel.org/ | release 상태 확인 | 오래된 driver-model 설명의 작성일과 현재 커널 release 상태를 혼동하지 않기 위한 기준 |
| S07 | Zephyr Project | Releases | **4.4.0, 2026-04-14, Latest stable**; 4.5는 2026-10 예정 | https://docs.zephyrproject.org/latest/releases/index.html | Supported Releases | 실습/비교에서 `latest` 대신 고정 release를 선택하기 위한 기준 |
| S08 | Zephyr Project | Device Driver Model | latest 문서, 열람 2026-09-28 | https://docs.zephyrproject.org/latest/kernel/drivers/index.html | Introduction | Zephyr는 Linux와 다른 device model/API를 제공하며 board/driver별 가용성이 다름 |
| S09 | OpenTitan / lowRISC | reggen & regtool: Register Generator | current project docs, 열람 2026-09-28 | https://opentitan.org/book/util/reggen/index.html | Register format, swaccess/hwaccess, RTL generation, simultaneous SW/HW access | register spec가 문서/RTL/C header를 함께 생성할 수 있는 HW/SW 계약의 구체 사례 |
| S10 | OpenTitan / lowRISC | Setup and use of regtool | current project docs, 열람 2026-09-28 | https://opentitan.org/book/util/reggen/doc/setup_and_use.html | RTL/DV generation examples | 동일 register description에서 RTL과 UVM RAL collateral을 생성하는 실제 workflow 사례 |

### 최신 상태 메모

- RISC-V 공식 Ratified Specifications Library는 2026-09-28 열람 기준 Unprivileged ISA와 Privileged ISA의 **v20260120**을 제공한다.
- Zephyr 공식 release index는 **4.4.0 (2026-04-14)**을 latest stable로 표시하며 **4.5는 2026-10 예정**이다. 따라서 이번 기준일에 4.5 기능을 released 기능처럼 쓰지 않는다.
- Linux driver-model overview의 텍스트는 역사적으로 오래되었으므로, “현재 API가 2006년과 동일하다”는 근거로 사용하지 않는다. 현재 docs의 binding/infrastructure 문서 및 필요 시 고정 source tag와 대조한다.

## C 초안 — 핵심 Claim ledger

| Claim ID | 기술 주장 | 직접 출처 | 위치 | 적용 조건 | 근거 유형 | 상태 |
|---|---|---|---|---|---|---|
| C01 | ISA(Instruction Set Architecture)는 CPU 구현 그 자체가 아니라 소프트웨어가 대상으로 삼는 아키텍처 규격이다. 하나의 ISA는 서로 다른 CPU core 구현에서 구현될 수 있다. | S02, S03 | Unprivileged/Privileged specification titles & prefaces | RISC-V를 명시적 사례로 사용; 모든 ISA의 세부 구조가 같다는 뜻은 아님 | 공식 규격 + 일반화 | **VERIFIED**(RISC-V 사례), 일반화 문구는 집필 시 신중히 표현 |
| C02 | MCU와 SoC는 통합 수준/제품 범주가 겹칠 수 있어 “MCU ⊂ SoC” 같은 단일 포함관계만으로 교육하면 오해가 생긴다. | — | — | 업계 용어 사용이 vendor/product line마다 다를 수 있음 | 분류 해석 | **UNKNOWN — 추가 제조사 1차 자료 필요** |
| C03 | ASIC/FPGA는 CPU/MCU/SoC와 다른 분류축(구현/제조 방식)으로 설명해야 한다. | — | — | FPGA에 soft CPU/SoC subsystem이 들어갈 수 있음 | 분류 해석 | **UNKNOWN — FPGA/ASIC 공식 1차 자료 필요** |
| C04 | memory-mapped register는 단순 C 변수 이름이 아니라 address decode, bus transaction, access type, reset value, HW/SW side effect가 결합된 계약이다. | S09 | Register format; `swaccess`, `hwaccess`, `resval`; generated `name_reg_top.sv` | OpenTitan TL-UL/register generator 구현 사례 | 공식 프로젝트 구현 문서 | **VERIFIED (구체 구현 사례)** |
| C05 | Linux의 device/driver/bus 및 matching/probe는 Linux driver core의 구체 모델이다. bare-metal이나 Zephyr에 그대로 일반화하면 안 된다. | S04, S05, S08 | Linux Overview/Binding; Zephyr Introduction | Linux와 Zephyr 비교 | 공식 프로젝트 문서 비교 | **VERIFIED** |
| C06 | register/FIFO 설계에서 reset/overflow/concurrent access/error semantics를 명시해야 한다. | S09 일부 | reset value, simultaneous SW/HW access 등 | OpenTitan register 사례는 FIFO overflow 전체를 직접 규정하지 않음 | 부분 직접 근거 | **INFERRED — FIFO 직접 근거 추가 필요** |
| C07 | RTL simulation, static analysis, formal verification, FPGA/silicon measurement는 서로 다른 증거 범위와 보장을 제공한다. | — | — | 검증 방법론 | 원리 | **UNKNOWN — 직접 방법론 자료 필요** |

## 메커니즘 메모 1 — “레지스터가 HW/SW 계약”이라는 말의 구체화

OpenTitan `reggen`은 하나의 Hjson register description에서 문서, Verilog/SystemVerilog RTL, C header, DV collateral을 생성할 수 있다. 이 사례에서 register field에는 software access(`ro`, `rw`, `rw1c` 등), hardware access, reset value, bit 위치가 명시된다. 즉 소프트웨어의 `readl()`/포인터 역참조만으로 계약이 완성되는 것이 아니라, 하드웨어의 address decode와 access side effect가 같은 정의와 일치해야 한다.

특히 simultaneous software/hardware update는 설계 선택이다. OpenTitan generated register logic의 특정 RW/RW1C 계열은 동시 update 시 우선순위를 정의한다. 이 동작을 “모든 SoC register의 보편 규칙”으로 일반화하면 안 된다. 교육에서는 **동시 접근 우선순위를 사양에 써야 한다는 점**만 일반 원칙으로 끌어낸다.

## 현재 확인된 오해 방지 포인트

1. **ISA = CPU**가 아니다. RISC-V 문서는 ISA specification이며, CPU core는 그 ISA를 구현하는 구현체다.
2. **Linux driver model = 모든 embedded driver 구조**가 아니다. Zephyr는 별도의 device model과 generic driver APIs를 갖는다.
3. **register = C 변수**가 아니다. offset/access/reset/side effect/address decode가 일치해야 SW와 HW가 같은 의미를 공유한다.
4. `latest` 문서 경로를 release 번호로 취급하지 않는다. Zephyr는 기준일 현재 4.4.0이 latest stable이며 4.5는 아직 예정 상태다.

## 남은 직접 근거

- MCU와 SoC의 겹치는 제품 분류를 보여 줄 MCU 제조사 reference/manual 또는 product architecture 자료.
- FPGA와 ASIC을 구현 방식 축으로 분리하기 위한 AMD/Xilinx 또는 Intel FPGA 공식 architecture 자료 + ASIC 관련 직접 자료.
- FIFO full/empty/overflow 및 backpressure/interrupt 동작의 공개 RTL IP 공식 사양.
- RTL simulation/static/formal/on-target measurement의 보장 범위를 구분할 방법론 원문.
- AMBA AXI **Issue L**의 실제 세부 절 번호와 memory-mapped transaction 관련 직접 문구.
- 최소 실습용 simulator/toolchain의 release/tag 고정.

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
마지막 업데이트: 2026-09-28 — checkpoint 1. 웹 원문 1차 확인 완료, 미확인 claim은 VERIFIED로 승격하지 않음.

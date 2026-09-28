# SoC 00편 — 근거 패키지

> 제목: **SoC는 무엇인가: 회로와 소프트웨어가 만나는 전체 지도**  
> 기획 기준일: **2026-09-27** / 원문 확인일: **2026-09-28**  
> Evidence: **READY TO DRAFT** / Lab: **UNEXECUTED**

## A. 범위와 학습목표

CPU는 명령 실행 요소이고 SoC는 CPU, memory, peripheral, interconnect 등을 통합하는 시스템 설계 대상이다. 00편은 센서 샘플이 peripheral/FIFO/register/interconnect를 거쳐 CPU와 software에 도달하는 경로와 HW/SW 계약을 다룬다. 아날로그·physical design 전체는 범위 밖이다.

학습목표: (1) ISA/core/SoC 경계 구분, (2) MCU·SoC와 ASIC·FPGA의 분류축 구분, (3) sensor→FIFO→CPU 경로 추적, (4) register contract 설명, (5) specification/model/RTL/DV/bring-up 산출물 연결.

## B. 출처 지도

| ID | 공식 출처 | 고정 상태 / 사용 목적 |
|---|---|---|
| S01 | https://www.arm.com/glossary/soc-development | SoC 정의·구성·개발 흐름 |
| S02 | https://www.arm.com/glossary/cpu | CPU 정의 |
| S03 | https://docs.riscv.org/ | RISC-V Unprivileged/Privileged ISA **v20260120** |
| S04 | https://www.arm.com/architecture/system-architectures/amba | AMBA on-chip interconnect; AXI index Issue L latest 확인 |
| S05 | https://www.raspberrypi.com/documentation/microcontrollers/microcontroller-chips.html | RP2040: Cortex-M0+ cores, SRAM, peripherals, external flash 사례 |
| S06 | https://docs.amd.com/r/en-US/ug585-zynq-7000-SoC-TRM/Introduction | Zynq-7000 UG585 v1.15: processing system + programmable logic |
| S07 | https://www.arm.com/glossary/asic | ASIC/FPGA 구현 관점 |
| S08 | https://docs.kernel.org/6.18/driver-api/driver-model/binding.html | Linux 6.18 driver binding/probe |
| S09 | https://docs.kernel.org/6.18/driver-api/device-io.html | Linux 6.18 MMIO/ioremap/readl/writel |
| S10 | https://docs.zephyrproject.org/latest/releases/index.html | cutoff 기준 Zephyr **4.4.0 (2026-04-14)** latest stable |
| S11 | https://docs.zephyrproject.org/latest/kernel/drivers/index.html | Zephyr device model |
| S12 | https://opentitan.org/earlgrey_1.0.0/book/util/reggen/index.html | register access/reset/HW-SW update 계약 사례 |
| S13 | https://opentitan.org/earlgrey_1.0.0/book/hw/ip/uart/doc/theory_of_operation.html | FIFO overflow/interrupt 사례 |
| S14 | https://opentitan.org/book/doc/project_governance/development_stages.html | design/verification 병행 사례 |
| S15 | https://systemc.org/overview/systemc/ | SystemC/TLM과 synthesizable subset 구분 |
| S16 | https://standards.ieee.org/ieee/1800/7743/ | IEEE 1800-2023 SystemVerilog 범위 |
| S17 | https://verilator.org/guide/latest/changes.html | Verilator **5.052 (2026-09-05)** 실습 기준 |

## C. 주장-근거 원장

| Claim | 주장 | 판정 |
|---|---|---|
| C01 | SoC는 CPU의 다른 이름이 아니다. | **VERIFIED: S01,S02** |
| C02 | ISA는 CPU 구현 자체가 아닌 software-visible architecture 규격이다. | **VERIFIED: S03** |
| C03 | MCU↔SoC의 엄격한 보편 집합관계는 이번 근거로 확정하지 않는다. | **UNSPECIFIED** |
| C04 | FPGA/ASIC과 CPU/SoC는 다른 분류 관점이며 한 device에 processing system과 programmable logic이 공존할 수 있다. | **VERIFIED: S06,S07** |
| C05 | on-chip interconnect는 기능 블록 사이 transaction을 전달한다. | **VERIFIED: S04** |
| C06 | register contract에는 offset/field/access/reset 및 side effect/HW-SW update 의미가 포함될 수 있다. | **VERIFIED: S12** |
| C07 | W1C는 1 write로 clear하는 semantic이다. | **VERIFIED: S12,S13** |
| C08 | FIFO full 정책은 설계 선택이며 OpenTitan UART RX는 overflow 시 추가 character를 drop한다. | **VERIFIED, implementation-specific: S13** |
| C09 | Linux driver binding과 MMIO access는 Linux 고유 software contract다. | **VERIFIED: S08,S09** |
| C10 | Zephyr는 architecture/SoC/board porting을 구분한다. | **VERIFIED: S10,S11** |
| C11 | SystemC/TLM model과 RTL은 같은 추상화가 아니다. | **VERIFIED: S15** |
| C12 | verification을 RTL 완료 뒤 한 번 하는 마지막 단계로만 보면 부정확하다. | **VERIFIED example / generalization INFERRED: S14** |
| C13 | FPGA prototype은 fabricated silicon validation과 동일한 증거가 아니다. | **INFERRED: S01 workflow** |
| C14 | Verilator 5.052로 boardless SystemVerilog lab을 구성할 수 있다. | **VERIFIED capability / UNEXECUTED: S17** |

## D. 목차 수정

1. 용어는 포함관계보다 **무엇을 분류하는 이름인가**를 먼저 설명한다.  
2. 주요 블록은 CPU=compute, memory=state/code, peripheral=외부 기능, interconnect=request/response 전달로 설명한다.  
3. 공통 경로는 **Sensor → Capture IP → FIFO → Register Interface → Interconnect → CPU → RAM/Application**으로 고정한다. interrupt는 별도 notification path다.  
4. verification은 개발 흐름의 마지막 상자가 아니라 specification 단계부터 병행되는 lane으로 그린다.  
5. 직무는 회사 조직명이 아니라 입력 산출물→출력 산출물로 설명한다.  
6. 00편 lab은 RTL simulation만 사용하고 Linux/Zephyr/MCAL 실습은 후속 편으로 분리한다.

## E. 교육용 register/FIFO 계약

| Offset | Register | Access | 의미 |
|---:|---|---|---|
| 0x00 | CTRL | RW | sampling enable |
| 0x04 | STATUS | RO | empty/full/level |
| 0x08 | DATA | RO + read-pop | oldest sample dequeue |
| 0x0C | IRQ_ENABLE | RW | data-ready/overflow enable |
| 0x10 | IRQ_STATE | RW1C | overflow 등 event state |

위 주소와 read-pop 정책은 **교육용 설계**다. 실패 사례는 (1) W1C를 일반 RW처럼 처리, (2) debug read가 read-pop sample을 소비, (3) CPU service 지연으로 finite FIFO overflow가 발생하는 경우다.

## F–G. 시각자료와 실습

storyboard는 `soc-00-storyboards.md`, 실습은 `soc-00-lab/`에 분리한다. 실습은 **UNEXECUTED**이며 Verilator 5.052, 16-entry × 16-bit FIFO, drop-new, W1C IRQ state를 기준으로 RESET/FIFO_ORDER/FULL/OVERFLOW/W1C/READ_SIDE_EFFECT를 검증한다.

## H. 복습 문제

1. RP2040, Cortex-M0+, ISA는 각각 어느 계층인가?  
2. 16-entry, 1 ksample/s, no-consume 조건에서 최초 drop 시점은?  
3. W1C field에 0을 쓰면 왜 clear되지 않는가?  
4. Linux MMIO를 일반 C pointer처럼 다루면 왜 안 되는가?  
5. RTL simulation과 FPGA prototype 통과가 silicon validation 완료를 뜻하지 않는 이유는?

## I. 미확인/제한

- MCU↔SoC strict taxonomy: **UNSPECIFIED**
- 채용공고 NIC 의미: **UNKNOWN** — Network Interface Controller / Network Interconnect 등 후보
- Static/Dynamic Coverage 의미: **UNKNOWN** — SW/RTL/static-analysis 후보를 후속 검증 편에서 분리
- AMBA AXI Issue L clause/page: **후속 버스 편에서 고정**
- lab host OS/compiler exact version: **실행 시 기록**
- board/silicon result: **없음**
- ASIC timing/power/signoff, AUTOSAR MCAL compliance: **00편 범위 밖**

## J. 집필 준비 판정

**READY TO DRAFT**. SoC≠CPU, ISA≠core implementation, interconnect 역할, register HW/SW contract, FIFO/interrupt 구현 사례, driver와 OS-porting 계층 차이, specification→RTL→verification 전체 지도에 공식·1차 근거가 확보됐다.

발행 조건: 교육용 가정을 명시하고, OpenTitan 등 implementation-specific behavior를 universal rule로 일반화하지 않으며, simulation/prototype evidence를 silicon validation으로 표현하지 않는다.

---
Checkpoint 0–4 complete. Storyboards, register contract, software-visible definitions, RTL, self-checking testbench draft committed. Lab remains **UNEXECUTED** until a real Verilator run records toolchain and output.
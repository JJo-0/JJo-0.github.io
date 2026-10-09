# SoC 00 Sensor FIFO Lab

> **STATUS: EXECUTED — PASS WITH WARNINGS**
>
> GitHub Actions evidence: run `36396773725`, job `108844926182`. `.github/workflows/soc-00-lab.yml` pinned and built Verilator **v5.052**.

상용 SoC가 아니라 HW/SW 경계를 학습하기 위한 교육용 SystemVerilog DUT다. RTL simulation은 실제 실행됐지만 FPGA 결과와 silicon 결과는 없다.

## 고정 환경
- Target: sensor_fifo SystemVerilog RTL
- Board / CPU / OS: N/A
- Language reference: IEEE 1800-2023
- Simulator target: **Verilator 5.052**
- FIFO: 16 entries × 16 bits
- Overflow: drop-new
- IRQ state: sticky W1C
- W1C clear + new HW event collision: **new event wins** (교육용 policy)

실행 환경: GitHub-hosted Ubuntu **24.04** runner image `20260920.314`, g++ **13.3.0**, Verilator **5.052 (2026-09-05 rev v5.052)**.

## 파일
- spec/register-map.md — DUT contract
- rtl/sensor_fifo.sv — synthesizable educational RTL
- tb/tb_sensor_fifo.sv — self-checking testbench
- sw/sensor_regs.h — software-visible offsets/masks 예시

## 실행 명령

    verilator --version
    verilator --binary --timing -Wall --top-module tb_sensor_fifo \
      rtl/sensor_fifo.sv tb/tb_sensor_fifo.sv
    ./obj_dir/Vtb_sensor_fifo

CI에서는 동일한 compile/execute 흐름을 실제 실행했다. compile 단계에는 WIDTHEXPAND, PROCASSINIT, UNUSEDSIGNAL warning이 있었고 `-Wno-fatal`로 warning을 비치명적으로 처리했다. self-checking testbench는 `SOC00 LAB EXPECTED PASS CONDITIONS MET`를 출력하고 정상 종료했다.

## Test matrix
| Test | PASS 조건 |
|---|---|
| RESET | level=0, empty=1, overflow=0 |
| FIFO_ORDER | 0x0011 → 0x0022 |
| FULL | 16 push 후 full=1, level=16 |
| OVERFLOW | 17번째 push drop, overflow=1 |
| W1C_ZERO | overflow bit에 0 write 시 유지 |
| W1C_ONE | overflow bit에 1 write 시 clear |
| READ_SIDE_EFFECT | DATA read 한 번에 정확히 1 entry pop |

Oracle은 RTL 내부 pointer 계산을 복사하지 않고 register spec과 독립 expected sequence를 기준으로 한다.

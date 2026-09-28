# SoC 00 Sensor FIFO Lab

> **STATUS: UNEXECUTED LAB DRAFT**

상용 SoC가 아니라 HW/SW 경계를 학습하기 위한 교육용 SystemVerilog DUT다. 실제 실행 로그, FPGA 결과, silicon 결과는 아직 없다.

## 고정 환경
- Target: sensor_fifo SystemVerilog RTL
- Board / CPU / OS: N/A
- Language reference: IEEE 1800-2023
- Simulator target: **Verilator 5.052**
- FIFO: 16 entries × 16 bits
- Overflow: drop-new
- IRQ state: sticky W1C
- W1C clear + new HW event collision: **new event wins** (교육용 policy)

실행 시 host OS와 C++ compiler의 정확한 버전을 추가한다.

## 파일
- spec/register-map.md — DUT contract
- rtl/sensor_fifo.sv — synthesizable educational RTL
- tb/tb_sensor_fifo.sv — self-checking testbench
- sw/sensor_regs.h — software-visible offsets/masks 예시

## 예정 명령

    verilator --version
    verilator --binary --timing -Wall --top-module tb_sensor_fifo \
      rtl/sensor_fifo.sv tb/tb_sensor_fifo.sv
    ./obj_dir/Vtb_sensor_fifo

위 명령은 Verilator 공식 --binary 형태를 따른 **예정 명령**이며 아직 실행하지 않았다.

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

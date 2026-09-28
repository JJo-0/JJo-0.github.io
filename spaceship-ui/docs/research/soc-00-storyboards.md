# SoC 00 — 시각자료 storyboard

모든 그림은 공식 텍스트/사양을 근거로 자체 제작하는 **교육용 개념도**다. 실제 칩 die 내부 배치를 의미하지 않는다.

## SOC_BOUNDARY
- 질문: CPU가 있는데 왜 SoC 전체가 아닌가?
- 위치: 용어 설명 직후
- 요소: CPU core, SRAM, interconnect, UART/SPI, timer, optional accelerator, external sensor/flash
- 캡션: **CPU는 SoC 안의 처리 요소 중 하나다.**
- 근거: Arm SoC Development, Raspberry Pi RP2040 documentation
- 제작: 원본 figure 복제 없이 자체 block diagram
- alt: CPU, memory, interconnect, peripheral이 SoC 내부에 있고 외부 sensor와 flash가 연결된 개념도

## SAMPLE_FLOW
- 질문: sample data와 interrupt notification은 어떻게 CPU까지 이동하는가?
- 위치: 센서 공통 예제 시작
- 요소: Sensor → Capture IP → FIFO → Register Interface → Interconnect → CPU → RAM/Application, 별도 IRQ line
- 단위: FIFO level [samples], sample width [bits]
- 캡션: **데이터 경로와 알림 경로는 같은 것이 아니다.**
- 근거: OpenTitan Earl Grey UART, Arm AMBA
- 제작: 자체 flow/sequence diagram
- alt: 센서 데이터는 FIFO와 register를 지나 CPU로 이동하고 interrupt는 별도 알림선으로 전달되는 그림

## REGISTER_CONTRACT
- 질문: register가 왜 HW/SW 공동 계약인가?
- 위치: register map 직후
- 요소: Specification(offset/bits/reset/access/side effect) → RTL / SW header / DV oracle
- 캡션: **한 field의 의미가 HW·SW·DV에서 같아야 한다.**
- 근거: OpenTitan reggen/regtool
- 제작: generated artifact를 복제하지 않고 개념을 자체 재구성
- alt: 하나의 register specification이 RTL, software header, verification model로 갈라지는 그림

## W1C_COLLISION
- 질문: hardware event set과 software W1C clear가 같은 cycle에 겹치면?
- 위치: W1C 실패 사례
- 요소: clk, hw_set, sw_write_1, irq_state_q
- 캡션: **동시 접근 우선순위도 명세다.**
- 근거: OpenTitan simultaneous SW/HW access
- 제작: 자체 timing waveform
- 주의: OpenTitan의 policy를 universal rule로 일반화하지 않는다.
- alt: hardware set과 software clear가 같은 clock edge에 겹치는 timing waveform

## DEV_FLOW
- 질문: 설계와 verification은 어떻게 병행되는가?
- 위치: 개발 흐름
- 요소: requirements/specification, architecture/model, RTL, integration, prototype, bring-up, parallel verification lane
- 캡션: **Verification은 마지막 한 번의 단계가 아니다.**
- 근거: Arm SoC Development, OpenTitan Hardware Development Stages
- 제작: 자체 timeline
- alt: 설계 단계 아래에서 verification이 병행되는 개발 timeline

## 제작 원칙
1. 실측, simulation, 교육용 개념도를 caption에서 구분한다.
2. die shot에 임의 내부 구조를 합성하지 않는다.
3. source URL은 references에 남기되 원본 figure의 재배포 권한을 자동 가정하지 않는다.
4. 수치는 단위와 가정을 함께 표시한다.

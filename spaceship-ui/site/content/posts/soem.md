---
title: 'SOEM으로 이해하는 EtherCAT Master의 역할'
description: 'EtherCAT 프레임의 on-the-fly 처리와 SOEM 라이브러리의 초기화·상태 전이·주기 통신을 공식 원문 중심으로 정리한다.'
pubDate: 2024-01-18
updatedDate: 2026-08-25
category: robotics-embedded
subcategory: industrial-communication
type: study-note
tags:
  - ethercat
  - soem
  - industrial-communication
  - real-time-systems
researchArea: robotics-autonomous-systems
researchFeatured: true
researchOrder: 4
lang: 'ko'
---

SOEM(Simple Open Source EtherCAT Master)은 단체 이름이 아니라 **EtherCAT MainDevice/Master를 구현하기 위한 C 라이브러리**다. OpenEtherCAT Society는 SOEM과 SOES 프로젝트가 모인 조직이고, SOES는 embedded SubDevice/Slave stack이다. 이 구분이 이 글의 출발점이다.

> 검증 기준일: 2026-08-25. API와 release는 바뀔 수 있으므로 구현할 때는 [공식 저장소](https://github.com/OpenEtherCATsociety/SOEM)의 release와 문서를 다시 확인한다. EtherCAT 사양 자체는 [EtherCAT Technology Group](https://www.ethercat.org/) 원문을 기준으로 한다.

## EtherCAT이 빠른 이유

일반 Ethernet 통신처럼 장치마다 완성된 application packet을 받고 새 응답 packet을 만드는 방식과 다르다. MainDevice가 보낸 EtherCAT frame이 SubDevice들을 지나갈 때 각 장치는 자신에게 매핑된 data를 **on the fly**로 읽거나 쓰고 working counter를 갱신한다. 마지막 장치를 지난 frame은 물리 topology를 따라 MainDevice로 돌아온다.

이 구조는 packet 수와 software stack overhead를 줄이지만 Ethernet을 쓴다는 이유만으로 hard real-time이 자동 보장되지는 않는다. 주기 jitter에는 OS scheduler, NIC driver, interrupt, memory allocation, application thread priority가 모두 영향을 준다.

## SOEM이 담당하는 것

- raw Ethernet interface 열기
- SubDevice 탐색과 configuration 읽기
- process data mapping
- INIT → PRE-OP → SAFE-OP → OP 상태 전이
- cyclic process data 송수신
- working counter와 상태 감시
- 필요할 때 상태 복구

SOEM은 독립 실행형 제어기가 아니라 애플리케이션이 링크해 사용하는 library다. 제어 주기, thread scheduling, 안전 상태, 오류 복구 정책은 사용자가 설계해야 한다.

## 최소 실행 흐름

아래는 API의 관계를 보여 주는 개념 코드다. 그대로 생산 장비에 사용하면 안 된다.

```c
char iomap[4096];

if (!ec_init("enp2s0")) {
    return INIT_FAILED;
}

int slave_count = ec_config_init(FALSE);
if (slave_count <= 0) {
    ec_close();
    return NO_SUBDEVICE;
}

ec_config_map(&iomap);
ec_configdc();
ec_statecheck(0, EC_STATE_SAFE_OP, EC_TIMEOUTSTATE);

ec_slave[0].state = EC_STATE_OPERATIONAL;
ec_writestate(0);

while (running) {
    ec_send_processdata();
    int wkc = ec_receive_processdata(EC_TIMEOUTRET);
    validate_working_counter(wkc);
    update_control(iomap);
    wait_until_next_cycle();
}

ec_close();
```

실제 최신 SOEM은 context 기반 API와 예제 구성이 달라질 수 있다. 사용 버전의 `simple_test`, `slaveinfo`, headers를 함께 확인한다.

## Working Counter를 보는 이유

datagram이 기대한 수의 SubDevice에서 성공적으로 읽히거나 쓰였는지를 간접 확인하는 값이다. 기대값보다 작으면 장치 상태 변화, 링크 문제, mapping 문제 등이 있을 수 있다. 단순히 로그만 찍고 제어를 계속하지 말고 다음을 결정해야 한다.

1. 출력 값을 안전 상태로 만들 것인가.
2. 어느 장치가 SAFE-OP 또는 오류 상태인지 읽을 것인가.
3. 재승인·재구성·격리를 어떤 순서로 시도할 것인가.
4. 몇 cycle 연속 실패 후 정지할 것인가.

## Distributed Clocks

여러 장치의 sampling과 output 시점을 맞추려면 Distributed Clocks(DC)가 중요하다. `ec_configdc()`를 호출하는 것만으로 application loop가 자동 동기화되는 것은 아니다. reference clock과 local monotonic clock의 차이를 읽고 다음 wake-up 시점을 보정하는 제어가 필요하다.

## 실험에서 기록할 지표

- 목표 cycle time과 실제 period의 p50/p99/max
- wake-up jitter와 round-trip time
- expected/actual working counter
- packet loss와 state transition 횟수
- CPU isolation·thread priority·NIC offload 설정
- DC offset과 drift
- 오류 주입 후 안전 상태 도달 시간

평균 주기만 보고 “실시간”이라고 표현하지 않는다. deadline miss의 최댓값과 안전 동작을 함께 검증해야 한다.

## 버전이 바뀌어도 유지되는 읽기 순서

1. [SOEM 공식 GitHub](https://github.com/OpenEtherCATsociety/SOEM)에서 최신 stable release와 migration note를 확인한다.
2. [SOEM reference manual](https://docs.rt-labs.com/soem/)에서 실제 사용 버전 API를 확인한다.
3. [EtherCAT Technology Group](https://www.ethercat.org/en/technology.html)의 protocol 설명으로 용어를 대조한다.
4. OS와 NIC에 맞는 real-time tuning을 별도 검증한다.

2026-08-25 확인 시 공식 저장소는 SOEM을 embedded real-time communication을 위한 lightweight library로 설명한다. 이 문장은 버전 숫자보다 오래 유지될 핵심 정의이고, 구체 API와 최신 release 번호는 원본 링크에서 확인하도록 남긴다.


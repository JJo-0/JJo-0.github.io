---
title: Understanding the EtherCAT master through SOEM
description: Official documentation explains on-the-fly frame processing and the SOEM library’s initialization,
  state transitions and cyclic communication.
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
lang: en
slug: 2024-01-18-soem
translationKey: en-2024-01-18-soem
translatedPosts:
  ko-KR: 2024-01-18-soem
---

SOEM (Simple Open Source EtherCAT Master) is a **C library for implementing an EtherCAT MainDevice, or master**. The OpenEtherCAT Society hosts the SOEM and SOES projects. SOES implements the embedded SubDevice, or slave, stack.

> Sources checked on August 25, 2026. Review the release and documentation in the [official repository](https://github.com/OpenEtherCATsociety/SOEM) for the API used in your implementation. Consult the [EtherCAT Technology Group](https://www.ethercat.org/) for the protocol specification.

## Why EtherCAT is fast

In a conventional request–response exchange, each device can receive a complete application packet and generate a separate response. In EtherCAT, a frame from the MainDevice passes through the SubDevices. Each reads or writes its mapped data **on the fly** and updates the working counter. After passing the last device, the frame returns to the MainDevice along the physical topology.

This design reduces packet count and software-stack overhead. Hard real-time behavior also depends on the OS scheduler, NIC driver, interrupts, memory allocation, and the priority of the application thread. Each can affect cycle jitter.

## What SOEM handles

- Opening a raw Ethernet interface
- Discovering SubDevices and reading their configurations
- process data mapping
- Managing INIT → PRE-OP → SAFE-OP → OP transitions
- Sending and receiving cyclic process data
- Monitoring the working counter and device states
- Recovering device state when needed

Applications link against SOEM. The application designer defines the control cycle, thread scheduling, safe states, and error recovery policy.

## A minimal execution sequence

This conceptual example illustrates how the APIs fit together. Production equipment needs its own control and safety implementation.

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

Context-based APIs and examples can differ between SOEM releases. Read the headers and the `simple_test` and `slaveinfo` examples for the version in use.

## Reading the working counter

The counter indirectly indicates whether a datagram was read or written successfully by the expected number of SubDevices. A lower count can indicate a device state change, a link fault, or a mapping problem. A controller needs a defined response.

1. Should outputs move to a safe state?
2. Which devices should be checked for SAFE-OP or an error state?
3. In what order should acknowledgment, reconfiguration, and isolation be attempted?
4. How many consecutive failed cycles should trigger a stop?

## Distributed Clocks

Distributed Clocks (DC) help align sampling and output across multiple devices. Calling `ec_configdc()` alone does not synchronize the application loop. Measure the difference between the reference clock and the local monotonic clock and adjust the next wake-up time accordingly.

## Metrics to record in an experiment

- Target cycle time and p50, p99, and maximum observed period
- Wake-up jitter and round-trip time
- expected/actual working counter
- Packet loss and number of state transitions
- CPU isolation, thread priority, and NIC offload settings
- DC offset and drift
- Time to reach a safe state after fault injection

A mean period alone cannot establish real-time behavior. Check the worst deadline miss and the resulting safety behavior as well.

## A reading order that works across versions

1. Check the stable release and migration notes on the [official SOEM GitHub repository](https://github.com/OpenEtherCATsociety/SOEM).
2. Check the API for the version in use in the [SOEM reference manual](https://docs.rt-labs.com/soem/).
3. Cross-check protocol terms with the [EtherCAT Technology Group](https://www.ethercat.org/en/technology.html).
4. Verify real-time tuning for the specific OS and NIC separately.

On August 25, 2026, the official repository described SOEM as a lightweight library for embedded real-time communication. That definition outlasts a particular version number. The links above provide the specific APIs and release details.

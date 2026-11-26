---
title: Setting up a Raspberry Pi 5
description: Notes from configuring a Raspberry Pi 5 for the first time.
pubDate: 2024-04-05
category: robotics-embedded
subcategory: embedded-systems
type: setup-guide
tags:
- raspberry-pi
- ubuntu
- ssh
- embedded-linux
researchArea: robotics-autonomous-systems
researchFeatured: false
lang: en
slug: 2024-04-05-raspberry-pi-5
translationKey: en-2024-04-05-raspberry-pi-5
translatedPosts:
  ko-KR: 2024-04-05-raspberry-pi-5
---

# 🍽️ Setting up a Raspberry Pi 5
I ordered a Raspberry Pi 5 and wanted to keep a record of the setup.

## Buying a Raspberry Pi 5
My graduation project needed a small computer with low power consumption. I chose a Raspberry Pi 5 because it was easy to work with and had plenty of resources available.

## Raspberry Pi 5 specifications
[Product information](https://www.raspberrypi.com/products/raspberry-pi-5/)

<details>
  <summary><strong>Specifications at a glance</strong></summary>
  <ul>
    <li>Broadcom BCM2712 2.4GHz quad-core 64-bit Arm Cortex-A76 CPU, with cryptography extensions, 512KB per-core L2 caches and a 2MB shared L3 cache</li>
    <li>VideoCore VII GPU, supporting OpenGL ES 3.1, Vulkan 1.2</li>
    <li>Dual 4Kp60 HDMI® display output with HDR support</li>
    <li>4Kp60 HEVC decoder</li>
    <li>LPDDR4X-4267 SDRAM (2GB, 4GB, and 8GB)</li>
    <li>Dual-band 802.11ac Wi-Fi®</li>
    <li>Bluetooth 5.0 / Bluetooth Low Energy (BLE)</li>
    <li>microSD card slot, with support for high-speed SDR104 mode</li>
    <li>2 × USB 3.0 ports, supporting simultaneous 5Gbps operation</li>
    <li>2 × USB 2.0 ports</li>
    <li>Gigabit Ethernet, with PoE+ support (requires separate PoE+ HAT)</li>
    <li>2 × 4-lane MIPI camera/display transceivers</li>
    <li>PCIe 2.0 x1 interface for fast peripherals (requires separate M.2 HAT or other adapter)</li>
    <li>5V/5A DC power via USB-C, with Power Delivery support</li>
    <li>Raspberry Pi standard 40-pin header</li>
    <li>Real-time clock (RTC), powered from external battery</li>
    <li>Power button</li>
  </ul>
</details>

## Installing an OS on the Raspberry Pi 5
Raspberry Pi provides Raspberry Pi Imager on its official site for writing an operating system to a card.

### Initial setup
1. Download Raspberry Pi Imager from the official Raspberry Pi website.
2. Open the imager and choose an operating system. I chose Ubuntu 24.04 LTS.
3. Select the SD card, configure the Wi-Fi network and country, then choose Write to install the OS.
4. Insert the SD card into the Raspberry Pi 5 and boot it.

Choosing the wrong Wi-Fi country can prevent the Pi from connecting.\
This matters especially for a headless setup. If you're relying on SSH without a monitor or keyboard, an incorrect Wi-Fi setting can leave the machine unreachable.

### Connecting over SSH
Once the OS is installed and the initial setup is complete, you can connect to the Pi remotely over SSH.
This assumes the Pi has a working network connection.

Use the Pi's configured IP address for the connection.

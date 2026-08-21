---
title: '글로벌 반도체 소부장 Universe Map — 공정·소재·부품·장비·HBM 공급망 전수지도'
description: '수요시장부터 칩, 설계, 웨이퍼, 포토마스크, 전공정, 소재, 장비 핵심부품, 팹 인프라, 패키징·HBM·테스트와 공급기업까지 연결한 2026-08-20 기준 반도체 산업지도다.'
pubDate: 2026-08-21
slug: 'semiconductor-supply-chain-universe-map'
category: finance-industry
subcategory: semiconductor-industry
type: research-report
tags:
  - semiconductor
  - supply-chain
  - materials-equipment
  - advanced-packaging
  - industry-analysis
featured: true
researchFeatured: false
lang: 'ko'
---

> **연구 기준일: 2026년 8월 20일, Asia/Seoul**  
> 이 글은 기업 추천 목록이 아니다. 글로벌 반도체 산업을 **수요시장 → 반도체 제품 → 설계 생태계 → 웨이퍼·마스크 → FEOL/MOL/BEOL → 소재·장비·핵심부품 → 팹 인프라 → 패키징·HBM·테스트 → 서비스**로 분해하고, 각 node 사이의 의존관계를 보존하기 위한 산업지도다.

![글로벌 반도체 소부장 Universe Map 포스터](/assets/posts/semiconductor-universe-2026/cover.svg)

<div class="not-prose my-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
  <p style="margin:0 0 8px;font-size:0.75rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted-foreground);">Interactive Relation Atlas</p>
  <p style="margin:0 0 14px;font-size:1.15rem;font-weight:900;">Three.js / WebGPU 기반 반도체 공급망 지도를 전체 화면으로 탐색한다.</p>
  <p style="margin:0 0 18px;color:var(--muted-foreground);line-height:1.65;">Taxonomy, 실제 공정 흐름(Process walk), 기업, 국가, 근거 수준(Evidence)의 다섯 가지 lens를 전환하고, EUV·HBM·MFC·ABF·하이브리드 본딩 같은 node의 upstream/downstream 관계를 추적할 수 있다. WebGPU가 불가능하면 WebGL2로 자동 전환되며, 2D 표와 원본 graph JSON도 함께 제공한다.</p>
  <a href="/assets/interactive/semiconductor-universe/index.html" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;font-weight:900;">Interactive Universe 전체 화면으로 열기 ↗</a>
</div>

## 먼저 읽어야 할 결론

이 연구의 핵심은 “유명 반도체 기업을 많이 찾는 것”이 아니다. **독립적인 procurement market, qualification stack, unit-process function을 형성하는 최소 단위**를 leaf node로 등록하고, 그 node를 실제 제조공정과 공급기업에 연결하는 것이다.

Phase 1에서 구축한 baseline은 **875개 node, 790개 leaf node**다. 이 중 공급기업 census의 직접 대상이 되는 supply-side leaf는 Phase 2에서 **406개**로 재구성했다. 그러나 이 숫자는 모든 node의 시장점유율, 고객 qualification, 한국 기업의 HVM(High-Volume Manufacturing) 공급 여부까지 완성됐다는 뜻이 아니다.

현재 공개 Atlas는 다음 두 사실을 동시에 보존한다.

- **Taxonomy topology**: 무엇이 어디에 속하고 어떤 공정·장비·소재·부품과 연결되는지 보여준다.
- **Evidence status**: 충분히 확인된 것은 `VERIFIED`, 일부만 확인된 것은 `PARTIAL`로 구분한다. 확인되지 않은 고객관계와 시장점유율을 임의로 채우지 않는다.

따라서 이 페이지는 “완성됐다고 선언한 종목지도”가 아니라, **지속적으로 증거를 붙여 나가는 semiconductor research database의 public interface**다.

## 왜 tree가 아니라 graph인가

반도체 공급망은 하나의 회사가 하나의 category에만 속하는 tree가 아니다.

예를 들어 Applied Materials는 deposition만 하는 회사가 아니라 ALD/CVD/PVD/ECD, etch, CMP, implant, metrology, photomask, hybrid bonding과 compound/power semiconductor까지 여러 node에 걸친다. ASML도 scanner만이 아니라 computational lithography, metrology, inspection ecosystem과 연결된다. 한국의 FST 역시 pellicle뿐 아니라 EUV pellicle handling/inspection, SiC chamber parts, scrubber와 chiller에 걸친다.

그래서 database 구조는 다음 many-to-many 관계를 허용해야 한다.

```text
Supplier ↔ Material / Equipment / Component / Service
Equipment ↔ Subsystem / Consumable / Utility
Process ↔ Material / Equipment / Metrology / Software
Device architecture ↔ Process intensity
End market ↔ Product demand ↔ Manufacturing demand
```

이 원칙이 없으면 “ASML=노광장비”, “OSAT=패키징”, “소부장=대형 장비회사” 같은 지나친 축약이 발생한다.

## 전체 Supply-chain topology

최종 map은 15개 상위 domain으로 고정했다.

| Domain | 무엇을 포함하는가 |
|---|---|
| **DEM — End Markets** | AI/HPC, server, mobile, automotive, industrial, robotics, power, medical, defense, IoT |
| **PROD — Products** | DRAM·HBM·NAND, CPU·GPU·NPU·ASIC, analog, MCU, RF, power, sensor, photonics |
| **DESIGN — Design Ecosystem** | IDM, fabless, foundry, EDA, IP, design house, verification, DFT, mask data preparation |
| **WAF — Wafer/Substrate** | polysilicon, CZ/FZ, slicing·polishing, epi, reclaimed wafer, SOI·SiC·GaN·GaAs·InP·glass |
| **MASK — Photomask/Reticle** | blank, absorber, mask resist, writer, inspection, metrology, repair, pellicle, pod·cleaning |
| **FE — FEOL/MOL/BEOL** | clean, thermal, epi, lithography, etch, deposition, implant, CMP, metallization, backside |
| **PC — Process Control** | CD-SEM, optical/e-beam inspection, overlay, OCD, X-ray, SIMS, AFM, defect review, yield/APC |
| **MAT — Materials** | wafers, resist, chemicals, gases, precursor, targets, CMP, chamber materials, package materials |
| **EQCOMP — Equipment & Components** | process tools와 vacuum, RF, gas delivery, chamber, motion, optics, thermal, robotics, sensors |
| **FAB — Fab Infrastructure** | cleanroom, HVAC, UPW, gas, chemical, vacuum, abatement, wastewater, cooling, power, safety |
| **AUTO — Automation & Software** | AMHS/OHT, FOUP/FOSB, E84/E23, MES, FDC, APC, scheduling, virtual metrology, cybersecurity |
| **PKG — Packaging** | thinning, dicing, bump, wire/flip-chip, TCB, hybrid bonding, RDL/TSV, substrate, thermal, CPO |
| **TEST — Test/Reliability** | probe, ATE, handler, socket, load board, burn-in, thermal, SLT, HTOL/HAST/TC/ESD |
| **HBM — HBM-specific Graph** | DRAM wafer, KGD, TSV, thinning, interface, stack/bond, MR-MUF/NCF, base die, thermal, final test |
| **SERVICE — Service/Circular Chain** | field service, spares, precision cleaning, coating, refurbishment, calibration, relocation, recycling |

## 실제 wafer를 따라가는 Process Walk

Taxonomy가 실제 제조흐름과 연결되는지 확인하기 위해 wafer 한 장이 공장을 통과한다고 가정했다.

```text
Raw material
→ Wafer / substrate
→ Photomask / reticle
→ FEOL device formation
→ MOL contact
→ BEOL interconnect
→ Wafer test / Known Good Die
→ Backgrind / thinning
→ Dicing / die sort
→ Package assembly / advanced packaging
→ Final test / burn-in / system-level test
→ System integration
```

각 step마다 장비만 묻지 않았다. 다음 열 가지를 반복해서 확인했다.

1. Equipment
2. Material
3. Consumable
4. Critical component
5. Gas / chemical
6. Contamination control
7. Metrology / inspection
8. Wafer handling
9. Utility / facility
10. Maintenance / service

이 방식으로 일반적인 “8대 공정” 설명에서 빠지는 **post-etch clean, edge/bevel, descum, temporary bonding/debonding, chemical/gas inline analytics, carrier cleaning, calibration, refurbishment**가 독립 node로 드러났다.

## 가장 크게 누락되기 쉬운 영역: 장비 핵심부품

소부장 연구에서 가장 자주 빠지는 부분은 장비 OEM이 아니라 **장비 내부 critical subsystem**이다.

Etcher 하나만 분해해도 다음 공급망이 생긴다.

```text
Etcher
├─ Chamber body / liner / coating
├─ Plasma source
├─ RF generator / matcher
├─ ESC / electrode / edge ring / focus ring
├─ Showerhead / gas distribution
├─ MFC / regulator / valve / purifier
├─ Dry pump / turbo pump / vacuum gauge
├─ Chiller / heater / temperature control
├─ Robot / EFEM / load port
├─ Power supply / high-voltage supply
└─ Quartz / ceramic / SiC / graphite / seals
```

Scanner는 light source, optics, stage, encoder, vibration isolation, reticle handling, wafer handling, sensor, overlay metrology로 분해해야 한다. Deposition tool은 precursor delivery, vaporizer, MFC, valve, showerhead, heater, plasma/RF, pump와 abatement까지 연결된다.

부품 교체는 단순 구매가 아니다. particle, plasma uniformity, thermal stability, outgassing, corrosion, RF impedance, pressure response가 바뀌면 **tool-level requalification과 wafer yield validation**이 다시 필요하다. 그래서 설치대수(Installed base), qualification 기간, 서비스 network가 장비부품 시장의 진입장벽이 된다.

## Materials Chemistry: “가스·화학” 한 줄로 끝내지 않는다

Materials universe도 broad category만으로는 부족하다.

- Lithography: KrF/ArF/ArFi/EUV resist, developer, thinner, BARC, topcoat, HMDS, EBR chemical
- Wet process: H₂SO₄, H₂O₂, HF, HNO₃, HCl, H₃PO₄, NH₃, IPA와 ultra-high-purity solvents
- Etch/clean gases: fluorocarbon, chlorine, bromine, NF₃, F₂, remote-plasma clean chemistry
- Deposition: ALD/CVD metal·high-k·barrier/liner precursor, carrier/purge gas
- Implant/doping: boron, phosphorus, arsenic 계열 dopant gas/source
- CMP: slurry, pad, conditioner, post-CMP clean chemistry
- Plating: Cu chemistry, suppressor, accelerator, leveler, electroless chemistry
- Chamber consumables: quartz, alumina, AlN, Y₂O₃ coating, SiC, graphite, elastomer seals
- Packaging: ABF, BT resin, EMC, underfill, NCF/NCP, die attach, TIM, flux, solder/bump materials

같은 화학명이라도 semiconductor grade의 금속불순물, particle, moisture, delivery stability와 container/valve cleanliness가 다르면 별도 qualification market이 된다.

## HBM은 DRAM만이 아니라 복합 manufacturing graph다

HBM 공급망은 다음과 같이 연결된다.

```text
AI accelerator demand
→ Advanced DRAM wafer
→ Wafer test / Known Good Die
→ TSV etch + liner/barrier/seed + Cu plating + CMP
→ Wafer thinning / stress relief / reveal
→ Microbump·Cu pillar 또는 hybrid interface
→ High-accuracy placement + TCB / bonding
→ MR-MUF·NCF·molding
→ Logic base die + interposer/RDL + package substrate
→ TIM / heat spreader / warpage control
→ Final test / burn-in / high-speed thermal test
```

HBM4에서 중요한 변화는 bandwidth 숫자만이 아니다. 더 많은 I/O, logic base die, 더 높은 stack/package complexity, thermal·power integrity와 test difficulty가 함께 증가한다. 따라서 HBM 수요의 전달경로는 다음과 같이 분석해야 한다.

```text
AI server
→ GPU / accelerator shipments and HBM bytes per accelerator
→ Advanced DRAM wafer demand
→ TSV / thinning / bonding step intensity
→ Interposer / substrate / thermal complexity
→ Probe / KGD / package test value per package
→ Equipment, material, component and service revenue exposure
```

`HBM4 mass production`, `HBM4E sample/qualification`, `future HBM roadmap`은 동일한 상태가 아니다. 또한 hybrid bonding을 모든 HBM4 제품의 현재 표준으로 일반화하지 않는다.

## Technology inflection이 소부장에 전달되는 경로

### GAA / Nanosheet

3D gate/channel geometry는 conformal ALD, selective epi, selective/isotropic etch, interface control과 3D metrology의 공정강도(Process intensity)를 높인다.

### Backside Power Delivery

Front-side routing만 바뀌는 것이 아니다. temporary bonding, extreme thinning, backside alignment, via etch, dielectric/metal deposition, lithography, CMP와 backside inspection이 새로 연결된다.

### High-NA EUV

High-NA는 scanner-only market이 아니다. source·optics·stage뿐 아니라 mask, pellicle, resist/underlayer, track defectivity, stochastic control, overlay와 actinic inspection까지 하나의 qualification ecosystem을 형성한다.

### Hybrid Bonding

Bond pitch가 줄어들수록 surface roughness와 planarity tolerance가 작아지고, CMP, ultra-clean surface preparation, plasma activation, sub-micron alignment, interface metrology와 KGD의 중요도가 커진다.

### Chiplet / UCIe

Die 수와 die-to-die interface가 늘어나면 package co-design, RDL/interposer/substrate, placement/bonding, SI/PI validation과 partitioned test가 복잡해진다.

### SiC / GaN

기판결함, epi quality, high-temperature process, backside metal, wafer handling과 specialty inspection이 silicon CMOS와 다른 독립 flow를 만든다.

## 구조적 Chokepoint

공개자료만으로 최신 세부 시장점유율을 확정할 수 없는 node에는 임의의 숫자를 넣지 않았다. 대신 concentration, qualification, replacement time, 기술장벽과 geographic concentration을 결합해 구조적 병목 후보를 구분했다.

| Chokepoint family | 병목이 생기는 이유 |
|---|---|
| **EUV / High-NA scanner–optics–source** | 극단적 광학·광원·motion integration, 제한된 공급기반, 장기간 공동 qualification |
| **Advanced mask ecosystem** | EUV blank, multi-beam writing, blank/actinic inspection, pellicle의 상호의존성 |
| **Leading-edge process control** | defect size 축소와 3D 구조 때문에 inspection/metrology 없이는 yield learning 불가능 |
| **ABF / high-end substrate** | package density 증가, long qualification, build-up substrate 공정 복잡성 |
| **ATE / probe / high-speed test interface** | AI/HBM I/O와 power 증가로 test coverage·signal integrity·thermal 요구 동시 상승 |
| **Tool critical components** | MFC, valve, purifier, RF, ESC, pump/abatement 교체가 tool/process 재검증으로 연결 |
| **Ultra-high-purity chemistry** | contamination excursion이 여러 lot의 yield loss로 확대될 수 있음 |

## 한국 소부장 지도

한국은 메모리 제조 외에도 silicon wafer, specialty gas, 일부 photoresist/process chemicals, dry strip, deposition/clean, high-pressure anneal, scrubber/chiller, cleanroom/FFU, chamber consumables, FCBGA와 test interface에서 의미 있는 공급자층을 형성했다.

그러나 `국산화 제품 존재`와 `leading-edge HVM qualification`은 다르다.

| Node | 2026-08-20 판정 |
|---|---|
| Silicon / selected SiC wafer | 글로벌 경쟁 가능 |
| DUV resist, wet chemicals, NF₃/WF₆ | 국내·글로벌 경쟁 공급자 존재 |
| Selected deposition/clean/dry strip/HPA tools | 경쟁력 보유, node별 격차 상이 |
| Quartz/Si/SiC chamber parts | 상당 부분 국내 경쟁 가능 |
| Scrubber/chiller, cleanroom/FFU, AMHS | 국내 ecosystem 강함 |
| FCBGA, sockets/pins/test interfaces | 글로벌 경쟁 node 존재 |
| EUV scanner, High-NA optics/source | 사실상 수입 chokepoint |
| Advanced mask blank / actinic inspection | 해외 의존 높음 |
| Leading optical/e-beam process control | 해외 의존 높음 |
| Leading-edge ion implant / high-end ATE | 해외 의존 높음 |
| ABF | 매우 높은 해외 의존 |
| Hybrid bonding | application별 development/qualification 단계가 다름 |

특히 상장사만 보면 놓치는 long-tail이 있다. FST, Value Engineering, Seojin Electron, DeviceEng, CanTops, LSE, SUNJE, MMT, MMP, 3SLINE, Gauss Labs, Woowon Technology, Semics 등은 component, carrier cleaning, AMHS interface, utility monitoring, technical representation, wafer test 같은 leaf에서 다시 확인해야 한다. 다만 exhibitor와 product page는 **제품 존재의 증거**이지 삼성전자·SK hynix HVM 공급의 증거가 아니다. 고객관계가 공식적으로 확인되지 않으면 `UNVERIFIED`로 둔다.

## 국가별 구조적 강점

| Region | 주요 강점 node |
|---|---|
| United States | EDA/IP, deposition/etch/implant, process control, ATE, AI compute |
| Korea | DRAM/HBM/NAND, memory HVM, specialty gases·chemicals, selected equipment/components/test |
| Taiwan | leading foundry, advanced packaging, substrate ecosystem |
| Japan | wafer, resist, mask blank, high-purity chemicals, CMP, clean, dicing/test equipment |
| Netherlands | lithography, deposition, advanced bonding |
| Germany | EUV optics/laser, specialty materials/equipment |
| France | industrial/specialty gases, SOI ecosystem |
| China | mature-node expansion과 aggressive domestic localization; advanced-tool export-control exposure |
| Singapore / Malaysia / Vietnam | supplier manufacturing hubs, OSAT/test, downstream electronics·packaging expansion |
| India | design talent와 fab/ATMP build-out |
| Israel | specialty process, metrology/inspection R&D |

여기서 “장비를 누가 만드는가”와 “장비가 어느 국가의 fab으로 배송되는가”는 다른 geography layer다.

## 시장규모: 서로 다른 TAM을 합산하지 않는다

시장 숫자는 정의와 시점을 함께 표시해야 한다.

| Metric | Data period | Status | Value |
|---|---:|---|---:|
| Semiconductor equipment billings | 2025 | Actual | **$135B** |
| Total semiconductor manufacturing equipment | 2026 | Forecast | **$165.9B** |
| Wafer Fab Equipment | 2026 | Forecast | **$143.9B** |
| Test equipment | 2026 | Forecast | **$15.3B** |
| Assembly / packaging equipment | 2026 | Forecast | **$6.7B** |
| Semiconductor materials | 2025 | Actual | **$73.2B** |
| Wafer-fab materials | 2025 | Actual | **$45.8B** |
| Packaging materials | 2025 | Actual | **$27.4B** |
| Semiconductor device market | 2026 | Forecast | **$1.51T** |

마지막 device market는 chip sales다. equipment, materials와 포함관계가 다르므로 **소부장 TAM과 더해서 “전체 반도체 시장”이라고 부르지 않는다.** `Fab equipment spending`과 `equipment billings`도 정의가 다르다.

## Evidence discipline

이 지도에서 고객관계는 다음 상태를 구분한다.

```text
Rumor
→ Evaluation
→ Sample shipment
→ Qualification
→ Production qualification
→ Initial mass production
→ High-volume manufacturing
→ Long-term supply agreement
```

“삼성전자에 공급할 것으로 예상된다”와 “삼성전자 양산라인에 공급 중”은 같은 문장이 아니다. 고객사·공급사 공식자료, 공시 또는 계약자료로 확인되지 않으면 `UNVERIFIED`다.

주요 claim의 evidence grade도 분리한다.

- **A**: Primary source + independent corroboration
- **B**: Primary source only
- **C**: High-quality secondary source
- **D**: Company marketing claim only
- **E**: Rumor / weak evidence

D/E는 핵심 결론의 근거로 사용하지 않는다.

## 현재 Atlas가 보여주는 것과 아직 보여주지 못하는 것

Interactive Atlas에는 audited topology, 주요 공정 node, equipment-component dependency, 대표적인 global/Korean supplier anchor와 일부 공식 customer relation을 넣었다. 현재 공개 graph는 **322 nodes, 611 relations**를 렌더링한다.

그러나 다음은 계속 `PARTIAL` 또는 `UNKNOWN`으로 남는다.

- 790개 모든 leaf의 최신 global supplier share
- 세부 market의 2025/2026 TAM과 CAGR
- Korean long-tail supplier의 고객별 evaluation/qualification/HVM 단계
- China domestic replacement map의 leaf-level completeness
- High-NA의 foundry별·layer별 production adoption
- HBM generation별 bonding process-of-record
- company legal entity와 subsidiary 단위의 완전한 many-to-many revenue mapping

이 미확인 영역을 숨기지 않는 것이 이 연구의 핵심 품질조건이다.

## Interactive Atlas 사용법

- **Taxonomy lens**: 15개 상위 domain과 하위 node의 계층을 본다.
- **Process lens**: wafer가 manufacturing flow를 통과하는 순서로 재배치한다.
- **Company lens**: supplier와 buyer/platform anchor를 중심으로 본다.
- **Geography lens**: 공급망 강점과 geographic dependency를 본다.
- **Evidence lens**: VERIFIED/PARTIAL과 evidence grade 차이를 본다.
- **Incoming / Outgoing trace**: 선택 node의 upstream/downstream relation을 강조한다.
- **Search**: Node ID, 공정, 소재, 부품, 기업명으로 이동한다.
- **2D table**: GPU를 쓰지 않고도 동일 graph를 검색한다.

## Primary source registry

아래는 이 공개판의 시장·기술상태·taxonomy anchor에 사용한 주요 primary source다.

- [SEMI — Semiconductor Equipment Market Data](https://www.semi.org/en/products-services/market-data/equipment)
- [SEMI — 2025 Semiconductor Materials Market, $73.2B](https://www.semi.org/en/semi-press-release/global-semiconductor-materials-market-revenue-reaches-record-73.2-billion-dollars-in-2025-semi-reports)
- [SEMI — Semiconductor Components, Instruments and Subsystems](https://www.semi.org/en/communities/scis)
- [SEMICON Korea — Exhibitor and category structure](https://www.semiconkorea.org/en/about/exhibitor-list)
- [WSTS — 2026 global semiconductor market forecast](https://www.wsts.org/76/103/Global-Semiconductor-Market-Surges-Beyond-15T-2026)
- [ASML — High-NA EUV readiness milestone](https://www.asml.com/en/news/press-releases/2026/high-na-euv-reaches-new-readiness-milestone)
- [Intel Foundry — Intel 18A, RibbonFET and PowerVia](https://www.intel.com/content/www/us/en/foundry/process/18a.html)
- [SK hynix — HBM4 development and mass-production readiness](https://news.skhynix.com/en/sk-hynix-completes-worlds-first-hbm4-development-and-readies-mass-production/)
- [Micron — HBM4 high-volume production](https://investors.micron.com/news/press-release/2026/Micron-in-High-Volume-Production-of-HBM4-Designed-for-NVIDIA-Vera-Rubin-PCIe-Gen6-SSD-and-SOCAMM2-03-16-2026/default.aspx)
- [U.S. BIS — Export-control changes for foreign-owned fabs in China](https://www.bis.gov/press-release/department-commerce-closes-export-controls-loophole-foreign-owned-semiconductor-fabs-china)
- [산업통상자원부 — 반도체 소부장·미니팹·첨단패키징 관련 공고](https://www.motie.go.kr/attach/down/aa4abe331409819421ff269b271f06a6/f9c79804b4c01395fa53b620d51bb242/778bdbf5db9ced7c8fd52756c00bf0cd)

## 다음 업데이트 기준

이 map은 고정된 이미지가 아니라 versioned research asset으로 관리한다. 다음 업데이트에서는 다음 세 가지를 우선한다.

1. 790개 leaf와 406개 supply-side leaf를 machine-readable ledger로 직접 연결한다.
2. supplier–customer edge에 evaluation/qualification/HVM과 source date를 강제한다.
3. 각 node의 TAM, market definition, actual/estimate/forecast를 분리한 source registry를 확장한다.

최종 목표는 UNKNOWN을 억지로 없애는 것이 아니다. **무엇을 알고, 어떤 관계가 검증됐고, 어디부터 다시 조사해야 하는지를 보존하는 것**이다.

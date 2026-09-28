# SoC 00 — editorial source receipt

Research baseline: 2026-09-28. This is the first lesson in `soc-from-code-to-chip`, not a hardware implementation or a recruitment-role certification.

## Requested basis

The manuscript was drafted from the conversation-provided `soc-00-research.md`, `soc-00-worksheet.md` and `soc-00-writing-prompt.md`. The six chapter themes, fictional sensor_fifo contract and unresolved company-specific terminology were retained. The English article is a full parallel translation, including figures, register table, failures and answers.

Original research SHA-256: `e98cc0be4a0b28f67768d8194cda093792b06a26aa9662ca61785d48fa0121fd`.
Original worksheet SHA-256: `467b8018cf7434f8be00cfc0308a6eb7b564c147d7cfe0fdf224851e6f32e96a`.

Source IDs below correspond to the 18 numbered references in both manuscripts. They identify the existing research baseline, not a claim that every linked document was re-audited in the publishing step.

| Research claims | Manuscript coverage | Direct references | Boundary |
|---|---|---|---|
| C01–C07 | Chapter 1, classification and product examples | 1–7 | Definition vs educational classification; RP2040 and Zynq claims are product-specific |
| C08 | Chapter 2, interconnect | 8 | AMBA overview only; no AXI/NoC implementation |
| C09–C12 | Chapter 3, shared register specification and MMIO | 9–11 | UART example pinned to earlgrey_1.0.0; Linux access concepts pinned to 6.18 |
| C13 | Chapter 3, sensor software layers | 12, 16 | No claim that the invented IP already has an IIO driver |
| C14–C16 | Chapter 4, artifacts and parallel verification | 6, 13–16 | Models, FPGA observations and ASIC verification remain distinct |
| C17 | Chapter 5, MCAL and porting | 17, 18 | Official overviews; no AUTOSAR-compliance or implemented-port claim |
| C18 | Chapter 5, ambiguous job terminology | None; explicitly unknown | NIC and Static/Dynamic Coverage are not assigned an unverified company meaning |
| E01–E02 | Chapters 3 and 6, fictional contract and trace | Defined educational assumptions | Not OpenTitan UART addresses or a measured silicon result |

## Fictional contract retained

Unsigned 16-bit samples; depth 16; aligned full-word 32-bit MMIO only. CTRL=0x00, STATUS=0x04, DATA=0x08, IRQ_ENABLE=0x0C, ERROR=0x10. DATA reads pop existing samples; empty reads return error. STATUS reads do not consume samples. ERROR.bit0 is W1C; reserved reads are zero and reserved writes ignored. Invalid/RO/unaligned/partial accesses fail without state changes. Reset is highest priority; otherwise valid existing pop precedes push-space evaluation; a new overflow event wins over clear. ENABLE=0 does not flush existing data. Drop-new retains old samples when full. Data and error IRQ conditions are ORed.

The hand trace avoids simultaneous events: initially empty, enabled, one arrival at each t=1..20 ms, no reads through the last arrival. Results: retained 1..16, dropped 17..20, error set; 20 = 16 + 0 + 4. Payload capacity 32 bytes; payload input 2,000 bytes/s. No RTL/CPU/OS simulator or physical-address access is executed in the reader-facing lesson. A separate research PR contains an explicitly UNEXECUTED educational RTL/testbench draft.

## Visuals and interaction

`SocOverviewFigures.astro` supplies five original responsive HTML/CSS diagrams in each language: system boundary, sample/notification paths, shared register rules, W1C simultaneous-access priority, and development/verification handoffs. Captions identify them as educational reconstructions. There are no third-party photographs or remote diagram assets and no image-reuse permissions are presumed. Text reflows rather than shrinking a fixed-width drawing on mobile. Figures have named captions and localized text. Solid/dashed notification distinctions are labeled in words as well.

One native disclosure exercise and five review disclosures accompany the lesson. No fake links to unwritten later parts are created. The existing generic series metadata records chapter order 0.

## Publication checks

The existing English source/hash/static audit is unchanged. The browser suite adds an explicit SoC subtype while keeping existing news and power-bank assertions. It checks Korean/English, 390px/1440px, light/dark, five figure kinds and caption targets, six numbered chapters, five reviews, the register offsets, overflow and readable base figure text. Native Enter opens/closes exercise/review disclosures and follows the actual archive link. The suite retains exact locale round trips, citations and Back.

Screenshots and machine-readable results are generated in `english-review/` by CI. A test definition is not a passed test: completion is established by the workflow results attached to the PR. Site build, browser checks and publication checks do not certify the fictional hardware. Merge, Pages deployment and public-page verification are separate statuses.

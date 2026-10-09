# Educational Sensor FIFO Register Contract

이 사양은 **교육용**이며 실제 상용 칩의 주소가 아니다.

| Offset | Name | Access | Reset | Meaning |
|---:|---|---|---:|---|
| 0x00 | CTRL | RW | 0 | bit0 ENABLE |
| 0x04 | STATUS | RO | derived | bit0 EMPTY, bit1 FULL, bits[12:8] LEVEL |
| 0x08 | DATA | RO + read-pop | 0 | bits[15:0] oldest sample; successful read pops one entry |
| 0x0C | IRQ_ENABLE | RW | 0 | bit0 DATA_READY, bit1 OVERFLOW |
| 0x10 | IRQ_STATE | RW1C | 0 | bit0 DATA_READY sticky event, bit1 OVERFLOW sticky event |

## FIFO policy
- DEPTH=16, WIDTH=16.
- ENABLE=1일 때만 sample_valid 입력을 수집한다.
- full에서 추가 sample이 들어오고 같은 cycle에 pop이 없다면 **drop-new**.
- accepted push는 DATA_READY event를 set한다.
- dropped push는 OVERFLOW event를 set한다.
- DATA read는 FIFO가 non-empty일 때만 pop한다.
- IRQ = OR(IRQ_STATE & IRQ_ENABLE).

## W1C collision policy
software W1C clear와 새로운 hardware event가 같은 cycle에 발생하면 **새 hardware event가 우선(new event wins)**한다.

이 policy는 본 교육 DUT의 선택이며 OpenTitan 또는 다른 IP의 universal rule이 아니다.

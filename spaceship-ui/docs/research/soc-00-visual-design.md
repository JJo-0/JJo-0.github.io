# SoC 00 — 실물에서 데이터시트로

## 원고의 첫 질문

"이 초록색 보드 전체가 CPU일까요? 가운데 검은 칩이 CPU일까요?"

정의표보다 먼저 실물의 경계를 확인한다. 이 편에서 새로 추가할 핵심 이미지는 두 장이다. 장식용 칩 사진을 섹션마다 반복하지 않는다.

## 읽기 순서

1. **실물 보기** — Raspberry Pi Pico 상면 사진. 기판 전체 = Pico 보드, 가운데 RP2040 = MCU 패키지, CPU 코어 = 사진으로 보이지 않는 내부 회로. 사진에서 칩 내부를 봤다고 주장하지 않는다.
2. **같은 칩 안으로 들어가기** — RP2040 Datasheet, build 3184e62-clean (2025-02-20), Figure 2, printed p.10 / PDF page 11. Proc0/Proc1 → Bus Fabric → Memory/SRAM → Peripherals 네 군데만 안내한다.
3. **학습용으로 단순화하기** — 기존 다섯 HTML/CSS 도식과 가상 sensor_fifo는 학습용 예제로 분리한다. 실제 RP2040에 가상 레지스터 주소나 FIFO 깊이를 붙이지 않는다.

## 이미지 카드 설계

- 사진/도표가 먼저, 바로 아래에 한 문장 결론, 오른쪽 또는 아래에 읽는 순서.
- 넓은 화면: 이미지 약 2/3, 짧은 안내 약 1/3. 모바일: 이미지 → 안내 순서로 세로 배치.
- 사진에는 불필요한 장식·AI 생성 부품·추정 배선을 추가하지 않는다.
- 데이터시트는 Figure 2를 원문 그대로 발췌한다. 원문 영문 라벨에 번역이나 색칠을 덮지 않는다. 한글 해설은 별도 HTML 영역.
- 클릭하면 로컬 고해상도 이미지를 열 수 있고, 공식 PDF의 해당 페이지도 별도 링크로 연다.
- 두 이미지 모두 저장소에 보관한다. 첫 사진은 즉시 로드, 아래 데이터시트 이미지는 지연 로드. 원본 이미지의 크기를 HTML에 지정한다.
- 밝음/어두움 테마에서 문서는 흰 종이 배경 유지. 캡션·대체 텍스트·출처·라이선스는 한/영 모두 제공한다.

## 원본

- Phiarc, Raspberry Pi Pico top.jpg (2023-03-18): https://commons.wikimedia.org/wiki/File:Raspberry_Pi_Pico_top.jpg
- 이미지: https://upload.wikimedia.org/wikipedia/commons/3/38/Raspberry_Pi_Pico_top.jpg
- 사진 라이선스: CC BY-SA 4.0. 크기 조정/WebP 변환을 명시하고 동일 라이선스를 유지한다.
- Raspberry Pi Ltd, RP2040 Datasheet: https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf#page=11
- 데이터시트 라이선스: CC BY-ND 4.0. Figure 2의 원문 일부를 그대로 재현하고 페이지 전체도 보존한다. 그림 안의 내용 변경·번역·오버레이 없음. 원문/저작권 고지/판본을 함께 제공한다.
- 제조사 이용조건: https://www.raspberrypi.com/licensing/

## 발행 전 확인

- [ ] 두 원본 다운로드와 페이지/판본 확인
- [ ] 로컬 이미지, 실제 치수, SHA-256, 이용조건 기록
- [ ] 한/영 원고에서 실물 사진이 용어표보다 먼저 배치됨
- [ ] 데이터시트 원본과 가상 예제의 구분
- [ ] 390px/1440px 및 밝음/어두움 렌더, 확대 링크와 원문 링크
- [ ] 기존 다섯 도식, 여섯 장, 실습과 복습 문제, 영어 전환 회귀 유지

진행 상태는 실제 검사 후에만 변경한다.

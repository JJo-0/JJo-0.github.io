# 9만 6천 개 자석 스핀이 배선 문제를 푸는 원리

![원문 Figure 1. 확률적 자기소자에서 반도체 배선 최적화까지 연결한 전체 구조](/assets/posts/news-20260923/mram-fig-1.png)

이 연구는 메모리 속 작은 자석 9만 6천 개의 불확실한 뒤집힘을 최적화 계산 자원으로 사용했습니다. 배선을 선택할지 말지를 +1과 -1의 spin으로 바꾸고, 좋은 배선일수록 Ising 에너지가 낮아지도록 목적과 제약을 넣습니다.

![원문 Figure 2. 펄스 폭에 따라 전환 확률이 달라지는 실험](/assets/posts/news-20260923/mram-fig-2.png)

짧은 전압 펄스는 자석이 방향을 바꿀 장벽을 낮춥니다. 펄스 폭을 바꾸면 거의 0에서 1까지 switching probability를 조절할 수 있습니다. 중간 확률은 실패가 아니라 local minimum을 탈출하는 탐색 자원입니다.

![원문 Figure 3. 실제 VC-MRAM 칩과 FPGA 시스템](/assets/posts/news-20260923/mram-fig-3.png)

현재 실증은 VC-MRAM chip과 FPGA를 연결한 hybrid system입니다. 측정된 45 ns iteration·40 mW·1.92×10⁵ solutions/s/W와 향후 ASIC의 1 ns·3.45×10⁸ 전망을 구분해야 합니다.

[GitBlog 전체 해설](https://jjo-0.github.io/posts/2026-09-23-vc-mram-ising-machine-news/)

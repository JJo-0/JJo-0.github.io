# Stanford CS329Z 영상과 강의 슬라이드

[40편별 집필표](./stanford-cs329z-editorial-map.md) · [연재 목차](./README.md)

2026년 11월 25일(한국 기준) [Stanford Online 공식 재생목록](https://www.youtube.com/playlist?list=PLPRcF5HR02_U)에 공개된 영상 11개의 영어 자막을 조회했다. 아래 시각은 자막에서 해당 논의가 나오는 발화를 찾아 초 단위로 내림한 시작 위치다. 날짜는 2026년 Stanford 현지 일자이고, 강의일 / YouTube 공개일 순이다. 구간 수는 조회한 해당 자막 트랙의 분할 수다. 강의별 PDF·읽을거리는 [공식 강의계획표](https://cs329z.stanford.edu/)에서 확인할 수 있다.

| 영상 표기 | 강의 / 공개 | 강의명 | 자막 트랙 · 구간 수 | 원본의 해당 시점과 연재에서 활용할 내용 |
|---|---|---|---|---|
| 1 | 09-23 / 11-09 | What Are AI Agents? Agentic Systems Explained | 영어 수동 트랙(manual) · 1,341 | [1:02:06](https://www.youtube.com/watch?v=DGI4vucR71w&t=3726s) 반복했을 때 결과가 일치하는지, 입력을 조금 바꿔도 동작하는지, 실패를 이해하고 복구할 수 있는지 따로 묻는다. |
| 2 | 09-28 / 11-10 | LLMs for Agent Builders: Context Engineering | 영어 수동 트랙(manual) · 1,818 | [11:05](https://www.youtube.com/watch?v=Vr1NzH8bT44&t=665s) 온도·top-p·top-k가 생성 다양성을 바꾼다. 반복 평가표에 디코딩 조건을 함께 적는 이유를 설명할 때 쓴다. |
| 3 | 09-30 / 11-11 | RAG Explained: From BM25 to Agentic RAG | 영어 수동 트랙(manual) · 1,423 | [1:15:03](https://www.youtube.com/watch?v=psLc-46GqY0&t=4503s) 검색기가 근거를 놓치는 경우와 근거를 받았는데도 모델이 읽어내지 못하는 경우를 한 과제 안에서 구분한다. |
| 4 | 10-05 / 11-12 | How AI Agents Use Tools: Function Calling & MCP | 영어 수동 트랙(manual) · 1,473 | [1:17:50](https://www.youtube.com/watch?v=s0S38lz6O7M&t=4670s) 여러 시도 중 한 번 성공하는 pass@k와 선택한 k번이 모두 성공하는 pass^k가 같은 실행 기록에 서로 다른 질문을 던진다. |
| 5 | 10-07 / 11-13 | DSPy vs. LangGraph: AI Agent Frameworks Explained | 영어 수동 트랙(manual) · 1,942 | [1:14:33](https://www.youtube.com/watch?v=q0Q-Hy8TTps&t=4473s) 여러 모델 호출이 얽힌 파이프라인에서 실행 기록(trace)을 보면 어느 단계에서 실패했는지 좁힐 수 있다. |
| 6 | 10-12 / 11-14 | AI Agent Design Patterns: ReAct, CodeAct & More | 영어 수동 트랙(manual) · 1,835 | [1:11:25](https://www.youtube.com/watch?v=JC_pLC5EX_w&t=4285s) 컨텍스트의 선택·압축·격리가 모델에 도달하는 정보를 바꾼다. 긴 과제에서 하네스의 구성까지 평가 조건에 넣는 예다. |
| 7 | 10-14 / 11-15 | How AI Agent Memory Works: MemGPT & Memory Types | 영어 수동 트랙(manual) · 1,945 | [1:11:09](https://www.youtube.com/watch?v=qh5tP6PBZ6U&t=4269s) 시간에 따라 바뀐 사용자 선호를 기억해야 할 때 객관식 선택지의 난도와 실제 대화의 난도는 따로 점검해야 한다. |
| 8 | 10-19 / 11-16 | Multi-Agent Systems: When More Agents Help or Hurt | 영어 수동 트랙(manual) · 1,933 | [1:09:48](https://www.youtube.com/watch?v=TlX_ft_PQIM&t=4188s) 여러 에이전트가 실패한 실행을 시스템 설계, 에이전트 사이의 의사소통, 작업 검증 문제로 분해한다. |
| 9 | 10-21 / 11-17 | Optimizing AI Agents: Prompts vs. Weights (GEPA, GRPO) | 영어 수동 트랙(manual) · 1,983 | [44:03](https://www.youtube.com/watch?v=e_m99aR7_3Q&t=2643s) GEPA는 개선 후보를 평가하고 남은 예산 안에서 탐색을 반복한다. 후보 선택에 쓴 평가와 최종 성능 보고를 구분하는 사례로 쓴다. |
| 초청 | 10-26 / 11-18 | Terminal-Bench: Evaluating AI Agents | 영어 수동 트랙(manual) · 1,482 | [1:10:01](https://www.youtube.com/watch?v=7GW-9ug2nvw&t=4201s) 완료 과정을 한 번 관찰해도 올바른 대안 풀이 전체를 판별할 수는 없다. 검증기가 어떤 결과를 합격시키는지 별도 사례로 시험한다. |
| 10 | 10-28 / 11-24 | What Data Do AI Agents Need? | 영어 자동 인식(ASR) · 2,206 | [1:22:15](https://www.youtube.com/watch?v=HbgZFwWj4vY&t=4935s) 한 실행 하네스에서 학습한 도구 호출 방식이 다른 하네스에서 그대로 작동하는지 따로 검사해야 한다. |

10월 26일 Terminal-Bench는 초청 강연이며 [슬라이드 파일](https://web.stanford.edu/class/cs329z/slides/lecture10.pdf) 이름이 `lecture10.pdf`다. 10월 28일 John Yang의 데이터 강의는 유튜브에 Lecture 10으로 올라왔고 [슬라이드 파일](https://web.stanford.edu/class/cs329z/slides/lecture11.pdf)은 `lecture11.pdf`다. 인용할 때 날짜와 주제를 같이 적는다.

자막은 개별 발언의 위치와 내용을 확인하는 데 썼다. 11개 모두 영상 설명에서 자막 전문 재배포 허가를 확인할 수 없었다. 이 문서에는 직접 쓴 해설과 원본의 해당 시점 링크를 남겼다. [YouTube 라이선스 안내](https://support.google.com/youtube/answer/2797468)

## CS329Z에서 바로 펼칠 PDF

Stanford의 2026년 가을 CS329Z *Engineering AI Agents*에 공개된 강의 자료다. 날짜는 강의일이다. 아래 번호는 표지를 1로 세는 PDF 뷰어의 실제 페이지다. [공식 일정](https://cs329z.stanford.edu/) · [공식 PDF 디렉터리](https://web.stanford.edu/class/cs329z/slides/)

| 강의일 | 읽을 위치 | 본문에 적용할 질문 또는 사례 |
| --- | --- | --- |
| 9월 30일 · 검색 증강 생성(RAG) | [3강 p.56](https://web.stanford.edu/class/cs329z/slides/lecture03.pdf#page=56), [p.63](https://web.stanford.edu/class/cs329z/slides/lecture03.pdf#page=63) | 검색 시점과 종료 조건도 평가 대상이다. 답이 틀렸을 때 필요한 문서가 빠졌는지, 문서를 얻고도 무시했는지, 반복 과정에서 오류가 번졌는지 나눠 보자. |
| 10월 5일 · 도구 호출 | [4강 pp.58–60](https://web.stanford.edu/class/cs329z/slides/lecture04.pdf#page=58), [pp.63–67](https://web.stanford.edu/class/cs329z/slides/lecture04.pdf#page=63) | BFCL의 함수 선택·인수 생성 문제와 τ-bench의 다단계 업무를 짝지어 소개한다. 올바른 호출 한 번과 사용자 요청을 끝까지 해결하는 데 필요한 조건을 따로 표시한다. |
| 10월 14일 · 메모리 | [7강 pp.69–74](https://web.stanford.edu/class/cs329z/slides/lecture07.pdf#page=69), [pp.81–85](https://web.stanford.edu/class/cs329z/slides/lecture07.pdf#page=81) | LoCoMo로 과거 정보를 검색하는 단계와 답변에서 활용하는 단계를 구별하고, LongMemEval-v2로 작업 이력이 뒤의 결정에 미치는 영향을 살펴본다. |
| 10월 26일 · Terminal-Bench | [10강 p.38](https://web.stanford.edu/class/cs329z/slides/lecture10.pdf#page=38), [pp.42–49](https://web.stanford.edu/class/cs329z/slides/lecture10.pdf#page=42), [pp.60–61](https://web.stanford.edu/class/cs329z/slides/lecture10.pdf#page=60) | p.38의 2D 도면→3D 파일 예시는 출력 파일이 열리는지와 요구한 형상에 맞는지의 차이를 보여 준다. 과제·실행·검증기·하네스를 나눠 적고, 검증기만 바뀌었을 때 어떤 결과를 다시 채점할 수 있는지 묻는다. |
| 11월 2일 · 데이터 품질 | [12강 pp.15–18](https://web.stanford.edu/class/cs329z/slides/lecture12.pdf#page=15) | SWE-bench Verified의 사례로, 문제에 제시되지 않은 요구를 테스트가 강제할 때 모델과 평가 도구 중 어디에서 실패가 생기는지 토론한다. |
| 11월 4일 · 벤치마크 설계 | [13강 pp.14–17](https://web.stanford.edu/class/cs329z/slides/lecture13.pdf#page=14), [pp.29–37](https://web.stanford.edu/class/cs329z/slides/lecture13.pdf#page=29), [pp.42–45](https://web.stanford.edu/class/cs329z/slides/lecture13.pdf#page=42), [pp.60–69](https://web.stanford.edu/class/cs329z/slides/lecture13.pdf#page=60) | 시험형 벤치마크를 다룬 07편에는 pp.14–16을 붙인다. GPQA Diamond 부분집합은 원논문으로 정의한다. 에이전트 편에서는 테스트 통과·웹 상태·고객지원 DB 등 ‘성공’을 판정할 증거를 사례별로 적는다. 동일 비용·도구·시도 횟수인지와 결과를 재현할 버전 정보가 있는지는 pp.65–69가 출발점이다. |
| 11월 11일 · LLM 심사 및 평가 인프라 | [15강 pp.45–52](https://web.stanford.edu/class/cs329z/slides/lecture15.pdf#page=45), [pp.75–82](https://web.stanford.edu/class/cs329z/slides/lecture15.pdf#page=75), [pp.83–88](https://web.stanford.edu/class/cs329z/slides/lecture15.pdf#page=83) | 순서·길이 편향, 한 답에 점수 주기와 두 답 중 하나 고르기를 설명한다. 재시도가 가능한 업무와 매번 정확해야 하는 업무를 대비해 pass@k와 pass^k를 구별한다. p.86 설명 문장에 pass@k라고 섞여 쓰인 표기가 있어, pass^k 정의는 [τ-bench 원논문](https://arxiv.org/abs/2406.12045)과 공식화된 수식을 따른다. |
| 11월 18일 · 안전 | [17강 pp.21–25](https://web.stanford.edu/class/cs329z/slides/lecture17.pdf#page=21), [pp.59–60](https://web.stanford.edu/class/cs329z/slides/lecture17.pdf#page=59) | 실험에서 말로 답한 개인정보 규칙과 실제 행동 기록을 구분한다. 결과표에 업무 성공과 개인정보 취급 기준 충족을 별도 열로 두고, 배포 전 검증·배포 후 관찰을 구별한다. |

13강 p.61의 벤치마크 나열은 난도와 포화를 설명하기 위한 강의 예시다. 발표 연혁을 쓸 때에는 GPQA(2023), MMLU-Pro(2024) 등 개별 논문의 공개일을 따른다. 11월 16일 SWE-bench 특강은 공식 시간표에서 읽기 논문을 연결한다. 11월 25일 기준 11월 30일·12월 2일 강의는 예정 상태다.

# 08편 출처와 계산 검증

08편은 같은 응답이 추출 규칙, 채점 기준, 집계 단위에 따라 어떻게 다른 점수를 받는지 다룬다. 아래에서 PDF 페이지는 표지를 1로 센다. 글의 위치는 [40편 연재 목차](README.md)에서 확인할 수 있다.

본문 §1–2는 GSM8K·MATH 논문과 채점 코드, §3은 연재에서 만든 카메라 예제, §4는 MAA 대회 자료, §5는 MathArena의 2025·2026년 발표 그림 3, §6은 아래 검산 스크립트에 대응한다. Stanford 강의는 §2에서 반복 실행과 후보 선택의 차이를 기록할 때 사용했다.

## GSM8K · 답 추출과 풀이 후보 선택

- Karl Cobbe 외 11명, *Training Verifiers to Solve Math Word Problems*. 2021년 10월 27일 v1, 11월 18일 v2. 그림 1(p.2)은 다단계 문제 예시, §2(p.3)는 데이터 구성, 그림 5(p.8)는 여러 풀이 중 검증기가 고르는 실험이다. [논문 v2](https://arxiv.org/pdf/2110.14168v2)
- 논문은 규모를 반올림해 제시한다. OpenAI 공개본의 `main`은 학습 7,473문항, 시험 1,319문항이다. [고정 데이터 카드](https://huggingface.co/datasets/openai/gsm8k/blob/740312add88f781978c0658806c59bc2815b9866/README.md)
- 저자 저장소의 `extract_answer`는 정규식으로 `#### ` 뒤에 있는 숫자 표기를 찾고 쉼표를 지운다. `is_correct`는 추출한 문자열을 비교한다. 예컨대 정답이 `#### 1200`이면 `#### 1,200`은 일치하고 `#### 1200.0`은 다르다. [고정 채점 코드 24–41행](https://github.com/openai/grade-school-math/blob/3101c7d5072418e28b9008a6636bde82a006892c/grade_school_math/dataset.py#L24-L41)

## MATH · 수식 정규화가 처리하는 범위

- Dan Hendrycks 외 7명, *Measuring Mathematical Problem Solving With the MATH Dataset*. 2021년 3월 5일 v1, 11월 8일 v2. 그림 3(p.7)은 GPT-2가 작성한 풀이와 기준 답을 나란히 싣는다. §3.1(pp.4–5)에 7,500개 학습·5,000개 시험 문항과 풀이·최종 답 구조가 나온다. p.5의 *Automatically Assessing Generated Answers*는 `\boxed{}` 내부의 답 추출과 형식 차이 처리를 설명한다. [논문 v2](https://arxiv.org/pdf/2103.03874v2#page=4)
- 공개 구현은 공백과 일부 LaTeX 표기를 정리하고 제한된 치환을 수행한다. `0.5`를 명시적으로 반으로 바꾸며 단순 정수 분수 표기도 처리한다. 이 함수에서 `0.375`와 `3/8`은 서로 다른 문자열로 남는다. [고정 정규화 및 비교 구현](https://github.com/hendrycks/math/blob/985bdc1696e88e8643f081a0ff4719da39f2ae2a/modeling/math_equivalence.py#L69-L152)

같은 커밋의 저자 함수에 다음 입력을 직접 넣었다. GSM8K의 기준 답은 `is_correct`가 받는 예제의 `answer` 필드 값이다. MATH 입력은 상자에서 추출된 답의 문자열이다.

| 함수 | 모델 출력과 기준 답 | 관찰한 반환값 |
| --- | --- | --- |
| GSM8K `is_correct` | `#### 1,200` / `#### 1200` | `True` |
| GSM8K `is_correct` | `#### 24.0` / `#### 24` | `False` |
| GSM8K `is_correct` | `24` / `#### 24` | `False` |
| MATH `is_equiv` | `0.5` / `\frac{1}{2}` | `True` |
| MATH `is_equiv` | `2/4` / `1/2` | `False` |
| MATH `is_equiv` | `4(x+1)(x-1)` / `4(x-1)(x+1)` | `False` |
| MATH `is_equiv` | `0.375` / `3/8` | `False` |

## AIME · 한 회 시험과 모델 평가의 분모

- Mathematical Association of America(MAA)의 2025–26년 *Hosting MAA Competitions Guide* 중 *MAA AMC Cycle Overview*(PDF 6쪽)는 AIME를 15문항·3시간으로 설명한다. 같은 기관의 2025년 12월 15일 공지에 따른 AIME I은 2026년 2월 5일, 대체 회차 AIME II는 2월 11일이다. [해당 연도 운영 안내](https://maa.org/wp-content/uploads/2025/08/2025-2026-Hosting-MAA-Competitions-Guide.pdf#page=6) · [시험일 공지](https://maa.org/news/2025-26-aime-thresholds-are-now-available/)
- MathArena가 두 회차를 묶은 `aime_2026` 카드에는 30행이 있다. 정답 하나의 영향은 한 회차에서 6.67%p, 두 회차 합산에서 3.33%p다. [고정 데이터 카드](https://huggingface.co/datasets/MathArena/aime_2026/blob/d61f486805306e6e6b5913504c07763a99e1b112/README.md)
- MAA가 2026년 8월 26일 발표한 시험장 변경은 **2027년 2월 5–6일** 시험에 적용된다. 미국·캐나다에서는 Pearson 시험장에서 응시하며 안내된 총 15문항을 90분씩 두 부분으로 나눈다. [MAA 발표](https://maa.org/news/maa-announces-official-testing-centers-for-the-2027-american-invitational-mathematics-examination/) · [MAA 응시 안내](https://maa.org/maa-invitational-competitions/)

## MathArena Apex · 문항 선정, 실행, 후속 검증

- Jasper Dekoninck, Nikola Jovanović, Ivo Petrov, Martin Vechev, *MathArena Apex: Unconquered Final-Answer Problems*, 2025년 8월 18일. *Problem Selection and Filtering*에서 4개 선별 모델이 각 4번 풀어 한 번이라도 맞힌 후보를 제외했다. 최종 12개는 단답형 출처 6개와 증명형을 단답형으로 바꾼 6개다. [발표 원문](https://matharena.ai/apex/)
- 같은 글의 *Aggregate Results*, 그림 3은 직접 프롬프트를 준 8개 모델에 각 16회, GPT-5 (High) Agent에는 각 4회의 외부 실행을 집계했다. Qwen3-A22B-2507-Think의 문항별 정답 횟수는 순서대로 `7,0,0,0,2,0,1,0,0,0,0,0`이다. 실행 기준 10/192와 한 번 이상 맞힌 문항 기준 3/12를 재계산할 수 있다. [제작진 그림 3](https://matharena.ai/static/images/apex_results.png)
- 고정 공개본 `apex_2025`는 12행이며 각 행에는 정답과 출처가 있다. 설정은 상자에 최종 답을 쓰도록 요구하고 파서는 느슨한 모드를 사용한다. 채점기는 응답과 기준 답을 파싱한 뒤 비교한다. 2025년 수치의 출처는 위 발표의 그림 3이며, 아래 코드는 확인한 공개 구현의 리비전이다. [데이터 카드](https://huggingface.co/datasets/MathArena/apex_2025/blob/ac8a641db12cc87be39e61ea89f2e04c80c5f2e7/README.md) · [설정](https://github.com/eth-sri/matharena/blob/d98156fa67822629b7554faabeeea5682f4ad0ca/configs/competitions/apex/apex_2025.yaml) · [채점](https://github.com/eth-sri/matharena/blob/d98156fa67822629b7554faabeeea5682f4ad0ca/src/matharena/grader.py#L200-L235)
- Apex 데이터 카드의 라이선스는 CC BY-NC-SA 4.0이며, MathArena 코드의 라이선스는 MIT다. [데이터 이용 조건](https://huggingface.co/datasets/MathArena/apex_2025/blob/ac8a641db12cc87be39e61ea89f2e04c80c5f2e7/README.md) · [코드 라이선스](https://github.com/eth-sri/matharena/blob/d98156fa67822629b7554faabeeea5682f4ad0ca/LICENSE)
- Chenhao Sun, Jasper Dekoninck, Martin Vechev, *Farewell to Final-Answer Competition Problems as Frontier Benchmarks*, 2026년 5월 12일. *Construction Process and Results*, 그림 3은 **신규 후보 176개** 가운데 Gemini 3.1 Pro가 네 번 중 1~3회 맞힌 14개를 보여 준다. 1회 정답 1문항, 2회 6문항, 3회 7문항이며 나머지 162문항은 4회 모두 정답이다. 원 기준에 해당하는 신규 후보가 없어 연구팀은 Apex v2를 내지 않기로 했다. [후속 연구와 그림 3](https://matharena.ai/no_final_answer/)

## 12개 계산을 재현하는 방법

저장소 루트에서 실행한다. 파이썬 표준 라이브러리만 사용하며, 출력 직전까지 분자·분모를 정수로 보존한다.

```sh
python3 docs/ai-benchmark/check-chapter-08.py
```

| 그룹 | 검사 수 | 검증한 분자·분모 |
| --- | ---: | --- |
| 카메라 보정 자작 예시 | 4 | 원문자열 1/6, 유리수 동치 2/6, 경계 포함 절대 오차 3/6, 응답이 있는 경우만 3/5 |
| 2025년 Apex 그림 3 | 2 | Qwen3 정답 실행 10/192, 한 번 이상 성공한 문항 3/12 |
| 2026년 신규 후보 연구 | 4 | 부분집합 실행 34/56, 전체 실행 682/704, 한 번 이상 성공한 문항 176/176, 네 번 모두 성공한 문항 162/176 |
| 2026년 AIME | 2 | 1/15, 1/30을 백분율 포인트로 표시 |

카메라 예시는 기준값 3/8 mm/pixel과 절대 허용 오차 1/1000 mm/pixel을 택한 연재 자체 계산이다. 위 스크립트는 게시글에 사용한 분모를 검증한다. 저자 채점기의 동작은 각각의 고정 코드 링크에서 대조할 수 있다. [계산 스크립트](check-chapter-08.py)

## 보조 자료와 다음 편

- Stanford CS329Z의 2026년 11월 4일 *Evaluation Fundamentals & Benchmark Design*, PDF p.37 *Evaluation Protocol*을 확인했다. 시도 횟수를 실행 조건과 함께 기록하는 근거로 썼다. 이 편에서 대조한 강의 자료는 PDF다. [해당 페이지](https://web.stanford.edu/class/cs329z/slides/lecture13.pdf#page=37)
- 09편에서는 HLE 원논문과 HLE-Diamond 제작진의 별도 공개 문서를 대조해 선정 기준과 판본을 기록한다. [HLE 원논문](https://arxiv.org/abs/2501.14249) · [HLE-Diamond 발표](https://lastexam.ai/blog/hle-diamond)
- 이 기록은 08편 원고를 로컬에서 검토하며 남겼다. PR 검증 결과와 실제 블로그 반영 여부는 해당 커밋의 검사 및 배포 기록에서 확인한다.

# Deep Research 엔진 선택 및 연결 계획

기준일: 2026-09-07

## 결론

JJo 블로그 하네스는 하나의 모델에 종속하지 않는다. `ChatGPT Deep Research`를 품질 기준선으로 사용하고, `MiroFlow`를 공개 워크플로 엔진으로 채택한다. 공개 모델 도전자는 `MiroThinker-v1.5-30B`를 우선하고 `OpenResearcher-30B-A3B`와 `Tongyi-DeepResearch-30B-A3B`를 비교군으로 둔다. Claude 계열은 주 연구 결과를 독립적으로 반박하고 누락을 찾는 검증자와 저장소 작업자로 사용한다.

현재 장비는 Apple M1, 16 GB 메모리이므로 30B급 공개 모델을 로컬 기본 엔진으로 운영하지 않는다. 초기 파일럿은 호스팅 API 또는 기존 ChatGPT/Claude 연결을 사용한다. 로컬 모델은 이후 구조화 추출, 중복 검사, 초벌 분류 같은 작은 작업에만 검토한다.

2026-09-10 OpenRouter 공개 모델 API에서는 `MiroThinker`, `OpenResearcher`, `Tongyi-DeepResearch`의 정확한 모델 ID를 확인하지 못했다. OpenRouter는 현재 카탈로그에 있는 범용 모델을 MiroFlow에 연결하거나 저비용 구조화 작업에 사용하고, 위 연구 전용 모델은 별도 호스팅 경로가 확보될 때만 비교한다.

## 후보 평가

### ChatGPT Deep Research — 품질 기준선

- 웹, 업로드 파일, 연결된 앱을 연구 범위로 선택할 수 있고, 실행 전 계획을 검토·수정할 수 있다.
- 장문 보고서와 출처 제시 품질을 비교하는 기준 결과로 사용한다.
- 제품 내부 구현에 종속되므로 자동화 엔진의 유일한 기반으로 삼지는 않는다.
- OpenAI의 이전 API 전용 `o3-deep-research`와 `o4-mini-deep-research`는 현재 전체 모델 목록에서 deprecated로 표시되므로 신규 하네스는 여기에 고정하지 않는다. 프로그래밍 경로는 실행 시점의 현재 Responses API 모델과 웹 검색 도구를 조회해 선택한다.

### MiroFlow + MiroThinker-v1.5-30B — 공개 기본 도전자

- MiroFlow는 Apache-2.0 공개 프레임워크이며 OpenAI, Claude, Qwen 계열과 여러 도구를 교체해 사용할 수 있다.
- MiroThinker-v1.5-30B는 MIT 라이선스, 256K 컨텍스트, 최대 400회 도구 호출 구성을 제공한다.
- 공개 저장소가 보고한 v1.5 대형 모델의 점수는 HLE-Text 39.2%, BrowseComp 69.8%, BrowseComp-ZH 71.5%, GAIA-Val-165 80.8%다. 자체 보고 수치이므로 JJo 파일럿에서 별도 재검증한다.
- 모델 파일이 약 61 GB이므로 현재 MacBook Air에서 직접 운영하지 않고 호스팅 경로를 우선한다.

### OpenResearcher-30B-A3B — 재현성 비교군

- 모델·데이터·학습·평가 경로를 공개했고 모델 카드 라이선스는 MIT다.
- BrowseComp-Plus에서 54.8%를 보고했다. 같은 계열 벤치마크에서 GPT-5가 55.9%로 보고된 점을 고려하면 고정 코퍼스 검색 실험의 강한 비교군이다.
- 공식 저장소의 전체 환경 예시는 8×A100 80 GB를 사용하므로 개인 로컬 기본 엔진으로는 부적합하다.
- 장문 블로그 보고서 품질이 아니라 어려운 정보 찾기 점수가 중심이므로 독자 설명 품질은 별도로 평가한다.

### Tongyi-DeepResearch-30B-A3B — 호스팅 폴백

- Apache-2.0, 30B-A3B, 128K 컨텍스트를 제공한다.
- ReAct와 IterResearch 기반 Heavy 실행 경로가 있고 OpenAI 호환 호스팅 경로를 사용할 수 있다.
- 검색·페이지 읽기·파일 분석에 여러 외부 서비스가 필요하므로 초기 기본값보다 폴백으로 둔다.

### Claude / Claude Code — 독립 검증자

- Claude API는 웹 검색, 웹 가져오기, 코드 실행, MCP 연결을 제공하며 검색 결과에 인용 정보를 포함한다.
- Anthropic은 내부 연구 평가에서 Opus 리드와 Sonnet 서브에이전트 구성이 단일 Opus보다 90.2% 높았다고 보고했지만, 공개 벤치마크와 직접 비교할 수 없는 내부 수치다.
- JJo 하네스에서는 첫 보고서를 다시 조사하는 용도가 아니라 `누락·상충·근거 없는 주장·독자 선수지식`을 찾는 독립 검증자로 사용한다.
- Claude Code 또는 Agent SDK는 검증 결과를 저장소의 주장 원장과 개념 그래프로 변환하는 역할을 맡는다.

### gpt-oss — 후순위 로컬 작업자

- gpt-oss-120b와 20b는 Apache-2.0 공개 가중치이며 구조화 출력과 도구 사용에 적합하다.
- 120b는 약 80 GB, 20b도 공식 기준 약 16 GB 메모리가 필요하므로 현재 16 GB 장비에서 주 연구 엔진으로 운영하기 어렵다.
- 추후 양자화 모델을 사용하더라도 검색형 Deep Research가 아니라 분류·요약·JSON 정규화 작업에 한정한다.

## 권장 실행 조합

### Gold 경로 — 중요한 기술·투자 글

1. ChatGPT Deep Research로 1차 보고서를 만든다.
2. Claude 검증자가 핵심 주장과 빠진 반론을 독립 점검한다.
3. MiroFlow + MiroThinker가 근거가 약한 주장만 선택적으로 재검색한다.
4. 하네스가 세 결과를 주장 단위로 병합한다.

### Standard 경로 — 일반 기술 설명 글

1. MiroFlow + 현재 선택 모델로 조사한다.
2. Claude 또는 OpenAI 모델이 주장 원장과 독자 혼란 지점을 검토한다.
3. 실패한 주장만 재검색한다.

### Economy 경로 — 갱신·분류·오타 검사

- Deep Research를 실행하지 않는다.
- 기존 출처의 유효성 확인, 검색어 분류, 구조화 추출만 저비용 모델이나 결정적 코드로 처리한다.

## 공통 어댑터 계약

모든 엔진은 아래 결과물을 동일하게 반환해야 한다.

- `research-report.md`: 사람이 읽는 연구 보고서
- `sources.json`: URL, 제목, 발행자, 날짜, 접근일, 출처 등급
- `claims.json`: 주장, 근거 출처, 신뢰도, 반론, 불확실성
- `open-questions.json`: 해결하지 못한 질문과 재검색 조건
- `trace-summary.json`: 검색 수, 읽은 문서 수, 중단 이유, 비용·시간

모델 고유의 긴 사고 과정은 저장하지 않는다. 외부에서 검증할 수 있는 검색 기록, 출처, 주장 연결과 실패 사유만 보존한다.

## JJo 파일럿 평가표

U-Net 클러스터에서 같은 프롬프트를 각 후보에 실행하고 100점으로 비교한다.

- 주장 정확성 25
- 인용 URL 유효성과 주장 연결 20
- 공식 문서·논문 회수율 15
- 상충 자료와 불확실성 처리 10
- 초보 독자 설명 구조 15
- 한국어 품질 5
- 실행 비용·시간·재현성 10

BrowseComp나 GAIA 점수는 후보 선별에만 사용한다. 최종 기본 엔진은 JJo의 실제 글쓰기 평가표에서 결정한다.

## 구축 순서

1. `research-provider` 공통 인터페이스와 결과 JSON 스키마를 만든다.
2. 기존 ChatGPT Deep Research 결과를 가져오는 수동 import adapter를 먼저 만든다.
3. Claude 검증 adapter를 연결한다.
4. MiroFlow를 별도 격리 환경에서 설치하고 MiroThinker 호스팅 모델을 연결한다.
5. OpenResearcher와 Tongyi는 동일 프롬프트의 비교 실행기로 추가한다.
6. U-Net 질문 세트로 품질·비용·시간을 기록한다.
7. 기준을 통과한 조합만 운영 그래프의 `deep-research` 노드로 승격한다.

## 중단 및 승인 기준

- API 키 등록, 유료 API 실행, 대형 모델 다운로드, 외부 호스팅 생성은 사용자 승인 후 실행한다.
- 조사 결과는 자동 발행하지 않는다.
- 중요한 주장은 공식 1차 출처 하나 또는 독립 출처 두 개가 없으면 `unresolved`로 남긴다.
- 공개 모델의 자체 보고 점수는 JJo 파일럿을 통과하기 전까지 운영 품질의 근거로 사용하지 않는다.

## 근거 자료

- [ChatGPT Deep Research](https://help.openai.com/en/articles/10500283-deep-research)
- [OpenAI 현재 모델 목록](https://developers.openai.com/api/docs/models/all)
- [OpenAI gpt-oss](https://openai.com/index/introducing-gpt-oss/)
- [Anthropic 다중 에이전트 연구 시스템](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Claude 웹 검색 도구](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool)
- [MiroFlow](https://github.com/MiroMindAI/MiroFlow)
- [MiroThinker-v1.5-30B](https://huggingface.co/miromind-ai/MiroThinker-v1.5-30B)
- [OpenResearcher](https://github.com/TIGER-AI-Lab/OpenResearcher)
- [BrowseComp-Plus](https://texttron.github.io/BrowseComp-Plus/)
- [Tongyi DeepResearch](https://github.com/Alibaba-NLP/DeepResearch)

# 현대 인공지능 VI–VIII 후속 보강 — 2026-09-17

## 상태와 기준

- 기준 저장소: `JJo-0/JJo-0.github.io`, PR #129 head `61551394bdc490010d7c5eb5bb28834087315882`.
- 이전 대화의 로컬 원고/패치를 이어서 원본 그림 파일을 취득했다. 취득 run `35200820307`, 원본 artifact `10487791374`의 SHA-256은 `56afcd59ab801694c4731e4c6dbfa99835b9a8baf64570b00bca399c1f2ab575`다. 실제 PR head·CI 결과·공개 배포는 PR #129에서 별도로 추적한다.
- 기존 VI FCN·U-Net 보강 내용을 보존하며 6.4와 6.6을 확장했다. VII와 VIII는 기존 주요 절과 강의 식 호출·출처 주석을 유지해 다시 작성했다.
- 이전 `MODERN_AI_VI_PAPER_EXPANSION.md`의 “남은 부분은 개요”는 그 시점의 기록이다. 후속 원고 범위는 이 문서로 구분한다. 이전 CI 성공을 이번 수정본의 성공으로 재사용하지 않는다.

## 실제 보강 범위

| 부분 | 연산·수식·계산 | 실험 근거 | 원본 도판 상태 |
|---|---|---|---|
| VI PSPNet | pooling grid, C/4 projection, concat 2C, aux loss | ADE20K Table 1의 같은 조건 비교 | Figure 3 원본 PNG 취득·로컬 픽셀 검수 완료 |
| VI DeepLabv3 | dilation/padding, ASPP 5분기·1280→256, OS/rate | Tables 5–6에서 module/inference/data 조건 분리 | Figure 5 원본 PNG 취득·검수 완료 |
| VI DeepLabv3+ | decoder 256+48=304, separable parameter 계산 | Table 3 ResNet-101에서 mIoU와 Multiply-Adds 비교 | Figure 2 원본 도판 취득·검수 완료 |
| VI MRF·ICM | 명시적 Potts model, local update, 순차 감소, local-minimum·병렬 진동 반례 | 독립 toy model 전수검사; Besag 실험 수치 재현 아님 | 기존 자체 개념도만. Besag 전체 도판 검수 미완료 |
| VII VAE | 두 KL, ELBO 부호, Gaussian KL, logvar/reparameterization | bound 곡선과 likelihood/sample metric 구분 | Figure 1 PDF 도판 발췌·6px/pt 렌더·검수 완료 |
| VII DDPM | analytic conditional posterior, mean/noise parameterization, reweighted MSE | CIFAR-10 Tables 1–2, FID reference 구분 | Figure 2 원본 도판 취득·검수 완료 |
| VII CFG·LDM·Score-SDE | scale convention, 압축/attention shape, reverse dt·ODE 1/2·conditional/marginal score | trade-off와 평가 항목 해설; 모든 결과표 전사 아님 | 원본 위치 링크/기존 개념도; 새 도판 파일 없음 |
| VIII SimCLR·CLIP | 후보/target mask, symmetric loss, dimension/memory, downstream protocol | SimCLR Table 6; CLIP의 평가 유형·조건 | SimCLR Figure 2 PDF 발췌와 CLIP Figure 1 원본 PNG 취득·검수 완료 |
| VIII CPC·MoCo·BYOL·Barlow Twins | 후보 분모·MI 전제, queue/EMA, stop-grad, D×D correlation | ablation의 질문·평가 protocol 설명; 모든 표 전사 아님 | 원본 위치 링크/기존 개념도; 새 도판 파일 없음 |
| VIII DeepCluster·SwAV·SupCon | alternation, assignment mass, swapped target, 평균/log 순서 | 방법별 실험 해석 범위만 확장 | 위와 같음 |

## 원문 기준

PSPNet `1612.01105v2`; DeepLabv3 `1706.05587v3`; DeepLabv3+ `1802.02611v3`; Besag 1986, DOI `10.1111/j.2517-6161.1986.tb01412.x`; VAE `1312.6114v11`; DDPM `2006.11239v2`; CFG `2207.12598v1`; LDM `2112.10752v2`; Score-SDE `2011.13456v2`; CPC `1807.03748v2`; SimCLR `2002.05709v3`; Barlow Twins `2103.03230v3`; BYOL `2006.07733v3`; MoCo `1911.05722v3`; DeepCluster `1807.05520v2`; SwAV `2006.09882v5`; SupCon `2004.11362v5`; CLIP `2103.00020v1`.

arXiv URL의 버전을 고정했다. 그림의 원본 SHA-256은 실제 취득한 시점부터 고정한다. PNG 4개는 원문 bytes를 변경 없이 저장했다. PDF 도판 3개는 명시된 page/crop을 PyMuPDF 1.26.7, 6px/pt로 렌더링했다. `figures.json`에 취득 원본·최종 PNG의 해시, 크기, 원문 위치 및 실제 픽셀 검수의 대상 해시를 기록했다. 원논문 주장, 본문을 설명하기 위한 재표현, 독립 계산 예제를 구분했다. 전체 논문 번역·전체 PDF 재배포·학습 실험 재현은 이 묶음의 범위가 아니다.

## 검증 구분

- `verify-modern-ai-continuation.py`: 로컬에서 실행한 25개 unittest, 그 안의 8개 변이 거절. 산술·수치미분·ICM 전수 상태·원고 숫자 및 호출 유지 검사다.
- 읽기용 HTML: 로컬 LaTeX로 80개 수식을 조판했다. 이것은 Astro/KaTeX 빌드 결과가 아니다.
- `modern-ai-continuation-audit.mjs`: 도판 7개 signature·실제 PNG 크기·소스/결과 hash·해당 pixels의 검수 여부·원문 버전과 KaTeX parsing을 검사한다.
- `browser-modern-ai-continuation.mjs`: 세 글 × 390/1440px × light/dark 12개 조합에서 도판 decode·캡션·출처·종횡비를 확인하고, 실제 터치/마우스 28회로 확대 창에 동일 PNG가 표시되는지 검사한다. 정적 링크 존재를 클릭 성공으로 대신하지 않는다.
- 새 workflow는 추가 검사다. 기존 Blog CI와 PR #129의 테스트를 변경·삭제·완화하지 않는다.
- 공개 사이트와 이번 수정본의 브라우저 전체 matrix는 미검증이다. 읽기용 HTML의 검사와 배포 검사는 구분한다.

## 아직 필요한 단계

1. 취득·픽셀 검수를 마친 7개 도판의 최종 PR 화면 확인. 원문 도판 권리를 MIT/CC로 확대하지 않으며, 기술 검사 성공을 별도 전재 허락으로 표시하지 않는다.
2. 정확한 기준 head의 별도 worktree에 적용. 다른 내용이 바뀌었다면 강제 적용하지 않고 차이를 대조.
3. 기존 lint/type/SEO/harness/build/content/browser 및 추가 검사 실행.
4. 부분 보강으로 표시된 논문들의 원본 도판·표·실험 protocol 추가 검수.
5. 실제 commit/PR review/merge/Pages 배포와 공개 URL 확인을 따로 기록.

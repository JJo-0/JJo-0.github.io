# 2026-09-29 후보 2 — LC-1 대형 RNA 전달 LNP 검증 기록

현재 상태: `PUBLIC_SOURCE_NEWS_READY` · 세 편 NEWS 발행 요청에 따라 공개 자료 한정 해설 작성 · 확인일 2026-10-02 KST

전문 리뷰 상태: `FULL_METHODS_REVIEW_PENDING`. 아래의 2026-09-30 검토는 본문 접근 부재와 재현 검증의 한계를 기록한 과거 판단으로 보존한다. 본문 접근을 새로 확보한 것으로 처리하지 않는다.

## 2026-10-02 NEWS 발행 범위

- 작성 파일: `site/content/posts/2026-09-29-lc1-large-rna-delivery-news.mdx`.
- 일반 기초·수식·가상 예제와 공개 초록·보충자료의 연구 결과를 구분한다.
- 공식 보충자료의 Figures 1–2, 54–68 설명 확인; PDF pp.36, 38, 44, 46의 Figures 54, 56, 62, 64와 Reporting Summary 4쪽은 렌더링하여 시각 확인했다.
- 79%·48%·27%는 서로 다른 경로의 마우스 최고 수치로만 소개한다. 정확한 Methods의 모든 분모·품질 필터·맞춤 비교 조건을 검증했다고 쓰지 않는다.
- 식 3개: 조합 수, RNA 길이 비, 일반 형광 양성 비율. 편집률을 원시 데이터로 재현한 식이 아니다.
- LC-1 논문 도판은 복제하지 않는다. 일반 liposome 사진(CC BY-SA 4.0)과 독립 SVG 2개·입문 도식을 사용한다. 사진은 LC-1 데이터가 아님을 명시한다.
- GitBlog NEWS 발행만 범위에 포함한다. Blogger 신규 발행이나 완전한 연구자 리뷰를 완료 처리하지 않는다.

## 식별

- 논문: Dong, Gong, Thomson et al., “Lipid nanoparticles optimized for large RNA cargo and tissue targeting enhance in vivo genome editing,” *Nature Biotechnology*, 공개 2026-09-28.
- DOI: `10.1038/s41587-026-03298-8`
- 증거 등급: 동료평가 논문. 실험 단계는 세포·마우스 전임상; 인간 치료 효과 아님.
- 공식 출처: https://www.nature.com/articles/s41587-026-03298-8
- 공식 보충자료: https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fs41587-026-03298-8/MediaObjects/41587_2026_3298_MOESM1_ESM.pdf
- 연구실 서지: https://www.li-bowen.com/publications

## 확인한 주장과 출처 위치

| 주장 | 출처 위치 | 해석 경계 |
| --- | --- | --- |
| 384개 ionizable lipid 조합을 5.7 kb ABE–NanoLuc mRNA로 선별 | 공식 페이지 Abstract; 보충 Figure 1–2 | 384는 화학 조합 수, 동물 수가 아니다. Fluc 약 1.7 kb와 구분한다. |
| LC-1에서 간·뇌·폐 Cas9 knockout 최대 79%·48%·27% | 공식 페이지 Abstract·Figure 2 설명 | 각 조직·투여 경로·분모·유전자 좌위가 다른 결과다. 인체 교정률이 아니다. |
| ABE 기반 PCSK9·CFTR R55X·Ube3a-ATS 관련 실험 | 공식 페이지 Abstract·Figures 3, 6 및 Extended Data Fig 1 | knockout과 염기교정은 다른 편집 유형이다. 동물에서 질병 완치 증거가 아니다. |
| LC-1은 큰 mRNA에서도 ordered inverted-hexagonal 구조와 pH 반응성 막 교란을 유지 | 공식 페이지 Abstract·Figures 4–5, 보충 Figure 62 | 구조와 escape의 상관·기전 지지이지 개별 세포의 escape 전 과정을 직접 촬영한 것은 아니다. |
| 특허·이해관계 | 공식 페이지 Ethics declarations | S.D.와 B.L.의 University of Toronto invention disclosure CID00040, B.L.의 자문·컨설팅 공개. |

## 독자 해설의 현재 뼈대

- **L0:** 큰 유전자 편집기 mRNA를 넣을 때 전달이 약해지는 문제를, mRNA 크기를 선별 단계에 반영하는 방식으로 다뤘다. 사람 치료가 아니라 마우스 연구다.
- **L1:** mRNA는 설계도, LNP는 운반체라는 비유로 시작하되 실제로는 세포 유입 뒤 endosome에서 빠져나와야 단백질이 만들어진다는 한계를 설명한다.
- **L2 후보 수식:** `knockout fraction = 편집 판정 세포/전체 판정 세포`와 `ABE conversion = 목표 A→G 판정 read/전체 유효 read`는 일반적 지표다. 원문의 표적 좌위, 측정 방식, 품질 필터, 통계적 단위가 본문 Methods에서 확인되기 전에는 논문의 실험식으로 제시하지 않는다.
- **L3:** 기존 LP-01·ALC-0315 계열과 LC-1을 동일 cargo 크기·투여 경로·표적 조직에서 비교해야 한다. 큰 RNA에서 LNP 구조가 무너지지 않는다는 해석을 X-ray 산란/막 파괴 실험과 함께 읽어야 한다. 보충 Figure 캡션만으로 실험 상세를 재구성하지 않는다.

## 과거 전문 리뷰 차단 사유 — 여전히 해결되지 않은 본문 접근

공식 본문은 구독 제한으로 주요 Results·Methods를 열람할 수 없었다. 85쪽 공식 보충자료의 Figure 1–101 캡션은 공개되어 있지만, 저자들이 어떤 분모·품질 필터·투여/수집 시점으로 주요 편집률을 계산했는지 원문 Methods와 연결할 수 없다. 요청된 연구자 수준의 식·가정·baseline 비교·ablation 설명을 임의로 채우면 지표 오해를 만든다. 따라서 8,000자 이상 GitBlog 원고와 Blogger 공개 게시, 원본 Figure 재사용을 현재는 진행하지 않는다. 출판사는 본문 및 도판에 배타적 권리를 표시하므로 교육 목적·출처 표기만으로 재게시 권한이 생기지 않는다.

## 해제 조건과 다음 작업

1. 적법하게 접근 가능한 원문 PDF·저자 공개 원고 또는 출판사의 본문 접근을 확보하고 Methods·Results를 실제로 읽는다.
2. Figure 1–6의 분모·투여 경로·표적·실험 반복 수와 서열 판정 조건을 표로 만든다.
3. L0–L3 원고, 자체 제작 설명 도식 3개, Blogger 독립 해설을 준비한다. 원본 도판은 별도 재사용 허가가 확인되지 않으면 링크만 건다.
4. 사실·권리·렌더링·모바일 검수 뒤 승인된 원고 버전으로 GitBlog와 Blogger 발행을 판단한다.

HANDOFF: `engineeringDepthStatus=NOT_ENOUGH_DEPTH`; `equationCards=unverified`; `baselineMethods=LP-01,ALC-0315 (exact matched conditions pending)`; `graphNodes=Paper,Problem,Method,Metric,Result,Limitation`; `graphEdges=source-located abstract only`; `visualPlan=3 original explanatory diagrams, not yet made`; `sourceLocators=official Abstract/Figures/Supplement`; `RESEARCH_READY=false`.

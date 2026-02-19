document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.tab-btn');
    const contentSections = document.querySelectorAll('.content-section');
    const templateSelector = document.getElementById('templateSelector');
    const templateDisplay = document.getElementById('templateDisplay');

    function showSection(tabId) {
        contentSections.forEach(section => {
            if (section.id === tabId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }

    function updateActiveNav(activeTab) {
        navLinks.forEach(link => {
            if (link.dataset.tab === activeTab) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.tab;
            history.pushState(null, null, `#${targetId}`);
            showSection(targetId);
            updateActiveNav(targetId);
        });
    });

    function handleLocationChange() {
        const hash = window.location.hash.substring(1) || 'intro';
        showSection(hash);
        updateActiveNav(hash);
    }

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Initial load

    window.copyToClipboard = function(text) {
        const buttonElement = event.target;
        navigator.clipboard.writeText(text).then(function() {
            showTooltip(buttonElement, '복사 완료!');
        }, function(err) {
            showTooltip(buttonElement, '복사 실패');
            console.error('Async: Could not copy text: ', err);
        });
    }

    function showTooltip(buttonElement, message) {
        let tooltip = buttonElement.querySelector('.tooltiptext');
        if (!tooltip) {
            buttonElement.classList.add('tooltip');
            tooltip = document.createElement('span');
            tooltip.classList.add('tooltiptext');
            buttonElement.appendChild(tooltip);
        }
        tooltip.innerText = message;
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
        setTimeout(() => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
        }, 2000);
    }

    const promptTemplates = {
        general: {
            title: "A. 일반 목적 Deep Research 시작 프롬프트",
            description: "프롬프트는 간단하게 시작하고 사용자는 언제든지 계획을 조정할 수 있다. \\\"최종 목표를 간단히 표현하면... Deep Research가 알아서 처리할 수 있다\\\". 일반적인 프롬프트는 다음과 같다: \\\"제가 [XXX]를 빠르고, 포괄적이며, 심도 있게 이해할 수 있도록 심층 연구를 수행하는 데 도움을 주십시오\\\".",
            examples: [
                {
                    id: "general_ex1",
                    text: `\"주제 [광범위한 주제]에 대한 Deep Research 보고서 작성을 시작합니다. 주요 측면, 최근 개발 동향 및 향후 전망을 포괄하는 종합적인 개요가 필요합니다. 보고서는 서론, [측면 1], [측면 2], [측면 3]을 논의하는 본론 섹션, 그리고 결론으로 구성되어야 합니다. 지난 [기간, 예: 3년] 동안의 정보에 초점을 맞춰주십시오.\"`
                },
                {
                    id: "general_ex2",
                    text: `\"[특정 질문 또는 문제]에 대한 Deep Research 조사를 수행합니다. 저의 목표는 [주요 목표, 예: 주요 동인, 다양한 해결책, 역사적 맥락]을 이해하는 것입니다. [하위 질문 1], [하위 질문 2]를 다루는 연구 계획을 생성한 후 상세한 보고서를 작성해주십시오.\"`
                }
            ]
        },
        understanding: {
            title: "B. 사용 사례: 포괄적인 주제 이해 및 설명",
            description: "Deep Research는 \\\"주요 개념을 비교 대조하고, 아이디어 간의 관계를 파악하며, 기본 원리를 설명함으로써 주제를 깊이 탐구\\\"할 수 있습니다. 복잡한 주제를 이해하기 쉽게 설명하면서도 전문적인 깊이를 유지하는 것이 목표입니다.",
            examples: [
                {
                    id: "understanding_ex1",
                    text: `\"다각적인 개념인 [복잡한 주제, 예: \'비물리학자를 위한 양자 얽힘\']을 설명하는 심층 보고서를 생성해주십시오. 보고서는 다음을 포함해야 합니다: 1. 접근 가능한 용어로 개념을 정의합니다. 2. 역사적 발전 과정과 주요 실험/발견을 설명합니다. 3. [관련 분야, 예: 양자 컴퓨팅, 보안 통신]에서의 현재 응용 프로그램과 중요성을 상세히 설명합니다. 4. 일반적인 오해를 논의하고 복잡한 수학적 기초를 개념적으로 단순화합니다. 5. 향후 연구 방향과 잠재적인 혁신을 간략하게 설명합니다. 교육받은 일반인이 이해할 수 있도록 명확한 언어를 사용해주십시오.\"`
                },
                {
                    id: "understanding_ex2",
                    text: `\"Deep Research 요청: [특정 주제, 예: \'창조 산업에서 생성형 AI의 사회경제적 영향\']에 대한 포괄적인 이해를 제공해주십시오. 이 연구는 [주요 개념 1, 예: 새로운 예술 형식의 기회]과 [주요 개념 2, 예: 지적 재산권에 대한 도전]을 비교하고 대조해야 합니다. [아이디어 A, 예: AI 기반 콘텐츠 제작]와 [아이디어 B, 예: 전통적 창작 과정] 간의 관계를 파악해주십시오. [핵심 메커니즘, 예: 생성 모델이 예술적 스타일을 학습하는 방식]의 기본 원리를 설명해주십시오. 최종 보고서는 정책 입안자와 업계 이해 관계자에게 적합해야 합니다.\"`
                }
            ]
        },
        analysis: {
            title: "C. 사용 사례: 심층 경쟁 분석",
            description: "Deep Research는 \\\"신제품에 대한 경쟁사 환경, 즉 제품, 가격, 마케팅 및 고객 피드백을 포함하여 이해\\\"할 수 있다. 시장 현황을 체계적으로 분석하고 전략적 통찰을 제공하는 것이 목표입니다.",
            examples: [
                {
                    id: "analysis_ex1",
                    text: `\"[우리 회사/제품]을 위한 [산업/틈새 시장, 예: \'지속 가능한 포장 솔루션\'] 시장에서의 Deep Research 경쟁 분석을 수행해주십시오. 지난 [기간, 예: 2년] 동안 [지리적 지역, 예: \'유럽 연합\']에 초점을 맞춰주십시오. 상위 3-5개 주요 경쟁사인 [경쟁사 A], [경쟁사 B], [경쟁사 C]를 식별하고 분석해주십시오. 보고서에는 다음 내용이 상세히 포함되어야 합니다: 1. 각 경쟁사의 제품/서비스 제공 내용, 주요 기능 및 가격 책정 전략. 2. 마케팅 접근 방식, 대상 고객 및 고객 피드백(공개 출처를 통해 확인 가능한 경우). 3. 강점, 약점, 시장 점유율(추정 가능한 경우) 및 최근 전략적 움직임에 대한 평가. 4. 이 분석을 기반으로 한 [우리 회사/제품]의 시장 기회 및 위협 식별. 5. [우리 회사/제품]의 경쟁 포지셔닝을 강화하기 위한 전략적 권장 사항.\"`
                },
                {
                    id: "analysis_ex2",
                    text: `\"Deep Research 작업: [새로운 제품 개념, 예: \'긱 경제 근로자를 위한 AI 기반 개인 금융 자문 앱\']에 대한 포괄적인 경쟁 환경 보고서를 생성해주십시오. 분석에는 다음 내용이 포함되어야 합니다: 1. 직접 및 간접 경쟁사 식별. 2. 각 주요 경쟁사별: 제공 서비스, 가격 모델, 고유 판매 제안 및 고객 리뷰. 3. 이 분야의 일반적인 마케팅 전략 및 고객 확보 채널 분석. 4. 경쟁사가 활용하고 있는 기술 혁신 및 새로운 트렌드 평가. 5. 식별된 경쟁사와 비교하여 [새로운 제품 개념]에 대한 SWOT 분석(강점, 약점, 기회, 위협). 보고서는 제품 차별화 및 시장 진입을 위한 실행 가능한 통찰력으로 마무리되어야 합니다.\"`
                }
            ]
        },
        due_diligence: {
            title: "D. 사용 사례: 실사 및 회사/법인 프로파일링",
            description: "Deep Research는 \\\"잠재적인 영업 리드 조사, 회사 제품, 자금 조달 내역, 팀 및 경쟁 환경 분석\\\"을 수행할 수 있다. 투자나 파트너십 검토를 위한 체계적인 기업 분석이 목표입니다.",
            examples: [
                {
                    id: "due_diligence_ex1",
                    text: `\"[회사 이름]에 대한 Deep Research 실사 조사를 수행해주십시오. 연구는 다음에 초점을 맞춰야 합니다: 1. 회사 개요: 연혁, 사명, 리더십 팀 및 주요 인력(공개적으로 확인 가능한 경우). 2. 제품/서비스: 상세 제공 내용, 대상 시장 및 알려진 기술 인프라. 3. 재무 건전성(공개 데이터/보고서 기준): 자금 조달 내역, 투자자, 보고된 수익 또는 성장 지표 및 모든 M&A 활동. 4. 시장 지위: 인지된 강점과 약점, 주요 경쟁사 및 업계 평판(뉴스 기사, 리뷰, 업계 분석에서 수집). 5. 최근 뉴스 및 개발 동향: 지난 [기간, 예: 18개월] 동안의 중요한 발표, 파트너십 또는 과제. 보고서는 이러한 결과를 잠재적인 파트너십 평가에 적합한 포괄적인 프로필로 종합해야 합니다.\"`
                },
                {
                    id: "due_diligence_ex2",
                    text: `\"Deep Research 요청: [공인/전문가, 예: \'재생 에너지 정책 전문가 에블린 리드 박사\']에 대한 상세 프로필을 작성해주십시오. 프로필에는 다음 내용이 포함되어야 합니다: 1. 전문 배경: 학력, 주요 직책, 중요한 업적 및 소속. 2. 전문 분야 및 해당 분야에 대한 주요 기여. 3. [특정 주제, 예: \'태양 에너지 보조금의 미래\']에 대한 주요 출판물, 이론 또는 공개 성명 요약. 4. 해당 분야 내 논란의 여지가 있는 문제에 대한 알려진 입장(있는 경우). 5. 미디어 노출 및 대중적 인식. 가능한 경우 출처를 인용해주십시오. 목표는 [우리 프로젝트/관심사]와 관련된 그들의 영향력과 관점을 이해하는 것입니다.\"`
                }
            ]
        },
        comparison: {
            title: "E. 사용 사례: 상세 제품/서비스 비교",
            description: "Deep Research는 \\\"기능, 성능, 가격 및 고객 리뷰를 기반으로 다양한 가전제품 모델을 평가\\\"할 수 있다. 의사결정에 도움이 되는 객관적이고 체계적인 비교 분석이 목표입니다.",
            examples: [
                {
                    id: "comparison_ex1",
                    text: `\"다음 세 가지 [제품 카테고리, 예: \'프로젝트 관리 소프트웨어\']: [제품 A], [제품 B], [제품 C]를 비교하는 Deep Research 보고서를 생성해주십시오. 비교는 다음 기준을 기반으로 해야 합니다: 1. 핵심 기능 및 기능성(작업 추적, 협업 도구, 보고와 같은 특정 기능 상세 설명). 2. 가격 등급 및 가성비(소규모, 중규모 및 대규모 팀 대상). 3. 사용자 인터페이스 및 사용 편의성(사용 가능한 리뷰 및 튜토리얼 기준). 4. 통합 기능(기타 일반적인 비즈니스 도구와의 통합). 5. 고객 지원 및 커뮤니티 피드백. 6. 확장성 및 다양한 비즈니스 규모에 대한 적합성. 결과를 구조화된 형식으로 제시하되, 이상적으로는 요약 비교표와 함께 각 기준에 대한 상세 분석을 제시해주십시오.\"`
                },
                {
                    id: "comparison_ex2",
                    text: `\"Deep Research 작업: 두 가지 주요 [서비스 유형, 예: \'기업용 클라우드 스토리지 제공업체\']: [제공업체 X]와 [제공업체 Y]를 평가하고 비교해주십시오. 분석은 다음에 초점을 맞춰야 합니다: 1. 서비스 제공: 스토리지 용량 옵션, 백업 및 복구 솔루션, 데이터 전송 기능. 2. 보안 기능: 암호화 방법, 규정 준수 인증(예: ISO 27001, SOC 2), 액세스 제어 메커니즘. 3. 성능 지표: 가동 시간 보장, 데이터 검색 속도, 확장성. 4. 가격 모델: 특정 서비스/사용 수준에 대한 숨겨진 수수료 또는 요금을 포함한 상세 비용 분석. 5. 신뢰성 및 지원에 관한 고객 리뷰 및 업계 분석가 보고서. 보고서는 [우리 산업, 예: \'금융 서비스 부문\']에서 [특정 요구 사항, 예: \'매우 안전하고 확장 가능한 데이터 스토리지\']를 필요로 하는 회사에 대한 권장 사항으로 마무리되어야 합니다.\"`
                }
            ]
        },
        synthesis: {
            title: "F. 사용 사례: 보고서 및 요약을 위한 정보 종합",
            description: "Deep Research는 \\\"더 자세한 내용과 통찰력을 담은 포괄적인 맞춤형 연구 보고서\\\"를 제공합니다. 여러 출처의 정보를 체계적으로 종합하여 새로운 통찰을 도출하는 것이 목표입니다.",
            examples: [
                {
                    id: "synthesis_ex1",
                    text: `\"Deep Research를 수행하여 [복잡한 주제, 예: \'해양 생태계에 대한 미세 플라스틱 오염의 전 세계적 영향\']에 대한 보고서를 위한 정보를 종합해주십시오. 연구는 지난 [기간, 예: 5년] 이내에 발표된 과학 저널, 평판이 좋은 환경 단체 및 정부 보고서에서 데이터를 수집해야 합니다. 종합된 보고서에는 다음 내용이 포함되어야 합니다: 1. 미세 플라스틱 오염의 주요 원인 및 유형. 2. 다양한 해양 생물 및 먹이 사슬에 대한 문서화된 영향. 3. 현재 및 제안된 완화 전략과 그 효과. 4. 주요 연구 격차 및 향후 연구 우선 순위. 최종 결과물은 명확한 섹션과 인용된 출처(가능하면 APA 스타일)를 포함하는 약 [단어 수, 예: 1500단어]의 잘 구조화된 요약 보고서여야 합니다.\"`
                },
                {
                    id: "synthesis_ex2",
                    text: `\"Deep Research 요청: [새로운 기술, 예: \'뉴로모픽 컴퓨팅의 발전과 잠재적 응용 분야\']에 대한 요약 보고서를 작성하기 위해 정보를 수집하고 종합해주십시오. 연구는 학술 논문, 산업 간행물 및 특허 출원에서 정보를 가져와야 합니다. 요약 보고서에는 다음 내용이 강조되어야 합니다: 1. 기술에 대한 간결한 정의 및 설명. 2. 지난 [기간, 예: 3년] 동안 달성된 주요 혁신 및 이정표. 3. 최소 세 가지 다른 산업에 걸친 잠재적 파괴적 응용 분야. 4. 광범위한 채택에 대한 주요 과제 및 한계. 5. 이 분야의 주요 연구 기관 및 회사. 요약 보고서는 비기술 임원 청중을 대상으로 하며 [페이지 수, 예: 2페이지]를 넘지 않아야 합니다.\"`
                }
            ]
        }
    };

    function displayTemplate(templateKey) {
        const template = promptTemplates[templateKey];
        if (!template) return;

        let examplesHtml = template.examples.map(ex => `
            <div class="code-block mt-4">
                <button class="copy-button" onclick="copyToClipboard(this.nextElementSibling.innerText)">복사</button>
                <pre><code class="language-text">${ex.text}</code></pre>
            </div>
        `).join('');

        templateDisplay.innerHTML = `
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-700 mb-3">${template.title}</h3>
                <p class="text-stone-600">${template.description}</p>
                ${examplesHtml}
            </div>
        `;
    }

    if (templateSelector) {
        templateSelector.addEventListener('change', (e) => {
            displayTemplate(e.target.value);
        });
        // 초기 템플릿 표시
        displayTemplate(templateSelector.value);
    }
});

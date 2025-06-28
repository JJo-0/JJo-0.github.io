---
layout: single
title: "Gemini Deep Research 고급 프롬프트 엔지니어링 가이드"
categories: [DeepSearch, Gemini, AI, Areal]
tag: [DeepSearch, Gemini, AI]
toc: true
author_profile: false
sidebar:
    nav: "docs"
---

{% include tailwind_cdn.html %}
{% include chartjs_cdn.html %}
{% include google_fonts.html %}

<!-- Visualization & Content Choices:
    - Report Info: Deep Research Process (Plan, Search, Reason, Report) -> Goal: Inform -> Viz/Presentation: HTML/CSS diagram -> Interaction: Static visual -> Justification: Clearly illustrate the core process.
    - Report Info: Core Prompt Elements (Table 1) -> Goal: Inform/Organize -> Viz/Presentation: Interactive HTML Table -> Interaction: Static display, clear formatting -> Justification: Easy lookup and understanding of essential components.
    - Report Info: Prompt Templates (Table 2 & Section IV examples) -> Goal: Apply/Organize -> Viz/Presentation: Interactive selection with dynamic display of template structure & examples, "Copy" button -> Interaction: User selects use case, views/copies template -> Justification: Direct practical application of the guide. Library: Vanilla JS.
    - Report Info: Advanced Techniques (Table 3 & Section V examples) -> Goal: Inform/Apply -> Viz/Presentation: Interactive table with expandable rows for examples, "Copy" button for examples -> Interaction: View details/copy examples -> Justification: Clear presentation of advanced methods. Library: Vanilla JS.
    - Report Info: General textual content -> Goal: Inform -> Viz/Presentation: Well-formatted text blocks with Tailwind CSS -> Interaction: Read, navigate via sidebar -> Justification: Standard way to present detailed explanations.
    - CONFIRMATION: NO SVG graphics used. NO Mermaid JS used. Chart.js/Plotly.js not used as no quantitative data in report requires charting; focus is on interactive text/structure. -->
<style>
    body {
        font-family: 'Inter', 'Noto Sans KR', sans-serif;
        line-height: 1.7;
        letter-spacing: 0.01em;
    }
    .content-section {
        display: none;
        opacity: 0;
        transition: opacity 0.4s ease;
    }
    .content-section.active {
        display: block;
        opacity: 1;
    }
    .table-responsive {
        overflow-x: auto;
        margin: 1.5rem 0;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
    }
    th, td {
        border: 1px solid #e2e8f0;
        padding: 12px 16px;
        text-align: left;
        vertical-align: middle;
    }
    th {
        background-color: #f1f5f9;
        font-weight: 600;
        color: #334155;
    }
    tbody tr:hover {
        background-color: #f8fafc;
    }
    .code-block {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        position: relative;
    }
    .copy-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background-color: #3b82f6;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    .copy-button:hover {
        background-color: #2563eb;
    }
    .nav-link.active {
        background-color: #bfdbfe;
        color: #1e3a8a;
        font-weight: bold;
    }
    .prompt-template-btn.active {
        background-color: #60a5fa;
        color: white;
    }
     .tooltip {
        position: relative;
        display: inline-block;
    }
    .tooltip .tooltiptext {
        visibility: hidden;
        width: 120px;
        background-color: #555;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px 0;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        margin-left: -60px;
        opacity: 0;
        transition: opacity 0.3s;
    }
    .tooltip:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
    }
    @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
        animation: fadeIn 0.6s ease-out;
    }

    /* 기본 코드 블록 스타일 개선 */
    pre {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        padding: 1.25rem;
        margin: 1.5rem 0;
        overflow-x: auto;
        font-size: 0.95rem;
        line-height: 1.5;
        position: relative;
    }

    code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* 모바일 환경 개선 */
    @media (max-width: 640px) {
        .md\:p-10 {
            padding: 1.5rem !important;
        }
        h2 {
            font-size: 1.75rem !important;
        }
        h3 {
            font-size: 1.25rem !important;
        }
        .p-8 {
            padding: 1.25rem !important;
        }
        .content-section {
            margin-bottom: 2.5rem !important;
        }
        td, th {
            padding: 8px 10px !important;
            font-size: 0.85rem;
        }
    }

    /* 링크 스타일 개선 */
    a:not(.nav-link) {
        color: #0369a1;
        text-decoration: none;
        transition: all 0.2s ease;
    }

    a:not(.nav-link):hover {
        color: #0284c7;
        text-decoration: underline;
    }
</style>

<div class="flex flex-col md:flex-row min-h-screen">
    <nav class="md:w-72 bg-sky-700 text-white p-5 space-y-3 md:sticky md:top-0 md:h-screen overflow-y-auto shadow-lg">
        <h1 class="text-2xl font-bold mb-8 pb-3 border-b border-sky-500 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            Deep Research 가이드
        </h1>
        <button class="md:hidden fixed top-4 right-4 z-20 p-3 bg-sky-800 rounded shadow-md flex items-center justify-center" id="menuToggle">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <div id="navMenu" class="hidden md:block space-y-1">
            <a href="#intro" class="nav-link hover:bg-sky-600">I. 소개</a>
            <a href="#principles" class="nav-link hover:bg-sky-600">II. 핵심 원칙</a>
            <a href="#crafting" class="nav-link hover:bg-sky-600">III. Deep Research 프롬프트 작성</a>
            <a href="#templates" class="nav-link hover:bg-sky-600">IV. 프롬프트 템플릿</a>
            <a href="#advanced" class="nav-link hover:bg-sky-600">V. 고급 기법</a>
            <a href="#optimization" class="nav-link hover:bg-sky-600">VI. 최적화 및 안전장치</a>
            <a href="#conclusion" class="nav-link hover:bg-sky-600">VII. 결론</a>
        </div>
    </nav>
    <main class="flex-1 p-6 md:p-10 bg-stone-50 overflow-y-auto">
        <div id="intro" class="content-section space-y-8 animate-fade-in">
            <h2 class="text-3xl md:text-4xl font-bold text-sky-700 pb-2 border-b-2 border-sky-100">I. Gemini Deep Research 및 전문 프롬프트 소개</h2>
            <p class="text-lg md:text-xl text-stone-700 leading-relaxed">이 섹션에서는 Gemini Deep Research의 기본 개념, 주요 기능, 그리고 효과적인 사용을 위한 프롬프트 엔지니어링의 중요성에 대해 설명합니다. Deep Research는 복잡한 연구 작업을 자율적으로 수행하여 통찰력 있는 보고서를 생성하는 강력한 도구입니다.</p>
            <div class="p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-4 flex items-center">
                    <svg class="w-6 h-6 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                    A. Gemini Deep Research란 무엇인가? 주요 기능 및 사용 사례
                </h3>
                <p class="leading-relaxed">Gemini Deep Research는 복잡한 연구 작업을 처리하도록 설계된 "에이전트 기능(agentic feature)"으로, 자율적으로 최대 수백 개의 웹사이트를 탐색하고, 결과를 검토하며, 통찰력 있는 다중 페이지 보고서를 생성합니다. 이는 마치 "매우 스마트한 비서"를 두는 것과 유사합니다.</p>
                <p class="mt-3 leading-relaxed">Deep Research는 사용자의 프롬프트를 개인화된 다중 지점 연구 계획으로 변환한 후, 반복적으로 정보를 검색하고 추론하며, 최종적으로 발견한 내용을 보고합니다. 이러한 4단계 프로세스(계획, 검색, 추론, 보고)는 효과적인 프롬프트 작성 방법을 이해하는 데 근본적인 역할을 합니다. Deep Research는 Gemini 웹 앱 및 모바일 앱의 텍스트 상자 아래 또는 모델 선택기에서 "Deep Research"를 선택하여 액세스할 수 있습니다.</p>
                <div class="mt-4 p-4 bg-sky-50 border-l-4 border-sky-500 rounded">
                    <h4 class="font-semibold mb-2 text-sky-800">주요 사용 사례</h4>
                    <ul class="list-disc list-inside space-y-1 text-stone-700">
                        <li>경쟁 분석 및 실사</li>
                        <li>심층 주제 이해 및 제품 비교</li>
                        <li>지역 정보 조사 및 이벤트 계획</li>
                    </ul>
                    <p class="mt-3 text-sm text-stone-600">예시: 20개 이상의 여름 캠프에 대한 세부 정보 비교 가능</p>
                </div>
                <p class="mt-4 leading-relaxed">보고서는 일반적으로 생성하는 데 5-10분이 소요되며, 복잡한 주제의 경우 더 오래 걸릴 수 있으며, 준비되면 사용자에게 알림이 갑니다. 이러한 보고서는 오디오 개요로 변환될 수도 있습니다.</p>
                <p class="mt-2">Deep Research는 특히 "많은 탐색과 여러 탭을 필요로 하는" 작업에 유용하며, 사용자가 "주제에 대해 전혀 모르는 상태에서 깊이 이해"하도록 돕는다. 빠르고 즉각적인 답변을 위한 기능은 아니다.</p>
                <p class="mt-2">Deep Research의 "에이전트적(agentic)" 특성은 프롬프트가 단일 작업을 명령하는 것이 아니라 다단계의 자율적인 프로세스를 시작하고 안내한다는 점을 시사한다. 이는 프롬프트가 전체 연구 수명 주기를 알릴 만큼 포괄적이어야 함을 의미한다. Deep Research는 프롬프트로부터 연구 계획을 생성하고 사용자는 연구 시작 전에 "계획 편집(Edit plan)" 기능을 통해 계획을 수정할 수 있다. 이 기능은 AI가 프롬프트를 초기에 어떻게 해석했는지에 따라 연구 방향을 반복적으로 개선할 수 있는 강력한 제어 지점이다. 초기 프롬프트의 품질은 연구 계획의 *초안* 품질에 직접적인 영향을 미치며, "계획 편집" 기능은 중요한 *수정 메커니즘*으로 작용한다. 따라서 사용자는 명확한 초기 프롬프트를 작성하여 좋은 시작 계획을 얻되, "계획 편집" 기능을 활용하여 연구 방향을 미세 조정할 준비가 되어 있어야 하며, 이는 처음부터 상호작용적이고 반복적인 프로세스를 가능하게 한다.</p>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">B. Deep Research 성공을 위한 프롬프트 엔지니어링의 중요성</h3>
                <p>Deep Research는 강력한 기능이지만, 그 효과는 "제공하는 프롬프트의 품질에 크게 좌우된다". 명확하고 집중된 프롬프트는 더 정확하고 유용한 응답으로 이어진다. 시스템은 복잡한 사용자 쿼리를 상세한 연구 계획으로 분해하며, 프롬프트는 이러한 분해 과정의 주요 입력값이다. 사용자는 "계획을 제어"하고 수정할 수 있지만, 잘 만들어진 초기 프롬프트는 광범위한 계획 편집의 필요성을 최소화한다.</p>
                <p class="mt-2">Deep Research를 위한 프롬프트 엔지니어링은 단순히 단일 응답을 유도하는 것이 아니라 복잡한 시스템을 관리하는 것이다. 프롬프트는 자율적인 에이전트의 경로를 설정한다. Deep Research는 자율적으로 검색, 추론 및 보고 작업을 수행하며, 프롬프트 품질이 출력 품질을 결정한다. 이는 마치 자율 주행 연구 차량의 초기 매개변수와 목표를 설정하는 것과 같다. 부실한 초기 프롬프트는 계획을 편집할 수 있더라도 "차량"을 관련 없는 경로로 이끌어 사용자와 AI의 시간을 낭비하게 할 수 있다. 따라서 사용자는 Deep Research가 수행할 *전체 연구 프로세스*를 전략적으로 고려하고 이러한 전략적 의도를 프롬프트에 인코딩해야 한다. 여기에는 필요한 정보 유형, 요구되는 추론, 최종 보고서의 원하는 구조를 예측하는 것이 포함된다.</p>
            </div>
        </div>
        <div id="principles" class="content-section space-y-6">
            <h2 class="text-3xl font-bold text-sky-700">II. Gemini를 위한 효과적인 프롬프트 작성의 핵심 원칙</h2>
            <p class="text-lg text-stone-600">이 섹션에서는 Gemini, 특히 Deep Research 기능의 기초가 되는 효과적인 프롬프트 작성의 핵심 원칙들을 다룹니다. 명확한 작업 지시, 풍부한 컨텍스트 제공, 적절한 페르소나 설정 등이 중요합니다.</p>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">A. 필수 프롬프트 구성 요소: 작업, 컨텍스트, 페르소나, 형식, 톤</h3>
                <p>Google의 일반적인 Gemini 프롬프트 가이드는 페르소나, 작업, 컨텍스트, 형식이라는 네 가지 주요 구성 요소를 강조한다. 모든 프롬프트에 이 네 가지를 모두 사용할 필요는 없지만, 몇 가지를 사용하면 도움이 된다. "작업"(동사 또는 명령)은 가장 중요한 구성 요소이다. Cobry의 가이드 또한 작업, 컨텍스트, 예시, 페르소나, 형식, 톤을 더 나은 Gemini 프롬프트를 위한 핵심 요소로 강조한다. Vertex AI 문서는 목표, 지침, 톤, 컨텍스트, 소수샷 예시, 추론 단계 및 응답 형식을 구성 요소로 나열한다.</p>
                <p class="mt-2">Deep Research의 경우 "컨텍스트"와 "작업"(또는 "목표")이 가장 중요해진다. Deep Research의 "페르소나"는 본질적으로 "심층 연구자"이지만, 사용자는 여전히 프롬프트의 페르소나 요소를 통해 출력 보고서의 *스타일*을 안내할 수 있다. "형식"은 최종 보고서에 매우 중요하다. Deep Research는 복잡하고 여러 출처를 기반으로 하는 조사를 수행하며, 핵심 프롬프트 구성 요소에는 작업과 컨텍스트가 포함된다. Deep Research의 "작업"은 항상 "심층 연구 수행"이다. *무엇을* 연구하고 *어떻게* 제시할지에 대한 구체적인 내용은 사용자의 상세한 컨텍스트와 형식 요구 사항에 따라 정의된다. 따라서 사용자의 프롬프트는 주제, 원하는 범위, 답변해야 할 특정 질문에 대한 풍부하고 구체적인 컨텍스트를 제공해야 한다. 또한 최종 보고서의 예상 구조와 세부 수준을 명확하게 정의해야 한다. 사용자는 "작업"을 극도로 구체적으로 상세화하고(예: "매개변수 P1, P2, P3에 걸쳐 A, B, C를 비교하여 X를 분석하라") 포괄적인 "컨텍스트"(예: "최근 시장 변화 M1, M2 및 경쟁사 조치 A1, A2를 고려하라")를 제공하는 데 중점을 두어야 한다.</p>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">B. 모범 사례: 명확성, 구체성, 자연어 사용, 반복, 간결성, 문서 활용</h3>
                <ul class="list-disc list-inside space-y-2 text-stone-700">
                    <li><strong>자연어 사용:</strong> 사람에게 말하듯이 작성하고, 완전한 생각과 문장으로 표현한다.</li>
                    <li><strong>구체적이고 반복적으로 작성:</strong> Gemini에게 무엇을 해야 할지(요약, 작성, 분석 등) 명확하게 알리고 가능한 한 많은 컨텍스트를 제공한다. 결과가 완벽하지 않으면 프롬프트를 수정한다. 가장 유용한 프롬프트는 관련 컨텍스트와 함께 평균 21단어이다.</li>
                    <li><strong>간결하고 복잡성/전문 용어 피하기:</strong> 요청 사항을 간결하지만 구체적으로 명시한다.</li>
                    <li><strong>대화형으로 만들기:</strong> 후속 프롬프트와 반복적인 검토를 사용한다.</li>
                    <li><strong>문서 활용:</strong> Google Drive의 파일 정보를 사용하여 출력을 개인화한다. Deep Research는 주로 웹을 탐색하지만, 이 원칙은 Deep Research 작업 전후에 있을 수 있는 일반적인 Gemini 상호 작용에 유용하다.</li>
                    <li><strong>복잡한 작업 분해:</strong> 여러 관련 작업의 경우 별도의 프롬프트를 사용한다. 이는 Deep Research에 대한 입력을 구조화하거나 후속 분석에 매우 관련성이 높다.</li>
                    <li><strong>작업 수행 이유 설명:</strong> 이는 Gemini가 더 유용한 답변을 제공하는 데 도움이 된다.</li>
                    <li><strong>전문 지식 수준 포함:</strong> 설명 수준을 조정할 수 있다.</li>
                </ul>
                <p class="mt-3 text-sm text-stone-600">\"유용한 프롬프트의 평균 21단어\"라는 정량적 지침은 Deep Research 프롬프트가 시작하는 작업의 복잡성을 고려할 때 *훨씬 더 길고 상세해야* 할 가능성이 높다는 점을 시사한다. 효과적인 일반 프롬프트는 약 21단어이며 컨텍스트가 풍부하지만, Deep Research는 *복잡한* 연구를 처리한다. 복잡한 작업은 본질적으로 더 자세한 지침과 컨텍스트를 필요로 한다. 따라서 Deep Research용 프롬프트는 포괄적인 연구 보고서의 범위, 목표 및 원하는 출력을 적절하게 정의하기 위해 이 21단어 평균을 훨씬 초과해야 할 가능성이 높다. 사용자는 Deep Research를 위해 상세하고 단락 길이의 프롬프트를 작성하는 것을 주저해서는 안 되며, 연구에 필요한 모든 매개변수가 명확하게 표현되도록 해야 한다. *언어*에서는 간결성이 여전히 중요하지만, 지침의 *완전성*을 희생해서는 안 된다.</p>
                <p class="mt-3 text-sm text-stone-600">Deep Research를 위한 \"복잡한 작업 분해\" 원칙은 두 가지 방식으로 해석될 수 있다. 첫째, 사용자가 매우 큰 연구 목표를 여러 개의 개별적인 Deep Research 프롬프트로 분해하는 것이다. 둘째, 사용자가 단일의 포괄적인 Deep Research 프롬프트를 작성하여 AI에게 주요 연구 질문의 여러 하위 주제 또는 측면을 조사하도록 내부적으로 지시하고, Deep Research는 이를 계획에 통합하는 것이다. 일반적인 조언은 복잡한 작업을 분해하는 것이며, Deep Research 자체도 쿼리를 하위 작업으로 분해한다. 사용자는 연구를 선제적으로 분해하거나 Deep Research가 내부적으로 분해하는 방법을 안내할 수 있다. 매우 다면적인 연구의 경우, 사용자는 순차적인 Deep Research 작업을 실행하여 한 작업의 출력을 다음 프롬프트에 알릴 수 있다. 또는 잘 구조화된 단일 프롬프트가 Deep Research를 안내하여 다면적인 계획을 생성하도록 할 수 있다. 사용자는 자신의 연구가 하나의 큰 Deep Research 쿼리로 가장 잘 처리되는지, 아니면 여러 개의 작고 상호 연결된 쿼리로 가장 잘 처리되는지 결정해야 한다. 후자의 경우, 하나의 Deep Research 보고서 출력이 다음 프롬프트의 중요한 컨텍스트가 될 수 있다.</p>
            </div>
        </div>
        <div id="crafting" class="content-section space-y-6">
            <h2 class="text-3xl font-bold text-sky-700">III. Gemini Deep Research를 위한 강력한 프롬프트 작성</h2>
            <p class="text-lg text-stone-600">Deep Research의 잠재력을 최대한 발휘하기 위해서는 그 작동 방식에 맞춰 프롬프트를 설계해야 합니다. 이 섹션에서는 Deep Research의 4단계 프로세스(계획, 검색, 추론, 보고)에 프롬프트를 정렬하는 방법, 명확한 범위와 목표 설정, 풍부한 컨텍스트 제공 및 원하는 출력 형식 지정의 중요성을 강조합니다.</p>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">A. Deep Research 프로세스(계획, 검색, 추론, 보고)에 프롬프트 정렬하기</h3>
                <p>Deep Research는 프롬프트를 "개인화된 다중 지점 연구 계획"으로 변환하고(계획), "자율적으로 웹을 검색하고 깊이 탐색"하며(검색), "반복적으로 수집된 정보에 대해 추론하면서 생각을 보여주고"(추론), "포괄적인 맞춤형 연구 보고서를 제공"한다(보고).</p>
                <p class="mt-2">프롬프트는 Deep Research의 각 내부 단계에 대한 명확한 입력을 제공하도록 구조화되어야 한다. Deep Research에는 계획, 검색, 추론, 보고라는 뚜렷한 내부 단계가 있으며, 초기 프롬프트는 "계획" 단계의 주요 동인이며, 이는 "검색" 및 "추론" 단계를 지시하고 궁극적으로 "보고" 단계를 형성한다. 성공적인 프롬프트는 이러한 단계를 예측한다. 전체 연구 목표(계획용), 찾아야 할 주요 영역 또는 정보 유형(검색용), 필요한 분석 또는 종합 유형(추론용), 최종 출력의 원하는 구조 또는 요소(보고용)를 명확하게 명시해야 한다. 예를 들어 사용자는 다음과 같은 프롬프트를 작성할 수 있다: "X에 대한 포괄적인 보고서를 생성하라 [보고 - 전체 출력]. 보고서는 A, B, C를 다루어야 한다 [계획 - 주요 영역]. 각 영역에 대해 P1, P2에 대한 정보를 찾고 [검색 - 정보 유형] 상호 의존성을 분석하라 [추론 - 분석 유형]."</p>
                 <div class="mt-4 p-4 border-l-4 border-amber-400 bg-amber-50 rounded">
                    <h4 class="font-semibold text-amber-700">Deep Research 4단계 프로세스</h4>
                    <ol class="list-decimal list-inside space-y-1 text-stone-700 mt-2">
                        <li><strong>계획 (Plan):</strong> 사용자의 프롬프트를 기반으로 개인화된 다중 지점 연구 계획을 수립합니다.</li>
                        <li><strong>검색 (Search):</strong> 자율적으로 웹을 검색하고 깊이 탐색하여 관련 정보를 수집합니다.</li>
                        <li><strong>추론 (Reason):</strong> 수집된 정보를 반복적으로 분석하고 종합하며, 이 과정에서 AI의 "생각"을 보여줍니다.</li>
                        <li><strong>보고 (Report):</strong> 최종적으로 포괄적이고 맞춤화된 연구 보고서를 사용자에게 제공합니다.</li>
                    </ol>
                </div>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">B. 심층 조사를 위한 범위 및 목표 정의</h3>
                <p>Deep Research에게 무엇을 하기를 원하는지 구체적으로 명시해야 한다. "기후 변화에 대해 알려줘" 대신 "향후 50년 동안 해수면 상승이 해안 지역 사회에 미치는 영향을 경제적, 사회적 혼란에 초점을 맞춰 분석하라. 영향을 받는 지역의 구체적인 예를 포함하라"와 같이 시도하라. 지리적, 시간적, 주제적 경계를 정의하고, 주요 연구 질문이나 작업, 원하는 결과(예: 상세 분석, 비교, 권장 사항)를 명확하게 명시해야 한다.</p>
                <p class="mt-2">범위의 명확성은 Deep Research의 "검색" 단계 효율성과 "추론" 단계의 관련성에 직접적인 영향을 미친다. 프롬프트는 범위(지리적, 시간적, 주제적)를 정의해야 하며, Deep Research는 자율적으로 검색하고 탐색한다. 잘 정의된 범위는 검색 프로세스의 필터 역할을 하여 에이전트가 관련 없는 길을 탐색하는 것을 방지한다. 범위가 너무 넓으면 Deep Research가 너무 많은 초점 없는 정보를 수집하여 추론 과정을 어렵게 만들고 보고서가 희석될 수 있다. 너무 좁으면 중요한 정보가 누락될 수 있다. 사용자는 연구 범위를 신중하게 고려하고 명확하게 표현해야 한다. 예를 들어, "향후 10년간(시간적) 미국 고용 시장(지리적)에 대한 AI의 영향을 분석하되, 의료 및 제조 부문(주제적)에 초점을 맞추시오."와 같이 작성할 수 있다.</p>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">C. 풍부한 컨텍스트 제공 및 원하는 출력 형식 지정</h3>
                <p>작업을 정확하게 완료하는 데 도움이 되는 추가 정보를 제공해야 한다. 여기에는 핵심 용어, 관련 배경 또는 특정 관점이 포함될 수 있다. 출력물의 원하는 형식(예: 보고서, 요약, 목록, APA 스타일 인용, 단어 수, 요약, 다양한 부문에 미치는 영향과 같은 특정 섹션)을 지정해야 한다.</p>
                <p class="mt-2">프롬프트에서 출력 형식을 지정하는 것은 Deep Research의 "보고" 단계에 직접적인 영향을 미치며, 해당 구조를 채우는 데 필요한 정보 및 분석 유형을 암시함으로써 "추론" 단계를 안내할 수도 있다. 사용자는 출력 형식, 구조, 심지어 인용 스타일까지 지정할 수 있으며, Deep Research는 "포괄적인 맞춤형 연구 보고서"를 생성한다. 사용자가 "요약", "영향 분석", "권장 사항" 섹션을 요청하면 Deep Research의 추론 프로세스는 이러한 특정 섹션을 채울 수 있는 정보를 식별하는 데 맞춰진다. 원하는 출력 구조는 Deep Research가 채우려고 하는 템플릿 역할을 한다. 즉, 프롬프트의 형식 지정 지침은 단순히 외형적인 것이 아니라 연구 및 종합 프로세스를 적극적으로 형성한다. 사용자는 프롬프트를 작성하기 *전에* 이상적인 보고서 구조를 생각하고 해당 구조적 요소(제목, 부제목, 섹션별 특정 콘텐츠 유형)를 프롬프트 자체에 포함해야 한다. 이는 Deep Research에 대한 명확한 청사진을 제공한다.</p>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">표 1: Deep Research를 위한 핵심 프롬프트 요소</h3>
                <p class="text-stone-600 mb-4">Deep Research를 효과적으로 활용하기 위한 프롬프트에는 다음과 같은 핵심 요소들이 포함되어야 합니다. 각 요소는 AI가 연구 목표를 명확히 이해하고, 관련 정보를 효율적으로 탐색하며, 사용자가 원하는 형태로 결과를 도출하는 데 도움을 줍니다.</p>
                <div class="table-responsive">
                    <table class="min-w-full bg-white">
                        <thead class="bg-sky-100">
                            <tr>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">요소</th>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">설명</th>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">일반적인 예시 문구</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b">
                                <td class="py-3 px-4">명확한 연구 목표</td>
                                <td class="py-3 px-4">연구를 통해 궁극적으로 달성하고자 하는 바를 명확히 정의한다.</td>
                                <td class="py-3 px-4">"이 연구의 목표는 [X]를 이해하는 것입니다."</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">구체적인 연구 질문</td>
                                <td class="py-3 px-4">연구가 답변해야 할 주요 질문들을 명시한다.</td>
                                <td class="py-3 px-4">"[Y]는 [Z]에 어떤 영향을 미칩니까?"</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">주요 조사 영역/주제</td>
                                <td class="py-3 px-4">연구에서 다루어야 할 핵심 영역이나 주제를 지정한다.</td>
                                <td class="py-3 px-4">"보고서는 [주제 A], [주제 B], [주제 C]를 포함해야 합니다."</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">범위 정의 (시간적, 지리적, 주제적)</td>
                                <td class="py-3 px-4">연구의 시간적, 지리적, 주제적 경계를 설정하여 조사의 초점을 명확히 한다.</td>
                                <td class="py-3 px-4">"[지역]에서 [기간] 동안 [주제]에 초점을 맞춥니다."</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">필수 컨텍스트/배경 정보</td>
                                <td class="py-3 px-4">AI가 연구를 이해하고 수행하는 데 필요한 배경 지식이나 특정 정보를 제공한다.</td>
                                <td class="py-3 px-4">"[상황]을 고려할 때, [정보]가 중요합니다."</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">원하는 출력 형식 및 구조</td>
                                <td class="py-3 px-4">최종 보고서의 형식(예: 보고서, 요약), 구조(예: 섹션 제목), 길이 등을 지정한다.</td>
                                <td class="py-3 px-4">"결과는 [형식]으로, [구조]를 포함하여 [길이]로 제시되어야 합니다."</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">필요한 분석 깊이/관점</td>
                                <td class="py-3 px-4">연구에서 요구되는 분석의 깊이나 특정 관점(예: 비판적, 비교적)을 명시한다.</td>
                                <td class="py-3 px-4">"각 요소에 대한 [관점] 분석을 제공하십시오."</td>
                            </tr>
                            <tr>
                                <td class="py-3 px-4">우선순위 정보 출처/회피 정보 출처 (알고 있는 경우)</td>
                                <td class="py-3 px-4">AI가 참고하거나 피해야 할 특정 정보 출처(예: 학술 논문, 특정 웹사이트)를 지정한다.</td>
                                <td class="py-3 px-4">"주로 [출처 유형]의 정보를 사용하고, [회피 출처]는 피하십시오."</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">D. 개선 및 심층 탐구를 위한 후속 프롬프트 활용</h3>
                <p>보고서가 생성된 후 사용자는 채팅 창에서 후속 질문을 할 수 있다. Deep Research는 이미 수집된 정보를 기반으로 답변하거나 웹으로 돌아가 추가 정보를 찾는다. 사용자는 보고서 생성 후 Deep Research에 새로운 정보를 추가하도록 요청할 수 있으며, 실시간으로 보고서를 조정한다 (예: "캠프 비용 세부 정보를 내 보고서에 추가해 줘").</p>
                <p class="mt-2">Deep Research 보고서는 반드시 최종 산출물이 아니며, 상호작용적이고 진화하는 문서가 될 수 있다. 후속 프롬프트는 컨텍스트 창과 RAG 기능을 활용한다. 사용자는 Deep Research 보고서에 후속 질문을 하고 추가 사항을 요청할 수 있으며, Gemini Advanced는 100만 토큰 컨텍스트 창과 RAG 설정을 갖추고 있다. 초기 Deep Research 보고서와 이를 생성하기 위해 수집된 정보는 풍부한 컨텍스트를 형성한다. 후속 프롬프트는 이 설정된 컨텍스트 내에서 작동한다. 이를 통해 연구를 개선하고 확장하는 대화형 접근 방식이 가능하다. AI는 각 후속 작업에서 처음부터 시작하는 것이 아니라 초기 Deep Research 실행으로 생성된 기존 지식 기반을 기반으로 구축한다. 사용자는 Deep Research를 조사 대화의 시작으로 보아야 한다. 초기 프롬프트는 기본 보고서를 생성하고, 후속 프롬프트는 특정 영역을 자세히 조사하거나, 설명을 요청하거나, 새로운 각도를 통합하는 데 사용되어 연구 프로세스를 매우 적응적으로 만들 수 있다.</p>
            </div>
        </div>
        <div id="templates" class="content-section space-y-6">
            <h2 class="text-3xl font-bold text-sky-700">IV. Gemini Deep Research를 위한 실용적인 프롬프트 템플릿</h2>
            <p class="text-lg text-stone-600">이 섹션에서는 앞서 설명한 원칙들을 바탕으로, 다양한 사용 사례에 바로 적용할 수 있는 구체적이고 상세한 프롬프트 템플릿 예시들을 제공합니다. 이 템플릿들은 사용자가 Deep Research를 시작하는 데 강력한 출발점을 제공할 것입니다.</p>
            <div class="mb-6">
                <label for="templateSelector" class="block text-lg font-medium text-stone-700 mb-2">사용 사례 선택:</label>
                <select id="templateSelector" class="w-full p-3 border border-stone-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500">
                    <option value="general">A. 일반 목적 Deep Research 시작 프롬프트</option>
                    <option value="understanding">B. 사용 사례: 포괄적인 주제 이해 및 설명</option>
                    <option value="analysis">C. 사용 사례: 심층 경쟁 분석</option>
                    <option value="due_diligence">D. 사용 사례: 실사 및 회사/법인 프로파일링</option>
                    <option value="comparison">E. 사용 사례: 상세 제품/서비스 비교</option>
                    <option value="synthesis">F. 사용 사례: 보고서 및 요약을 위한 정보 종합</option>
                </select>
            </div>
            <div id="templateDisplay" class="space-y-6">
                </div>
            <div class="p-6 bg-white rounded-lg shadow mt-8">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">표 2: Gemini Deep Research 프롬프트 템플릿 라이브러리</h3>
                <p class="text-stone-600 mb-4">다양한 연구 목적에 맞춰 활용할 수 있는 프롬프트 템플릿들을 요약했습니다. 각 사용 사례별 핵심 구조와 사용자 정의 변수를 참고하여 자신만의 프롬프트를 구성해 보세요.</p>
                <div class="table-responsive">
                    <table class="min-w-full bg-white">
                        <thead class="bg-sky-100">
                            <tr>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">사용 사례</th>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">핵심 프롬프트 구조</th>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">사용자 정의 주요 변수</th>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">예시 채워진 프롬프트 (간략)</th>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">참고/팁</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b">
                                <td class="py-3 px-4">주제 이해</td>
                                <td class="py-3 px-4">`\"[광범위한 주제]\"에 대한 심층 보고서를 생성하여 주요 개념, 역사, 현재 적용 및 미래 전망을 설명하십시오.`</td>
                                <td class="py-3 px-4">`[광범위한 주제]`, `[관련 분야]`</td>
                                <td class="py-3 px-4">`\"양자 컴퓨팅\"에 대한 심층 보고서를 생성하여 주요 개념, 역사, 현재 암호학 및 재료 과학에서의 적용, 그리고 미래 전망을 설명하십시오.`</td>
                                <td class="py-3 px-4">원하는 톤(예: 학문적, 대중적)을 지정하는 것을 고려하십시오.</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">경쟁 분석</td>
                                <td class="py-3 px-4">`\"[우리 회사/제품]\"을 위해 \"[산업/틈새 시장]\" 시장에서 주요 경쟁사 \"[경쟁사 A]\", \"[경쟁사 B]\"를 분석하십시오. 제품, 가격, 마케팅, 강점/약점을 다루십시오.`</td>
                                <td class="py-3 px-4">`[우리 회사/제품]`, `[산업/틈새 시장]`, `[경쟁사 목록]`, `[지리적 지역]`, `[기간]`</td>
                                <td class="py-3 px-4">`\"Acme SaaS\"를 위해 \"중소기업 CRM\" 시장에서 주요 경쟁사 \"Zoho CRM\", \"HubSpot\"을 분석하십시오. 북미 시장 지난 2년간의 제품, 가격, 마케팅, 강점/약점을 다루십시오.`</td>
                                <td class="py-3 px-4">분석할 특정 지표(예: 시장 점유율, 고객 만족도)를 명시하면 유용합니다.</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">실사</td>
                                <td class="py-3 px-4">`\"[회사 이름]\"에 대한 실사를 수행하여 회사 개요, 제품, 재무 상태(공개 정보 기반), 시장 지위 및 최근 뉴스를 조사하십시오.`</td>
                                <td class="py-3 px-4">`[회사 이름]`, `[회사 설명]`, `[기간]`</td>
                                <td class="py-3 px-4">`\"Innovatech Ltd.\"에 대한 실사를 수행하여 회사 개요, AI 기반 솔루션, 자금 조달 내역, 주요 경쟁사 및 지난 12개월간의 주요 발표 내용을 조사하십시오.`</td>
                                <td class="py-3 px-4">정보의 출처 유형(예: 뉴스 기사, 재무 보고서)을 지정할 수 있습니다.</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">제품/서비스 비교</td>
                                <td class="py-3 px-4">`\"[제품 A]\"와 \"[제품 B]\"([제품 카테고리])를 기능, 가격, 사용자 인터페이스, 통합 및 고객 피드백을 기준으로 비교하는 보고서를 생성하십시오.`</td>
                                <td class="py-3 px-4">`[제품/서비스 목록]`, `[제품/서비스 카테고리]`, `[비교 기준]`</td>
                                <td class="py-3 px-4">`\"Asana\"와 \"Trello\"(\"프로젝트 관리 도구\")를 작업 관리 기능, 무료 및 유료 플랜 가격, 사용 편의성, Slack 및 Google Drive와의 통합, 온라인 사용자 리뷰를 기준으로 비교하는 보고서를 생성하십시오.`</td>
                                <td class="py-3 px-4">비교 결과를 표 형식으로 요청하면 가독성이 향상됩니다.</td>
                            </tr>
                            <tr>
                                <td class="py-3 px-4">보고서 종합</td>
                                <td class="py-3 px-4">`\"[복잡한 주제]\"에 대한 보고서를 위해 정보를 종합하십시오. 주요 원인, 영향, 현재 해결책 및 향후 연구 방향을 다루십시오. [출처 유형]에서 [기간] 내 정보를 사용하십시오.`</td>
                                <td class="py-3 px-4">`[복잡한 주제]`, `[출처 유형]`, `[기간]`, `[원하는 단어 수/길이]`</td>
                                <td class="py-3 px-4">`\"도시 열섬 현상\"에 대한 보고서를 위해 정보를 종합하십시오. 주요 원인, 인간 건강 및 에너지 소비에 미치는 영향, 현재 완화 전략 및 향후 연구 우선순위를 다루십시오. 지난 5년간의 학술 저널 및 정부 보고서 정보를 사용하십시오. 약 2000단어로 작성해주십시오.`</td>
                                <td class="py-3 px-4">원하는 인용 스타일(예: APA, MLA)을 지정하십시오.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div id="advanced" class="content-section space-y-6">
            <h2 class="text-3xl font-bold text-sky-700">V. Deep Research 출력 극대화를 위한 고급 프롬프트 기법</h2>
            <p class="text-lg text-stone-600">Deep Research의 결과물 품질과 깊이를 한층 더 향상시키기 위한 정교한 프롬프트 작성 방법을 소개합니다. 복잡한 쿼리 구조화, 연쇄적 사고(CoT) 활용, 반론 유도, 가설 생성 및 탐색 기법을 통해 에이전트 기반 연구 프로세스를 효과적으로 안내할 수 있습니다.</p>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">A. 복잡한 쿼리 구조화: 단일 Deep Research 프롬프트 내 작업 분해</h3>
                <p>일반적인 프롬프트 작성 조언은 복잡한 작업을 별도의 프롬프트로 나누는 것이다. Deep Research의 경우, 이는 단일 프롬프트를 구조화하여 여러 측면에 대한 조사를 요청하는 것을 의미할 수도 있다. 프롬프트 내에서 제목이나 부제목을 사용하여 요청과 예상 결과물을 구성하고, 별개의 질문이나 문의 영역에는 글머리 기호나 번호 매기기 목록을 사용한다. LLM은 작업을 순차적 단계나 하위 작업으로 나누도록 지시받을 수 있다.</p>
                <p class="mt-2">*입력 프롬프트*를 하위 섹션이나 번호 매기기 요청으로 명시적으로 구조화함으로써 사용자는 Deep Research가 생성하는 *연구 계획의 구조*와 결과적으로 최종 보고서의 구조에 직접적인 영향을 미칠 수 있다. Deep Research는 프롬프트에서 계획을 생성하며, 프롬프트는 제목/목록으로 구조화될 수 있다. 구조화된 프롬프트는 AI의 계획 단계에 대한 명확한 청사진을 제공한다. 프롬프트가 "X를 조사하라. 구체적으로: 1. 측면 A를 분석하라. 2. 측면 B와 C를 비교하라. 3. 영향 D를 평가하라."라고 명시하면 AI는 해당 섹션이 포함된 연구 계획을 생성할 가능성이 매우 높다. 사용자는 초기 프롬프트 내에 해당 구조를 포함시켜 Deep Research 보고서의 상위 수준 구조를 미리 정의할 수 있다. 이를 통해 최종 결과물의 구성에 대한 더 많은 제어권을 갖게 된다.</p>
                <div class="code-block mt-4">
                    <button class="copy-button" onclick="copyToClipboard(this.nextElementSibling.innerText)">복사</button>
                    <pre><code class="language-text">\"원격 근무의 미래에 대한 Deep Research 분석을 수행해주십시오. 보고서는 다음과 같이 구성되어야 합니다:\nI. 서론: 원격 근무의 범위와 현황 정의.\nII. 기술적 동인:\n    A. 협업 도구와 그 영향 조사.\n    B. 원격 설정에 대한 사이버 보안 과제 및 해결책 분석.\nIII. 경제적 영향:\n    A. 상업용 부동산에 미치는 영향 연구.\n    B. 생산성 연구 분석 (찬반 양론).\nIV. 사회 및 문화적 변화:\n    A. 일과 삶의 균형 고려 사항 탐색.\n    B. 회사 문화 및 팀 결속력에 미치는 영향 조사.\nV. 결론 및 향후 전망: 주요 결과 요약 및 향후 5-10년 동향 예측.\"</code></pre>
                </div>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">B. Deep Research에서 유도된 추론을 위한 연쇄적 사고(CoT) 활용</h3>
                <p>CoT 프롬프트는 복잡한 작업을 논리적 단계로 나누어 추론을 향상시킨다. 모델에게 "단계별로 생각하라" 또는 추론 과정을 설명하도록 지시할 수 있다.</p>
                <p class="mt-2">Deep Research는 자체적인 내부 "추론" 단계를 가지고 있지만, 사용자는 프롬프트에 CoT와 유사한 지침을 주입하여 연구의 특정 부분에 대해 *어떻게* 추론이 이루어져야 하는지 안내하거나, 최종 보고서가 주요 결론에 대한 추론 과정을 *명시하도록* 요청할 수 있다. CoT는 LLM 추론을 명시적으로 만들어 개선하며, Deep Research에는 추론 단계가 있다. 사용자는 Deep Research에게 정보를 찾는 것뿐만 아니라 특정 측면에 대해 "작업 과정을 보여주거나" 특정 분석적 사고 과정을 따르도록 요청할 수 있다. 이는 Deep Research의 전체 추론 과정을 미세하게 관리하는 것이 아니라, 명시적인 논리적 연결을 만들고 보고서에 제시하도록 프롬프트를 작성하는 것을 의미한다. 예를 들어 프롬프트는 다음과 같이 명시할 수 있다: "X가 Y에 미치는 영향을 분석할 때, 먼저 모든 잠재적 인과 요인을 식별한 다음, 각 요인에 대한 증거의 강도를 평가하고, 마지막으로 이를 종합하여 논리적인 결론을 도출하며, 보고서에서 단계별 논리를 명확히 설명하라." 이는 내부 추론과 결과물 모두를 안내한다.</p>
                <div class="code-block mt-4">
                    <button class="copy-button" onclick="copyToClipboard(this.nextElementSibling.innerText)">복사</button>
                    <pre><code class="language-text">\"Deep Research 작업: [신기술, 예: \'상용 트럭용 수소 연료 전지\']의 실행 가능성을 평가해주십시오. 경제적 실행 가능성 분석 시, 단계별 추론 접근 방식을 채택해주십시오:\n1. 이 기술의 현재 주요 비용 동인을 식별합니다.\n2. 향후 10년간 예상되는 비용 절감을 조사하고, 이러한 예측의 출처를 인용합니다.\n3. 이러한 비용을 현재 및 예상되는 기존 기술(예: 디젤, 배터리 전기)의 비용과 비교합니다.\n4. 인프라 요구 사항 및 관련 비용을 분석합니다.\n5. 최종 보고서에서 각 단계가 결론에 어떻게 기여하는지 명확하게 설명하면서 경제적 실행 가능성에 대한 전반적인 평가로 마무리합니다.\"</code></pre>
                </div>
            </div>
             <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">C. 반론 유도 및 연구 격차/맹점 파악을 위한 프롬프트 사용</h3>
                <p>프롬프트는 LLM에게 반론을 제공하고, 추론을 테스트하며, 대안적인 관점을 제시하고, 숨겨진 가정을 식별하도록 요청할 수 있다. 프롬프트는 AI에게 확증 편향이나 확인되지 않은 가정을 "직접 지적하라"고 지시할 수 있다. "시스템 2 주의(S2A)" 프롬프트 방식은 모델이 관련 없는 컨텍스트를 제외하도록 프롬프트를 재생성하여 관련 정보에 집중하도록 돕는데, 이는 초기 프레이밍이 노이즈로 인해 맹점을 가졌는지 간접적으로 식별하는 데 도움이 될 수 있다. LLM은 자신의 불일치나 지식 격차에 대한 자각이 부족한 "알려지지 않은 미지수"를 보일 수 있으며, 프롬프트는 이러한 영역을 탐색하도록 설계될 수 있다.</p>
                <p class="mt-2">Deep Research는 단순히 지지 정보를 찾는 것뿐만 아니라, 특정 주제와 관련된 반대 의견, 비판 또는 한계의 증거를 적극적으로 찾아내도록 명시적으로 지시받을 수 있다. 이를 통해 연구 결과물이 더욱 균형 잡히고 견고해진다. 프롬프트는 반론을 유도하고 가정을 식별할 수 있으며, LLM에는 "알려지지 않은 미지수"가 있다. Deep Research는 별도의 지침이 없다면 초기 가설이나 일반적인 견해를 확인하는 정보를 주로 찾아 웹에 존재하는 편향을 반영할 수 있다. Deep Research에게 반론, 한계 및 식별된 연구 격차를 구체적으로 검색하고 포함하도록 지시함으로써 사용자는 보다 비판적이고 포괄적인 조사를 보장할 수 있다. 프롬프트에는 다음과 같은 문구를 포함해야 한다: "X에 대한 주요 주장 외에도, X와 관련된 일반적인 비판, 한계 및 미해결 질문에 대한 섹션을 적극적으로 검색하고 포함시키시오. 문헌에서 언급된 중요한 연구 격차를 식별하시오."</p>
                 <div class="code-block mt-4">
                    <button class="copy-button" onclick="copyToClipboard(this.nextElementSibling.innerText)">복사</button>
                    <pre><code class="language-text">\"[UBI (기본소득)는 빈곤을 해결하는 효과적인 방법이다]라는 명제에 대한 Deep Research를 수행해주십시오. 보고서는 지지 주장과 증거를 철저히 조사해야 합니다. 결정적으로, 다음 사항에 대한 중요한 섹션도 할애해야 합니다:\n6.  UBI에 대한 주요 반론과 비판을 식별하고 상세히 기술하며, 이러한 우려를 제기하는 경제학자나 연구를 인용합니다.\n7.  UBI 시행의 잠재적인 의도하지 않은 부정적 결과 또는 실제적인 어려움을 분석합니다.\n8.  UBI의 잠재적 영향에 대한 현재 이해에서 인정된 맹점, 미해결 질문 또는 중요한 연구 격차를 강조합니다.\n목표는 여러 관점에서 명제를 비판적으로 평가하는 균형 잡힌 보고서입니다.\"</code></pre>
                </div>
             <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">D. Deep Research 내 가설 생성 및 탐색을 위한 프롬프트</h3>
                <p>LLM은 주어진 컨텍스트를 기반으로 가설을 생성하도록 프롬프트될 수 있다. "지식 기반 아이디어 체인(KG-CoI)" 및 "개념 혼합(MoC)"과 같은 기술은 지식을 통합하고 아이디어를 다양화하여 가설 생성을 개선하는 것을 목표로 한다. 이러한 특정 프레임워크의 기본 원리는 Deep Research 프롬프트에 정보를 제공할 수 있다. 직접 프롬프트는 LLM에게 잠재적인 설명이나 예측을 제안하도록 요청할 수 있으며, 적대적 프롬프트는 모델을 비전통적인 관점에 노출시켜 다양한 가설을 생성하도록 할 수 있다.</p>
                <p class="mt-2">Deep Research는 기존 정보를 찾는 것뿐만 아니라, *새로운* 가설을 생성하거나 새로운 연결고리를 식별하는 데 도움이 되는 방식으로 정보를 종합하는 데 사용될 수 있다. 프롬프트는 Deep Research가 다양한 정보 집합을 수집하도록 안내한 다음, 잠재적인 연결고리나 명시되지 않은 함의에 대해 추측하도록 요청할 수 있다. LLM은 가설을 생성할 수 있으며, Deep Research는 여러 출처의 정보를 종합한다. Deep Research에게 서로 다르지만 잠재적으로 관련된 분야의 정보를 수집하거나 이상 징후 및 특이점을 찾도록 지시함으로써, 결과 보고서는 사용자(또는 후속 프롬프트의 LLM)가 새로운 가설을 세우는 기초 역할을 할 수 있다. Deep Research 보고서 자체가 새로운 통찰력을 얻을 수 있는 선별된 데이터 세트가 된다. 프롬프트는 "수집된 정보를 바탕으로 X와 Y 사이에 잠재적으로 탐색되지 않은 연결고리는 무엇인가?"라고 질문함으로써 이를 준비할 수 있다. 사용자는 가설 생성을 명시적으로 지원하도록 Deep Research 프롬프트를 설계할 수 있다. 예를 들어, "Deep Research를 수행하여 [주제 A, 예: \'생분해성 폴리머의 발전\'] 및 [주제 B, 예: \'만성 상처 치료\']에 대해 조사하시오. 결과를 종합하고, 보고서의 별도 섹션에서 주제 A가 주제 B의 과제를 해결할 수 있는 3-5가지 새로운 가설을 제안하시오. 각 가설에 대해, 발견된 지지 정보를 간략하게 설명하시오."}</p>
                <div class="code-block mt-4">
                    <button class="copy-button" onclick="copyToClipboard(this.nextElementSibling.innerText)">복사</button>
                    <pre><code class="language-text">\"Deep Research를 시작하여 [기술/개념 X, 예: \'양자 센서 기술\']의 [도메인 Y, 예: \'초기 질병 탐지\'] 분야에서의 잠재적인 새로운 응용 분야를 탐색해주십시오.\n연구는 다음을 포함해야 합니다:\n1.  기술 X의 현재 기능과 한계에 대한 포괄적인 개요를 제공합니다.\n2.  탐지/진단과 관련된 도메인 Y의 주요 미충족 요구 사항과 과제를 요약합니다.\n3.  (1)과 (2)에서 종합된 정보를 바탕으로, 보고서의 한 섹션에서 기술 X가 도메인 Y의 특정 과제를 해결하는 데 어떻게 적용될 수 있는지에 대한 최소 세 가지 새롭고 그럴듯한 가설을 생성합니다. 각 가설에 대해, 추론 과정을 설명하고 이를 검증하기 위해 어떤 추가 연구가 필요한지 명시합니다.\"</code></pre>
                </div>
            </div>
            <div class="p-6 bg-white rounded-lg shadow mt-8">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">표 3: Deep Research를 위한 고급 프롬프트 기법 적용</h3>
                <p class="text-stone-600 mb-4">Deep Research의 결과물을 극대화하기 위한 고급 프롬프트 기법들을 소개합니다. 이러한 기법들은 AI의 연구 계획 수립, 추론 방식, 그리고 최종 보고서의 내용과 구조에 영향을 미쳐 더욱 깊이 있고 통찰력 있는 결과를 얻는 데 도움을 줄 수 있습니다.</p>
                <div class="table-responsive">
                    <table class="min-w-full bg-white">
                        <thead class="bg-sky-100">
                            <tr>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">기법</th>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">간략한 설명</th>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">Deep Research에서의 적용 (에이전트 프로세스 안내 방식)</th>
                                <th class="py-3 px-4 text-left text-sky-800 font-semibold">Deep Research를 위한 간략한 프롬프트 요소 예시</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b">
                                <td class="py-3 px-4">구조화된 쿼리</td>
                                <td class="py-3 px-4">복잡한 요청을 하위 질문이나 섹션으로 나누어 명확성을 높입니다.</td>
                                <td class="py-3 px-4">Deep Research가 생성하는 연구 계획과 최종 보고서의 구조에 직접적인 영향을 미칩니다.</td>
                                <td class="py-3 px-4">`주제 X에 대해 조사합니다. 구체적으로 다음 사항을 다루십시오: 1. 측면 A 분석. 2. 측면 B와 C 비교.`</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">유도된 연쇄적 사고 (CoT)</td>
                                <td class="py-3 px-4">모델이 단계별 추론 과정을 명시적으로 따르거나 설명하도록 요청합니다.</td>
                                <td class="py-3 px-4">Deep Research의 내부 추론 방식을 특정 부분에 대해 안내하거나, 최종 보고서에 주요 결론의 추론 과정을 명시하도록 요청합니다.</td>
                                <td class="py-3 px-4">`Y에 대한 X의 영향을 분석할 때, 단계별 논리를 사용하여 결론을 도출하고 보고서에 명시하십시오.`</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">반론 유도</td>
                                <td class="py-3 px-4">모델이 지배적인 견해에 대한 비판, 한계 또는 대안적 관점을 적극적으로 찾도록 지시합니다.</td>
                                <td class="py-3 px-4">Deep Research가 단순히 지지 정보뿐만 아니라 반대 의견, 비판, 연구 격차를 찾아 균형 잡힌 결과물을 생성하도록 합니다.</td>
                                <td class="py-3 px-4">`주요 주장 외에도, [주제]에 대한 일반적인 비판, 한계 및 미해결 질문을 포함시키십시오.`</td>
                            </tr>
                            <tr>
                                <td class="py-3 px-4">가설 탐색</td>
                                <td class="py-3 px-4">모델이 수집된 정보를 바탕으로 새로운 연결고리, 잠재적 설명 또는 미탐색 아이디어를 제안하도록 유도합니다.</td>
                                <td class="py-3 px-4">Deep Research가 다양한 정보 집합을 종합하여 새로운 가설을 생성하거나, 기존 지식으로는 명확하지 않은 잠재적 연관성을 탐색하도록 합니다.</td>
                                <td class="py-3 px-4">`수집된 정보를 바탕으로, [현상 A]와 [현상 B] 사이의 잠재적인 미탐색 연결고리에 대한 3가지 가설을 제안하고 각각의 근거를 설명하십시오.`</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div id="optimization" class="content-section space-y-6">
            <h2 class="text-3xl font-bold text-sky-700">VI. Deep Research 최적화 및 안전장치</h2>
            <p class="text-lg text-stone-600">Deep Research를 최대한 효과적이고 안전하게 사용하기 위한 방법들을 알아봅니다. 반복적인 프롬프트 개선, 시스템의 한계와 잠재적 편향 이해, 정보의 사실 확인 및 검증 전략, 그리고 AI 기반 연구의 윤리적 고려 사항은 매우 중요합니다.</p>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">A. 반복적인 프롬프트 개선 및 테스트</h3>
                <p>프롬프트 작성은 반복적인 과정이며, 결과가 기대에 미치지 못하면 프롬프트를 미세 조정해야 한다. Deep Research의 "계획 편집" 기능은 이러한 반복적인 개선의 핵심 부분으로, 전체 실행 전에 조정을 허용한다. 개선 영역을 식별하기 위해 프롬프트를 체계적으로 테스트해야 하며, Gemini Advanced를 사용할 때 "이것을 파워 프롬프트로 만들어주세요: [원본 프롬프트 텍스트]" 기능을 활용하면 프롬프트 개선에 도움이 될 수 있다.</p>
                <p class="mt-2">초기 프롬프트 작성, 계획 편집, 후속 질문의 조합은 Deep Research를 위한 다단계 반복 루프를 생성한다. 프롬프트 작성에서 반복은 핵심이며, Deep Research는 계획 편집 및 후속 질문을 허용한다. 이러한 기능은 분리된 것이 아니라 지속적인 개선 주기를 형성한다: 초기 프롬프트 -> 생성된 계획 -> 계획 편집 (반복 1) -> 보고서 생성 -> 후속 Q&A/보고서 수정 (반복 2). 사용자는 Deep Research를 일회성 명령이 아닌, 연구 초점과 결과물이 점진적으로 개선되는 반복적인 대화로 접근해야 한다. 사용자들은 가능한 최상의 프롬프트로 시작하고, 생성된 계획을 비판적으로 검토하며 필요에 따라 편집한 다음, 생성된 보고서를 기반으로 더 구체적인 후속 질문이나 추가 요청을 하도록 권장된다.</p>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">B. 한계 및 잠재적 편향 이해</h3>
                <p>Deep Research는 18세 미만 사용자에게는 제공되지 않으며, Advanced 미사용자 및 일일 요청에는 제한이 있다. LLM은 환각을 일으키거나 부정확하거나 부적절한 정보를 제공할 수 있으며, 최종 결과물은 사용자의 책임이다. LLM은 진정한 이해력이 부족하고 패턴에 의존하므로 오해를 유발할 수 있으며, 지식은 훈련 데이터 마감일을 기준으로 정적이다. Deep Research는 *최신* 정보를 위해 웹을 탐색함으로써 이를 완화하지만, 기본 모델의 해석은 여전히 훈련에 기반한다. LLM의 편향은 훈련 데이터(과다/과소 표현, 공간적/시간적 편향, 수집 방법, 언어적 맥락)에서 비롯될 수 있으며, 내재적이거나 외재적일 수 있다. LLM은 기존 편향을 증폭시킬 수 있다.</p>
                <p class="mt-2">Deep Research의 광범위한 웹 브라우징은 편향과 관련하여 양날의 검이 될 수 있다. 다양한 최신 정보에 접근할 수 있는 반면, 프롬프트에 의해 신중하게 안내되지 않으면 인터넷에 존재하는 편향을 우연히 마주하고 잠재적으로 증폭시킬 수 있다. Deep Research는 "최대 수백 개의 웹사이트"를 탐색하며, LLM은 데이터 소스의 편향을 증폭시킬 수 있다. 인터넷에는 편향된 정보가 포함되어 있다. Deep Research의 "추론" 단계는 이 탐색된 정보를 종합한다. 이 추론의 품질과 중립성은 수집된 정보와 LLM의 고유한 편향에 따라 달라진다. 프롬프트가 모호하거나 Deep Research를 다양하고 균형 잡힌 관점으로 안내하지 않으면, 자율적인 탐색이 온라인에서 널리 퍼져 있는 편향된 관점을 불균형적으로 수집한 다음 증폭시킬 수 있다. 따라서 Deep Research용 프롬프트는 적절한 경우, 특정 주제에 대한 여러 관점을 찾아내고, 출처를 비판적으로 평가하거나, 잠재적 편향을 인식하도록 지시하는 내용을 포함해야 한다. 예를 들어, "X를 연구할 때, [그룹 A], [그룹 B]의 관점을 포함하고, 지배적인 서술에 대한 잠재적 편향을 비판적으로 평가하시오."와 같이 작성할 수 있다.</p>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">C. 정보 사실 확인 및 검증 전략</h3>
                <p>항상 Gemini의 결과물을 명확성, 관련성 및 정확성 측면에서 검토해야 한다. Gemini에는 "Gemini의 응답 사실 확인" 기능이 있으며 (Bard에 대해 언급하지만 원칙은 동일하며, Deep Research 자체에는 학습 내용과 탐색한 사이트를 보여주는 "생각 패널"이 있다). 주장 검증 파이프라인에는 주장 감지, 증거 검색 및 진실성 예측이 포함된다. Deep Research는 이를 내부적으로 수행하지만, 사용자는 최종 보고서에 대해 이를 수행해야 한다. LLM 결과물 사실 확인 전략에는 응답을 원자적 주장으로 나누고, 비맥락화하며, 증거를 검색하고, 입장을 감지하고, 수정하는 과정이 포함된다. LLM을 판사로 사용하거나 정답이 있는 테스트 데이터 세트를 사용하면 결과물 평가에 도움이 될 수 있다.</p>
                <p class="mt-2">Deep Research의 "탐색한 사이트" 및 "생각 보기" 기능은 AI의 정보 출처와 추론 단계에 대한 투명성을 제공하므로 사용자가 자체 검증 프로세스를 시작하는 데 중요한 도구이다. Deep Research는 "탐색한 사이트"와 "생각"을 보여주며, LLM 결과물 검증은 매우 중요하다. 이러한 기능은 Deep Research 보고서에 제시된 정보에 대한 어느 정도의 추적 가능성을 제공한다. 사용자는 이러한 기능을 활용하여 Deep Research가 사용한 출처의 품질과 관련성을 비판적으로 평가하고 결론에 도달하기까지 거친 논리적 경로를 이해할 수 있다. 이는 수동 사실 확인의 첫 번째 단계이다. 사용자는 최종 보고서를 수동적으로 받아들이는 대신 "탐색한 사이트" 목록을 적극적으로 사용하여 기본 출처를 확인하고 "생각 보기" 패널을 사용하여 종합 과정을 이해하도록 권장되어야 한다. 프롬프트는 알려진 경우 특정 유형의 출처를 우선시하도록 Deep Research에 요청할 수도 있다.</p>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">D. AI 기반 연구의 윤리적 고려 사항</h3>
                <p>주요 윤리적 고려 사항에는 공정성/편향, 투명성, 개인 정보 보호, 인간 안전, 환경적 책임, 설명 가능성, 인간 감독, 인간 중심 설계, 책임/의무 및 장기적 사고가 포함된다. LLM은 도덕적 주체성이 부족하므로 책임은 인간 사용자/개발자에게 있다. 허위 정보나 유해 콘텐츠 생성에 오용될 가능성이 있다.</p>
                <p class="mt-2">Deep Research의 자율적인 특성(수백 개의 사이트 탐색)은 특히 출처를 비판적으로 평가하지 않을 경우 개인 데이터의 우발적인 수집/종합 또는 허위 정보 전파 가능성과 관련하여 사용을 안내하는 강력한 윤리적 프레임워크를 필요로 한다. Deep Research는 광범위하게 탐색하며, 윤리적 AI는 개인 정보 보호, 공정성 및 책임을 요구한다. 자율적인 웹 탐색은 인간 연구자가 개인 정보 보호나 신뢰성을 위해 더 신중하게 필터링할 수 있는 방식으로 의도치 않게 데이터를 액세스하고 종합할 수 있다. Deep Research 사용자는 윤리적 위험을 최소화하는 방식으로 연구 작업을 정의하고 잠재적인 윤리적 문제(예: 보고서가 논의된 모든 그룹에 공정한가? 의심스러운 출처에 의존하는가?)에 대해 결과물을 비판적으로 평가할 책임이 있다. 프롬프트는 이러한 윤리적 차원을 인식하여 작성되어야 한다. 민감한 주제의 경우 프롬프트에는 "공개적으로 사용 가능하고 평판이 좋은 출처에 초점을 맞추고 개인적인 문제에 대한 추측을 피하십시오" 또는 "[민감한 사회 문제]에 관한 관점의 균형 잡힌 표현을 보장하십시오"와 같은 지침이 포함될 수 있다. 사용자는 궁극적으로 Deep Research를 통해 의뢰한 연구의 윤리적 영향에 대한 책임을 진다.</p>
            </div>
        </div>
        <div id="conclusion" class="content-section space-y-6">
            <h2 class="text-3xl font-bold text-sky-700">VII. 결론: 효과적인 Gemini Deep Research 프롬프팅을 위한 핵심 시사점</h2>
            <p class="text-lg text-stone-600">이 가이드의 마지막 섹션에서는 Gemini Deep Research를 효과적으로 활용하기 위한 핵심 사항들을 요약합니다. 명확하고 구체적인 프롬프트 작성, 반복적인 개선 과정의 중요성, 그리고 생성된 정보에 대한 비판적 검토는 Deep Research의 잠재력을 최대한 발휘하는 데 필수적입니다.</p>
            <div class="p-6 bg-white rounded-lg shadow">
                <p>Gemini Deep Research의 강력한 기능을 최대한 활용하기 위해서는 명확하고, 구체적이며, 풍부한 컨텍스트를 담은 프롬프트를 작성하는 것이 무엇보다 중요하다. 특히 Deep Research가 자율적으로 연구 계획을 수립하고 정보를 탐색, 추론, 보고하는 에이전트적 특성을 지니고 있음을 이해하고, 이에 맞춰 프롬프트를 구성해야 한다.</p>
                <p class="mt-2">효과적인 Deep Research 활용은 단일 프롬프트로 끝나는 것이 아니라, <strong>초기 프롬프트 작성 → 생성된 연구 계획 검토 및 수정 → 보고서 결과 확인 → 후속 질문을 통한 심층 탐구 및 보완</strong>으로 이어지는 반복적인 과정임을 인지해야 한다. 각 단계에서 사용자의 적극적인 개입과 평가는 더 나은 결과물을 얻는 데 결정적인 역할을 한다.</p>
                <p class="mt-2">또한, 생성된 정보에 대해서는 항상 비판적인 시각을 유지하고, 교차 검증 및 사실 확인을 습관화해야 한다. LLM의 고유한 한계점, 예를 들어 잠재적인 편향성이나 부정확한 정보 생성 가능성을 명확히 인지하고, 최종 결과물에 대한 책임은 사용자에게 있음을 기억해야 한다.</p>
                <p class="mt-4 font-semibold text-sky-700">결론적으로, Gemini Deep Research는 복잡하고 심도 있는 조사를 위한 강력한 협력 도구이며, 전문적인 프롬프트 엔지니어링은 이 도구를 효과적으로 조종하고 그 잠재력을 최대한 발휘하도록 하는 핵심 열쇠이다. 본 가이드에서 제시된 원칙, 템플릿, 고급 기법들을 숙지하고 적용함으로써 사용자는 Deep Research를 통해 더욱 정확하고 통찰력 있는 연구 결과를 얻을 수 있을 것이다.</p>
            </div>
        </div>
    </main>
</div>

<script>
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    function updateActiveNav(hash) {
        navLinks.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function showSection(hash) {
        contentSections.forEach(section => {
            if ('#' + section.id === hash) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
        updateActiveNav(hash);
        if (navMenu.classList.contains('block') && window.innerWidth < 768) {
            navMenu.classList.remove('block');
            navMenu.classList.add('hidden');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            history.pushState(null, null, targetId);
            showSection(targetId);
        });
    });

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('hidden');
        navMenu.classList.toggle('block');
    });
    
    window.addEventListener('popstate', () => {
        showSection(window.location.hash || '#intro');
    });

    showSection(window.location.hash || '#intro');

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showTooltip(event.target, '복사 완료!');
        } catch (err) {
            showTooltip(event.target, '복사 실패');
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textarea);
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
            description: "Deep Research는 \\\"주요 개념을 비교 대조하고, 아이디어 간의 관계를 파악하며, 기본 원리를 설명함으로써 주제를 깊이 탐구\\\"할 수 있다. 예를 들어, \\\"[복잡한 주제]를 10살 아이에게 설명하듯이 설명해 줘\\\"와 같은 프롬프트는 일반 Gemini용이지만 Deep Research의 깊이에 맞게 조정할 수 있다. 미국 남북 전쟁의 배경 이해를 위한 프롬프트나 \\\"서버리스 아키텍처\\\" 또는 \\\"BigQuery의 주요 기술적 특징\\\" 이해를 위한 프롬프트도 Deep Research를 통해 훨씬 더 깊이 있는 정보를 얻을 수 있다.",
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
            description: "Deep Research는 \\\"신제품에 대한 경쟁사 환경, 즉 제품, 가격, 마케팅 및 고객 피드백을 포함하여 이해\\\"할 수 있다. 프롬프트 예시: \\\"[산업/틈새 시장]의 경쟁사 분석: - 주요 경쟁사: [주요 경쟁사 3-5개 목록] - 지리적 초점: [시장 지역 지정] - 기간: [분석 기간 정의] - 주요 지표: [특정 성과 지표 목록] 필수 결과물: 1. 경쟁 포지셔닝 분석 2. 강점/약점 평가 3. 시장 기회 식별 4. 전략적 권장 사항 5. KPI를 포함한 실행 일정.\\\". 또 다른 예시: \\\"Salesforce 및 Microsoft Dynamics와 같은 주요 경쟁사에 초점을 맞춰 클라우드 기반 CRM 솔루션의 현재 시장 동향을 분석하십시오.\\\".",
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
            description: "Deep Research는 \\\"잠재적인 영업 리드 조사, 회사 제품, 자금 조달 내역, 팀 및 경쟁 환경 분석\\\"을 수행할 수 있다. 프롬프트 예시: \\\"[회사 이름]에 대한 실사를 수행하고 최근 재무 보고서와 업계 평판에 초점을 맞춥니다.\\\".",
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
            description: "Deep Research는 \\\"기능, 성능, 가격 및 고객 리뷰를 기반으로 다양한 가전제품 모델을 평가\\\"할 수 있다. 예를 들어, 뉴욕의 축구 및 미술 여름 캠프를 비교하는 경우가 있다.",
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
            description: "Deep Research는 \\\"더 자세한 내용과 통찰력을 담은 포괄적인 맞춤형 연구 보고서\\\"를 제공한다. 사용자는 Gemini 앱에 문서와 스프레드시트를 업로드하여 콘텐츠에 대한 요약과 통찰력을 얻을 수 있다. Deep Research는 주로 웹을 탐색하지만, 보고서를 위해 종합하는 *개념*은 핵심이다.",
            examples: [
                {
                    id: "synthesis_ex1",
                    text: `\"Deep Research를 수행하여 [복잡한 주제, 예: \'해양 생태계에 대한 미세 플라스틱 오염의 전 세계적 영향\']에 대한 보고서를 위한 정보를 종합해주십시오. 연구는 지난 [기간, 예: 5년] 이내에 발표된 과학 저널, 평판이 좋은 환경 단체 및 정부 보고서에서 데이터를 수집해야 합니다. 종합된 보고서에는 다음 내용이 포함되어야 합니다: 1. 미세 플라스틱 오염의 주요 원인 및 유형. 2. 다양한 해양 생물 및 먹이 사슬에 대한 문서화된 영향. 3. 현재 및 제안된 완화 전략과 그 효과. 4. 주요 연구 격차 및 향후 연구 우선 순위. 최종 결과물은 명확한 섹션과 인용된 출처(가능하면 APA 스타일)를 포함하는 약 [단어 수, 예: 1500단어]의 잘 구조화된 요약 보고서여야 합니다.\"`
                },
                {
                    id: "synthesis_ex2",
                    text: `\"Deep Research 요청: [새로운 기술, 예: \'뉴로모픽 컴퓨팅의 발전과 잠재적 응용 분야\']에 대한 요약 보고서를 작성하기 위해 정보를 수집하고 종합해주십시오. 연구는 학술 논문, 산업 간행물 및 특허 출원에서 정보를 가져와야 합니다. 요약 보고서에는 다음 내용이 강조되어야 합니다: 1. 기술에 대한 간결한 정의 및 설명. 2. 지난 [기간, 예: 3년] 동안 달성된 주요 혁신 및 이정표. 3. 최소 세 가지 다른 산업에 걸친 잠재적인 파괴적 응용 분야. 4. 광범위한 채택에 대한 주요 과제 및 한계. 5. 이 분야의 주요 연구 기관 및 회사. 요약 보고서는 비기술 임원 청중을 대상으로 하며 [페이지 수, 예: 2페이지]를 넘지 않아야 합니다.\"`
                }
            ]
        }
    };

    const templateSelector = document.getElementById('templateSelector');
    const templateDisplay = document.getElementById('templateDisplay');

    function displayTemplate(templateKey) {
        const templateData = promptTemplates[templateKey];
        if (!templateData) return;

        let html = `<div class="p-6 bg-white rounded-lg shadow">`;
        html += `<h3 class="text-2xl font-semibold text-sky-600 mb-2">${templateData.title}</h3>`;
        html += `<p class="text-stone-600 mb-4">${templateData.description}</p>`;
        
        templateData.examples.forEach((example, index) => {
            html += `<h4 class="text-xl font-medium text-stone-700 mt-6 mb-2">템플릿 예시 ${index + 1}:</h4>`;
            html += `<div class="code-block">
                        <button class="copy-button" onclick="copyToClipboard(this.nextElementSibling.innerText)">복사</button>
                        <pre><code class="language-text">${example.text}</code></pre>
                     </div>`;
        });
        html += `</div>`;
        templateDisplay.innerHTML = html;
    }

    templateSelector.addEventListener('change', (event) => {
        displayTemplate(event.target.value);
    });

    displayTemplate(templateSelector.value); 

</script>


---
author_profile: false
categories:
- Resources
- Tools-Guides
excerpt: Gemini Deep Research를 활용한 고급 프롬프트 엔지니어링 완전 가이드
layout: single
sidebar:
  nav: docs
title: Gemini Deep Research 프롬프트 엔지니어링 가이드
toc: true
toc_label: 목차

tags:
- artificial-intelligence
- prompt-engineering
- tools-guides
- research-methods
---

<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">

<style>
    body {
        font-family: 'Noto Sans KR', sans-serif;
        line-height: 1.8;
        letter-spacing: 0.02em;
        background-color: #f8f9fa;
        color: #212529;
    }
    .content-section {
        display: none;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
    }
    .content-section.active {
        display: block !important;
        opacity: 1 !important;
    }
    .table-responsive {
        overflow-x: auto;
        margin: 1.5rem 0;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
    }
    thead th {
        background-color: #e9ecef;
        font-weight: 600;
        color: #495057;
    }
    tbody tr:nth-child(even) {
        background-color: #f8f9fa;
    }
    .tab-btn {
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }
    .tab-btn.active {
        background-color: #007bff !important;
        color: white !important;
        border-color: #007bff !important;
        box-shadow: 0 4px 14px rgba(0, 123, 255, 0.25);
    }
    .tab-btn:hover:not(.active) {
        transform: translateY(-2px);
        background-color: #e9ecef;
        border-color: #dee2e6;
    }
    .info-card {
        background-color: white;
        border-radius: 0.75rem;
        border: 1px solid #e9ecef;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        padding: 1.5rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .info-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .highlight-teal {
        color: #17a2b8;
        font-weight: 600;
    }
    .pill-icon {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        background-color: #007bff;
        margin-right: 0.75rem;
    }
    .code-block {
        position: relative;
        margin: 1.5rem 0;
        background-color: #212529;
        color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .code-block pre {
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    .copy-button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s ease;
        position: absolute;
        top: 1rem;
        right: 1rem;
        z-index: 10;
        font-size: 0.875rem;
    }
    .copy-button:hover {
        background-color: #0056b3;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    h1, h2, h3, h4 {
        font-weight: 700;
        color: #343a40;
    }
    h1 { font-size: 3rem; }
    h2 { font-size: 2.25rem; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #dee2e6;}
    h3 { font-size: 1.75rem; margin-bottom: 1rem; }
    h4 { font-size: 1.25rem; }

    .p-6 { padding: 2rem; }
    .rounded-lg { border-radius: 0.75rem; }
    .shadow { box-shadow: 0 2px 15px rgba(0,0,0,0.08); }
    .border-l-4 { border-left-width: 5px; }
</style>

<div class="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
    
    <header class="text-center mb-12 py-12 bg-white rounded-xl shadow-md">
        <div class="max-w-4xl mx-auto px-6">
            <div class="mb-8">
                <span class="inline-block text-5xl mb-4">🤖</span>
                <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
                    Gemini Deep Research
                </h1>
                <h2 class="text-2xl md:text-3xl font-semibold text-blue-600 mb-4">완전 가이드</h2>
                <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                    AI 연구 도구의 힘을 최대화하는 프롬프트 엔지니어링 전략
                </p>
            </div>
            
            <div class="flex flex-wrap justify-center gap-4 mt-8">
                <div class="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
                    <div class="text-2xl mb-2">🔍</div>
                    <div class="text-sm font-semibold text-blue-700">자율적 연구</div>
                </div>
                <div class="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
                    <div class="text-2xl mb-2">🧠</div>
                    <div class="text-sm font-semibold text-green-700">심층 분석</div>
                </div>
                <div class="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-200">
                    <div class="text-2xl mb-2">📊</div>
                    <div class="text-sm font-semibold text-purple-700">전문 보고서</div>
                </div>
            </div>
        </div>
    </header>

    <nav id="tab-nav" class="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 px-4">
        <button data-tab="intro" class="tab-btn active text-sm md:text-base px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-md">
            <span class="mr-1.5">🚀</span>시작하기
        </button>
        <button data-tab="principles" class="tab-btn text-sm md:text-base px-5 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300">
            <span class="mr-1.5">📋</span>핵심 원칙
        </button>
        <button data-tab="crafting" class="tab-btn text-sm md:text-base px-5 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300">
            <span class="mr-1.5">✍️</span>프롬프트 작성
        </button>
        <button data-tab="templates" class="tab-btn text-sm md:text-base px-5 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300">
            <span class="mr-1.5">📝</span>템플릿
        </button>
        <button data-tab="advanced" class="tab-btn text-sm md:text-base px-5 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300">
            <span class="mr-1.5">🎯</span>고급 기법
        </button>
        <button data-tab="optimization" class="tab-btn text-sm md:text-base px-5 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300">
            <span class="mr-1.5">⚙️</span>최적화
        </button>
        <button data-tab="conclusion" class="tab-btn text-sm md:text-base px-5 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300">
            <span class="mr-1.5">🎓</span>결론
        </button>
    </nav>

    <main>
        <div id="intro" class="content-section active">
            <section class="bg-white p-6 rounded-xl shadow-lg border border-stone-200">
                <h2 class="text-3xl font-bold text-center mb-2">Gemini Deep Research로 연구 혁신하기</h2>
                <p class="text-center text-gray-600 mb-8">
                    복잡한 연구 작업을 자동화하고 통찰력 있는 보고서를 생성하는 AI 도구의 완전한 활용법을 학습하세요.
                </p>
                
                <div class="grid md:grid-cols-3 gap-6 text-center mb-8">
                    <div class="bg-blue-50 p-6 rounded-lg info-card">
                        <span class="text-3xl mb-2">📊</span>
                        <h3 class="font-semibold mb-2 text-lg">자율적 연구</h3>
                        <p class="text-sm text-gray-600">최대 수백 개의 웹사이트를 자동으로 탐색하여 정보를 수집합니다.</p>
                    </div>
                    <div class="bg-green-50 p-6 rounded-lg info-card">
                        <span class="text-3xl mb-2">🧠</span>
                        <h3 class="font-semibold mb-2 text-lg">심층 분석</h3>
                        <p class="text-sm text-gray-600">수집된 데이터를 종합하여 통찰력 있는 결론을 도출합니다.</p>
                    </div>
                    <div class="bg-purple-50 p-6 rounded-lg info-card">
                        <span class="text-3xl mb-2">📋</span>
                        <h3 class="font-semibold mb-2 text-lg">전문 보고서</h3>
                        <p class="text-sm text-gray-600">다중 페이지 보고서로 연구 결과를 체계적으로 정리합니다.</p>
                    </div>
                </div>
                
                <p class="text-gray-700 font-medium text-center">
                    이 가이드는 Gemini Deep Research의 4단계 프로세스를 이해하고, 효과적인 프롬프트 작성법을 마스터하도록 도와드립니다.
                </p>
            </section>
        </div>

        <div id="principles" class="content-section">
            <section class="bg-white p-6 rounded-xl shadow-lg border border-stone-200">
                <h2 class="text-3xl font-bold text-center mb-2">효과적인 프롬프트 작성의 핵심 원칙</h2>
                <p class="text-center text-gray-600 mb-8">
                    Deep Research의 성능을 최대화하기 위한 필수 프롬프트 구성 요소와 모범 사례를 알아보세요.
                </p>
                
                <div class="space-y-6">
                    <div class="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                        <h3 class="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                            <span class="pill-icon"></span>
                            필수 프롬프트 구성 요소
                        </h3>
                        <ul class="space-y-2 text-gray-700">
                            <li><strong class="font-semibold text-blue-600">작업 (Task):</strong> 명확한 연구 목표와 수행할 작업 정의</li>
                            <li><strong class="font-semibold text-blue-600">컨텍스트 (Context):</strong> 연구 주제에 대한 풍부한 배경 정보</li>
                            <li><strong class="font-semibold text-blue-600">페르소나 (Persona):</strong> 보고서 스타일과 관점 설정</li>
                            <li><strong class="font-semibold text-blue-600">형식 (Format):</strong> 원하는 출력 구조와 형태 지정</li>
                            <li><strong class="font-semibold text-blue-600">톤 (Tone):</strong> 보고서의 전체적인 어조와 접근 방식</li>
                        </ul>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-6 border-l-4 border-green-500">
                        <h3 class="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                            <span class="pill-icon" style="background-color: #28a745;"></span>
                            모범 사례
                        </h3>
                        <ul class="space-y-2 text-gray-700">
                            <li><strong class="font-semibold text-green-600">자연어 사용:</strong> 사람에게 말하듯 완전한 문장으로 작성</li>
                            <li><strong class="font-semibold text-green-600">구체성과 반복:</strong> 명확한 지시사항과 충분한 컨텍스트 제공</li>
                            <li><strong class="font-semibold text-green-600">적절한 복잡성:</strong> 간결하되 필요한 세부사항 포함</li>
                            <li><strong class="font-semibold text-green-600">대화형 접근:</strong> 후속 프롬프트를 통한 점진적 개선</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>

        <div id="crafting" class="content-section">
            <section class="bg-white p-6 rounded-xl shadow-lg border border-stone-200 space-y-6">
                <h2 class="text-3xl font-bold text-center mb-2">Deep Research 프롬프트 작성 전략</h2>
                <p class="text-center text-gray-600 mb-8">
                    4단계 프로세스(계획-검색-추론-보고)에 맞춘 효과적인 프롬프트 구조화 방법을 학습하세요.
                </p>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="info-card">
                        <h3 class="text-xl font-semibold text-blue-900 mb-3">4단계 프로세스 정렬</h3>
                        <ol class="list-decimal list-inside space-y-2 text-gray-700">
                            <li><strong>계획:</strong> 전체 연구 목표 명시</li>
                            <li><strong>검색:</strong> 찾을 정보 유형 지정</li>
                            <li><strong>추론:</strong> 필요한 분석 방법 제시</li>
                            <li><strong>보고:</strong> 원하는 출력 구조 정의</li>
                        </ol>
                    </div>
                    
                    <div class="info-card">
                        <h3 class="text-xl font-semibold text-green-900 mb-3">범위 및 목표 정의</h3>
                        <ul class="list-disc list-inside space-y-2 text-gray-700">
                            <li>지리적, 시간적, 주제적 경계 설정</li>
                            <li>핵심 연구 질문 명확화</li>
                            <li>원하는 결과 유형 지정</li>
                            <li>구체적인 예시와 맥락 제공</li>
                        </ul>
                    </div>
                </div>

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
            </section>
        </div>

        <div id="templates" class="content-section">
            <section class="bg-white p-6 rounded-xl shadow-lg border border-stone-200 space-y-6">
                <h2 class="text-3xl font-bold text-center mb-2">실용적인 프롬프트 템플릿</h2>
                <p class="text-center text-gray-600 mb-8">
                    다양한 사용 사례에 바로 적용할 수 있는 구체적이고 상세한 프롬프트 템플릿 예시입니다.
                </p>

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
                    <!-- 템플릿 내용이 여기에 동적으로 표시됩니다 -->
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
            </section>
        </div>

        <div id="advanced" class="content-section">
            <section class="bg-white p-6 rounded-xl shadow-lg border border-stone-200 space-y-6">
                <h2 class="text-3xl font-bold text-center mb-2">고급 프롬프트 기법</h2>
                <p class="text-center text-gray-600 mb-8">
                    Deep Research의 결과물 품질과 깊이를 한층 더 향상시키기 위한 정교한 프롬프트 작성 방법을 소개합니다.
                </p>
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
            </div>
             <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">D. Deep Research 내 가설 생성 및 탐색을 위한 프롬프트</h3>
                <p>LLM은 주어진 컨텍스트를 기반으로 가설을 생성하도록 프롬프트될 수 있다. "지식 기반 아이디어 체인(KG-CoI)" 및 "개념 혼합(MoC)"과 같은 기술은 지식을 통합하고 아이디어를 다양화하여 가설 생성을 개선하는 것을 목표로 한다. 이러한 특정 프레임워크의 기본 원리는 Deep Research 프롬프트에 정보를 제공할 수 있다. 직접 프롬프트는 LLM에게 잠재적인 설명이나 예측을 제안하도록 요청할 수 있으며, 적대적 프롬프트는 모델을 비전통적인 관점에 노출시켜 다양한 가설을 생성하도록 할 수 있다.</p>
                <p class="mt-2">Deep Research는 기존 정보를 찾는 것뿐만 아니라, *새로운* 가설을 생성하거나 새로운 연결고리를 식별하는 데 도움이 되는 방식으로 정보를 종합하는 데 사용될 수 있다. 프롬프트는 Deep Research가 다양한 정보 집합을 수집하도록 안내한 다음, 잠재적인 연결고리나 명시되지 않은 함의에 대해 추측하도록 요청할 수 있다. LLM은 가설을 생성할 수 있으며, Deep Research는 여러 출처의 정보를 종합한다. Deep Research에게 서로 다르지만 잠재적으로 관련된 분야의 정보를 수집하거나 이상 징후 및 특이점을 찾도록 지시함으로써, 결과 보고서는 사용자(또는 후속 프롬프트의 LLM)가 새로운 가설을 세우는 기초 역할을 할 수 있다. Deep Research 보고서 자체가 새로운 통찰력을 얻을 수 있는 선별된 데이터 세트가 된다. 프롬프트는 "수집된 정보를 바탕으로 X와 Y 사이에 잠재적으로 탐색되지 않은 연결고리는 무엇인가?"라고 질문함으로써 이를 준비할 수 있다. 사용자는 가설 생성을 명시적으로 지원하도록 Deep Research 프롬프트를 설계할 수 있다. 예를 들어, "Deep Research를 수행하여 [주제 A, 예: \'생분해성 폴리머의 발전\'] 및 [주제 B, 예: \'만성 상처 치료\']에 대해 조사하시오. 결과를 종합하고, 보고서의 별도 섹션에서 주제 A가 주제 B의 과제를 해결할 수 있는 3-5가지 새로운 가설을 제안하시오. 각 가설에 대해, 발견된 지지 정보를 간략하게 설명하시오."}</p>
                <div class="code-block mt-4">
                    <button class="copy-button" onclick="copyToClipboard(this.nextElementSibling.innerText)">복사</button>
                    <pre><code class="language-text">"Deep Research를 시작하여 [기술/개념 X, 예: '양자 센서 기술']의 [도메인 Y, 예: '초기 질병 탐지'] 분야에서의 잠재적인 새로운 응용 분야를 탐색해주십시오.\n연구는 다음을 포함해야 합니다:\n1.  기술 X의 현재 기능과 한계에 대한 포괄적인 개요를 제공합니다.\n2.  탐지/진단과 관련된 도메인 Y의 주요 미충족 요구 사항과 과제를 요약합니다.\n3.  (1)과 (2)에서 종합된 정보를 바탕으로, 보고서의 한 섹션에서 기술 X가 도메인 Y의 특정 과제를 해결하는 데 어떻게 적용될 수 있는지에 대한 최소 세 가지 새롭고 그럴듯한 가설을 생성합니다. 각 가설에 대해, 추론 과정을 설명하고 이를 검증하기 위해 어떤 추가 연구가 필요한지 명시합니다."}</code></pre>
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
                                <td class="py-3 px-4">Deep Research가 지지 정보뿐만 아니라 반대 의견, 비판 및 한계에 대한 증거도 적극적으로 찾도록 안내합니다.</td>
                                <td class="py-3 px-4">`주요 주장 외에도, X와 관련된 일반적인 비판, 한계 및 미해결 질문에 대한 섹션을 적극적으로 검색하고 포함시키시오.`</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">가설 생성</td>
                                <td class="py-3 px-4">모델이 기존 정보를 바탕으로 새로운 가설이나 아이디어를 창출하도록 요청합니다.</td>
                                <td class="py-3 px-4">Deep Research가 다양한 정보를 수집한 후, 잠재적인 연결고리나 새로운 응용 분야에 대한 가설을 생성하도록 지시합니다.</td>
                                <td class="py-3 px-4">`수집된 정보를 바탕으로 X와 Y 사이에 잠재적으로 탐색되지 않은 연결고리는 무엇인가? 3-5가지 새로운 가설을 제안하시오.`</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">멀티스텝 추론 (Multi-step Reasoning)</td>
                                <td class="py-3 px-4">복잡한 문제를 여러 단계로 나누어 체계적으로 분석하도록 안내합니다.</td>
                                <td class="py-3 px-4">Deep Research의 추론 단계에서 복잡한 분석을 단계별로 수행하고, 각 단계의 논리를 보고서에 명시하도록 지시합니다.</td>
                                <td class="py-3 px-4">`Y에 대한 X의 영향을 분석할 때, 단계별 논리를 사용하여 결론을 도출하고 보고서에 명시하십시오.`</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-3 px-4">출처 다양성 요구</td>
                                <td class="py-3 px-4">다양한 관점과 출처 유형을 포함하도록 명시적으로 요청합니다.</td>
                                <td class="py-3 px-4">Deep Research가 학술 논문, 업계 보고서, 뉴스 기사, 정부 문서 등 다양한 출처에서 정보를 수집하도록 안내합니다.</td>
                                <td class="py-3 px-4">`학술 논문, 업계 분석, 정부 보고서, 그리고 실무자 관점을 모두 포함하여 균형 잡힌 분석을 제공하십시오.`</td>
                            </tr>
                            <tr>
                                <td class="py-3 px-4">시나리오 분석</td>
                                <td class="py-3 px-4">여러 가능한 시나리오나 결과를 탐색하고 각각의 가능성을 평가하도록 요청합니다.</td>
                                <td class="py-3 px-4">Deep Research가 다양한 미래 시나리오를 고려하고 각각의 가능성과 영향을 분석하도록 지시합니다.</td>
                                <td class="py-3 px-4">`X의 발전에 대한 3가지 시나리오(낙관적, 현실적, 비관적)를 제시하고 각각의 가능성과 영향을 분석하십시오.`</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </div>
    <div id="optimization" class="content-section">
        <section class="bg-white p-6 rounded-xl shadow-lg border border-stone-200 space-y-6">
            <h2 class="text-3xl font-bold text-center mb-2">최적화 및 안전장치</h2>
            <p class="text-center text-gray-600 mb-8">
                Deep Research를 효과적으로 활용하기 위해서는 프롬프트의 품질을 지속적으로 개선하고, 잠재적인 편향이나 한계를 인식하여 대응하는 것이 중요합니다.
            </p>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">A. 프롬프트 품질 평가 및 반복적 개선</h3>
                <p>효과적인 Deep Research를 위해서는 프롬프트의 품질을 객관적으로 평가하고 지속적으로 개선해야 합니다. 명확성, 구체성, 포괄성, 실행 가능성 등의 기준을 바탕으로 프롬프트를 검토하고, 생성된 보고서의 품질을 통해 프롬프트의 효과를 측정할 수 있습니다.</p>
                <ul class="list-disc list-inside mt-4 space-y-2 text-stone-700">
                    <li><strong>명확성 검증:</strong> 프롬프트의 각 요소가 명확하고 모호하지 않은지 확인</li>
                    <li><strong>범위 적절성:</strong> 너무 광범위하거나 제한적이지 않은 적절한 연구 범위 설정</li>
                    <li><strong>구조화 정도:</strong> 연구 목표와 방법론이 체계적으로 구성되었는지 평가</li>
                    <li><strong>결과 검토:</strong> 생성된 보고서가 기대한 깊이와 품질을 만족하는지 분석</li>
                    <li><strong>반복적 개선:</strong> 미흡한 부분을 식별하고 프롬프트를 단계적으로 개선</li>
                </ul>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">B. 편향 인식 및 다양한 관점 확보</h3>
                <p>AI 연구는 훈련 데이터의 편향, 검색 알고리즘의 한계, 그리고 웹상 정보의 불균형을 반영할 수 있습니다. 이러한 한계를 인식하고 보완하기 위한 전략적 접근이 필요합니다.</p>
                <div class="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                    <h4 class="font-semibold mb-2 text-amber-800">편향 최소화 전략</h4>
                    <ul class="list-disc list-inside space-y-1 text-stone-700">
                        <li>다양한 출처 유형 명시적 요청 (학술, 산업, 정부, 언론 등)</li>
                        <li>반대 의견과 비판적 관점 적극적 탐색</li>
                        <li>지역적, 문화적 다양성을 고려한 정보 수집</li>
                        <li>최신 정보와 역사적 맥락의 균형적 포함</li>
                        <li>정량적 데이터와 정성적 분석의 결합</li>
                    </ul>
                </div>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">C. 신뢰성 검증 및 사실 확인 방법</h3>
                <p>Deep Research 결과의 신뢰성을 확보하기 위해서는 체계적인 검증 과정이 필요합니다. 출처의 권위성, 정보의 최신성, 데이터의 일관성 등을 다각도로 검토해야 합니다.</p>
                <div class="grid md:grid-cols-2 gap-4 mt-4">
                    <div class="p-4 bg-sky-50 rounded-lg">
                        <h4 class="font-semibold text-sky-800 mb-2">출처 검증</h4>
                        <ul class="text-sm text-stone-700 space-y-1">
                            <li>• 학술적 권위성 확인</li>
                            <li>• 출판 일자 및 최신성 검토</li>
                            <li>• 저자의 전문성 및 소속 확인</li>
                            <li>• 동료 검토(peer review) 여부</li>
                        </ul>
                    </div>
                    <div class="p-4 bg-green-50 rounded-lg">
                        <h4 class="font-semibold text-green-800 mb-2">교차 검증</h4>
                        <ul class="text-sm text-stone-700 space-y-1">
                            <li>• 다중 출처를 통한 사실 확인</li>
                            <li>• 상충하는 정보의 원인 분석</li>
                            <li>• 통계 데이터의 출처 및 방법론 검토</li>
                            <li>• 전문가 의견의 다양성 확보</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    </div>
    <div id="conclusion" class="content-section">
        <section class="bg-white p-6 rounded-xl shadow-lg border border-stone-200 space-y-6">
            <h2 class="text-3xl font-bold text-center mb-2">결론 및 향후 전망</h2>
            <p class="text-center text-gray-600 mb-8">
                Gemini Deep Research는 연구의 패러다임을 바꾸는 강력한 도구입니다. 효과적인 프롬프트 엔지니어링은 그 잠재력을 최대한 발휘하는 열쇠입니다.
            </p>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">A. 핵심 원칙 요약</h3>
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-stone-800 mb-3">프롬프트 설계 핵심 요소</h4>
                        <ul class="list-disc list-inside space-y-2 text-stone-700">
                            <li>명확하고 구체적인 연구 목표 설정</li>
                            <li>적절한 범위와 경계 정의</li>
                            <li>풍부한 컨텍스트 정보 제공</li>
                            <li>원하는 출력 형식과 구조 명시</li>
                            <li>다양한 관점과 비판적 분석 요청</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-stone-800 mb-3">고급 기법 활용</h4>
                        <ul class="list-disc list-inside space-y-2 text-stone-700">
                            <li>구조화된 쿼리와 멀티스텝 추론</li>
                            <li>연쇄적 사고(Chain-of-Thought) 기법</li>
                            <li>반론 유도와 편향 최소화</li>
                            <li>가설 생성과 혁신적 연결고리 탐색</li>
                            <li>시나리오 분석과 미래 전망</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">B. 실무 적용을 위한 권장사항</h3>
                <div class="space-y-4">
                    <div class="p-4 border-l-4 border-blue-400 bg-blue-50 rounded">
                        <h4 class="font-semibold text-blue-800">시작 단계</h4>
                        <p class="text-blue-700 mt-1">간단한 연구 주제부터 시작하여 프롬프트 작성법에 익숙해진 후, 점진적으로 복잡한 프로젝트로 확장하세요.</p>
                    </div>
                    <div class="p-4 border-l-4 border-green-400 bg-green-50 rounded">
                        <h4 class="font-semibold text-green-800">지속적 개선</h4>
                        <p class="text-green-700 mt-1">각 연구 결과를 검토하고 프롬프트의 효과성을 평가하여 다음 프로젝트에 반영하세요.</p>
                    </div>
                    <div class="p-4 border-l-4 border-purple-400 bg-purple-50 rounded">
                        <h4 class="font-semibold text-purple-800">협업적 활용</h4>
                        <p class="text-purple-700 mt-1">팀원들과 프롬프트 템플릿을 공유하고, 각자의 경험을 바탕으로 베스트 프랙티스를 발전시키세요.</p>
                    </div>
                </div>
            </div>
            <div class="p-6 bg-white rounded-lg shadow">
                <h3 class="text-2xl font-semibold text-sky-600 mb-3">C. 미래 전망과 기술 발전 방향</h3>
                <p class="leading-relaxed">AI 기반 연구 도구들은 지속적으로 발전하고 있으며, 향후 더욱 정교하고 특화된 기능들이 추가될 것으로 예상됩니다. 멀티모달 입력 지원, 실시간 협업 기능, 더욱 정밀한 출처 검증 시스템 등이 도입될 가능성이 높습니다.</p>
                <p class="mt-3 leading-relaxed">이러한 기술 발전과 함께 프롬프트 엔지니어링 기법도 계속 진화할 것이며, 연구자들은 새로운 도구와 방법론에 적응하면서 더욱 효과적인 연구 수행 방법을 개발해야 할 것입니다.</p>
                <div class="mt-6 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200">
                    <p class="text-center text-sky-800 font-medium">
                        🚀 효과적인 프롬프트 엔지니어링을 통해 Deep Research의 무한한 가능성을 탐험해보세요!
                    </p>
                </div>
            </div>
        </section>
    </div>
</main>
</div>

<style>
    .copy-button {
        position: absolute;
        top: 8px;
        right: 8px;
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        color: white;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
        z-index: 10;
    }
    
    .copy-button:hover {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
    }
    
    .copy-button:active {
        transform: translateY(0);
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

    .tooltip .tooltiptext::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #555 transparent transparent transparent;
    }

    .tooltip:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
    }
</style>

<script>
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
</script>


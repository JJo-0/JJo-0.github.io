document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.tab-btn');
    const contentSections = document.querySelectorAll('.content-section');

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
            // window.location.hash = targetId; // 주석 처리하여 URL 변경 방지
            showSection(targetId);
            updateActiveNav(targetId);
        });
    });

    function handleLocationChange() {
        const hash = window.location.hash.substring(1) || 'introduction';
        showSection(hash);
        updateActiveNav(hash);
    }

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Initial load

    // Accordion logic
    const accordions = document.querySelectorAll('.accordion-button');
    accordions.forEach(accordion => {
        accordion.addEventListener('click', () => {
            const target = document.getElementById(accordion.dataset.target);
            const isHidden = target.classList.contains('hidden');
            if (isHidden) {
                target.classList.remove('hidden');
                accordion.classList.add('active');
            } else {
                target.classList.add('hidden');
                accordion.classList.remove('active');
            }
        });
    });

    // Chart.js initializations
    const personaSelect = document.getElementById('persona-select');
    if (personaSelect) {
        personaSelect.addEventListener('change', (e) => {
            document.getElementById('selected-persona-output').textContent = e.target.options[e.target.selectedIndex].text;
        });
    }

    if (document.getElementById('constraintsImpactChart')) {
        new Chart(document.getElementById('constraintsImpactChart'), {
            type: 'line',
            data: {
                labels: ['매우 낮음', '낮음', '중간', '높음', '매우 높음'],
                datasets: [{
                    label: '계획의 품질/관련성',
                    data: [20, 45, 70, 85, 95],
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: '프롬프트 상세도와 계획 품질의 관계' },
                    legend: { display: false }
                },
                scales: {
                    x: { title: { display: true, text: '프롬프트 상세도 (제약 조건 명시 수준)' } },
                    y: { min: 0, max: 100, title: { display: true, text: '품질/관련성 (%)' } }
                }
            }
        });
    }

    if (document.getElementById('frameworksComparisonChart')) {
        new Chart(document.getElementById('frameworksComparisonChart'), {
            type: 'radar',
            data: {
                labels: ['제약 조건 처리', '실시간 정보 활용', '내러티브 생성', '유연성', '자동화 수준'],
                datasets: [
                    {
                        label: 'TRIP-PAL',
                        data: [9, 7, 3, 6, 8],
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    },
                    {
                        label: 'NarrativeGuide',
                        data: [6, 5, 9, 7, 6],
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    },
                    {
                        label: 'FLEX-TRAVELPLANNER',
                        data: [8, 6, 4, 9, 5],
                        borderColor: 'rgba(255, 206, 86, 1)',
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: '학술 프레임워크 비교 (개념적)' }
                },
                scales: {
                    r: {
                        angleLines: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 10
                    }
                }
            }
        });
    }
});

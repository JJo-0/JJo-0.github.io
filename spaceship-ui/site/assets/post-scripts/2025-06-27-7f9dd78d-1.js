document.addEventListener('DOMContentLoaded', function () {
    const magnesiumData = {
        glycinate: {
            name: '마그네슘 글리시네이트',
            bioavailability: 80,
            description: "수면과 정신 안정에 특화된 '킬레이트' 형태입니다. 아미노산 글리신이 마그네슘 흡수를 돕고, 스스로도 진정 효과를 내어 시너지를 발휘합니다.",
            bestFor: '수면의 질 개선, 스트레스 감소, 불안 완화',
            sideEffect: '위장 장애가 거의 없어 가장 편안한 형태',
            summary: "<strong>결론:</strong> 선물 목적(수면, 안정, 스트레스 감소)에 가장 부합하는 <strong>최상의 선택지</strong>입니다. 높은 흡수율과 최소한의 부작용으로 편안함과 효과를 동시에 제공합니다."
        },
        malate: {
            name: '마그네슘 말레이트',
            bioavailability: 70,
            description: "에너지 생성 과정(크렙스 회로)의 핵심 성분인 '말산'과 결합되어 있습니다. 세포 에너지 생산을 직접적으로 도와줍니다.",
            bestFor: '만성 피로, 근육통, 섬유근육통 완화',
            sideEffect: '위장 자극이 적고 내약성이 좋은 편',
            summary: "<strong>결론:</strong> 만성 피로 개선이 주 목적이라면 훌륭한 선택입니다. 수면 개선 효과도 있지만, 글리시네이트보다는 에너지 생성에 더 특화되어 있습니다."
        },
        citrate: {
            name: '마그네슘 시트레이트',
            bioavailability: 50,
            description: "'구연산'과 결합된 형태로, 괜찮은 흡수율과 경제성을 가졌습니다. 하지만 물을 끌어당기는 성질이 있습니다.",
            bestFor: '변비 완화, 일반적인 마그네슘 보충',
            sideEffect: '고용량 섭취 시 설사, 복통 유발 가능성이 높음',
            summary: "<strong>결론:</strong> 변비가 없는 사람에게는 오히려 불편함을 줄 수 있어, 특별한 목적이 없다면 선물용으로는 신중해야 합니다."
        },
        oxide: {
            name: '산화 마그네슘',
            bioavailability: 4,
            description: "단위 무게당 원소 마그네슘 함량은 높지만, 생체이용률이 매우 낮은 무기염 형태입니다. 흡수되지 않은 마그네슘은 장에 남습니다.",
            bestFor: '변비약(완하제) 성분, 제산제',
            sideEffect: '설사, 복통 등 위장 장애 유발 가능성이 매우 높음',
            summary: "<strong>결론:</strong> 흡수율이 극히 낮고 위장 문제를 일으키기 쉬워, 편안한 휴식을 선물하려는 목적에는 전혀 부합하지 않으므로 <strong>피해야 할 형태</strong>입니다."
        }
    };

    const typeDetailsEl = document.getElementById('type-details');
    const typeSummaryEl = document.getElementById('type-summary');
    let bioavailabilityChart;

    function updateTypeInfo(type) {
        const data = magnesiumData[type];
        typeDetailsEl.innerHTML = `
            <h3 class="text-2xl font-bold mb-3 text-blue-700">${data.name}</h3>
            <p class="mb-4">${data.description}</p>
            <div class="space-y-3">
                <p><strong class="font-semibold text-gray-800">🎯 추천 대상:</strong> ${data.bestFor}</p>
                <p><strong class="font-semibold text-gray-800">⚠️ 부작용:</strong> ${data.sideEffect}</p>
            </div>
        `;
        typeSummaryEl.innerHTML = `<p class="text-blue-800">${data.summary}</p>`;
        
        // Update Chart
        bioavailabilityChart.data.datasets[0].data = [data.bioavailability];
        bioavailabilityChart.data.labels = [data.name];
        bioavailabilityChart.update();
    }

    // Initialize Bioavailability Chart
    const ctxBio = document.getElementById('bioavailabilityChart').getContext('2d');
    bioavailabilityChart = new Chart(ctxBio, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '생체이용률 (흡수율)',
                data: [],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 5,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%'
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` 흡수율: ${context.raw}% (대략적인 수치)`;
                        }
                    }
                },
                 title: {
                    display: true,
                    text: '형태별 생체이용률(흡수율) 비교',
                    font: {
                        size: 16
                    },
                    padding: {
                        bottom: 20
                    }
                }
            }
        }
    });

    // Type Selectors Event Listener
    const typeSelectors = document.querySelectorAll('.type-selector');
    typeSelectors.forEach(button => {
        button.addEventListener('click', () => {
            typeSelectors.forEach(btn => {
                btn.classList.remove('active', 'bg-blue-100', 'text-blue-800');
                btn.classList.add('bg-gray-100', 'text-gray-800');
            });
            button.classList.add('active', 'bg-blue-100', 'text-blue-800');
            button.classList.remove('bg-gray-100', 'text-gray-800');
            updateTypeInfo(button.dataset.type);
        });
    });

    // Initialize default view
    updateTypeInfo('glycinate');

    // Initialize Price Chart
    const ctxPrice = document.getElementById('priceChart').getContext('2d');
    const priceChart = new Chart(ctxPrice, {
        type: 'bar',
        data: {
            labels: ['최고의 선택 (Thorne)', '가성비 선택 (KAL)'],
            datasets: [{
                label: '1정/캡슐당 가격 (원)',
                data: [450, 177],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '원'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Accordion Logic
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isOpening = !button.classList.contains('open');
            
            // Optional: close other accordions
            // accordionButtons.forEach(b => {
            //     b.classList.remove('open');
            //     b.querySelector('span:last-child').classList.remove('rotate-180');
            // });

            if (isOpening) {
                button.classList.add('open');
                button.querySelector('span:last-child').classList.add('rotate-180');
            } else {
                 button.classList.remove('open');
                button.querySelector('span:last-child').classList.remove('rotate-180');
            }
        });
    });

    // Tab Navigation Logic
    const tabButtons = document.querySelectorAll('.tab-button');
    const contentSections = document.querySelectorAll('.content-section');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            contentSections.forEach(section => {
                if (section.id === tabId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});

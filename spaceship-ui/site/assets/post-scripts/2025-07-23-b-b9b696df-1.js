        document.addEventListener('DOMContentLoaded', function () {
            const tabs = document.querySelectorAll('.tab-btn');
            const contents = document.querySelectorAll('.content-panel');
            const tabNav = document.getElementById('tab-nav');

            tabNav.addEventListener('click', (e) => {
                const target = e.target.closest('.tab-btn');
                if (!target) return;

                const tabId = target.dataset.tab;

                tabs.forEach(tab => tab.classList.remove('active'));
                target.classList.add('active');

                contents.forEach(content => {
                    if (content.id === tabId) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });

            const goalButtons = document.getElementById('goal-buttons');
            const recommendationText = document.getElementById('recommendation-text');
            const recommendationCard = document.getElementById('recommendation-card');
            
            const recommendations = {
                chronic_fatigue: "강력한 에너지 부스팅과 구내염 등 증상 개선이 시급하군요. <span class='highlight-teal'>'고함량 비타민 B군'</span> 제품이 더 효과적입니다. B1, B2, B6의 100mg 고함량은 피로 물질 대사와 에너지 생성을 강력하게 촉진하여 빠른 체감 효과를 기대할 수 있습니다.",
                stress: "잦은 스트레스와 음주로 지친 몸을 관리해야겠네요. 이 경우 <span class='highlight-teal'>'균형잡힌 종합 비타민'</span>이 훌륭한 대안이 될 수 있습니다. 활성형 B9/B12와 풍부한 항산화 성분, 그리고 장기 복용에 부담 없는 가격은 꾸준한 건강 관리에 더 적합합니다.",
                focus: "학업 집중력과 체력 보충이 목표시군요. 이는 만성 피로와 유사하게 빠른 에너지 공급이 중요합니다. <span class='highlight-teal'>'고함량 비타민 B군'</span>을 선택하여 뇌와 신체 에너지 대사를 동시에 활성화하는 것이 좋습니다."
            };

            goalButtons.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button) return;

                const goal = button.dataset.goal;
                recommendationText.innerHTML = recommendations[goal];
                
                recommendationCard.style.transform = 'rotateX(360deg)';
                setTimeout(() => {
                    recommendationCard.style.transform = '';
                }, 600);
            });

            const ctx = document.getElementById('vitaminBChart').getContext('2d');
            const vitaminBChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['B1 (티아민)', 'B2 (리보플라빈)', 'B6 (피리독신)', 'B12 (코발라민)'],
                    datasets: [{
                        label: '비맥스 메타 (고함량 B군)',
                        data: [100, 100, 100, 0.5],
                        backgroundColor: 'rgba(15, 118, 110, 0.7)',
                        borderColor: 'rgba(13, 74, 70, 1)',
                        borderWidth: 1
                    }, {
                        label: '투퍼데이 (종합 비타민)',
                        data: [75, 50, 75, 0.3],
                        backgroundColor: 'rgba(251, 146, 60, 0.7)',
                        borderColor: 'rgba(217, 119, 6, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '핵심 비타민 B군 함량 비교 (단위: mg)',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: {
                                top: 10,
                                bottom: 20
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        let value = context.parsed.y;
                                        if (context.label === 'B12 (코발라민)') {
                                            label += value * 1000 + ' mcg';
                                        } else {
                                            label += value + ' mg';
                                        }
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '함량 (mg)'
                            }
                        }
                    }
                }
            });
        });

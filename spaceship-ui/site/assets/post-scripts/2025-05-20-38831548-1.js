        const primaryDark = '#073B4C';
        const accentRed = '#FF6B6B';
        const accentYellow = '#FFD166';
        const accentGreen = '#06D6A0';
        const accentBlue = '#118AB2';

        function wrapLabel(str, maxWidth) {
            if (typeof str !== 'string') return str; // Return if not a string (e.g., already an array)
            if (str.length <= maxWidth) return str;

            const words = str.split(' ');
            let currentLine = '';
            const lines = [];

            for (const word of words) {
                if ((currentLine + word).length > maxWidth && currentLine.length > 0) {
                    lines.push(currentLine.trim());
                    currentLine = '';
                }
                currentLine += word + ' ';
            }
            if (currentLine.trim().length > 0) {
                lines.push(currentLine.trim());
            }
            return lines.length > 0 ? lines : [str]; // Ensure it returns at least the original string if no split occurs
        }
        
        const defaultTooltipCallbacks = {
            title: function(tooltipItems) {
                const item = tooltipItems[0];
                let label = item.chart.data.labels[item.dataIndex];
                if (Array.isArray(label)) {
                  return label.join(' ');
                } else {
                  return label;
                }
            }
        };

        // 1. Caffeine Content Chart
        const caffeineContentCtx = document.getElementById('caffeineContentChart').getContext('2d');
        const caffeineData = {
            labels: [
                wrapLabel('일반 브루드 커피 (8oz)', 16), 
                wrapLabel('한국 시판 커피 (1잔)', 16), 
                wrapLabel('던킨 커피 (Medium, 14oz)', 16), 
                wrapLabel('스타벅스 아메리카노 (Grande, 16oz)', 16),
                wrapLabel('스타벅스 브루드 (Grande, 16oz)', 16)
            ],
            datasets: [{
                label: '평균 카페인 함량 (mg)',
                data: [96, 150, 210, 225, 350], // Using mid-point for 한국 시판 커피, and an average for 스타벅스 브루드
                backgroundColor: [accentRed, accentYellow, accentGreen, accentBlue, '#FF9F40'], // Added one more color
                borderColor: primaryDark,
                borderWidth: 1
            }]
        };
        new Chart(caffeineContentCtx, {
            type: 'bar',
            data: caffeineData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: '카페인 (mg)', color: primaryDark },
                        ticks: { color: primaryDark }
                    },
                    x: { ticks: { color: primaryDark, maxRotation: 0, minRotation: 0, autoSkip: false } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: defaultTooltipCallbacks }
                }
            }
        });

        // 3. Sleep Quality Chart
        const sleepQualityCtx = document.getElementById('sleepQualityChart').getContext('2d');
        new Chart(sleepQualityCtx, {
            type: 'bar',
            data: {
                labels: [wrapLabel('깊은 수면 (N3)', 16), wrapLabel('얕은 수면 (N1, N2)', 16), wrapLabel('REM 수면', 16), wrapLabel('수면 시작 용이성',16)],
                datasets: [{
                    label: '카페인 섭취 시 변화 경향',
                    data: [-20, 15, -10, -15], // Conceptual data: Negative for decrease, Positive for increase
                    backgroundColor: [accentRed, accentYellow, accentRed, accentRed], // Red for negative impact, Yellow for increase in light sleep
                    borderColor: primaryDark,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: '변화 경향 (개념적 수치)', color: primaryDark },
                        ticks: { color: primaryDark, callback: function(value) { return value + '%';} }
                    },
                    y: { ticks: { color: primaryDark, autoSkip: false } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        callbacks: {
                            ...defaultTooltipCallbacks,
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.x !== null) {
                                    label += (context.parsed.x > 0 ? '+' : '') + context.parsed.x + '% (경향)';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
        
        // 6. Neuroprotection Chart
        const neuroProtectionCtx = document.getElementById('neuroProtectionChart').getContext('2d');
        new Chart(neuroProtectionCtx, {
            type: 'doughnut',
            data: {
                labels: [wrapLabel('파킨슨병 위험 감소 관련', 16), wrapLabel('알츠하이머병 위험 감소 관련', 16), wrapLabel('기타 요인',16)],
                datasets: [{
                    label: '신경퇴행성 질환 위험 감소 연관성 (개념적)',
                    data: [30, 25, 45], // Conceptual percentages
                    backgroundColor: [accentGreen, accentBlue, '#E0E0E0'],
                    borderColor: primaryDark,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: primaryDark } },
                    tooltip: { 
                        callbacks: {
                            ...defaultTooltipCallbacks,
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed + '% (개념적)';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });


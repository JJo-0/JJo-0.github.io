        document.addEventListener('DOMContentLoaded', function () {
            const navLinks = document.querySelectorAll('.nav-link');
            const sections = document.querySelectorAll('.content-section');
            const accordionHeaders = document.querySelectorAll('.accordion-header');

            const mealPlanData = [
                { day: '월요일', breakfast: '현미잡곡밥 2/3공기, 된장찌개, 계란찜', lunch: '구내식당(튀김 피하기, 밥은 반만)', dinner: '두부구이, 쌈채소, 버섯볶음' },
                { day: '화요일', breakfast: '통밀빵 샌드위치(닭가슴살, 채소)', lunch: '샐러드 (구운 연어 추가)', dinner: '소고기 샤브샤브 (면/죽 제외)' },
                { day: '수요일', breakfast: '오트밀, 견과류, 사과 1/2개', lunch: '메밀국수, 삶은 계란 추가', dinner: '닭가슴살 구이와 구운 채소' },
                { day: '목요일', breakfast: '현미잡곡밥 2/3공기, 미역국, 두부구이', lunch: '(외식) 비빔밥(밥 반, 고추장 조절)', dinner: '고등어 구이, 현미밥 1/2공기' },
                { day: '금요일', breakfast: '스크램블 에그, 통밀빵 1쪽', lunch: '백반(생선구이 위주)', dinner: '(회식) 삼겹살(쌈채소 많이, 밥 생략)' },
                { day: '주말', breakfast: '가족과 함께(밥량 조절)', lunch: '김밥(밥 적은 것)', dinner: '카레(강황 활용)' },
            ];
            
            const exercisePlanData = [
                { day: '월, 수, 금', type: '유산소 운동', detail: '빠르게 걷기 30분', note: '약간 숨이 찰 정도. 식후 30분~1시간 뒤가 효과적.' },
                { day: '화, 목', type: '근력 운동', detail: '스쿼트, 팔굽혀펴기, 플랭크 등 (각 15회x3세트)', note: '유튜브 \'초보 근력운동\' 영상 참고.' },
                { day: '토, 일', type: '능동적 휴식', detail: '스트레칭 또는 가벼운 산책', note: '무리하지 않고 즐겁게!' },
            ];

            function showSection(hash) {
                const targetHash = hash || '#dashboard';
                
                sections.forEach(section => {
                    if ('#' + section.id === targetHash) {
                        section.classList.add('active');
                    } else {
                        section.classList.remove('active');
                    }
                });

                navLinks.forEach(link => {
                    if (link.getAttribute('href') === targetHash) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
                window.scrollTo(0, 0);
            }

            navLinks.forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetHash = this.getAttribute('href');
                    history.pushState(null, null, targetHash);
                    showSection(targetHash);
                });
            });

            window.addEventListener('popstate', function () {
                showSection(window.location.hash);
            });

            showSection(window.location.hash);

            const nutrientCtx = document.getElementById('nutrientChart').getContext('2d');
            new Chart(nutrientCtx, {
                type: 'doughnut',
                data: {
                    labels: ['탄수화물', '단백질', '지방'],
                    datasets: [{
                        label: '영양소 비율',
                        data: [50, 20, 30],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(22, 163, 74, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                        ],
                        borderColor: [
                            'rgba(59, 130, 246, 1)',
                            'rgba(22, 163, 74, 1)',
                            'rgba(245, 158, 11, 1)',
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += context.parsed + '%';
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });

            const mealPlanContainer = document.getElementById('mealPlanContainer');
            mealPlanData.forEach(item => {
                const card = document.createElement('div');
                card.className = 'plan-card bg-slate-50 border border-slate-200 rounded-lg p-4 cursor-pointer';
                card.innerHTML = `
                    <h4 class="font-bold text-slate-800">${item.day}</h4>
                    <div class="text-sm text-slate-500 mt-2 hidden">
                        <p><strong>아침:</strong> ${item.breakfast}</p>
                        <p><strong>점심:</strong> ${item.lunch}</p>
                        <p><strong>저녁:</strong> ${item.dinner}</p>
                    </div>
                `;
                card.addEventListener('click', () => {
                    card.querySelector('div').classList.toggle('hidden');
                });
                mealPlanContainer.appendChild(card);
            });
            
            const exercisePlanContainer = document.getElementById('exercisePlanContainer');
            exercisePlanData.forEach(item => {
                const card = document.createElement('div');
                card.className = 'plan-card bg-slate-50 border border-slate-200 rounded-lg p-4 cursor-pointer';
                card.innerHTML = `
                    <h4 class="font-bold text-slate-800">${item.day}</h4>
                    <p class="text-blue-600 font-semibold">${item.type}</p>
                    <div class="text-sm text-slate-500 mt-2 hidden">
                        <p><strong>운동:</strong> ${item.detail}</p>
                        <p><strong>팁:</strong> ${item.note}</p>
                    </div>
                `;
                card.addEventListener('click', () => {
                    card.querySelector('div').classList.toggle('hidden');
                });
                exercisePlanContainer.appendChild(card);
            });

            const calculateHrBtn = document.getElementById('calculateHrBtn');
            calculateHrBtn.addEventListener('click', () => {
                const age = parseInt(document.getElementById('ageInput').value);
                const hrResult = document.getElementById('hrResult');
                if (age && age > 0) {
                    const maxHr = 220 - age;
                    const lower = Math.round(maxHr * 0.5);
                    const upper = Math.round(maxHr * 0.7);
                    hrResult.innerHTML = `당신의 중강도 목표 심박수는 <br> <strong class="text-blue-600 text-lg">분당 ${lower} ~ ${upper}회</strong> 입니다.`;
                    hrResult.classList.remove('hidden');
                } else {
                    hrResult.innerHTML = '유효한 나이를 입력해주세요.';
                    hrResult.classList.remove('hidden');
                }
            });

            accordionHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const content = header.nextElementSibling;
                    content.classList.toggle('hidden');
                });
            });
        });

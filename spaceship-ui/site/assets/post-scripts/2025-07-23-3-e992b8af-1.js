        document.addEventListener('DOMContentLoaded', function () {
            const absorptionCtx = document.getElementById('absorptionChart').getContext('2d');
            new Chart(absorptionCtx, {
                type: 'bar',
                data: {
                    labels: ['2세대 EE 형태', '1세대 TG 형태', '3세대 rTG 형태'],
                    datasets: [{
                        label: '상대적 흡수율 (%)',
                        data: [73, 100, 124],
                        backgroundColor: [
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(75, 192, 192, 0.6)'
                        ],
                        borderColor: [
                            'rgba(255, 159, 64, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: '오메가-3 형태별 흡수율 비교',
                            font: {
                                size: 16
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.x !== null) {
                                        label += context.parsed.x + '%';
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '흡수율 (TG 형태=100 기준)'
                            }
                        }
                    }
                }
            });

            const accordions = document.querySelectorAll('.accordion-item');
            accordions.forEach(item => {
                const header = item.querySelector('.accordion-header');
                const content = item.querySelector('.accordion-content');
                const icon = item.querySelector('.accordion-icon');
                header.addEventListener('click', () => {
                    const isOpen = content.style.maxHeight;
                    accordions.forEach(otherItem => {
                        otherItem.querySelector('.accordion-content').style.maxHeight = null;
                        otherItem.querySelector('.accordion-icon').classList.remove('rotate-45');
                        otherItem.querySelector('.accordion-icon').textContent = '+';

                    });
                    if (!isOpen) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                        icon.classList.add('rotate-45');
                        icon.textContent = '';
                    }
                });
            });

            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
            
            const navLinks = document.querySelectorAll('nav a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (!mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                });
            });

            const sections = document.querySelectorAll('section');
            const mainNavLinks = document.querySelectorAll('nav a[href^="#"]');
            
            const onScroll = () => {
                const scrollPos = window.scrollY + 100;
                sections.forEach(section => {
                    if (section.offsetTop <= scrollPos && (section.offsetTop + section.offsetHeight) > scrollPos) {
                        mainNavLinks.forEach(link => {
                            link.classList.remove('active');
                            if (section.getAttribute('id') === link.getAttribute('href').substring(1)) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            };
            window.addEventListener('scroll', onScroll);
        });

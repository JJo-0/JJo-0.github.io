(() => {
  // This is deliberately a learning layer, not a claim about a particular OEM's
  // bill of materials or customer qualification.  Those remain node-specific.
  const guides = {
    'SEM.FE.ETCH': {
      title: 'Etch / 식각', stage: '공정의 목적',
      definition: '웨이퍼에 쌓인 막 중 마스크가 보호하지 않은 부분만 골라 제거해 회로의 선·구멍·벽을 만드는 공정입니다.',
      impact: '핵심 결과는 속도만이 아니라 방향성, 선택비, 균일도, 결함입니다.',
      link: ['식각의 큰 그림 · Samsung', 'https://semiconductor.samsung.com/support/tools-resources/dictionary/semiconductor-glossary-etching/'],
    },
    'SEM.AUTO.FOUP-FOSB-CARRIER': {
      title: 'FOUP / Robot / EFEM', stage: '1. 웨이퍼 넣기',
      definition: 'FOUP는 웨이퍼를 담는 밀폐 운반 상자이고, load port·EFEM·robot은 이를 열어 웨이퍼를 챔버까지 옮기는 입구 시스템입니다.',
      impact: '정렬·파티클·취급 오류는 식각 이전부터 결함 위험을 만들 수 있습니다.',
      link: ['EFEM·load port·robot 예시 · Hirata', 'https://www.hirata.co.jp/en/products/semiconductor'],
    },
    'SEM.EQCOMP.CHAMBER.ESC-HE-COOLING': {
      title: 'ESC / He backside cooling', stage: '2. 고정·온도',
      definition: 'ESC는 정전기로 웨이퍼를 붙잡는 척이고, 뒷면 헬륨은 웨이퍼와 척 사이에서 열을 전달하도록 돕습니다.',
      impact: '온도 분포가 달라지면 반응 속도와 식각 모양이 웨이퍼 위치마다 달라질 수 있습니다.',
      link: ['플라즈마 공정용 ESC · NGK', 'https://www.ngk-global.com/product/sc-chack.html'],
    },
    'SEM.EQCOMP.TEMPERATURE-CHILLER': {
      title: 'Temperature control / Chiller', stage: '2. 고정·온도',
      definition: 'Chiller는 척·전원·챔버 주변에서 발생한 열을 일정하게 관리하는 온도 제어 장치입니다.',
      impact: '같은 recipe라도 온도가 흔들리면 식각 속도·선택비·균일도가 달라질 수 있습니다.',
      link: ['반도체 온도 제어 장비 예시 · FST', 'https://www.fstc.co.kr/bbs/board.php?bo_table=page_tcu_en_2'],
    },
    'SEM.EQCOMP.GAS-CHEMICAL.MFC': {
      title: 'MFC', stage: '3. 가스 계량',
      definition: 'MFC(mass flow controller)는 공정 가스를 정한 유량으로 재고 보내는 계량기입니다.',
      impact: '유량이 달라지면 플라즈마 조성과 반응량이 바뀌어 웨이퍼 안팎의 결과가 달라질 수 있습니다.',
      link: ['MFC의 역할과 제품 예시 · HORIBA STEC', 'https://www.horiba.com/int/semiconductor/products/detail/action/show/Product/sec-z700x-series-672/'],
    },
    'SEM.EQCOMP.GAS-CHEMICAL.PURIFIER-GETTER': {
      title: 'Gas purifier / Getter', stage: '3. 가스 계량',
      definition: 'Purifier는 공급 가스 안의 수분·산소·입자 같은 오염원을 줄여 공정 가스의 순도를 관리합니다.',
      impact: '가스 오염은 불필요한 반응과 결함을 일으켜 식각 결과와 수율을 흔들 수 있습니다.',
      link: ['반도체 가스 정제 시스템 · Entegris', 'https://www.entegris.com/shop/en/USD/products/gas-filtration-and-purification/gas-purifiers/GateKeeper-EX-Series-Gas-Purification-Systems/p/GateKeeperEXSeriesGasPurificationSystems'],
    },
    'SEM.EQCOMP.PLASMA-RF': {
      title: 'Plasma / RF power delivery', stage: '4. 선택 식각',
      definition: 'RF 전력은 가스를 플라즈마 상태로 만들고 유지합니다. 플라즈마 속 이온·라디칼이 재료 제거에 필요한 에너지와 반응성을 제공합니다.',
      impact: '전력 전달이 불안정하면 플라즈마와 이온 에너지가 흔들려 식각 모양·반복성이 나빠질 수 있습니다.',
      link: ['플라즈마 식각 원리 · Lam Research', 'https://newsroom.lamresearch.com/etch-essentials-semiconductor-manufacturing'],
    },
    'SEM.EQCOMP.PLASMA-RF.MATCHER': {
      title: 'RF match network', stage: '4. 선택 식각',
      definition: 'Matcher는 전원과 계속 변하는 플라즈마 사이의 전기적 불일치를 조정해 반사 전력을 줄이고 전력이 챔버에 전달되게 합니다.',
      impact: '매칭이 늦거나 불안정하면 플라즈마 조건이 흔들리고 공정 반복성이 떨어질 수 있습니다.',
      link: ['RF matching network 설명 · Advanced Energy', 'https://www.advancedenergy.com/en-us/about/news/blog/understanding-forward-and-reflected-power-in-rf-systems/'],
    },
    'SEM.EQCOMP.CHAMBER.LINER-RING-SHOWERHEAD': {
      title: 'Chamber liner / ring / showerhead', stage: '4. 반응 공간',
      definition: 'Liner와 ring은 플라즈마·부식·파티클로부터 챔버를 보호하고, showerhead는 가스를 웨이퍼 위에 고르게 분배하는 부품입니다.',
      impact: '내벽 상태와 가스 분포가 달라지면 미세 마스킹·파티클·웨이퍼 내 균일도 문제가 생길 수 있습니다.',
      link: ['건식 식각용 가스·챔버 코팅 · Entegris', 'https://www.entegris.com/en/home/our-science/by-industry/microelectronics/semiconductor/dry-etch.html'],
    },
    'SEM.EQCOMP.VACUUM.DRY-TURBO-CRYO-PUMP': {
      title: 'Dry / turbo / cryo pump', stage: '5. 배출·압력',
      definition: '진공 펌프는 챔버 압력을 낮게 유지하고, 반응 뒤 생긴 휘발성 부산물을 밖으로 빼냅니다.',
      impact: '압력·배출이 흔들리면 반응 종의 이동과 부산물 제거가 달라져 식각 결과가 달라질 수 있습니다.',
      link: ['반도체용 dry pump · Edwards Vacuum', 'https://www.edwardsvacuum.com/en-uk/semiconductor/our-products/dry-pumps'],
    },
    'SEM.EQCOMP.ENDPOINT-SENSORS': {
      title: 'Endpoint sensor', stage: '5. 끝점 판단',
      definition: 'Endpoint sensor는 목표 막이 제거되는 순간의 빛·가스·전기 신호 변화를 읽어 식각을 멈출 시점을 찾습니다.',
      impact: '너무 오래 깎으면 아래 막을 손상시키고, 너무 짧으면 잔막이 남을 수 있습니다.',
      link: ['실시간 endpoint monitoring 예시 · INFICON', 'https://www.inficon.com/en/products/gas-analysis/quantus-hp100'],
    },
  };

  let panel;
  function ensurePanel() {
    if (panel?.isConnected) return panel;
    const inspector = document.querySelector('#inspector-content');
    const scoreGrid = document.querySelector('#score-grid');
    if (!inspector) return null;
    panel = document.createElement('section');
    panel.className = 'company-link-panel etcher-guide-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Etcher 초보자 설명');
    panel.innerHTML = `
      <div class="company-link-heading"><div><p class="company-link-eyebrow">ETCHER WALK-THROUGH</p><h3 data-etcher-title></h3></div><span class="company-link-market" data-etcher-stage></span></div>
      <p class="company-link-description" data-etcher-definition></p>
      <p class="etcher-guide-impact" data-etcher-impact></p>
      <div class="company-link-actions is-resource-grid" data-etcher-actions></div>
      <p class="company-link-note">이 설명은 Etcher 안에서의 기능을 쉽게 이해하기 위한 안내입니다. 특정 OEM의 정확한 부품 구성이나 고객 qualification은 별도 근거가 필요합니다.</p>`;
    (scoreGrid || inspector.firstElementChild)?.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function render() {
    const current = ensurePanel();
    const id = document.querySelector('#node-id')?.textContent?.trim();
    const guide = guides[id];
    if (!current || !guide) { if (current) current.hidden = true; return; }
    current.querySelector('[data-etcher-title]').textContent = guide.title;
    current.querySelector('[data-etcher-stage]').textContent = guide.stage;
    current.querySelector('[data-etcher-definition]').textContent = guide.definition;
    current.querySelector('[data-etcher-impact]').textContent = `공정 영향: ${guide.impact}`;
    const actions = current.querySelector('[data-etcher-actions]');
    actions.replaceChildren();
    const link = document.createElement('a');
    link.href = guide.link[1]; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.innerHTML = `<span class="company-link-resource-text"><strong>${guide.link[0]}</strong><small class="company-link-resource-meta">OFFICIAL / LEARN · 외부 자료</small></span><span class="company-link-arrow">↗</span>`;
    actions.append(link);
    current.hidden = false;
  }

  const observer = new MutationObserver(render);
  const id = document.querySelector('#node-id');
  const inspector = document.querySelector('#inspector-content');
  if (id) observer.observe(id, { childList: true, characterData: true, subtree: true });
  if (inspector) observer.observe(inspector, { attributes: true, attributeFilter: ['hidden'] });
  render();
})();

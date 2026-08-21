(() => {
  const marketRegistryUrl = './company-links-korea.json';
  const officialRegistryUrl = './company-links-korea-private.json';
  const globalListedRegistryUrl = './company-links-global-listed.json';
  const state = {
    marketRegistry: null,
    officialRegistry: null,
    globalListedRegistry: null,
    panel: null,
  };

  function buildUrl(template, ticker) {
    return String(template || '').replace('{ticker}', encodeURIComponent(ticker));
  }

  function ensurePanel() {
    if (state.panel?.isConnected) return state.panel;
    const scoreGrid = document.querySelector('#score-grid');
    const inspector = document.querySelector('#inspector-content');
    if (!inspector) return null;

    const panel = document.createElement('section');
    panel.className = 'company-link-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', '기업 외부 정보 링크');
    panel.innerHTML = `
      <div class="company-link-heading">
        <div>
          <p class="company-link-eyebrow" data-company-link-eyebrow>COMPANY LINKS</p>
          <h3 data-company-link-title>기업 정보</h3>
        </div>
        <span class="company-link-market" data-company-link-market></span>
      </div>
      <p class="company-link-description" data-company-link-description></p>
      <div class="company-link-actions" data-company-link-actions></div>
      <p class="company-link-note" data-company-link-note></p>
    `;
    (scoreGrid || inspector.firstElementChild)?.insertAdjacentElement('afterend', panel);
    state.panel = panel;
    return panel;
  }

  function createAnchor({ href, title, role, publisher, degraded = false, generated = false }) {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.dataset.resourceRole = role;
    if (degraded) anchor.dataset.resourceAvailability = 'degraded';
    if (generated) anchor.dataset.resourceAvailability = 'generated';

    const text = document.createElement('span');
    text.className = 'company-link-resource-text';
    const label = document.createElement('strong');
    label.textContent = title;
    const meta = document.createElement('small');
    meta.className = 'company-link-resource-meta';
    meta.textContent = publisher ? `${role} · ${publisher}` : role;
    text.append(label, meta);

    const arrow = document.createElement('span');
    arrow.className = 'company-link-arrow';
    arrow.textContent = '↗';
    anchor.append(text, arrow);
    return anchor;
  }

  function renderMarketProfile(panel, nodeId, profile) {
    const { ticker, exchange, nameKo } = profile;
    const templates = state.marketRegistry?.urlTemplates || {};
    const actions = panel.querySelector('[data-company-link-actions]');
    panel.querySelector('[data-company-link-eyebrow]').textContent = 'MARKET / RESEARCH LINKS';
    panel.querySelector('[data-company-link-title]').textContent = nameKo || nodeId;
    panel.querySelector('[data-company-link-market]').textContent = `${exchange} · ${ticker}`;
    panel.querySelector('[data-company-link-description]').textContent = `${nameKo || nodeId} (${ticker})의 시세, 투자자 정보, 재무·컨센서스 페이지로 이동합니다.`;
    panel.querySelector('[data-company-link-note]').textContent = '외부 시세·리서치 페이지는 참고용입니다. Atlas의 공급관계·고객상태와 투자판단을 동일시하지 않습니다.';
    actions.classList.remove('is-resource-grid');
    actions.replaceChildren(
      createAnchor({ href: buildUrl(templates.naver, ticker), title: 'Naver 증권', role: 'MARKET', publisher: 'Naver' }),
      createAnchor({ href: buildUrl(templates.toss, ticker), title: 'Toss 증권', role: 'MARKET', publisher: 'Toss' }),
      createAnchor({ href: buildUrl(templates.fnguide, ticker), title: 'FnGuide / 컨센서스', role: 'MARKET', publisher: 'FnGuide' }),
    );
  }

  function renderOfficialProfile(panel, nodeId, profile) {
    const actions = panel.querySelector('[data-company-link-actions]');
    const classLabel = profile.companyClass === 'IPO_STAGE'
      ? 'IPO STAGE'
      : profile.companyClass === 'STARTUP'
        ? 'STARTUP · PRIVATE'
        : 'PRIVATE / UNLISTED';

    panel.querySelector('[data-company-link-eyebrow]').textContent = 'OFFICIAL COMPANY RESOURCES';
    panel.querySelector('[data-company-link-title]').textContent = profile.nameKo || nodeId;
    panel.querySelector('[data-company-link-market]').textContent = classLabel;
    panel.querySelector('[data-company-link-description]').textContent = `${profile.nameKo || nodeId}의 공식 홈페이지, 반도체 제품·기술, IR·공시 또는 뉴스룸으로 이동합니다.`;
    panel.querySelector('[data-company-link-note]').textContent = '비상장·IPO 단계 기업에는 Naver/Toss/FnGuide 주식 링크를 임의 생성하지 않습니다. DEGRADED 표시는 공식 도메인은 확인됐지만 2026-08-21 자동 점검에서 직접 응답 확인이 제한된 링크입니다.';
    actions.classList.add('is-resource-grid');
    actions.replaceChildren();

    for (const resource of profile.resources || []) {
      actions.append(createAnchor({
        href: resource.url,
        title: resource.title,
        role: resource.role,
        publisher: resource.publisher,
        degraded: resource.availability === 'DEGRADED',
      }));
    }
  }

  function renderGlobalListedProfile(panel, nodeId, profile) {
    const actions = panel.querySelector('[data-company-link-actions]');
    panel.querySelector('[data-company-link-eyebrow]').textContent = 'GLOBAL LISTED COMPANY';
    panel.querySelector('[data-company-link-title]').textContent = profile.name || nodeId;
    panel.querySelector('[data-company-link-market]').textContent = `${profile.exchange} · ${profile.ticker}`;
    panel.querySelector('[data-company-link-description]').textContent = `${profile.name || nodeId}의 공식 IR, 반도체 제품·기술 페이지와 primary listing 기준 시장정보로 이동합니다.`;
    panel.querySelector('[data-company-link-note]').textContent = 'MARKET 링크는 2026-08-21 확인한 primary listing identity를 Google Finance 형식으로 연결한 탐색용 링크입니다. ADR·secondary listing이 있어도 Atlas의 canonical ticker는 primary listing을 유지하며, 외부 링크는 공급관계 evidence를 자동 승격하지 않습니다.';
    actions.classList.add('is-resource-grid');
    actions.replaceChildren();

    for (const resource of profile.resources || []) {
      actions.append(createAnchor({
        href: resource.url,
        title: resource.title,
        role: resource.role,
        publisher: resource.publisher,
        degraded: resource.availability === 'DEGRADED',
        generated: resource.availability === 'GENERATED',
      }));
    }
  }

  function renderForNode() {
    const panel = ensurePanel();
    if (!panel) return;

    const nodeId = document.querySelector('#node-id')?.textContent?.trim() || '';
    const marketProfile = state.marketRegistry?.companies?.[nodeId];
    const officialProfile = state.officialRegistry?.companies?.[nodeId];
    const globalListedProfile = state.globalListedRegistry?.companies?.[nodeId];

    if (marketProfile) {
      renderMarketProfile(panel, nodeId, marketProfile);
    } else if (officialProfile) {
      renderOfficialProfile(panel, nodeId, officialProfile);
    } else if (globalListedProfile) {
      renderGlobalListedProfile(panel, nodeId, globalListedProfile);
    } else {
      panel.hidden = true;
      panel.dataset.nodeId = '';
      return;
    }

    panel.dataset.nodeId = nodeId;
    panel.hidden = false;
  }

  async function loadRegistry(url, validator) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${url} HTTP ${response.status}`);
    const registry = await response.json();
    if (!validator(registry)) throw new Error(`${url} schema mismatch`);
    return registry;
  }

  async function loadRegistries() {
    const [market, official, globalListed] = await Promise.allSettled([
      loadRegistry(marketRegistryUrl, (registry) => registry?.version === 1 && registry.companies && registry.urlTemplates),
      loadRegistry(officialRegistryUrl, (registry) => registry?.version === 1 && registry.companies),
      loadRegistry(globalListedRegistryUrl, (registry) => registry?.version === 1 && registry.companies),
    ]);

    if (market.status === 'fulfilled') state.marketRegistry = market.value;
    else console.warn('[semiconductor-company-links:market]', market.reason);

    if (official.status === 'fulfilled') state.officialRegistry = official.value;
    else console.warn('[semiconductor-company-links:official]', official.reason);

    if (globalListed.status === 'fulfilled') state.globalListedRegistry = globalListed.value;
    else console.warn('[semiconductor-company-links:global-listed]', globalListed.reason);

    renderForNode();
  }

  const observer = new MutationObserver(renderForNode);
  const nodeId = document.querySelector('#node-id');
  const inspector = document.querySelector('#inspector-content');
  if (nodeId) observer.observe(nodeId, { childList: true, characterData: true, subtree: true });
  if (inspector) observer.observe(inspector, { attributes: true, attributeFilter: ['hidden'] });

  loadRegistries();
})();

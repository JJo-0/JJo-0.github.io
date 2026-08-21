(() => {
  const registryUrl = './company-links-korea.json';
  const state = { registry: null, panel: null, lastNodeId: null };

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
    panel.setAttribute('aria-label', '기업 주식 및 리서치 외부 링크');
    panel.innerHTML = `
      <div class="company-link-heading">
        <div>
          <p class="company-link-eyebrow">MARKET / RESEARCH LINKS</p>
          <h3 data-company-link-title>상장기업 정보</h3>
        </div>
        <span class="company-link-market" data-company-link-market></span>
      </div>
      <p class="company-link-description" data-company-link-description></p>
      <div class="company-link-actions">
        <a data-company-link="naver" target="_blank" rel="noopener noreferrer">Naver 증권 <span>↗</span></a>
        <a data-company-link="toss" target="_blank" rel="noopener noreferrer">Toss 증권 <span>↗</span></a>
        <a data-company-link="fnguide" target="_blank" rel="noopener noreferrer">FnGuide / 컨센서스 <span>↗</span></a>
      </div>
      <p class="company-link-note">외부 시세·리서치 페이지는 참고용입니다. Atlas의 공급관계·고객상태와 투자판단을 동일시하지 않습니다.</p>
    `;
    (scoreGrid || inspector.firstElementChild)?.insertAdjacentElement('afterend', panel);
    state.panel = panel;
    return panel;
  }

  function renderForNode() {
    const panel = ensurePanel();
    if (!panel || !state.registry) return;

    const nodeId = document.querySelector('#node-id')?.textContent?.trim() || '';
    if (nodeId === state.lastNodeId && panel.dataset.nodeId === nodeId) return;
    state.lastNodeId = nodeId;

    const profile = state.registry.companies?.[nodeId];
    if (!profile) {
      panel.hidden = true;
      panel.dataset.nodeId = '';
      return;
    }

    const { ticker, exchange, nameKo } = profile;
    const templates = state.registry.urlTemplates || {};
    panel.querySelector('[data-company-link-title]').textContent = nameKo || nodeId;
    panel.querySelector('[data-company-link-market]').textContent = `${exchange} · ${ticker}`;
    panel.querySelector('[data-company-link-description]').textContent = `${nameKo || nodeId} (${ticker})의 시세, 투자자 정보, 재무·컨센서스 페이지로 이동합니다.`;

    for (const channel of ['naver', 'toss', 'fnguide']) {
      const anchor = panel.querySelector(`[data-company-link="${channel}"]`);
      const template = templates[channel];
      if (!anchor || !template) continue;
      anchor.href = buildUrl(template, ticker);
    }

    panel.dataset.nodeId = nodeId;
    panel.hidden = false;
  }

  async function loadRegistry() {
    try {
      const response = await fetch(registryUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`company link registry HTTP ${response.status}`);
      const registry = await response.json();
      if (!registry || registry.version !== 1 || !registry.companies || !registry.urlTemplates) {
        throw new Error('company link registry schema mismatch');
      }
      state.registry = registry;
      renderForNode();
    } catch (error) {
      console.warn('[semiconductor-company-links]', error);
      const panel = ensurePanel();
      if (panel) panel.hidden = true;
    }
  }

  const observer = new MutationObserver(renderForNode);
  const nodeId = document.querySelector('#node-id');
  const inspector = document.querySelector('#inspector-content');
  if (nodeId) observer.observe(nodeId, { childList: true, characterData: true, subtree: true });
  if (inspector) observer.observe(inspector, { attributes: true, attributeFilter: ['hidden'] });

  loadRegistry();
})();

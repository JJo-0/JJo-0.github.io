(() => {
  const registryUrl = './node-resources-equipment-components.json';
  const state = { registry: null, panel: null };

  function ensurePanel() {
    if (state.panel?.isConnected) return state.panel;
    const scoreGrid = document.querySelector('#score-grid');
    const inspector = document.querySelector('#inspector-content');
    if (!inspector) return null;

    const panel = document.createElement('section');
    panel.className = 'company-link-panel component-resource-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', '반도체 장비 핵심부품 외부 기술 링크');
    panel.innerHTML = `
      <div class="company-link-heading">
        <div>
          <p class="company-link-eyebrow">EQUIPMENT COMPONENT RESOURCES</p>
          <h3 data-component-resource-title>장비 핵심부품 자료</h3>
        </div>
        <span class="company-link-market" data-component-resource-scope></span>
      </div>
      <p class="company-link-description" data-component-resource-description></p>
      <div class="company-link-actions is-resource-grid" data-component-resource-actions></div>
      <p class="company-link-note">OFFICIAL은 부품 제조사·공급사의 1차 자료, LEARN은 산업협회·공공기관의 독립 참고자료입니다. 링크는 부품 기능 이해를 위한 것이며 특정 fab/OEM 공급관계나 점유율을 입증하지 않습니다.</p>
    `;
    (scoreGrid || inspector.firstElementChild)?.insertAdjacentElement('afterend', panel);
    state.panel = panel;
    return panel;
  }

  function createAnchor(resource) {
    const anchor = document.createElement('a');
    anchor.href = resource.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.dataset.resourceType = String(resource.type || '').toLowerCase();
    anchor.dataset.resourceRole = resource.role;
    if (resource.availability && resource.availability !== 'VERIFIED') {
      anchor.dataset.resourceAvailability = String(resource.availability).toLowerCase();
    }

    const text = document.createElement('span');
    text.className = 'company-link-resource-text';
    const label = document.createElement('strong');
    label.textContent = resource.title;
    const meta = document.createElement('small');
    meta.className = 'company-link-resource-meta';
    meta.textContent = `${resource.type} · ${resource.role} · ${resource.publisher}`;
    text.append(label, meta);

    const arrow = document.createElement('span');
    arrow.className = 'company-link-arrow';
    arrow.textContent = '↗';
    anchor.append(text, arrow);
    return anchor;
  }

  function renderForNode() {
    const panel = ensurePanel();
    if (!panel || !state.registry) return;

    const nodeId = document.querySelector('#node-id')?.textContent?.trim() || '';
    const profile = state.registry.nodes?.[nodeId];
    if (!profile) {
      panel.hidden = true;
      panel.dataset.nodeId = '';
      return;
    }

    const actions = panel.querySelector('[data-component-resource-actions]');
    const scope = nodeId.startsWith('SEM.AUTO.') ? 'WAFER CARRIER' : 'EQ COMPONENT';
    panel.querySelector('[data-component-resource-title]').textContent = profile.name || nodeId;
    panel.querySelector('[data-component-resource-scope]').textContent = scope;
    panel.querySelector('[data-component-resource-description]').textContent = `${profile.name || nodeId}의 실제 부품·서브시스템과 기술적 역할을 확인하는 외부 자료입니다.`;
    actions.replaceChildren();
    for (const resource of profile.resources || []) actions.append(createAnchor(resource));

    panel.dataset.nodeId = nodeId;
    panel.hidden = false;
  }

  async function loadRegistry() {
    try {
      const response = await fetch(registryUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`equipment component registry HTTP ${response.status}`);
      const registry = await response.json();
      if (!registry || registry.version !== 1 || !registry.nodes) throw new Error('equipment component registry schema mismatch');
      state.registry = registry;
      renderForNode();
    } catch (error) {
      console.warn('[semiconductor-equipment-components]', error);
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

(() => {
  const registryUrl = './node-resources-fe-process.json';
  const hardeningRegistryUrl = './node-resources-fe-process-hardening.json';
  const state = { registry: null, panel: null };

  function ensurePanel() {
    if (state.panel?.isConnected) return state.panel;
    const scoreGrid = document.querySelector('#score-grid');
    const inspector = document.querySelector('#inspector-content');
    if (!inspector) return null;

    const panel = document.createElement('section');
    panel.className = 'company-link-panel node-resource-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', '반도체 공정 및 장비 학습 외부 링크');
    panel.innerHTML = `
      <div class="company-link-heading">
        <div>
          <p class="company-link-eyebrow">PROCESS / EQUIPMENT RESOURCES</p>
          <h3 data-node-resource-title>공정·장비 자료</h3>
        </div>
        <span class="company-link-market" data-node-resource-scope></span>
      </div>
      <p class="company-link-description" data-node-resource-description></p>
      <div class="company-link-actions is-resource-grid" data-node-resource-actions></div>
      <p class="company-link-note">OFFICIAL은 제조사 1차 자료, LEARN은 대학·정부의 중립적 학습자료입니다. 핵심 공정 링크는 DOUBLE-CHECKED overlay를 통과해야 노출되며, 외부 링크만으로 Atlas의 공급관계·고객상태·점유율 evidence가 상향되지는 않습니다.</p>
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

    const actions = panel.querySelector('[data-node-resource-actions]');
    const scope = nodeId.startsWith('SEM.PC') ? 'PROCESS CONTROL' : 'FE PROCESS';
    panel.querySelector('[data-node-resource-title]').textContent = profile.name || nodeId;
    panel.querySelector('[data-node-resource-scope]').textContent = scope;
    panel.querySelector('[data-node-resource-description]').textContent = `${profile.name || nodeId}를 이해하기 위한 제조사 장비·공정 문서와 중립 학습자료입니다.`;
    actions.replaceChildren();
    for (const resource of profile.resources || []) actions.append(createAnchor(resource));

    panel.dataset.nodeId = nodeId;
    panel.hidden = false;
  }

  async function loadJson(url, validator) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${url} HTTP ${response.status}`);
    const registry = await response.json();
    if (!validator(registry)) throw new Error(`${url} schema mismatch`);
    return registry;
  }

  async function loadRegistries() {
    try {
      const [base, hardening] = await Promise.all([
        loadJson(registryUrl, (registry) => registry?.version === 1 && registry.nodes),
        loadJson(hardeningRegistryUrl, (registry) =>
          registry?.version === 1 &&
          registry?.mode === 'REPLACE' &&
          registry?.verification?.status === 'DOUBLE_CHECKED' &&
          registry.nodes
        ),
      ]);

      state.registry = {
        ...base,
        recheckedAt: hardening.recheckedAt,
        verification: hardening.verification,
        nodes: { ...base.nodes, ...hardening.nodes },
      };
      renderForNode();
    } catch (error) {
      console.warn('[semiconductor-process-resources]', error);
      state.registry = null;
      const panel = ensurePanel();
      if (panel) panel.hidden = true;
    }
  }

  const observer = new MutationObserver(renderForNode);
  const nodeId = document.querySelector('#node-id');
  const inspector = document.querySelector('#inspector-content');
  if (nodeId) observer.observe(nodeId, { childList: true, characterData: true, subtree: true });
  if (inspector) observer.observe(inspector, { attributes: true, attributeFilter: ['hidden'] });

  loadRegistries();
})();

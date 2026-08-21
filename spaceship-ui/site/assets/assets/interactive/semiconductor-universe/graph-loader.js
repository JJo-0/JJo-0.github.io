(() => {
  const nativeFetch = window.fetch.bind(window);
  const palette = {
    SEM: '#f8fafc', DEM: '#58a6ff', PROD: '#8b5cf6', DESIGN: '#d946ef',
    WAF: '#14b8a6', MASK: '#22c55e', FE: '#f59e0b', PC: '#ef4444',
    MAT: '#06b6d4', EQCOMP: '#f97316', FAB: '#84cc16', AUTO: '#64748b',
    PKG: '#ec4899', TEST: '#a855f7', HBM: '#fb7185', SERVICE: '#94a3b8',
    COMPANY: '#38bdf8', GEO: '#a78bfa',
  };

  window.fetch = async (input, init) => {
    const requested = new URL(typeof input === 'string' ? input : input.url, window.location.href);
    if (!requested.pathname.endsWith('/graph.json')) return nativeFetch(input, init);

    const response = await nativeFetch(input, init);
    if (!response.ok) return response;
    const manifest = await response.clone().json();
    if (Array.isArray(manifest.nodes) && Array.isArray(manifest.edges)) return response;

    const load = async (file) => {
      const chunkResponse = await nativeFetch(new URL(file, requested), init);
      if (!chunkResponse.ok) throw new Error(`${file} HTTP ${chunkResponse.status}`);
      return chunkResponse.json();
    };
    const [nodeChunks, edgeChunks] = await Promise.all([
      Promise.all((manifest.nodeFiles || []).map(load)),
      Promise.all((manifest.edgeFiles || []).map(load)),
    ]);
    const nodeRows = nodeChunks.flat();
    const edgeRows = edgeChunks.flat();
    const ids = nodeRows.map((row) => row[0]);
    const nodes = nodeRows.map((row) => {
      const group = manifest.groups[row[5]];
      const kind = manifest.kinds[row[6]];
      const node = {
        id: row[0],
        label: row[1],
        labelKo: row[2],
        parent: row[3] >= 0 ? ids[row[3]] : null,
        depth: row[4],
        group,
        kind,
        status: manifest.statuses[row[7]],
        evidence: manifest.evidences[row[8]],
        coverage: manifest.coverages[row[9]],
        importance: row[10],
        chokepoint: row[11],
        aiHbm: row[12],
        koreaGap: row[13],
        color: palette[group] || '#94a3b8',
        description: `${row[1]} — ${group} ${kind} node. Supplier, customer, market-share and qualification evidence remains node-specific.`,
      };
      if (row[14] >= 0) node.region = manifest.regions[row[14]];
      if (row[15] >= 0) node.customerStatus = manifest.customerStatuses[row[15]];
      return node;
    });
    const edges = edgeRows.map((row) => ({
      source: ids[row[0]],
      target: ids[row[1]],
      relation: manifest.relations[row[2]],
      status: manifest.statuses[row[3]],
    }));
    const graph = { ...manifest, nodes, edges };
    return new Response(JSON.stringify(graph), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  };

  if (!document.querySelector('link[data-semiconductor-company-links]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './company-links.css';
    stylesheet.dataset.semiconductorCompanyLinks = 'true';
    document.head.append(stylesheet);
  }

  if (!document.querySelector('script[data-semiconductor-company-links]')) {
    const runtime = document.createElement('script');
    runtime.src = './company-link-runtime.js';
    runtime.dataset.semiconductorCompanyLinks = 'true';
    document.head.append(runtime);
  }
})();

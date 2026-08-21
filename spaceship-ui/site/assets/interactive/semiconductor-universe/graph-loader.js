(() => {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const requested = new URL(typeof input === 'string' ? input : input.url, window.location.href);
    if (!requested.pathname.endsWith('/graph.json')) return nativeFetch(input, init);

    const response = await nativeFetch(input, init);
    if (!response.ok) return response;
    const manifest = await response.clone().json();
    if (Array.isArray(manifest.nodes) && Array.isArray(manifest.edges)) return response;

    const nodeFiles = Array.isArray(manifest.nodeFiles) ? manifest.nodeFiles : [];
    const edgeFiles = Array.isArray(manifest.edgeFiles) ? manifest.edgeFiles : [];
    const load = async (file) => {
      const chunkResponse = await nativeFetch(new URL(file, requested), init);
      if (!chunkResponse.ok) throw new Error(`${file} HTTP ${chunkResponse.status}`);
      return chunkResponse.json();
    };
    const [nodeChunks, edgeChunks] = await Promise.all([
      Promise.all(nodeFiles.map(load)),
      Promise.all(edgeFiles.map(load)),
    ]);
    const graph = { ...manifest, nodes: nodeChunks.flat(), edges: edgeChunks.flat() };
    return new Response(JSON.stringify(graph), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  };
})();

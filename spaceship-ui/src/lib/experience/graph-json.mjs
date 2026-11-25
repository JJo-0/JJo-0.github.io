export function serializeGraphPayload(graph) {
  // Store repeated edge explanations once in transit; restore each edge below.
  const edgeReasonSets = [];
  const reasonIndices = new Map();
  const edges = graph.edges.map(({source, target, weight, reasons}) => {
    const key = JSON.stringify(reasons);
    if (!reasonIndices.has(key)) {
      reasonIndices.set(key, edgeReasonSets.length);
      edgeReasonSets.push(reasons);
    }
    return [source, target, weight, reasonIndices.get(key)];
  });
  const payload = {...graph, edgeEncoding: 'tuple-v2', edgeReasonSets, edges};
  return JSON.stringify(payload).replace(/</g, () => String.fromCharCode(92) + 'u003c');
}

export function parseGraphPayload(value) {
  const payload = JSON.parse(value);
  if (payload?.edgeEncoding !== 'tuple-v1' && payload?.edgeEncoding !== 'tuple-v2') return payload;
  const {edgeEncoding, ...graph} = payload;
  if (edgeEncoding === 'tuple-v1') {
    return {...graph, edges: graph.edges.map(([source, target, weight, reasons]) => (
      {source, target, weight, reasons}
    ))};
  }
  const {edgeReasonSets, ...decodedGraph} = graph;
  return {...decodedGraph, edges: decodedGraph.edges.map(([source, target, weight, reasonIndex]) => (
    {source, target, weight, reasons: edgeReasonSets[reasonIndex].slice()}
  ))};
}

export function serializeGraphPayload(graph) {
  // Omit repeated edge property names in transit, not graph information.
  const payload = {...graph, edgeEncoding: 'tuple-v1', edges: graph.edges.map(
    ({source, target, weight, reasons}) => [source, target, weight, reasons]
  )};
  return JSON.stringify(payload).replace(/</g, () => String.fromCharCode(92) + 'u003c');
}

export function parseGraphPayload(value) {
  const payload = JSON.parse(value);
  if (payload?.edgeEncoding !== 'tuple-v1') return payload;
  const {edgeEncoding, ...graph} = payload;
  return {...graph, edges: graph.edges.map(([source, target, weight, reasons]) => (
    {source, target, weight, reasons}
  ))};
}

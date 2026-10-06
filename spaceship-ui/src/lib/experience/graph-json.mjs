export function serializeGraphPayload(graph) {
  return JSON.stringify(graph).replace(/</g, () => String.fromCharCode(92) + 'u003c');
}

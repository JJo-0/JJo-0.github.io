import {
  atlasViewport, graphEdgeAppearance, graphEdgeStops, graphNodeVisual,
  graphStar, graphStarOpacity, graphStarSize, projectAtlas,
} from './graph-visuals.mjs';

// Percentage coordinates use the same square as the interactive projection.
// The root has no viewBox so stroke widths, dash lengths and glyph sizes stay
// in CSS pixels even on a narrow phone. No post text is embedded in the image.
/** @param {import('./post-graph').PostGraph} graph @param {boolean} dark */
export function renderAtlasPreview(graph, dark) {
  const size = 1000;
  const { centerX, centerY, diameter } = atlasViewport(size, size);
  const percent = (/** @type {number} */ value, /** @type {number} */ center) =>
    ((value - center) * 100 / diameter + 50).toFixed(3) + '%';
  const nodes = new Map(graph.nodes.map(node => [node.id, node]));
  const points = projectAtlas(graph.nodes, size, size, -0.34, 0.18).map(point => {
    const node = nodes.get(point.id);
    if (!node) throw new Error('Missing projected graph node');
    return {
      x: percent(point.x, centerX), y: percent(point.y, centerY),
      z: point.z, id: point.id, category: node.category, ink: graphNodeVisual(node), strength: 0,
    };
  });
  const byId = new Map(points.map(point => [point.id, point]));
  const theme = dark ? 'dark' : 'light';
  const defs = [], lines = [];
  for (const edge of graph.edges) {
    const a = byId.get(edge.source), b = byId.get(edge.target);
    if (!a || !b) continue;
    a.strength += edge.weight;
    b.strength += edge.weight;
    const { opacity, width } = graphEdgeAppearance((a.z + b.z) / 2, edge.weight);
    const coordinates = `x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"`;
    let stroke = a.ink[theme];
    if (stroke !== b.ink[theme]) {
      const id = 'g' + defs.length;
      const stops = graphEdgeStops(a.ink, b.ink).map(stop =>
        `<stop offset="${stop.offset.toFixed(4)}" stop-color="${stop[theme]}"/>`
      ).join('');
      defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" ${coordinates}>${stops}</linearGradient>`);
      stroke = `url(#${id})`;
    }
    const dash = a.category === b.category ? '' : ' stroke-dasharray="2.3 3.2"';
    lines.push(`<line ${coordinates} stroke="${stroke}" opacity="${opacity.toFixed(3)}" stroke-width="${width.toFixed(2)}"${dash}/>`);
  }

  const stars = points.sort((a, b) => a.z - b.z).map(point => {
    const magnitude = graphStarSize(point.z, point.strength).toFixed(1);
    return `<text x="${point.x}" y="${point.y}" font-size="${magnitude}" fill="${point.ink[theme]}" opacity="${graphStarOpacity(point.z).toFixed(3)}">${graphStar(point.strength)}</text>`;
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs>' +
    defs.join('') + '</defs><g stroke-linecap="round">' + lines.join('') +
    '</g><g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-weight="500" text-anchor="middle" dominant-baseline="central">' +
    stars.join('') + '</g></svg>';
}

import {
  atlasViewport, atlasProjectionRadius, atlasProjector, graphEdgeAppearance, graphEdgeStops,
  graphNodeVisual, graphStar, graphStarOpacity, graphStarSize,
} from './graph-visuals.mjs';
import { bundleAtlas, traceAtlasEdge } from './atlas-sphere.mjs';

/** @param {import('./post-graph').PostGraph} graph @param {boolean} dark */
export function renderAtlasPreview(graph, dark) {
  const size = 480;
  const viewport = atlasViewport(size, size);
  const projectWorld = atlasProjector(size, size, -.34, .18, atlasProjectionRadius(graph.nodes));
  /** @param {{x:number,y:number,z:number}} pos */
  const project = pos => {
    const p = projectWorld(pos);
    return {x:(p.x-viewport.centerX)*size/viewport.diameter + size/2,
      y:(p.y-viewport.centerY)*size/viewport.diameter + size/2, z:p.z};
  };
  const hierarchy = bundleAtlas(graph.nodes);
  const points = new Map(graph.nodes.map(node => [node.id, {
    node, ...project(node), ink:graphNodeVisual(node), strength:0,
  }]));
  const theme = dark ? 'dark' : 'light';
  const defs = [], lines = [];
  for (const [index, edge] of graph.edges.entries()) {
    const a=points.get(edge.source), b=points.get(edge.target);
    if (!a || !b) continue;
    a.strength += edge.weight; b.strength += edge.weight;
    const {opacity, width} = graphEdgeAppearance((a.z+b.z)/2,edge.weight);
    let stroke=a.ink[theme];
    if (stroke!==b.ink[theme]) {
      const id='g'+index;
      const stops=graphEdgeStops(a.ink,b.ink).map(s =>
        `<stop offset="${s.offset.toFixed(4)}" stop-color="${s[theme]}"/>`
      ).join('');
      defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}">${stops}</linearGradient>`);
      stroke='url(#'+id+')';
    }
    const bridge = a.node.category!==b.node.category;
    /** @type {string[]} */ const marks=[];
    let previousX=0, previousY=0;
    // Use relative movements for interior marks. Short repeated commands
    // compress well in the static first paint on a cold mobile connection.
    traceAtlasEdge(hierarchy.route(a.node,b.node).map(project),bridge,false,(x,y,dx,dy) => {
      const absolute = marks.length === 0 || (x===b.x && y===b.y);
      // A one-pixel lattice is enough for interior monospace strokes at 480px.
      // Keep subpixel accuracy where the paths meet article stars.
      const precision = absolute ? 10 : 1;
      const sx = Math.round(x*precision)*(10/precision), sy = Math.round(y*precision)*(10/precision);
      const vx = Math.round(dx*10), vy = Math.round(dy*10);
      const mark = !vy ? 'h'+vx/10 : !vx ? 'v'+vy/10 : 'l'+vx/10+' '+vy/10;
      marks.push((absolute?'M':'m') + (sx-(absolute?0:previousX))/10 + ' ' + (sy-(absolute?0:previousY))/10 + mark);
      previousX=sx+vx; previousY=sy+vy;
    });
    const dash=bridge?' stroke-dasharray="2.3 3.2"':'';
    lines.push(`<path data-edge="${index}" d="${marks.join('')}" stroke="${stroke}" stroke-width="${width.toFixed(2)}" opacity="${opacity.toFixed(3)}"${dash}/>`);
  }
  const stars = [...points.values()].sort((a,b)=>a.z-b.z).map(p =>
    `<text x="${(100*p.x/size).toFixed(3)}%" y="${(100*p.y/size).toFixed(3)}%" font-size="${graphStarSize(p.z,p.strength).toFixed(1)}" fill="${p.ink[theme]}" opacity="${graphStarOpacity(p.z).toFixed(3)}">${graphStar(p.strength)}</text>`);
  // The nested viewBox positions bundled strokes. Star type stays in CSS pixels.
  return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">' +
    `<svg width="100%" height="100%" viewBox="0 0 ${size} ${size}"><defs>` + defs.join('') +
    '</defs><g fill="none" stroke-linecap="round">' + lines.join('') +
    '</g></svg><g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-weight="500" text-anchor="middle" dominant-baseline="central">' +
    stars.join('')+'</g></svg>';
}

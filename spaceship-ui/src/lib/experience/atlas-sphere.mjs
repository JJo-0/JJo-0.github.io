/** @typedef {{x:number,y:number,z:number}} Point */
/** @typedef {Point & {id:string, category:string, subcategory?:string}} AtlasNode */
/** @param {Point} a @param {Point} b @param {number} t */
function mix(a, b, t) {
  return {x: a.x + (b.x-a.x)*t, y: a.y + (b.y-a.y)*t, z: a.z + (b.z-a.z)*t};
}
/** @param {AtlasNode[]} members @param {number} radius */
function center(members, radius) {
  const sum = {x: 0, y: 0, z: 0};
  for (const n of members) { sum.x += n.x; sum.y += n.y; sum.z += n.z; }
  const source = Math.hypot(sum.x, sum.y, sum.z) > 1e-6 ? sum : members[0];
  const scale = radius / (Math.hypot(source.x, source.y, source.z) || 1);
  return {x: source.x*scale, y: source.y*scale, z: source.z*scale};
}
/** @param {AtlasNode[]} nodes */
export function bundleAtlas(nodes) {
  /** @type {Map<string,AtlasNode[]>} */ const fields = new Map();
  /** @type {Map<string,AtlasNode[]>} */ const subfields = new Map();
  /** @param {AtlasNode} n */
  const subkey = n => JSON.stringify([n.category, n.subcategory || '']);
  for (const n of nodes) {
    if (!fields.has(n.category)) fields.set(n.category, []);
    if (!subfields.has(subkey(n))) subfields.set(subkey(n), []);
    fields.get(n.category)?.push(n); subfields.get(subkey(n))?.push(n);
  }
  const radius = nodes.reduce((max, n) => Math.max(max, Math.hypot(n.x,n.y,n.z)), .1);
  const axes = new Map([...fields].map(([name,members]) => [name, center(members, radius*.65)]));
  const groups = new Map([...subfields].map(([name,members]) => [name, center(members, radius*.82)]));
  /** @param {AtlasNode} a @param {AtlasNode} b */
  function route(a, b) {
    const ag = groups.get(subkey(a)), bg = groups.get(subkey(b));
    const af = axes.get(a.category), bf = axes.get(b.category);
    if (!ag || !bg || !af || !bf) return [a, b];
    const path = [a, ag];
    if (ag !== bg) {
      path.push(af);
      if (af !== bf) path.push({x:0,y:0,z:0}, bf);
      path.push(bg);
    }
    path.push(b);
    let points = path.map((p, i) => mix(mix(a, b, i/(path.length-1)), p, .84));
    for (let step = 0; step < 2; step++) {
      const smooth = [points[0]];
      for (let i = 1; i < points.length; i++) {
        smooth.push(mix(points[i-1],points[i],.25), mix(points[i-1],points[i],.75));
      }
      smooth.push(points[points.length-1]); points = smooth;
    }
    return points;
  }
  return {axes, route};
}

/** The same tangent-quantized ASCII ink is used by SVG and Canvas.
 * @param {Point[]} points @param {boolean} bridge @param {boolean} selected
 * @param {(x:number,y:number,dx:number,dy:number)=>void} write */
export function traceAtlasEdge(points, bridge, selected, write) {
  if (!points.length) return;
  const step = selected ? 4.1 : bridge ? 6.5 : 5.4;
  const half = selected ? 1.6 : 1.15;
  let remaining = step, mark = 0;
  write(points[0].x, points[0].y, .22, 0);
  for (let i=1; i < points.length; i++) {
    const a=points[i-1], b=points[i];
    const vx=b.x-a.x, vy=b.y-a.y, length=Math.hypot(vx,vy);
    if (length<1e-9) continue;
    for (; remaining < length; remaining += step) {
      const t=remaining/length;
      let dx=.20, dy=0;
      if (mark++ % 3 === 0) {
        if (Math.abs(vy) < Math.abs(vx)*.4) dx=half;
        else if (Math.abs(vx) < Math.abs(vy)*.4) { dx=0; dy=half; }
        else { dx=half*.71; dy=Math.sign(vx*vy)*dx; }
      }
      write(a.x+vx*t-dx/2, a.y+vy*t-dy/2, dx, dy);
    }
    remaining -= length;
  }
  const last=points[points.length-1];
  write(last.x, last.y, .22, 0);
}

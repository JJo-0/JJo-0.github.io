// Self-contained because the browser audit evaluates this function through CDP.
// This samples geometry only: it never activates a link or retries trusted input.
export async function stableCitationPoint(selector) {
  await document.fonts.ready;
  const started = performance.now();
  const samples = [];
  let previous = null, previousNode = null, stable = 0;
  const paint = async () => {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await new Promise(resolve => setTimeout(resolve, 50));
  };
  while (performance.now() - started < 2500) {
    // A native Back can replace the article after our initial query. Never keep
    // a detached node across samples, nor carry stability across node identity.
    const a = document.querySelector(selector);
    if (!a) {
      samples.push({elapsed:performance.now()-started,missing:true,path:location.pathname,hash:location.hash,readyState:document.readyState});
      previous = previousNode = null;
      stable = 0;
      await paint();
      continue;
    }
    a.scrollIntoView({block:'center',behavior:'instant'});
    await paint();
    const r = a.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x,y);
    const currentNode = document.querySelector(selector) === a;
    const ready = a.isConnected && currentNode && r.width > 0 && r.height > 0 && (hit === a || a.contains(hit));
    const current = {x,y,scrollY,documentHeight:document.documentElement.scrollHeight};
    const unchanged = previousNode === a && previous && Object.keys(current).every(k=>Math.abs(current[k]-previous[k]) < 0.5);
    stable = ready && unchanged ? stable + 1 : 0;
    samples.push({...current,elapsed:performance.now()-started,connected:a.isConnected,currentNode,sameNode:previousNode===a,ready,stableSamples:ready?stable+1:0,hit:hit?.tagName || null,path:location.pathname,hash:location.hash,base:document.baseURI,readyState:document.readyState});
    if (stable >= 2 && performance.now() - started < 2500) return {...current,ready,stableSamples:stable+1,
      resolvedPath:new URL(a.href).pathname,currentPath:location.pathname,html:a.outerHTML,samples};
    previous = ready ? current : null;
    previousNode = ready ? a : null;
  }
  return {ready:false,stableSamples:0,error:'Citation geometry did not stabilize before trusted input',currentPath:location.pathname,samples};
}

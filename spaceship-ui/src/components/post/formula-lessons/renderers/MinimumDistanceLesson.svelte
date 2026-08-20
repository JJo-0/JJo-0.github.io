<script>
 import { computeMinimumDistanceLesson } from '@/lib/formula-lessons/minimum-distance.mjs';
 export let lesson; export let spec;
 let qx=spec.query[0], qy=spec.query[1];
 $: query=[Number(qx),Number(qy)]; $: result=computeMinimumDistanceLesson({classes:spec.classes,query});
 const f=(v,d=3)=>Number(v).toFixed(d);
 const px=(x)=>160+105*x, py=(y)=>150-80*y;
</script>
<div class="grid" data-minimum-distance-lesson data-focus={lesson.focus}>
<section class="panel"><p class="eyebrow">Prototype geometry</p><svg viewBox="0 0 320 300" role="img" aria-label="two class prototypes, query, and perpendicular bisector">
 <line x1="20" y1="150" x2="300" y2="150"/><line x1="160" y1="20" x2="160" y2="280"/>
 {#each spec.classes as points,ci}{#each points as p}<circle cx={px(p[0])} cy={py(p[1])} r="4" class={`c${ci}`}/>{/each}{/each}
 {#each result.prototypes as p,ci}<circle cx={px(p[0])} cy={py(p[1])} r="9" class={`prototype c${ci}`}/>{/each}
 <circle cx={px(query[0])} cy={py(query[1])} r="7" class="query"/>
 {#if Math.abs(result.boundary.normal[1])>1e-9}
 <line x1="20" y1={py((-result.boundary.offset-result.boundary.normal[0]*((20-160)/105))/result.boundary.normal[1])} x2="300" y2={py((-result.boundary.offset-result.boundary.normal[0]*((300-160)/105))/result.boundary.normal[1])} class="boundary"/>
 {/if}
 </svg></section>
<section class="panel"><p class="eyebrow">D_c(x) and d_c(x)</p><h6>Prediction: class {result.predictedByDistance+1}</h6>
 {#each result.prototypes as p,i}<div class="row"><strong>class {i+1} m</strong><span>[{p.map(v=>f(v,2)).join(', ')}]</span><span>D={f(result.distances[i])}</span><span>d={f(result.discriminants[i])}</span></div>{/each}
 <label>x₁ <output>{f(qx,2)}</output><input bind:value={qx} type="range" min="-1.8" max="1.8" step="0.05"/></label>
 <label>x₂ <output>{f(qy,2)}</output><input bind:value={qy} type="range" min="-1.5" max="1.5" step="0.05"/></label>
 <div class="check">midpoint boundary residual = {f(result.boundary.midpointResidual,8)}<br/>distance and discriminant agree: {result.predictedByDistance===result.predictedByDiscriminant?'PASS':'FAIL'}</div>
</section></div>
<style>
.grid{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}.panel{border:1px solid var(--color-border);border-radius:1rem;background:var(--color-background);padding:1rem}.eyebrow{margin:0;font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--color-muted-foreground)}h6{margin:.25rem 0 .6rem}svg{width:100%;max-height:19rem}svg line{stroke:var(--color-border)}circle.c0{fill:#0ea5e9}circle.c1{fill:#f97316}.prototype{stroke:var(--color-foreground);stroke-width:2}.query{fill:#7c3aed}.boundary{stroke:var(--color-primary);stroke-width:2;stroke-dasharray:6 5}.row{display:grid;grid-template-columns:1fr 1.2fr .8fr .8fr;gap:.3rem;padding:.45rem 0;border-bottom:1px solid var(--color-border);font-size:.72rem}.panel label{display:grid;grid-template-columns:1fr auto;gap:.2rem;margin-top:.7rem;font-size:.73rem;font-weight:800}.panel input{grid-column:1/-1;min-height:30px}.check{margin-top:.7rem;border-radius:.7rem;background:var(--color-muted);padding:.65rem;font-size:.72rem;line-height:1.6}@media(max-width:760px){.grid{grid-template-columns:1fr}.row{grid-template-columns:1fr 1fr}}
</style>

<script>
 import { computeGaussianHierarchy, gaussian1dDensity } from '@/lib/formula-lessons/gaussian-discriminant.mjs';
 export let lesson; export let spec;
 let qx=spec.x[0],qy=spec.x[1];
 $: x=[Number(qx),Number(qy)];
 $: result=computeGaussianHierarchy({x,means:spec.means,covariances:spec.covariances,sharedCovariance:spec.sharedCovariance,priors:spec.priors});
 $: density1=gaussian1dDensity(spec.oneDim.x,spec.oneDim.means[0],spec.oneDim.sigmas[0]);
 $: density2=gaussian1dDensity(spec.oneDim.x,spec.oneDim.means[1],spec.oneDim.sigmas[1]);
 const f=(v,d=4)=>Number(v).toFixed(d);
</script>
<div class="grid" data-gaussian-discriminant-lesson data-focus={lesson.focus}>
<section class="panel"><p class="eyebrow">QDA → LDA → minimum-distance</p><table><thead><tr><th>rule</th><th>S1</th><th>S2</th><th>winner</th></tr></thead><tbody>
<tr><td>QDA</td>{#each result.qda as v,i (i)}<td>{f(v)}</td>{/each}<td>S{result.qdaClass+1}</td></tr>
<tr><td>LDA(shared V)</td>{#each result.lda as v,i (i)}<td>{f(v)}</td>{/each}<td>S{result.ldaClass+1}</td></tr>
<tr><td>V=I, equal prior</td>{#each result.minimumDistance as v,i (i)}<td>{f(v)}</td>{/each}<td>S{result.minimumDistanceClass+1}</td></tr>
</tbody></table><div class="check">identity-LDA − minimum-distance = [{result.identityOffsets.map(v=>f(v,6)).join(', ')}] (same common constant)</div></section>
<section class="panel"><p class="eyebrow">Move x in the same source symbols</p>
<label>x₁ <output>{f(qx,2)}</output><input bind:value={qx} type="range" min="-2" max="2" step="0.05"/></label><label>x₂ <output>{f(qy,2)}</output><input bind:value={qy} type="range" min="-2" max="2" step="0.05"/></label>
<div class="density"><strong>1D corrected density at x={spec.oneDim.x}</strong><span>S1 {f(density1)} · S2 {f(density2)}</span></div></section></div>
<aside class="note"><strong>Source correction gate.</strong> MAI-P2-087 is kept as <em>source-suspect</em> because the printed exponent lacks the square on (x−m). The numerical density shown here follows MAI-P2-088, the registered corrected variant. QDA uses class-specific covariance; shared covariance yields LDA; identity covariance plus equal priors reduces to the minimum-distance discriminant.</aside>
<style>
.grid{display:grid;grid-template-columns:1.2fr .8fr;gap:.8rem}.panel,.note{border:1px solid var(--color-border);border-radius:1rem;background:var(--color-background);padding:1rem}.eyebrow{margin:0;font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--color-muted-foreground)}table{width:100%;border-collapse:collapse;font-size:.72rem}th,td{padding:.5rem;border-bottom:1px solid var(--color-border);text-align:right}th:first-child,td:first-child{text-align:left}.check,.density{margin-top:.7rem;border-radius:.7rem;background:var(--color-muted);padding:.65rem;font-size:.72rem}.panel label{display:grid;grid-template-columns:1fr auto;gap:.2rem;margin-top:.7rem;font-size:.73rem;font-weight:800}.panel input{grid-column:1/-1;min-height:30px}.density{display:grid;gap:.3rem}.note{margin-top:.8rem;font-size:.74rem;line-height:1.65}@media(max-width:760px){.grid{grid-template-columns:1fr}}
</style>

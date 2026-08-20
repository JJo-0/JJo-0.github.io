<script>
 import { computeBayesLesson } from '@/lib/formula-lessons/bayes.mjs';
 export let lesson; export let spec;
 let l1=spec.likelihoods[0],l2=spec.likelihoods[1],l3=spec.likelihoods[2];
 $: likelihoods=[Number(l1),Number(l2),Number(l3)];
 $: result=computeBayesLesson({likelihoods,priors:spec.priors,lossMatrix:spec.lossMatrix});
 const f=(v,d=4)=>Number(v).toFixed(d);
</script>
<div class="grid" data-bayes-decision-lesson data-focus={lesson.focus}>
<section class="panel"><p class="eyebrow">likelihood × prior → evidence → posterior</p><h6>p(x)={f(result.evidence)}</h6>
 {#each result.posterior as p,i (i)}<div class="posterior"><span>S{i+1}</span><i style={`width:${p*100}%`}></i><strong>{f(p)}</strong></div>{/each}
 <div class="sum">Σ posterior = {f(result.posteriorSum,8)} · MAP = S{result.mapClass+1}</div>
</section>
<section class="panel"><p class="eyebrow">Conditional risk</p><table><thead><tr><th>action</th><th>0–1 R</th><th>custom R</th></tr></thead><tbody>{#each result.zeroOne.risks as risk,i (i)}<tr><td>a{i+1}</td><td>{f(risk)}</td><td>{f(result.custom.risks[i])}</td></tr>{/each}</tbody></table>
 <p class="winner">0–1 best: a{result.zeroOne.bestAction+1} · custom best: a{result.custom.bestAction+1}</p>
 <label>p(x|S1) <output>{f(l1,2)}</output><input bind:value={l1} type="range" min="0.05" max="0.95" step="0.01"/></label>
 <label>p(x|S2) <output>{f(l2,2)}</output><input bind:value={l2} type="range" min="0.05" max="0.95" step="0.01"/></label>
 <label>p(x|S3) <output>{f(l3,2)}</output><input bind:value={l3} type="range" min="0.05" max="0.95" step="0.01"/></label>
</section></div>
<aside class="note"><strong>Source/editorial distinction.</strong> MAI-P2-066 and 075 deliberately preserve the PDF’s <code>??</code>. MAI-P2-067 and 076 are the separately registered editorial completions. The source writes risk indices in a nonstandard order; this numerical scene uses the conventional matrix convention “row = chosen action, column = true class” and labels that choice explicitly.</aside>
<style>
.grid{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}.panel,.note{border:1px solid var(--color-border);border-radius:1rem;background:var(--color-background);padding:1rem}.eyebrow{margin:0;font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--color-muted-foreground)}h6{margin:.25rem 0 .8rem}.posterior{display:grid;grid-template-columns:2rem 1fr 4.2rem;gap:.4rem;align-items:center;margin:.45rem 0;font-size:.73rem}.posterior i{height:.8rem;border-radius:99px;background:var(--color-primary)}.sum,.winner{border-radius:.7rem;background:var(--color-muted);padding:.65rem;font-size:.72rem}table{width:100%;border-collapse:collapse;font-size:.73rem}th,td{padding:.45rem;border-bottom:1px solid var(--color-border);text-align:right}th:first-child,td:first-child{text-align:left}.panel label{display:grid;grid-template-columns:1fr auto;gap:.2rem;margin-top:.55rem;font-size:.72rem;font-weight:800}.panel input{grid-column:1/-1;min-height:30px}.note{margin-top:.8rem;font-size:.74rem;line-height:1.65}@media(max-width:760px){.grid{grid-template-columns:1fr}}
</style>

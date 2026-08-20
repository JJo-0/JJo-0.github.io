<script>
 import { computeNaiveBayes } from '@/lib/formula-lessons/naive-dimension.mjs';
 export let lesson; export let spec;
 let prior1=spec.priors[0]; $: priors=[Number(prior1),1-Number(prior1)];
 $: result=computeNaiveBayes({featureLikelihoods:spec.featureLikelihoods,priors});
 const f=(v,d=5)=>Number(v).toFixed(d);
</script>
<div class="grid" data-naive-bayes-lesson data-focus={lesson.focus}>
<section class="panel"><p class="eyebrow">Conditional independence product</p><table><thead><tr><th>class</th><th>∏ p(xₙ|S)</th><th>× prior</th><th>posterior</th></tr></thead><tbody>{#each result.posterior as p,i}<tr><td>S{i+1}</td><td>{f(result.likelihoodProducts[i])}</td><td>{f(result.scoresWithPrior[i])}</td><td>{f(p)}</td></tr>{/each}</tbody></table><div class="check">Σ posterior={f(result.posteriorSum,8)} · predicted S{result.predictedClass+1}</div></section>
<section class="panel"><p class="eyebrow">Prior matters</p><label>P(S1) <output>{f(prior1,2)}</output><input bind:value={prior1} type="range" min="0.05" max="0.95" step="0.01" /></label><p class="small">Without prior: [{result.scoresWithoutPrior.map(v=>f(v)).join(', ')}]<br/>With prior: [{result.scoresWithPrior.map(v=>f(v)).join(', ')}]</p></section></div>
<aside class="note">MAI-P2-102 preserves the printed proportionality that omits the class prior. MAI-P2-103 is the corrected general MAP form. Moving the prior above demonstrates exactly when omitting it can change the class ranking.</aside>
<style>
.grid{display:grid;grid-template-columns:1.2fr .8fr;gap:.8rem}.panel,.note{border:1px solid var(--color-border);border-radius:1rem;background:var(--color-background);padding:1rem}.eyebrow{margin:0;font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--color-muted-foreground)}table{width:100%;border-collapse:collapse;font-size:.72rem}th,td{padding:.5rem;border-bottom:1px solid var(--color-border);text-align:right}th:first-child,td:first-child{text-align:left}.check,.small{border-radius:.7rem;background:var(--color-muted);padding:.65rem;font-size:.72rem}.panel label{display:grid;grid-template-columns:1fr auto;gap:.2rem;font-size:.73rem;font-weight:800}.panel input{grid-column:1/-1;min-height:30px}.note{margin-top:.8rem;font-size:.74rem;line-height:1.6}@media(max-width:760px){.grid{grid-template-columns:1fr}}
</style>

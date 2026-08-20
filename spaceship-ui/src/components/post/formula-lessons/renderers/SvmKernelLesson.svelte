<script>
  import { computeSvmKernelLesson } from '@/lib/formula-lessons/svm-kernel.mjs';
  export let lesson; export let spec;
  let q1=spec.query[0], q2=spec.query[1], sigma=spec.sigma;
  $: query=[Number(q1),Number(q2)];
  $: result=computeSvmKernelLesson({query,supportVectors:spec.supportVectors,alphas:spec.alphas,bias:spec.bias,sigma:Number(sigma)});
  const f=(v,d=3)=>Number(v).toFixed(d);
</script>
<div class="lesson-grid" data-svm-kernel-lesson data-focus={lesson.focus}>
  <section class="panel">
    <p class="eyebrow">Linear score → probability view</p>
    <h6>f(x)={f(result.linearScore)} · σ(f)={f(result.sigmoidAtLinearScore)}</h6>
    <div class="scorebar"><span style={`width:${Math.max(2,Math.min(98,result.sigmoidAtLinearScore*100))}%`}></span></div>
    <table><thead><tr><th>support</th><th>αₗ xᵀxₗ</th><th>αₗ κ(x,xₗ)</th></tr></thead><tbody>
      {#each result.linearContributions as value,i}<tr><td>{i+1}</td><td>{f(value)}</td><td>{f(result.kernelContributions[i])}</td></tr>{/each}
    </tbody><tfoot><tr><th>score+b</th><th>{f(result.linearScore)}</th><th>{f(result.kernelScore)}</th></tr></tfoot></table>
  </section>
  <section class="panel controls">
    <p class="eyebrow">Symbols in the source equations</p><h6>x and Gaussian σ</h6>
    <label>x₁ <output>{f(q1,2)}</output><input bind:value={q1} type="range" min="-1.5" max="1.5" step="0.05" /></label>
    <label>x₂ <output>{f(q2,2)}</output><input bind:value={q2} type="range" min="-1.5" max="1.5" step="0.05" /></label>
    <label>σ <output>{f(sigma,2)}</output><input bind:value={sigma} type="range" min="0.25" max="1.5" step="0.05" /></label>
    {#if result.featureIdentity}<div class="identity"><strong>κ(u,v)=φ(u)ᵀφ(v) check</strong><span>{f(result.featureIdentity.explicitDot,6)} = {f(result.featureIdentity.kernelValue,6)}</span></div>{/if}
  </section>
</div>
<aside class="note"><strong>Interpretation.</strong> Formula 044 is the logistic sigmoid footnote; formulas 045–048 are the kernel representation. The source does not define a probabilistic SVM, so σ(f) is shown only to contrast the logistic footnote with the SVM decision score. The Gaussian kernel uses the source-normalized density form.</aside>
<style>
.lesson-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:.8rem}.panel,.note{border:1px solid var(--color-border);border-radius:1rem;background:var(--color-background);padding:1rem}.eyebrow{margin:0;font-size:.66rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--color-muted-foreground)}h6{margin:.25rem 0 .8rem;font-size:.95rem}.scorebar{height:1rem;border-radius:99px;background:var(--color-muted);overflow:hidden}.scorebar span{display:block;height:100%;background:var(--color-primary)}table{width:100%;margin:.8rem 0 0;border-collapse:collapse;font-size:.72rem}th,td{padding:.45rem;border-bottom:1px solid var(--color-border);text-align:right}th:first-child,td:first-child{text-align:left}.controls{display:grid;gap:.7rem}.controls label{display:grid;grid-template-columns:1fr auto;gap:.3rem;font-size:.75rem;font-weight:800}.controls input{grid-column:1/-1;min-height:30px}.identity{display:grid;gap:.25rem;border-radius:.7rem;background:var(--color-muted);padding:.7rem;font-size:.72rem}.note{margin-top:.8rem;font-size:.74rem;line-height:1.6}@media(max-width:760px){.lesson-grid{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

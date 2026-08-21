<script>
  import { computePerceptronLearning } from '@/lib/formula-lessons/perceptron-learning.mjs';

  export let lesson;
  export let spec;

  let w1 = spec.initialW[0];
  let w2 = spec.initialW[1];
  let bias = spec.initialB;
  let alpha = spec.alpha;

  $: result = computePerceptronLearning({
    samples: spec.samples,
    w: [Number(w1), Number(w2)],
    b: Number(bias),
    alpha: Number(alpha),
  });

  const f = (value, digits = 3) => Number(value).toFixed(digits);
  const vec = (value) => `[${value.map((item) => f(item)).join(', ')}]`;
</script>

<div class="lesson-grid" data-perceptron-learning-lesson data-focus={lesson.focus}>
  <section class="panel">
    <p class="eyebrow">현재 margin과 error set</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>sample</th><th>y</th><th>g(x)</th><th>y·g(x)</th><th>&lt;0</th><th>≤0</th></tr></thead>
        <tbody>
          {#each result.rows as row (row.id)}
            <tr>
              <td>{row.id}</td><td>{row.y}</td><td>{f(row.score)}</td><td>{f(row.margin)}</td>
              <td>{row.margin < 0 ? 'E' : '—'}</td><td>{row.margin <= 0 ? 'E' : '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="compare">
      <div><span>source strict E</span><strong>{result.strictErrors.length}</strong></div>
      <div><span>corrected E</span><strong>{result.correctedErrors.length}</strong></div>
      <div><span>raw margin sum</span><strong>{f(result.rawMarginSum)}</strong></div>
      <div><span>source L</span><strong>{f(result.sourceLoss)}</strong></div>
    </div>
  </section>

  <section class="panel">
    <p class="eyebrow">완성 gradient와 update</p>
    <div class="formula-row"><span>∂L/∂w</span><strong>{vec(result.fullGradient.w)}</strong></div>
    <div class="formula-row"><span>∂L/∂b</span><strong>{f(result.fullGradient.b)}</strong></div>
    <div class="formula-row"><span>full update w</span><strong>{vec(result.fullUpdate.w)}</strong></div>
    <div class="formula-row"><span>strict-E update w</span><strong>{vec(result.strictUpdate.w)}</strong></div>
    <div class="formula-row"><span>≤0-E update w</span><strong>{vec(result.correctedUpdate.w)}</strong></div>
    <div class="formula-row"><span>next separated?</span><strong>{result.correctedNextSeparated ? 'PASS' : 'NO'}</strong></div>

    <label>w₁ <output>{f(w1, 2)}</output><input bind:value={w1} type="range" min="-1.5" max="1.5" step="0.05" /></label>
    <label>w₂ <output>{f(w2, 2)}</output><input bind:value={w2} type="range" min="-1.5" max="1.5" step="0.05" /></label>
    <label>b <output>{f(bias, 2)}</output><input bind:value={bias} type="range" min="-1" max="1" step="0.05" /></label>
    <label>α <output>{f(alpha, 2)}</output><input bind:value={alpha} type="range" min="0.05" max="0.6" step="0.05" /></label>
  </section>
</div>

<section class="panel next-panel">
  <p class="eyebrow">corrected error-set update 뒤 margin</p>
  <div class="margin-bars">
    {#each result.correctedNextRows as row (row.id)}
      <div><span>{row.id}</span><i style={`width:${Math.max(3, Math.min(100, row.margin * 20))}%`}></i><strong>{f(row.margin)}</strong></div>
    {/each}
  </div>
</section>

<aside class="note">
  <strong>Fail-closed source distinction.</strong>
  MAI-P3-023/024의 <code>??</code>는 그대로 보존되고, 수치 gradient는 별도 완성식 MAI-P3-144/145가 제공한다.
  또 MAI-P3-030/036은 <code>margin&lt;0</code>을 쓰지만 교정형 MAI-P3-162/163은 <code>margin≤0</code>을 쓴다.
  초기 w=0, b=0에서는 이 차이가 의도적으로 드러난다. zero-margin 표본은 corrected error set에는 들어가지만 그 순간 error-loss 항 자체는 0일 수 있으므로, “loss=0 iff error set empty”를 교정형에 기계적으로 확장하지 않는다.
</aside>

<style>
  .lesson-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:.8rem}.panel,.note{border:1px solid var(--color-border);border-radius:1rem;background:var(--color-background);padding:1rem}.eyebrow{margin:0 0 .6rem;font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--color-muted-foreground)}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.71rem}th,td{padding:.45rem;border-bottom:1px solid var(--color-border);text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}.compare{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem;margin-top:.7rem}.compare div,.formula-row{border-radius:.7rem;background:var(--color-muted);padding:.6rem;font-size:.72rem}.compare div{display:grid;gap:.15rem}.compare span,.formula-row span{color:var(--color-muted-foreground)}.formula-row{display:flex;justify-content:space-between;gap:.5rem;margin-bottom:.4rem}.panel label{display:grid;grid-template-columns:1fr auto;gap:.2rem;margin-top:.45rem;font-size:.72rem;font-weight:800}.panel input{grid-column:1/-1;min-height:30px}.next-panel{margin-top:.8rem}.margin-bars{display:grid;gap:.45rem}.margin-bars div{display:grid;grid-template-columns:3rem 1fr 4rem;gap:.5rem;align-items:center;font-size:.72rem}.margin-bars i{height:.75rem;border-radius:99px;background:var(--color-primary)}.margin-bars strong{text-align:right}.note{margin-top:.8rem;font-size:.74rem;line-height:1.65}@media(max-width:760px){.lesson-grid{grid-template-columns:1fr}.compare{grid-template-columns:1fr 1fr}}
</style>

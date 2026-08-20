<script>
  import { computeDotProductPrediction } from '@/lib/formula-lessons/dot-product.mjs';

  export let lesson;
  export let spec;

  let w0 = spec.initialW[0];
  let w1 = spec.initialW[1];
  let w2 = spec.initialW[2];

  $: weights = [Number(w0), Number(w1), Number(w2)];
  $: result = computeDotProductPrediction({ x: spec.x, w: weights });
  $: maxContribution = Math.max(1, ...result.contributions.map((value) => Math.abs(value)));

  function format(value, digits = 2) {
    return Number(value).toFixed(digits);
  }

  function resetWeights() {
    [w0, w1, w2] = spec.initialW;
  }

  function zeroWeights() {
    w0 = 0;
    w1 = 0;
    w2 = 0;
  }
</script>

<div class="dot-product-layout" data-dot-product-lesson data-focus={lesson.focus}>
  <section class="contribution-panel">
    <header>
      <div>
        <p>성분별 계산</p>
        <h6>wᵀx = Σᵢ wᵢxᵢ</h6>
      </div>
      <output>{format(result.prediction, 3)}</output>
    </header>

    <div class="contribution-list">
      {#each spec.x as value, index (index)}
        <article>
          <div class="row-label">
            <strong>{spec.featureNames[index]}</strong>
            <span>{format(weights[index])} × {format(value)} = {format(result.contributions[index])}</span>
          </div>
          <div class="bar-track" aria-label={`${spec.featureNames[index]} contribution ${format(result.contributions[index])}`}>
            <span class="zero-line"></span>
            {#if result.contributions[index] >= 0}
              <i
                class="positive"
                style={`left:50%;width:${(Math.abs(result.contributions[index]) / maxContribution) * 48}%`}
              ></i>
            {:else}
              <i
                class="negative"
                style={`right:50%;width:${(Math.abs(result.contributions[index]) / maxContribution) * 48}%`}
              ></i>
            {/if}
          </div>
        </article>
      {/each}
    </div>

    <div class="sum-flow" aria-label="running sum of feature contributions">
      {#each result.contributions as contribution, index (index)}
        <span>{format(contribution)}</span>
        {#if index < result.contributions.length - 1}<b>+</b>{/if}
      {/each}
      <b>=</b>
      <strong>{format(result.prediction, 3)}</strong>
    </div>
  </section>

  <section class="control-panel">
    <header>
      <p>직접 바꾸는 기호</p>
      <h6>가중치 wᵢ</h6>
    </header>

    <div class="controls">
      <label>
        <span>w₁</span><output>{format(w0)}</output>
        <input bind:value={w0} type="range" min="-2" max="2" step="0.05" />
      </label>
      <label>
        <span>w₂</span><output>{format(w1)}</output>
        <input bind:value={w1} type="range" min="-2" max="2" step="0.05" />
      </label>
      <label>
        <span>w₃</span><output>{format(w2)}</output>
        <input bind:value={w2} type="range" min="-2" max="2" step="0.05" />
      </label>
      <div class="buttons">
        <button type="button" on:click={resetWeights}>예제 가중치</button>
        <button type="button" class="secondary" on:click={zeroWeights}>모두 0</button>
      </div>
    </div>

    <dl class="checks">
      <div><dt>입력 x</dt><dd>[{spec.x.map((value) => format(value)).join(', ')}]</dd></div>
      <div><dt>가중치 w</dt><dd>[{weights.map((value) => format(value)).join(', ')}]</dd></div>
      <div><dt>‖x‖₂</dt><dd>{format(result.inputNorm, 3)}</dd></div>
      <div><dt>‖w‖₂</dt><dd>{format(result.weightNorm, 3)}</dd></div>
      <div><dt>cos θ</dt><dd>{format(result.cosine, 3)}</dd></div>
    </dl>
  </section>
</div>

<section class="calculation-table-wrap">
  <table class="calculation-table">
    <thead>
      <tr><th>i</th><th>xᵢ</th><th>wᵢ</th><th>wᵢxᵢ</th><th>예측에 미치는 방향</th></tr>
    </thead>
    <tbody>
      {#each spec.x as value, index (index)}
        <tr>
          <td>{index + 1}</td>
          <td>{format(value)}</td>
          <td>{format(weights[index])}</td>
          <td>{format(result.contributions[index], 3)}</td>
          <td>{result.contributions[index] > 0 ? '예측을 올림' : result.contributions[index] < 0 ? '예측을 내림' : '영향 없음'}</td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr><th colspan="3">합계 ŷ = wᵀx</th><th>{format(result.prediction, 3)}</th><th>선형 예측값</th></tr>
    </tfoot>
  </table>
</section>

<aside class="assumptions">
  <strong>이 시각화가 수식과 연결되는 이유</strong>
  <ul>
    {#each spec.assumptions as assumption, index (index)}
      <li>{assumption}</li>
    {/each}
  </ul>
</aside>

<style>
  .dot-product-layout{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(17rem,.8fr);gap:.9rem;align-items:start}.contribution-panel,.control-panel,.calculation-table-wrap,.assumptions{border:1px solid color-mix(in srgb,var(--color-border) 82%,transparent);border-radius:1rem;background:color-mix(in srgb,var(--color-background) 93%,transparent)}.contribution-panel,.control-panel{overflow:hidden}.contribution-panel>header,.control-panel>header{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;border-bottom:1px solid var(--color-border);padding:.85rem 1rem}.contribution-panel header p,.control-panel header p{margin:0;font-size:.65rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--color-muted-foreground)}.contribution-panel header h6,.control-panel header h6{margin:.15rem 0 0;font-size:.95rem;font-weight:900}.contribution-panel header output{border-radius:.8rem;background:#7c3aed;color:white;padding:.45rem .75rem;font-size:1.05rem;font-weight:900}.contribution-list{display:grid;gap:.8rem;padding:1rem}.contribution-list article{display:grid;gap:.35rem}.row-label{display:flex;justify-content:space-between;gap:.75rem;font-size:.73rem}.row-label strong{font-weight:900}.row-label span{color:var(--color-muted-foreground);font-variant-numeric:tabular-nums}.bar-track{position:relative;height:1.7rem;border-radius:.55rem;background:color-mix(in srgb,var(--color-muted) 75%,transparent);overflow:hidden}.bar-track .zero-line{position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--color-muted-foreground)}.bar-track i{position:absolute;top:.18rem;bottom:.18rem;border-radius:.38rem}.bar-track i.positive{background:#0ea5e9}.bar-track i.negative{background:#f97316}.sum-flow{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.45rem;border-top:1px solid var(--color-border);padding:1rem;font-variant-numeric:tabular-nums}.sum-flow span{border-radius:.55rem;background:var(--color-muted);padding:.35rem .5rem;font-size:.75rem}.sum-flow b{color:var(--color-muted-foreground)}.sum-flow strong{border-radius:.65rem;background:#7c3aed;color:white;padding:.45rem .7rem}.controls{display:grid;gap:.7rem;padding:1rem}.controls label{display:grid;grid-template-columns:1fr auto;gap:.25rem;font-size:.75rem;font-weight:900}.controls output{color:var(--color-primary)}.controls input{grid-column:1/-1;min-height:30px;width:100%}.buttons{display:flex;flex-wrap:wrap;gap:.5rem}.buttons button{min-height:44px;border:1px solid color-mix(in srgb,var(--color-primary) 35%,var(--color-border));border-radius:.75rem;background:color-mix(in srgb,var(--color-primary) 10%,var(--color-background));padding:.55rem .8rem;color:var(--color-foreground);font-size:.72rem;font-weight:900}.buttons button.secondary{background:var(--color-background)}.checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem;margin:0;border-top:1px solid var(--color-border);padding:.8rem}.checks div{border-radius:.65rem;background:var(--color-muted);padding:.55rem}.checks dt{font-size:.65rem;font-weight:900;color:var(--color-muted-foreground)}.checks dd{margin:.15rem 0 0;font-size:.72rem;font-weight:800;word-break:break-all}.calculation-table-wrap{margin-top:.9rem;overflow-x:auto}.calculation-table{margin:0;min-width:40rem;width:100%;border-collapse:collapse}.calculation-table th,.calculation-table td{border-bottom:1px solid var(--color-border);padding:.6rem;text-align:right;font-size:.73rem}.calculation-table th{background:var(--color-muted);font-weight:900}.calculation-table th:first-child,.calculation-table td:first-child{text-align:center}.calculation-table th:last-child,.calculation-table td:last-child{text-align:left}.assumptions{margin-top:.9rem;padding:.9rem 1rem;font-size:.75rem;line-height:1.6}.assumptions strong{font-weight:900}.assumptions ul{margin:.4rem 0 0;padding-left:1.2rem}@media(max-width:850px){.dot-product-layout{grid-template-columns:1fr}.checks{grid-template-columns:1fr 1fr}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

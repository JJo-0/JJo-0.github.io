<script>
  import { computeSampleMatrixAssembly } from '@/lib/formula-lessons/sample-matrix.mjs';

  export let lesson;
  export let spec;

  let selectedSample = 0;
  let w0 = spec.weights[0];
  let w1 = spec.weights[1];

  $: weights = [Number(w0), Number(w1)];
  $: result = computeSampleMatrixAssembly({
    samples: spec.samples,
    targets: spec.targets,
    weights,
  });
  $: selectedOuter = result.outerProducts[selectedSample];
  $: selectedRunningGram = result.runningGram[selectedSample];
  $: equalityError = Math.abs(
    result.samplewiseObjective - result.stackedResidualNormSquared,
  );

  function format(value, digits = 3) {
    return Number(value).toFixed(digits);
  }

  function reset() {
    selectedSample = 0;
    [w0, w1] = spec.weights;
  }
</script>

<div class="assembly-layout" data-sample-matrix-focus={lesson.focus}>
  <section class="outer-panel">
    <header>
      <div><p>현재 수식의 초점</p><h6>{spec.focusLabels[lesson.focus]}</h6></div>
      <span>sample {selectedSample + 1} / {spec.samples.length}</span>
    </header>

    <div class="sample-selector">
      {#each spec.samples as sample, index (index)}
        <button
          type="button"
          class:active={selectedSample === index}
          on:click={() => (selectedSample = index)}
        >
          x{index + 1}=[{sample.join(', ')}]
        </button>
      {/each}
    </div>

    <div class="matrix-flow">
      <article>
        <small>샘플 벡터</small>
        <strong>xₗ</strong>
        <div class="column-vector">
          {#each spec.samples[selectedSample] as value, index (index)}<span>{format(value, 1)}</span>{/each}
        </div>
      </article>
      <b>× xₗᵀ →</b>
      <article class:active={lesson.focus === 'outer-product-accumulation'}>
        <small>현재 외적</small>
        <strong>xₗxₗᵀ</strong>
        <table>
          <tbody>
            {#each selectedOuter as row, rowIndex (rowIndex)}
              <tr>{#each row as value, columnIndex (`${rowIndex}-${columnIndex}`)}<td>{format(value, 1)}</td>{/each}</tr>
            {/each}
          </tbody>
        </table>
      </article>
      <b>누적 Σ →</b>
      <article>
        <small>1…{selectedSample + 1} 누적</small>
        <strong>Σ xₗxₗᵀ</strong>
        <table>
          <tbody>
            {#each selectedRunningGram as row, rowIndex (rowIndex)}
              <tr>{#each row as value, columnIndex (`${rowIndex}-${columnIndex}`)}<td>{format(value, 1)}</td>{/each}</tr>
            {/each}
          </tbody>
        </table>
      </article>
    </div>

    <div class="final-gram">
      <span>전체 샘플을 더하면</span>
      <strong>XᵀX</strong>
      <table>
        <tbody>
          {#each result.XtX as row, rowIndex (rowIndex)}
            <tr>{#each row as value, columnIndex (`${rowIndex}-${columnIndex}`)}<td>{format(value, 1)}</td>{/each}</tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="control-panel">
    <header><p>목적함수에 쓰는 가중치</p><h6>w</h6></header>
    <div class="controls">
      <label><span>w₀</span><output>{format(w0, 2)}</output><input bind:value={w0} type="range" min="-1" max="2" step="0.05" /></label>
      <label><span>w₁</span><output>{format(w1, 2)}</output><input bind:value={w1} type="range" min="-1" max="2" step="0.05" /></label>
      <button type="button" on:click={reset}>예제값 복원</button>
    </div>

    <ol class="equivalence-rail">
      <li class:active={lesson.focus === 'samplewise-objective'}>
        <b>샘플별</b>
        <span>Σₗ(wᵀxₗ−yₗ)²</span>
        <strong>{format(result.samplewiseObjective)}</strong>
      </li>
      <li class:active={lesson.focus === 'stacked-objective'}>
        <b>행렬형</b>
        <span>‖Xw−y‖₂²</span>
        <strong>{format(result.stackedResidualNormSquared)}</strong>
      </li>
      <li class="check">
        <b>검산</b>
        <span>두 표현의 차이</span>
        <strong>{equalityError.toExponential(1)}</strong>
      </li>
    </ol>
  </section>
</div>

<section class="sample-table-wrap">
  <table class="sample-table">
    <thead><tr><th>l</th><th>xₗ</th><th>yₗ</th><th>wᵀxₗ</th><th>잔차</th><th>제곱오차</th></tr></thead>
    <tbody>
      {#each spec.samples as sample, index (index)}
        <tr class:selected={selectedSample === index} on:click={() => (selectedSample = index)}>
          <td>{index + 1}</td>
          <td>[{sample.join(', ')}]</td>
          <td>{format(spec.targets[index])}</td>
          <td>{format(result.prediction[index])}</td>
          <td>{format(result.residual[index])}</td>
          <td>{format(result.samplewiseSquaredErrors[index])}</td>
        </tr>
      {/each}
    </tbody>
    <tfoot><tr><th colspan="5">합계</th><th>{format(result.samplewiseObjective)}</th></tr></tfoot>
  </table>
</section>

<aside class="assumptions">
  <strong>같은 계산을 세 표현으로 본다</strong>
  <ul>
    {#each spec.assumptions as assumption, index (index)}
      <li>{assumption}</li>
    {/each}
  </ul>
</aside>

<style>
  .assembly-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(17rem,.7fr);gap:.9rem;align-items:start}.outer-panel,.control-panel,.sample-table-wrap,.assumptions{border:1px solid color-mix(in srgb,var(--color-border) 82%,transparent);border-radius:1rem;background:color-mix(in srgb,var(--color-background) 93%,transparent)}.outer-panel,.control-panel{overflow:hidden}.outer-panel>header,.control-panel>header{display:flex;justify-content:space-between;gap:.75rem;border-bottom:1px solid var(--color-border);padding:.85rem 1rem}.outer-panel header p,.control-panel header p{margin:0;font-size:.65rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--color-muted-foreground)}.outer-panel header h6,.control-panel header h6{margin:.15rem 0 0;font-size:.95rem;font-weight:900}.outer-panel header span{border-radius:.7rem;background:#7c3aed;color:white;padding:.4rem .65rem;font-size:.7rem;font-weight:900}.sample-selector{display:flex;gap:.4rem;overflow-x:auto;padding:.7rem}.sample-selector button{min-height:40px;white-space:nowrap;border:1px solid var(--color-border);border-radius:.65rem;background:var(--color-background);padding:.4rem .65rem;color:var(--color-foreground);font-size:.68rem;font-weight:800}.sample-selector button.active{border-color:#7c3aed;background:#7c3aed12;color:#6d28d9}.matrix-flow{display:flex;align-items:center;gap:.55rem;overflow-x:auto;padding:.4rem .8rem 1rem;min-width:44rem}.matrix-flow article{min-width:8rem;border:1px solid var(--color-border);border-radius:.75rem;background:var(--color-background);padding:.65rem;text-align:center}.matrix-flow article.active{border-color:#7c3aed;background:#7c3aed10}.matrix-flow small,.matrix-flow strong{display:block}.matrix-flow small{font-size:.62rem;color:var(--color-muted-foreground)}.matrix-flow strong{margin:.1rem 0 .4rem;font-size:.78rem}.matrix-flow>b{font-size:.7rem;color:var(--color-muted-foreground);white-space:nowrap}.column-vector{display:grid;width:3rem;margin:auto}.column-vector span,.matrix-flow td,.final-gram td{border:1px solid var(--color-border);padding:.22rem;text-align:center;font-size:.68rem}.matrix-flow table,.final-gram table{margin:auto;border-collapse:collapse}.final-gram{display:flex;align-items:center;justify-content:center;gap:.65rem;border-top:1px solid var(--color-border);padding:.8rem;font-size:.72rem}.final-gram strong{font-size:.85rem}.controls{display:grid;gap:.7rem;padding:1rem}.controls label{display:grid;grid-template-columns:1fr auto;gap:.25rem;font-size:.75rem;font-weight:900}.controls output{color:var(--color-primary)}.controls input{grid-column:1/-1;min-height:30px;width:100%}.controls button{min-height:44px;border:1px solid color-mix(in srgb,var(--color-primary) 35%,var(--color-border));border-radius:.75rem;background:color-mix(in srgb,var(--color-primary) 10%,var(--color-background));color:var(--color-foreground);font-size:.72rem;font-weight:900}.equivalence-rail{list-style:none;margin:0;border-top:1px solid var(--color-border);padding:.75rem;display:grid;gap:.45rem}.equivalence-rail li{display:grid;grid-template-columns:3.2rem 1fr auto;gap:.45rem;align-items:center;border:1px solid transparent;border-radius:.65rem;background:var(--color-muted);padding:.55rem;font-size:.7rem}.equivalence-rail li.active{border-color:#7c3aed;background:#7c3aed10}.equivalence-rail li.check{border-color:#10b98155;background:#10b98110}.sample-table-wrap{margin-top:.9rem;overflow-x:auto}.sample-table{margin:0;min-width:42rem;width:100%;border-collapse:collapse}.sample-table th,.sample-table td{border-bottom:1px solid var(--color-border);padding:.6rem;text-align:right;font-size:.72rem}.sample-table th{background:var(--color-muted);font-weight:900}.sample-table th:first-child,.sample-table td:first-child{text-align:center}.sample-table tbody tr{cursor:pointer}.sample-table tbody tr.selected{background:#7c3aed0d}.assumptions{margin-top:.9rem;padding:.9rem 1rem;font-size:.75rem;line-height:1.6}.assumptions ul{margin:.4rem 0 0;padding-left:1.2rem}@media(max-width:850px){.assembly-layout{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

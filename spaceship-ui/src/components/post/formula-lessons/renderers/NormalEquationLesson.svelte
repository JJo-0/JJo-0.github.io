<script>
  import {
    approximatelyEqual,
    computeLeastSquares,
    solveNormalEquation,
  } from '@/lib/formula-lessons/least-squares.mjs';

  export let lesson;
  export let spec;

  let intercept = spec.dataset.initialW[0];
  let slope = spec.dataset.initialW[1];

  const xValues = spec.dataset.X.map((row) => row[1]);
  const yValues = spec.dataset.y;
  const optimum = solveNormalEquation(spec.dataset.X, spec.dataset.y);

  $: weights = [Number(intercept), Number(slope)];
  $: result = computeLeastSquares({
    X: spec.dataset.X,
    y: spec.dataset.y,
    w: weights,
  });
  $: focusIndex = Math.max(0, spec.focusOrder.indexOf(lesson.focus));
  $: gradientNorm = Math.hypot(...result.gradient);
  $: isAtOptimum = gradientNorm < 1e-7;

  const width = 560;
  const height = 340;
  const plot = { left: 54, right: 520, top: 28, bottom: 286 };
  const xMin = Math.min(...xValues) - 0.25;
  const xMax = Math.max(...xValues) + 0.25;
  const yMin = Math.min(...yValues, -0.5);
  const yMax = Math.max(...yValues, 5);

  function sx(value) {
    return plot.left + ((value - xMin) / (xMax - xMin)) * (plot.right - plot.left);
  }

  function sy(value) {
    return plot.bottom - ((value - yMin) / (yMax - yMin)) * (plot.bottom - plot.top);
  }

  function format(value, digits = 3) {
    return Number(value).toFixed(digits);
  }

  function useClosedFormSolution() {
    intercept = optimum.solution[0];
    slope = optimum.solution[1];
  }

  function resetWeights() {
    intercept = spec.dataset.initialW[0];
    slope = spec.dataset.initialW[1];
  }

  const derivationSteps = [
    ['mse', '예측과 잔차', 'Xw를 계산한 뒤 y를 빼고, 각 잔차를 제곱해 평균낸다.'],
    ['stationarity', '최솟값의 필요조건', '매끄러운 볼록 이차함수의 최솟값에서는 기울기가 0이다.'],
    ['gradient-of-mse', 'MSE 미분', '잔차가 w에 따라 어떻게 변하는지 체인룰로 추적한다.'],
    ['norm-to-quadratic', '제곱노름 변환', '‖r‖²를 rᵀr로 바꾸면 행렬 미분을 적용할 수 있다.'],
    ['expand-quadratic', '이차식 전개', '(Xw−y)ᵀ(Xw−y)를 w에 대한 세 항으로 전개한다.'],
    ['differentiate', '각 항 미분', 'w와 무관한 yᵀy는 사라지고 두 항만 남는다.'],
    ['normal-equation', '정규방정식', '기울기 0을 정리하면 XᵀXw=Xᵀy가 된다.'],
    ['solve-normal-equation', '선형시스템 풀이', '역행렬을 직접 만들기보다 정규방정식을 수치적으로 푼다.'],
  ];
</script>

<div class="lesson-layout">
  <section class="plot-panel" aria-label="회귀선과 잔차 시각화">
    <div class="panel-heading">
      <div>
        <p>같은 계산 상태</p>
        <h6>회귀선·잔차·MSE</h6>
      </div>
      <span class:success={isAtOptimum}>{isAtOptimum ? 'gradient ≈ 0' : `‖∇MSE‖=${format(gradientNorm)}`}</span>
    </div>

    <div class="scroll-canvas">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="가중치에 따라 움직이는 회귀선과 잔차">
        <rect x="0" y="0" width={width} height={height} rx="18" class="plot-bg" />
        {#each [0, 1, 2, 3, 4, 5] as tick (tick)}
          <line x1={plot.left} y1={sy(tick)} x2={plot.right} y2={sy(tick)} class="grid-line" />
          <text x={plot.left - 12} y={sy(tick) + 4} text-anchor="end" class="tick-label">{tick}</text>
        {/each}
        {#each xValues as x (x)}
          <line x1={sx(x)} y1={plot.top} x2={sx(x)} y2={plot.bottom} class="grid-line" />
          <text x={sx(x)} y={plot.bottom + 22} text-anchor="middle" class="tick-label">{x}</text>
        {/each}
        <line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} class="axis-line" />
        <line x1={plot.left} y1={plot.top} x2={plot.left} y2={plot.bottom} class="axis-line" />

        <line
          x1={sx(xMin)}
          y1={sy(intercept + slope * xMin)}
          x2={sx(xMax)}
          y2={sy(intercept + slope * xMax)}
          class="model-line"
        />

        {#each xValues as x, index (index)}
          <line
            x1={sx(x)}
            y1={sy(yValues[index])}
            x2={sx(x)}
            y2={sy(result.prediction[index])}
            class="residual-line"
          />
          <circle cx={sx(x)} cy={sy(yValues[index])} r="7" class="target-point" />
          <circle cx={sx(x)} cy={sy(result.prediction[index])} r="5" class="prediction-point" />
        {/each}
      </svg>
    </div>

    <div class="controls">
      <label>
        <span>절편 w₀</span>
        <output>{format(intercept, 2)}</output>
        <input bind:value={intercept} type="range" min="-1" max="2" step="0.02" />
      </label>
      <label>
        <span>기울기 w₁</span>
        <output>{format(slope, 2)}</output>
        <input bind:value={slope} type="range" min="-0.5" max="2" step="0.02" />
      </label>
      <div class="button-row">
        <button type="button" on:click={useClosedFormSolution}>정규방정식 해 적용</button>
        <button type="button" class="secondary" on:click={resetWeights}>초기값</button>
      </div>
    </div>
  </section>

  <section class="calculation-panel">
    <div class="panel-heading">
      <div>
        <p>현재 식의 초점</p>
        <h6>{spec.focusLabels[lesson.focus]}</h6>
      </div>
      <span>{focusIndex + 1} / {spec.focusOrder.length}</span>
    </div>

    <ol class="derivation-rail">
      {#each derivationSteps as item, index (item[0])}
        <li class:active={item[0] === lesson.focus} class:complete={index < focusIndex}>
          <span>{index + 1}</span>
          <div>
            <strong>{item[1]}</strong>
            <small>{item[2]}</small>
          </div>
        </li>
      {/each}
    </ol>

    <div class="matrix-cards">
      <article>
        <p>XᵀX</p>
        <table aria-label="Gram matrix X transpose X">
          <tbody>
            {#each result.gram as row, rowIndex (rowIndex)}
              <tr>
                {#each row as value, columnIndex (`${rowIndex}-${columnIndex}`)}
                  <td>{format(value, 2)}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </article>
      <article>
        <p>Xᵀy</p>
        <table aria-label="right hand side X transpose y">
          <tbody>
            {#each result.rhs as value, index (index)}
              <tr><td>{format(value, 2)}</td></tr>
            {/each}
          </tbody>
        </table>
      </article>
      <article>
        <p>현재 ∇MSE</p>
        <table aria-label="current MSE gradient">
          <tbody>
            {#each result.gradient as value, index (index)}
              <tr><td>{format(value, 3)}</td></tr>
            {/each}
          </tbody>
        </table>
      </article>
    </div>
  </section>
</div>

<section class="sample-table-wrap">
  <div class="summary-strip">
    <span><b>SSE</b> {format(result.sse)}</span>
    <span><b>MSE</b> {format(result.mse)}</span>
    <span><b>w★</b> [{format(optimum.solution[0], 3)}, {format(optimum.solution[1], 3)}]</span>
    <span class:pass={approximatelyEqual(result.mse, 0, 1e-9) || result.mse >= 0}><b>검산</b> MSE ≥ 0</span>
  </div>
  <div class="table-scroll">
    <table class="sample-table">
      <thead>
        <tr>
          <th>l</th><th>xₗ</th><th>yₗ</th><th>ŷₗ=Xₗw</th><th>rₗ=ŷₗ−yₗ</th><th>rₗ²</th>
        </tr>
      </thead>
      <tbody>
        {#each xValues as x, index (index)}
          <tr>
            <td>{index + 1}</td>
            <td>{format(x, 1)}</td>
            <td>{format(yValues[index], 2)}</td>
            <td>{format(result.prediction[index], 3)}</td>
            <td>{format(result.residual[index], 3)}</td>
            <td>{format(result.squaredResidual[index], 3)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<aside class="assumptions">
  <strong>계산 가정과 구현 주의</strong>
  <ul>
    {#each spec.assumptions as assumption, index (index)}
      <li>{assumption}</li>
    {/each}
  </ul>
</aside>

<style>
  .lesson-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(18rem,.9fr);gap:.9rem;align-items:start}.plot-panel,.calculation-panel,.sample-table-wrap,.assumptions{border:1px solid color-mix(in srgb,var(--color-border) 82%,transparent);border-radius:1rem;background:color-mix(in srgb,var(--color-background) 92%,transparent)}.plot-panel,.calculation-panel{overflow:hidden}.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;padding:.85rem 1rem;border-bottom:1px solid color-mix(in srgb,var(--color-border) 70%,transparent)}.panel-heading p{margin:0;font-size:.65rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--color-muted-foreground)}.panel-heading h6{margin:.15rem 0 0;font-size:.95rem;font-weight:900}.panel-heading>span{border:1px solid color-mix(in srgb,var(--color-primary) 25%,var(--color-border));border-radius:999px;padding:.25rem .55rem;font-size:.68rem;font-weight:900;white-space:nowrap}.panel-heading>span.success{color:#047857;border-color:#10b98155;background:#10b98112}.scroll-canvas{overflow-x:auto;padding:.5rem}.scroll-canvas svg{display:block;width:100%;min-width:34rem}.plot-bg{fill:white}.grid-line{stroke:#e2e8f0;stroke-width:1}.axis-line{stroke:#64748b;stroke-width:1.5}.tick-label{fill:#64748b;font-size:12px}.model-line{stroke:#7c3aed;stroke-width:4;stroke-linecap:round}.residual-line{stroke:#f97316;stroke-width:3;stroke-dasharray:5 4}.target-point{fill:#0ea5e9;stroke:white;stroke-width:2}.prediction-point{fill:#f97316;stroke:white;stroke-width:2}.controls{display:grid;gap:.65rem;padding:.75rem 1rem 1rem}.controls label{display:grid;grid-template-columns:1fr auto;gap:.25rem;font-size:.74rem;font-weight:900}.controls output{color:var(--color-primary)}.controls input{grid-column:1/-1;min-height:30px;width:100%}.button-row{display:flex;flex-wrap:wrap;gap:.5rem}.button-row button{min-height:44px;border:1px solid color-mix(in srgb,var(--color-primary) 35%,var(--color-border));border-radius:.75rem;background:color-mix(in srgb,var(--color-primary) 10%,var(--color-background));padding:.55rem .8rem;font-size:.72rem;font-weight:900;color:var(--color-foreground)}.button-row button.secondary{background:var(--color-background)}.derivation-rail{list-style:none;margin:0;padding:.75rem;display:grid;gap:.45rem}.derivation-rail li{display:grid;grid-template-columns:1.75rem 1fr;gap:.55rem;align-items:start;border:1px solid transparent;border-radius:.75rem;padding:.55rem;color:var(--color-muted-foreground)}.derivation-rail li>span{display:grid;width:1.7rem;height:1.7rem;place-items:center;border-radius:999px;background:var(--color-muted);font-size:.68rem;font-weight:900}.derivation-rail li strong,.derivation-rail li small{display:block}.derivation-rail li strong{font-size:.76rem;color:var(--color-foreground)}.derivation-rail li small{margin-top:.15rem;font-size:.68rem;line-height:1.45}.derivation-rail li.complete{opacity:.65}.derivation-rail li.active{border-color:#7c3aed55;background:#7c3aed10}.derivation-rail li.active>span{background:#7c3aed;color:white}.matrix-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.45rem;padding:0 .75rem .75rem}.matrix-cards article{border:1px solid color-mix(in srgb,var(--color-border) 75%,transparent);border-radius:.75rem;padding:.55rem;background:var(--color-background)}.matrix-cards p{margin:0 0 .35rem;font-size:.68rem;font-weight:900}.matrix-cards table{margin:0;width:100%;border-collapse:collapse}.matrix-cards td{border:1px solid var(--color-border);padding:.22rem;text-align:center;font-size:.68rem}.sample-table-wrap{margin-top:.9rem;overflow:hidden}.summary-strip{display:flex;flex-wrap:wrap;gap:.45rem;border-bottom:1px solid var(--color-border);padding:.7rem}.summary-strip span{border-radius:999px;background:var(--color-muted);padding:.35rem .55rem;font-size:.7rem}.summary-strip span.pass{color:#047857;background:#10b98112}.table-scroll{overflow-x:auto}.sample-table{margin:0;min-width:44rem;width:100%;border-collapse:collapse}.sample-table th,.sample-table td{border-bottom:1px solid var(--color-border);padding:.55rem;text-align:right;font-size:.72rem}.sample-table th{background:var(--color-muted);font-weight:900}.sample-table th:first-child,.sample-table td:first-child{text-align:center}.assumptions{margin-top:.9rem;padding:.9rem 1rem;font-size:.75rem;line-height:1.6}.assumptions strong{font-weight:900}.assumptions ul{margin:.4rem 0 0;padding-left:1.2rem}@media(max-width:900px){.lesson-layout{grid-template-columns:1fr}.matrix-cards{grid-template-columns:repeat(3,minmax(7rem,1fr));overflow-x:auto}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
</style>

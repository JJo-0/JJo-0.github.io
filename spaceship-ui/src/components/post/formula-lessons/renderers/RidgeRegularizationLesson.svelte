<script>
  import {
    evaluateQuadratic,
    fitRidgePolynomial,
    predictPolynomial,
  } from '@/lib/formula-lessons/generalization-ridge.mjs';

  export let lesson;
  export let spec;

  const focus = lesson.focus;
  const curveX = Array.from({ length: 161 }, (_, index) => -1 + (2 * index) / 160);
  const trueCurve = curveX.map((value) => evaluateQuadratic(value, spec.trueCoefficients));
  const chart = { left: 54, right: 620, top: 26, bottom: 326 };
  let lambdaIndex = spec.defaultLambdaIndex;

  $: lambda = spec.lambdaGrid[Number(lambdaIndex)];
  $: fit = fitRidgePolynomial({
    x: spec.trainX,
    y: spec.trainY,
    degree: spec.degree,
    lambda,
  });
  $: fittedCurve = predictPolynomial(fit.weights, curveX);
  $: allY = [...spec.trainY, ...trueCurve, ...fittedCurve];
  $: yMinimum = Math.min(...allY) - 0.12;
  $: yMaximum = Math.max(...allY) + 0.12;
  $: fittedPath = makePath(curveX, fittedCurve);
  $: maximumWeight = Math.max(...fit.weights.map((value) => Math.abs(value)), 1e-8);
  $: objectiveScale = Math.max(fit.objective, 1e-8);

  function format(value, digits = 5) {
    return Number(value).toFixed(digits);
  }

  function formatLambda(value) {
    if (value === 0) return '0';
    if (value < 0.001 || value >= 10) return value.toExponential(0);
    return String(value);
  }

  function xScale(value) {
    return chart.left + ((value + 1) / 2) * (chart.right - chart.left);
  }

  function yScale(value) {
    return chart.bottom - ((value - yMinimum) / (yMaximum - yMinimum)) * (chart.bottom - chart.top);
  }

  function makePath(xs, ys) {
    return xs
      .map((value, index) => `${index === 0 ? 'M' : 'L'} ${xScale(value)} ${yScale(ys[index])}`)
      .join(' ');
  }

  function selectPreset(index) {
    lambdaIndex = index;
  }

  function presetLabel(index) {
    if (index === 0) return 'λ=0 · 작은 가중치 선호 없음';
    if (index === spec.defaultLambdaIndex) return '중간 λ · 균형 확인';
    return '큰 λ · underfitting 확인';
  }
</script>

<div class="ridge-layout" data-ridge-focus={focus}>
  <section class="chart-panel">
    <header>
      <div>
        <p>현재 수식의 초점</p>
        <h6>{spec.focusLabels[focus]}</h6>
      </div>
      <span>degree {spec.degree} · λ={formatLambda(lambda)}</span>
    </header>

    <div class="chart-scroll">
      <svg viewBox="0 0 660 360" role="img" aria-label="이차 생성함수의 noisy 훈련점에 9차 다항식을 ridge regularization으로 적합한 결과">
        <rect width="660" height="360" rx="18" class="plot-bg" />
        <line x1={chart.left} y1={chart.bottom} x2={chart.right} y2={chart.bottom} class="axis" />
        <line x1={xScale(0)} y1={chart.top} x2={xScale(0)} y2={chart.bottom} class="axis" />
        <path d={makePath(curveX, trueCurve)} class="truth-curve" />
        <path d={fittedPath} class="fit-curve" />
        {#each spec.trainX as value, index (index)}
          <line
            x1={xScale(value)}
            y1={yScale(spec.trainY[index])}
            x2={xScale(value)}
            y2={yScale(fit.prediction[index])}
            class="train-residual"
          />
          <circle cx={xScale(value)} cy={yScale(spec.trainY[index])} r="5.5" class="train-point" />
        {/each}
      </svg>
    </div>

    <div class="legend">
      <span><i class="data-dot"></i>노이즈가 있는 훈련점</span>
      <span><i class="truth-line"></i>실제 이차 생성함수</span>
      <span><i class="fit-line"></i>현재 9차 ridge 적합</span>
    </div>
  </section>

  <section class="control-panel">
    <header>
      <p>Regularization strength</p>
      <h6>λ를 바꾸되 데이터와 모델 차수는 고정</h6>
    </header>

    <div class="lambda-control">
      <label>
        <span>λ grid</span>
        <output>{formatLambda(lambda)}</output>
        <input bind:value={lambdaIndex} type="range" min="0" max={spec.lambdaGrid.length - 1} step="1" />
      </label>
      <div class="preset-grid">
        {#each [0, spec.defaultLambdaIndex, 6] as index (index)}
          <button type="button" class:active={Number(lambdaIndex) === index} on:click={() => selectPreset(index)}>
            {presetLabel(index)}
          </button>
        {/each}
      </div>
    </div>

    <div class="objective-equation">
      <article>
        <small>data fit</small>
        <strong>MSE train</strong>
        <b>{format(fit.mse)}</b>
        <i style={`width:${(fit.mse / objectiveScale) * 100}%`}></i>
      </article>
      <span>＋</span>
      <article>
        <small>weight preference</small>
        <strong>λ‖w‖²</strong>
        <b>{format(fit.penalty)}</b>
        <i class="penalty" style={`width:${(fit.penalty / objectiveScale) * 100}%`}></i>
      </article>
      <span>＝</span>
      <article class="total">
        <small>minimized objective</small>
        <strong>전체 목적함수</strong>
        <b>{format(fit.objective)}</b>
        <i style="width:100%"></i>
      </article>
    </div>

    <dl class="metric-grid">
      <div><dt>‖w‖²</dt><dd>{format(fit.weightNormSquared)}</dd></div>
      <div><dt>고차 계수 energy</dt><dd>{format(fit.highOrderEnergy)}</dd></div>
      <div><dt>훈련 SSE</dt><dd>{format(fit.sse)}</dd></div>
      <div><dt>훈련 표본 L</dt><dd>{spec.trainX.length}</dd></div>
    </dl>
  </section>
</div>

<section class="coefficient-panel">
  <header>
    <div>
      <p>‖w‖²를 구성하는 실제 항</p>
      <h6>Chebyshev 계수의 크기와 λwₖ² 기여</h6>
    </div>
    <span>Σwₖ²={format(fit.weightNormSquared)}</span>
  </header>

  <div class="coefficient-grid">
    <div class="coefficient-bars">
      {#each fit.weights as weight, index (index)}
        <div>
          <span>w{index}</span>
          <div class="bar-track">
            <i class:negative={weight < 0} style={`width:${(Math.abs(weight) / maximumWeight) * 100}%`}></i>
          </div>
          <strong>{format(weight, 4)}</strong>
        </div>
      {/each}
    </div>

    <div class="coefficient-table-wrap">
      <table>
        <thead><tr><th>k</th><th>wₖ</th><th>wₖ²</th><th>λwₖ²</th></tr></thead>
        <tbody>
          {#each fit.weights as weight, index (index)}
            <tr>
              <td>{index}</td>
              <td>{format(weight, 5)}</td>
              <td>{format(weight ** 2, 6)}</td>
              <td>{format(lambda * weight ** 2, 6)}</td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr><th colspan="2">합계</th><th>{format(fit.weightNormSquared, 6)}</th><th>{format(fit.penalty, 6)}</th></tr>
        </tfoot>
      </table>
    </div>
  </div>
</section>

<section class="interpretation-rail">
  <article class:active={lambda === 0}>
    <b>λ=0</b>
    <strong>훈련점 맞추기만 우선</strong>
    <p>작은 계수에 대한 선호가 없어 고차항이 노이즈를 따라갈 수 있다.</p>
  </article>
  <article class:active={lambda > 0 && lambda < 0.1}>
    <b>중간 λ</b>
    <strong>fit–complexity 절충</strong>
    <p>훈련오차를 조금 허용하고 계수 크기와 곡선의 요동을 줄인다.</p>
  </article>
  <article class:active={lambda >= 0.1}>
    <b>큰 λ</b>
    <strong>과도한 shrinkage</strong>
    <p>가중치가 지나치게 작아져 실제 이차 구조까지 충분히 표현하지 못할 수 있다.</p>
  </article>
</section>

<aside class="assumptions">
  <strong>원자료 Figure 3과 식을 연결하는 조건</strong>
  <ul>
    {#each spec.assumptions as assumption, index (index)}
      <li>{assumption}</li>
    {/each}
  </ul>
</aside>

<style>
  .ridge-layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(19rem,.75fr);gap:.9rem;align-items:start}.chart-panel,.control-panel,.coefficient-panel,.interpretation-rail,.assumptions{border:1px solid color-mix(in srgb,var(--color-border) 82%,transparent);border-radius:1rem;background:color-mix(in srgb,var(--color-background) 93%,transparent)}.chart-panel,.control-panel,.coefficient-panel{overflow:hidden}.chart-panel>header,.control-panel>header,.coefficient-panel>header{display:flex;justify-content:space-between;gap:.75rem;border-bottom:1px solid var(--color-border);padding:.85rem 1rem}.chart-panel header p,.control-panel header p,.coefficient-panel header p{margin:0;font-size:.65rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--color-muted-foreground)}.chart-panel header h6,.control-panel header h6,.coefficient-panel header h6{margin:.15rem 0 0;font-size:.95rem;font-weight:900}.chart-panel header span,.coefficient-panel header span{border-radius:.7rem;background:#7c3aed;color:white;padding:.4rem .65rem;font-size:.68rem;font-weight:900;white-space:nowrap}.control-panel>header{display:block}.chart-scroll{overflow-x:auto;padding:.45rem}.chart-scroll svg{display:block;width:100%;min-width:38rem}.plot-bg{fill:white}.axis{stroke:#94a3b8;stroke-width:1.2}.truth-curve{fill:none;stroke:#64748b;stroke-width:3;stroke-dasharray:8 6}.fit-curve{fill:none;stroke:#7c3aed;stroke-width:4}.train-residual{stroke:#f97316;stroke-width:1.3;opacity:.42}.train-point{fill:#0f766e;stroke:white;stroke-width:2}.legend{display:flex;flex-wrap:wrap;gap:.7rem;border-top:1px solid var(--color-border);padding:.7rem .9rem;font-size:.68rem;color:var(--color-muted-foreground)}.legend span{display:flex;align-items:center;gap:.3rem}.legend i{display:inline-block}.data-dot{width:.7rem;height:.7rem;border-radius:999px;background:#0f766e}.truth-line,.fit-line{width:1.6rem;height:.18rem}.truth-line{background:repeating-linear-gradient(90deg,#64748b 0 5px,transparent 5px 8px)}.fit-line{background:#7c3aed}.lambda-control{display:grid;gap:.7rem;padding:1rem}.lambda-control label{display:grid;grid-template-columns:1fr auto;gap:.3rem;font-size:.75rem;font-weight:900}.lambda-control output{color:var(--color-primary)}.lambda-control input{grid-column:1/-1;min-height:32px;width:100%}.preset-grid{display:grid;gap:.4rem}.preset-grid button{min-height:42px;border:1px solid var(--color-border);border-radius:.7rem;background:var(--color-background);color:var(--color-foreground);padding:.45rem .65rem;text-align:left;font-size:.68rem;font-weight:800}.preset-grid button.active{border-color:#7c3aed;background:#7c3aed10;color:#6d28d9}.objective-equation{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:.4rem;align-items:center;border-top:1px solid var(--color-border);padding:.75rem}.objective-equation>span{font-size:1rem;font-weight:900;color:var(--color-muted-foreground)}.objective-equation article{min-width:0;border:1px solid var(--color-border);border-radius:.7rem;background:var(--color-background);padding:.55rem;overflow:hidden}.objective-equation article.total{border-color:#7c3aed;background:#7c3aed0d}.objective-equation small,.objective-equation strong,.objective-equation b{display:block}.objective-equation small{font-size:.58rem;color:var(--color-muted-foreground)}.objective-equation strong{font-size:.68rem}.objective-equation b{margin:.15rem 0;font-size:.76rem}.objective-equation i{display:block;height:.28rem;border-radius:999px;background:#0f766e}.objective-equation i.penalty{background:#f97316}.objective-equation article.total i{background:#7c3aed}.metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:.45rem;margin:0;border-top:1px solid var(--color-border);padding:.75rem}.metric-grid div{border:1px solid var(--color-border);border-radius:.65rem;background:var(--color-background);padding:.55rem}.metric-grid dt{font-size:.6rem;color:var(--color-muted-foreground)}.metric-grid dd{margin:.15rem 0 0;font-size:.82rem;font-weight:900}.coefficient-panel,.interpretation-rail,.assumptions{margin-top:.9rem}.coefficient-grid{display:grid;grid-template-columns:minmax(18rem,.8fr) minmax(23rem,1.2fr);gap:.8rem;padding:.8rem}.coefficient-bars{display:grid;gap:.45rem}.coefficient-bars>div{display:grid;grid-template-columns:2rem 1fr 5rem;gap:.45rem;align-items:center;font-size:.68rem}.bar-track{height:1rem;border-radius:.5rem;background:var(--color-muted);overflow:hidden}.bar-track i{display:block;height:100%;background:#0ea5e9}.bar-track i.negative{background:#f97316}.coefficient-bars strong{text-align:right;font-variant-numeric:tabular-nums}.coefficient-table-wrap{max-height:22rem;overflow:auto;border:1px solid var(--color-border);border-radius:.75rem}.coefficient-table-wrap table{margin:0;min-width:24rem;width:100%;border-collapse:collapse}.coefficient-table-wrap th,.coefficient-table-wrap td{border-bottom:1px solid var(--color-border);padding:.48rem;text-align:right;font-size:.68rem}.coefficient-table-wrap th{position:sticky;top:0;background:var(--color-muted);font-weight:900}.coefficient-table-wrap tfoot th{position:static;background:var(--color-background)}.interpretation-rail{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;padding:.7rem}.interpretation-rail article{border:1px solid var(--color-border);border-radius:.75rem;background:var(--color-background);padding:.75rem}.interpretation-rail article.active{border-color:#7c3aed;background:#7c3aed0d}.interpretation-rail b,.interpretation-rail strong{display:block}.interpretation-rail b{font-size:.65rem;color:var(--color-primary)}.interpretation-rail strong{margin:.15rem 0;font-size:.78rem}.interpretation-rail p{margin:0;font-size:.69rem;line-height:1.55;color:var(--color-muted-foreground)}.assumptions{padding:.9rem 1rem;font-size:.75rem;line-height:1.65}.assumptions ul{margin:.4rem 0 0;padding-left:1.2rem}@media(max-width:900px){.ridge-layout,.coefficient-grid{grid-template-columns:1fr}.interpretation-rail{grid-template-columns:1fr}.chart-panel header span,.coefficient-panel header span{white-space:normal}}@media(max-width:560px){.objective-equation{grid-template-columns:1fr}.objective-equation>span{text-align:center}.metric-grid{grid-template-columns:1fr 1fr}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

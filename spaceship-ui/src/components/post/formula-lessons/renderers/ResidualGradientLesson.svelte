<script>
  import {
    computeScalarSquaredResidual,
    computeWeightedResidualGradient,
    finiteDifferenceGradient,
  } from '@/lib/formula-lessons/residual-gradient.mjs';

  export let lesson;
  export let spec;

  let x1 = spec.initialX[0];
  let x2 = spec.initialX[1];
  let scalarA = spec.scalarExample.a;
  let scalarX = spec.scalarExample.x;
  let scalarB = spec.scalarExample.b;

  $: isScalar = lesson.focus === 'scalar-chain-rule';
  $: activeWeights = lesson.focus === 'unweighted-residual-gradient' ? [1, 1] : spec.weights;
  $: matrixState = {
    A: spec.A,
    x: [Number(x1), Number(x2)],
    y: spec.y,
    weights: activeWeights,
  };
  $: matrixResult = computeWeightedResidualGradient(matrixState);
  $: finiteDifference = finiteDifferenceGradient(matrixState);
  $: gradientError = Math.hypot(
    ...matrixResult.gradient.map((value, index) => value - finiteDifference[index]),
  );
  $: scalarResult = computeScalarSquaredResidual({
    a: Number(scalarA),
    x: Number(scalarX),
    b: Number(scalarB),
  });

  function format(value, digits = 3) {
    return Number(value).toFixed(digits);
  }

  function resetMatrix() {
    [x1, x2] = spec.initialX;
  }

  function resetScalar() {
    scalarA = spec.scalarExample.a;
    scalarX = spec.scalarExample.x;
    scalarB = spec.scalarExample.b;
  }

  const plot = { left: 52, right: 520, top: 26, bottom: 270 };
  function sx(value) {
    return plot.left + ((value + 2) / 4) * (plot.right - plot.left);
  }
  function sy(value) {
    const capped = Math.min(12, Math.max(0, value));
    return plot.bottom - (capped / 12) * (plot.bottom - plot.top);
  }
  function buildScalarPath(a, b) {
    return Array.from({ length: 121 }, (_, index) => {
      const value = -2 + (index / 120) * 4;
      const loss = (a * value - b) ** 2;
      return `${index === 0 ? 'M' : 'L'} ${sx(value)} ${sy(loss)}`;
    }).join(' ');
  }
  $: scalarPath = buildScalarPath(Number(scalarA), Number(scalarB));
</script>

{#if isScalar}
  <div class="scalar-layout" data-residual-gradient-focus={lesson.focus}>
    <section class="visual-panel">
      <header>
        <div><p>1차원 chain rule</p><h6>(ax−b)²의 미분</h6></div>
        <span>{format(scalarResult.derivative)}</span>
      </header>
      <div class="canvas-scroll">
        <svg viewBox="0 0 560 310" role="img" aria-label="제곱잔차 함수와 현재 미분값">
          <rect width="560" height="310" rx="18" class="plot-bg" />
          <line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} class="axis" />
          <line x1={sx(0)} y1={plot.top} x2={sx(0)} y2={plot.bottom} class="axis" />
          <path d={scalarPath} class="loss-curve" />
          <line
            x1={sx(Number(scalarX))}
            y1={sy(scalarResult.loss)}
            x2={sx(Number(scalarX))}
            y2={plot.bottom}
            class="guide-line"
          />
          <circle cx={sx(Number(scalarX))} cy={sy(scalarResult.loss)} r="7" class="current-point" />
          <text x="58" y="48" class="plot-label">loss=(ax−b)²</text>
        </svg>
      </div>
    </section>

    <section class="control-panel">
      <header><p>수식의 실제 기호</p><h6>a, x, b</h6></header>
      <div class="controls">
        <label><span>a</span><output>{format(scalarA, 2)}</output><input bind:value={scalarA} type="range" min="-2" max="2" step="0.05" /></label>
        <label><span>x</span><output>{format(scalarX, 2)}</output><input bind:value={scalarX} type="range" min="-2" max="2" step="0.05" /></label>
        <label><span>b</span><output>{format(scalarB, 2)}</output><input bind:value={scalarB} type="range" min="-2" max="2" step="0.05" /></label>
        <button type="button" on:click={resetScalar}>예제값 복원</button>
      </div>
      <ol class="pipeline">
        <li><b>1</b><span>예측</span><strong>ax = {format(scalarResult.prediction)}</strong></li>
        <li><b>2</b><span>잔차</span><strong>ax−b = {format(scalarResult.residual)}</strong></li>
        <li><b>3</b><span>제곱</span><strong>(ax−b)² = {format(scalarResult.loss)}</strong></li>
        <li class="active"><b>4</b><span>chain rule</span><strong>2a(ax−b) = {format(scalarResult.derivative)}</strong></li>
      </ol>
    </section>
  </div>
{:else}
  <div class="matrix-layout" data-residual-gradient-focus={lesson.focus}>
    <section class="pipeline-panel">
      <header>
        <div><p>같은 계산 그래프</p><h6>{spec.focusLabels[lesson.focus]}</h6></div>
        <span>loss {format(matrixResult.loss)}</span>
      </header>

      <div class="vector-flow">
        <article><small>입력</small><strong>x</strong><code>[{format(x1)}, {format(x2)}]</code></article>
        <b>→ A</b>
        <article><small>예측</small><strong>Ax</strong><code>[{matrixResult.prediction.map((v) => format(v)).join(', ')}]</code></article>
        <b>− y</b>
        <article><small>잔차</small><strong>r</strong><code>[{matrixResult.residual.map((v) => format(v)).join(', ')}]</code></article>
        <b>→ W</b>
        <article><small>가중 잔차</small><strong>Wr</strong><code>[{matrixResult.weightedResidual.map((v) => format(v)).join(', ')}]</code></article>
        <b>→ 2Aᵀ</b>
        <article class="gradient"><small>출력</small><strong>∇</strong><code>[{matrixResult.gradient.map((v) => format(v)).join(', ')}]</code></article>
      </div>

      <div class="gradient-bars">
        {#each matrixResult.gradient as value, index (index)}
          <div>
            <span>∂L/∂x{index + 1}</span>
            <div class="bar-track"><i class:negative={value < 0} style={`width:${Math.min(100, Math.abs(value) * 8)}%`}></i></div>
            <strong>{format(value)}</strong>
          </div>
        {/each}
      </div>
    </section>

    <section class="control-panel">
      <header><p>미분할 변수</p><h6>x</h6></header>
      <div class="controls">
        <label><span>x₁</span><output>{format(x1, 2)}</output><input bind:value={x1} type="range" min="-2" max="2" step="0.05" /></label>
        <label><span>x₂</span><output>{format(x2, 2)}</output><input bind:value={x2} type="range" min="-2" max="2" step="0.05" /></label>
        <button type="button" on:click={resetMatrix}>예제값 복원</button>
      </div>
      <dl class="matrix-readout">
        <div><dt>A</dt><dd>[[1, 2], [−1, 1]]</dd></div>
        <div><dt>y</dt><dd>[1.2, −0.5]</dd></div>
        <div><dt>W 대각</dt><dd>[{activeWeights.join(', ')}]</dd></div>
        <div><dt>유한차분 ∇</dt><dd>[{finiteDifference.map((v) => format(v)).join(', ')}]</dd></div>
        <div><dt>검산 오차</dt><dd>{gradientError.toExponential(2)}</dd></div>
      </dl>
    </section>
  </div>
{/if}

<aside class="assumptions">
  <strong>수식과 화면의 연결</strong>
  <ul>
    {#each spec.assumptions as assumption, index (index)}
      <li>{assumption}</li>
    {/each}
  </ul>
</aside>

<style>
  .scalar-layout,.matrix-layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(17rem,.75fr);gap:.9rem;align-items:start}.visual-panel,.pipeline-panel,.control-panel,.assumptions{border:1px solid color-mix(in srgb,var(--color-border) 82%,transparent);border-radius:1rem;background:color-mix(in srgb,var(--color-background) 93%,transparent)}.visual-panel,.pipeline-panel,.control-panel{overflow:hidden}.visual-panel>header,.pipeline-panel>header,.control-panel>header{display:flex;justify-content:space-between;gap:.75rem;border-bottom:1px solid var(--color-border);padding:.85rem 1rem}.visual-panel header p,.pipeline-panel header p,.control-panel header p{margin:0;font-size:.65rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--color-muted-foreground)}.visual-panel header h6,.pipeline-panel header h6,.control-panel header h6{margin:.15rem 0 0;font-size:.95rem;font-weight:900}.visual-panel header span,.pipeline-panel header span{border-radius:.7rem;background:#7c3aed;color:white;padding:.4rem .65rem;font-size:.75rem;font-weight:900}.canvas-scroll{overflow-x:auto;padding:.5rem}.canvas-scroll svg{display:block;width:100%;min-width:34rem}.plot-bg{fill:white}.axis{stroke:#64748b;stroke-width:1.4}.loss-curve{fill:none;stroke:#7c3aed;stroke-width:4}.guide-line{stroke:#f97316;stroke-width:2;stroke-dasharray:5 4}.current-point{fill:#f97316;stroke:white;stroke-width:2}.plot-label{fill:#64748b;font-size:13px;font-weight:800}.controls{display:grid;gap:.7rem;padding:1rem}.controls label{display:grid;grid-template-columns:1fr auto;gap:.25rem;font-size:.75rem;font-weight:900}.controls output{color:var(--color-primary)}.controls input{grid-column:1/-1;min-height:30px;width:100%}.controls button{min-height:44px;border:1px solid color-mix(in srgb,var(--color-primary) 35%,var(--color-border));border-radius:.75rem;background:color-mix(in srgb,var(--color-primary) 10%,var(--color-background));color:var(--color-foreground);font-size:.72rem;font-weight:900}.pipeline{list-style:none;margin:0;border-top:1px solid var(--color-border);padding:.75rem;display:grid;gap:.4rem}.pipeline li{display:grid;grid-template-columns:1.6rem 1fr auto;gap:.45rem;align-items:center;border-radius:.65rem;padding:.45rem;background:var(--color-muted);font-size:.7rem}.pipeline li b{display:grid;width:1.5rem;height:1.5rem;place-items:center;border-radius:999px;background:var(--color-background)}.pipeline li.active{border:1px solid #7c3aed55;background:#7c3aed10}.vector-flow{display:flex;align-items:center;gap:.45rem;overflow-x:auto;padding:1rem;min-width:44rem}.vector-flow article{min-width:7.2rem;border:1px solid var(--color-border);border-radius:.75rem;background:var(--color-background);padding:.65rem}.vector-flow article.gradient{border-color:#7c3aed66;background:#7c3aed10}.vector-flow small,.vector-flow strong,.vector-flow code{display:block}.vector-flow small{color:var(--color-muted-foreground);font-size:.62rem}.vector-flow strong{margin:.1rem 0;font-size:.85rem}.vector-flow code{font-size:.67rem;white-space:nowrap}.vector-flow>b{color:var(--color-muted-foreground);font-size:.7rem;white-space:nowrap}.gradient-bars{display:grid;gap:.55rem;border-top:1px solid var(--color-border);padding:.8rem}.gradient-bars>div{display:grid;grid-template-columns:5rem 1fr 4rem;gap:.5rem;align-items:center;font-size:.7rem}.bar-track{height:1.1rem;border-radius:.5rem;background:var(--color-muted);overflow:hidden}.bar-track i{display:block;height:100%;background:#0ea5e9}.bar-track i.negative{background:#f97316}.matrix-readout{display:grid;gap:.35rem;margin:0;border-top:1px solid var(--color-border);padding:.8rem}.matrix-readout div{display:grid;grid-template-columns:5.5rem 1fr;gap:.5rem;border-radius:.55rem;background:var(--color-muted);padding:.45rem;font-size:.68rem}.matrix-readout dt{font-weight:900}.matrix-readout dd{margin:0;word-break:break-all}.assumptions{margin-top:.9rem;padding:.9rem 1rem;font-size:.75rem;line-height:1.6}.assumptions ul{margin:.4rem 0 0;padding-left:1.2rem}@media(max-width:850px){.scalar-layout,.matrix-layout{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

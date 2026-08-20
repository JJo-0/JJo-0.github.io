<script>
  import {
    buildSyntheticRegressionDataset,
    computeGeneralizationRidge,
    evaluateQuadratic,
    predictPolynomial,
    simulateExpectedGeneralizationGap,
  } from '@/lib/formula-lessons/generalization-ridge.mjs';

  export let lesson;
  export let spec;

  const focus = lesson.focus;
  const dataset = buildSyntheticRegressionDataset(spec.dataset);
  const result = computeGeneralizationRidge({
    dataset,
    degree: spec.degree,
    lambda: 0,
  });
  const fit = result.unregularized;
  const expectation = simulateExpectedGeneralizationGap({
    ...spec.expectation,
    degree: spec.degree,
    lambda: 0,
  });
  const curveX = Array.from({ length: 121 }, (_, index) => -1 + (2 * index) / 120);
  const trueCurve = curveX.map((value) => evaluateQuadratic(value, spec.dataset.trueCoefficients));
  const fittedCurve = predictPolynomial(fit.weights, curveX);
  const allY = [
    ...dataset.train.y,
    ...dataset.test.y,
    ...trueCurve,
    ...fittedCurve,
  ];
  const yMinimum = Math.min(...allY) - 0.12;
  const yMaximum = Math.max(...allY) + 0.12;
  const chart = { left: 54, right: 620, top: 26, bottom: 326 };
  const expectationMaximum = Math.max(
    expectation.expectedTrainError,
    expectation.expectedTestError,
  );
  let selectedTestIndex = 0;

  function format(value, digits = 4) {
    return Number(value).toFixed(digits);
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

  const truePath = makePath(curveX, trueCurve);
  const fittedPath = makePath(curveX, fittedCurve);

  function selectTest(index) {
    selectedTestIndex = index;
  }
</script>

<div class="generalization-layout" data-generalization-focus={focus}>
  <section class="chart-panel">
    <header>
      <div>
        <p>현재 수식의 초점</p>
        <h6>{spec.focusLabels[focus]}</h6>
      </div>
      <span>w★는 train으로만 계산</span>
    </header>

    <div class="chart-scroll">
      <svg viewBox="0 0 660 360" role="img" aria-label="훈련 표본, 시험 표본, 실제 이차함수와 훈련 집합으로 적합한 모델">
        <rect width="660" height="360" rx="18" class="plot-bg" />
        <line x1={chart.left} y1={chart.bottom} x2={chart.right} y2={chart.bottom} class="axis" />
        <line x1={xScale(0)} y1={chart.top} x2={xScale(0)} y2={chart.bottom} class="axis" />
        <path d={truePath} class="truth-curve" />
        <path d={fittedPath} class="fit-curve" />

        {#if focus === 'test-mse'}
          {#each dataset.test.x as value, index (index)}
            <line
              x1={xScale(value)}
              y1={yScale(dataset.test.y[index])}
              x2={xScale(value)}
              y2={yScale(fit.testPrediction[index])}
              class:selected-residual={selectedTestIndex === index}
              class="test-residual"
            />
          {/each}
        {/if}

        {#each dataset.train.x as value, index (index)}
          <circle cx={xScale(value)} cy={yScale(dataset.train.y[index])} r="5" class="train-point" />
        {/each}
        {#each dataset.test.x as value, index (index)}
          <button aria-label={`시험 표본 ${index + 1} 선택`} on:click={() => selectTest(index)}>
            <circle
              cx={xScale(value)}
              cy={yScale(dataset.test.y[index])}
              r={selectedTestIndex === index ? 7 : 4.5}
              class:selected={selectedTestIndex === index}
              class="test-point"
            />
          </button>
        {/each}
      </svg>
    </div>

    <div class="legend">
      <span><i class="train-dot"></i>훈련 표본 L={dataset.train.x.length}</span>
      <span><i class="test-dot"></i>시험 표본 M={dataset.test.x.length}</span>
      <span><i class="truth-line"></i>데이터 생성 이차함수</span>
      <span><i class="fit-line"></i>훈련으로 고른 w★</span>
    </div>
  </section>

  <section class="metric-panel">
    <header>
      <p>분리 원칙</p>
      <h6>fit on train, evaluate on test</h6>
    </header>
    <ol class="process-rail">
      <li><b>1</b><span>훈련 표본 추출</span><strong>L={dataset.train.x.length}</strong></li>
      <li><b>2</b><span>훈련 MSE 최소화</span><strong>w★ 선택</strong></li>
      <li><b>3</b><span>독립 시험 표본 추출</span><strong>M={dataset.test.x.length}</strong></li>
      <li class:active={focus === 'test-mse'}><b>4</b><span>시험 잔차 제곱 평균</span><strong>{format(fit.testMse)}</strong></li>
      <li class:active={focus === 'expected-gap'}><b>5</b><span>전체 절차 반복 후 평균</span><strong>{spec.expectation.trials}회</strong></li>
    </ol>

    <dl class="metric-grid">
      <div><dt>MSE train</dt><dd>{format(fit.mse)}</dd></div>
      <div class:active={focus === 'test-mse'}><dt>MSE test</dt><dd>{format(fit.testMse)}</dd></div>
      <div><dt>한 분할의 gap</dt><dd>{format(fit.generalizationGap)}</dd></div>
      <div><dt>모델 차수</dt><dd>{spec.degree}</dd></div>
    </dl>
  </section>
</div>

<section class:active={focus === 'test-mse'} class="test-calculation">
  <header>
    <div>
      <p>MAI-P2-034 · test MSE</p>
      <h6>선택한 시험 표본의 중간 계산</h6>
    </div>
    <span>sample {selectedTestIndex + 1} / {dataset.test.x.length}</span>
  </header>

  <div class="selected-flow">
    <article><small>입력</small><strong>x</strong><code>{format(dataset.test.x[selectedTestIndex], 3)}</code></article>
    <b>→ w★</b>
    <article><small>예측</small><strong>ŷ</strong><code>{format(fit.testPrediction[selectedTestIndex])}</code></article>
    <b>− y</b>
    <article><small>잔차</small><strong>ŷ−y</strong><code>{format(fit.testResidual[selectedTestIndex])}</code></article>
    <b>제곱</b>
    <article class="emphasis"><small>오차 기여</small><strong>(ŷ−y)²</strong><code>{format(fit.testSquaredResidual[selectedTestIndex])}</code></article>
  </div>

  <div class="test-table-wrap">
    <table>
      <thead><tr><th>m</th><th>xₘ</th><th>yₘ(test)</th><th>ŷₘ</th><th>잔차</th><th>잔차²</th></tr></thead>
      <tbody>
        {#each dataset.test.x as value, index (index)}
          <tr class:selected={selectedTestIndex === index} on:click={() => selectTest(index)}>
            <td>{index + 1}</td>
            <td>{format(value, 3)}</td>
            <td>{format(dataset.test.y[index])}</td>
            <td>{format(fit.testPrediction[index])}</td>
            <td>{format(fit.testResidual[index])}</td>
            <td>{format(fit.testSquaredResidual[index])}</td>
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr><th colspan="5">Σ 잔차²</th><th>{format(fit.testSse)}</th></tr>
        <tr><th colspan="5">(1/M)Σ 잔차²</th><th>{format(fit.testMse)}</th></tr>
      </tfoot>
    </table>
  </div>
</section>

<section class:active={focus === 'expected-gap'} class="expectation-panel">
  <header>
    <div>
      <p>MAI-P2-035 · expectation</p>
      <h6>한 번의 분할이 아니라 표본 추출과 학습 전체를 반복</h6>
    </div>
    <span>{expectation.trials} deterministic trials</span>
  </header>

  <div class="expectation-grid">
    <div class="bar-figure" role="img" aria-label="반복 실험에서 평균 훈련오차보다 평균 시험오차가 큰 결과">
      <div>
        <span style={`height:${(expectation.expectedTrainError / expectationMaximum) * 100}%`}></span>
        <strong>{format(expectation.expectedTrainError)}</strong>
        <small>E[train error]</small>
      </div>
      <div>
        <span class="test" style={`height:${(expectation.expectedTestError / expectationMaximum) * 100}%`}></span>
        <strong>{format(expectation.expectedTestError)}</strong>
        <small>E[test error]</small>
      </div>
    </div>

    <div class="expectation-readout">
      <article><small>기대 일반화 간극</small><strong>{format(expectation.expectedGap)}</strong><p>E[test]−E[train]</p></article>
      <article><small>개별 분할의 예외</small><strong>{expectation.reversalCount} / {expectation.trials}</strong><p>test error가 더 작았던 횟수</p></article>
      <p class="interpretation">
        개별 분할에서는 순서가 뒤집힐 수 있지만, 훈련자료로 모델까지 선택한 절차를 반복해 평균하면 시험오차가 더 크게 나타난다.
      </p>
    </div>
  </div>

  <div class="trial-strip" aria-label="첫 24개 반복 실험의 훈련오차와 시험오차 비교">
    {#each expectation.trainErrors.slice(0, 24) as trainError, index (index)}
      <div title={`trial ${index + 1}: train ${format(trainError)}, test ${format(expectation.testErrors[index])}`}>
        <i style={`height:${Math.min(100, (trainError / expectationMaximum) * 100)}%`}></i>
        <i class="test" style={`height:${Math.min(100, (expectation.testErrors[index] / expectationMaximum) * 100)}%`}></i>
      </div>
    {/each}
  </div>
</section>

<aside class="assumptions">
  <strong>원자료의 문장을 정확히 읽는 조건</strong>
  <ul>
    {#each spec.assumptions as assumption, index (index)}
      <li>{assumption}</li>
    {/each}
  </ul>
</aside>

<style>
  .generalization-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(18rem,.65fr);gap:.9rem;align-items:start}.chart-panel,.metric-panel,.test-calculation,.expectation-panel,.assumptions{border:1px solid color-mix(in srgb,var(--color-border) 82%,transparent);border-radius:1rem;background:color-mix(in srgb,var(--color-background) 93%,transparent)}.chart-panel,.metric-panel,.test-calculation,.expectation-panel{overflow:hidden}.chart-panel>header,.metric-panel>header,.test-calculation>header,.expectation-panel>header{display:flex;justify-content:space-between;gap:.75rem;border-bottom:1px solid var(--color-border);padding:.85rem 1rem}.chart-panel header p,.metric-panel header p,.test-calculation header p,.expectation-panel header p{margin:0;font-size:.65rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--color-muted-foreground)}.chart-panel header h6,.metric-panel header h6,.test-calculation header h6,.expectation-panel header h6{margin:.15rem 0 0;font-size:.95rem;font-weight:900}.chart-panel header span,.test-calculation header span,.expectation-panel header span{border-radius:.7rem;background:#7c3aed;color:white;padding:.4rem .65rem;font-size:.68rem;font-weight:900;white-space:nowrap}.chart-scroll{overflow-x:auto;padding:.45rem}.chart-scroll svg{display:block;width:100%;min-width:38rem}.plot-bg{fill:white}.axis{stroke:#94a3b8;stroke-width:1.2}.truth-curve{fill:none;stroke:#64748b;stroke-width:3;stroke-dasharray:8 6}.fit-curve{fill:none;stroke:#7c3aed;stroke-width:4}.train-point{fill:#0f766e;stroke:white;stroke-width:2}.test-point{fill:#f97316;stroke:white;stroke-width:2;cursor:pointer}.test-point.selected{fill:#dc2626;stroke:#111827;stroke-width:2.5}.test-residual{stroke:#fb923c;stroke-width:1.2;opacity:.28}.test-residual.selected-residual{stroke:#dc2626;stroke-width:3;opacity:1}.legend{display:flex;flex-wrap:wrap;gap:.7rem;border-top:1px solid var(--color-border);padding:.7rem .9rem;font-size:.68rem;color:var(--color-muted-foreground)}.legend span{display:flex;align-items:center;gap:.3rem}.legend i{display:inline-block}.train-dot,.test-dot{width:.7rem;height:.7rem;border-radius:999px}.train-dot{background:#0f766e}.test-dot{background:#f97316}.truth-line,.fit-line{width:1.6rem;height:.18rem}.truth-line{background:repeating-linear-gradient(90deg,#64748b 0 5px,transparent 5px 8px)}.fit-line{background:#7c3aed}.metric-panel>header{display:block}.process-rail{list-style:none;margin:0;padding:.75rem;display:grid;gap:.45rem}.process-rail li{display:grid;grid-template-columns:1.7rem 1fr auto;gap:.45rem;align-items:center;border:1px solid transparent;border-radius:.65rem;background:var(--color-muted);padding:.55rem;font-size:.69rem}.process-rail li b{display:grid;width:1.55rem;height:1.55rem;place-items:center;border-radius:999px;background:var(--color-background)}.process-rail li.active{border-color:#7c3aed;background:#7c3aed10}.metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:.45rem;margin:0;border-top:1px solid var(--color-border);padding:.75rem}.metric-grid div{border:1px solid var(--color-border);border-radius:.65rem;background:var(--color-background);padding:.6rem}.metric-grid div.active{border-color:#7c3aed;background:#7c3aed0d}.metric-grid dt{font-size:.62rem;color:var(--color-muted-foreground)}.metric-grid dd{margin:.15rem 0 0;font-size:.9rem;font-weight:900}.test-calculation,.expectation-panel,.assumptions{margin-top:.9rem}.test-calculation.active,.expectation-panel.active{border-color:#7c3aed88;box-shadow:0 0 0 1px #7c3aed22}.selected-flow{display:flex;align-items:center;gap:.5rem;overflow-x:auto;padding:1rem;min-width:43rem}.selected-flow article{min-width:7.2rem;border:1px solid var(--color-border);border-radius:.75rem;background:var(--color-background);padding:.65rem;text-align:center}.selected-flow article.emphasis{border-color:#7c3aed;background:#7c3aed10}.selected-flow small,.selected-flow strong,.selected-flow code{display:block}.selected-flow small{font-size:.62rem;color:var(--color-muted-foreground)}.selected-flow strong{margin:.1rem 0;font-size:.78rem}.selected-flow code{font-size:.72rem}.selected-flow>b{font-size:.69rem;color:var(--color-muted-foreground);white-space:nowrap}.test-table-wrap{max-height:19rem;overflow:auto;border-top:1px solid var(--color-border)}.test-table-wrap table{margin:0;min-width:42rem;width:100%;border-collapse:collapse}.test-table-wrap th,.test-table-wrap td{border-bottom:1px solid var(--color-border);padding:.5rem;text-align:right;font-size:.7rem}.test-table-wrap th{position:sticky;top:0;background:var(--color-muted);font-weight:900}.test-table-wrap tbody tr{cursor:pointer}.test-table-wrap tbody tr.selected{background:#7c3aed0d}.test-table-wrap tfoot th{position:static;background:var(--color-background)}.expectation-grid{display:grid;grid-template-columns:minmax(15rem,.8fr) minmax(16rem,1.2fr);gap:.8rem;padding:1rem}.bar-figure{display:flex;height:15rem;align-items:flex-end;justify-content:center;gap:2rem;border:1px solid var(--color-border);border-radius:.8rem;background:var(--color-muted);padding:1rem 1rem .75rem}.bar-figure>div{display:grid;width:6rem;height:100%;grid-template-rows:1fr auto auto;align-items:end;text-align:center}.bar-figure span{display:block;min-height:.25rem;border-radius:.55rem .55rem 0 0;background:#0f766e}.bar-figure span.test{background:#f97316}.bar-figure strong{margin-top:.35rem;font-size:.82rem}.bar-figure small{font-size:.62rem;color:var(--color-muted-foreground)}.expectation-readout{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;align-content:start}.expectation-readout article{border:1px solid var(--color-border);border-radius:.75rem;background:var(--color-background);padding:.75rem}.expectation-readout small{font-size:.62rem;color:var(--color-muted-foreground)}.expectation-readout strong{display:block;margin:.15rem 0;font-size:1rem}.expectation-readout article p{margin:0;font-size:.65rem;color:var(--color-muted-foreground)}.interpretation{grid-column:1/-1;margin:0;border-radius:.75rem;background:#7c3aed0d;padding:.8rem;font-size:.72rem;line-height:1.65}.trial-strip{display:flex;height:6rem;align-items:flex-end;gap:.3rem;overflow-x:auto;border-top:1px solid var(--color-border);padding:.7rem}.trial-strip>div{display:flex;min-width:.8rem;height:100%;align-items:flex-end;gap:1px}.trial-strip i{display:block;width:.35rem;min-height:1px;background:#0f766e}.trial-strip i.test{background:#f97316}.assumptions{padding:.9rem 1rem;font-size:.75rem;line-height:1.65}.assumptions ul{margin:.4rem 0 0;padding-left:1.2rem}@media(max-width:850px){.generalization-layout,.expectation-grid{grid-template-columns:1fr}.chart-panel header span,.test-calculation header span,.expectation-panel header span{white-space:normal}.metric-grid{grid-template-columns:1fr 1fr}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

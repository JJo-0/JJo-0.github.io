<script lang="ts">
  type Mode = 'capacity' | 'folds' | 'bayes' | 'dimension';

  let mode: Mode = 'capacity';
  let capacity = 4;
  let fold = 1;
  let prior = 50;
  let sigma1 = 0.85;
  let sigma2 = 1.2;
  let dimension = 3;

  const points = [
    [30, 178], [62, 149], [92, 158], [124, 118], [156, 130],
    [189, 86], [220, 102], [251, 61], [282, 78], [316, 45],
  ];

  const foldItems = [1, 2, 3, 4, 5];

  function capacityCurve(level: number) {
    const samples = Array.from({ length: 81 }, (_, index) => {
      const x = 20 + index * 4;
      const normalized = (x - 180) / 150;
      const base = 115 - 58 * normalized;
      const bend = level >= 3 ? 22 * (normalized ** 2 - 0.28) : 0;
      const wiggle = level >= 6 ? (level - 5) * 6 * Math.sin(normalized * Math.PI * 3.3) : 0;
      const y = Math.max(20, Math.min(195, base + bend + wiggle));
      return `${x},${y}`;
    });
    return `M ${samples.join(' L ')}`;
  }

  function gaussian(x: number, mean: number, sigma: number) {
    return Math.exp(-0.5 * ((x - mean) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
  }

  function gaussianPath(mean: number, sigma: number, scale = 1) {
    const samples = Array.from({ length: 101 }, (_, index) => {
      const xValue = -4 + index * 0.08;
      const x = 28 + index * 3.1;
      const y = 190 - gaussian(xValue, mean, sigma) * 255 * scale;
      return `${x},${Math.max(25, y)}`;
    });
    return `M ${samples.join(' L ')}`;
  }

  function bayesBoundary(priorValue: number, sigmaOne: number, sigmaTwo: number) {
    const p1 = Math.max(0.01, priorValue / 100);
    const p2 = Math.max(0.01, 1 - p1);
    let bestX = 0;
    let bestGap = Number.POSITIVE_INFINITY;

    for (let index = 0; index <= 1600; index += 1) {
      const x = -4 + index * 0.005;
      const gap = Math.abs(p1 * gaussian(x, -1.25, sigmaOne) - p2 * gaussian(x, 1.15, sigmaTwo));
      if (gap < bestGap && x > -0.5 && x < 0.8) {
        bestGap = gap;
        bestX = x;
      }
    }
    return bestX;
  }

  $: trainError = Math.max(4, 69 - capacity * 8);
  $: testError = Math.round(15 + ((capacity - 4) ** 2) * 3.7);
  $: curve = capacityCurve(capacity);
  $: boundary = bayesBoundary(prior, sigma1, sigma2);
  $: boundaryX = 28 + ((boundary + 4) / 8) * 310;
  const midpointX = 28 + ((-0.05 + 4) / 8) * 310;
  $: requiredPoints = 5 ** dimension;
</script>

<div class="lab" aria-label="머신러닝 기초 인터랙티브 학습 도구">
  <div class="tabs" role="tablist" aria-label="학습 도구 선택">
    <button class:active={mode === 'capacity'} onclick={() => (mode = 'capacity')}>모델 용량</button>
    <button class:active={mode === 'folds'} onclick={() => (mode = 'folds')}>K-fold</button>
    <button class:active={mode === 'bayes'} onclick={() => (mode = 'bayes')}>베이즈 경계</button>
    <button class:active={mode === 'dimension'} onclick={() => (mode = 'dimension')}>차원의 저주</button>
  </div>

  {#if mode === 'capacity'}
    <section>
      <div class="control">
        <label for="capacity">모델 용량: {capacity}</label>
        <input id="capacity" type="range" min="1" max="9" step="1" bind:value={capacity} />
      </div>

      <svg viewBox="0 0 360 220" role="img" aria-label="모델 용량에 따라 회귀 곡선이 단순해지거나 지나치게 구불거리는 모습">
        <line x1="20" y1="200" x2="342" y2="200" class="axis" />
        <line x1="20" y1="20" x2="20" y2="200" class="axis" />
        <path d={curve} class="model-line" />
        {#each points as point (point[0])}
          <circle cx={point[0]} cy={point[1]} r="4.3" class="sample" />
        {/each}
      </svg>

      <div class="metrics">
        <div><span>훈련 오차</span><strong>{trainError}</strong></div>
        <div><span>개념적 테스트 오차</span><strong>{testError}</strong></div>
      </div>
      <p>
        용량을 키우면 훈련 데이터는 더 잘 맞출 수 있지만, 너무 구불거리는 모델은 새로운 데이터에서
        오차가 다시 커질 수 있다. 이 그림의 수치는 설명용이며 실제 실험값이 아니다.
      </p>
    </section>
  {:else if mode === 'folds'}
    <section>
      <div class="control">
        <label for="fold">현재 검증 fold: {fold}</label>
        <input id="fold" type="range" min="1" max="5" step="1" bind:value={fold} />
      </div>

      <div class="folds" aria-label="5-fold 교차검증">
        {#each foldItems as item (item)}
          <div class:test={item === fold}>
            <strong>Fold {item}</strong>
            <span>{item === fold ? '검증에 사용' : '학습에 사용'}</span>
          </div>
        {/each}
      </div>
      <p>
        한 번의 분할만 믿지 않고, 다섯 조각을 차례로 검증용으로 바꾸며 다섯 번 평가한다. 최종 점수는
        다섯 검증 오차의 평균으로 계산한다.
      </p>
    </section>
  {:else if mode === 'bayes'}
    <section>
      <div class="control-grid">
        <label>
          클래스 1 사전확률: {prior}%
          <input type="range" min="10" max="90" step="1" bind:value={prior} />
        </label>
        <label>
          클래스 1 표준편차: {sigma1.toFixed(2)}
          <input type="range" min="0.45" max="1.8" step="0.05" bind:value={sigma1} />
        </label>
        <label>
          클래스 2 표준편차: {sigma2.toFixed(2)}
          <input type="range" min="0.45" max="1.8" step="0.05" bind:value={sigma2} />
        </label>
      </div>

      <svg viewBox="0 0 360 220" role="img" aria-label="두 가우시안 클래스의 확률밀도와 베이즈 결정경계">
        <line x1="28" y1="190" x2="338" y2="190" class="axis" />
        <path d={gaussianPath(-1.25, sigma1, Math.max(0.35, prior / 50))} class="class-one" />
        <path d={gaussianPath(1.15, sigma2, Math.max(0.35, (100 - prior) / 50))} class="class-two" />
        <line x1={midpointX} y1="28" x2={midpointX} y2="190" class="midpoint" />
        <line x1={boundaryX} y1="28" x2={boundaryX} y2="190" class="boundary" />
        <text x={Math.min(290, Math.max(35, boundaryX + 5))} y="42" class="label">Bayes</text>
        <text x={Math.min(290, Math.max(35, midpointX + 5))} y="62" class="label muted">중점</text>
      </svg>
      <p>
        최소거리 분류기는 두 평균의 중점을 경계로 삼는다. 베이즈 분류기는 분산과 사전확률까지
        고려하므로 경계가 움직인다. 두 공분산이 같고 사전확률도 같을 때 두 경계가 일치한다.
      </p>
    </section>
  {:else}
    <section>
      <div class="control">
        <label for="dimension">차원: {dimension}</label>
        <input id="dimension" type="range" min="1" max="8" step="1" bind:value={dimension} />
      </div>

      <div class="dimension-card">
        <span>축마다 5개 지점을 유지하려면</span>
        <strong>{requiredPoints.toLocaleString()}개</strong>
        <small>5<sup>{dimension}</sup> = {requiredPoints.toLocaleString()}</small>
      </div>

      <div class="growth" aria-hidden="true">
        <div style={`width: ${Math.max(3, (Math.log10(requiredPoints) / Math.log10(5 ** 8)) * 100)}%`}></div>
      </div>
      <p>
        각 축에서 같은 해상도를 유지하려 해도 필요한 표본 수가 지수적으로 증가한다. 강의자료의
        1차원 5개, 2차원 25개, 3차원 125개 그림을 8차원까지 확장한 설명이다.
      </p>
    </section>
  {/if}
</div>

<style>
  .lab {
    margin: 2rem 0;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    border-radius: 1.25rem;
    background: color-mix(in srgb, Canvas 94%, transparent);
    box-shadow: 0 12px 30px color-mix(in srgb, currentColor 8%, transparent);
  }

  .tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
    padding: 0.75rem;
    border-bottom: 1px solid color-mix(in srgb, currentColor 15%, transparent);
    background: color-mix(in srgb, currentColor 4%, transparent);
  }

  .tabs button {
    border: 1px solid transparent;
    border-radius: 999px;
    padding: 0.65rem 0.75rem;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 800;
    cursor: pointer;
  }

  .tabs button.active {
    border-color: color-mix(in srgb, currentColor 24%, transparent);
    background: color-mix(in srgb, currentColor 10%, transparent);
  }

  section {
    padding: 1rem 1rem 1.25rem;
  }

  section > p {
    margin: 1rem 0 0;
    font-size: 0.9rem;
    line-height: 1.75;
    opacity: 0.8;
  }

  .control,
  .control-grid {
    display: grid;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }

  .control label,
  .control-grid label {
    display: grid;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 800;
  }

  input[type='range'] {
    width: 100%;
    accent-color: currentColor;
  }

  svg {
    width: 100%;
    max-height: 23rem;
    border-radius: 0.9rem;
    background: color-mix(in srgb, currentColor 3%, transparent);
  }

  .axis {
    stroke: currentColor;
    stroke-width: 1.4;
    opacity: 0.45;
  }

  .sample {
    fill: currentColor;
  }

  .model-line {
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 0.8rem;
  }

  .metrics div,
  .folds div,
  .dimension-card {
    border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
    border-radius: 0.9rem;
    padding: 0.8rem;
    background: color-mix(in srgb, currentColor 3%, transparent);
  }

  .metrics span,
  .folds span,
  .dimension-card span,
  .dimension-card small {
    display: block;
    font-size: 0.72rem;
    opacity: 0.7;
  }

  .metrics strong,
  .dimension-card strong {
    display: block;
    margin-top: 0.15rem;
    font-size: 1.35rem;
  }

  .folds {
    display: grid;
    gap: 0.55rem;
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .folds div {
    min-height: 5.5rem;
  }

  .folds div.test {
    outline: 2px solid currentColor;
    outline-offset: -2px;
    background: color-mix(in srgb, currentColor 12%, transparent);
  }

  .folds strong {
    display: block;
    font-size: 0.78rem;
  }

  .class-one,
  .class-two {
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
  }

  .class-two {
    stroke-dasharray: 7 5;
    opacity: 0.72;
  }

  .midpoint,
  .boundary {
    stroke: currentColor;
    stroke-width: 1.5;
    opacity: 0.45;
  }

  .boundary {
    stroke-width: 2.5;
    opacity: 1;
  }

  .label {
    fill: currentColor;
    font-size: 11px;
    font-weight: 800;
  }

  .label.muted {
    opacity: 0.55;
  }

  .dimension-card {
    text-align: center;
    padding: 1.4rem;
  }

  .dimension-card strong {
    font-size: clamp(1.7rem, 7vw, 3rem);
  }

  .growth {
    height: 0.8rem;
    margin-top: 1rem;
    overflow: hidden;
    border-radius: 999px;
    background: color-mix(in srgb, currentColor 10%, transparent);
  }

  .growth > div {
    height: 100%;
    border-radius: inherit;
    background: currentColor;
    transition: width 180ms ease;
  }

  @media (min-width: 640px) {
    .tabs {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    section {
      padding: 1.25rem 1.4rem 1.5rem;
    }

    .control-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>

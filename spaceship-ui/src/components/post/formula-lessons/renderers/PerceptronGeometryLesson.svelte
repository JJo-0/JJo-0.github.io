<script>
  import { computePerceptronGeometry } from '@/lib/formula-lessons/perceptron-geometry.mjs';

  export let lesson;
  export let spec;

  let w1 = spec.w[0];
  let w2 = spec.w[1];
  let bias = spec.b;
  let x1 = spec.point[0];
  let x2 = spec.point[1];

  $: safeW1 = Number(w1);
  $: safeW2 = Number(w2);
  $: safeBias = Number(bias);
  $: safeX1 = Number(x1);
  $: safeX2 = Number(x2);
  $: result = computePerceptronGeometry({
    w: [safeW1, safeW2],
    b: safeBias,
    point: [safeX1, safeX2],
    samples: spec.samples,
    lineMapping: spec.lineMapping,
  });

  const f = (value, digits = 3) => Number(value).toFixed(digits);
  const px = (value) => 160 + value * 82;
  const py = (value) => 150 - value * 82;

  $: line = (() => {
    if (result.boundary.kind === 'vertical') {
      const x = px(result.boundary.x);
      return { x1: x, y1: 18, x2: x, y2: 282 };
    }
    const leftX = -1.7;
    const rightX = 1.7;
    const leftY = result.boundary.slope * leftX + result.boundary.intercept;
    const rightY = result.boundary.slope * rightX + result.boundary.intercept;
    return { x1: px(leftX), y1: py(leftY), x2: px(rightX), y2: py(rightY) };
  })();
</script>

<div class="lesson-grid" data-perceptron-geometry-lesson data-focus={lesson.focus}>
  <section class="panel visual-panel">
    <p class="eyebrow">wᵀx+b=0 · exact-ID geometry</p>
    <svg viewBox="0 0 320 300" role="img" aria-label="퍼셉트론 결정경계와 분류 표본">
      <line class="axis" x1="18" y1="150" x2="302" y2="150" />
      <line class="axis" x1="160" y1="18" x2="160" y2="282" />
      <line class="boundary" x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
      {#each result.samples as sample (sample.id)}
        <circle
          class:positive={sample.y === 1}
          class:negative={sample.y === -1}
          cx={px(sample.x[0])}
          cy={py(sample.x[1])}
          r="6"
        />
      {/each}
      <circle class="query" cx={px(safeX1)} cy={py(safeX2)} r="7" />
    </svg>
    <div class="legend">
      <span><i class="positive-dot"></i>S1 / y=+1</span>
      <span><i class="negative-dot"></i>S2 / y=-1</span>
      <span><i class="query-dot"></i>query x</span>
    </div>
  </section>

  <section class="panel">
    <p class="eyebrow">같은 숫자로 score · sign · distance</p>
    <div class="metrics">
      <div><span>g(x)</span><strong>{f(result.score)}</strong></div>
      <div><span>sign(g)</span><strong>{result.decision}</strong></div>
      <div><span>signed distance</span><strong>{f(result.signedDistance)}</strong></div>
      <div><span>|distance|</span><strong>{f(result.distance)}</strong></div>
      <div><span>origin distance</span><strong>{f(result.originDistance)}</strong></div>
      <div><span>all margins &gt; 0</span><strong>{result.allSeparated ? 'PASS' : 'NO'}</strong></div>
    </div>

    <label>w₁ <output>{f(w1, 2)}</output><input bind:value={w1} type="range" min="0.1" max="2" step="0.05" /></label>
    <label>w₂ <output>{f(w2, 2)}</output><input bind:value={w2} type="range" min="-2" max="-0.1" step="0.05" /></label>
    <label>b <output>{f(bias, 2)}</output><input bind:value={bias} type="range" min="-1.5" max="1.5" step="0.05" /></label>
    <label>x₁ <output>{f(x1, 2)}</output><input bind:value={x1} type="range" min="-1.5" max="1.5" step="0.05" /></label>
    <label>x₂ <output>{f(x2, 2)}</output><input bind:value={x2} type="range" min="-1.5" max="1.5" step="0.05" /></label>
  </section>
</div>

<section class="panel table-panel">
  <p class="eyebrow">yₘg(xₘ) margin check</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>sample</th><th>y</th><th>g(x)</th><th>y·g(x)</th><th>correct?</th></tr></thead>
      <tbody>
        {#each result.samples as sample (sample.id)}
          <tr>
            <td>{sample.id}</td><td>{sample.y}</td><td>{f(sample.score)}</td><td>{f(sample.margin)}</td><td>{sample.correct ? 'yes' : 'no'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<aside class="note">
  <strong>Source / correction boundary.</strong>
  MAI-P3-006의 2D 경계와 MAI-P3-141의 <code>y=ax+c</code> 계수 완성은 별도 기록이다.
  원자료 MAI-P3-012/013은 부호가 남는 표현이므로 이 장면의 비음수 거리값은 교정형 MAI-P3-142/143을 따른다.
  선 위 probe에서 editorial mapping residual은 {f(result.lineMapping?.residual ?? 0, 8)}이다.
</aside>

<style>
  .lesson-grid{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}.panel,.note{border:1px solid var(--color-border);border-radius:1rem;background:var(--color-background);padding:1rem}.eyebrow{margin:0 0 .6rem;font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--color-muted-foreground)}svg{width:100%;max-height:20rem}.axis{stroke:var(--color-border);stroke-width:1}.boundary{stroke:var(--color-primary);stroke-width:2.5;stroke-dasharray:7 5}circle{stroke:var(--color-background);stroke-width:2}.positive{fill:var(--color-primary)}.negative{fill:var(--color-foreground)}.query{fill:var(--color-muted-foreground)}.legend{display:flex;flex-wrap:wrap;gap:.8rem;font-size:.7rem;color:var(--color-muted-foreground)}.legend span{display:flex;align-items:center;gap:.3rem}.legend i{width:.65rem;height:.65rem;border-radius:50%}.positive-dot{background:var(--color-primary)}.negative-dot{background:var(--color-foreground)}.query-dot{background:var(--color-muted-foreground)}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem;margin-bottom:.7rem}.metrics div{display:grid;gap:.15rem;border-radius:.7rem;background:var(--color-muted);padding:.6rem;font-size:.72rem}.metrics span{color:var(--color-muted-foreground)}.panel label{display:grid;grid-template-columns:1fr auto;gap:.2rem;margin-top:.45rem;font-size:.72rem;font-weight:800}.panel input{grid-column:1/-1;min-height:30px}.table-panel{margin-top:.8rem}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.72rem}th,td{padding:.45rem;border-bottom:1px solid var(--color-border);text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}.note{margin-top:.8rem;font-size:.74rem;line-height:1.65}@media(max-width:760px){.lesson-grid{grid-template-columns:1fr}.metrics{grid-template-columns:1fr 1fr}}
</style>

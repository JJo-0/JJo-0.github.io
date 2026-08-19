<script lang="ts">
  type Point = { x: number; y: number };
  type Preset = {
    label: string;
    note: string;
    transform: [[number, number], [number, number]];
  };

  const W = 700;
  const H = 430;
  const frame = { left: 54, right: 660, top: 34, bottom: 374 };
  const domain = 5.3;

  const presets: Preset[] = [
    { label: '양의 상관', note: '두 값이 함께 커진다.', transform: [[1.8, 0.72], [0.35, 1.0]] },
    { label: '음의 상관', note: '한 값이 커질수록 다른 값은 작아진다.', transform: [[1.7, -0.8], [-0.25, 1.05]] },
    { label: 'x축 분산 큼', note: '가로 방향으로 길게 퍼진다.', transform: [[2.1, 0], [0, 0.62]] },
    { label: 'y축 분산 큼', note: '세로 방향으로 길게 퍼진다.', transform: [[0.62, 0], [0, 2.1]] },
  ];

  const seed: Point[] = Array.from({ length: 34 }, (_, i) => {
    const angle = (i * 2.3999632297) % (Math.PI * 2);
    const radius = 0.38 + ((i * 17) % 23) / 20;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });

  let presetIndex = 0;
  let stage = 1;
  let angleDeg = 20;
  let showDropLines = true;
  let svg: SVGSVGElement;

  $: preset = presets[presetIndex];
  $: raw = seed.map(({ x, y }) => ({
    x: preset.transform[0][0] * x + preset.transform[0][1] * y + 0.85,
    y: preset.transform[1][0] * x + preset.transform[1][1] * y - 0.55,
  }));
  $: mean = raw.reduce(
    (sum, p) => ({ x: sum.x + p.x / raw.length, y: sum.y + p.y / raw.length }),
    { x: 0, y: 0 },
  );
  $: centered = raw.map((p) => ({ x: p.x - mean.x, y: p.y - mean.y }));
  $: covariance = covariance2d(centered);
  $: eig = eigen2d(covariance);
  $: pc1Angle = normalizeAngle((Math.atan2(eig.v1.y, eig.v1.x) * 180) / Math.PI);
  $: theta = (angleDeg * Math.PI) / 180;
  $: axis = { x: Math.cos(theta), y: Math.sin(theta) };
  $: points = stage >= 2 ? centered : raw;
  $: origin = stage >= 2 ? { x: 0, y: 0 } : mean;
  $: projections = points.map((p) => {
    const dx = p.x - origin.x;
    const dy = p.y - origin.y;
    const score = dx * axis.x + dy * axis.y;
    return {
      score,
      point: { x: origin.x + score * axis.x, y: origin.y + score * axis.y },
    };
  });
  $: projectedVariance = projections.reduce((sum, p) => sum + p.score ** 2, 0) / projections.length;
  $: totalVariance = covariance[0][0] + covariance[1][1];
  $: preserved = totalVariance > 0 ? projectedVariance / totalVariance : 0;

  function covariance2d(points: Point[]): [[number, number], [number, number]] {
    let xx = 0;
    let xy = 0;
    let yy = 0;
    for (const p of points) {
      xx += p.x * p.x;
      xy += p.x * p.y;
      yy += p.y * p.y;
    }
    return [[xx / points.length, xy / points.length], [xy / points.length, yy / points.length]];
  }

  function eigen2d(matrix: [[number, number], [number, number]]) {
    const [[a, b], [, d]] = matrix;
    const gap = Math.sqrt((a - d) ** 2 + 4 * b ** 2);
    const lambda1 = (a + d + gap) / 2;
    const lambda2 = (a + d - gap) / 2;
    const angle = 0.5 * Math.atan2(2 * b, a - d);
    return {
      lambda1,
      lambda2,
      v1: { x: Math.cos(angle), y: Math.sin(angle) },
      v2: { x: -Math.sin(angle), y: Math.cos(angle) },
    };
  }

  function normalizeAngle(value: number) {
    return ((value % 180) + 180) % 180;
  }

  function sx(x: number) {
    return frame.left + ((x + domain) / (domain * 2)) * (frame.right - frame.left);
  }

  function sy(y: number) {
    return frame.bottom - ((y + domain) / (domain * 2)) * (frame.bottom - frame.top);
  }

  function ellipsePoint(t: number) {
    const a = Math.sqrt(Math.max(eig.lambda1, 0)) * 2;
    const b = Math.sqrt(Math.max(eig.lambda2, 0)) * 2;
    const ex = a * Math.cos(t);
    const ey = b * Math.sin(t);
    return {
      x: ex * eig.v1.x + ey * eig.v2.x,
      y: ex * eig.v1.y + ey * eig.v2.y,
    };
  }

  $: ellipse = Array.from({ length: 97 }, (_, i) => {
    const p = ellipsePoint((i / 96) * Math.PI * 2);
    return `${i === 0 ? 'M' : 'L'} ${sx(p.x)} ${sy(p.y)}`;
  }).join(' ') + ' Z';

  function pointerAngle(event: PointerEvent) {
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * W;
    const py = ((event.clientY - box.top) / box.height) * H;
    const dx = px - sx(origin.x);
    const dy = -(py - sy(origin.y));
    if (Math.hypot(dx, dy) < 12) return;
    angleDeg = normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);
    stage = 5;
  }

  function startDrag(event: PointerEvent) {
    svg.setPointerCapture(event.pointerId);
    pointerAngle(event);
  }

  function moveDrag(event: PointerEvent) {
    if (svg.hasPointerCapture(event.pointerId)) pointerAngle(event);
  }

  function stopDrag(event: PointerEvent) {
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  }
</script>

<section class="pca-lab" aria-labelledby="pca-lab-title" data-modern-ai-visual="pca">
  <header>
    <div>
      <p class="eyebrow">Interactive PCA lab</p>
      <h2 id="pca-lab-title">데이터를 직접 회전·정사영하며 PCA를 이해한다</h2>
      <p class="lede">
        정사영 축을 드래그해 보자. 축 위에 남는 점들의 분산이 가장 커지는 방향이 첫 번째 주성분(PC1)이다.
        아래 숫자는 조작할 때마다 즉시 다시 계산된다.
      </p>
    </div>
    <div class="score" aria-live="polite">
      <span>현재 보존 분산</span>
      <strong>{(preserved * 100).toFixed(1)}%</strong>
      <small>{projectedVariance.toFixed(3)} / {totalVariance.toFixed(3)}</small>
    </div>
  </header>

  <nav class="stages" aria-label="PCA 계산 단계">
    {#each ['원자료', '중심 이동', '공분산', '고유축', '정사영'] as label, index}
      <button class:active={stage === index + 1} type="button" on:click={() => (stage = index + 1)}>
        <span>{index + 1}</span>{label}
      </button>
    {/each}
  </nav>

  <div class="workspace">
    <div class="canvas-card">
      <svg
        bind:this={svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="산점도, 공분산 타원, 고유벡터와 선택한 정사영 축을 보여 주는 대화형 PCA 그래프"
        on:pointerdown={startDrag}
        on:pointermove={moveDrag}
        on:pointerup={stopDrag}
        on:pointercancel={stopDrag}
      >
        <rect width={W} height={H} rx="22" class="background" />
        {#each [-4, -2, 0, 2, 4] as tick}
          <line x1={sx(tick)} y1={frame.top} x2={sx(tick)} y2={frame.bottom} class="grid" />
          <line x1={frame.left} y1={sy(tick)} x2={frame.right} y2={sy(tick)} class="grid" />
        {/each}
        <line x1={frame.left} y1={sy(0)} x2={frame.right} y2={sy(0)} class="axis" />
        <line x1={sx(0)} y1={frame.top} x2={sx(0)} y2={frame.bottom} class="axis" />

        {#if stage >= 3}<path d={ellipse} class="ellipse" />{/if}

        {#if stage >= 4}
          <line
            x1={sx(-eig.v1.x * Math.sqrt(eig.lambda1) * 2.35)}
            y1={sy(-eig.v1.y * Math.sqrt(eig.lambda1) * 2.35)}
            x2={sx(eig.v1.x * Math.sqrt(eig.lambda1) * 2.35)}
            y2={sy(eig.v1.y * Math.sqrt(eig.lambda1) * 2.35)}
            class="pc pc1"
          />
          <line
            x1={sx(-eig.v2.x * Math.sqrt(eig.lambda2) * 2.35)}
            y1={sy(-eig.v2.y * Math.sqrt(eig.lambda2) * 2.35)}
            x2={sx(eig.v2.x * Math.sqrt(eig.lambda2) * 2.35)}
            y2={sy(eig.v2.y * Math.sqrt(eig.lambda2) * 2.35)}
            class="pc pc2"
          />
        {/if}

        {#if stage >= 5}
          <line
            x1={sx(origin.x - axis.x * domain * 1.25)}
            y1={sy(origin.y - axis.y * domain * 1.25)}
            x2={sx(origin.x + axis.x * domain * 1.25)}
            y2={sy(origin.y + axis.y * domain * 1.25)}
            class="projection-axis"
          />
        {/if}

        {#each points as point, index}
          {#if stage >= 5 && showDropLines}
            <line
              x1={sx(point.x)} y1={sy(point.y)}
              x2={sx(projections[index].point.x)} y2={sy(projections[index].point.y)}
              class="drop-line"
            />
          {/if}
          <circle cx={sx(point.x)} cy={sy(point.y)} r="6" class="point" />
          {#if stage >= 5}
            <circle cx={sx(projections[index].point.x)} cy={sy(projections[index].point.y)} r="4" class="projected" />
          {/if}
        {/each}

        <circle cx={sx(stage >= 2 ? 0 : mean.x)} cy={sy(stage >= 2 ? 0 : mean.y)} r="7" class="mean" />

        {#if stage >= 5}
          <circle cx={sx(origin.x + axis.x * 3.15)} cy={sy(origin.y + axis.y * 3.15)} r="15" class="handle" />
          <text x={sx(origin.x + axis.x * 3.15)} y={sy(origin.y + axis.y * 3.15) + 5} text-anchor="middle">↔</text>
        {/if}
      </svg>
      <p class="gesture">주황색 축 또는 손잡이를 손가락으로 드래그할 수 있다.</p>
    </div>

    <aside class="controls">
      <fieldset>
        <legend>1. 데이터 모양</legend>
        <div class="preset-list">
          {#each presets as item, index}
            <button class:active={presetIndex === index} type="button" on:click={() => { presetIndex = index; stage = Math.max(stage, 3); }}>
              <strong>{item.label}</strong><small>{item.note}</small>
            </button>
          {/each}
        </div>
      </fieldset>

      <fieldset>
        <legend>2. 정사영 축</legend>
        <label for="pca-angle"><span>각도</span><output>{angleDeg.toFixed(1)}°</output></label>
        <input id="pca-angle" type="range" min="0" max="179.9" step="0.1" bind:value={angleDeg} on:input={() => (stage = 5)} />
        <div class="actions">
          <button type="button" on:click={() => { angleDeg = 0; stage = 5; }}>x축</button>
          <button type="button" on:click={() => { angleDeg = 90; stage = 5; }}>y축</button>
          <button class="primary" type="button" on:click={() => { angleDeg = pc1Angle; stage = 5; }}>PC1에 맞추기</button>
        </div>
        <label class="check"><input type="checkbox" bind:checked={showDropLines} /> 직교선 표시</label>
      </fieldset>

      <section class="numbers" aria-live="polite">
        <h3>실시간 계산값</h3>
        <dl>
          <div><dt>평균</dt><dd>({mean.x.toFixed(2)}, {mean.y.toFixed(2)})</dd></div>
          <div><dt>공분산 Σ</dt><dd>[{covariance[0][0].toFixed(2)}, {covariance[0][1].toFixed(2)}; {covariance[1][0].toFixed(2)}, {covariance[1][1].toFixed(2)}]</dd></div>
          <div><dt>고윳값</dt><dd>λ₁={eig.lambda1.toFixed(2)}, λ₂={eig.lambda2.toFixed(2)}</dd></div>
          <div><dt>PC1 방향</dt><dd>{pc1Angle.toFixed(1)}°</dd></div>
          <div><dt>PC1 설명분산</dt><dd>{((eig.lambda1 / totalVariance) * 100).toFixed(1)}%</dd></div>
        </dl>
      </section>
    </aside>
  </div>

  <div class="story">
    <article><b>① 평균을 뺀다</b><p>데이터 구름의 위치를 원점으로 옮긴다. PCA는 절대 위치보다 퍼진 모양을 분석한다.</p></article>
    <article><b>② 공분산을 만든다</b><p>대각선은 각 특징의 분산, 비대각선은 두 특징이 함께 변하는 정도다.</p></article>
    <article><b>③ 고유축을 찾는다</b><p>공분산 타원의 긴 축이 첫 번째 고유벡터이고, 그 방향의 퍼짐이 가장 큰 고윳값이다.</p></article>
    <article><b>④ 한 축에 정사영한다</b><p>축을 돌렸을 때 남는 분산을 비교한다. 최댓값이 되는 축이 PC1이다.</p></article>
  </div>
</section>

<style>
  .pca-lab{margin:2.5rem 0;overflow:hidden;border:1px solid var(--color-border);border-radius:1.5rem;background:color-mix(in srgb,var(--color-card) 92%,transparent);box-shadow:0 18px 55px color-mix(in srgb,var(--color-foreground) 8%,transparent)}
  header{display:flex;justify-content:space-between;gap:1rem;padding:1.3rem 1.4rem;border-bottom:1px solid var(--color-border)}
  header h2{margin:.2rem 0 .45rem;font-size:clamp(1.25rem,3vw,1.7rem);line-height:1.35}.eyebrow{margin:0;color:var(--color-primary);font-size:.7rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.lede{max-width:54rem;margin:0;color:var(--color-muted-foreground);font-size:.92rem;line-height:1.7}
  .score{min-width:9rem;align-self:flex-start;padding:.8rem;border:1px solid color-mix(in srgb,var(--color-primary) 30%,var(--color-border));border-radius:1rem;background:color-mix(in srgb,var(--color-primary) 7%,var(--color-background));text-align:right}.score span,.score small{display:block;color:var(--color-muted-foreground);font-size:.7rem}.score strong{display:block;margin:.15rem 0;color:var(--color-primary);font-size:1.35rem}
  .stages{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.4rem;padding:.8rem 1rem;background:color-mix(in srgb,var(--color-muted) 35%,transparent)}button{font:inherit}.stages button,.preset-list button,.actions button{min-height:44px;border:1px solid var(--color-border);border-radius:.8rem;background:var(--color-background);color:var(--color-foreground);font-weight:800}.stages button{font-size:.76rem}.stages button span{display:inline-grid;width:1.4rem;height:1.4rem;margin-right:.25rem;place-items:center;border-radius:999px;background:var(--color-muted)}button.active{border-color:color-mix(in srgb,var(--color-primary) 55%,var(--color-border));background:color-mix(in srgb,var(--color-primary) 9%,var(--color-background))}
  .workspace{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(17rem,.8fr);gap:1rem;padding:1rem}.canvas-card{min-width:0}.canvas-card svg{display:block;width:100%;height:auto;touch-action:none;cursor:crosshair;user-select:none}.gesture{margin:.35rem 0 0;color:var(--color-muted-foreground);font-size:.73rem;text-align:center}
  .background{fill:color-mix(in srgb,var(--color-background) 95%,var(--color-primary) 5%)}.grid{stroke:color-mix(in srgb,var(--color-border) 70%,transparent);stroke-width:1}.axis{stroke:color-mix(in srgb,var(--color-foreground) 28%,transparent);stroke-width:1.3}.ellipse{fill:color-mix(in srgb,var(--color-primary) 9%,transparent);stroke:color-mix(in srgb,var(--color-primary) 65%,transparent);stroke-width:2.4;stroke-dasharray:7 6}.pc{stroke-width:5;stroke-linecap:round}.pc1{stroke:#14b8a6}.pc2{stroke:#8b5cf6;opacity:.75}.projection-axis{stroke:#f97316;stroke-width:4;stroke-linecap:round}.drop-line{stroke:color-mix(in srgb,var(--color-muted-foreground) 45%,transparent);stroke-dasharray:4 4}.point{fill:color-mix(in srgb,var(--color-primary) 78%,var(--color-foreground));stroke:var(--color-background);stroke-width:2}.projected{fill:#f97316;stroke:var(--color-background);stroke-width:1.4}.mean{fill:#ef4444;stroke:var(--color-background);stroke-width:2.5}.handle{fill:#f97316;stroke:var(--color-background);stroke-width:3}.canvas-card text{fill:white;font-size:15px;font-weight:900;pointer-events:none}
  .controls{display:grid;align-content:start;gap:.85rem}.controls fieldset,.numbers{margin:0;padding:.9rem;border:1px solid var(--color-border);border-radius:1rem;background:color-mix(in srgb,var(--color-background) 90%,transparent)}legend,.numbers h3{padding:0 .2rem;font-size:.82rem;font-weight:900}.preset-list{display:grid;gap:.4rem}.preset-list button{text-align:left;padding:.55rem .7rem}.preset-list strong,.preset-list small{display:block}.preset-list small{margin-top:.12rem;color:var(--color-muted-foreground);font-size:.68rem}.controls label:not(.check){display:flex;justify-content:space-between;font-size:.8rem;font-weight:800}.controls input[type=range]{width:100%;margin:.55rem 0}.actions{display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem}.actions button{padding:.35rem;font-size:.72rem}.actions .primary{border-color:color-mix(in srgb,var(--color-primary) 55%,var(--color-border));background:var(--color-primary);color:var(--color-primary-foreground)}.check{display:flex;align-items:center;gap:.45rem;margin-top:.65rem;font-size:.76rem}.numbers dl{margin:.35rem 0 0}.numbers dl div{display:grid;grid-template-columns:6.5rem minmax(0,1fr);gap:.5rem;padding:.35rem 0;border-bottom:1px dashed var(--color-border);font-size:.72rem}.numbers dl div:last-child{border:0}.numbers dt{color:var(--color-muted-foreground)}.numbers dd{margin:0;overflow-wrap:anywhere;font-weight:800;text-align:right}
  .story{display:grid;grid-template-columns:repeat(4,1fr);gap:.65rem;padding:0 1rem 1rem}.story article{padding:.85rem;border:1px solid var(--color-border);border-radius:1rem;background:color-mix(in srgb,var(--color-background) 85%,transparent)}.story b{font-size:.82rem}.story p{margin:.35rem 0 0;color:var(--color-muted-foreground);font-size:.75rem;line-height:1.55}
  @media(max-width:850px){header{display:block}.score{margin-top:.9rem;text-align:left}.workspace{grid-template-columns:1fr}.story{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.pca-lab{margin:1.8rem -.2rem;border-radius:1.1rem}header{padding:1rem}.stages{grid-template-columns:repeat(5,5.2rem);overflow-x:auto;scroll-snap-type:x proximity}.stages button{scroll-snap-align:start}.workspace{padding:.7rem}.canvas-card{overflow-x:auto}.canvas-card svg{min-width:620px}.story{grid-template-columns:1fr;padding:.2rem .7rem .8rem}.actions{grid-template-columns:1fr}.actions button{min-height:44px}.preset-list button{min-height:52px}}
  @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
</style>

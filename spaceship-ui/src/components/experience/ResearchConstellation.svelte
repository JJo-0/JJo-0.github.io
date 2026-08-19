<script lang="ts">
  interface Focus {
    id: string;
    title: string;
    label: string;
    description: string;
  }

  interface Props {
    focuses: Focus[];
  }

  let { focuses }: Props = $props();
  let activeId = $state(focuses[0]?.id ?? '');
  let activeFocus = $derived(focuses.find((focus) => focus.id === activeId) ?? focuses[0]);

  const positions = [
    { x: 50, y: 18 },
    { x: 22, y: 70 },
    { x: 78, y: 70 },
  ];
</script>

<div class="constellation" data-constellation-root>
  <div class="constellation-canvas">
    <svg
      viewBox="0 0 100 92"
      role="img"
      aria-labelledby="constellation-title constellation-description"
    >
      <title id="constellation-title">Park JiHo research constellation</title>
      <desc id="constellation-description">
        Robotics, perception, and AI research themes are linked as one public research map. Each node links to its detailed section.
      </desc>

      <defs>
        <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.34" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </radialGradient>
      </defs>

      <g class="edges" aria-hidden="true">
        <line x1="50" y1="18" x2="22" y2="70" />
        <line x1="50" y1="18" x2="78" y2="70" />
        <line x1="22" y1="70" x2="78" y2="70" />
      </g>

      <g class="orbit" aria-hidden="true">
        <circle cx="50" cy="49" r="38" />
        <circle cx="50" cy="49" r="25" />
      </g>

      {#each focuses.slice(0, 3) as focus, index (focus.id)}
        <a
          href={`#${focus.id}`}
          aria-label={`${focus.title} section으로 이동`}
          onmouseenter={() => (activeId = focus.id)}
          onfocus={() => (activeId = focus.id)}
          onclick={() => (activeId = focus.id)}
        >
          <g
            class:active={activeId === focus.id}
            class="node"
            transform={`translate(${positions[index]?.x ?? 50} ${positions[index]?.y ?? 50})`}
          >
            <circle class="node-glow" r="13" />
            <circle class="node-ring" r="7.5" />
            <circle class="node-core" r="3.5" />
            <text class="node-index" y="0.8">0{index + 1}</text>
            <text class="node-label" y="13">{focus.label}</text>
          </g>
        </a>
      {/each}

      <g class="center" aria-hidden="true">
        <circle cx="50" cy="49" r="5.5" />
        <text x="50" y="48">RESEARCH</text>
        <text x="50" y="52.2">SYSTEM</text>
      </g>
    </svg>
  </div>

  <div class="constellation-panel" aria-live="polite">
    <p class="eyebrow">Active research thread</p>
    {#if activeFocus}
      <h2>{activeFocus.title}</h2>
      <p>{activeFocus.description}</p>
      <a href={`#${activeFocus.id}`}>Explore this thread <span aria-hidden="true">↘</span></a>
    {/if}
  </div>

  <nav class="constellation-mobile" aria-label="Research focus quick links">
    {#each focuses as focus, index (focus.id)}
      <a href={`#${focus.id}`}>
        <span>0{index + 1}</span>
        <strong>{focus.title}</strong>
      </a>
    {/each}
  </nav>
</div>

<style>
  .constellation {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(16rem, 0.75fr);
    min-height: 28rem;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: 1.5rem;
    background:
      radial-gradient(circle at 25% 15%, color-mix(in oklab, var(--color-primary) 13%, transparent), transparent 42%),
      var(--color-card);
  }

  .constellation-canvas {
    display: grid;
    place-items: center;
    min-width: 0;
    padding: 1rem;
    border-right: 1px solid var(--color-border);
  }

  svg {
    width: min(100%, 42rem);
    height: auto;
    overflow: visible;
    color: var(--color-primary);
  }

  .edges line {
    stroke: color-mix(in oklab, var(--color-primary) 44%, var(--color-border));
    stroke-width: 0.36;
    stroke-dasharray: 1.4 1.8;
    vector-effect: non-scaling-stroke;
  }

  .orbit circle {
    fill: none;
    stroke: color-mix(in oklab, var(--color-border) 72%, transparent);
    stroke-width: 0.22;
    vector-effect: non-scaling-stroke;
  }

  .node {
    cursor: pointer;
    color: var(--color-muted-foreground);
    transition: color 220ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
    transform-box: fill-box;
    transform-origin: center;
  }

  a:hover .node,
  a:focus-visible .node,
  .node.active {
    color: var(--color-primary);
    transform: scale(1.08);
  }

  svg a:focus-visible {
    outline: none;
  }

  svg a:focus-visible .node-ring {
    stroke-width: 1.15;
  }

  .node-glow {
    fill: url(#node-glow);
    opacity: 0;
    transition: opacity 220ms ease;
  }

  .node.active .node-glow,
  a:hover .node-glow,
  a:focus-visible .node-glow {
    opacity: 1;
  }

  .node-ring {
    fill: var(--color-card);
    stroke: currentColor;
    stroke-width: 0.7;
    vector-effect: non-scaling-stroke;
  }

  .node-core {
    fill: currentColor;
  }

  .node-index {
    fill: var(--color-primary-foreground);
    font-size: 2.5px;
    font-weight: 900;
    text-anchor: middle;
  }

  .node-label {
    fill: var(--color-foreground);
    font-size: 3px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-anchor: middle;
    text-transform: uppercase;
  }

  .center circle {
    fill: var(--color-background);
    stroke: var(--color-border);
    stroke-width: 0.42;
    vector-effect: non-scaling-stroke;
  }

  .center text {
    fill: var(--color-muted-foreground);
    font-size: 1.8px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-anchor: middle;
  }

  .constellation-panel {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: clamp(1.5rem, 4vw, 3rem);
  }

  .eyebrow {
    margin: 0 0 1rem;
    color: var(--color-muted-foreground);
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    color: var(--color-foreground);
    font-size: clamp(1.55rem, 3vw, 2.5rem);
    font-weight: 900;
    letter-spacing: -0.035em;
    line-height: 1.03;
  }

  .constellation-panel > p:not(.eyebrow) {
    margin: 1rem 0 0;
    color: var(--color-muted-foreground);
    font-size: 0.92rem;
    line-height: 1.72;
  }

  .constellation-panel > a {
    width: fit-content;
    margin-top: 1.6rem;
    color: var(--color-foreground);
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-decoration: none;
    text-transform: uppercase;
  }

  .constellation-panel > a:hover {
    color: var(--color-primary);
  }

  .constellation-mobile {
    display: none;
  }

  @media (max-width: 767px) {
    .constellation {
      display: block;
      min-height: auto;
    }

    .constellation-canvas,
    .constellation-panel {
      display: none;
    }

    .constellation-mobile {
      display: grid;
      padding: 0.45rem;
    }

    .constellation-mobile a {
      display: grid;
      grid-template-columns: 2.25rem 1fr;
      align-items: center;
      gap: 0.5rem;
      padding: 0.9rem 0.75rem;
      border-bottom: 1px solid var(--color-border);
      color: var(--color-foreground);
      text-decoration: none;
    }

    .constellation-mobile a:last-child {
      border-bottom: 0;
    }

    .constellation-mobile span {
      color: var(--color-muted-foreground);
      font-size: 0.65rem;
      font-weight: 900;
    }

    .constellation-mobile strong {
      font-size: 0.9rem;
      letter-spacing: -0.015em;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .node,
    .node-glow {
      transition: none;
    }
  }
</style>

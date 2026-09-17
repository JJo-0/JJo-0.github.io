/* Hosting adapter. Source data/functions, light palette and all font declarations stay intact. */
(() => {
  const root = document.documentElement;
  if (window.parent !== window) root.dataset.embedded = 'true';
  else {
    try {
      root.classList.toggle('dark', localStorage.getItem('theme') === 'dark');
    } catch {
      /* Storage is optional. */
    }
  }
  // Replay the source's own All-button click when initialization has Document as its event target.
  if (root.dataset.actsNative === 'acts-1-1-5-3' && typeof window.filterReception === 'function') {
    const sourceFilter = window.filterReception;
    window.filterReception = (category) => {
      if (window.event?.target instanceof Element && window.event.target.closest('.rec-filter-btn'))
        return sourceFilter(category);
      const button = [...document.querySelectorAll('.rec-filter-btn')].find((b) =>
        b.getAttribute('onclick')?.includes("'" + category + "'")
      );
      if (!button) throw new Error('Missing source reception filter');
      button.click();
    };
  }
  const copy = (value) =>
    Array.isArray(value)
      ? value.map(copy)
      : value && typeof value === 'object'
        ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, copy(v)]))
        : value;
  const charts = new Map();
  const applyTheme = (options, type) => {
    const out = copy(options || {});
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) out.animation = false;
    if (!root.classList.contains('dark')) return out;
    out.color = '#e9e5dc';
    out.borderColor = '#55574f';
    out.plugins ??= {};
    const legend = (out.plugins.legend ??= {});
    legend.labels = { ...legend.labels, color: '#e9e5dc' };
    for (const key of ['title', 'subtitle'])
      if (out.plugins[key]) out.plugins[key].color = '#e9e5dc';
    if (!['doughnut', 'pie'].includes(type)) {
      out.scales ??= {};
      const names = ['radar', 'polarArea'].includes(type) ? ['r'] : ['x', 'y'];
      for (const name of names) {
        const scale = (out.scales[name] ??= {});
        scale.grid = { ...scale.grid, color: '#55574f' };
        scale.ticks = { ...scale.ticks, color: '#d4d1c8', backdropColor: '#252925' };
        if (name === 'r') {
          scale.angleLines = { ...scale.angleLines, color: '#55574f' };
          scale.pointLabels = { ...scale.pointLabels, color: '#e9e5dc' };
        }
      }
    }
    return out;
  };
  if (window.Chart) {
    const OriginalChart = window.Chart;
    window.Chart = class extends OriginalChart {
      constructor(context, config) {
        const sourceOptions = copy(config.options || {});
        config.options = applyTheme(sourceOptions, config.type);
        super(context, config);
        charts.set(this, { options: sourceOptions, type: config.type });
        this.canvas.dataset.chartEngine = 'chartjs';
        this.canvas.dataset.sourceChartValues = JSON.stringify(
          this.data.datasets.map((d) => d.data)
        );
        this.canvas.setAttribute('role', 'img');
        this.canvas.setAttribute('aria-label', (this.data.labels || []).map(String).join(' · '));
      }
      destroy() {
        charts.delete(this);
        super.destroy();
      }
    };
  } else root.dataset.chartError = 'unavailable';
  new MutationObserver(() => {
    for (const [chart, original] of charts) {
      chart.options = applyTheme(original.options, original.type);
      chart.resize();
      chart.update('none');
    }
  }).observe(root, { attributes: true, attributeFilter: ['class'] });
  function enhance() {
    for (const el of document.querySelectorAll('[onclick],.cursor-pointer')) {
      if (
        !el.onclick ||
        el.matches('a,button,input,select,textarea,summary') ||
        el.dataset.nativeKeyboard
      )
        continue;
      el.dataset.nativeKeyboard = 'true';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', (e) => {
        if (e.target === el && ['Enter', ' '].includes(e.key)) {
          e.preventDefault();
          el.click();
        }
      });
    }
    // Render only the source's paired Markdown emphasis markers; never parse source text as HTML.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (
        !node.parentElement.closest('script,style,pre,code,textarea') &&
        /\*\*[^*\n]+\*\*/.test(node.textContent)
      )
        nodes.push(node);
    }
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      let end = 0;
      for (const match of node.textContent.matchAll(/\*\*([^*\n]+)\*\*/g)) {
        fragment.append(node.textContent.slice(end, match.index));
        const strong = document.createElement('strong');
        strong.textContent = match[1];
        fragment.append(strong);
        end = match.index + match[0].length;
      }
      fragment.append(node.textContent.slice(end));
      node.replaceWith(fragment);
    }
  }
  const start = () => {
    enhance();
    let pending = false;
    new MutationObserver(() => {
      if (pending) return;
      pending = true;
      queueMicrotask(() => {
        pending = false;
        enhance();
      });
    }).observe(document.body, { childList: true, subtree: true });
    document.querySelector('[data-native-theme]')?.addEventListener('click', () => {
      const dark = root.classList.toggle('dark');
      try {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
      } catch {
        /* Storage is optional. */
      }
    });
    root.dataset.nativeReady = 'true';
  };
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

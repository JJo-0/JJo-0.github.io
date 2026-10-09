(() => {
  const originals = new WeakMap();
  if (window.Chart) window.Chart.register({
    id: 'isaiah-blog-palette',
    beforeUpdate(chart) {
      const dark = document.documentElement.classList.contains('dark');
      const palette = dark ? ['#9ebcaf','#c8bda5','#87a398','#a7ad89','#dbd2bf','#73958a'] : ['#315e51','#938366','#65877b','#777f55','#b4a58a','#456f65'];
      const colors = new Map();
      const recolor = value => {
        if (Array.isArray(value)) return value.map(recolor);
        if (typeof value !== 'string') return value;
        if (!colors.has(value)) colors.set(value, palette[colors.size % palette.length]);
        return colors.get(value);
      };
      chart.data.datasets.forEach(dataset => {
        if (!originals.has(dataset)) originals.set(dataset, { backgroundColor:dataset.backgroundColor, borderColor:dataset.borderColor });
        const source = originals.get(dataset);
        for (const key of ['backgroundColor','borderColor']) if (source[key]) dataset[key] = recolor(source[key]);
      });
    }
  });
  const repaint = () => {
    if (!window.Chart) return;
    const style = getComputedStyle(document.documentElement);
    const ink = style.getPropertyValue('--jjo-ink').trim();
    const border = style.getPropertyValue('--jjo-border').trim();
    Object.values(window.Chart.instances).forEach(chart => {
      if (chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = ink;
      Object.values(chart.options.scales || {}).forEach(scale => {
        if (scale.ticks) scale.ticks.color = ink;
        if (scale.grid) scale.grid.color = border;
        if (scale.pointLabels) scale.pointLabels.color = ink;
      });
      chart.update('none');
    });
  };
  new MutationObserver(repaint).observe(document.documentElement, { attributes:true, attributeFilter:['class','style'] });
  document.querySelectorAll('[onclick]:not(button):not(a):not(input)').forEach(element => {
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); element.click(); }
    });
  });
  document.querySelectorAll('input[placeholder]').forEach(input => {
    if (!input.labels?.length) input.setAttribute('aria-label', input.getAttribute('placeholder'));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && typeof window.closeModal === 'function') window.closeModal();
  });
  window.addEventListener('load', repaint);
})();

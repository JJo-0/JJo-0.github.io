const visualPalette = {
    ink: '#0f172a',
    muted: '#64748b',
    grid: '#cbd5e1',
    primary: '#7c3aed',
    secondary: '#0ea5e9',
    accent: '#f97316',
    success: '#10b981',
    danger: '#ef4444',
    paper: '#ffffff',
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const rounded = (value, digits = 2) => Number(value).toFixed(digits);

  const shell = (body, controls = '', status = '') => `
    <div class="formula-visual-grid">
      <div class="formula-visual-canvas" data-visual-canvas>${body}</div>
      <div class="formula-visual-controls">
        ${controls}
        <div class="formula-visual-status" data-visual-status>${status}</div>
      </div>
    </div>`;

  const axisSvg = (inner) => `
    <svg class="formula-visual-svg" viewBox="0 0 560 330" role="img" aria-label="대화형 수학 시각화">
      <rect x="0" y="0" width="560" height="330" rx="18" fill="${visualPalette.paper}" />
      ${[-4, -2, 0, 2, 4].map((v) => `<line x1="${280 + v * 48}" y1="24" x2="${280 + v * 48}" y2="306" stroke="${visualPalette.grid}" stroke-width="1"/><line x1="32" y1="${165 - v * 31}" x2="528" y2="${165 - v * 31}" stroke="${visualPalette.grid}" stroke-width="1"/>`).join('')}
      <line x1="32" y1="165" x2="528" y2="165" stroke="${visualPalette.muted}" stroke-width="1.4"/>
      <line x1="280" y1="24" x2="280" y2="306" stroke="${visualPalette.muted}" stroke-width="1.4"/>
      ${inner}
    </svg>`;

  const arrow = (x1, y1, x2, y2, color, label) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = 10;
    const p1 = `${x2 - size * Math.cos(angle - Math.PI / 6)},${y2 - size * Math.sin(angle - Math.PI / 6)}`;
    const p2 = `${x2 - size * Math.cos(angle + Math.PI / 6)},${y2 - size * Math.sin(angle + Math.PI / 6)}`;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4" stroke-linecap="round"/><polygon points="${x2},${y2} ${p1} ${p2}" fill="${color}"/><text x="${x2 + 10}" y="${y2 - 8}" fill="${color}" font-size="14" font-weight="800">${label}</text>`;
  };

  function mountLinear(root) {
    root.innerHTML = shell(
      axisSvg('<g data-linear-vectors></g>'),
      `<label>행렬의 가로 확대 a <output data-out-a>1.4</output><input data-control="a" type="range" min="-2" max="2" step="0.1" value="1.4"></label>
       <label>기울임 b <output data-out-b>0.6</output><input data-control="b" type="range" min="-1.5" max="1.5" step="0.1" value="0.6"></label>
       <label>세로 확대 d <output data-out-d>1.0</output><input data-control="d" type="range" min="-2" max="2" step="0.1" value="1.0"></label>
       <button type="button" data-action="identity">항등행렬로 초기화</button>`,
      '입력 벡터 x=(1.4, 1.0)를 행렬 A=[[a,b],[0,d]]로 변환한다.',
    );
    const update = () => {
      const a = Number(root.querySelector('[data-control="a"]').value);
      const b = Number(root.querySelector('[data-control="b"]').value);
      const d = Number(root.querySelector('[data-control="d"]').value);
      const x = { x: 1.4, y: 1.0 };
      const y = { x: a * x.x + b * x.y, y: d * x.y };
      root.querySelector('[data-out-a]').textContent = rounded(a, 1);
      root.querySelector('[data-out-b]').textContent = rounded(b, 1);
      root.querySelector('[data-out-d]').textContent = rounded(d, 1);
      root.querySelector('[data-linear-vectors]').innerHTML =
        arrow(280, 165, 280 + x.x * 48, 165 - x.y * 31, visualPalette.secondary, 'x') +
        arrow(280, 165, 280 + y.x * 48, 165 - y.y * 31, visualPalette.accent, 'Ax');
      root.querySelector('[data-visual-status]').innerHTML = `<b>계산:</b> Ax=(${rounded(y.x)}, ${rounded(y.y)}) · 길이 ${rounded(Math.hypot(y.x, y.y))}`;
    };
    root.addEventListener('input', update);
    root.querySelector('[data-action="identity"]').addEventListener('click', () => {
      root.querySelector('[data-control="a"]').value = '1';
      root.querySelector('[data-control="b"]').value = '0';
      root.querySelector('[data-control="d"]').value = '1';
      update();
    });
    update();
  }

  function covariancePoints(correlation) {
    return Array.from({ length: 28 }, (_, i) => {
      const angle = (i * 2.3999632297) % (Math.PI * 2);
      const radius = 0.35 + ((i * 19) % 17) / 15;
      const u = radius * Math.cos(angle);
      const v = radius * Math.sin(angle);
      return { x: 1.8 * u + correlation * v, y: 0.55 * v + correlation * 0.55 * u };
    });
  }

  function mountCovariance(root) {
    root.innerHTML = shell(
      axisSvg('<g data-cov-points></g><g data-cov-projections></g><line data-cov-axis stroke="#f97316" stroke-width="4" stroke-linecap="round"/><text data-cov-label fill="#f97316" font-size="13" font-weight="800">정사영 축</text>'),
      `<label>데이터 상관 <output data-out-corr>0.75</output><input data-control="corr" type="range" min="-0.9" max="0.9" step="0.05" value="0.75"></label>
       <label>정사영 축 각도 <output data-out-angle>25°</output><input data-control="angle" type="range" min="0" max="179" step="1" value="25"></label>
       <button type="button" data-action="best-axis">가장 큰 분산 축 찾기</button>`,
      '각 점을 선택한 축에 직교 정사영하고, 축 위 점수들의 분산을 계산한다.',
    );
    const update = () => {
      const corr = Number(root.querySelector('[data-control="corr"]').value);
      const angle = Number(root.querySelector('[data-control="angle"]').value);
      const theta = (angle * Math.PI) / 180;
      const axis = { x: Math.cos(theta), y: Math.sin(theta) };
      const points = covariancePoints(corr);
      const scores = points.map((p) => p.x * axis.x + p.y * axis.y);
      const variance = scores.reduce((sum, score) => sum + score ** 2, 0) / scores.length;
      const xx = points.reduce((sum, p) => sum + p.x ** 2, 0) / points.length;
      const xy = points.reduce((sum, p) => sum + p.x * p.y, 0) / points.length;
      const yy = points.reduce((sum, p) => sum + p.y ** 2, 0) / points.length;
      const best = 0.5 * Math.atan2(2 * xy, xx - yy);
      root.dataset.bestAngle = String(((best * 180) / Math.PI + 180) % 180);
      root.querySelector('[data-out-corr]').textContent = rounded(corr, 2);
      root.querySelector('[data-out-angle]').textContent = `${angle}°`;
      root.querySelector('[data-cov-points]').innerHTML = points.map((p) => `<circle cx="${280 + p.x * 62}" cy="${165 - p.y * 62}" r="5" fill="${visualPalette.primary}" opacity=".78"/>`).join('');
      root.querySelector('[data-cov-projections]').innerHTML = points.map((p, i) => {
        const q = { x: scores[i] * axis.x, y: scores[i] * axis.y };
        return `<line x1="${280 + p.x * 62}" y1="${165 - p.y * 62}" x2="${280 + q.x * 62}" y2="${165 - q.y * 62}" stroke="#94a3b8" stroke-dasharray="3 4"/><circle cx="${280 + q.x * 62}" cy="${165 - q.y * 62}" r="3.5" fill="${visualPalette.accent}"/>`;
      }).join('');
      const line = root.querySelector('[data-cov-axis]');
      line.setAttribute('x1', String(280 - axis.x * 230));
      line.setAttribute('y1', String(165 + axis.y * 145));
      line.setAttribute('x2', String(280 + axis.x * 230));
      line.setAttribute('y2', String(165 - axis.y * 145));
      const label = root.querySelector('[data-cov-label]');
      label.setAttribute('x', String(286 + axis.x * 190));
      label.setAttribute('y', String(157 - axis.y * 120));
      root.querySelector('[data-visual-status]').innerHTML = `<b>Σ≈</b> [[${rounded(xx)}, ${rounded(xy)}], [${rounded(xy)}, ${rounded(yy)}]]<br><b>현재 축 분산:</b> ${rounded(variance)} · <b>최대 방향:</b> ${rounded(Number(root.dataset.bestAngle), 1)}°`;
    };
    root.addEventListener('input', update);
    root.querySelector('[data-action="best-axis"]').addEventListener('click', () => {
      root.querySelector('[data-control="angle"]').value = String(Math.round(Number(root.dataset.bestAngle)));
      update();
    });
    update();
  }

  function gaussianPath(mean, sigma) {
    const points = [];
    for (let i = 0; i <= 120; i += 1) {
      const x = -4 + (i / 120) * 8;
      const y = Math.exp(-0.5 * ((x - mean) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
      points.push(`${i === 0 ? 'M' : 'L'} ${52 + ((x + 4) / 8) * 456} ${278 - y * 330}`);
    }
    return points.join(' ');
  }

  function mountProbability(root) {
    root.innerHTML = shell(
      `<svg class="formula-visual-svg" viewBox="0 0 560 330" role="img" aria-label="평균과 표준편차를 바꿀 수 있는 가우시안 분포">
        <rect width="560" height="330" rx="18" fill="#fff"/><line x1="42" y1="278" x2="520" y2="278" stroke="#64748b"/><path data-gaussian-path fill="none" stroke="#7c3aed" stroke-width="5"/><line data-mean-line y1="55" y2="278" stroke="#f97316" stroke-width="3" stroke-dasharray="7 5"/><path data-area-path fill="#0ea5e9" opacity=".18"/><text x="44" y="32" fill="#64748b" font-size="13">곡선 아래 전체 넓이 = 1</text>
      </svg>`,
      `<label>평균 μ <output data-out-mean>0.0</output><input data-control="mean" type="range" min="-2" max="2" step="0.1" value="0"></label>
       <label>표준편차 σ <output data-out-sigma>1.0</output><input data-control="sigma" type="range" min="0.35" max="2" step="0.05" value="1"></label>
       <label>확인 구간 ±kσ <output data-out-k>1.0</output><input data-control="k" type="range" min="0.5" max="2.5" step="0.1" value="1"></label>`,
      '평균은 곡선의 중심을, 표준편차는 폭을 바꾼다. 파란 영역은 μ±kσ 안의 확률이다.',
    );
    const update = () => {
      const mean = Number(root.querySelector('[data-control="mean"]').value);
      const sigma = Number(root.querySelector('[data-control="sigma"]').value);
      const k = Number(root.querySelector('[data-control="k"]').value);
      root.querySelector('[data-out-mean]').textContent = rounded(mean, 1);
      root.querySelector('[data-out-sigma]').textContent = rounded(sigma, 2);
      root.querySelector('[data-out-k]').textContent = rounded(k, 1);
      root.querySelector('[data-gaussian-path]').setAttribute('d', gaussianPath(mean, sigma));
      const mx = 52 + ((mean + 4) / 8) * 456;
      const meanLine = root.querySelector('[data-mean-line]');
      meanLine.setAttribute('x1', String(mx));
      meanLine.setAttribute('x2', String(mx));
      const left = clamp(52 + (((mean - k * sigma) + 4) / 8) * 456, 52, 508);
      const right = clamp(52 + (((mean + k * sigma) + 4) / 8) * 456, 52, 508);
      const area = [];
      area.push(`M ${left} 278`);
      for (let px = left; px <= right; px += 4) {
        const x = ((px - 52) / 456) * 8 - 4;
        const y = Math.exp(-0.5 * ((x - mean) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
        area.push(`L ${px} ${278 - y * 330}`);
      }
      area.push(`L ${right} 278 Z`);
      root.querySelector('[data-area-path]').setAttribute('d', area.join(' '));
      const approx = k <= 0.55 ? 0.383 : k <= 1.05 ? 0.683 : k <= 1.55 ? 0.866 : k <= 2.05 ? 0.954 : 0.988;
      root.querySelector('[data-visual-status]').innerHTML = `<b>구간:</b> [${rounded(mean - k * sigma)}, ${rounded(mean + k * sigma)}]<br><b>포함 확률:</b> 약 ${(approx * 100).toFixed(1)}%`;
    };
    root.addEventListener('input', update);
    update();
  }

  function mountOptimization(root) {
    root.innerHTML = shell(
      axisSvg('<path d="M70 280 Q190 36 280 165 Q370 294 490 52" fill="none" stroke="#c4b5fd" stroke-width="18" opacity=".45"/><polyline data-opt-path fill="none" stroke="#f97316" stroke-width="4"/><g data-opt-points></g>'),
      `<label>학습률 α <output data-out-alpha>0.22</output><input data-control="alpha" type="range" min="0.03" max="1.2" step="0.01" value="0.22"></label>
       <label>반복 횟수 <output data-out-steps>8</output><input data-control="steps" type="range" min="1" max="16" step="1" value="8"></label>
       <button type="button" data-action="stable">안정적인 학습률</button><button type="button" data-action="overshoot">큰 학습률 비교</button>`,
      '목표 함수 f(x)=0.5x²에서 x←x−αx를 반복한다. α가 너무 크면 최솟값을 지나쳐 진동한다.',
    );
    const update = () => {
      const alpha = Number(root.querySelector('[data-control="alpha"]').value);
      const count = Number(root.querySelector('[data-control="steps"]').value);
      const xs = [3.7];
      for (let i = 0; i < count; i += 1) xs.push(xs.at(-1) * (1 - alpha));
      const coords = xs.map((x) => ({ x: 280 + x * 54, y: 165 - 0.5 * x * x * 20 }));
      root.querySelector('[data-out-alpha]').textContent = rounded(alpha, 2);
      root.querySelector('[data-out-steps]').textContent = String(count);
      root.querySelector('[data-opt-path]').setAttribute('points', coords.map((p) => `${p.x},${p.y}`).join(' '));
      root.querySelector('[data-opt-points]').innerHTML = coords.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="${i === coords.length - 1 ? 7 : 5}" fill="${i === coords.length - 1 ? visualPalette.success : visualPalette.accent}"/><text x="${p.x + 7}" y="${p.y - 7}" fill="#64748b" font-size="11">${i}</text>`).join('');
      const last = xs.at(-1);
      const state = alpha < 0.15 ? '안정하지만 느림' : alpha < 1 ? '안정적으로 수렴' : alpha < 2 ? '진동하며 수렴' : '발산';
      root.querySelector('[data-visual-status]').innerHTML = `<b>${state}</b><br>x_${count}=${rounded(last, 4)}, f(x_${count})=${rounded(0.5 * last * last, 5)}`;
    };
    root.addEventListener('input', update);
    root.querySelector('[data-action="stable"]').addEventListener('click', () => { root.querySelector('[data-control="alpha"]').value = '0.28'; update(); });
    root.querySelector('[data-action="overshoot"]').addEventListener('click', () => { root.querySelector('[data-control="alpha"]').value = '1.15'; update(); });
    update();
  }

  const classifierPoints = [
    [-2.8, 1.8, 1], [-2.2, .5, 1], [-1.5, 2.4, 1], [-.7, 1.2, 1], [1.1, -1.2, -1], [1.8, -.4, -1], [2.6, -1.8, -1], [.7, -2.2, -1], [-.2, -.6, -1],
  ];

  function mountClassifier(root) {
    root.innerHTML = shell(
      axisSvg('<line data-boundary stroke="#f97316" stroke-width="5"/><g data-class-points></g>'),
      `<label>가중치 방향 θ <output data-out-theta>35°</output><input data-control="theta" type="range" min="0" max="179" step="1" value="35"></label>
       <label>편향 b <output data-out-bias>0.0</output><input data-control="bias" type="range" min="-2" max="2" step="0.1" value="0"></label>
       <button type="button" data-action="fit">예시 데이터에 맞추기</button>`,
      '각 점의 점수 g(x)=wᵀx+b 부호로 클래스를 나눈다. 편향은 경계를 평행이동시킨다.',
    );
    const update = () => {
      const thetaDeg = Number(root.querySelector('[data-control="theta"]').value);
      const bias = Number(root.querySelector('[data-control="bias"]').value);
      const theta = (thetaDeg * Math.PI) / 180;
      const w = { x: Math.cos(theta), y: Math.sin(theta) };
      const direction = { x: -w.y, y: w.x };
      const center = { x: -bias * w.x, y: -bias * w.y };
      const p1 = { x: center.x - direction.x * 5, y: center.y - direction.y * 5 };
      const p2 = { x: center.x + direction.x * 5, y: center.y + direction.y * 5 };
      const line = root.querySelector('[data-boundary]');
      line.setAttribute('x1', String(280 + p1.x * 48)); line.setAttribute('y1', String(165 - p1.y * 31));
      line.setAttribute('x2', String(280 + p2.x * 48)); line.setAttribute('y2', String(165 - p2.y * 31));
      let correct = 0;
      root.querySelector('[data-class-points]').innerHTML = classifierPoints.map(([x, y, label]) => {
        const score = w.x * x + w.y * y + bias;
        const prediction = score >= 0 ? 1 : -1;
        if (prediction === label) correct += 1;
        return `<circle cx="${280 + x * 48}" cy="${165 - y * 31}" r="7" fill="${label > 0 ? visualPalette.secondary : visualPalette.danger}" stroke="${prediction === label ? '#fff' : '#facc15'}" stroke-width="${prediction === label ? 2 : 5}"/>`;
      }).join('');
      root.querySelector('[data-out-theta]').textContent = `${thetaDeg}°`;
      root.querySelector('[data-out-bias]').textContent = rounded(bias, 1);
      root.querySelector('[data-visual-status]').innerHTML = `<b>정확히 분류:</b> ${correct}/${classifierPoints.length}<br><b>w:</b> (${rounded(w.x)}, ${rounded(w.y)})`;
    };
    root.addEventListener('input', update);
    root.querySelector('[data-action="fit"]').addEventListener('click', () => { root.querySelector('[data-control="theta"]').value = '38'; root.querySelector('[data-control="bias"]').value = '0.1'; update(); });
    update();
  }

  function mountConvolution(root) {
    const image = [[1, 2, 0, 1], [0, 3, 1, 2], [2, 1, 4, 0], [1, 0, 2, 3]];
    const kernel = [[1, 0], [-1, 1]];
    root.innerHTML = shell(
      `<div class="conv-board"><div><b>입력</b><div class="conv-grid input" data-input-grid></div></div><div class="conv-op">⊛</div><div><b>커널</b><div class="conv-grid kernel" data-kernel-grid></div></div><div class="conv-op">→</div><div><b>현재 합</b><strong data-conv-sum>0</strong></div></div>`,
      `<label>출력 위치 <output data-out-position>1 / 9</output><input data-control="position" type="range" min="0" max="8" step="1" value="0"></label>
       <button type="button" data-action="next">다음 위치</button><button type="button" data-action="reset">처음으로</button>`,
      '2×2 커널을 4×4 입력 위에서 한 칸씩 움직인다. 겹친 네 값을 커널과 곱해 모두 더한다.',
    );
    root.querySelector('[data-kernel-grid]').innerHTML = kernel.flat().map((v) => `<span>${v}</span>`).join('');
    const update = () => {
      const position = Number(root.querySelector('[data-control="position"]').value);
      const row = Math.floor(position / 3);
      const col = position % 3;
      let sum = 0;
      const cells = [];
      for (let r = 0; r < 4; r += 1) {
        for (let c = 0; c < 4; c += 1) {
          const active = r >= row && r < row + 2 && c >= col && c < col + 2;
          let contribution = '';
          if (active) {
            const kr = r - row; const kc = c - col;
            const product = image[r][c] * kernel[kr][kc];
            sum += product;
            contribution = `<small>${image[r][c]}×${kernel[kr][kc]}=${product}</small>`;
          }
          cells.push(`<span class="${active ? 'active' : ''}">${image[r][c]}${contribution}</span>`);
        }
      }
      root.querySelector('[data-input-grid]').innerHTML = cells.join('');
      root.querySelector('[data-conv-sum]').textContent = String(sum);
      root.querySelector('[data-out-position]').textContent = `${position + 1} / 9`;
      root.querySelector('[data-visual-status]').innerHTML = `<b>출력[${row},${col}] = ${sum}</b><br>패치 위치: 행 ${row + 1}–${row + 2}, 열 ${col + 1}–${col + 2}`;
    };
    root.addEventListener('input', update);
    root.querySelector('[data-action="next"]').addEventListener('click', () => { const input = root.querySelector('[data-control="position"]'); input.value = String((Number(input.value) + 1) % 9); update(); });
    root.querySelector('[data-action="reset"]').addEventListener('click', () => { root.querySelector('[data-control="position"]').value = '0'; update(); });
    update();
  }

  function mountData(root) {
    root.innerHTML = shell(
      `<div class="data-visual"><div class="dimension-cubes" data-dimension-cubes></div><div class="fold-strip" data-fold-strip></div></div>`,
      `<label>차원 d <output data-out-dim>2</output><input data-control="dimension" type="range" min="1" max="8" step="1" value="2"></label>
       <label>K-fold의 K <output data-out-fold>5</output><input data-control="fold" type="range" min="2" max="10" step="1" value="5"></label>`,
      '축마다 5개 구간만 나눠도 격자 수는 5ᵈ으로 증가한다. K-fold는 각 구간을 한 번씩 검증에 사용한다.',
    );
    const update = () => {
      const dimension = Number(root.querySelector('[data-control="dimension"]').value);
      const fold = Number(root.querySelector('[data-control="fold"]').value);
      const cells = 5 ** dimension;
      root.querySelector('[data-out-dim]').textContent = String(dimension);
      root.querySelector('[data-out-fold]').textContent = String(fold);
      const shown = Math.min(cells, 80);
      root.querySelector('[data-dimension-cubes]').innerHTML = Array.from({ length: shown }, (_, i) => `<i style="opacity:${0.28 + (i / shown) * 0.72}"></i>`).join('') + (cells > shown ? `<b>+${(cells - shown).toLocaleString()}</b>` : '');
      root.querySelector('[data-fold-strip]').innerHTML = Array.from({ length: fold }, (_, i) => `<span class="${i === 0 ? 'test' : ''}">${i === 0 ? '검증' : '학습'}</span>`).join('');
      root.querySelector('[data-visual-status]').innerHTML = `<b>5ᵈ = ${cells.toLocaleString()}</b>개의 격자<br>${fold}-fold에서는 모델을 ${fold}번 학습·평가한다.`;
    };
    root.addEventListener('input', update);
    update();
  }

  function mountGeneric(root) {
    root.innerHTML = shell(
      `<svg class="formula-visual-svg" viewBox="0 0 560 220" role="img" aria-label="입력과 출력의 관계"><rect width="560" height="220" rx="18" fill="#fff"/><line x1="50" y1="115" x2="510" y2="115" stroke="#64748b" stroke-width="2"/><circle data-generic-input cy="115" r="10" fill="#0ea5e9"/><circle data-generic-output cy="115" r="10" fill="#f97316"/><text data-generic-label x="30" y="40" fill="#64748b" font-size="15"></text></svg>`,
      `<label>입력 x <output data-out-x>1.0</output><input data-control="x" type="range" min="-4" max="4" step="0.1" value="1"></label>`,
      '대표 예시로 y=x²를 사용해 입력값 변화가 출력에 어떤 영향을 주는지 본다.',
    );
    const update = () => {
      const x = Number(root.querySelector('[data-control="x"]').value);
      const y = x * x;
      const sx = 280 + x * 52;
      root.querySelector('[data-generic-input]').setAttribute('cx', String(sx));
      root.querySelector('[data-generic-output]').setAttribute('cx', String(70 + clamp(y, 0, 16) * 27));
      root.querySelector('[data-generic-label]').textContent = `x=${rounded(x, 1)} → y=x²=${rounded(y, 2)}`;
      root.querySelector('[data-out-x]').textContent = rounded(x, 1);
      root.querySelector('[data-visual-status]').innerHTML = `<b>출력:</b> ${rounded(y, 2)} · 입력의 부호는 사라지고 크기가 제곱된다.`;
    };
    root.addEventListener('input', update);
    update();
  }

  const mounts = {
    linear: mountLinear,
    covariance: mountCovariance,
    probability: mountProbability,
    optimization: mountOptimization,
    classifier: mountClassifier,
    convolution: mountConvolution,
    data: mountData,
    generic: mountGeneric,
  };

  function mountFormulaVisual(shellElement) {
    if (!(shellElement instanceof HTMLElement) || shellElement.dataset.formulaVisualMounted === 'true') return;
    const stage = shellElement.querySelector('[data-formula-visual-stage]');
    if (!(stage instanceof HTMLElement)) return;
    const kind = shellElement.dataset.formulaVisual || 'generic';
    const mount = mounts[kind] || mounts.generic;
    mount(stage);
    shellElement.dataset.formulaVisualMounted = 'true';
  }

  document.addEventListener('toggle', (event) => {
    const details = event.target;
    if (!(details instanceof HTMLDetailsElement) || !details.open || !details.classList.contains('formula-guide')) return;
    const visual = details.querySelector('[data-formula-visual]');
    mountFormulaVisual(visual);
  }, true);

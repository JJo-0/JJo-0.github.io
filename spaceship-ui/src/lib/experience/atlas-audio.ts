// Each band has a fixed display range and its own attack/release envelope.
const BANDS = [
  { low: 45, high: 240, floorDb: -48, ceilingDb: -23 },
  { low: 240, high: 2200, floorDb: -53, ceilingDb: -29 },
  { low: 2200, high: 12000, floorDb: -81, ceilingDb: -39 },
] as const;

export function createAtlasAudio(
  player: HTMLAudioElement,
  onState: (playing: boolean) => void,
  onError: (message: string) => void,
  en = false
) {
  const unavailable = en
    ? 'Audio analysis is unavailable in this browser.'
    : '이 브라우저에서는 주파수 분석을 사용할 수 없습니다.';
  const retry = en
    ? 'Unable to play this track. Select Play to try again.'
    : '음원을 재생할 수 없습니다. 재생 버튼을 눌러 다시 시도하세요.';
  let context: AudioContext | undefined;
  let meter: AnalyserNode | undefined;
  let input: MediaElementAudioSourceNode | undefined;
  let gain: GainNode | undefined;
  let bins = new Uint8Array(0);
  const ranges: { start: number; end: number }[] = [];
  const levels = new Float32Array(3);
  const power = new Float32Array(256);
  let chosenSrc = '';
  let volume = 0.65;
  let initAttempted = false;
  let pending = false;
  let playing = false;
  let destroyed = false;
  let generation = 0;
  let lastRead = 0;

  player.preload = 'none';
  player.loop = true;

  function setVolume(value: number) {
    if (!Number.isFinite(value)) return;
    volume = Math.max(0, Math.min(1, value));
    if (gain && context) gain.gain.setTargetAtTime(volume, context.currentTime, 0.018);
    else player.volume = volume;
  }
  setVolume(volume);

  function publish(next: boolean) {
    if (playing === next) return;
    playing = next;
    onState(playing);
  }

  function setup() {
    if (initAttempted) return;
    initAttempted = true;
    const Audio =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Audio) {
      onError(unavailable);
      return;
    }
    try {
      context = new Audio();
      meter = context.createAnalyser();
      meter.fftSize = 2048;
      meter.minDecibels = -100;
      meter.maxDecibels = -10;
      meter.smoothingTimeConstant = 0.22;
      bins = new Uint8Array(meter.frequencyBinCount);
      const binHz = context.sampleRate / meter.fftSize;
      for (const band of BANDS) {
        ranges.push({
          start: Math.min(bins.length, Math.ceil(band.low / binHz)),
          end: Math.min(bins.length, Math.ceil(band.high / binHz)),
        });
      }
      for (let i = 1; i < 256; i++) {
        const db = meter.minDecibels + (i * (meter.maxDecibels - meter.minDecibels)) / 255;
        power[i] = 10 ** (db / 10);
      }
      gain = context.createGain();
      gain.gain.value = volume;
      meter.connect(gain);
      gain.connect(context.destination);
      input = context.createMediaElementSource(player);
      input.connect(meter);
      player.volume = 1;
    } catch {
      // A failure before redirection leaves native playback available.
      if (input && context) {
        input.disconnect();
        input.connect(gain ?? context.destination);
      } else if (context) {
        void context.close().catch(() => {});
        gain = undefined;
        context = undefined;
      }
      meter = undefined;
      setVolume(volume);
      onError(unavailable);
    }
  }

  function idle() {
    levels.fill(0);
    lastRead = 0;
    publish(false);
  }

  function pauseForReal() {
    if (!player.paused && !player.ended) return;
    pending = false;
    idle();
    // Queue suspend even during a pending resume. A later click queues resume again.
    if (context && context.state !== 'closed') void context.suspend().catch(() => {});
  }

  function started() {
    if (player.paused) return;
    pending = false;
    publish(true);
  }

  function fail() {
    if (destroyed || !player.error) return;
    pending = false;
    player.pause();
    pauseForReal();
    onError(retry);
  }

  function waiting() {
    if (player.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) idle();
  }

  async function play() {
    if (destroyed || !chosenSrc) return false;
    const ticket = ++generation;
    pending = true;
    if (player.getAttribute('src') !== chosenSrc || player.error) {
      player.src = chosenSrc;
    }
    setup();
    try {
      // Start both restricted operations synchronously while the click is active.
      const resumed = context?.resume();
      const startedPlaying = player.play();
      await Promise.all([resumed, startedPlaying]);
      if (destroyed || ticket !== generation) return false;
      started();
      return !player.paused;
    } catch {
      if (destroyed || ticket !== generation) return false;
      const hadMediaError = Boolean(player.error);
      player.pause();
      pauseForReal();
      if (!hadMediaError) onError(retry);
      return false;
    }
  }

  async function setTrack(src: string) {
    if (destroyed || src === chosenSrc) return playing;
    const resume = pending || !player.paused;
    ++generation;
    pending = false;
    chosenSrc = src;
    idle();
    player.pause();
    if (resume) return play();
    // A selection while idle must not fetch or decode the new asset.
    if (player.hasAttribute('src')) {
      player.removeAttribute('src');
      player.load();
    }
    pauseForReal();
    return false;
  }

  async function toggle() {
    if (destroyed) return false;
    if (pending || !player.paused) {
      ++generation;
      player.pause();
      pauseForReal();
      return false;
    }
    return play();
  }

  function readBands(): Float32Array {
    if (
      !playing ||
      !meter ||
      !context ||
      context.state !== 'running' ||
      volume === 0 ||
      player.muted
    ) {
      levels.fill(0);
      lastRead = 0;
      return levels;
    }
    const now = performance.now();
    const dt = lastRead ? Math.min(0.15, (now - lastRead) / 1000) : 1 / 30;
    lastRead = now;
    meter.getByteFrequencyData(bins);
    for (let i = 0; i < BANDS.length; i++) {
      const { start, end } = ranges[i];
      let sum = 0;
      for (let j = start; j < end; j++) sum += power[bins[j]];
      const db = 10 * Math.log10(Math.max(1e-12, sum));
      const { floorDb, ceilingDb } = BANDS[i];
      const target = Math.max(0, Math.min(1, (db - floorDb) / (ceilingDb - floorDb)));
      const decay = target > levels[i] ? 0.05 : 0.18;
      levels[i] += (target - levels[i]) * (1 - Math.exp(-dt / decay));
    }
    return levels;
  }

  const events = {
    playing: started,
    waiting,
    pause: pauseForReal,
    ended: pauseForReal,
    error: fail,
  };
  for (const [type, handler] of Object.entries(events)) player.addEventListener(type, handler);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    ++generation;
    pending = false;
    for (const [type, handler] of Object.entries(events)) player.removeEventListener(type, handler);
    player.pause();
    player.removeAttribute('src');
    player.load();
    input?.disconnect();
    meter?.disconnect();
    gain?.disconnect();
    if (context) void context.close().catch(() => {});
    idle();
  }

  return {
    toggle,
    setTrack,
    setVolume,
    readBands,
    destroy,
    get canAnalyse() {
      return Boolean(meter);
    },
  };
}

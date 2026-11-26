import { createAtlasAudio } from './atlas-audio';
import { getAtlasTracks } from './atlas-tracks';

type Sampler = () => ArrayLike<number>;
type AtlasHost = HTMLElement & { atlasAudioSample?: Sampler | null };
type Controls = {
  panel: HTMLElement;
  play: HTMLButtonElement;
  react: HTMLInputElement | null;
  status: HTMLElement;
  graph: AtlasHost | null;
  en: boolean;
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let controls: Controls | undefined;
let events: AbortController | undefined;
let audio: ReturnType<typeof createAtlasAudio> | undefined;
let playing = false;
let installed = false;

function preference(key: string): string | null {
  try {
    return sessionStorage.getItem('writing-audio.' + key);
  } catch {
    return null;
  }
}
function remember(key: string, value: string) {
  try {
    sessionStorage.setItem('writing-audio.' + key, value);
  } catch {
    /* Private browsing may disable storage. */
  }
}

const savedVolume = preference('volume');
let volume = savedVolume === null ? 0.35 : Number(savedVolume);
if (!Number.isFinite(volume) || volume < 0 || volume > 1) volume = 0.35;
let trackId = preference('track');
let reaction =
  preference('reaction') === null ? !reducedMotion.matches : preference('reaction') === 'true';

function updatePlayback() {
  if (!controls) return;
  const { play, graph, en } = controls;
  play.textContent = en ? (playing ? 'Pause' : 'Play') : playing ? '일시정지' : '재생';
  play.setAttribute('aria-pressed', String(playing));
  if (!graph) return;
  const sample = playing && reaction && volume > 0 && audio?.canAnalyse ? audio.readBands : null;
  if (graph.atlasAudioSample === sample) return;
  graph.atlasAudioSample = sample;
  graph.dispatchEvent(new CustomEvent('atlas:audio', { detail: { sample } }));
}

function releaseAudio() {
  audio?.destroy();
  audio = undefined;
  playing = false;
}

function bindPanel() {
  const panel = document.querySelector<HTMLElement>('[data-reading-audio]');
  if (panel && controls?.panel === panel) return;
  events?.abort();
  controls = undefined;
  if (!panel) {
    releaseAudio();
    return;
  }

  const en = panel.dataset.lang === 'en';
  const catalog = getAtlasTracks(en);
  let track = catalog.find((item) => item.id === trackId) ?? catalog[0];
  if (!track) return;
  const play = panel.querySelector<HTMLButtonElement>('[data-audio-play]')!;
  const tracks = panel.querySelector<HTMLSelectElement>('[data-audio-track]')!;
  const react = panel.querySelector<HTMLInputElement>('[data-audio-react]');
  const volumeInput = panel.querySelector<HTMLInputElement>('[data-audio-volume]')!;
  const status = panel.querySelector<HTMLElement>('[data-audio-message]')!;
  const credit = panel.querySelector<HTMLElement>('[data-audio-credit]')!;
  const graph = document.querySelector<AtlasHost>('[data-ascii-graph="true"]');
  controls = { panel, play, react, status, graph, en };
  events = new AbortController();
  const { signal } = events;

  function showCredit() {
    credit.replaceChildren(document.createTextNode(track.credit));
    if (track.sourceUrl) {
      const source = document.createElement('a');
      source.href = track.sourceUrl;
      source.textContent = en ? 'Recording source' : '녹음 출처';
      credit.append(' · ', source);
    }
    if (track.licenseUrl) {
      const license = document.createElement('a');
      license.href = track.licenseUrl;
      license.textContent = track.license;
      credit.append(' · ', license);
    } else if (track.license) {
      credit.append(' · ', track.license);
    }
  }

  tracks.replaceChildren(...catalog.map((item) => new Option(item.title, item.id)));
  tracks.value = track.id;
  volumeInput.value = String(volume);
  if (react) react.checked = reaction;
  showCredit();
  updatePlayback();
  panel.hidden = false;

  play.addEventListener(
    'click',
    () => {
      status.hidden = true;
      if (!audio) {
        // Keeping this element outside the swapped DOM lets playback follow a reader
        // through Korean client-side navigation without disconnecting the media graph.
        const media = new Audio();
        media.preload = 'none';
        audio = createAtlasAudio(
          media,
          (active) => {
            playing = active;
            updatePlayback();
          },
          (message) => {
            if (controls) {
              controls.status.textContent = message;
              controls.status.hidden = false;
            }
          },
          en
        );
        audio.setVolume(volume);
        void audio.setTrack(track.src);
      }
      void audio.toggle();
    },
    { signal }
  );
  tracks.addEventListener(
    'change',
    () => {
      const next = catalog.find((item) => item.id === tracks.value);
      if (!next) return;
      track = next;
      trackId = track.id;
      remember('track', track.id);
      status.hidden = true;
      showCredit();
      if (audio) void audio.setTrack(track.src);
    },
    { signal }
  );
  volumeInput.addEventListener(
    'input',
    () => {
      volume = volumeInput.valueAsNumber;
      remember('volume', String(volume));
      audio?.setVolume(volume);
      updatePlayback();
    },
    { signal }
  );
  react?.addEventListener(
    'change',
    () => {
      reaction = react.checked;
      remember('reaction', String(reaction));
      updatePlayback();
    },
    { signal }
  );
}

export function installReadingAudio() {
  if (installed) return;
  installed = true;
  reducedMotion.addEventListener('change', (e) => {
    if (preference('reaction') !== null) return;
    reaction = !e.matches;
    if (controls?.react) controls.react.checked = reaction;
    updatePlayback();
  });
  document.addEventListener('astro:after-swap', bindPanel);
  document.addEventListener('astro:page-load', bindPanel);
  window.addEventListener('pagehide', (event) => {
    releaseAudio();
    if (event.persisted) updatePlayback();
  });
  bindPanel();
}

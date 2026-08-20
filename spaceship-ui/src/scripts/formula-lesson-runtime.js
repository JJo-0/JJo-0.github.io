import { mount } from 'svelte';

const rendererModules = import.meta.glob(
  '../components/post/formula-lessons/renderers/*.svelte',
);

async function mountFormulaLesson(host) {
  if (!(host instanceof HTMLElement) || host.dataset.lessonMounted === 'true') return;

  const renderer = host.dataset.lessonRenderer;
  const stage = host.querySelector('[data-formula-lesson-stage]');
  const payloadNode = host.querySelector('script[data-formula-lesson-payload]');
  if (!renderer || !(stage instanceof HTMLElement) || !(payloadNode instanceof HTMLScriptElement)) {
    return;
  }

  const modulePath = `../components/post/formula-lessons/renderers/${renderer}.svelte`;
  const loadRenderer = rendererModules[modulePath];
  if (!loadRenderer) {
    stage.innerHTML = '<p class="m-0 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">등록된 수식 학습 렌더러를 찾지 못했습니다.</p>';
    throw new Error(`Unknown formula lesson renderer: ${renderer}`);
  }

  let payload;
  try {
    payload = JSON.parse(payloadNode.textContent || '{}');
  } catch (error) {
    stage.innerHTML = '<p class="m-0 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">수식 학습 명세를 읽지 못했습니다.</p>';
    throw error;
  }

  const module = await loadRenderer();
  stage.replaceChildren();
  mount(module.default, {
    target: stage,
    props: payload,
  });
  host.dataset.lessonMounted = 'true';
}

function installFormulaLessonRuntime() {
  if (window.__formulaLessonRuntimeInstalled) return;
  window.__formulaLessonRuntimeInstalled = true;

  document.addEventListener(
    'toggle',
    (event) => {
      const disclosure = event.target;
      if (!(disclosure instanceof HTMLDetailsElement) || !disclosure.open) return;
      const host = disclosure.querySelector('[data-formula-lesson]');
      if (host) void mountFormulaLesson(host);
    },
    true,
  );
}

installFormulaLessonRuntime();

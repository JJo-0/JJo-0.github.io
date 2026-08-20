const CODE_BLOCK_SELECTOR = '.prose pre.astro-code, .prose pre.shiki';
const LONG_BLOCK_MIN_LINES = 16;
const LONG_BLOCK_MIN_HEIGHT = 360;
const COPY_RESET_DELAY_MS = 1800;
const RUNTIME_FLAG = '__jjoContextCodeBlocksInstalled';

let codeBlockSequence = 0;

function codeTextFor(pre) {
  const code = pre.querySelector('code');
  return (code?.textContent ?? pre.textContent ?? '').replace(/\n$/, '');
}

async function copyText(text) {
  if (!window.isSecureContext || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is unavailable outside a secure context');
  }
  await navigator.clipboard.writeText(text);
}

function setCopyState(button, state) {
  const labels = {
    idle: '복사',
    copied: '복사됨',
    error: '복사 실패',
  };
  button.dataset.copyState = state;
  button.textContent = labels[state];
  button.setAttribute(
    'aria-label',
    state === 'copied'
      ? '코드가 복사되었습니다'
      : state === 'error'
        ? '코드 복사에 실패했습니다'
        : '코드 복사',
  );
}

function createCopyButton(text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-block-copy';
  button.setAttribute('aria-live', 'polite');
  setCopyState(button, 'idle');

  let resetTimer;
  button.addEventListener('click', async () => {
    window.clearTimeout(resetTimer);
    try {
      await copyText(text);
      setCopyState(button, 'copied');
    } catch (error) {
      console.error('Code block copy failed', error);
      setCopyState(button, 'error');
    }
    resetTimer = window.setTimeout(() => setCopyState(button, 'idle'), COPY_RESET_DELAY_MS);
  });

  return button;
}

function createToggleButton(shell, pre, lineCount) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-block-toggle';
  button.setAttribute('aria-controls', pre.id);
  button.setAttribute('aria-expanded', 'false');
  button.textContent = `전체 ${lineCount}줄 보기`;

  button.addEventListener('click', () => {
    const expanded = shell.classList.toggle('is-expanded');
    pre.dataset.codeBlockCollapsed = expanded ? 'false' : 'true';
    button.setAttribute('aria-expanded', String(expanded));
    button.textContent = expanded ? '코드 접기' : `전체 ${lineCount}줄 보기`;
  });

  return button;
}

function enhanceCodeBlock(pre) {
  if (!(pre instanceof HTMLPreElement) || pre.dataset.codeBlockEnhanced === 'true') return;

  const text = codeTextFor(pre);
  if (!text.trim()) return;

  pre.dataset.codeBlockEnhanced = 'true';
  pre.id ||= `post-code-block-${++codeBlockSequence}`;

  const shell = document.createElement('div');
  shell.className = 'code-block-shell';
  shell.dataset.codeBlockShell = 'true';
  pre.before(shell);
  shell.append(pre);
  shell.append(createCopyButton(text));

  const lineCount = text.split('\n').length;
  const isLong = lineCount >= LONG_BLOCK_MIN_LINES || pre.scrollHeight >= LONG_BLOCK_MIN_HEIGHT;
  if (!isLong) return;

  shell.classList.add('is-collapsible');
  shell.dataset.codeBlockLines = String(lineCount);
  pre.dataset.codeBlockCollapsed = 'true';
  shell.append(createToggleButton(shell, pre, lineCount));
}

function enhanceCodeBlocks() {
  document.querySelectorAll(CODE_BLOCK_SELECTOR).forEach(enhanceCodeBlock);
}

function scheduleEnhancement() {
  window.requestAnimationFrame(enhanceCodeBlocks);
}

if (!window[RUNTIME_FLAG]) {
  window[RUNTIME_FLAG] = true;
  document.addEventListener('astro:page-load', scheduleEnhancement);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleEnhancement, { once: true });
  }
}

scheduleEnhancement();
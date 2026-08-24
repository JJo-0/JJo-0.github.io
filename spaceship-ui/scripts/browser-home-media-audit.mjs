import assert from 'node:assert/strict';
import { navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

export async function auditHomeIdentityMedia(cdp, sessionId) {
  await viewport(cdp, sessionId, { width: 1440, height: 900 });
  await navigate(cdp, sessionId, '/');

  const identity = await waitExpression(
    cdp,
    sessionId,
    `(() => {
      const stage = document.querySelector('[data-world-stage]');
      const card = document.querySelector('[data-world-identity]');
      if (!stage || !card) return null;

      const stageRect = stage.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const style = getComputedStyle(card);
      const visible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity || 1) > 0 &&
        cardRect.width > 40 &&
        cardRect.height > 20 &&
        cardRect.right > stageRect.left &&
        cardRect.left < stageRect.right &&
        cardRect.bottom > stageRect.top &&
        cardRect.top < stageRect.bottom;
      if (!visible) return null;

      return {
        text: (card.textContent || '').replace(/\\s+/g, ' ').trim(),
        width: Math.round(cardRect.width),
        height: Math.round(cardRect.height),
      };
    })()`,
    'Home editorial identity decoded and visible',
    20_000,
  );

  assert.match(identity.text, /JJO/i);
  assert.match(identity.text, /Research/i);
  assert.ok(identity.width > 40 && identity.height > 20);

  console.log(
    `browser-smoke: PASS Home editorial identity visible (${identity.width}x${identity.height})`,
  );
}

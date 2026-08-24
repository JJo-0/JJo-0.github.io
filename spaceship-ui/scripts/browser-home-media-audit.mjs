import assert from 'node:assert/strict';
import { navigate, viewport, waitExpression } from './browser-smoke-harness.mjs';

export async function auditHomeIdentityMedia(cdp, sessionId) {
  await viewport(cdp, sessionId, { width: 1440, height: 900 });
  await navigate(cdp, sessionId, '/');

  const media = await waitExpression(
    cdp,
    sessionId,
    `(() => {
      const stage = document.querySelector('[data-world-stage]');
      const frame = document.querySelector('.experience-mouse-frame--world');
      const image = frame?.querySelector('img[src="/image/mouse_surprised.gif"]');
      if (!stage || !frame || !image) return null;
      if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) return null;

      const stageRect = stage.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      const style = getComputedStyle(image);
      const frameStyle = getComputedStyle(frame);
      const visible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity || 1) > 0 &&
        frameStyle.display !== 'none' &&
        frameStyle.visibility !== 'hidden' &&
        Number(frameStyle.opacity || 1) > 0 &&
        imageRect.width > 20 &&
        imageRect.height > 20 &&
        frameRect.right > stageRect.left &&
        frameRect.left < stageRect.right &&
        frameRect.bottom > stageRect.top &&
        frameRect.top < stageRect.bottom;
      if (!visible) return null;

      return {
        currentSrc: image.currentSrc,
        loading: image.getAttribute('loading'),
        fetchPriority: image.getAttribute('fetchpriority'),
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        renderedWidth: Math.round(imageRect.width),
        renderedHeight: Math.round(imageRect.height),
      };
    })()`,
    'Home mouse GIF decoded and visible',
    20_000,
  );

  assert.match(media.currentSrc, /\/image\/mouse_surprised\.gif(?:[?#].*)?$/);
  assert.equal(media.loading, 'eager');
  assert.equal(media.fetchPriority, 'high');
  assert.ok(media.naturalWidth > 0 && media.naturalHeight > 0);
  assert.ok(media.renderedWidth > 20 && media.renderedHeight > 20);

  console.log(
    `browser-smoke: PASS Home mouse GIF visible (${media.naturalWidth}x${media.naturalHeight}, ${media.renderedWidth}x${media.renderedHeight} rendered)`,
  );
}

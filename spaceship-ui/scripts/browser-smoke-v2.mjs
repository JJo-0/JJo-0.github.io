import {
  Cdp,
  attach,
  removeProfile,
  setReducedMotionOverride,
  startChrome,
  startPreview,
  stopChild,
} from './browser-smoke-harness.mjs';
import { auditRenderer } from './browser-renderer-audit-v2.mjs';
import { auditInteractions } from './browser-interaction-audits-v4.mjs';

async function closeAuditTarget(cdp, target) {
  if (!target) return;
  try {
    await cdp.send('Target.detachFromTarget', { sessionId: target.sessionId });
  } catch {}
  try {
    await cdp.send('Target.closeTarget', { targetId: target.targetId });
  } catch {}
}

async function main() {
  let preview, chrome, cdp, rendererTarget, interactionTarget;
  try {
    preview = await startPreview();
    chrome = await startChrome();
    cdp = await Cdp.connect(chrome.url);
    rendererTarget = await attach(cdp);

    // Renderer, GSAP, retry, theme and adaptive-quality transitions mutate a
    // substantial amount of runtime state. Exercise them in an isolated target
    // so none of that state can contaminate the later trusted-link inventory.
    await auditRenderer(cdp, rendererTarget.sessionId);
    await closeAuditTarget(cdp, rendererTarget);
    rendererTarget = null;

    // The exhaustive route audit is about activation and destination, not
    // reveal timing. Give it a fresh browsing target and reduced-motion mode so
    // every accessible target is immediately actionable while the production
    // fallback contract is still exercised.
    setReducedMotionOverride(true);
    interactionTarget = await attach(cdp);
    const clicks = await auditInteractions(cdp, interactionTarget.sessionId);
    console.log(`browser-smoke: PASS complete matrix and ${clicks} stable trusted core-route clicks`);
  } finally {
    setReducedMotionOverride(null);
    await closeAuditTarget(cdp, interactionTarget);
    await closeAuditTarget(cdp, rendererTarget);
    cdp?.close();
    await stopChild(chrome?.child, 'SIGKILL');
    await stopChild(preview, 'SIGTERM');
    removeProfile(chrome?.profile);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('browser-smoke: FAIL');
    console.error(error?.stack || error);
    process.exit(1);
  });
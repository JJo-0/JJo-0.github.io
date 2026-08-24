import {
  Cdp,
  attach,
  removeProfile,
  setReducedMotionOverride,
  startChrome,
  startPreview,
  stopChild,
} from './browser-smoke-harness.mjs';
import { auditHomeIdentityMedia } from './browser-home-media-audit.mjs';
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

async function installFirstPartyLinkIsolation(cdp, sessionId) {
  await cdp.send(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `
        (() => {
          // Google/AdSense may inject annotation anchors into live prose, e.g.
          // <a href="#" class="google-anno">Robotics</a>. They are not
          // repository-owned navigation and must not enter the first-party
          // trusted-link inventory. Keep every real site link untouched.
          const selector = 'a.google-anno[href="#"]';
          const scrub = () => {
            document.querySelectorAll(selector).forEach((node) => node.remove());
          };
          const install = () => {
            scrub();
            if (window.__jjoSmokeGoogleAnnotationObserver || !document.documentElement) return;
            const observer = new MutationObserver(scrub);
            observer.observe(document.documentElement, { childList: true, subtree: true });
            window.__jjoSmokeGoogleAnnotationObserver = observer;
          };

          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', install, { once: true });
          } else {
            install();
          }
          document.addEventListener('astro:after-swap', scrub);
          document.addEventListener('astro:page-load', scrub);
        })();
      `,
    },
    sessionId,
  );
}

async function main() {
  let preview, chrome, cdp, homeMediaTarget, rendererTarget, interactionTarget;
  try {
    preview = await startPreview();
    chrome = await startChrome();
    cdp = await Cdp.connect(chrome.url);

    // The Home identity animation is a visible product requirement, not a
    // decorative best-effort asset. Verify actual browser decode/paint before
    // exercising renderer mutations in a separate browsing context.
    homeMediaTarget = await attach(cdp);
    await auditHomeIdentityMedia(cdp, homeMediaTarget.sessionId);
    await closeAuditTarget(cdp, homeMediaTarget);
    homeMediaTarget = null;

    rendererTarget = await attach(cdp);

    // Renderer, GSAP, retry, theme and adaptive-quality transitions mutate a
    // substantial amount of runtime state. Exercise them in an isolated target
    // so none of that state can contaminate the later trusted-link inventory.
    await auditRenderer(cdp, rendererTarget.sessionId);
    await closeAuditTarget(cdp, rendererTarget);
    rendererTarget = null;

    // The exhaustive route audit is about activation and destination, not
    // reveal timing. Give it a fresh browsing target and reduced-motion mode so
    // every accessible first-party target is immediately actionable while the
    // production fallback contract is still exercised.
    setReducedMotionOverride(true);
    interactionTarget = await attach(cdp);
    await installFirstPartyLinkIsolation(cdp, interactionTarget.sessionId);
    const clicks = await auditInteractions(cdp, interactionTarget.sessionId);
    console.log(`browser-smoke: PASS complete matrix and ${clicks} stable trusted core-route clicks`);
  } finally {
    setReducedMotionOverride(null);
    await closeAuditTarget(cdp, interactionTarget);
    await closeAuditTarget(cdp, rendererTarget);
    await closeAuditTarget(cdp, homeMediaTarget);
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

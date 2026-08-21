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

async function main() {
  let preview, chrome, cdp;
  try {
    preview = await startPreview();
    chrome = await startChrome();
    cdp = await Cdp.connect(chrome.url);
    const { sessionId } = await attach(cdp);

    // Renderer, GSAP and quality transitions are exercised with ordinary
    // motion preferences first.
    await auditRenderer(cdp, sessionId);

    // The exhaustive route audit is about activation and destination, not
    // reveal timing. Reduced-motion mode makes every accessible target
    // immediately actionable while also testing the site's mandated fallback.
    setReducedMotionOverride(true);
    const clicks = await auditInteractions(cdp, sessionId);
    console.log(`browser-smoke: PASS complete matrix and ${clicks} stable trusted core-route clicks`);
  } finally {
    setReducedMotionOverride(null);
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

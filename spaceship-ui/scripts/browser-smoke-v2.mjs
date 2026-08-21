import {
  Cdp,
  attach,
  removeProfile,
  startChrome,
  startPreview,
  stopChild,
} from './browser-smoke-harness.mjs';
import { auditRenderer } from './browser-smoke-audits.mjs';
import { auditInteractions } from './browser-interaction-audits.mjs';

async function main() {
  let preview, chrome, cdp;
  try {
    preview = await startPreview();
    chrome = await startChrome();
    cdp = await Cdp.connect(chrome.url);
    const { sessionId } = await attach(cdp);
    await auditRenderer(cdp, sessionId);
    const clicks = await auditInteractions(cdp, sessionId);
    console.log(`browser-smoke: PASS complete matrix and ${clicks} core-route internal clicks`);
  } finally {
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

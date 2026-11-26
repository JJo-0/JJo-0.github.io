export const GOOGLE_READ_SCOPES = Object.freeze([
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
]);

/**
 * Validate the GIS response before issuing any private API requests. Tokens are
 * opaque: do not assume a Google prefix, decode them, log them or persist them.
 * @param {unknown} response
 * @returns {{kind:'ready', accessToken:string, expiresIn:number} | {kind:'oauth-error'|'invalid-token'|'expired'|'missing-scopes'}}
 */
export function validateGoogleSession(response) {
  if (!response || typeof response !== 'object') return { kind: 'invalid-token' };
  const grant = /** @type {Record<string, unknown>} */ (response);
  if (grant.error) return { kind: 'oauth-error' };
  // RFC 6750 bearer-token grammar, without imposing a provider-specific prefix.
  if (typeof grant.access_token !== 'string' || !/^[A-Za-z0-9\-._~+/]+=*$/.test(grant.access_token)
    || typeof grant.token_type !== 'string' || grant.token_type.toLowerCase() !== 'bearer') {
    return { kind: 'invalid-token' };
  }
  const expiresIn = Number(grant.expires_in);
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) return { kind: 'expired' };
  const scopes = new Set(typeof grant.scope === 'string' ? grant.scope.split(/\s+/) : []);
  if (!GOOGLE_READ_SCOPES.every((scope) => scopes.has(scope))) return { kind: 'missing-scopes' };
  return { kind: 'ready', accessToken: grant.access_token, expiresIn };
}

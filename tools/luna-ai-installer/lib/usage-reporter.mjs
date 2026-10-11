/**
 * Opt-in LUNA usage reporter for a customer installation.
 * Never log credentials or send source code. Caller supplies the issued installation token.
 */
export function createLunaUsageReporter({ endpoint, token, fetchImpl = fetch }) {
  const url = new URL('/api/luna-ai-control/usage', endpoint);
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
    throw new Error('LUNA reporting requires HTTPS');
  }
  if (typeof token !== 'string' || !/^luna_live_[A-Za-z0-9_-]{43}$/.test(token)) {
    throw new Error('Invalid installation credential');
  }
  return async function reportUsage(event) {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`LUNA usage delivery failed (HTTP ${response.status})`);
    return response.json();
  };
}

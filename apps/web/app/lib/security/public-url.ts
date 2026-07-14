import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);
const MAX_REDIRECTS = 5;

function isPrivateIpv4(address: string) {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) return true;

  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase().split('%')[0] ?? '';
  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (/^fe[89ab]/.test(normalized) || normalized.startsWith('ff')) return true;

  const mappedIpv4 = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  return mappedIpv4 ? isPrivateIpv4(mappedIpv4) : false;
}

export function isPrivateIpAddress(address: string) {
  const version = isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version === 6) return isPrivateIpv6(address);
  return true;
}

export async function assertPublicHttpUrl(input: string | URL) {
  const url = input instanceof URL ? new URL(input) : new URL(input);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only public HTTP or HTTPS URLs are allowed.');
  }
  if (url.username || url.password) {
    throw new Error('URLs with embedded credentials are not allowed.');
  }

  const hostname = url.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '');
  if (
    !hostname ||
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('Private network URLs are not allowed.');
  }

  if (isIP(hostname)) {
    if (isPrivateIpAddress(hostname)) {
      throw new Error('Private network URLs are not allowed.');
    }
    return url;
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateIpAddress(address))) {
    throw new Error('The URL resolves to a private or invalid network address.');
  }

  return url;
}

export async function fetchPublicHttp(
  input: string | URL,
  init: RequestInit & { timeoutMs?: number } = {}
) {
  let currentUrl = await assertPublicHttpUrl(input);
  const { timeoutMs = 10_000, ...requestInit } = init;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      ...requestInit,
      redirect: 'manual',
      signal: requestInit.signal ?? AbortSignal.timeout(timeoutMs)
    });

    if (![301, 302, 303, 307, 308].includes(response.status)) return response;

    const location = response.headers.get('location');
    if (!location) throw new Error('Redirect response is missing a destination.');
    if (redirectCount === MAX_REDIRECTS) throw new Error('Too many URL redirects.');
    currentUrl = await assertPublicHttpUrl(new URL(location, currentUrl));
  }

  throw new Error('Unable to fetch public URL.');
}

export async function readResponseTextLimited(response: Response, maxBytes: number) {
  const contentLength = Number(response.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error('Remote response is too large.');
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > maxBytes) throw new Error('Remote response is too large.');
  return new TextDecoder().decode(buffer);
}

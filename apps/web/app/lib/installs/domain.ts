import { matchAllowedDomains, normalizeDomain as normalizeDomainValue } from '../domains';

export { normalizeDomainValue as normalizeDomain };

export function extractDomainFromRequest(request: Request) {
  const origin = request.headers.get('origin');
  if (origin) {
    return normalizeDomainValue(origin);
  }
  const referer = request.headers.get('referer');
  if (referer) {
    return normalizeDomainValue(referer);
  }
  return null;
}

export function isDomainAllowed(allowedDomains: string[], domain: string) {
  return matchAllowedDomains(domain, allowedDomains, { allowLocalDefault: true });
}

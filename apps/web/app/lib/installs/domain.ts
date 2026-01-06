export function normalizeDomain(input?: string | null) {
  if (!input) {
    return null;
  }

  const raw = input.trim().toLowerCase();
  if (!raw) {
    return null;
  }

  try {
    if (raw.includes('://')) {
      return new URL(raw).host;
    }
  } catch {
    // fallthrough
  }

  return raw.replace(/^https?:\/\//, '').split('/')[0] ?? null;
}

export function extractDomainFromRequest(request: Request) {
  const origin = request.headers.get('origin');
  if (origin) {
    return normalizeDomain(origin);
  }
  const referer = request.headers.get('referer');
  if (referer) {
    return normalizeDomain(referer);
  }
  return null;
}

export function isDomainAllowed(allowedDomains: string[], domain: string) {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) {
    return false;
  }

  if (!allowedDomains || allowedDomains.length === 0) {
    return normalizedDomain === 'localhost' || normalizedDomain.startsWith('127.0.0.1');
  }

  const domainHost = normalizedDomain;
  const domainNoPort = domainHost.split(':')[0] ?? domainHost;

  for (const rawAllowed of allowedDomains) {
    const allowed = normalizeDomain(rawAllowed);
    if (!allowed) {
      continue;
    }

    if (allowed === '*') {
      return true;
    }

    if (allowed.startsWith('*.')) {
      const suffix = allowed.slice(2);
      if (domainNoPort.endsWith(`.${suffix}`)) {
        return true;
      }
      continue;
    }

    if (domainHost === allowed || domainNoPort === allowed) {
      return true;
    }
  }

  return false;
}

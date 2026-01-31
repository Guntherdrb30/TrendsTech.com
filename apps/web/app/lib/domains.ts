const LOCALHOST_TAGS = new Set(['localhost', '0.0.0.0', '::1']);

function toHost(value: string) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.hostname.toLowerCase();
  } catch {
    // fallthrough
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withoutProtocol = trimmed.replace(/^[a-z]+:\/\//i, '');
  const [host] = withoutProtocol.split('/');
  if (!host) {
    return null;
  }

  const normalized = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
  return normalized.split(':')[0].toLowerCase();
}

function isLocalhost(domain: string) {
  if (!domain) return false;
  if (LOCALHOST_TAGS.has(domain)) {
    return true;
  }
  return domain.startsWith('127.') || domain === '::1';
}

export function normalizeDomain(input?: string | null) {
  if (!input) {
    return null;
  }
  return toHost(input);
}

export function matchAllowedDomains(
  domain: string | null | undefined,
  allowedDomains?: string[],
  options?: { allowLocalDefault?: boolean }
) {
  const normalizedDomain = toHost(domain ?? '');
  if (!normalizedDomain) {
    return false;
  }

  const allowed = (allowedDomains ?? []).filter(Boolean);
  if (allowed.length === 0) {
    return options?.allowLocalDefault ? isLocalhost(normalizedDomain) : false;
  }

  for (const rawAllowed of allowed) {
    const trimmed = rawAllowed.trim().toLowerCase();
    if (!trimmed) {
      continue;
    }

    const wildcard = trimmed.startsWith('*.');
    const target = wildcard ? trimmed.slice(2) : trimmed.startsWith('.') ? trimmed.slice(1) : trimmed;
    const normalizedTarget = toHost(target);
    if (!normalizedTarget) {
      continue;
    }

    if (wildcard) {
      if (
        normalizedDomain === normalizedTarget ||
        normalizedDomain.endsWith(`.${normalizedTarget}`)
      ) {
        return true;
      }
      continue;
    }

    if (normalizedDomain === normalizedTarget) {
      return true;
    }
  }

  return false;
}

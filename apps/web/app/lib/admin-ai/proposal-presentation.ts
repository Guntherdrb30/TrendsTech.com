const origins = new Set(['https://www.trends172tech.com', 'https://trends172tech.com']);
const prefix = 'Presentación: ';

export function safePresentationUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!origins.has(url.origin) || url.username || url.password) return null;
    if (!/^\/(?:[a-z]{2}\/propuestas\/|presentaciones\/)/.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

export function presentationFromSummary(summary: string | null | undefined): string | null {
  const line = (summary ?? '').split('\n').find(line => line.startsWith(prefix));
  return line ? safePresentationUrl(line.slice(prefix.length).trim()) : null;
}

export function withPresentationLink(summary: string, url: string): string {
  const safe = safePresentationUrl(url);
  if (!safe) throw new Error('Invalid presentation URL');
  const body = summary.split('\n').filter(line => !line.startsWith(prefix)).join('\n').trim();
  return `${prefix}${safe}\n\n${body}`;
}

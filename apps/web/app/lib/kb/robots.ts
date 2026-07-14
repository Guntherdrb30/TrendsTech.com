import { fetchPublicHttp, readResponseTextLimited } from '../security/public-url';

type RobotsRule = {
  userAgent: string;
  disallow: string[];
};

function parseRobotsTxt(content: string) {
  const rules: RobotsRule[] = [];
  let current: RobotsRule | null = null;

  for (const rawLine of content.split('\n')) {
    const line = rawLine.split('#')[0]?.trim();
    if (!line) {
      continue;
    }

    const [key, value] = line.split(':', 2).map((part) => part.trim());
    if (!key || value === undefined) {
      continue;
    }

    if (key.toLowerCase() === 'user-agent') {
      current = { userAgent: value.toLowerCase(), disallow: [] };
      rules.push(current);
      continue;
    }

    if (key.toLowerCase() === 'disallow' && current) {
      current.disallow.push(value);
    }
  }

  return rules;
}

function isPathDisallowed(pathname: string, rules: RobotsRule[]) {
  const globalRules = rules.filter((rule) => rule.userAgent === '*');
  for (const rule of globalRules) {
    for (const disallow of rule.disallow) {
      if (!disallow) {
        continue;
      }
      if (pathname.startsWith(disallow)) {
        return true;
      }
    }
  }
  return false;
}

export async function isAllowedByRobots(url: URL) {
  try {
    const robotsUrl = new URL('/robots.txt', url.origin);
    const response = await fetchPublicHttp(robotsUrl, {
      headers: { 'user-agent': 'trends172tech-bot' },
      timeoutMs: 5_000
    });
    if (!response.ok) {
      return true;
    }
    const content = await readResponseTextLimited(response, 256 * 1024);
    const rules = parseRobotsTxt(content);
    return !isPathDisallowed(url.pathname, rules);
  } catch {
    return true;
  }
}

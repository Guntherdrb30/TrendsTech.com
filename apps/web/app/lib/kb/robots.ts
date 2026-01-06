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
    const response = await fetch(robotsUrl, { headers: { 'user-agent': 'trends172tech-bot' } });
    if (!response.ok) {
      return true;
    }
    const content = await response.text();
    const rules = parseRobotsTxt(content);
    return !isPathDisallowed(url.pathname, rules);
  } catch {
    return true;
  }
}

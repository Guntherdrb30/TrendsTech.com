import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appApiRoot = resolve(process.cwd(), 'apps/web/app/api/luna-agent');

const protectedRoutes = [
  'projects/route.ts',
  'providers/route.ts',
  'tasks/route.ts',
  'runners/route.ts',
  'remote-sessions/route.ts',
  'remote/[token]/tasks/route.ts',
  'runners/internal/claim/route.ts'
] as const;

describe('legacy Luna API retirement coverage', () => {
  for (const route of protectedRoutes) {
    it(`guards POST ${route} before doing work`, () => {
      const source = readFileSync(resolve(appApiRoot, route), 'utf8');
      const post = source.indexOf('export async function POST(');
      expect(post).toBeGreaterThan(-1);
      const body = source.slice(post, post + 700);
      const guard = body.indexOf('isLegacyLunaExecutionDisabled()');
      expect(guard).toBeGreaterThanOrEqual(0);
      expect(guard).toBeLessThan(400);
      expect(body.slice(guard, guard + 180)).toContain('status: 410');
    });
  }

  it('retains runner completion to finish in-flight work', () => {
    const source = readFileSync(resolve(appApiRoot, 'runners/internal/complete/route.ts'), 'utf8');
    expect(source).toContain('export async function POST(');
    expect(source).not.toContain('isLegacyLunaExecutionDisabled()');
  });
});

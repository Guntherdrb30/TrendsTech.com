export const EXPECTED_VERCEL_TEAM_ID = 'team_DdPHfRSec41nlkwzbVIcSKAQ';
export const EXPECTED_VERCEL_TEAM_SLUG = 'guntherdelrosario-5780s-projects';

export function vercelProjectDashboardUrl(projectName: string) {
  return `https://vercel.com/${EXPECTED_VERCEL_TEAM_SLUG}/${encodeURIComponent(projectName)}`;
}

export type VercelDiscoveryErrorCode =
  | 'TOKEN_MISSING'
  | 'TOKEN_INVALID'
  | 'TEAM_ACCESS_DENIED'
  | 'TEAM_NOT_FOUND'
  | 'TEAM_MISMATCH'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'PAGINATION_ERROR';

export class VercelDiscoveryError extends Error {
  constructor(
    public readonly code: VercelDiscoveryErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'VercelDiscoveryError';
  }
}

export type VercelGitRepo = {
  type?: string;
  repo?: string;
  org?: string;
  repoId?: number | string;
  productionBranch?: string;
};

export type VercelProject = {
  id: string;
  name: string;
  accountId?: string;
  framework?: string | null;
  createdAt?: number;
  updatedAt?: number;
  link?: VercelGitRepo | null;
};

export type VercelDeployment = {
  uid?: string;
  id?: string;
  url?: string | null;
  state?: string;
  readyState?: string;
  target?: string | null;
  created?: number;
  createdAt?: number;
  meta?: Record<string, string | undefined>;
};

export type VercelRequest = <T>(path: string, query?: Record<string, string | number | undefined>) => Promise<T>;

type FetchLike = typeof fetch;

function safeApiMessage(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;
  const error = 'error' in payload ? payload.error : null;
  if (!error || typeof error !== 'object') return null;
  const code = 'code' in error && typeof error.code === 'string' ? error.code : null;
  return code?.slice(0, 100) || null;
}

function apiError(status: number, detail: string | null, teamId: string) {
  if (status === 401) return new VercelDiscoveryError('TOKEN_INVALID', 'El token de Vercel es inválido o expiró.', status);
  if (status === 403) return new VercelDiscoveryError('TEAM_ACCESS_DENIED', `El token no tiene acceso al equipo configurado ${teamId}. Revisa el scope del token.`, status);
  if (status === 404) return new VercelDiscoveryError('TEAM_NOT_FOUND', `El equipo configurado ${teamId} no existe o no es visible para este token.`, status);
  if (status === 429) return new VercelDiscoveryError('RATE_LIMITED', 'Vercel limitó temporalmente las solicitudes. Intenta la sincronización más tarde.', status);
  return new VercelDiscoveryError('API_ERROR', `Vercel respondió con HTTP ${status}${detail ? ` (${detail})` : ''}.`, status);
}

export function resolveVercelConfig(env: NodeJS.ProcessEnv = process.env) {
  const token = env.VERCEL_STUDIO_TOKEN || env.VERCEL_TOKEN;
  if (!token) throw new VercelDiscoveryError('TOKEN_MISSING', 'Falta VERCEL_STUDIO_TOKEN (o VERCEL_TOKEN).');

  const configuredTeamId = env.VERCEL_STUDIO_TEAM_ID || env.VERCEL_TEAM_ID;
  const teamId = configuredTeamId || EXPECTED_VERCEL_TEAM_ID;
  if (teamId !== EXPECTED_VERCEL_TEAM_ID) {
    throw new VercelDiscoveryError(
      'TEAM_MISMATCH',
      `El equipo configurado (${teamId}) no coincide con el equipo esperado (${EXPECTED_VERCEL_TEAM_ID}). No se reemplazó automáticamente.`,
    );
  }
  return { token, teamId, usedExpectedDefault: !configuredTeamId };
}

export function createVercelRequest(token: string, teamId: string, fetchImpl: FetchLike = fetch): VercelRequest {
  return async function vercelRequest<T>(path: string, query: Record<string, string | number | undefined> = {}) {
    const url = new URL(`https://api.vercel.com${path}`);
    url.searchParams.set('teamId', teamId);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    let response: Response;
    try {
      response = await fetchImpl(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(20_000),
      });
    } catch (error) {
      const reason = error instanceof Error && error.name === 'TimeoutError' ? 'tiempo de espera agotado' : 'fallo de red';
      throw new VercelDiscoveryError('NETWORK_ERROR', `No se pudo contactar a Vercel: ${reason}.`);
    }
    if (!response.ok) {
      let payload: unknown = null;
      try { payload = await response.json(); } catch { /* La respuesta no era JSON. */ }
      throw apiError(response.status, safeApiMessage(payload), teamId);
    }
    return response.json() as Promise<T>;
  };
}

export async function validateVercelTeam(request: VercelRequest, teamId: string) {
  const team = await request<{ id?: string; slug?: string; name?: string }>(`/v2/teams/${encodeURIComponent(teamId)}`);
  if (team.id !== teamId) {
    throw new VercelDiscoveryError('TEAM_MISMATCH', `Vercel respondió con un equipo distinto al configurado (${teamId}).`);
  }
  return team;
}

export async function listAllVercelProjects(request: VercelRequest, maxPages = 100) {
  const projects = new Map<string, VercelProject>();
  const cursors = new Set<string>();
  let from: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const data = await request<{ projects?: VercelProject[]; pagination?: { next?: string | number | null } }>(
      '/v10/projects',
      { limit: 100, from },
    );
    for (const project of data.projects || []) projects.set(project.id, project);
    const next = data.pagination?.next;
    if (next === null || next === undefined || next === '') return [...projects.values()];
    const cursor = String(next);
    if (cursors.has(cursor)) throw new VercelDiscoveryError('PAGINATION_ERROR', 'Vercel devolvió un cursor de paginación repetido.');
    cursors.add(cursor);
    from = cursor;
  }
  throw new VercelDiscoveryError('PAGINATION_ERROR', `La paginación superó el límite de seguridad de ${maxPages} páginas.`);
}

export async function latestVercelDeployment(request: VercelRequest, projectId: string) {
  const data = await request<{ deployments?: VercelDeployment[] }>('/v6/deployments', { projectId, limit: 1 });
  return data.deployments?.[0] || null;
}

export function repositoryInfo(project: VercelProject, deployment: VercelDeployment | null) {
  const meta = deployment?.meta || {};
  const provider = project.link?.type || (meta.githubCommitRepo ? 'github' : meta.gitlabCommitRepo ? 'gitlab' : meta.bitbucketRepoName ? 'bitbucket' : null);
  const org = project.link?.org || meta.githubCommitOrg || meta.gitlabCommitNamespace || meta.bitbucketRepoOwner;
  const repo = project.link?.repo || meta.githubCommitRepo || meta.gitlabCommitRepo || meta.bitbucketRepoName;
  const fullName = org && repo ? `${org}/${repo}` : repo || null;
  const providerBase = provider === 'gitlab' ? 'https://gitlab.com' : provider === 'bitbucket' ? 'https://bitbucket.org' : 'https://github.com';
  return {
    provider,
    fullName,
    url: fullName ? `${providerBase}/${fullName}` : null,
    branch: project.link?.productionBranch || meta.githubCommitRef || meta.gitlabCommitRef || meta.bitbucketCommitRef || null,
    sha: meta.githubCommitSha || meta.gitlabCommitSha || meta.bitbucketCommitSha || null,
    author: meta.githubCommitAuthorName || meta.gitlabCommitAuthorName || meta.bitbucketCommitAuthorName || null,
    message: meta.githubCommitMessage || meta.gitlabCommitMessage || meta.bitbucketCommitMessage || null,
    commitDate: meta.githubCommitAuthorDate || meta.gitlabCommitAuthorDate || meta.bitbucketCommitAuthorDate || null,
  };
}

export function publicVercelError(error: unknown) {
  if (error instanceof VercelDiscoveryError) return { code: error.code, message: error.message, status: error.status };
  return { code: 'API_ERROR' as const, message: 'Ocurrió un error inesperado durante la sincronización con Vercel.' };
}

export type VercelProjectSnapshot = {
  project: VercelProject;
  deployment: VercelDeployment | null;
  repository: ReturnType<typeof repositoryInfo>;
};

export type SyncProjectResult = 'created' | 'updated' | 'skipped';

export type VercelSyncPort = {
  discoverProjects(): Promise<VercelProject[]>;
  readProject(project: VercelProject): Promise<VercelProjectSnapshot>;
  syncProject(snapshot: VercelProjectSnapshot): Promise<SyncProjectResult>;
  markMissing(visibleProjectIds: string[]): Promise<number>;
  markProjectError?(project: VercelProject, error: ReturnType<typeof publicVercelError>): Promise<void>;
};

export async function synchronizeVercelInventory(port: VercelSyncPort) {
  const projects = await port.discoverProjects();
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const errors: Array<{ projectId: string; project: string; code: string; error: string }> = [];
  const visibleIds: string[] = [];

  for (const project of projects) {
    visibleIds.push(project.id);
    try {
      const result = await port.syncProject(await port.readProject(project));
      if (result === 'created') createdCount += 1;
      else if (result === 'updated') updatedCount += 1;
      else skippedCount += 1;
    } catch (error) {
      const safe = publicVercelError(error);
      errors.push({ projectId: project.id, project: project.name, code: safe.code, error: safe.message });
      await port.markProjectError?.(project, safe);
    }
  }

  const missingCount = await port.markMissing(visibleIds);
  return {
    discoveredCount: projects.length,
    createdCount,
    updatedCount,
    skippedCount,
    missingCount,
    errorCount: errors.length,
    errors,
  };
}

export async function disconnectVercelFromStudio(
  project: { projectId: string; projectName: string },
  port: { disconnect(): Promise<void>; audit(entry: { projectId: string; projectName: string; destructiveVercelOperation: false }): Promise<void> },
) {
  await port.disconnect();
  await port.audit({ ...project, destructiveVercelOperation: false });
  return { ...project, destructiveVercelOperation: false as const };
}

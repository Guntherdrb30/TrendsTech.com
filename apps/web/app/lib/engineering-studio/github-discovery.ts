export type GitHubDiscoveryErrorCode =
  | 'TOKEN_MISSING'
  | 'TOKEN_INVALID'
  | 'ACCESS_DENIED'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'PAGINATION_ERROR';

export class GitHubDiscoveryError extends Error {
  constructor(
    public readonly code: GitHubDiscoveryErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'GitHubDiscoveryError';
  }
}

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  archived: boolean;
  default_branch: string;
  language: string | null;
  topics?: string[];
  homepage?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  pushed_at?: string | null;
  updated_at?: string | null;
  owner?: { login?: string };
};

export type GitHubCommit = {
  sha: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: { name?: string; date?: string } | null;
  };
  author?: { login?: string } | null;
};

export type GitHubRequest = <T>(path: string, query?: Record<string, string | number | undefined>) => Promise<T>;
type FetchLike = typeof fetch;

function githubApiError(status: number) {
  if (status === 401) return new GitHubDiscoveryError('TOKEN_INVALID', 'El token de GitHub es inválido o expiró.', status);
  if (status === 403) return new GitHubDiscoveryError('ACCESS_DENIED', 'GitHub rechazó el acceso. Revisa el alcance del token y el acceso a los repositorios.', status);
  if (status === 429) return new GitHubDiscoveryError('RATE_LIMITED', 'GitHub limitó temporalmente las solicitudes. Intenta más tarde.', status);
  return new GitHubDiscoveryError('API_ERROR', `GitHub respondió con HTTP ${status}.`, status);
}

export function resolveGitHubToken(env: NodeJS.ProcessEnv = process.env) {
  const token = env.GITHUB_STUDIO_TOKEN?.trim();
  if (!token) throw new GitHubDiscoveryError('TOKEN_MISSING', 'Falta GITHUB_STUDIO_TOKEN para sincronizar GitHub directamente.');
  return token;
}

export function createGitHubRequest(token: string, fetchImpl: FetchLike = fetch): GitHubRequest {
  return async <T>(path: string, query: Record<string, string | number | undefined> = {}) => {
    const url = new URL(path, 'https://api.github.com');
    for (const [key, value] of Object.entries(query)) if (value !== undefined) url.searchParams.set(key, String(value));
    let response: Response;
    try {
      response = await fetchImpl(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Trends172Tech-Engineering-Studio',
        },
        cache: 'no-store',
      });
    } catch {
      throw new GitHubDiscoveryError('NETWORK_ERROR', 'No se pudo conectar con GitHub.');
    }
    if (!response.ok) throw githubApiError(response.status);
    return response.json() as Promise<T>;
  };
}

export async function listAllGitHubRepositories(request: GitHubRequest) {
  const repositories: GitHubRepository[] = [];
  for (let page = 1; page <= 100; page += 1) {
    const batch = await request<GitHubRepository[]>('/user/repos', {
      affiliation: 'owner,collaborator,organization_member',
      visibility: 'all',
      sort: 'updated',
      per_page: 100,
      page,
    });
    repositories.push(...batch);
    if (batch.length < 100) return repositories;
  }
  throw new GitHubDiscoveryError('PAGINATION_ERROR', 'GitHub devolvió más páginas de las permitidas para una sincronización.');
}

export async function latestGitHubCommit(request: GitHubRequest, repository: GitHubRepository) {
  const commits = await request<GitHubCommit[]>(`/repos/${repository.full_name}/commits`, { sha: repository.default_branch, per_page: 1 });
  return commits[0] || null;
}

export function publicGitHubError(error: unknown) {
  return error instanceof GitHubDiscoveryError
    ? { code: error.code, message: error.message, status: error.status }
    : { code: 'UNKNOWN', message: 'GitHub no pudo sincronizarse por un error inesperado.' };
}

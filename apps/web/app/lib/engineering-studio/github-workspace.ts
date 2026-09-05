import 'server-only';

export type GitHubWorkspaceResult = {
  configured: boolean;
  repository: string;
  baseBranch: string;
  workBranch: string;
  branchCreated: boolean;
  message: string;
};

function normalizeRepository(value: string) {
  const trimmed = value.trim().replace(/\.git$/, '');
  if (trimmed.startsWith('https://github.com/')) return trimmed.slice('https://github.com/'.length);
  return trimmed;
}

export function githubWorkspaceConfigured() {
  return Boolean(process.env.GITHUB_STUDIO_TOKEN);
}

export async function ensureGitHubWorkspace(repositoryInput: string, workBranch: string): Promise<GitHubWorkspaceResult> {
  const repository = normalizeRepository(repositoryInput);
  if (!repository.includes('/')) throw new Error('Repositorio GitHub inválido. Usa owner/repo o una URL de GitHub.');
  const token = process.env.GITHUB_STUDIO_TOKEN;
  if (!token) {
    return {
      configured: false,
      repository,
      baseBranch: 'main',
      workBranch,
      branchCreated: false,
      message: 'Falta GITHUB_STUDIO_TOKEN. El run queda preparado pero no se crea la rama automáticamente.'
    };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  const repoResponse = await fetch(`https://api.github.com/repos/${repository}`, { headers, cache: 'no-store' });
  if (!repoResponse.ok) throw new Error(`No se pudo acceder al repositorio (${repoResponse.status}).`);
  const repo = await repoResponse.json() as { default_branch?: string };
  const baseBranch = repo.default_branch || 'main';

  const refResponse = await fetch(`https://api.github.com/repos/${repository}/git/ref/heads/${encodeURIComponent(baseBranch)}`, { headers, cache: 'no-store' });
  if (!refResponse.ok) throw new Error(`No se pudo resolver la rama base ${baseBranch}.`);
  const ref = await refResponse.json() as { object?: { sha?: string } };
  const sha = ref.object?.sha;
  if (!sha) throw new Error('GitHub no devolvió el SHA de la rama base.');

  const branchResponse = await fetch(`https://api.github.com/repos/${repository}/git/refs`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: `refs/heads/${workBranch}`, sha })
  });

  if (branchResponse.status === 422) {
    const existing = await fetch(`https://api.github.com/repos/${repository}/git/ref/heads/${encodeURIComponent(workBranch)}`, { headers, cache: 'no-store' });
    if (existing.ok) return { configured: true, repository, baseBranch, workBranch, branchCreated: false, message: 'La rama de trabajo ya existía y se reutilizará.' };
  }
  if (!branchResponse.ok) throw new Error(`No se pudo crear la rama de trabajo (${branchResponse.status}).`);

  return { configured: true, repository, baseBranch, workBranch, branchCreated: true, message: 'Workspace GitHub creado correctamente.' };
}

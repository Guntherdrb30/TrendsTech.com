import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';
import {
  MAX_STUDIO_FILE_BYTES,
  assertStudioWorkBranch,
  isVisibleStudioRepoPath,
  normalizeGitHubRepository,
  normalizeStudioRepoPath
} from './execution-policy';

type RunContext = {
  id: string;
  projectId: string;
  projectName: string;
  status: string;
  branchName: string | null;
  repositoryUrl: string | null;
};

type GitHubError = Error & { status?: number };

type GitHubRepo = {
  full_name: string;
  private: boolean;
  archived: boolean;
  default_branch: string;
  updated_at: string;
  html_url: string;
};

type GitHubContent = {
  type: string;
  sha: string;
  size: number;
  encoding?: string;
  content?: string;
  html_url?: string;
};

type GitHubWorkflowRun = {
  id: number;
  name?: string;
  status?: string;
  conclusion?: string | null;
  event?: string;
  head_sha?: string;
  html_url?: string;
  created_at?: string;
  updated_at?: string;
};

function githubToken() {
  return process.env.GITHUB_STUDIO_TOKEN?.trim() || '';
}

function vercelToken() {
  return process.env.VERCEL_STUDIO_TOKEN?.trim() || process.env.VERCEL_TOKEN?.trim() || '';
}

function encodeRepoPath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function githubRequest<T>(path: string, init: RequestInit = {}) {
  const token = githubToken();
  if (!token) throw new Error('GITHUB_STUDIO_TOKEN no está configurado.');

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`GitHub API ${response.status}: ${body.slice(0, 500)}`) as GitHubError;
    error.status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
}

async function loadRunContext(runId: string, forWrite = false): Promise<RunContext> {
  const rows = await prisma.$queryRaw<RunContext[]>(Prisma.sql`
    SELECT r."id", r."projectId", p."name" AS "projectName", r."status", r."branchName", p."repositoryUrl"
    FROM "StudioAgentRun" r
    JOIN "StudioProject" p ON p."id" = r."projectId"
    WHERE r."id" = ${runId}
    LIMIT 1
  `);
  const run = rows[0];
  if (!run) throw new Error('Run de Engineering Studio no encontrado.');
  if (!run.repositoryUrl) throw new Error('El proyecto no tiene repositorio GitHub vinculado.');
  if (!run.branchName) throw new Error('El run no tiene rama de trabajo.');
  assertStudioWorkBranch(run.branchName);

  if (forWrite && !['READY', 'RUNNING', 'REVIEW'].includes(run.status)) {
    throw new Error(`El run no admite cambios en estado ${run.status}.`);
  }

  return run;
}

function repositoryFromRun(run: RunContext) {
  const repository = normalizeGitHubRepository(run.repositoryUrl || '');
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error('Repositorio GitHub inválido en Engineering Studio.');
  }
  return repository;
}

async function logEvent(run: RunContext, type: string, actorRef: string, message: string, meta: Record<string, unknown>) {
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "StudioEvent" ("id","projectId","type","actorType","actorRef","message","metaJson","createdAt")
    VALUES (
      ${randomUUID()}, ${run.projectId}, ${type}, 'CHATGPT', ${actorRef}, ${message},
      CAST(${JSON.stringify({ runId: run.id, ...meta })} AS jsonb), CURRENT_TIMESTAMP
    )
  `);
}

async function getBranchHead(repository: string, branch: string) {
  const ref = await githubRequest<{ object?: { sha?: string } }>(
    `/repos/${repository}/git/ref/heads/${encodeURIComponent(branch)}`
  );
  const sha = ref.object?.sha;
  if (!sha) throw new Error('GitHub no devolvió el SHA de la rama de trabajo.');
  return sha;
}

export async function getStudioExecutionCapabilities() {
  let databaseProvider = 'UNCONFIGURED';
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const hostname = new URL(databaseUrl).hostname.toLowerCase();
      databaseProvider = hostname.includes('neon.tech') ? 'NEON_POSTGRES' : 'POSTGRES';
    } catch {
      databaseProvider = 'POSTGRES_CONFIGURED';
    }
  }

  return {
    github: { configured: Boolean(githubToken()), mode: 'GITHUB_STUDIO_TOKEN' },
    vercel: { configured: Boolean(vercelToken()), mode: process.env.VERCEL_STUDIO_TOKEN ? 'VERCEL_STUDIO_TOKEN' : process.env.VERCEL_TOKEN ? 'VERCEL_TOKEN' : 'UNCONFIGURED' },
    database: { configured: Boolean(databaseUrl), provider: databaseProvider },
    chatgptExecution: {
      paidModelRequired: false,
      protectedBranchWrites: false,
      productionDeploy: false,
      secretFileAccess: false
    }
  };
}

export async function listConnectedGitHubRepositories() {
  if (!githubToken()) return { configured: false, repositories: [] as GitHubRepo[] };

  const repositories: GitHubRepo[] = [];
  for (let page = 1; page <= 5; page += 1) {
    const batch = await githubRequest<GitHubRepo[]>(
      `/user/repos?per_page=100&page=${page}&sort=updated&direction=desc&affiliation=owner,collaborator,organization_member`
    );
    repositories.push(...batch);
    if (batch.length < 100) break;
  }

  return {
    configured: true,
    repositories: repositories.map((repo) => ({
      full_name: repo.full_name,
      private: repo.private,
      archived: repo.archived,
      default_branch: repo.default_branch,
      updated_at: repo.updated_at,
      html_url: repo.html_url
    }))
  };
}

export async function listRunRepositoryFiles(runId: string, options: { prefix?: string; query?: string; limit?: number } = {}) {
  const run = await loadRunContext(runId);
  const repository = repositoryFromRun(run);
  const branch = assertStudioWorkBranch(run.branchName || '');
  const headSha = await getBranchHead(repository, branch);
  const commit = await githubRequest<{ tree?: { sha?: string } }>(`/repos/${repository}/git/commits/${headSha}`);
  const treeSha = commit.tree?.sha;
  if (!treeSha) throw new Error('No se pudo resolver el árbol Git del run.');

  const tree = await githubRequest<{ truncated?: boolean; tree?: Array<{ path?: string; type?: string; size?: number }> }>(
    `/repos/${repository}/git/trees/${treeSha}?recursive=1`
  );

  const prefix = options.prefix ? normalizeStudioRepoPath(options.prefix).replace(/\/$/, '') : '';
  const query = options.query?.trim().toLowerCase() || '';
  const limit = Math.min(Math.max(options.limit || 200, 1), 500);

  const files = (tree.tree || [])
    .filter((entry) => entry.type === 'blob' && entry.path && isVisibleStudioRepoPath(entry.path))
    .filter((entry) => !prefix || entry.path === prefix || entry.path?.startsWith(`${prefix}/`))
    .filter((entry) => !query || entry.path?.toLowerCase().includes(query))
    .slice(0, limit)
    .map((entry) => ({ path: entry.path as string, size: entry.size || 0 }));

  return { runId, projectId: run.projectId, repository, branch, headSha, truncated: Boolean(tree.truncated), files };
}

export async function readRunRepositoryFile(runId: string, pathInput: string) {
  const run = await loadRunContext(runId);
  const repository = repositoryFromRun(run);
  const branch = assertStudioWorkBranch(run.branchName || '');
  const path = normalizeStudioRepoPath(pathInput);

  const file = await githubRequest<GitHubContent>(
    `/repos/${repository}/contents/${encodeRepoPath(path)}?ref=${encodeURIComponent(branch)}`
  );
  if (file.type !== 'file') throw new Error('La ruta solicitada no es un archivo.');
  if (file.size > MAX_STUDIO_FILE_BYTES) {
    throw new Error(`Archivo demasiado grande para el MCP de Engineering Studio (máximo ${MAX_STUDIO_FILE_BYTES} bytes).`);
  }
  if (!file.content || file.encoding !== 'base64') throw new Error('GitHub no devolvió contenido de texto legible.');

  const content = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8');
  return { runId, projectId: run.projectId, repository, branch, path, sha: file.sha, size: file.size, content, htmlUrl: file.html_url || null };
}

export async function writeRunRepositoryFile(params: {
  runId: string;
  path: string;
  content: string;
  message?: string;
  actorRef: string;
}) {
  const run = await loadRunContext(params.runId, true);
  const repository = repositoryFromRun(run);
  const branch = assertStudioWorkBranch(run.branchName || '');
  const path = normalizeStudioRepoPath(params.path);

  if (Buffer.byteLength(params.content, 'utf8') > MAX_STUDIO_FILE_BYTES) {
    throw new Error(`Contenido demasiado grande para una edición MCP (máximo ${MAX_STUDIO_FILE_BYTES} bytes).`);
  }

  let existingSha: string | undefined;
  try {
    const existing = await githubRequest<GitHubContent>(
      `/repos/${repository}/contents/${encodeRepoPath(path)}?ref=${encodeURIComponent(branch)}`
    );
    if (existing.type !== 'file') throw new Error('La ruta existente no es un archivo.');
    existingSha = existing.sha;
  } catch (error) {
    if ((error as GitHubError).status !== 404) throw error;
  }

  const body: Record<string, unknown> = {
    message: params.message?.trim() || `studio: update ${path}`,
    content: Buffer.from(params.content, 'utf8').toString('base64'),
    branch
  };
  if (existingSha) body.sha = existingSha;

  const result = await githubRequest<{ commit?: { sha?: string; html_url?: string }; content?: { sha?: string } }>(
    `/repos/${repository}/contents/${encodeRepoPath(path)}`,
    { method: 'PUT', body: JSON.stringify(body) }
  );
  const commitSha = result.commit?.sha;
  if (!commitSha) throw new Error('GitHub no devolvió el commit de la edición.');

  if (run.status === 'READY') {
    await prisma.$executeRaw(Prisma.sql`UPDATE "StudioAgentRun" SET "status"='RUNNING',"startedAt"=COALESCE("startedAt",CURRENT_TIMESTAMP),"updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${run.id}`);
  }
  await logEvent(run, 'CHATGPT_REPOSITORY_FILE_WRITTEN', params.actorRef, `ChatGPT actualizó ${path} en la rama aislada del run.`, {
    repository,
    branch,
    path,
    operation: existingSha ? 'UPDATE' : 'CREATE',
    commitSha
  });

  return {
    runId: run.id,
    projectId: run.projectId,
    repository,
    branch,
    path,
    operation: existingSha ? 'UPDATE' : 'CREATE',
    commitSha,
    commitUrl: result.commit?.html_url || null,
    safety: { mainModified: false, productionDeploy: false }
  };
}

export async function createRunPullRequest(params: {
  runId: string;
  title: string;
  body?: string;
  actorRef: string;
}) {
  const run = await loadRunContext(params.runId, true);
  const repository = repositoryFromRun(run);
  const branch = assertStudioWorkBranch(run.branchName || '');
  const [owner] = repository.split('/');

  const repo = await githubRequest<{ default_branch?: string }>(`/repos/${repository}`);
  const base = repo.default_branch || 'main';

  const existing = await githubRequest<Array<{ number: number; html_url?: string; state?: string; draft?: boolean }>>(
    `/repos/${repository}/pulls?state=open&head=${encodeURIComponent(`${owner}:${branch}`)}&base=${encodeURIComponent(base)}&per_page=10`
  );
  if (existing[0]) {
    return {
      runId: run.id,
      repository,
      branch,
      base,
      pullRequest: existing[0],
      existing: true,
      safety: { merged: false, productionDeploy: false }
    };
  }

  const pullRequest = await githubRequest<{ number: number; html_url?: string; state?: string; draft?: boolean }>(
    `/repos/${repository}/pulls`,
    {
      method: 'POST',
      body: JSON.stringify({
        title: params.title.trim(),
        body: params.body?.trim() || `Engineering Studio run ${run.id}.\n\nGenerated through the Trends MCP ChatGPT execution path.\n\nNo production deployment or merge was performed.`,
        head: branch,
        base,
        draft: true
      })
    }
  );

  await prisma.$executeRaw(Prisma.sql`UPDATE "StudioAgentRun" SET "status"='REVIEW',"updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${run.id}`);
  await logEvent(run, 'CHATGPT_PULL_REQUEST_CREATED', params.actorRef, `ChatGPT creó PR draft #${pullRequest.number}.`, {
    repository,
    branch,
    base,
    pullRequestNumber: pullRequest.number,
    pullRequestUrl: pullRequest.html_url || null
  });

  return {
    runId: run.id,
    repository,
    branch,
    base,
    pullRequest,
    existing: false,
    safety: { merged: false, productionDeploy: false }
  };
}

export async function getRunDeliveryStatus(runId: string) {
  const run = await loadRunContext(runId);
  const repository = repositoryFromRun(run);
  const branch = assertStudioWorkBranch(run.branchName || '');
  const headSha = await getBranchHead(repository, branch);

  const workflowData = await githubRequest<{ workflow_runs?: GitHubWorkflowRun[] }>(
    `/repos/${repository}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=20`
  );
  const workflowRuns = (workflowData.workflow_runs || []).map((item) => ({
    id: item.id,
    name: item.name || null,
    status: item.status || null,
    conclusion: item.conclusion || null,
    event: item.event || null,
    headSha: item.head_sha || null,
    url: item.html_url || null,
    createdAt: item.created_at || null,
    updatedAt: item.updated_at || null
  }));

  let preview: Record<string, unknown> = { configured: false, reason: 'Vercel Studio no configurado.' };
  const token = vercelToken();
  if (token) {
    const bindings = await prisma.$queryRaw<Array<{ externalProjectId: string }>>(Prisma.sql`
      SELECT "externalProjectId"
      FROM "StudioProjectIntegration"
      WHERE "projectId"=${run.projectId} AND "provider"='VERCEL'
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `);
    const externalProjectId = bindings[0]?.externalProjectId;
    if (!externalProjectId) {
      preview = { configured: true, found: false, reason: 'El proyecto todavía no tiene binding Vercel sincronizado.' };
    } else {
      const url = new URL('https://api.vercel.com/v7/deployments');
      url.searchParams.set('projectId', externalProjectId);
      url.searchParams.set('limit', '50');
      const teamId = process.env.VERCEL_STUDIO_TEAM_ID || process.env.VERCEL_TEAM_ID;
      if (teamId) url.searchParams.set('teamId', teamId);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(20_000)
      });
      if (response.ok) {
        const data = await response.json() as { deployments?: Array<{ uid?: string; id?: string; url?: string; state?: string; readyState?: string; target?: string | null; created?: number; createdAt?: number; meta?: Record<string, string | undefined> }> };
        const match = (data.deployments || []).find((deployment) => deployment.meta?.githubCommitRef === branch);
        preview = match ? {
          configured: true,
          found: true,
          id: match.uid || match.id || null,
          url: match.url ? `https://${match.url}` : null,
          state: match.state || match.readyState || null,
          target: match.target || null,
          commitSha: match.meta?.githubCommitSha || null,
          branch: match.meta?.githubCommitRef || null,
          createdAt: match.created || match.createdAt || null
        } : { configured: true, found: false };
      } else {
        preview = { configured: true, found: false, error: `Vercel API ${response.status}` };
      }
    }
  }

  return {
    runId,
    projectId: run.projectId,
    projectName: run.projectName,
    runStatus: run.status,
    repository,
    branch,
    headSha,
    workflowRuns,
    preview,
    safety: { mergePerformed: false, productionDeployPerformed: false }
  };
}

import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';
import { normalizedGitHubRepo, isRecentGitHubCommit } from './memory-contract';
import { addVaultEntry } from './vault';

// Only projects explicitly opted into ChatGPT memory are eligible. Never
// import unknown projects, send code to an AI model, or store credentials.
type Project = { id: string; name: string; repositoryUrl: string | null };
type Snapshot = { sha: string; date: string | null; url: string; message: string };
type Existing = { id: string };
const AGENT = 'GITHUB_INCREMENTAL';

function githubConfig() {
  const token = process.env.GITHUB_STUDIO_TOKEN?.trim();
  if (!token) throw new Error('GITHUB_STUDIO_TOKEN no configurado.');
  return token;
}

async function currentCommit(repository: string, token: string): Promise<Snapshot> {
  const response = await fetch(`https://api.github.com/repos/${repository}/commits?per_page=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`GitHub no respondio correctamente: HTTP ${response.status}`);
  const commits = await response.json() as Array<{
    sha: string; html_url: string;
    commit: { message: string; committer?: { date?: string | null }; author?: { date?: string | null } }
  }>;
  if (!commits.length) throw new Error('No se encontraron commits.');
  return {
    sha: commits[0].sha,
    date: commits[0].commit.committer?.date || commits[0].commit.author?.date || null,
    url: commits[0].html_url,
    message: commits[0].commit.message.split('\n')[0].slice(0,240)
  };
}

async function findRecordedCommit(projectId: string, sha: string) {
  return prisma.$queryRaw<Existing[]>(Prisma.sql`
    SELECT "id" FROM "StudioVaultEntry"
    WHERE "projectId" = ${projectId} AND "sourceRef" = ${`github-commit:${sha}`}
    LIMIT 1
  `);
}

export async function syncAuthorizedProjectMemories() {
  const token = githubConfig();
  const projects = await prisma.$queryRaw<Project[]>(Prisma.sql`
    SELECT p."id", p."name", p."repositoryUrl"
    FROM "StudioProject" p
    INNER JOIN "StudioIntegration" i ON i."projectId" = p."id"
      AND i."provider" = 'CHATGPT_PROJECT_MEMORY'
      AND i."status" = 'ACTIVE'
    WHERE p."status" NOT IN ('ARCHIVED', 'DELETED')
    ORDER BY p."updatedAt" DESC
    LIMIT 100
  `);
  const runId = randomUUID();
  const errors: Array<{ projectId: string; message: string }> = [];
  let checked = 0, updated = 0, skipped = 0;

  for (const project of projects) {
    const repository = normalizedGitHubRepo(project.repositoryUrl);
    if (!repository) { skipped++; continue; }
    try {
      const latest = await currentCommit(repository, token);
      checked++;
      if (!isRecentGitHubCommit(latest.date)) { skipped++; continue; }
      if ((await findRecordedCommit(project.id, latest.sha)).length) { skipped++; continue; }

      // Re-check permission directly before every persistent write.
      const active = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id" FROM "StudioIntegration" WHERE "projectId" = ${project.id}
          AND "provider" = 'CHATGPT_PROJECT_MEMORY' AND "status" = 'ACTIVE' LIMIT 1
      `);
      if (!active.length) { skipped++; continue; }
      await addVaultEntry({
        projectId: project.id,
        type: 'NOTE',
        title: 'GitHub: actividad reciente verificada',
        content: `Commit ${latest.sha.slice(0,12)} · ${latest.message}\n${latest.url}\nFecha: ${latest.date || 'sin fecha'}`,
        source: 'ENGINEERING_STUDIO',
        sourceRef: `github-commit:${latest.sha}`,
        meta: { source: AGENT, repository, sha: latest.sha, url: latest.url, timestamp: latest.date }
      });
      updated++;
    } catch (error) {
      errors.push({ projectId: project.id, message: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }
  return { runId, checked, updated, skipped, errors };
}

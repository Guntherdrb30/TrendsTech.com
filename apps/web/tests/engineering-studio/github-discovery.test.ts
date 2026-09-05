import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createGitHubRequest,
  GitHubDiscoveryError,
  listAllGitHubRepositories,
  resolveGitHubToken,
  type GitHubRepository,
} from '../../app/lib/engineering-studio/github-discovery';

function repository(id: number): GitHubRepository {
  return {
    id,
    name: `repo-${id}`,
    full_name: `trends/repo-${id}`,
    html_url: `https://github.com/trends/repo-${id}`,
    description: null,
    private: true,
    archived: false,
    default_branch: 'main',
    language: 'TypeScript',
  };
}

test('recorre todas las páginas de repositorios accesibles', async () => {
  const pages: number[] = [];
  const repos = await listAllGitHubRepositories(async (_path, query) => {
    const page = Number(query?.page);
    pages.push(page);
    return page === 1 ? Array.from({ length: 100 }, (_, index) => repository(index + 1)) : [repository(101)];
  });
  assert.equal(repos.length, 101);
  assert.deepEqual(pages, [1, 2]);
});

test('clasifica un token inválido sin filtrar el secreto', async () => {
  const secret = 'github_pat_secreto';
  const request = createGitHubRequest(secret, async () => new Response('{}', { status: 401 }));
  await assert.rejects(() => request('/user/repos'), (error: unknown) => {
    assert.ok(error instanceof GitHubDiscoveryError);
    assert.equal(error.code, 'TOKEN_INVALID');
    assert.equal(error.message.includes(secret), false);
    return true;
  });
});

test('exige una credencial explícita para la sincronización directa', () => {
  assert.throws(() => resolveGitHubToken({} as NodeJS.ProcessEnv), (error: unknown) => error instanceof GitHubDiscoveryError && error.code === 'TOKEN_MISSING');
});

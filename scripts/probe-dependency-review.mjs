import { appendFile } from 'node:fs/promises';
const repository = process.env.GITHUB_REPOSITORY;
const base = process.env.DEPENDENCY_BASE_SHA;
const head = process.env.DEPENDENCY_HEAD_SHA;
if (repository !== 'Guntherdrb30/TrendsTech.com' || !/^[a-f0-9]{40}$/.test(base ?? '') || !/^[a-f0-9]{40}$/.test(head ?? '') || !process.env.GITHUB_TOKEN || !process.env.GITHUB_OUTPUT) throw new Error('Invalid dependency review context');
const response = await fetch(`https://api.github.com/repos/${repository}/dependency-graph/compare/${base}...${head}`, {
 headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' },
 redirect: 'error', signal: AbortSignal.timeout(15000),
});
if (response.status === 403) {
 // The official action maps this response to unsupported Dependency Graph.
 // A full npm audit remains mandatory; no high/critical advisory is excepted.
 await appendFile(process.env.GITHUB_OUTPUT, 'supported=false\n');
 console.log('GitHub dependency graph is unavailable. Enforcing the complete npm vulnerability audit instead.');
} else if (response.ok) {
 await appendFile(process.env.GITHUB_OUTPUT, 'supported=true\n');
} else throw new Error(`Dependency review probe failed (HTTP ${response.status})`);

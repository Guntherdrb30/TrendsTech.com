# Phase 04 — Security automation and MCP hardening

Status: implemented and pending production deployment

Owner: Trends172Tech LLC

Date: 2026-07-31

## Controls implemented

### Continuous integration

The `Security and quality` GitHub Actions workflow runs on pushes and pull requests to `main` and can also be started manually.

It verifies:

- Reproducible installation with `npm ci`.
- Production dependency audit.
- TypeScript correctness.
- LUNA automated tests.
- Complete Next.js production build.
- Secret detection across the Git history relevant to the workflow event.
- Dependency review for pull requests.

Workflow permissions are read-only. External actions are pinned to immutable full commit SHAs.

### Dependency maintenance

- Next.js updated from 15.5.20 to 15.5.22.
- MCP SDK updated to 1.30.0.
- Hono server, `fast-uri`, and `brace-expansion` transitive advisories remediated.
- Dependabot scheduled weekly for npm and monthly for GitHub Actions.

The production audit currently reports zero critical advisories and three high transitive advisories inherited from the maintained Next.js 15 line:

- `GHSA-6g55-p6wh-862q`
- `GHSA-r28c-9q8g-f849`
- `GHSA-f88m-g3jw-g9cj`

These exact advisories are temporarily recorded in `scripts/security-audit.mjs`. The gate fails for every unapproved high advisory and every critical advisory. The exceptions must be removed when a compatible maintained Next.js release resolves them. `npm audit fix --force` is prohibited for this issue because npm currently proposes an unsafe breaking downgrade.

### MCP authorization

The public `/mcp` endpoint no longer accepts tenant, agent, or actor identity from request headers.

- `MCP_API_SECRET` is retained only for the read-only `ping` health check.
- Business tools require a client defined in the protected `MCP_CLIENTS_JSON` environment variable.
- Each client record binds a SHA-256 token hash to one tenant, one agent, one actor, and an explicit non-empty tool allowlist.
- The execution session identifier is derived from the registered client on the server and cannot be selected through request headers.
- Database relationships and actor authorization are verified again for every business tool call.
- Tool errors return a generic message; detailed failures remain in protected server logs.
- Every tool declares `readOnlyHint`, `destructiveHint`, and `openWorldHint` based on actual behavior.
- Read-only pricing tools no longer create audit records, so their annotation is accurate.

Expected protected configuration shape:

```json
[
  {
    "tokenSha256": "64-character-lowercase-sha256",
    "tenantId": "database-tenant-id",
    "agentInstanceId": "database-agent-instance-id",
    "actorUserId": "database-user-id",
    "allowedTools": ["get_pricing_info", "get_token_pricing"]
  }
]
```

The raw bearer token is delivered only to the approved MCP client. Vercel stores only the JSON configuration containing its hash and server-side scope.

## Remaining readiness work

- Replace scoped static MCP credentials with OAuth 2.1 before public plugin submission.
- Add rate limiting to MCP initialization and tool calls.
- Add end-to-end MCP Inspector tests for initialization, unauthorized calls, annotations, and allowed tools.
- Configure branch protection so `Security and quality` must pass before merging.
- Establish incident severity, response ownership, recovery objectives, and an evidence retention schedule.
- Upgrade the maintained Next.js line once the remaining transitive advisories have compatible fixes.

## Evidence

- CI workflow: `.github/workflows/security-quality.yml`
- Dependency automation: `.github/dependabot.yml`
- Audit gate: `scripts/security-audit.mjs`
- Responsible disclosure: `SECURITY.md`
- MCP enforcement: `apps/web/app/mcp/route.ts`
- Tool annotations: `packages/openai/src/tools.ts`

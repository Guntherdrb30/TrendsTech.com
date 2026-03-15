# Luna Code Orchestrator - Release Checklist

## Database

1. Confirm all Luna migrations are applied.
2. Run `npm --workspace packages/db run generate`.
3. Validate `schema.prisma` and production DB are aligned.

## Environment

1. Confirm `DATABASE_URL` and `DIRECT_URL`.
2. Confirm `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_URL`.
3. Set `LUNA_AGENT_ENCRYPTION_KEY`.
4. If using media on the site, confirm `BLOB_READ_WRITE_TOKEN`.

## Commercial setup

1. Review the active `Plan` for the tenant.
2. Validate `limitsJson` values for:
   - `lunaTaskLimit`
   - `lunaProjectLimit`
   - `lunaSupportsRemote`
   - `lunaSupportsMultiProvider`
   - `lunaSupportsRunnerExecution`
   - `lunaSupportsAdvancedRuntime`
3. Confirm billing and usage pages reflect the intended commercial tier.

## Product smoke test

1. Create a Luna project.
2. Save an AI provider.
3. Create a dry-run task from dashboard.
4. Create a remote QR session.
5. Open the mobile route and create a remote task.
6. Register a runner.
7. Pair and start the local runner.
8. Confirm heartbeat appears.
9. Claim and complete one task.
10. Review:
    - task detail
    - queue page
    - runner detail
    - billing page
    - usage page

## ROOT visibility

1. Open `/{locale}/root/luna-code-orchestrator`.
2. Confirm tenant usage, runners, and blocked actions appear.
3. Confirm blocked actions write audit events.

## Deployment

1. Run `npm run typecheck`.
2. Run `npm run luna:test`.
3. Build runner with `npm run luna:runner:build`.
4. Push to `main`.
5. Redeploy in Vercel if automatic deployment does not trigger.

## Rollback notes

1. If the UI fails but DB is fine, redeploy previous stable commit in Vercel.
2. If a runner misbehaves, revoke it by rotating token or setting it to `DISABLED`.
3. If a plan blocks users incorrectly, verify `Plan.limitsJson` before editing code.

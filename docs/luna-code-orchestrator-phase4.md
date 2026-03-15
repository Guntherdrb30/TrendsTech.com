# Luna Code Orchestrator - Phase 4

Phase 4 hardens Luna Code Orchestrator for production readiness.

## What changed

- runner health now degrades to `OFFLINE` when heartbeats go stale
- expired remote QR sessions are automatically moved to `EXPIRED`
- task creation UIs now respect commercial plan capabilities before submission
- remote mobile UI now hides blocked runtimes from normal use
- shell runner execution no longer uses `shell=true`
- shell commands are tokenized and enforced by allowlist
- basic automated tests were added for security helpers, validators, and shell tokenization

## Hardening decisions

### Runner health

Runners in `ONLINE` or `BUSY` state are considered stale after:

- `LUNA_RUNNER_STALE_MINUTES`

Default:

- `3` minutes

When stale, the dashboard and API normalize them to `OFFLINE`.

### Remote sessions

Remote QR sessions now expire operationally, not just visually.

Any `ACTIVE` session with `expiresAt <= now()` is moved to `EXPIRED` before:

- listing sessions
- opening the mobile remote page
- creating a remote task

### Shell runtime

The shell executor now:

- parses command + arguments explicitly
- rejects unclosed quotes
- rejects commands outside the allowlist
- runs with `shell: false`
- validates working directory existence
- truncates output to reduce oversized logs

## Minimal tests added

Command:

- `npm run luna:test`

Coverage currently includes:

- encryption roundtrip
- deterministic token hashing
- stale runner status fallback
- validator defaults and rejection cases
- shell tokenizer safety

## Environment variables

### Web/API

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_URL`
- `LUNA_AGENT_ENCRYPTION_KEY`

Fallback:

- if `LUNA_AGENT_ENCRYPTION_KEY` is missing, encryption falls back to `NEXTAUTH_SECRET`

Recommended:

- set `LUNA_AGENT_ENCRYPTION_KEY` explicitly in production

### Runner

- `LUNA_RUNNER_API_BASE_URL`
- `LUNA_RUNNER_ID`
- `LUNA_RUNNER_TOKEN`
- `LUNA_RUNNER_MODE`
- `LUNA_RUNNER_RUNTIME`
- `LUNA_RUNNER_POLL_INTERVAL_MS`
- `LUNA_RUNNER_MAX_TASK_SECONDS`
- `LUNA_RUNNER_ALLOWED_COMMANDS`
- `LUNA_RUNNER_DEFAULT_WORKDIR`
- `LUNA_RUNNER_HOST`
- `LUNA_RUNNER_MACHINE_LABEL`
- `LUNA_RUNNER_STALE_MINUTES`

## Residual risks

- `CODEX_CLI` is still an adapter foundation, not a full autonomous coding runtime
- the queue still uses polling instead of a dedicated worker broker
- runner execution depends on network reachability to the web API
- production rollout still requires tenant-level commercial validation of `Plan.limitsJson`

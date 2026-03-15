# Luna Code Orchestrator - Phase 3

Phase 3 turns Luna Code Orchestrator into a commercially gated product inside `trends172tech.com`.

## What this phase adds

- Commercial limits driven by the tenant's active subscription plan
- Monthly usage tracking with `DevUsageMetric`
- Billing and usage pages inside the Luna dashboard
- Backend enforcement for project creation, task creation, providers, QR sessions, and runners
- ROOT visibility page for tenant-level Luna adoption and blocked events

## Default commercial policy

### Basic

- `50` tasks per month
- `1` active project
- QR remote enabled
- single active AI provider
- no real runner execution
- no advanced runtime

### Pro

- `300` tasks per month
- `5` active projects
- QR remote enabled
- multiple AI providers
- runner execution enabled
- advanced runtime disabled

### Enterprise

- unlimited tasks
- unlimited projects
- QR remote enabled
- multiple AI providers
- runner execution enabled
- advanced runtime enabled

## Plan overrides from `Plan.limitsJson`

If a commercial plan already exists in the billing system, Luna reads these optional keys from `limitsJson`:

- `lunaTaskLimit`
- `lunaProjectLimit`
- `lunaSupportsRemote`
- `lunaSupportsMultiProvider`
- `lunaSupportsRunnerExecution`
- `lunaSupportsAdvancedRuntime`

This keeps Luna aligned with the current billing model without introducing a second subscription system.

## Database changes

Migration:

- `packages/db/prisma/migrations/20260315223000_luna_code_orchestrator_phase3_billing/migration.sql`

New enum:

- `DevUsageMetricType`

New model:

- `DevUsageMetric`

Tracked metrics currently include:

- `TASKS_CREATED`
- `TASKS_EXECUTED`
- `TASKS_FAILED`
- `REMOTE_SESSIONS`
- `RUNNERS_REGISTERED`
- `AI_PROVIDERS_SAVED`

## Enforcement points

Backend enforcement now runs before these actions:

- create project
- create task
- create AI provider
- create remote QR session
- register runner

If a plan blocks an action, Luna writes an audit event with one of these actions:

- `LUNA_LIMIT_BLOCKED_PROJECT`
- `LUNA_LIMIT_BLOCKED_TASK`
- `LUNA_LIMIT_BLOCKED_RUNTIME`
- `LUNA_LIMIT_BLOCKED_ADVANCED_RUNTIME`
- `LUNA_LIMIT_BLOCKED_PROVIDER`
- `LUNA_LIMIT_BLOCKED_REMOTE`
- `LUNA_LIMIT_BLOCKED_RUNNER`

## New UI areas

Tenant dashboard:

- `/{locale}/dashboard/agents/luna-code-orchestrator/billing`
- `/{locale}/dashboard/agents/luna-code-orchestrator/usage`

ROOT dashboard:

- `/{locale}/root/luna-code-orchestrator`

Settings page now shows the active plan, current limits, enabled features, and front-end gating for blocked actions.

## Operational notes

- Luna uses the active tenant subscription if one exists
- if no active subscription exists, Luna falls back to the `basic` policy
- backend enforcement remains the source of truth even if UI buttons are disabled

## Deployment steps

1. Apply the phase 3 migration
2. Run `prisma generate`
3. Run app typecheck
4. Review tenant plans and `limitsJson` overrides if needed
5. Validate billing, usage, settings, and ROOT pages

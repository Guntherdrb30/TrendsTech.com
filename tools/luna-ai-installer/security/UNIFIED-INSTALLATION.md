# LUNA AI Control Center + Security Gateway: unified installation contract

Status: specification for implementation. Not deployed.

## Installation
One installation registers tenant, application, agents, telemetry adapter, and Security Gateway configuration. Never claim an agent is protected until its provider invocation is routed through the enforcement adapter.

1. Scan repository, detect AI SDK calls and existing usage accounting.
2. Show installation plan and exact file changes.
3. Require explicit approval to apply changes in a branch/PR.
4. Configure tenant-level defaults and agent-specific overrides.
5. Deploy to preview, verify allow/throttle/deny behavior, then explicitly approve production.
6. Surface verification state: discovered / instrumented / protected / unhealthy.

## Control Center navigation
- Overview: agents, usage, cost, installation health.
- Agents: enable/disable, models, roles, per-agent settings.
- Consumption: tokens, calls, costs, daily/monthly budgets.
- Security Gateway: policies, modes, limits, emergency stop.
- Alerts and audit: anomalies, denials, budget events, operator changes.
- Installations: connected apps, adapter versions, verification.

## Security defaults
- Mode: observe (no enforcement), then adaptive after calibration.
- Policy scopes: tenant, installation, agent, user, service key.
- Controls: authenticated identity, RBAC, request rate, concurrency, cost reservation, daily/monthly budgets, circuit breakers.
- Keep counters and budget reservations atomic in a shared datastore.
- Fail safely: if central policy service is unreachable, use signed cached policy and local conservative caps; never bypass auth or budget checks.
- Never transmit prompt content, user PII, API keys or raw model output in telemetry.
- All policy edits audited and versioned; support rollback and emergency disable per agent.
- Guard against prompt injection at tool boundaries with server-side authorization, input validation, and approvals for consequential writes.

## Club Español pilot
Existing agents: luna, news, training. Existing local usage: logAiUsage().
Reuse the local usage source, add unique event identifiers, prevent double-counting, and verify calls in preview before enabling enforcement.

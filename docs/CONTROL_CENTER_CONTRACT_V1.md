# Trends172Tech Control Center Contract V1

Status: development, shadow telemetry only.

## Purpose

This contract lets a product implementation report agent executions and usage to Trends172Tech without transferring operational control. The first target is CarpiHogar, classified as an internal production implementation of LUNA.

LUNA Football and LUNA Medical are independent products. They are not LUNA modules or CarpiHogar implementations.

## Safety properties

- Service-to-service bearer credentials are stored only as SHA-256 hashes.
- Credentials are bound to one implementation and explicit scopes.
- Every run is idempotent within its implementation.
- Agent template versions must be approved before they can receive runs.
- An agent deployment must belong to the authenticated implementation.
- The contract accepts safe metadata, not raw prompts, customer records, credentials, or unrestricted outputs.
- `shadowMode=true` means the implementation continues operating if the control plane is unavailable.

## Authentication

Send `Authorization: Bearer trc_<prefix>.<secret>`.

Required scopes:

- `agent-runs:write`: create runs, events, and completion records.
- `usage:write`: append model/GPU usage records.

## Endpoints

### Create a run

`POST /api/control/v1/agent-runs`

Required fields: `idempotencyKey`, `implementationKey`, `agentTemplateKey`, `agentVersion`, and `traceId`.

The endpoint returns HTTP 202 with `runId`, `status`, and `shadowMode`. Repeating the same idempotency key for the same implementation returns the existing run.

### Append an event

`POST /api/control/v1/agent-runs/{runId}/events`

Events are idempotent by run and sequence. Use this for lifecycle and skill telemetry such as `agent.started`, `skill.started`, or `skill.completed`.

### Append usage

`POST /api/control/v1/agent-runs/{runId}/usage`

Records provider, model, token counts, latency, estimated cost, and optional GPU milliseconds. It does not change the existing TokenUsageLog yet.

### Complete a run

`POST /api/control/v1/agent-runs/{runId}/complete`

Terminal statuses are `SUCCEEDED`, `FAILED`, and `CANCELLED`.

## Bootstrap

The bootstrap is dry-run by default:

```bash
npm run control:bootstrap
```

After migration validation against an approved staging database:

```bash
npm run control:bootstrap -- --apply
```

Issuing a service credential is a separate, explicit operation:

```bash
npm run control:bootstrap -- --apply --issue-client
```

The plaintext token is printed once. Store it in an approved secret manager and never commit it.

## Rollback

Disable the connector or revoke its service client. Do not remove the additive tables during an incident. CarpiHogar remains autonomous while shadow mode is active.

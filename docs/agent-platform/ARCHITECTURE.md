# Trends172 Agent Platform — Control Plane V1

## Objective

Centralize reusable AI agents for Trends172Tech applications and customer organizations without duplicating agent logic inside each product.

The platform follows this rule:

`Agent Template + Version + Tenant Configuration + Tool Bindings = Agent Deployment`

Applications remain systems of record. Agents provide reasoning/orchestration. MCP/API tools provide controlled actions against applications.

## Existing foundation to preserve

The repository already contains multi-tenant agent primitives (`Tenant`, `AgentInstance`, knowledge, sessions, access controls, token usage, subscriptions), an OpenAI Agents SDK package, development orchestration models, OAuth/MCP routes, and an administrative project domain. V1 evolves these primitives instead of replacing them.

## Control plane domains

1. Organizations / Tenants
2. Agent Templates
3. Agent Versions
4. Deployments
5. Tools & MCP Servers
6. Knowledge
7. Sessions / Memory
8. Runs & Traces
9. Usage & Costs
10. Policies / Approvals
11. Evaluations
12. Channels

## Runtime request envelope

Every execution must resolve and validate:

- `tenantId`
- `deploymentId`
- `agentInstanceId`
- `sessionId`
- `channel`
- optional `userId`, `projectId`, `endCustomerId`

No tool may infer a tenant from global state. Tool execution must receive tenant context explicitly.

## Runtime flow

```text
Channel / Application
  -> Trends172 Agent API
  -> Tenant Resolver
  -> Deployment Resolver
  -> Agent Version
  -> Policy / Guardrails
  -> Model Runtime
  -> Tool Gateway
      -> Internal tools
      -> MCP servers
      -> External connectors
  -> Usage Meter + Trace
  -> Response
```

## CarpiHogar pilot

The existing CarpiHogar ChatGPT MCP is the first external MCP pilot.

Two paths should coexist during validation:

```text
ChatGPT -> CarpiHogar MCP -> CarpiHogar
```

```text
CarpiHogar / test client -> Trends172 Agent Platform -> Agent Deployment -> CarpiHogar MCP -> CarpiHogar
```

The platform must not reimplement product search, inventory, cart, BOM, stock validation or estimate logic already exposed by CarpiHogar MCP. The agent decides when/how to use those capabilities; the MCP performs the product action.

## Agent creation workflow

1. Receive a requested capability.
2. Search existing templates/capabilities.
3. Reuse an existing template when possible.
4. Extend/version when the difference is reusable.
5. Create a new template only for a genuinely new capability.
6. Bind tenant-specific knowledge, branding, policies and tools through a deployment.
7. Run evaluations.
8. Require human approval for production deployment.
9. Observe traces, errors, usage and cost.

## Tool risk model

- `READ`: may execute automatically when tenant authorization permits it.
- `WRITE`: policy-controlled.
- `SENSITIVE`: explicit policy and audit required.
- `CRITICAL`: human approval required by default.

Examples of actions that should default to human approval include production deployment, publication, destructive operations, price changes, invoice/payment actions and security-critical changes.

## Migration principle

Existing `AgentInstance` records are preserved. V1 introduces template/version/deployment semantics around the existing runtime rather than deleting or rewriting current agent behavior in one migration.

## First milestone

A CarpiHogar request executes through a Trends172-hosted agent deployment, calls the existing CarpiHogar MCP, returns real product/system data, and records tenant, agent/deployment, session, tools, model, token usage, duration, status and cost.

## Non-goals for the first milestone

- Do not remove existing CarpiHogar agents.
- Do not replace the current ChatGPT MCP integration.
- Do not deploy automatically to production.
- Do not duplicate MCP business logic inside Trends172Tech.
- Do not migrate every application before the CarpiHogar pilot passes evaluations.

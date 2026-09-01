# OpenAI and NVIDIA Partner Readiness Evidence

This file tracks verifiable implementation evidence. It does not claim partnership, certification, validation, discounts, hardware grants, or approval by OpenAI or NVIDIA.

## Current evidence

| Capability | Evidence | Status |
| --- | --- | --- |
| Multi-product governance | `ControlProduct` and `ControlImplementation` | Implemented in schema; migration pending staging |
| Production reference case | CarpiHogar bootstrap as internal LUNA implementation | Dry-run verified |
| Versioned agents | `ControlAgentTemplate` and `ControlAgentTemplateVersion` | Implemented in schema |
| Deployment isolation | AgentInstance links plus implementation-bound credential | Implemented in schema/API |
| Service security | Hashed token, scopes, expiry, constant-time comparison | Implemented; rotation UI pending |
| Agent telemetry | Runs, ordered events, provider/model usage, cost and GPU time | Implemented in contract V1 |
| Human governance | Approved agent template versions | Initial control implemented; approval workflow pending |
| Multi-model architecture | Provider/model fields independent of vendor | Contract ready; router pending |
| OpenAI integration | Existing `packages/openai` and orchestrator | Existing capability; end-to-end evidence update pending |
| NVIDIA integration | Provider-neutral usage plus GPU milliseconds | Contract ready; Nemotron/runtime integration pending |

## Evidence still required

1. Apply and verify the additive migration in staging.
2. Register real CarpiHogar agents and skills without copying secrets or customer data.
3. Run shadow telemetry from at least one real workflow.
4. Show usage, cost, latency, policy, and audit records in the Trends172Tech administrator.
5. Add a provider router with OpenAI and NVIDIA-compatible adapters, fallbacks, budgets, and evaluations.
6. Document security testing, incident response, data handling, and human approval controls.
7. Produce a reproducible architecture demo and case study using confirmed metrics only.

## Verification policy

Every external claim must link to code, a test, an audited run, a deployment, or an approved document. Planned capabilities remain labeled as development or future vision until verified.

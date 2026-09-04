# Trends MCP — Private Engineering Studio Bridge

## Purpose
Make ChatGPT/Codex a collaborative surface for Trends Engineering Studio while Engineering Studio remains the system of record.

## Economic routing
1. CHATGPT_CODEX membership surface when work is performed interactively in ChatGPT/Codex.
2. NVIDIA_LOCAL when local infrastructure is available and appropriate.
3. PAID_API / Astra only after the applicable cost/approval policy.

The MCP never represents ChatGPT subscription allowance as API credit.

## Archetype
Private internal `tool-only` MCP app. A widget is not required for MVP because the Engineering Studio web UI already exists.

## Project Vault
Every relevant project milestone can be persisted as a versioned `StudioVaultEntry`. Entries are never silently overwritten: a replacement marks the previous entry SUPERSEDED and links the new version to it.

Sources: CHATGPT, CODEX, ASTRA, NVIDIA, ENGINEERING_STUDIO, USER.

Initial types: CONVERSATION_SUMMARY, PRD, REQUIREMENT, DECISION, ARCHITECTURE, CHANGE_REQUEST, TASK, CODEX_RESULT, TEST_RESULT, DEPLOYMENT, ARTIFACT, NOTE.

## Context Packs
A Context Pack is a generated, auditable snapshot for a specific agent role. It combines current Blueprint state with only relevant current Vault entries. This avoids sending the full historical conversation to every agent.

## MCP MVP tools
Read-only:
- `search`: project/Vault discovery using the standard MCP search result shape.
- `fetch`: fetch a project or Vault entry by stable ID.
- `studio_get_project`: structured project state.
- `studio_get_context_pack`: build/retrieve agent-scoped context.
- `studio_get_runs`: execution history.

Mutating:
- `studio_create_project`: create project shell/Blueprint.
- `studio_add_vault_entry`: persist a ChatGPT/Codex milestone.
- `studio_record_decision`: persist a decision.
- `studio_update_prd`: create a new PRD version; never overwrite history.
- `studio_create_task`: create backlog/Codex task.
- `studio_prepare_run`: prepare supervised run/workspace.
- `studio_request_approval`: create an approval request.

## Security contract
- Remote HTTPS `/mcp` endpoint.
- Private authentication; no anonymous mutations.
- Project-scoped authorization.
- ROOT/admin writes for MVP.
- Mutating tools declare accurate MCP destructive/idempotent annotations.
- Approval Gates remain authoritative for spend, production, schema changes, merge to main and destructive actions.
- No secrets are stored in Vault content.
- Every mutation produces an audit event.
- Idempotency/sourceRef is used for ChatGPT synchronization to prevent duplicated imports.

## ChatGPT sync principle
ChatGPT does not need to copy the entire private conversation automatically. During project work, relevant milestones are explicitly synchronized through MCP tools. A conversation summary can be periodically persisted, while PRDs, decisions and tasks are stored as first-class structured entries.

## NVIDIA handoff
When Astra/NVIDIA agents take over, the orchestrator requests a role-specific Context Pack. NVIDIA execution continues to use the four-layer runtime defined by Engineering Studio: NeMo Agent Toolkit, Dynamo, OpenShell/NemoClaw and TensorRT-LLM where compatible.

## Deployment status
This document defines the contract only. The database migration, authenticated remote MCP route and ChatGPT Developer Mode connection must be verified separately before the bridge is considered operational.

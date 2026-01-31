# Architecture Map

## 1. Relevant folder tree
- `apps/web` – Next.js App Router app with one `middleware.ts` for locale + auth gating, Route Handlers in `app/api`, and page sections under `app/[locale]/...` (protected dashboard + public marketing pages).
  - `app/(locale)/(public)` hosts marketing pages (`agents`, `pricing`, `recharge`) plus the login/register flows.
  - `app/(locale)/(app)/dashboard` holds tenant dashboard screens (agents, installs, users, profile) backed by Prisma queries inside Server Components.
  - `app/api` holds the REST/JSON endpoints: auth (`[...nextauth]`), `orchestrator/chat`, `installs`, `knowledge-sources`, `tenants`, `global-settings`, bot webhooks, token wallet top-ups, etc.
  - `app/mcp/route.ts` wires the MCP server for tool execution.
  - `components` (`ui/` button/card/table) provides the shared design system consumed by dashboards and marketing pages.
  - `lib` houses auth guards, tenant resolution, orchestrator logic, KB ingestion helpers, billing/pricing, validators, and feature/theme bundles.
- `packages/db` – Prisma schema + migrations (Tenant, AgentInstance, TokenWallet, AuditLog, AgentSession, KnowledgeSource, Install, etc.) plus auto-generated client.
- `packages/openai` – Base agent definitions, tool definitions (`create_lead`, `get_token_pricing`, `create_agent_instance`, etc.), and helper SDK exports used by the orchestrator.
- `packages/core` – Minimal shared types.
- `apps/widget` – Independent browser bundle that powers the embeddable widget; talks to `/api/installs/validate` and `/api/orchestrator/chat` from the tenant install.
- `docs` – (target for this and future documentation like `ARCHITECTURE_MAP.md` and `agent-access.md`).

## 2. Module summaries
- **Auth & tenant resolution:** `app/api/auth/[...nextauth]/route.ts` uses NextAuth CredentialsProvider against `prisma.user`. Guards in `app/lib/auth` (`requireAuth`, `requireRole`, `requireTenantId`) and `lib/tenant` keep multi-tenancy enforced.
- **Next.js data flow:** The App Router handles locales via `middleware.ts` (injects `/es` or `/en`, enforces session cookies for `/dashboard` and `/root`). Data-heavy pages (`dashboard/page.tsx`, install lists, etc.) call server helpers that fetch via Prisma and `requireAuth`/`resolveTenantFromUser`.
- **API pattern:** All HTTP surfaces are Next.js Route Handlers (`export async function GET/POST...`). They parse Zod schemas (`app/lib/validators`), enforce `requireAuth`/`requireRole`, and run Prisma queries scoped by tenant.
- **UI kit:** `components/ui/{button,card,input,label,table}.tsx` plus higher-level components (`token-recharge-form`, `agent-chat`, `profile-form`, `dashboard-client`) keep interactions consistent.
- **Agent runtime & orchestrator:** `app/api/orchestrator/chat/route.ts` validates requests (widget vs. internal), resolves installs/users, and delegates to `app/lib/orchestrator/engine.ts`. The engine builds context (`contextBuilder.ts`), loads conversation history from `AuditLog`, runs the OpenAI `Runner`, updates `agentSession`, and logs usage via `prisma.auditLog` + `tokenUsageLog` + `tokenWallet` adjustments.
- **Knowledge base ingestion:** `lib/kb` contains queue config, job processor, ingest helpers (PDF/URL/text), and `knowledge-worker.ts` that runs with BullMQ + Redis. Logs are persisted via `AuditLog` through `createKnowledgeLogger`.
- **Integrations:** WhatsApp webhook lives at `app/api/orchestrator/webhooks/whatsapp/route.ts` (signature validation, limit enforcement, `runOrchestrator`, `logWhatsAppMessage`, biliing entries). MCP server under `app/mcp` allows CLI/SDK tools to run (requires `x-tenant-id`, `x-agent-instance-id`, etc.).
- **Billing/token tracking:** Billing helpers in `app/lib/billing/pricing.ts` read `globalSettings` for dynamic rates. `tokenWallet` + `tokenUsageLog` track consumption; `runOrchestrator` charges the wallet after logging usage.

## 3. Extension points for tracking & auditing
- **Conversation tracking:** `app/lib/orchestrator/engine.ts` already logs every turn via `logConversation`/`logUsage` (writes to `AuditLog`, `TokenUsageLog`). Insert additional metrics (e.g., `agentAccessId`, channel metadata) near the `logConversation` call.
- **Ingress validation:** `app/api/orchestrator/chat/route.ts` enforces install/domain whitelisting before calling `runOrchestrator`, making it the natural place to validate `AgentAccess` records for embedded web clients.
- **Webhook tracking:** `app/api/orchestrator/webhooks/whatsapp/route.ts` logs inbound/outbound messages (`logWhatsAppMessage`) and usage (`logWhatsAppUsage`) using `AuditLog`. Additional cross-references (e.g., linking to `AgentAccess`) can be added here.
- **Knowledge ingestion:** `lib/kb/logs.ts` funnels ingestion status into `AuditLog`. One could tap this to correlate `AgentAccess` when a tenant uploads docs for a given agent.
- **Widget validation:** `app/api/installs/validate/route.ts` already checks domains and returns agent branding. A future `AgentAccess` check would naturally sit here (per-install with domain lists and channel restrictions).

## 4. Key files & routes (must-watch)
- `app/api/auth/[...nextauth]/route.ts` — NextAuth config/credentials.
- `app/api/installs/route.ts` & `[installId]/route.ts` — create/update widget installs (domain gating).
- `app/api/orchestrator/chat/route.ts` — widget/internal chat entry point + tenant guard.
- `app/lib/orchestrator/engine.ts` / `contextBuilder.ts` — orchestrator, logging, token charging, knowledge lookup.
- `app/api/orchestrator/webhooks/whatsapp/route.ts` — WhatsApp inbound/outbound logging + limit enforcement.
- `app/api/knowledge-sources/route.ts` + `[sourceId]/reindex/route.ts` — ingestion REST endpoints + knowledge job queue.
- `app/api/tenants/route.ts` — ROOT-only tenant creation + initial agent creation.
- `app/api/token-wallet/route.ts` & `manual-payments/route.ts` — token wallet adjustments and manual payment creation.
- `app/(locale)/(app)/dashboard` pages — Server Components that display agents, installs, user management.
- `app/(locale)/(public)/agents/[agentKey]/page.tsx` & `components/agent-chat.tsx` — marketing + chat flows hitting the same `installs`/`orchestrator` APIs.
- `apps/widget/src` — embeddable widget logic (state, API interaction). It relies on `/api/installs/validate` + `/api/orchestrator/chat` + `CHTworkflow` env vars.

## 5. Risks for production & mitigations
- **Tenant leaks:** Prisma queries must always filter by the current `tenantId` (guards + `requireTenantId`). Review API routes and new AgentAccess lookups for missing filters.
- **Token exhaustion:** `runOrchestrator` checks `tokenWallet` before running and debits after `logUsage`. When injecting new access paths (embedded channels, AgentAccess), keep these checks in place and avoid new per-request token drains without gating.
- **Domain/channel spoofing:** Widget/API endpoints rely on installs’ `publicKey` + allowed domains. Any new AgentAccess table must be consulted alongside `install` verification and service-layer validation to prevent unauthorized embeds.
- **Data race / audit loss:** `AuditLog` writes happen inside orchestrator/WhatsApp pipelines. If future tooling writes concurrently, keep writes idempotent and keep `metaJson` small.
- **Long-running jobs:** Knowledge ingestion uses BullMQ + Redis. Avoid blocking Redis connections from other services by keeping job processing isolated (no synchronous waits). Log job failures (already done) so operators can requeue.

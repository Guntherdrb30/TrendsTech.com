# LUNA AI Control Center — implementation foundation

Owner: Trends172Tech. This is a **multi-tenant product**, not a CarpiHogar-specific dashboard.

## Core design
- **Control plane** in TrendsTech.com: tenant, application, installation request, approval, license, subscription, payment state, credential rotation and audit trail.
- **Data plane**: authenticated usage ingestion from each installed SDK, idempotent event writes, metering, model/provider catalog and budgets.
- **Intelligence plane**: read-only AI analyst with auditable SQL-backed aggregates, executive reports, anomalies and recommendations. Never let an LLM invent costs or mutate billing.
- **Connectors**: server-side SDK + API are required; embedded dashboard and MCP are optional presentation/control channels.

## First delivery — acceptance criteria
1. Tenant administrator can request an installation for an application and environment.
2. ROOT can approve/reject it; approval creates a unique installation identity. Only approved installations can receive credentials.
3. Credentials are hashed at rest, scoped to tenant+installation, rotatable and revocable; raw secret is shown once.
4. Ingestion authenticates installation, validates event schema, enforces idempotency on installation+operation ID, and never stores prompts, completions or personal data.
5. Dashboard shows actual usage, errors and estimated cost by platform, module, provider and model, with date filtering.
6. License states and payments are independent of telemetry. Suspending LUNA must **not** disable the customer's underlying AI automatically.
7. Tenant isolation is enforced server-side for all queries and mutations; audit approval, credential and policy changes.

## Existing code to reuse
- `packages/db/prisma/schema.prisma`: Tenant, existing install/subscription and administrative license/payment structures. Inspect relations and semantics before migration; avoid duplicate concepts.
- `apps/web`: authentication, administrative UI and API routes.
- `packages/*`: reusable SDK and shared contracts.
- CarpiHogar: existing `lib/ai-usage-tracker.ts` can be adapted into a shared SDK after confirming compatibility.

## Safe implementation sequence
1. Inventory existing installation, billing and authentication models/routes.
2. Define shared contracts and migrations on an isolated branch; review migration and ensure no destructive changes.
3. Implement ROOT approval workflow and audit log; write permission tests.
4. Implement credentials and authenticated usage ingestion; test cross-tenant denial and replay.
5. Build ROOT and tenant dashboards, reports and read-only analyst.
6. Connect CarpiHogar first, LUNA Football second; validate usage against provider billing.
7. Enable payment/license automation only after reconciliation and end-to-end tests.

## Financial definitions
- API cost: provider usage multiplied by versioned rates; label estimates vs reconciled actuals.
- Wallet top-up: cash received / liability, not automatically earned revenue.
- Earned revenue: billed usage or recognized subscription revenue.
- Gross profit: earned revenue minus attributable direct costs; missing inputs must be marked unavailable.

## Security rules
No production database migrations or automatic deployment without verification. No endpoint shutdown based solely on a remote UI toggle. No implicit free ChatGPT API consumption. AI recommendations are advisory unless an authorized user confirms a policy change.

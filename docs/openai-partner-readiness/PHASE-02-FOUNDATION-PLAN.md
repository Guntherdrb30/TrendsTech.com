# Phase 02 — Foundation Plan: Security, Stability, SEO and Internationalization

**Project:** Trends172Tech.com
**Prerequisite:** `docs/openai-partner-readiness/PHASE-01-AUDIT.md`
**Status:** Planning only — no implementation, deployment, migration, commit, or production change is authorized by this document.

## Objective

Prepare the current application for a professional corporate-site evolution without disrupting LUNA, CarpiHogar, LUNA Football, existing authentication, agents, dashboards, integrations, or production users.

This phase makes the existing system safer, easier to maintain, indexable, and fully localized before the public visual redesign begins.

## Guiding decisions

- Public messaging remains provider-neutral. Do not mention OpenAI, partner programs, provider logos, or future applications.
- Public proof centers on active products: **LUNA**, **CarpiHogar**, and **LUNA Football**.
- LUNA Football may be described as active at Club Español E.F. only with verified capability wording: players, teams, coaches, employees, payroll, registrations, monthly fees, equipment inventory, credentialing, traceability, and AI-assisted modular training planning.
- No capability is described publicly as production unless the founder/product owner confirms it.
- No destructive change, database migration, route deletion, or production deployment occurs without a reviewed implementation task and rollback plan.

## Phase 2 success criteria

1. No automatic database deployment is triggered as a side effect of dependency installation.
2. Cron, public forms, chat and webhook-facing routes have explicit authorization/anti-abuse behavior.
3. Production dependencies are upgraded or have documented mitigations for each high/critical issue.
4. Security headers are deliberate, tested and compatible with external services.
5. Every public indexable page has locale-aware metadata, canonical URLs and alternate language references.
6. `robots.txt` and `sitemap.xml` exist and exclude private/token/API paths.
7. Spanish and English content use a single maintainable translation model with no mixed-language public pages.
8. Lint, typecheck, tests and build pass in CI before any deployment.

## Implementation progress

### Completed — foundation safety block (2026-07-13)

- `postinstall` now generates Prisma Client only; it no longer invokes `prisma migrate deploy`.
- An explicit `db:migrate:deploy` command now exists for a separately approved deployment workflow.
- `/api/cron/bcv-rate` now fails closed with `503` when `CRON_SECRET` is absent and returns `401` for an invalid authorization header.
- `.env.example` now documents `CRON_SECRET` and the dedicated `LUNA_AGENT_ENCRYPTION_KEY`.
- LUNA credential encryption now prioritizes `LUNA_AGENT_ENCRYPTION_KEY`, while retaining `AUTH_SECRET`/`NEXTAUTH_SECRET` only as a compatibility fallback for existing encrypted data.
- `postinstall`, lint, TypeScript checks, the 11 available tests and a full production build passed after the changes.
- The three existing lint warnings were resolved without changing product behavior; lint now passes with zero warnings and zero errors.

### Dependency remediation status

- Automated non-breaking remediation reduced production audit findings from **43** (1 critical, 14 high, 28 moderate) to **6** (2 high, 4 moderate).
- Remaining items are `next`/transitive `postcss`, `xlsx`, `next-auth`/transitive `uuid`, and `next-intl`.
- Updating Next to `15.5.20` created duplicate React/Next runtimes under the workspace and failed build-time prerendering. The repository was deduplicated and restored to the known-working `Next 15.5.9` / `React 19.0.0` combination. A Next/React/next-intl upgrade therefore requires a dedicated compatibility task rather than an automatic audit fix.
- `xlsx` has no available automated fix and requires a replacement/containment decision based on where spreadsheet parsing is used.

### Security headers progress

- Added `X-Content-Type-Options`, `Referrer-Policy`, `X-DNS-Prefetch-Control`, and a conservative `Permissions-Policy` for all application routes.
- Added a report-only Content Security Policy covering the current ChatKit and Turnstile integration origins. It is intentionally report-only until browser/integration verification confirms that an enforced policy will not block active functionality.
- Clickjacking enforcement remains pending until every legitimate embedding use case is inventoried.

### Application anti-abuse progress

- Added a reusable per-IP fixed-window limiter with `429`, `Retry-After`, and rate-limit response headers.
- Applied conservative limits to lead capture, registration, password reset, Turnstile verification, agent-preview chat/file parsing, intake recommendations, and the public agent endpoint.
- Added automated coverage for blocking, window reset, client isolation, and forwarded-IP extraction.
- This application-level limiter is defense-in-depth and scoped to each running application instance. A distributed Vercel Firewall or shared-store policy remains required for strong cross-instance enforcement at scale.

### SEO foundation progress

- Added a canonical public-origin helper backed by `NEXT_PUBLIC_SITE_URL`, with a safe production fallback.
- Added bilingual `sitemap.xml` entries with language alternates for the current public route inventory.
- Added `robots.txt` rules that expose public content while excluding APIs, private dashboards, authentication routes, remote token routes and operational areas.
- Added locale-aware Spanish/English metadata, canonical URLs, Open Graph and Twitter fields to the corporate homepage.
- Extended the same locale-aware metadata contract to systems, LUNA, projects, agents, all agent detail pages, skills, pricing, news, agent creation, founder profile and official links.
- Added the six public agent detail routes to the bilingual sitemap and included an `x-default` alternate for every indexed route.
- Added explicit `noindex` metadata to authentication, application, admin, root and remote-token surfaces.
- Added explicit `noindex` coverage for recharge and email-template preview surfaces that sit outside the main private route layouts.
- A branded social-sharing image and structured data remain pending before the SEO workstream is complete.

## Workstream A — Security and deployment safety

### A1. Prevent implicit migrations

**Current risk:** Root `postinstall` invokes `prisma migrate deploy` when `VERCEL !== '1'`; its behavior conflicts with its log message and can attempt database changes during local or CI installs.

**Plan:**

1. Remove database deployment from `postinstall`.
2. Keep Prisma client generation explicit and safe for local/build workflows.
3. Define one explicit migration command for controlled environments.
4. Require an intentional deployment workflow with database backup/rollback verification.
5. Document required environment variables without exposing values.

**Acceptance tests:** `npm ci` must not connect to or mutate a database; Prisma generation must remain available; build must pass without production database credentials.

### A2. Protect scheduled jobs

**Current risk:** `/api/cron/bcv-rate` accepts unauthenticated requests when `CRON_SECRET` is missing.

**Plan:** Fail closed in every environment where the endpoint can mutate production data. Return a configuration error if the secret is absent; verify the expected bearer token on every request.

**Acceptance tests:** missing/invalid token returns 401/503; valid token updates only the intended record; no token value appears in logs/responses.

### A3. Rate limits and public-route abuse controls

**Priority routes:** lead capture, registration, password reset, human verification, agent-preview chat/parse, intake recommendation, public agent, orchestrator widget chat, and WhatsApp webhook.

**Plan:**

1. Define traffic classes: anonymous form, anonymous AI request, authenticated user, widget installation, webhook, internal runner and cron.
2. Add an IP/user/install-based rate-limit policy with a provider appropriate for the deployment architecture.
3. Enforce request body-size limits and execution timeouts.
4. Return generic error messages for sensitive failures.
5. Preserve legitimate widget traffic through installation/domain checks.
6. Log security-relevant rejection events without storing secrets or unnecessary personal data.

**Acceptance tests:** repeated requests are throttled; valid requests remain functional; CORS preflight and allowed widget domains work; WhatsApp and agent costs cannot be triggered indefinitely by an anonymous caller.

### A4. Security headers and browser policy

**Current gap:** HSTS is present in production, but CSP, frame, MIME-sniffing, referrer and permissions policies were not observed in the audit response.

**Plan:**

1. Inventory external script/image/font/API origins first: ChatKit, Turnstile, Vercel assets, WhatsApp-related endpoints and any verified media domains.
2. Add a report-only CSP before enforcing one.
3. Add `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and clickjacking protection appropriate to embedded use cases.
4. Test the widget and all third-party flows before enforcement.

**Acceptance tests:** no blocked essential scripts/forms/widgets; headers are visible on public pages; security policy is documented.

### A5. Secrets and encryption consistency

**Current gap:** Authentication configuration uses `AUTH_SECRET`; LUNA runner encryption uses `LUNA_AGENT_ENCRYPTION_KEY` or `NEXTAUTH_SECRET`.

**Plan:** Define one documented secret strategy. Use a dedicated encryption secret for stored runner/provider credentials, distinct from application authentication where feasible. Validate required production variables at startup without exposing their values.

## Workstream B — Dependency health and quality gates

### B1. Dependency remediation

**Current audit:** `npm audit --omit=dev` reported 43 production vulnerabilities: 1 critical, 14 high, 28 moderate. Direct dependencies include Next.js, MCP SDK, XLSX, AWS S3, BullMQ, NextAuth and next-intl.

**Plan:**

1. Capture current lockfile and test baseline.
2. Upgrade critical/high paths in isolated batches.
3. Assess breaking changes in Next.js, React, Prisma, NextAuth and MCP dependencies independently.
4. Replace or constrain `xlsx` if no safe supported version resolves its advisories.
5. Run authenticated, widget, knowledge, upload and runner regression checks after each batch.
6. Keep a short vulnerability exception register only when a patch is unavailable and mitigation is documented.

### B2. Modernize lint and CI

**Current gap:** the existing warnings are resolved, but `next lint` is deprecated and must be migrated before a future Next.js 16 upgrade.

**Plan:**

1. Migrate to ESLint CLI configuration compatible with the installed Next.js version.
2. Preserve existing Next core-web-vitals/type rules.
3. Decide whether warnings block CI; security/accessibility warnings should be blocking.
4. Add a CI workflow running `npm ci`, typecheck, lint, focused tests and build.

**Quality gate:** no new lint warning; typecheck, tests and build required on every pull request.

## Workstream C — SEO and public discoverability

### C1. Public versus private route policy

**Indexable:** corporate, solution, LUNA, CarpiHogar, LUNA Football, approved case studies, public agents only if intended, insights and contact pages.

**Noindex/exclude:** dashboard, ROOT/admin, authentication, APIs, remote token paths, runner paths, payment/recharge flow where appropriate, internal previews and all user-specific pages.

### C2. Metadata system

Create a typed metadata helper that receives locale, route, title, description, social image, canonical route and translation alternatives. It should produce title templates, descriptions, Open Graph/Twitter tags, robots policy and canonical/alternate links.

### C3. Sitemap, robots and structured data

1. Add file-based App Router `robots.ts` and `sitemap.ts`.
2. Include only public canonical routes in the sitemap.
3. Add Organization, WebSite, Service/SoftwareApplication, Article and FAQ schema only where supported by visible content.
4. Add case-study schema only after evidence, owner and dates are confirmed.

### C4. Image and performance hygiene

1. Convert/compress oversized public PNG assets to appropriate modern formats where visual quality permits.
2. Use `next/image` for public images where possible, with meaningful localized alt text and intrinsic dimensions.
3. Generate page-specific social images.
4. Delay non-essential scripts, especially globally loaded interactive chat assets.

## Workstream D — Complete internationalization

### D1. Translation source of truth

Use `next-intl` message namespaces as the source of truth for UI and marketing copy. Eliminate scattered locale ternaries unless they only select localized data models.

Recommended namespaces:

```text
navigation
metadata
home
company
solutions
luna
carpihogar
lunaFootball
agents
caseStudies
securityGovernance
forms
auth
dashboard
system
```

### D2. Translation completeness

Audit every public page for:

- headings, paragraphs, buttons and navigation;
- forms, labels, placeholder and validation messages;
- metadata, canonical/alternate values and social text;
- empty/loading/error states;
- agent prompts and visible chat copy;
- image alt text and image-text variants.

### D3. Automated guarantees

Add tests/scripts that compare ES and EN message keys, flag hardcoded public strings, and verify each indexable route has both language variants.

## Workstream E — Stability and observability

1. Add error monitoring and structured server logging suitable for production.
2. Capture web-vitals data for public pages.
3. Record AI-operation cost, failure, latency and escalation metrics without leaking customer content.
4. Define uptime/availability claims only after a monitoring source and review interval are in place.
5. Write operational runbooks for failed jobs, AI-provider failure, webhook failure, queue backlog, database failure and emergency feature shutdown.

## Recommended execution order

| Order | Work | Why first |
| --- | --- | --- |
| 1 | A1, A2, A5 | Avoid accidental data changes and insecure execution paths. |
| 2 | B1 | Critical/high dependency exposure. |
| 3 | A3, A4 | Protect public cost-bearing and browser-facing surfaces. |
| 4 | B2 | Establish repeatable quality gates before wider changes. |
| 5 | C1–C3 | Make the public site indexable with correct scope. |
| 6 | D1–D3 | Prevent mixed language and duplicated-content issues. |
| 7 | C4 and E | Improve measured performance, resilience and credibility. |
| 8 | Public information-architecture implementation | Only after foundation is verified. |

## Implementation task boundaries

Each implementation task must include:

- exact files/routes in scope;
- production impact assessment;
- migration/deployment requirement;
- test plan and expected result;
- rollback plan;
- owner approval for externally visible content or claims.

## Explicit non-goals for Phase 2

- No visual rebrand or wholesale homepage rewrite.
- No removal of existing route groups.
- No database schema migration unless separately approved.
- No public claims about AI providers, partners, certifications, uptime, compliance or customer outcomes without verified evidence.
- No deployment directly to production without a tested preview/review workflow.

## Phase 2 completion checklist

- [ ] Install does not trigger database migrations.
- [ ] Cron fails closed without its secret.
- [ ] Public endpoints have rate/body/timeout controls.
- [ ] Browser security headers pass integration testing.
- [ ] Critical/high dependency path is remediated or formally mitigated.
- [ ] ESLint CLI and CI quality gates are active.
- [ ] Sitemap and robots are live and correct.
- [ ] Canonical/hreflang/metadata are present for every public route.
- [ ] Public ES/EN pages are fully translated and validated.
- [ ] Core Web Vitals and error monitoring are established.
- [ ] Existing LUNA, CarpiHogar, LUNA Football, dashboard, agents, widget and auth flows pass regression tests.

## Next phase

Once this foundation is complete, Phase 3 can implement the public information architecture and approved content: Home, Company, LUNA, CarpiHogar case study, LUNA Football solution/case study, Agents, Security & Governance, Industries, Insights, Partner With Us and Contact.

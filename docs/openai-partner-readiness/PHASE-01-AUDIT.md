# Phase 01 — OpenAI Partner Network Readiness Audit

**Project:** Trends172Tech.com
**Date:** 2026-07-13
**Scope:** Read-only technical, strategic, internationalization, security, and positioning audit.
**Important:** This is an internal readiness assessment. The public website must not state or imply that Trends172Tech is an OpenAI Partner, OpenAI representative, OpenAI-certified company, or an applicant to any partner program.

## 1. Executive Summary

Trends172Tech has a credible technical base for presenting itself as an AI implementation and enterprise software company for Venezuela and Latin America. The repository is not a simple marketing site: it contains a multi-tenant application with authentication, role-based access, a Prisma/Postgres data model, AI agents, embedded widgets, knowledge ingestion, WhatsApp integration, billing controls, a task-runner subsystem, and public LUNA/agent experiences.

### Founder-confirmed scope (2026-07-13)

- **CarpiHogar** is a Trends172Tech-owned operation and the first real production case for **LUNA**.
- The products currently presented as functioning/operational are **LUNA**, **CarpiHogar**, and **LUNA Football**.
- **LUNA Football** is active at Club Español E.F. (`https://cdebarinasef.com/`). Its active scope provides operational control and traceability for players, teams, coaches, employees, payroll, registrations, player monthly fees, club-equipment inventory, and credentialing; it also includes AI-assisted modular training-creation processes. Its wider feature set must be published only after each capability is verified.
- **Club Management** must not be represented as an active production solution at this time.
- Public communications must be provider-neutral: no OpenAI names, logos, partnership references, or partner-program references.

The strongest strategic asset is the combination of **LUNA** as the core enterprise platform and **CarpiHogar** as a Trends172Tech-owned production operation where the platform is used and validated. The current site communicates technology and AI capability, but it still mixes several narratives: corporate site, product catalog, agent marketplace, demo environment, and operational dashboard. This makes the enterprise implementation value proposition less clear than it should be.

Before major visual redesign work, Trends172Tech should: (1) resolve security and deployment risks, (2) establish a complete multilingual and SEO architecture, (3) distinguish production capabilities from partial/development/planned items, and (4) structure the public site around verifiable evidence, implementation capability, governance, and the LUNA/CarpiHogar production story. The resulting quality should stand on its own during any future external review, without public references to OpenAI or partner programs.

### Readiness assessment

| Area | Current assessment | Notes |
| --- | --- | --- |
| Enterprise AI platform foundation | **Production / Partial** | Multi-tenant application, agents, integrations, roles, and data model are implemented; production configuration requires validation. |
| LUNA product narrative | **Partial** | Strong product material exists, but it is not yet consistently positioned as the central platform. |
| CarpiHogar case study | **Partial** | Real visual material exists, but ownership, production evidence, and measurable outcomes need a dedicated case-study narrative. |
| AI capability presentation | **Partial** | Agent, retrieval-related, tool, and orchestration patterns exist; public evidence and capability status need curation without naming specific providers. |
| Security and governance communication | **Partial** | Roles, secrets, tokens, logs, and human verification exist in code; no mature public governance page or evidence matrix exists. |
| Internationalization | **Partial** | `/es` and `/en` exist through `next-intl`; translations are mixed with locale ternaries and hardcoded page content. |
| SEO readiness | **Needs work** | Basic page metadata exists, but robots, sitemap, canonical URLs, hreflang, structured data, and comprehensive per-route metadata are missing. |
| Operational readiness / CI quality | **Partial** | Typecheck, tests, and build pass; dependencies contain important vulnerabilities and automated deployment safeguards need improvement. |

## 2. Current Technical Architecture

### Repository model

The repository is an npm-workspaces monorepo.

```text
apps/
  web/          Next.js App Router application: public site, auth, dashboards and APIs
  widget/       standalone browser widget bundle
packages/
  core/         shared types
  db/           Prisma schema, migrations, seed data and database client
  openai/       agent definitions, SDK helpers and tool declarations
  luna-runner/  local/remote task-runner package
docs/           technical architecture, plans and product documentation
```

### Frameworks and principal versions

| Technology | Detected version / use |
| --- | --- |
| Next.js | `15.5.9`, App Router |
| React / React DOM | `19.0.0` |
| TypeScript | `5.5.x`, strict mode |
| Styling | Tailwind CSS `3.4.x`, custom UI primitives inspired by shadcn/ui |
| i18n | `next-intl` `3.18.x` |
| Auth | `next-auth` `4.24.x`, credentials provider, JWT session |
| Database | Prisma `5.x`, PostgreSQL |
| Validation | Zod |
| AI | OpenAI Agents, OpenAI ChatKit, Anthropic SDK, MCP SDK |
| Async work | BullMQ and Redis |
| External services | Vercel Blob, AWS S3 option, Resend, Cloudflare Turnstile, WhatsApp Cloud API |

### Application routing

The live application uses locale-prefixed routes, resolved by `apps/web/middleware.ts`:

- Public: `/es`, `/en`, `/es/agents`, `/en/systems/luna`, pricing, projects, skills, news, recharge and agent-creation paths.
- Authentication: locale-prefixed login, registration, forgot-password and reset-password routes.
- Customer application: locale-prefixed dashboard, agents, installs, spending, profile, site media, and LUNA runner views.
- ROOT / administrative: locale-prefixed ROOT and admin sections for content, projects, payments, clients, proposals, emails, licenses and AI agents.
- APIs: Next.js Route Handlers under `apps/web/app/api`.
- MCP: `apps/web/app/mcp/route.ts` and API MCP routes.

There are also legacy non-localized route groups such as `app/(public)`, `app/(auth)`, and `app/(app)`. Since middleware redirects non-prefixed routes to a locale path, these should be assessed as legacy/compatibility routes before removal or refactoring.

### Authentication, authorization, and tenancy

- Credentials authentication is configured through NextAuth.
- JWT session fields include user ID, email, role, tenant ID, phone, and avatar URL.
- Shared guards provide `requireAuth`, `requireRole`, and `requireTenant`.
- APIs commonly enforce tenant roles such as `ROOT`, `TENANT_ADMIN`, and `TENANT_OPERATOR`.
- Middleware performs a lightweight session-cookie presence check before redirecting protected dashboard and ROOT paths. Route handlers and server pages must remain the authoritative permission layer.

### Data and AI flow

- Prisma models and migrations represent tenants, users, agents, installs, wallets, audit data, knowledge sources, sessions, tasks, runners, and related business data.
- The agent orchestrator validates widget/internal requests, resolves tenant/install context, builds contextual prompts, invokes agent logic, records usage and conversation data, and applies wallet/billing logic.
- Knowledge-base ingestion supports text, URL, PDF, embeddings, queues, and storage providers.
- The widget validates installations/domains and calls platform APIs.
- WhatsApp webhook and lead-notification paths connect external communications with platform workflows.

## 3. Current Site Map

### Public experience

| Existing area | Current intent | Positioning observation |
| --- | --- | --- |
| Home | Corporate/product home | Strong visual presentation, but mixes company, LUNA, agents, and showcase narratives. |
| Agents | Agent catalog and demos | Useful capability evidence; can make the firm appear primarily as an agent marketplace if not contextualized. |
| Create agent | Guided agent-creation flow | Good demonstration, but should be clearly labeled as a controlled demo / discovery experience. |
| Systems / LUNA | Product platform content | Best candidate to become a central product/solution pillar. |
| Pricing / recharge | Product/commercial mechanics | Useful for platform users, but should not dominate enterprise implementation positioning. |
| Projects / skills / news | Supporting content | Requires editorial strategy, ownership and metadata review. |
| Gunther / links | Founder/contact presence | Useful trust element; should be integrated into a clearer Company narrative. |

### Private experience

| Area | Purpose |
| --- | --- |
| Dashboard | Tenant operations, agents, installs, usage, profile and administration |
| ROOT | Platform-level operations, media and news management |
| Admin | Client, project, proposal, payment, license and internal management views |
| LUNA orchestrator | Projects, queue, runners, tasks, usage, billing, settings and remote access |

## 4. Internationalization Audit

### Current implementation

- Locale configuration defines Spanish (`es`) and English (`en`) with Spanish as default.
- Middleware determines locale from path, `NEXT_LOCALE` cookie, then `Accept-Language`.
- Locale layouts load JSON messages through `next-intl`.
- Static paths are generated for both locales.
- Locale persistence is supported by the cookie mechanism.

### Findings

| Item | Status | Evidence / implication |
| --- | --- | --- |
| `/es` and `/en` routes | Present | Correct basis for an international site. |
| Message catalogs | Present | `app/lib/i18n/messages/es.json` and `en.json`. |
| Translation API usage | Present | `useTranslations` / `getTranslations` are used across the app. |
| Locale-specific inline copy | Present | Many components use `isEs`/locale ternaries; this fragments content ownership. |
| Full-page translation parity | Not guaranteed | Production `/en` showed mixed Spanish and English content during audit. |
| Locale-aware SEO | Partial | Basic localized home metadata exists; systematic metadata translation/hreflang/canonical is missing. |
| Image-localization strategy | Missing | Several marketing images contain visual/textual content; no source-of-truth process for language variants is documented. |

### Translation gaps to address

The future i18n scope must include navigation, CTA labels, forms, validations, error states, metadata, FAQ content, agent prompts and UI copy, case-study content, governance content, legal pages, email templates, and image text.

### Recommended i18n architecture

1. Maintain `/es` and `/en` as public canonical route families.
2. Move visible content to structured locale namespaces by domain: `navigation`, `home`, `company`, `solutions`, `caseStudies`, `agents`, `governance`, `forms`, `metadata`, and `system`.
3. Use locale-aware content models for case studies, insight posts and solution pages rather than conditional inline strings.
4. Add automated tests that ensure ES/EN message-key parity and detect fallback/missing strings.
5. Create a media rule: image assets containing language must have an ES and EN version, or be replaced with language-neutral visuals plus accessible HTML copy.
6. Generate locale-aware metadata, canonical URLs, alternate languages and Open Graph/Twitter images per public route.

## 5. SEO Audit

### Current state

- The production home includes a title, meta description, Open Graph title/description/type, and a Twitter summary card.
- Basic metadata is implemented only in a limited number of page files.
- `robots.txt` and `sitemap.xml` returned 404 in production during the audit.
- No canonical URL, `hreflang` alternate URLs, Organization schema, Product schema, Service schema, FAQ schema, or Case Study schema was found.
- Open Graph/Twitter images are not consistently configured.
- The public homepage is indexable in returned HTML, but the human-verification UI and cache behavior should be tested with Search Console and real crawlers.

### Recommended SEO architecture

| Capability | Recommendation |
| --- | --- |
| Base URL | Define one production base URL via validated environment configuration. |
| Metadata | Create a typed metadata helper for every public route and locale. |
| Canonical | Self-referencing canonical URL for each localized page. |
| hreflang | ES, EN and `x-default` alternates for every equivalent route. |
| Sitemap | File-based `sitemap.ts`; include only public, indexable canonical routes. |
| Robots | File-based `robots.ts`; disallow dashboard, auth, ROOT, APIs and remote-token paths. |
| Schema.org | Organization, WebSite, SoftwareApplication/Service, Product, FAQ and Article/CaseStudy where accurately supported. |
| Social | Route-specific 1200×630 OG images, with translated text or language-neutral visual systems. |
| Content | One intent-focused H1, logical H2/H3 hierarchy, descriptive alt text and accessible internal links. |

## 6. Content and Positioning Audit

### What the site communicates today

The site credibly communicates software, AI, automation, LUNA, agents, and a premium technology aesthetic. However, the current navigation and homepage combine several identities:

- corporate technology company;
- LUNA product site;
- agent catalog/demo;
- ecosystem showcase;
- founder/contact landing page;
- operational SaaS application.

This breadth demonstrates capability, but reduces immediate clarity for an enterprise decision-maker asking: **What does Trends172Tech implement, for whom, and with what proven results?**

### Positioning gaps

| Gap | Consequence | Direction |
| --- | --- | --- |
| LUNA is not always the unmistakable anchor | Product ecosystem feels fragmented | Position LUNA as the primary AI-native enterprise operating platform. |
| CarpiHogar ownership is not explicit enough | Visitors may assume it is an unrelated external client | State that it is a Trends172Tech-owned operation and production validation environment. |
| DekoMundo can compete with the corporate story | The portfolio can appear retail-first | Place it only as a LUNA/CarpiHogar capability example when applicable. |
| OpenAI capabilities are not organized publicly | Technical depth is difficult to evaluate | Add a truthful OpenAI Capabilities page with evidence and status labels. |
| Production proof is scattered | Large clients cannot quickly assess maturity | Use metrics, architecture patterns, governance and implementation proof. |
| Some claims need evidence context | Trust risk | Tie claims such as uptime, scale, automation and business outcomes to documented scope/date/source. |

### Recommended positioning statement

> **Trends172Tech builds and implements AI-native enterprise platforms, specialized agents and industry solutions for Latin America, combining artificial intelligence with governed human workflows and real production operations.**

## 7. CarpiHogar Case Study Gap Analysis

### Strategic role

CarpiHogar is the flagship production case study because it is not a third-party logo claim; it is a Trends172Tech-owned business operating with LUNA. That creates an unusually strong “build, operate, validate, productize” narrative.

### Required story

The public case study should clearly and accurately explain that CarpiHogar:

- is owned by Trends172Tech;
- operates physical and online commerce;
- uses LUNA in production;
- uses real inventory, POS/facturation, catalog, sales and operational workflows;
- connects to Meta/Instagram publishing where verified;
- uses specialized agents and human-in-the-loop review before autonomous activation;
- validates modules in real operations before they are offered as commercial product capabilities.

### Evidence required before publication

| Evidence | Owner confirmation needed |
| --- | --- |
| 464 active products | Exact source/date and whether it may be public. |
| Inventory figures | Date, accounting definition, currency basis, whether rounded/public. |
| Omnichannel/POS/invoice operation | Scope, operational date and permitted screenshots. |
| Meta and Instagram workflows | Which API connection, exact automation level, approvals and current status. |
| AI agents | Names, responsibilities, production/pilot status and human approval controls. |
| Marketing outputs | Number of carousels/products, timeframe and public evidence. |
| Measurable outcomes | Conversion, catalog velocity, error reduction, service response, staff efficiency or operational metrics. |

### Proposed public route

`/[locale]/case-studies/carpihogar`

Suggested sections: business context, operational challenge, LUNA implementation, architecture/workflows, AI and human approval, evidence/results, screenshots, governance, what became reusable product capability, and contact CTA.

## 8. LUNA Positioning Gap Analysis

LUNA is presented as ERP AI and as an enterprise platform, but its message should become more precise:

- **What it is:** a modular AI-native enterprise operating platform.
- **For whom:** commerce, multi-location operators, service businesses, sports organizations, clubs and selected verticals based on actual availability.
- **What it connects:** operations, sales, inventory, commerce, CRM, finance, communications and AI workflows.
- **How AI is governed:** roles, data boundaries, approvals, audit logs, usage/cost controls and escalation.
- **How it is proven:** CarpiHogar and other verifiable implementations.

Avoid representing every planned module or connector as universally production-ready. Capability statuses should be explicit.

## 9. AI Capabilities Gap Analysis (Internal)

### Existing technical signals

The codebase contains AI SDKs, agent orchestration, tool patterns, knowledge ingestion/embeddings, MCP routes, human verification, and runner/remote-task concepts. These are credible implementation signals, but the public site should only claim capabilities that can be demonstrated, operated and supported. Specific model providers and vendor programs remain internal implementation details unless a future communications decision changes that policy.

### Public presentation policy

Do not create a provider-branded capabilities page. AI capability should instead be demonstrated across the LUNA, CarpiHogar, Agents, Solutions, and Security & Governance pages.

| Section | Intended message | Status rule |
| --- | --- | --- |
| Agentic Systems | Systems that coordinate specialized AI work with business context | Mark production/partial/development per actual deployment. |
| Enterprise AI Agents | Sales, support, operations, catalog and reporting assistants | Show use case, boundaries and escalation. |
| Human-in-the-loop | Review and approval before sensitive or autonomous actions | Describe actual approval mechanisms only. |
| Supervised autonomy | Controlled workflows with policy limits | Define what is supervised and by whom. |
| Multi-agent workflows | Coordinated roles, tools and handoffs | Do not claim if only conceptual. |
| Enterprise integrations | ERP, CRM, commerce, WhatsApp, Meta and data sources | Publish only verified active integrations. |
| Tool calling and integrations | Engineering capabilities built with AI and business-system integrations | Describe the business result, not the provider. |
| Retrieval / document processing | Knowledge ingestion, chunking, search and file/URL workflows | State constraints and supported formats. |
| Evaluations | Test, QA and monitoring approach | Mark as development/planned if no formal evaluation framework exists. |
| Governance / deployment / training / support | Delivery lifecycle and regional implementation approach | Tie to documented operating practices. |

Public language should describe outcomes and controls: “AI-native platform,” “specialized AI agents,” “human approval,” “governed automation,” “enterprise integrations,” and “production workflows.” Do not use OpenAI names, logos, partner-program references, or provider-specific claims on public pages.

## 10. Security and Governance Gap Analysis

### Current implementation evidence

| Capability | Current status | Evidence / gap |
| --- | --- | --- |
| Roles and permissions | **Production / Partial** | Roles and auth guards exist; full authorization review still required. |
| Tenant isolation | **Partial** | Tenant fields/scoping patterns exist; systematic test coverage is needed. |
| Temporary tokens / expiration | **Partial** | Remote-token/session concepts exist; public policy/documentation is absent. |
| Human approval | **Partial** | Human verification and workflow intent exist; approval flows must be documented per sensitive action. |
| Audit logs / traceability | **Partial** | Audit and usage logging patterns exist; retention, access, and operational procedures need definition. |
| Prompt/model versioning | **In Development** | No formal public/versioned governance model was verified. |
| Cost controls | **Partial** | Token wallet and usage tracking exist; enterprise cost policy and dashboards need definition. |
| Data handling | **Partial** | Environment-based integrations exist; privacy, retention and processor documentation need completion. |
| Kill switch / escalation | **In Development** | Operational controls need explicit implementation and runbooks. |
| Backups/recovery/incident response | **Planned / Confirmation required** | Not verified from repository configuration. |

### Future public route

`/[locale]/security-governance`

The page should use a clearly labeled capability matrix: **Production**, **Partial**, **In Development**, and **Planned**. It should never imply certification, compliance, or controls that have not been implemented and documented.

Recommended sections: governance approach, roles/scopes, access controls and temporary tokens, human approval, auditability, data handling, model/prompt governance, cost controls, incident handling, recovery approach, client responsibilities, and contact CTA for security review.

## 11. Recommended Site Architecture

| Section / proposed route | Objective | Audience | CTA | Evidence | Priority |
| --- | --- | --- | --- | --- | --- |
| Home `/[locale]` | State enterprise AI implementation positioning | Executives, prospects, partners | Talk to an expert | LUNA, CarpiHogar, governed delivery | P0 |
| Company `/[locale]/company` | Explain company, founder, region, operating model | Buyers, partners, talent | Meet the team / Contact | LLC, Venezuela/LatAm operation, delivery principles | P1 |
| AI & Automation (distributed content) | Demonstrate implementation capability through real solutions and governance | Technical buyers, partners | Discuss an AI implementation | Architecture, agents, retrieval, tools, governance | P0 |
| Solutions | Organize platforms by business outcome | Buyers | Explore solution | LUNA and vertical solutions | P0 |
| LUNA | Establish core platform narrative | Operators, executives | Request LUNA assessment | Modules, workflows, case study | P0 |
| CarpiHogar | Flagship production case study | Buyers, partners | View implementation / Contact | Production proof and metrics | P0 |
| LUNA Football | Present an active sports-operations solution | Football schools, academies and clubs | Discuss LUNA Football | Active Club Español E.F. implementation; traceability for players, teams, coaches, employees and payroll; registrations, monthly fees, equipment inventory, credentialing and AI-assisted modular training creation | P1 |
| Club Management | Do not publish as an active solution yet | Internal only | None | Future scope only after production validation | Deferred |
| Agents | Present governed agent offerings | Operations/commercial teams | Design an agent | Agent types, approvals, integrations | P1 |
| Industries | Map validated solutions to industries | Buyers | Explore industry solution | Real capabilities/cases | P1 |
| Case Studies | Collect verified deployments | Enterprise buyers | Discuss your case | CarpiHogar first | P0 |
| Security & Governance | Build enterprise trust | IT/security/procurement | Request security discussion | Status matrix, controls | P0 |
| Developers | Technical integration resources | Developers | Read docs / Contact | Widget, API policy, integration patterns | P2 |
| Insights | Publish credibility-building content | Search/market | Subscribe/contact | Technical and operational articles | P2 |
| Partner With Us | Partner/integration channel | Agencies, firms, platforms | Start a partnership conversation | Delivery model and requirements | P1 |
| Contact | Convert qualified demand | All | Contact / WhatsApp / discovery | Routing and response expectations | P0 |

## 12. Recommended Route Changes

Do not remove existing routes until redirects, analytics, client links, and authenticated use cases are verified.

Proposed additions:

```text
/[locale]/company
/[locale]/solutions
/[locale]/solutions/luna
/[locale]/solutions/luna-football
/[locale]/solutions/club-management
/[locale]/industries
/[locale]/case-studies
/[locale]/case-studies/carpihogar
/[locale]/security-governance
/[locale]/developers
/[locale]/insights
/[locale]/partner-with-us
/[locale]/contact
```

Existing LUNA, agents, news, pricing and project pages should be mapped to the future information architecture before any route changes.

## 13. Recommended Component Changes

Create/reuse components rather than duplicating visual structures:

- `CorporatePageHero` with locale-aware metadata and evidence CTA.
- `CapabilityStatusBadge` for Production / Partial / In Development / Planned.
- `EvidenceMetricGrid` with source/date/disclaimer support.
- `CaseStudyTimeline` and `CaseStudyArchitecture` for real implementation narratives.
- `GovernanceControlMatrix` for security status presentation.
- `IntegrationLogoGrid` only for verified integrations.
- `SolutionModuleGrid` for LUNA and industry solutions.
- `LocaleLink` / locale-aware navigation helper to eliminate manual URL handling.
- shared metadata helper and structured-data component.

The existing shared UI primitives, site header/footer, theme provider, image components, cards, forms and animation patterns should be reused where appropriate.

## 14. Recommended Data Model Changes

No data-model changes are required for Phase 01 documentation. Future content architecture may benefit from the following models or CMS-like entities:

- Localized `CaseStudy` with evidence items, status, metrics, source/date and visibility flag.
- Localized `Solution` with maturity status and associated industries/capabilities.
- `Capability` catalog with truthful maturity (`PRODUCTION`, `PARTIAL`, `IN_DEVELOPMENT`, `PLANNED`), owner and review date.
- `Insight`/article entities with locale, author, SEO metadata and publishing state.
- `GovernanceControl` registry with public-safe description, evidence reference and review timestamp.
- `MediaAsset` localization fields, alt text, rights/source and image-text language metadata.

## 15. Recommended SEO Architecture

1. Build metadata from a single typed source per locale/route.
2. Add `robots.ts` and `sitemap.ts` at the App Router level.
3. Add localized canonical and hreflang alternates.
4. Add JSON-LD only for truthful, supportable entity types.
5. Create OG images and a review process for translated social assets.
6. Make public content static/ISR where possible; keep authenticated, token-based and administrative routes non-indexable.
7. Connect Search Console, analytics and web-vitals monitoring before measuring SEO improvements.

## 16. Risks

### Technical risks

1. `npm audit --omit=dev` reported 43 production dependency vulnerabilities: 1 critical, 14 high, 28 moderate. Directly affected packages include Next.js, MCP SDK, XLSX, AWS S3, BullMQ, NextAuth and next-intl.
2. Root `postinstall` runs `prisma migrate deploy` when `VERCEL !== '1'`; this can cause accidental migrations in local/CI environments with database credentials.
3. The BCV cron route only checks authorization when `CRON_SECRET` is configured; it should fail closed.
4. Public lead capture can send WhatsApp messages and needs anti-abuse/rate-limit controls.
5. Production headers observed include HSTS, but a CSP and other standard browser-security headers were not observed.
6. The encryption helper expects `LUNA_AGENT_ENCRYPTION_KEY` or `NEXTAUTH_SECRET`, while current environment documentation emphasizes `AUTH_SECRET`; configuration inconsistency can cause runtime failures.

### Product and communication risks

1. Claiming OpenAI partnership, certification, representation or compliance before evidence/approval would create material reputational risk.
2. Publishing CarpiHogar metrics without date, source, definition and permission can undermine credibility.
3. Treating pilot or development capabilities as production features creates enterprise trust risk.
4. Removing legacy routes before mapping traffic and authenticated dependencies can break existing product behavior.

## 17. Quick Wins

1. Create robots, sitemap, canonical and hreflang architecture.
2. Correct the automatic migration behavior and enforce cron authentication.
3. Patch vulnerable dependencies in a dedicated compatibility-tested branch.
4. Add a clear CarpiHogar ownership/production statement on existing LUNA and case content.
5. Add capability-status labels to public content where maturity is unclear.
6. Make EN content fully English and establish ES/EN key parity checks.
7. Centralize metadata and OG tags.
8. Add an internal AI-capability evidence register; expose only verified, provider-neutral outcomes on public pages.

## 18. Medium-Term Improvements

1. Implement new public information architecture with redirects and analytics preservation.
2. Build a structured case-study/content model.
3. Introduce rate limits, security headers, audit trails and incident runbooks.
4. Add integration, authorization, i18n and E2E test coverage.
5. Optimize large images, delay non-essential ChatKit assets, and establish web-vitals monitoring.
6. Establish an editorial workflow for Insights, case evidence and governance status reviews.

## 19. Long-Term Improvements

1. Formal evaluation framework for AI workflows, prompts, tools and model changes.
2. Client-facing governance, support, implementation and training playbooks.
3. Formalized reliability, recovery, data-retention and incident-response controls.
4. Partner enablement process, solution architecture templates and industry packages.
5. A documented OpenAI Partner Network application package, only when all statements and proof are ready.

## 20. Implementation Roadmap

| Phase | Objective | Deliverables |
| --- | --- | --- |
| 01 — Audit | Establish truth and risks | This report, founder-confirmation register, evidence inventory |
| 02 — Foundation | Secure and stabilize | Dependency/security plan, migration safeguards, rate limits, headers, CI checks |
| 03 — Content architecture | Define public story | Content model, route map, messaging, ES/EN source copy, evidence policy |
| 04 — SEO/i18n | Make discovery reliable | Sitemap, robots, canonical, hreflang, metadata, localized OG assets |
| 05 — Public experience | Implement enterprise site | Company, capabilities, LUNA, CarpiHogar, governance and partner pages |
| 06 — Validation | Prove quality | Accessibility, responsive, SEO, security and conversion testing |
| 07 — Readiness package | Maintain internal external-review readiness | Verified case material, governance proof, delivery narrative and evidence assets |

## 21. Files That Would Likely Be Modified

### Foundation and security

- `package.json`
- `package-lock.json`
- `apps/web/package.json`
- `apps/web/next.config.ts`
- `apps/web/middleware.ts`
- `apps/web/app/api/cron/bcv-rate/route.ts`
- `apps/web/app/api/lead-capture/route.ts`
- `apps/web/app/api/orchestrator/chat/route.ts`
- `apps/web/app/lib/luna-agent/security.ts`
- `vercel.json`

### i18n, SEO and public experience

- `apps/web/app/[locale]/layout.tsx`
- `apps/web/app/[locale]/(public)/page.tsx`
- `apps/web/app/[locale]/(public)/systems/luna/page.tsx`
- `apps/web/app/lib/i18n/messages/es.json`
- `apps/web/app/lib/i18n/messages/en.json`
- `apps/web/app/components/site-header.tsx`
- `apps/web/app/components/site-header-client.tsx`
- `apps/web/app/components/public-site-footer.tsx`
- new metadata, sitemap, robots, structured-data and public-route files
- new reusable capability/case-study/governance components

### Files audited directly

- `package.json`, `package-lock.json`, `README.md`, `.env.example`, `.gitignore`, `vercel.json`
- `apps/web/package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `i18n.ts`, `.eslintrc.json`, `middleware.ts`
- `apps/web/app/[locale]/layout.tsx`, public home/LUNA/links/Gunther pages and shared layout/components
- `apps/web/app/lib/auth/guards.ts`, `lib/auth/session.ts`, `lib/luna-agent/security.ts`
- audited API routes including cron, orchestrator chat, human verification, lead capture, upload routes, auth and runner routes
- `packages/db/package.json`, Prisma schema/migration inventory and seed inventory
- `packages/openai/package.json`, `packages/core/package.json`, `packages/luna-runner/package.json`, `apps/widget/package.json`
- `docs/ARCHITECTURE_MAP.md` and repository route/file inventory

## 22. Database Migrations That May Be Needed

No migration is required for this Phase 01 audit.

Potential later migrations, only after design approval:

- localized case studies, solutions and insight records;
- capability maturity/status registry;
- public evidence/metric records with source and review dates;
- localized media metadata and accessible alt text;
- governance control/attestation records;
- content publishing/review audit fields.

Each migration must be developed and tested outside production, reviewed for tenant isolation and rollback implications, then deployed through an explicit migration workflow—not through install hooks.

## 23. Questions That Require Founder Confirmation

1. Which CarpiHogar metrics, screenshots and operational data are public-safe, and as of what date?
2. Which LUNA modules are production, pilot, in development or planned?
3. Which OpenAI technologies/features are actively used in production versus experiments?
4. Which integrations are active today: OpenAI, Anthropic, WhatsApp, Meta, Vercel Blob, S3, Resend, Redis, and others?
5. Can Trends172Tech publicly state that CarpiHogar is wholly owned/operated by Trends172Tech LLC? What exact legal wording is approved?
6. What are the geographic markets, supported languages, support hours and implementation model?
7. Which data-processing, privacy, backup, incident-response and recovery commitments can be documented truthfully today?
8. Confirm that public communications remain provider-neutral and avoid all OpenAI/partner-program references unless explicitly approved in the future.
9. Which existing public routes are strategically retained, redirected, consolidated or eventually retired?
10. Which claims—uptime, years, number of products, automation volume, client outcomes—have documented evidence and review ownership?

---

## Audit execution record

The audit verified the active branch `codex/trendstech-mejoras` and a clean Git worktree before and after diagnostics.

Executed diagnostics included manifest/configuration inspection, repository inventory, `npm audit --omit=dev`, `npm outdated`, `npm run lint`, `npm run typecheck`, `npm run luna:test`, `npm run luna:runner:build`, `npm run build`, and production HTTP/SEO/header checks. Lint passed with three warnings; TypeScript passed; eight Luna tests passed; and production build passed with 146 generated routes.

No production deployment, commit, push, merge, code change, configuration change, or database migration was performed as part of this audit. This document is the only intentional repository change in the current Phase 01 documentation step.

# Published proposals in the admin workspace

The ROOT workspace at `/es/admin/proposals` lists linked presentations alongside the existing commercial records. City Center Maracay and Big Home are real `AdminClient` / `AdminProposal` records. Full capability and implementation summaries are stored in the existing proposal summary, with a validated `Presentación: https://...` line for their public presentation. Future proposals can supply an optional presentation URL in the creation form. Only HTTPS proposal/presentation routes on Trends172Tech are accepted.

FDE is displayed as general sales material, not as a client, opportunity or zero-value sale.

## Production registration

The web workspace `postbuild` runs `scripts/register-published-proposals.ts`. It skips local and preview builds and only runs when VERCEL_ENV is production, using that deployment's configured database. There are no new tables or schema migrations.

Registration is transactional, serializes concurrent production runs with a PostgreSQL advisory lock, reuses known client-name aliases and proposal matches, and stops on ambiguous duplicates. It creates missing clients and draft proposals with an undefined investment (stored as 0 under the existing schema). Existing negotiated amounts, statuses, dates and summaries are preserved; only a missing presentation link is attached. Stable audit entries record the registration once. A failed registration fails the production build rather than silently displaying fake records.

The admin layout and write actions retain their ROOT guard. Public pages are unchanged. No emails or messages are sent.

## Verification

`node --import tsx --test apps/web/tests/admin/published-proposals.test.ts` checks repeat registration, full scopes, reuse of existing records, preservation of negotiated terms, ambiguous matches and rejection of unsafe URLs. Run workspace typecheck/lint, then preview and production deployment checks. Production READY includes successful transactional registration and link verification.

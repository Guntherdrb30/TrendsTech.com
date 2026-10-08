# GNB USD 10 pilot — implementation status

This branch introduces **pure, testable budget policy rules only**. It does **not** yet enforce a live limit or initiate paid execution.

## Before enabling any paid job
1. Persist a project budget with active limit USD 10, global ceiling USD 100, and explicit approval for increases.
2. Enforce reservation atomically in the database **before** invoking a paid model or claiming a billable job. Use row locking or an equivalent serializable transaction and idempotency key.
3. Persist reservations and reconcile confirmed provider charges; account for in-flight requests and post-hoc charges. Fail closed if costs cannot be bounded.
4. Apply the guard to every paid entrypoint (Studio, workflows, subagents, retries and Luna runner if linked); no bypass from another route.
5. Add integration tests: two concurrent USD 6 reservations must not both succeed, provider failure, refund/reconciliation, pause, approval gate and retries.
6. Connect a real executor and prove a commit plus test output; Codex CLI adapter is currently a placeholder.
7. Replace static Cost Engine display with verified spend, reserved amount, remaining active limit, and per-task ledger.
8. Validate configured GitHub token, runner health and provider pricing without exposing credentials.
9. Review changes and CI in a PR; do not deploy or consume API funds until checks pass.

The policy helper can be reused by the transactional guard; **it must not be used as the sole enforcement mechanism** because parallel requests could both pass an in-memory check.

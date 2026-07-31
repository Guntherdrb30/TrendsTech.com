# Phase 03 — Legal, security, and commercial evidence

Status: implementation draft

Owner: Trends172Tech LLC

Started: 2026-07-31

## Objective

Create a verifiable trust foundation before any OpenAI partnership or public app submission. This phase does not claim partnership, certification, or approval by OpenAI.

## Corporate identity

- Legal entity: **TRENDS172TECH LLC**
- Jurisdiction: Florida, United States
- Florida document number: **L26000329377**
- Public registry status checked on 2026-07-31: **Active**
- Website: **https://trends172tech.com**
- Operational contact: **trends172tech@gmail.com**
- Never publish EIN, private addresses, member identity, or private incorporation documents without explicit approval.

## Public trust pages

| Page | Spanish | English | Purpose |
| --- | --- | --- | --- |
| Privacy | `/es/privacy` | `/en/privacy` | Data categories, purposes, sharing, rights, retention, AI, and children |
| Terms | `/es/terms` | `/en/terms` | Account, acceptable-use, AI, IP, payment, and governing-law terms |
| Security | `/es/security` | `/en/security` | Current controls, shared responsibility, disclosure channel, and honest assurance status |
| Contact | `/es/contact` | `/en/contact` | Corporate identity and operational contact routes |

The first publication is an operational legal draft. A Florida-licensed attorney should review the final wording before a high-stakes enterprise agreement or broad consumer launch.

## Security workstream

### Completed in this phase

- Removed the OpenAI verification token from tracked source code.
- Added a fail-closed response when the verification environment variable is absent.
- Made public security claims conservative and explicitly avoided unsupported certification claims.
- Added a responsible vulnerability-reporting channel.

### Required next

- Add automated CI for typecheck, tests, build, dependency review, and secret scanning.
- Triage and remediate production dependency advisories.
- Replace the shared MCP bearer with scoped identity and server-derived tenant context before public distribution.
- Separate read-only and mutating tools, add explicit confirmation for consequential actions, and declare tool safety annotations.
- Document incident response, access review, backups, recovery objectives, and vendor review.
- Define a data-processing agreement and subprocessors list for enterprise customers.

## Commercial evidence standard

Each case must have authorization to name the customer or must be anonymized. Evidence should be reproducible and should never contain credentials, personal data, private contract values, or unapproved screenshots.

For each case collect:

1. Customer or authorized anonymized label.
2. Business problem and baseline.
3. Delivered scope and OpenAI-supported capability, if any.
4. Production dates and current status.
5. Measurable outcome with calculation method.
6. Customer-approved quote or acceptance evidence.
7. Architecture diagram with secrets and personal data removed.
8. Security and human-oversight controls.
9. Demo route and a scripted five-minute walkthrough.
10. Internal evidence owner and last verification date.

## Current portfolio candidates

- **Carpihogar:** commercial/operational implementation and a public project case.
- **LUNA Football / CDE Barinas EF:** sports-management use case connected to `https://cdebarinasef.com`.
- **Trends172Tech.com:** corporate platform, authentication, email delivery, and LUNA agent experience.
- **Trends Projects:** multi-company operating center for projects, finances, customers, reports, and LUNA ROOT.

No performance number or customer endorsement may be published until supported by dated evidence and customer authorization.

## OpenAI readiness gates

- Do not display “OpenAI Partner” or imply endorsement until written acceptance exists.
- OpenAI API keys remain server-side and separated by workload/environment.
- The public experience must provide a clear user benefit, reliable tool behavior, privacy disclosure, and support channel.
- Any submission must use a reviewable demo account or flow with no hidden manual step.
- Partnership interest, API app review, and ChatGPT app submission are separate processes and must be tracked separately.

## Sources used for this phase

- OpenAI Partner Network: https://openai.com/business/partners/
- OpenAI app submission guidelines: https://developers.openai.com/plugins/app-guidelines
- OpenAI guidance on high-quality ChatGPT apps: https://developers.openai.com/blog/what-makes-a-great-chatgpt-app
- Florida Division of Corporations: https://dos.fl.gov/sunbiz/
- Florida Statutes 501.171, 501.71, and 501.711.

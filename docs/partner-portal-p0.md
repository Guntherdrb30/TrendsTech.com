# Partner Portal P0 — Trends172Tech

## Objective
Build the first production-ready slice of the Trends172Tech Partner Portal so only ROOT administrators can create partner users and partner users can access a dedicated left-navigation workspace after verifying their email.

## Product decisions
- Partner users are created only by a ROOT administrator. There is no public partner registration.
- A newly created partner account starts with `emailVerified = false`.
- The system sends an invitation/verification email immediately after creation.
- The verification link must be single-use and expire.
- After verification the partner signs in with the email and password created by the administrator.
- Recommended security behavior: force password change on first successful login. This is part of the P0 security acceptance criteria even if the initial admin-created password is valid.
- Partner routes must be isolated from tenant dashboards and ROOT administration routes.
- All partner reads/writes must be scoped to the authenticated partner identity and later to `partnerId` / `projectId`.

## P0 navigation
Partner workspace left navigation:
1. Dashboard
2. Opportunities / Projects
3. B2B Director Agent
4. Research
5. Information Gathering
6. Documents
7. Proposals
8. Meetings & Follow-up
9. Pending Actions
10. Profile

Only Dashboard and Profile need to be fully interactive in the first authentication slice. Other routes may start as guarded placeholders while their domain models are implemented.

## Authentication and authorization
### New role
Add a dedicated partner role. Preferred enum value: `PARTNER`.

Do not treat PARTNER as a tenant role. Existing role hierarchy (`ROOT`, `TENANT_ADMIN`, `TENANT_OPERATOR`, `TENANT_VIEWER`) must not accidentally grant tenant permissions to PARTNER.

Introduce exact-role/partner guards instead of relying only on rank-based `requireRole`.

### Admin creation flow
1. ROOT opens Admin > Partners.
2. ROOT selects Create partner user.
3. Required fields: contact name, company name, email, temporary password.
4. Optional fields: phone, title/position, notes.
5. API verifies email uniqueness.
6. Password is hashed server-side.
7. User is created with role PARTNER and `emailVerified=false`.
8. Partner profile/organization record is created.
9. Single-use verification token is generated; only its hash is persisted.
10. Verification email is sent using the existing Resend email infrastructure.
11. Audit event is stored.

### Email verification flow
- Public route receives raw verification token.
- Server hashes token and finds active invitation.
- Validate not used and not expired.
- Transaction sets `User.emailVerified=true`, activates partner account, marks invitation as used.
- Redirect to login with a success state.

### Login behavior
- PARTNER with unverified email must not receive partner workspace access.
- Verified PARTNER is redirected to `/{locale}/partner`.
- ROOT and tenant behavior must remain unchanged.

## Initial data model
### Partner
- id
- companyName
- slug
- status: INVITED | ACTIVE | SUSPENDED
- createdAt / updatedAt

### PartnerMember
- id
- partnerId
- userId (unique for P0)
- jobTitle optional
- createdAt / updatedAt

This split permits multiple users per partner in later phases without redesigning projects.

### PartnerInvitation
- id
- partnerId
- userId
- tokenHash unique
- expiresAt
- usedAt optional
- createdById (ROOT user)
- createdAt

## Next domain models (P0.2)
- PartnerOpportunity
- PartnerProject
- ProjectAgent
- ProjectMemory
- ProjectFact / Decision / Requirement / OpenQuestion / NextAction
- ProjectDocument
- ProjectMeeting
- Proposal + ProposalVersion

Every future project-agent interaction must be scoped by `projectId` and persist memory to the database; conversation history alone is not authoritative memory.

## Acceptance criteria for authentication slice
- ROOT can create a partner user.
- A partner cannot self-register.
- Invitation email uses existing Trends172Tech email infrastructure.
- Verification token is hashed, expiring and single-use.
- Unverified partner cannot enter partner workspace.
- Verified partner can log in and reaches dedicated partner dashboard.
- Partner sees left navigation defined above.
- Partner cannot access `/admin`, `/root`, or another partner's data.
- Existing ROOT and tenant logins keep working.
- Relevant create/verify/login events are auditable.

## First real partner
EDB2B (Eficiencia Digital) will be the first real partner used to validate the end-to-end flow. Do not hard-code EDB2B-specific behavior in the generic Partner Portal domain.

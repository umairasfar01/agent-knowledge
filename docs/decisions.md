# Engineering Decisions

## 2026-08-06

### Authentication
- WorkOS is the authentication provider.
- Convex authentication uses ctx.auth, via a "customJwt" provider
  (convex/auth.config.ts) rather than the discovery-based { applicationID,
  domain } form, because WorkOS's JWKS lives at /sso/jwks/{client_id} instead
  of a standard {issuer}/.well-known/jwks.json document.
- WORKOS_CLIENT_ID must be set as a Convex environment variable (separate from
  apps/web's .env.local) for the JWT verification to work.
- Audit logs prefer verified identity.
- The ctx.auth migration is deliberately incremental: one module is migrated
  off the client-supplied workosUserId argument at a time, starting with
  convex/audit.ts, so each change stays small and testable. Other modules keep
  passing workosUserId until they're migrated in turn.

### Multi-tenancy
- Every resource belongs to an organization.
- Organization IDs are backfilled through migrations.
- The backfill (convex/migrations.ts) targets exactly the tables that were
  actually read through the inOrgOrUnscoped fallback — knowledge,
  knowledgeVersions, agents, auditLogs — not every table with an optional
  organizationId (rateLimits and the legacy users.organizationId field are
  intentionally excluded; they're unrelated to that gap).

### Audit Logging
- Audit logs use authenticated identity where available (ctx.auth), falling
  back to the caller-supplied workosUserId only when ctx.auth has no verified
  identity for the request.
- Fallback exists for legacy paths during migration.

### Shared Package
- Shared constants live in packages/shared, including DEFAULT_ORG_ID, so
  Convex functions and the Next.js app read the same values instead of each
  keeping their own copy.

### Process
- Git write operations (add, commit, push, pull, fetch, stash, branch changes,
  history rewrites) require explicit approval before running — see
  apps/web/CLAUDE.md Git Safety Rules. This session found two commits already
  on main/origin that weren't created through any tool call in this session.

### Development
- Tests must pass before completing a task.
- TypeScript must compile cleanly.
- Features are implemented in small, focused changes.
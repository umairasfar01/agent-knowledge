# Project Context

## Goal

Build a production-ready multi-tenant AI knowledge management SaaS.

## Current Status

- Authentication migration in progress: WorkOS → Convex ctx.auth plumbing is in
  place, and convex/audit.ts is the first module reading identity from ctx.auth
  instead of a client-supplied argument. All other modules still use
  workosUserId args.
- Audit logging complete, now preferring server-verified identity.
- Organization backfill migration written and tested, but **not yet run**
  against the real Convex deployment (`npx convex run migrations:backfillOrganizationId`).
- Tests passing (17/17). TypeScript clean.

## Coding Rules

- Prefer existing patterns.
- Avoid duplicate utilities.
- Keep changes scoped.
- Never modify unrelated files.
- Never run git write operations (`add`, `commit`, `push`, `pull`, `fetch`,
  `stash`) without explicit approval — see apps/web/CLAUDE.md Git Safety Rules.

## Current Priorities

1. Continue the ctx.auth migration one module at a time (audit.ts done first).
2. Remove legacy workosUserId arguments once every consuming module is migrated.
3. Run the organizationId backfill against the real deployment, then tighten
   the Convex schema (organizationId from optional to required).
4. Improve AI retrieval.
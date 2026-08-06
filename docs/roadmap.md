# Agent Knowledge Roadmap

## ✅ Completed
- Multi-tenancy
- Audit logging (real actor identity instead of a hardcoded placeholder)
- Organization ID backfill migration written and tested (convex/migrations.ts) —
  not yet run against production
- WorkOS → Convex authentication plumbing (convex/auth.config.ts,
  ConvexProviderWithAuth in ConvexClientProvider.tsx)
- ctx.auth migration, module 1 of N: convex/audit.ts now prefers
  ctx.auth.getUserIdentity() over the client-supplied workosUserId argument

## 🚧 In Progress
- Server-verified identity (ctx.auth migration) — audit.ts done; agents.ts,
  knowledge.ts, users.ts, organizations.ts still use workosUserId args

## 📋 Next
- Run the organizationId backfill against the real Convex deployment
- Migrate the next module off workosUserId onto ctx.auth (recommended:
  convex/agents.ts — smallest module, and the first to move an actual
  authorization check, not just audit logging, onto verified identity)
- Remove remaining workosUserId mutation arguments once every module is migrated
- Tighten Convex schema after the backfill runs
- Improve AI retrieval
- Analytics dashboard
- Performance optimization

## 💡 Future
- Team collaboration improvements
- AI agent marketplace
- Knowledge version comparison
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { WithoutSystemFields } from "convex/server";

type AuditLogFields = WithoutSystemFields<Doc<"auditLogs">>;

type AuditLogEntry = Omit<AuditLogFields, "actorId" | "createdAt"> &
  Partial<Pick<AuditLogFields, "actorId" | "createdAt">>;

// Task #4: actorId now prefers ctx.auth's server-verified identity (wired to WorkOS
// via convex/auth.config.ts) over the caller's workosUserId argument. Callers —
// agents.ts, knowledge.ts, users.ts, organizations.ts — still pass actorId: args.workosUserId
// (task #20) and are deliberately left as-is; that client-supplied value is now only
// a fallback for requests ctx.auth can't identify (e.g. no JWT reached Convex yet).
// Migrating those call sites off workosUserId entirely is follow-up work, one module
// at a time, once every mutation can rely on ctx.auth being populated.
export async function writeAuditLog(ctx: MutationCtx, entry: AuditLogEntry) {
  const identity = await ctx.auth.getUserIdentity();

  return await ctx.db.insert("auditLogs", {
    createdAt: Date.now(),
    ...entry,
    actorId: identity?.subject ?? entry.actorId,
  });
}

import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { WithoutSystemFields } from "convex/server";

type AuditLogFields = WithoutSystemFields<Doc<"auditLogs">>;

type AuditLogEntry = Omit<AuditLogFields, "actorId" | "createdAt"> &
  Partial<Pick<AuditLogFields, "actorId" | "createdAt">>;

// Task #20: actorId now carries the caller's workosUserId (client-supplied, checked
// against membership by requireAdminForWorkosUser at each call site) instead of a
// hardcoded placeholder. It's still not server-verified — that's task #4, which wires
// ctx.auth up to WorkOS so identity can be read off the request instead of trusted
// from an argument. Swapping to ctx.auth.getUserIdentity() then becomes a one-line
// change here, same as this comment originally promised for the placeholder.
export async function writeAuditLog(ctx: MutationCtx, entry: AuditLogEntry) {
  return await ctx.db.insert("auditLogs", {
    createdAt: Date.now(),
    ...entry,
  });
}

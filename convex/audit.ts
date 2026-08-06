import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { WithoutSystemFields } from "convex/server";

type AuditLogFields = WithoutSystemFields<Doc<"auditLogs">>;

type AuditLogEntry = Omit<AuditLogFields, "actorId" | "createdAt"> &
  Partial<Pick<AuditLogFields, "actorId" | "createdAt">>;

// actorId is still a placeholder everywhere; task #20 swaps it for the authenticated
// identity, and routing every write through here makes that a one-line change.
export async function writeAuditLog(ctx: MutationCtx, entry: AuditLogEntry) {
  return await ctx.db.insert("auditLogs", {
    actorId: "demo-user",
    createdAt: Date.now(),
    ...entry,
  });
}

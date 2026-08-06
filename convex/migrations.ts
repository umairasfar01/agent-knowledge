import { internalMutation } from "./_generated/server";
import { DEFAULT_ORG_ID } from "@agent-knowledge/shared";

const BACKFILL_TABLES = [
  "knowledge",
  "knowledgeVersions",
  "agents",
  "auditLogs",
] as const;

// One-time fix for rows seeded before organizationId existed (see convex/tenancy.ts).
// Run once via `npx convex run migrations:backfillOrganizationId` against the real
// deployment before relying on it in production — call sites already assume it ran.
export const backfillOrganizationId = internalMutation({
  args: {},
  handler: async (ctx) => {
    const patchedCounts: Record<string, number> = {};

    for (const table of BACKFILL_TABLES) {
      const rows = await ctx.db.query(table).collect();
      let patched = 0;

      for (const row of rows) {
        if (row.organizationId === undefined) {
          await ctx.db.patch(row._id, { organizationId: DEFAULT_ORG_ID });
          patched += 1;
        }
      }

      patchedCounts[table] = patched;
    }

    return patchedCounts;
  },
});

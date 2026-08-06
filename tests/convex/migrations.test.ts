import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { internal } from "../../convex/_generated/api";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.*s");

const DEFAULT_ORG_ID = "org_01KT22HVVQY3QQWQ7QV9KBPBKJ";

describe("migrations.backfillOrganizationId", () => {
  test("assigns the default org to rows with no organizationId", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();

    const [scopedKnowledgeId, unscopedKnowledgeId, unscopedAgentId] =
      await t.run(async (ctx) => {
        const scoped = await ctx.db.insert("knowledge", {
          title: "Already scoped",
          content: "content",
          category: "Company Policy",
          status: "verified",
          organizationId: "org_other",
          createdAt: now,
          updatedAt: now,
        });

        const unscoped = await ctx.db.insert("knowledge", {
          title: "Legacy row",
          content: "content",
          category: "Company Policy",
          status: "verified",
          createdAt: now,
          updatedAt: now,
        });

        const agent = await ctx.db.insert("agents", {
          name: "Legacy agent",
          description: "seeded before tenancy existed",
          status: "active",
          createdAt: now,
          updatedAt: now,
        });

        return [scoped, unscoped, agent];
      });

    const patchedCounts = await t.mutation(
      internal.migrations.backfillOrganizationId,
      {}
    );

    expect(patchedCounts.knowledge).toBe(1);
    expect(patchedCounts.agents).toBe(1);

    await t.run(async (ctx) => {
      const scoped = await ctx.db.get(scopedKnowledgeId);
      const unscopedKnowledge = await ctx.db.get(unscopedKnowledgeId);
      const unscopedAgent = await ctx.db.get(unscopedAgentId);

      expect(scoped?.organizationId).toBe("org_other");
      expect(unscopedKnowledge?.organizationId).toBe(DEFAULT_ORG_ID);
      expect(unscopedAgent?.organizationId).toBe(DEFAULT_ORG_ID);
    });
  });

  test("is idempotent on a second run", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();

    await t.run(async (ctx) => {
      await ctx.db.insert("agents", {
        name: "Legacy agent",
        description: "seeded before tenancy existed",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    });

    await t.mutation(internal.migrations.backfillOrganizationId, {});
    const secondRun = await t.mutation(
      internal.migrations.backfillOrganizationId,
      {}
    );

    expect(secondRun.agents).toBe(0);
  });
});

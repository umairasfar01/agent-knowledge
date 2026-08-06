import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "../../convex/_generated/api";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.*s");

describe("audit log actor identity", () => {
  test("records the caller's workosUserId instead of a placeholder", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        workosUserId: "workos_admin",
        email: "admin@example.com",
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("memberships", {
        userId,
        organizationId: "org_test",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    });

    await t.mutation(api.agents.createAgent, {
      name: "Support Agent",
      description: "Handles support tickets",
      role: "support",
      status: "active",
      organizationId: "org_test",
      actorEmail: "admin@example.com",
      workosUserId: "workos_admin",
    });

    const log = await t.run(async (ctx) => {
      return await ctx.db.query("auditLogs").order("desc").first();
    });

    expect(log?.action).toBe("agent.created");
    expect(log?.actorId).toBe("workos_admin");
    expect(log?.actorId).not.toBe("demo-user");
  });
});

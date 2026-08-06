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

    const asAdmin = t.withIdentity({ subject: "workos_admin" });

    await asAdmin.mutation(api.agents.createAgent, {
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

  test("prefers ctx.auth's verified identity over the caller-supplied workosUserId", async () => {
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

      // The verified identity is also the one that must hold admin
      // membership now: agents.ts authorizes off ctx.auth, not the
      // caller-supplied workosUserId argument.
      const verifiedUserId = await ctx.db.insert("users", {
        workosUserId: "workos_verified_user",
        email: "verified@example.com",
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("memberships", {
        userId: verifiedUserId,
        organizationId: "org_test",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asVerifiedUser = t.withIdentity({ subject: "workos_verified_user" });

    await asVerifiedUser.mutation(api.agents.createAgent, {
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

    expect(log?.actorId).toBe("workos_verified_user");
    expect(log?.actorId).not.toBe("workos_admin");
  });

  test("rejects the caller when ctx.auth has no identity, even if workosUserId would qualify as admin", async () => {
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

    await expect(
      t.mutation(api.agents.createAgent, {
        name: "Unauthenticated-request Agent",
        description: "No JWT reached Convex for this call",
        role: "support",
        status: "active",
        organizationId: "org_test",
        actorEmail: "admin@example.com",
        workosUserId: "workos_admin",
      })
    ).rejects.toThrow("Unauthorized");

    const log = await t.run(async (ctx) => {
      return await ctx.db.query("auditLogs").order("desc").first();
    });

    expect(log).toBeNull();
  });
});

import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "../../convex/_generated/api";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.*s");

const baseArgs = {
  title: "Refund policy",
  content: "Refunds are issued within 30 days.",
  category: "Company Policy",
  status: "verified" as const,
  canUseToAnswer: true,
  canUseToAct: false,
  requiresApproval: false,
  organizationId: "org_test",
};

describe("knowledge mutation authorization", () => {
  test("authorizes using ctx.auth's verified identity over the caller-supplied workosUserId", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();

    await t.run(async (ctx) => {
      // Caller-supplied workosUserId has no membership at all.
      const verifiedUserId = await ctx.db.insert("users", {
        workosUserId: "workos_verified_admin",
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

    const asVerifiedAdmin = t.withIdentity({ subject: "workos_verified_admin" });

    const knowledgeId = await asVerifiedAdmin.mutation(api.knowledge.createKnowledge, {
      ...baseArgs,
      workosUserId: "workos_no_membership",
    });

    expect(knowledgeId).toBeTruthy();
  });

  test("rejects when ctx.auth's verified identity lacks admin membership, even if the caller-supplied workosUserId would qualify", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();

    await t.run(async (ctx) => {
      // The caller-supplied workosUserId IS an admin, but authorization must
      // now run off the verified identity, not this argument.
      const adminUserId = await ctx.db.insert("users", {
        workosUserId: "workos_admin",
        email: "admin@example.com",
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("memberships", {
        userId: adminUserId,
        organizationId: "org_test",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUnprivilegedUser = t.withIdentity({ subject: "workos_no_membership" });

    await expect(
      asUnprivilegedUser.mutation(api.knowledge.createKnowledge, {
        ...baseArgs,
        workosUserId: "workos_admin",
      })
    ).rejects.toThrow("Unauthorized");
  });

  test("falls back to the caller-supplied workosUserId when ctx.auth has no identity", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();

    await t.run(async (ctx) => {
      const adminUserId = await ctx.db.insert("users", {
        workosUserId: "workos_admin",
        email: "admin@example.com",
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("memberships", {
        userId: adminUserId,
        organizationId: "org_test",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    });

    const knowledgeId = await t.mutation(api.knowledge.createKnowledge, {
      ...baseArgs,
      workosUserId: "workos_admin",
    });

    expect(knowledgeId).toBeTruthy();
  });
});

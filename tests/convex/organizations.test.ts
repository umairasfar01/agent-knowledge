import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "../../convex/_generated/api";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.*s");

const baseArgs = {
  organizationId: "org_test",
  displayName: "Updated Workspace",
  defaultKnowledgeStatus: "draft" as const,
  defaultCanUseToAnswer: true,
  defaultCanUseToAct: false,
};

describe("updateOrganizationSettings authorization", () => {
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

    await expect(
      asVerifiedAdmin.mutation(api.organizations.updateOrganizationSettings, {
        ...baseArgs,
        workosUserId: "workos_no_membership",
      })
    ).resolves.not.toThrow();
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
      asUnprivilegedUser.mutation(api.organizations.updateOrganizationSettings, {
        ...baseArgs,
        workosUserId: "workos_admin",
      })
    ).rejects.toThrow("Unauthorized");
  });

  test("rejects the caller when ctx.auth has no identity, even if workosUserId would qualify as admin", async () => {
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

    await expect(
      t.mutation(api.organizations.updateOrganizationSettings, {
        ...baseArgs,
        workosUserId: "workos_admin",
      })
    ).rejects.toThrow("Unauthorized");
  });
});

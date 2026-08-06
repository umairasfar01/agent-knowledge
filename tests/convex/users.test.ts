import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "../../convex/_generated/api";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.*s");

async function seedAdmin(
  t: ReturnType<typeof convexTest>,
  workosUserId: string,
  organizationId: string
) {
  const now = Date.now();

  await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      workosUserId,
      email: `${workosUserId}@example.com`,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("memberships", {
      userId,
      organizationId,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    });
  });
}

async function seedTargetMember(
  t: ReturnType<typeof convexTest>,
  organizationId: string
) {
  const now = Date.now();

  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      workosUserId: "workos_target_member",
      email: "target@example.com",
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.insert("memberships", {
      userId,
      organizationId,
      role: "member",
      createdAt: now,
      updatedAt: now,
    });
  });
}

describe("users.ts mutation authorization", () => {
  describe("updateMemberRole", () => {
    test("authorizes using ctx.auth's verified identity, ignoring an unprivileged caller-supplied workosUserId", async () => {
      const t = convexTest(schema, modules);
      await seedAdmin(t, "workos_verified_admin", "org_test");
      const membershipId = await seedTargetMember(t, "org_test");

      const asVerifiedAdmin = t.withIdentity({ subject: "workos_verified_admin" });

      await expect(
        asVerifiedAdmin.mutation(api.users.updateMemberRole, {
          membershipId,
          role: "admin",
          organizationId: "org_test",
          workosUserId: "workos_no_membership",
        })
      ).resolves.not.toThrow();
    });

    test("rejects when ctx.auth's verified identity lacks admin membership, even if the caller-supplied workosUserId would qualify", async () => {
      const t = convexTest(schema, modules);
      await seedAdmin(t, "workos_admin", "org_test");
      const membershipId = await seedTargetMember(t, "org_test");

      const asUnprivilegedUser = t.withIdentity({ subject: "workos_no_membership" });

      await expect(
        asUnprivilegedUser.mutation(api.users.updateMemberRole, {
          membershipId,
          role: "admin",
          organizationId: "org_test",
          workosUserId: "workos_admin",
        })
      ).rejects.toThrow("Unauthorized");
    });

    test("rejects the caller when ctx.auth has no identity, even if workosUserId would qualify as admin", async () => {
      const t = convexTest(schema, modules);
      await seedAdmin(t, "workos_admin", "org_test");
      const membershipId = await seedTargetMember(t, "org_test");

      await expect(
        t.mutation(api.users.updateMemberRole, {
          membershipId,
          role: "admin",
          organizationId: "org_test",
          workosUserId: "workos_admin",
        })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("removeMember", () => {
    test("rejects when ctx.auth's verified identity lacks admin membership, even if the caller-supplied workosUserId would qualify", async () => {
      const t = convexTest(schema, modules);
      await seedAdmin(t, "workos_admin", "org_test");
      const membershipId = await seedTargetMember(t, "org_test");

      const asUnprivilegedUser = t.withIdentity({ subject: "workos_no_membership" });

      await expect(
        asUnprivilegedUser.mutation(api.users.removeMember, {
          membershipId,
          organizationId: "org_test",
          workosUserId: "workos_admin",
        })
      ).rejects.toThrow("Unauthorized");
    });

    test("rejects the caller when ctx.auth has no identity, even if workosUserId would qualify as admin", async () => {
      const t = convexTest(schema, modules);
      await seedAdmin(t, "workos_admin", "org_test");
      const membershipId = await seedTargetMember(t, "org_test");

      await expect(
        t.mutation(api.users.removeMember, {
          membershipId,
          organizationId: "org_test",
          workosUserId: "workos_admin",
        })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("inviteMember", () => {
    test("rejects when ctx.auth's verified identity lacks admin membership, even if the caller-supplied workosUserId would qualify", async () => {
      const t = convexTest(schema, modules);
      await seedAdmin(t, "workos_admin", "org_test");

      const asUnprivilegedUser = t.withIdentity({ subject: "workos_no_membership" });

      await expect(
        asUnprivilegedUser.mutation(api.users.inviteMember, {
          email: "new-member@example.com",
          role: "member",
          organizationId: "org_test",
          workosUserId: "workos_admin",
        })
      ).rejects.toThrow("Unauthorized");
    });

    test("rejects the caller when ctx.auth has no identity, even if workosUserId would qualify as admin", async () => {
      const t = convexTest(schema, modules);
      await seedAdmin(t, "workos_admin", "org_test");

      await expect(
        t.mutation(api.users.inviteMember, {
          email: "new-member@example.com",
          role: "member",
          organizationId: "org_test",
          workosUserId: "workos_admin",
        })
      ).rejects.toThrow("Unauthorized");
    });
  });
});

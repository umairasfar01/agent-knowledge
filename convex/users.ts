import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminForWorkosUser } from "./permissions";

export const upsertCurrentUser = mutation({
    args: {
        workosUserId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        organizationId: v.string(),
        actorEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("workosUserId"), args.workosUserId))
            .first();

        let userId;

        if (existingUser) {
            userId = existingUser._id;

            await ctx.db.patch(existingUser._id, {
                email: args.email,
                name: args.name,
                updatedAt: now,
            });
        } else {
            userId = await ctx.db.insert("users", {
                workosUserId: args.workosUserId,
                email: args.email,
                name: args.name,
                createdAt: now,
                updatedAt: now,
            });
        }
        const existingMembership = await ctx.db
            .query("memberships")
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), userId),
                    q.eq(q.field("organizationId"), args.organizationId)
                )
            )
            .first();

        if (existingMembership) {
            await ctx.db.patch(existingMembership._id, {
                updatedAt: now,
            });
        } else {
            await ctx.db.insert("memberships", {
                userId,
                organizationId: args.organizationId,
                role: "admin",
                createdAt: now,
                updatedAt: now,
            });
        }

        return userId;
    },
});

export const getMembershipByWorkosUser = query({
    args: {
        workosUserId: v.string(),
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("workosUserId"), args.workosUserId))
            .first();

        if (!user) return null;

        const membership = await ctx.db
            .query("memberships")
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), user._id),
                    q.eq(q.field("organizationId"), args.organizationId)
                )
            )
            .first();

        if (!membership) return null;

        return {
            user,
            membership,
        };
    },
});

export const listMembers = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const memberships = await ctx.db
            .query("memberships")
            .order("desc")
            .collect();

        const orgMemberships = memberships.filter(
            (membership) => membership.organizationId === args.organizationId
        );

        const members = await Promise.all(
            orgMemberships.map(async (membership) => {
                const user = await ctx.db.get(membership.userId);

                return {
                    _id: membership._id,
                    role: membership.role,
                    organizationId: membership.organizationId,
                    createdAt: membership.createdAt,
                    updatedAt: membership.updatedAt,
                    userEmail: user?.email ?? "Unknown user",
                    userName: user?.name ?? "",
                    workosUserId: user?.workosUserId ?? "",
                };
            })
        );

        return members;
    },
});

export const updateMemberRole = mutation({
    args: {
        membershipId: v.id("memberships"),
        role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
        organizationId: v.string(),
        workosUserId: v.string(),
        actorEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdminForWorkosUser(ctx, args.workosUserId, args.organizationId);

        const membership = await ctx.db.get(args.membershipId);

        if (!membership) {
            throw new Error("Membership not found");
        }

        if (membership.organizationId !== args.organizationId) {
            throw new Error("Membership does not belong to this organization");
        }

        const isCurrentRolePrivileged =
            membership.role === "owner" || membership.role === "admin";

        const isNewRoleNonPrivileged = args.role === "member";

        if (isCurrentRolePrivileged && isNewRoleNonPrivileged) {
            const allMemberships = await ctx.db.query("memberships").collect();

            const privilegedMemberships = allMemberships.filter(
                (item) =>
                    item.organizationId === args.organizationId &&
                    (item.role === "owner" || item.role === "admin")
            );

            if (privilegedMemberships.length <= 1) {
                throw new Error(
                    "Cannot remove the last owner/admin from this organization"
                );
            }
        }

        await ctx.db.patch(args.membershipId, {
            role: args.role,
            updatedAt: Date.now(),
        });

        const user = await ctx.db.get(membership.userId);

        await ctx.db.insert("auditLogs", {
            action: "member_role_updated",
            knowledgeId: undefined,
            knowledgeTitle: user?.email
                ? `Changed member role for ${user.email} to ${args.role}`
                : `Changed member role to ${args.role}`,
            actorId: "demo-user",
            actorEmail: args.actorEmail,
            organizationId: args.organizationId,
            createdAt: Date.now(),
        });
    },
});

export const removeMember = mutation({
    args: {
        membershipId: v.id("memberships"),
        organizationId: v.string(),
        workosUserId: v.string(),
        actorEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdminForWorkosUser(ctx, args.workosUserId, args.organizationId);

        const membership = await ctx.db.get(args.membershipId);

        if (!membership) {
            throw new Error("Membership not found");
        }

        if (membership.organizationId !== args.organizationId) {
            throw new Error("Membership does not belong to this organization");
        }

        const isPrivileged =
            membership.role === "owner" || membership.role === "admin";

        if (isPrivileged) {
            const allMemberships = await ctx.db.query("memberships").collect();

            const privilegedMemberships = allMemberships.filter(
                (item) =>
                    item.organizationId === args.organizationId &&
                    (item.role === "owner" || item.role === "admin")
            );

            if (privilegedMemberships.length <= 1) {
                throw new Error(
                    "Cannot remove the last owner/admin from this organization"
                );
            }
        }

        const user = await ctx.db.get(membership.userId);

        await ctx.db.insert("auditLogs", {
            action: "member_removed",
            knowledgeId: undefined,
            knowledgeTitle: user?.email
                ? `Removed member ${user.email}`
                : "Removed member",
            actorId: "demo-user",
            actorEmail: args.actorEmail,
            organizationId: args.organizationId,
            createdAt: Date.now(),
        });

        await ctx.db.delete(args.membershipId);
    },
});
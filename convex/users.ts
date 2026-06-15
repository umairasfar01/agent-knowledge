import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertCurrentUser = mutation({
    args: {
        workosUserId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        organizationId: v.string(),
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
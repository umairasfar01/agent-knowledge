import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const checkRateLimit = mutation({
  args: {
    key: v.string(),
    route: v.string(),
    limit: v.number(),
    windowMs: v.number(),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key_route", (q) =>
        q.eq("key", args.key).eq("route", args.route)
      )
      .first();

    if (!existing || existing.resetAt <= now) {
      await ctx.db.insert("rateLimits", {
        key: args.key,
        route: args.route,
        organizationId: args.organizationId,
        count: 1,
        resetAt: now + args.windowMs,
        updatedAt: now,
      });

      return {
        allowed: true,
        remaining: args.limit - 1,
        resetAt: now + args.windowMs,
      };
    }

    if (existing.count >= args.limit) {
      throw new Error(
        `Rate limit exceeded. Try again after ${new Date(
          existing.resetAt
        ).toLocaleTimeString()}.`
      );
    }

    await ctx.db.patch(existing._id, {
      count: existing.count + 1,
      updatedAt: now,
    });

    return {
      allowed: true,
      remaining: Math.max(0, args.limit - existing.count - 1),
      resetAt: existing.resetAt,
    };
  },
});
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminForWorkosUser } from "./permissions";

export const getOrganizationSettings = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .first();

    return (
      settings ?? {
        organizationId: args.organizationId,
        displayName: "Agent Knowledge Workspace",
        defaultKnowledgeCategory: "Company Policy",
        defaultKnowledgeStatus: "draft" as const,
        defaultCanUseToAnswer: true,
        defaultCanUseToAct: false,
        updatedByEmail: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    );
  },
});

export const updateOrganizationSettings = mutation({
  args: {
    organizationId: v.string(),
    workosUserId: v.string(),
    actorEmail: v.optional(v.string()),
    displayName: v.string(),
    defaultKnowledgeCategory: v.optional(v.string()),
    defaultKnowledgeStatus: v.union(v.literal("draft"), v.literal("verified")),
    defaultCanUseToAnswer: v.boolean(),
    defaultCanUseToAct: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdminForWorkosUser(
      ctx,
      args.workosUserId,
      args.organizationId
    );

    const now = Date.now();

    const existing = await ctx.db
      .query("organizationSettings")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .first();

    const payload = {
      organizationId: args.organizationId,
      displayName: args.displayName.trim() || "Agent Knowledge Workspace",
      defaultKnowledgeCategory:
        args.defaultKnowledgeCategory?.trim() || "Company Policy",
      defaultKnowledgeStatus: args.defaultKnowledgeStatus,
      defaultCanUseToAnswer: args.defaultCanUseToAnswer,
      defaultCanUseToAct: args.defaultCanUseToAct,
      updatedByEmail: args.actorEmail,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("organizationSettings", {
        ...payload,
        createdAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      action: "organization_settings_updated",
      knowledgeId: undefined,
      knowledgeTitle: "Organization settings updated",
      actorId: "demo-user",
      actorEmail: args.actorEmail,
      organizationId: args.organizationId,
      createdAt: now,
    });
  },
});
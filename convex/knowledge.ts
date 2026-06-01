import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createKnowledge = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    status: v.union(v.literal("draft"), v.literal("verified")),
    canUseToAnswer: v.boolean(),
    canUseToAct: v.boolean(),
    requiresApproval: v.boolean(),
    sourceUrl: v.optional(v.string()),
    lastReviewedAt: v.optional(v.number()),
    allowedAgentIds: v.optional(v.array(v.id("agents"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const knowledgeId = await ctx.db.insert("knowledge", {
      title: args.title,
      content: args.content,
      category: args.category,
      status: args.status,
      ownerId: "demo-user",
      canUseToAnswer: args.canUseToAnswer,
      canUseToAct: args.canUseToAct,
      requiresApproval: args.requiresApproval,
      sourceUrl: args.sourceUrl,
      lastReviewedAt: args.lastReviewedAt,
      createdAt: now,
      updatedAt: now,
      allowedAgentIds: args.allowedAgentIds,
    });

    await ctx.db.insert("auditLogs", {
      action: "created",
      knowledgeId,
      knowledgeTitle: args.title,
      actorId: "demo-user",
      createdAt: now,
    });

    return knowledgeId;
  },
});

export const listKnowledge = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("knowledge").order("desc").collect();
  },
});

export const deleteKnowledge = mutation({
  args: {
    id: v.id("knowledge"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);

    await ctx.db.delete(args.id);

    await ctx.db.insert("auditLogs", {
      action: "deleted",
      knowledgeId: undefined,
      knowledgeTitle: item?.title ?? "Unknown knowledge item",
      actorId: "demo-user",
      createdAt: Date.now(),
    });
  },
});

export const updateKnowledge = mutation({
  args: {
    id: v.id("knowledge"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    status: v.union(v.literal("draft"), v.literal("verified")),
    canUseToAnswer: v.boolean(),
    canUseToAct: v.boolean(),
    requiresApproval: v.boolean(),
    sourceUrl: v.optional(v.string()),
    lastReviewedAt: v.optional(v.number()),
    allowedAgentIds: v.optional(v.array(v.id("agents"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      content: args.content,
      category: args.category,
      status: args.status,
      canUseToAnswer: args.canUseToAnswer,
      canUseToAct: args.canUseToAct,
      requiresApproval: args.requiresApproval,
      sourceUrl: args.sourceUrl,
      lastReviewedAt: args.lastReviewedAt,
      updatedAt: Date.now(),
      allowedAgentIds: args.allowedAgentIds,
    });
    await ctx.db.insert("auditLogs", {
      action: "updated",
      knowledgeId: args.id,
      knowledgeTitle: args.title,
      actorId: "demo-user",
      createdAt: Date.now(),
    });
  },
});

export const listAuditLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("auditLogs").order("desc").take(20);
  },
});

export const getKnowledge = query({
  args: {
    id: v.id("knowledge"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listAuditLogsForKnowledge = query({
  args: {
    knowledgeId: v.id("knowledge"),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("auditLogs").order("desc").collect();

    return logs
      .filter((log) => log.knowledgeId === args.knowledgeId)
      .slice(0, 10);
  },
});

export const listKnowledgeForAgent = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("knowledge").order("desc").collect();

    return items.filter((item) =>
      item.allowedAgentIds?.includes(args.agentId)
    );
  },
});

export const listApprovalQueue = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("knowledge").order("desc").collect();

    return items.filter((item) => item.requiresApproval === true);
  },
});

export const approveKnowledge = mutation({
  args: {
    id: v.id("knowledge"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);

    await ctx.db.patch(args.id, {
      requiresApproval: false,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      action: "updated",
      knowledgeId: args.id,
      knowledgeTitle: item?.title ?? "Unknown knowledge item",
      actorId: "demo-user",
      createdAt: Date.now(),
    });
  },
});

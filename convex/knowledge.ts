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
    actorEmail: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    actorRole: v.string()
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    if (args.actorRole !== "admin") {
      throw new Error("Unauthorized");
    }

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
      ownerEmail: args.ownerEmail,
      organizationId: args.organizationId,
    });

    await ctx.db.insert("auditLogs", {
      action: "created",
      knowledgeId,
      knowledgeTitle: args.title,
      actorId: "demo-user",
      actorEmail: args.actorEmail,
      createdAt: now,
      organizationId: args.organizationId,
    });

    return knowledgeId;
  },
});

export const listKnowledge = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("knowledge").order("desc").collect();

    return items.filter(
      (item) =>
        item.organizationId === args.organizationId ||
        item.organizationId === undefined
    );
  },
});

export const deleteKnowledge = mutation({
  args: {
    id: v.id("knowledge"),
    actorEmail: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    actorRole: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.actorRole !== "admin") {
      throw new Error("Unauthorized");
    }
    const item = await ctx.db.get(args.id);

    await ctx.db.delete(args.id);

    await ctx.db.insert("auditLogs", {
      action: "deleted",
      knowledgeId: undefined,
      knowledgeTitle: item?.title ?? "Unknown knowledge item",
      actorId: "demo-user",
      createdAt: Date.now(),
      actorEmail: args.actorEmail,
      organizationId: args.organizationId,
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
    actorEmail: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    actorRole: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.actorRole !== "admin") {
      throw new Error("Unauthorized");
    }
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
      actorEmail: args.actorEmail,
      createdAt: Date.now(),
    });
  },
});

export const listAuditLogs = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("auditLogs").order("desc").collect();

    return logs
      .filter(
        (log) =>
          log.organizationId === args.organizationId ||
          log.organizationId === undefined
      )
      .slice(0, 20);
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
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("auditLogs").order("desc").collect();

    return logs
      .filter(
        (log) =>
          log.knowledgeId === args.knowledgeId &&
          (log.organizationId === args.organizationId ||
            log.organizationId === undefined)
      )
      .slice(0, 10);
  },
});

export const listKnowledgeForAgent = query({
  args: {
    agentId: v.id("agents"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("knowledge").order("desc").collect();

    return items.filter(
      (item) =>
        item.allowedAgentIds?.includes(args.agentId) &&
        (item.organizationId === args.organizationId ||
          item.organizationId === undefined)
    );
  },
});

export const listApprovalQueue = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("knowledge").order("desc").collect();

    return items.filter(
      (item) =>
        item.requiresApproval === true &&
        (item.organizationId === args.organizationId ||
          item.organizationId === undefined)
    );
  },
});

export const approveKnowledge = mutation({
  args: {
    id: v.id("knowledge"),
    actorEmail: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    actorRole: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.actorRole !== "admin") {
      throw new Error("Unauthorized");
    }
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
      actorEmail: args.actorEmail,
      createdAt: Date.now(),
    });
  },
});

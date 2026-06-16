import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminForWorkosUser } from "./permissions";

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
    organizationId: v.string(),
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await requireAdminForWorkosUser(ctx, args.workosUserId, args.organizationId);

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

    await ctx.db.insert("knowledgeVersions", {
      knowledgeId,
      title: args.title,
      content: args.content,
      category: args.category,
      status: args.status,
      changedByEmail: args.actorEmail,
      organizationId: args.organizationId,
      createdAt: now,
    });

    return knowledgeId;
  },
});

export const listKnowledge = query({
  args: {
    organizationId: v.string(),
    search: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("all"), v.literal("draft"), v.literal("verified"))
    ),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("knowledge").order("desc").collect();

    const search = args.search?.toLowerCase().trim() ?? "";
    const status = args.status ?? "all";
    const category = args.category ?? "all";

    return items.filter((item) => {
      const matchesOrganization =
        item.organizationId === args.organizationId ||
        item.organizationId === undefined;

      const matchesSearch =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.content.toLowerCase().includes(search);

      const matchesStatus = status === "all" || item.status === status;

      const matchesCategory =
        category === "all" || item.category === category;

      return (
        matchesOrganization &&
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  },
});

export const deleteKnowledge = mutation({
  args: {
    id: v.id("knowledge"),
    actorEmail: v.optional(v.string()),
    workosUserId: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);

    if (!item) {
      throw new Error("Knowledge item not found");
    }

    const organizationId = item.organizationId ?? args.organizationId;

    await requireAdminForWorkosUser(ctx, args.workosUserId, organizationId);

    await ctx.db.delete(args.id);

    await ctx.db.insert("auditLogs", {
      action: "deleted",
      knowledgeId: undefined,
      knowledgeTitle: item.title ?? "Unknown knowledge item",
      actorId: "demo-user",
      actorEmail: args.actorEmail,
      organizationId,
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
    actorEmail: v.optional(v.string()),
    workosUserId: v.string(),
    organizationId: v.string(),
    ownerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminForWorkosUser(ctx, args.workosUserId, args.organizationId);

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
      ownerEmail: args.ownerEmail,
    });
    await ctx.db.insert("auditLogs", {
      action: "updated",
      knowledgeId: args.id,
      knowledgeTitle: args.title,
      actorId: "demo-user",
      actorEmail: args.actorEmail,
      createdAt: Date.now(),
    });

    await ctx.db.insert("knowledgeVersions", {
      knowledgeId: args.id,
      title: args.title,
      content: args.content,
      category: args.category,
      status: args.status,
      changedByEmail: args.actorEmail,
      organizationId: args.organizationId,
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
    workosUserId: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminForWorkosUser(ctx, args.workosUserId, args.organizationId);
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

export const searchKnowledgeForAgent = query({
  args: {
    agentId: v.id("agents"),
    organizationId: v.string(),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    const question = args.question.trim().toLowerCase();

    if (!question) {
      return [];
    }

    const terms = Array.from(
      new Set(
        question
          .split(/[^a-z0-9]+/i)
          .map((term) => term.trim().toLowerCase())
          .filter((term) => term.length >= 2)
      )
    );

    const knowledgeItems = await ctx.db.query("knowledge").collect();

    const allowedItems = knowledgeItems.filter((item) => {
      const allowedAgentIds = item.allowedAgentIds ?? [];

      return (
        (item.organizationId === args.organizationId || item.organizationId === undefined) &&
        item.status === "verified" &&
        item.canUseToAnswer === true &&
        allowedAgentIds.some((agentId) => agentId.toString() === args.agentId.toString())
      );
    });

    const scoredItems = allowedItems
      .map((item) => {
        const title = item.title.toLowerCase();
        const category = item.category.toLowerCase();
        const content = item.content.toLowerCase();

        let score = 0;
        const matchedFields = new Set<string>();

        if (title.includes(question)) {
          score += 12;
          matchedFields.add("title");
        }

        if (category.includes(question)) {
          score += 8;
          matchedFields.add("category");
        }

        if (content.includes(question)) {
          score += 5;
          matchedFields.add("content");
        }

        for (const term of terms) {
          if (title.includes(term)) {
            score += 5;
            matchedFields.add("title");
          }

          if (category.includes(term)) {
            score += 3;
            matchedFields.add("category");
          }

          if (content.includes(term)) {
            score += 1;
            matchedFields.add("content");
          }
        }

        const matchedFieldList = Array.from(matchedFields);

        return {
          ...item,
          score,
          matchedFields: matchedFieldList,
          matchSummary:
            matchedFieldList.length > 0
              ? `Matched in ${matchedFieldList.join(", ")}`
              : "No match",
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
      
return scoredItems;
  },
});

export const listVersionsForKnowledge = query({
  args: {
    knowledgeId: v.id("knowledge"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query("knowledgeVersions")
      .order("desc")
      .collect();

    return versions
      .filter(
        (version) =>
          version.knowledgeId === args.knowledgeId &&
          (version.organizationId === args.organizationId ||
            version.organizationId === undefined)
      )
      .slice(0, 20);
  },
});

export const restoreKnowledgeVersion = mutation({
  args: {
    versionId: v.id("knowledgeVersions"),
    actorEmail: v.optional(v.string()),
    organizationId: v.string(),
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const version = await ctx.db.get(args.versionId);

    if (!version) {
      throw new Error("Version not found");
    }

    const organizationId = version.organizationId ?? args.organizationId;

    await requireAdminForWorkosUser(ctx, args.workosUserId, organizationId);

    const knowledge = await ctx.db.get(version.knowledgeId);

    if (!knowledge) {
      throw new Error("Knowledge item not found");
    }

    const now = Date.now();

    await ctx.db.patch(version.knowledgeId, {
      title: version.title,
      content: version.content,
      category: version.category,
      status: version.status,
      updatedAt: now,
    });

    await ctx.db.insert("knowledgeVersions", {
      knowledgeId: version.knowledgeId,
      title: version.title,
      content: version.content,
      category: version.category,
      status: version.status,
      changedByEmail: args.actorEmail,
      organizationId,
      createdAt: now,
    });

    await ctx.db.insert("auditLogs", {
      action: "updated",
      knowledgeId: version.knowledgeId,
      knowledgeTitle: version.title,
      actorId: "demo-user",
      actorEmail: args.actorEmail,
      organizationId,
      createdAt: now,
    });
  },
});

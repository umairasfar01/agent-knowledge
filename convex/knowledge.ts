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
    const rawQuestion = args.question.trim();
    const question = rawQuestion.toLowerCase();

    if (!question) {
      return [];
    }

    const stopWords = new Set([
      "a",
      "an",
      "and",
      "are",
      "as",
      "at",
      "be",
      "by",
      "can",
      "do",
      "does",
      "for",
      "from",
      "get",
      "how",
      "i",
      "in",
      "is",
      "it",
      "of",
      "on",
      "or",
      "our",
      "the",
      "to",
      "we",
      "what",
      "when",
      "where",
      "who",
      "why",
      "with",
    ]);

    const synonymMap: Record<string, string[]> = {
      refund: ["refund", "return", "reimburse", "reimbursement", "money", "back"],
      return: ["return", "refund", "money", "back"],
      money: ["money", "refund", "reimburse", "back"],
      cancel: ["cancel", "cancellation", "stop"],
      order: ["order", "purchase", "transaction"],
      customer: ["customer", "client", "user"],
      email: ["email", "message", "mail"],
      support: ["support", "help", "service"],
      policy: ["policy", "rule", "rules", "guideline"],
    };

    function tokenize(value: string) {
      return value
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .map((term) => term.trim())
        .filter((term) => term.length >= 2 && !stopWords.has(term));
    }

    function getPhrases(tokens: string[]) {
      const phrases: string[] = [];

      for (let index = 0; index < tokens.length - 1; index += 1) {
        phrases.push(`${tokens[index]} ${tokens[index + 1]}`);
      }

      for (let index = 0; index < tokens.length - 2; index += 1) {
        phrases.push(`${tokens[index]} ${tokens[index + 1]} ${tokens[index + 2]}`);
      }

      return phrases;
    }

    const baseTerms = Array.from(new Set(tokenize(question)));

    const expandedTerms = Array.from(
      new Set(
        baseTerms.flatMap((term) => {
          return synonymMap[term] ?? [term];
        })
      )
    );

    const phrases = getPhrases(baseTerms);

    const knowledgeItems = await ctx.db.query("knowledge").collect();

    const allowedItems = knowledgeItems.filter((item) => {
      const allowedAgentIds = item.allowedAgentIds ?? [];

      return (
        (item.organizationId === args.organizationId ||
          item.organizationId === undefined) &&
        item.status === "verified" &&
        item.canUseToAnswer === true &&
        allowedAgentIds.some(
          (agentId) => agentId.toString() === args.agentId.toString()
        )
      );
    });

    const scoredItems = allowedItems
      .map((item) => {
        const title = item.title.toLowerCase();
        const category = item.category.toLowerCase();
        const content = item.content.toLowerCase();

        let score = 0;

        const matchedFields = new Set<string>();
        const matchedTerms = new Set<string>();

        if (title.includes(question)) {
          score += 18;
          matchedFields.add("title");
        }

        if (category.includes(question)) {
          score += 10;
          matchedFields.add("category");
        }

        if (content.includes(question)) {
          score += 7;
          matchedFields.add("content");
        }

        for (const phrase of phrases) {
          if (title.includes(phrase)) {
            score += 9;
            matchedFields.add("title");
          }

          if (category.includes(phrase)) {
            score += 5;
            matchedFields.add("category");
          }

          if (content.includes(phrase)) {
            score += 3;
            matchedFields.add("content");
          }
        }

        for (const term of expandedTerms) {
          if (title.includes(term)) {
            score += 5;
            matchedFields.add("title");
            matchedTerms.add(term);
          }

          if (category.includes(term)) {
            score += 3;
            matchedFields.add("category");
            matchedTerms.add(term);
          }

          if (content.includes(term)) {
            score += 1;
            matchedFields.add("content");
            matchedTerms.add(term);
          }
        }

        const matchedBaseTerms = baseTerms.filter((term) => {
          const relatedTerms = synonymMap[term] ?? [term];

          return relatedTerms.some(
            (relatedTerm) =>
              title.includes(relatedTerm) ||
              category.includes(relatedTerm) ||
              content.includes(relatedTerm)
          );
        });

        const coverage =
          baseTerms.length > 0 ? matchedBaseTerms.length / baseTerms.length : 0;

        score += Math.round(coverage * 6);

        if (coverage === 1 && baseTerms.length >= 2) {
          score += 6;
        }

        const matchedFieldList = Array.from(matchedFields);
        const matchedTermList = Array.from(matchedTerms).slice(0, 5);

        return {
          ...item,
          score,
          confidence:
            score >= 16 ? "High" : score >= 8 ? "Medium" : "Low",
          matchedFields: matchedFieldList,
          matchedTerms: matchedTermList,
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

export const listRetrievalLogs = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("retrievalLogs")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(50);
  },
});

export const logRetrievalSearch = mutation({
  args: {
    organizationId: v.string(),
    agentId: v.id("agents"),
    agentName: v.optional(v.string()),
    question: v.string(),
    resultCount: v.number(),
    sourceTitles: v.array(v.string()),
    actorEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const question = args.question.trim();

    if (!question) {
      return null;
    }

    return await ctx.db.insert("retrievalLogs", {
      organizationId: args.organizationId,
      agentId: args.agentId,
      agentName: args.agentName,
      question,
      resultCount: args.resultCount,
      sourceTitles: args.sourceTitles,
      actorEmail: args.actorEmail,
      createdAt: Date.now(),
    });
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

export const listKnowledgeDueForReview = query({
  args: {
    organizationId: v.string(),
    reviewAfterDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const reviewAfterDays = args.reviewAfterDays ?? 90;
    const threshold = Date.now() - reviewAfterDays * 24 * 60 * 60 * 1000;

    const items = await ctx.db.query("knowledge").collect();

    return items
      .filter((item) => {
        const orgMatches =
          item.organizationId === args.organizationId ||
          item.organizationId === undefined;

        const lastReviewed = item.lastReviewedAt ?? item.createdAt ?? item._creationTime;

        return orgMatches && lastReviewed <= threshold;
      })
      .sort((a, b) => {
        const aReviewed = a.lastReviewedAt ?? a.createdAt ?? a._creationTime;
        const bReviewed = b.lastReviewedAt ?? b.createdAt ?? b._creationTime;

        return aReviewed - bReviewed;
      });
  },
});

export const markKnowledgeReviewed = mutation({
  args: {
    id: v.id("knowledge"),
    organizationId: v.string(),
    workosUserId: v.string(),
    actorEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminForWorkosUser(
      ctx,
      args.workosUserId,
      args.organizationId
    );

    const item = await ctx.db.get(args.id);

    if (!item) {
      throw new Error("Knowledge item not found");
    }

    if (
      item.organizationId !== args.organizationId &&
      item.organizationId !== undefined
    ) {
      throw new Error("Knowledge item does not belong to this organization");
    }

    const now = Date.now();

    await ctx.db.patch(args.id, {
      lastReviewedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      action: "knowledge.reviewed",
      knowledgeId: args.id,
      knowledgeTitle: item.title,
      actorId: "demo-user",
      actorEmail: args.actorEmail,
      organizationId: args.organizationId,
      createdAt: now,
    });
  },
});


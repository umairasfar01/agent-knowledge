import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardMetrics = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const knowledgeItems = await ctx.db.query("knowledge").collect();
    const agents = await ctx.db.query("agents").collect();
    const memberships = await ctx.db.query("memberships").collect();
    const auditLogs = await ctx.db.query("auditLogs").collect();
    const retrievalLogs = await ctx.db.query("retrievalLogs").collect();

    const orgKnowledge = knowledgeItems.filter(
      (item) =>
        item.organizationId === args.organizationId ||
        item.organizationId === undefined
    );

    const orgAgents = agents.filter(
      (agent) => agent.organizationId === args.organizationId
    );

    const orgMemberships = memberships.filter(
      (membership) => membership.organizationId === args.organizationId
    );

    const orgAuditLogs = auditLogs.filter(
      (log) => log.organizationId === args.organizationId
    );

    const orgRetrievalLogs = retrievalLogs.filter(
      (log) => log.organizationId === args.organizationId
    );

    const recentRetrievalLogs = orgRetrievalLogs
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    const recentAuditLogs = orgAuditLogs
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    return {
      totalKnowledge: orgKnowledge.length,
      verifiedKnowledge: orgKnowledge.filter(
        (item) => item.status === "verified"
      ).length,
      draftKnowledge: orgKnowledge.filter((item) => item.status === "draft")
        .length,
      answerableKnowledge: orgKnowledge.filter(
        (item) => item.canUseToAnswer === true
      ).length,

      totalAgents: orgAgents.length,
      activeAgents: orgAgents.filter((agent) => agent.status === "active")
        .length,

      totalMembers: orgMemberships.length,

      totalRetrievals: orgRetrievalLogs.length,
      retrievalsLast7Days: orgRetrievalLogs.filter(
        (log) => log.createdAt >= sevenDaysAgo
      ).length,

      totalAuditEvents: orgAuditLogs.length,

      recentRetrievalLogs,
      recentAuditLogs,
    };
  },
});